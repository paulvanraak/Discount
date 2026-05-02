import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface Props {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export function PauseMenu({ visible, onResume, onRestart, onQuit }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Paused</Text>
          <View style={styles.divider} />

          <MenuButton label="▶  Resume" onPress={onResume} variant="primary" />
          <MenuButton label="↺  Restart" onPress={onRestart} variant="secondary" />
          <MenuButton label="✕  Quit to Menu" onPress={onQuit} variant="danger" />
        </View>
      </View>
    </Modal>
  );
}

interface BtnProps {
  label: string;
  onPress: () => void;
  variant: 'primary' | 'secondary' | 'danger';
}

function MenuButton({ label, onPress, variant }: BtnProps) {
  const bgMap = {
    primary: COLORS.primary,
    secondary: COLORS.surfaceAlt,
    danger: 'rgba(244,67,54,0.2)',
  };
  const colorMap = {
    primary: COLORS.text,
    secondary: COLORS.text,
    danger: COLORS.danger,
  };
  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bgMap[variant] }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.btnText, { color: colorMap[variant] }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 280,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  btn: {
    width: '100%',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
