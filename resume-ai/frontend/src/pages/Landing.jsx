import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Wand2, DownloadCloud, ChevronRight, RefreshCw, Zap, Menu, X } from 'lucide-react';
import { Link, useLocation } from "react-router-dom";
import Scene3D from '../components/Scene3D';
import FileUpload from '../components/FileUpload';
import Editor from '../components/Editor';
import '../index.css';
import { API_BASE_URL } from '../config';
import { useAuthContext } from '../context/AuthContext';

function Landing() {
  const [step, setStep] = useState(1);
  const [fileId, setFileId] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [optimizedData, setOptimizedData] = useState(null);
  const [urls, setUrls] = useState({ docx: null, pdf: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, loginWithGoogle, logout, isAuthenticated } = useAuthContext();

  const [googleReady, setGoogleReady] = useState(false);

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

  const handleUploadComplete = (id, data) => {
    setFileId(id);
    setResumeData(data);
    setStep(2);
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
                  onClick={() => alert("Coming soon to the Chrome Web Store! For now, please load the 'JD reader' folder unpacked via chrome://extensions/")}
                  className="chrome-btn"
                >
                  Add to Chrome
                </button>

                {!isAuthenticated ? (
                  <div id="google-signin-button" style={{ minHeight: '40px' }}></div>
                ) : (
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
                  onClick={() => { alert("Coming soon to the Chrome Web Store!"); setMobileMenuOpen(false); }}
                  className="chrome-btn"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Add to Chrome
                </button>

                {!isAuthenticated ? (
                  <div id="google-signin-button-mobile" style={{ minHeight: '40px' }}></div>
                ) : (
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
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8, type: "spring", bounce: 0.4 }}
                >
                  {isAuthenticated ? (
                    <FileUpload onUpload={handleUploadComplete} isProcessing={isProcessing} setIsProcessing={setIsProcessing} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', textAlign: 'center' }}>Please sign in to upload and optimize your resume.</p>
                      <div id="google-signin-button-hero" style={{ minHeight: '40px' }}></div>
                    </div>
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
                    <a href={`${API_BASE_URL}${urls.docx}`} download style={{ textDecoration: 'none' }}>
                      <button className="primary-btn download-btn">
                        <DownloadCloud size={22} />
                        Download DOCX
                      </button>
                    </a>
                  )}
                  {urls.zip ? (
                    <a href={`${API_BASE_URL}${urls.zip}`} download style={{ textDecoration: 'none' }}>
                      <button className="primary-btn download-btn download-btn-secondary">
                        <DownloadCloud size={22} />
                        Download Folder (ZIP)
                      </button>
                    </a>
                  ) : urls.pdf ? (
                    <a href={`${API_BASE_URL}${urls.pdf}`} download style={{ textDecoration: 'none' }}>
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
      </div>
    </div>
  );
}

export default Landing;
