import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { WORLDS, LEVELS_PER_WORLD, MAX_STARS_PER_LEVEL } from '../constants/worlds';
import { AdBanner } from '../components/AdBanner';
import { useProgressStore } from '../store/useProgressStore';
import { MiniStars } from '../components/StarRating';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.36, 220);
const CARD_HEIGHT = CARD_WIDTH * 1.2;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WorldSelect'>;
};

export function WorldSelectScreen({ navigation }: Props) {
  const isWorldUnlocked = useProgressStore((s) => s.isWorldUnlocked);
  const getWorldStars = useProgressStore((s) => s.getWorldStars);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select World</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* World cards */}
      <FlatList
        data={WORLDS}
        keyExtractor={(w) => String(w.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={CARD_WIDTH + SPACING.md}
        decelerationRate="fast"
        renderItem={({ item: world }) => {
          const unlocked = isWorldUnlocked(world.id);
          const worldStars = getWorldStars(world.id);
          const maxStars = LEVELS_PER_WORLD * MAX_STARS_PER_LEVEL;

          return (
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: unlocked
                    ? world.theme.surfaceColor ?? COLORS.surfaceAlt
                    : COLORS.surface,
                  borderColor: unlocked ? world.theme.accentColor : COLORS.border,
                  opacity: unlocked ? 1 : 0.6,
                },
              ]}
              onPress={() =>
                unlocked
                  ? navigation.navigate('LevelSelect', { worldId: world.id })
                  : null
              }
              activeOpacity={unlocked ? 0.8 : 1}
            >
              {/* World colour swatch */}
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: world.theme.accentColor },
                ]}
              />

              {!unlocked && (
                <View style={styles.lockOverlay}>
                  <Text style={styles.lockIcon}>🔒</Text>
                  <Text style={styles.lockText}>
                    {world.starsToUnlock}★ to unlock
                  </Text>
                </View>
              )}

              <Text style={styles.worldSubtitle}>{world.subtitle}</Text>
              <Text
                style={[
                  styles.worldName,
                  { color: unlocked ? world.theme.accentColor : COLORS.textMuted },
                ]}
              >
                {world.name}
              </Text>
              <Text style={styles.worldDesc} numberOfLines={2}>
                {world.description}
              </Text>

              {unlocked && (
                <View style={styles.starsRow}>
                  <MiniStars stars={worldStars} total={maxStars} />
                  <Text style={styles.starsText}>
                    {worldStars}/{maxStars}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      <AdBanner />
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
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xl,
    gap: SPACING.md,
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  swatch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT * 0.4,
    opacity: 0.25,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  lockIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  lockText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  worldSubtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: CARD_HEIGHT * 0.35,
    textTransform: 'uppercase',
  },
  worldName: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  worldDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: SPACING.sm,
    gap: 4,
  },
  starsText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
});
