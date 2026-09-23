# Pages CMS — redakční příručka

Pages CMS je hlavní editor tohoto webu. Ukládá Markdown a metadata do Gitu; veřejný web sestavuje Astro. Databáze ani vlastní server administrace nejsou potřeba.

## Připojení

1. V GitHub repozitáři nastavte Settings → Pages → GitHub Actions.
2. Přihlaste se do [Pages CMS](https://app.pagescms.org), připojte oficiální GitHub App k tomuto repozitáři a otevřete větev main.
3. Formuláře se načtou z .pages.yml. Uložení vytvoří commit a spustí kontroly a publikaci.
4. Výsledek ověřte v GitHub Actions. Zelený krok Publikovat znamená úspěšné nasazení; při chybě zůstává předchozí verze webu.

Připojení do vašeho účtu a skutečné uložení přes hostovaný editor musí ověřit správce. Lokální kontrola YAML ani test dat tuto interakci nenahrazují.

## Článek

1. Vyplňte titulek a krátký perex.
2. Napište Hlavní text ve vizuálním Markdownovém editoru. Používejte nadpisy od H2, odstavce, seznamy, odkazy, citace a základní zvýraznění. U obrázků napište ALT.
3. Obsahové bloky přidávejte jen tehdy, potřebujete-li například galerii, seznam dokumentů nebo kontakty. Jakmile seznam není prázdný, nahrazuje Hlavní text. Varování v reportu tuto situaci připomíná.
4. Nový záznam začíná jako Koncept. Vyplňte datum a změňte stav na Publikováno, až je text připraven.
5. Vyberte autora, kategorii, obory a případně štítky. Prázdný autor znamená Redakce školy.
6. Doplňte cover, přílohy, galerii a doporučené články podle potřeby. SEO obvykle nechte prázdné; použije se název a perex.

Datum článku je den podle Europe/Prague. Budoucí publikovaný článek se nezobrazí před tímto dnem. Zveřejní ho první úspěšný build po začátku dne; pravidelná akce běží každou hodinu, GitHub ale může běh zpozdit. Pro okamžité sestavení použijte ruční akci.

Starší články mohou obsahovat HTML. Při jeho úpravě použijte přepínač Markdown/Source, aby vizuální editor nepřepsal složitější vložený obsah. Nový blok Formátovaný text používá Markdown bez surového HTML.

Koncepty nejsou veřejné. I koncept musí mít platný datový tvar a základní povinná pole, aby neblokoval společný build. Náhled konceptu na veřejné URL není implementován; veřejný náhled ukazuje až poslední úspěšně sestavený obsah.

## Galerie

Pro malou galerii založte záznam, vyplňte název, popis a datum a přidávejte fotografie do seznamu. Každá položka obsahuje soubor, povinný ALT a volitelný viditelný popisek. Řádky lze sbalit a seřadit. Titulní fotografie je volitelná; bez výběru se použije první fotografie.

ALT popisuje důležité dění na konkrétním snímku, např. „Studentka brousí dřevěný model hračky“. Název souboru ani stejný název galerie na všech fotografiích nejsou kvalitním popisem. Viditelný popisek přidává okolnosti, jména nebo autorství.

Hromadné nahrání do knihovny médií samo nevytvoří řádky galerie s ALT a popisky. Pro větší sadu je připraven helper:

```powershell
npm run gallery:create -- 'C:\fotky\vystava' vystava-2026 'Výstava studentských prací'
```

Helper seřadí soubory přirozeně podle čísel v názvech, vytvoří WebP kopie do samostatné složky (nejvýše 1600 px na delší straně), opraví orientaci podle EXIF a do výstupů nepřenese EXIF. Založí koncept s pomocnými ALT. Tyto ALT a pomocný popis musíte před publikací doplnit. Zdrojové soubory ani existující galerii nepřepisuje. Při neúspěšném zpracování zkontrolujte rozpracovanou novou složku před dalším importem.

Změny z helperu uložte do Gitu a pokračujte v Pages CMS. Není potřeba vlastní správce médií ani AI generování popisů.

## Ostatní kolekce

| Kolekce | Běžný postup a důležité pravidlo |
| --- | --- |
| Stránky | Název, perex, text nebo bloky, publikace, SEO. U používaných stránek neměňte soubor/URL bez kontroly navigace. |
| Obory | Název, popis, kód, forma, kapacita, obsah a kontakty. Bloky se vykreslují celé. Bez bloků zůstává prezentační šablona s redakčním textem a metadaty. |
| Dokumenty | Název, popis, soubor, vydání, případná platnost, stav a kategorie. Datum platnosti upozorňuje na revizi; samo dokument nemaže. |
| Události | Název, perex, začátek, případný konec a místo. Časy HH:mm jsou místní časy v Opavě. Konec vícedenní akce je včetně posledního dne. Staré akce zůstávají v archivu. |
| Lidé | Jméno, funkce, pracoviště, kontakty, profil a foto. Zveřejnění osoby a zařazení do hlavního přehledu jsou dvě různá pole. Publikovaná osoba má vlastní dohledatelnou stránku. |
| Kategorie | Malý řízený slovník pro články, galerie a dokumenty. Název měňte spolu s existujícími vazbami. |
| Štítky | Volná témata; nevzniká samostatná kolekce. Dodržujte stejné názvy. Události používají omezený výběr. |
| Projekty | Obsah a shrnutí, stav realizace, samostatný stav publikace, termíny, financování a odkazy. |
| Pracovní nabídky | Firma, pozice a text; stav nabídky je oddělený od viditelnosti. Termín platnosti a „Vyžaduje ověření“ patří do pravidelné redakční revize. |
| Úvodní upozornění | Vyberte skutečný článek, popisek a vzhled. Datum konce skryje upozornění od následujícího dne při dalším buildu. |

Reference zobrazují obsahové názvy, ne názvy souborů. Většina vazeb ukládá filename s .md; web přijímá i původní slugy. Kategorie a autoři zachovávají původní názvové hodnoty, aby se existující výběry v CMS neztratily. Validátor přijímá oba formáty. Přejmenování souboru, kategorie nebo autora může vyžadovat opravu vazeb; změna se nepropaguje automaticky do všech záznamů.

U kontaktů zvolte existující skupinu: vedení, kolegium, administrativa, učitelé nebo školská rada. Hlavní telefon a další telefony nezadávejte duplicitně.

## Média a rychlost

| Obsah | Složka v repozitáři |
| --- | --- |
| Fotografie článků | public/uploads/articles |
| Obecné obrázky | public/uploads/images |
| Galerie | public/uploads/galleries |
| Portréty | public/uploads/people |
| Dokumenty | public/uploads/documents |
| Přílohy | public/uploads/attachments |
| Pracovní nabídky | public/uploads/job-offers |

Nové soubory neukládejte do kořene uploads. Nevkládejte do obrázků text, který má být čitelný jako běžný obsah stránky.

Každý build připraví WebP varianty šířky 480, 960 a 1600 px bez zvětšování malých obrázků. Karty, hero obrázky, bloky a galerie je vybírají pomocí srcset. Originál zůstává pro velký náhled a jako zdroj; generované varianty se necommitují. Hash obsahu umožní opakované využití již připravených variant. Externí obrázky ani videa tento lokální krok nezpracovává.

Akce v knihovně médií připraví stejné náhledy a zprávu jako artefakt GitHub Actions. Neprovádí skrytý commit. Běžná publikace náhledy připravuje automaticky, takže správce nemusí ručně přepisovat cesty v obsahu. AVIF zatím negenerujeme: další formát a delší build zde nepřináší prokazatelnou hodnotu vůči již připravenému WebP.

## Kontroly a řešení chyb

- Kontrola obsahu, ALT, metadat a platnosti: povinné údaje, neplatná data, neexistující vztahy, duplicitní slugy, dlouhé titulky, nedoplněné ALT, prošlé položky a záznamy bez příchozí obsahové vazby.
- Kontrola interních odkazů: sestaví web a ověří odkazy, soubory, obrázky i kotvy v HTML a cíle v sitemap, RSS a obsah.json.
- Znovu sestavit a publikovat web: celý ověřený publikační postup včetně Pagefind.

Otevřete souhrn běhu GitHub Actions nebo artefakt redakcni-kontroly. Chyby jsou nahoře a obsahují soubor i pole. Opravte záznam a uložte jej znovu. Upozornění na starší událost neznamená automaticky chybu: jde o podnět ke kontrole archivu. „Bez příchozí vazby“ neznamená nedostupnou stránku; záznam může být stále dostupný ve svém přehledu.

Při špatné redakční změně vraťte konkrétní commit pomocí GitHubu a vyčkejte na nový build. Nepřepisujte celou historii. Domluvte si, kdo upravuje jeden konkrétní záznam, aby si dva správci nepřepsali změny.

Starší školní archiv je externí závislost popsaná v README a src/data/external-content.json. Odkazy na něj nejsou součástí lokální kontroly existence souborů. Před převzetím jeho domény je nutné vyřešit migraci; deployment ji kontroluje.

## Co ověřit při prvním připojení redakce

V hostovaném Pages CMS vytvořte koncept článku s formátovaným textem a dvěma obory, malou galerii s různými ALT, dokument, budoucí událost a změnu kontaktu. Ověřte uložení referencí, zachování starších neznámých polí, upload do správné složky, české popisky akcí a čitelnost hlášení z úmyslně neplatného data. Projděte pořadí fotografií po opětovném otevření. Tento test zahrnuje oprávnění skutečného GitHub účtu a je nutné provést po jeho připojení.

Dokumentované možnosti: [reference](https://pagescms.org/docs/configuration/fields/reference/), [bloky](https://pagescms.org/docs/configuration/fields/block/), [seznamy](https://pagescms.org/docs/configuration/content/list/), [rich-text](https://pagescms.org/docs/configuration/fields/rich-text/). Konfigurace nepoužívá nedokumentované fieldsets ani vlastní toolbar.
