import React, { useCallback, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useGameStore } from '../store/useGameStore';
import { useProgressStore } from '../store/useProgressStore';
import { WORLDS } from '../constants/worlds';
import { getLevel } from '../constants/levels';
import { CELL_SIZE, WALL_HEIGHT, FLOOR_THICKNESS, MARBLE_RADIUS } from '../utils/mazeGenerator';
import { SKINS } from '../constants/skins';

import { MazeBoard } from './MazeBoard';
import { MarbleMesh } from './Marble';
import { GameCamera } from './GameCamera';
import { DiamondMesh } from './Diamond';
import { ExitMesh } from './Exit';
import { MovingObstacleMesh } from './MovingObstacle';

// ─── Shared marble position type ──────────────────────────────────────────────
export type MarblePosRef = React.MutableRefObject<THREE.Vector3>;

// ─── Physics constants ────────────────────────────────────────────────────────
const FLOOR_Y = FLOOR_THICKNESS + MARBLE_RADIUS; // marble resting Y ≈ 0.63
const FALL_THRESHOLD = -3;
const MAX_SPEED = 14;

function getCellAt(grid: string[], col: number, row: number): string {
  if (row < 0 || row >= grid.length || col < 0) return '#';
  const rowStr = grid[row];
  if (col >= rowStr.length) return '#';
  return rowStr[col];
}

function resolveWalls(
  pos: THREE.Vector3,
  vel: THREE.Vector3,
  grid: string[],
  restitution: number
) {
  const centerCol = Math.round(pos.x / CELL_SIZE);
  const centerRow = Math.round(pos.z / CELL_SIZE);

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const col = centerCol + dc;
      const row = centerRow + dr;
      if (getCellAt(grid, col, row) !== '#') continue;

      // Wall AABB in XZ plane (walls are centred at col*CELL_SIZE, row*CELL_SIZE)
      const wMinX = col * CELL_SIZE - CELL_SIZE * 0.5;
      const wMaxX = col * CELL_SIZE + CELL_SIZE * 0.5;
      const wMinZ = row * CELL_SIZE - CELL_SIZE * 0.5;
      const wMaxZ = row * CELL_SIZE + CELL_SIZE * 0.5;

      // Closest point on AABB to marble centre
      const cx = Math.max(wMinX, Math.min(pos.x, wMaxX));
      const cz = Math.max(wMinZ, Math.min(pos.z, wMaxZ));

      const dx = pos.x - cx;
      const dz = pos.z - cz;
      const distSq = dx * dx + dz * dz;

      if (distSq > 0.0001 && distSq < MARBLE_RADIUS * MARBLE_RADIUS) {
        const dist = Math.sqrt(distSq);
        const nx = dx / dist;
        const nz = dz / dist;
        const pen = MARBLE_RADIUS - dist;

        // Separate marble from wall
        pos.x += nx * pen * 1.02;
        pos.z += nz * pen * 1.02;

        // Reflect velocity along collision normal
        const dot = vel.x * nx + vel.z * nz;
        if (dot < 0) {
          vel.x -= (1 + restitution) * dot * nx;
          vel.z -= (1 + restitution) * dot * nz;
        }
      }
    }
  }
}

// ─── Marble physics component ─────────────────────────────────────────────────
interface MarbleControllerProps {
  marblePosRef: MarblePosRef;
  marbleVelRef: React.MutableRefObject<THREE.Vector3>;
  marbleMeshRef: React.MutableRefObject<THREE.Mesh | null>;
  grid: string[];
  gravityX: number;
  gravityZ: number;
  startX: number;
  startZ: number;
  restitution: number;
  friction: number;
  gravityScale: number;
  onFall: () => void;
}

