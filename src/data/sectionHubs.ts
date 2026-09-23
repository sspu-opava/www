import { heroImages } from './heroImages';

export type SectionHubCard = {
  label: string;
  href: string;
  description: string;
  icon: string;
};

export type SectionHub = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  icon: string;
  items: SectionHubCard[];
};

export const sectionHubs: Record<string, SectionHub> = {
  skola: {
    id: 'skola',
    label: 'Škola',
    eyebrow: 'Škola',
    title: 'Škola',
    description: 'Historie, lidé, školní život, projekty i místa, kde se potkává technika s tvorbou.',
    accent: '#C42079',
    icon: '/images/banners/skola.png',
    items: [
      { label: 'Historie a současnost', href: '/historie-a-soucasnost/', description: 'Příběh školy, její proměny a dnešní podoba.', icon: heroImages.history },
      { label: 'Lidé a kontakty', href: '/lide-a-kontakty/', description: 'Kontaktní údaje školy a profily zaměstnanců.', icon: heroImages.contacts },
      { label: 'Žáci a třídy', href: '/zaci-a-tridy/', description: 'Přehled tříd, oborů, třídních učitelů a statistik.', icon: heroImages.students },
      { label: 'Školní zpravodaj', href: '/skolni-zpravodaj/', description: 'Aktuality, úspěchy, projekty a dění ve škole.', icon: '/images/banners/aktuality.png' },
      { label: 'Kalendář akcí', href: '/kalendar-akci/', description: 'Termíny, setkání, výstavy a další školní akce.', icon: heroImages.calendar },
      { label: 'Fotogalerie', href: '/fotogalerie/', description: 'Škola obrazem, práce žáků i společné zážitky.', icon: heroImages.gallery },
      { label: 'Školská rada', href: '/skolska-rada/', description: 'Informace o školské radě a jejím působení.', icon: heroImages.schoolBoard },
      { label: 'Umělecká rada', href: '/umelecka-rada/', description: 'Poradní orgán pro směřování uměleckých oborů.', icon: heroImages.artisticCouncil },
      { label: 'Studentský parlament', href: '/studentsky-parlament/', description: 'Podněty a zápisy z jednání studentského parlamentu.', icon: heroImages.studentParliament },
      { label: 'Spolupráce', href: '/spoluprace/', description: 'Partnerství školy s firmami, institucemi a dalšími školami.', icon: heroImages.cooperation },
      { label: 'Projekty', href: '/projekty/', description: 'Projekty podporující výuku, technologie i mezinárodní zkušenosti.', icon: heroImages.projects },
      { label: 'Nabídka pronájmu', href: '/nabidka-pronajmu/', description: 'Možnosti využití tělocvičny, učeben a auly.', icon: heroImages.rental }
    ]
  },
  uchazeci: {
    id: 'uchazeci',
    label: 'Uchazeči',
    eyebrow: 'Uchazeči',
    title: 'Uchazeči',
    description: 'Vše podstatné pro rozhodování o studiu, přijímacím řízení i návštěvě školy.',
    accent: '#D0D543',
    icon: '/images/banners/studenti.png',
    items: [
      { label: 'Studijní obory', href: '/studijni-obory/', description: 'Přehled technických a uměleckých oborů školy.', icon: '/images/banners/obory.png' },
      { label: 'Přijímací řízení na technické obory', href: '/prijimaci-rizeni-technicke-obory/', description: 'Termíny, kritéria a podklady pro technické obory.', icon: '/images/banners/prijimacky.png' },
      { label: 'Přijímací řízení na umělecké obory', href: '/prijimaci-rizeni-umelecke-obory/', description: 'Talentová zkouška, termíny a podklady pro umělecké obory.', icon: '/images/banners/prijimacky.png' },
      { label: 'Akce pro ZŠ', href: '/akce-pro-zs/', description: 'Setkání, návštěvy a programy pro žáky základních škol.', icon: '/images/banners/akce.png' }
    ]
  },
  studenti: {
    id: 'studenti',
    label: 'Studenti',
    eyebrow: 'Studenti',
    title: 'Studenti',
    description: 'Rozvrhy, pravidla, podpora, materiály i příležitosti pro současné žáky.',
    accent: '#59BDDC',
    icon: '/images/banners/studenti.png',
    items: [
      { label: 'Rozvrh', href: '/rozvrh/', description: 'Stálé rozvrhy tříd, učitelů a učeben.', icon: '/images/banners/rozvrhy.png' },
      { label: 'Školní řád', href: '/skolni-rad/', description: 'Pravidla společného fungování školy.', icon: '/images/banners/skolni-rad.png' },
      { label: 'Maturity', href: '/maturity/', description: 'Termíny, informace a podklady k maturitní zkoušce.', icon: heroImages.maturity },
      { label: 'Školní poradenské pracoviště', href: '/skolni-poradenske-pracoviste/', description: 'Podpora při studijních, osobních a kariérových otázkách.', icon: '/images/banners/poradna.png' },
      { label: 'Výukové materiály', href: '/vyukove-materialy/', description: 'Materiály a odkazy pro výuku a samostatnou práci.', icon: '/images/banners/materialy.png' },
      { label: 'Nabídky zaměstnání', href: '/nabidky-zamestnani/', description: 'Práce, brigády, stáže a odborná praxe.', icon: '/images/banners/nabidka-zamestnani.png' },
      { label: 'Pro studenty a rodiče', href: '/pro-studenty-a-rodice/', description: 'Praktické informace a školní online systémy.', icon: '/images/banners/studenti.png' }
    ]
  },
  dokumenty: {
    id: 'dokumenty',
    label: 'Dokumenty',
    eyebrow: 'Dokumenty',
    title: 'Dokumenty',
    description: 'Výroční zprávy, kontrolní dokumenty, veřejné zakázky i povinně zveřejňované informace školy.',
    accent: '#59BDDC',
    icon: heroImages.documents,
    items: [
      { label: 'Výroční zpráva školy', href: '/vyrocni-zprava-skoly/', description: 'Souhrn činnosti a rozvoje školy za uplynulý rok.', icon: '/images/banners/zpravy.png' },
      { label: 'Inspekční zprávy', href: '/inspekcni-zpravy/', description: 'Zprávy a výsledky kontrol České školní inspekce.', icon: '/images/banners/zpravy.png' },
      { label: 'Veřejné zakázky', href: '/verejne-zakazky/', description: 'Zveřejňované informace k veřejným zakázkám.', icon: '/images/banners/verejne-zakazky.png' },
      { label: 'Rozpočet', href: '/rozpocet/', description: 'Rozpočtové a finanční informace školy.', icon: '/images/banners/rozpocet.png' },
      { label: 'Ochrana osobních údajů', href: '/ochrana-osobnich-udaju/', description: 'Informace o zpracování a ochraně osobních údajů.', icon: '/images/banners/osobni-udaje.png' },
      { label: 'Ochrana oznamovatelů', href: '/ochrana-oznamovatelu/', description: 'Informace k vnitřnímu oznamovacímu systému.', icon: '/images/banners/oznamovatele.png' },
      { label: 'Prohlášení o přístupnosti', href: '/prohlaseni-o-pristupnosti-webu/', description: 'Přístupnost webu a možnost nahlášení problému.', icon: '/images/banners/pristupnost.png' }
    ]
  },
  ostatni: {
    id: 'ostatni',
    label: 'Ostatní',
    eyebrow: 'Ostatní',
    title: 'Ostatní',
    description: 'Stránky, které stojí mimo hlavní čtyři tematické bloky, ale stále patří do školního webu.',
    accent: '#1A4053',
    icon: '/images/banners/skola.png',
    items: [
      { label: 'Přehled školy', href: '/skola/o-skole/', description: 'Základní představení školy, výuky a jejího zázemí.', icon: '/images/banners/skola.png' },
      { label: 'Fotogalerie uměleckých oborů', href: '/fotogalerie-umeleckych-oboru/', description: 'Samostatný přehled galerií umělecké části školy.', icon: heroImages.gallery },
      { label: 'Vyhledávání', href: '/vyhledavani/', description: 'Vyhledávání napříč stránkami, aktualitami a dokumenty.', icon: heroImages.documents }
    ]
  }
};
