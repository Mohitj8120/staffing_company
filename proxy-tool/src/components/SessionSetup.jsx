import React, { useState, useRef } from 'react';

export default function SessionSetup({ onStart }) {
    const [company, setCompany] = useState('');
    const [position, setPosition] = useState('');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeText, setResumeText] = useState('');
    const [resumePreview, setResumePreview] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileUpload = async (file) => {
        if (!file) return;
        setResumeFile(file);
        setIsParsing(true);
        setResumePreview('');
        
        try {
            if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                const arrayBuffer = await file.arrayBuffer();
                const text = await window.electronAPI?.parseResume({ 
                    buffer: Array.from(new Uint8Array(arrayBuffer))
                });
                setResumeText(text || '');
                setResumePreview(text ? text.substring(0, 300) + (text.length > 300 ? '...' : '') : 'No text extracted');
            } else {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const text = ev.target.result;
                    setResumeText(text);
                    setResumePreview(text.substring(0, 300) + (text.length > 300 ? '...' : ''));
                };
                reader.readAsText(file);
            }
        } catch (err) {
            setResumeText('Error parsing resume');
            setResumePreview('❌ Failed to parse. Try a different format.');
        } finally {
            setIsParsing(false);
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e.dataTransfer?.files[0]);
    };

    const handleFileSelect = (e) => handleFileUpload(e.target.files[0]);

    const removeFile = () => {
        setResumeFile(null);
        setResumeText('');
        setResumePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleStart = () => {
        onStart({ company, position, description, instructions, resumeText });
    };

    const isReady = company.trim() && position.trim();

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="setup-view">
            <div className="setup-header">
                <div className="setup-logo-anim">
                    <div className="logo-ring"></div>
                    <span className="logo-letter">G</span>
                </div>
                <h1>Garuda</h1>
                <p>Your invisible AI interview copilot</p>
            </div>

            <div className="form-group">
                <label className="form-label">
                    <span className="label-icon">🏢</span> Company Name
                </label>
                <input
                    type="text" className="form-input"
                    placeholder="e.g., Google, Microsoft, Amazon..."
                    value={company} onChange={(e) => setCompany(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="form-group">
                <label className="form-label">
                    <span className="label-icon">💼</span> Position
                </label>
                <input
                    type="text" className="form-input"
                    placeholder="e.g., Senior Software Engineer"
                    value={position} onChange={(e) => setPosition(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label className="form-label">
                    <span className="label-icon">📋</span> Job Description
                </label>
                <textarea
                    className="form-textarea"
                    placeholder="Paste the job description here..."
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                />
                <div className="input-hint">
                    <span>Helps AI give relevant answers</span>
                    <span>{description.length} chars</span>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">
                    <span className="label-icon">📝</span> Special Instructions
                </label>
                <textarea
                    className="form-textarea"
                    placeholder='e.g., "Answer briefly", "Focus on React & Node.js"...'
                    value={instructions} onChange={(e) => setInstructions(e.target.value)}
                    rows={2}
                />
            </div>

            <div className="form-group">
                <label className="form-label">
                    <span className="label-icon">📎</span> Resume
                </label>
                {!resumeFile ? (
                    <div
                        className={`file-upload-zone ${isDragging ? 'active' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <span className="upload-icon">📄</span>
                        <div className="upload-text">
                            <strong>Drop your resume</strong> or click to browse
                            <br />Supports .txt, .pdf, .doc, .md
                        </div>
                        <input
                            ref={fileInputRef} type="file"
                            accept=".txt,.pdf,.doc,.docx,.md,.rtf"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </div>
                ) : (
                    <div className="file-uploaded-container">
                        <div className="file-uploaded">
                            <span className="file-icon">📄</span>
                            <div className="file-info">
                                <div className="file-name">{resumeFile.name}</div>
                                <div className="file-size">
                                    {formatFileSize(resumeFile.size)}
                                    {isParsing && ' — Parsing...'}
                                    {!isParsing && resumeText && ` — ✅ ${resumeText.split(/\s+/).length} words extracted`}
                                </div>
                            </div>
                            <button className="file-remove" onClick={removeFile} title="Remove">✕</button>
                        </div>
                        {resumePreview && (
                            <div className="resume-preview">
                                <div className="preview-label">Preview</div>
                                <div className="preview-text">{resumePreview}</div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <button
                className="start-session-btn"
                onClick={handleStart}
                disabled={!isReady}
            >
                🚀 Start Interview Session
            </button>

            <div className="powered-by">
                <span>Powered by OpenAI gpt-4o-mini</span>
                <span className="shield-badge">🛡 Stealth Mode</span>
            </div>
        </div>
    );
}