function MarbleController({
  marblePosRef,
  marbleVelRef,
  marbleMeshRef,
  grid,
  gravityX,
  gravityZ,
  startX,
  startZ,
  restitution,
  friction,
  gravityScale,
  onFall,
}: MarbleControllerProps) {
  const phase = useGameStore((s) => s.phase);
  const tick = useGameStore((s) => s.tick);
  const isGyroAvailable = useGameStore((s) => s.isGyroAvailable);
  const joystick = useGameStore((s) => s.joystickDelta);

  const didFall = useRef(false);

  // Reset marble when phase changes to calibrating
  useEffect(() => {
    if (phase === 'calibrating') {
      marblePosRef.current.set(startX, FLOOR_Y + 0.5, startZ);
      marbleVelRef.current.set(0, 0, 0);
      didFall.current = false;
    }
  }, [phase, startX, startZ]);

  useFrame((_, dt) => {
    const clampedDt = Math.min(dt, 0.05); // cap at 50 ms to avoid tunnelling

    // Update timer
    if (phase === 'playing') tick(clampedDt);

    if (phase !== 'playing' || didFall.current) return;

    const pos = marblePosRef.current;
    const vel = marbleVelRef.current;

    // Effective gravity from tilt
    let gx = gravityX;
    let gz = gravityZ;
    if (!isGyroAvailable) {
      gx = joystick.x * 9.81;
      gz = joystick.z * 9.81;
    }
    gx *= gravityScale;
    gz *= gravityScale;

    // Apply tilt force
    vel.x += gx * clampedDt;
    vel.z += gz * clampedDt;

    // Apply downward gravity
    vel.y -= 15 * clampedDt;

    // Move marble
    pos.x += vel.x * clampedDt;
    pos.y += vel.y * clampedDt;
    pos.z += vel.z * clampedDt;

    // Determine which cell the marble is over
    const col = Math.round(pos.x / CELL_SIZE);
    const row = Math.round(pos.z / CELL_SIZE);
    const cell = getCellAt(grid, col, row);
    const overHole = cell === 'H';

    // Floor collision (not over a hole)
    if (!overHole && pos.y < FLOOR_Y) {
      pos.y = FLOOR_Y;
      if (vel.y < 0) {
        vel.y = -vel.y * restitution;
        if (Math.abs(vel.y) < 0.25) vel.y = 0;
      }
    }

    // Wall collision
    resolveWalls(pos, vel, grid, restitution);

    // Rolling friction / damping
    const damp = Math.pow(1 - friction * 0.35, clampedDt * 60);
    vel.x *= damp;
    vel.z *= damp;

    // Speed cap (prevent tunnelling at high frame times)
    const speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
    if (speed > MAX_SPEED) {
      vel.x = (vel.x / speed) * MAX_SPEED;
      vel.z = (vel.z / speed) * MAX_SPEED;
    }

    // Fall detection
    if (pos.y < FALL_THRESHOLD) {
      didFall.current = true;
      onFall();
    }

    // Sync mesh
    if (marbleMeshRef.current) {
      marbleMeshRef.current.position.copy(pos);
      // Rotate marble to simulate rolling
      marbleMeshRef.current.rotation.x += vel.z * clampedDt * 0.5;
      marbleMeshRef.current.rotation.z -= vel.x * clampedDt * 0.5;
    }
  });

  return null; // mesh rendered by parent
}

// ─── Blob Shadow ──────────────────────────────────────────────────────────────
function BlobShadow({ marblePosRef }: { marblePosRef: MarblePosRef }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const pos = marblePosRef.current;
    meshRef.current.position.set(pos.x, 0.05, pos.z);
    const h = Math.max(0, pos.y - FLOOR_Y);
    const s = Math.max(0.2, 1 - h * 0.06);
    meshRef.current.scale.set(s, 1, s);
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.max(0.05, 0.38 - h * 0.04);
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.5, 16]} />
      <meshBasicMaterial
        color="#000000"
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Game Timer ───────────────────────────────────────────────────────────────
// Timer is handled inside MarbleController via tick(). No separate component needed.

// ─── Main Scene ───────────────────────────────────────────────────────────────
interface GameSceneProps {
  gravityX: number;
  gravityZ: number;
  onFall: () => void;
  onDiamond: (index: number) => void;
  onExit: () => void;
}

