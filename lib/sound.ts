import { readSettings } from "@/lib/settings";

/** Moderate by default: never loud. */
export const DEFAULT_VOLUME = 0.5;

/** True unless Mama switched the sound off in the settings. */
export function isSoundOn(): boolean {
  return readSettings().sound;
}

/**
 * Play a short sound, but only if sound is switched on.
 * Every game uses this instead of creating its own audio, so the one On/Off
 * switch in the settings works everywhere. Failures are silent on purpose.
 */
export function playSound(src: string, volume: number = DEFAULT_VOLUME): void {
  if (typeof window === "undefined" || !isSoundOn()) return;
  try {
    const audio = new Audio(src);
    audio.volume = Math.min(Math.max(volume, 0), 1);
    void audio.play().catch(() => {});
  } catch {
    // No sound is better than an error message.
  }
}
