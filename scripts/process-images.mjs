import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGE_EXTENSIONS = new Set([".avif", ".jpg", ".jpeg", ".png", ".jfif"]);

function sourceDir() {
  const flag = process.argv.find((arg) => arg.startsWith("--src="));
  if (!flag) return path.join(root, "Sneakers");
  return path.resolve(flag.slice("--src=".length));
}

function normalize(value) {
  return value
    .toLowerCase()
    .replaceAll("&", "and")
    .replace(/['’ʼ]/g, "")
    .replaceAll("(women's)", "")
    .replaceAll("(womens)", "")
    .replace(/\bwomens\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function matchProduct(fileNorm, products) {
  if (!fileNorm) return null;
  const exact = products.filter((product) => product.norm === fileNorm);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) return null;

  const contained = products.filter(
    (product) =>
      product.norm.length > 0 &&
      (product.norm.includes(fileNorm) || fileNorm.includes(product.norm)),
  );
  if (contained.length === 1) return contained[0];
  return null;
}

function clearUnderSole(raw, width, height, channels) {
  const shoeY = new Int32Array(width).fill(-1);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * channels;
      if (Math.min(raw[offset], raw[offset + 1], raw[offset + 2]) < 176) shoeY[x] = y;
    }
  }
  let sole = -1;
  for (const y of shoeY) if (y > sole) sole = y;
  for (let x = 0; x < width; x++) {
    if (shoeY[x] < sole - 10) continue;
    for (let y = shoeY[x] + 1; y < height; y++) {
      const offset = (y * width + x) * channels;
      raw[offset] = 255;
      raw[offset + 1] = 255;
      raw[offset + 2] = 255;
    }
  }
}

async function writeProductImage(input, output) {
  try {
    const { data, info } = await sharp(input)
      .rotate()
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    clearUnderSole(data, info.width, info.height, info.channels);
    await sharp(data, {
      raw: { width: info.width, height: info.height, channels: info.channels },
    })
      .webp({ quality: 85 })
      .toFile(output);
  } catch (error) {
    if (path.extname(input).toLowerCase() === ".avif") {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`AVIF decoding failed for ${path.basename(input)}: ${message}`);
      process.exit(1);
    }
    throw error;
  }
}

function section(title, rows) {
  return [title, ...(rows.length === 0 ? ["(none)"] : rows)];
}

async function main() {
  const src = sourceDir();
  const entries = await readdir(src, { withFileTypes: true });
  const images = entries
    .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const avif = images.find((name) => path.extname(name).toLowerCase() === ".avif");
  if (avif) {
    try {
      await sharp(path.join(src, avif)).toBuffer();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`AVIF decoding failed for ${avif}: ${message}`);
      process.exit(1);
    }
  }

  const catalog = JSON.parse(await readFile(path.join(root, "data", "products.json"), "utf8"));
  const products = catalog.products.map((product) => ({
    ...product,
    norm: normalize(product.name),
  }));

  const outDir = path.join(root, "public", "products");
  await mkdir(outDir, { recursive: true });

  const matched = [];
  const unmatched = [];
  const usedSlugs = new Set();

  for (const name of images) {
    const product = matchProduct(normalize(path.parse(name).name), products);
    if (!product) {
      unmatched.push(name);
      continue;
    }
    await writeProductImage(path.join(src, name), path.join(outDir, `${product.slug}.webp`));
    matched.push(`${name} → ${product.slug}`);
    usedSlugs.add(product.slug);
  }

  const missing = products
    .filter((product) => !usedSlugs.has(product.slug))
    .map((product) => product.slug);

  console.log(
    [
      ...section("MATCHED", matched),
      "",
      ...section("UNMATCHED IMAGES", unmatched),
      "",
      ...section("PRODUCTS WITHOUT AN IMAGE", missing),
    ].join("\n"),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
