import { readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { extname, join, parse, relative, sep } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const publicRoot = join(root, 'public');
const maxDimension = 2400;
const quality = 82;
const sourceExtensions = new Set(['.jpg', '.jpeg']);
const textExtensions = new Set([
  '.astro', '.cjs', '.css', '.html', '.js', '.json', '.md', '.mdx', '.mjs',
  '.scss', '.ts', '.tsx', '.txt', '.yml', '.yaml'
]);
const excludedDirectories = new Set(['.astro', '.git', 'dist', 'node_modules', 'public']);

const toPosix = (value) => value.split(sep).join('/');
const toPublicUrl = (file) => `/${toPosix(relative(publicRoot, file))}`;

async function walk(directory, predicate) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) files.push(...await walk(path, predicate));
    } else if (predicate(path, entry.name)) {
      files.push(path);
    }
  }
  return files;
}

const sourceFiles = await walk(
  publicRoot,
  (file) => sourceExtensions.has(extname(file).toLowerCase())
);

if (!sourceFiles.length) {
  console.log('Žádné JPG/JPEG soubory k převodu.');
  process.exit(0);
}

const inputBytes = (await Promise.all(sourceFiles.map(async (file) => (await stat(file)).size)))
  .reduce((sum, value) => sum + value, 0);
const replacements = new Map();
for (const input of sourceFiles) {
  const extension = extname(input);
  const publicPath = toPublicUrl(input);
  const repositoryPath = toPosix(relative(root, input));
  replacements.set(publicPath, `${publicPath.slice(0, -extension.length)}.webp`);
  // Zachyť také případné odkazy zapisované relativně vůči kořeni repozitáře.
  replacements.set(repositoryPath, `${repositoryPath.slice(0, -extension.length)}.webp`);
}

let converted = 0;
for (const input of sourceFiles) {
  const parsed = parse(input);
  const output = join(parsed.dir, `${parsed.name}.webp`);
  await sharp(input)
    .rotate()
    .resize({
      width: maxDimension,
      height: maxDimension,
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality, effort: 5, smartSubsample: true })
    .toFile(output);
  converted += 1;
}

const sourceDirectories = new Set(['src', 'scripts', 'templates', '.github']);
const textFiles = [];
for (const directory of sourceDirectories) {
  const path = join(root, directory);
  try {
    textFiles.push(...await walk(path, (file) => textExtensions.has(extname(file).toLowerCase())));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (entry.isFile() && textExtensions.has(extname(entry.name).toLowerCase())) {
    textFiles.push(join(root, entry.name));
  }
}

let changedFiles = 0;
let changedReferences = 0;
const sortedReplacements = [...replacements.entries()].sort((a, b) => b[0].length - a[0].length);
for (const file of textFiles) {
  const before = await readFile(file, 'utf8');
  let after = before;
  for (const [from, to] of sortedReplacements) {
    const occurrences = after.split(from).length - 1;
    if (occurrences) {
      changedReferences += occurrences;
      after = after.split(from).join(to);
    }
  }
  if (after !== before) {
    await writeFile(file, after, 'utf8');
    changedFiles += 1;
  }
}

for (const input of sourceFiles) await unlink(input);

const outputBytes = (await Promise.all(sourceFiles.map(async (file) => {
  const parsed = parse(file);
  return (await stat(join(parsed.dir, `${parsed.name}.webp`))).size;
}))).reduce((sum, value) => sum + value, 0);

console.log(`Převedeno ${converted} JPG/JPEG souborů na WebP.`);
console.log(`Aktualizováno ${changedReferences} odkazů v ${changedFiles} textových souborech.`);
console.log(`Výstup: ${(outputBytes / 1024 / 1024).toFixed(1)} MiB WebP (původně ${(inputBytes / 1024 / 1024).toFixed(1)} MiB).`);
