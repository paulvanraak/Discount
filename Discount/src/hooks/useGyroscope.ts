import { useEffect, useRef, useState } from 'react';
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import { useProgressStore } from '../store/useProgressStore';
import { useGameStore } from '../store/useGameStore';

const SENSITIVITY_MAP = {
  low: 0.6,
  medium: 1.0,
  high: 1.5,
};

export interface GyroOutput {
  gravityX: number; // world-space X (right/left tilt)
  gravityZ: number; // world-space Z (forward/back tilt)
  isAvailable: boolean;
}

/**
 * Reads DeviceMotion and returns a gravity vector for the marble.
 * Applies calibration offsets and sensitivity scaling.
 */
export function useGyroscope(): GyroOutput {
  const { settings } = useProgressStore();
  const setGyroAvailable = useGameStore((s) => s.setGyroAvailable);

  const [output, setOutput] = useState<GyroOutput>({
    gravityX: 0,
    gravityZ: 0,
    isAvailable: true,
  });

  const calibRef = useRef({ x: settings.calibrationX, z: settings.calibrationZ });
  const sensitivityRef = useRef(SENSITIVITY_MAP[settings.gyroSensitivity]);

  // Keep refs up-to-date when settings change
  useEffect(() => {
    calibRef.current = {
      x: settings.calibrationX,
      z: settings.calibrationZ,
    };
    sensitivityRef.current = SENSITIVITY_MAP[settings.gyroSensitivity];
  }, [settings]);

  useEffect(() => {
    let sub: ReturnType<typeof DeviceMotion.addListener> | null = null;
    let available = false;

    DeviceMotion.isAvailableAsync().then((avail) => {
      available = avail;
      setGyroAvailable(avail);

      if (!avail) {
        setOutput({ gravityX: 0, gravityZ: 0, isAvailable: false });
        return;
      }

      DeviceMotion.setUpdateInterval(16); // ~60 Hz

      sub = DeviceMotion.addListener((data: DeviceMotionMeasurement) => {
        const acc = data.accelerationIncludingGravity;
        if (!acc) return;

        const scale = sensitivityRef.current;
        // acc.x: positive = tilted right, negative = tilted left
        // acc.y: positive = tilted toward user, negative = away from user
        // (landscape: y maps to Z in world space)
        const gx = (acc.x - calibRef.current.x) * scale;
        const gz = (-acc.y - calibRef.current.z) * scale;

        setOutput({ gravityX: gx, gravityZ: gz, isAvailable: true });
      });
    });

    return () => {
      sub?.remove();
    };
  }, [setGyroAvailable]);

  return output;
}

/**
 * Capture current accelerometer reading as the calibration offset.
 * Returns {x, z} offsets or null if gyro unavailable.
 */
export async function calibrateGyro(): Promise<{ x: number; z: number } | null> {
  const avail = await DeviceMotion.isAvailableAsync();
  if (!avail) return null;

  return new Promise((resolve) => {
    DeviceMotion.setUpdateInterval(16);
    const sub = DeviceMotion.addListener((data: DeviceMotionMeasurement) => {
      sub.remove();
      const acc = data.accelerationIncludingGravity;
      if (!acc) {
        resolve(null);
        return;
      }
      resolve({ x: acc.x, z: -acc.y });
    });

    // Timeout after 2 seconds
    setTimeout(() => {
      sub.remove();
      resolve(null);
    }, 2000);
  });
}
