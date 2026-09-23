export type HeroAction = {
  label: string;
  href: string;
  variant: 'primary' | 'secondary' | 'text';
  external?: boolean;
};

export type HeroTab = {
  id: string;
  label: string;
  color: string;
  textColor: string;
  image: string;
  eyebrow?: string;
  title: string;
  motto?: string;
  description?: string;
  actions: HeroAction[];
};

const strojirenstviImage = '/images/programs/strojirenstvi-banner.webp';
const informacniTechnologieImage = '/images/programs/informacni-technologie-banner.webp';
const designHracekImage = '/images/programs/obor-design-hracek-banner.webp';
const prumyslovyDesignImage = '/images/programs/prumyslovy-design-banner.webp';
const graphicImage = '/images/programs/graficky-design-banner.webp';
const schoolImage = '/images/programs/skola-budova.webp';

export const heroTabs: HeroTab[] = [
  {
    id: 'strojirenstvi',
    label: 'Strojírenství',
    color: '#1A4053',
    textColor: '#FFFFFF',
    image: strojirenstviImage,
    eyebrow: 'Technický obor',
    title: 'Strojírenství',
    description: 'Konstrukce, výroba a digitální technologie v jednom praktickém studiu.',
    actions: [
      { label: 'Chci studovat Strojírenství', href: '/obory/strojirenstvi/', variant: 'primary' },
      { label: 'Podmínky přijetí', href: '/uchazeci/', variant: 'secondary' }
    ]
  },
  {
    id: 'informacni-technologie',
    label: 'Informační technologie',
    color: '#59BDDC',
    textColor: '#102A43',
    image: informacniTechnologieImage,
    eyebrow: 'Technický obor',
    title: 'Informační technologie',
    description: 'Programování, sítě a digitální tvorba pro svět, který se mění.',
    actions: [
      { label: 'Chci studovat Informační technologie', href: '/obory/informacni-technologie/', variant: 'primary' },
      { label: 'Podmínky přijetí', href: '/uchazeci/', variant: 'secondary' }
    ]
  },
  {
    id: 'design-hracek',
    label: 'Design hraček',
    color: '#ECAFAC',
    textColor: '#102A43',
    image: designHracekImage,
    eyebrow: 'Umělecký obor',
    title: 'Design hraček',
    description: 'Nápad, materiál a příběh se potkávají v originálním produktu.',
    actions: [
      { label: 'Chci studovat Design hraček', href: '/obory/design-hracek/', variant: 'primary' },
      { label: 'Podmínky přijetí', href: '/uchazeci/', variant: 'secondary' }
    ]
  },
  {
    id: 'prumyslovy-design',
    label: 'Průmyslový design',
    color: '#D0D543',
    textColor: '#102A43',
    image: prumyslovyDesignImage,
    eyebrow: 'Umělecký obor',
    title: 'Průmyslový design',
    description: 'Navrhujte předměty, které fungují, komunikují a zůstávají.',
    actions: [
      { label: 'Chci studovat Průmyslový design', href: '/obory/prumyslovy-design/', variant: 'primary' },
      { label: 'Podmínky přijetí', href: '/uchazeci/', variant: 'secondary' }
    ]
  },
  {
    id: 'graficky-design',
    label: 'Grafický design',
    color: '#C42079',
    textColor: '#FFFFFF',
    image: graphicImage,
    eyebrow: 'Umělecký obor',
    title: 'Grafický design',
    description: 'Typografie, obraz a digitální média pro přesvědčivou komunikaci.',
    actions: [
      { label: 'Chci studovat Grafický design', href: '/obory/graficky-design/', variant: 'primary' },
      { label: 'Podmínky přijetí', href: '/uchazeci/', variant: 'secondary' }
    ]
  },
  {
    id: 'skola',
    label: 'Škola',
    color: '#6B7280',
    textColor: '#FFFFFF',
    image: schoolImage,
    eyebrow: 'Střední škola průmyslová a umělecká · Opava',
    title: 'Od nápadů k dovednostem, od dovedností k uplatnění.',
    actions: [
      { label: 'O škole', href: '/skola/o-skole/', variant: 'primary' },
      { label: 'Kontakty', href: '/kontakt/', variant: 'secondary' }
    ]
  }
];
