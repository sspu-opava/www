import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseDocument, parse as parseYaml } from 'yaml';
import matter from 'gray-matter';
import { walkFiles } from './lib/html.mjs';
import { report } from './lib/report.mjs';
const document = parseDocument(await readFile('.pages.yml', 'utf8'));
const issues = document.errors.map(error => ({ level: 'error', file: '.pages.yml', message: error.message }));
const config = document.toJS();
const content = config?.content || [], media = config?.media || [], components = config?.components || {};
const fail = message => issues.push({ level: 'error', file: '.pages.yml', message });
const names = new Set(), mediaNames = new Set();
const schema = await readFile('src/content/config.ts', 'utf8');
for (const item of content) {
  if (!item.name || !item.path || !['collection', 'file'].includes(item.type)) fail('Položka content musí mít name, path a platný type.');
  if (names.has(item.name)) fail('Duplicitní kolekce ' + item.name);
  names.add(item.name);
  try { await access(resolve(item.path)); } catch { fail('Neexistuje cesta ' + item.path); }
  if (item.media_folder || item.public_folder) fail(item.name + ': media_folder/public_folder patří Decap CMS, použijte options.media.');
}
for (const expected of ['web-pages', 'articles', 'programs', 'galleries', 'documents', 'projects', 'events', 'people', 'jobOffers', 'categories', 'homepage-alerts']) if (!names.has(expected)) fail('Chybí kolekce ' + expected);
for (const source of media) {
  if (!source.name || !source.input || !source.output?.startsWith('/')) fail('Neplatný zdroj médií.');
  if (mediaNames.has(source.name)) fail('Duplicitní zdroj médií ' + source.name);
  mediaNames.add(source.name);
  try { await access(resolve(source.input)); } catch { fail('Neexistuje složka médií ' + source.input); }
}
function expand(field, seen = []) {
  if (!field.component) return field;
  if (!components[field.component]) { fail('Neznámá komponenta ' + field.component); return field; }
  if (seen.includes(field.component)) { fail('Cyklická komponenta ' + field.component); return field; }
  return { ...expand(components[field.component], [...seen, field.component]), ...field, component: undefined };
}
function checkFields(fields, context, top = false) {
  const siblings = new Set();
  for (const raw of fields || []) {
    if (siblings.has(raw.name)) fail(context + ': duplicitní pole ' + raw.name);
    siblings.add(raw.name);
    const field = expand(raw), at = context + '.' + (field.name || '');
    if (top && field.name !== 'body' && !new RegExp('\\b' + field.name + '\\s*[:,}]').test(schema)) fail(at + ': pole není v datovém modelu Astro.');
    if (field.type === 'reference') {
      if (!names.has(field.options?.collection)) fail(at + ': neexistující cílová kolekce.');
      if (!['{name}', '{primary}', '{fields.name}', '{fields.title}'].includes(field.options?.value)) fail(at + ': neověřený formát reference.');
      if (!field.options?.label?.startsWith('{fields.')) fail(at + ': popisek musí používat jednoznačný token fields.');
    }
    if (field.type === 'select') {
      if (field.options?.labels || field.options?.default !== undefined) fail(at + ': neplatná konfigurace select.');
      const values = (field.options?.values || []).map(value => typeof value === 'object' ? value.name : value);
      if (field.default !== undefined && !values.includes(field.default)) fail(at + ': výchozí hodnota není ve výběru.');
    }
    if (field.options?.media && !mediaNames.has(field.options.media)) fail(at + ': neexistující zdroj médií.');
    if (field.type === 'rich-text' && field.options?.format !== 'markdown') fail(at + ': editor musí ukládat Markdown.');
    if (typeof field.list === 'object' && field.list.min > field.list.max) fail(at + ': neplatné meze seznamu.');
    if (field.fields) checkFields(field.fields, at);
    for (const block of field.blocks || []) checkFields(block.fields, at + '.' + block.name);
  }
}
for (const item of content) checkFields(item.fields, item.name, item.type === 'collection');
const legacy = {
  people: { position: 'role', workplace: 'department' }
};
function checkData(fields, data, context, collection) {
  for (const raw of fields || []) {
    const field = expand(raw), at = context + '.' + field.name;
    let value = data?.[field.name];
    if (value == null && legacy[collection]?.[field.name]) value = data?.[legacy[collection][field.name]];
    if (collection === 'people' && field.name === 'workplace' && data?.groups?.length) value ||= data.groups.join(', ');
    if (value == null || value === '') {
      if (field.required && field.default === undefined && field.name !== 'body') issues.push({ level: 'error', file: context, message: field.label + ': povinné pole formuláře chybí v aktuálních datech.' });
      continue;
    }
    if (field.type === 'object' && !field.list && typeof value === 'object') checkData(field.fields, value, at, collection);
    if (field.type === 'object' && field.list && Array.isArray(value)) value.forEach((item, i) => { if (!Array.isArray(item)) checkData(field.fields, item, at + '[' + i + ']', collection); });
    if (field.type === 'block' && Array.isArray(value)) for (const [i, item] of value.entries()) {
      const block = field.blocks.find(block => block.name === item[field.blockKey || '_block']);
      if (!block) issues.push({ level: 'error', file: context, message: 'CMS neumí upravit blok ' + item.type });
      else checkData(block.fields, item, at + '[' + i + ']', collection);
    }
    if (field.type === 'select') {
      const allowed = (field.options?.values || []).map(option => typeof option === 'object' ? option.name : option);
      for (const item of Array.isArray(value) ? value : [value]) if (!allowed.includes(item)) issues.push({ level: 'error', file: context, message: field.label + ': hodnota „' + item + '“ není ve formuláři dostupná.' });
    }
  }
}
let records = 0;
for (const item of content) {
  if (item.type === 'file') { checkData(item.fields, JSON.parse(await readFile(item.path, 'utf8')), item.path, item.name); continue; }
  for (const file of (await walkFiles(item.path)).filter(file => file.endsWith('.md'))) {
    const { data } = matter(await readFile(file, 'utf8'), { engines: { yaml: parseYaml } });
    checkData(item.fields, data, file, item.name);
    records++;
  }
}
for (const action of [...(config.actions || []), ...media.flatMap(source => source.actions || [])]) {
  try {
    const workflow = parseYaml(await readFile('.github/workflows/' + action.workflow, 'utf8'));
    if (!workflow.on?.workflow_dispatch) fail('Akce ' + action.name + ': workflow nemá workflow_dispatch.');
  } catch (error) { fail('Akce ' + action.name + ': ' + error.message); }
}
await report('pages-cms', 'Pages CMS a aktuální obsah', issues, { Kolekce: content.length, Záznamy: records, 'Zdroje médií': media.length, Komponenty: Object.keys(components).length });
