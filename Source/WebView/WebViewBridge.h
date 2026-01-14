#pragma once

#include <juce_core/juce_core.h>
#include <juce_gui_extra/juce_gui_extra.h>

// Forward declaration
class StrangerAmpsProcessor;

//==============================================================================
/**
 * Bridge for bidirectional communication between WebView and JUCE.
 * Handles parameter synchronization and preset management.
 */
class WebViewBridge {
public:
  explicit WebViewBridge(StrangerAmpsProcessor &processor);
  ~WebViewBridge();

  //==============================================================================
  // Native → Web: Send parameter updates to React UI
  void syncParametersToWeb(juce::WebBrowserComponent *webView);

  // Native → Web: Send single parameter update
  void sendParameterUpdate(juce::WebBrowserComponent *webView,
                           const juce::String &paramId, float value);

  // Native → Web: Send preset data
  void sendPresetData(juce::WebBrowserComponent *webView,
                      const juce::String &presetJson);

  //==============================================================================
  // Web → Native: Handle messages from JavaScript
  void handleMessageFromWeb(const juce::String &message);

  // Parse and apply parameter change from web
  void handleParameterChange(const juce::var &messageData);

  // Handle preset load/save requests
  void handlePresetAction(const juce::var &messageData);

private:
  //==============================================================================
  // Execute JavaScript in the WebView
  void evaluateJavaScript(juce::WebBrowserComponent *webView,
                          const juce::String &script);

  // Build JavaScript call to update parameter in React
  juce::String buildParameterUpdateScript(const juce::String &paramId,
                                          float value);

  // Reference to audio processor
  StrangerAmpsProcessor &processor;

  // Track which parameters have changed
  std::unordered_map<juce::String, float> lastSentValues;

  JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(WebViewBridge)
};
