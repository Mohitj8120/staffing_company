import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, CreditCard, FileText, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Scene3D from '../components/Scene3D';
import '../index.css';
import { API_BASE_URL } from '../config';
import { useAuthContext } from '../context/AuthContext';

function Dashboard() {
  const navigate = useNavigate();
  const { user, getToken, logout, isAuthenticated, loading } = useAuthContext();
  const [userData, setUserData] = useState({ credits: 0, subscription_status: 'free' });
  const [resumes, setResumes] = useState([]);

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

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Immersive 3D Background */}
      <Scene3D />

      {/* Foreground Overlay */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, left: 0, 
          width: '100%', height: '100%', 
          overflowY: 'auto', 
          overflowX: 'hidden',
          zIndex: 10,
          padding: '2rem 5rem'
        }}
      >
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}
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
            <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 800 }} className="text-gradient">
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

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '3rem' }}>
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
              <button className="sidebar-btn active">
                <FileText size={20} /> My Resumes
              </button>
              <button className="sidebar-btn">
                <CreditCard size={20} /> Billing Settings
              </button>
              <button className="sidebar-btn">
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
            <div className="glass-panel" style={{ padding: '3rem' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'white' }}>Credit Balance</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '2rem' }}>
                <span style={{ fontSize: '4rem', fontWeight: 800 }} className="text-gradient-accent">
                  {userData.subscription_status === 'pro' ? '∞' : userData.credits}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
                  {userData.subscription_status === 'pro' ? 'unlimited credits (Pro)' : 'credits remaining'}
                </span>
              </div>
              <button onClick={handleCheckout} className="primary-btn" style={{ padding: '15px 30px', fontSize: '1.1rem' }}>
                Buy More Credits
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
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <div style={{ 
                        width: '40px', height: '40px', 
                        borderRadius: '10px', 
                        background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                      }}>
                        <FileText color="#050508" size={20} />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
