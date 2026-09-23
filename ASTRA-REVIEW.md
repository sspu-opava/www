# ASTRA — dokončení revize SŠPU Opava

Datum: 8. 9. 2026. Navazuje na audit provedený před úpravami v [ASTRA-AUDIT.md](ASTRA-AUDIT.md). Zachována je stávající statická aplikace Astro, obsah v Gitu, Pages CMS a jednoduchý publikační tok. Změny jsou připravené lokálně; tento úkol nezahrnoval publikaci ani změnu DNS.

## Co bylo změněno

- **Routování a publikace:** společné sestavování URL a base path, canonical adresy pro staré aliasy, skutečné detailní stránky 56 osob a 7 dokumentů. Koncepty se negenerují ani přes aliasy. Budoucí články čekají na datum v Europe/Prague; hodinový rebuild umožní plánované zveřejnění. Události používají skutečná kalendářní data a místní čas včetně přechodu na letní čas.
- **Redakční obsah:** všechny bloky oboru IT se vykreslují. Ostatní obory zachovávají původní prezentační šablonu, dokud správce nepřidá bloky. Respektují se vybrané kontakty, pořadí souvisejících záznamů a vzdělávací dokument daného oboru. Markdown události je i v dialogu, text galerie je na její stránce. Úvodní upozornění se editují jako data; opravena byla neexistující vazba na článek.
- **Přístupnost a ovládání:** nativní dialog mobilního menu, skutečné odkazy na profily osob a plné fotografie, jedinečné dialogy osob, návrat fokusu, ovládání galerie klávesnicí a opravená sémantika kalendáře. Náhled příloh zachovává samostatné stažení a modifikované kliknutí. Opraveny nadpisy homepage, popisy vložených videí, viditelný focus, problematické kontrasty a dekorace překrývající mobilní nadpisy. Video má ovládání a nespouští se automaticky; animace respektují reduced motion.
- **Vyhledávání:** Pagefind indexuje kanonický hlavní obsah včetně osob a dokumentů. Filtry typu, oboru, kategorie, štítku a roku používají čitelné hodnoty. Stav je v URL, výsledky mají pokračování po 20 položkách, pomalejší odpověď nepřepíše novější dotaz. Vývojový JSON fallback vyhledává bez hotového Pagefind indexu. Výsledky se vykreslují bezpečně jako text a odkazy.
- **Regrese GitHub Pages:** závěrečný test skutečného rozhraní Pagefind odhalil zdvojení `/web1/web1/` v odkazech. Index nyní ukládá cestu bez base; Pagefind ji doplní při načtení. Nový `check:search` kontroluje všechny skutečně vrácené URL proti HTML souborům a běží automaticky při každém buildu.
- **SEO:** bezpečná serializace JSON-LD, Article/Event/Person/DigitalDocument a organizace, viditelné drobečky, absolutní canonical a Open Graph URL včetně base, RSS discovery, očištění sitemap a indexu od administrace, vyhledávání a aliasů. Strojový index je na `obsah.json`.
- **Média a build:** deterministické WebP varianty 480/960/1600 px, oprava orientace a odstranění EXIF z odvozených obrázků, skutečné `srcset`, rozměry obrázků a zachování originálů. Cache podle obsahu souboru, načítání jen potřebných vztahů a kolekcí při buildu, lineární filtrování archivu.
- **Kontroly:** ESLint, cílené regresní testy, validace všech kolekcí a formulářů Pages CMS proti existujícím datům. Kontrola HTML odkazů zahrnuje přílohy, obrázky, relativní cesty, kotvy, duplicitní ID a strojové indexy. Výsledky jsou v českých Markdown/JSON reportech a souhrnech GitHub Actions.
- **GitHub Actions:** validace → build → Pagefind → kontrola odkazů a cílové domény → publikace. Selhání ponechá předchozí nasazení. Ruční redakční akce a pravidelný rebuild zachovávají jednoduchý tok bez povinných pull requestů. Mediální akce vytváří artefakt, nepřepisuje skrytě obsah automatickým commitem.

