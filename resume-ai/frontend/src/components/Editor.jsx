import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Code2, Briefcase, Zap } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function Editor({ fileId, baseData, onOptimize, isProcessing, setIsProcessing }) {
  const [jd, setJd] = useState('');
  const [resumeJson, setResumeJson] = useState(JSON.stringify(baseData, null, 2));
  const [mode, setMode] = useState('standard');
  const [pageCount, setPageCount] = useState('auto');
  const [error, setError] = useState('');
  const [queueStatus, setQueueStatus] = useState(null);
  const [queuePosition, setQueuePosition] = useState(0);
  const { getToken } = useAuthContext();

  useEffect(() => {
    const cachedJd = localStorage.getItem('active_job_description');
    if (cachedJd) {
      setJd(cachedJd);
    }
  }, []);

  const handleOptimize = async () => {
    if (!jd.trim()) {
      setError('Please paste a Target Job Description');
      return;
    }
    
    setError('');
    setIsProcessing(true);
    setQueueStatus(null);
    setQueuePosition(0);
    
    const formData = new FormData();
    formData.append('file_id', fileId);
    formData.append('jd', jd);
    formData.append('resume_data', resumeJson);
    formData.append('mode', mode);
    formData.append('page_count', pageCount);
    
    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication required. Please sign in.');
        setIsProcessing(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      const result = await response.json();
      
      if (response.ok) {
        if (result.status === 'queued') {
          setQueueStatus('queued');
          setQueuePosition(result.position);
          
          const poll = async () => {
            try {
              const pollResponse = await fetch(`${API_BASE_URL}/api/queue-status/${result.job_id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (!pollResponse.ok) {
                const pollError = await pollResponse.json();
                setError(pollError.detail || 'Queue check failed');
                setIsProcessing(false);
                setQueueStatus(null);
                return;
              }
              
              const pollResult = await pollResponse.json();
              if (pollResult.status === 'queued') {
                setQueuePosition(pollResult.position);
                setTimeout(poll, 1000);
              } else if (pollResult.status === 'processing') {
                setQueueStatus('processing');
                setQueuePosition(0);
                setTimeout(poll, 1000);
              } else if (pollResult.status === 'success') {
                setQueueStatus(null);
                setIsProcessing(false);
                onOptimize(pollResult.optimized_data, { docx: pollResult.docx_url, pdf: pollResult.pdf_url, zip: pollResult.zip_url });
                localStorage.removeItem('active_job_description');
              } else if (pollResult.status === 'failed') {
                setError(pollResult.detail || 'Optimization failed');
                setIsProcessing(false);
                setQueueStatus(null);
              }
            } catch (err) {
              setError('Connection lost while polling queue status.');
              setIsProcessing(false);
              setQueueStatus(null);
            }
          };
          
          setTimeout(poll, 1000);
        } else {
          setIsProcessing(false);
          onOptimize(result.optimized_data, { docx: result.docx_url, pdf: result.pdf_url, zip: result.zip_url });
          localStorage.removeItem('active_job_description');
        }
      } else {
        setError(result.detail || 'Optimization failed');
        setIsProcessing(false);
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
      setIsProcessing(false);
    }
  };

  return (
    <div className="editor-grid">
      
      {/* Left Pane: Job Description */}
      <motion.div 
        className="glass-panel" 
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Briefcase color="var(--accent-secondary)" size={28} />
          <h3 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Target Job Description</h3>
        </div>
        
        <textarea 
          className="custom-input"
          style={{
            flex: 1,
            resize: 'none',
            lineHeight: '1.8',
            fontSize: '1.1rem'
          }}
          placeholder="Paste the target job description here. Our neural engine will extract keywords, tone, and requirements to perfectly tailor your resume..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          disabled={isProcessing}
        />
      </motion.div>

      {/* Right Pane: Extracted Data & Action */}
      <motion.div 
        className="glass-panel" 
        style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid rgba(138,43,226,0.3)', overflowY: 'auto' }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Code2 color="var(--accent-color)" size={28} />
          <h3 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Parsed Neural Data</h3>
        </div>

        <textarea 
          className="custom-input"
          style={{
            minHeight: '180px',
            fontFamily: "'Fira Code', 'Courier New', monospace",
            fontSize: '0.95rem',
            color: 'var(--accent-secondary)',
            resize: 'vertical',
            marginBottom: '2rem',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(0,242,254,0.2)'
          }}
          value={resumeJson}
          onChange={(e) => setResumeJson(e.target.value)}
          disabled={isProcessing}
        />

        {/* Configuration Options */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'white', fontWeight: 600 }}>Generation Mode</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <motion.div
              whileHover={{ scale: 1.03, rotateX: 5, rotateY: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('standard')}
              style={{
                padding: '1.2rem',
                borderRadius: '12px',
                background: mode === 'standard' ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                border: mode === 'standard' ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                boxShadow: mode === 'standard' ? '0 0 20px rgba(0, 242, 254, 0.3)' : 'none',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>📄</div>
              <div style={{ fontWeight: 700, color: 'white' }}>Standard Tailor</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Uses standard ATS-friendly layout</div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, rotateX: 5, rotateY: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMode('redesign')}
              style={{
                padding: '1.2rem',
                borderRadius: '12px',
                background: mode === 'redesign' ? 'linear-gradient(135deg, rgba(138,43,226,0.2), rgba(0,242,254,0.1))' : 'rgba(255, 255, 255, 0.03)',
                border: mode === 'redesign' ? '1px solid #8a2be2' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                boxShadow: mode === 'redesign' ? '0 0 25px rgba(138, 43, 226, 0.4)' : 'none',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ fontSize: '1.5rem' }}>🪄</div>
              <div style={{ fontWeight: 700, color: 'white' }}>Magic Redesign</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Premium styling customized for your role</div>
            </motion.div>
          </div>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'white', fontWeight: 600 }}>Resume Length</h4>
          <div style={{ 
            display: 'flex', 
            background: 'rgba(0,0,0,0.4)', 
            padding: '5px', 
            borderRadius: '100px', 
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative'
          }}>
            {['1', '2', 'auto'].map((len) => (
              <div 
                key={len}
                onClick={() => setPageCount(len)}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '10px 0',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 1,
                  fontWeight: pageCount === len ? 700 : 500,
                  color: pageCount === len ? '#050508' : 'var(--text-muted)',
                  transition: 'color 0.3s ease'
                }}
              >
                {pageCount === len && (
                  <motion.div
                    layoutId="pill"
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
                      borderRadius: '100px',
                      zIndex: -1,
                      boxShadow: '0 0 15px rgba(0,242,254,0.4)'
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                {len === 'auto' ? 'Auto' : `${len} Page${len === '2' ? 's' : ''}`}
              </div>
            ))}
          </div>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            style={{ 
              color: '#ff4b4b', 
              marginBottom: '1.5rem', 
              textAlign: 'center', 
              fontWeight: 600, 
              background: 'rgba(255, 75, 75, 0.1)', 
              padding: '1rem', 
              borderRadius: '12px',
              border: '1px solid rgba(255, 75, 75, 0.3)'
            }}
          >
            {error}
          </motion.div>
        )}
        
        <button 
          className="primary-btn" 
          style={{ 
            width: '100%', 
            padding: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '1rem',
            fontSize: '1.2rem',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginTop: 'auto'
          }}
          onClick={handleOptimize}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <motion.div
                animate={queueStatus === 'queued' ? { scale: [1, 1.2, 1] } : { rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <Zap color={queueStatus === 'queued' ? 'var(--accent-secondary)' : 'white'} />
              </motion.div>
              {queueStatus === 'queued' 
                ? `Queued (Position #${queuePosition} - Wait ~${queuePosition * 3}s)` 
                : queueStatus === 'processing' 
                  ? 'Processing Optimization...' 
                  : 'Re-engineering Resume...'}
            </>
          ) : (
            <>
              <Sparkles />
              Engage Optimization
            </>
          )}
        </button>
      </motion.div>
      
    </div>
  );
}
