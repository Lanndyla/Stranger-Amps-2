class AmpProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.inputGain = 1.0;
    this.bassGain = 0;
    this.midGain = 0;
    this.trebleGain = 0;
    this.presenceGain = 0;
    this.driveAmount = 50;
    this.lowBoost = false;
    this.masterVolume = 0.5;
    this.isMuted = false;
    
    this.channelStates = [];
    for (let ch = 0; ch < 2; ch++) {
      this.channelStates[ch] = {
        bass: { x1: 0, x2: 0, y1: 0, y2: 0 },
        mid: { x1: 0, x2: 0, y1: 0, y2: 0 },
        treble: { x1: 0, x2: 0, y1: 0, y2: 0 },
        presence: { x1: 0, x2: 0, y1: 0, y2: 0 },
        lowBoost: { x1: 0, x2: 0, y1: 0, y2: 0 },
      };
    }
    
    this.bassCoeffs = null;
    this.midCoeffs = null;
    this.trebleCoeffs = null;
    this.presenceCoeffs = null;
    this.lowBoostCoeffs = null;
    this.updateCoefficients();
    
    this.port.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === 'updateSettings') {
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
        let sample = inputChannel[i] * this.inputGain;
        
        sample = this.applyDistortion(sample, this.driveAmount);
        
        if (this.lowBoost) {
          sample = this.applyBiquadFilter(sample, chState.lowBoost, this.lowBoostCoeffs);
        }
        
        sample = this.applyBiquadFilter(sample, chState.bass, this.bassCoeffs);
        sample = this.applyBiquadFilter(sample, chState.mid, this.midCoeffs);
        sample = this.applyBiquadFilter(sample, chState.treble, this.trebleCoeffs);
        sample = this.applyBiquadFilter(sample, chState.presence, this.presenceCoeffs);
        
        const volume = this.isMuted ? 0 : this.masterVolume;
        outputChannel[i] = sample * volume;
      }
    }
    
    return true;
  }
}

registerProcessor('amp-processor', AmpProcessor);
