import { heroImages } from './heroImages';
export type Alias = {
  slug: string;
  kind?: 'aktuality' | 'events' | 'gallery' | 'programs' | 'projects' | 'jobs' | 'contact' | 'students' | 'artGallery';
  pageId?: string;
  icon?: string;
  accent?: string;
  eyebrow?: string;
};

export const aliases: Alias[] = [
  { slug: 'historie-a-soucasnost', pageId: 'historie-soucasnost', icon: heroImages.history, eyebrow: 'Škola' },
  { slug: 'umelecka-rada', pageId: 'umelecka-rada', icon: heroImages.artisticCouncil, eyebrow: 'Škola' },
  { slug: 'studentsky-parlament', pageId: 'studentsky-parlament', icon: heroImages.studentParliament, eyebrow: 'Škola' },
  { slug: 'spoluprace', pageId: 'spoluprace', icon: heroImages.cooperation, eyebrow: 'Škola' },
  { slug: 'nabidka-pronajmu', pageId: 'nabidka-pronajmu', icon: heroImages.rental, eyebrow: 'Škola' },
  { slug: 'prijimaci-rizeni-technicke-obory', pageId: 'prijimaci-rizeni-technicke-obory', icon: heroImages.admissions, accent: '#59BDDC', eyebrow: 'Uchazeči' },
  { slug: 'prijimaci-rizeni-umelecke-obory', pageId: 'prijimaci-rizeni-umelecke-obory', icon: heroImages.admissions, accent: '#C42079', eyebrow: 'Uchazeči' },
  { slug: 'skolni-poradenske-pracoviste', pageId: 'spp', icon: '/images/banners/poradna.png', accent: '#D0D543', eyebrow: 'Studenti' },
  { slug: 'pro-studenty-a-rodice', pageId: 'pro-studenty', icon: heroImages.students, eyebrow: 'Studenti' },
  { slug: 'zaci-a-tridy', kind: 'students' },
  { slug: 'rozvrh', pageId: 'dokumenty-rozvrhy', icon: heroImages.schedules, eyebrow: 'Studenti' },
  { slug: 'skolni-rad', pageId: 'dokumenty-skolni-rad', icon: heroImages.schoolRules, eyebrow: 'Studenti' },
  { slug: 'skolska-rada', pageId: 'skolska-rada', icon: heroImages.schoolBoard, eyebrow: 'Škola' },
  { slug: 'maturity', pageId: 'maturity', icon: heroImages.maturity, eyebrow: 'Studenti' },
  { slug: 'vyukove-materialy', pageId: 'vyukove-materialy', icon: '/images/banners/materialy.png', eyebrow: 'Studenti' },
  { slug: 'vyrocni-zprava-skoly', pageId: 'dokumenty-vyrocni-zprava-skoly', icon: '/images/banners/zpravy.png', eyebrow: 'Dokumenty' },
  { slug: 'inspekcni-zpravy', pageId: 'dokumenty-inspekcni-zpravy', icon: '/images/banners/zpravy.png', eyebrow: 'Dokumenty' },
  { slug: 'verejne-zakazky', pageId: 'dokumenty-verejne-zakazky', icon: '/images/banners/verejne-zakazky.png', eyebrow: 'Dokumenty' },
  { slug: 'rozpocet', pageId: 'dokumenty-rozpocet', icon: '/images/banners/rozpocet.png', eyebrow: 'Dokumenty' },
  { slug: 'ochrana-osobnich-udaju', pageId: 'dokumenty-ochrana-osobnich-udaju', icon: '/images/banners/osobni-udaje.png', eyebrow: 'Dokumenty' },
  { slug: 'ochrana-oznamovatelu', pageId: 'dokumenty-ochrana-oznamovatelu', icon: '/images/banners/oznamovatele.png', eyebrow: 'Dokumenty' },
  { slug: 'prohlaseni-o-pristupnosti-webu', pageId: 'dokumenty-prohlaseni-o-pristupnosti-webu', icon: '/images/banners/pristupnost.png', eyebrow: 'Dokumenty' },
  { slug: 'skolni-zpravodaj', kind: 'aktuality' },
  { slug: 'kalendar-akci', kind: 'events' },
  { slug: 'fotogalerie', kind: 'gallery' },
  { slug: 'studijni-obory', kind: 'programs' },
  { slug: 'projekty', kind: 'projects' },
  { slug: 'nabidky-zamestnani', kind: 'jobs' },
  { slug: 'lide-a-kontakty', kind: 'contact' },
  { slug: 'fotogalerie-umeleckych-oboru', kind: 'artGallery' }
];
