export type ArticleFallbackVisual = {
  label: string;
  primary: string;
  secondary: string;
};

const programColors: Record<string, string> = {
  strojirenstvi: '#1A4053',
  'informacni-technologie': '#59BDDC',
  'design-hracek': '#ECAFAC',
  'prumyslovy-design': '#D0D543',
  'graficky-design': '#C42079'
};

const programTextColors: Record<string, string> = {
  strojirenstvi: '#FFFFFF',
  'informacni-technologie': '#08243A',
  'design-hracek': '#08243A',
  'prumyslovy-design': '#08243A',
  'graficky-design': '#FFFFFF'
};

const categoryFallbacks: Record<string, ArticleFallbackVisual> = {
  úspěchy: { label: 'Úspěchy', primary: '#C42079', secondary: '#ECAFAC' },
  studium: { label: 'Studium', primary: '#59BDDC', secondary: '#1A4053' },
  akce: { label: 'Akce', primary: '#ECAFAC', secondary: '#C42079' },
  škola: { label: 'Škola', primary: '#1A4053', secondary: '#59BDDC' },
  projekty: { label: 'Projekty', primary: '#D0D543', secondary: '#1A4053' },
  'důležité informace': { label: 'Důležité informace', primary: '#08243A', secondary: '#C42079' },
  'vnitřní předpisy': { label: 'Vnitřní předpisy', primary: '#1A4053', secondary: '#6B7280' },
  'přijímací řízení': { label: 'Přijímací řízení', primary: '#D0D543', secondary: '#59BDDC' }
};

export function getArticleHeroColor(programs: string[]) {
  return programs.map((program) => programColors[program]).find(Boolean) ?? '#6B7280';
}

export function getProgramColor(programs: string[]) {
  return programs.map((program) => programColors[program]).find(Boolean) ?? '#6B7280';
}

export function getProgramTextColor(programs: string[]) {
  return programs.map((program) => programTextColors[program]).find(Boolean) ?? '#FFFFFF';
}

export function getArticleFallback(categories: string[]): ArticleFallbackVisual {
  const category = categories[0] ?? 'Aktualita';
  return categoryFallbacks[category.toLocaleLowerCase('cs-CZ')] ?? {
    label: category,
    primary: '#1A4053',
    secondary: '#59BDDC'
  };
}
