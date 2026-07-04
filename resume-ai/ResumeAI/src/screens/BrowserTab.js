import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { WebView } from 'react-native-webview';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from '../theme';
import { JD_DETECTOR_SCRIPT } from '../utils/jdDetector';
import JDDetectedSheet from '../components/JDDetectedSheet';
import { showToast } from '../components/Toast';

export default function BrowserTab({ navigation }) {
  const [url, setUrl] = useState('https://www.linkedin.com/jobs');
  const [inputUrl, setInputUrl] = useState('https://www.linkedin.com/jobs');
  const [jdDetected, setJdDetected] = useState(false);
  const [detectedJD, setDetectedJD] = useState(null);
  const [currentTitle, setCurrentTitle] = useState('');
  const webViewRef = useRef(null);
  const bottomSheetRef = useRef(null);

  const handleGo = () => {
    Keyboard.dismiss();
    let navigateUrl = inputUrl.trim();
    if (!navigateUrl.startsWith('http://') && !navigateUrl.startsWith('https://')) {
      navigateUrl = 'https://' + navigateUrl;
    }
    setUrl(navigateUrl);
  };

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'JD_DETECTED' && data.text) {
        setDetectedJD(data);
        setCurrentTitle(data.title || 'Job Description');
        setJdDetected(true);
        bottomSheetRef.current?.snapToIndex(0);
        showToast('🎯 Job description detected!');
      }
    } catch (e) {
      // Not a JSON message, ignore
    }
  }, []);

  const handleYes = () => {
    setJdDetected(false);
    bottomSheetRef.current?.close();
    // Navigate to Generate screen with the detected JD
    navigation.navigate('Generate', {
      jdText: detectedJD?.text || '',
      jdTitle: detectedJD?.title || '',
    });
  };

  const handleNo = () => {
    setJdDetected(false);
    bottomSheetRef.current?.close();
  };

  const handleNavigationChange = (navState) => {
    setInputUrl(navState.url);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* URL Bar */}
      <View style={styles.urlBar}>
        <TextInput
          style={styles.urlInput}
          value={inputUrl}
          onChangeText={setInputUrl}
          placeholder="Enter URL..."
          placeholderTextColor={theme.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="go"
          onSubmitEditing={handleGo}
          selectTextOnFocus
        />
        <TouchableOpacity style={styles.goBtn} onPress={handleGo} activeOpacity={0.7}>
          <Text style={styles.goBtnText}>Go</Text>
        </TouchableOpacity>
      </View>

      {/* WebView Browser */}
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        injectedJavaScript={JD_DETECTOR_SCRIPT}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      />

      {/* JD Detected Bottom Sheet */}
      <JDDetectedSheet
        visible={jdDetected}
        jdTitle={currentTitle}
        onYes={handleYes}
        onNo={handleNo}
        bottomSheetRef={bottomSheetRef}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bgDark,
  },
  urlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(18, 18, 26, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: theme.glassBorder,
    gap: 8,
  },
  urlInput: {
    flex: 1,
    backgroundColor: theme.glassBg,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    borderRadius: theme.radiusSm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: theme.textMain,
    fontSize: 13,
  },
  goBtn: {
    backgroundColor: theme.primary,
    borderRadius: theme.radiusSm,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  goBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.textMuted,
    fontSize: 16,
  },
});
