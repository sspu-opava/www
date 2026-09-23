# Web SŠPU Opava

Statický web v Astro s obsahem v Gitu, Pages CMS a vyhledáváním Pagefind. Zachovává existující komponenty, veřejné adresy a obsahový model.

## Spuštění a kontrola

Používejte Node.js 22.13+ nebo 24. Instalace podle lockfile:

```bash
npm ci
npm run dev
```

První spuštění připraví varianty fotografií a pak vypíše adresu Astro. Další přípravy využívají cache. Po přidání nových médií za běhu dev serveru jej restartujte.

```bash
npm test
npm run preview
```

Kompletní test spustí lint, regresní testy, kontrolu obsahu a Pages CMS, Astro check, produkční build, Pagefind a kontrolu odkazů. Kontroly spouštějte postupně; souběžný Astro build/check/dev sdílí pracovní adresář .astro.

| Účel | Příkaz |
| --- | --- |
| Lint | npm run lint |
| Regresní testy | npm run test:unit |
| Obsah, CMS a Astro | npm run check |
| Redakční zpráva včetně ALT, vztahů a platnosti | npm run check:content |
| Soulad formulářů s aktuálními daty | npm run check:pages-cms |
| Média, HTML, Pagefind a sitemap | npm run build |
| Odkazy, soubory, kotvy a základní přístupnost HTML | npm run check:links |
| Skutečné URL všech výsledků sestaveného Pagefind | npm run check:search |
| Kolize cílové domény s původním archivem | npm run check:deployment |
| Znovu sestavit Pagefind nad existujícím dist | npm run search:index |
| Připravit responzivní fotografie | npm run media:prepare |
| Založit galerii | npm run gallery:create -- slozka slug "Název" |

Zprávy jsou v reports/ jako Markdown a JSON. Chyby zastaví publikaci; upozornění žádají redakční kontrolu. Soubory reports/, public/_media/ a src/data/generated-media.json jsou generované a nepatří do Gitu.

## Redakce

Hlavním rozhraním je [Pages CMS](https://app.pagescms.org). Praktický postup je v [PAGES-CMS.md](PAGES-CMS.md). Formuláře definuje [.pages.yml](.pages.yml), datový model [src/content/config.ts](src/content/config.ts).

Běžný článek se píše v Markdownovém editoru. Neprázdné obsahové bloky nahrazují hlavní text. U oborů bez bloků zůstává prezentační šablona, do níž vstupuje text a metadata oboru. Galerie mají povinné ALT, seřaditelný seznam fotografií a volitelný cover s fallbackem na první snímek.

Starší Decap rozhraní /admin/ zůstává pro kompatibilitu; lokální backend spouští npm run cms. Jeho konfigurace není hlavní redakční produkt a nepokrývá nové možnosti Pages CMS. Neupravujte souběžně stejný záznam ve dvou administracích.

## Architektura

- src/content/ — články, obory, galerie, dokumenty, události, lidé, stránky, kategorie, projekty a pracovní nabídky.
- src/lib/content.ts — normalizace starších referencí a cache kolekcí pro build.
- src/lib/publication.mjs — publikace a civilní data v Europe/Prague.
- src/lib/urls.mjs — veřejné trasy, base path, kanonické aliasy a bezpečný JSON-LD.
- src/components/content/ContentRenderer.astro — omezená sada obsahových bloků a Markdownový fallback.
- src/components/ResponsiveImage.astro — varianty obrázků připravené Sharpem; bez klientského JS.
- src/pages/ — statické stránky a samostatné detaily osob, dokumentů, článků, galerií a událostí.
- scripts/ — kontroly, příprava médií, bezpečný import galerie a indexace.
- tailwind.config.mjs a src/styles/global.css — vizuální tokeny a společné styly.

Nový blok doplňte současně do schématu Astro, ContentRenderer a komponenty contentBlocks v .pages.yml. Existující metadata nepřejmenovávejte bez kontroly referencí.

## Vyhledávání a SEO

Produkce používá Pagefind; dev má bezpečný fallback na obsah.json. Filtry: typ, obor, kategorie, štítek a rok. Výsledky se načítají po 20. Navigace, footer a dialogy se do fulltextu nezahrnují. Aliasy a noindex stránky se vynechávají z indexu i sitemap.

Build ověřuje i veřejné rozhraní vygenerovaného Pagefind s lokálními indexovými soubory. Každá výsledná URL musí vést na existující HTML pod nastavenou base cestou. Tím se zachytí i zdvojení prefixu, které samotná kontrola odkazů ve stránkách neodhalí.

obsah.json poskytuje metadata a text veřejných záznamů včetně bloků. Neobsahuje koncepty ani budoucí články. PDF se vyhledávají podle metadat, nikoli podle textu uvnitř souboru.

## GitHub Pages

Tok zůstává jednoduchý: Pages CMS → commit do main → kontroly → média → Astro → Pagefind → kontrola odkazů → deploy. Ruční akce jsou dostupné z Pages CMS. Automatický rebuild v 17. minutě každé hodiny umožňuje publikaci naplánovaných článků a ukončení upozornění bez nového commitu. GitHub může plánované běhy opozdit nebo omezit; nejde o přesný časovač.

Workflow bere origin i base_path z actions/configure-pages, včetně vlastní domény. Ověření podadresáře v PowerShellu:

```powershell
$env:ASTRO_BASE = '/web1'
$env:ASTRO_SITE = 'https://example.github.io'
npm run build
npm run check:links
Remove-Item Env:ASTRO_BASE, Env:ASTRO_SITE
```

Před dalším náhledem s jinou base cestou sestavte web znovu.

**Převzetí původní školní domény vyžaduje migraci archivu.** Obsah dosud odkazuje na starší /media/, /static/ a několik školních stránek mimo tento repozitář. Jejich deklarace je v src/data/external-content.json. check:links je vykazuje samostatně jako externí závislost; neprohlašuje je za lokálně existující soubory. check-deployment.mjs zabrání nasazení na původní origin, dokud je tato závislost deklarovaná. Prototyp na GitHub Pages s jinou doménou funguje nadále. Před změnou DNS zajistěte převzetí těchto souborů, starých URL a skutečných přesměrování; kanonické aliasy nejsou HTTP 301.

## Výsledky revize

[ASTRA-AUDIT.md](ASTRA-AUDIT.md) obsahuje výchozí audit a priority, [ASTRA-REVIEW.md](ASTRA-REVIEW.md) změny, ověření a známá omezení. Starší podklady zůstávají v CURRENT-SITE-AUDIT.md.
