#pragma once

#include "PluginProcessor.h"
#include "WebView/WebViewBridge.h"
#include <juce_audio_processors/juce_audio_processors.h>
#include <juce_gui_extra/juce_gui_extra.h>

//==============================================================================
/**
 * Plugin editor that embeds the React web UI via WebView.
 */
class StrangerAmpsEditor : public juce::AudioProcessorEditor,
                           private juce::Timer {
public:
  StrangerAmpsEditor(StrangerAmpsProcessor &);
  ~StrangerAmpsEditor() override;

  //==============================================================================
  void paint(juce::Graphics &) override;
  void resized() override;

private:
  //==============================================================================
  void timerCallback() override;

  // Reference to processor
  StrangerAmpsProcessor &audioProcessor;

  // WebView component
  std::unique_ptr<juce::WebBrowserComponent> webView;

  // Communication bridge
  std::unique_ptr<WebViewBridge> bridge;

  // Fallback UI if WebView fails
  juce::Label fallbackLabel;
  bool webViewLoaded = false;

  JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(StrangerAmpsEditor)
};
