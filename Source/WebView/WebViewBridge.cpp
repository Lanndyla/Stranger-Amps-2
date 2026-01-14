#include "WebViewBridge.h"
#include "../PluginProcessor.h"

//==============================================================================
WebViewBridge::WebViewBridge(StrangerAmpsProcessor &p) : processor(p) {}

WebViewBridge::~WebViewBridge() {}

//==============================================================================
// Native → Web Communication
//==============================================================================

void WebViewBridge::syncParametersToWeb(juce::WebBrowserComponent *webView) {
  if (webView == nullptr)
    return;

  auto &apvts = processor.getValueTreeState();

  // Iterate through all parameters and send updates if changed
  for (auto *param : processor.getParameters()) {
    if (auto *paramWithID =
            dynamic_cast<juce::AudioProcessorParameterWithID *>(param)) {
      juce::String paramID = paramWithID->paramID;
      float currentValue = param->getValue();

      // Only send if value has changed (reduce unnecessary updates)
      if (lastSentValues.find(paramID) == lastSentValues.end() ||
          std::abs(lastSentValues[paramID] - currentValue) > 0.001f) {
        sendParameterUpdate(webView, paramID, currentValue);
        lastSentValues[paramID] = currentValue;
      }
    }
  }
}

void WebViewBridge::sendParameterUpdate(juce::WebBrowserComponent *webView,
                                        const juce::String &paramId,
                                        float value) {
  if (webView == nullptr)
    return;

  auto script = buildParameterUpdateScript(paramId, value);
  evaluateJavaScript(webView, script);
}

void WebViewBridge::sendPresetData(juce::WebBrowserComponent *webView,
                                   const juce::String &presetJson) {
  if (webView == nullptr)
    return;

  // Send preset data to web UI
  auto script = "if (window.JUCE && window.JUCE.onPresetLoad) { "
                "window.JUCE.onPresetLoad(" +
                presetJson + "); }";

  evaluateJavaScript(webView, script);
}

//==============================================================================
// Web → Native Communication
//==============================================================================

void WebViewBridge::handleMessageFromWeb(const juce::String &message) {
  // Parse JSON message from JavaScript
  auto messageVar = juce::JSON::parse(message);

  if (!messageVar.isObject())
    return;

  auto messageObj = messageVar.getDynamicObject();
  if (messageObj == nullptr)
    return;

  auto messageType = messageObj->getProperty("type").toString();

  if (messageType == "parameterChange") {
    handleParameterChange(messageVar);
  } else if (messageType == "presetLoad" || messageType == "presetSave") {
    handlePresetAction(messageVar);
  }
}

void WebViewBridge::handleParameterChange(const juce::var &messageData) {
  auto messageObj = messageData.getDynamicObject();
  if (messageObj == nullptr)
    return;

  auto paramId = messageObj->getProperty("paramId").toString();
  float value = static_cast<float>(messageObj->getProperty("value"));

  // Update parameter in processor (thread-safe)
  juce::MessageManager::callAsync([this, paramId, value]() {
    processor.setParameterFromWebView(paramId, value);
  });
}

void WebViewBridge::handlePresetAction(const juce::var &messageData) {
  auto messageObj = messageData.getDynamicObject();
  if (messageObj == nullptr)
    return;

  auto actionType = messageObj->getProperty("type").toString();

  if (actionType == "presetLoad") {
    // TODO: Implement preset loading
    // auto presetName = messageObj->getProperty("presetName").toString();
  } else if (actionType == "presetSave") {
    // TODO: Implement preset saving
    // auto presetName = messageObj->getProperty("presetName").toString();
  }
}

//==============================================================================
// Helper Methods
//==============================================================================

void WebViewBridge::evaluateJavaScript(juce::WebBrowserComponent *webView,
                                       const juce::String &script) {
  if (webView == nullptr)
    return;

  // Execute JavaScript in the WebView
  // Note: In JUCE 8, this might need to be done differently
  // depending on the platform (WKWebView, WebView2, etc.)

#if JUCE_MAC
  // macOS WKWebView
  webView->evaluateJavascript(script);
#elif JUCE_WINDOWS
  // Windows WebView2
  webView->evaluateJavascript(script);
#else
  // Linux WebKitGTK
  webView->evaluateJavascript(script);
#endif
}

juce::String
WebViewBridge::buildParameterUpdateScript(const juce::String &paramId,
                                          float value) {
  // Build JavaScript to call React state update
  // The web app should expose window.JUCE.onParameterUpdate(paramId, value)

  return "if (window.JUCE && window.JUCE.onParameterUpdate) { "
         "window.JUCE.onParameterUpdate('" +
         paramId + "', " + juce::String(value, 6) + "); }";
}
