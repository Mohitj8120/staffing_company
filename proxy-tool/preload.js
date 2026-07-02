const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimize: () => ipcRenderer.invoke('minimize-window'),
    close: () => ipcRenderer.invoke('close-window'),
    togglePin: () => ipcRenderer.invoke('toggle-pin'),

    // Settings
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    checkDemo: () => ipcRenderer.invoke('check-demo'),
    markDemoUsed: () => ipcRenderer.invoke('mark-demo-used'),

    // AI Chat (OpenAI gpt-4o-mini with streaming)
    aiChat: (payload) => ipcRenderer.invoke('ai-chat', payload),
    onAiStreamChunk: (callback) => {
        const handler = (event, chunk) => callback(chunk);
        ipcRenderer.on('ai-stream-chunk', handler);
        return () => ipcRenderer.removeListener('ai-stream-chunk', handler);
    },
    onAiStreamEnd: (callback) => {
        const handler = () => callback();
        ipcRenderer.on('ai-stream-end', handler);
        return () => ipcRenderer.removeListener('ai-stream-end', handler);
    },

    // Deepgram Streaming Transcription
    startDeepgram: (payload) => ipcRenderer.invoke('start-deepgram', payload || {}),
    sendAudioChunk: (payload) => ipcRenderer.invoke('send-audio-chunk', payload),
    stopDeepgram: () => ipcRenderer.invoke('stop-deepgram'),
    onDeepgramPartial: (callback) => {
        const handler = (event, text) => callback(text);
        ipcRenderer.on('deepgram-partial', handler);
        return () => ipcRenderer.removeListener('deepgram-partial', handler);
    },
    onDeepgramFinal: (callback) => {
        const handler = (event, text) => callback(text);
        ipcRenderer.on('deepgram-final', handler);
        return () => ipcRenderer.removeListener('deepgram-final', handler);
    },
    onUtteranceEnd: (callback) => {
        const handler = () => callback();
        ipcRenderer.on('utterance-end', handler);
        return () => ipcRenderer.removeListener('utterance-end', handler);
    },

    // Screen Analysis (OpenAI Vision)
    captureScreen: () => ipcRenderer.invoke('capture-screen'),
    analyzeScreen: (params) => ipcRenderer.invoke('analyze-screen', params),

    // Window control
    resizeWindow: (params) => ipcRenderer.invoke('resize-window', params),

    // Resume Parsing
    parseResume: (payload) => ipcRenderer.invoke('parse-resume', payload),

    // App Logging
    log: (level, message, ...args) => ipcRenderer.invoke('log-message', { level, message, args }),
    onAppLog: (callback) => {
        const handler = (event, logEntry) => callback(logEntry);
        ipcRenderer.on('app-log', handler);
        return () => ipcRenderer.removeListener('app-log', handler);
    },

    // Desktop sources for system audio capture
    getDesktopSources: () => ipcRenderer.invoke('get-desktop-sources'),

    // ═══════════════════════════════════════════════════════════════════
    //  PHANTOM ENGINE — Stealth API
    // ═══════════════════════════════════════════════════════════════════

    // Ghost Mode — click-through overlay (prevents tab-switch detection)
    toggleGhost: () => ipcRenderer.invoke('toggle-ghost'),
    onGhostModeChanged: (callback) => {
        const handler = (event, enabled) => callback(enabled);
        ipcRenderer.on('ghost-mode-changed', handler);
        return () => ipcRenderer.removeListener('ghost-mode-changed', handler);
    },

    // Ghost Mode hover — temporarily allow mouse interaction
    setIgnoreMouse: (ignore) => ipcRenderer.send('set-ignore-mouse', ignore),

    // Panic Hide — instant emergency disappearance
    panicHide: () => ipcRenderer.invoke('panic-hide'),
    onPanicTriggered: (callback) => {
        const handler = () => callback();
        ipcRenderer.on('panic-triggered', handler);
        return () => ipcRenderer.removeListener('panic-triggered', handler);
    },

    // Stealth Status
    getStealthStatus: () => ipcRenderer.invoke('get-stealth-status'),

    // Session tracking
    setSessionActive: (active) => ipcRenderer.invoke('set-session-active', active),

    // Ghost opacity control
    setGhostOpacity: (opacity) => ipcRenderer.invoke('set-ghost-opacity', opacity),

    // Quick capture hotkey listener
    onQuickCapture: (callback) => {
        const handler = () => callback();
        ipcRenderer.on('quick-capture', handler);
        return () => ipcRenderer.removeListener('quick-capture', handler);
    },

    // Answer scroll hotkey listener
    onScrollAnswer: (callback) => {
        const handler = (event, direction) => callback(direction);
        ipcRenderer.on('scroll-answer', handler);
        return () => ipcRenderer.removeListener('scroll-answer', handler);
    },

    // Google Sign-In
    startGoogleSignIn: () => ipcRenderer.invoke('start-google-sign-in'),
    cancelGoogleSignIn: () => ipcRenderer.invoke('cancel-google-sign-in'),
    onGoogleSignInSuccess: (callback) => {
        const handler = (event, profile) => callback(profile);
        ipcRenderer.on('google-signin-success', handler);
        return () => ipcRenderer.removeListener('google-signin-success', handler);
    },
    onGoogleSignInError: (callback) => {
        const handler = (event, errorMessage) => callback(errorMessage);
        ipcRenderer.on('google-signin-error', handler);
        return () => ipcRenderer.removeListener('google-signin-error', handler);
    },
    openExternalLink: (url) => ipcRenderer.invoke('open-external-link', url)
});
