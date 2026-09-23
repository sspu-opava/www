import { readFile } from 'node:fs/promises';
const archive = JSON.parse(await readFile('src/data/external-content.json', 'utf8'));
const build = JSON.parse(await readFile('dist/build-meta.json', 'utf8'));
if (new URL(build.site).origin === archive.origin && (archive.pathPrefixes.length || archive.pages.length)) {
  console.error('Publikace na původní doménu je pozastavena: archivní soubory /media/ a /static/ a uvedené starší stránky nejsou v tomto repozitáři. Nejdříve migrujte archiv nebo přesměrujte jeho odkazy na samostatný zachovaný archiv a aktualizujte src/data/external-content.json. GitHub Pages prototyp na jiné doméně tím není omezen.');
  process.exitCode = 1;
} else console.log('Cílová doména nekoliduje s externím školním archivem.');
