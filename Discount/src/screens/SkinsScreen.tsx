import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { SKINS } from '../constants/skins';
import { AdBanner } from '../components/AdBanner';
import { useProgressStore } from '../store/useProgressStore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Skins'>;
};

export function SkinsScreen({ navigation }: Props) {
  const equippedSkin = useProgressStore((s) => s.equippedSkin);
  const purchasedSkins = useProgressStore((s) => s.purchasedSkins);
  const coins = useProgressStore((s) => s.coins);
  const totalStars = useProgressStore((s) => s.totalStars);
  const purchaseSkin = useProgressStore((s) => s.purchaseSkin);
  const equipSkin = useProgressStore((s) => s.equipSkin);

  const handlePress = (skinId: string, cost: number, unlockStars?: number) => {
    if (purchasedSkins.includes(skinId)) {
      equipSkin(skinId);
      return;
    }

    // Check star unlock
    if (unlockStars && totalStars >= unlockStars) {
      equipSkin(skinId);
      return;
    }

    // Purchase with coins
    purchaseSkin(skinId, cost);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Marble Skins</Text>
        <View style={styles.coinChip}>
          <Text style={styles.coinIcon}>◈</Text>
          <Text style={styles.coinText}>{coins}</Text>
        </View>
      </View>

      {/* Skin grid */}
      <FlatList
        data={SKINS}
        keyExtractor={(s) => s.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item: skin }) => {
          const owned = purchasedSkins.includes(skin.id);
          const equipped = skin.id === equippedSkin;
          const starUnlocked =
            skin.unlockStars !== undefined && totalStars >= skin.unlockStars;
          const canAfford = coins >= skin.cost;
          const available = owned || starUnlocked;

          return (
            <TouchableOpacity
              style={[
                styles.skinCard,
                equipped && styles.skinCardEquipped,
                !available && styles.skinCardLocked,
              ]}
              onPress={() => handlePress(skin.id, skin.cost, skin.unlockStars)}
              activeOpacity={0.8}
            >
              {/* Marble preview */}
              <View
                style={[
                  styles.marblePreview,
                  {
                    backgroundColor: skin.color,
                    shadowColor: skin.emissive || skin.color,
                    shadowOpacity: skin.emissiveIntensity * 0.8 + 0.2,
                  },
                ]}
              >
                <View style={styles.marbleShine} />
              </View>

              <Text style={styles.skinName}>{skin.name}</Text>

              {equipped ? (
                <Text style={styles.equippedBadge}>Equipped</Text>
              ) : available ? (
                <Text style={styles.ownedBadge}>Tap to Equip</Text>
              ) : skin.unlockStars ? (
                <Text style={styles.lockLabel}>★ {skin.unlockStars}</Text>
              ) : (
                <Text
                  style={[
                    styles.costLabel,
                    !canAfford && styles.costLabelDisabled,
                  ]}
                >
                  ◈ {skin.cost}
                </Text>
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
  coinChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  coinIcon: {
    color: COLORS.accentAlt,
    fontSize: 14,
  },
  coinText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  grid: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  row: {
    gap: SPACING.md,
    justifyContent: 'center',
  },
  skinCard: {
    width: 110,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceAlt,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  skinCardEquipped: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}22`,
  },
  skinCardLocked: {
    opacity: 0.6,
  },
  marblePreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  marbleShine: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.65)',
    margin: 6,
  },
  skinName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  equippedBadge: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ownedBadge: {
    color: COLORS.textSecondary,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  lockLabel: {
    color: COLORS.accentAlt,
    fontSize: 11,
    fontWeight: '700',
  },
  costLabel: {
    color: COLORS.accentAlt,
    fontSize: 11,
    fontWeight: '700',
  },
  costLabelDisabled: {
    color: COLORS.textMuted,
  },
});
