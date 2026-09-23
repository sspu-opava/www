# Instrukce pro Codex — experimentální varianta SŠPU Opava s Pages CMS

## Cíl

V existujícím funkčním Astro projektu školního webu SŠPU Opava vytvoř alternativní administrační variantu využívající **Pages CMS**.

Nejde o nový redesign ani přepis veřejného webu.

Hlavním cílem je získat **co nejvěrnější paralelní variantu stávajícího prototypu s Decap CMS**, aby bylo možné objektivně porovnat:

* ergonomii administrace,
* editaci článků,
* práci s médii,
* správu vztahů mezi obsahem,
* galerijní workflow,
* správu dokumentů,
* správu událostí a lidí,
* možnosti obsahových bloků,
* budoucí rozšiřitelnost.

Zachovej frontend, routování, datový model a co nejvíce existující implementace.

Pokud je některá část současného modelu zbytečně přizpůsobená Decapu, můžeš ji rozumně zobecnit, ale nerozbíjej funkční veřejný web jen proto, aby vyhovoval Pages CMS.

---

# 1. Nejprve analyzuj současný projekt

Než začneš něco měnit:

1. projdi strukturu repozitáře,
2. zjisti, jak jsou definované Astro Content Collections,
3. prostuduj současnou konfiguraci Decap CMS,
4. zmapuj všechny existující typy obsahu,
5. zjisti, kde a jak se ukládají média,
6. zjisti vazby mezi entitami,
7. ověř současný build,
8. ověř, že frontend funguje.

Vytvoř si stručnou pracovní mapu:

* pages,
* articles,
* studyPrograms,
* galleries,
* documents,
* events,
* people,
* categories,
* tags,
* případné další entity.

Nepřepisuj datový model bez skutečného důvodu.

---

# 2. Zachovej Decap variantu

Neodstraňuj původní Decap konfiguraci ani funkčnost.

Cílem je mít možnost obě administrace porovnávat.

Pokud je vhodné:

* vytvoř samostatnou větev,
* nebo zachovej Decap soubory vedle Pages CMS,
* případně jasně zdokumentuj, jak mezi variantami přepnout.

Nikdy nevytvářej situaci, kdy pro vyzkoušení Pages CMS ztratím funkční Decap konfiguraci.

---

# 3. Přidej Pages CMS

Použij současnou stabilní konfiguraci Pages CMS.

V kořeni projektu vytvoř:

```text
.pages.yml
```

Nakonfiguruj Pages CMS tak, aby pracoval přímo nad existujícími soubory Astro Content Collections.

Obsah zůstává v Git repozitáři.

Pages CMS je pouze editační vrstva.

Nevytvářej druhou kopii obsahu ani vlastní databázi.

---

# 4. Obsahové kolekce

V Pages CMS zpřístupni minimálně:

## Stránky

Administrátor musí být schopen:

* založit stránku,
* změnit název,
* slug,
* metadata,
* editovat obsah,
* pracovat s obsahovými bloky,
* nastavit SEO metadata,
* publikovat/skrýt stránku, pokud to současný model podporuje.

---

## Aktuality / články

V administraci umožni pohodlně editovat:

* title,
* slug,
* perex,
* body,
* datum publikace,
* autor,
* titulní obrázek,
* další média,
* přílohy,
* kategorie,
* tagy,
* více studijních oborů,
* související galerii,
* doporučené články,
* stav publikace.

Pro hlavní text použij Pages CMS `rich-text`.

Preferuj Markdown jako uložený formát, pokud současná architektura nevyžaduje jinak.

Pokud je to vhodné, ponech uživateli možnost přepnout mezi:

* vizuálním editorem,
* zdrojovým Markdownem.

---

# 5. Reference mezi entitami

Maximálně využij Pages CMS `reference` fields tam, kde obsah skutečně odkazuje na jiné entity.

Nepoužívej volné textové zadávání slugů tam, kde může administrátor vybírat z existujících položek.

Například:

```text
article
 ├── author → people
 ├── studyPrograms → studyPrograms[]
 ├── categories → categories[]
 ├── relatedArticles → articles[]
 └── gallery → galleries
```

Podobně pro:

* galerie,
* dokumenty,
* události,
* osoby.

Dbej na to, aby UI bylo ergonomické i při větším množství položek.

---

# 6. Kategorie a tagy

Rozliš:

## Kategorie

Řízená klasifikace.

Použij samostatnou kolekci, pokud to současný datový model umožňuje.

## Tagy

Volnější označování obsahu.

Ověř, zda je pro tagy vhodnější:

* vlastní kolekce,
* seznam hodnot,
* nebo jiný model Pages CMS.

Vyber řešení, které nejlépe odpovídá praktickému redakčnímu použití.

---

# 7. Studijní obory

Zachovej pět existujících oborů:

* Strojírenství,
* Informační technologie,
* Průmyslový design,
* Grafický design,
* Design hraček.

Administrátor musí být schopen přiřazovat jeden nebo více oborů:

* článkům,
* galeriím,
* dokumentům,
* událostem,
* lidem.

Obory zůstávají samostatnými entitami.

---

# 8. Galerie

Tuto část propracuj pečlivě, protože bude důležitá pro porovnání s Decap CMS.

Administrátor musí být schopen:

* vytvořit galerii,
* zadat název a metadata,
* nahrát více fotografií,
* zvolit titulní fotografii,
* seřadit fotografie,
* doplnit ALT text,
* doplnit popisek,
* přiřadit galerii k článku,
* přiřadit obory,
* přiřadit kategorie a tagy.

Využij vhodně Pages CMS media configuration.

Pokud Pages CMS neumí některou ergonomickou operaci ideálně, nesnaž se ji násilně emulovat složitým hackem.

Místo toho:

1. implementuj nejlepší rozumnou variantu,
2. omezení jasně zaznamenej,
3. navrhni případný budoucí specializovaný Gallery Studio nebo GitHub Action.

---

# 9. Média

Nakonfiguruj samostatné media sources podle potřeby, například:

```text
images
documents
galleries
people
```

Pokud to odpovídá struktuře projektu.

Rozumně nastav:

* input path,
* output URL,
* allowed extensions,
* bezpečné přejmenování souborů.

Nevytvářej chaos typu:

```text
public/uploads/
```

pro úplně všechno, pokud lze strukturu rozdělit smysluplněji.

Při návrhu mysli na budoucí automatickou optimalizaci obrázků.

---

# 10. Dokumenty

Administrace dokumentů má umožnit:

* upload PDF a dalších povolených dokumentů,
* název,
* popis,
* datum,
* kategorii,
* tagy,
* vazby na obory,
* případnou platnost dokumentu.

Pokud Pages CMS podporuje samostatný media source pro dokumenty, použij jej.

---

# 11. Události

Administrátor musí pohodlně zadávat:

* název,
* popis,
* datum,
* čas,
* případný konec,
* místo,
* typ události,
* odkaz,
* obory,
* související článek,
* související galerii.

Použij vhodné date/datetime fields.

---

# 12. Lidé a kontakty

Administrace musí podporovat:

* jméno,
* titul/funkci,
* pracoviště,
* telefon,
* e-mail,
* fotografii,
* stručný profil,
* obory.

Kontakty musí zůstat samostatnými datovými entitami, aby se nemusely duplicitně zapisovat do stránek.

---

# 13. Obsahové bloky

Prověř možnosti Pages CMS `block` field.

Cílem je umožnit administrátorovi skládat běžné stránky z omezené sady opakovatelných bloků.

Minimálně vyzkoušej:

* text,
* obrázek,
* 2 sloupce,
* 3 sloupce,
* informační box,
* CTA,
* galerie,
* dokumenty,
* seznam článků,
* osoby/kontakty,
* FAQ.

Nepokoušej se vytvořit univerzální page builder.

Chci zjistit, zda je Pages CMS pro tento typ blokové práce příjemnější než Decap.

Především sleduj:

* čitelnost editoru,
* přidávání bloků,
* řazení,
* editaci vnořených polí,
* práci s referencemi.

---

# 14. Rich-text editor

Důkladně nakonfiguruj rich-text editor.

Chci být schopen prakticky vyzkoušet:

