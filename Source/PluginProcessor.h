#pragma once

#include <juce_audio_processors/juce_audio_processors.h>
#include <juce_dsp/juce_dsp.h>

//==============================================================================
/**
 * Main audio processor for Stranger Amps plugin.
 * Handles audio processing, parameter management, and state persistence.
 */
class StrangerAmpsProcessor : public juce::AudioProcessor {
public:
  //==============================================================================
  StrangerAmpsProcessor();
  ~StrangerAmpsProcessor() override;

  //==============================================================================
  void prepareToPlay(double sampleRate, int samplesPerBlock) override;
  void releaseResources() override;

#ifndef JucePlugin_PreferredChannelConfigurations
  bool isBusesLayoutSupported(const BusesLayout &layouts) const override;
#endif

  void processBlock(juce::AudioBuffer<float> &, juce::MidiBuffer &) override;

  //==============================================================================
  juce::AudioProcessorEditor *createEditor() override;
  bool hasEditor() const override;

  //==============================================================================
  const juce::String getName() const override;

  bool acceptsMidi() const override;
  bool producesMidi() const override;
  bool isMidiEffect() const override;
  double getTailLengthSeconds() const override;

  //==============================================================================
  int getNumPrograms() override;
  int getCurrentProgram() override;
  void setCurrentProgram(int index) override;
  const juce::String getProgramName(int index) override;
  void changeProgramName(int index, const juce::String &newName) override;

  //==============================================================================
  void getStateInformation(juce::MemoryBlock &destData) override;
  void setStateInformation(const void *data, int sizeInBytes) override;

  //==============================================================================
  // Parameter access for WebView bridge
  juce::AudioProcessorValueTreeState &getValueTreeState() { return apvts; }

  // Send parameter update to WebView
  void notifyParameterChanged(const juce::String &paramID, float value);

  // Callback for WebView to set parameters
  void setParameterFromWebView(const juce::String &paramID, float value);

private:
  //==============================================================================
  // Parameter layout creation
  juce::AudioProcessorValueTreeState::ParameterLayout createParameterLayout();

  // Audio processing state
  juce::AudioProcessorValueTreeState apvts;

  // DSP components will be added here
  // TODO: Add amp processing chain from JUCE_PORTING_GUIDE.md

  JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(StrangerAmpsProcessor)
};
