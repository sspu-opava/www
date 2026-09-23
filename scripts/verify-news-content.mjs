import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';

const articlesDir = join(process.cwd(), 'src', 'content', 'articles');
const distDir = join(process.cwd(), 'dist', 'aktuality');
const files = (await readdir(articlesDir)).filter((file) => file.endsWith('.md')).sort();
const errors = [];
const lengths = [];
let bodyImages = 0;

function frontmatterString(source, field) {
  const raw = source.match(new RegExp(`^${field}:\\s*(.*?)\\s*$`, 'm'))?.[1];
  if (!raw) return undefined;
  if (raw.startsWith('"')) {
    try { return JSON.parse(raw); } catch { return raw.slice(1, -1); }
  }
  return raw.replace(/^['"]|['"]$/g, '');
}

for (const file of files) {
  const slug = file.replace(/\.md$/, '');
  const source = await readFile(join(articlesDir, file), 'utf8');
  const parsed = matter(source);
  const description = parsed.data.description;
  lengths.push(description.length);
  if (description.length < 100 || description.length > 280) errors.push(`${file}: perex má ${description.length} znaků`);
  if (!/[.!?]$/.test(description) || description.includes('…') || description.includes('...')) errors.push(`${file}: perex nekončí celou větou`);
  if (/^(\s{4,})<(?:img|p|h[1-6]|a|div|table|iframe|br)\b/m.test(parsed.content)) errors.push(`${file}: HTML je stále odsazené jako kód`);
  if (/&(?:amp;)?lt;\/?(?:img|p|h[1-6]|a|div|table)\b|\\u003[cCeE]/i.test(parsed.content)) errors.push(`${file}: obsahuje escapované HTML`);

  const sourceImages = [...parsed.content.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)].map((match) => match[1]);
  bodyImages += sourceImages.length;
  for (const image of sourceImages) {
    if (/^\//.test(image)) {
      try { await access(join(process.cwd(), 'public', image.replace(/^\//, ''))); }
      catch { errors.push(`${file}: chybějící obrázek ${image}`); }
    }
  }

  const page = await readFile(join(distDir, slug, 'index.html'), 'utf8');
  if (/&lt;\/?(?:img|p|h[1-6]|a|div|table)\b/i.test(page)) errors.push(`${file}: build obsahuje viditelný HTML kód`);
  if (/<pre[^>]*>\s*<code[\s\S]*?(?:&lt;|<img\b|<p\b)/i.test(page)) errors.push(`${file}: build vložil HTML do code blocku`);
  if (sourceImages.some((image) => image.startsWith('/uploads/') && !page.includes(`src="${image}"`))) {
    errors.push(`${file}: obrázek z těla článku není v buildu`);
  }
}

const galleryFiles = (await readdir(join(process.cwd(), 'src', 'content', 'galleries'))).filter((file) => file.endsWith('.md')).sort();
let galleryPhotos = 0;
for (const file of galleryFiles) {
  const source = await readFile(join(process.cwd(), 'src', 'content', 'galleries', file), 'utf8');
  const title = frontmatterString(source, 'title');
  const expectedAlt = title?.replace(/^Fotogalerie:\s*/i, '').trim();
  for (const line of source.split(/\r?\n/).filter((value) => /^ {4}alt:\s*/.test(value))) {
    const raw = line.match(/^ {4}alt:\s*(.*?)\s*$/)?.[1] ?? '';
    let actualAlt = raw.replace(/^['"]|['"]$/g, '');
    if (raw.startsWith('"')) {
      try { actualAlt = JSON.parse(raw); } catch { /* keep the fallback */ }
    }
    galleryPhotos += 1;
    if (actualAlt !== expectedAlt) errors.push(`${file}: ALT není pouze názvem galerie`);
  }
}

console.log(JSON.stringify({
  articles: files.length,
  bodyImages,
  galleries: galleryFiles.length,
  galleryPhotos,
  descriptionRange: [Math.min(...lengths), Math.max(...lengths)],
  errors
}, null, 2));

if (errors.length) process.exitCode = 1;
