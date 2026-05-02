import { create } from 'zustand';
import {
  PlayerProgress,
  GameSettings,
  LevelResult,
  Coupon,
} from '../types';
import {
  loadProgress,
  saveProgress,
  resetProgress,
  DEFAULT_PROGRESS,
} from '../services/storage';
import { WORLDS } from '../constants/worlds';
import { calcStars, levelKey } from '../constants/levels';

interface ProgressStore extends PlayerProgress {
  isLoaded: boolean;

  // Lifecycle
  load: () => Promise<void>;

  // Level progression
  recordLevelResult: (
    worldId: number,
    levelId: number,
    time: number,
    diamonds: number,
    total: number
  ) => { stars: number; isNewBest: boolean; coinsEarned: number };

  isLevelUnlocked: (worldId: number, levelId: number) => boolean;
  isWorldUnlocked: (worldId: number) => boolean;
  getLevelResult: (worldId: number, levelId: number) => LevelResult | null;
  getWorldStars: (worldId: number) => number;

  // Skins
  purchaseSkin: (skinId: string, cost: number) => boolean;
  equipSkin: (skinId: string) => void;

  // Settings
  updateSettings: (partial: Partial<GameSettings>) => void;

  // Coupon wallet
  addToWallet: (coupons: Coupon[]) => void;

  // Admin
  reset: () => Promise<void>;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  ...DEFAULT_PROGRESS,
  isLoaded: false,

  // ── Load from AsyncStorage ────────────────────────────────────────────────
  load: async () => {
    const data = await loadProgress();
    set({ ...data, isLoaded: true });
  },

  // ── Record a completed level ──────────────────────────────────────────────
  recordLevelResult: (worldId, levelId, time, diamonds, total) => {
    const store = get();
    const key = levelKey(worldId, levelId);
    const existing = store.completedLevels[key];
    const stars = calcStars(time, worldId, levelId);
    const diamondBonus = Math.floor((diamonds / Math.max(total, 1)) * 50);
    const coinsEarned = stars * 20 + diamondBonus;

    const isNewBest =
      !existing ||
      !existing.completed ||
      stars > existing.stars ||
      (stars === existing.stars && time < existing.bestTime);

    const updatedResult: LevelResult = {
      completed: true,
      stars: Math.max(stars, existing?.stars ?? 0),
      bestTime: existing?.bestTime ? Math.min(time, existing.bestTime) : time,
      diamonds: Math.max(diamonds, existing?.diamonds ?? 0),
    };

    // Recalculate total stars from scratch to avoid double-counting
    const updatedLevels = {
      ...store.completedLevels,
      [key]: updatedResult,
    };
    const totalStars = Object.values(updatedLevels).reduce(
      (sum, r) => sum + (r.stars ?? 0),
      0
    );

    const updatedProgress: Partial<PlayerProgress> = {
      completedLevels: updatedLevels,
      totalStars,
      coins: store.coins + (isNewBest ? coinsEarned : 0),
    };

    set(updatedProgress);
    saveProgress({ ...store, ...updatedProgress } as PlayerProgress);

    return { stars, isNewBest, coinsEarned: isNewBest ? coinsEarned : 0 };
  },

  // ── Unlock checks ─────────────────────────────────────────────────────────
  isLevelUnlocked: (worldId, levelId) => {
    if (!get().isWorldUnlocked(worldId)) return false;
    if (levelId === 1) return true;
    const prevKey = levelKey(worldId, levelId - 1);
    return !!get().completedLevels[prevKey]?.completed;
  },

  isWorldUnlocked: (worldId) => {
    if (worldId === 1) return true;
    const world = WORLDS.find((w) => w.id === worldId);
    if (!world) return false;
    return get().totalStars >= world.starsToUnlock;
  },

  getLevelResult: (worldId, levelId) => {
    return get().completedLevels[levelKey(worldId, levelId)] ?? null;
  },

  getWorldStars: (worldId) => {
    const store = get();
    let total = 0;
    for (let lid = 1; lid <= 8; lid++) {
      total += store.completedLevels[levelKey(worldId, lid)]?.stars ?? 0;
    }
    return total;
  },

  // ── Skins ─────────────────────────────────────────────────────────────────
  purchaseSkin: (skinId, cost) => {
    const store = get();
    if (store.purchasedSkins.includes(skinId)) return false;
    if (store.coins < cost) return false;
    const updated = {
      purchasedSkins: [...store.purchasedSkins, skinId],
      coins: store.coins - cost,
    };
    set(updated);
    saveProgress({ ...store, ...updated } as PlayerProgress);
    return true;
  },

  equipSkin: (skinId) => {
    const store = get();
    if (!store.purchasedSkins.includes(skinId)) return;
    set({ equippedSkin: skinId });
    saveProgress({ ...store, equippedSkin: skinId } as PlayerProgress);
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  updateSettings: (partial) => {
    const store = get();
    const settings: GameSettings = { ...store.settings, ...partial };
    set({ settings });
    saveProgress({ ...store, settings } as PlayerProgress);
  },

  // ── Coupon wallet ─────────────────────────────────────────────────────────
  addToWallet: (coupons) => {
    if (coupons.length === 0) return;
    const store = get();
    const existingIds = new Set(store.couponWallet.map((c) => c.id));
    const newOnes = coupons.filter((c) => !existingIds.has(c.id));
    if (newOnes.length === 0) return;
    const couponWallet = [...store.couponWallet, ...newOnes];
    set({ couponWallet });
    saveProgress({ ...store, couponWallet } as PlayerProgress);
  },

  // ── Reset ─────────────────────────────────────────────────────────────────
  reset: async () => {
    await resetProgress();
    set({ ...DEFAULT_PROGRESS, isLoaded: true });
  },
}));
