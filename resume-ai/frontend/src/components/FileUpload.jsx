import React, { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function FileUpload({ onUpload, isProcessing, setIsProcessing }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [queuePosition, setQueuePosition] = useState(0);
  const inputRef = useRef(null);
  const { getToken } = useAuthContext();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith('.docx');
    const isPdf = file.type === "application/pdf" || file.name.endsWith('.pdf');
    if (!isDocx && !isPdf) {
      setError("We strictly require a standard .docx or .pdf format for flawless neural extraction.");
      return;
    }
    
    setError(null);
    setIsProcessing(true);
    setQueueStatus(null);
    setQueuePosition(0);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = await getToken();
      if (!token) {
        setError('Authentication required. Please sign in to upload.');
        setIsProcessing(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
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
                onUpload(pollResult.file_id, pollResult.data);
              } else if (pollResult.status === 'failed') {
                setError(pollResult.detail || 'Processing failed');
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
          if (result.status === 'duplicate') {
            alert("You have already uploaded this resume! Redirecting to JD optimization...");
          }
          onUpload(result.file_id, result.data);
        }
      } else {
        setError(result.detail || 'Upload failed due to server rejection.');
        setIsProcessing(false);
      }
    } catch (err) {
      setError('Neural link disconnected. Is the backend server online?');
      setIsProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <form 
        onDragEnter={handleDrag} 
        onSubmit={(e) => e.preventDefault()}
        style={{ position: 'relative' }}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept=".docx,.pdf"
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={isProcessing}
        />
        
        <motion.div 
          className={`glass-panel ${dragActive ? "drag-active" : ""}`}
          style={{ 
            height: 'clamp(250px, 40vw, 350px)',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: isProcessing ? 'wait' : 'pointer',
            textAlign: 'center',
            border: dragActive ? '2px dashed var(--accent-secondary)' : '2px dashed rgba(255,255,255,0.1)',
            background: dragActive ? 'rgba(0, 242, 254, 0.05)' : 'var(--panel-bg)'
          }}
          onClick={() => !isProcessing && inputRef.current.click()}
          animate={{ scale: dragActive ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          whileHover={{ scale: isProcessing ? 1 : 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
        >
          {isProcessing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '0 2rem' }}
            >
              {queueStatus === 'queued' ? (
                <>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      boxShadow: ['0 0 20px rgba(138,43,226,0.3)', '0 0 40px rgba(0,242,254,0.6)', '0 0 20px rgba(138,43,226,0.3)']
                    }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    style={{ 
                      width: '90px', height: '90px', 
                      borderRadius: '50%', 
                      background: 'rgba(5,5,8,0.6)',
                      border: '2px solid var(--accent-secondary)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>POS</span>
                    <span style={{ fontSize: '2rem', color: 'var(--accent-secondary)', fontWeight: 800 }}>#{queuePosition}</span>
                  </motion.div>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--text-main)', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>Server Busy</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0, maxWidth: '400px', lineHeight: '1.5' }}>
                    You are in the queue. Estimated processing wait is <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{queuePosition * 3}s</span>.
                  </p>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    style={{ 
                      width: '80px', height: '80px', 
                      borderRadius: '50%', 
                      border: '4px solid rgba(0, 242, 254, 0.1)',
                      borderTopColor: 'var(--accent-secondary)',
                      borderRightColor: 'var(--accent-color)',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      boxShadow: '0 0 30px var(--accent-secondary-glow)'
                    }}
                  >
                    <Zap color="var(--accent-secondary)" size={35} />
                  </motion.div>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--text-main)', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
                    {queueStatus === 'processing' ? 'Processing...' : 'Extracting Data...'}
                  </h3>
                  <p style={{ color: 'var(--accent-secondary)', fontSize: '1.1rem', margin: 0 }}>
                    {queueStatus === 'processing' ? 'Executing neural parsing protocols' : 'Initiating neural parsing protocols'}
                  </p>
                </>
              )}
            </motion.div>
          ) : (
            <>
              <motion.div 
                initial={{ y: 0 }}
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                style={{ 
                  background: 'linear-gradient(135deg, rgba(138,43,226,0.2), rgba(0,242,254,0.2))',
                  padding: '1.5rem',
                  borderRadius: '24px',
                  marginBottom: '2rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 2px 10px rgba(255,255,255,0.1)'
                }}
              >
                <UploadCloud size={45} color="var(--accent-secondary)" style={{ filter: 'drop-shadow(0 0 10px var(--accent-secondary))' }} />
              </motion.div>
              
              <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', marginBottom: '0.8rem', fontWeight: 700 }}>
                Drop your <span className="text-gradient-accent">Base Resume</span> here
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.9rem, 2vw, 1.2rem)', marginBottom: '1.5rem' }}>
                or click to browse local files (PDF & DOCX)
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--accent-color)', fontSize: '1rem', fontWeight: 600 }}>
                <File size={20} />
                <span>Flawless Neural Extraction Enabled</span>
              </div>
            </>
          )}
        </motion.div>
        
        {dragActive && !isProcessing && (
          <div 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '30px' }} 
            onDragEnter={handleDrag} 
            onDragLeave={handleDrag} 
            onDragOver={handleDrag} 
            onDrop={handleDrop} 
          />
        )}
      </form>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ 
              marginTop: '2rem', 
              padding: '1.5rem', 
              background: 'rgba(255, 75, 75, 0.1)', 
              border: '1px solid rgba(255, 75, 75, 0.3)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: '#ff6b6b'
            }}
          >
            <AlertCircle size={28} />
            <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