export function GameScene({ gravityX, gravityZ, onFall, onDiamond, onExit }: GameSceneProps) {
  const worldId = useGameStore((s) => s.worldId);
  const levelId = useGameStore((s) => s.levelId);
  const diamondsCollected = useGameStore((s) => s.diamondsCollected);

  const equippedSkin = useProgressStore((s) => s.equippedSkin);
  const skin = SKINS.find((s) => s.id === equippedSkin) ?? SKINS[0];

  const worldConfig = WORLDS.find((w) => w.id === worldId)!;
  const level = getLevel(worldId, levelId);
  const { theme } = worldConfig;

  // Centre maze around world origin
  const offsetX = -(level.width * CELL_SIZE) / 2;
  const offsetZ = -(level.height * CELL_SIZE) / 2;

  // Marble start (group-local coords)
  const startX = level.startCol * CELL_SIZE;
  const startZ = level.startRow * CELL_SIZE;

  // Shared marble state refs (group-local coordinates)
  const marblePosRef = useRef<THREE.Vector3>(
    new THREE.Vector3(startX, FLOOR_Y + 0.5, startZ)
  );
  const marbleVelRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const marbleMeshRef = useRef<THREE.Mesh>(null);

  const handleFall = useCallback(() => onFall(), [onFall]);
  const handleExit = useCallback(() => onExit(), [onExit]);

  return (
    <>
      {/* Lighting */}
      <ambientLight color={theme.ambientColor} intensity={theme.ambientIntensity} />
      <directionalLight
        color={theme.dirLightColor}
        intensity={theme.dirLightIntensity}
        position={[10, 20, 10]}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
      />
      <pointLight position={[0, 8, 0]} intensity={0.4} color={theme.accentColor} />

      {/* Fog */}
      <fog attach="fog" color={theme.fogColor} near={35} far={90} />

      {/* ── Maze group (centred at world origin) ────────────────────────── */}
      <group position={[offsetX, 0, offsetZ]}>
        {/* Static maze geometry */}
        <MazeBoard grid={level.grid} width={level.width} height={level.height} theme={theme} />

        {/* Diamonds */}
        {level.diamondCells.map(([dc, dr], i) =>
          !diamondsCollected[i] ? (
            <DiamondMesh
              key={`d-${i}`}
              position={[dc * CELL_SIZE, 1.0, dr * CELL_SIZE]}
              index={i}
              onCollect={onDiamond}
              marblePosRef={marblePosRef}
            />
          ) : null
        )}

        {/* Exit */}
        <ExitMesh
          position={[level.exitCol * CELL_SIZE, 0.4, level.exitRow * CELL_SIZE]}
          marblePosRef={marblePosRef}
          onExit={handleExit}
          theme={theme}
        />

        {/* Moving obstacles (visual only — push marble on proximity) */}
        {level.obstacles.map((obs, i) => (
          <MovingObstacleMesh
            key={`obs-${i}`}
            obstacle={obs}
            theme={theme}
            marblePosRef={marblePosRef}
            marbleVelRef={marbleVelRef}
          />
        ))}

        {/* Marble mesh */}
        <mesh ref={marbleMeshRef} position={[startX, FLOOR_Y + 0.5, startZ]} castShadow>
          <sphereGeometry args={[MARBLE_RADIUS, 28, 28]} />
          <meshStandardMaterial
            color={skin.color}
            metalness={skin.metalness}
            roughness={skin.roughness}
            emissive={skin.emissive}
            emissiveIntensity={skin.emissiveIntensity}
            envMapIntensity={1.0}
          />
        </mesh>

        {/* Physics controller (invisible, updates marbleMeshRef each frame) */}
        <MarbleController
          marblePosRef={marblePosRef}
          marbleVelRef={marbleVelRef}
          marbleMeshRef={marbleMeshRef}
          grid={level.grid}
          gravityX={gravityX}
          gravityZ={gravityZ}
          startX={startX}
          startZ={startZ}
          restitution={theme.marbleRestitution}
          friction={theme.marbleFriction}
          gravityScale={theme.gravityScale}
          onFall={handleFall}
        />

        {/* Blob shadow */}
        <BlobShadow marblePosRef={marblePosRef} />
      </group>

      {/* Camera follows marble (uses world-space = group + offset) */}
      <GameCamera
        marblePosRef={marblePosRef}
        offsetX={offsetX}
        offsetZ={offsetZ}
      />
    </>
  );
}
