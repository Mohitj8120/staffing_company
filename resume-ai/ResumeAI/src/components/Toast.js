import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';

let toastTimeout = null;

// Global toast state manager
let setGlobalToast = null;

export function showToast(message, isError = false) {
  if (setGlobalToast) {
    setGlobalToast({ message, isError, visible: true });
  }
}

export default function Toast() {
  const [toast, setToast] = useState({ message: '', isError: false, visible: false });
  const translateY = new Animated.Value(100);

  useEffect(() => {
    setGlobalToast = setToast;
    return () => { setGlobalToast = null; };
  }, []);

  useEffect(() => {
    if (toast.visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();

      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setToast(prev => ({ ...prev, visible: false }));
        });
      }, 3000);
    }
  }, [toast.visible, toast.message]);

  if (!toast.visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
        toast.isError && styles.errorContainer,
      ]}
    >
      <Text style={[styles.text, toast.isError && styles.errorText]}>
        {toast.message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(20, 20, 25, 0.95)',
    borderWidth: 1,
    borderColor: theme.glassBorder,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: theme.radiusXl,
    alignItems: 'center',
    zIndex: 1000,
    ...theme.shadowCard,
  },
  errorContainer: {
    borderColor: theme.danger,
  },
  text: {
    color: theme.textMain,
    fontSize: 13,
    fontWeight: '500',
  },
  errorText: {
    color: theme.danger,
  },
});
