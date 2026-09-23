import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const SOURCE_ORIGIN = 'https://www.sspu-opava.cz';
const SOURCE_LIST = `${SOURCE_ORIGIN}/cs/zpravy/`;
const option = (name) => process.argv.find((argument) => argument.startsWith(`--${name}=`))?.slice(name.length + 3);
const dateOption = (name, fallback, endOfDay = false) => {
  const value = option(name) || fallback;
  const date = new Date(`${value}T${endOfDay ? '23:59:59' : '00:00:00'}`);
  if (Number.isNaN(date.getTime())) throw new Error(`Neplatné datum --${name}=${value}. Použijte formát RRRR-MM-DD.`);
  return date;
};
const START_DATE = dateOption('start-date', '2025-01-01');
const END_DATE = dateOption('end-date', '2026-08-24', true);
const INCREMENTAL = process.argv.includes('--incremental');
const root = process.cwd();
const articlesDir = join(root, 'src', 'content', 'articles');
const galleriesDir = join(root, 'src', 'content', 'galleries');
const categoriesDir = join(root, 'src', 'content', 'categories');
const TEST_ARTICLE_FILES = new Set([
  'anglicke-divadlo-bear-theatre.md', 'cambridge-certifikaty.md', 'ceska-ai-olympiada.md',
  'erasmus-2025.md', 'exkurze-do-brano.md', 'exkurze-do-litomysle.md', 'myty-versus-realita.md',
  'phdr-jan-svoboda.md', 'plakaty-prumyslovy-design.md', 'zahajeni-skolniho-roku-2026.md'
]);
const TEST_GALLERY_FILES = new Set(['obrazovy-pruvodce-skolou.md', 'studentske-prace.md']);
const MIGRATION_ARTIFACT_CATEGORY_FILES = new Set([
  'skola-322.md', 'umelecke-obory-189.md', 'informacni-technologie-98.md', 'strojirenstvi-98.md',
  'design-hracek-71.md', 'graficky-design-44.md', 'prumyslovy-design-15.md', 'technicke-obory-10.md'
]);

const MONTHS = new Map([
  ['leden', 1], ['ledna', 1], ['únor', 2], ['února', 2], ['březen', 3], ['března', 3],
  ['duben', 4], ['dubna', 4], ['květen', 5], ['května', 5], ['červen', 6], ['června', 6],
  ['červenec', 7], ['července', 7], ['srpen', 8], ['srpna', 8], ['září', 9],
  ['říjen', 10], ['října', 10], ['listopad', 11], ['listopadu', 11], ['prosinec', 12], ['prosince', 12]
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function decodeHtml(value = '') {
  const named = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", hellip: '…', ndash: '–', mdash: '—' };
  return value
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, token) => {
      if (token.toLowerCase().startsWith('#x')) return String.fromCodePoint(Number.parseInt(token.slice(2), 16));
      if (token.startsWith('#')) return String.fromCodePoint(Number.parseInt(token.slice(1), 10));
      return named[token.toLowerCase()] ?? match;
    });
}

