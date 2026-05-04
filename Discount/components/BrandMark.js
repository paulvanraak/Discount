import React from 'react';
import { Image } from 'react-native';

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 108">
  <path d="M50,3 C76,3 95,16 95,36 L95,79 Q95,105 68,105 L32,105 Q5,105 5,79 L5,36 C5,16 24,3 50,3 Z" fill="#F0674E"/>
  <circle cx="50" cy="20" r="8" fill="white"/>
  <circle cx="34" cy="52" r="7" fill="white"/>
  <circle cx="66" cy="52" r="7" fill="white"/>
  <path d="M28,68 Q50,90 72,68" stroke="white" stroke-width="7.5" fill="none" stroke-linecap="round"/>
</svg>`;

const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SVG)}`;

export default function BrandMark({ size = 34 }) {
  const w = Math.round(size * (100 / 108));
  return <Image source={{ uri }} style={{ width: w, height: size }} resizeMode="contain" />;
}
