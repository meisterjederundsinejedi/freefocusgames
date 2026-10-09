import registry from "@/data/games.json";

export type Locale = "de" | "en";

export type RegistryGame = {
  id: string;
  version: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  thumbnail: string;
  /** "native": React page at `path` inside the app. "iframe": standalone folder in public/games/<id>/. */
  type: "native" | "iframe";
  path: string;
  enabled: boolean;
};

const all = registry.games as RegistryGame[];

/** Games shown on the home screen, in registry order. */
export function getEnabledGames(): RegistryGame[] {
  return all.filter((game) => game.enabled);
}

export function getRegistryGame(id: string): RegistryGame | undefined {
  return all.find((game) => game.id === id);
}

export function pick(text: Record<Locale, string>, locale: string): string {
  return text[locale as Locale] ?? text.de;
}
