#pragma once

#include "PluginProcessor.h"
#include <juce_gui_extra/juce_gui_extra.h>

//==============================================================================
/**
    A custom WebBrowserComponent that intercepts URL changes to handle
    communication from JavaScript to C++.
*/
class WebViewBridge : public juce::WebBrowserComponent {
public:
  WebViewBridge(AudioPluginAudioProcessor &p) : processor(p) {}

private:
  bool pageAboutToLoad(const juce::String &newUrl) override {
    if (newUrl.startsWith("juce:")) {
      auto messageJson =
          juce::URL::decode(newUrl.substring(5)); // Remove "juce:" and decode
      juce::var message;

      if (juce::JSON::parse(messageJson, message) == juce::Result::ok())
        processor.handleUIMessage(message);

      return false; // Prevent the navigation
    }
    return true; // Allow normal navigation
  }

  AudioPluginAudioProcessor &processor;
};

//==============================================================================
class AudioPluginAudioProcessorEditor final
    : public juce::AudioProcessorEditor,
      public juce::AudioProcessorValueTreeState::Listener {
public:
  explicit AudioPluginAudioProcessorEditor(AudioPluginAudioProcessor &);
  ~AudioPluginAudioProcessorEditor() override;

  //==============================================================================
  void paint(juce::Graphics &) override;
  void resized() override;

private:
  void parameterChanged(const juce::String &parameterID,
                        float newValue) override;

  // This reference is provided as a quick way for your editor to
  // access the processor object that created it.
  AudioPluginAudioProcessor &processorRef;

  juce::AudioProcessorValueTreeState &apvts;
  std::unique_ptr<WebViewBridge> webView;

  JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(AudioPluginAudioProcessorEditor)
};
