# Stranger Amp's - JUCE Porting Guide

## Overview

This document provides all the technical specifications needed to port the Stranger Amp's web-based amp simulator to JUCE for VST3/AU/AAX plugin development.

**Target Platforms:** VST3, AU, AAX
**Sample Rate:** 48000 Hz (recommended, but should support 44100, 88200, 96000)
**Buffer Size:** Variable (support 32-2048 samples)
**Channels:** Stereo (2 in, 2 out)

---

## Signal Chain

```
Input → Input Level → Input Gain → [Thicken] → [Chug Enhancer] → 
Distortion (WaveShaper) → [Low Boost] → Bass EQ → Mid EQ → 
Treble EQ → Presence EQ → [Parametric EQ 4-band] → [Lo-Fi Filter] → 
[Delay] → Master Volume → Output Level → [Cabinet IR] → [Reverb] → Output
```

Brackets `[]` indicate optional/bypassable stages.

---

## Parameter Specifications

### Input Section

| Parameter | ID | Range | Default | JUCE Type | Notes |
|-----------|-----|-------|---------|-----------|-------|
| Input Level | `inputLevel` | 0.0 - 10.0 | 5.0 | Float | Maps to 0.0 - 1.5 gain |
| Input Gain | `inputGain` | 0.0 - 10.0 | 5.0 | Float | Maps to 0.0 - 2.0 gain |

**Conversion formulas:**
```cpp
float inputLevelGain = (inputLevel / 10.0f) * 1.5f;
float inputGainValue = (inputGain / 10.0f) * 2.0f;
```

### EQ Section (Biquad Filters)

| Parameter | ID | Range | Default | Filter Type | Frequency |
|-----------|-----|-------|---------|-------------|-----------|
| Bass | `bass` | 0.0 - 10.0 | 5.0 | Low Shelf | 200 Hz |
| Mid | `mid` | 0.0 - 10.0 | 5.0 | Peaking | 1000 Hz, Q=1 |
| Treble | `treble` | 0.0 - 10.0 | 5.0 | High Shelf | 4000 Hz |
| Presence | `presence` | 0.0 - 10.0 | 5.0 | High Shelf | 6000 Hz |

**Gain conversion:**
```cpp
// Bass, Mid, Treble: -12dB to +12dB range
float eqGainDB = ((paramValue - 5.0f) / 5.0f) * 12.0f;
// Presence: -8dB to +8dB range
float presenceGainDB = ((paramValue - 5.0f) / 5.0f) * 8.0f;
```

### Overdrive Section

| Parameter | ID | Range | Default | Type | Notes |
|-----------|-----|-------|---------|------|-------|
| Drive | `drive` | 0.0 - 10.0 | 5.0 | Float | Base drive amount |
| Punish | `punish` | bool | false | Bool | Multiplies drive by 1.5x |
| +10dB | `plus10db` | bool | false | Bool | Adds 100 to drive amount |
| +LOW | `plusLow` | bool | false | Bool | Enables low boost filter |

**Drive calculation:**
```cpp
float driveAmount = drive * 10.0f;
if (punish) driveAmount *= 1.5f;
if (plus10db) driveAmount += 100.0f;
```

**Low Boost Filter (when +LOW enabled):**
- Type: Low Shelf
- Frequency: 80 Hz
- Gain: +8 dB

### Distortion (WaveShaper)

The distortion uses a modified arctangent waveshaper with 4x oversampling.

```cpp
float applyDistortion(float sample, float amount) {
    if (amount == 0.0f) return sample;
    const float k = amount;
    const float deg = M_PI / 180.0f;
    return ((3.0f + k) * sample * 20.0f * deg) / (M_PI + k * std::abs(sample));
}
```

**JUCE Implementation:**
```cpp
// Use juce::dsp::Oversampling<float> with 4x oversampling
// Apply waveshaper function above
juce::dsp::WaveShaper<float> waveshaper;
waveshaper.functionToUse = [this](float x) {
    return applyDistortion(x, driveAmount);
};
```

### Thicken (Sub-Octave Generator)

