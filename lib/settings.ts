/**
 * Global settings for the whole collection (text size, contrast, sound).
 *
 * Stored in this browser only (localStorage), never sent anywhere.
 * Unknown or broken saved values are ignored, so an update can never crash on old data.
 * Standalone (iframe) games live on the same site, so they can read the same key.
 */

export const SETTINGS_KEY = "mom-games:settings";

export const TEXT_SIZES = ["normal", "large", "xlarge"] as const;
export const CONTRASTS = ["normal", "high"] as const;

export type TextSize = (typeof TEXT_SIZES)[number];
export type Contrast = (typeof CONTRASTS)[number];

export type Settings = {
  textSize: TextSize;
  contrast: Contrast;
  sound: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  textSize: "normal",
  contrast: "normal",
  sound: true,
};

/** Read the saved settings. Anything missing or unknown falls back to the default. */
export function readSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const data = JSON.parse(raw) as Partial<Record<keyof Settings, unknown>> | null;
    if (!data || typeof data !== "object") return DEFAULT_SETTINGS;
    return {
      textSize: TEXT_SIZES.find((value) => value === data.textSize) ?? DEFAULT_SETTINGS.textSize,
      contrast: CONTRASTS.find((value) => value === data.contrast) ?? DEFAULT_SETTINGS.contrast,
      sound: typeof data.sound === "boolean" ? data.sound : DEFAULT_SETTINGS.sound,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(settings: Settings): void {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be blocked; the settings then simply last until the tab is closed.
  }
}

/** Show the settings on the page: the CSS in globals.css reacts to these two attributes. */
export function applySettings(settings: Settings): void {
  const root = document.documentElement;
  if (settings.textSize === "normal") root.removeAttribute("data-text");
  else root.setAttribute("data-text", settings.textSize);
  if (settings.contrast === "normal") root.removeAttribute("data-contrast");
  else root.setAttribute("data-contrast", settings.contrast);
}

/**
 * A tiny script for the page <head>. It applies text size and contrast before the first
 * paint, so the page never flashes in the wrong size. Keep it in sync with applySettings.
 */
export const EARLY_SETTINGS_SCRIPT = `try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  SETTINGS_KEY
)})||"{}"),d=document.documentElement;if(s.textSize==="large"||s.textSize==="xlarge")d.setAttribute("data-text",s.textSize);if(s.contrast==="high")d.setAttribute("data-contrast","high")}catch(e){}`;
