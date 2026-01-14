# Stranger Amps - JUCE WebView Plugin

Modern guitar amp simulator plugin built with JUCE 8 and React.

## Features

- 🎸 High-gain amp simulation optimized for extended range guitars (7, 8, 9 strings)
- 🎛️ React-based UI embedded via JUCE WebView
- 🔊 Real-time audio processing with JUCE DSP
- 💾 Preset management and state persistence
- 🎚️ Bidirectional parameter synchronization (DAW ↔ UI)
- 📦 Modern CMake build system with CPM package manager

## Project Structure

```
Djent-Engine-X 2/
├── Source/                    # JUCE C++ code
│   ├── PluginProcessor.cpp/h  # Audio processing
│   ├── PluginEditor.cpp/h     # WebView integration
│   └── WebView/
│       └── WebViewBridge.cpp/h # JS ↔ Native bridge
├── client/                    # React web UI
│   └── src/
│       ├── juce-bridge.ts     # TypeScript JUCE API
│       └── pages/
│           └── amp-simulator.tsx
├── Resources/WebUI/           # Built web assets (generated)
├── CMakeLists.txt             # CMake configuration
└── build-webui.sh             # Web UI build script
```

## Build Instructions

### Prerequisites

- CMake 3.24+
- C++17 compiler (Xcode on macOS, MSVC on Windows)
- Node.js 18+ and npm
- Git

### macOS

```bash
# 1. Build web UI
./build-webui.sh

# 2. Configure CMake project (downloads JUCE via CPM)
cmake -B build -DCMAKE_BUILD_TYPE=Release

# 3. Build plugin
cmake --build build --config Release

# 4. Install to system plugin folder
cmake --install build --config Release
```

The plugin will be installed to:
- **VST3**: `~/Library/Audio/Plug-Ins/VST3/StrangerAmps.vst3`
- **AU**: `~/Library/Audio/Plug-Ins/Components/StrangerAmps.component`

### Windows

```bash
# 1. Build web UI
bash build-webui.sh

# 2. Configure (requires WebView2 runtime)
cmake -B build -G "Visual Studio 17 2022"

# 3. Build
cmake --build build --config Release

# 4. Install
cmake --install build --config Release
```

## Development Workflow

### Web UI Development

For rapid UI iteration, run the React dev server and point the plugin to localhost:

```bash
# Terminal 1: Start dev server
cd client
npm run dev

# Terminal 2: Build plugin in debug mode
cmake -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build
```

In `Source/PluginEditor.cpp`, the debug build automatically points to `http://localhost:5000`.

### Rebuilding After UI Changes

```bash
./build-webui.sh
cmake --build build --config Release
```

### Clean Build

```bash
rm -rf build Resources/WebUI
./build-webui.sh
cmake -B build && cmake --build build
```

## Architecture

### WebView Integration

The plugin embeds the React UI using `juce::WebBrowserComponent` from `juce_gui_extra`:

- **macOS**: WKWebView (native)
- **Windows**: WebView2 (requires runtime)
- **Linux**: WebKitGTK

### Bidirectional Communication

**Native → Web** (Parameter updates from DAW automation):
```cpp
// C++ (WebViewBridge.cpp)
webView->evaluateJavascript("window.JUCE.onParameterUpdate('drive', 0.8)");
```

**Web → Native** (User interaction):
```typescript
// TypeScript (juce-bridge.ts)
sendParameterToJUCE('drive', 0.8);
```

### Parameter Synchronization

All parameters are managed through `AudioProcessorValueTreeState` and automatically synced between:
1. DAW automation
2. Plugin UI (React)
3. Audio processing thread

## Dependencies

Managed automatically by CPM:
- **JUCE 8.0.12**: Audio plugin framework

Web dependencies (npm):
- React 18
- TypeScript
- Vite
- TanStack Query
- Tailwind CSS

## Troubleshooting

### WebView not loading

**macOS**: Check Console.app for WKWebView errors

**Windows**: Ensure WebView2 runtime is installed:
```bash
# Download from: https://developer.microsoft.com/microsoft-edge/webview2/
```

### Parameters not syncing

Check browser console in WebView:
```javascript
// Should see:
[JUCE Bridge] Initialized { isPlugin: true, hasPostMessage: true }
```

### Build errors

```bash
# Clear CMake cache
rm -rf build
rm -rf cmake/CPM_*

# Re-download CPM
rm cmake/CPM.cmake
curl -L https://github.com/cpm-cmake/CPM.cmake/releases/latest/download/CPM.cmake -o cmake/CPM.cmake
```

## License

See LICENSE file for details.