Pitch-tracking sub-octave synthesizer for extended low-end.

| Parameter | ID | Range | Default | Notes |
|-----------|-----|-------|---------|-------|
| Thicken | `thicken` | 0 - 10 | 0 | Amount of sub-octave |
| Thicken Enabled | `thickenEnabled` | bool | false | Enable/disable |

**Algorithm:**
1. Zero-crossing detection for pitch tracking
2. Maintain 4-sample period history for stability
3. Generate sine wave at half the detected frequency
4. Envelope follower to match dynamics
5. Mix sub-octave with original signal

```cpp
// Key constants
const int MIN_PERIOD = 40;    // ~1200 Hz max
const int MAX_PERIOD = 1500;  // ~32 Hz min
const float STABILITY_THRESHOLD = 0.15f;  // 15% deviation allowed
const float ENVELOPE_ATTACK = 0.005f;
const float ENVELOPE_RELEASE = 0.995f;
const float SUB_GAIN_ATTACK = 0.0003f;
const float SUB_GAIN_RELEASE = 0.01f;

// Mix formula
output = input + (subOctave * thickenAmount * 2.5f);
```

### Chug Enhancer (Transient Shaper)

Transient enhancement for percussive palm-muted playing.

| Parameter | ID | Range | Default | Notes |
|-----------|-----|-------|---------|-------|
| Chug Enhance | `chugEnhance` | 0 - 10 | 0 | Enhancement amount |
| Chug Enabled | `chugEnabled` | bool | false | Enable/disable |

**Algorithm:**
```cpp
// Envelope follower
envelope = prevEnvelope * 0.995f + std::abs(sample) * 0.005f;

// Transient detection
float transient = std::max(0.0f, std::abs(sample) - envelope * 1.5f);

// Apply boost
float midBoost = 1.0f + transient * chugAmount * 4.0f;
output = sample * midBoost;
```

### Lo-Fi Filter

Bandwidth-limited processing for vintage/degraded tone.

| Parameter | ID | Type | Notes |
|-----------|-----|------|-------|
| Lo-Fi | `lofi` | bool | Enable/disable |

**Implementation:**
- Low-pass filter: 2000 Hz, Q=0.7
- High-pass filter: 300 Hz, Q=0.7
- Output attenuation: 0.8x (compensate for narrowed bandwidth)

### Cleanse Mode

Bypass distortion for clean tones.

| Parameter | ID | Type | Notes |
|-----------|-----|------|-------|
| Cleanse | `cleanse` | bool | Bypasses distortion stage |

### Parametric EQ (4-Band)

| Band | Freq Param | Gain Param | Q Param | Default Freq |
|------|-----------|-----------|---------|--------------|
| 1 | `peqBand1Freq` | `peqBand1Gain` | `peqBand1Q` | 100 Hz |
| 2 | `peqBand2Freq` | `peqBand2Gain` | `peqBand2Q` | 500 Hz |
| 3 | `peqBand3Freq` | `peqBand3Gain` | `peqBand3Q` | 2000 Hz |
| 4 | `peqBand4Freq` | `peqBand4Gain` | `peqBand4Q` | 8000 Hz |

**Parameter Ranges:**
- Frequency: 20 - 20000 Hz
- Gain: -12 to +12 dB
- Q: 0.1 - 10.0
- All bands use Peaking filter type

| Parameter | ID | Type | Notes |
|-----------|-----|------|-------|
| PEQ Enabled | `peqEnabled` | bool | Enable/disable all 4 bands |

### Delay

| Parameter | ID | Range | Default | Notes |
|-----------|-----|-------|---------|-------|
| Delay Enabled | `delayEnabled` | bool | false | Enable/disable |
| Delay Time | `delayTime` | 50 - 2000 ms | 400 ms | Delay time |
| Delay Feedback | `delayFeedback` | 0 - 10 | 4 | Maps to 0-0.8 |
| Delay Mix | `delayMix` | 0 - 10 | 3 | Wet/dry mix |

