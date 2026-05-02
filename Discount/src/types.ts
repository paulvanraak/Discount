// ─── Navigation ──────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Splash: undefined;
  MainMenu: undefined;
  WorldSelect: undefined;
  LevelSelect: { worldId: number };
  Gameplay: { worldId: number; levelId: number };
  Skins: undefined;
  Settings: undefined;
  Wallet: undefined;
};

// ─── World / Level ────────────────────────────────────────────────────────────
export interface WorldTheme {
  wallColor: string;
  floorColor: string;
  accentColor: string;
  ambientColor: string;
  fogColor: string;
  skyColor: string;
  dirLightColor: string;
  dirLightIntensity: number;
  ambientIntensity: number;
  marbleRestitution: number;
  marbleFriction: number;
  gravityScale: number;
  surfaceColor?: string;
}

export type WorldCouponCategory =
  | 'fashion'
  | 'sports'
  | 'electronics'
  | 'travel'
  | 'food_drink'
  | 'home_garden';

export interface World {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  theme: WorldTheme;
  starsToUnlock: number;
  musicTrack: string;
  mazeWidth: number;
  mazeHeight: number;
  holeChance: number;
  obstacleCount: number;
  couponCategory: WorldCouponCategory;
}

export interface ObstacleDefinition {
  type: 'horizontal' | 'vertical';
  cellCol: number;
  cellRow: number;
  range: number;
  speed: number;
}

export interface LevelDefinition {
  worldId: number;
  levelId: number;
  seed: number;
  obstacles: ObstacleDefinition[];
  timeStar: [number, number, number];
  totalDiamonds: number;
}

// ─── Progress ─────────────────────────────────────────────────────────────────
export interface LevelResult {
  completed: boolean;
  stars: number;
  bestTime: number;
  diamonds: number;
}

export interface PlayerProgress {
  completedLevels: Record<string, LevelResult>;
  totalStars: number;
  coins: number;
  equippedSkin: string;
  purchasedSkins: string[];
  settings: GameSettings;
  couponWallet: Coupon[];
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  gyroSensitivity: 'low' | 'medium' | 'high';
  calibrationX: number;
  calibrationZ: number;
}

// ─── Game State ───────────────────────────────────────────────────────────────
export type GamePhase =
  | 'calibrating'
  | 'playing'
  | 'paused'
  | 'falling'
  | 'completed';

export interface GameState {
  phase: GamePhase;
  worldId: number;
  levelId: number;
  elapsedTime: number;
  diamondsCollected: boolean[];
  isGyroAvailable: boolean;
  joystickDelta: { x: number; z: number };
  levelCoupons: Coupon[]; // 3 coupons assigned to this level
}

// ─── Coupons ─────────────────────────────────────────────────────────────────
export interface Coupon {
  id: string;
  advertiserName: string;
  advertiserId?: string;
  logoUrl?: string;
  code?: string;
  description: string;
  discountText: string;   // e.g. "20% KORTING"
  affiliateUrl: string;
  expiresAt?: string;
  category: WorldCouponCategory;
  source: 'awin' | 'tradetracker' | 'demo';
  collectedAt?: string;   // ISO date — set when player picks it up
  worldId?: number;
  levelId?: number;
}

// ─── Skins ───────────────────────────────────────────────────────────────────
export interface MarbleSkin {
  id: string;
  name: string;
  color: string;
  metalness: number;
  roughness: number;
  emissive: string;
  emissiveIntensity: number;
  cost: number;
  unlockStars?: number;
}

// ─── Maze Grid ────────────────────────────────────────────────────────────────
export type CellChar = '#' | '.' | 'H' | 'S' | 'E' | '1' | '2' | '3';

export interface GeneratedLevel {
  grid: string[];
  startCol: number;
  startRow: number;
  exitCol: number;
  exitRow: number;
  diamondCells: [number, number][];
  holeCells: [number, number][];
  width: number;
  height: number;
}
