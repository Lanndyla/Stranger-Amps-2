import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./juce-webview-fix.css"; // Fix for JUCE WebView backdrop-filter issue
import { ErrorBoundary } from "./components/ErrorBoundary";

// Detect JUCE environment and add class to HTML element
if (typeof window !== 'undefined' && (window as any).JUCE) {
    document.documentElement.classList.add('juce-webview');
    console.log('[JUCE] WebView compatibility mode enabled');
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </StrictMode>
);
