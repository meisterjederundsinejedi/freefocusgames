"use client";

import { useEffect } from "react";
import { getEnabledGames } from "@/lib/registry";
import { routing } from "@/i18n/routing";

/** Pages worth keeping for offline use: the start page and every visible game, in each language. */
function pagesToKeep(): string[] {
  const urls: string[] = [];
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    urls.push(prefix || "/");
    for (const game of getEnabledGames()) {
      urls.push(`${prefix}${game.path}`);
    }
  }
  return urls;
}

/**
 * Makes the collection work offline and installable (a PWA, so it can be pinned
 * to the Chromebook shelf). Shows nothing and asks nothing.
 * Only active in the real (production) build, so development stays simple.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let timer: number | undefined;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => {
        // Save the pages in the background, once the game page itself has had time to load.
        // Skipped when the browser asks to save data.
        const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
        if (connection?.saveData) return;
        timer = window.setTimeout(() => {
          registration.active?.postMessage({ type: "warm", urls: pagesToKeep() });
        }, 4000);
      })
      .catch(() => {
        // Offline support is a bonus; the games still work without it.
      });

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
