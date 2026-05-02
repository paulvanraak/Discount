import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playSfx } from '../services/audio';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../store/useGameStore';
import { MARBLE_RADIUS } from '../utils/mazeGenerator';
import { MarblePosRef } from './GameScene';

interface Props {
  position: [number, number, number];
  index: number;
  onCollect: (index: number) => void;
  marblePosRef: MarblePosRef;
}

const COLLECT_DIST = MARBLE_RADIUS + 0.65;
const DIAMOND_COLORS = ['#00ffff', '#ff44ff', '#ffff00'];
const SPIN_SPEED = 1.5;

export function DiamondMesh({ position, index, onCollect, marblePosRef }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const phase = useGameStore((s) => s.phase);
  const collected = useRef(false);

  useFrame(({ clock }) => {
    if (collected.current || !meshRef.current) return;

    // Float and spin
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * SPIN_SPEED;
    meshRef.current.position.y = position[1] + Math.sin(t * 2) * 0.1;

    // Proximity check against marble
    if (phase !== 'playing') return;
    const mp = marblePosRef.current;
    const dx = mp.x - position[0];
    const dy = mp.y - position[1];
    const dz = mp.z - position[2];

    if (dx * dx + dy * dy + dz * dz < COLLECT_DIST * COLLECT_DIST) {
      collected.current = true;
      meshRef.current.visible = false;
      playSfx('diamond');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onCollect(index);
    }
  });

  // Reset on level restart
  useEffect(() => {
    collected.current = false;
    if (meshRef.current) meshRef.current.visible = true;
  }, [position]);

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial
        color={DIAMOND_COLORS[index % DIAMOND_COLORS.length]}
        metalness={0.8}
        roughness={0.1}
        emissive={DIAMOND_COLORS[index % DIAMOND_COLORS.length]}
        emissiveIntensity={0.4}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}
