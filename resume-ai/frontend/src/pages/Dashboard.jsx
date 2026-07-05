import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, CreditCard, FileText, Settings, LogOut, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Scene3D from '../components/Scene3D';
import '../index.css';
import { API_BASE_URL } from '../config';
import { useAuthContext } from '../context/AuthContext';
import PricingModal from '../components/PricingModal';

function Dashboard() {
  const navigate = useNavigate();
  const { user, getToken, logout, isAuthenticated, loading } = useAuthContext();
  const [userData, setUserData] = useState({ credits: 0, subscription_status: 'free' });
  const [resumes, setResumes] = useState([]);
  const [activeTab, setActiveTab] = useState('resumes');
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  const [optStrategy, setOptStrategy] = useState("Advanced ATS tailoring (STAR Achievement focus)");
  const [defaultTone, setDefaultTone] = useState("Professional Executive (Standard Silicon Valley SDE/PM)");
  const [preserveGrades, setPreserveGrades] = useState(true);
  const [autoShorten, setAutoShorten] = useState(true);

  useEffect(() => {
    if (userData) {
      if (userData.opt_strategy) setOptStrategy(userData.opt_strategy);
      if (userData.default_tone) setDefaultTone(userData.default_tone);
      if (userData.preserve_grades !== undefined) setPreserveGrades(userData.preserve_grades);
      if (userData.auto_shorten !== undefined) setAutoShorten(userData.auto_shorten);
    }
  }, [userData]);

  const fetchAdminUsers = async () => {
    setAdminLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    async function fetchUserData() {
      if (!user) return;
      try {
        const token = await getToken();
        // Sync token to Chrome Extension via postMessage
        window.postMessage({ type: "SYNC_CLERK_TOKEN", token: token }, "*");
        // Fallback for race condition: broadcast every 2 seconds
        setInterval(() => window.postMessage({ type: "SYNC_CLERK_TOKEN", token: token }, "*"), 2000);
        
        // Fetch user credits
        const res = await fetch(`${API_BASE_URL}/api/me`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
        
        // Fetch base resumes
        const resumesRes = await fetch(`${API_BASE_URL}/api/resumes`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (resumesRes.ok) {
          const data = await resumesRes.json();
          setResumes(data);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    }
    fetchUserData();
  }, [user, getToken]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#050508' }}>
        <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600 }}>Loading Session...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleCheckout = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/checkout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      } else {
        console.error("Checkout failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteResume = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this base resume?")) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/resumes/${fileId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setResumes(resumes.filter(r => r.id !== fileId));
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to delete resume");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete resume due to connection error.");
    }
  };

  const handleSavePreferences = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/me/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          opt_strategy: optStrategy,
          default_tone: defaultTone,
          preserve_grades: preserveGrades,
          auto_shorten: autoShorten
        })
      });
      if (res.ok) {
        alert("Preferences saved successfully!");
        // Sync user state
        const userRes = await fetch(`${API_BASE_URL}/api/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (userRes.ok) {
          const data = await userRes.json();
          setUserData(data);
        }
      } else {
        alert("Failed to save preferences.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving preferences.");
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Immersive 3D Background */}
      <Scene3D />

      {/* Foreground Overlay */}
      <div className="dashboard-overlay">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ 
              width: '45px', height: '45px', 
              borderRadius: '14px', 
              background: 'linear-gradient(135deg, var(--accent-color), var(--accent-secondary))',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 0 25px var(--accent-glow)'
            }}>
              <Zap color="white" size={24} />
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', margin: 0, fontWeight: 800 }} className="text-gradient">
              Dashboard
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button 
              onClick={() => alert("Coming soon to the Chrome Web Store! For now, please load the 'JD reader' folder unpacked via chrome://extensions/")}
              style={{ 
                background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
                border: 'none',
                color: '#050508',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Add to Chrome
            </button>
            <button 
              onClick={() => setPricingOpen(true)}
              style={{ 
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                marginRight: '0.2rem'
              }}
            >
              Pricing
            </button>
            <Link to="/">
              <button 
                style={{ 
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Home
              </button>
            </Link>
          </div>
        </motion.header>

        <div className="dashboard-grid">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-panel"
            style={{ padding: '2rem', height: 'fit-content' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2rem' }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-color), var(--accent-secondary))',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                color: 'white', fontWeight: 'bold', fontSize: '1.5rem',
                boxShadow: '0 0 15px var(--accent-glow)'
              }}>
                {user.email.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>{user.email.split('@')[0]}</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.email}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                onClick={() => setActiveTab('resumes')}
                className={`sidebar-btn ${activeTab === 'resumes' ? 'active' : ''}`}
              >
                <FileText size={20} /> My Resumes
              </button>
              
              {user && user.email && user.email.toLowerCase().trim() === "mohitjain1619@gmail.com" && (
                <button 
                  onClick={() => {
                    setActiveTab('admin');
                    fetchAdminUsers();
                  }}
                  className={`sidebar-btn ${activeTab === 'admin' ? 'active' : ''}`}
                >
                  <Zap size={20} color="var(--accent-secondary)" /> Admin Panel
                </button>
              )}
              
              <button 
                onClick={() => setActiveTab('billing')}
                className={`sidebar-btn ${activeTab === 'billing' ? 'active' : ''}`}
              >
                <CreditCard size={20} /> Billing & Plan
              </button>
              <button 
                onClick={() => setActiveTab('preferences')}
                className={`sidebar-btn ${activeTab === 'preferences' ? 'active' : ''}`}
              >
                <Settings size={20} /> Preferences
              </button>
              <button 
                onClick={logout}
                className="sidebar-btn" 
                style={{ color: '#ff4b4b', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2rem' }}
              >
                <LogOut size={20} /> Sign Out
              </button>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {activeTab === 'admin' && (
              <div className="glass-panel" style={{ padding: '3rem', minHeight: '400px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'white' }}>Admin Control Center</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Registered Users and Platform Usage Metrics</p>
                
                {adminLoading ? (
                  <div style={{ color: 'var(--accent-secondary)', fontSize: '1.2rem', padding: '2rem 0' }}>Loading user registry...</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', minWidth: '600px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                          <th style={{ padding: '12px', color: 'var(--accent-secondary)' }}>ID</th>
                          <th style={{ padding: '12px', color: 'var(--accent-secondary)' }}>Email</th>
                          <th style={{ padding: '12px', color: 'var(--accent-secondary)' }}>Credits</th>
                          <th style={{ padding: '12px', color: 'var(--accent-secondary)' }}>Plan</th>
                          <th style={{ padding: '12px', color: 'var(--accent-secondary)' }}>Uploaded Resumes</th>
                          <th style={{ padding: '12px', color: 'var(--accent-secondary)' }}>Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers.map((u) => (
                          <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '12px' }}>{u.id}</td>
                            <td style={{ padding: '12px', fontWeight: 600 }}>{u.email}</td>
                            <td style={{ padding: '12px', color: u.credits > 0 ? '#00f2fe' : '#ff4b4b', fontWeight: 'bold' }}>{u.credits}</td>
                            <td style={{ padding: '12px', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                              <span style={{ 
                                background: u.subscription_status === 'pro' ? 'rgba(0,242,254,0.15)' : 'rgba(255,255,255,0.05)',
                                padding: '4px 8px', borderRadius: '4px', border: u.subscription_status === 'pro' ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.1)'
                              }}>
                                {u.subscription_status}
                              </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>{u.resume_count}</td>
                            <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{u.created_at}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="glass-panel" style={{ padding: '3rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'white' }}>Billing & Subscriptions</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>View usage limits, active plans, and billing history.</p>
                
                <div style={{
                  background: 'linear-gradient(135deg, rgba(138,43,226,0.15), rgba(0,229,255,0.05))',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px',
                  padding: '2rem',
                  marginBottom: '2.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.5rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Current Active Plan</span>
                    <h3 style={{ fontSize: '2.2rem', color: 'white', margin: '0.5rem 0', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {userData.is_admin ? 'ADMIN (PRO)' : (userData.subscription_status || 'free').toUpperCase()}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                      {userData.is_admin
                        ? 'Unlimited Admin optimization privileges activated.'
                        : (userData.subscription_status || 'free').toLowerCase() === 'free'
                        ? 'You are currently on the Free Starter plan with 3 lifetime resume optimizations.'
                        : `Your daily usage resets every 24 hours. Enjoy premium capabilities.`}
                    </p>
                  </div>
                  <button onClick={() => setPricingOpen(true)} className="primary-btn" style={{ padding: '12px 28px', fontSize: '1rem' }}>
                    Change Plan ⚡
                  </button>
                </div>

                <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '1rem' }}>Usage Constraints</h3>
                <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.01)', padding: '1.5rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                    <span style={{ color: 'white', fontWeight: 600 }}>Optimizations Allowed</span>
                    <span style={{ color: 'var(--accent-secondary)', fontWeight: 800 }}>
                      {userData.is_admin
                        ? '∞/∞ left (Unlimited Admin Access)'
                        : (userData.subscription_status || 'free').toLowerCase() === 'free'
                        ? `${Math.max(0, 3 - (userData.count_used || 0))}/3 left for your free plan`
                        : `${Math.max(0, (userData.limit_daily || 3) - (userData.count_used || 0))}/${userData.limit_daily || 3} left today`}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      background: 'linear-gradient(90deg, var(--accent-color), var(--accent-secondary))',
                      width: userData.is_admin
                        ? '100%'
                        : (userData.subscription_status || 'free').toLowerCase() === 'free'
                        ? `${Math.min(100, (Math.max(0, 3 - (userData.count_used || 0)) / 3) * 100)}%`
                        : `${Math.min(100, (Math.max(0, (userData.limit_daily || 3) - (userData.count_used || 0)) / (userData.limit_daily || 3)) * 100)}%`,
                      borderRadius: '10px',
                      transition: 'width 1s ease-in-out'
                    }} />
                  </div>
                </div>

                <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '1rem' }}>Recent Invoices</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Invoice ID</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Billing Date</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Amount</th>
                        <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(userData.subscription_status || 'free').toLowerCase() === 'free' && !userData.is_admin ? (
                        <tr>
                          <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No invoices generated. Upgrade your plan to start billing history.
                          </td>
                        </tr>
                      ) : (
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '12px' }}>INV-0982-P</td>
                          <td style={{ padding: '12px' }}>Today</td>
                          <td style={{ padding: '12px' }}>
                            {userData.is_admin || userData.subscription_status === 'pro' 
                              ? '₹849' 
                              : userData.subscription_status === 'starter' 
                              ? '₹449' 
                              : '₹1149'}
                          </td>
                          <td style={{ padding: '12px', color: 'var(--accent-secondary)' }}>Paid ✓</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="glass-panel" style={{ padding: '3rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'white' }}>Preferences & Configuration</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>Tailor the behavior of the AI optimization engine to your career style.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', color: 'white', fontWeight: 600, marginBottom: '0.8rem' }}>Optimization Strategy</label>
                    <select 
                      className="custom-input" 
                      style={{ width: '100%', padding: '1rem', background: '#0d0d14' }}
                      value={optStrategy}
                      onChange={(e) => setOptStrategy(e.target.value)}
                    >
                      <option value="Advanced ATS tailoring (STAR Achievement focus)">Advanced ATS tailoring (STAR Achievement focus)</option>
                      <option value="Strict Keyword Matching (Max keyword frequency density)">Strict Keyword Matching (Max keyword frequency density)</option>
                      <option value="Academic Score Retention & Protected Marks Mode">Academic Score Retention & Protected Marks Mode</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'white', fontWeight: 600, marginBottom: '0.8rem' }}>Default Output Style & Tone</label>
                    <select 
                      className="custom-input" 
                      style={{ width: '100%', padding: '1rem', background: '#0d0d14' }}
                      value={defaultTone}
                      onChange={(e) => setDefaultTone(e.target.value)}
                    >
                      <option value="Professional Executive (Standard Silicon Valley SDE/PM)">Professional Executive (Standard Silicon Valley SDE/PM)</option>
                      <option value="Corporate Classic (Consulting, Finance, Operations)">Corporate Classic (Consulting, Finance, Operations)</option>
                      <option value="Academic Researcher (Postgrad, Research Grants)">Academic Researcher (Postgrad, Research Grants)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '0.5rem 0' }}>
                    <input 
                      type="checkbox" 
                      id="preserve-scores" 
                      style={{ width: '20px', height: '20px', accentColor: 'var(--accent-secondary)' }} 
                      checked={preserveGrades}
                      onChange={(e) => setPreserveGrades(e.target.checked)}
                    />
                    <div>
                      <label htmlFor="preserve-scores" style={{ display: 'block', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Strict Grade Protection</label>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ensure GPAs, percentages, and course scores are not simplified or rewritten by the LLM.</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '0.5rem 0' }}>
                    <input 
                      type="checkbox" 
                      id="auto-minify" 
                      style={{ width: '20px', height: '20px', accentColor: 'var(--accent-secondary)' }} 
                      checked={autoShorten}
                      onChange={(e) => setAutoShorten(e.target.checked)}
                    />
                    <div>
                      <label htmlFor="auto-minify" style={{ display: 'block', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Auto-shorten Bullet Points</label>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Enforce strict 1-2 line limit on project/experience bullets for standard 1-page fit.</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleSavePreferences}
                    className="primary-btn" 
                    style={{ width: 'fit-content', padding: '14px 35px', marginTop: '1.5rem' }}
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'resumes' && (
              <>
                <div className="glass-panel" style={{ padding: '3rem' }}>
                  <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'white' }}>Credit Balance</h2>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '4.2rem', fontWeight: 800 }} className="text-gradient-accent">
                      {userData.is_admin
                        ? '∞/∞'
                        : (userData.subscription_status || 'free').toLowerCase() === 'free'
                        ? `${Math.max(0, 3 - (userData.count_used || 0))}/3`
                        : `${Math.max(0, (userData.limit_daily || 3) - (userData.count_used || 0))}/${userData.limit_daily || 3}`}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '1.25rem', fontWeight: 600 }}>
                      {userData.is_admin
                        ? 'left today (Unlimited Admin Access)'
                        : (userData.subscription_status || 'free').toLowerCase() === 'free'
                        ? 'left for your free plan'
                        : `left today (${(userData.subscription_status || 'starter').toUpperCase()} daily limit)`}
                    </span>
                  </div>
                  <button onClick={() => setPricingOpen(true)} className="primary-btn" style={{ padding: '15px 30px', fontSize: '1.1rem' }}>
                    Manage Subscription & Plan ⚡
                  </button>
                </div>

                <div style={{ marginTop: '3rem' }}>
                  <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '1.5rem' }}>Your Base Profiles</h2>
                  
                  {resumes.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      You haven't uploaded any base resumes yet. Use the Chrome Extension or upload one on the Home page to get started!
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                      {resumes.map((resume, idx) => (
                        <motion.div
                          key={resume.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}
                          onClick={() => navigate('/', { state: { fileId: resume.id, resumeData: resume.data } })}
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                            backdropFilter: 'blur(10px)',
                            position: 'relative'
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteResume(resume.id);
                            }}
                            style={{
                              position: 'absolute',
                              top: '1rem',
                              right: '1rem',
                              background: 'rgba(255, 75, 75, 0.1)',
                              border: '1px solid rgba(255, 75, 75, 0.3)',
                              borderRadius: '8px',
                              padding: '6px',
                              cursor: 'pointer',
                              color: '#ff4b4b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'background 0.2s',
                              zIndex: 10
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 75, 75, 0.3)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 75, 75, 0.1)'}
                            title="Delete base resume"
                          >
                            <Trash2 size={16} />
                          </button>

                          <div style={{ 
                            width: '40px', height: '40px', 
                            borderRadius: '10px', 
                            background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center'
                          }}>
                            <FileText color="#050508" size={20} />
                          </div>
                          <div>
                            <h4 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '2rem' }}>
                              {resume.title || resume.filename}
                            </h4>
                            <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                              Uploaded {resume.date}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
  );
}

export default Dashboard;
