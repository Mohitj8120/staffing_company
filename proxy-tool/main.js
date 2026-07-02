// ═══════════════════════════════════════════════════════════════════════
//  PROXY TOOL v3.0 — PHANTOM ENGINE
//  Advanced Stealth AI Interview Copilot
// ═══════════════════════════════════════════════════════════════════════
const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, nativeImage, desktopCapturer, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || '';

// ─── Simple JSON Settings Store ──────────────────────────────────────────
class SimpleStore {
    constructor(defaults) {
        this.defaults = defaults;
        this.filePath = path.join(app.getPath('userData'), 'settings.json');
        this.data = { ...defaults };
        this._load();
    }
    _load() {
        try {
            if (fs.existsSync(this.filePath)) {
                const raw = fs.readFileSync(this.filePath, 'utf-8');
                this.data = { ...this.defaults, ...JSON.parse(raw) };
            }
        } catch (e) { this.data = { ...this.defaults }; }
    }
    _save() {
        try {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
        } catch (e) { console.error('Failed to save settings:', e); }
    }
    get(key) { return this.data[key] !== undefined ? this.data[key] : this.defaults[key]; }
    set(key, value) { this.data[key] = value; this._save(); }
}

// ─── App Logger ─────────────────────────────────────────────────────────
const logFile = path.join(app.getPath('userData'), 'proxy-tool-debug.log');
function appLog(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.length ? JSON.stringify(args) : '';
    const formatted = `[${timestamp}] [${level.toUpperCase()}] ${message} ${formattedArgs}\n`;
    
    // Explicit console logs for the user's terminal
    if (level === 'error') console.error(formatted.trim());
    else if (level === 'warn') console.warn(formatted.trim());
    else console.log(formatted.trim());

    try { fs.appendFileSync(logFile, formatted); } catch (e) {}
}

let store;
let mainWindow = null;
let floatingWindow = null;
let tray = null;
let isVisible = true;
const isDev = !app.isPackaged;

// ═══ PHANTOM ENGINE STATE ═══
let ghostMode = false;
let sessionActive = false;
let ghostOpacity = 0.45;
const GHOST_OPACITY = 0.45;
const NORMAL_OPACITY = 0.95;

// ═══════════════════════════════════════════════════════════════════════
//  PHANTOM ENGINE — Ghost Mode & Stealth Core
// ═══════════════════════════════════════════════════════════════════════

function enableGhostMode() {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    ghostMode = true;
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setOpacity(GHOST_OPACITY);
    applyContentProtection(mainWindow);
    mainWindow.webContents.send('ghost-mode-changed', true);
    appLog('info', 'PHANTOM: Ghost Mode ENABLED');
}

function disableGhostMode() {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    ghostMode = false;
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.setOpacity(store?.get('opacity') || NORMAL_OPACITY);
    mainWindow.webContents.send('ghost-mode-changed', false);
    appLog('info', 'PHANTOM: Ghost Mode DISABLED');
}

function toggleGhostMode() {
    if (ghostMode) disableGhostMode(); else enableGhostMode();
    return ghostMode;
}

function panicHide() {
    appLog('warn', 'PHANTOM: PANIC HIDE activated');
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('panic-triggered');
        mainWindow.hide();
    }
    destroyFloatingWindow();
    isVisible = false;
    ghostMode = false;
}

function getStealthStatus() {
    return {
        ghostMode, sessionActive, isVisible,
        contentProtection: true,
        processHidden: !isDev,
        taskbarHidden: true,
        windowType: 'toolbar'
    };
}

// Ghost Mode mouse forwarding — allow hover interaction
ipcMain.on('set-ignore-mouse', (event, ignore) => {
    if (!mainWindow || mainWindow.isDestroyed() || !ghostMode) return;
    if (ignore) {
        mainWindow.setIgnoreMouseEvents(true, { forward: true });
    } else {
        mainWindow.setIgnoreMouseEvents(false);
    }
});

// ─── Content Protection ─────────────────────────────────────────────────
function applyContentProtection(win) {
    if (!win || win.isDestroyed()) return;
    try { win.setContentProtection(true); } catch (e) {}
}

