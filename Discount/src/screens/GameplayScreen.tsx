import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Animated,
  StatusBar,
} from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Haptics from 'expo-haptics';

import { RootStackParamList, Coupon } from '../types';
import { COLORS } from '../constants/theme';
import { WORLDS, LEVELS_PER_WORLD } from '../constants/worlds';
import { getLevel } from '../constants/levels';

import { useGameStore } from '../store/useGameStore';
import { useProgressStore } from '../store/useProgressStore';
import { useGyroscope } from '../hooks/useGyroscope';

import { GameScene } from '../game/GameScene';
import { HUD } from '../components/HUD';
import { PauseMenu } from '../components/PauseMenu';
import { LevelEndModal } from '../components/LevelEndModal';
import { VirtualJoystick } from '../components/VirtualJoystick';
import { CollectToast } from '../components/CollectToast';

import { playSfx } from '../services/audio';
import { showInterstitialIfReady, showRewardedAd, isRewardedAdReady } from '../services/admob';
import { initCoupons, getCouponsForLevel, stampCoupon } from '../services/coupons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Gameplay'>;
  route: RouteProp<RootStackParamList, 'Gameplay'>;
};

export function GameplayScreen({ navigation, route }: Props) {
  const { worldId, levelId } = route.params;

  // Game store
  const setLevel = useGameStore((s) => s.setLevel);
  const resetLevel = useGameStore((s) => s.resetLevel);
  const setPhase = useGameStore((s) => s.setPhase);
  const phase = useGameStore((s) => s.phase);
  const elapsedTime = useGameStore((s) => s.elapsedTime);
  const diamondsCollected = useGameStore((s) => s.diamondsCollected);
  const isGyroAvailable = useGameStore((s) => s.isGyroAvailable);
  const collectDiamond = useGameStore((s) => s.collectDiamond);

  // Progress store
  const recordLevelResult = useProgressStore((s) => s.recordLevelResult);
  const addToWallet = useProgressStore((s) => s.addToWallet);

  // Game store coupon actions
  const setLevelCoupons = useGameStore((s) => s.setLevelCoupons);
  const levelCoupons = useGameStore((s) => s.levelCoupons);
  const getCollectedCoupons = useGameStore((s) => s.getCollectedCoupons);

  // Gyro
  const { gravityX, gravityZ } = useGyroscope();

  // Level data
  const level = getLevel(worldId, levelId);
  const world = WORLDS.find((w) => w.id === worldId)!;

  // Modal state
  const [showLevelEnd, setShowLevelEnd] = useState(false);
  const [levelResult, setLevelResult] = useState({
    stars: 0,
    coinsEarned: 0,
    isNewBest: false,
  });

  // Toast for mid-game diamond collection
  const [toastCoupon, setToastCoupon] = useState<Coupon | null>(null);

  // Calibration countdown
  const [calibCountdown, setCalibCountdown] = useState(1);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fade overlay for death animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Lock landscape on mount
  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    ).catch(() => {});

    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  // Initialise level + coupons
  useEffect(() => {
    setLevel(worldId, levelId);
    initCoupons().then(() => {
      const coupons = getCouponsForLevel(world.couponCategory, worldId, levelId);
      setLevelCoupons(coupons);
    });
  }, [worldId, levelId]);

  // Start calibration countdown
  useEffect(() => {
    if (phase !== 'calibrating') return;

    setCalibCountdown(1);

    countdownRef.current = setInterval(() => {
      setCalibCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setPhase('playing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [phase]);

  // ── Event handlers ──────────────────────────────────────────────────────────
  const handleFall = useCallback(() => {
    if (phase !== 'playing') return;
    setPhase('falling');
    playSfx('holefall');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    // Fade to black
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      // Offer rewarded ad to continue (30% chance if available)
      if (isRewardedAdReady() && Math.random() < 0.3) {
        const claimed = showRewardedAd(
          () => {
            // Rewarded: restart without losing a life
            fadeAnim.setValue(0);
            resetLevel();
          },
          () => {
            // Dismissed: normal restart
            fadeAnim.setValue(0);
            resetLevel();
          }
        );
        if (!claimed) {
          fadeAnim.setValue(0);
          resetLevel();
        }
      } else {
        setTimeout(() => {
          fadeAnim.setValue(0);
          resetLevel();
        }, 400);
      }
    });
  }, [phase, fadeAnim, resetLevel, setPhase]);

  const handleExit = useCallback(() => {
    if (phase !== 'playing') return;
    setPhase('completed');
    playSfx('levelComplete');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const collectedCount = diamondsCollected.filter(Boolean).length;
    const { stars, isNewBest, coinsEarned } = recordLevelResult(
      worldId,
      levelId,
      elapsedTime,
      collectedCount,
      level.diamondCells.length
    );

    // Stamp and save collected coupons to wallet
    const collected = getCollectedCoupons().map((c) =>
      stampCoupon(c, worldId, levelId)
    );
    if (collected.length > 0) addToWallet(collected);

    setLevelResult({ stars, isNewBest, coinsEarned });

    setTimeout(() => {
      setShowLevelEnd(true);
    }, 500);
  }, [
    phase,
    elapsedTime,
    diamondsCollected,
    worldId,
    levelId,
    level,
    recordLevelResult,
  ]);

  const handlePause = useCallback(() => {
    if (phase !== 'playing') return;
    setPhase('paused');
  }, [phase, setPhase]);

  const handleResume = useCallback(() => {
    setPhase('playing');
  }, [setPhase]);

  const handleRestart = useCallback(() => {
    setPhase('calibrating');
    resetLevel();
  }, [setPhase, resetLevel]);

  const handleQuit = useCallback(() => {
    navigation.navigate('LevelSelect', { worldId });
  }, [navigation, worldId]);

  const handleNext = useCallback(() => {
    setShowLevelEnd(false);
    const nextLevel = levelId + 1;
    if (nextLevel <= LEVELS_PER_WORLD) {
      showInterstitialIfReady(() => {
        navigation.replace('Gameplay', { worldId, levelId: nextLevel });
      });
    } else {
      // Last level of world — go to world select
      showInterstitialIfReady(() => {
        navigation.navigate('WorldSelect');
      });
    }
  }, [worldId, levelId, navigation]);

  const handleRetry = useCallback(() => {
    setShowLevelEnd(false);
    resetLevel();
  }, [resetLevel]);

  const handleMenuFromEnd = useCallback(() => {
    setShowLevelEnd(false);
    navigation.navigate('LevelSelect', { worldId });
  }, [navigation, worldId]);

  const handleDiamond = useCallback(
    (index: number) => {
      collectDiamond(index);
      const coupon = levelCoupons[index];
      if (coupon) setToastCoupon(coupon);
    },
    [collectDiamond, levelCoupons]
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* 3D Canvas */}
      <Canvas
        style={styles.canvas}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        shadows
      >
        <color attach="background" args={[world.theme.skyColor]} />
        <GameScene
          gravityX={gravityX}
          gravityZ={gravityZ}
          onFall={handleFall}
          onDiamond={handleDiamond}
          onExit={handleExit}
        />
      </Canvas>

      {/* HUD */}
      {phase === 'playing' && (
        <HUD
          totalDiamonds={level.diamondCells.length}
          onPause={handlePause}
        />
      )}

      {/* Virtual joystick fallback */}
      {!isGyroAvailable && phase === 'playing' && <VirtualJoystick />}

      {/* Calibration overlay */}
      {phase === 'calibrating' && (
        <View style={styles.calibOverlay}>
          <Text style={styles.calibTitle}>Hold Still…</Text>
          <Text style={styles.calibSubtitle}>Calibrating tilt sensor</Text>
          <View style={styles.calibDot} />
        </View>
      )}

      {/* Death fade overlay */}
      <Animated.View
        style={[styles.fadeOverlay, { opacity: fadeAnim }]}
        pointerEvents="none"
      />

      {/* Pause menu */}
      <PauseMenu
        visible={phase === 'paused'}
        onResume={handleResume}
        onRestart={handleRestart}
        onQuit={handleQuit}
      />

      {/* Mid-game coupon toast */}
      <CollectToast
        coupon={toastCoupon}
        onDone={() => setToastCoupon(null)}
      />

      {/* Level end modal */}
      <LevelEndModal
        visible={showLevelEnd}
        stars={levelResult.stars}
        time={elapsedTime}
        diamonds={diamondsCollected.filter(Boolean).length}
        totalDiamonds={level.diamondCells.length}
        coinsEarned={levelResult.coinsEarned}
        isNewBest={levelResult.isNewBest}
        collectedCoupons={getCollectedCoupons()}
        allCoupons={levelCoupons}
        onNext={handleNext}
        onRetry={handleRetry}
        onMenu={handleMenuFromEnd}
        hasNextLevel={levelId < LEVELS_PER_WORLD}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  canvas: {
    flex: 1,
  },
  calibOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  calibTitle: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  calibSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 24,
  },
  calibDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  fadeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 40,
  },
});
