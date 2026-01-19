#include "PluginEditor.h"
#include "BinaryData.h"
#include "PluginProcessor.h"

//==============================================================================
AudioPluginAudioProcessorEditor::AudioPluginAudioProcessorEditor(
    AudioPluginAudioProcessor &p)
    : AudioProcessorEditor(&p), processorRef(p), apvts(p.apvts) {
  webView = std::make_unique<WebViewBridge>(processorRef);
  addAndMakeVisible(*webView);

  // Add this editor as a listener to receive callbacks for parameter changes.
  for (const auto &id : Params::getIDs())
    apvts.addParameterListener(id.toString(), this);

  // 4️⃣ Load the Web UI in JUCE
  // Load the index.html from our embedded BinaryData
  auto indexHtml = juce::String::fromUTF8(BinaryData::index_html,
                                          BinaryData::index_htmlSize);

  // The base URL is important for resolving relative paths to assets
  webView->loadHTML(indexHtml, "file:///");

  setSize(800, 600);
}

AudioPluginAudioProcessorEditor::~AudioPluginAudioProcessorEditor() {
  // It's important to remove the listener when the editor is destroyed.
  for (const auto &id : Params::getIDs())
    apvts.removeParameterListener(id.toString(), this);
}

//==============================================================================
void AudioPluginAudioProcessorEditor::paint(juce::Graphics &g) {
  // (Our component is opaque, so we must completely fill the background with a
  // solid colour)
  g.fillAll(
      getLookAndFeel().findColour(juce::ResizableWindow::backgroundColourId));
}

void AudioPluginAudioProcessorEditor::resized() {
  if (webView != nullptr)
    webView->setBounds(getLocalBounds());
}

void AudioPluginAudioProcessorEditor::parameterChanged(
    const juce::String &parameterID, float newNormalizedValue) {
  // This is our C++ to JavaScript bridge.
  // It's called when a parameter changes, so we can update the web UI.

  if (auto *param = apvts.getParameter(parameterID)) {
    // Convert the normalized value back to its actual value (e.g., 0.5 ->
    // 0.0dB)
    float actualValue = param->getValue();

    // Construct a JavaScript call.
    // Make sure your web app has a global function like
    // `window.updateParameter`.
    juce::String jsCall =
        "if (window.updateParameter) { window.updateParameter('" + parameterID +
        "', " + juce::String(param->convertFrom0to1(newNormalizedValue)) +
        "); }";

    // Execute the JavaScript in the web view.
    if (webView != nullptr && webView->isPageLoaded()) {
      // The `if (window.updateParameter)` check in the JS code handles cases
      // where the page isn't fully initialized yet.
      webView->executeJavascript(jsCall);
    }
  }
}
