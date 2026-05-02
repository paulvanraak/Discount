import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface Props {
  totalDiamonds: number;
  onPause: () => void;
}

export function HUD({ totalDiamonds, onPause }: Props) {
  const elapsedTime = useGameStore((s) => s.elapsedTime);
  const diamondsCollected = useGameStore((s) => s.diamondsCollected);
  const worldId = useGameStore((s) => s.worldId);
  const levelId = useGameStore((s) => s.levelId);

  const collected = diamondsCollected.filter(Boolean).length;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const cs = Math.floor((secs % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${cs}`;
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Top bar */}
      <View style={styles.topBar}>
        {/* Level label */}
        <View style={styles.pill}>
          <Text style={styles.pillText}>
            {worldId}-{levelId}
          </Text>
        </View>

        {/* Timer */}
        <View style={styles.timerPill}>
          <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        </View>

        {/* Diamonds */}
        <View style={styles.pill}>
          <Text style={styles.diamondIcon}>◆</Text>
          <Text style={styles.pillText}>
            {collected}/{totalDiamonds}
          </Text>
        </View>
      </View>

      {/* Pause button — top right */}
      <TouchableOpacity style={styles.pauseBtn} onPress={onPause} activeOpacity={0.7}>
        <Text style={styles.pauseIcon}>⏸</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  topBar: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.md,
    right: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  timerPill: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  pillText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timerText: {
    color: COLORS.accentAlt,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  diamondIcon: {
    color: '#00ffff',
    fontSize: 12,
    marginRight: 4,
  },
  pauseBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.md,
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pauseIcon: {
    color: COLORS.text,
    fontSize: 18,
  },
});
