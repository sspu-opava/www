export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  href: string;
  items: NavItem[];
};

export type UtilityLink = NavItem & {
  id: 'facebook' | 'moodle' | 'office' | 'skola-online';
  shortLabel: string;
};

export const utilityLinks: UtilityLink[] = [
  { id: 'facebook', label: 'SŠPU Opava na Facebooku', shortLabel: 'Facebook', href: 'https://www.facebook.com/sspuopava', external: true },
  { id: 'moodle', label: 'Moodle SŠPU Opava', shortLabel: 'Moodle', href: 'https://moodle.sspu-opava.cz', external: true },
  { id: 'office', label: 'Microsoft 365', shortLabel: 'Microsoft 365', href: 'https://portal.office.com', external: true },
  { id: 'skola-online', label: 'Škola Online', shortLabel: 'Škola Online', href: 'https://skolaonline.cz', external: true }
];

export const mainNavigation: NavGroup[] = [
  {
    id: 'skola',
    label: 'Škola',
    href: '/skola/',
    items: [
      { label: 'Přehled školy', href: '/skola/' },
      { label: 'Historie a současnost', href: '/historie-a-soucasnost/' },
      { label: 'Lidé a kontakty', href: '/lide-a-kontakty/' },
      { label: 'Žáci a třídy', href: '/zaci-a-tridy/' },
      { label: 'Školní zpravodaj', href: '/skolni-zpravodaj/' },
      { label: 'Kalendář akcí', href: '/kalendar-akci/' },
      { label: 'Fotogalerie', href: '/fotogalerie/' },
      { label: 'Školská rada', href: '/skolska-rada/' },
      { label: 'Umělecká rada', href: '/umelecka-rada/' },
      { label: 'Studentský parlament', href: '/studentsky-parlament/' },
      { label: 'Spolupráce', href: '/spoluprace/' },
      { label: 'Projekty', href: '/projekty/' },
      { label: 'Nabídka pronájmu', href: '/nabidka-pronajmu/' }
    ]
  },
  {
    id: 'uchazeci',
    label: 'Uchazeči',
    href: '/uchazeci/',
    items: [
      { label: 'Přehled pro uchazeče', href: '/uchazeci/' },
      { label: 'Studijní obory', href: '/studijni-obory/' },
      { label: 'Přijímací řízení na technické obory', href: '/prijimaci-rizeni-technicke-obory/' },
      { label: 'Přijímací řízení na umělecké obory', href: '/prijimaci-rizeni-umelecke-obory/' },
      { label: 'Akce pro ZŠ', href: '/akce-pro-zs/' }
    ]
  },
  {
    id: 'studenti',
    label: 'Studenti',
    href: '/studenti/',
    items: [
      { label: 'Přehled pro studenty', href: '/studenti/' },
      { label: 'Rozvrh', href: '/rozvrh/' },
      { label: 'Školní řád', href: '/skolni-rad/' },
      { label: 'Maturity', href: '/maturity/' },
      { label: 'Školní poradenské pracoviště', href: '/skolni-poradenske-pracoviste/' },
      { label: 'Výukové materiály', href: '/vyukove-materialy/' },
      { label: 'Nabídky zaměstnání', href: '/nabidky-zamestnani/' },
      { label: 'Pro studenty a rodiče', href: '/pro-studenty-a-rodice/' }
    ]
  },
  {
    id: 'dokumenty',
    label: 'Dokumenty',
    href: '/dokumenty/',
    items: [
      { label: 'Přehled dokumentů', href: '/dokumenty/' },
      { label: 'Výroční zpráva školy', href: '/vyrocni-zprava-skoly/' },
      { label: 'Inspekční zprávy', href: '/inspekcni-zpravy/' },
      { label: 'Veřejné zakázky', href: '/verejne-zakazky/' },
      { label: 'Rozpočet', href: '/rozpocet/' },
      { label: 'Ochrana osobních údajů', href: '/ochrana-osobnich-udaju/' },
      { label: 'Ochrana oznamovatelů', href: '/ochrana-oznamovatelu/' },
      { label: 'Prohlášení o přístupnosti', href: '/prohlaseni-o-pristupnosti-webu/' }
    ]
  },
];