## Co bylo výrazně zlepšeno

Vyhledání konkrétního zaměstnance vede na jeho vlastní veřejný profil. Dokumenty mají vlastní dohledatelné detaily. Důležité informace, odkazy na fotografie a profily jsou součástí HTML, i když se nespustí klientské dialogy. Obor IT již nezahazuje začátek redakčně zadaných bloků.

Přísnější kontrola odkazů přestala vydávat absenci kontroly souboru za úspěch. Zároveň odlišuje skutečný externí školní archiv od chybné lokální cesty a chrání jeho doménu před nechtěným nahrazením prototypem.

Pro 1 446 místních zdrojových obrázků vzniklo 3 907 responzivních variant. Součet originálů je 200,00 MB, součet nejmenších variant 33,36 MB, tedy přibližně o 83 % méně. Jde o porovnání mediálních souborů, nikoli naměřené zrychlení stránky. Celý distribuční adresář obsahuje i originály a více velikostí, proto je větší než před úpravou; pro návštěvníka je podstatná zvolená varianta přes `srcset`.

Distribuce po optimalizaci má přibližně 484 MB oproti výchozím 235 MB. Toto zvýšení je vědomý důsledek zachování originálů a několika velikostí; není to objem přenesený při jedné návštěvě.

### Automatické závěrečné kontroly

Kompletní `npm test` skončil úspěšně (exit 0) po poslední opravě Pagefind. Výstup v `dist/` je nakonec obnoven pro běžnou kořenovou cestu `/`.

| Kontrola | Výsledek |
| --- | --- |
| ESLint | Bez chyb a upozornění. |
| Regresní testy | 11 z 11 úspěšných: URL, publikace a data, reference, hledání, Markdown/JSON-LD, HTML a bezpečný import galerie. |
| Astro check | 147 souborů, 0 chyb, 0 upozornění, 0 hintů. |
| Validace obsahu | 387 záznamů; 0 chyb, 14 redakčních upozornění a 190 informací. |
| Pages CMS | 11 konfiguračních kolekcí včetně upozornění, 7 zdrojů médií, 8 komponent; 0 chyb. |
| Produkční HTML a Pagefind | 412 stránek; index 378 kanonických stránek, 34 vynechaných aliasů a neveřejných adres. |
| Skutečné výsledky Pagefind | Všech 378 URL ověřeno proti existujícím HTML při base `/` i `/web1/`. |
| Interní odkazy a soubory | 412 HTML, 5 051 jedinečných místních cílů; 0 chyb. Jediné upozornění eviduje 777 externích archivních URL. |
| GitHub Pages base | Build a místní odkazy pro `ASTRO_BASE=/web1`, `ASTRO_SITE=https://example.github.io` prošly; po opravě indexace prošlo i veřejné rozhraní Pagefind. |
| Ochrana nasazení | Původní doména správně odmítnuta kvůli archivu; odlišná GitHub Pages doména přijata. |
| Git diff | `git diff --check` bez chyb. |

Reporty jsou v `reports/`; úplný log posledního běhu je lokálně v `.audit-tmp/completion-test.log`. Upozornění bundleru z kompatibilní administrace Decap jsou popsána níže a nejsou zaměňována s chybou Astro check.

### Vizuální a klávesnicové kontroly

| Rozměry | Ověřený vzorek po úpravách |
| --- | --- |
| Mobil 390 × 844 | Homepage, článek Plakáty, IT obor včetně celých bloků, dlouhé Výukové materiály, galerie, dokumenty, kalendář a hledání. Bez vodorovného přetékání v kontrolovaném vzorku. |
| Tablet 768 × 1024 | Kontakty, dialog osoby, samostatný profil a archiv článků. U archivu byl nalezen překryv ikony s nadpisem a následně nahrazen rozložením do samostatných sloupců. |
| Desktop 1440 × 1000 | Produkční hledání, všechny hlavní typové filtry, kombinace filtrů, detail dokumentu a dialog přílohy. |

