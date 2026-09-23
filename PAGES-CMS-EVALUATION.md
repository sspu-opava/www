# Pages CMS vs. Decap CMS – věcné zhodnocení experimentu

Hodnocení vychází z implementace nad stejnými Astro Content Collections. Build, validace vztahů, generování Pagefind indexu a simulace GitHub Pages base path proběhly lokálně. Interaktivní klikání v hosted Pages CMS nelze bez přihlášeného GitHub účtu a instalace App dokončit z tohoto pracovního prostředí; finální redakční UX je proto potřeba ověřit podle checklistu v `PAGES-CMS.md`.

| Oblast | Pages CMS | Decap CMS |
| --- | --- | --- |
| Konfigurace | Jeden přehledný `.pages.yml`, komponenty a jasné media sources. | Zralý, známý `config.yml`; některé modely jsou deklarativně stručnější. |
| Rich text | Markdown `rich-text` se zapnutým Editor/Source přepínačem. | Markdown editor je funkční, ale práce se zdrojovým režimem je méně přímo součástí modelu. |
| Média | Více pojmenovaných zdrojů, bezpečné přejmenování a akce nad médii. | V tomto prototypu jeden společný `uploads` adresář; méně přehledné. |
| Galerie | Seřaditelný objektový seznam foto + ALT + popisek; dobře odpovídá datům. | Obdobný list funguje, ale nemá samostatné workflow nad media source. |
| Reference | Vyhledávací reference na lidi, obory, kategorie, články, galerie a stránky. | Relation widget už byl použit, ale ne konzistentně napříč entitami. |
| Blokové stránky | `block` field je přímý a čitelný, zachovává `type` v YAML. | List types fungují; konfigurace je v tomto prototypu užší. |
| Validace | Přidaný repozitářový validátor hlídá vztahy i konfiguraci. | Původní validátor kontroloval hlavně minimální data a ALT texty. |
| Dokumenty | Vlastní media source s omezenými příponami a vazbami. | File widget je jednodušší, ale sdílí jeden upload prostor. |
| UI administrace | Vypadá slibně pro menší Git tým, zejména reference a Actions; nutné ověřit s redaktory. | Lze spustit lokálně hned, což je silná výhoda při vývoji bez GitHubu. |
| Git workflow | Přímé GitHub commity a Actions jsou přirozený model. | Git Gateway je vhodná alternativa, ale vyžaduje vlastní napojení backendu. |
| Customizace | Konfigurace pokrývá běžné typy; atypické UI by vyžadovalo vlastní field nebo externí nástroj. | Rozsáhlejší ekosystém custom widgetů. |
| Budoucí automatizace | Repository/media actions lze volat z UI a předat GitHub Actions kontext. | Automatizace je spíš vedle CMS než přímo v něm. |
| Složitost údržby | Nízká: konfigurace + statické workflow, bez CMS serveru. | Lokální Decap server a provozní autentizace jsou další pohyblivé části. |

## Konkrétní omezení

- Pages CMS reference ukládají hodnotu souboru/jména. Přejmenování slugu proto není bezpečná hromadná migrace vztahů; po něm je nutné pustit kontrolu obsahu a opravit případné reference.
- Galerie mají dobré pořadí a metadata, ale automatické dávkové rozřazení nahraných souborů do složky podle slugu není v čisté konfiguraci ergonomické. Pro větší fotografické akce zůstává vhodný `npm run gallery:create` nebo budoucí Gallery Studio/GitHub Action.
- Optimalizační akce záměrně pouze vytváří varianty, nepřepisuje originály ani odkazy. Tím je bezpečná, ale zatím neřeší automatický výběr variant ve frontendu.
- Hosted UI a oprávnění GitHub App musí posoudit skuteční redaktoři na cílovém repozitáři; tento krok vyžaduje jejich GitHub účet.

## Doporučení

Pages CMS je smysluplné několikadenní testovat na běžných aktualitách, dokumentech a galeriích. Nevyhlašuji jej za automatického vítěze: Decap si ponechte pro srovnání lokálního workflow a Pages CMS vyhodnoťte po skutečném redakčním testu podle rychlosti práce s galerií, srozumitelnosti referencí a počtu potřebných oprav po změně slugů.
