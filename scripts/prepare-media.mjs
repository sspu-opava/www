import { readFile, writeFile, mkdir, stat, access } from 'node:fs/promises';
import { relative, resolve, extname } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { walkFiles } from './lib/html.mjs';
import { report } from './lib/report.mjs';
const output = resolve('public/_media'), manifestPath = 'src/data/generated-media.json';
await mkdir(output, { recursive: true });
let previous = {};
try { previous = JSON.parse(await readFile(manifestPath, 'utf8')); } catch { /* First build. */ }
const sourceFiles = (await walkFiles(resolve('public'))).filter(path => !path.startsWith(output) && /\.(jpe?g|png|webp|avif)$/i.test(path));
const manifest = {}, issues = [];
let cursor = 0, created = 0, reused = 0, originalBytes = 0, thumbnailBytes = 0;
const pending = new Map();
async function prepare(file) {
  const url = '/' + relative(resolve('public'), file).replaceAll('\\', '/');
  const bytes = await readFile(file);
  const hash = createHash('sha256').update('sspu-webp-v1-q80-').update(bytes).digest('hex').slice(0, 24);
  originalBytes += bytes.length;
  const cached = previous[url];
  if (cached?.hash === hash && (await Promise.all(cached.variants.map(v => access(resolve('public', '.' + v.src)).then(() => true, () => false)))).every(Boolean)) {
    manifest[url] = cached; reused++; thumbnailBytes += cached.variants[0]?.bytes || 0; return;
  }
  const meta = await sharp(bytes, { limitInputPixels: 40000000 }).metadata();
  if (!meta.width || !meta.height || (meta.pages || 1) > 1) { issues.push({ level: 'warning', file, message: 'Animované nebo nečitelné médium ponecháno v originálu.' }); return; }
  const rotated = [5, 6, 7, 8].includes(meta.orientation);
  const width = rotated ? meta.height : meta.width, height = rotated ? meta.width : meta.height;
  const variants = [];
  for (const targetWidth of [...new Set([Math.min(480, width), Math.min(960, width), Math.min(1600, width)])]) {
    const filename = hash + '-' + targetWidth + '.webp';
    if (!pending.has(filename)) pending.set(filename, (async () => {
      const path = resolve(output, filename);
      try { await access(path); } catch {
        await sharp(bytes, { limitInputPixels: 40000000 }).rotate().resize({ width: targetWidth, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path);
        created++;
      }
      return (await stat(path)).size;
    })());
    variants.push({ src: '/_media/' + filename, width: targetWidth, bytes: await pending.get(filename) });
  }
  thumbnailBytes += variants[0].bytes;
  manifest[url] = { hash, width, height, bytes: bytes.length, type: extname(file).slice(1), variants };
}
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < sourceFiles.length) {
    const file = sourceFiles[cursor++];
    try { await prepare(file); } catch (error) { issues.push({ level: 'error', file, message: 'Nelze připravit obrázek: ' + error.message }); }
    if (cursor % 200 === 0) console.log('Média: ' + cursor + '/' + sourceFiles.length);
  }
}));
await writeFile(manifestPath, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))));
await report('media', 'Obrázky pro responzivní web', issues, {
  Originály: sourceFiles.length, 'Nové varianty': created, 'Záznamy z cache': reused,
  'Originály celkem (MB)': (originalBytes / 1e6).toFixed(2), 'Nejmenší varianty celkem (MB)': (thumbnailBytes / 1e6).toFixed(2),
  'Zpracování': 'WebP 480/960/1600 px, orientace podle EXIF, výstupy bez EXIF, originály zachovány'
});
