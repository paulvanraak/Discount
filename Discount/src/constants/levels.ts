import { LevelDefinition } from '../types';
import { WORLDS, LEVELS_PER_WORLD } from './worlds';
import { generateLevel } from '../utils/mazeGenerator';

// Level metadata — seed and star times per level
// Seed = worldId * 1000 + levelId * 37 (unique per level)
const LEVEL_CONFIGS: { timeStar: [number, number, number] }[][] = [
  // World 1 (Crystal Caves) — no holes, no obstacles
  [
    { timeStar: [20, 35, 60] },
    { timeStar: [22, 38, 65] },
    { timeStar: [25, 42, 70] },
    { timeStar: [28, 45, 75] },
    { timeStar: [30, 50, 80] },
    { timeStar: [32, 55, 85] },
    { timeStar: [35, 60, 90] },
    { timeStar: [40, 65, 100] },
  ],
  // World 2 (Lava Lands) — holes, 1 obstacle
  [
    { timeStar: [25, 45, 75] },
    { timeStar: [28, 48, 80] },
    { timeStar: [30, 52, 85] },
    { timeStar: [33, 55, 90] },
    { timeStar: [35, 60, 95] },
    { timeStar: [38, 65, 100] },
    { timeStar: [42, 70, 110] },
    { timeStar: [45, 75, 120] },
  ],
  // World 3 (Forest Floor) — holes, 2 obstacles
  [
    { timeStar: [30, 52, 90] },
    { timeStar: [32, 55, 95] },
    { timeStar: [35, 60, 100] },
    { timeStar: [38, 65, 105] },
    { timeStar: [40, 70, 110] },
    { timeStar: [43, 75, 115] },
    { timeStar: [46, 80, 120] },
    { timeStar: [50, 85, 130] },
  ],
  // World 4 (Space Station)
  [
    { timeStar: [35, 60, 100] },
    { timeStar: [38, 65, 108] },
    { timeStar: [40, 70, 115] },
    { timeStar: [43, 75, 120] },
    { timeStar: [46, 80, 128] },
    { timeStar: [50, 85, 135] },
    { timeStar: [54, 90, 142] },
    { timeStar: [58, 95, 150] },
  ],
  // World 5 (Ocean Depths)
  [
    { timeStar: [40, 70, 115] },
    { timeStar: [43, 75, 120] },
    { timeStar: [46, 80, 128] },
    { timeStar: [50, 85, 135] },
    { timeStar: [54, 90, 142] },
    { timeStar: [58, 95, 150] },
    { timeStar: [62, 102, 160] },
    { timeStar: [66, 108, 170] },
  ],
  // World 6 (Sky Kingdom)
  [
    { timeStar: [45, 80, 130] },
    { timeStar: [48, 85, 138] },
    { timeStar: [52, 90, 145] },
    { timeStar: [56, 95, 153] },
    { timeStar: [60, 102, 162] },
    { timeStar: [64, 108, 170] },
    { timeStar: [68, 115, 180] },
    { timeStar: [72, 122, 190] },
  ],
];

// Pre-generate all 48 levels (cached after first call)
let _cachedLevels: ReturnType<typeof generateLevel>[] | null = null;

export function getAllLevels() {
  if (_cachedLevels) return _cachedLevels;

  _cachedLevels = [];
  for (const world of WORLDS) {
    for (let levelId = 1; levelId <= LEVELS_PER_WORLD; levelId++) {
      const wi = world.id - 1;
      const li = levelId - 1;
      const seed = world.id * 1000 + levelId * 37;
      const config = LEVEL_CONFIGS[wi][li];
      const generated = generateLevel(
        world.mazeWidth,
        world.mazeHeight,
        seed,
        world.holeChance,
        world.obstacleCount,
        config.timeStar
      );
      _cachedLevels.push(generated);
    }
  }

  return _cachedLevels;
}

export function getLevel(worldId: number, levelId: number) {
  const levels = getAllLevels();
  const idx = (worldId - 1) * LEVELS_PER_WORLD + (levelId - 1);
  return levels[idx];
}

export function getLevelTimeStar(worldId: number, levelId: number): [number, number, number] {
  return LEVEL_CONFIGS[worldId - 1][levelId - 1].timeStar;
}

export function calcStars(time: number, worldId: number, levelId: number): number {
  const [t3, t2, t1] = getLevelTimeStar(worldId, levelId);
  if (time <= t3) return 3;
  if (time <= t2) return 2;
  if (time <= t1) return 1;
  return 1; // always at least 1 star for completing
}

export function levelKey(worldId: number, levelId: number): string {
  return `${worldId}-${levelId}`;
}

export const DEFINITION: LevelDefinition[] = WORLDS.flatMap((world) =>
  Array.from({ length: LEVELS_PER_WORLD }, (_, i) => ({
    worldId: world.id,
    levelId: i + 1,
    seed: world.id * 1000 + (i + 1) * 37,
    obstacles: [],
    timeStar: LEVEL_CONFIGS[world.id - 1][i].timeStar,
    totalDiamonds: 3,
  }))
);
