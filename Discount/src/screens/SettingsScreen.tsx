import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, GameSettings } from '../types';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useProgressStore } from '../store/useProgressStore';
import { calibrateGyro } from '../hooks/useGyroscope';
import { setMusicVolume, setSfxVolume } from '../services/audio';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

const SENSITIVITY_OPTIONS: GameSettings['gyroSensitivity'][] = [
  'low',
  'medium',
  'high',
];

export function SettingsScreen({ navigation }: Props) {
  const settings = useProgressStore((s) => s.settings);
  const updateSettings = useProgressStore((s) => s.updateSettings);
  const reset = useProgressStore((s) => s.reset);

  const [calibrating, setCalibrating] = useState(false);

  const handleMusicVolume = (value: number) => {
    const vol = Math.round(value * 10) / 10;
    updateSettings({ musicVolume: vol });
    setMusicVolume(vol);
  };

  const handleSfxVolume = (value: number) => {
    const vol = Math.round(value * 10) / 10;
    updateSettings({ sfxVolume: vol });
    setSfxVolume(vol);
  };

  const handleCalibrate = async () => {
    setCalibrating(true);
    const offsets = await calibrateGyro();
    setCalibrating(false);

    if (offsets) {
      updateSettings({ calibrationX: offsets.x, calibrationZ: offsets.z });
      Alert.alert('Calibrated!', 'Tilt sensor has been reset to current position.');
    } else {
      Alert.alert('Unavailable', 'Gyroscope is not available on this device.');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Progress',
      'This will erase ALL progress, stars, coins and purchased skins. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            reset();
            navigation.navigate('MainMenu');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ─ Audio ──────────────────────────────────────────────── */}
        <SectionLabel label="Audio" />

        <SettingRow label="Music">
          <VolumeSlider
            value={settings.musicVolume}
            onChange={handleMusicVolume}
          />
        </SettingRow>

        <SettingRow label="Sound FX">
          <VolumeSlider
            value={settings.sfxVolume}
            onChange={handleSfxVolume}
          />
        </SettingRow>

        {/* ─ Controls ───────────────────────────────────────────── */}
        <SectionLabel label="Controls" />

        <SettingRow label="Gyro Sensitivity">
          <View style={styles.segmented}>
            {SENSITIVITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.segBtn,
                  settings.gyroSensitivity === opt && styles.segBtnActive,
                ]}
                onPress={() => updateSettings({ gyroSensitivity: opt })}
              >
                <Text
                  style={[
                    styles.segLabel,
                    settings.gyroSensitivity === opt && styles.segLabelActive,
                  ]}
                >
                  {opt[0].toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingRow>

        <TouchableOpacity
          style={[styles.actionBtn, calibrating && styles.actionBtnDisabled]}
          onPress={handleCalibrate}
          disabled={calibrating}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>
            {calibrating ? 'Calibrating…' : '⊙  Calibrate Gyro'}
          </Text>
          <Text style={styles.actionBtnSub}>
            Hold phone at rest and tap
          </Text>
        </TouchableOpacity>

        {/* ─ Data ───────────────────────────────────────────────── */}
        <SectionLabel label="Data" />

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnDanger]}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>
            ⚠  Reset All Progress
          </Text>
          <Text style={styles.actionBtnSub}>
            Permanently erases stars, coins, skins
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={styles.sectionLabel}>{label}</Text>
  );
}

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      {children}
    </View>
  );
}

function VolumeSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const steps = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  return (
    <View style={styles.volRow}>
      <TouchableOpacity
        onPress={() => onChange(Math.max(0, value - 0.1))}
        style={styles.volBtn}
      >
        <Text style={styles.volBtnText}>−</Text>
      </TouchableOpacity>

      <View style={styles.volTrack}>
        <View
          style={[
            styles.volFill,
            { width: `${value * 100}%` },
          ]}
        />
      </View>

      <TouchableOpacity
        onPress={() => onChange(Math.min(1, value + 0.1))}
        style={styles.volBtn}
      >
        <Text style={styles.volBtnText}>+</Text>
      </TouchableOpacity>

      <Text style={styles.volValue}>{Math.round(value * 10)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: COLORS.text,
    fontSize: 22,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.sm,
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingLabel: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  volRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  volBtn: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  volBtnText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  volTrack: {
    width: 100,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  volFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  volValue: {
    color: COLORS.textSecondary,
    fontSize: 13,
    width: 20,
    textAlign: 'right',
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 2,
    gap: 2,
  },
  segBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  segBtnActive: {
    backgroundColor: COLORS.primary,
  },
  segLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  segLabelActive: {
    color: COLORS.text,
  },
  actionBtn: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionBtnDanger: {
    borderColor: `${COLORS.danger}44`,
    backgroundColor: `${COLORS.danger}11`,
    marginTop: SPACING.sm,
  },
  actionBtnText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  actionBtnSub: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
