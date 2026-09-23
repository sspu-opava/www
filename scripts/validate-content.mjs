import { readFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import matter from 'gray-matter';
import { parse as parseYaml } from 'yaml';
import { walkFiles } from './lib/html.mjs';
import { validateRecords } from './lib/content-validation.mjs';
import { report } from './lib/report.mjs';
const records = {}, issues = [];
for (const directory of await readdir('src/content', { withFileTypes: true })) {
  if (!directory.isDirectory()) continue;
  records[directory.name] = [];
  for (const path of (await walkFiles(join('src/content', directory.name))).filter(file => file.endsWith('.md'))) {
    try {
      const { data, content: body } = matter(await readFile(path, 'utf8'), { engines: { yaml: parseYaml } });
      records[directory.name].push({ id: basename(path, '.md'), path: path.replaceAll('\\', '/'), data, body });
    } catch (error) { issues.push({ level: 'error', file: path, message: 'Nelze přečíst YAML: ' + error.message }); }
  }
}
const alerts = JSON.parse(await readFile('src/data/homepage-alerts.json', 'utf8')).alerts;
issues.push(...validateRecords(records, alerts));
await report('content', 'Redakční kontrola obsahu', issues, Object.fromEntries(Object.entries(records).map(([name, items]) => [name, items.length])));
