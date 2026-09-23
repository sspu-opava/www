import * as pagefind from 'pagefind';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { htmlInventory } from './lib/html.mjs';
import { withBasePath, normalizeBase, canonicalPath } from '../src/lib/urls.mjs';
import { report } from './lib/report.mjs';
const base = normalizeBase(process.env.ASTRO_BASE || '/');
const site = process.env.ASTRO_SITE || 'https://www.sspu-opava.cz';
const pages = await htmlInventory(resolve('dist'));
const included = [], excluded = [], issues = [];
const { index, errors = [] } = await pagefind.createIndex({ forceLanguage: 'cs', writePlayground: false });
if (!index || errors.length) throw new Error(errors.join('\n') || 'Pagefind se nepodařilo spustit.');
try {
  for (const page of pages) {
    const url = new URL(withBasePath(page.path, base), site).href;
    const eligible = !/noindex/i.test(page.meta.robots || '') && !/^\/(admin|vyhledavani)(\/|\.html)/.test(page.path) && canonicalPath(page.path) === page.path && (!page.canonical || page.canonical === url);
    if (!eligible) { excluded.push(page.path); continue; }
    // Pagefind adds its runtime base URL when resolving result paths.
    const result = await index.addHTMLFile({ url: page.path, content: await readFile(page.file, 'utf8') });
    issues.push(...(result.errors || []).map(message => ({ level: 'error', file: page.file, message })));
    included.push(url);
  }
  const written = await index.writeFiles({ outputPath: 'dist/pagefind' });
  issues.push(...(written.errors || []).map(message => ({ level: 'error', message })));
} finally { await pagefind.close(); }
// Sitemap and search share exactly the same canonical, public-page selection.
const allowed = new Set(included);
for (const filename of ['sitemap-0.xml']) {
  const path = resolve('dist', filename);
  const xml = await readFile(path, 'utf8');
  const filtered = xml.replace(/<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g, (match, url) => allowed.has(url.replaceAll('&amp;', '&')) ? match : '');
  await writeFile(path, filtered);
}
await writeFile('dist/build-meta.json', JSON.stringify({ base, site, indexed: included.length, excluded, generatedAt: new Date().toISOString() }));
await report('search', 'Vyhledávání a sitemap', issues, { 'Indexované kanonické stránky': included.length, 'Vyloučené aliasy a neveřejné stránky': excluded.length });
