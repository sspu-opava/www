import { entries, routeFor, withBase } from './content';
import { eventTagLabel } from '../data/eventTags';
import { plainText } from './search.mjs';
const labels = { pages: 'Stránka', articles: 'Aktualita', programs: 'Obor', galleries: 'Galerie', documents: 'Dokument', projects: 'Projekt', events: 'Událost', people: 'Osoba' } as const;
function blockText(value: unknown): string {
  if (Array.isArray(value)) return value.map(blockText).join(' ');
  if (!value || typeof value !== 'object') return '';
  return Object.entries(value).map(([key, item]) => ['title', 'text', 'label', 'description', 'caption', 'alt', 'question', 'answer'].includes(key) && typeof item === 'string' ? item : typeof item === 'object' ? blockText(item) : '').join(' ');
}
export async function searchContent() {
  const programLabels = new Map((await entries('programs')).map(p => [p.id, p.data.title]));
  const collections = Object.keys(labels) as (keyof typeof labels)[];
  const all = await Promise.all(collections.map(async collection => (await entries(collection)).flatMap(item => {
    const data = item.data as Record<string, any>;
    if (data.seo?.noindex || data.seo?.canonical) return [];
    const programs: string[] = (data.studyFields?.length ? data.studyFields : data.programs) || (collection === 'programs' ? [item.id] : []);
    const categories: string[] = data.categories || (data.category ? [data.category] : []);
    const tags: string[] = (data.tags || []).map(eventTagLabel);
    const date = data.updatedAt || data.publishedAt || data.date || data.startDate;
    const year = date ? String(date instanceof Date ? date.getFullYear() : date).slice(0, 4) : '';
    return [{
      type: labels[collection], title: data.title || data.name, url: withBase(routeFor(collection, item.id)),
      description: plainText(data.description || data.excerpt || data.summary || data.profile || data.position || data.role || ''),
      text: plainText(data.contentBlocks?.length ? blockText(data.contentBlocks) : item.body || ''),
      metadata: [data.author, data.workplace, data.department, data.position, data.role, data.code, data.email, data.phone].filter(Boolean).join(' '),
      filters: { typ: [labels[collection]], obor: programs.map(id => programLabels.get(id) || id), rubrika: categories, stitek: tags, rok: year ? [year] : [] },
      updated: date || null
    }];
  })));
  return all.flat();
}
