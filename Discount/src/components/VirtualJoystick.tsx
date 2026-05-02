import React, { useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { useGameStore } from '../store/useGameStore';

const OUTER_RADIUS = 60;
const INNER_RADIUS = 28;
const MAX_DIST = OUTER_RADIUS - INNER_RADIUS;

/**
 * Virtual joystick shown when gyroscope is unavailable.
 * Bottom-left of the screen. Outputs a normalised (x, z) delta to game store.
 */
export function VirtualJoystick() {
  const setJoystick = useGameStore((s) => s.setJoystick);
  const knobPos = useRef({ x: 0, y: 0 });
  const outerRef = useRef<View>(null);
  const knobRef = useRef<View>(null);

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const updateJoystick = useCallback(
    (dx: number, dy: number) => {
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = dist > MAX_DIST ? MAX_DIST / dist : 1;
      const cx = dx * scale;
      const cy = dy * scale;

      knobPos.current = { x: cx, y: cy };

      if (knobRef.current) {
        (knobRef.current as any).setNativeProps({
          style: {
            transform: [{ translateX: cx }, { translateY: cy }],
          },
        });
      }

      // Normalise to -1..1 and map to world gravity axes
      setJoystick(cx / MAX_DIST, cy / MAX_DIST);
    },
    [setJoystick]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_: GestureResponderEvent, gs: PanResponderGestureState) => {
        updateJoystick(gs.dx, gs.dy);
      },
      onPanResponderRelease: () => {
        updateJoystick(0, 0);
        knobPos.current = { x: 0, y: 0 };
      },
      onPanResponderTerminate: () => {
        updateJoystick(0, 0);
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Outer ring */}
      <View style={styles.outer}>
        {/* Inner knob */}
        <View ref={knobRef} style={styles.knob} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    width: OUTER_RADIUS * 2,
    height: OUTER_RADIUS * 2,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outer: {
    width: OUTER_RADIUS * 2,
    height: OUTER_RADIUS * 2,
    borderRadius: OUTER_RADIUS,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  knob: {
    width: INNER_RADIUS * 2,
    height: INNER_RADIUS * 2,
    borderRadius: INNER_RADIUS,
    backgroundColor: 'rgba(108,99,255,0.7)',
    borderWidth: 2,
    borderColor: 'rgba(138,132,255,0.9)',
  },
});
