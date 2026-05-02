import { create } from 'zustand';
import { GamePhase, GameState, Coupon } from '../types';

interface GameStore extends GameState {
  setPhase: (phase: GamePhase) => void;
  setLevel: (worldId: number, levelId: number) => void;
  setLevelCoupons: (coupons: Coupon[]) => void;
  collectDiamond: (index: number) => void;
  tick: (dt: number) => void;
  resetLevel: () => void;
  setJoystick: (x: number, z: number) => void;
  setGyroAvailable: (available: boolean) => void;
  getDiamondCount: () => number;
  getCollectedCoupons: () => Coupon[];
}

const DEFAULT_STATE: GameState = {
  phase: 'calibrating',
  worldId: 1,
  levelId: 1,
  elapsedTime: 0,
  diamondsCollected: [false, false, false],
  isGyroAvailable: true,
  joystickDelta: { x: 0, z: 0 },
  levelCoupons: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...DEFAULT_STATE,

  setPhase: (phase) => set({ phase }),

  setLevel: (worldId, levelId) =>
    set({
      worldId,
      levelId,
      phase: 'calibrating',
      elapsedTime: 0,
      diamondsCollected: [false, false, false],
      levelCoupons: [],
    }),

  setLevelCoupons: (coupons) => set({ levelCoupons: coupons }),

  collectDiamond: (index) => {
    const d = [...get().diamondsCollected];
    d[index] = true;
    set({ diamondsCollected: d });
  },

  tick: (dt) => {
    if (get().phase === 'playing') {
      set((s) => ({ elapsedTime: s.elapsedTime + dt }));
    }
  },

  resetLevel: () =>
    set({
      phase: 'calibrating',
      elapsedTime: 0,
      diamondsCollected: [false, false, false],
    }),

  setJoystick: (x, z) => set({ joystickDelta: { x, z } }),

  setGyroAvailable: (available) => set({ isGyroAvailable: available }),

  getDiamondCount: () => get().diamondsCollected.filter(Boolean).length,

  getCollectedCoupons: () => {
    const { diamondsCollected, levelCoupons } = get();
    return levelCoupons.filter((_, i) => diamondsCollected[i] ?? false);
  },
}));
