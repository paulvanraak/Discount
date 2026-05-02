import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  stars: number; // 0-3
  size?: number;
  animated?: boolean;
}

export function StarRating({ stars, size = 32, animated = false }: Props) {
  const scales = [useRef(new Animated.Value(0)), useRef(new Animated.Value(0)), useRef(new Animated.Value(0))];

  useEffect(() => {
    if (!animated) {
      scales.forEach((s) => s.current.setValue(1));
      return;
    }

    scales.forEach((s) => s.current.setValue(0));

    const anims = scales.map((s, i) =>
      Animated.sequence([
        Animated.delay(i * 350 + 400),
        Animated.spring(s.current, {
          toValue: 1,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel(anims).start();
  }, [stars, animated]);

  return (
    <View style={styles.row}>
      {[0, 1, 2].map((i) => (
        <Animated.Text
          key={i}
          style={[
            styles.star,
            {
              fontSize: size,
              color: i < stars ? COLORS.gold : COLORS.textMuted,
              transform: [{ scale: scales[i].current }],
            },
          ]}
        >
          ★
        </Animated.Text>
      ))}
    </View>
  );
}

interface MiniProps {
  stars: number;
  total?: number;
}

export function MiniStars({ stars, total = 3 }: MiniProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <Text
          key={i}
          style={[
            styles.miniStar,
            { color: i < stars ? COLORS.gold : COLORS.textMuted },
          ]}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 4,
    textShadowColor: COLORS.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  miniStar: {
    fontSize: 12,
    marginHorizontal: 1,
  },
});
