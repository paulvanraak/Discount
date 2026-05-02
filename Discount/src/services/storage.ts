import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerProgress, GameSettings } from '../types';
import { DEFAULT_SKIN } from '../constants/skins';

const STORAGE_KEY = '@marble_maze_progress';

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  gyroSensitivity: 'medium',
  calibrationX: 0,
  calibrationZ: 0,
};

export const DEFAULT_PROGRESS: PlayerProgress = {
  completedLevels: {},
  totalStars: 0,
  coins: 0,
  equippedSkin: DEFAULT_SKIN,
  purchasedSkins: [DEFAULT_SKIN],
  settings: DEFAULT_SETTINGS,
  couponWallet: [],
};

export async function loadProgress(): Promise<PlayerProgress> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(data) as Partial<PlayerProgress>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export async function saveProgress(progress: PlayerProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Silently fail — non-critical
  }
}

export async function resetProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}
