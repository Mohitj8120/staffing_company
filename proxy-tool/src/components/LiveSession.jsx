import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';

export default function LiveSession({ sessionData, onEnd, userMode, subscription }) {
    // ─── State ──────────────────────────────────────────────────
    const [timer, setTimer] = useState(0);
    const [status, setStatus] = useState('listening');
    const [activeMode, setActiveMode] = useState('ai');
    const [audioStatus, setAudioStatus] = useState('starting');
    const [audioError, setAudioError] = useState('');
    const [volumeMeter, setVolumeMeter] = useState(0);

    // ═══ PHANTOM ENGINE STATE ═══
    const [ghostMode, setGhostMode] = useState(false);

    // Transcript + AI
    const [transcript, setTranscript] = useState([]);
    const [livePartial, setLivePartial] = useState('');
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);

    const sentenceBufferRef = useRef('');
    const [manualQuestion, setManualQuestion] = useState('');
    const [qaHistory, setQaHistory] = useState([]);
    const [currentQAIndex, setCurrentQAIndex] = useState(-1);

    // Screen Analyse
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzeLoop, setAnalyzeLoop] = useState(false);
    const analyzeLoopRef = useRef(false);

    // Debug
    const [appLogs, setAppLogs] = useState([]);
    const [showTranscript, setShowTranscript] = useState(false);

    // Enhanced Screen Analysis & Interruption
    const [scannedScreens, setScannedScreens] = useState([]);
    const [pendingAudioQuestion, setPendingAudioQuestion] = useState('');
    const [previousScreenAnswer, setPreviousScreenAnswer] = useState('');
    const scannedScreensRef = useRef([]);

    const qaHistoryRef = useRef([]);
    useEffect(() => { qaHistoryRef.current = qaHistory; }, [qaHistory]);
    const activeModeRef = useRef(activeMode);
    useEffect(() => { activeModeRef.current = activeMode; }, [activeMode]);
    const currentAnswerRef = useRef(currentAnswer);
    useEffect(() => { currentAnswerRef.current = currentAnswer; }, [currentAnswer]);

    // Dynamic Parakeet Window Expansion
    const isExpanded = !!currentQuestion || !!currentAnswer || isAiLoading || isAnalyzing || activeMode === 'chat' || activeMode === 'analyze' || showTranscript || manualQuestion.trim().length > 0 || !!pendingAudioQuestion || !!previousScreenAnswer;

    useEffect(() => {
        if (window.electronAPI?.resizeWindow) {
            window.electronAPI.resizeWindow({
                height: isExpanded ? 550 : 60,
                position: 'toolbar-dropdown'
            });
        }
    }, [isExpanded]);

    // Auto-scroll disabled per user request to allow reading from the top
    const answerScrollRef = useRef(null);

    // Refs
    const timerRef = useRef(null);
    const activeStreamRef = useRef(null);
    const conversationHistoryRef = useRef([]);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const processorRef = useRef(null);
    const answerPanelRef = useRef(null);
    const streamingAnswerRef = useRef('');
    const deepgramReadyRef = useRef(false);

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

    // ─── AI Streaming Listeners ─────────────────────────────────
    useEffect(() => {
        const unsubChunk = window.electronAPI?.onAiStreamChunk?.((chunk) => {
            streamingAnswerRef.current += chunk;
            setCurrentAnswer(streamingAnswerRef.current);
            setIsStreaming(true);
        });
        const unsubEnd = window.electronAPI?.onAiStreamEnd?.(() => {
            setIsStreaming(false);
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

    // Mark demo as used immediately on mount for free tier
    useEffect(() => {
        if (subscription === 'free') {
            window.electronAPI?.markDemoUsed?.().catch(() => {});
        }
    }, [subscription]);

    // Timer
    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimer(p => {
                const nextTime = p + 1;
                if ((userMode === 'guest' || subscription === 'free') && nextTime >= 5 * 60) {
                    onEnd(); 
                }
                return nextTime;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [userMode, subscription, onEnd]);

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // ─── Question Detection ─────────────────────────────────────
    const looksLikeQuestion = (text) => {
        const lower = text.toLowerCase().trim();
        if (lower.includes('?')) return true;
        const starters = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 'can you', 'could you', 'tell me', 'explain', 'describe', 'is ', 'are ', 'do ', 'does ', 'have you', 'walk me', 'give me'];
        if (starters.some(s => lower.startsWith(s))) return true;
        const includes = ['what is', 'how to', 'tell me about', 'explain', 'what are', 'how do', 'can we', 'what does', 'why do', 'difference between'];
        if (includes.some(s => lower.includes(s))) return true;
        return false;
    };

    // ─── AI Answer Generation ────────────────────────────
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

        addLog('info', `AI request: "${question.substring(0, 50)}" (${role})`);

        try {
            const recentQA = qaHistoryRef.current.slice(-6).flatMap(qa => {
                if (qa.question && qa.answer) {
                    if (qa.sourceRole === 'screen') {
                        return [
                            { role: 'user', content: `[Screen Context]: I shared my screen showing a problem.` },
                            { role: 'assistant', content: `[My Analyzed Solution]: ${qa.answer}` }
                        ];
                    } else {
                        return [
                            { role: 'user', content: `[Previous Question]: ${qa.question}` },
                            { role: 'assistant', content: qa.answer }
                        ];
                    }
                }
                return [];
            });

            const messages = [
                ...recentQA,
                { role: 'user', content: `[${role === 'interviewer' ? 'INTERVIEWER asks' : 'Query'}]: ${question.trim()}` }
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
    }, [sessionData, addLog]);

    // ─── Interruption Key Handler (Enter to answer / restore) ───
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                if (document.activeElement.tagName === 'INPUT' && document.activeElement.value !== '') {
                    return; // let valid form submissions pass
                }
                
                if (pendingAudioQuestion) {
                    e.preventDefault();
                    if (currentAnswerRef.current) {
                        setPreviousScreenAnswer(currentAnswerRef.current);
                    }
                    getAiAnswer(pendingAudioQuestion, 'interviewer');
                    setPendingAudioQuestion('');
                } else if (previousScreenAnswer) {
                    e.preventDefault();
                    setCurrentAnswer(previousScreenAnswer);
                    streamingAnswerRef.current = previousScreenAnswer;
                    setCurrentQuestion('📸 Screen Analysis (Restored)');
                    setPreviousScreenAnswer('');
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pendingAudioQuestion, previousScreenAnswer, getAiAnswer]);

    // ─── Deepgram Transcript Listeners ──────────────────────────
    useEffect(() => {
        // Partial: live typing as interviewer speaks
        const unsubPartial = window.electronAPI?.onDeepgramPartial?.((data) => {
            const t = data?.channel?.alternatives?.[0]?.transcript;
            if (t) setLivePartial((sentenceBufferRef.current + ' ' + t).trim());
        });

        // Track last flushed text so UtteranceEnd can trigger AI if speech_final didn't
        const lastFlushedRef = { text: '', aiTriggered: false };

        // Final: word chunk locked in
        const unsubFinal = window.electronAPI?.onDeepgramFinal?.((data) => {
            const t = data?.channel?.alternatives?.[0]?.transcript;
            if (!t) return;
            const clean = t.replace(/<[^>]*>?/gm, '').trim();
            if (!clean) return;

            sentenceBufferRef.current = (sentenceBufferRef.current + ' ' + clean).trim();
            setLivePartial(sentenceBufferRef.current);

            // If speech_final, flush and TRIGGER AI IMMEDIATELY
            if (data.speech_final) {
                const fullSentence = sentenceBufferRef.current;
                sentenceBufferRef.current = '';
                setLivePartial('');

                addLog('info', `Transcribed: "${fullSentence}"`);
                setTranscript(prev => [...prev, {
                    id: Date.now(), text: fullSentence,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    role: 'interviewer'
                }]);
                conversationHistoryRef.current.push({ role: '[INTERVIEWER]', text: fullSentence });

                // Check interruption logic based on active mode
                if (activeModeRef.current === 'analyze' && currentAnswerRef.current) {
                    setPendingAudioQuestion(fullSentence);
                } else {
                    // TRIGGER AI INSTANTLY
                    getAiAnswer(fullSentence, 'interviewer');
                }
                lastFlushedRef.text = fullSentence;
                lastFlushedRef.aiTriggered = true;
            }
        });

        // UtteranceEnd: 2.5s pause — fallback for when speech_final didn't fire
        const unsubUtterance = window.electronAPI?.onUtteranceEnd?.(() => {
            const buffered = sentenceBufferRef.current.trim();
            if (buffered) {
                // There's unflushed text — flush it and trigger AI
                sentenceBufferRef.current = '';
                setLivePartial('');

                addLog('info', `UtteranceEnd — flushing: "${buffered}"`);
                setTranscript(prev => [...prev, {
                    id: Date.now(), text: buffered,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    role: 'interviewer'
                }]);
                conversationHistoryRef.current.push({ role: '[INTERVIEWER]', text: buffered });
                if (activeModeRef.current === 'analyze' && currentAnswerRef.current) {
                    setPendingAudioQuestion(buffered);
                } else {
                    getAiAnswer(buffered, 'interviewer');
                }
            }
            // If buffer was empty, speech_final already handled it — no action needed
        });

        return () => { unsubPartial?.(); unsubFinal?.(); unsubUtterance?.(); };
    }, [addLog, getAiAnswer]);

    // ─── System Audio Capture (ScriptProcessor → Deepgram) ───────
    const startCapture = useCallback(async () => {
        try {
            setAudioStatus('starting');
            setAudioError('');

            // Always capture system audio
            const sources = await window.electronAPI?.getDesktopSources();
            const screenSource = sources?.find(s => s.name.includes('Screen')) || sources?.[0];
            if (!screenSource) throw new Error('No desktop source found');

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: screenSource.id } },
                video: { mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: screenSource.id, maxWidth: 1, maxHeight: 1, maxFrameRate: 1 } }
            });

            activeStreamRef.current = stream;
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length === 0) throw new Error('No audio tracks found');

            // Connect to Deepgram
            addLog('info', 'Starting Deepgram streaming...');
            await window.electronAPI?.startDeepgram({ language: 'en' });
            deepgramReadyRef.current = true;

            // AudioContext at 16kHz
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            const source = audioCtx.createMediaStreamSource(stream);

            // Analyser for volume meter
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            audioCtxRef.current = audioCtx;
            analyserRef.current = analyser;

            // ScriptProcessor for raw PCM (4096 samples = ~256ms at 16kHz)
            const processor = audioCtx.createScriptProcessor(4096, 1, 1);
            source.connect(processor);
            processor.connect(audioCtx.destination);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                if (!deepgramReadyRef.current) return;
                const input = e.inputBuffer.getChannelData(0);

                // Volume detection for UI indicator
                let sumSq = 0;
                for (let i = 0; i < input.length; i++) sumSq += input[i] * input[i];
                const rms = Math.sqrt(sumSq / input.length);
                setVolumeMeter(Math.min(rms * 5, 1));
                setAudioStatus(rms > 0.01 ? 'talking' : 'active');

                // Float32 → Int16 PCM conversion
                const pcm = new Int16Array(input.length);
                for (let i = 0; i < input.length; i++) {
                    const s = Math.max(-1, Math.min(1, input[i]));
                    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Send ALL audio (no silence skipping) to Deepgram
                window.electronAPI?.sendAudioChunk({ pcmData: new Uint8Array(pcm.buffer) });
            };

            // Volume meter animation loop
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            const updateMeter = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
                const avg = sum / bufferLength / 255;
                setVolumeMeter(avg);
                requestAnimationFrame(updateMeter);
            };
            updateMeter();

            setAudioStatus('active');
            addLog('info', 'System audio capture started — PCM streaming to Deepgram');
        } catch (err) {
            addLog('error', `Capture Error: ${err.message}`);
            setAudioError(err.message);
            setAudioStatus('error');
        }
    }, [addLog]);

    const stopCapture = useCallback(() => {
        deepgramReadyRef.current = false;
        if (processorRef.current) {
            try { processorRef.current.disconnect(); } catch(e){}
            processorRef.current = null;
        }
        if (activeStreamRef.current) {
            activeStreamRef.current.getTracks().forEach(t => t.stop());
            activeStreamRef.current = null;
        }
        if (audioCtxRef.current) {
            try { audioCtxRef.current.close(); } catch(e){}
            audioCtxRef.current = null;
        }
        analyserRef.current = null;
        window.electronAPI?.stopDeepgram();
    }, []);

    // Start capture on mount
    useEffect(() => {
        const mountTimer = setTimeout(() => startCapture(), 500);
        return () => { clearTimeout(mountTimer); stopCapture(); };
    }, []);

    // ─── Screen Analysis ────────────────────────────────────────
    const runScreenAnalysis = useCallback(async (finalAnalyze = false) => {
        setIsAnalyzing(true);

        try {
            addLog('info', 'Capturing screen...');
            const base64 = await window.electronAPI?.captureScreen();
            if (!base64) throw new Error('Failed to capture screen');

            setScannedScreens(prev => {
                const updated = [...prev, base64].slice(-5); // limit to 5 screens max for API load
                scannedScreensRef.current = updated;
                return updated;
            });

            if (finalAnalyze) {
                streamingAnswerRef.current = '';
                setCurrentAnswer('');
                setCurrentQuestion('📸 Screen Analysis (Multi-page)');
                setIsAiLoading(true);

                addLog('info', 'Analyzing multiple screen content...');
                const context = `Position: ${sessionData.position}\nCompany: ${sessionData.company}\n${sessionData.instructions || ''}`;
                
                const result = await window.electronAPI?.analyzeScreen({ base64Images: scannedScreensRef.current, context });
                
                setQaHistory(prev => {
                    const newEntry = {
                        id: Date.now(),
                        question: '📸 Screen Analysis (Multi-page)',
                        answer: result || streamingAnswerRef.current,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        sourceRole: 'screen'
                    };
                    const updated = [...prev, newEntry];
                    setCurrentQAIndex(updated.length - 1);
                    return updated;
                });
                
                setScannedScreens([]);
                scannedScreensRef.current = [];
            } else {
                setCurrentQuestion(`📸 Reading Screen... (Captured ${scannedScreensRef.current.length}/5)`);
            }

        } catch (err) {
            addLog('error', `Analysis error: ${err.message}`);
            if (finalAnalyze) setCurrentAnswer(`Error: ${err.message}`);
        } finally {
            setIsAnalyzing(false);
            if (finalAnalyze) setIsAiLoading(false);
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
                await runScreenAnalysis(false); // keep accumulating
                if (analyzeLoopRef.current) {
                    loopTimer = setTimeout(loop, 3500); // interval for sliding/reading smoothly
                }
            };
            loop();
        }
        return () => clearTimeout(loopTimer);
    }, [analyzeLoop, activeMode, runScreenAnalysis]);

    // ─── Pause/Resume ───────────────────────────────────
    const handlePause = () => {
        if (status === 'listening') {
            stopCapture();
            setStatus('paused');
        } else {
            setStatus('listening');
            startCapture();
        }
    };

    // ═══ PHANTOM ENGINE LISTENERS ═══
    useEffect(() => {
        window.electronAPI?.setSessionActive?.(true);
        const unsubGhost = window.electronAPI?.onGhostModeChanged?.((enabled) => setGhostMode(enabled));
        const unsubPanic = window.electronAPI?.onPanicTriggered?.(() => { stopCapture(); });
        const unsubScroll = window.electronAPI?.onScrollAnswer?.((dir) => {
            if (answerScrollRef.current) {
                answerScrollRef.current.scrollTop += dir === 'up' ? -120 : 120;
            }
        });
        const unsubCapture = window.electronAPI?.onQuickCapture?.(() => {
            setActiveMode('analyze');
            setScannedScreens([]); scannedScreensRef.current = [];
            setAnalyzeLoop(true);
            setTimeout(() => { setAnalyzeLoop(false); runScreenAnalysis(true); }, 4000);
        });
        return () => {
            window.electronAPI?.setSessionActive?.(false);
            unsubGhost?.(); unsubPanic?.(); unsubScroll?.(); unsubCapture?.();
        };
    }, [stopCapture, runScreenAnalysis]);

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
    // Ghost mode hover handlers
    const handleMouseEnter = () => { if (ghostMode) window.electronAPI?.setIgnoreMouse?.(false); };
    const handleMouseLeave = () => { if (ghostMode) window.electronAPI?.setIgnoreMouse?.(true); };

    return (
        <div className={`parakeet-layout ${ghostMode ? 'ghost-active' : ''}`}>
            {/* ═══ Ghost Mode Indicator ═══ */}
            {ghostMode && (
                <div className="phantom-ghost-badge">👻 GHOST MODE — Ctrl+Shift+G to exit</div>
            )}

            {/* ═══ Top Compact Toolbar ═══ */}
            <div className="parakeet-toolbar" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="pt-left">
                    <div className={`pt-audio-indicator ${audioStatus}`} title={audioError}>
                        <div className="pt-volume-fill" style={{ height: `${Math.min(volumeMeter * 100, 100)}%` }}></div>
                        <span className="pt-audio-pulse"></span>
                    </div>
                    <div className="pt-status-text">
                        {livePartial ? (
                            <span className="live-typing">💬 {livePartial}<span className="typing-cursor">|</span></span>
                        ) : audioStatus === 'talking' ? (
                            <span className="status-listening">Listening...</span>
                        ) : status === 'paused' ? (
                            <span className="status-paused">Paused</span>
                        ) : (
                            <span className="status-idle">Listening...</span>
                        )}
                    </div>
                </div>

                <div className="pt-center non-drag">
                    <button className={`pt-pill ${activeMode === 'ai' ? 'active' : ''}`} onClick={() => setActiveMode('ai')}>
                        ✨ AI
                    </button>
                    <button className={`pt-pill ${activeMode === 'analyze' ? 'active' : ''}`} onClick={() => setActiveMode('analyze')}>
                        💻 Screen
                    </button>
                    <button className={`pt-pill ${activeMode === 'chat' ? 'active' : ''}`} onClick={() => setActiveMode('chat')}>
                        💬 Chat
                    </button>
                    <button className={`pt-pill phantom-pill ${ghostMode ? 'active' : ''}`} onClick={() => window.electronAPI?.toggleGhost?.()} title="Ghost Mode (Ctrl+Shift+G)">
                        👻 {ghostMode ? 'Ghost' : 'Ghost'}
                    </button>
                </div>

                <div className="pt-right non-drag">
                    <button className={`pt-icon-btn ${showTranscript ? 'active' : ''}`} onClick={() => setShowTranscript(!showTranscript)} title="Transcript">
                        📝
                    </button>
                    <div className="pt-timer">
                        <span className={`timer-dot ${status}`}></span>
                        {formatTime(timer)}
                    </div>
                    <button className="pt-icon-btn" onClick={handlePause} title={status === 'listening' ? 'Pause' : 'Resume'}>
                        {status === 'listening' ? '⏸' : '▶'}
                    </button>
                    <button className="pt-icon-btn end-btn" onClick={onEnd} title="End Session & Return">
                        🔙
                    </button>
                    <button className="pt-icon-btn quit-btn" onClick={() => window.electronAPI?.close()} title="Quit Application">
                        🔌
                    </button>
                </div>
            </div>

            {/* ═══ Dropdown Content Card ═══ */}
            {isExpanded && (
                <div className="parakeet-dropdown" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    
                    {/* Transcript Overlay */}
                    {showTranscript && (
                        <div className="pt-card pt-transcript">
                            <div className="pt-card-header">
                                <span className="pt-card-title">Live Transcript</span>
                                <button className="pt-close-btn" onClick={() => setShowTranscript(false)}>✕</button>
                            </div>
                            <div className="pt-card-body" ref={answerScrollRef}>
                                {transcript.length === 0 ? (
                                    <div className="transcript-empty">Waiting for speech...</div>
                                ) : transcript.slice(-10).map(t => (
                                    <div key={t.id} className={`t-entry ${t.role}`}>
                                        <span className="t-role">{t.role === 'interviewer' ? '🔊' : t.role === 'candidate' ? '🎤' : '✍'}</span>
                                        <span className="t-text">{t.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Mode */}
                    {!showTranscript && activeMode === 'chat' && (
                        <div className="pt-card pt-chat">
                            <form className="pt-input-bar" onSubmit={handleManualSubmit}>
                                <input
                                    className="pt-input"
                                    placeholder="Type a question for AI..."
                                    value={manualQuestion}
                                    onChange={(e) => setManualQuestion(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="pt-send" disabled={isAiLoading || !manualQuestion.trim()}>➤</button>
                            </form>
                            {(qaHistory.length > 0 || isStreaming) && (
                                <div className="pt-card-body pt-chat-history" ref={answerScrollRef}>
                                    {qaHistory.slice(-5).map((qa) => (
                                        <div key={qa.id} className="chat-entry">
                                            <div className="chat-q"><strong>You:</strong> {qa.question}</div>
                                            {qa.answer && <div className="chat-a"><strong>AI:</strong> <ReactMarkdown>{qa.answer}</ReactMarkdown></div>}
                                        </div>
                                    ))}
                                    {isStreaming && (
                                        <div className="chat-entry">
                                            <div className="chat-a streaming"><strong>AI:</strong> <ReactMarkdown>{currentAnswer + ' █'}</ReactMarkdown></div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* AI Answer / Analyze Mode */}
                    {!showTranscript && activeMode !== 'chat' && (
                        <div className="pt-card pt-answer">
                            
                            {/* Manual Input available everywhere */}
                            <form className="pt-input-bar" onSubmit={handleManualSubmit}>
                                <input
                                    className="pt-input"
                                    placeholder="Type manual question..."
                                    value={manualQuestion}
                                    onChange={(e) => setManualQuestion(e.target.value)}
                                />
                            </form>

                            {/* Analysis Controls */}
                            {activeMode === 'analyze' && (
                                <div className="pt-analyze-controls">
                                    {!analyzeLoop ? (
                                        <button className="analyze-start-btn" onClick={() => {
                                            setScannedScreens([]); 
                                            scannedScreensRef.current = [];
                                            setAnalyzeLoop(true);
                                        }} disabled={isAnalyzing || isAiLoading}>
                                            {isAnalyzing ? 'Reading...' : '📸 Start Reading Screens'}
                                        </button>
                                    ) : (
                                        <button className="analyze-stop-btn" onClick={() => {
                                            setAnalyzeLoop(false);
                                            runScreenAnalysis(true); // final analyze triggering OpenAI
                                        }}>
                                            ✋ Stop & Answer
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Interruption Prompt */}
                            {(pendingAudioQuestion || previousScreenAnswer) && (
                                <div className="pt-interruption-prompt" style={{ background: '#3b0000', color: '#fff', padding: '10px', borderRadius: '8px', margin: '5px 0', border: '1px solid #ff4d4d' }}>
                                    {pendingAudioQuestion && (
                                        <div>
                                            <strong>Interviewer Asked:</strong> "{pendingAudioQuestion}"
                                            <br/><small style={{color:'#aaa'}}>Press <kbd>Enter</kbd> to Answer</small>
                                        </div>
                                    )}
                                    {previousScreenAnswer && !pendingAudioQuestion && (
                                        <div>
                                            <strong>Viewing Interviewer Answer.</strong>
                                            <br/><small style={{color:'#aaa'}}>Press <kbd>Enter</kbd> to Restore Screen Answer</small>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Question Badge */}
                            {currentQuestion && (
                                <div className="pt-question-badge">
                                    <span className="pt-q-icon">Q</span>
                                    <span className="pt-q-text">{currentQuestion}</span>
                                    {qaHistory.length > 1 && (
                                        <div className="pt-nav">
                                            <button onClick={() => navigateQA(-1)} disabled={currentQAIndex <= 0}>◀</button>
                                            <button onClick={() => navigateQA(1)} disabled={currentQAIndex >= qaHistory.length - 1}>▶</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Answer Area */}
                            {(currentAnswer || isAiLoading) && (
                                <div className="pt-card-body" ref={answerScrollRef}>
                                    {currentAnswer ? (
                                        <div className="pt-answer-text">
                                            <ReactMarkdown>
                                                {currentAnswer + (isStreaming ? ' █' : '')}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="answer-loading">
                                            <div className="loading-dots"><span></span><span></span><span></span></div>
                                            <div className="loading-text">Generating answer...</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
