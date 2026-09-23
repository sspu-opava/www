export const EVENT_TAG_OPTIONS = [
  { value: 'vystava', label: 'Výstava' },
  { value: 'prace-zaku', label: 'Práce žáků' },
  { value: 'uchazeci', label: 'Uchazeči' },
  { value: 'maturanti', label: 'Maturanti' },
  { value: 'akce', label: 'Akce' },
  { value: 'soutez', label: 'Soutěž' },
  { value: 'prednaska', label: 'Přednáška' },
  { value: 'exkurze', label: 'Exkurze' },
  { value: 'prumyslovy-design', label: 'Průmyslový design' },
  { value: 'graficky-design', label: 'Grafický design' },
  { value: 'informacni-technologie', label: 'Informační technologie' },
  { value: 'strojirenstvi', label: 'Strojírenství' },
  { value: 'design-hracek', label: 'Design hraček' }
] as const;

export const EVENT_TAG_VALUES = EVENT_TAG_OPTIONS.map(({ value }) => value) as [string, ...string[]];

export const eventTagLabel = (value: string) => {
  const text = value.trim().replace(/\s+/g, ' ');
  const normalized = text.toLocaleLowerCase('cs-CZ');
  return EVENT_TAG_OPTIONS.find(tag => tag.value === normalized || tag.label.toLocaleLowerCase('cs-CZ') === normalized)?.label ?? text;
};
