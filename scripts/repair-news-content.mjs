import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const articlesDir = join(root, 'src', 'content', 'articles');
const galleriesDir = join(root, 'src', 'content', 'galleries');
const descriptionOverrides = new Map([
  ['skola-doporucena-zamestnavateli-2025-opavska-prumyslovka-opet-nejlepsi-v-kraji', 'SŠPU Opava znovu zvítězila v soutěži Škola doporučená zaměstnavateli a získala už deváté první místo v řadě.'],
  ['prednaska-o-podnikani', 'Přednáška o podnikání přiblížila studentům čtvrtých ročníků principy vlastního podnikání, možnosti financování i nároky spojené s vedením projektu.'],
  ['informace-o-ostrych-zkouskach-fce-a-cae', 'Studenti získali přehled o termínech, přihláškách a organizaci cambridgeských jazykových zkoušek FCE a CAE.'],
  ['londynske-dobrodruzstvi-1', 'Žáci tříd SV4A a IT4 během dobrodružné cesty poznali nejznámější londýnské památky i atraktivní místa britské metropole.'],
  ['vodik-fenomen-budoucnosti', 'Ing. Doležík a Ing. Sonnek se v Dolních Vítkovicích seznámili s vodíkem jako palivem budoucnosti a vyzkoušeli si několik praktických pokusů.'],
  ['nasi-studenti-vynikli-v-soutezi-mathing', 'Týmy našich informatiků a strojařů obsadily v mezinárodní matematické soutěži Mathing skvělé 12. a 64. místo.'],
  ['exkurze-zaku-sv2b-do-spolecnosti-brano-v-hradci-nad-moravici', 'Žáci SV2B při exkurzi v BRANU poznali vývoj a výrobu dílů pro automobilový průmysl i moderní slévárenské technologie.'],
  ['naborovy-den-prezentace-firem-programu-nase-skola-4', 'Na Náborovém dni představili zástupci regionálních strojírenských firem žákům možnosti budoucího zaměstnání i požadavky na odborné znalosti.'],
  ['michal-ondracek-vyhral-okresni-kolo-souteze-v-anglickem-jazyce', 'Žáci naší školy se i letos zúčastnili tradiční soutěže v anglickém jazyce a Michal Ondráček ze třídy SV3A postoupil do okresního kola.'],
  ['nasi-studenti-darovali-krev-od-slov-k-cinum', 'Studenti navázali na besedu k projektu Naše krev, náš kraj návštěvou transfuzního oddělení, kde poprvé darovali krev.'],
  ['vernisaz-tri-umeleckych-oboru-ve-slezskem-divadle-opava', 'Série výstav uměleckých oborů ve Slezském divadle představila Grafický design, Design hraček a nyní završuje prezentaci oborem Průmyslový design.'],
  ['design-hracek-vystavuje-ve-slezskem-divadle', 'Sérii výstav uměleckých oborů SŠPU Opava uzavírá Design hraček, jehož expozice představuje pouliční loutky i dřevěné hračky studentů.'],
  ['adaptacni-kurz-pro-studenty-prvnich-rocniku', 'Adaptační pobyt v Žimrovicích spojil všechny první ročníky prostřednictvím her a aktivit, které podpořily poznání a stmelení kolektivů.'],
  ['naboj-soutez-nabita-matikou', 'Studenti naší školy se opět zúčastnili mezinárodní matematické soutěže Náboj, přestože letošní termín připadl na dobu jarních prázdnin.'],
  ['exkurze-v-tepelne-elektrarne-v-trebovicich', 'Žáci tříd SV4A a SV4B navštívili tepelnou elektrárnu v Třebovicích a seznámili se s výrobou tepla i elektrické energie.'],
  ['phdr-jan-svoboda-u-nas-ve-skole', 'Poslední den školního roku využili zaměstnanci školy k profesnímu rozvoji a absolvovali vzdělávací seminář vedený PhDr. Janem Svobodou.'],
  ['druhe-misto-v-krajskem-kole-olympiady-v-anglickem-jazyce', 'Na konci dubna proběhlo krajské kolo Olympiády v anglickém jazyce a naši školu v něm reprezentovala Adéla Bártíková ze třídy IT2.'],
  ['navsteva-univerzity-tomase-bati-ve-zline', 'Žáci uměleckých oborů se zúčastnili Dne otevřených dveří na Univerzitě Tomáše Bati ve Zlíně, kde poznali studium i tvorbu na fakultě.'],
  ['staze-ve-spanelsku-v-ramci-programu-erasmus', 'V rámci programu Erasmus+ absolvovali naši studenti třítýdenní stáže ve Španělsku, kde získávali pracovní zkušenosti i nové kulturní podněty.'],
  ['exkurze-na-design-blok-2025', 'Studenti uměleckých oborů navštívili Designblok 2025 v Praze a poznávali současné trendy produktového i grafického designu.'],
  ['navsteva-vesmirneho-sferickeho-kina', 'Žáci SV3B a SV1A navštívili sférické kino Unisféra, kde si prostřednictvím působivé projekce rozšířili znalosti o vesmíru.']
]);

