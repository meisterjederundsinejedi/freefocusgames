/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

// English is the complete base. Other languages are merged over it, so any text
// that has no translation yet falls back to English instead of showing a key.
const BASE_LOCALE = "en";
const LOCALES = ["en", "de"];

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge(target, source) {
  for (const [key, sourceValue] of Object.entries(source)) {
    const targetValue = target[key];

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      deepMerge(targetValue, sourceValue);
      continue;
    }

    target[key] = sourceValue;
  }
}

for (const locale of LOCALES) {
  const localeDir = path.join(process.cwd(), "messages", locale);
  fs.mkdirSync(localeDir, { recursive: true });
  const files = fs
    .readdirSync(localeDir)
    .filter((file) => file.endsWith(".json") && file !== "_index.json" && file !== "compiled.json")
    .sort();

  const merged = {};

  if (locale !== BASE_LOCALE) {
    const baseDir = path.join(process.cwd(), "messages", BASE_LOCALE);
    const baseFiles = fs
      .readdirSync(baseDir)
      .filter((file) => file.endsWith(".json") && file !== "_index.json" && file !== "compiled.json")
      .sort();
    for (const file of baseFiles) {
      deepMerge(merged, JSON.parse(fs.readFileSync(path.join(baseDir, file), "utf8")));
    }
  }

  for (const file of files) {
    const filePath = path.join(localeDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    deepMerge(merged, data);
  }

  fs.writeFileSync(path.join(localeDir, "compiled.json"), `${JSON.stringify(merged, null, 2)}\n`);
  console.log(`Compiled i18n for ${locale} from ${files.length} files`);
}
