/**
 * Výchozí mapa pro budoucí 301 redirecty na hostingu.
 * Úplný export vznikne při migraci obsahu ze starého CMS.
 */
export const legacyRedirects: Record<string, string> = {
  '/cs/': '/',
  '/cs/zpravy/': '/skolni-zpravodaj/',
  '/cs/aktuality/galerie/': '/fotogalerie/',
  '/cs/kalendar/': '/kalendar-akci/',
  '/cs/kontakty/': '/lide-a-kontakty/',
  '/cs/zaci/': '/zaci-a-tridy/',
  '/cs/historie-soucasnost/': '/historie-a-soucasnost/',
  '/cs/umelecka-rada/': '/umelecka-rada/',
  '/cs/studentsky-parlament/': '/studentsky-parlament/',
  '/cs/spoluprace/': '/spoluprace/',
  '/cs/nabidka-pronajmu/': '/nabidka-pronajmu/',
  '/cs/dokumenty/': '/dokumenty/',
  '/cs/strojirenstvi/': '/obory/strojirenstvi/',
  '/cs/informacni-technologie/': '/obory/informacni-technologie/',
  '/cs/prumyslovy-design/': '/obory/prumyslovy-design/',
  '/cs/graficky-design/': '/obory/graficky-design/',
  '/cs/design-hracek/': '/obory/design-hracek/',
  '/obory/tvorba-hracek-a-hernich-predmetu/': '/obory/design-hracek/'
};
