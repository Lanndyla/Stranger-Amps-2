#include "PluginProcessor.h"
#include "PluginEditor.h"

//==============================================================================
StrangerAmpsProcessor::StrangerAmpsProcessor()
#ifndef JucePlugin_PreferredChannelConfigurations
    : AudioProcessor(
          BusesProperties()
#if !JucePlugin_IsMidiEffect
#if !JucePlugin_IsSynth
              .withInput("Input", juce::AudioChannelSet::stereo(), true)
#endif
              .withOutput("Output", juce::AudioChannelSet::stereo(), true)
#endif
              ),
#endif
      apvts(*this, nullptr, "Parameters", createParameterLayout()) {
}

StrangerAmpsProcessor::~StrangerAmpsProcessor() {}

//==============================================================================
const juce::String StrangerAmpsProcessor::getName() const {
  return JucePlugin_Name;
}

bool StrangerAmpsProcessor::acceptsMidi() const {
#if JucePlugin_WantsMidiInput
  return true;
#else
  return false;
#endif
}

bool StrangerAmpsProcessor::producesMidi() const {
#if JucePlugin_ProducesMidiOutput
  return true;
#else
  return false;
#endif
}

bool StrangerAmpsProcessor::isMidiEffect() const {
#if JucePlugin_IsMidiEffect
  return true;
#else
  return false;
#endif
}

double StrangerAmpsProcessor::getTailLengthSeconds() const { return 0.0; }

int StrangerAmpsProcessor::getNumPrograms() { return 1; }

int StrangerAmpsProcessor::getCurrentProgram() { return 0; }

void StrangerAmpsProcessor::setCurrentProgram(int index) {}

const juce::String StrangerAmpsProcessor::getProgramName(int index) {
  return {};
}

void StrangerAmpsProcessor::changeProgramName(int index,
                                              const juce::String &newName) {}

//==============================================================================
void StrangerAmpsProcessor::prepareToPlay(double sampleRate,
                                          int samplesPerBlock) {
  // Initialize DSP components here
}

void StrangerAmpsProcessor::releaseResources() {
  // Release any resources
}

#ifndef JucePlugin_PreferredChannelConfigurations
bool StrangerAmpsProcessor::isBusesLayoutSupported(
    const BusesLayout &layouts) const {
#if JucePlugin_IsMidiEffect
  juce::ignoreUnused(layouts);
  return true;
#else
  // Stereo in/out
  if (layouts.getMainOutputChannelSet() != juce::AudioChannelSet::stereo())
    return false;

#if !JucePlugin_IsSynth
  if (layouts.getMainInputChannelSet() != juce::AudioChannelSet::stereo())
    return false;
#endif

  return true;
#endif
}
#endif

void StrangerAmpsProcessor::processBlock(juce::AudioBuffer<float> &buffer,
                                         juce::MidiBuffer &midiMessages) {
  juce::ScopedNoDenormals noDenormals;
  auto totalNumInputChannels = getTotalNumInputChannels();
  auto totalNumOutputChannels = getTotalNumOutputChannels();

  // Clear unused output channels
  for (auto i = totalNumInputChannels; i < totalNumOutputChannels; ++i)
    buffer.clear(i, 0, buffer.getNumSamples());

  // TODO: Implement amp processing chain from JUCE_PORTING_GUIDE.md
  // For now, just pass through
}

//==============================================================================
bool StrangerAmpsProcessor::hasEditor() const { return true; }

juce::AudioProcessorEditor *StrangerAmpsProcessor::createEditor() {
  return new StrangerAmpsEditor(*this);
}

//==============================================================================
void StrangerAmpsProcessor::getStateInformation(juce::MemoryBlock &destData) {
  auto state = apvts.copyState();
  std::unique_ptr<juce::XmlElement> xml(state.createXml());
  copyXmlToBinary(*xml, destData);
}

void StrangerAmpsProcessor::setStateInformation(const void *data,
                                                int sizeInBytes) {
  std::unique_ptr<juce::XmlElement> xmlState(
      getXmlFromBinary(data, sizeInBytes));

  if (xmlState.get() != nullptr)
    if (xmlState->hasTagName(apvts.state.getType()))
      apvts.replaceState(juce::ValueTree::fromXml(*xmlState));
}

