import React, { useState, useEffect } from 'react';

export default function AuthScreen({ onLoginSuccess }) {
    const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const [isDeveloperMode, setIsDeveloperMode] = useState(false);
    const [developerPassword, setDeveloperPassword] = useState('');

    // Google OAuth Listeners
    useEffect(() => {
        if (!window.electronAPI) return;

        const unsubscribeSuccess = window.electronAPI.onGoogleSignInSuccess((profile) => {
            setIsGoogleSigningIn(false);
            onLoginSuccess('google', profile);
        });

        const unsubscribeError = window.electronAPI.onGoogleSignInError((errMessage) => {
            setIsGoogleSigningIn(false);
            setError(errMessage);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        });

        return () => {
            unsubscribeSuccess();
            unsubscribeError();
        };
    }, [onLoginSuccess]);

    const handleGoogleSignIn = () => {
        setError('');
        setIsGoogleSigningIn(true);
        window.electronAPI?.startGoogleSignIn();
    };

    const handleCancelGoogleSignIn = () => {
        setIsGoogleSigningIn(false);
        window.electronAPI?.cancelGoogleSignIn();
    };

    const handleDeveloperLogin = () => {
        if (developerPassword === 'Mohit__8120__') {
            setError('');
            onLoginSuccess('developer', {
                name: 'Developer Mode',
                email: 'developer@proxytool',
                mode: 'developer',
                avatar: ''
            });
        } else {
            setError('Invalid Developer Password');
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    return (
        <div className="auth-screen">
            <div className="auth-card slide-up">
                <div className="auth-header">
                    <div className="auth-logo">
                        <div className="logo-icon">G</div>
                        <h1>Garuda</h1>
                    </div>
                    <p>Phantom Engine v3.0 — Stealth Interview Copilot</p>
                </div>

                <div className="auth-options">
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', textAlign: 'center', marginBottom: '20px' }}>
                        Sign in to link and sync subscription service access
                    </p>
                    
                    <button 
                        className="google-signin-premium-btn"
                        onClick={handleGoogleSignIn}
                    >
                        <div className="google-btn-logo-wrapper">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                <path fill="#4285F4" d="M46.5 24c0-1.55-.15-3.24-.47-4.77H24v9.03h12.75c-.55 2.87-2.22 5.37-4.72 7.03l7.3 5.66c4.27-3.93 6.67-9.72 6.67-16.92z"/>
                                <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.3-5.66c-2.11 1.41-4.8 2.22-7.59 2.22-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                            </svg>
                        </div>
                        <span>Sign in with Google</span>
                    </button>

                    {error && <div className={`auth-error ${shake ? 'shake' : ''}`}>{error}</div>}
                </div>

                {/* Shortcut Keys Highlight Pop-up */}
                <div className="auth-shortcuts-highlight">
                    <div className="highlight-title">👻 Phantom Shortcuts</div>
                    <div className="shortcuts-grid">
                        <div className="shortcut-item">
                            <kbd>Ctrl+Shift+G</kbd>
                            <span>Ghost Mode (Click-Through)</span>
                        </div>
                        <div className="shortcut-item">
                            <kbd>Ctrl+Shift+Q</kbd>
                            <span>Panic Hide (Emergency)</span>
                        </div>
                        <div className="shortcut-item">
                            <kbd>Ctrl+Shift+S</kbd>
                            <span>Quick Screen Capture</span>
                        </div>
                        <div className="shortcut-item">
                            <kbd>Ctrl+Shift+H</kbd>
                            <span>Toggle Visibility</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* REAL GOOGLE OAUTH WAITING OVERLAY */}
            {isGoogleSigningIn && (
                <div className="google-oauth-overlay">
                    <div className="google-oauth-premium-window">
                        <div className="google-oauth-premium-content">
                            <div className="google-premium-spinner">
                                <div className="google-premium-spinner-inner"></div>
                            </div>
                            <h2 className="google-oauth-premium-title">
                                Authenticating with Google
                            </h2>
                            <p className="google-oauth-premium-subtitle">
                                A secure browser tab has been launched. Please sign in with your Google account to log into Garuda.
                            </p>
                            <button 
                                type="button" 
                                className="google-premium-cancel-btn" 
                                onClick={handleCancelGoogleSignIn}
                            >
                                Cancel Authentication
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

