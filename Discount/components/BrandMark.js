import React from 'react';
import { Image } from 'react-native';

// Standalone mark — 820×855 px → ratio ≈ 0.96
const markImage = require('../assets/logo-mark.png');

export default function BrandMark({ size = 34 }) {
  return (
    <Image
      source={markImage}
      style={{ width: Math.round(size * 0.96), height: size }}
      resizeMode="contain"
    />
  );
}