//==============================================================================
void StrangerAmpsProcessor::notifyParameterChanged(const juce::String &paramID,
                                                   float value) {
  // This will be called by the audio thread to notify WebView
  // The editor will handle sending this to the WebView
}

void StrangerAmpsProcessor::setParameterFromWebView(const juce::String &paramID,
                                                    float value) {
  // Called from WebView (message thread) to update parameter
  if (auto *param = apvts.getParameter(paramID)) {
    param->setValueNotifyingHost(value);
  }
}

//==============================================================================
juce::AudioProcessorValueTreeState::ParameterLayout
StrangerAmpsProcessor::createParameterLayout() {
  juce::AudioProcessorValueTreeState::ParameterLayout layout;

  // Based on JUCE_PORTING_GUIDE.md parameters

  // Input Section
  layout.add(std::make_unique<juce::AudioParameterFloat>(
      "inputLevel", "Input Level", 0.0f, 10.0f, 5.0f));
  layout.add(std::make_unique<juce::AudioParameterFloat>(
      "inputGain", "Input Gain", 0.0f, 10.0f, 5.0f));

  // EQ Section
  layout.add(std::make_unique<juce::AudioParameterFloat>("bass", "Bass", 0.0f,
                                                         10.0f, 5.0f));
  layout.add(std::make_unique<juce::AudioParameterFloat>("mid", "Mid", 0.0f,
                                                         10.0f, 5.0f));
  layout.add(std::make_unique<juce::AudioParameterFloat>("treble", "Treble",
                                                         0.0f, 10.0f, 5.0f));
  layout.add(std::make_unique<juce::AudioParameterFloat>("presence", "Presence",
                                                         0.0f, 10.0f, 5.0f));

  // Overdrive Section
  layout.add(std::make_unique<juce::AudioParameterFloat>("drive", "Drive", 0.0f,
                                                         10.0f, 5.0f));
  layout.add(
      std::make_unique<juce::AudioParameterBool>("punish", "Punish", false));
  layout.add(
      std::make_unique<juce::AudioParameterBool>("plus10db", "+10dB", false));
  layout.add(
      std::make_unique<juce::AudioParameterBool>("plusLow", "+LOW", false));

  // Thicken (Sub-Octave)
  layout.add(std::make_unique<juce::AudioParameterFloat>("thicken", "Thicken",
                                                         0.0f, 10.0f, 0.0f));
  layout.add(std::make_unique<juce::AudioParameterBool>(
      "thickenEnabled", "Thicken Enabled", false));

  // Chug Enhancer
  layout.add(std::make_unique<juce::AudioParameterFloat>(
      "chugEnhance", "Chug Enhance", 0.0f, 10.0f, 0.0f));
  layout.add(std::make_unique<juce::AudioParameterBool>("chugEnabled",
                                                        "Chug Enabled", false));

  // Effects
  layout.add(
      std::make_unique<juce::AudioParameterBool>("lofi", "Lo-Fi", false));
  layout.add(
      std::make_unique<juce::AudioParameterBool>("cleanse", "Cleanse", false));

  // Output Section
  layout.add(std::make_unique<juce::AudioParameterFloat>(
      "masterVolume", "Master Volume", 0.0f, 10.0f, 5.0f));
  layout.add(std::make_unique<juce::AudioParameterFloat>(
      "outputLevel", "Output Level", 0.0f, 10.0f, 5.0f));

  // Cabinet IR
  layout.add(std::make_unique<juce::AudioParameterInt>("irIndex", "IR Index", 0,
                                                       9, 0));
  layout.add(std::make_unique<juce::AudioParameterBool>("irBypass", "IR Bypass",
                                                        false));

  // TODO: Add remaining parameters (Delay, Reverb, Parametric EQ)

  return layout;
}

//==============================================================================
// This creates new instances of the plugin
juce::AudioProcessor *JUCE_CALLTYPE createPluginFilter() {
  return new StrangerAmpsProcessor();
}
