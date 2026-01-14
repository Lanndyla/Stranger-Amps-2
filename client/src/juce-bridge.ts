/**
 * JUCE Bridge - TypeScript interface for communication with JUCE plugin
 * 
 * This module provides type-safe communication between the React app
 * and the JUCE native plugin via WebView.
 */

// Extend Window interface to include JUCE API
declare global {
    interface Window {
        JUCE?: {
            // Called by JUCE to update parameter in React
            onParameterUpdate?: (paramId: string, value: number) => void;

            // Called by JUCE to load preset data
            onPresetLoad?: (presetData: any) => void;

            // Send message to JUCE (implemented by WebView)
            postMessage?: (message: JUCEMessage) => void;
        };
    }
}

// Message types for JUCE communication
export type JUCEMessage =
    | { type: 'parameterChange'; paramId: string; value: number }
    | { type: 'presetLoad'; presetName: string }
    | { type: 'presetSave'; presetName: string; presetData: any };

/**
 * Check if running inside JUCE WebView
 */
export function isJUCEPlugin(): boolean {
    return typeof window !== 'undefined' && window.JUCE !== undefined;
}

/**
 * Send parameter change to JUCE native layer
 */
export function sendParameterToJUCE(paramId: string, value: number): void {
    if (!isJUCEPlugin()) {
        console.log('[JUCE Bridge] Not in JUCE environment, skipping parameter update:', paramId, value);
        return;
    }

    const message: JUCEMessage = {
        type: 'parameterChange',
        paramId,
        value
    };

    // Send via postMessage if available
    if (window.JUCE?.postMessage) {
        window.JUCE.postMessage(message);
    } else {
        // Fallback: use JSON string in console (JUCE can intercept console.log)
        console.log('[JUCE_MESSAGE]', JSON.stringify(message));
    }
}

/**
 * Request preset load from JUCE
 */
export function loadPresetFromJUCE(presetName: string): void {
    if (!isJUCEPlugin()) return;

    const message: JUCEMessage = {
        type: 'presetLoad',
        presetName
    };

    if (window.JUCE?.postMessage) {
        window.JUCE.postMessage(message);
    } else {
        console.log('[JUCE_MESSAGE]', JSON.stringify(message));
    }
}

/**
 * Send preset save request to JUCE
 */
export function savePresetToJUCE(presetName: string, presetData: any): void {
    if (!isJUCEPlugin()) return;

    const message: JUCEMessage = {
        type: 'presetSave',
        presetName,
        presetData
    };

    if (window.JUCE?.postMessage) {
        window.JUCE.postMessage(message);
    } else {
        console.log('[JUCE_MESSAGE]', JSON.stringify(message));
    }
}

/**
 * Initialize JUCE bridge
 * Call this in your React app's entry point
 */
export function initializeJUCEBridge(
    onParameterUpdate: (paramId: string, value: number) => void,
    onPresetLoad?: (presetData: any) => void
): void {
    if (typeof window === 'undefined') return;

    // Create JUCE namespace if it doesn't exist
    if (!window.JUCE) {
        window.JUCE = {};
    }

    // Register callbacks
    window.JUCE.onParameterUpdate = onParameterUpdate;

    if (onPresetLoad) {
        window.JUCE.onPresetLoad = onPresetLoad;
    }

    console.log('[JUCE Bridge] Initialized', {
        isPlugin: isJUCEPlugin(),
        hasPostMessage: !!window.JUCE.postMessage
    });
}

/**
 * Cleanup JUCE bridge
 */
export function cleanupJUCEBridge(): void {
    if (typeof window !== 'undefined' && window.JUCE) {
        delete window.JUCE.onParameterUpdate;
        delete window.JUCE.onPresetLoad;
    }
}
