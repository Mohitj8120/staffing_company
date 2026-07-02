import React, { useState, useEffect } from 'react';
import TitleBar from './components/TitleBar';
import LiveSession from './components/LiveSession';
import Settings from './components/Settings';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';

export default function App() {
    const [view, setView] = useState(() => {
        const storedUser = localStorage.getItem('pt_user');
        return storedUser ? 'dashboard' : 'auth';
    });
    const [showSettings, setShowSettings] = useState(false);
    const [sessionData, setSessionData] = useState(null);
    const [isPinned, setIsPinned] = useState(true);

    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('pt_user');
        return stored ? JSON.parse(stored) : null;
    });

    const [subscription, setSubscription] = useState(() => {
        return localStorage.getItem('pt_subscription') || 'free';
    });

    useEffect(() => {
        window.electronAPI?.getSettings().then(settings => {
            setIsPinned(settings.alwaysOnTop);
        }).catch(() => {});
    }, []);

    // Handle window resizing dynamically based on auth state and active view
    useEffect(() => {
        if (view === 'session') return;

        if (window.electronAPI?.resizeWindow) {
            if (user) {
                // Resize to Dashboard dimensions
                window.electronAPI.resizeWindow({ width: 820, height: 660, position: 'center' });
            } else {
                // Resize to AuthScreen dimensions
                window.electronAPI.resizeWindow({ width: 520, height: 650, position: 'center' });
            }
        }
    }, [user, view]);

    const handleLoginSuccess = (mode, loggedInUser) => {
        setUser(loggedInUser);
        localStorage.setItem('pt_user', JSON.stringify(loggedInUser));
        
        if (mode === 'developer' || loggedInUser?.mode === 'developer' || loggedInUser?.email === 'mohitjain1619@gmail.com') {
            setSubscription('proxy');
            localStorage.setItem('pt_subscription', 'proxy');
        }
        
        setView('dashboard');
    };

    const handleLogout = () => {
        setUser(null);
        setSubscription('free');
        localStorage.removeItem('pt_user');
        localStorage.removeItem('pt_subscription');
        setView('auth');
    };

    const handleUpgradeSubscription = (tier) => {
        setSubscription(tier);
        localStorage.setItem('pt_subscription', tier);
    };

    const handleStartSession = async (data) => {
        setSessionData(data);
        setView('session');
        // Shrink to compact Parakeet toolbar
        if (window.electronAPI?.resizeWindow) {
            await window.electronAPI.resizeWindow({ width: 700, height: 60, position: 'topCenter' });
        }
    };

    const handleEndSession = async () => {
        setView('dashboard');
        setSessionData(null);
        // Expand back to user dashboard dimensions
        if (window.electronAPI?.resizeWindow) {
            await window.electronAPI.resizeWindow({ width: 820, height: 660, position: 'center' });
        }
    };

    const handleTogglePin = async () => {
        try {
            const newState = await window.electronAPI?.togglePin();
            setIsPinned(newState);
        } catch (e) {
            setIsPinned(prev => !prev);
        }
    };

    return (
        <div className={`app-container ${view === 'session' ? 'session-mode' : ''}`}>
            {view !== 'session' && (
                <TitleBar
                    isPinned={isPinned}
                    onTogglePin={handleTogglePin}
                    onSettings={() => setShowSettings(true)}
                    isSession={false}
                />
            )}

            <div className={`main-content ${view === 'session' ? 'p-0' : ''}`}>
                {!user ? (
                    <AuthScreen onLoginSuccess={handleLoginSuccess} />
                ) : view === 'session' ? (
                    <LiveSession
                        sessionData={sessionData}
                        onEnd={handleEndSession}
                        userMode={user.mode}
                        subscription={subscription}
                    />
                ) : (
                    <Dashboard
                        user={user}
                        onLogout={handleLogout}
                        subscription={subscription}
                        onUpgradeSubscription={handleUpgradeSubscription}
                        onStartSession={handleStartSession}
                    />
                )}
            </div>

            {showSettings && (
                <Settings onClose={() => setShowSettings(false)} />
            )}
        </div>
    );
}
