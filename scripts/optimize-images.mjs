import { mkdir, readdir, stat } from 'node:fs/promises';
import { extname, join, parse, relative } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const sources = ['public/uploads/images', 'public/uploads/galleries', 'public/uploads/people'];
const supported = new Set(['.jpg', '.jpeg', '.png']);
const report = { scanned: 0, created: [], skipped: [] };

async function walk(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return (await Promise.all(entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return walk(path);
      return supported.has(extname(entry.name).toLowerCase()) ? [path] : [];
    }))).flat();
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
}

for (const source of sources) {
  const files = await walk(join(root, source));
  report.scanned += files.length;
  for (const input of files) {
    const inputStat = await stat(input);
    const { dir, name } = parse(input);
    for (const [extension, transform] of [
      ['.webp', (image) => image.webp({ quality: 82 })],
      ['.avif', (image) => image.avif({ quality: 55 })]
    ]) {
      const output = join(dir, `${name}${extension}`);
      try {
        const outputStat = await stat(output);
        if (outputStat.mtimeMs >= inputStat.mtimeMs) {
          report.skipped.push(relative(root, output));
          continue;
        }
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
      }
      await mkdir(dir, { recursive: true });
      await transform(sharp(input).rotate()).toFile(output);
      report.created.push(relative(root, output));
    }
  }
}

console.log(`Optimalizace médií: prohledáno ${report.scanned} JPG/PNG, vytvořeno nebo obnoveno ${report.created.length} variant, aktuálních ${report.skipped.length}.`);
for (const file of report.created) console.log(`+ ${file}`);
