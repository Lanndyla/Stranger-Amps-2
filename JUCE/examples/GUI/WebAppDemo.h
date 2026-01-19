/*
  ==============================================================================

   A tiny JUCE demo component that loads a remote webapp URL using the
   `juce_gui_extra` web browser component. Edit `defaultWebAppUrl` below to
   point at your Vercel deployment.

  ==============================================================================
*/

#pragma once

#if JUCE_WEB_BROWSER

#include "../Assets/DemoUtilities.h"

//==============================================================================
// BEGIN_JUCE_PIP_METADATA

// name:             WebAppDemo
// version:          1.0.0
// vendor:           Local
// description:      Loads a hosted webapp URL in a WebBrowserComponent.
// dependencies:     juce_core, juce_data_structures, juce_events, juce_graphics,
//                   juce_gui_basics, juce_gui_extra
// exporters:        xcode_mac, vs2022, linux_make, androidstudio
// type:             Component
// mainClass:        WebAppDemo
// useLocalCopy:     1

// END_JUCE_PIP_METADATA

//==============================================================================
class WebAppDemo final : public Component
{
public:
    WebAppDemo()
    {
        setOpaque (true);

        // Resolve the URL from a bundled resource first, then fall back to the
        // CMake-injected `WEBAPP_URL` macro, then to a hardcoded production URL.
        String defaultWebAppUrl;

        // The demo's bundled resources are placed into the app bundle's
        // "Resources" folder by the DemoRunner CMake setup. Try to read a
        // simple text file `webapp_url.txt` if present.
        {
            auto resourcesFolder = File::getSpecialLocation (File::currentExecutableFile)
                                       .getParentDirectory().getSiblingFile ("Resources");

            if (resourcesFolder.exists())
            {
                auto urlFile = resourcesFolder.getChildFile ("webapp_url.txt");
                if (urlFile.existsAsFile())
                    defaultWebAppUrl = urlFile.loadFileAsString().trim();
            }
        }

#if defined(WEBAPP_URL)
        if (defaultWebAppUrl.isEmpty())
            defaultWebAppUrl = String (WEBAPP_URL);
#endif

        if (defaultWebAppUrl.isEmpty())
            defaultWebAppUrl = "https://stranger-amps-2.vercel.app";

        addAndMakeVisible (addressTextBox);
        addressTextBox.setText (defaultWebAppUrl, dontSendNotification);

        browser.reset (new WebBrowserComponent());
        addAndMakeVisible (browser.get());

        addAndMakeVisible (goButton);
        goButton.onClick = [this] { browser->goToURL (addressTextBox.getText()); };

        addAndMakeVisible (backButton);
        backButton.onClick = [this] { browser->goBack(); };

        addAndMakeVisible (forwardButton);
        forwardButton.onClick = [this] { browser->goForward(); };

        browser->goToURL (defaultWebAppUrl);

        setSize (1000, 700);
    }

    void paint (Graphics& g) override
    {
        g.fillAll (getUIColourIfAvailable (LookAndFeel_V4::ColourScheme::UIColour::windowBackground,
                                           Colours::grey));
    }

    void resized() override
    {
        browser->setBounds (10, 45, getWidth() - 20, getHeight() - 55);
        goButton      .setBounds (getWidth() - 45, 10, 35, 25);
        addressTextBox.setBounds (100, 10, getWidth() - 155, 25);
        backButton    .setBounds (10, 10, 35, 25);
        forwardButton .setBounds (55, 10, 35, 25);
    }

private:
    std::unique_ptr<WebBrowserComponent> browser;
    TextEditor addressTextBox;
    TextButton goButton      { "Go", "Go to URL" },
               backButton    { "<<", "Back" },
               forwardButton { ">>", "Forward" };

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (WebAppDemo)
};

#endif
