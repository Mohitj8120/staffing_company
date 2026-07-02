import React from 'react';

export default function TitleBar({ isPinned, onTogglePin, onSettings, isSession }) {
    const handleMinimize = () => window.electronAPI?.minimize();
    const handleClose = () => window.electronAPI?.close();

    return (
        <div className="title-bar">
            <div className="title-bar-left">
                <div className="title-bar-logo">
                    <div className="logo-icon">G</div>
                    <span className="logo-text">Garuda</span>
                </div>
                <div className="stealth-badge">
                    <span className="dot"></span>
                    Stealth
                </div>
            </div>

            <div className="title-bar-controls">
                <button
                    className="title-bar-btn"
                    onClick={onSettings}
                    title="Settings"
                >
                    ⚙
                </button>
                <button
                    className={`title-bar-btn ${isPinned ? 'pin-active' : ''}`}
                    onClick={onTogglePin}
                    title={isPinned ? 'Unpin from top' : 'Pin to top'}
                >
                    📌
                </button>
                <button
                    className="title-bar-btn"
                    onClick={handleMinimize}
                    title="Minimize"
                >
                    —
                </button>
                <button
                    className="title-bar-btn close"
                    onClick={handleClose}
                    title="Quit Application"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
