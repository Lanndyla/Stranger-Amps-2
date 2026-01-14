class AmpProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.inputLevel = 0.75;
    this.inputGain = 1.0;
    this.bassGain = 0;
    this.midGain = 0;
    this.trebleGain = 0;
    this.presenceGain = 0;
    this.driveAmount = 50;
    this.lowBoost = false;
    this.masterVolume = 0.5;
    this.outputLevel = 0.75;
    this.isMuted = false;
    
    this.thickenAmount = 0;
    this.thickenEnabled = false;
    this.chugAmount = 0;
    this.chugEnabled = false;
    this.lofiEnabled = false;
    this.cleanseEnabled = false;
    
    this.peqEnabled = false;
    this.peqBand1 = { freq: 100, gain: 0, q: 1 };
    this.peqBand2 = { freq: 500, gain: 0, q: 1 };
    this.peqBand3 = { freq: 2000, gain: 0, q: 1 };
    this.peqBand4 = { freq: 8000, gain: 0, q: 1 };
    
    this.thickenLastSample = [0, 0];
    this.thickenPeriodHistory = [[0,0,0,0], [0,0,0,0]];
    this.thickenPeriodIdx = [0, 0];
    this.thickenPeriod = [0, 0];
    this.thickenSampleCount = [0, 0];
    this.thickenOscPhase = [0, 0];
    this.thickenEnvelope = [0, 0];
    this.thickenSubGain = [0, 0];
    this.envelopeFollowers = [0, 0];
    
    this.lofiLpState = [{ x1: 0, x2: 0, y1: 0, y2: 0 }, { x1: 0, x2: 0, y1: 0, y2: 0 }];
    this.lofiHpState = [{ x1: 0, x2: 0, y1: 0, y2: 0 }, { x1: 0, x2: 0, y1: 0, y2: 0 }];
    this.lofiLpCoeffs = null;
    this.lofiHpCoeffs = null;
    
    this.channelStates = [];
    for (let ch = 0; ch < 2; ch++) {
      this.channelStates[ch] = {
        bass: { x1: 0, x2: 0, y1: 0, y2: 0 },
        mid: { x1: 0, x2: 0, y1: 0, y2: 0 },
        treble: { x1: 0, x2: 0, y1: 0, y2: 0 },
        presence: { x1: 0, x2: 0, y1: 0, y2: 0 },
        lowBoost: { x1: 0, x2: 0, y1: 0, y2: 0 },
        peq1: { x1: 0, x2: 0, y1: 0, y2: 0 },
        peq2: { x1: 0, x2: 0, y1: 0, y2: 0 },
        peq3: { x1: 0, x2: 0, y1: 0, y2: 0 },
        peq4: { x1: 0, x2: 0, y1: 0, y2: 0 },
      };
    }
    
    this.peq1Coeffs = null;
    this.peq2Coeffs = null;
    this.peq3Coeffs = null;
    this.peq4Coeffs = null;
    this.bassCoeffs = null;
    this.midCoeffs = null;
    this.trebleCoeffs = null;
    this.presenceCoeffs = null;
    this.lowBoostCoeffs = null;
    this.updateCoefficients();
    
    this.port.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === 'updateSettings') {
        this.inputLevel = ((data.inputLevel ?? 5) / 10) * 1.5;
        this.inputGain = (data.inputGain / 10) * 2;
        this.bassGain = ((data.bass - 5) / 5) * 12;
        this.midGain = ((data.mid - 5) / 5) * 12;
        this.trebleGain = ((data.treble - 5) / 5) * 12;
        this.presenceGain = ((data.presence - 5) / 5) * 8;
        
        let drive = data.drive * 10;
        if (data.punish) drive *= 1.5;
        if (data.plus10db) drive += 100;
        this.driveAmount = drive;
        
        this.lowBoost = data.plusLow;
        this.masterVolume = data.masterVolume / 10;
        this.outputLevel = ((data.outputLevel ?? 5) / 10) * 1.5;
        
        this.thickenAmount = ((data.thicken ?? 0) / 10);
        this.thickenEnabled = data.thickenEnabled ?? false;
        this.chugAmount = ((data.chugEnhance ?? 0) / 10);
        this.chugEnabled = data.chugEnabled ?? false;
        this.lofiEnabled = data.lofi ?? false;
        this.cleanseEnabled = data.cleanse ?? false;
        
        this.peqEnabled = data.peqEnabled ?? false;
        this.peqBand1 = { freq: data.peqBand1Freq ?? 100, gain: data.peqBand1Gain ?? 0, q: data.peqBand1Q ?? 1 };
        this.peqBand2 = { freq: data.peqBand2Freq ?? 500, gain: data.peqBand2Gain ?? 0, q: data.peqBand2Q ?? 1 };
        this.peqBand3 = { freq: data.peqBand3Freq ?? 2000, gain: data.peqBand3Gain ?? 0, q: data.peqBand3Q ?? 1 };
        this.peqBand4 = { freq: data.peqBand4Freq ?? 8000, gain: data.peqBand4Gain ?? 0, q: data.peqBand4Q ?? 1 };
        
        this.updateCoefficients();
      } else if (type === 'setMuted') {
        this.isMuted = data;
      }
    };
  }

  updateCoefficients() {
    const sampleRate = 48000;
    this.bassCoeffs = this.calculateBiquadCoeffs(200, 1, this.bassGain, 'lowshelf', sampleRate);
    this.midCoeffs = this.calculateBiquadCoeffs(1000, 1, this.midGain, 'peaking', sampleRate);
    this.trebleCoeffs = this.calculateBiquadCoeffs(4000, 1, this.trebleGain, 'highshelf', sampleRate);
    this.presenceCoeffs = this.calculateBiquadCoeffs(6000, 1, this.presenceGain, 'highshelf', sampleRate);
    this.lowBoostCoeffs = this.calculateBiquadCoeffs(80, 1, 8, 'lowshelf', sampleRate);
    this.lofiLpCoeffs = this.calculateBiquadCoeffs(2000, 0.7, 0, 'lowpass', sampleRate);
    this.lofiHpCoeffs = this.calculateBiquadCoeffs(300, 0.7, 0, 'highpass', sampleRate);
    
    this.peq1Coeffs = this.calculateBiquadCoeffs(this.peqBand1.freq, this.peqBand1.q, this.peqEnabled ? this.peqBand1.gain : 0, 'peaking', sampleRate);
    this.peq2Coeffs = this.calculateBiquadCoeffs(this.peqBand2.freq, this.peqBand2.q, this.peqEnabled ? this.peqBand2.gain : 0, 'peaking', sampleRate);
    this.peq3Coeffs = this.calculateBiquadCoeffs(this.peqBand3.freq, this.peqBand3.q, this.peqEnabled ? this.peqBand3.gain : 0, 'peaking', sampleRate);
    this.peq4Coeffs = this.calculateBiquadCoeffs(this.peqBand4.freq, this.peqBand4.q, this.peqEnabled ? this.peqBand4.gain : 0, 'peaking', sampleRate);
  }

  calculateLowpassCoeffs(frequency, Q, sampleRate) {
    const w0 = 2 * Math.PI * frequency / sampleRate;
    const cosW0 = Math.cos(w0);
    const sinW0 = Math.sin(w0);
    const alpha = sinW0 / (2 * Q);
    
    const b0 = (1 - cosW0) / 2;
    const b1 = 1 - cosW0;
    const b2 = (1 - cosW0) / 2;
    const a0 = 1 + alpha;
    const a1 = -2 * cosW0;
    const a2 = 1 - alpha;
    
    return { b0: b0/a0, b1: b1/a0, b2: b2/a0, a1: a1/a0, a2: a2/a0 };
  }

  calculateHighpassCoeffs(frequency, Q, sampleRate) {
    const w0 = 2 * Math.PI * frequency / sampleRate;
    const cosW0 = Math.cos(w0);
    const sinW0 = Math.sin(w0);
    const alpha = sinW0 / (2 * Q);
    
    const b0 = (1 + cosW0) / 2;
    const b1 = -(1 + cosW0);
    const b2 = (1 + cosW0) / 2;
    const a0 = 1 + alpha;
    const a1 = -2 * cosW0;
    const a2 = 1 - alpha;
    
    return { b0: b0/a0, b1: b1/a0, b2: b2/a0, a1: a1/a0, a2: a2/a0 };
  }

  calculateBiquadCoeffs(frequency, Q, gain, type, sampleRate) {
    const w0 = 2 * Math.PI * frequency / sampleRate;
    const cosW0 = Math.cos(w0);
    const sinW0 = Math.sin(w0);
    const A = Math.pow(10, gain / 40);
    
    let alpha, b0, b1, b2, a0, a1, a2;
    
    if (type === 'lowshelf') {
      alpha = sinW0 / 2 * Math.sqrt((A + 1/A) * (1/0.707 - 1) + 2);
      b0 = A * ((A + 1) - (A - 1) * cosW0 + 2 * Math.sqrt(A) * alpha);
      b1 = 2 * A * ((A - 1) - (A + 1) * cosW0);
      b2 = A * ((A + 1) - (A - 1) * cosW0 - 2 * Math.sqrt(A) * alpha);
      a0 = (A + 1) + (A - 1) * cosW0 + 2 * Math.sqrt(A) * alpha;
      a1 = -2 * ((A - 1) + (A + 1) * cosW0);
      a2 = (A + 1) + (A - 1) * cosW0 - 2 * Math.sqrt(A) * alpha;
    } else if (type === 'highshelf') {
      alpha = sinW0 / 2 * Math.sqrt((A + 1/A) * (1/0.707 - 1) + 2);
      b0 = A * ((A + 1) + (A - 1) * cosW0 + 2 * Math.sqrt(A) * alpha);
      b1 = -2 * A * ((A - 1) + (A + 1) * cosW0);
      b2 = A * ((A + 1) + (A - 1) * cosW0 - 2 * Math.sqrt(A) * alpha);
      a0 = (A + 1) - (A - 1) * cosW0 + 2 * Math.sqrt(A) * alpha;
      a1 = 2 * ((A - 1) - (A + 1) * cosW0);
      a2 = (A + 1) - (A - 1) * cosW0 - 2 * Math.sqrt(A) * alpha;
    } else if (type === 'lowpass') {
      alpha = sinW0 / (2 * Q);
      b0 = (1 - cosW0) / 2;
      b1 = 1 - cosW0;
      b2 = (1 - cosW0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosW0;
      a2 = 1 - alpha;
    } else if (type === 'highpass') {
      alpha = sinW0 / (2 * Q);
      b0 = (1 + cosW0) / 2;
      b1 = -(1 + cosW0);
      b2 = (1 + cosW0) / 2;
      a0 = 1 + alpha;
      a1 = -2 * cosW0;
      a2 = 1 - alpha;
    } else {
      alpha = sinW0 / (2 * Q);
      b0 = 1 + alpha * A;
      b1 = -2 * cosW0;
      b2 = 1 - alpha * A;
      a0 = 1 + alpha / A;
      a1 = -2 * cosW0;
      a2 = 1 - alpha / A;
    }
    
    return {
      b0: b0 / a0,
      b1: b1 / a0,
      b2: b2 / a0,
      a1: a1 / a0,
      a2: a2 / a0,
    };
  }

  applyDistortion(sample, amount) {
    if (amount === 0) return sample;
    const k = amount;
    const deg = Math.PI / 180;
    return ((3 + k) * sample * 20 * deg) / (Math.PI + k * Math.abs(sample));
  }

  applyBiquadFilter(sample, state, coeffs) {
    const output = coeffs.b0 * sample + coeffs.b1 * state.x1 + coeffs.b2 * state.x2
                   - coeffs.a1 * state.y1 - coeffs.a2 * state.y2;
    
    state.x2 = state.x1;
    state.x1 = sample;
    state.y2 = state.y1;
    state.y1 = output;
    
    return output;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (!input || !input[0]) {
      return true;
    }
    
    for (let channel = 0; channel < output.length; channel++) {
      const inputChannel = input[channel] || input[0];
      const outputChannel = output[channel];
      const chState = this.channelStates[channel] || this.channelStates[0];
      
      for (let i = 0; i < outputChannel.length; i++) {
        let sample = inputChannel[i] * this.inputLevel * this.inputGain;
        
        if (this.thickenEnabled && this.thickenAmount > 0) {
          const lastSample = this.thickenLastSample[channel];
          this.thickenLastSample[channel] = sample;
          this.thickenSampleCount[channel]++;
          
          if (lastSample <= 0 && sample > 0) {
            const period = this.thickenSampleCount[channel];
            if (period > 40 && period < 1500) {
              const hist = this.thickenPeriodHistory[channel];
              const currPeriod = this.thickenPeriod[channel];
              
              if (currPeriod > 0 && Math.abs(period - currPeriod) > currPeriod * 0.15) {
                hist[0] = hist[1] = hist[2] = hist[3] = 0;
                this.thickenPeriodIdx[channel] = 0;
                this.thickenPeriod[channel] = 0;
                this.thickenSubGain[channel] = 0;
                this.thickenOscPhase[channel] = 0;
              }
              
              const idx = this.thickenPeriodIdx[channel];
              hist[idx] = period;
              this.thickenPeriodIdx[channel] = (idx + 1) % 4;
              
              const validPeriods = hist.filter(p => p > 0);
              if (validPeriods.length >= 4) {
                const avg = validPeriods.reduce((a,b) => a+b, 0) / validPeriods.length;
                const maxDev = Math.max(...validPeriods.map(p => Math.abs(p - avg)));
                if (maxDev < avg * 0.15) {
                  this.thickenPeriod[channel] = avg;
                }
              }
            }
            this.thickenSampleCount[channel] = 0;
          }
          
          const env = Math.abs(sample);
          this.thickenEnvelope[channel] = this.thickenEnvelope[channel] * 0.995 + env * 0.005;
          
          const period = this.thickenPeriod[channel];
          const hasLock = period > 0 && this.thickenEnvelope[channel] > 0.01;
          
          if (hasLock) {
            const subPeriod = period * 2;
            const phaseInc = (2 * Math.PI) / subPeriod;
            this.thickenOscPhase[channel] = (this.thickenOscPhase[channel] + phaseInc) % (2 * Math.PI);
            this.thickenSubGain[channel] = Math.min(1, this.thickenSubGain[channel] + 0.0003);
          } else {
            this.thickenSubGain[channel] = Math.max(0, this.thickenSubGain[channel] - 0.01);
          }
          
          const subOctave = Math.sin(this.thickenOscPhase[channel]) * this.thickenEnvelope[channel] * this.thickenSubGain[channel];
          sample = sample + subOctave * this.thickenAmount * 2.5;
        }
        
        if (this.chugEnabled && this.chugAmount > 0) {
          const envelope = Math.abs(sample);
          const prevEnv = this.envelopeFollowers[channel] || 0;
          this.envelopeFollowers[channel] = prevEnv * 0.995 + envelope * 0.005;
          const transient = Math.max(0, envelope - this.envelopeFollowers[channel] * 1.5);
          const midBoost = 1 + transient * this.chugAmount * 4;
          sample = sample * midBoost;
        }
        
        if (!this.cleanseEnabled) {
          sample = this.applyDistortion(sample, this.driveAmount);
        }
        
        if (this.lowBoost) {
          sample = this.applyBiquadFilter(sample, chState.lowBoost, this.lowBoostCoeffs);
        }
        
        sample = this.applyBiquadFilter(sample, chState.bass, this.bassCoeffs);
        sample = this.applyBiquadFilter(sample, chState.mid, this.midCoeffs);
        sample = this.applyBiquadFilter(sample, chState.treble, this.trebleCoeffs);
        sample = this.applyBiquadFilter(sample, chState.presence, this.presenceCoeffs);
        
        if (this.peqEnabled && this.peq1Coeffs) {
          sample = this.applyBiquadFilter(sample, chState.peq1, this.peq1Coeffs);
          sample = this.applyBiquadFilter(sample, chState.peq2, this.peq2Coeffs);
          sample = this.applyBiquadFilter(sample, chState.peq3, this.peq3Coeffs);
          sample = this.applyBiquadFilter(sample, chState.peq4, this.peq4Coeffs);
        }
        
        if (this.lofiEnabled && this.lofiLpCoeffs && this.lofiHpCoeffs) {
          sample = this.applyBiquadFilter(sample, this.lofiLpState[channel], this.lofiLpCoeffs);
          sample = this.applyBiquadFilter(sample, this.lofiHpState[channel], this.lofiHpCoeffs);
          sample = sample * 0.8;
        }
        
        const volume = this.isMuted ? 0 : this.masterVolume;
        outputChannel[i] = sample * volume * this.outputLevel;
      }
    }
    
    return true;
  }
}

registerProcessor('amp-processor', AmpProcessor);
