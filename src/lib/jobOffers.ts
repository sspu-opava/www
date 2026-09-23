import type { CollectionEntry } from 'astro:content';

export type JobOfferEntry = CollectionEntry<'jobOffers'>;
export type JobOfferStatus = 'active' | 'needs-review' | 'closed' | 'archived';
export type JobOfferType = 'job' | 'brigade' | 'internship' | 'practice';

const statusLabels: Record<JobOfferStatus, string> = {
  active: 'Aktuální nabídka',
  'needs-review': 'Vyžaduje ověření',
  closed: 'Uzavřená nabídka',
  archived: 'Archivní nabídka'
};

const typeLabels: Record<JobOfferType, string> = {
  job: 'Pracovní nabídka',
  brigade: 'Brigáda',
  internship: 'Stáž',
  practice: 'Praxe'
};

export function jobOfferStatusLabel(status: JobOfferStatus) {
  return statusLabels[status];
}

export function jobOfferTypeLabel(type: JobOfferType) {
  return typeLabels[type];
}

export function jobOfferStatusClass(status: JobOfferStatus) {
  return `job-offer-status-${status}`;
}

export function jobOfferDate(date?: Date) {
  if (!date) return 'Datum neuvedeno';
  return new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export function sortJobOffers(a: JobOfferEntry, b: JobOfferEntry) {
  if (a.data.featured !== b.data.featured) return Number(b.data.featured) - Number(a.data.featured);
  const publishedDifference = Number(b.data.publishedAt ?? 0) - Number(a.data.publishedAt ?? 0);
  return publishedDifference || a.data.company.localeCompare(b.data.company, 'cs') || a.data.position.localeCompare(b.data.position, 'cs');
}

export function jobOfferAttachmentDescription(type?: string) {
  return type ? `Dokument ${type.toUpperCase()} ke stažení.` : 'Dokument ke stažení.';
}
