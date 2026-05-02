import React from 'react';
import { MarbleSkin } from '../types';

interface Props {
  skin: MarbleSkin;
}

export function MarbleMesh({ skin }: Props) {
  return (
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[0.38, 32, 32]} />
      <meshStandardMaterial
        color={skin.color}
        metalness={skin.metalness}
        roughness={skin.roughness}
        emissive={skin.emissive}
        emissiveIntensity={skin.emissiveIntensity}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}
