# ASTRA — audit prototypu SŠPU Opava

Datum: 7. 9. 2026. Audit před implementací; dokončené změny a výsledky ověření budou v `ASTRA-REVIEW.md`.

## Výchozí stav a ověření

Projekt používá Astro 5.18.2, statický výstup, Tailwind 3, Markdown Content Collections a Pagefind 1.5.2. Nejde o SPA; veřejné komponenty mají malé účelové skripty. React a velký balík Decap se načítají pouze v `/admin/`. Pages CMS již má `.pages.yml`, reference, komponenty, bloky, šest zdrojů médií a tlačítka Actions. Tuto architekturu je vhodné zachovat.

Inventura: 161 článků, 94 galerií, 56 osob, 24 stránek, 17 kategorií, 10 projektů, 7 dokumentů, 7 pracovních nabídek, 6 událostí a 5 oborů. Všechny současné články používají Markdownové tělo, jediný obor používá bloky. Tagy jsou volný seznam, nikoli samostatná kolekce. Pro současnou malou redakci je to obhajitelné; slovník variant má hlídat report, nikoli další povinný formulář.

Prohlédnuty routy, layout, komponenty, utility, datové soubory, schémata, celý konfigurační soubor CMS, validátory, importní a mediální skripty, styly a čtyři workflow. Historické importní skripty nejsou součástí produkčního build procesu.

Výchozí kontroly:

- `npm run check`: bez chyb, jeden hint v historickém importním skriptu.
- Produkční build: 349 HTML stránek za přibližně 48 s, Pagefind 345 stránek, 10 157 slov, 5 filtrů.
- `npm run check:links`: projde, ale kontroluje jen část navigačních odkazů.
- Build s `ASTRO_BASE=/web1` a `ASTRO_SITE=https://example.github.io` i dosavadní link checker prošly.
- Dev server odpověděl HTTP 200. Při souběhu Astro procesů a spuštění přes virtuální pracovní adresář Windows vznikly chyby watcheru/cache; kontroly dále spouštět sekvenčně ze skutečného `D:\vyuka\web1`. Není to důkaz chyby produkčního webu.
- Výstup má přibližně 235 MB; největší JS soubor má 5,70 MB a patří Decap administraci. Veřejný web tento balík nenačítá. Měření přenosu celého `dist` není měření LCP.
- Prohlížeč: desktop 1440 × 1000 (homepage, článek, obor, dokumenty), tablet 768 × 1024 (kontakty, kalendář), mobil 390 × 844 (galerie, archiv, dlouhé materiály, hledání). Na mobilu dekorativní ikony překrývají text hero. Dotaz „Loprais“ vrací dva duplicitní přehledy kontaktů, nikoli osobu.

Samostatný lint, jednotkové testy a automatický WCAG audit zatím chybí. Automatická kontrola ani vizuální vzorek nejsou certifikací WCAG 2.2 AA. Hosted Pages CMS nebyl přihlášením otevřen; konfigurace je porovnána s aktuální oficiální dokumentací, nikoli vydávána za uživatelsky otestovaný editor.

## P0 — opravit

