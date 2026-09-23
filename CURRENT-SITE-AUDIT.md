# Audit současného webu SŠPU Opava

Audit byl proveden nad veřejným webem `https://www.sspu-opava.cz/cs/` v srpnu 2026.

## Nalezeno

- Hlavní oblasti: Škola, Studium, Aktuality, Dokumenty a cílově orientovaný rozcestník pro uchazeče, veřejnost a studenty/rodiče.
- Pět oborů: Strojírenství, Informační technologie, Průmyslový design, Grafický design a Design hraček.
- Typy obsahu: dlouhé oborové stránky, školní zpravodaj s rubrikami/štítky/archivem, kalendář, galerie, kontakty, veřejné dokumenty a odkazy na Škola Online, Moodle, Office 365 a Outlook.
- Reprezentativní aktuální obsah: zahájení roku 2026/2027, články o profesním vzdělávání, výstavě plakátů, exkurzích a České AI olympiádě.
- Významné staré URL vzory: `/cs/<stranka>/`, `/cs/zpravy/`, `/cs/aktuality/galerie/`, `/cs/kalendar/`, `/cs/kontakty/`, `/cs/dokumenty/` a jednotlivé URL oborů.

## Zachováno

- Skutečná identita, názvy oborů, kontaktní údaje školy, cílové skupiny, důležité externí systémy a reprezentativní veřejný obsah.
- Vazby mezi aktualitou, oborem, galerií, dokumentem, událostí a osobou jsou nyní samostatná data v `src/content/`.

## Změněno

- Hluboké vícenásobné menu nahrazuje stručná datově řízená navigace a rychlé rozcestníky.
- Dlouhé stránky mají jasný úvod, související obsah, breadcrumb a přístupné komponenty; informační stránky umějí i znovupoužitelné bloky.
- Dokumenty mají kategorie, datum, platnost, štítky a samostatné detailní URL.
- Galerie mají řazené fotografie, ALT texty, popisky a klávesnicově ovladatelný lightbox.
- Připraven je základ mapování starých URL na nové trasy; kompletní 301 tabulka patří do migrační fáze před nasazením.

## Zatím nepokryto / rozhodnout později

- Kompletní archiv historických článků a dokumentů, přesný seznam kontaktů a individuální fotografie osob.
- Konečná licence a lokální optimalizované kopie všech médií; prototyp odkazuje na malý výběr veřejných zdrojů původního webu.
- Produkční Git autentizace Decap CMS, vlastní doména pro prototyp a úplná tabulka 301 redirectů.
- Redakční pravidla pro kategorie, workflow kontroly a finální obsahová revize před publikací.
