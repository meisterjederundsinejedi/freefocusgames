// Takes screenshots of the built app so they can be looked at without running it locally.
// Run by the "Check" workflow after the build. Output: /tmp/report/shots/*.png
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "/tmp/report/shots";
mkdirSync(OUT, { recursive: true });

const pages = [
  ["home-de", "/"],
  ["home-en", "/en"],
  ["memory", "/games/memory-matching-game"],
  ["zahlensuche", "/games/schulte-table"],
  ["sudoku", "/games/focus-sudoku"],
];
const sizes = [
  ["1280x720", { width: 1280, height: 720 }],
];

const browser = await chromium.launch();
for (const [sizeName, viewport] of sizes) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  for (const [name, path] of pages) {
    try {
      await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 });
      await page.screenshot({ path: `${OUT}/${name}-${sizeName}.png`, fullPage: true });
    } catch (error) {
      console.log(`FAILED ${name}: ${error.message}`);
    }
  }
  await context.close();
}
await browser.close();
