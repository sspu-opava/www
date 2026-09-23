import { isCivilDate, civilToday, isPublished, eventDateTime } from '../../src/lib/publication.mjs';
import { routeFor } from '../../src/lib/urls.mjs';
export const referenceId = value => typeof value === 'string' ? value.replace(/\.md$/i, '') : value;
const dateString = value => value instanceof Date ? value.toISOString().slice(0, 10) : String(value || '').slice(0, 10);
const placeholder = value => /^(doplnit|doplněte|todo|placeholder|image\d*|img[_-]?\d+|dsc[_-]?\d+)/i.test(String(value || '').trim());
export function validateRecords(records, alerts = [], now = new Date()) {
  const issues = [], incoming = new Map(), urls = new Map();
  const today = civilToday(now);
  const add = (level, record, message) => issues.push({ level, file: record?.path, message });
  const lookup = (collection, value) => (records[collection] || []).find(record => record.id === referenceId(value) || record.data.slug === referenceId(value));
  const personName = value => String(value || '').replace(/,\s*(?:Ph\.D\.|M\.A\.)$/i, '').trim();
  for (const [collection, items] of Object.entries(records)) {
    const ids = new Set(), titles = new Set();
    for (const record of items) {
      const d = record.data, visible = isPublished(collection, d, now), severity = visible ? 'error' : 'warning';
      const title = String(d.title || d.name || '').trim();
      if (!title) add('error', record, 'Chybí název nebo jméno.');
      if (title.length > 100) add('warning', record, 'Titulek má ' + title.length + ' znaků; zvažte zkrácení.');
      if (titles.has(title)) add('warning', record, 'Stejný název má více záznamů v kolekci.');
      titles.add(title);
      const slug = d.slug || record.id;
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) add('error', record, 'Neplatný URL identifikátor „' + slug + '“.');
      if (ids.has(slug)) add('error', record, 'Duplicitní slug „' + slug + '“.');
      ids.add(slug);
      const status = collection === 'projects' ? d.publicationStatus ?? 'published' : collection === 'job-offers' ? undefined : d.status;
      if (status !== undefined && !['published', 'draft'].includes(status)) add('error', record, 'Stav publikace musí být published nebo draft.');
      if (status === undefined && !['job-offers', 'projects'].includes(collection)) add('error', record, 'Chybí stav publikace.');
      if (collection === 'projects' && !['active', 'completed', 'archived'].includes(d.status)) add('error', record, 'Neplatný stav projektu.');
      if (collection === 'job-offers' && !['active', 'needs-review', 'closed', 'archived'].includes(d.status)) add('error', record, 'Neplatný stav nabídky.');
      if (!['categories', 'job-offers'].includes(collection)) {
        const url = routeFor(collection, slug);
        if (urls.has(url)) add('error', record, 'Duplicitní veřejná URL ' + url + '.');
        urls.set(url, record);
      }
      const description = d.description || d.excerpt || d.summary || (collection === 'people' ? d.profile || d.position || d.role : '');
      if (!String(description || '').trim() && !['categories', 'job-offers'].includes(collection)) add(severity, record, 'Chybí stručný popis pro web a vyhledávání.');
      if (placeholder(description)) add(severity, record, 'Popis obsahuje nedoplněný pomocný text.');
      if (d.contentBlocks?.length && record.body?.trim()) add('info', record, 'Obsahové bloky mají přednost před Markdownem. Hlavní text se nyní nezobrazuje.');
      const ref = (field, values, target, legacy = false) => {
        for (const value of Array.isArray(values) ? values : values ? [values] : []) {
          const found = lookup(target, value) || (legacy ? (records[target] || []).find(r => r.data.title === value || personName(r.data.name) === personName(value)) : undefined);
          if (!found) { add('error', record, field + ': neexistující vazba „' + value + '“ v ' + target + '.'); continue; }
          incoming.set(found.path, (incoming.get(found.path) || 0) + 1);
          if (visible && !isPublished(target, found.data, now)) add('warning', record, field + ': cílový záznam „' + value + '“ zatím není veřejný.');
        }
      };
      ref('programs', d.programs, 'programs');
      ref('studyFields', d.studyFields, 'programs');
      ref('categories', d.categories, 'categories', true);
      ref('category', d.category, 'categories', true);
      ref('relatedPeople', d.relatedPeople, 'people');
      ref('pages', d.pages, 'pages');
      ref('related', d.related, 'articles');
      if (collection === 'articles' && d.author && d.author !== 'Redakce školy') ref('author', d.author, 'people', true);
      if (['articles', 'events'].includes(collection)) ref('gallery', d.gallery, 'galleries');
      if (['galleries', 'events'].includes(collection)) ref('article', d.article, 'articles');
      if (collection === 'documents' && !d.category) add(severity, record, 'Dokument musí být zařazen do kategorie.');
      const photos = collection === 'galleries' ? d.photos : collection === 'projects' ? d.gallery : [];
      if (collection === 'galleries' && !photos?.length) add(severity, record, 'Galerie nemá fotografie.');
      for (const [i, photo] of (photos || []).entries()) {
        if (!photo.src) add(severity, record, 'Fotografie ' + (i + 1) + ': chybí soubor.');
        if (!photo.alt?.trim() || placeholder(photo.alt)) add(severity, record, 'Fotografie ' + (i + 1) + ': doplňte smysluplný ALT.');
      }
      if (collection === 'articles' && d.cover && !d.coverAlt) add('info', record, 'Titulní obrázek používá jako ALT titulek; při informačním obrázku doplňte coverAlt.');
      const blocks = d.contentBlocks || d.blocks || [];
      for (const [i, block] of blocks.entries()) {
        const path = 'Blok ' + (i + 1);
        if (block.type === 'gallery') ref(path, block.gallery, 'galleries');
        for (const target of ['articles', 'people', 'documents']) if (block.type === target) ref(path, block[target], target);
        if (block.type === 'image' && (!block.alt?.trim() || placeholder(block.alt))) add(severity, record, path + ': doplňte ALT obrázku.');
        if (['twoColumns', 'threeColumns', 'columns'].includes(block.type)) {
          const count = block.items?.length || 0, min = block.type === 'threeColumns' ? 3 : 2, max = block.type === 'twoColumns' ? 2 : block.type === 'threeColumns' ? 3 : 4;
          if (count < min || count > max) add(severity, record, path + ': nesprávný počet sloupců (' + count + ').');
        }
        if (block.type === 'table') for (const row of block.rows || []) if ((Array.isArray(row) ? row : row.cells || []).length !== block.headers?.length) add(severity, record, path + ': řádek tabulky má jiný počet buněk než záhlaví.');
        if (block.type === 'richText' && !block.text?.trim()) add(severity, record, path + ': prázdný formátovaný text.');
      }
      for (const field of ['publishedAt', 'updatedAt', 'date', 'validUntil', 'expiresAt']) {
        if (d[field] && !isCivilDate(dateString(d[field]))) add('error', record, field + ': neplatné datum.');
      }
      if (collection === 'events') {
        for (const field of ['startDate', 'endDate']) if ((field === 'startDate' || d[field]) && !isCivilDate(d[field])) add('error', record, field + ': datum musí skutečně existovat (RRRR-MM-DD).');
        const end = d.endDate || d.startDate;
        if (end < d.startDate || (end === d.startDate && d.startTime && d.endTime && d.endTime <= d.startTime)) add('error', record, 'Konec události musí následovat po začátku.');
        for (const [date, time] of [[d.startDate, d.startTime], [end, d.endTime]]) if (time) { try { eventDateTime(date, time); } catch (error) { add('error', record, error.message); } }
        if (end < today) add('warning', record, 'Událost už proběhla (' + end + '); zůstává v archivu.');
      }
      for (const field of ['validUntil', 'expiresAt']) if (d[field] && dateString(d[field]) < today) add('warning', record, 'Platnost skončila ' + dateString(d[field]) + '; ověřte aktuálnost a případně archivujte.');
      if (d.needsReview || d.status === 'needs-review') add('warning', record, 'Záznam je označen ke kontrole aktuálnosti.');
      if (collection === 'articles' && d.status === 'published' && !visible) add('info', record, 'Naplánováno na ' + dateString(d.publishedAt) + '. Zveřejní se při nejbližším úspěšném buildu.');
      const text = blocks.length ? blocks.filter(b => b.type === 'richText').map(b => b.text).join('\n') : record.body || '';
      if (/!\[\s*\]\(/.test(text)) add(severity, record, 'Markdown obsahuje obrázek bez ALT textu.');
    }
  }
  const alertIds = new Set();
  for (const alert of alerts) {
    const record = { path: 'src/data/homepage-alerts.json' };
    if (alertIds.has(alert.id) || !alert.id) add('error', record, 'Upozornění musí mít jedinečný identifikátor.');
    alertIds.add(alert.id);
    const article = lookup('articles', alert.articleId);
    if (!article) add('error', record, 'Upozornění „' + alert.label + '“ odkazuje na neexistující článek.');
    if (alert.expiresAt && !isCivilDate(alert.expiresAt)) add('error', record, 'Upozornění má neplatné datum konce.');
    if (alert.enabled && alert.expiresAt && alert.expiresAt < today) add('warning', record, 'Upozornění „' + alert.label + '“ vypršelo a nezobrazuje se.');
    if (alert.enabled && article && !isPublished('articles', article.data, now)) add('warning', record, 'Upozornění čeká na zveřejnění článku.');
    if (![4, 6, 8].includes(alert.desktopColumns) || !['text', 'banner'].includes(alert.variant) || !['night', 'brand', 'mist', 'accent'].includes(alert.tone)) add('error', record, 'Upozornění má neplatný vzhled.');
  }
  for (const collection of ['galleries', 'documents', 'people', 'categories']) for (const record of records[collection] || []) {
    if (!incoming.has(record.path)) add('info', record, 'Bez příchozí vazby z jiného záznamu; dostupnost v přehledu tím není dotčena. Zvažte související obsah.');
  }
  return issues;
}
