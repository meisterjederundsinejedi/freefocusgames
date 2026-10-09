import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
    // All pages, but not API routes, Next.js internals or static files.
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|wav|ogg|mp4|webm|txt|xml|json|webmanifest|js|css|woff2)$).*)",
    ],
};
