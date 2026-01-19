# Deploying the webapp to Vercel and viewing it in JUCE

1) Build and test the webapp locally

   - Install deps at repo root:

     ```bash
     npm install
     ```

   - Build the project (this runs the Vite client build and bundles the server):

     ```bash
     npm run build
     ```

   - Confirm the client output is in `dist/public`.

2) Deploy to Vercel

   - Add this repository to Vercel (or run `vercel` from the repo root). The added `vercel.json` config causes Vercel to run `npm run build` and serve `dist/public` as the static site.

3) Configure JUCE to load your hosted URL

   - Open [JUCE/examples/GUI/WebAppDemo.h](JUCE/examples/GUI/WebAppDemo.h) and edit the `defaultWebAppUrl` string to point at your Vercel URL (for example `https://my-app.vercel.app`).

   - Build the JUCE examples (for macOS, use the provided CMake setup under `JUCE/`). You can run the DemoRunner or build the example exporter you prefer. `WebAppDemo` will appear among the GUI examples.

4) Notes and troubleshooting

   - The demo uses `WebBrowserComponent` from `juce_gui_extra`. Ensure `JUCE_WEB_BROWSER` is enabled in your build and that `juce_gui_extra` is included as a dependency.
   - On macOS this uses the system WebKit (WKWebView). Make sure your Xcode SDK supports WKWebView.
   - If you prefer embedding the client as local resources inside a plugin, you can copy the built `dist/public` files into your plugin resources and load via a local file:// URL instead of a remote URL.
