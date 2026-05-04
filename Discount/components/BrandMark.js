import React from 'react';
import { Image } from 'react-native';
import { LOGO_MARK_URI } from './logos';

// Standalone mark — 820×855 px → ratio ≈ 0.96
export default function BrandMark({ size = 34 }) {
  return (
    <Image
      source={{ uri: LOGO_MARK_URI }}
      style={{ width: Math.round(size * 0.96), height: size }}
      resizeMode="contain"
    />
  );
}
