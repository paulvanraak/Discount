import { Audio } from 'expo-av';

// ─── Types ────────────────────────────────────────────────────────────────────
type SFXKey =
  | 'diamond'
  | 'levelComplete'
  | 'levelFail'
  | 'marbleRoll'
  | 'marbleHit'
  | 'buttonTap'
  | 'starReveal'
  | 'holefall';

// ─── Volume State ──────────────────────────────────────────────────────────────
let musicVolume = 0.7;
let sfxVolume = 0.8;

// ─── Music Playback ────────────────────────────────────────────────────────────
let currentMusic: Audio.Sound | null = null;
let currentTrack: string | null = null;

// Track map — assets bundled as require() references
// In a real build these would be actual audio files in /assets/audio/
// We use placeholder requires here; the files should be provided.
const MUSIC_TRACKS: Record<string, any> = {
  menu: null,     // require('../../assets/audio/music_menu.mp3'),
  crystal: null,  // require('../../assets/audio/music_crystal.mp3'),
  lava: null,
  forest: null,
  space: null,
  ocean: null,
  sky: null,
};

const SFX_MAP: Record<SFXKey, any> = {
  diamond: null,        // require('../../assets/audio/sfx_diamond.mp3'),
  levelComplete: null,  // require('../../assets/audio/sfx_complete.mp3'),
  levelFail: null,      // require('../../assets/audio/sfx_fail.mp3'),
  marbleRoll: null,     // require('../../assets/audio/sfx_roll.mp3'),
  marbleHit: null,      // require('../../assets/audio/sfx_hit.mp3'),
  buttonTap: null,      // require('../../assets/audio/sfx_tap.mp3'),
  starReveal: null,     // require('../../assets/audio/sfx_star.mp3'),
  holefall: null,       // require('../../assets/audio/sfx_fall.mp3'),
};

export async function initAudio(): Promise<void> {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  });
}

export async function playMusic(track: string): Promise<void> {
  if (currentTrack === track && currentMusic) return;

  await stopMusic();

  const src = MUSIC_TRACKS[track];
  if (!src) return; // No audio file yet

  try {
    const { sound } = await Audio.Sound.createAsync(src, {
      isLooping: true,
      volume: musicVolume,
      shouldPlay: true,
    });
    currentMusic = sound;
    currentTrack = track;
  } catch {
    // Audio not available — skip silently
  }
}

export async function stopMusic(): Promise<void> {
  if (!currentMusic) return;
  try {
    await currentMusic.stopAsync();
    await currentMusic.unloadAsync();
  } catch {
    // ignore
  }
  currentMusic = null;
  currentTrack = null;
}

export async function setMusicVolume(vol: number): Promise<void> {
  musicVolume = Math.max(0, Math.min(1, vol));
  if (currentMusic) {
    try {
      await currentMusic.setVolumeAsync(musicVolume);
    } catch {
      // ignore
    }
  }
}

export function setSfxVolume(vol: number): void {
  sfxVolume = Math.max(0, Math.min(1, vol));
}

export async function playSfx(key: SFXKey): Promise<void> {
  const src = SFX_MAP[key];
  if (!src) return; // No audio file yet

  try {
    const { sound } = await Audio.Sound.createAsync(src, {
      volume: sfxVolume,
      shouldPlay: true,
    });
    // Auto-unload after playback
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch {
    // Audio not available
  }
}

export function getMusicVolume(): number {
  return musicVolume;
}
export function getSfxVolume(): number {
  return sfxVolume;
}