| ID | Problém a dopad | Doporučené řešení | Riziko změny |
| --- | --- | --- | --- |
| P0-1 | `check-links` přeskakuje přílohy, obrázky, relativní URL a všechny odkazy s kotvou. `obsah.json` generuje neexistující `/kontakt/<id>/` a některé `/skola/dokumenty-…/`. Chybný obsah může projít deploymentem. | Kontrolovat skutečný HTML strom, soubory, zdroje obrázků, kotvy, JSON index, base path a duplicity ID; sjednotit mapování rout. Doplnit skutečné detaily dokumentů a osob. | Střední: přísnější kontrola odhalí dříve skryté chyby. |
| P0-2 | Mobilní `aside role=dialog` nemá modalitu ani omezení fokusu. Karty osob vkládají odkazy do role button a duplikují dialogy pro osoby ve více skupinách. Galerie používá pouze tlačítka, takže bez JS nelze otevřít plnou fotografii. Kalendář má neúplnou ARIA grid strukturu a při přerenderování ztrácí fokus. | Nativní mobilní dialog, přirozené odkazy na profily a fotografie, jedinečné dialogy, správná sémantika kalendáře a obnova fokusu. | Střední; ověřit klávesnici, Escape a návrat fokusu. |
| P0-3 | Globální zachytávání příloh zachytí i vlastní odkaz „Stáhnout soubor“ uvnitř dialogu a modifikované kliknutí. | Vyloučit vnitřní download odkazy a respektovat Ctrl/Meta/Shift, nové okno a nativní stažení. | Nízké. |
| P0-4 | Článek `published` s budoucím datem se ihned zveřejní. Chybí skutečná validace kalendářních dat; prázdné hodnoty CMS nejsou důsledně normalizované. Projekty/nabídky a reference z některých bloků validátor vynechává. | Jednotná publikační podmínka, skutečná civilní data, kompatibilní normalizace, validace všech kolekcí a vztahů včetně publikovaného zdroje → koncept. | Střední; zachovat existující názvy kategorií a autorů. |
| P0-5 | Obory ignorují `contentBlocks`, u IT se první část bloků zahazuje pomocí `slice(13)` a zobrazí se jiný text z kódu. Kontakty `relatedPeople` se nepoužívají. Všechny obory odkazují na vzdělávací plán IT. | Předat všechny redakční bloky rendereru, zachovat původní prezentační fallback pro obory bez bloků, respektovat vybrané kontakty a vybírat dokument skutečného oboru. | Střední; lokální změna těla IT, ověřit dlouhý obsah. |
| P0-6 | `.pages.yml` používá `label: {name}` pro osoby, což je jméno souboru; část selectů má nepodporované `options.labels`. Povinné fotografie/ALT nejsou povinné u vnořených polí. Textový blok neumí formátování. | Opravit explicitní tokeny a select options, požadované potomky, limity seznamů, nabídnout Markdown editor a odlišit prostý/formátovaný text. | Nízké až střední; testovat uložený tvar dat. |
| P0-7 | Mobilní dekorace hero překrývá obsah. Některé akcenty na světlém pozadí a focus mají nízký kontrast; homepage přeskakuje H1 → H3. Automatické video nemá ovládání pro zastavení a nerespektuje reduced motion. | Uvolnit prostor textu, kontrastní fokus a nadpisy, opravit hierarchii, video spouštět vědomě s ovládáním. | Nízké, bez redesignu. |

## P1 — vysoká hodnota

