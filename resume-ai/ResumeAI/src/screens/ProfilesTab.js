import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, RefreshControl, NativeModules
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { useAuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { theme } from '../theme';
import ResumeCard from '../components/ResumeCard';
import { showToast } from '../components/Toast';

const { FloatingBubble } = NativeModules;

export default function ProfilesTab({ navigation }) {
  const { getToken } = useAuthContext();
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bubbleActive, setBubbleActive] = useState(false);

  const loadResumes = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/resumes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
      }
    } catch (err) {
      console.error('Failed to load resumes:', err);
    } finally {
      setLoadingResumes(false);
      setRefreshing(false);
    }
  };

  const checkBubbleStatus = async () => {
    if (FloatingBubble) {
      try {
        const running = await FloatingBubble.isRunning();
        setBubbleActive(running);
      } catch (e) {
        // Module might not be ready
      }
    }
  };

  useEffect(() => {
    loadResumes();
    checkBubbleStatus();
  }, []);

  const toggleBubble = async () => {
    if (!FloatingBubble) {
      showToast('Floating module not available', true);
      return;
    }

    if (bubbleActive) {
      FloatingBubble.stopBubble();
      setBubbleActive(false);
      showToast('Floating widget stopped');
    } else {
      const hasPerm = await FloatingBubble.hasPermission();
      if (!hasPerm) {
        Alert.alert(
          'Permission Required',
          'Please enable "Draw over other apps" permission in Settings to show the floating bubble.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Enable Settings', onPress: () => FloatingBubble.requestPermission() }
          ]
        );
        return;
      }
      FloatingBubble.startBubble();
      setBubbleActive(true);
      showToast('Floating widget started! ✨');
    }
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (!file) return;

      setUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/pdf',
      });

      const token = await getToken();

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/api/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.onload = () => {
        setUploading(false);
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status === 200 || xhr.status === 201) {
            if (res.status === 'success') {
              showToast('Resume uploaded successfully! ✨');
              loadResumes(); // Refresh list
            } else if (res.status === 'duplicate') {
              showToast('This resume has already been uploaded');
            } else if (res.status === 'queued') {
              showToast('Upload queued — processing in background');
              setTimeout(loadResumes, 5000);
            }
          } else {
            showToast(res.detail || 'Failed to upload resume', true);
          }
        } catch (e) {
          showToast('Failed to parse upload response', true);
        }
      };

      xhr.onerror = (error) => {
        setUploading(false);
        console.error('XHR Upload error:', error);
        showToast('Failed to upload resume', true);
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Upload preparation error:', error);
      showToast('Failed to upload resume', true);
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    Alert.alert(
      'Delete Resume',
      'Are you sure you want to delete this base resume?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              const res = await fetch(`${API_BASE_URL}/api/resumes/${fileId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) {
                setResumes(prev => prev.filter(r => r.id !== fileId));
                showToast('Resume removed');
              } else {
                const data = await res.json();
                showToast(data.detail || 'Failed to delete', true);
              }
            } catch (err) {
              showToast('Failed to delete resume', true);
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadResumes();
  };

  return (
    <LinearGradient colors={theme.gradientBackground} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.secondary} />
        }
      >
        {/* Floating Widget Toggle Card */}
        <View style={[styles.bubbleCard, bubbleActive && styles.bubbleCardActive]}>
          <LinearGradient
            colors={bubbleActive ? ['rgba(0, 229, 255, 0.12)', 'rgba(0, 0, 0, 0.3)'] : ['rgba(138, 43, 226, 0.05)', 'rgba(0, 0, 0, 0.2)']}
            style={styles.bubbleCardGrad}
          >
            <View style={styles.bubbleCardInfo}>
              <View style={styles.bubbleCardTitleRow}>
                <Text style={styles.bubbleCardTitle}>🚀 Floating Widget</Text>
              </View>
              <Text style={styles.bubbleCardDesc}>
                {bubbleActive
                  ? 'Widget is active! Open LinkedIn, copy a job link, and tap the floating bubble.'
                  : 'Enable the floating bubble to quickly tailor resumes while browsing other apps.'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, bubbleActive && styles.toggleBtnActive]}
              onPress={toggleBubble}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleBtnText, bubbleActive && styles.toggleBtnTextActive]}>
                {bubbleActive ? 'STOP' : 'START'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Upload Area */}
        <TouchableOpacity
          style={[styles.uploadArea, uploading && styles.uploadAreaUploading]}
          onPress={handleUpload}
          activeOpacity={0.7}
          disabled={uploading}
        >
          {uploading ? (
            <View style={styles.uploadContent}>
              <View style={[styles.uploadIconCircle, styles.uploadIconCircleUploading]}>
                <ActivityIndicator color={theme.primary} size="small" />
              </View>
              <Text style={styles.uploadText}>Uploading & Processing...</Text>
            </View>
          ) : (
            <View style={styles.uploadContent}>
              <View style={styles.uploadIconCircle}>
                <Text style={styles.uploadIcon}>⬆️</Text>
              </View>
              <Text style={styles.uploadText}>Upload Base Resume</Text>
              <Text style={styles.uploadSub}>.DOCX or .PDF format</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Resumes List */}
        <Text style={styles.sectionTitle}>YOUR PROFILES</Text>

        {loadingResumes ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={theme.secondary} />
          </View>
        ) : resumes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No base resumes found. Upload one to get started.</Text>
          </View>
        ) : (
          resumes.map(resume => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onDelete={handleDelete}
            />
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.paddingLg,
    paddingBottom: 120,
  },
  uploadArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    borderStyle: 'dashed',
    borderRadius: theme.radiusLg,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  uploadAreaUploading: {
    borderColor: 'rgba(138, 43, 226, 0.4)',
  },
  uploadContent: {
    alignItems: 'center',
    gap: 8,
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  uploadIconCircleUploading: {
    backgroundColor: 'rgba(138, 43, 226, 0.08)',
    borderColor: 'rgba(138, 43, 226, 0.2)',
  },
  uploadIcon: {
    fontSize: 22,
    color: '#00e5ff',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  uploadSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  sectionTitle: {
    fontSize: 12,
    color: 'rgba(138, 43, 226, 0.8)',
    letterSpacing: 1.5,
    fontWeight: '800',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  bubbleCard: {
    backgroundColor: 'rgba(18, 18, 28, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: theme.radiusLg,
    marginBottom: 24,
    overflow: 'hidden',
  },
  bubbleCardActive: {
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  bubbleCardGrad: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  bubbleCardInfo: {
    flex: 1,
  },
  bubbleCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bubbleCardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  bubbleCardDesc: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    lineHeight: 16,
  },
  toggleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  toggleBtnActive: {
    backgroundColor: '#00e5ff',
    borderColor: '#00e5ff',
  },
  toggleBtnText: {
    color: '#a0a0a0',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  toggleBtnTextActive: {
    color: '#07070a',
  },
});