* nadpisy,
* odstavce,
* tučné/kurzíva,
* seznamy,
* odkazy,
* vložené obrázky,
* citace,
* případné další rozumné prvky.

Pokud Pages CMS umožňuje přepínání Editor / Source, zachovej jej.

Výsledný Markdown musí být čistý a rozumně čitelný i mimo CMS.

---

# 15. Media workflow a optimalizace

Zjisti, jak nejlépe využít Pages CMS Actions a GitHub Actions.

Připrav experimentální workflow například:

```text
Optimize images
```

které bude možné případně spustit z Pages CMS.

Nemusí jít o definitivní řešení.

Cílem je ověřit, zda lze budoucí specializované administrátorské operace integrovat přirozeně do Pages CMS.

Pokud to dává smysl, připrav GitHub Action, která například:

* najde nově přidané JPG/PNG,
* vytvoří optimalizované WebP/AVIF varianty,
* zachová originál podle zvolené strategie,
* vypíše report.

Neimplementuj destruktivní operace bez jasné dokumentace.

---

# 16. Vyhledávání

Nesahej zbytečně na současné veřejné vyhledávání.

Pokud projekt používá Pagefind, zachovej jej.

Ověř pouze, že obsah vytvořený přes Pages CMS je po buildu správně:

* vyrenderován,
* indexován,
* filtrovatelný,
* dostupný podle typu obsahu, oboru, kategorie a tagu.

---

# 17. SEO a AI dostupnost

Zachovej nebo oprav stávající:

* semantic HTML,
* metadata,
* Open Graph,
* canonical URLs,
* sitemap,
* robots.txt,
* RSS,
* JSON-LD,
* Article,
* Event,
* Person,
* School/EducationalOrganization,
* BreadcrumbList.

Pages CMS nesmí zavést obsahový model, který zhorší strojovou čitelnost veřejného webu.

Veškerý významný obsah musí zůstat dostupný ve výsledném HTML.

---

# 18. GitHub Pages

Protože jde o experimentální variantu, připrav deployment na GitHub Pages.

Použij GitHub Actions.

Při každé publikované změně:

```text
Pages CMS
    ↓
GitHub commit
    ↓
GitHub Actions
    ↓
validate
    ↓
Astro build
    ↓
Pagefind
    ↓
GitHub Pages
```

Ověř, že web správně funguje i pod GitHub Pages `base` path.

Pokud projekt již má deployment workflow, uprav jej místo vytváření duplicitního workflow.

---

# 19. GitHub Actions z Pages CMS

Pages CMS podporuje repository-level actions.

Prototypově zvaž přidání několika administrátorských akcí:

```text
Rebuild site
Optimize images
Validate content
Check broken links
```

Nepřidávej akci jen proto, že existuje.

Použij jen ty, které mohou být skutečně užitečné pro malý tým správců školního webu.

---

# 20. Konfigurace `.pages.yml`

Piš ji čistě a modulárně.

Pokud se skupiny polí opakují, využij Pages CMS `components`.

Typicky například:

```text
SEO fields
publication fields
study program relations
media metadata
```

Cílem je minimalizovat duplicity.

Komentuj pouze nejasné části.

Nevytvářej přehnaně komplikovanou konfiguraci.

---

# 21. Bezpečnost

Nepřidávej do repozitáře:

* tokeny,
* GitHub secrets,
* private keys,
* přístupové údaje.

Pokud je pro Pages CMS potřeba GitHub App nebo jiná autorizace, postup popiš v dokumentaci.

Preferuj oficiální Pages CMS GitHub App pro testování přes hosted Pages CMS.

---

# 22. Hosted Pages CMS

Pro první testovací workflow počítej s použitím:

```text
https://app.pagescms.org
```

Administrátor se přihlásí přes GitHub a otevře repozitář.

Není potřeba self-hostovat Pages CMS, pokud k tomu není konkrétní důvod.

Self-hosting pouze zdokumentuj jako budoucí možnost.

---

# 23. Reálné testování

Nevystač si s tím, že `.pages.yml` syntakticky funguje.

Otestuj skutečné redakční operace.

Minimálně:

## Článek

