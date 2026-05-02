import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { WORLDS, LEVELS_PER_WORLD } from '../constants/worlds';
import { AdBanner } from '../components/AdBanner';
import { MiniStars } from '../components/StarRating';
import { useProgressStore } from '../store/useProgressStore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LevelSelect'>;
  route: RouteProp<RootStackParamList, 'LevelSelect'>;
};

export function LevelSelectScreen({ navigation, route }: Props) {
  const { worldId } = route.params;
  const world = WORLDS.find((w) => w.id === worldId)!;

  const isLevelUnlocked = useProgressStore((s) => s.isLevelUnlocked);
  const getLevelResult = useProgressStore((s) => s.getLevelResult);

  const levels = Array.from({ length: LEVELS_PER_WORLD }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.worldSubtitle}>{world.subtitle}</Text>
          <Text style={[styles.worldName, { color: world.theme.accentColor }]}>
            {world.name}
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Level grid */}
      <FlatList
        data={levels}
        keyExtractor={(id) => String(id)}
        numColumns={4}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item: levelId }) => {
          const unlocked = isLevelUnlocked(worldId, levelId);
          const result = getLevelResult(worldId, levelId);
          const stars = result?.stars ?? 0;
          const completed = result?.completed ?? false;

          return (
            <TouchableOpacity
              style={[
                styles.tile,
                {
                  borderColor: completed
                    ? world.theme.accentColor
                    : unlocked
                    ? COLORS.border
                    : 'transparent',
                  backgroundColor: completed
                    ? `${world.theme.wallColor}33`
                    : unlocked
                    ? COLORS.surfaceAlt
                    : COLORS.surface,
                  opacity: unlocked ? 1 : 0.5,
                },
              ]}
              onPress={() =>
                unlocked
                  ? navigation.navigate('Gameplay', { worldId, levelId })
                  : null
              }
              activeOpacity={unlocked ? 0.75 : 1}
            >
              {unlocked ? (
                <>
                  <Text style={styles.levelNum}>{levelId}</Text>
                  {completed && (
                    <MiniStars stars={stars} />
                  )}
                </>
              ) : (
                <Text style={styles.lockIcon}>🔒</Text>
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
  headerCenter: {
    alignItems: 'center',
  },
  worldSubtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  worldName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  grid: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  row: {
    gap: SPACING.md,
    justifyContent: 'center',
  },
  tile: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  levelNum: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },
  lockIcon: {
    fontSize: 20,
  },
});
