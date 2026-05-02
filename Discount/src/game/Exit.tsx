import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';
import { WorldTheme } from '../types';
import { MARBLE_RADIUS, CELL_SIZE } from '../utils/mazeGenerator';
import { MarblePosRef } from './GameScene';

interface Props {
  position: [number, number, number];
  marblePosRef: MarblePosRef;
  onExit: () => void;
  theme: WorldTheme;
}

const EXIT_DIST = MARBLE_RADIUS + 0.6;

export function ExitMesh({ position, marblePosRef, onExit, theme }: Props) {
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const triggered = useRef(false);
  const phase = useGameStore((s) => s.phase);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.8;
      const s = 1 + Math.sin(t * 3) * 0.05;
      ringRef.current.scale.set(s, s, s);
    }

    if (glowRef.current) {
      glowRef.current.intensity = 0.8 + Math.sin(t * 2) * 0.3;
    }

    if (triggered.current || phase !== 'playing') return;

    const mp = marblePosRef.current;
    const dx = mp.x - position[0];
    const dz = mp.z - position[2];

    if (dx * dx + dz * dz < EXIT_DIST * EXIT_DIST) {
      triggered.current = true;
      onExit();
    }
  });

  useEffect(() => {
    triggered.current = false;
  }, [position]);

  return (
    <group position={position}>
      {/* Floor pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[CELL_SIZE / 2.2, 32]} />
        <meshStandardMaterial
          color={theme.accentColor}
          emissive={theme.accentColor}
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* Spinning ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[0.5, 0.65, 32]} />
        <meshBasicMaterial
          color={theme.accentColor}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner counter-ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
        <ringGeometry args={[0.3, 0.42, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      <pointLight ref={glowRef} color={theme.accentColor} intensity={1.0} distance={4} />
    </group>
  );
}