| ID | Problém a dopad | Doporučené řešení | Riziko změny |
| --- | --- | --- | --- |
| P1-1 | Search filter „Osoba“ ani „Dokument“ nemá vlastní indexované výsledky. Titulky/perexy některých detailů jsou mimo `data-pagefind-body`. Aliasové stránky dublují výsledky, filtry oborů míchají slug a název, rok chybí. | Indexovat celé hlavní informace detailu, sjednotit pět metadat, vyloučit aliasy a opakované UI, přidat typ/obor/kategorii/štítek/rok do hledání. | Střední; ověřit všech sedm základních typů. |
| P1-2 | Search přepisuje výsledky starší odpovědí, vrátí jen prvních 20 bez pokračování, fallback HTML může obsahovat neescapovaný obsah. URL neuchovává filtry. | Pořadové číslo požadavku, bezpečné vykreslení, jasný loading/empty/error stav, další výsledky a URL filtry. | Nízké až střední. |
| P1-3 | CMS kopíruje schéma; vlastní obsah je až za metadaty, SEO a status. Nápověda Markdown označuje za starší, přesto ho používá všech 161 článků. Upozornění na homepage jsou TS, jedno míří na neexistující článek. | Článek: titulek/perex/text → publikace → zařazení → média → vazby → SEO. Zachovat plochá data, opakovat konfiguraci komponentami. Upozornění převést na malý datový soubor editovatelný v CMS, doplnit platnost a ověření reference. | Střední; malý přesun tří záznamů, bez migrace článků. |
| P1-4 | Generování obrázkových variant zatím neomezuje rozměry a frontend varianty nepoužije. Gallery helper může přepsat existující galerii; ALT placeholder projde publikací. | Bezpečný import do nové složky, deterministické pořadí a YAML, tvrdá ochrana před přepsáním, skutečné zmenšení/EXIF, responzivní thumbnail workflow používaný frontendem, report ALT. | Střední; originály zachovat, kontrolovat opakovatelnost. |
| P1-5 | JSON-LD není chráněn před `</script>` v obsahu; OG image nepřidává base a většinou chybí. Sitemap obsahuje aliasy a administraci. Breadcrumb data existují, vizuální cesta je výchozím nastavením skryta. | Bezpečná serializace JSON-LD, jednotné absolutní URL, OG obrázky, RSS discovery, canonical map a filtr sitemap/noindex, viditelné drobečky u detailů. | Nízké až střední. |
| P1-6 | Administrátor nemá přehled varování o metadatech, expirovaném obsahu, osiřelých vazbách a ALT k doplnění. Selhání Actions nemá krátké české shrnutí. Datum publikace vyžaduje další build. | Deterministický JSON/Markdown report s cestou/polem/nápravou, GitHub annotations a job summary, pravidelný rebuild a ruční kontrolní Actions. | Nízké. |
| P1-7 | `ContentRenderer` načítá čtyři celé kolekce i pro prostý text. V build procesu opakovaně probíhá třídění a procházení kolekcí. Filtr feedu používá kvadratické `indexOf`. | Načíst pouze potřebné vztahy, cache jen v produkčním buildu, lineární filtrovaný feed. | Nízké; dev bez trvalé cache. |
| P1-8 | Chybí nezávislé regresní testy pro URL, čas, publikaci, obsah a CMS. `yaml` je importován pouze díky transitivní závislosti. | Deklarovat přímé závislosti, přidat přiměřený lint a cílené testy skutečných selhání. | Nízké. |

## Posouzení redakčních kolekcí

| Kolekce | Co zachovat | Konkrétní zlepšení formuláře |
| --- | --- | --- |
| pages / web-pages | Obsahové bloky, fallback Markdown, SEO. | Obsah před publikací/SEO, sbalitelné bloky se souhrnem, příklady, nezaměňovat externí URL a reference. |
| articles | Perex, datum, autor, kategorie, obory, přílohy, galerie. | Markdown jako běžný editor, status koncept výchozí, stabilní výběr autora, doporučení místo ručních slugů, titulní ALT a zřetelná alternativa bloků. |
| studyPrograms / programs | Pět existujících oborů, kód, kapacita a kontakty. | Všechny bloky musí být veřejně zobrazeny, čísla nesmí být záporná, kontaktní reference musí ovlivňovat výstup. |
| galleries | Pořadí foto + ALT + caption + cover. | Povinná fotografie i popis, sbalený seznam s pořadím, cover může použít první snímek, nápověda pro dávkový import a kontrolu ALT. |
| documents | Samostatná metadata, soubor a platnost. | Vlastní detail a úplný veřejný přehled, datum/platnost a reference, upozornění na expiraci bez automatického mazání. |
| events | Civilní datum, samostatný čas, stálé štítky, vazby. | Popis časové zóny, skutečná validace termínu, normální popisky multiselectu; minulá událost je archiv, ne chyba. |
| people | Veřejné profesní kontakty, foto a profil, kompatibilní aliasy polí. | Jméno místo souboru v referencích, řízené skupiny, jasná viditelnost v přehledu, funkční samostatný profil. |
| categories | Řízená klasifikace, zákaz nechtěného odstranění. | Stabilní ID pro nové reference s podporou starých názvů, varování při duplicitním názvu. |
| tags | Volné štítky napříč obsahem. | Záměrně bez nové kolekce a migrace; nápověda a přehled variant v reportu. Události mají malý řízený slovník. |
| projects / jobOffers | Specifické provozní stavy oddělené od viditelnosti. | Opravit české selecty, zahrnout do validace, datum expirace a editace obsahu v přirozeném pořadí. |

## P2 — další rozvoj

