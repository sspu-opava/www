import type { CollectionEntry } from 'astro:content';

export type PersonEntry = CollectionEntry<'people'>;
export type PersonData = PersonEntry['data'];

export interface PersonPhoto {
  src: string;
  alt: string;
  focalPoint?: string;
}

export function formatPersonName(data: Pick<PersonData, 'name' | 'titlesBefore' | 'titlesAfter'>) {
  const before = data.titlesBefore?.trim();
  const after = data.titlesAfter?.trim();
  return `${before ? `${before} ` : ''}${data.name.trim()}${after ? `, ${after}` : ''}`;
}

export function getPersonPosition(data: Pick<PersonData, 'position' | 'role'>) {
  return data.position?.trim() || data.role?.trim() || '';
}

export function getPersonWorkplace(data: Pick<PersonData, 'workplace' | 'department'>) {
  return data.workplace?.trim() || data.department?.trim() || '';
}

export function getPersonPhones(data: Pick<PersonData, 'phone' | 'phones'>) {
  return data.phones?.length ? data.phones : data.phone ? [data.phone] : [];
}

export function getPersonStudyFields(data: Pick<PersonData, 'studyFields' | 'programs'>) {
  return data.studyFields?.length ? data.studyFields : data.programs;
}

export function isPersonVisible(data: Pick<PersonData, 'showInContacts' | 'contactVisible'>) {
  return data.showInContacts ?? data.contactVisible ?? true;
}

export function getPersonPhoto(data: Pick<PersonData, 'photo' | 'photoAlt' | 'photoFocalPoint' | 'name'>): PersonPhoto | undefined {
  if (!data.photo) return undefined;
  if (typeof data.photo === 'string') {
    return { src: data.photo, alt: data.photoAlt?.trim() || data.name, focalPoint: data.photoFocalPoint };
  }
  return {
    src: data.photo.src,
    alt: data.photo.alt?.trim() || data.name,
    focalPoint: data.photo.focalPoint
  };
}

export function getPhoneHref(phone: string) {
  const firstNumber = phone.match(/\+?\d[\d\s]{7,}/)?.[0] ?? phone;
  return `tel:${firstNumber.replace(/[^\d+]/g, '')}`;
}

export function normalizePersonText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('cs-CZ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function findPersonByDisplayName(people: PersonEntry[], value: string) {
  const normalizedValue = normalizePersonText(value);
  return people.find((person) => normalizedValue.includes(normalizePersonText(person.data.name)));
}
