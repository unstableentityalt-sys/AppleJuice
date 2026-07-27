import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "icon-source.svg");
const outDir = path.join(__dirname, "..", "public");

mkdirSync(outDir, { recursive: true });

const sizes = [
  { file: "apple-touch-icon.png", size: 180 },
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "icon-maskable-512.png", size: 512 },
  { file: "favicon-32.png", size: 32 },
];

for (const { file, size } of sizes) {
  await sharp(src).resize(size, size).png().toFile(path.join(outDir, file));
  console.log(`wrote ${file}`);
}
