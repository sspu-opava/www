import { mkdir, readdir, writeFile, access } from 'node:fs/promises';
import { basename, extname, join, resolve, relative, sep } from 'node:path';
import sharp from 'sharp';
import YAML from 'yaml';
import { civilToday } from '../../src/lib/publication.mjs';
export async function createGallery({ source, slug, title, root = process.cwd(), now = new Date() }) {
  if (!source || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '')) throw new Error('Zadejte zdroj a slug z malých písmen, číslic a pomlček.');
  const mediaRoot = resolve(root, 'public/uploads/galleries');
  const target = resolve(mediaRoot, slug);
  const metadata = resolve(root, 'src/content/galleries', slug + '.md');
  if (!relative(mediaRoot, target) || relative(mediaRoot, target).startsWith('..' + sep)) throw new Error('Cíl musí ležet ve složce galerií.');
  for (const path of [target, metadata]) {
    try { await access(path); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    throw new Error('Galerie už existuje; nic nebylo přepsáno: ' + path);
  }
  const files = (await readdir(source, { withFileTypes: true })).filter(file => file.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(file.name)).map(file => file.name).sort(new Intl.Collator('cs', { numeric: true }).compare);
  if (!files.length) throw new Error('Zdroj neobsahuje podporované fotografie.');
  await mkdir(mediaRoot, { recursive: true });
  await mkdir(resolve(root, 'src/content/galleries'), { recursive: true });
  await mkdir(target); // Exclusive reservation: an existing directory is never reused.
  const photos = [];
  for (const [index, file] of files.entries()) {
    const output = String(index + 1).padStart(3, '0') + '.webp';
    await sharp(join(source, file), { limitInputPixels: 40000000 }).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(join(target, output));
    photos.push({ src: '/uploads/galleries/' + slug + '/' + output, alt: 'Doplnit ALT: ' + basename(file, extname(file)), caption: '' });
  }
  const data = { title: title || slug.replaceAll('-', ' '), description: 'Doplnit stručný popis galerie.', date: civilToday(now), cover: photos[0].src, photos, programs: [], categories: [], tags: [], status: 'draft' };
  await writeFile(metadata, '---\n' + YAML.stringify(data) + '---\n', { encoding: 'utf8', flag: 'wx' });
  return { target, metadata, photos: photos.length };
}
