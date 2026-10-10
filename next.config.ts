import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Static export: `npm run build` writes plain files to the folder `out/`.
  // They can be hosted anywhere (we use Cloudflare Pages), no server needed.
  output: "export",
  // /de/games/x/ is served from /de/games/x/index.html, which every static host understands.
  trailingSlash: true,
  // Keep the old setting: some libraries must not be initialised twice.
  reactStrictMode: false,
  // next/image cannot resize on a static host; the pictures are used as they are.
  images: {
    unoptimized: true,
  },
  // Response headers (noindex, no-cache for sw.js) live in public/_headers.
};

export default withNextIntl(nextConfig);
