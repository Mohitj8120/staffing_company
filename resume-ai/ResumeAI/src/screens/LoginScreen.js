import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useAuthContext } from '../context/AuthContext';
import { GOOGLE_WEB_CLIENT_ID } from '../config';
import { theme } from '../theme';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

export default function LoginScreen() {
  const { loginWithGoogle } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      
      // Get the idToken from the response
      const idToken = response.data?.idToken || response.idToken;
      
      if (!idToken) {
        throw new Error('No ID token received from Google');
      }
      
      // Send to our backend (same as web app's loginWithGoogle)
      await loginWithGoogle(idToken);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled — do nothing
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Sign in already in progress
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available');
      } else {
        Alert.alert('Login Failed', error.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={theme.gradientBackground} style={styles.container}>
      {/* Animated Orbs */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <LinearGradient colors={theme.gradientPrimary} style={styles.logoIcon}>
          <Text style={styles.logoText}>JD</Text>
        </LinearGradient>
        <Text style={styles.appName}>Resume AI</Text>
        <Text style={styles.subtitle}>AI-Powered Resume Tailoring</Text>
      </View>

      {/* Features */}
      <View style={styles.features}>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>🎯</Text>
          <Text style={styles.featureText}>Auto-detect job descriptions</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>✨</Text>
          <Text style={styles.featureText}>AI-tailored resumes in seconds</Text>
        </View>
        <View style={styles.featureRow}>
          <Text style={styles.featureIcon}>📄</Text>
          <Text style={styles.featureText}>Download perfect PDF instantly</Text>
        </View>
      </View>

      {/* Google Sign In Button */}
      <TouchableOpacity
        style={styles.signInButton}
        onPress={handleGoogleSignIn}
        activeOpacity={0.8}
        disabled={loading}
      >
        <LinearGradient
          colors={['#4285F4', '#34A853']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.signInGradient}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.signInText}>Sign in with Google</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.footer}>Same account as resume.averioncareers.com</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.25,
  },
  orb1: {
    width: 280,
    height: 280,
    backgroundColor: theme.primary,
    top: -60,
    left: -60,
  },
  orb2: {
    width: 220,
    height: 220,
    backgroundColor: theme.secondary,
    bottom: -50,
    right: -50,
    opacity: 0.15,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...theme.shadowGlow,
  },
  logoText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 24,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.textMain,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: theme.fontMd,
    color: theme.textMuted,
    marginTop: 6,
    letterSpacing: 1,
  },
  features: {
    width: '100%',
    marginBottom: 48,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.glassBg,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    borderRadius: theme.radiusMd,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  featureIcon: {
    fontSize: 22,
  },
  featureText: {
    color: theme.textMain,
    fontSize: theme.fontMd,
    fontWeight: '500',
  },
  signInButton: {
    width: '100%',
    borderRadius: theme.radiusMd,
    overflow: 'hidden',
    ...theme.shadowCard,
  },
  signInGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  googleIcon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  signInText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    color: theme.textMuted,
    fontSize: theme.fontSm,
    marginTop: 16,
  },
});
