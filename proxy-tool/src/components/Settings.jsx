import React, { useState, useEffect } from 'react';

export default function Settings({ onClose }) {
    const [settings, setSettings] = useState({
        model: 'gpt-4o-mini',
        language: 'en',
        opacity: 0.95,
        fontSize: 14,
        alwaysOnTop: true
    });

    useEffect(() => {
        window.electronAPI?.getSettings().then(s => {
            setSettings(prev => ({ ...prev, ...s }));
        }).catch(() => {});
    }, []);

    const handleChange = (key, value) => {
        const updated = { ...settings, [key]: value };
        setSettings(updated);
        window.electronAPI?.saveSettings({ [key]: value }).catch(() => {});
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="settings-overlay" onClick={handleOverlayClick}>
            <div className="settings-modal">
                <div className="settings-header">
                    <h2>⚙ Settings</h2>
                    <button className="settings-close" onClick={onClose}>✕</button>
                </div>

                <div className="settings-body">
                    <div className="setting-group">
                        <label>AI Model</label>
                        <select value={settings.model} onChange={(e) => handleChange('model', e.target.value)}>
                            <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cheap)</option>
                            <option value="gpt-4o">GPT-4o (Best Quality)</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        </select>
                    </div>

                    <div className="setting-group">
                        <label>Transcription Language</label>
                        <select value={settings.language} onChange={(e) => handleChange('language', e.target.value)}>
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="ja">Japanese</option>
                            <option value="ko">Korean</option>
                            <option value="zh">Chinese</option>
                            <option value="pt">Portuguese</option>
                            <option value="ar">Arabic</option>
                        </select>
                    </div>

                    <div className="setting-group">
                        <label>Window Opacity</label>
                        <div className="slider-container">
                            <input type="range" min="0.3" max="1" step="0.05"
                                value={settings.opacity}
                                onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
                            />
                            <span className="slider-value">{Math.round(settings.opacity * 100)}%</span>
                        </div>
                    </div>

                    <div className="setting-group">
                        <label>Font Size</label>
                        <div className="slider-container">
                            <input type="range" min="10" max="20" step="1"
                                value={settings.fontSize}
                                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                            />
                            <span className="slider-value">{settings.fontSize}px</span>
                        </div>
                    </div>

                    <div className="setting-group">
                        <label>Keyboard Shortcuts</label>
                        <div className="shortcuts-list">
                            <div className="shortcut-item">
                                <span className="shortcut-label">Toggle Visibility</span>
                                <kbd>Ctrl+Shift+H</kbd>
                            </div>
                            <div className="shortcut-item">
                                <span className="shortcut-label">Always on Top</span>
                                <kbd>Ctrl+Shift+T</kbd>
                            </div>
                            <div className="shortcut-item">
                                <span className="shortcut-label">Minimize</span>
                                <kbd>Ctrl+Shift+X</kbd>
                            </div>
                        </div>
                    </div>

                    <div className="stealth-section">
                        <div className="stealth-section-title">Phantom Engine</div>
                        <div className="shortcuts-list">
                            <div className="shortcut-item">
                                <span className="shortcut-label">👻 Ghost Mode</span>
                                <kbd>Ctrl+Shift+G</kbd>
                            </div>
                            <div className="shortcut-item">
                                <span className="shortcut-label">🚨 Panic Hide</span>
                                <kbd>Ctrl+Shift+Q</kbd>
                            </div>
                            <div className="shortcut-item">
                                <span className="shortcut-label">📸 Quick Capture</span>
                                <kbd>Ctrl+Shift+S</kbd>
                            </div>
                            <div className="shortcut-item">
                                <span className="shortcut-label">📜 Scroll Answer</span>
                                <kbd>Ctrl+Shift+↑↓</kbd>
                            </div>
                            <div className="shortcut-item">
                                <span className="shortcut-label">🔆 Ghost Opacity</span>
                                <kbd>Ctrl+Shift+±</kbd>
                            </div>
                        </div>
                    </div>

                    <div className="setting-group" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--font-xs)' }}>
                            <div style={{ marginBottom: '4px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                Garuda v3.0 — Phantom Engine
                            </div>
                            Powered by OpenAI
                            <br />
                            <span style={{ color: 'var(--accent-secondary)' }}>
                                🛡 Content Protection Active • 👻 Ghost Mode Ready
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