const namedEntities = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  hellip: '…',
  ndash: '–',
  mdash: '—',
  laquo: '«',
  raquo: '»',
  bdquo: '„',
  ldquo: '“',
  rdquo: '”',
  lsquo: '‚',
  rsquo: '’'
};

function decodeEntities(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, token) => {
    const normalized = token.toLowerCase();
    if (normalized.startsWith('#x')) return String.fromCodePoint(Number.parseInt(normalized.slice(2), 16));
    if (normalized.startsWith('#')) return String.fromCodePoint(Number.parseInt(normalized.slice(1), 10));
    return namedEntities[normalized] ?? match;
  });
}

function decodeEscapedHtml(value) {
  let result = value
    .replace(/\\u003[cC]/g, '<')
    .replace(/\\u003[eE]/g, '>');

  // Decode only entity-encoded tags, leaving normal text entities intact.
  result = result.replace(/&(?:amp;)?lt;((?:\/?)(?:p|div|span|img|figure|figcaption|h[1-6]|a|strong|em|b|i|br|iframe|audio|source|table|thead|tbody|tr|th|td|ul|ol|li|blockquote)\b[^\n]*?)&(?:amp;)?gt;/gi, '<$1>');
  return result;
}

function stripTags(value) {
  return decodeEntities(value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<h[1-6]\b[^>]*>[\s\S]*?<\/h[1-6]>/gi, ' ')
    .replace(/<img\b[^>]*>/gi, ' ')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<[^>]*>/g, ' '))
    .replace(/[ \t\r\f]+/g, ' ')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}

function protectAbbreviationsAndDates(value) {
  return value
    .replace(/(\d{1,2})\.(?=\s*(?:\d{1,2}|[a-záčďéěíňóřšťúůýž]))/gi, '$1__DOT__')
    .replace(/(\d{1,2})\.\s*-\s*\d{1,2}\./gi, (match) => match.replace(/(\d{1,2})\./, '$1__DOT__'))
    .replace(/\b(?:Ing|Mgr|PhDr|Bc|RNDr|JUDr|MUDr|doc|prof|a|s|r|o|č|tj|tzv|např|apod)\./gi, (match) => match.replace('.', '__DOT__'));
}

function restoreDates(value) {
  return value.replaceAll('__DOT__', '.');
}