// ─── Floating Restore Icon ──────────────────────────────────────────────
function createFloatingWindow() {
    if (floatingWindow && !floatingWindow.isDestroyed()) return;
    
    const display = screen.getPrimaryDisplay();
    const { width: screenW, height: screenH } = display.workAreaSize;
    
    floatingWindow = new BrowserWindow({
        width: 48,
        height: 48,
        x: screenW - 70,
        y: screenH - 100,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        focusable: false,
        type: 'toolbar',
        hasShadow: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            sandbox: false
        }
    });

    floatingWindow.setContentProtection(true);
    
    const htmlContent = `
    <!DOCTYPE html>
    <html><head><style>
        * { margin:0; padding:0; }
        html, body { background: transparent; overflow: hidden; }
        .float-btn {
            width: 44px; height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981, #06d6a0);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(16,185,129,0.4);
            transition: transform 0.2s, box-shadow 0.2s;
            animation: pulse-float 2s infinite;
            -webkit-app-region: drag;
        }
        .float-btn:hover {
            transform: scale(1.15);
            box-shadow: 0 6px 30px rgba(16,185,129,0.6);
        }
        .float-btn span {
            font-size: 20px; font-weight: 800; color: #0a0a12;
            user-select: none; pointer-events: none;
        }
        @keyframes pulse-float {
            0%,100% { box-shadow: 0 4px 20px rgba(16,185,129,0.4); }
            50% { box-shadow: 0 4px 30px rgba(16,185,129,0.7); }
        }
    </style></head><body>
        <div class="float-btn" id="btn"><span>P</span></div>
        <script>
            const { ipcRenderer } = require("electron");
            const btn = document.getElementById("btn");
            // Also enable single click
            btn.addEventListener("click", () => {
                ipcRenderer.send("restore-main");
            });
            btn.addEventListener("dblclick", () => {
                ipcRenderer.send("restore-main");
            });
            btn.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                ipcRenderer.send("quit-app-from-floating");
            });
            
            // Allow dragging without dev tools stealing focus, but a mouseup that isn't a long drag triggers click
        </script>
    </body></html>`;
    
    floatingWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
    
    // Double click on the floating icon restores main window
    floatingWindow.on('closed', () => { floatingWindow = null; });
    
    // We now rely on IPC from click
    
    // Safety fallback
    floatingWindow.on('focus', () => {
        showMainWindow();
    });
}

function destroyFloatingWindow() {
    if (floatingWindow && !floatingWindow.isDestroyed()) {
        floatingWindow.destroy();
        floatingWindow = null;
    }
}

function showMainWindow() {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
        mainWindow.setSkipTaskbar(true);
        mainWindow.focus();
        isVisible = true;
        destroyFloatingWindow();
    }
}

ipcMain.on('restore-main', () => {
    showMainWindow();
});

ipcMain.on('quit-app-from-floating', () => {
    app.exit(0);
});

// ─── Main Window ────────────────────────────────────────────────────────
function createWindow() {
    const bounds = store.get('windowBounds');

    mainWindow = new BrowserWindow({
        width: bounds?.width || 520,
        height: bounds?.height || 600,
        x: bounds?.x,
        y: bounds?.y,
        minWidth: 420,
        minHeight: 50,
        frame: false,
        transparent: true,
        resizable: true,
        alwaysOnTop: store.get('alwaysOnTop') || false,
        skipTaskbar: true,
        hasShadow: false,
        type: 'toolbar',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        },
        icon: path.join(__dirname, 'assets', 'icon.png'),
        show: false,
        backgroundColor: '#00000000'
    });

    // Permission handlers
    mainWindow.webContents.session.setPermissionRequestHandler((wc, permission, callback) => {
        callback(['media', 'mediaKeySystem', 'display-capture', 'audioCapture'].includes(permission));
    });
    mainWindow.webContents.session.setPermissionCheckHandler((wc, permission) => {
        return ['media', 'mediaKeySystem', 'display-capture', 'audioCapture'].includes(permission);
    });

    mainWindow.setAlwaysOnTop(true, 'screen-saver');

    mainWindow.setOpacity(0.95);

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.setSkipTaskbar(true);
        applyContentProtection(mainWindow);
    });

    // Focus Guard — auto-blur in ghost mode to prevent tab-switch detection
    mainWindow.on('focus', () => {
        applyContentProtection(mainWindow);
        if (ghostMode && sessionActive) {
            mainWindow.blur();
            appLog('info', 'PHANTOM: Focus Guard — auto-blurred');
        }
    });
    mainWindow.on('restore', () => {
        applyContentProtection(mainWindow);
        destroyFloatingWindow();
        isVisible = true;
    });

    // Show floating icon when minimized
    mainWindow.on('minimize', () => {
        isVisible = false;
        createFloatingWindow();
    });

    mainWindow.on('hide', () => {
        isVisible = false;
        createFloatingWindow();
    });

    mainWindow.on('show', () => {
        isVisible = true;
        destroyFloatingWindow();
    });

    mainWindow.on('moved', () => {
        // Don't save bounds — we always center on launch
    });
    mainWindow.on('resized', () => {
        // Don't save bounds
    });
    mainWindow.on('closed', () => { 
        mainWindow = null;
        app.exit(0);
    });
}

