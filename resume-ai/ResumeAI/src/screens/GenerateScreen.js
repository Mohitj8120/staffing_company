import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, ActivityIndicator, Alert, Platform, NativeModules
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useAuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { theme } from '../theme';
import ResumeCard from '../components/ResumeCard';
import { showToast } from '../components/Toast';

export default function GenerateScreen({ route, navigation }) {
  const { jdText = '', jdTitle = '' } = route.params || {};
  const { getToken } = useAuthContext();

  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [mode, setMode] = useState('standard');
  const [pageCount, setPageCount] = useState('1');
  const [generating, setGenerating] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [jd, setJd] = useState(jdText);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/resumes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
        // Auto-select first resume if only one
        if (data.length === 1) {
          setSelectedResume(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoadingResumes(false);
    }
  };

  const canGenerate = selectedResume && jd.trim().length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setGenerating(true);
    try {
      const token = await getToken();

      const formData = new FormData();
      formData.append('file_id', selectedResume.id);
      formData.append('jd', jd);
      formData.append('resume_data', JSON.stringify(selectedResume.data));
      formData.append('mode', mode);
      formData.append('page_count', pageCount);

      const response = await fetch(`${API_BASE_URL}/api/optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Generation failed');
      }

      const result = await response.json();

      if (result.status === 'success' && result.pdf_url) {
        showToast('Resume generated! ✨ Downloading...');
        await downloadPDF(result);
      } else if (result.status === 'queued') {
        showToast('Queued! Resume will be ready soon.');
        // Poll for completion
        pollForResult(result.job_id, token);
      }
    } catch (error) {
      console.error('Generation error:', error);
      showToast(error.message || 'Failed to generate resume', true);
    } finally {
      setGenerating(false);
    }
  };

  const pollForResult = async (jobId, token) => {
    let attempts = 0;
    const maxAttempts = 30;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        showToast('Generation is taking too long, try again later', true);
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
            showToast('Resume ready! ✨ Downloading...');
            await downloadPDF(resultData);
          } else if (data.status === 'failed') {
            clearInterval(interval);
            showToast('Generation failed', true);
          }
        }
      } catch (e) {
        // Network error, keep polling
      }
    }, 3000);
  };

  const downloadPDF = async (result) => {
    try {
      let downloadUrl = result.pdf_url;
      if (!downloadUrl.startsWith('http')) {
        downloadUrl = `${API_BASE_URL}${downloadUrl}`;
      }

      const companyName = result.company_name || 'Company';
      const candidateName = (result.optimized_data?.personal?.name || 'Resume')
        .replace(/[^a-zA-Z0-9\s_-]/g, '').trim().replace(/\s+/g, '-');
      const fileName = `${candidateName}_${companyName}.pdf`;

      const token = await getToken();

      // Direct Download using native module if available
      if (NativeModules.FloatingBubble?.downloadFile) {
        await NativeModules.FloatingBubble.downloadFile(downloadUrl, fileName, token);
        Alert.alert(
          'Success! 🎉',
          `Your tailored resume has been successfully downloaded to your Downloads folder:\n\n📁 ${fileName}`,
          [{ text: 'OK' }]
        );
        return;
      }

      const fileUri = FileSystem.documentDirectory + fileName;
      const downloadResult = await FileSystem.downloadAsync(downloadUrl, fileUri, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (downloadResult.status === 200) {
        // Share the downloaded file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save your tailored resume',
          });
          showToast('Resume saved! 🎉');
        } else {
          showToast('File downloaded to: ' + downloadResult.uri);
        }
      } else {
        showToast('Download failed', true);
      }
    } catch (err) {
      console.error('Download error:', err);
      showToast('Failed to download PDF', true);
    }
  };

  return (
    <LinearGradient colors={theme.gradientBackground} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* JD Display */}
        <Text style={styles.label}>JOB DESCRIPTION</Text>
        <TextInput
          style={styles.jdTextarea}
          value={jd}
          onChangeText={setJd}
          multiline
          placeholder="Paste job description here..."
          placeholderTextColor={theme.textMuted}
          textAlignVertical="top"
        />

        {/* Resume Selection */}
        <Text style={styles.label}>SELECT BASE RESUME</Text>
        {loadingResumes ? (
          <ActivityIndicator color={theme.secondary} style={{ marginVertical: 16 }} />
        ) : resumes.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No resumes found. Upload one first.</Text>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.uploadBtnText}>Go to Profiles</Text>
            </TouchableOpacity>
          </View>
        ) : (
          resumes.map(resume => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              isSelected={selectedResume?.id === resume.id}
              onSelect={setSelectedResume}
            />
          ))
        )}

        {/* Mode Selection */}
        <Text style={[styles.label, { marginTop: 24 }]}>GENERATION MODE</Text>
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[styles.modeCard, mode === 'standard' && styles.modeCardSelected]}
            onPress={() => setMode('standard')}
            activeOpacity={0.7}
          >
            <Text style={styles.modeIcon}>📄</Text>
            <Text style={[styles.modeTitle, mode === 'standard' && styles.modeTitleSelected]}>
              STANDARD TAILOR
            </Text>
            <Text style={styles.modeDesc}>USES STANDARD ATS-FRIENDLY LAYOUT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, styles.modeCardPremium, mode === 'redesign' && styles.modeCardPremiumSelected]}
            onPress={() => setMode('redesign')}
            activeOpacity={0.7}
          >
            <Text style={styles.modeIcon}>🪄</Text>
            <Text style={[styles.modeTitle, mode === 'redesign' && styles.modeTitlePremiumSelected]}>
              MAGIC REDESIGN
            </Text>
            <Text style={styles.modeDesc}>PREMIUM STYLING CUSTOMIZED FOR YOUR ROLE</Text>
          </TouchableOpacity>
        </View>

        {/* Page Count */}
        <Text style={[styles.label, { marginTop: 24 }]}>RESUME LENGTH</Text>
        <View style={styles.pillContainer}>
          {[
            { value: '1', label: '1 PAGE\n(PUNCHY)' },
            { value: '2', label: '2 PAGES\n(DETAILED)' },
            { value: 'auto', label: 'AUTO' },
          ].map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.pill, pageCount === option.value && styles.pillSelected]}
              onPress={() => setPageCount(option.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, pageCount === option.value && styles.pillTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateBtn, !canGenerate && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={!canGenerate || generating}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={canGenerate ? theme.gradientPrimary : ['#1a1a2e', '#1a1a2e']}
            style={styles.generateBtnGradient}
          >
            {generating ? (
              <View style={styles.generatingRow}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.generateBtnText}>Crafting Perfect Resume...</Text>
              </View>
            ) : (
              <Text style={[styles.generateBtnText, !canGenerate && styles.generateBtnTextDisabled]}>
                Generate Resume ✨
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.paddingLg,
    paddingBottom: 60,
  },
  label: {
    fontSize: theme.fontSm,
    color: theme.textMuted,
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 10,
  },
  jdTextarea: {
    backgroundColor: theme.glassBg,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    borderRadius: theme.radiusMd,
    padding: 14,
    color: theme.textMain,
    fontSize: 13,
    minHeight: 140,
    maxHeight: 200,
    marginBottom: 24,
  },
  emptyBox: {
    backgroundColor: theme.glassBg,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    borderRadius: theme.radiusMd,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: theme.textMuted,
    fontSize: 13,
  },
  uploadBtn: {
    backgroundColor: theme.primaryBg,
    borderWidth: 1,
    borderColor: theme.primary,
    borderRadius: theme.radiusSm,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  uploadBtnText: {
    color: theme.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modeCard: {
    flex: 1,
    backgroundColor: theme.glassBg,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    borderRadius: theme.radiusMd,
    padding: 16,
    gap: 8,
  },
  modeCardSelected: {
    backgroundColor: theme.primaryBg,
    borderColor: theme.primary,
  },
  modeCardPremium: {
    backgroundColor: 'rgba(20,20,30,0.8)',
  },
  modeCardPremiumSelected: {
    backgroundColor: theme.secondaryBg,
    borderColor: theme.secondary,
  },
  modeIcon: {
    fontSize: 24,
  },
  modeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textMain,
  },
  modeTitleSelected: {
    color: '#d8b4fe',
  },
  modeTitlePremiumSelected: {
    color: theme.secondary,
  },
  modeDesc: {
    fontSize: 10,
    color: theme.textMuted,
    lineHeight: 14,
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: theme.glassBg,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    borderRadius: theme.radiusSm,
    padding: 4,
    gap: 4,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  pillSelected: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textMuted,
    textAlign: 'center',
  },
  pillTextSelected: {
    color: theme.secondary,
  },
  generateBtn: {
    marginTop: 28,
    borderRadius: theme.radiusMd,
    overflow: 'hidden',
    ...theme.shadowCard,
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  generateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  generateBtnTextDisabled: {
    color: theme.textMuted,
  },
});