**Implementation:**
```cpp
// Buffer size for 2 seconds at 48kHz
const int DELAY_BUFFER_SIZE = 48000 * 2;

// Convert parameters
float delayTimeSeconds = delayTime / 1000.0f;
float feedbackGain = (delayFeedback / 10.0f) * 0.8f;
float wetLevel = delayMix / 10.0f;
float dryLevel = 1.0f - (wetLevel * 0.5f);  // Prevents clipping

// Processing
int delaySamples = (int)(delayTimeSeconds * sampleRate);
float delayedSample = delayBuffer[(writeIndex - delaySamples + bufferSize) % bufferSize];
float inputToDelay = sample + delayedSample * feedbackGain;
delayBuffer[writeIndex] = inputToDelay;
writeIndex = (writeIndex + 1) % bufferSize;
output = sample * dryLevel + delayedSample * wetLevel;
```

### Reverb

| Parameter | ID | Range | Default | Notes |
|-----------|-----|-------|---------|-------|
| Reverb Enabled | `reverbEnabled` | bool | false | Enable/disable |
| Reverb Type | `reverbType` | enum | "room" | hall/room/plate/spring/ambient/shimmer |
| Reverb Mix | `reverbMix` | 0 - 10 | 2 | Wet/dry mix |
| Reverb Decay | `reverbDecay` | 0 - 10 | 5 | Decay time modifier |

**Reverb Type Parameters:**

| Type | Base Decay | Duration |
|------|------------|----------|
| hall | 1.5 | 4.0s |
| room | 3.0 | 2.0s |
| plate | 2.5 | 2.5s |
| spring | 4.0 | 1.5s |
| ambient | 1.0 | 5.0s |
| shimmer | 0.8 | 6.0s |

**JUCE Implementation:**
Use `juce::dsp::Reverb` or convolution with generated IR:
```cpp
// Generate impulse response
void createReverbImpulse(float decay, float duration) {
    int length = (int)(sampleRate * duration);
    for (int i = 0; i < length; i++) {
        float t = (float)i / sampleRate;
        float envelope = std::exp(-t * decay);
        buffer[i] = (random.nextFloat() * 2.0f - 1.0f) * envelope;
    }
}
```

### Cabinet IR (Convolution)

| Parameter | ID | Type | Notes |
|-----------|-----|------|-------|
| IR Index | `irIndex` | 0-9 | Select built-in IR |
| IR Bypass | `irBypass` | bool | Bypass cabinet simulation |
| Custom IR Loaded | `customIRLoaded` | bool | Using user-loaded IR |

**Built-in IRs (10 total):**
1. DJENT CRUSH 4x12 - Tight, aggressive modern metal
2. MESA OVERSIZED - Classic djent cabinet
3. EVH 5150 III - Punchy high-gain response
4. ORANGE PPC412 - British crunch with depth
5. FRAMUS DRAGON - Extended range optimized
6. DIEZEL FRONTLOAD - Modern precision
7. ENGL PRO 4x12 - Tight and focused
8. PEAVEY 5150 - Legendary metal tone
9. BOGNER UBERCAB - Rich harmonics
10. SOLDANO 4x12 - Smooth high-gain

**JUCE Implementation:**
```cpp
juce::dsp::Convolution convolution;
convolution.loadImpulseResponse(irBuffer, sampleRate, 
    juce::dsp::Convolution::Stereo::yes, 
    juce::dsp::Convolution::Trim::yes, 
    juce::dsp::Convolution::Normalise::yes);
```

### Output Section

| Parameter | ID | Range | Default | Notes |
|-----------|-----|-------|---------|-------|
| Master Volume | `masterVolume` | 0.0 - 10.0 | 5.0 | Maps to 0.0 - 1.0 |
| Output Level | `outputLevel` | 0.0 - 10.0 | 5.0 | Maps to 0.0 - 1.5 |

---

## Biquad Filter Coefficient Calculations

All filters use standard biquad IIR implementation.

### Filter State Structure
```cpp
struct BiquadState {
    float x1 = 0, x2 = 0;  // Input history
    float y1 = 0, y2 = 0;  // Output history
};

struct BiquadCoeffs {
    float b0, b1, b2;  // Feedforward
    float a1, a2;      // Feedback (a0 normalized to 1)
};
```