// ─── System Tray ────────────────────────────────────────────────────────
function createTray() {
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    const trayIcon = fs.existsSync(iconPath)
        ? nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
        : nativeImage.createEmpty();
    tray = new Tray(trayIcon);
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show/Hide', click: () => toggleVisibility() },
        { label: 'Always on Top', type: 'checkbox', checked: store.get('alwaysOnTop'),
          click: (mi) => { store.set('alwaysOnTop', mi.checked); if (mainWindow) mainWindow.setAlwaysOnTop(mi.checked); }
        },
        { type: 'separator' },
        { label: 'Quit', click: () => { app.exit(0); } }
    ]);
    tray.setToolTip('Garuda');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => toggleVisibility());
}

function toggleVisibility() {
    if (!mainWindow) return;
    if (isVisible) {
        mainWindow.hide();
        isVisible = false;
        createFloatingWindow();
    } else {
        showMainWindow();
    }
}

// ─── Global Shortcuts (Phantom Engine Enhanced) ─────────────────────────
function registerShortcuts() {
    // Toggle visibility
    globalShortcut.register('Ctrl+Shift+H', () => toggleVisibility());
    // Toggle always on top
    globalShortcut.register('Ctrl+Shift+T', () => {
        const current = store.get('alwaysOnTop');
        store.set('alwaysOnTop', !current);
        if (mainWindow) mainWindow.setAlwaysOnTop(!current);
    });
    // Minimize to floating icon
    globalShortcut.register('Ctrl+Shift+X', () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.hide();
            isVisible = false;
            createFloatingWindow();
        }
    });
    // ═══ PHANTOM SHORTCUTS ═══
    // Ghost Mode toggle
    globalShortcut.register('Ctrl+Shift+G', () => {
        toggleGhostMode();
    });
    // Panic Hide — total disappearance
    globalShortcut.register('Ctrl+Shift+Q', () => {
        panicHide();
    });
    // Quick Screen Capture & Analyze
    globalShortcut.register('Ctrl+Shift+S', () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('quick-capture');
        }
    });
    // Scroll answer up/down in ghost mode
    globalShortcut.register('Ctrl+Shift+Up', () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('scroll-answer', 'up');
        }
    });
    globalShortcut.register('Ctrl+Shift+Down', () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('scroll-answer', 'down');
        }
    });
    // Increase/decrease ghost opacity
    globalShortcut.register('Ctrl+Shift+Plus', () => {
        if (ghostMode && mainWindow && !mainWindow.isDestroyed()) {
            ghostOpacity = Math.min(0.95, ghostOpacity + 0.1);
            mainWindow.setOpacity(ghostOpacity);
        }
    });
    globalShortcut.register('Ctrl+Shift+-', () => {
        if (ghostMode && mainWindow && !mainWindow.isDestroyed()) {
            ghostOpacity = Math.max(0.15, ghostOpacity - 0.1);
            mainWindow.setOpacity(ghostOpacity);
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════
//  IPC HANDLERS
// ═══════════════════════════════════════════════════════════════════════

ipcMain.handle('get-settings', () => ({
    opacity: store.get('opacity'),
    fontSize: store.get('fontSize'),
    language: store.get('language'),
    model: store.get('model'),
    alwaysOnTop: store.get('alwaysOnTop')
}));

ipcMain.handle('save-settings', (event, settings) => {
    Object.entries(settings).forEach(([key, value]) => store.set(key, value));
    if (settings.opacity !== undefined && mainWindow) mainWindow.setOpacity(settings.opacity);
    if (settings.alwaysOnTop !== undefined && mainWindow) mainWindow.setAlwaysOnTop(settings.alwaysOnTop);
    return true;
});

ipcMain.handle('open-external-link', async (event, url) => {
    const { shell } = require('electron');
    await shell.openExternal(url);
    return true;
});

ipcMain.handle('check-demo', () => {
    try {
        if (store.get('guestDemoUsed')) return true;
        const pd = process.env.ALLUSERSPROFILE || 'C:\\ProgramData';
        if (fs.existsSync(path.join(pd, 'Microsoft', 'Windows', '.pt_sys_lock'))) return true;
        if (fs.existsSync(path.join(app.getPath('userData'), '..', '.pt_sys_lock'))) return true;
        return false;
    } catch(e) { return false; }
});

ipcMain.handle('mark-demo-used', () => {
    store.set('guestDemoUsed', true);
    try {
        const pd = process.env.ALLUSERSPROFILE || 'C:\\ProgramData';
        const msDir = path.join(pd, 'Microsoft', 'Windows');
        if (!fs.existsSync(msDir)) fs.mkdirSync(msDir, { recursive: true });
        fs.writeFileSync(path.join(msDir, '.pt_sys_lock'), '1');
    } catch(e) {}
    try {
        fs.writeFileSync(path.join(app.getPath('userData'), '..', '.pt_sys_lock'), '1');
    } catch(e) {}
});

ipcMain.handle('minimize-window', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.hide();
        isVisible = false;
        createFloatingWindow();
    }
});

ipcMain.handle('close-window', () => {
    app.exit(0);
});

ipcMain.handle('toggle-pin', () => {
    const current = store.get('alwaysOnTop');
    store.set('alwaysOnTop', !current);
    if (mainWindow) mainWindow.setAlwaysOnTop(!current);
    return !current;
});

ipcMain.handle('log-message', (event, { level, message, args }) => {
    appLog(level, message, ...(args || []));
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('app-log', { level, message, args, timestamp: new Date().toLocaleTimeString() });
    }
});

