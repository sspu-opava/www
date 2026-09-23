import test from 'node:test';
import assert from 'node:assert/strict';
import { publicationDue, isPublished, isCivilDate, civilToday, eventDateTime } from '../src/lib/publication.mjs';
import { routeFor, withBasePath, canonicalPath, safeJson } from '../src/lib/urls.mjs';
import { validateRecords } from '../scripts/lib/content-validation.mjs';
import { fallbackSearch, plainText } from '../src/lib/search.mjs';
import { renderMarkdown } from '../src/lib/markdown.mjs';
const record = (id, data, body = '') => ({ id, path: id + '.md', data, body });
test('publication follows Prague midnight and never publishes a draft', () => {
  const before = new Date('2026-09-07T21:59:00Z'), after = new Date('2026-09-07T22:00:00Z');
  assert.equal(civilToday(after), '2026-09-08');
  assert.equal(publicationDue('2026-09-08', before), false);
  assert.equal(publicationDue(new Date('2026-09-08T00:00:00Z'), after), true);
  assert.equal(isPublished('articles', { status: 'draft', publishedAt: '2020-01-01' }, after), false);
  assert.equal(isPublished('jobOffers', { visible: false }, after), false);
});
test('civil dates and daylight-saving transitions are real dates and instants', () => {
  assert.equal(isCivilDate('2026-02-29'), false);
  assert.equal(isCivilDate('2024-02-29'), true);
  assert.equal(eventDateTime('2026-03-29', '01:30'), '2026-03-29T01:30:00+01:00');
  assert.equal(eventDateTime('2026-03-29', '03:30'), '2026-03-29T03:30:00+02:00');
  assert.throws(() => eventDateTime('2026-03-29', '02:30'), /neexistuje/);
});
test('CMS references resolve to real entity pages and base is idempotent', () => {
  assert.equal(routeFor('people', 'jan-novak.md'), '/kontakt/jan-novak/');
  assert.equal(routeFor('documents', 'rad.md'), '/dokumenty/rad/');
  assert.equal(routeFor('pages', 'dokumenty-rozvrhy.md'), '/cs/dokumenty/rozvrhy/');
  assert.equal(canonicalPath('/lide-a-kontakty/'), '/kontakt/');
  assert.equal(withBasePath(withBasePath('/uploads/a.pdf', '/web1'), '/web1'), '/web1/uploads/a.pdf');
  assert.equal(withBasePath('//example.org/a', '/web1'), '//example.org/a');
  assert.equal(withBasePath('#sekce', '/web1'), '#sekce');
});
test('validator detects missing references, duplicate slugs, placeholders and invalid dates', () => {
  const issues = validateRecords({
    pages: [record('a', { title: 'A', description: 'Popis', status: 'published', contentBlocks: [{ type: 'gallery', gallery: 'missing.md' }] }), record('b', { slug: 'a', title: 'B', description: 'Popis', status: 'published' })],
    galleries: [record('g', { title: 'G', description: 'Galerie', status: 'published', date: '2026-02-31', photos: [{ src: '/a.webp', alt: 'Doplnit ALT' }] })]
  });
  for (const message of ['neexistující vazba', 'Duplicitní slug', 'smysluplný ALT', 'neplatné datum']) assert.ok(issues.some(issue => issue.level === 'error' && issue.message.includes(message)), message);
});
test('validator accepts filename references and historical category/author labels', () => {
  const records = {
    articles: [record('clanek', { title: 'Článek', description: 'Perex', author: 'Jan Novák', categories: ['Rubrika'], programs: ['it.md'], status: 'published' })],
    people: [record('jan', { name: 'Jan Novák', role: 'Učitel', status: 'published' })],
    categories: [record('rubrika', { title: 'Rubrika', status: 'published' })],
    programs: [record('it', { title: 'IT', description: 'Obor', status: 'published' })]
  };
  assert.equal(validateRecords(records).filter(issue => issue.level === 'error').length, 0);
});
test('search normalizes Czech diacritics, combines filters and ranks titles first', () => {
  const items = [
    { title: 'Žáci', text: 'Přijímací řízení', filters: { typ: ['Aktualita'], rok: ['2026'] } },
    { title: 'Přijímací řízení', filters: { typ: ['Stránka'], rok: ['2026'] } }
  ];
  assert.equal(fallbackSearch(items, 'prijimaci rizeni')[0].title, 'Přijímací řízení');
  assert.equal(fallbackSearch(items, 'prijimaci', { typ: 'Aktualita', rok: '2026' }).length, 1);
  assert.equal(fallbackSearch(items, '', { rok: '2025' }).length, 0);
  assert.equal(plainText('[Odkaz](/web/) a **text**'), 'Odkaz a text');
});
test('JSON-LD cannot be terminated by an editor-supplied string', () => {
  const value = { title: '</script><script>alert(1)</script>' };
  assert.ok(!safeJson(value).includes('<'));
  assert.deepEqual(JSON.parse(safeJson(value)), value);
});
test('new rich text renders semantic Markdown with base-aware links', async () => {
  const html = await renderMarkdown('## Oddíl\n\n[Dokument](/uploads/a.pdf)\n\n- První\n- Druhý\n\n<script>alert(1)</script>', '/web1/');
  assert.match(html, /<h2/);
  assert.match(html, /href="\/web1\/uploads\/a.pdf"/);
  assert.match(html, /<ul>/);
  assert.doesNotMatch(html, /<script>/);
});