### Processing Function
```cpp
float processBiquad(float sample, BiquadState& state, const BiquadCoeffs& coeffs) {
    float output = coeffs.b0 * sample 
                 + coeffs.b1 * state.x1 
                 + coeffs.b2 * state.x2
                 - coeffs.a1 * state.y1 
                 - coeffs.a2 * state.y2;
    
    state.x2 = state.x1;
    state.x1 = sample;
    state.y2 = state.y1;
    state.y1 = output;
    
    return output;
}
```

### Coefficient Calculations

```cpp
BiquadCoeffs calculateBiquadCoeffs(float frequency, float Q, float gainDB, 
                                    FilterType type, float sampleRate) {
    const float w0 = 2.0f * M_PI * frequency / sampleRate;
    const float cosW0 = std::cos(w0);
    const float sinW0 = std::sin(w0);
    const float A = std::pow(10.0f, gainDB / 40.0f);
    
    float alpha, b0, b1, b2, a0, a1, a2;
    
    switch (type) {
        case LowShelf: {
            alpha = sinW0 / 2.0f * std::sqrt((A + 1.0f/A) * (1.0f/0.707f - 1.0f) + 2.0f);
            b0 = A * ((A + 1) - (A - 1) * cosW0 + 2 * std::sqrt(A) * alpha);
            b1 = 2 * A * ((A - 1) - (A + 1) * cosW0);
            b2 = A * ((A + 1) - (A - 1) * cosW0 - 2 * std::sqrt(A) * alpha);
            a0 = (A + 1) + (A - 1) * cosW0 + 2 * std::sqrt(A) * alpha;
            a1 = -2 * ((A - 1) + (A + 1) * cosW0);
            a2 = (A + 1) + (A - 1) * cosW0 - 2 * std::sqrt(A) * alpha;
            break;
        }
        case HighShelf: {
            alpha = sinW0 / 2.0f * std::sqrt((A + 1.0f/A) * (1.0f/0.707f - 1.0f) + 2.0f);
            b0 = A * ((A + 1) + (A - 1) * cosW0 + 2 * std::sqrt(A) * alpha);
            b1 = -2 * A * ((A - 1) + (A + 1) * cosW0);
            b2 = A * ((A + 1) + (A - 1) * cosW0 - 2 * std::sqrt(A) * alpha);
            a0 = (A + 1) - (A - 1) * cosW0 + 2 * std::sqrt(A) * alpha;
            a1 = 2 * ((A - 1) - (A + 1) * cosW0);
            a2 = (A + 1) - (A - 1) * cosW0 - 2 * std::sqrt(A) * alpha;
            break;
        }
        case Peaking: {
            alpha = sinW0 / (2.0f * Q);
            b0 = 1 + alpha * A;
            b1 = -2 * cosW0;
            b2 = 1 - alpha * A;
            a0 = 1 + alpha / A;
            a1 = -2 * cosW0;
            a2 = 1 - alpha / A;
            break;
        }
        case LowPass: {
            alpha = sinW0 / (2.0f * Q);
            b0 = (1 - cosW0) / 2;
            b1 = 1 - cosW0;
            b2 = (1 - cosW0) / 2;
            a0 = 1 + alpha;
            a1 = -2 * cosW0;
            a2 = 1 - alpha;
            break;
        }
        case HighPass: {
            alpha = sinW0 / (2.0f * Q);
            b0 = (1 + cosW0) / 2;
            b1 = -(1 + cosW0);
            b2 = (1 + cosW0) / 2;
            a0 = 1 + alpha;
            a1 = -2 * cosW0;
            a2 = 1 - alpha;
            break;
        }
    }
    
    return { b0/a0, b1/a0, b2/a0, a1/a0, a2/a0 };
}
```

---

## Preset Format (JSON)

Presets can be exported/imported as JSON:

```json
{
  "name": "DJENT MASTER",
  "settings": {
    "inputLevel": 5,
    "inputGain": 7,
    "bass": 5,
    "mid": 3,
    "treble": 8,
    "presence": 7,
    "drive": 9,
    "punish": true,
    "plus10db": true,
    "plusLow": false,
    "thicken": 3,
    "thickenEnabled": true,
    "chugEnhance": 4,
    "chugEnabled": true,
    "lofi": false,
    "cleanse": false,
    "pitchShift": 0,
    "pitchEnabled": false,
    "masterVolume": 5,
    "outputLevel": 5,
    "reverbType": "room",
    "reverbMix": 2,
    "reverbDecay": 5,
    "reverbEnabled": false,
    "irIndex": 0,
    "irBypass": false,
    "delayEnabled": false,
    "delayTime": 400,
    "delayFeedback": 4,
    "delayMix": 3,
    "peqEnabled": true,
    "peqBand1Freq": 80,
    "peqBand1Gain": -3,
    "peqBand1Q": 1.2,
    "peqBand2Freq": 400,
    "peqBand2Gain": -2,
    "peqBand2Q": 1.5,
    "peqBand3Freq": 2500,
    "peqBand3Gain": 3,
    "peqBand3Q": 1.0,
    "peqBand4Freq": 6000,
    "peqBand4Gain": 2,
    "peqBand4Q": 0.8
  },
  "isFactory": true
}
```

---

## JUCE Project Structure Recommendation

```
StrangerAmps/
├── Source/
│   ├── PluginProcessor.h/.cpp      # Main audio processor
│   ├── PluginEditor.h/.cpp         # GUI
│   ├── DSP/
│   │   ├── AmpProcessor.h/.cpp     # Main amp processing chain
│   │   ├── BiquadFilter.h/.cpp     # Filter implementation
│   │   ├── WaveShaper.h/.cpp       # Distortion
│   │   ├── SubOctave.h/.cpp        # Thicken effect
│   │   ├── TransientShaper.h/.cpp  # Chug enhancer
│   │   ├── DelayLine.h/.cpp        # Delay effect
│   │   └── CabinetSim.h/.cpp       # IR convolution
│   ├── Parameters/
│   │   ├── ParameterLayout.h/.cpp  # JUCE parameter definitions
│   │   └── PresetManager.h/.cpp    # Preset save/load
│   └── GUI/
│       ├── Components/             # Custom UI components
│       └── LookAndFeel/            # Custom styling
├── Resources/
│   ├── IRs/                        # Built-in cabinet IRs (.wav)
│   └── Presets/                    # Factory presets (.json)
└── JuceLibraryCode/
```

---

## Key JUCE Classes to Use

| Feature | JUCE Class |
|---------|------------|
| Parameters | `juce::AudioProcessorValueTreeState` |
| Oversampling | `juce::dsp::Oversampling<float>` |
| Convolution | `juce::dsp::Convolution` |
| Reverb | `juce::dsp::Reverb` |
| Delay | `juce::dsp::DelayLine<float>` |
| Filter | `juce::dsp::IIR::Filter<float>` |
| WaveShaper | `juce::dsp::WaveShaper<float>` |
| FFT (for analysis) | `juce::dsp::FFT` |

---

## Performance Considerations

1. **Oversampling**: Use 4x oversampling for the distortion stage only
2. **Coefficient Updates**: Recalculate filter coefficients only when parameters change
3. **SIMD**: Use `juce::FloatVectorOperations` for gain/mixing operations
4. **Latency**: Report accurate latency for oversampling and convolution
5. **Thread Safety**: Use atomic parameters or proper locking for real-time safety

---

## Testing Checklist

- [ ] All parameters respond correctly across full range
- [ ] No zipper noise on parameter changes (use smoothing)
- [ ] CPU usage within acceptable limits
- [ ] Correct latency reporting
- [ ] Preset save/load works correctly
- [ ] IR loading from file works
- [ ] All filter types produce expected frequency response
- [ ] Distortion sounds consistent with web version
- [ ] Sub-octave tracking is stable
- [ ] No clicks/pops at any parameter settings

---

## Version Information

- Web App Version: 1.0.0
- Document Version: 1.0.0
- Last Updated: January 2026
