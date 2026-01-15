#include "PluginEditor.h"
#include "PluginProcessor.h"

//==============================================================================
StrangerAmpsEditor::StrangerAmpsEditor(StrangerAmpsProcessor &p)
    : AudioProcessorEditor(&p), audioProcessor(p) {
  // Set editor size (amp simulator dimensions)
  setSize(1200, 800);

  // Create WebView bridge
  bridge = std::make_unique<WebViewBridge>(audioProcessor);

  // Create WebView component with options
  auto options =
      juce::WebBrowserComponent::Options()
          .withBackend(juce::WebBrowserComponent::Options::Backend::webview2)
#if JUCE_WINDOWS
          .withWinWebView2Options(
              juce::WebBrowserComponent::Options::WinWebView2()
                  .withUserDataFolder(juce::File::getSpecialLocation(
                      juce::File::SpecialLocationType::tempDirectory)))
#endif
          .withNativeIntegrationEnabled()
          .withUserScript(R"(
                          window.JUCE = window.JUCE || {};
                          window.JUCE.postMessage = function(message) {
                              if (typeof message === 'object') {
                                  window.sendMessageToJuce(JSON.stringify(message));
                              } else {
                                  window.sendMessageToJuce(message);
                              }
                          };
                      )")
          .withNativeFunction(
              "sendMessageToJuce",
              [this](const juce::Array<juce::var> &args,
                     juce::WebBrowserComponent::NativeFunctionCompletion
                         completion) {
                if (args.size() > 0 && bridge != nullptr) {
                  // The message should be a JSON string
                  juce::String message = args[0].toString();

                  // We need to run this on the message thread because it might
                  // affect UI/Params
                  juce::MessageManager::callAsync([this, message]() {
                    bridge->handleMessageFromWeb(message);
                  });
                }
                completion(juce::var());
              });

  webView = std::make_unique<juce::WebBrowserComponent>(options);
  addAndMakeVisible(*webView);

  // Set up fallback label (shown if WebView fails)
  fallbackLabel.setText("Loading Stranger Amps from Vercel...",
                        juce::dontSendNotification);
  fallbackLabel.setJustificationType(juce::Justification::centred);
  fallbackLabel.setFont(juce::FontOptions(20.0f));
  fallbackLabel.setColour(juce::Label::textColourId, juce::Colours::white);
  addAndMakeVisible(fallbackLabel);

  // Hide fallback label immediately and ensure WebView is on top
  fallbackLabel.setVisible(false);
  webView->toFront(true);

  // Try to load the web UI
  // Load from local resources for debugging/stability
  // This expects the WebUI folder to be in the App Bundle's Resources on macOS
  juce::File resourcesDir =
      juce::File::getSpecialLocation(juce::File::currentExecutableFile)
          .getParentDirectory() // MacOS
          .getParentDirectory() // Contents
          .getChildFile("Resources")
          .getChildFile("WebUI");

  // Fallback for development (if running from build folder structure)
  if (!resourcesDir.exists()) {
    // Try finding it relative to the source code (helpful for dev)
    // Note: This path might need adjustment based on your specific build dir
    // structure
    resourcesDir =
        juce::File::getSpecialLocation(juce::File::currentExecutableFile)
            .getParentDirectory()
            .getParentDirectory()
            .getParentDirectory()
            .getParentDirectory() // Build/Debug/Standalone
            .getChildFile("Resources")
            .getChildFile("WebUI");
  }

  juce::File indexFile = resourcesDir.getChildFile("index.html");
  juce::String urlToLoad;

  if (indexFile.existsAsFile()) {
    urlToLoad = indexFile.getFullPathName();
    juce::Logger::writeToLog("Loading local file: " + urlToLoad);
  } else {
    // Final fallback to vercel if local fails
    urlToLoad = "https://stranger-amps-2.vercel.app";
    juce::Logger::writeToLog("Local file not found, falling back to: " +
                             urlToLoad);
  }

  juce::Logger::writeToLog("=== Stranger Amps WebView Debug ===");
  juce::Logger::writeToLog("Attempting to load: " + urlToLoad);

  // Try loading the URL
  webView->goToURL(urlToLoad);

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