Ověřeno: Escape a návrat zaměření u mobilního menu, galerie, události a osoby; šipka doprava v galerii; zachování zaměření a `aria-pressed` při výběru dne; bezpečné zpracování neplatných parametrů kalendáře; otevření samotné přílohy z odkazu ke stažení. Při hledání se po rozšíření z 20 na 40 výsledků zaměří první nová položka, filtry zůstanou v URL a obnoví se po reloadu. Kombinace galerie + Umělecké obory + Výstava + 2026 vrátila 5 výsledků; neodpovídající kombinace zobrazila prázdný stav.

Dotaz Loprais v produkci vrací jako první samostatný profil, následovaný jedním přehledem kontaktů. Dev fallback vrací přímo osobu. Typové filtry v produkci ověřily 161 článků, 94 galerií, 56 osob, 7 dokumentů, 6 událostí, 5 oborů a 15 stránek označených obecným typem Stránka.

Po přerušení relace již nebyl dostupný žádný ovladatelný prohlížeč. Poslední oprava tabletového rozložení proto byla ověřena sestavením a kontrolou výstupu, ne novým screenshotem. Oprava `/web1/` byla ověřena skutečným rozhraním vygenerovaného Pagefind: výsledná URL je `/web1/kontakt/miroslav-loprais/` a všech 378 výsledků vede na existující stránky. Nejde o náhradu dalšího vizuálního testu této poslední verze.

## Pages CMS — hlavní zlepšení

Formuláře všech deseti obsahových kolekcí a souboru úvodních upozornění odpovídají běžné redakční práci. Článek začíná titulkem, perexem a hlavním textem; následuje publikace, zařazení, média, vztahy a SEO. Výchozím stavem nových záznamů je koncept. U pracovních nabídek je nová položka nejprve skrytá.

Osm opakovaně použitelných komponent sjednocuje mimo jiné SEO, Markdown, fotografie a bloky. Opraveny jsou selecty, multiselecty, zobrazování jmen v referencích, povinná vnořená pole a počet sloupců. Seznamy fotografií a bloků lze sbalit a mají souhrny. Sedm mediálních zdrojů odděluje články, galerie, lidi, dokumenty, přílohy, nabídky a obecné obrázky.

Stávající články se nemigrovaly. Autor a kategorie zachovávají názvové hodnoty kvůli existujícím výběrům v CMS; ostatní reference běžně ukládají identifikátor souboru. Web a validátor přijímají obě historické podoby. Přechod všech kategorií na nové ID by nyní přidal migraci bez odpovídajícího přínosu. Štítky zůstávají jednoduchým seznamem, události mají řízené názvy.

Galerie má povinný ALT pro každou fotografii, volitelný popisek, pořadí a automatický fallback cover na první snímek. Helper `npm run gallery:create` bezpečně založí nový koncept z celé složky, seřadí soubory přirozeně a odmítne přepsání existující galerie. Pomocné ALT blokují publikaci, dokud je správce nedoplní.

Postupy pro správce včetně řešení chyb, plánování publikace, importu galerie a prvního ověření hostovaného editoru jsou v [PAGES-CMS.md](PAGES-CMS.md). Technické spuštění a nasazení popisuje [README.md](README.md).

## Známá omezení