function stripTags(value = '') {
  return decodeHtml(value.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, ' '))
    .replace(/[ \t\r\f]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

function normalizeText(value = '') {
  return stripTags(value).replace(/\s+/g, ' ').trim();
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return match ? decodeHtml(match[1]).trim() : '';
}

function htmlEscape(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function setAttribute(tag, name, value) {
  const escaped = htmlEscape(value);
  const attrPattern = new RegExp(`(${name}\\s*=\\s*)["'][^"']*["']`, 'i');
  if (attrPattern.test(tag)) return tag.replace(attrPattern, `$1"${escaped}"`);
  return tag.replace(/\s*\/?>(\s*)$/, ` ${name}="${escaped}"$&`);
}

function normalizeEmbeddedMedia(value, title) {
  const unwrapped = value.replace(/<p>\s*(<iframe\b[\s\S]*?<\/iframe>)\s*<\/p>/gi, '$1');
  return unwrapped.replace(
    /<iframe\b[^>]*\bsrc=["'](?:https?:)?\/\/(?:www\.)?youtube\.com\/embed\/([^"'?&/]+)[^>]*>\s*<\/iframe>/gi,
    (_, videoId) => `<iframe title="${htmlEscape(`${title} – video`)}" loading="lazy" src="https://www.youtube-nocookie.com/embed/${videoId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
  );
}

function absoluteUrl(value) {
  if (!value) return '';
  try { return new URL(value, SOURCE_ORIGIN).href; } catch { return ''; }
}

function sourcePath(value) {
  try { return new URL(value, SOURCE_ORIGIN).pathname; } catch { return ''; }
}

function safeSlug(value) {
  return decodeHtml(value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'clanek';
}

function safeFileStem(value) {
  return decodeHtml(value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '') || 'soubor';
}

function fileStem(value) {
  const path = sourcePath(value);
  const name = decodeURIComponent(path.split('/').pop() || 'fotografie');
  return name.replace(/\.[^.]+$/, '').replace(/\.[0-9]+x[0-9]+.*$/i, '').replace(/[._-]+/g, ' ').replace(/\b[a-f0-9]{8,}\b/gi, '').replace(/\s+/g, ' ').trim();
}

function humanizeImageName(value) {
  const stem = fileStem(value).replace(/\b\d{1,4}\b/g, '').replace(/\s+/g, ' ').trim();
  if (!stem || stem.length < 3) return 'Fotografie';
  return stem.charAt(0).toLocaleUpperCase('cs-CZ') + stem.slice(1);
}

function truncate(value, max = 150) {
  if (value.length <= max) return value;
  const short = value.slice(0, max - 1).replace(/\s+\S*$/, '').trim();
  return `${short}…`;
}

function altText({ provided, title, source, context }) {
  const clean = normalizeText(provided);
  if (clean) return truncate(clean, 140);
  const label = humanizeImageName(source);
  if (label === 'Fotografie') return truncate(`${context} – fotografie k článku „${title}“`, 140);
  return truncate(`${context} – ${label}`, 140);
}

function parseCzechDate(value) {
  const text = normalizeText(value).toLocaleLowerCase('cs-CZ');
  const match = text.match(/(\d{1,2})\.\s*([\p{L}]+)\s+(\d{4})/u);
  if (!match) return undefined;
  const month = MONTHS.get(match[2]);
  if (!month) return undefined;
  return new Date(`${match[3]}-${String(month).padStart(2, '0')}-${String(match[1]).padStart(2, '0')}T12:00:00`);
}

function dateIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseListing(html) {
  const rows = [];
  const re = /<div class="single-blog-post[^"]*"[\s\S]*?<h3>[\s\S]*?<a href="(\/cs\/zpravy\/[^"?#]+\/)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<div class="post-meta[\s\S]*?<p>([\s\S]*?)<\/p>/g;
  for (const match of html.matchAll(re)) {
    const url = absoluteUrl(match[1]);
    const date = parseCzechDate(match[3]);
    if (url && date) rows.push({ url, title: normalizeText(match[2]), date });
  }
  return rows;
}

function parseAnchors(html) {
  return [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map((match) => ({ href: match[1], label: normalizeText(match[2]) }));
}

function parseImages(html) {
  return [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => ({
    tag: match[0],
    src: attribute(match[0], 'src'),
    dataImage: attribute(match[0], 'data-image'),
    alt: attribute(match[0], 'alt')
  })).filter((image) => image.src || image.dataImage);
}

function articleContainer(html) {
  const match = html.match(/<div class="single-blog-post page-content[^>]*>([\s\S]*?)<!-- Post Meta -->/i);
  if (!match) throw new Error('Detail článku neobsahuje očekávaný obsahový blok.');
  return match[1];
}

function extractDetail(html, listing) {
  const container = articleContainer(html);
  const title = normalizeText(html.match(/<h2[^>]*class="text-center[^"]*"[^>]*>([\s\S]*?)<\/h2>/i)?.[1] || listing.title);
  const author = normalizeText(html.match(/<a\b[^>]*href="\/cs\/zpravy\/author\/[^"]+"[^>]*>([\s\S]*?)<\/a>/i)?.[1] || 'Redakce školy');
  const publishedText = html.match(/Publikováno:\s*([\s\S]{0,100}?\d{4})/i)?.[1] || listing.date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const publishedAt = parseCzechDate(publishedText) || listing.date;
  const metaBlock = html.match(/<div class="post-meta[^>]*>([\s\S]*?)<\/div>/i)?.[1] || '';
  const categories = [...metaBlock.matchAll(/<a\b[^>]*href="\/cs\/zpravy\/category\/([^"/]+)\/"[^>]*>([\s\S]*?)<\/a>/gi)].map((match) => ({ slug: match[1], title: normalizeText(match[2]) }));
  const tags = [...metaBlock.matchAll(/<a\b[^>]*href="\/cs\/zpravy\/tag\/([^"/]+)\/"[^>]*>([\s\S]*?)<\/a>/gi)].map((match) => normalizeText(match[2]));
  const images = parseImages(container);
  const hero = images.find((image) => image.src && !image.dataImage) || images[0];
  const galleryBlocks = [...container.matchAll(/<div id="gallery_[^"]+"[\s\S]*?<\/div>/gi)].map((match) => match[0]);
  const galleryPhotos = galleryBlocks.flatMap((block) => parseImages(block).map((image) => ({ ...image, src: image.dataImage || image.src })));
  let body = container;
  body = body.replace(/<div class="blog-post-thumb[\s\S]*?<\/div>/i, '');
  for (const galleryBlock of galleryBlocks) body = body.replace(galleryBlock, '');
  body = body.replace(/<!--[^>]*-->/g, '').trim();
  body = body.replace(/<a\b([^>]*href="\/cs\/zpravy\/[^"/]+\/"[^>]*)>([\s\S]*?)<\/a>/gi, '$2');
  body = normalizeEmbeddedMedia(body, title);
  return { url: listing.url, title, author, publishedAt, categories, tags, hero, galleryPhotos, body, container };
}

function textFromHtml(value) {
  return normalizeText(value.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, ''));
}

function makeDescription(body, title) {
  const firstTextBlock = body.match(/<(?:p|h[2-6])\b[^>]*>([\s\S]*?)<\/(?:p|h[2-6])>/i)?.[1] || body;
  const text = textFromHtml(firstTextBlock);
  if (!text) return `Stručná zpráva ze života školy: ${title}.`;
  return truncate(text, 245);
}

function htmlFileName(url, fallback = 'soubor') {
  try {
    const path = decodeURIComponent(new URL(url).pathname);
    const name = path.split('/').pop() || fallback;
    return safeFileStem(name);
  } catch { return fallback; }
}

function extensionFor(url, contentType = '') {
  const pathname = sourcePath(url);
  const match = pathname.match(/(\.[a-z0-9]{2,6})(?:$|[.?])/i);
  if (match) return match[1].toLowerCase();
  const type = contentType.split(';')[0].toLowerCase();
  const types = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'application/pdf': '.pdf', 'application/msword': '.doc', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx', 'application/zip': '.zip' };
  return types[type] || '.bin';
}

function isImage(value, contentType = '') {
  return /^image\//i.test(contentType) || /\.(?:jpe?g|png|webp|gif|svg|avif|bmp|tiff?)(?:$|[.?])/i.test(sourcePath(value));
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'SSPU Opava content migration' } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

async function downloadAsset(url, relativePath) {
  const target = join(root, 'public', relativePath);
  await mkdir(join(target, '..'), { recursive: true });
  try {
    const cached = await readFile(target);
    if (cached.length) return { relativePath: `/${relativePath.replaceAll('\\', '/')}`, contentType: '', bytes: cached.length };
  } catch {
    // No cached file yet; download it below.
  }
  const response = await fetch(url, { headers: { 'user-agent': 'SSPU Opava content migration' } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const contentType = response.headers.get('content-type') || '';
  const sourceBytes = Buffer.from(await response.arrayBuffer());
  const bytes = /\.webp$/i.test(relativePath) && /^image\//i.test(contentType)
    ? await sharp(sourceBytes, { limitInputPixels: 40000000 }).rotate().webp({ quality: 86, effort: 5 }).toBuffer()
    : sourceBytes;
  await writeFile(target, bytes);
  return { relativePath: `/${relativePath.replaceAll('\\', '/')}`, contentType, bytes: bytes.length };
}

function applyReplacements(body, replacements) {
  return [...replacements.entries()].sort((a, b) => b[0].length - a[0].length).reduce((value, [from, to]) => value.split(from).join(to), body);
}

function yaml(value) { return JSON.stringify(value); }

async function loadExistingTitles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = new Map();
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const source = await readFile(join(directory, entry.name), 'utf8');
    const title = source.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim();
    if (title) result.set(title.replace(/^['"]|['"]$/g, ''), entry.name);
  }
  return result;
}

async function migrateArticle(detail, index, total) {
  const slug = safeSlug(new URL(detail.url).pathname.split('/').filter(Boolean).pop());
  const gallerySlug = detail.galleryPhotos.length ? `${slug}-galerie` : undefined;
  const replacements = new Map();
  const attachments = [];
  const localAssets = new Map();
  const download = async (source, relativePath) => {
    const absolute = absoluteUrl(source);
    if (!absolute) return undefined;
    if (localAssets.has(absolute)) return localAssets.get(absolute);
    const asset = await downloadAsset(absolute, relativePath);
    const value = { ...asset, source: absolute };
    localAssets.set(absolute, value);
    replacements.set(source, asset.relativePath);
    replacements.set(absolute, asset.relativePath);
    return value;
  };

  let cover;
  if (detail.hero?.src) {
    cover = await download(detail.hero.src, `uploads/articles/${slug}/cover.webp`);
  }

  const galleryPhotos = [];
  for (const [photoIndex, photo] of detail.galleryPhotos.entries()) {
    const source = photo.src || photo.dataImage;
    if (!source) continue;
    const stem = safeFileStem(fileStem(source)).slice(0, 48) || `foto-${photoIndex + 1}`;
    const asset = await download(source, `uploads/galleries/${gallerySlug}/${String(photoIndex + 1).padStart(2, '0')}-${stem}.webp`);
    if (!asset) continue;
    const photoNumber = photoIndex + 1;
    const providedAlt = normalizeText(photo.alt);
    const alt = providedAlt || `${detail.title} – fotografie ${photoNumber}`;
    const caption = providedAlt || `Fotografie ${photoNumber} z ${detail.galleryPhotos.length}`;
    galleryPhotos.push({ src: asset.relativePath, alt, caption });
  }

  const bodyImages = parseImages(detail.body);
  for (const [imageIndex, image] of bodyImages.entries()) {
    if (!image.src) continue;
    await download(image.src, `uploads/articles/${slug}/image-${String(imageIndex + 1).padStart(2, '0')}.webp`);
  }

  const bodyAnchors = parseAnchors(detail.body);
  const fileLinks = bodyAnchors.filter(({ href }) => {
    const path = sourcePath(href);
    return path.startsWith('/media/') || /\.(?:pdf|docx?|xlsx?|pptx?|zip|rar|7z|odt|ods|csv|txt)(?:$|[?#])/i.test(path);
  });
  for (const [attachmentIndex, link] of fileLinks.entries()) {
    const source = link.href;
    const ext = extensionFor(absoluteUrl(source));
    const name = htmlFileName(source, `soubor-${attachmentIndex + 1}`);
    const asset = await download(source, `uploads/attachments/${slug}/${name.includes('.') ? name : `${name}${ext}`}`);
    if (!asset) continue;
    if (!isImage(source, asset.contentType)) {
      attachments.push({ label: link.label || name, url: asset.relativePath });
    }
  }

  let body = applyReplacements(detail.body, replacements);
  let bodyImageIndex = 0;
  body = body.replace(/<img\b[^>]*>/gi, (tag) => {
    const originalSrc = attribute(tag, 'src');
    const absolute = absoluteUrl(originalSrc);
    const local = replacements.get(originalSrc) || replacements.get(absolute);
    const sourceImage = bodyImages[bodyImageIndex++] || { alt: '', src: originalSrc };
    const updated = local ? setAttribute(tag, 'src', local) : tag;
    return setAttribute(updated, 'alt', altText({ provided: sourceImage.alt, title: detail.title, source: sourceImage.src, context: 'Fotografie' }));
  });
  body = body.replace(/\s*<\/p>/gi, '</p>').trim();

  const articleData = [
    '---',
    `title: ${yaml(detail.title)}`,
    `description: ${yaml(makeDescription(detail.body, detail.title))}`,
    `publishedAt: ${dateIso(detail.publishedAt)}`,
    `author: ${yaml(detail.author)}`,
    `categories: ${yaml(detail.categories.map((item) => item.title))}`,
    `tags: ${yaml(detail.tags)}`,
    'programs: []',
    ...(cover ? [`cover: ${yaml(cover.relativePath)}`] : []),
    ...(gallerySlug ? [`gallery: ${yaml(gallerySlug)}`] : []),
    `attachments: ${yaml(attachments)}`,
    'related: []',
    'homepage:',
    '  featured: false',
    '  order: 0',
    'status: published',
    '---',
    '',
    body || detail.title,
    ''
  ].join('\n');
  await writeFile(join(articlesDir, `${slug}.md`), articleData, 'utf8');

  if (gallerySlug && galleryPhotos.length) {
    const galleryData = [
      '---',
      `title: ${yaml(`Fotogalerie: ${detail.title}`)}`,
      `description: ${yaml(`Fotografie z článku „${detail.title}“.`)}`,
      `date: ${dateIso(detail.publishedAt)}`,
      `cover: ${yaml(galleryPhotos[0].src)}`,
      'photos:',
      ...galleryPhotos.flatMap((photo) => [`  - src: ${yaml(photo.src)}`, `    alt: ${yaml(photo.alt)}`, `    caption: ${yaml(photo.caption)}`]),
      `article: ${yaml(slug)}`,
      'programs: []',
      `categories: ${yaml(detail.categories.map((item) => item.title))}`,
      `tags: ${yaml(detail.tags)}`,
      'status: published',
      '---',
      '',
      `Fotografie doplňují zprávu „${detail.title}“.`,
      ''
    ].join('\n');
    await writeFile(join(galleriesDir, `${gallerySlug}.md`), galleryData, 'utf8');
  }

  console.log(`[${index}/${total}] ${dateIso(detail.publishedAt)} ${detail.title}${gallerySlug ? ` (${galleryPhotos.length} foto)` : ''}${attachments.length ? ` (${attachments.length} soubor)` : ''}`);
  return { ...detail, slug, gallerySlug, categories: detail.categories.map((item) => item.title), tags: detail.tags };
}

async function main() {
  await mkdir(articlesDir, { recursive: true });
  await mkdir(galleriesDir, { recursive: true });
  const listings = new Map();
  for (let page = 1; page <= 40; page += 1) {
    const url = page === 1 ? SOURCE_LIST : `${SOURCE_LIST}?page=${page}`;
    const rows = parseListing(await fetchText(url));
    for (const row of rows) {
      if (row.date < START_DATE) continue;
      if (row.date <= END_DATE) listings.set(row.url, row);
    }
    if (!rows.length || rows.every((row) => row.date < START_DATE)) break;
    await sleep(80);
  }
  const listingRows = [...listings.values()];
  console.log(`Zdrojový archiv: ${listingRows.length} zpráv v období ${dateIso(START_DATE)} až ${dateIso(END_DATE)}.`);
  if (process.argv.includes('--dry-run')) {
    console.log(listingRows.map((row) => `${dateIso(row.date)} ${row.title} ${row.url}`).join('\n'));
    return;
  }

  const details = [];
  for (let start = 0; start < listingRows.length; start += 6) {
    const batch = listingRows.slice(start, start + 6);
    const result = await Promise.all(batch.map(async (listing) => {
      try {
        return extractDetail(await fetchText(listing.url), listing);
      } catch (error) {
        throw new Error(`${listing.url}: ${error.message}`, { cause: error });
      }
    }));
    details.push(...result);
    await sleep(100);
  }
  const filteredDetails = details.filter((detail) => detail.publishedAt >= START_DATE && detail.publishedAt <= END_DATE);
  if (filteredDetails.length !== listingRows.length) console.warn(`Pozor: detail článku potvrdil ${filteredDetails.length} zpráv, archiv uváděl ${listingRows.length}.`);

  if (!INCREMENTAL) {
    const existingArticles = (await readdir(articlesDir)).filter((file) => file.endsWith('.md'));
    const sourceSlugs = new Set(filteredDetails.map((detail) => safeSlug(new URL(detail.url).pathname.split('/').filter(Boolean).pop())));
    for (const file of existingArticles) {
      if (TEST_ARTICLE_FILES.has(file) && !sourceSlugs.has(file.replace(/\.md$/, ''))) await rm(join(articlesDir, file));
    }
    const existingGalleries = (await readdir(galleriesDir)).filter((file) => file.endsWith('.md'));
    for (const file of existingGalleries) if (TEST_GALLERY_FILES.has(file)) await rm(join(galleriesDir, file));
    for (const file of MIGRATION_ARTIFACT_CATEGORY_FILES) {
      try { await rm(join(categoriesDir, file)); } catch { /* already clean */ }
    }
  }

  const migrated = [];
  for (let start = 0; start < filteredDetails.length; start += 3) {
    const batch = filteredDetails.slice(start, start + 3);
    const result = await Promise.all(batch.map((detail, offset) => migrateArticle(detail, start + offset + 1, filteredDetails.length)));
    migrated.push(...result);
    await sleep(100);
  }

  const existingCategories = await loadExistingTitles(categoriesDir);
  const categories = new Map();
  for (const detail of migrated) for (const category of detail.categories) categories.set(category, detail.categories.find((item) => item === category));
  for (const category of categories.keys()) {
    if (existingCategories.has(category)) continue;
    const slug = safeSlug(category);
    const content = ['---', `title: ${yaml(category)}`, `description: ${yaml(`Zprávy zařazené do rubriky ${category}.`)}`, 'status: published', '---', '', `Aktuality z rubriky ${category}.`, ''].join('\n');
    await writeFile(join(categoriesDir, `${slug}.md`), content, 'utf8');
  }

  const expected = new Set(listingRows.map((row) => safeSlug(new URL(row.url).pathname.split('/').filter(Boolean).pop())));
  const actual = new Set((await readdir(articlesDir)).filter((file) => file.endsWith('.md')).map((file) => file.replace(/\.md$/, '')));
  const missing = [...expected].filter((slug) => !actual.has(slug));
  if (missing.length) throw new Error(`Chybějící importované články: ${missing.join(', ')}`);
  console.log(`Migrace dokončena: ${migrated.length} článků, ${migrated.filter((item) => item.gallerySlug).length} galerií.`);
}

main().catch((error) => { console.error(error.stack || error.message || error); process.exit(1); });
