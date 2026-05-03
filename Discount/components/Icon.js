import React from 'react';
import { Text } from 'react-native';

// Renders Material Icons via the Google Fonts CDN web font (injected in App.js).
// Icon name is the ligature string — hyphens are converted to underscores.
export default function Icon({ name, size = 24, color = '#000', style }) {
  return (
    <Text
      selectable={false}
      style={[{
        fontFamily: 'Material Icons',
        fontSize: size,
        color,
        lineHeight: size,
        width: size,
        height: size,
        textAlign: 'center',
        userSelect: 'none',
      }, style]}
    >
      {name.replace(/-/g, '_')}
    </Text>
  );
}