function sentences(value) {
  const protectedText = protectAbbreviationsAndDates(value);
  return (protectedText.match(/[^.!?]+(?:[!?]+(?=\s|$)|\.+(?=\s+(?:[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ„“"0-9])|$)|$)/g) ?? [])
    .map((sentence) => restoreDates(sentence).replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function finishSentence(value) {
  const result = value
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/(?:\.\.\.|…)\s*$/g, '')
    .trim();
  return /[.!?]$/.test(result) ? result : `${result}.`;
}

function frontmatterString(source, field) {
  const raw = source.match(new RegExp(`^${field}:\\s*(.*?)\\s*$`, 'm'))?.[1];
  if (!raw) return undefined;
  if (raw.startsWith('"')) {
    try { return JSON.parse(raw); } catch { return raw.slice(1, -1); }
  }
  return raw.replace(/^['"]|['"]$/g, '');
}

function makeDescription(body, title, slug) {
  if (descriptionOverrides.has(slug)) return descriptionOverrides.get(slug);
  const text = stripTags(body);
  if (!text) return `Přečtěte si zprávu ze života školy: ${title}.`;

  const parts = sentences(text).filter((part) => part.length >= 40);
  const first = parts[0] ?? text;
  const second = parts[1];
  if (first.length >= 120 || !second || /^(?:A to|A hned|A také)\b/i.test(second)) return finishSentence(first);

  const secondLower = second.charAt(0).toLocaleLowerCase('cs-CZ') + second.slice(1);
  const joined = `${first.replace(/[.!?]+$/, '')}, přičemž ${secondLower.replace(/[.!?]+$/, '')}.`;
  return joined.length <= 240 ? finishSentence(joined) : finishSentence(first);
}

function splitFrontmatter(source) {
  const match = source.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/);
  if (!match) throw new Error('Článek nemá očekávaný frontmatter.');
  return { header: match[1], body: match[2] };
}

function replaceDescription(header, description) {
  const line = `description: ${JSON.stringify(description)}`;
  if (!/^description:\s*.*$/m.test(header)) throw new Error('Článku chybí description.');
  return header.replace(/^description:\s*.*$/m, line);
}

function repairBody(value) {
  let body = decodeEscapedHtml(value.replace(/\r\n/g, '\n'));
  // Article HTML is presentation markup; leading indentation must not turn it
  // into Markdown's indented code blocks.
  body = body.split('\n').map((line) => line.trimStart()).join('\n');
  // CommonMark does not reliably parse tags whose attributes are split over
  // multiple lines. Keep imported HTML tags on one line so images, links and
  // embeds are rendered as elements rather than visible source code.
  body = body.replace(/<(\/?[A-Za-z][^<>]*?)>/g, (_match, inside) => `<${inside.replace(/\s+/g, ' ').trim()}>`);
  body = body.replace(/<p>\s*(<img\b[^>]*>)\s*<\/p>/gi, '<p>$1</p>');
  body = body.replace(/\n{3,}/g, '\n\n').trim();
  return body;
}

const files = (await readdir(articlesDir)).filter((file) => file.endsWith('.md')).sort();
const lengths = [];
let changed = 0;

for (const file of files) {
  const path = join(articlesDir, file);
  const source = await readFile(path, 'utf8');
  const { header, body } = splitFrontmatter(source);
  const repairedBody = repairBody(body);
  const title = frontmatterString(header, 'title') ?? file.replace(/\.md$/, '');
  const description = makeDescription(repairedBody, title, file.replace(/\.md$/, ''));
  const next = `${replaceDescription(header, description)}\n\n${repairedBody}\n`;
  lengths.push(description.length);
  if (next !== source) {
    await writeFile(path, next, 'utf8');
    changed += 1;
  }
}

console.log(JSON.stringify({ files: files.length, changed, minDescription: Math.min(...lengths), maxDescription: Math.max(...lengths) }, null, 2));

const galleryFiles = (await readdir(galleriesDir)).filter((file) => file.endsWith('.md')).sort();
let galleryPhotos = 0;
let galleryChanges = 0;
for (const file of galleryFiles) {
  const path = join(galleriesDir, file);
  const source = await readFile(path, 'utf8');
  const title = frontmatterString(source, 'title');
  if (!title) throw new Error(`${file}: galerie nemá title.`);
  const galleryName = title.replace(/^Fotogalerie:\s*/i, '').trim();
  const next = source.replace(/^ {4}alt:\s*.*$/gm, () => {
    galleryPhotos += 1;
    return `    alt: ${JSON.stringify(galleryName)}`;
  });
  if (next !== source) {
    await writeFile(path, next, 'utf8');
    galleryChanges += 1;
  }
}
console.log(JSON.stringify({ galleries: galleryFiles.length, galleryPhotos, galleryFilesChanged: galleryChanges }, null, 2));