- **Původní školní archiv:** současný obsah odkazuje na 777 jedinečných historických URL na `www.sspu-opava.cz` (PDF, fotografie a několik starých stránek). Jsou evidované v `src/data/external-content.json` jako externí závislost. Lokální link checker neprokazuje jejich dostupnost na internetu. Před převzetím této domény je nutné zachovat nebo přemístit archiv a přesměrovat odkazy; `check:deployment` záměrně odmítne nasazení prototypu na stejný origin, dokud závislost trvá. GitHub Pages na jiné doméně je použitelný pro prototyp.
- **Hostované Pages CMS:** konfigurace byla ověřena proti dokumentaci a všem současným datům, nikoli přihlášením a uložením do skutečného účtu. První redakční zkouška musí ověřit oprávnění GitHub App, upload a opětovné otevření uložených referencí. Vizuální editor nemusí beze změn zachovat složité historické HTML; pro ně zůstává zdrojový Markdown.
- **Obsahová kvalita:** upozornění na minulé události, prošlou platnost a nabídky ke kontrole vyžadují redakční rozhodnutí. Neodstraňoval jsem historický obsah ani nevymýšlel nové termíny. Kontrola přítomnosti ALT nedokazuje jeho věcnou kvalitu; původní stejné nebo obecné popisy je vhodné postupně revidovat. Volné varianty štítků zatím nemají samostatný normalizační report.
- **Přístupnost a výkon:** provedené kontroly nejsou certifikací WCAG 2.2 AA ani měřením reálných Core Web Vitals. Chybí kompletní test se čtečkou obrazovky a uživateli. LCP/CLS/INP je potřeba měřit na cílovém hostingu. Externí obrázky, video a obrázky vložené ve starém HTML se automaticky nepřevádějí na responzivní varianty.
- **Rozsah obsahu:** archivy zatím vytvářejí všechny karty v HTML. Pro tisíce položek bude vhodné statické stránkování. Pagefind prohledává metadata dokumentů, nikoli text uvnitř PDF. Část starších prezentačních textů oborů zůstává v komponentách.
- **Provoz:** plánovaná publikace závisí na úspěšném rebuildu; GitHub může plánovaný běh zpozdit. Neproběhlo vzdálené spuštění Actions ani deploy. Starší kompatibilní `/admin/` s Decap zůstává samostatný a při buildu hlásí upozornění svých závislostí; veřejné stránky tento velký balík nenačítají. Nepoužívané staré mediální varianty lze odstranit vyčištěním generované cache při údržbě.

## Co bych zatím nedělal

Nezaváděl bych backend, databázi, vlastní kompletní CMS, povinné pull requesty pro dva až tři správce, univerzální page builder ani AI validaci tam, kde stačí deterministická pravidla. Neprováděl bych plošnou migraci názvových referencí a Content Collections jen kvůli technologické čistotě. AVIF, extrakci všech PDF a složitou mediální infrastrukturu bych přidal až podle měření a skutečného redakčního problému.

## Doporučené další kroky

1. Připojit Pages CMS a projít krátkou redakční zkoušku podle příručky; zkontrolovat dostupnost reportů po skutečném běhu GitHub Actions.
2. Rozhodnout o uložení historických médií před změnou hlavní domény a následně ověřit dostupnost přesměrovaných souborů. Do té doby používat prototyp na samostatné adrese.
3. Zpracovat upozornění v `reports/content.md`, postupně doplnit konkrétní ALT a sjednotit štítky. Názvy souborů, autorů a kategorií měnit spolu s jejich vazbami.
4. Změřit výkon na hostingu a doplnit test čtečkou obrazovky, zvětšením textu a skutečným uživatelem. Podle výsledků rozhodnout o lokálních fontech, převzetí externích obrázků nebo stránkování archivu.

## Potenciální kandidáti na vlastní administrační nástroje

**Hromadná příprava galerie a revize ALT/popisků** je konkrétní hranice současného editoru: upload několika souborů sám nevytvoří správně popsané a seřazené položky galerie. Nejprve používat dodaný helper. Pokud redakce pravidelně zpracovává desítky snímků najednou, smysl má malá tabulka náhledů, pořadí, ALT a popisků s exportem stejného Markdownu. Nemusí mít vlastní databázi ani správu přihlášení.

**Skutečný náhled konceptu ve vzhledu Astro** může mít hodnotu, pokud správci potřebují před zveřejněním ověřovat složité bloky. Samotný editor neposkytuje živé vykreslení těchto komponent. Před vlastním nástrojem vyhodnotit jednoduchý neveřejný build náhledu s řízeným přístupem. Veřejnou URL posledního buildu neoznačovat za náhled konceptu.

Pro běžné články, vztahy, dokumenty, kontakty, SEO a běžnou galerii nyní vlastní administraci nedoporučuji.