// ═══ PHANTOM ENGINE IPC HANDLERS ═══
ipcMain.handle('toggle-ghost', () => {
    return toggleGhostMode();
});

ipcMain.handle('panic-hide', () => {
    panicHide();
});

ipcMain.handle('get-stealth-status', () => {
    return getStealthStatus();
});

ipcMain.handle('set-session-active', (event, active) => {
    sessionActive = active;
    appLog('info', `PHANTOM: Session ${active ? 'STARTED' : 'ENDED'}`);
    if (!active && ghostMode) disableGhostMode();
});

ipcMain.handle('set-ghost-opacity', (event, opacity) => {
    ghostOpacity = Math.max(0.15, Math.min(0.95, opacity));
    if (ghostMode && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setOpacity(ghostOpacity);
    }
});

// ─── Window Resize (Parakeet expand/collapse) ───────────────
ipcMain.handle('resize-window', (event, { width, height, position }) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
        const [currentW, currentH] = mainWindow.getSize();
        const targetW = width || currentW;
        const targetH = height || currentH;

        mainWindow.setResizable(true);
        mainWindow.setSize(targetW, targetH, true);
        
        if (position === 'topCenter') {
            const { screen } = require('electron');
            const primaryDisplay = screen.getPrimaryDisplay();
            const { width: screenWidth } = primaryDisplay.workAreaSize;
            mainWindow.setPosition(Math.round((screenWidth - targetW) / 2), 0, true);
            mainWindow.setAlwaysOnTop(true, 'screen-saver'); // Force top
            mainWindow.setResizable(false);
        } else if (position === 'center') {
            mainWindow.center();
            const alwaysOnTopSetting = store.get('alwaysOnTop') || false;
            mainWindow.setAlwaysOnTop(alwaysOnTopSetting);
            mainWindow.setResizable(true);
        } else if (position === 'toolbar-dropdown') {
            // Keep at top, just expand height
            mainWindow.setResizable(false);
        }
    }
});

