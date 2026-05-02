import { GeneratedLevel, ObstacleDefinition } from '../types';

// ─── Seeded PRNG (Mulberry32) ─────────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Maze Generation (Recursive Backtracking) ─────────────────────────────────
//
// mazeW / mazeH = number of cells (passages) in each dimension
// Grid size = (2*mazeW + 1) cols × (2*mazeH + 1) rows
// Cell (cx, cy) occupies grid position (2cx+1, 2cy+1)
// Wall between adjacent cells is at their midpoint
//
export function generateLevel(
  mazeW: number,
  mazeH: number,
  seed: number,
  holeChance: number,
  obstacleCount: number,
  timeStar: [number, number, number]
): GeneratedLevel & { obstacles: ObstacleDefinition[] } {
  const rng = mulberry32(seed);

  const gW = 2 * mazeW + 1;
  const gH = 2 * mazeH + 1;

  // Fill grid with walls
  const grid: string[][] = Array.from({ length: gH }, () =>
    Array(gW).fill('#')
  );

  // Carve passages from cell (cx, cy)
  function carve(cx: number, cy: number) {
    const dirs = shuffle(
      [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ],
      rng
    ) as [number, number][];

    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;
      const gx = 2 * nx + 1;
      const gy = 2 * ny + 1;
      if (gx > 0 && gx < gW && gy > 0 && gy < gH && grid[gy][gx] === '#') {
        // Remove wall between (cx,cy) and (nx,ny)
        grid[2 * cy + 1 + dy][2 * cx + 1 + dx] = '.';
        grid[gy][gx] = '.';
        carve(nx, ny);
      }
    }
  }

  // Start from top-left cell (0,0)
  grid[1][1] = '.';
  carve(0, 0);

  // ── Place Start & Exit ────────────────────────────────────────────────────
  const startCol = 1;
  const startRow = 1;
  const exitCol = gW - 2; // bottom-right cell
  const exitRow = gH - 2;

  grid[startRow][startCol] = 'S';
  grid[exitRow][exitCol] = 'E';

  // ── Find Dead Ends ────────────────────────────────────────────────────────
  const deadEnds: [number, number][] = [];
  for (let gy = 1; gy < gH - 1; gy += 2) {
    for (let gx = 1; gx < gW - 1; gx += 2) {
      const cell = grid[gy][gx];
      if (cell !== '.' && cell !== 'S' && cell !== 'E') continue;
      if (cell === 'S' || cell === 'E') continue;

      let openCount = 0;
      if (grid[gy - 1][gx] !== '#') openCount++;
      if (grid[gy + 1][gx] !== '#') openCount++;
      if (grid[gy][gx - 1] !== '#') openCount++;
      if (grid[gy][gx + 1] !== '#') openCount++;
      if (openCount === 1) deadEnds.push([gx, gy]);
    }
  }

  // ── Place 3 Diamonds at Dead Ends ─────────────────────────────────────────
  const shuffledDeadEnds = shuffle(deadEnds, rng);
  const diamondCells: [number, number][] = [];
  const diamondCount = Math.min(3, shuffledDeadEnds.length);
  for (let i = 0; i < diamondCount; i++) {
    const [dc, dr] = shuffledDeadEnds[i];
    grid[dr][dc] = String(i + 1) as '1' | '2' | '3';
    diamondCells.push([dc, dr]);
  }

  // ── Place Holes ───────────────────────────────────────────────────────────
  const holeCells: [number, number][] = [];
  if (holeChance > 0) {
    for (let gy = 1; gy < gH - 1; gy++) {
      for (let gx = 1; gx < gW - 1; gx++) {
        if (grid[gy][gx] !== '.') continue;
        if (rng() < holeChance) {
          grid[gy][gx] = 'H';
          holeCells.push([gx, gy]);
        }
      }
    }
  }

  // ── Build Row Strings ─────────────────────────────────────────────────────
  const gridStrings = grid.map((row) => row.join(''));

  // ── Generate Moving Obstacles ─────────────────────────────────────────────
  // Find long corridors (passage cells in a straight line of length ≥ 3)
  const obstacles: ObstacleDefinition[] = [];
  const usedCells = new Set<string>();

  function key(c: number, r: number) {
    return `${c},${r}`;
  }

  // Scan for horizontal corridors
  for (let gy = 1; gy < gH - 1; gy += 2) {
    for (let gx = 1; gx < gW - 3; gx += 2) {
      if (obstacles.length >= obstacleCount) break;
      if (grid[gy][gx] === '#') continue;
      const cellKey = key(gx, gy);
      if (usedCells.has(cellKey)) continue;

      // Check how far a horizontal passage runs
      let length = 1;
      let nx = gx + 2;
      while (nx < gW - 1 && grid[gy][nx] !== '#' && grid[gy][nx - 1] !== '#') {
        length++;
        nx += 2;
      }

      if (length >= 3) {
        const range = Math.floor(length / 2) * 2 - 2;
        obstacles.push({
          type: 'horizontal',
          cellCol: gx,
          cellRow: gy,
          range,
          speed: 2 + Math.floor(rng() * 2),
        });
        usedCells.add(cellKey);
      }
    }
  }

  // Scan for vertical corridors
  for (let gx = 1; gx < gW - 1; gx += 2) {
    for (let gy = 1; gy < gH - 3; gy += 2) {
      if (obstacles.length >= obstacleCount) break;
      if (grid[gy][gx] === '#') continue;
      const cellKey = key(gx, gy);
      if (usedCells.has(cellKey)) continue;

      let length = 1;
      let ny = gy + 2;
      while (ny < gH - 1 && grid[ny][gx] !== '#' && grid[ny - 1][gx] !== '#') {
        length++;
        ny += 2;
      }

      if (length >= 3) {
        const range = Math.floor(length / 2) * 2 - 2;
        obstacles.push({
          type: 'vertical',
          cellCol: gx,
          cellRow: gy,
          range,
          speed: 2 + Math.floor(rng() * 2),
        });
        usedCells.add(cellKey);
      }
    }
  }

  return {
    grid: gridStrings,
    startCol,
    startRow,
    exitCol,
    exitRow,
    diamondCells,
    holeCells,
    width: gW,
    height: gH,
    obstacles: obstacles.slice(0, obstacleCount),
  };
}

// ─── Cell Size (world-space units per grid cell) ───────────────────────────────
export const CELL_SIZE = 2.0;
export const WALL_HEIGHT = 1.8;
export const FLOOR_THICKNESS = 0.25;
export const MARBLE_RADIUS = 0.38;

export function cellToWorld(col: number, row: number): [number, number, number] {
  return [col * CELL_SIZE, 0, row * CELL_SIZE];
}

export function worldToCell(x: number, z: number): [number, number] {
  return [Math.round(x / CELL_SIZE), Math.round(z / CELL_SIZE)];
}
