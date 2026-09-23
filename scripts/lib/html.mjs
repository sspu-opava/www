import { parse } from 'parse5';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
export async function walkFiles(directory) {
  const result = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) result.push(...await walkFiles(path)); else if (item.isFile()) result.push(path);
  }
  return result;
}
export function inspectHtml(html) {
  const ids = new Set(), duplicates = [], links = [], issues = [], meta = {};
  let title = '', canonical = '', main = 0, h1 = 0, language = '';
  const text = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');
  const visit = node => {
    const attrs = Object.fromEntries((node.attrs || []).map(a => [a.name, a.value]));
    if (attrs.id) { if (ids.has(attrs.id)) duplicates.push(attrs.id); ids.add(attrs.id); }
    if (node.tagName === 'html') language = attrs.lang;
    if (node.tagName === 'main') main++;
    if (node.tagName === 'h1') h1++;
    if (node.tagName === 'title') title = text(node);
    if (node.tagName === 'meta') meta[attrs.name || attrs.property] = attrs.content;
    if (node.tagName === 'link' && attrs.rel === 'canonical') canonical = attrs.href;
    if (node.tagName === 'img' && !Object.hasOwn(attrs, 'alt')) issues.push('Obrázek nemá atribut ALT: ' + attrs.src);
    if (node.tagName === 'iframe' && !attrs.title?.trim()) issues.push('Vložený rám nemá název: ' + attrs.src);
    for (const attr of ['href', 'src', 'poster', 'action']) if (attrs[attr]) links.push({ value: attrs[attr], attribute: attr, tag: node.tagName });
    if (attrs.srcset && !attrs.srcset.startsWith('data:')) for (const candidate of attrs.srcset.split(',')) links.push({ value: candidate.trim().split(/\s+/)[0], attribute: 'srcset', tag: node.tagName });
    for (const child of node.childNodes || []) visit(child);
  };
  visit(parse(html));
  return { ids, duplicates, links, issues, meta, title, canonical, main, h1, language };
}
export async function htmlInventory(dist) {
  const result = [];
  for (const file of (await walkFiles(dist)).filter(path => path.endsWith('.html'))) {
    const html = await readFile(file, 'utf8');
    const path = '/' + relative(dist, file).replaceAll('\\', '/').replace(/index\.html$/, '');
    result.push({ file, path, ...inspectHtml(html) });
  }
  return result;
}
export function htmlText(html = '') {
  const visit = node => ['script', 'style'].includes(node.tagName) ? '' : node.nodeName === '#text' ? node.value : (node.childNodes || []).map(visit).join(' ');
  return visit(parse(html)).replace(/\s+/g, ' ').trim();
}
