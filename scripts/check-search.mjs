import { readFile, stat } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { report } from './lib/report.mjs';

const build = JSON.parse(await readFile('dist/build-meta.json', 'utf8'));
const output = resolve('dist');
const origin = 'https://search-check.invalid';
const assets = `${build.base}pagefind/`;
const originalFetch = globalThis.fetch;
const issues = [];
let checked = 0;
// Exercise the generated public Pagefind API with local assets, without a browser
// or network dependency. basePath matches where the deployed module is loaded.
globalThis.fetch = async input => {
  const url = new URL(typeof input === 'string' ? input : input.url || input.href);
  if (url.origin !== origin || !url.pathname.startsWith(assets)) throw new Error('Neočekávaný zdroj indexu: ' + url.href);
  const file = resolve(output, 'pagefind', decodeURIComponent(url.pathname.slice(assets.length)));
  const local = relative(resolve(output, 'pagefind'), file);
  if (local.startsWith('..') || isAbsolute(local)) throw new Error('Zdroj je mimo index.');
  return new Response(await readFile(file));
};
try {
  const pagefind = await import(pathToFileURL(resolve(output, 'pagefind/pagefind.js')).href);
  await pagefind.options({ basePath: origin + assets });
  const result = await pagefind.search(null);
  if (result.results.length !== build.indexed) throw new Error('Počet dohledatelných stránek neodpovídá indexu.');
  for (const hit of result.results) {
    const data = await hit.data();
    const url = new URL(data.url, origin);
    if (url.origin !== origin || !url.pathname.startsWith(build.base)) throw new Error('Výsledek má chybnou základní cestu: ' + url.href);
    const suffix = decodeURIComponent(url.pathname.slice(build.base.length));
    const file = resolve(output, suffix, ...(suffix.endsWith('/') || !suffix ? ['index.html'] : []));
    const local = relative(output, file);
    if (local.startsWith('..') || isAbsolute(local)) throw new Error('Výsledek míří mimo výstup.');
    if (!(await stat(file)).isFile()) throw new Error('Výsledek nemá odpovídající stránku: ' + url.href);
    checked++;
  }
} catch (error) {
  issues.push({ level: 'error', message: 'Kontrola výsledků Pagefind: ' + error.message });
} finally {
  globalThis.fetch = originalFetch;
}
await report('search-runtime', 'Skutečné URL výsledků Pagefind', issues, { 'Ověřené výsledky': checked, 'Základní cesta': build.base });
