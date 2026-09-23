export function normalized(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('cs-CZ');
}
export function plainText(value = '') {
  return value.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]*>/g, ' ').replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[`#>*_~]/g, ' ').replace(/\s+/g, ' ').trim();
}
export function fallbackSearch(items, query, filters = {}) {
  const words = normalized(query).split(/\s+/).filter(Boolean);
  return items.filter(item => Object.entries(filters).every(([key, value]) => !value || item.filters?.[key]?.includes(value)))
    .map(item => {
      const title = normalized(item.title), description = normalized(item.description || '');
      const haystack = normalized([item.title, item.description, item.text, item.metadata].filter(Boolean).join(' '));
      return { item, matches: words.every(word => haystack.includes(word)), score: words.reduce((score, word) => score + (title.includes(word) ? 10 : 0) + (description.includes(word) ? 3 : 0), 0) };
    }).filter(result => result.matches).sort((a, b) => b.score - a.score).map(({ item }) => item);
}
