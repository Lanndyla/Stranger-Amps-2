cmake_minimum_required(VERSION 3.24)
project(StrangerAmps VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# CPM Package Manager
include(cmake/CPM.cmake)

# Fetch JUCE framework
CPMAddPackage(
    NAME JUCE
    GITHUB_REPOSITORY juce-framework/JUCE
    GIT_TAG 8.0.12
    VERSION 8.0.12
)

# Plugin configuration
juce_add_plugin(StrangerAmps
    COMPANY_NAME "Stranger Audio"
    PLUGIN_MANUFACTURER_CODE Stgr
    PLUGIN_CODE Samp
    FORMATS VST3 AU Standalone
    PRODUCT_NAME "Stranger Amps"
    NEEDS_WEB_BROWSER TRUE  # Enables juce_gui_extra WebView
    IS_SYNTH FALSE
    NEEDS_MIDI_INPUT FALSE
    NEEDS_MIDI_OUTPUT FALSE
    IS_MIDI_EFFECT FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS TRUE
    COPY_PLUGIN_AFTER_BUILD TRUE
    VST3_CATEGORIES "Fx" "Distortion"
    AU_MAIN_TYPE "kAudioUnitType_Effect"
)

# Source files
target_sources(StrangerAmps
    PRIVATE
        Source/PluginProcessor.cpp
        Source/PluginProcessor.h
        Source/PluginEditor.cpp
        Source/PluginEditor.h
        Source/WebView/WebViewBridge.cpp
        Source/WebView/WebViewBridge.h
)

# Compile definitions
target_compile_definitions(StrangerAmps
    PUBLIC
        JUCE_WEB_BROWSER=1
        JUCE_USE_CURL=0
        JUCE_VST3_CAN_REPLACE_VST2=0
        JUCE_DISPLAY_SPLASH_SCREEN=0
        JUCE_REPORT_APP_USAGE=0
)

# Link JUCE modules
target_link_libraries(StrangerAmps
    PRIVATE
        juce::juce_audio_utils
        juce::juce_dsp
        juce::juce_gui_extra  # WebView support
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags
)

# Copy web assets into app bundle
if(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/Resources/WebUI")
    # Copy WebUI directory to Standalone app bundle Resources
    add_custom_command(TARGET StrangerAmps_Standalone POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory
        "${CMAKE_CURRENT_SOURCE_DIR}/Resources/WebUI"
        "$<TARGET_BUNDLE_DIR:StrangerAmps_Standalone>/Contents/Resources/WebUI"
        COMMENT "Copying WebUI assets to Standalone app bundle"
    )
    
    message(STATUS "WebUI assets will be copied from: ${CMAKE_CURRENT_SOURCE_DIR}/Resources/WebUI")
else()
    message(WARNING "Web UI assets not found at ${CMAKE_CURRENT_SOURCE_DIR}/Resources/WebUI. Run build-webui.sh first.")
endif()
