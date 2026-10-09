import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    // German is Mama's language; English stays available.
    locales: ["de", "en"],

    // Used when no locale matches
    defaultLocale: "de",

    // The default language needs no URL prefix (/ instead of /de)
    localePrefix: "as-needed",
    // A URL always serves the same language; the switcher changes the URL.
    localeDetection: false,
    alternateLinks: false,
});
