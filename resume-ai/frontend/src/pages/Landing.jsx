import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Wand2, DownloadCloud, ChevronRight, RefreshCw, Zap } from 'lucide-react';
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

  const { user, loginWithGoogle, logout, isAuthenticated } = useAuthContext();

  useEffect(() => {
    const initGoogle = () => {
      if (window.google && !isAuthenticated) {
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
        
        const btnContainer = document.getElementById("google-signin-button");
        if (btnContainer) {
          window.google.accounts.id.renderButton(
            btnContainer,
            { theme: "dark", size: "large", shape: "pill" }
          );
        }

        const heroBtnContainer = document.getElementById("google-signin-button-hero");
        if (heroBtnContainer) {
          window.google.accounts.id.renderButton(
            heroBtnContainer,
            { theme: "dark", size: "large", shape: "pill" }
          );
        }
      }
    };

    initGoogle();
    const interval = setInterval(() => {
      if (window.google) {
        initGoogle();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isAuthenticated, step, isLoaded]);

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
              style={{ 
                padding: '2.5rem 6rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'linear-gradient(to bottom, rgba(5,5,8,0.9), transparent)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 50
              }}
            >
              <motion.div 
                whileHover={{ scale: 1.05, textShadow: '0 0 20px rgba(138,43,226,0.8)' }}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}
                onClick={() => { setStep(1); setFileId(null); setResumeData(null); }}
              >
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
                  Resume<span style={{color: 'var(--accent-secondary)'}}>AI</span>
                </h1>
              </motion.div>

              {/* Advanced Timeline Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                {steps.map((s, idx) => (
                  <React.Fragment key={s.num}>
                    <motion.div 
                      whileHover={{ scale: step >= s.num ? 1.05 : 1 }}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.8rem',
                        color: step >= s.num ? s.activeColor : s.color,
                        opacity: step >= s.num ? 1 : 0.4,
                        transition: 'all 0.5s ease'
                      }}
                    >
                      <s.icon size={22} style={{ filter: step >= s.num ? `drop-shadow(0 0 8px ${s.activeColor})` : 'none' }} />
                      <span style={{ fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', fontSize: '0.9rem' }}>{s.title}</span>
                    </motion.div>
                    {idx < steps.length - 1 && (
                      <ChevronRight size={20} color={step > s.num ? 'var(--accent-secondary)' : '#333'} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Auth Section */}
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
                    boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Add to Chrome
                </button>

                {!isAuthenticated ? (
                  <div id="google-signin-button" style={{ minHeight: '40px' }}></div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <Link to="/dashboard" style={{ textDecoration: 'none' }}>
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
                        Dashboard
                      </button>
                    </Link>
                    <button 
                      onClick={logout}
                      className="primary-btn"
                      style={{ 
                        background: 'rgba(255, 75, 75, 0.1)', 
                        border: '1px solid rgba(255, 75, 75, 0.3)', 
                        color: '#ff4b4b',
                        fontSize: '0.9rem',
                        padding: '10px 20px',
                        boxShadow: 'none'
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        <main style={{ padding: '2rem 5rem 6rem 5rem', minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
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
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                  >
                    <span style={{ 
                      padding: '10px 24px', 
                      background: 'rgba(0, 242, 254, 0.1)', 
                      border: '1px solid rgba(0, 242, 254, 0.3)',
                      borderRadius: '100px',
                      color: '#00f2fe',
                      fontWeight: 700,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      fontSize: '0.85rem',
                      display: 'inline-block',
                      marginBottom: '2rem',
                      boxShadow: '0 0 20px rgba(0,242,254,0.2)'
                    }}>
                      Next-Generation AI Optimization
                    </span>
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    style={{ fontSize: '5.5rem', marginBottom: '1.5rem', lineHeight: '1.1', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  >
                    Craft your perfect resume <br/>
                    <span className="text-gradient-accent">in seconds.</span>
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    style={{ fontSize: '1.4rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}
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
                      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Please sign in to upload and optimize your resume.</p>
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
                style={{ width: '100%', maxWidth: '800px', textAlign: 'center' }}
                className="glass-panel"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 150, damping: 15 }}
                  style={{ 
                    width: '120px', height: '120px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-color))',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    margin: '0 auto 2.5rem auto',
                    boxShadow: '0 0 60px var(--accent-secondary-glow)'
                  }}
                >
                  <Zap color="white" size={60} />
                </motion.div>

                <h2 style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }} className="text-gradient-accent">Masterpiece Ready.</h2>
                <p style={{ fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: '4rem' }}>
                  Your resume has been completely re-engineered for maximum ATS compliance and human impact.
                </p>
                
                <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {urls.docx && (
                    <a href={`${API_BASE_URL}${urls.docx}`} download style={{ textDecoration: 'none' }}>
                      <button className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.3rem', padding: '20px 50px' }}>
                        <DownloadCloud size={26} />
                        Download DOCX
                      </button>
                    </a>
                  )}
                  {urls.zip ? (
                    <a href={`${API_BASE_URL}${urls.zip}`} download style={{ textDecoration: 'none' }}>
                      <button 
                        className="primary-btn" 
                        style={{ 
                          background: 'rgba(255,255,255,0.05)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          display: 'flex', alignItems: 'center', gap: '12px',
                          fontSize: '1.3rem', padding: '20px 50px',
                          boxShadow: 'none'
                        }}
                      >
                        <DownloadCloud size={26} />
                        Download Folder (ZIP)
                      </button>
                    </a>
                  ) : urls.pdf ? (
                    <a href={`${API_BASE_URL}${urls.pdf}`} download style={{ textDecoration: 'none' }}>
                      <button 
                        className="primary-btn" 
                        style={{ 
                          background: 'rgba(255,255,255,0.05)', 
                          border: '1px solid rgba(255,255,255,0.2)',
                          display: 'flex', alignItems: 'center', gap: '12px',
                          fontSize: '1.3rem', padding: '20px 50px',
                          boxShadow: 'none'
                        }}
                      >
                        <DownloadCloud size={26} />
                        Download PDF
                      </button>
                    </a>
                  ) : (
                    <div style={{ width: '100%', color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '1rem' }}>
                      Note: PDF conversion unavailable on this host.
                    </div>
                  )}
                </div>
                
                <div style={{ marginTop: '5rem' }}>
                  <button 
                    onClick={() => { setStep(1); setFileId(null); setResumeData(null); }}
                    style={{ 
                      background: 'transparent', 
                      color: 'var(--text-muted)', 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      margin: '0 auto',
                      fontSize: '1.2rem',
                      transition: 'all 0.3s',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = 'var(--text-main)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <RefreshCw size={20} />
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