// ─── AI Chat (OpenAI gpt-4o-mini with Streaming) ────────────────────────
ipcMain.handle('ai-chat', async (event, { messages, resumeText, position, company, instructions }) => {
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const latestUserMsg = messages.filter(m => m.role === 'user').pop();
    const questionText = latestUserMsg?.content || '';
    appLog('info', `AI Chat: "${questionText.substring(0, 60)}" for ${position} @ ${company}`);

    // Full, detailed system prompt with complete resume
    const systemPrompt = `You are a real human candidate participating in a live interview.
Position: ${position || 'General Candidate'}
Company: ${company || 'Company'}
${instructions ? `Special Instructions: ${instructions}` : ''}
${resumeText ? `\nMy Resume:\n${resumeText}` : ''}

CRITICAL RULES FOR RESPONDING:
- Speak EXACTLY like a normal, highly skilled human professional. Be authentic, conversational, and direct.
- DO NOT sound like an AI, a textbook, or someone reading off a script. Avoid generic AI phrases and repetitive structures.
- Use the first person natively ("I built", "In my experience").
- STRICT WORD LIMIT: Keep your answers under 120 words. Be sharp and straight to the point.
- For coding questions, provide the practical solution and code directly, without long theoretical introductions.
- NEVER start your response with "Sure", "Certainly", or "Here is my answer". Just start talking naturally.
- Think and respond like a real person trying to impress an interviewer naturally.`;

    const finalMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
    ];

    try {
        const stream = await openai.chat.completions.create({
            model: store.get('model') || 'gpt-4o-mini',
            messages: finalMessages,
            temperature: 0.7,
            max_tokens: 220, // Strict limit to ensure brevity (~120 words max)
            stream: true
        });

        let fullResponse = '';
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                fullResponse += content;
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('ai-stream-chunk', content);
                }
            }
        }
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('ai-stream-end');
        }
        return fullResponse;
    } catch (err) {
        appLog('error', `OpenAI Chat Error: ${err.message}`);
        throw new Error(`OpenAI Error: ${err.message}`);
    }
});

// ─── Deepgram Streaming Transcription (WebSocket) ───────────────────────
let deepgramWs = null;

ipcMain.handle('start-deepgram', async (event, { language }) => {
    const WebSocket = require('ws');
    
    // Clean up any existing connection safely
    if (deepgramWs) {
        try {
            deepgramWs.removeAllListeners();
            if (deepgramWs.readyState === WebSocket.OPEN) {
                deepgramWs.send(JSON.stringify({ type: 'CloseStream' }));
                deepgramWs.close();
            } else if (deepgramWs.readyState === WebSocket.CONNECTING) {
                // Can't close a CONNECTING socket — let it open then close
                deepgramWs.on('open', () => { try { deepgramWs.close(); } catch(e){} });
            }
        } catch (e) {}
        deepgramWs = null;
    }

    const lang = language || store.get('language') || 'en';
    // Exact Deepgram dashboard settings from user
    const url = `wss://api.deepgram.com/v1/listen?` + [
        'encoding=linear16',
        'sample_rate=16000',
        'channels=1',
        `language=${lang}`,
        'model=nova-2',
        'punctuate=true',
        'smart_format=true',
        'interim_results=true',
        'utterance_end_ms=2500',
        'endpointing=999'
    ].join('&');

    appLog('info', `Deepgram: Connecting (lang=${lang})...`);

    return new Promise((resolve, reject) => {
        const ws = new WebSocket(url, {
            headers: { 'Authorization': `Token ${DEEPGRAM_API_KEY}` }
        });

        ws.on('open', () => {
            deepgramWs = ws;
            appLog('info', 'Deepgram: WebSocket connected ✓');
            resolve(true);
        });

        ws.on('message', (rawData) => {
            try {
                const msg = JSON.parse(rawData.toString());
                if (!mainWindow || mainWindow.isDestroyed()) return;

                // Forward UtteranceEnd event (interviewer paused for 2.5s)
                if (msg.type === 'UtteranceEnd') {
                    appLog('info', 'Deepgram: UtteranceEnd (2.5s pause detected)');
                    mainWindow.webContents.send('utterance-end');
                    return;
                }

                if (msg.type === 'Results' && msg.channel?.alternatives?.length > 0) {
                    const transcript = msg.channel.alternatives[0].transcript;
                    
                    if (transcript && transcript.trim().length > 0) {
                        if (msg.is_final) {
                            appLog('info', `Deepgram FINAL (speech_final=${msg.speech_final}): "${transcript}"`);
                            mainWindow.webContents.send('deepgram-final', {
                                channel: msg.channel,
                                is_final: msg.is_final,
                                speech_final: msg.speech_final
                            });
                        } else {
                            mainWindow.webContents.send('deepgram-partial', {
                                channel: msg.channel
                            });
                        }
                    }
                }
            } catch (e) {}
        });

        ws.on('error', (err) => {
            appLog('error', `Deepgram WS error: ${err.message}`);
            if (deepgramWs === ws) deepgramWs = null;
            reject(err);
        });

        ws.on('close', (code) => {
            appLog('info', `Deepgram: Disconnected (code=${code})`);
            if (deepgramWs === ws) deepgramWs = null;
        });

        // Timeout
        setTimeout(() => {
            if (ws.readyState === WebSocket.CONNECTING) {
                ws.removeAllListeners();
                try { ws.terminate(); } catch(e) {}
                if (deepgramWs === ws) deepgramWs = null;
                reject(new Error('Deepgram connection timeout (15s)'));
            }
        }, 15000);
    });
});

