import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ObstacleDefinition, WorldTheme } from '../types';
import { CELL_SIZE, WALL_HEIGHT, MARBLE_RADIUS } from '../utils/mazeGenerator';
import { MarblePosRef } from './GameScene';
import { useGameStore } from '../store/useGameStore';

interface Props {
  obstacle: ObstacleDefinition;
  theme: WorldTheme;
  marblePosRef: MarblePosRef;
  marbleVelRef: React.MutableRefObject<THREE.Vector3>;
}

const OBS_HALF_X = CELL_SIZE * 0.42;
const OBS_HALF_Z = CELL_SIZE * 0.42;
const OBS_HALF_Y = WALL_HEIGHT * 0.3;
const PUSH_STRENGTH = 8;

export function MovingObstacleMesh({
  obstacle,
  theme,
  marblePosRef,
  marbleVelRef,
}: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const phase = useGameStore((s) => s.phase);

  const baseX = obstacle.cellCol * CELL_SIZE;
  const baseZ = obstacle.cellRow * CELL_SIZE;
  const baseY = WALL_HEIGHT * 0.3 + 0.25;
  const rangeWorld = obstacle.range * CELL_SIZE * 0.5;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const t = clock.getElapsedTime();
    const offset = Math.sin(t * obstacle.speed) * rangeWorld;

    let nx = baseX;
    let nz = baseZ;
    if (obstacle.type === 'horizontal') {
      nx = baseX + offset;
    } else {
      nz = baseZ + offset;
    }

    meshRef.current.position.set(nx, baseY, nz);

    // Simple marble push — treat obstacle as a moving box and push marble away
    if (phase !== 'playing') return;
    const mp = marblePosRef.current;
    const mv = marbleVelRef.current;

    // Closest point on obstacle AABB to marble
    const cx = Math.max(nx - OBS_HALF_X, Math.min(mp.x, nx + OBS_HALF_X));
    const cz = Math.max(nz - OBS_HALF_Z, Math.min(mp.z, nz + OBS_HALF_Z));

    const dx = mp.x - cx;
    const dz = mp.z - cz;
    const distSq = dx * dx + dz * dz;
    const pushDist = MARBLE_RADIUS + 0.05;

    if (distSq > 0.0001 && distSq < pushDist * pushDist) {
      const dist = Math.sqrt(distSq);
      const nx2 = dx / dist;
      const nz2 = dz / dist;
      const pen = pushDist - dist;

      // Separate
      mp.x += nx2 * pen;
      mp.z += nz2 * pen;

      // Impulse
      const dot = mv.x * nx2 + mv.z * nz2;
      if (dot < 0) {
        mv.x -= 1.4 * dot * nx2;
        mv.z -= 1.4 * dot * nz2;
      }
      // Add obstacle's own velocity as push
      mv.x += nx2 * PUSH_STRENGTH * 0.3;
      mv.z += nz2 * PUSH_STRENGTH * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <boxGeometry args={[OBS_HALF_X * 2, OBS_HALF_Y * 2, OBS_HALF_Z * 2]} />
      <meshStandardMaterial
        color={theme.accentColor}
        metalness={0.5}
        roughness={0.3}
        emissive={theme.accentColor}
        emissiveIntensity={0.25}
      />
    </mesh>
  );
}