| Problém / příležitost | Dopad a doporučení | Riziko |
| --- | --- | --- |
| Tisíce článků a galerií | Archiv nyní generuje všechny karty. Až skutečná velikost převýší rozumný přenos, přejít na statické stránkování a Pagefind pro průřezové filtry; zachovat URL filtrů. | Střední; neimplementovat současně s celkovou změnou archivu. |
| Dokumenty PDF | Indexují se metadata, nikoli obsah PDF. Extrakci zavést podle reálných vyhledávacích dotazů a kvality zdrojů. | Střední. |
| Školní texty v programových prezentačních fallback komponentách | Postupně převést ověřené texty do bloků při jejich redakční revizi. Nedělat plošnou neověřenou migraci. | Střední. |
| Velké fotografie a dávkové ALT | Specializovaný importér galerie může nabídnout tabulkovou revizi metadat. Vlastní celý CMS nepřinese odpovídající hodnotu. | Střední. |
| Fonty a externí fotografie | Posoudit lokální hostování fontů a postupné převzetí externích fotografií po kontrole práv a zdrojů; není nutné zavádět CDN/backend. | Nízké až střední. |
| Core Web Vitals | Změřit Lighthouse na cílovém hostingu a později reálné LCP/CLS/INP. Lokální vizuální test ani objem buildu tyto metriky nedokazují. | Nízké. |
| Přechod legacy Content Collections na glob loader | Nyní není potřebný: nese změny `id/slug` a všech vztahů bez okamžité redakční hodnoty. | Vyšší. |

## Ověřené možnosti Pages CMS a rozhodnutí

Reference podporují výběr z kolekce, stabilní uloženou hodnotu a zvláštní zobrazovací šablonu. `{name}` je jméno záznamu, `{fields.name}` explicitně obsahové pole jména. [Oficiální reference fields](https://pagescms.org/docs/configuration/fields/reference/).

Bloky zachovají `blockKey: type`. Seznamy umějí limity a sbalitelné položky se souhrnem. Samostatné vizuální fieldsets bez změny uloženého tvaru nejsou v dokumentovaných polích popsány; použiji pořadí/nápovědu a stávající SEO objekt. [Blocks](https://pagescms.org/docs/configuration/fields/block/), [Lists](https://pagescms.org/docs/configuration/content/list/), [Object](https://pagescms.org/docs/configuration/fields/object/).

Rich-text podporuje Markdown/HTML, média a přepínač zdroje. Nevyplývá z něj hotový dávkový editor fotografií s ALT/caption ani skutečný živý Astro preview. Nebudu konfigurovat nedokumentované nástroje toolbaru nebo předstírat náhled konceptu na veřejné URL. [Rich text](https://pagescms.org/docs/configuration/fields/rich-text/), [Editors](https://pagescms.org/docs/configuration/content/editors/).

Select používá pojmenované objekty v `options.values`; oddělený seznam `options.labels` není dokumentovaný. [Select fields](https://pagescms.org/docs/configuration/fields/select/). Sdílené definice zůstanou pod `components`, nikoli v nové vlastní administraci. [Konfigurace](https://pagescms.org/docs/configuration/).

Implementace začne P0, poté navazujícími P1. P2 zůstávají doporučením. Zachová se statický deployment, současná data a běžný tok commit → validace → build → Pagefind → kontrola → deploy.

## Doplnění z implementace (8. 9. 2026)

Přísná kontrola odhalila 777 jedinečných absolutních historických URL na původním školním webu, které nejsou součástí repozitáře. Byly označeny jako výslovná externí závislost; jejich dostupnost není prokázána lokálním buildem. Samostatná kontrola nasazení blokuje převzetí stejné domény bez vyřešení archivu. Dvě skutečné lokální chyby v popisech iframe byly opraveny.

Po porovnání referencí se současnými záznamy zůstaly názvové hodnoty kategorií a autorů v CMS zachovány. Původně zvažovaná změna ukládaných hodnot by znepříjemnila opětovné otevření starších záznamů. Obě podoby přijímá web i validátor. Samostatný report variant volných štítků zůstává dalším zlepšením; řízené štítky událostí byly sjednoceny. Konečný rozsah a ověření shrnuje [ASTRA-REVIEW.md](ASTRA-REVIEW.md).