* vytvořit,
* editovat,
* přidat obrázek,
* přiřadit dva obory,
* přidat kategorie,
* tagy,
* doporučený článek,
* publikovat.

## Galerie

* vytvořit,
* přidat více snímků,
* změnit pořadí,
* přidat ALT,
* publikovat.

## Dokument

* upload PDF,
* metadata,
* vazby.

## Událost

* založit budoucí událost.

## Osoba

* změnit kontaktní údaje.

## Stránka

* přidat alespoň několik různých obsahových bloků.

Po každé operaci ověř:

```text
Pages CMS
→ GitHub
→ obsahový soubor
→ Astro build
→ veřejná stránka
```

---

# 24. Srovnání s Decap CMS

Vytvoř soubor:

```text
PAGES-CMS-EVALUATION.md
```

Nechci marketingový text.

Stručně a věcně popiš vlastní zkušenost z implementace.

Porovnej proti současné Decap variantě zejména:

| Oblast               | Pages CMS | Decap CMS |
| -------------------- | --------- | --------- |
| konfigurace          |           |           |
| rich text            |           |           |
| média                |           |           |
| galerie              |           |           |
| reference            |           |           |
| blokové stránky      |           |           |
| validace             |           |           |
| práce s dokumenty    |           |           |
| UI administrace      |           |           |
| Git workflow         |           |           |
| customizace          |           |           |
| budoucí automatizace |           |           |
| složitost údržby     |           |           |

Pokud je některá věc v Pages CMS horší, napiš to otevřeně.

Pokud je něco výrazně lepší, rovněž.

---

# 25. Dokumentace

Aktualizuj README nebo vytvoř:

```text
PAGES-CMS.md
```

Popiš:

## První spuštění

1. push projektu na GitHub,
2. otevření Pages CMS,
3. přihlášení přes GitHub,
4. instalace Pages CMS GitHub App,
5. výběr repozitáře,
6. práce s obsahem.

## Publikování

Vysvětli tok:

```text
editace
→ commit
→ build
→ deployment
```

## Obsahové kolekce

Popiš, kde se ukládají jednotlivé typy obsahu.

## Média

Popiš strukturu adresářů.

## GitHub Pages

Přidej přesný postup aktivace.

---

# 26. Zachovej možnost přímé editace

Obsah musí zůstat plně editovatelný:

* v Pages CMS,
* ve VS Code,
* přes Git.

Pages CMS nesmí vytvářet proprietární formát.

Výsledné Markdown/MDX/YAML/JSON soubory musí zůstat srozumitelné.

---

# 27. Neřeš finální grafiku

Současný frontend je funkční prototyp.

Není nutné jej redesignovat.

Oprav pouze věci, které jsou nutné pro nový obsahový model nebo které jsou objektivně rozbité.

Prioritou je administrace a redakční workflow.

---

# 28. Pracuj autonomně

Nezastavuj se kvůli drobným rozhodnutím.

Pokud Pages CMS nabízí více rozumných možností, vyber tu, která:

1. je nejjednodušší,
2. zachová čistá data,
3. bude příjemná pro administrátora,
4. nebude zbytečně komplikovat Astro.

Pokud narazíš na skutečné omezení Pages CMS, neobcházej jej stovkami řádků hacků.

Zaznamenej jej jako omezení a navrhni jednoduchou alternativu.

---

# 29. Hotový experiment

Před dokončením:

1. spusť validaci obsahu,
2. spusť Astro kontrolu,
3. spusť produkční build,
4. spusť Pagefind,
5. ověř interní odkazy, pokud projekt obsahuje checker,
6. ověř Pages CMS konfiguraci,
7. ověř několik reálných editací,
8. zkontroluj GitHub Pages deployment.

Nakonec vypiš:

* co bylo změněno,
* co zůstalo stejné,
* jak otevřu Pages CMS,
* jak provedu první editaci,
* jak publikuji,
* jak funguje deployment,
* známá omezení,
* co doporučuješ dále vyzkoušet.

Cílem není prohlásit Pages CMS za vítěze.

Cílem je vytvořit **férovou, prakticky použitelnou konkurenční administrační variantu**, kterou lze několik dní reálně používat a následně objektivně porovnat s Decap CMS.
