import { readFile, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { htmlInventory } from './lib/html.mjs';
import { resolveInternalLink } from './lib/links.mjs';
import { withBasePath } from '../src/lib/urls.mjs';
import { report } from './lib/report.mjs';
const dist = resolve('dist');
let configuration;
try { configuration = JSON.parse(await readFile(join(dist, 'build-meta.json'), 'utf8')); }
catch { throw new Error('Chybí dist/build-meta.json. Spusťte npm run build.'); }
const inventory = await htmlInventory(dist);
const pages = new Map(inventory.map(page => [page.file, page]));
const archive = JSON.parse(await readFile('src/data/external-content.json', 'utf8'));
const remote = new Set();
const issues = [], tested = new Map();
const add = (file, message) => issues.push({ level: 'error', file: relative(dist, file).replaceAll('\\', '/'), message });
async function check(value, page) {
  if (/^https?:/i.test(value)) {
    const url = new URL(value);
    if (url.origin === archive.origin && (archive.pathPrefixes.some(prefix => url.pathname.startsWith(prefix)) || archive.pages.some(path => path.replace(/\/$/, '') === url.pathname.replace(/\/$/, '')))) { remote.add(value); return; }
  }
  const resolved = resolveInternalLink(value, withBasePath(page.path, configuration.base), { ...configuration, dist });
  if (resolved.skip) return;
  if (resolved.error) { add(page.file, value + ': ' + resolved.error); return; }
  let target = resolved.file;
  if (!tested.has(target)) tested.set(target, (async () => {
    try { const info = await stat(target); return info.isDirectory() ? join(target, 'index.html') : target; } catch { return undefined; }
  })());
  target = await tested.get(target);
  if (!target) { add(page.file, 'Chybí soubor nebo stránka: ' + value); return; }
  try { await stat(target); } catch { add(page.file, 'Chybí stránka: ' + value); return; }
  if (resolved.hash && target.endsWith('.html') && !pages.get(target)?.ids.has(resolved.hash)) add(page.file, 'Neexistující kotva: ' + value);
}
for (const page of inventory) {
  if (page.path.startsWith('/admin/')) continue;
  if (!page.language) add(page.file, 'Chybí jazyk dokumentu.');
  if (page.main !== 1) add(page.file, 'Stránka musí mít právě jeden main.');
  if (page.h1 !== 1) add(page.file, 'Stránka musí mít právě jeden H1 (nalezeno ' + page.h1 + ').');
  if (!page.title || !page.meta.description || !page.canonical) add(page.file, 'Chybí title, description nebo canonical.');
  for (const id of page.duplicates) add(page.file, 'Duplicitní HTML id: ' + id);
  for (const message of page.issues) add(page.file, message);
  for (const link of page.links) await check(link.value, page);
}
const root = inventory.find(page => page.path === '/');
for (const item of JSON.parse(await readFile(join(dist, 'obsah.json'), 'utf8')).content) await check(item.url, root);
for (const name of ['sitemap-0.xml', 'rss.xml']) {
  const text = await readFile(join(dist, name), 'utf8');
  for (const match of text.matchAll(/<(?:loc|link)>([^<]+)<\/(?:loc|link)>/g)) await check(match[1].replaceAll('&amp;', '&'), root);
}
if (remote.size) issues.push({ level: 'warning', message: remote.size + ' odkazů využívá deklarovaný externí školní archiv. Jeho soubory nejsou v buildu; před převzetím původní domény je nutná migrace. Viz src/data/external-content.json.' });
await report('links', 'Interní odkazy, soubory a základní přístupnost HTML', issues, { 'HTML stránek': inventory.length, 'Jedinečných místních cílů': tested.size, 'Rozsah': 'href, src, srcset, poster, relativní URL, kotvy, metadata, sitemap, RSS a obsah.json; externí servery se nekontrolují' });
