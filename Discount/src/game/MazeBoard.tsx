import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { WorldTheme } from '../types';
import { CELL_SIZE, WALL_HEIGHT, FLOOR_THICKNESS } from '../utils/mazeGenerator';

interface Props {
  grid: string[];
  width: number;
  height: number;
  theme: WorldTheme;
}

export function MazeBoard({ grid, theme }: Props) {
  const { wallPos, floorPos } = useMemo(() => {
    const wallPos: THREE.Vector3[] = [];
    const floorPos: THREE.Vector3[] = [];

    for (let row = 0; row < grid.length; row++) {
      const rowStr = grid[row];
      for (let col = 0; col < rowStr.length; col++) {
        const ch = rowStr[col];
        const x = col * CELL_SIZE;
        const z = row * CELL_SIZE;

        if (ch === '#') {
          wallPos.push(new THREE.Vector3(x, WALL_HEIGHT / 2, z));
        } else if (ch !== 'H') {
          // All non-hole, non-wall cells get a floor tile
          floorPos.push(new THREE.Vector3(x, -FLOOR_THICKNESS / 2, z));
        }
        // Holes ('H') have no floor mesh — marble falls through
      }
    }
    return { wallPos, floorPos };
  }, [grid]);

  return (
    <>
      {/* Walls */}
      <InstancedBoxes
        positions={wallPos}
        sizeArgs={[CELL_SIZE, WALL_HEIGHT, CELL_SIZE]}
        color={theme.wallColor}
        metalness={0.25}
        roughness={0.65}
        castShadow
      />

      {/* Floors */}
      <InstancedBoxes
        positions={floorPos}
        sizeArgs={[CELL_SIZE, FLOOR_THICKNESS, CELL_SIZE]}
        color={theme.floorColor}
        metalness={0.05}
        roughness={0.85}
        receiveShadow
      />

      {/* Accent lines on top of each wall */}
      {wallPos.map((pos, i) => (
        <mesh key={`wa-${i}`} position={[pos.x, WALL_HEIGHT + 0.02, pos.z]}>
          <boxGeometry args={[CELL_SIZE, 0.04, CELL_SIZE]} />
          <meshBasicMaterial color={theme.accentColor} />
        </mesh>
      ))}
    </>
  );
}

// ─── Instanced Box Mesh ────────────────────────────────────────────────────────
interface InstancedBoxesProps {
  positions: THREE.Vector3[];
  sizeArgs: [number, number, number];
  color: string;
  metalness?: number;
  roughness?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

function InstancedBoxes({
  positions,
  sizeArgs,
  color,
  metalness = 0,
  roughness = 1,
  castShadow = false,
  receiveShadow = false,
}: InstancedBoxesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = positions.length;

  useEffect(() => {
    if (!meshRef.current || count === 0) return;
    const matrix = new THREE.Matrix4();
    positions.forEach((pos, i) => {
      matrix.setPosition(pos.x, pos.y, pos.z);
      meshRef.current!.setMatrixAt(i, matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, count]);

  if (count === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      <boxGeometry args={sizeArgs} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </instancedMesh>
  );
}