ipcMain.handle('send-audio-chunk', (event, { pcmData }) => {
    if (deepgramWs && deepgramWs.readyState === 1) {
        deepgramWs.send(Buffer.from(pcmData));
    }
});

ipcMain.handle('stop-deepgram', () => {
    appLog('info', 'Deepgram: Stop requested');
    if (deepgramWs) {
        const ws = deepgramWs;
        deepgramWs = null;
        try {
            ws.removeAllListeners();
            if (ws.readyState === 1) { // OPEN
                ws.send(JSON.stringify({ type: 'CloseStream' }));
                ws.close();
            } else if (ws.readyState === 0) { // CONNECTING
                ws.on('open', () => { try { ws.close(); } catch(e){} });
            }
        } catch (e) {}
    }
});

// ─── Screen Capture & Analysis (OpenAI Vision) ─────────────────────────
ipcMain.handle('capture-screen', async () => {
    try {
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 }
        });
        
        if (sources.length === 0) throw new Error('No screen sources found');
        
        const screenshot = sources[0].thumbnail;
        const base64 = screenshot.toJPEG(80).toString('base64');
        return base64;
    } catch (err) {
        appLog('error', `Screen capture error: ${err.message}`);
        throw new Error(`Screen capture failed: ${err.message}`);
    }
});

ipcMain.handle('analyze-screen', async (event, { base64Image, base64Images, context }) => {
    appLog('info', `Analyze Screen request received`);
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    try {
        const imageContents = [];
        if (base64Images && Array.isArray(base64Images)) {
            base64Images.forEach(img => {
                imageContents.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${img}`, detail: 'high' } });
            });
        } else if (base64Image) {
            imageContents.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'high' } });
        }

        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert interview assistant. Analyse the screen content shown in the image(s). 
If it contains code problems, provide the solution with explanation.
If it contains interview questions, provide detailed answers.
If it contains a coding editor, read the problem and provide the optimal solution.
${context || ''}
Be concise but thorough. Format code properly with language tags.`
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analyze this screen(s) and provide the answer/solution:' },
                        ...imageContents
                    ]
                }
            ],
            max_tokens: 3000,
            stream: true
        });

        let fullResponse = '';
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                fullResponse += content;
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('ai-stream-chunk', content);
                }
            }
        }
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('ai-stream-end');
        }
        return fullResponse;
    } catch (err) {
        appLog('error', `Screen analysis error: ${err.message}`);
        throw new Error(`Screen analysis failed: ${err.message}`);
    }
});

// ─── Desktop Sources (for system audio) ─────────────────────────────────
ipcMain.handle('get-desktop-sources', async () => {
    try {
        const sources = await desktopCapturer.getSources({
            types: ['screen', 'window'],
            thumbnailSize: { width: 0, height: 0 }
        });
        return sources.map(s => ({ id: s.id, name: s.name, displayId: s.display_id }));
    } catch (err) { return []; }
});

