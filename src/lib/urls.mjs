/** URL helpers shared by Astro, the build pipeline and regression tests. */
export function normalizeBase(base = '/') {
  return `/${base.replace(/^\/+|\/+$/g, '')}${base === '/' || !base ? '' : '/'}`;
}

export function withBasePath(path, base = '/') {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  const prefix = normalizeBase(base);
  if (prefix === '/' || path === prefix.slice(0, -1) || path.startsWith(prefix)) return path;
  return `${prefix.slice(0, -1)}${path}`;
}

export function withoutBase(path, base = '/') {
  const prefix = normalizeBase(base);
  if (prefix === '/') return path;
  if (path === prefix.slice(0, -1)) return '/';
  return path.startsWith(prefix) ? path.slice(prefix.length - 1) : path;
}

const pageAliases = {
  'historie-a-soucasnost': 'historie-soucasnost',
  'umelecka-rada': 'umelecka-rada', 'studentsky-parlament': 'studentsky-parlament',
  spoluprace: 'spoluprace', 'nabidka-pronajmu': 'nabidka-pronajmu',
  'prijimaci-rizeni-technicke-obory': 'prijimaci-rizeni-technicke-obory',
  'prijimaci-rizeni-umelecke-obory': 'prijimaci-rizeni-umelecke-obory',
  'skolni-poradenske-pracoviste': 'spp', 'pro-studenty-a-rodice': 'pro-studenty',
  rozvrh: 'dokumenty-rozvrhy', 'skolni-rad': 'dokumenty-skolni-rad',
  'skolska-rada': 'skolska-rada', maturity: 'maturity', 'vyukove-materialy': 'vyukove-materialy',
  'vyrocni-zprava-skoly': 'dokumenty-vyrocni-zprava-skoly',
  'inspekcni-zpravy': 'dokumenty-inspekcni-zpravy', 'verejne-zakazky': 'dokumenty-verejne-zakazky',
  rozpocet: 'dokumenty-rozpocet', 'ochrana-osobnich-udaju': 'dokumenty-ochrana-osobnich-udaju',
  'ochrana-oznamovatelu': 'dokumenty-ochrana-oznamovatelu',
  'prohlaseni-o-pristupnosti-webu': 'dokumenty-prohlaseni-o-pristupnosti-webu'
};

export function routeFor(collection, rawId) {
  const id = rawId.replace(/\.md$/i, '');
  if (collection === 'pages' && id.startsWith('dokumenty-')) return `/cs/dokumenty/${id.slice(10)}/`;
  if (collection === 'pages' && id === 'zaci-tridy') return '/zaci-a-tridy/';
  if (collection === 'jobOffers') return `/cs/studium/nabidky-zamestnani/#nabidka-${id}`;
  const routes = { articles: 'aktuality', programs: 'obory', galleries: 'galerie', documents: 'dokumenty', projects: 'cs/projekty', events: 'udalosti', people: 'kontakt', pages: 'skola' };
  if (!routes[collection]) throw new Error(`Kolekce ${collection} nemá detailní trasu.`);
  return `/${routes[collection]}/${id}/`;
}

export const routeAliases = {
  ...Object.fromEntries(Object.entries(pageAliases).map(([alias, id]) => [`/${alias}/`, routeFor('pages', id)])),
  '/skolni-zpravodaj/': '/aktuality/', '/kalendar-akci/': '/udalosti/',
  '/fotogalerie/': '/galerie/', '/studijni-obory/': '/obory/',
  '/projekty/': '/cs/projekty/', '/nabidky-zamestnani/': '/cs/studium/nabidky-zamestnani/',
  '/lide-a-kontakty/': '/kontakt/', '/fotogalerie-umeleckych-oboru/': '/cs/aktuality/fotogalerie-umeleckych-oboru/',
  ...Object.fromEntries(['spp', 'prijimaci-rizeni-technicke-obory', 'prijimaci-rizeni-umelecke-obory'].map(id => [`/cs/studium/${id}/`, routeFor('pages', id)]))
};

export function canonicalPath(path) {
  return routeAliases[path] ?? path;
}

/** Prevent an editor-supplied string from terminating a JSON-LD script. */
export function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
