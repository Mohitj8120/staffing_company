const { app, BrowserWindow, ipcMain, globalShortcut, Tray, Menu, nativeImage, desktopCapturer, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// ─── OpenAI API Key (hardcoded for now, will be gated by auth later) ──────
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

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

// ─── Content Protection ─────────────────────────────────────────────────
function applyContentProtection(win) {
    if (!win || win.isDestroyed()) return;
    try { win.setContentProtection(true); } catch (e) {}
    if (process.platform === 'win32') {
        try {
            const ffi = require('ffi-napi');
            const hwnd = win.getNativeWindowHandle();
            const user32 = ffi.Library('user32', { 'SetWindowDisplayAffinity': ['bool', ['pointer', 'uint32']] });
            const result = user32.SetWindowDisplayAffinity(hwnd, 0x11);
            if (!result) user32.SetWindowDisplayAffinity(hwnd, 0x01);
        } catch (e) {
            console.log('Native stealth not available:', e.message);
        }
    }
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
            contextIsolation: true,
            nodeIntegration: false
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
            document.getElementById('btn').addEventListener('dblclick', () => {
                // Post message to restore
            });
        </script>
    </body></html>`;
    
    floatingWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);
    
    // Double click on the floating icon restores main window
    floatingWindow.on('closed', () => { floatingWindow = null; });
    
    // Clicking the floating window restores main
    floatingWindow.webContents.on('before-input-event', (event, input) => {
        if (input.type === 'mouseDown') {
            showMainWindow();
        }
    });
    
    // Simple approach: any click on the floating window restores
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
        mainWindow.focus();
        isVisible = true;
        destroyFloatingWindow();
    }
}

// ─── Main Window ────────────────────────────────────────────────────────
function createWindow() {
    const bounds = store.get('windowBounds');

    mainWindow = new BrowserWindow({
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        minWidth: 420,
        minHeight: 400,
        frame: false,
        transparent: true,
        resizable: true,
        alwaysOnTop: store.get('alwaysOnTop'),
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

    mainWindow.setOpacity(store.get('opacity'));

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        applyContentProtection(mainWindow);
    });

    mainWindow.on('focus', () => applyContentProtection(mainWindow));
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
        const [x, y] = mainWindow.getPosition();
        const [width, height] = mainWindow.getSize();
        store.set('windowBounds', { x, y, width, height });
    });
    mainWindow.on('resized', () => {
        const [x, y] = mainWindow.getPosition();
        const [width, height] = mainWindow.getSize();
        store.set('windowBounds', { x, y, width, height });
    });
    mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── System Tray ────────────────────────────────────────────────────────
function createTray() {
    const icon = nativeImage.createEmpty();
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show/Hide', click: () => toggleVisibility() },
        { label: 'Always on Top', type: 'checkbox', checked: store.get('alwaysOnTop'),
          click: (mi) => { store.set('alwaysOnTop', mi.checked); if (mainWindow) mainWindow.setAlwaysOnTop(mi.checked); }
        },
        { type: 'separator' },
        { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } }
    ]);
    tray.setToolTip('Proxy Tool');
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

// ─── Global Shortcuts ───────────────────────────────────────────────────
function registerShortcuts() {
    globalShortcut.register('Ctrl+Shift+H', () => toggleVisibility());
    globalShortcut.register('Ctrl+Shift+T', () => {
        const current = store.get('alwaysOnTop');
        store.set('alwaysOnTop', !current);
        if (mainWindow) mainWindow.setAlwaysOnTop(!current);
    });
    globalShortcut.register('Ctrl+Shift+X', () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.hide();
            isVisible = false;
            createFloatingWindow();
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

ipcMain.handle('minimize-window', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('close-window', () => {
    if (mainWindow) mainWindow.hide();
    isVisible = false;
    createFloatingWindow();
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

// ─── AI Chat (OpenAI gpt-4o-mini with Streaming) ────────────────────────
ipcMain.handle('ai-chat', async (event, { messages, resumeText, position, company, instructions }) => {
    appLog('info', `AI Chat request for ${position} @ ${company}`);
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // Inject context into system prompt
    let contextAdded = false;
    const finalMessages = messages.map(msg => {
        if (msg.role === 'system' && !contextAdded) {
            contextAdded = true;
            let ctx = `${msg.content}\n\n--- INTERVIEW CONTEXT ---\nRole: ${position || 'Unknown'}\nCompany: ${company || 'Unknown'}\n`;
            if (instructions) ctx += `Special Instructions: ${instructions}\n`;
            if (resumeText) ctx += `\nCandidate Resume:\n${resumeText}\n`;
            ctx += `\nCRITICAL: Use the Candidate Resume heavily when answering. Be natural and conversational.`;
            return { role: 'system', content: ctx };
        }
        return msg;
    });

    try {
        const stream = await openai.chat.completions.create({
            model: store.get('model') || 'gpt-4o-mini',
            messages: finalMessages,
            temperature: 0.7,
            max_tokens: 2000,
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

// ─── Audio Transcription (OpenAI gpt-4o-mini-transcribe) ────────────────
ipcMain.handle('transcribe-audio', async (event, { audioBuffer }) => {
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const os = require('os');
    const ffmpegPath = require('ffmpeg-static');
    const ffmpeg = require('fluent-ffmpeg');
    ffmpeg.setFfmpegPath(ffmpegPath);

    appLog('info', `Received audio chunk: ${audioBuffer.length} bytes`);

    const timestamp = Date.now();
    const tempWebmPath = path.join(os.tmpdir(), `proxy-audio-${timestamp}.webm`);
    const tempWavPath = path.join(os.tmpdir(), `proxy-audio-${timestamp}.wav`);
    fs.writeFileSync(tempWebmPath, Buffer.from(audioBuffer));

    try {
        appLog('info', `Converting WebM to WAV (temp files: ${tempWebmPath} -> ${tempWavPath})`);
        await new Promise((resolve, reject) => {
            ffmpeg(tempWebmPath)
                .audioCodec('pcm_s16le')
                .audioFrequency(16000)
                .format('wav')
                .on('end', resolve)
                .on('error', reject)
                .save(tempWavPath);
        });

        appLog('info', `Sending to Whisper API...`);
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempWavPath),
            model: 'whisper-1',
            language: store.get('language') || 'en',
            response_format: 'text'
        });
        
        try { fs.unlinkSync(tempWebmPath); } catch (e) {}
        try { fs.unlinkSync(tempWavPath); } catch (e) {}
        
        const text = typeof transcription === 'string' ? transcription.trim() : (transcription.text || '').trim();
        appLog('info', `Transcription: "${text}"`);
        return text;
    } catch (err) {
        appLog('error', `Transcription Error: ${err.message}`);
        try { fs.unlinkSync(tempWebmPath); } catch (e) {}
        try { fs.unlinkSync(tempWavPath); } catch (e) {}
        throw new Error(`Transcription Error: ${err.message}`);
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

ipcMain.handle('analyze-screen', async (event, { base64Image, context }) => {
    appLog('info', `Analyze Screen request received`);
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    try {
        const stream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert interview assistant. Analyse the screen content shown in the image. 
If it contains code problems, provide the solution with explanation.
If it contains interview questions, provide detailed answers.
If it contains a coding editor, read the problem and provide the optimal solution.
${context || ''}
Be concise but thorough. Format code properly with language tags.`
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analyze this screen and provide the answer/solution:' },
                        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'high' } }
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

// ═══════════════════════════════════════════════════════════════════════
//  APP LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════

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
