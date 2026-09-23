# Úvodní fáze: audit a modernizace existujícího webu SŠPU Opava

Jako hlavní obsahový a funkční referenční zdroj použij současný veřejný web:

`https://www.sspu-opava.cz/`

Nezačínej implementací naslepo.

Nejprve systematicky projdi stávající web a vytvoř si vlastní pracovní inventuru jeho obsahu, struktury a funkcí.

## 1. Prozkoumej současný web

Projdi zejména:

* homepage,
* hlavní navigaci,
* všechny hlavní sekce a podsekce,
* stránky jednotlivých studijních oborů,
* aktuality a jejich archiv,
* detail článku,
* galerie,
* dokumenty a přílohy,
* kalendář a události,
* kontakty a osoby,
* obsah pro uchazeče,
* obsah pro současné studenty a rodiče,
* rychlé odkazy na externí systémy,
* důležité informační bloky,
* vyhledávání,
* footer,
* responzivní chování webu.

Pokud web obsahuje sitemapu nebo jiný strojově čitelný seznam URL, využij jej pro lepší pokrytí.

Není nutné mechanicky stahovat každou historickou stránku. Cílem je pochopit všechny typy obsahu a funkcí a získat reprezentativní obsah pro prototyp.

## 2. Vytvoř interní audit

Před implementací si zaznamenej alespoň:

* současnou informační architekturu,
* typy stránek,
* typy obsahu,
* opakující se komponenty,
* vazby mezi články, obory, galeriemi, dokumenty a dalšími entitami,
* současné URL vzory,
* důležité funkce,
* obsah, který se opakuje,
* zastaralé nebo problematické UX postupy,
* prvky, které je vhodné zachovat,
* prvky, které je vhodné přepracovat.

Audit použij jako pracovní podklad. Nezdržuj implementaci rozsáhlou formální studií.

## 3. Zachovej obsah, nikoli současný design

Nový prototyp nemá být vizuální kopií současného webu.

Zachovej a přenes zejména:

* skutečnou strukturu školy,
* pět existujících oborů,
* důležité informační oblasti,
* reprezentativní aktuální články,
* skutečné kategorie tam, kde dávají smysl,
* relevantní dokumenty,
* kontaktní strukturu,
* události,
* galerie,
* odkazy na používané externí školní systémy.

Současný layout, Bootstrap komponenty, typografii, navigaci ani grafické řešení nepovažuj za závazné.

Cílem je:

> zachovat informační identitu SŠPU Opava, ale vytvořit moderní web znovu podle současných webových standardů.

## 4. Obsah migruj do nového datového modelu

Při vytváření prototypu převeď reprezentativní skutečný obsah současného webu do nově navržených entit:

* pages,
* articles,
* studyPrograms,
* galleries,
* documents,
* events,
* people,
* categories,
* tags.

Pokud starý web používá jiný model, nesnaž se jej slepě kopírovat.

Navrhni nový model podle významu obsahu.

Například:

* položky současného menu nemusí mít stejnou hierarchii,
* současné rubriky mohou být sloučeny nebo přejmenovány,
* opakovaný obsah může být převeden do sdílené entity,
* kontaktní údaje nemají být kopírovány do několika stránek,
* články mohou získat vazby na více oborů, tagy a doporučený obsah.

## 5. Použij reálný obsah v prototypu

Nevytvářej převážně Lorem Ipsum ani generické ukázkové články.

Použij reprezentativní veřejně dostupný obsah skutečné školy, zejména:

* názvy oborů,
* popisy studia,
* kontaktní informace,
* vybrané aktuální články,
* kategorie,
* události,
* veřejné dokumenty,
* galerie a jejich metadata.

Historický obsah nemusíš migrovat kompletně.

Pro první prototyp stačí dostatečné množství skutečných dat, aby bylo možné ověřit návrh na realistickém obsahu.

## 6. Média

Při práci s fotografiemi a dalšími médii:

