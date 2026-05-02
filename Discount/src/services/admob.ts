// AdMob stub for Expo Go compatibility.
// All functions are no-ops. Swap in the real react-native-google-mobile-ads
// implementation (src/services/admob.full.ts) when building for the App Store.

let levelCompletionCount = 0;

export const AD_UNIT_IDS = {
  banner: '',
  interstitial: '',
  rewarded: '',
};

export function preloadInterstitial(): void {}
export function preloadRewarded(): void {}
export function initAds(): void {}

export function showInterstitialIfReady(onClosed?: () => void): void {
  onClosed?.();
}

export function showRewardedAd(
  onEarned: () => void,
  onDismissed?: () => void
): boolean {
  // In Expo Go there are no real ads — just fire the callback immediately.
  // Comment the next line out when using the real SDK.
  onDismissed?.();
  return false;
}

export function isRewardedAdReady(): boolean {
  return false;
}