// ─── Resume Parsing ─────────────────────────────────────────────────────
ipcMain.handle('parse-resume', async (event, { filePath, buffer }) => {
    const pdfParse = require('pdf-parse');
    try {
        let dataBuffer;
        if (buffer) {
            dataBuffer = Buffer.from(buffer);
        } else {
            dataBuffer = fs.readFileSync(filePath);
        }
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (err) {
        throw new Error(`PDF Parse Error: ${err.message}`);
    }
});

// ─── Google OAuth 2.0 Loopback Server ───────────────────────────────────
const http = require('http');
const url = require('url');

let oauthServer = null;

function getOAuthResponseHTML(isSuccess, message) {
    const title = isSuccess ? 'Sign In Successful' : 'Sign In Failed';
    const statusColor = isSuccess ? '#10b981' : '#ef4444';
    const glowColor = isSuccess ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)';
    const icon = isSuccess 
        ? `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
        : `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${statusColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Garuda Authentication</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg: #09090e;
                --card-bg: rgba(18, 18, 28, 0.7);
                --border: rgba(255, 255, 255, 0.08);
                --text-main: #f3f4f6;
                --text-secondary: #9ca3af;
            }
            body {
                margin: 0;
                padding: 0;
                background-color: var(--bg);
                color: var(--text-main);
                font-family: 'Outfit', sans-serif;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                position: relative;
            }
            .ambient-glow {
                position: absolute;
                width: 400px;
                height: 400px;
                border-radius: 50%;
                background: radial-gradient(circle, ${glowColor} 0%, rgba(9,9,14,0) 70%);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1;
                filter: blur(40px);
                animation: pulse 4s infinite alternate;
            }
            .card {
                background: var(--card-bg);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid var(--border);
                border-radius: 24px;
                padding: 40px;
                width: 90%;
                max-width: 420px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255,255,255,0.1);
                z-index: 2;
                transform: translateY(20px);
                animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .icon-wrapper {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid var(--border);
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px auto;
                box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            }
            h1 {
                font-size: 28px;
                font-weight: 800;
                margin: 0 0 12px 0;
                letter-spacing: -0.5px;
                background: linear-gradient(135deg, #ffffff 0%, var(--text-secondary) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .message {
                font-size: 16px;
                color: var(--text-secondary);
                line-height: 1.6;
                margin: 0 0 28px 0;
            }
            .message strong {
                color: var(--text-main);
                font-weight: 600;
            }
            .instruction {
                font-size: 14px;
                color: var(--text-secondary);
                background: rgba(255, 255, 255, 0.02);
                border: 1px dashed var(--border);
                padding: 12px;
                border-radius: 12px;
                display: inline-block;
                width: 100%;
                box-sizing: border-box;
            }
            @keyframes pulse {
                0% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.8; }
                100% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
            }
            @keyframes slideUp {
                to { transform: translateY(0); opacity: 1; }
            }
        </style>
    </head>
    <body>
        <div class="ambient-glow"></div>
        <div class="card">
            <div class="icon-wrapper">
                ${icon}
            </div>
            <h1>${title}</h1>
            <p class="message">${message}</p>
            <div class="instruction">
                ${isSuccess ? 'You can close this tab and return to the Garuda application.' : 'Please return to the application and try signing in again.'}
            </div>
        </div>
    </body>
    </html>
    `;
}

function closeOAuthServer(immediate = false) {
    if (oauthServer) {
        const serverToClose = oauthServer;
        oauthServer = null;
        const doClose = () => {
            try {
                serverToClose.close(() => {
                    appLog('info', 'Google OAuth loopback server closed.');
                });
            } catch (e) {
                appLog('error', 'Error closing Google OAuth server:', e.message);
            }
        };
        if (immediate) {
            doClose();
        } else {
            setTimeout(doClose, 1500); // Close slightly after serving page
        }
    }

    // Centrally restore always-on-top when OAuth process ends
    if (mainWindow && !mainWindow.isDestroyed()) {
        const alwaysOnTopSetting = store ? store.get('alwaysOnTop') : true;
        mainWindow.setAlwaysOnTop(alwaysOnTopSetting !== undefined ? alwaysOnTopSetting : true);
    }
}

function startGoogleOAuthServer() {
    if (oauthServer) {
        closeOAuthServer(true);
    }

    // Temporarily disable always-on-top so the browser window opens in front of Electron
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setAlwaysOnTop(false);
    }

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
    const PORT = 3000;
    const REDIRECT_URI = `http://localhost:${PORT}/api/auth/callback/google`;

    oauthServer = http.createServer(async (req, res) => {
        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;

        if (pathname === '/api/auth/callback/google') {
            const code = parsedUrl.query.code;
            const error = parsedUrl.query.error;

            if (error) {
                appLog('error', 'Google OAuth redirect error:', error);
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end(getOAuthResponseHTML(false, `Authentication failed: ${error}`));
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('google-signin-error', `Authentication failed: ${error}`);
                }
                closeOAuthServer();
                return;
            }

            if (!code) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end(getOAuthResponseHTML(false, 'Authorization code not found in request callback.'));
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('google-signin-error', 'Authorization code not found.');
                }
                closeOAuthServer();
                return;
            }

            try {
                // Exchange authorization code for access token
                const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        code,
                        client_id: GOOGLE_CLIENT_ID,
                        client_secret: GOOGLE_CLIENT_SECRET,
                        redirect_uri: REDIRECT_URI,
                        grant_type: 'authorization_code'
                    })
                });

                if (!tokenResponse.ok) {
                    const errorText = await tokenResponse.text();
                    throw new Error(`Token exchange failed: ${errorText}`);
                }

                const tokens = await tokenResponse.json();
                const accessToken = tokens.access_token;

                // Fetch user info from Google APIs
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                if (!userInfoResponse.ok) {
                    const errorText = await userInfoResponse.text();
                    throw new Error(`User info fetch failed: ${errorText}`);
                }

                const userInfo = await userInfoResponse.json();
                appLog('info', `Google Sign-In successful for email: ${userInfo.email}`);

                const profileData = {
                    name: userInfo.name,
                    email: userInfo.email,
                    avatar: userInfo.picture,
                    mode: 'google'
                };

                // Send success HTML page
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(getOAuthResponseHTML(true, `Logged in successfully as <strong>${userInfo.name}</strong>`));

                // Dispatch success back to Electron frontend
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('google-signin-success', profileData);
                }
            } catch (err) {
                appLog('error', `Google OAuth exchange error: ${err.message}`);
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(getOAuthResponseHTML(false, `Server error: ${err.message}`));
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('google-signin-error', err.message);
                }
            } finally {
                closeOAuthServer();
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    });

    oauthServer.on('error', (err) => {
        appLog('error', `Google Sign-in loopback server error: ${err.message}`);
        if (mainWindow && !mainWindow.isDestroyed()) {
            if (err.code === 'EADDRINUSE') {
                mainWindow.webContents.send('google-signin-error', 'Port 3000 is currently in use. Please close any other application running on port 3000 (such as your Dev server) and try again.');
            } else {
                mainWindow.webContents.send('google-signin-error', `Local server error: ${err.message}`);
            }
        }
        closeOAuthServer(true);
    });

    oauthServer.listen(PORT, () => {
        appLog('info', `Google Sign-in loopback server listening on port ${PORT}`);
        
        // Generate state key & launch system browser
        const state = Math.random().toString(36).substring(2, 15);
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent('openid email profile')}&state=${state}`;
        
        const { shell } = require('electron');
        shell.openExternal(googleAuthUrl).catch(err => {
            appLog('error', `Failed to open system browser: ${err.message}`);
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('google-signin-error', 'Failed to open default system browser.');
            }
            closeOAuthServer(true);
        });
    });
}

ipcMain.handle('start-google-sign-in', () => {
    startGoogleOAuthServer();
    return true;
});

ipcMain.handle('cancel-google-sign-in', () => {
    closeOAuthServer(true);
    appLog('info', 'Google Sign-in cancelled by user.');
    return true;
});

// ═══════════════════════════════════════════════════════════════════════
//  APP LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════

// ═══ PHANTOM: Process Stealth ═══
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-gpu-cache');
// Disable crash reporter to avoid leaving traces
app.commandLine.appendSwitch('disable-breakpad');

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
    process.exit(0);
}

app.on('second-instance', () => {
    showMainWindow();
});

app.whenReady().then(() => {
    store = new SimpleStore({
        opacity: 0.95,
        fontSize: 14,
        language: 'en',
        model: 'gpt-4o-mini',
        alwaysOnTop: true,
        windowBounds: { width: 520, height: 600, x: undefined, y: undefined }
    });
    createWindow();
    createTray();
    registerShortcuts();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    destroyFloatingWindow();
});

app.on('activate', () => {
    if (mainWindow === null) createWindow();
});
