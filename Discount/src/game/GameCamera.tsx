import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MarblePosRef } from './GameScene';

interface Props {
  marblePosRef: MarblePosRef;
  offsetX: number;
  offsetZ: number;
}

const CAMERA_HEIGHT = 18;
const TILT_OFFSET = CAMERA_HEIGHT * Math.tan(35 * (Math.PI / 180)); // 35° tilt
const DEAD_ZONE = 0.8;
const LERP_SPEED = 4.5;

export function GameCamera({ marblePosRef, offsetX, offsetZ }: Props) {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3());
  const currentRef = useRef(new THREE.Vector3());

  useEffect(() => {
    (camera as THREE.PerspectiveCamera).fov = 45;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix?.();
  }, [camera]);

  useFrame((_, delta) => {
    // Marble is in group-local space; convert to world space
    const mp = marblePosRef.current;
    const wx = mp.x + offsetX;
    const wz = mp.z + offsetZ;

    // Dead zone
    const dx = wx - currentRef.current.x;
    const dz = wz - currentRef.current.z;

    targetRef.current.x =
      Math.abs(dx) > DEAD_ZONE
        ? wx - Math.sign(dx) * DEAD_ZONE
        : currentRef.current.x;

    targetRef.current.z =
      Math.abs(dz) > DEAD_ZONE
        ? wz - Math.sign(dz) * DEAD_ZONE
        : currentRef.current.z;

    currentRef.current.lerp(targetRef.current, Math.min(1, LERP_SPEED * delta));

    camera.position.set(
      currentRef.current.x,
      CAMERA_HEIGHT,
      currentRef.current.z + TILT_OFFSET
    );
    camera.lookAt(currentRef.current.x, 0, currentRef.current.z);
  });

  return null;
}