* zachovej vazbu na původní veřejný zdroj při analýze,
* pro samotný prototyp stáhni pouze rozumný reprezentativní výběr veřejných médií, pokud je to technicky a licenčně vhodné,
* nevytvářej zbytečné duplicity,
* optimalizuj lokálně používané kopie pro web,
* zachovej poměr stran,
* připrav responzivní varianty,
* nevymýšlej ALT text, pokud nelze obsah fotografie spolehlivě určit; označ jej k pozdějšímu doplnění.

## 7. URL a budoucí migrace

Při auditu si eviduj významné současné URL.

Nový web nemusí používat identickou strukturu URL, ale navrhni způsob, jak později vytvořit mapu:

`stará URL → nová URL`

pro HTTP 301 redirecty.

Tento mechanismus připrav architektonicky, ale není nutné při prototypu ručně mapovat celý historický web.

## 8. Kriticky modernizuj

Nesnaž se pouze převést současný web komponentu po komponentě.

Pokud současné řešení obsahuje například:

* příliš hluboké menu,
* duplicitní navigaci,
* dlouhé nečleněné stránky,
* nevhodné carousely,
* nekonzistentní galerie,
* dokumenty bez metadat,
* nejasné rozcestníky,

navrhni lepší moderní řešení.

Současně ale neodstraňuj funkci nebo obsah jen proto, že starý způsob prezentace není vhodný.

## 9. Průběžně ověřuj vlastní implementaci

Používej prohlížeč také pro kontrolu nového webu.

Ověřuj:

* desktopové rozložení,
* mobilní rozložení,
* navigaci,
* klávesnicové ovládání,
* formuláře a filtry,
* galerie,
* vyhledávání,
* dlouhé články,
* stránky oborů,
* stránky s větším množstvím dokumentů,
* stavy bez obsahu,
* velmi dlouhé názvy.

Oprav zjevné problémy, které při prohlížení najdeš.

## 10. Výstup auditu

Do projektu přidej stručný soubor:

`CURRENT-SITE-AUDIT.md`

Obsahující:

* co bylo na současném webu nalezeno,
* co bylo zachováno,
* co bylo změněno,
* které části zatím prototyp nepokrývá,
* které otázky bude potřeba rozhodnout později.

Audit má být stručný a praktický.

Prioritou zůstává funkční implementace, nikoli dokumentace.


# Instrukce pro Codex — varianta A: Astro + Git-based CMS

## Cíl experimentu

Vytvoř kompletní funkční prototyp moderního veřejného webu SŠPU Opava.

Toto není finální grafický návrh. Hlavním cílem je co nejrychleji získat reálně použitelný web, na kterém bude možné experimentovat s informační architekturou, komponentami, způsobem publikování, vyhledáváním, galeriemi a dalšími funkcemi.

Použij:

* Astro jako základ veřejného webu,
* Tailwind CSS pro styling,
* Decap CMS jako Git-based redakční rozhraní,
* Git jako skutečné úložiště obsahu,
* Pagefind nebo ekvivalentně vhodné řešení pro komplexní fulltextové vyhledávání.

Pokud při implementaci zjistíš, že některé dílčí technické řešení lze udělat lépe jinak, rozhodni se sám. Neber tuto specifikaci jako zákaz použít vhodnější knihovnu nebo architektonický postup. Důležitý je kvalitní funkční výsledek.

Nezdržuj se detailním grafickým designem. Vytvoř čistý, moderní, responzivní a profesionální základ s dobře oddělenými design tokens a komponentami, aby bylo možné později kompletně změnit vizuální styl bez zásahu do obsahové a aplikační architektury.

---

## 1. Charakter webu

Web je veřejný prezentační web střední školy.

Nemá být:

* LMS,
* školní informační systém,
* komplexní workflow CMS,
* interní portál.

Obsah budou spravovat přibližně 2–3 poučení administrátoři.

Prioritami jsou:

1. rychlost,
2. jednoduchost,
3. přístupnost,
4. kvalitní práce s obsahem,
5. velmi dobré SEO,
6. snadná strojová čitelnost obsahu,
7. jednoduché publikování,
8. kvalitní vyhledávání,
9. dlouhodobá udržovatelnost,
10. komponentová architektura.

---

## 2. Obsahový model

Navrhni čistý a dlouhodobě udržitelný obsahový model minimálně pro následující entity.

### Stránky

Běžné statické/informační stránky.

Stránka nesmí být omezena pouze na jeden dlouhý WYSIWYG text.

Navrhni jednoduchý blokový obsahový systém umožňující podle potřeby skládat například:

* formátovaný text,
* obrázek,
* video/embed,
* 2–4 responzivní sloupce,
* zvýrazněný informační blok,
* CTA,
* galerii,
* seznam příloh,
* seznam článků,
* seznam událostí,
* kontaktní osoby,
* citaci,
* FAQ,
* jiné rozumné opakovaně použitelné komponenty.

Nepřeháněj množství bloků. Jde o prototyp, který se později rozšíří podle praktických zkušeností.

### Aktuality / články

Článek má podporovat minimálně:

* název,
* slug,
* perex,
* formátovaný obsah,
* datum publikace,
* datum poslední změny,
* autora,
* titulní obrázek,
* další multimédia,
* přílohy,
* jednu nebo více kategorií,
* libovolný počet tagů,
* přiřazení k jednomu nebo více studijním oborům,
* související galerii,
* ručně vybrané doporučené články,
* stav publikováno / koncept,
* možnost naplánovat nebo alespoň evidovat datum publikace.

Pokud nejsou ručně zvolené doporučené články, může frontend nabídnout relevantní články podle oborů, kategorií nebo tagů.

### Studijní obory

Založ pět demonstračních oborů:

* Strojírenství,
* Informační technologie,
* Průmyslový design,
* Grafický design,
* Design hraček.

Obor je samostatná datová entita, nikoli pouze textový tag.

Články, galerie, dokumenty, události a osoby mohou být s obory propojeny.

### Galerie

Galerie má podporovat:

* název,
* slug,
* popis,
* datum,
* titulní obrázek,
* fotografie,
* pořadí fotografií,
* ALT text,
* volitelný popisek,
* vazby na článek,
* obory,
* tagy a kategorie.

Galerii zobrazuj responzivně a otevření snímků řeš přístupným lightboxem.

Připrav také automatizační skript, který dokáže ze složky fotografií připravit novou galerii:

* načíst obrázky,
* rozumně je optimalizovat,
* vytvořit potřebnou strukturu souborů,
* připravit metadata galerie,
* nechat administrátorovi možnost doplnit ALT texty a popisky.

Nepotřebujeme AI generování popisků, ale architektura mu v budoucnu nesmí bránit.

### Dokumenty

Dokument má mít minimálně:

* název,
* popis,
* soubor,
* kategorii,
* datum,
* případně platnost,
* tagy,
* vazbu na obor nebo stránku.

Dokumenty musí být snadno stahovatelné a jejich metadata prohledávatelná.

Pokud je rozumně možné indexovat také text PDF bez zbytečné komplikace, můžeš to implementovat. Není to podmínka první verze.

### Události

Podporuj:

* název,
* popis,
* datum a čas začátku,
* volitelný konec,
* místo,
* odkaz,
* typ události,
* vazby na obory,
* související článek nebo galerii.

Vytvoř přehled nejbližších událostí a jednoduchý kalendář/seznam.

### Lidé

Podporuj:

* jméno,
* pracovní pozici/funkci,
* pracoviště,
* telefon,
* e-mail,
* fotografii,
* stručný profil,
* vazby na obory.

Kontaktní informace musí být zobrazitelné pomocí opakovatelných komponent.

### Kategorie a tagy

Navrhni čisté rozlišení:

* kategorie jako řízená klasifikace,
* tagy jako volnější štítky.

Musí se používat nejen pro zobrazení, ale také pro filtrování, související obsah a vyhledávání.

