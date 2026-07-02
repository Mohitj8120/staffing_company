import React, { useState, useEffect, useRef } from 'react';
import SessionSetup from './SessionSetup';

const plans = [
    {
        id: "free",
        name: "Demo Mode",
        price: "0",
        subtitle: "5-min total demo limit",
        description: "Experience the Stealth AI Copilot with basic feature access and a short session timer.",
        features: [
            "Stealth Copilot access",
            "Only 5 minutes total demo allowed",
            "Standard AI engine latency",
            "Single monitor setup support",
            "Allowed exactly once per device"
        ],
        featured: false,
        color: "emerald"
    },
    {
        id: "proxy",
        name: "Garuda Access",
        price: "125",
        subtitle: "One-time Only",
        description: "Perfect for candidates who need technical assistance during live interviews.",
        features: [
            "2 Garuda interview sessions",
            "Max 2 hours duration per interview",
            "100% success rate of passing",
            "Undetectable even in HackerRank",
            "Invisible while screen sharing",
            "Support for 20+ technologies"
        ],
        featured: true,
        color: "blue"
    }
];

export default function Dashboard({ user, onLogout, subscription, onUpgradeSubscription, onStartSession }) {
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'setup' | 'pricing' | 'history' | 'settings'
    const [showCheckout, setShowCheckout] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [checkoutStep, setCheckoutStep] = useState('form'); // 'form' | 'processing' | 'success'
    const [processingLogs, setProcessingLogs] = useState([]);
    const [isDemoUsed, setIsDemoUsed] = useState(false);
    
    // Developer Mode State
    const [isDevModeOpen, setIsDevModeOpen] = useState(false);
    const [devPassword, setDevPassword] = useState('');
    const [devError, setDevError] = useState('');
    
    // Checkout form state
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [isCardFlipped, setIsCardFlipped] = useState(false);
    
    // History logs modal
    const [selectedSessionLog, setSelectedSessionLog] = useState(null);
    
    // Settings state (read directly from electronAPI)
    const [settings, setSettings] = useState({
        model: 'gpt-4o-mini',
        language: 'en',
        opacity: 0.95,
        fontSize: 14,
        alwaysOnTop: true
    });

    // Mock history data (saved in localStorage for persistence)
    const [history, setHistory] = useState([]);

    // Canvas Confetti Ref
    const canvasRef = useRef(null);

    // Load settings and stored history
    useEffect(() => {
        if (window.electronAPI?.getSettings) {
            window.electronAPI.getSettings().then(s => {
                setSettings(prev => ({ ...prev, ...s }));
            }).catch(() => {});
        }

        if (window.electronAPI?.checkDemo) {
            window.electronAPI.checkDemo().then(used => {
                setIsDemoUsed(used);
            }).catch(() => {});
        }
        
        const localHistory = localStorage.getItem('pt_session_history');
        if (localHistory) {
            try {
                const parsed = JSON.parse(localHistory);
                // Filter out any old preloaded mock data to ensure clean logs
                const cleaned = parsed.filter(item => {
                    const isMock = (item.id === 1 && item.company === 'Google') ||
                                   (item.id === 2 && item.company === 'Stripe') ||
                                   (item.id === 3 && item.company === 'Microsoft');
                    return !isMock;
                });
                setHistory(cleaned);
                localStorage.setItem('pt_session_history', JSON.stringify(cleaned));
            } catch(e) {}
        } else {
            localStorage.setItem('pt_session_history', JSON.stringify([]));
        }
    }, []);

    // Save settings handler
    const handleSettingsChange = (key, value) => {
        const updated = { ...settings, [key]: value };
        setSettings(updated);
        window.electronAPI?.saveSettings({ [key]: value }).catch(() => {});
    };

    // Card Input Handlers
    const handleCardNumberChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 16) val = val.substring(0, 16);
        // Format with spaces
        let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
        setCardNumber(formatted);
    };

    const handleExpiryChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.substring(0, 4);
        if (val.length > 2) {
            val = val.substring(0, 2) + '/' + val.substring(2);
        }
        setCardExpiry(val);
    };

    const handleCvvChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 3) val = val.substring(0, 3);
        setCardCvv(val);
    };

    // Determine Card Type
    const getCardType = () => {
        const cleanNum = cardNumber.replace(/\s/g, '');
        if (cleanNum.startsWith('4')) return 'Visa';
        if (/^5[1-5]/.test(cleanNum)) return 'Mastercard';
        if (cleanNum.startsWith('34') || cleanNum.startsWith('37')) return 'Amex';
        return 'Card';
    };

    // Launch simulated payment processing
    const handleCheckoutSubmit = (e) => {
        e.preventDefault();
        if (!cardNumber || !cardName || !cardExpiry || !cardCvv) return;
        
        setCheckoutStep('processing');
        setProcessingLogs([]);
        
        const logs = [
            'Contacting Stripe secure server...',
            'Authorizing with Google Account: ' + user.email,
            'Encrypting card token parameters...',
            'Stripe Gateway Check: Detected Developer Sandbox Environment...',
            'Error: Live payment gateway is not integrated yet.',
            'Halting license assignment. Real billing setup required.'
        ];
        
        let index = 0;
        const interval = setInterval(() => {
            if (index < logs.length) {
                setProcessingLogs(prev => [...prev, logs[index]]);
                index++;
            } else {
                clearInterval(interval);
                // Do not upgrade the subscription state. Go to pending gateway view.
                setCheckoutStep('pending');
            }
        }, 800);
    };

    // Particle Confetti Generator
    const triggerConfetti = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#10b981', '#06d6a0', '#34d399', '#3b82f6', '#8b5cf6', '#fbbf24', '#ef4444'];

        for (let i = 0; i < 120; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2 + 100,
                radius: Math.random() * 6 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.75) * 16 - 4,
                alpha: 1,
                decay: Math.random() * 0.015 + 0.01
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;

            particles.forEach(p => {
                if (p.alpha > 0) {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.35; // gravity
                    p.vx *= 0.98; // air resistance
                    p.alpha -= p.decay;
                    
                    ctx.save();
                    ctx.globalAlpha = p.alpha;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    active = true;
                }
            });

            if (active) {
                requestAnimationFrame(render);
            }
        };

        requestAnimationFrame(render);
    };

    // Plans and pricing are static and loaded from the plans array

    // Clean session history
    const handleClearHistory = () => {
        localStorage.removeItem('pt_session_history');
        setHistory([]);
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar Navigation */}
            <div className="dashboard-sidebar">
                <div className="sidebar-menu">
                    <div className="sidebar-logo">
                        <div className="logo-icon">G</div>
                        <span className="logo-text">Garuda</span>
                    </div>
                    
                    <button 
                        className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <span className="sidebar-item-icon">📊</span>
                        Dashboard
                    </button>
                    
                    <button 
                        className={`sidebar-item ${activeTab === 'setup' ? 'active' : ''}`}
                        onClick={() => setActiveTab('setup')}
                    >
                        <span className="sidebar-item-icon">🚀</span>
                        Start Session {subscription === 'free' && (isDemoUsed ? '🔒' : '⏱️')}
                    </button>

                    <button 
                        className={`sidebar-item ${activeTab === 'pricing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pricing')}
                    >
                        <span className="sidebar-item-icon">💳</span>
                        Subscription
                    </button>

                    <button 
                        className={`sidebar-item ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <span className="sidebar-item-icon">📜</span>
                        History
                    </button>

                    <button 
                        className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <span className="sidebar-item-icon">⚙</span>
                        Settings
                    </button>
                </div>

                <div className="sidebar-user">
                    <div className="user-profile-summary">
                        <div className="user-avatar-mini">
                            {user.avatar ? (
                                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                            ) : (
                                (user.name || 'G').charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="user-info-mini">
                            <span className="user-name-mini">{user.name || 'Guest'}</span>
                            <span className="user-email-mini">{user.email || ''}</span>
                        </div>
                    </div>
                    <button className="sidebar-item" onClick={onLogout} style={{ borderTop: 'none', padding: '8px 14px', marginTop: '0', color: 'var(--status-error)' }}>
                        <span className="sidebar-item-icon">🚪</span>
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Dashboard Panels */}
            <div className="dashboard-content">
                {activeTab === 'dashboard' && (
                    <div className="dashboard-panel">
                        <div className="dashboard-header-block">
                            <div>
                                <h1 className="welcome-title">Welcome back, {user.name?.split(' ')[0] || 'Guest'}! 👋</h1>
                                <p className="welcome-subtitle">Stealth AI Copilot is fully configured and ready to secure your interview.</p>
                            </div>
                            <div className="stealth-badge">
                                <span className="dot"></span>
                                {subscription === 'proxy' ? 'Garuda License' : 'Demo Mode'}
                            </div>
                        </div>

                        {/* Top Banner for Upgrading */}
                        {subscription === 'free' && (
                            <>
                                <div className="upgrade-glow-banner">
                                    <div className="upgrade-banner-content">
                                        <span className="upgrade-banner-title">Unlock Full Unlimited Copilot Access 👑</span>
                                        <span className="upgrade-banner-desc">Get unlimited screen capture analysis, multi-language transcriptions, and advanced stealth mode filters.</span>
                                    </div>
                                    <button className="upgrade-banner-btn" onClick={() => setActiveTab('pricing')}>Get Active License</button>
                                </div>
                                
                                {/* Developer Unlock Widget */}
                                <div className="developer-unlock-widget" style={{ marginTop: '15px', padding: '15px', borderRadius: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>🛠️ Developer Unlock</span>
                                        <button 
                                            onClick={() => setIsDevModeOpen(!isDevModeOpen)}
                                            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            {isDevModeOpen ? 'Close' : 'Enter Password'}
                                        </button>
                                    </div>
                                    {isDevModeOpen && (
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                            <input 
                                                type="password" 
                                                placeholder="Developer Password" 
                                                value={devPassword}
                                                onChange={(e) => setDevPassword(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        if (devPassword === 'Mohit__8120__') {
                                                            onUpgradeSubscription('proxy');
                                                            setDevError('');
                                                            setIsDevModeOpen(false);
                                                        } else {
                                                            setDevError('Invalid Password');
                                                        }
                                                    }
                                                }}
                                                style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-main)', color: 'var(--text-primary)', outline: 'none' }}
                                            />
                                            <button 
                                                onClick={() => {
                                                    if (devPassword === 'Mohit__8120__') {
                                                        onUpgradeSubscription('proxy');
                                                        setDevError('');
                                                        setIsDevModeOpen(false);
                                                    } else {
                                                        setDevError('Invalid Password');
                                                    }
                                                }}
                                                style={{ padding: '8px 16px', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                            >
                                                Unlock
                                            </button>
                                        </div>
                                    )}
                                    {devError && <div style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '5px' }}>{devError}</div>}
                                </div>
                            </>
                        )}

                        {/* Stats Dashboard Grid */}
                        <div className="dashboard-stats-grid">
                            <div className="dashboard-stat-card">
                                <div className="stat-card-icon">⚡</div>
                                <div className="stat-card-info">
                                    <span className="stat-card-value">0.12s</span>
                                    <span className="stat-card-label">Avg response speed</span>
                                </div>
                            </div>
                            <div className="dashboard-stat-card pro-card">
                                <div className="stat-card-icon">🔐</div>
                                <div className="stat-card-info">
                                    <span className="stat-card-value">100%</span>
                                    <span className="stat-card-label">Stealth Bypass</span>
                                </div>
                            </div>
                            <div className="dashboard-stat-card">
                                <div className="stat-card-icon">📊</div>
                                <div className="stat-card-info">
                                    <span className="stat-card-value">{history.length}</span>
                                    <span className="stat-card-label">Total Sessions</span>
                                </div>
                            </div>
                            <div className="dashboard-stat-card">
                                <div className="stat-card-icon">🤖</div>
                                <div className="stat-card-info">
                                    <span className="stat-card-value">{settings.model === 'gpt-4o-mini' ? 'GPT-4o Mini' : 'GPT-4o'}</span>
                                    <span className="stat-card-label">Active AI Engine</span>
                                </div>
                            </div>
                        </div>

                        {/* Layout splits */}
                        <div className="dashboard-main-grid">
                            {/* Left Widget: Launch Form or history */}
                            <div className="dashboard-widget-card">
                                <h3 className="widget-title"><span>🚀</span> Quick Launch Copilot</h3>
                                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                                    Launch directly into session setup. Ensure system audio configuration is selected.
                                </p>
                                <button 
                                    className={`start-session-btn ${(subscription === 'free' && isDemoUsed) ? 'locked-btn' : ''}`} 
                                    onClick={() => setActiveTab('setup')} 
                                    style={{ marginTop: 'auto' }}
                                >
                                    {subscription === 'free' ? (isDemoUsed ? 'Configure Session (License Required 🔒)' : 'Configure 5-Min Demo Session') : 'Configure Interview Session'}
                                </button>
                            </div>

                            {/* Right Widget: Recent History summary */}
                            <div className="dashboard-widget-card">
                                <h3 className="widget-title"><span>📜</span> Recent Activity</h3>
                                <div className="sessions-list-brief">
                                    {history.slice(0, 3).map((item) => (
                                        <div key={item.id} className="session-brief-item">
                                            <div className="session-brief-details">
                                                <span className="session-brief-company">{item.company}</span>
                                                <span className="session-brief-meta">{item.position} • {item.date}</span>
                                            </div>
                                            <span className="session-brief-queries">{item.queries} q</span>
                                        </div>
                                    ))}
                                    {history.length === 0 && (
                                        <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)', textAlign: 'center', padding: '20px 0' }}>
                                            No session logs recorded.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Session Setup Tab */}
                {activeTab === 'setup' && (
                    <div className="dashboard-panel">
                        <div className="history-title-row">
                            <h2>Session Setup</h2>
                            <button className="history-clear-btn" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }} onClick={() => setActiveTab('dashboard')}>
                                Back to Home
                            </button>
                        </div>
                        {subscription === 'free' && isDemoUsed ? (
                            <div className="license-locked-container">
                                <div className="lock-icon-wrapper">
                                    <div className="lock-glow-ring"></div>
                                    <span className="lock-icon">🔒</span>
                                </div>
                                <h3 className="lock-title">License Required</h3>
                                <p className="lock-description">
                                    Your account <strong>({user.email})</strong> does not have an active <strong>Garuda</strong> license. Please purchase a license to start and configure interview sessions.
                                </p>
                                
                                <div className="features-preview-box">
                                    <div className="features-preview-title">What you get with an active license:</div>
                                    <div className="features-preview-list">
                                        <div className="feature-preview-item">
                                            <span className="feature-icon">👑</span>
                                            <div className="feature-text-block">
                                                <span className="feature-name">Unlimited Interview Sessions</span>
                                                <span className="feature-desc">No time limits or session count restrictions.</span>
                                            </div>
                                        </div>
                                        <div className="feature-preview-item">
                                            <span className="feature-icon">🛡️</span>
                                            <div className="feature-text-block">
                                                <span className="feature-name">100% Invisible Stealth Mode</span>
                                                <span className="feature-desc">Completely hidden from proctoring screens and screen shares.</span>
                                            </div>
                                        </div>
                                        <div className="feature-preview-item">
                                            <span className="feature-icon">⚡</span>
                                            <div className="feature-text-block">
                                                <span className="feature-name">Advanced AI Copilot Engine</span>
                                                <span className="feature-desc">Instant real-time answers with minimal latency.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <button className="start-session-btn lock-upgrade-btn" onClick={() => setActiveTab('pricing')}>
                                    💳 Get License / Upgrade Now
                                </button>
                            </div>
                        ) : (
                            <SessionSetup onStart={onStartSession} />
                        )}
                    </div>
                )}

                {/* Subscriptions Pricing Tab */}
                {activeTab === 'pricing' && (
                    <div className="dashboard-panel">
                        <div className="pricing-section-header">
                            <h2>Pricing Plans</h2>
                            <p>Transparent professional support. Select a package to view details and proceed.</p>
                        </div>

                        {/* Plans columns */}
                        <div className="pricing-plans-grid">
                            {plans.map((plan) => {
                                const isActive = subscription === plan.id;
                                return (
                                    <div 
                                        key={plan.id} 
                                        className={`pricing-plan-card ${plan.featured ? 'popular' : ''} ${isActive ? 'active-plan' : ''}`}
                                    >
                                        <span className="plan-name">{plan.name}</span>
                                        <div className="plan-price-block">
                                            <span className="plan-currency">$</span>
                                            <span className="plan-price">{plan.price}</span>
                                            <span className="plan-period">{plan.subtitle}</span>
                                        </div>
                                        <p className="plan-description">{plan.description}</p>
                                        <div className="plan-features-list">
                                            {plan.features.map((feature, idx) => (
                                                <div key={idx} className="plan-feature-item unlocked">
                                                    <span className="feature-check-icon">✓</span>
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button 
                                            className="plan-action-btn" 
                                            disabled={isActive}
                                            onClick={() => {
                                                if (plan.id === 'free') {
                                                    onUpgradeSubscription('free');
                                                } else {
                                                    const whatsappText = `Hi! I'm interested in the Garuda Access license ($125 for 2 Interviews) and want to start my career now. Please guide me on how to pay.`;
                                                    const waUrl = `https://wa.me/15068055727?text=${encodeURIComponent(whatsappText)}`;
                                                    if (window.electronAPI?.openExternalLink) {
                                                        window.electronAPI.openExternalLink(waUrl);
                                                    } else {
                                                        window.open(waUrl, '_blank');
                                                    }
                                                }
                                            }}
                                        >
                                            {isActive ? 'Current Plan' : (plan.id === 'free' ? 'Activate Demo' : 'Pay on WhatsApp & Upgrade')}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Session History Tab */}
                {activeTab === 'history' && (
                    <div className="dashboard-panel">
                        <div className="history-title-row">
                            <h2>Session History logs</h2>
                            {history.length > 0 && (
                                <button className="history-clear-btn" onClick={handleClearHistory}>
                                    Clear History Logs
                                </button>
                            )}
                        </div>

                        <div className="history-table-container">
                            {history.length > 0 ? (
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>Company Name</th>
                                            <th>Applied Position</th>
                                            <th>Session Date</th>
                                            <th>Queries</th>
                                            <th>Duration</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((item) => (
                                            <tr key={item.id}>
                                                <td className="history-company-cell">
                                                    🏢 {item.company}
                                                </td>
                                                <td>{item.position}</td>
                                                <td>{item.date}</td>
                                                <td>{item.queries} responses</td>
                                                <td>{item.duration}</td>
                                                <td>
                                                    <span className="history-badge-status success">
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="history-action-view" onClick={() => setSelectedSessionLog(item)}>
                                                        View Logs
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="history-empty-state">
                                    No past interview sessions found. Complete a session to store logs locally.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* App Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="dashboard-panel">
                        <div className="history-title-row">
                            <h2>System Settings</h2>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="dashboard-widget-card" style={{ gap: '14px' }}>
                                <div className="setting-group">
                                    <label>AI Models</label>
                                    <select value={settings.model} onChange={(e) => handleSettingsChange('model', e.target.value)}>
                                        <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cheap)</option>
                                        <option value="gpt-4o">GPT-4o (Best Quality)</option>
                                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                    </select>
                                </div>

                                <div className="setting-group">
                                    <label>Audio Transcription Language</label>
                                    <select value={settings.language} onChange={(e) => handleSettingsChange('language', e.target.value)}>
                                        <option value="en">English</option>
                                        <option value="hi">Hindi</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                        <option value="ja">Japanese</option>
                                    </select>
                                </div>

                                <div className="setting-group">
                                    <label>Window Transparency Opacity</label>
                                    <div className="slider-container">
                                        <input type="range" min="0.3" max="1" step="0.05"
                                            value={settings.opacity}
                                            onChange={(e) => handleSettingsChange('opacity', parseFloat(e.target.value))}
                                        />
                                        <span className="slider-value">{Math.round(settings.opacity * 100)}%</span>
                                    </div>
                                </div>

                                <div className="setting-group">
                                    <label>Copilot Font Size</label>
                                    <div className="slider-container">
                                        <input type="range" min="10" max="20" step="1"
                                            value={settings.fontSize}
                                            onChange={(e) => handleSettingsChange('fontSize', parseInt(e.target.value))}
                                        />
                                        <span className="slider-value">{settings.fontSize}px</span>
                                    </div>
                                </div>
                            </div>

                            <div className="dashboard-widget-card" style={{ gap: '10px' }}>
                                <div className="stealth-section-title">Phantom Engine Hotkeys</div>
                                <div className="shortcut-item">
                                    <span className="shortcut-label">Toggle Visibility</span>
                                    <kbd>Ctrl+Shift+H</kbd>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-label">Always on Top Pin</span>
                                    <kbd>Ctrl+Shift+T</kbd>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-label">Minimize to Bubble</span>
                                    <kbd>Ctrl+Shift+X</kbd>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-label">👻 Toggle Ghost Mode</span>
                                    <kbd>Ctrl+Shift+G</kbd>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-label">🚨 Emergency Panic Hide</span>
                                    <kbd>Ctrl+Shift+Q</kbd>
                                </div>
                                <div className="shortcut-item">
                                    <span className="shortcut-label">📸 Quick Capture Screen</span>
                                    <kbd>Ctrl+Shift+S</kbd>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CHECKOUT FLOW DRAWER / MODAL OVERLAY */}
            {showCheckout && (
                <div className="checkout-overlay">
                    <canvas ref={canvasRef} className="confetti-canvas"></canvas>
                    
                    <div className="checkout-modal">
                        <div className="checkout-header">
                            <h3>👑 Checkout — {selectedPlan?.name}</h3>
                            {checkoutStep !== 'processing' && (
                                <button className="checkout-close" onClick={() => setShowCheckout(false)}>✕</button>
                            )}
                        </div>

                        {checkoutStep === 'form' && (
                            <div className="checkout-body">
                                {/* Interactive flipping credit card */}
                                <div className="checkout-card-preview-area">
                                    <div className={`visual-credit-card ${isCardFlipped ? 'flipped' : ''}`}>
                                        {/* Front Face */}
                                        <div className="card-face front">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div className="card-chip"></div>
                                                <span className="card-network-logo">{getCardType()}</span>
                                            </div>
                                            <div className="card-visual-number">
                                                {cardNumber || '•••• •••• •••• ••••'}
                                            </div>
                                            <div className="card-visual-bottom">
                                                <div className="card-holder-block">
                                                    <span className="card-holder-label">Card Holder</span>
                                                    <span className="card-holder-val">{cardName || user.name?.toUpperCase() || 'CARD HOLDER'}</span>
                                                </div>
                                                <div className="card-expiry-block">
                                                    <span className="card-expiry-label">Expires</span>
                                                    <span className="card-expiry-val">{cardExpiry || 'MM/YY'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Back Face */}
                                        <div className="card-face back">
                                            <div className="card-magnetic-strip"></div>
                                            <div className="card-signature-area">
                                                <span className="card-sig-label">Signature / CVV</span>
                                                <div className="card-sig-strip">
                                                    <span className="card-visual-cvv">{cardCvv || '•••'}</span>
                                                </div>
                                            </div>
                                            <span className="card-back-disclaimer">
                                                This mock secure card is verified for sandbox developer billing test rounds only.
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Form fields */}
                                <form className="checkout-form" onSubmit={handleCheckoutSubmit}>
                                    <div className="form-group" style={{ animationDelay: '0s' }}>
                                        <label className="form-label">Card Number</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            placeholder="4000 1234 5678 9010"
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group" style={{ animationDelay: '0s' }}>
                                        <label className="form-label">Cardholder Name</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            placeholder={user.name || "Cardholder Name"}
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="checkout-form-row">
                                        <div className="form-group" style={{ animationDelay: '0s' }}>
                                            <label className="form-label">Expiration</label>
                                            <input 
                                                type="text" 
                                                className="form-input" 
                                                placeholder="MM/YY"
                                                value={cardExpiry}
                                                onChange={handleExpiryChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group" style={{ animationDelay: '0s' }}>
                                            <label className="form-label">CVV</label>
                                            <input 
                                                type="password" 
                                                className="form-input" 
                                                placeholder="123"
                                                value={cardCvv}
                                                onChange={handleCvvChange}
                                                onFocus={() => setIsCardFlipped(true)}
                                                onBlur={() => setIsCardFlipped(false)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="checkout-submit-btn">
                                        Pay ${selectedPlan?.price} Now
                                    </button>

                                    <div className="checkout-stripe-badge">
                                        🛡 Secure payment powered by <span>stripe</span>
                                    </div>
                                </form>
                            </div>
                        )}

                        {checkoutStep === 'processing' && (
                            <div className="payment-processing-container">
                                <div className="processing-circle"></div>
                                <h4 style={{ color: '#fff', fontSize: 'var(--font-lg)', fontWeight: '700', marginBottom: '8px' }}>
                                    Processing Payment
                                </h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
                                    Connecting to secure gateways. Do not close the window.
                                </p>
                                
                                <div className="payment-step-logs">
                                    {processingLogs.map((log, idx) => (
                                        <div key={idx} className="log-entry-line">
                                            {idx < processingLogs.length - 1 ? (
                                                <span className="log-entry-done">✓</span>
                                            ) : (
                                                <span className="log-entry-loading">⏳</span>
                                            )}
                                            <span>{log}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {checkoutStep === 'pending' && (
                            <div className="payment-processing-container" style={{ padding: '30px 20px' }}>
                                <div className="payment-success-badge" style={{ borderColor: 'var(--status-warning)', color: 'var(--status-warning)', background: 'rgba(245, 158, 11, 0.12)' }}>⚠️</div>
                                <h4 style={{ color: 'var(--status-warning)', fontSize: 'var(--font-xl)', fontWeight: '800', marginBottom: '8px' }}>
                                    Gateway Integration Pending
                                </h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', maxWidth: '380px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
                                    This app is currently in <strong>Developer Sandbox mode</strong>. Real payments will be enabled once your live Stripe gateway is connected.
                                </p>
                                
                                <div style={{ 
                                    background: 'rgba(255, 255, 255, 0.02)', 
                                    border: '1px solid var(--border-subtle)', 
                                    borderRadius: 'var(--radius-md)', 
                                    padding: '16px', 
                                    width: '100%', 
                                    maxWidth: '400px', 
                                    margin: '0 auto 24px auto',
                                    textAlign: 'left'
                                }}>
                                    <div style={{ fontSize: 'var(--font-xs)', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Next Steps for Production:
                                    </div>
                                    <ul style={{ margin: '0', paddingLeft: '18px', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <li>Provide a real Stripe API key in environment variables</li>
                                        <li>Replace mock components with Stripe Elements iframe</li>
                                        <li>Set up webhook endpoints for user role provisioning</li>
                                    </ul>
                                </div>

                                <button className="start-session-btn" style={{ width: '220px', marginTop: '0', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-medium)' }} onClick={() => {
                                    setShowCheckout(false);
                                    setActiveTab('pricing');
                                }}>
                                    Back to Plans
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MOCK SESSION TRANSCRIPT LOGS DETAILS MODAL */}
            {selectedSessionLog && (
                <div className="settings-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedSessionLog(null)}>
                    <div className="settings-modal transcript-modal">
                        <div className="settings-header">
                            <h2>📄 Session Logs — {selectedSessionLog.company}</h2>
                            <button className="settings-close" onClick={() => setSelectedSessionLog(null)}>✕</button>
                        </div>
                        <div className="transcript-modal-body">
                            <div style={{ display: 'flex', gap: '10px', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                                <span>Applied: <strong>{selectedSessionLog.position}</strong></span>
                                <span>•</span>
                                <span>Date: <strong>{selectedSessionLog.date}</strong></span>
                            </div>
                            {selectedSessionLog.transcript.map((log, index) => (
                                <div key={index} className="transcript-log-item">
                                    <div className={`transcript-log-role ${log.role}`}>
                                        {log.role === 'user' ? 'Interviewer' : 'AI Copilot Answer'}
                                    </div>
                                    <div style={{ color: log.role === 'user' ? '#fff' : 'var(--text-primary)' }}>
                                        {log.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
