import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Clipboard, BackHandler, NativeModules, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { theme } from '../theme';
import { API_BASE_URL } from '../config';
import { JD_DETECTOR_SCRIPT } from '../utils/jdDetector';
import { showToast } from '../components/Toast';

const { FloatingBubble } = NativeModules;

export default function OverlayScreen({ navigation }) {
  const [copiedUrl, setCopiedUrl] = useState('');
  const [extractionStatus, setExtractionStatus] = useState('Checking clipboard...'); // 'checking', 'loading', 'success', 'failed'
  const [extractedJd, setExtractedJd] = useState(null);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [mode, setMode] = useState('standard');
  const [pageCount, setPageCount] = useState('1');
  const [generating, setGenerating] = useState(false);
  const [webviewUrl, setWebviewUrl] = useState('');

  const webViewRef = useRef(null);

  // Close overlay and minimize back
  const handleClose = () => {
    BackHandler.exitApp(); // Exits the foreground app overlay back to LinkedIn
  };

  useEffect(() => {
    readClipboard();
    loadResumes();

    // Android physical back button handler
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (webviewUrl === '' || extractionStatus === 'success') return;

    console.log("[Overlay] WebView URL set. Initializing proactive injection timer...");
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (attempts > 8 || extractionStatus === 'success') {
        clearInterval(interval);
        return;
      }
      console.log(`[Overlay] Timer tick ${attempts}: Force-injecting extraction script...`);
      webViewRef.current?.injectJavaScript(JD_DETECTOR_SCRIPT);
    }, 2000);

    return () => clearInterval(interval);
  }, [webviewUrl, extractionStatus]);

  const readClipboard = async () => {
    try {
      console.log("[Overlay] Reading clipboard...");
      const content = await Clipboard.getString();
      console.log("[Overlay] Clipboard content:", content ? content.substring(0, 150) : "empty");
      
      if (content && (content.startsWith('http://') || content.startsWith('https://'))) {
        setCopiedUrl(content);
        setWebviewUrl(content);
        setExtractionStatus('Loading webpage and extracting JD...');
        console.log("[Overlay] Set Webview URL to:", content);
      } else {
        setExtractionStatus('No valid job link found in clipboard.');
        console.log("[Overlay] Clipboard content is not a URL");
      }
    } catch (err) {
      setExtractionStatus('Failed to read clipboard.');
      console.error("[Overlay] Clipboard read error:", err);
    }
  };

  const loadResumes = async () => {
    try {
      console.log("[Overlay] Loading user profiles...");
      // In overlay mode, we retrieve token directly from AsyncStorage
      const token = await AsyncStorage.getItem('jwt_token') || '';
      console.log("[Overlay] Token loaded, length:", token.length);
      
      const res = await fetch(`${API_BASE_URL}/api/resumes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
        console.log("[Overlay] Loaded profiles count:", data.length);
        if (data.length > 0) {
          setSelectedResume(data[0]);
        }
      } else {
        console.error("[Overlay] Failed to fetch resumes:", res.status);
      }
    } catch (err) {
      console.error('Overlay load resumes error:', err);
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleMessage = (event) => {
    try {
      console.log("[Overlay] Raw message from WebView:", event.nativeEvent.data);
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'JD_DETECTED' && data.text) {
        console.log("[Overlay] JD Detected payload match, title:", data.title);
        setExtractedJd(data);
        setExtractionStatus('success');
        showToast('🎯 Job description extracted successfully!');
      }
    } catch (e) {
      console.log("[Overlay] Non-JSON message from WebView:", event.nativeEvent.data);
    }
  };

  const handleGenerate = async () => {
    if (!selectedResume || !extractedJd) return;

    setGenerating(true);
    try {
      console.log("[Overlay] Initializing resume tailoring...");
      const token = await AsyncStorage.getItem('jwt_token') || '';
      console.log("[Overlay] Token fetched successfully, sending optimize request...");

      // Use x-www-form-urlencoded body instead of FormData to prevent Hermes/bridgeless engine FormData bugs
      const urlEncodedBody = [
        `file_id=${encodeURIComponent(selectedResume.id)}`,
        `jd=${encodeURIComponent(extractedJd.text)}`,
        `resume_data=${encodeURIComponent(JSON.stringify(selectedResume.data))}`,
        `mode=${encodeURIComponent(mode)}`,
        `page_count=${encodeURIComponent(pageCount)}`
      ].join('&');

      const response = await fetch(`${API_BASE_URL}/api/optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: urlEncodedBody,
      });

      console.log("[Overlay] Optimization response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Overlay] Optimization response error text:", errorText);
        throw new Error(`Generation failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log("[Overlay] Optimization result status:", result.status);

      if (result.status === 'success' && result.pdf_url) {
        console.log("[Overlay] Job completed instantly, starting download. URL:", result.pdf_url);
        await downloadAndShare(result.pdf_url, result.company_name, token);
      } else if (result.status === 'queued') {
        console.log("[Overlay] Job queued. Starting polling for job_id:", result.job_id);
        showToast('Queued! Downloading soon...');
        pollForResult(result.job_id, token);
      }
    } catch (err) {
      console.error("[Overlay] Optimization failed with error:", err);
      showToast(`Failed to generate: ${err.message}`, true);
      setGenerating(false);
    }
  };

  const pollForResult = async (jobId, token) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts >= 20) {
        clearInterval(interval);
        showToast('Processing is taking longer, check main app', true);
        setGenerating(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/job/${jobId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'completed' && data.result) {
            clearInterval(interval);
            const resultData = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
            await downloadAndShare(resultData.pdf_url, resultData.company_name, token);
          } else if (data.status === 'failed') {
            clearInterval(interval);
            showToast('Generation failed', true);
            setGenerating(false);
          }
        }
      } catch (e) {
        // Keep polling
      }
    }, 3000);
  };

  const downloadAndShare = async (pdfUrl, companyName, token) => {
    try {
      console.log("[Overlay] Starting PDF download from URL:", pdfUrl);
      let downloadUrl = pdfUrl;
      if (!downloadUrl.startsWith('http')) {
        downloadUrl = `${API_BASE_URL}${downloadUrl}`;
      }
      console.log("[Overlay] Full download URL:", downloadUrl);

      // Create customized candidate naming
      const candidateName = selectedResume?.data?.personal?.name || selectedResume?.title || 'Resume';
      const cleanCandidateName = candidateName.replace(/[^a-zA-Z0-9\s_-]/g, '').trim().replace(/\s+/g, '_');
      const fileName = `${cleanCandidateName}_${companyName || 'Resume'}_Tailored.pdf`;
      console.log("[Overlay] Constructed filename:", fileName);

      // If Android Native DownloadManager is available, download directly to public Downloads folder!
      if (NativeModules.FloatingBubble?.downloadFile) {
        console.log("[Overlay] Triggering direct native DownloadManager...");
        await NativeModules.FloatingBubble.downloadFile(downloadUrl, fileName, token);
        setGenerating(false);
        Alert.alert(
          'Success! 🎉',
          `Your tailored resume has been successfully downloaded to your Downloads folder:\n\n📁 ${fileName}`,
          [{ text: 'OK', onPress: () => handleClose() }]
        );
        return;
      }

      // Fallback: Save file to app documents directory and open share sheet
      const fileUri = FileSystem.documentDirectory + fileName;
      console.log("[Overlay] Saving file locally to:", fileUri);

      const downloadResult = await FileSystem.downloadAsync(downloadUrl, fileUri, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log("[Overlay] Download finished. Status:", downloadResult.status);
      setGenerating(false);

      if (downloadResult.status === 200) {
        console.log("[Overlay] Sharing downloaded PDF...");
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save your tailored resume',
          });
          handleClose();
        } else {
          console.error("[Overlay] Sharing API not available on this device");
        }
      } else {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }
    } catch (err) {
      console.error("[Overlay] PDF download/share failed:", err);
      showToast(`Failed to download PDF: ${err.message}`, true);
      setGenerating(false);
    }
  };

  return (
    <View style={styles.overlayBackground}>
      {/* Centered Glassmorphic Modal */}
      <View style={styles.glassCard}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>JD</Text>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>Resume AI Tailor</Text>
            <Text style={styles.subtitle}>Mobile Floating Widget</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Extraction Status Section */}
        {extractionStatus !== 'success' && (
          <View style={styles.statusBox}>
            {extractionStatus.includes('Loading') || extractionStatus.includes('Checking') ? (
              <ActivityIndicator color={theme.secondary} size="large" />
            ) : (
              <Text style={{ fontSize: 24 }}>⚠️</Text>
            )}
            <Text style={styles.statusText}>{extractionStatus}</Text>
            {extractionStatus.includes('No valid') && (
              <TouchableOpacity style={styles.retryBtn} onPress={readClipboard}>
                <Text style={styles.retryBtnText}>Retry Clipboard Check</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Success Forms */}
        {extractionStatus === 'success' && extractedJd && (
          <View style={styles.form}>
            <Text style={styles.jdLabel}>📌 {extractedJd.title || 'Job Description Detected'}</Text>

            {/* Resume Selection */}
            <Text style={styles.label}>SELECT BASE RESUME</Text>
            {loadingResumes ? (
              <ActivityIndicator color={theme.secondary} style={{ marginVertical: 8 }} />
            ) : resumes.length === 0 ? (
              <Text style={styles.errorText}>Please launch main app & upload a resume first.</Text>
            ) : (
              <View style={styles.pickerWrapper}>
                {resumes.map(resume => (
                  <TouchableOpacity
                    key={resume.id}
                    style={[
                      styles.resumePill,
                      selectedResume?.id === resume.id && styles.resumePillActive
                    ]}
                    onPress={() => setSelectedResume(resume)}
                  >
                    <Text style={[
                      styles.resumePillText,
                      selectedResume?.id === resume.id && styles.resumePillTextActive
                    ]}>
                      📄 {resume.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Mode selection */}
            <Text style={[styles.label, { marginTop: 12 }]}>TAILORING MODE</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeCard, mode === 'standard' && styles.modeCardSelected]}
                onPress={() => setMode('standard')}
              >
                <Text style={styles.modeTitle}>Standard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeCard, mode === 'redesign' && styles.modeCardSelected]}
                onPress={() => setMode('redesign')}
              >
                <Text style={styles.modeTitle}>Magic Redesign 🪄</Text>
              </TouchableOpacity>
            </View>

            {/* Page Count */}
            <Text style={[styles.label, { marginTop: 12 }]}>PAGE LENGTH</Text>
            <View style={styles.pageCountRow}>
              {['1', '2', 'auto'].map(count => (
                <TouchableOpacity
                  key={count}
                  style={[styles.pagePill, pageCount === count && styles.pagePillActive]}
                  onPress={() => setPageCount(count)}
                >
                  <Text style={[styles.pagePillText, pageCount === count && styles.pagePillTextActive]}>
                    {count === 'auto' ? 'Auto' : `${count} Page`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action button */}
            <TouchableOpacity
              style={[styles.generateBtn, !selectedResume && styles.generateBtnDisabled]}
              disabled={!selectedResume || generating}
              onPress={handleGenerate}
            >
              <LinearGradient
                colors={selectedResume ? theme.gradientPrimary : ['#333', '#443']}
                style={styles.generateBtnGradient}
              >
                {generating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.generateBtnText}>Generate & Download ✨</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Hidden Webview for extraction */}
      {webviewUrl !== '' && extractionStatus !== 'success' && (
        <View style={{ width: 0, height: 0, opacity: 0 }}>
          <WebView
            ref={webViewRef}
            source={{ uri: webviewUrl }}
            injectedJavaScript={JD_DETECTOR_SCRIPT}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onLoadProgress={({ nativeEvent }) => {
              if (nativeEvent.progress > 0.3) {
                console.log(`[Overlay] WebView progress: ${(nativeEvent.progress * 100).toFixed(0)}%, injecting script`);
                webViewRef.current?.injectJavaScript(JD_DETECTOR_SCRIPT);
              }
            }}
            onNavigationStateChange={(navState) => {
              console.log("[Overlay] WebView navigation state changed, loading:", navState.loading);
              webViewRef.current?.injectJavaScript(JD_DETECTOR_SCRIPT);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(7, 7, 10, 0.75)', // Transparent dark overlay dimmer
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(18, 18, 26, 0.95)',
    borderWidth: 1,
    borderColor: theme.glassBorder,
    borderRadius: theme.radiusLg,
    padding: 20,
    ...theme.shadowCard,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.glassBorder,
    paddingBottom: 12,
    marginBottom: 16,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.primary,
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 10,
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    color: theme.textMain,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: theme.textMuted,
    fontSize: 11,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.glassBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: theme.textMuted,
    fontSize: 12,
  },
  statusBox: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 16,
  },
  statusText: {
    color: theme.textMain,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryBtn: {
    backgroundColor: theme.primaryBg,
    borderColor: theme.primary,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.radiusSm,
  },
  retryBtnText: {
    color: theme.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  form: {
    gap: 10,
  },
  jdLabel: {
    color: theme.secondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    color: theme.textMuted,
    letterSpacing: 1,
    fontWeight: '700',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
  },
  pickerWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resumePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radiusSm,
    backgroundColor: theme.glassBg,
    borderWidth: 1,
    borderColor: theme.glassBorder,
  },
  resumePillActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderColor: theme.secondary,
  },
  resumePillText: {
    color: theme.textMuted,
    fontSize: 12,
  },
  resumePillTextActive: {
    color: theme.secondary,
    fontWeight: '600',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeCard: {
    flex: 1,
    backgroundColor: theme.glassBg,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    borderRadius: theme.radiusSm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modeCardSelected: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: theme.secondary,
  },
  modeTitle: {
    color: theme.textMain,
    fontSize: 13,
    fontWeight: '600',
  },
  pageCountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pagePill: {
    flex: 1,
    backgroundColor: theme.glassBg,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    borderRadius: theme.radiusSm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pagePillActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderColor: theme.secondary,
  },
  pagePillText: {
    color: theme.textMuted,
    fontSize: 12,
  },
  pagePillTextActive: {
    color: theme.secondary,
    fontWeight: '600',
  },
  generateBtn: {
    marginTop: 12,
    borderRadius: theme.radiusSm,
    overflow: 'hidden',
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  generateBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