---

## 3. Homepage

Vytvoř funkční homepage obsahující alespoň:

* globální hlavičku a navigaci,
* hero sekci,
* výrazné důležité informace / „Nepřehlédněte“,
* odkazy na pět studijních oborů,
* odkazy na obory zatím řeš úsporně textově bez fotografií,
* poslední aktuality,
* filtrování aktualit,
* nejbližší události,
* ukázku galerií / „Škola obrazem“,
* blok pro uchazeče,
* rychlý rozcestník podle cílové skupiny,
* footer.

Nepovažuj současnou podobu prototypu za závazný design.

---

## 4. Navigace

Pracuj přibližně s hlavní strukturou:

* Škola
* Obory a studium
* Uchazeči
* Aktuality
* Pro studenty
* Dokumenty
* Kontakt
* Vyhledávání

Doplň vhodnou:

* desktopovou navigaci,
* mobilní navigaci,
* breadcrumb navigaci,
* klávesnicové ovládání,
* viditelné focus stavy.

Architekturu navigace udělej datově řízenou, aby šla později snadno změnit.

---

## 5. Typové stránky

Implementuj minimálně:

* homepage,
* běžnou statickou stránku,
* stránku studijního oboru,
* seznam aktualit,
* detail článku,
* seznam galerií,
* detail galerie,
* dokumentový přehled,
* přehled událostí,
* kontakty / lidé,
* výsledky vyhledávání.

Není nutné, aby byly všechny graficky dokonale propracované.

Musí být funkční, konzistentní a komponentové.

---

## 6. Decap CMS

Připrav plně použitelnou administraci.

Administrátor musí být schopen bez ručního zásahu do zdrojového kódu:

* vytvořit článek,
* upravit článek,
* používat rich-text/WYSIWYG editaci,
* nahrát obrázek,
* přidat přílohu,
* vybrat kategorie,
* vybrat více oborů,
* přidat tagy,
* zvolit doporučené články,
* vytvořit galerii,
* vytvořit událost,
* upravit osobu,
* upravit statickou stránku a její obsahové bloky.

Pro vývoj připrav co nejsnazší lokální workflow.

Chci být schopen projekt spustit a CMS ihned vyzkoušet.

Produkční Git autentizaci neřeš přehnaně složitě. Připrav a zdokumentuj doporučenou cestu pro GitHub nebo jiné vhodné Git úložiště, ale hlavní prioritou této fáze je funkční prototyp.

Neimplementuj složitý workflow schvalování ani rozsáhlé role.

---

## 7. Vyhledávání

Vytvoř skutečné fulltextové vyhledávání napříč veřejným obsahem.

Indexuj:

* statické stránky,
* články,
* obory,
* galerie,
* dokumenty,
* události,
* osoby.

Vyhledávání má pracovat nejen s textem, ale také s metadaty.

Umožni podle možností filtrovat například podle:

* typu obsahu,
* oboru,
* kategorie,
* tagu,
* roku.

Výsledky musí mít:

* nadpis,
* typ výsledku,
* krátký relevantní kontext,
* URL,
* vhodná metadata.

Navigaci, footer a opakované technické texty do fulltextu nezahrnuj.

Preferuj řešení bez samostatného vyhledávacího serveru, pokud je pro velikost školního webu dostatečné.

---

## 8. Responzivita a interaktivita

Web musí fungovat od malých mobilních displejů po velký desktop.

Používej JavaScript jen tam, kde poskytuje skutečný přínos.

Implementuj vhodným způsobem například:

* mobilní menu,
* filtrování aktualit,
* lightbox galerie,
* „načíst další“ / stránkování,
* vyhledávání,
* responzivní obsahové bloky.

Nevytvářej z veřejného webu zbytečně SPA.

Obsah musí zůstat dostupný i jako kvalitní HTML.

---

## 9. Přístupnost

Cílem je WCAG 2.2 AA.

Dbej minimálně na:

* sémantické HTML,
* správnou hierarchii nadpisů,
* landmarks,
* skip-link,
* focus management,
* ovládání klávesnicí,
* dostatečný kontrast,
* ALT texty,
* přístupné formuláře,
* přístupné modaly/lightboxy,
* respektování `prefers-reduced-motion`,
* přiměřené dotykové cíle,
* rozumné chování při zvětšení textu.

Přístupnost neřeš jako dodatečný patch. Zahrň ji do komponent.

---

## 10. SEO a strojová / AI čitelnost

Veškerý důležitý veřejný obsah renderuj do sémantického HTML.

Implementuj podle typu obsahu vhodně:

* `<title>` a meta description,
* canonical URL,
* Open Graph,
* metadata pro sociální sítě,
* sitemap,
* robots.txt,
* RSS pro aktuality,
* strukturovaná data Schema.org / JSON-LD,
* BreadcrumbList,
* Article/NewsArticle,
* Event,
* Person,
* School/EducationalOrganization podle vhodnosti.

Vytvoř také jednoduchý strojově čitelný index veřejného obsahu, pokud je to užitečné.

Můžeš experimentálně přidat `llms.txt`, ale nepovažuj jej za náhradu kvalitního HTML, sitemap, RSS a strukturovaných dat.

AI a vyhledávače musí být schopny důležitý obsah získat bez spuštění složité klientské aplikace.

---

## 11. Výkon

Usiluj o velmi dobré Core Web Vitals.

Použij zejména:

* statické generování všude, kde dává smysl,
* minimální klientský JavaScript,
* optimalizované obrázky,
* responzivní velikosti obrázků,
* lazy loading mimo kritický viewport,
* rozumnou práci s fonty,
* stabilní layout bez zbytečných CLS,
* cache-friendly statické assety.

Nevytvářej backend jen proto, že je to možné.

---

## 12. Automatizace

Připrav praktické příkazy alespoň pro:

* spuštění webu,
* build,
* preview,
* lokální CMS,
* vytvoření galerie ze složky,
* kontrolu obsahu,
* kontrolu interních odkazů,
* vytvoření vyhledávacího indexu.

Pokud vidíš další repetitivní administrátorskou činnost, kterou lze elegantně automatizovat, implementuj ji nebo připrav rozšiřitelný základ.

---

## 13. Testovací obsah

Nevytvářej jen prázdnou kostru.

Přidej demonstrační obsah tak, aby bylo možné reálně otestovat:

* homepage,
* všech pět oborů,
* alespoň 10 článků různých kategorií,
* články přiřazené více oborům,
* tagy,
* alespoň 2 galerie,
* několik dokumentů,
* několik událostí,
* několik osob,
* doporučené články,
* fulltext a filtry.

Texty nemusí být definitivní.

---

## 14. Dokumentace

Vytvoř stručnou, ale praktickou dokumentaci:

* `README.md`
* architektura projektu,
* obsahový model,
* způsob spuštění,
* práce s CMS,
* přidání článku,
* přidání galerie,
* přidání dokumentu,
* build a deployment,
* kde se později mění design.

Popiš také výhody, omezení a případná slabá místa této Git-based varianty, která bych měl při srovnání s druhým prototypem sledovat.

---

## 15. Kvalita implementace

Používej TypeScript tam, kde přináší hodnotu.

Preferuj:

* malé komponenty,
* jasné datové modely,
* jednoduchou architekturu,
* malé množství závislostí,
* žádné zbytečné abstrahování,
* validaci obsahu,
* dobré chybové stavy.

Pokud narazíš na problém, vyřeš jej rozumně sám.

Nevytvářej dlouhou teoretickou analýzu místo implementace.

Cílem je skutečně spustitelný funkční prototyp, na kterém lze začít okamžitě experimentovat.

Na konci:

1. spusť všechny dostupné kontroly,
2. oprav chyby,
3. ověř produkční build,
4. vypiš stručně, co je implementováno,
5. uveď přesné příkazy, kterými web a CMS spustím.
