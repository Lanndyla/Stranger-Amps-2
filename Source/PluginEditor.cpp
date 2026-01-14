#include "PluginEditor.h"
#include "PluginProcessor.h"

//==============================================================================
StrangerAmpsEditor::StrangerAmpsEditor(StrangerAmpsProcessor &p)
    : AudioProcessorEditor(&p), audioProcessor(p) {
  // Set editor size (amp simulator dimensions)
  setSize(1200, 800);

  // Create WebView bridge
  bridge = std::make_unique<WebViewBridge>(audioProcessor);

  // Create WebView component (JUCE 8 uses default constructor)
  webView = std::make_unique<juce::WebBrowserComponent>();
  addAndMakeVisible(*webView);

  // Set up fallback label (shown if WebView fails)
  fallbackLabel.setText("Loading Stranger Amps from Vercel...",
                        juce::dontSendNotification);
  fallbackLabel.setJustificationType(juce::Justification::centred);
  fallbackLabel.setFont(juce::FontOptions(20.0f));
  fallbackLabel.setColour(juce::Label::textColourId, juce::Colours::white);
  addAndMakeVisible(fallbackLabel);

  // Try to load the web UI
  // Load from Vercel deployment (bypasses file:// CORS issues with JS modules)
  const juce::String vercelURL = "https://stranger-amps-2.vercel.app";

  juce::Logger::writeToLog("=== Stranger Amps WebView Debug ===");
  juce::Logger::writeToLog("Attempting to load: " + vercelURL);

  // Try loading the URL
  webView->goToURL(vercelURL);

  juce::Logger::writeToLog("WebView pointer valid: " +
                           juce::String(webView != nullptr ? "yes" : "no"));

  // Give WebView time to initialize
  juce::MessageManager::callAsync([this]() {
    if (webView != nullptr) {
      juce::Logger::writeToLog("WebView async check - component is valid");
    }
  });

  // Start timer to check WebView status and sync parameters
  startTimer(100); // 10 Hz update rate
}

StrangerAmpsEditor::~StrangerAmpsEditor() { stopTimer(); }

//==============================================================================
void StrangerAmpsEditor::paint(juce::Graphics &g) {
  g.fillAll(juce::Colours::black);

  if (!webViewLoaded) {
    g.setColour(juce::Colours::white);
    g.setFont(15.0f);
    g.drawFittedText("Stranger Amps", getLocalBounds(),
                     juce::Justification::centred, 1);
  }
}

void StrangerAmpsEditor::resized() {
  auto bounds = getLocalBounds();

  if (webView != nullptr)
    webView->setBounds(bounds);

  fallbackLabel.setBounds(bounds);
}

void StrangerAmpsEditor::timerCallback() {
  // Check if WebView has loaded
  if (webView != nullptr && !webViewLoaded) {
    // Simple check - in production you'd want more robust detection
    webViewLoaded = true;
    fallbackLabel.setVisible(false);
  }

  // Sync parameters from processor to WebView
  if (bridge != nullptr && webViewLoaded) {
    bridge->syncParametersToWeb(webView.get());
  }
}
