import React, { useCallback, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

export default function JDDetectedSheet({ visible, jdTitle, onYes, onNo, bottomSheetRef }) {
  const snapPoints = useMemo(() => ['35%'], []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={onNo}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>🎯</Text>
        </View>

        <Text style={styles.title}>Job Description Detected</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {jdTitle || 'Generate a tailored resume for this role?'}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnSecondary} onPress={onNo} activeOpacity={0.7}>
            <Text style={styles.btnSecondaryText}>No Thanks</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={onYes} activeOpacity={0.7}>
            <Text style={styles.btnPrimaryText}>Yes, Tailor Resume</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#12121a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: theme.glassBorderLight,
  },
  handleIndicator: {
    backgroundColor: theme.textMuted,
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: theme.fontXl,
    fontWeight: '700',
    color: theme.textMain,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontMd,
    color: theme.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radiusMd,
    backgroundColor: theme.glassBg,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: theme.textMuted,
    fontWeight: '600',
    fontSize: theme.fontMd,
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radiusMd,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: theme.textMain,
    fontWeight: '700',
    fontSize: theme.fontMd,
  },
});
