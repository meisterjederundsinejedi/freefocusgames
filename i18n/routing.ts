import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    // German is Mama's language; English stays available.
    locales: ["de", "en"],

    // Used when no locale matches
    defaultLocale: "de",

    // Static hosting has no middleware, so every page has its language in the URL
    // (/de/..., /en/...). "/" is a tiny page (public/index.html) that goes to /de/.
    localePrefix: "always",
    alternateLinks: false,
});
