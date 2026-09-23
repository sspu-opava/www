import { fallbackSearch } from '../lib/search.mjs';
type SearchItem = { title: string; url: string; type: string; description?: string; text?: string; metadata?: string; filters?: Record<string, string[]>; excerpt?: string };
type PagefindData = { url: string; meta: { title?: string; typ?: string }; filters?: Record<string, string[]>; excerpt?: string };
type Hit = { data: () => Promise<PagefindData> };
type Pagefind = { search: (query: string | null, options: { filters: Record<string, string> }) => Promise<{ results: Hit[] }> };
const form = document.querySelector<HTMLFormElement>('[data-search-form]');
if (form) {
  const input = form.querySelector<HTMLInputElement>('[name=q]')!;
  const selects = [...form.querySelectorAll<HTMLSelectElement>('select')];
  const results = document.querySelector<HTMLElement>('[data-search-results]')!;
  const status = document.querySelector<HTMLElement>('[data-search-status]')!;
  const more = document.querySelector<HTMLButtonElement>('[data-search-more]')!;
  let engine: Promise<Pagefind> | undefined, fallback: Promise<SearchItem[]> | undefined;
  let generation = 0, shown = 0;
  let load: (() => Promise<SearchItem>)[] = [];
  const pageSize = 20;
  const safeUrl = (value: string) => {
    try { const url = new URL(value, location.href); return url.origin === location.origin && ['http:', 'https:'].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
  };
  const append = (item: SearchItem) => {
    const href = safeUrl(item.url);
    if (!href) return;
    const article = document.createElement('article'); article.className = 'card p-6';
    const label = document.createElement('p'); label.className = 'text-xs font-bold uppercase tracking-wide text-brand'; label.textContent = item.type;
    const heading = document.createElement('h2'); heading.className = 'mt-2 text-2xl';
    const link = document.createElement('a'); link.className = 'no-underline hover:text-brand'; link.href = href; link.textContent = item.title; heading.append(link);
    const excerpt = document.createElement('p'); excerpt.className = 'mt-3 leading-7 text-ink/75';
    // Pagefind excerpts contain markup. Parse as inert text, never insert CMS HTML.
    const text = new DOMParser().parseFromString(item.excerpt || item.description || item.text || '', 'text/html').body.textContent || '';
    excerpt.textContent = text.length > 280 ? text.slice(0, 277).trimEnd() + '…' : text;
    article.append(label, heading, excerpt); results.append(article);
  };
  async function showMore(token: number, focusFirst = false) {
    const start = shown; more.disabled = true; results.setAttribute('aria-busy', 'true');
    try {
      const items = await Promise.all(load.slice(start, start + pageSize).map(get => get()));
      if (token !== generation) return;
      items.forEach(append); shown += items.length;
      status.textContent = load.length ? `Nalezeno ${load.length} výsledků, zobrazeno ${shown}.` : 'Nic nenalezeno. Zkuste jiný výraz nebo zrušte některé filtry.';
      more.hidden = shown >= load.length;
      if (focusFirst) results.querySelectorAll<HTMLAnchorElement>('h2 a')[start]?.focus();
    } catch {
      if (token === generation) status.textContent = 'Výsledky se nepodařilo načíst. Zkuste hledat znovu.';
    } finally {
      if (token === generation) { more.disabled = false; results.removeAttribute('aria-busy'); }
    }
  }
  async function search(updateUrl = true) {
    const token = ++generation, query = input.value.trim();
    const filters = Object.fromEntries(selects.filter(select => select.value).map(select => [select.name, select.value]));
    results.replaceChildren(); more.hidden = true; shown = 0; load = [];
    if (updateUrl) {
      const url = new URL(location.href); url.search = '';
      if (query) url.searchParams.set('q', query);
      Object.entries(filters).forEach(([key, value]) => url.searchParams.set(key, value));
      history.replaceState({}, '', url);
    }
    if (!query && !Object.keys(filters).length) { status.textContent = 'Zadejte výraz nebo vyberte filtr.'; results.removeAttribute('aria-busy'); return; }
    status.textContent = 'Hledám…'; results.setAttribute('aria-busy', 'true');
    try {
      const path = `${import.meta.env.BASE_URL}pagefind/pagefind.js`;
      engine ??= import(/* @vite-ignore */ path) as Promise<Pagefind>;
      const response = await (await engine).search(query || null, { filters });
      if (token !== generation) return;
      load = response.results.map(hit => async () => {
        const item = await hit.data();
        return { title: item.meta.title || 'Obsah', url: item.url, type: item.meta.typ || item.filters?.typ?.[0] || 'Stránka', excerpt: item.excerpt };
      });
    } catch {
      try {
        fallback ??= fetch(`${import.meta.env.BASE_URL}obsah.json`).then(async response => { if (!response.ok) throw new Error('Index není dostupný.'); return (await response.json()).content; });
        const items = fallbackSearch(await fallback, query, filters) as SearchItem[];
        if (token !== generation) return;
        load = items.map(item => async () => item);
      } catch {
        engine = undefined; fallback = undefined;
        if (token === generation) { status.textContent = 'Vyhledávání není dostupné. Zkuste to znovu nebo použijte přehledy v navigaci.'; results.removeAttribute('aria-busy'); }
        return;
      }
    }
    await showMore(token);
  }
  const restore = () => {
    const params = new URL(location.href).searchParams;
    input.value = params.get('q') || '';
    selects.forEach(select => { select.value = params.get(select.name) || ''; });
    const panel = form!.querySelector<HTMLDetailsElement>('[data-search-filter-panel]');
    if (panel && selects.some(select => select.value)) panel.open = true;
    void search(false);
  };
  form.addEventListener('submit', event => { event.preventDefault(); void search(); });
  selects.forEach(select => select.addEventListener('change', () => void search()));
  form.querySelector('[data-search-clear]')?.addEventListener('click', () => { selects.forEach(select => { select.value = ''; }); void search(); });
  more.addEventListener('click', () => void showMore(generation, true));
  window.addEventListener('popstate', restore);
  restore();
}
