import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function LiveSession({ sessionData, onEnd }) {
    // ─── State ──────────────────────────────────────────────────
    const [timer, setTimer] = useState(0);
    const [status, setStatus] = useState('listening'); // 'listening' | 'paused'
    const [activeMode, setActiveMode] = useState('ai'); // 'ai' | 'analyze' | 'chat'
    const [audioSource, setAudioSource] = useState('mic');
    const [audioStatus, setAudioStatus] = useState('starting');
    const [audioError, setAudioError] = useState('');
    const [volumeMeter, setVolumeMeter] = useState(0);

    // Transcript + AI
    const [transcript, setTranscript] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [manualQuestion, setManualQuestion] = useState('');
    const [qaHistory, setQaHistory] = useState([]);
    const [currentQAIndex, setCurrentQAIndex] = useState(-1);

    // Screen Analyse
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzeLoop, setAnalyzeLoop] = useState(false);
    const analyzeLoopRef = useRef(false);

    // Debug
    const [appLogs, setAppLogs] = useState([]);
    const [showTranscript, setShowTranscript] = useState(true);

    // Refs
    const timerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const activeStreamRef = useRef(null);
    const conversationHistoryRef = useRef([]);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const vadStateRef = useRef('idle');
    const silenceStartRef = useRef(null);
    const answerPanelRef = useRef(null);
    const streamingAnswerRef = useRef('');

    const VAD_THRESHOLD = 0.008;
    const SILENCE_DURATION = 1200;

    // ─── Logger ─────────────────────────────────────────────────
    const addLog = useCallback((level, message) => {
        window.electronAPI?.log?.(level, message);
        setAppLogs(prev => [...prev.slice(-49), { level, message, timestamp: new Date().toLocaleTimeString() }]);
    }, []);

    useEffect(() => {
        const unsub = window.electronAPI?.onAppLog?.((entry) => {
            setAppLogs(prev => [...prev.slice(-99), entry]);
        });
        return () => unsub?.();
    }, []);

    // ─── Streaming Listeners ────────────────────────────────────
    useEffect(() => {
        const unsubChunk = window.electronAPI?.onAiStreamChunk?.((chunk) => {
            streamingAnswerRef.current += chunk;
            setCurrentAnswer(streamingAnswerRef.current);
            setIsStreaming(true);
        });
        const unsubEnd = window.electronAPI?.onAiStreamEnd?.(() => {
            setIsStreaming(false);
            // Save completed answer to QA history
            const finalAnswer = streamingAnswerRef.current;
            if (finalAnswer) {
                setQaHistory(prev => {
                    const updated = [...prev];
                    if (updated.length > 0) {
                        updated[updated.length - 1].answer = finalAnswer;
                    }
                    return updated;
                });
            }
        });
        return () => { unsubChunk?.(); unsubEnd?.(); };
    }, []);

    // Timer
    useEffect(() => {
        timerRef.current = setInterval(() => setTimer(p => p + 1), 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // ─── AI Answer Generation ───────────────────────────────────
    const getAiAnswer = useCallback(async (question, role = 'manual') => {
        if (!question.trim()) return;
        setIsAiLoading(true);
        streamingAnswerRef.current = '';
        setCurrentAnswer('');
        setCurrentQuestion(question.trim());

        const newEntry = {
            id: Date.now(),
            question: question.trim(),
            answer: '',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sourceRole: role
        };
        setQaHistory(prev => {
            const updated = [...prev, newEntry];
            setCurrentQAIndex(updated.length - 1);
            return updated;
        });

        addLog('info', `AI request: "${question.substring(0, 40)}..." (${role})`);

        try {
            const systemContent = `You are "Proxy", a professional interview assistant.
Context: ${sessionData.position} at ${sessionData.company}.
${sessionData.description ? `Job Description: ${sessionData.description}` : ''}
${sessionData.instructions ? `Instructions: ${sessionData.instructions}` : ''}
Provide the exact answer the candidate should say. Be natural, articulate, and specific.
Use their resume details when relevant.
Keep answers concise but thorough — aim for spoken delivery.
Conversation so far:
${conversationHistoryRef.current.slice(-6).map(m => `${m.role}: ${m.text}`).join('\n')}`;

            const messages = [
                { role: 'system', content: systemContent },
                ...qaHistory.slice(-3).flatMap(item => [
                    { role: 'user', content: item.question },
                    ...(item.answer ? [{ role: 'assistant', content: item.answer }] : [])
                ]),
                { role: 'user', content: `[${role === 'interviewer' ? 'INTERVIEWER asks' : 'Manual query'}]: ${question.trim()}` }
            ];

            await window.electronAPI?.aiChat({
                messages,
                position: sessionData.position,
                company: sessionData.company,
                instructions: sessionData.instructions,
                resumeText: sessionData.resumeText
            });
        } catch (err) {
            addLog('error', `AI Error: ${err.message}`);
            setCurrentAnswer(`Error: ${err.message}`);
        } finally {
            setIsAiLoading(false);
        }
    }, [qaHistory, sessionData, addLog]);

    // ─── Question Detection ─────────────────────────────────────
    const looksLikeQuestion = (text) => {
        const lower = text.toLowerCase().trim();
        if (lower.endsWith('?') || lower.includes('?')) return true;
        
        const starters = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 'can you', 'could you', 'tell me', 'explain', 'describe', 'is ', 'are ', 'do ', 'does ', 'have you', 'walk me', 'give me'];
        if (starters.some(s => lower.startsWith(s))) return true;

        const includes = ['what is', 'how to', 'tell me about', 'explain', 'what are', 'how do', 'can we', 'what does', 'why do'];
        if (includes.some(s => lower.includes(s))) return true;

        return false;
    };

    // ─── Transcription ──────────────────────────────────────────
    const triggerTranscription = useCallback(async (chunksToProcess) => {
        if (!chunksToProcess || chunksToProcess.length === 0) return;
        const blob = new Blob(chunksToProcess, { type: 'audio/webm' });
        addLog('info', `Processing audio blob: ${blob.size} bytes`);
        if (blob.size < 2000) { 
            addLog('warn', `Audio blob too small (${blob.size} bytes), skipping.`);
            return;
        }

        try {
            const arrayBuffer = await blob.arrayBuffer();
            const text = await window.electronAPI?.transcribeAudio({
                audioBuffer: Array.from(new Uint8Array(arrayBuffer))
            });

            if (text && text.trim().length > 2) {
                const cleanText = text.trim();
                addLog('info', `Transcribed: "${cleanText}"`);
                const role = audioSource === 'system' ? 'interviewer' : 'candidate';
                
                setTranscript(prev => [...prev, {
                    id: Date.now(),
                    text: cleanText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    role
                }]);
                
                conversationHistoryRef.current.push({
                    role: role === 'interviewer' ? '[INTERVIEWER]' : '[USER]',
                    text: cleanText
                });

                // Auto-trigger AI for interviewer speech or questions
                if (role === 'interviewer' || looksLikeQuestion(cleanText)) {
                    getAiAnswer(cleanText, role);
                }
            }
        } catch (err) {
            addLog('error', `Transcription failed: ${err.message}`);
        }
    }, [audioSource, addLog, getAiAnswer]);

    const startNewRecorder = useCallback(() => {
        if (!activeStreamRef.current) return;
        
        let mimeType = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'audio/webm';
        
        const audioTracks = activeStreamRef.current.getAudioTracks();
        if (audioTracks.length === 0) return;
        
        const audioStream = new MediaStream(audioTracks);
        const recorder = new MediaRecorder(audioStream, { mimeType });
        
        const localChunks = [];
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) localChunks.push(e.data);
        };
        
        recorder.onstop = () => {
            const chunksToProcess = [...localChunks];
            triggerTranscription(chunksToProcess);
        };

        mediaRecorderRef.current = recorder;
        recorder.start(100);
    }, [triggerTranscription]);

    // ─── VAD (Voice Activity Detection) ─────────────────────────
    const startVAD = useCallback((stream) => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            audioCtxRef.current = audioCtx;
            analyserRef.current = analyser;

            const checkVolume = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
                const average = sum / bufferLength / 255;
                setVolumeMeter(average);

                if (average > VAD_THRESHOLD) {
                    if (vadStateRef.current === 'idle') {
                        vadStateRef.current = 'talking';
                        setAudioStatus('talking');
                    }
                    silenceStartRef.current = null;
                } else if (vadStateRef.current === 'talking') {
                    if (!silenceStartRef.current) silenceStartRef.current = Date.now();
                    if (Date.now() - silenceStartRef.current > SILENCE_DURATION) {
                        vadStateRef.current = 'idle';
                        setAudioStatus('active');
                        if (mediaRecorderRef.current?.state === 'recording') {
                            mediaRecorderRef.current.stop();
                            try {
                                startNewRecorder();
                            } catch (e) {}
                        }
                    }
                }
                requestAnimationFrame(checkVolume);
            };
            checkVolume();
        } catch (err) {
            addLog('error', `VAD failed: ${err.message}`);
        }
    }, [triggerTranscription, addLog, startNewRecorder]);

    // ─── Audio Capture ──────────────────────────────────────────
    const startCapture = useCallback(async (type) => {
        try {
            setAudioStatus('starting');
            setAudioError('');
            let stream;
            
            if (type === 'mic') {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
                });
            } else {
                const sources = await window.electronAPI?.getDesktopSources();
                const screenSource = sources?.find(s => s.name.includes('Screen')) || sources?.[0];
                if (!screenSource) throw new Error('No desktop source found');
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: { mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: screenSource.id } },
                    video: { mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: screenSource.id, maxWidth: 100, maxHeight: 100, maxFrameRate: 1 } }
                });
            }

            activeStreamRef.current = stream;
            
            startNewRecorder();
            startVAD(stream);
            setAudioStatus('active');
        } catch (err) {
            addLog('error', `Capture Error: ${err.message}`);
            setAudioError(err.message);
            setAudioStatus('error');
        }
    }, [addLog, startVAD, startNewRecorder]);

    const stopCapture = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
        activeStreamRef.current?.getTracks().forEach(t => t.stop());
        if (audioCtxRef.current) audioCtxRef.current.close();
        audioCtxRef.current = null;
        analyserRef.current = null;
    }, []);

    const switchAudioSource = (source) => {
        stopCapture();
        setAudioSource(source);
        setTimeout(() => startCapture(source), 300);
    };

    // Start capture on mount
    useEffect(() => {
        startCapture(audioSource);
        return () => stopCapture();
    }, []);

    // ─── Screen Analysis ────────────────────────────────────────
    const runScreenAnalysis = useCallback(async () => {
        setIsAnalyzing(true);
        streamingAnswerRef.current = '';
        setCurrentAnswer('');
        setCurrentQuestion('📸 Screen Analysis');
        setIsAiLoading(true);

        try {
            addLog('info', 'Capturing screen...');
            const base64 = await window.electronAPI?.captureScreen();
            if (!base64) throw new Error('Failed to capture screen');

            addLog('info', 'Analyzing screen content...');
            const context = `Position: ${sessionData.position}\nCompany: ${sessionData.company}\n${sessionData.instructions || ''}`;
            
            const result = await window.electronAPI?.analyzeScreen({ base64Image: base64, context });
            
            setQaHistory(prev => [...prev, {
                id: Date.now(),
                question: '📸 Screen Analysis',
                answer: result || streamingAnswerRef.current,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sourceRole: 'screen'
            }]);

        } catch (err) {
            addLog('error', `Analysis error: ${err.message}`);
            setCurrentAnswer(`Error: ${err.message}`);
        } finally {
            setIsAnalyzing(false);
            setIsAiLoading(false);
        }
    }, [sessionData, addLog]);

    // Auto-loop screen analysis
    useEffect(() => {
        analyzeLoopRef.current = analyzeLoop;
    }, [analyzeLoop]);

    useEffect(() => {
        let loopTimer;
        if (analyzeLoop && activeMode === 'analyze') {
            const loop = async () => {
                if (!analyzeLoopRef.current) return;
                await runScreenAnalysis();
                if (analyzeLoopRef.current) {
                    loopTimer = setTimeout(loop, 5000); // Re-analyze every 5s
                }
            };
            loop();
        }
        return () => clearTimeout(loopTimer);
    }, [analyzeLoop, activeMode]);

    // ─── Pause/Resume ───────────────────────────────────────────
    const handlePause = () => {
        if (status === 'listening') {
            stopCapture();
            setStatus('paused');
        } else {
            setStatus('listening');
            startCapture(audioSource);
        }
    };

    // ─── Manual Submit ──────────────────────────────────────────
    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (!manualQuestion.trim() || isAiLoading) return;
        const q = manualQuestion;
        setManualQuestion('');
        setTranscript(prev => [...prev, {
            id: Date.now(), text: q,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            role: 'manual'
        }]);
        getAiAnswer(q, 'manual');
    };

    // ─── QA Navigation ──────────────────────────────────────────
    const navigateQA = (dir) => {
        setCurrentQAIndex(prev => {
            const newIdx = Math.max(0, Math.min(qaHistory.length - 1, prev + dir));
            if (qaHistory[newIdx]) {
                setCurrentAnswer(qaHistory[newIdx].answer);
                setCurrentQuestion(qaHistory[newIdx].question);
            }
            return newIdx;
        });
    };

    // ─── Render ─────────────────────────────────────────────────
    return (
        <div className="live-session">
            {/* ═══ Top Toolbar ═══ */}
            <div className="action-toolbar">
                <div className="toolbar-left">
                    <div className={`audio-status-indicator ${audioStatus}`}>
                        <div className="volume-fill" style={{ height: `${volumeMeter * 100}%` }}></div>
                        <span className="audio-pulse"></span>
                    </div>
                    <button className={`toolbar-pill ${activeMode === 'ai' ? 'active' : ''}`} onClick={() => setActiveMode('ai')}>
                        Answer ⚡
                    </button>
                    <button className={`toolbar-pill ${activeMode === 'analyze' ? 'active' : ''}`} onClick={() => setActiveMode('analyze')}>
                        Analyse 📸
                    </button>
                    <button className={`toolbar-pill ${activeMode === 'chat' ? 'active' : ''}`} onClick={() => setActiveMode('chat')}>
                        Chat 💬
                    </button>
                </div>
                <div className="toolbar-right">
                    <div className="toolbar-timer">
                        <span className={`timer-dot ${status}`}></span>
                        {formatTime(timer)}
                    </div>
                    <button className="toolbar-icon-btn" onClick={handlePause} title={status === 'listening' ? 'Pause' : 'Resume'}>
                        {status === 'listening' ? '⏸' : '▶'}
                    </button>
                    <button className="toolbar-icon-btn end-btn" onClick={onEnd} title="End Session">✕</button>
                </div>
            </div>

            {/* ═══ Audio Source Bar ═══ */}
            <div className="audio-toggle-bar">
                <button className={`audio-btn ${audioSource === 'mic' ? 'active' : ''}`} onClick={() => switchAudioSource('mic')}>🎤 Mic</button>
                <button className={`audio-btn ${audioSource === 'system' ? 'active' : ''}`} onClick={() => switchAudioSource('system')}>🔊 System</button>
                {audioError && <span className="audio-err-text">⚠ {audioError}</span>}
                {audioStatus === 'talking' && <span className="talking-badge">● LIVE</span>}
            </div>

            {/* ═══ Mode Content Panels ═══ */}
            {activeMode === 'ai' && (
                <>
                    {/* Input Bar */}
                    <form className="input-bar" onSubmit={handleManualSubmit}>
                        <input
                            className="input-field"
                            placeholder={audioStatus === 'talking' ? '● Listening...' : 'Type a question...'}
                            value={manualQuestion}
                            onChange={(e) => setManualQuestion(e.target.value)}
                        />
                        <button type="submit" className="input-send" disabled={isAiLoading || !manualQuestion.trim()}>➤</button>
                    </form>

                    {/* Answer Panel - Compact */}
                    <div className="answer-panel" ref={answerPanelRef}>
                        {currentQuestion && (
                            <div className="answer-question-bar">
                                <span className="q-indicator">Q</span>
                                <span className="q-text">{currentQuestion}</span>
                                {qaHistory.length > 1 && (
                                    <div className="qa-nav-mini">
                                        <button onClick={() => navigateQA(-1)} disabled={currentQAIndex <= 0}>◀</button>
                                        <span>{currentQAIndex + 1}/{qaHistory.length}</span>
                                        <button onClick={() => navigateQA(1)} disabled={currentQAIndex >= qaHistory.length - 1}>▶</button>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="answer-content-area">
                            {currentAnswer ? (
                                <div className={`answer-text ${isStreaming ? 'streaming' : ''}`}>
                                    {currentAnswer}
                                    {isStreaming && <span className="stream-cursor">|</span>}
                                </div>
                            ) : isAiLoading ? (
                                <div className="answer-loading">
                                    <div className="loading-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                    <div className="loading-text">Generating answer...</div>
                                </div>
                            ) : (
                                <div className="answer-empty">
                                    <div className="empty-icon">🤖</div>
                                    <div className="empty-title">Listening...</div>
                                    <div className="empty-desc">Speak or type a question. AI will answer in real-time.</div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {activeMode === 'analyze' && (
                <div className="analyze-panel">
                    <div className="analyze-controls">
                        {!analyzeLoop ? (
                            <button className="analyze-start-btn" onClick={() => { setAnalyzeLoop(true); }} disabled={isAnalyzing}>
                                {isAnalyzing ? '⏳ Analyzing...' : '📸 Start Analysing Screen'}
                            </button>
                        ) : (
                            <button className="analyze-stop-btn" onClick={() => setAnalyzeLoop(false)}>
                                ✋ Done — Stop Analysis
                            </button>
                        )}
                        {!analyzeLoop && (
                            <button className="analyze-once-btn" onClick={runScreenAnalysis} disabled={isAnalyzing}>
                                {isAnalyzing ? '⏳...' : '📷 Analyse Once'}
                            </button>
                        )}
                    </div>
                    {isAnalyzing && (
                        <div className="analyze-status">
                            <div className="scan-line"></div>
                            <span>Reading screen content...</span>
                        </div>
                    )}
                    <div className="answer-content-area">
                        {currentAnswer ? (
                            <div className={`answer-text ${isStreaming ? 'streaming' : ''}`}>
                                {currentAnswer}
                                {isStreaming && <span className="stream-cursor">|</span>}
                            </div>
                        ) : (
                            <div className="answer-empty">
                                <div className="empty-icon">📸</div>
                                <div className="empty-title">Screen Analysis</div>
                                <div className="empty-desc">Click "Start Analysing" to read code or questions from your screen. Keep analyzing until done.</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeMode === 'chat' && (
                <>
                    <form className="input-bar" onSubmit={handleManualSubmit}>
                        <input
                            className="input-field"
                            placeholder="Ask anything..."
                            value={manualQuestion}
                            onChange={(e) => setManualQuestion(e.target.value)}
                        />
                        <button type="submit" className="input-send" disabled={isAiLoading || !manualQuestion.trim()}>➤</button>
                    </form>
                    <div className="answer-content-area chat-area">
                        {qaHistory.length > 0 ? qaHistory.slice(-10).map((qa, idx) => (
                            <div key={qa.id} className="chat-entry">
                                <div className="chat-q"><span className="chat-role">You:</span> {qa.question}</div>
                                {qa.answer && <div className="chat-a"><span className="chat-role">AI:</span> {qa.answer}</div>}
                            </div>
                        )) : (
                            <div className="answer-empty">
                                <div className="empty-icon">💬</div>
                                <div className="empty-title">Chat Mode</div>
                                <div className="empty-desc">Ask any question and get instant AI answers</div>
                            </div>
                        )}
                        {isStreaming && (
                            <div className="chat-entry">
                                <div className="chat-a streaming"><span className="chat-role">AI:</span> {currentAnswer}<span className="stream-cursor">|</span></div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ═══ Transcript Panel ═══ */}
            <button className="transcript-toggle" onClick={() => setShowTranscript(!showTranscript)}>
                {showTranscript ? '▼ Hide' : '▲ Show'} Transcript ({transcript.length})
            </button>
            {showTranscript && (
                <div className="transcript-panel">
                    {transcript.length === 0 ? (
                        <div className="transcript-empty">Transcript will appear here as you speak...</div>
                    ) : transcript.slice(-20).map(t => (
                        <div key={t.id} className={`t-entry ${t.role}`}>
                            <span className="t-role">{t.role === 'interviewer' ? '🔊' : t.role === 'candidate' ? '🎤' : '✍'}</span>
                            <span className="t-text">{t.text}</span>
                            <span className="t-time">{t.timestamp}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
