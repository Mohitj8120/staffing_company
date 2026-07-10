import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Wand2, DownloadCloud, ChevronRight, RefreshCw, Zap, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import Scene3D from '../components/Scene3D';
import FileUpload from '../components/FileUpload';
import Editor from '../components/Editor';
import '../index.css';
import { API_BASE_URL } from '../config';
import { useAuthContext } from '../context/AuthContext';
import PricingModal from '../components/PricingModal';
import { captureFromURL, getReferral } from '../utils/affiliateTracker';

function Landing() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [fileId, setFileId] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [optimizedData, setOptimizedData] = useState(null);
  const [urls, setUrls] = useState({ docx: null, pdf: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  const { user, loginWithGoogle, logout, isAuthenticated, getToken } = useAuthContext();
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  const [googleReady, setGoogleReady] = useState(false);

  // Clipboard Auto-Detect States
  const [isListening, setIsListening] = useState(() => {
    return localStorage.getItem('auto_jd_detector_active') === 'true';
  });
  const [lastClipboardText, setLastClipboardText] = useState('');
  const [showDetectedModal, setShowDetectedModal] = useState(false);
  const [detectedTextType, setDetectedTextType] = useState(''); // 'url' or 'text'
  const [clipboardContent, setClipboardContent] = useState('');
  const [scrapingLoader, setScrapingLoader] = useState(false);
  const [activeJd, setActiveJd] = useState(() => {
    return localStorage.getItem('active_job_description') || '';
  });

  const toggleClipboardListening = async () => {
    if (!isListening) {
      try {
        const text = await navigator.clipboard.readText();
        setLastClipboardText(text);
        setIsListening(true);
        localStorage.setItem('auto_jd_detector_active', 'true');
      } catch (err) {
        alert("Clipboard read permission denied. Please grant permission in browser settings.");
      }
    } else {
      setIsListening(false);
      localStorage.setItem('auto_jd_detector_active', 'false');
    }
  };

  const handleAcceptClipboardJd = async () => {
    let jdText = "";
    if (detectedTextType === 'text') {
      jdText = clipboardContent;
      setActiveJd(clipboardContent);
      localStorage.setItem('active_job_description', clipboardContent);
      setShowDetectedModal(false);
    } else {
      // It's a URL
      setScrapingLoader(true);
      setShowDetectedModal(false);
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE_URL}/api/extract-jd`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ url: clipboardContent })
        });
        const data = await res.json();
        if (res.ok && data.text) {
          jdText = data.text;
          setActiveJd(data.text);
          localStorage.setItem('active_job_description', data.text);
        } else {
          alert(data.detail || "Failed to extract job description. Please copy the description text manually instead.");
          setScrapingLoader(false);
          return;
        }
      } catch (err) {
        alert("Scraping failed due to connection error. Please copy the job description text manually instead.");
        setScrapingLoader(false);
        return;
      } finally {
        setScrapingLoader(false);
      }
    }

    if (jdText) {
      // Check if we already have a base resume loaded in state
      if (resumeData && fileId) {
        setStep(2);
      } else {
        // Fetch the user's most recent base resume from the backend to auto-redirect
        setScrapingLoader(true);
        try {
          const token = await getToken();
          const resumesRes = await fetch(`${API_BASE_URL}/api/resumes`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (resumesRes.ok) {
            const list = await resumesRes.json();
            if (list && list.length > 0) {
              const recentResume = list[0];
              setFileId(recentResume.id);
              setResumeData(recentResume.data);
              setStep(2);
            } else {
              alert("Job details loaded! Now please upload your base resume (DOCX) below to begin.");
            }
          } else {
            alert("Job details loaded! Now please upload your base resume (DOCX) below to begin.");
          }
        } catch (e) {
          alert("Job details loaded! Now please upload your base resume (DOCX) below to begin.");
        } finally {
          setScrapingLoader(false);
        }
      }
    }
  };

  const checkClipboard = async () => {
    if (!isListening) return;
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text || text === lastClipboardText) return;
      
      const isUrl = text.startsWith('http://') || text.startsWith('https://');
      const lowerText = text.toLowerCase();
      const keywords = ['job description', 'responsibilities', 'qualifications', 'requirements', 'about the role', 'what you will do'];
      const keywordMatch = keywords.filter(k => lowerText.includes(k)).length >= 2;
      
      if (isUrl || keywordMatch) {
        setClipboardContent(text);
        setDetectedTextType(isUrl ? 'url' : 'text');
        setShowDetectedModal(true);
        setLastClipboardText(text);
      }
    } catch (e) {
      console.warn("Clipboard check failed:", e);
    }
  };

  useEffect(() => {
    window.addEventListener('focus', checkClipboard);
    return () => window.removeEventListener('focus', checkClipboard);
  }, [isListening, lastClipboardText]);

  useEffect(() => {
    // Only init Google if NOT authenticated
    if (isAuthenticated) return;

    const initGoogle = () => {
      if (!window.google) return false;

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "335198038743-mockclientid.apps.googleusercontent.com",
        callback: async (response) => {
          try {
            await loginWithGoogle(response.credential);
          } catch (err) {
            alert("Google Login failed: " + err.message);
          }
        }
      });

      // Render buttons into any existing containers
      const containers = ['google-signin-button', 'google-signin-button-hero', 'google-signin-button-mobile'];
      containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          window.google.accounts.id.renderButton(el, {
            theme: "dark", size: "large", shape: "pill"
          });
        }
      });

      setGoogleReady(true);
      return true;
    };

    // Try immediately, then retry a few times if google script hasn't loaded yet
    if (!initGoogle()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (initGoogle() || attempts > 20) {
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Re-render Google buttons when containers appear (step changes)
  useEffect(() => {
    if (isAuthenticated || !window.google || !googleReady) return;

    // Small delay to ensure DOM containers are mounted
    const timer = setTimeout(() => {
      const containers = ['google-signin-button', 'google-signin-button-hero', 'google-signin-button-mobile'];
      containers.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.childElementCount === 0) {
          window.google.accounts.id.renderButton(el, {
            theme: "dark", size: "large", shape: "pill"
          });
        }
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [step, isLoaded, isAuthenticated, googleReady]);

  const location = useLocation();

  useEffect(() => {
    // Cinematic load sequence
    setTimeout(() => {
      setIsLoaded(true);
    }, 800);
    
    // Check if we came from dashboard with a selected resume
    if (location.state && location.state.fileId && location.state.resumeData) {
      setFileId(location.state.fileId);
      setResumeData(location.state.resumeData);
      setStep(2);
    }
  }, [location.state]);

  // Capture affiliate referral from URL on mount
  useEffect(() => {
    const ref = captureFromURL();
    if (ref) {
      // Track the click with the backend
      fetch(`${API_BASE_URL}/api/affiliate/track-click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: ref,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null
        })
      }).catch(() => {});
    }
  }, []);

  const getDownloadUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `${API_BASE_URL}${url}`;
  };

  const handleUploadComplete = (id, data) => {
    setFileId(id);
    setResumeData(data);
    navigate('/dashboard');
  };

  const handleOptimizeComplete = (optimized, links) => {
    setOptimizedData(optimized);
    setUrls(links);
    setStep(3);
  };

  const steps = [
    { num: 1, title: "Upload", icon: FileText, color: "#9494a8", activeColor: "#8a2be2" },
    { num: 2, title: "Tailor", icon: Wand2, color: "#9494a8", activeColor: "#00f2fe" },
    { num: 3, title: "Download", icon: DownloadCloud, color: "#9494a8", activeColor: "#fff" }
  ];

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
          zIndex: 10
        }}
      >
        <AnimatePresence>
          {!isLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: '#050508',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 100
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <Zap color="#00f2fe" size={50} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isLoaded && (
            <motion.header 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              className="landing-header"
            >
              {/* Logo */}
              <motion.div 
                whileHover={{ scale: 1.05, textShadow: '0 0 20px rgba(138,43,226,0.8)' }}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}
                onClick={() => { setStep(1); setFileId(null); setResumeData(null); }}
              >
                <div className="landing-logo-icon">
                  <Zap color="white" size={20} />
                </div>
                <h1 className="landing-logo-text text-gradient">
                  Resume<span style={{color: 'var(--accent-secondary)'}}>AI</span>
                </h1>
              </motion.div>

              {/* Timeline Stepper — Desktop */}
              <div className="landing-stepper-desktop">
                {steps.map((s, idx) => (
                  <React.Fragment key={s.num}>
                    <motion.div 
                      whileHover={{ scale: step >= s.num ? 1.05 : 1 }}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: step >= s.num ? s.activeColor : s.color,
                        opacity: step >= s.num ? 1 : 0.4,
                        transition: 'all 0.5s ease'
                      }}
                    >
                      <s.icon size={18} style={{ filter: step >= s.num ? `drop-shadow(0 0 8px ${s.activeColor})` : 'none' }} />
                      <span className="stepper-label">{s.title}</span>
                    </motion.div>
                    {idx < steps.length - 1 && (
                      <ChevronRight size={16} color={step > s.num ? 'var(--accent-secondary)' : '#333'} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Auth Section — Desktop */}
              <div className="landing-auth-desktop">
                <button 
                  onClick={() => setPricingOpen(true)}
                  className="dashboard-btn"
                  style={{ marginRight: '0.2rem' }}
                >
                  Pricing
                </button>
                <button 
                  onClick={() => alert("Coming soon to the Chrome Web Store! For now, please load the 'JD reader' folder unpacked via chrome://extensions/")}
                  className="chrome-btn"
                >
                  Add to Chrome
                </button>

                 {isLocalhost && !isAuthenticated && (
                   <button
                     onClick={async () => {
                       try {
                         await loginWithGoogle("mock_credential_for_local_admin");
                       } catch (err) {
                         alert("Bypass failed: " + err.message);
                       }
                     }}
                     className="primary-btn"
                     style={{
                       padding: '8px 16px',
                       fontSize: '0.9rem',
                       borderRadius: '8px',
                       background: 'linear-gradient(135deg, #10b981, #059669)',
                       border: 'none',
                       color: 'white',
                       cursor: 'pointer',
                       fontWeight: 'bold',
                       boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                       marginRight: '0.5rem'
                     }}
                   >
                     🚀 Dev Bypass
                   </button>
                 )}
                 <div id="google-signin-button" style={{ display: isAuthenticated ? 'none' : 'block', minHeight: '40px' }}></div>
                
                {isAuthenticated && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                      <button className="dashboard-btn">Dashboard</button>
                    </Link>
                    <button 
                      onClick={logout}
                      className="signout-btn"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
              </button>
            </motion.header>
          )}
        </AnimatePresence>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mobile-menu-dropdown"
            >
              {/* Stepper in mobile menu */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {steps.map((s) => (
                  <div key={s.num} style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    color: step >= s.num ? s.activeColor : s.color,
                    opacity: step >= s.num ? 1 : 0.4,
                    fontSize: '0.85rem', fontWeight: 700
                  }}>
                    <s.icon size={16} />
                    <span>{s.title}</span>
                  </div>
                ))}
              </div>

              {/* Auth buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center' }}>
                <button 
                  onClick={() => { setPricingOpen(true); setMobileMenuOpen(false); }}
                  className="dashboard-btn"
                  style={{ width: '100%' }}
                >
                  Pricing
                </button>
                <button 
                  onClick={() => { alert("Coming soon to the Chrome Web Store!"); setMobileMenuOpen(false); }}
                  className="chrome-btn"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Add to Chrome
                </button>

                <div id="google-signin-button-mobile" style={{ display: isAuthenticated ? 'none' : 'block', minHeight: '40px' }}></div>
                
                {isAuthenticated && (
                  <>
                    <Link to="/dashboard" style={{ textDecoration: 'none', width: '100%' }} onClick={() => setMobileMenuOpen(false)}>
                      <button className="dashboard-btn" style={{ width: '100%' }}>Dashboard</button>
                    </Link>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="signout-btn" style={{ width: '100%' }}>
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="landing-main">
          <AnimatePresence mode="wait">
            {step === 1 && isLoaded && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.9, y: 50, filter: 'blur(15px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '100%', maxWidth: '1000px' }}
              >
                <div className="hero-text-section">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                  >
                    <span className="hero-badge">
                      Next-Generation AI Optimization
                    </span>
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="hero-heading"
                  >
                    Craft your perfect resume <br className="hero-br" />
                    <span className="text-gradient-accent">in seconds.</span>
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="hero-subtext"
                  >
                    Upload your standard DOCX and watch our neural engine perfectly align it with your dream job. No effort, maximum impact.
                  </motion.p>

                  {/* Affiliate CTA Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.8 }}
                  >
                    <Link to="/affiliate" style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(0,242,254,0.06))',
                        border: '1px solid rgba(16,185,129,0.25)',
                        padding: '10px 22px',
                        borderRadius: '50px',
                        color: '#10b981',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        marginTop: '1rem'
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(0,242,254,0.12))'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(0,242,254,0.06))'; e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        💰 Have an audience on LinkedIn? Earn 25% by referring job seekers. <span style={{ color: '#00f2fe', fontWeight: 800 }}>Become an Affiliate →</span>
                      </div>
                    </Link>
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8, type: "spring", bounce: 0.4 }}
                >
                  <div style={{ display: isAuthenticated ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', textAlign: 'center' }}>Please sign in to upload and optimize your resume.</p>
                    {isLocalhost && (
                      <button
                        onClick={async () => {
                          try {
                            await loginWithGoogle("mock_credential_for_local_admin");
                          } catch (err) {
                            alert("Bypass failed: " + err.message);
                          }
                        }}
                        className="primary-btn"
                        style={{
                          padding: '12px 24px',
                          fontSize: '1rem',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                        }}
                      >
                        🚀 Dev Bypass Login (No Google OAuth Required)
                      </button>
                    )}
                    <div id="google-signin-button-hero" style={{ minHeight: '40px', display: isLocalhost ? 'none' : 'block' }}></div>
                  </div>
                  
                  {isAuthenticated && (
                    <div className="auto-detector-bar">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          width: '8px', height: '8px', borderRadius: '50%', 
                          background: isListening ? '#00e5ff' : 'rgba(255,255,255,0.2)',
                          boxShadow: isListening ? '0 0 10px #00e5ff' : 'none',
                          display: 'inline-block',
                          animation: isListening ? 'pulse 1.5s infinite' : 'none'
                        }}></span>
                        <span style={{ fontWeight: 600 }}>Auto Job Detector:</span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {isListening 
                            ? "Just copy any Job Link & return here to auto-tailor" 
                            : "Monitoring paused. Turn on to enable auto-detect"}
                        </span>
                      </div>
                      <button
                        onClick={toggleClipboardListening}
                        style={{
                          background: isListening ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                          border: isListening ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '5px 12px',
                          borderRadius: '20px',
                          color: isListening ? '#ef4444' : '#10b981',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                      >
                        {isListening ? "Turn Off" : "Turn On"}
                      </button>
                    </div>
                  )}

                  {activeJd && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(138, 43, 226, 0.15))',
                        border: '1px solid rgba(0, 242, 254, 0.3)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 0 25px rgba(0, 242, 254, 0.2)',
                        backdropFilter: 'blur(10px)',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          background: 'rgba(0, 229, 255, 0.2)',
                          display: 'flex', justifyContent: 'center', alignItems: 'center',
                          color: '#00e5ff', fontSize: '1.2rem'
                        }}>
                          ✨
                        </div>
                        <div>
                          <h4 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: 600 }}>Active Job Description Loaded</h4>
                          <p style={{ margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Please upload your base resume (DOCX) below to begin automatic tailoring.</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            localStorage.removeItem('active_job_description');
                            setActiveJd('');
                          }}
                          style={{
                            background: 'rgba(255, 75, 75, 0.15)',
                            border: '1px solid rgba(255, 75, 75, 0.3)',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            color: '#ff4b4b',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Clear JD
                        </button>
                        <span style={{
                          fontSize: '0.8rem',
                          background: 'rgba(0, 229, 255, 0.1)',
                          border: '1px solid rgba(0, 229, 255, 0.3)',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          color: '#00e5ff',
                          fontWeight: 600
                        }}>
                          Ready
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {isAuthenticated && (
                    <FileUpload onUpload={handleUploadComplete} isProcessing={isProcessing} setIsProcessing={setIsProcessing} />
                  )}
                </motion.div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '100%', height: '100%', maxWidth: '1600px' }}
              >
                <Editor 
                  fileId={fileId} 
                  baseData={resumeData} 
                  onOptimize={handleOptimizeComplete}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                className="glass-panel step3-panel"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 150, damping: 15 }}
                  className="step3-success-icon"
                >
                  <Zap color="white" size={50} />
                </motion.div>

                <h2 className="step3-heading text-gradient-accent">Masterpiece Ready.</h2>
                <p className="step3-subtext">
                  Your resume has been completely re-engineered for maximum ATS compliance and human impact.
                </p>
                
                <div className="step3-downloads">
                  {urls.docx && (
                    <a href={getDownloadUrl(urls.docx)} download style={{ textDecoration: 'none' }}>
                      <button className="primary-btn download-btn">
                        <DownloadCloud size={22} />
                        Download DOCX
                      </button>
                    </a>
                  )}
                  {urls.pdf ? (
                    <a href={getDownloadUrl(urls.pdf)} download style={{ textDecoration: 'none' }}>
                      <button className="primary-btn download-btn download-btn-secondary">
                        <DownloadCloud size={22} />
                        Download PDF
                      </button>
                    </a>
                  ) : (
                    <div style={{ width: '100%', color: 'var(--text-muted)', fontSize: '1rem', marginTop: '1rem', textAlign: 'center' }}>
                      Note: PDF conversion unavailable on this host.
                    </div>
                  )}
                  {urls.zip && (
                    <a href={getDownloadUrl(urls.zip)} download style={{ textDecoration: 'none' }}>
                      <button className="primary-btn download-btn download-btn-secondary" style={{ marginTop: '0.8rem' }}>
                        <DownloadCloud size={22} />
                        Download Folder (ZIP)
                      </button>
                    </a>
                  )}
                </div>
                
                <div style={{ marginTop: '3rem' }}>
                  <button 
                    onClick={() => { setStep(1); setFileId(null); setResumeData(null); }}
                    className="start-over-btn"
                  >
                    <RefreshCw size={18} />
                    Start Over with a new Job
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer section */}
        <footer style={{
          marginTop: '6rem',
          padding: '4rem 2rem 2rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(5, 5, 10, 0.4)',
          backdropFilter: 'blur(20px)',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: '1200px',
            flexWrap: 'wrap',
            gap: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #00f2fe 0%, #8a2be2 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 900, fontSize: '1rem', color: '#030306' }}>A</span>
              </div>
              <span style={{ fontWeight: 800, letterSpacing: '0.5px', color: 'white' }}>AVERION CAREERS</span>
            </div>

            <div style={{
              display: 'flex',
              gap: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <Link to="/about" style={{ color: '#9494a8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#00f2fe'} onMouseLeave={(e) => e.target.style.color = '#9494a8'}>About Us</Link>
              <Link to="/faq" style={{ color: '#9494a8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#00f2fe'} onMouseLeave={(e) => e.target.style.color = '#9494a8'}>FAQ</Link>
              <Link to="/terms" style={{ color: '#9494a8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#00f2fe'} onMouseLeave={(e) => e.target.style.color = '#9494a8'}>Terms & Conditions</Link>
              <Link to="/privacy" style={{ color: '#9494a8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#00f2fe'} onMouseLeave={(e) => e.target.style.color = '#9494a8'}>Privacy Policy</Link>
              <Link to="/refund" style={{ color: '#ef4444', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s', fontWeight: 600 }} onMouseEnter={(e) => e.target.style.color = '#ff6b6b'} onMouseLeave={(e) => e.target.style.color = '#ef4444'}>Refund Policy</Link>
              <Link to="/cookies" style={{ color: '#9494a8', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#00f2fe'} onMouseLeave={(e) => e.target.style.color = '#9494a8'}>Cookies Policy</Link>
              <Link to="/affiliate" style={{ color: '#10b981', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s', fontWeight: 600 }} onMouseEnter={(e) => e.target.style.color = '#00f2fe'} onMouseLeave={(e) => e.target.style.color = '#10b981'}>Affiliate Program</Link>
            </div>
          </div>
          <div style={{ color: '#52526b', fontSize: '0.8rem', marginTop: '1rem' }}>
            &copy; {new Date().getFullYear()} Averion Careers. All rights reserved.
          </div>
        </footer>
      </div>

      {/* Sleek Top Clipboard Notification Dropdown */}
      <AnimatePresence>
        {showDetectedModal && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 1002,
            pointerEvents: 'none'
          }}>
            <motion.div 
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                width: '90%',
                maxWidth: '430px',
                pointerEvents: 'auto',
                background: 'rgba(10, 10, 18, 0.9)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 242, 254, 0.15)',
                backdropFilter: 'blur(20px)',
                padding: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(0, 229, 255, 0.15)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  fontSize: '1.2rem', color: '#00e5ff', flexShrink: 0
                }}>
                  🎯
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, color: 'white', fontSize: '0.95rem', fontWeight: 700 }}>
                    {detectedTextType === 'url' ? 'Job Link Detected' : 'Job Text Detected'}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                    Auto-extract this job and redirect straight to the tailor screen?
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => setShowDetectedModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Dismiss
                </button>
                <button 
                  onClick={handleAcceptClipboardJd}
                  style={{
                    background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
                    border: 'none',
                    color: '#050508',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0, 242, 254, 0.3)'
                  }}
                >
                  Auto-Tailor Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scraping Loader Overlay */}
      <AnimatePresence>
        {scrapingLoader && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(5, 5, 8, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1001,
              backdropFilter: 'blur(10px)',
              gap: '20px'
            }}
          >
            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#00e5ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 600 }}>Extracting Job Details...</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Scraping page and parsing qualifications...</div>
          </motion.div>
        )}
      </AnimatePresence>

      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
  );
}

export default Landing;
