import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublished } from './publication.mjs';
import { withBasePath } from './urls.mjs';
export { routeFor } from './urls.mjs';

type Name = 'articles' | 'programs' | 'galleries' | 'documents' | 'projects' | 'events' | 'people' | 'pages' | 'jobOffers' | 'categories';
type Entry<T extends Name> = CollectionEntry<T>;

const buildCache = new Map<Name, Promise<unknown>>();

export async function entries<T extends Name>(collection: T): Promise<CollectionEntry<T>[]> {
  // A build sees one content snapshot. Dev deliberately re-reads after CMS edits.
  if (!import.meta.env.PROD) return loadEntries(collection);
  if (!buildCache.has(collection)) buildCache.set(collection, loadEntries(collection));
  return buildCache.get(collection) as Promise<CollectionEntry<T>[]>;
}

async function loadEntries<T extends Name>(collection: T) {
  const collectionEntries = await getCollection(collection);
  const [people, categories] = await Promise.all([
    collection === 'articles' ? getCollection('people') : [],
    ['articles', 'galleries', 'documents'].includes(collection) ? getCollection('categories') : []
  ]);
  const reference = (value: string) => value.replace(/\.md$/i, '');
  const categoryLabel = (value: string) => categories.find(item => item.slug === reference(value))?.data.title ?? value;
  return collectionEntries
    .filter((entry) => isPublished(collection, entry.data))
    .sort((a, b) => {
      const value = (data: { publishedAt?: Date; date?: Date; start?: Date; startDate?: string; startTime?: string }) => {
        if (data.publishedAt || data.date || data.start) return Number(data.publishedAt ?? data.date ?? data.start);
        if (data.startDate) return Number(new Date(`${data.startDate}T${data.startTime ?? '00:00'}:00`));
        return 0;
      };
      return value(b.data as { publishedAt?: Date; date?: Date; start?: Date; startDate?: string; startTime?: string }) - value(a.data as { publishedAt?: Date; date?: Date; start?: Date; startDate?: string; startTime?: string });
    })
    // Legacy Astro content collections retain `.md` in `id`; public relations and URLs use the stable slug.
    .map((entry) => {
      const data = { ...entry.data } as Record<string, any>;
      if (collection === 'articles') data.author = people.find(item => item.slug === reference(data.author))?.data.name ?? data.author;
      if (data.categories) data.categories = data.categories.map(categoryLabel);
      if (data.category) data.category = categoryLabel(data.category);
      if (collection === 'galleries' && !data.cover) data.cover = data.photos[0]?.src ?? '';
      return { ...entry, data, id: (entry as { slug?: string }).slug ?? entry.id };
    }) as CollectionEntry<T>[];
}

export async function byId<T extends Name>(collection: T, id: string) {
  return (await entries(collection)).find((entry) => entry.id === id.replace(/\.md$/i, ''));
}

export function formatDate(date: Date, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) {
  return new Intl.DateTimeFormat('cs-CZ', { timeZone: 'Europe/Prague', ...options }).format(date);
}

export function relatedByProgram<T extends Name>(items: Entry<T>[], programs: string[]) {
  return items.filter((item) => 'programs' in item.data && item.data.programs.some((program) => programs.includes(program)));
}

export function relatedArticles(article: Entry<'articles'>, articles: Entry<'articles'>[], limit = 3) {
  const candidates = articles.filter((item) => item.id !== article.id);
  const explicit = article.data.related
    .map((id) => candidates.find((item) => item.id === id))
    .filter((item): item is Entry<'articles'> => Boolean(item));
  const selected = new Set(explicit.map((item) => item.id));
  const semantic = candidates
    .filter((item) => !selected.has(item.id))
    .map((item) => {
      const sameProgram = item.data.programs.filter((program) => article.data.programs.includes(program)).length;
      const sameCategory = item.data.categories.filter((category) => article.data.categories.includes(category)).length;
      const sameTag = item.data.tags.filter((tag) => article.data.tags.includes(tag)).length;
      return { item, score: sameProgram * 5 + sameCategory * 3 + sameTag * 2 };
    })
    .sort((a, b) => b.score - a.score || Number(b.item.data.publishedAt) - Number(a.item.data.publishedAt))
    .map(({ item }) => item);

  return [...explicit, ...semantic].slice(0, limit);
}

/** Prefixes a repository-relative public URL when Astro runs below a GitHub Pages base path. */
export function withBase(path: string) {
  return withBasePath(path, import.meta.env.BASE_URL);
}
