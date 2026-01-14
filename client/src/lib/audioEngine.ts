import type { AmpSettings } from '@shared/schema';

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

export type AudioMode = 'webaudio' | 'worklet' | 'native';

interface NativeBridgeMessage {
  type: 'settings' | 'audio' | 'status';
  data: unknown;
}

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private inputNode: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private inputGainNode: GainNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private presenceFilter: BiquadFilterNode | null = null;
  private distortionNode: WaveShaperNode | null = null;
  private lowBoostFilter: BiquadFilterNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private isConnected = false;
  private isMuted = false;
  private currentMasterVolume = 5;
  private currentSettings: AmpSettings | null = null;
  private audioMode: AudioMode = 'worklet';
  
  private websocket: WebSocket | null = null;
  private nativeBridgeUrl: string = 'ws://localhost:9876';
  private isNativeConnected = false;
  private onNativeStatusChange?: (connected: boolean) => void;

  async getAudioDevices(): Promise<AudioDevice[]> {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter(d => d.kind === 'audioinput' || d.kind === 'audiooutput')
        .map(d => ({
          deviceId: d.deviceId,
          label: d.label || `${d.kind === 'audioinput' ? 'Input' : 'Output'} ${d.deviceId.slice(0, 8)}`,
          kind: d.kind as 'audioinput' | 'audiooutput',
        }));
    } catch (error) {
      console.error('Failed to get audio devices:', error);
      return [];
    }
  }

  setAudioMode(mode: AudioMode): void {
    this.audioMode = mode;
  }

  getAudioMode(): AudioMode {
    return this.audioMode;
  }

  async connect(inputDeviceId?: string): Promise<boolean> {
    try {
      if (this.isConnected) {
        await this.disconnect();
      }

      this.audioContext = new AudioContext({ sampleRate: 48000 });

      const constraints: MediaStreamConstraints = {
        audio: inputDeviceId 
          ? { deviceId: { exact: inputDeviceId }, echoCancellation: false, noiseSuppression: false, autoGainControl: false }
          : { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.inputNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;

      if (this.audioMode === 'worklet') {
        await this.setupWorkletProcessing();
      } else {
        await this.setupStandardProcessing();
      }

      this.isConnected = true;
      
      if (this.currentSettings) {
        this.updateSettings(this.currentSettings);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to connect audio:', error);
      return false;
    }
  }

  private async setupWorkletProcessing(): Promise<void> {
    if (!this.audioContext || !this.inputNode) return;

    try {
      await this.audioContext.audioWorklet.addModule('/audio/amp-processor.js');
      
      this.workletNode = new AudioWorkletNode(this.audioContext, 'amp-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [2],
      });

      this.inputNode.connect(this.analyserNode!);
      this.inputNode.connect(this.workletNode);
      this.workletNode.connect(this.audioContext.destination);
      
      console.log('AudioWorklet processing initialized');
    } catch (error) {
      console.warn('AudioWorklet failed, falling back to standard processing:', error);
      await this.setupStandardProcessing();
    }
  }

  private async setupStandardProcessing(): Promise<void> {
    if (!this.audioContext || !this.inputNode) return;

    this.inputGainNode = this.audioContext.createGain();
    this.inputGainNode.gain.value = 1;

    this.bassFilter = this.audioContext.createBiquadFilter();
    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.value = 200;
    this.bassFilter.gain.value = 0;

    this.midFilter = this.audioContext.createBiquadFilter();
    this.midFilter.type = 'peaking';
    this.midFilter.frequency.value = 1000;
    this.midFilter.Q.value = 1;
    this.midFilter.gain.value = 0;

    this.trebleFilter = this.audioContext.createBiquadFilter();
    this.trebleFilter.type = 'highshelf';
    this.trebleFilter.frequency.value = 4000;
    this.trebleFilter.gain.value = 0;

    this.presenceFilter = this.audioContext.createBiquadFilter();
    this.presenceFilter.type = 'highshelf';
    this.presenceFilter.frequency.value = 6000;
    this.presenceFilter.gain.value = 0;

    this.distortionNode = this.audioContext.createWaveShaper();
    this.distortionNode.oversample = '4x';
    this.distortionNode.curve = this.makeDistortionCurve(50);

    this.lowBoostFilter = this.audioContext.createBiquadFilter();
    this.lowBoostFilter.type = 'lowshelf';
    this.lowBoostFilter.frequency.value = 80;
    this.lowBoostFilter.gain.value = 0;

    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.5;

    this.inputNode.connect(this.inputGainNode);
    this.inputGainNode.connect(this.distortionNode);
    this.distortionNode.connect(this.lowBoostFilter);
    this.lowBoostFilter.connect(this.bassFilter);
    this.bassFilter.connect(this.midFilter);
    this.midFilter.connect(this.trebleFilter);
    this.trebleFilter.connect(this.presenceFilter);
    this.presenceFilter.connect(this.gainNode);
    this.gainNode.connect(this.analyserNode!);
    this.analyserNode!.connect(this.audioContext.destination);
    
    console.log('Standard Web Audio processing initialized');
  }

  async disconnect(): Promise<void> {
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.inputNode = null;
    this.inputGainNode = null;
    this.bassFilter = null;
    this.midFilter = null;
    this.trebleFilter = null;
    this.presenceFilter = null;
    this.distortionNode = null;
    this.lowBoostFilter = null;
    this.gainNode = null;
    this.analyserNode = null;
    this.isConnected = false;
  }

  updateSettings(settings: AmpSettings): void {
    this.currentSettings = settings;
    this.currentMasterVolume = settings.masterVolume;

    if (this.isNativeConnected && this.websocket) {
      this.sendToNativeBridge({ type: 'settings', data: settings });
    }

    if (!this.isConnected) return;

    if (this.workletNode) {
      this.workletNode.port.postMessage({
        type: 'updateSettings',
        data: settings,
      });
      return;
    }

    if (this.inputGainNode) {
      const inputGain = (settings.inputGain / 10) * 2;
      this.inputGainNode.gain.setTargetAtTime(inputGain, this.audioContext!.currentTime, 0.01);
    }

    if (this.bassFilter) {
      const bassGain = ((settings.bass - 5) / 5) * 12;
      this.bassFilter.gain.setTargetAtTime(bassGain, this.audioContext!.currentTime, 0.01);
    }

    if (this.midFilter) {
      const midGain = ((settings.mid - 5) / 5) * 12;
      this.midFilter.gain.setTargetAtTime(midGain, this.audioContext!.currentTime, 0.01);
    }

    if (this.trebleFilter) {
      const trebleGain = ((settings.treble - 5) / 5) * 12;
      this.trebleFilter.gain.setTargetAtTime(trebleGain, this.audioContext!.currentTime, 0.01);
    }

    if (this.presenceFilter) {
      const presenceGain = ((settings.presence - 5) / 5) * 8;
      this.presenceFilter.gain.setTargetAtTime(presenceGain, this.audioContext!.currentTime, 0.01);
    }

    if (this.distortionNode) {
      let driveAmount = settings.drive * 10;
      if (settings.punish) {
        driveAmount *= 1.5;
      }
      if (settings.plus10db) {
        driveAmount += 100;
      }
      this.distortionNode.curve = this.makeDistortionCurve(driveAmount);
    }

    if (this.lowBoostFilter) {
      const lowBoost = settings.plusLow ? 8 : 0;
      this.lowBoostFilter.gain.setTargetAtTime(lowBoost, this.audioContext!.currentTime, 0.01);
    }

    if (this.gainNode) {
      const masterVolume = this.isMuted ? 0 : (settings.masterVolume / 10);
      this.gainNode.gain.setTargetAtTime(masterVolume, this.audioContext!.currentTime, 0.01);
    }
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;

    if (this.workletNode) {
      this.workletNode.port.postMessage({
        type: 'setMuted',
        data: muted,
      });
      return;
    }

    if (this.gainNode && this.audioContext) {
      const volume = muted ? 0 : (this.currentMasterVolume / 10);
      this.gainNode.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.01);
    }
  }

  getInputLevel(): number {
    if (!this.analyserNode) return 0;

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    return (average / 255) * 100;
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }

  connectToNativeBridge(url?: string, onStatusChange?: (connected: boolean) => void): void {
    if (url) {
      this.nativeBridgeUrl = url;
    }
    this.onNativeStatusChange = onStatusChange;

    try {
      this.websocket = new WebSocket(this.nativeBridgeUrl);

      this.websocket.onopen = () => {
        console.log('Connected to native audio bridge');
        this.isNativeConnected = true;
        this.onNativeStatusChange?.(true);
        
        if (this.currentSettings) {
          this.sendToNativeBridge({ type: 'settings', data: this.currentSettings });
        }
      };

      this.websocket.onclose = () => {
        console.log('Disconnected from native audio bridge');
        this.isNativeConnected = false;
        this.onNativeStatusChange?.(false);
      };

      this.websocket.onerror = (error) => {
        console.warn('Native bridge connection error:', error);
        this.isNativeConnected = false;
        this.onNativeStatusChange?.(false);
      };

      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as NativeBridgeMessage;
          this.handleNativeBridgeMessage(message);
        } catch (e) {
          console.error('Failed to parse native bridge message:', e);
        }
      };
    } catch (error) {
      console.error('Failed to connect to native bridge:', error);
      this.onNativeStatusChange?.(false);
    }
  }

  disconnectFromNativeBridge(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.isNativeConnected = false;
    this.onNativeStatusChange?.(false);
  }

  isNativeBridgeConnected(): boolean {
    return this.isNativeConnected;
  }

  private sendToNativeBridge(message: NativeBridgeMessage): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  private handleNativeBridgeMessage(message: NativeBridgeMessage): void {
    switch (message.type) {
      case 'status':
        console.log('Native bridge status:', message.data);
        break;
      case 'audio':
        break;
      default:
        console.log('Unknown native bridge message:', message);
    }
  }

  private makeDistortionCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      if (amount === 0) {
        curve[i] = x;
      } else {
        curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
      }
    }
    return curve;
  }
}

export const audioEngine = new AudioEngine();
