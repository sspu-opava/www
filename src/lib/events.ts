import type { CollectionEntry } from 'astro:content';
import { eventTagLabel } from '../data/eventTags';
export { eventTagLabel } from '../data/eventTags';

export type EventEntry = CollectionEntry<'events'>;
export type EventData = EventEntry['data'];

export const EVENT_TIME_ZONE = 'Europe/Prague';

export function eventStartKey(event: Pick<EventEntry, 'data'>) {
  return `${event.data.startDate}T${event.data.startTime ?? '00:00'}`;
}

export function eventEndKey(event: Pick<EventEntry, 'data'>) {
  return `${event.data.endDate ?? event.data.startDate}T${event.data.endTime ?? (event.data.startTime ? event.data.startTime : '23:59')}`;
}

export function eventDateKey(value: string | Date) {
  if (typeof value === 'string') return value.slice(0, 10);
  return new Intl.DateTimeFormat('en-CA', { timeZone: EVENT_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(value);
}

export function currentMonthKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: EVENT_TIME_ZONE, year: 'numeric', month: '2-digit' }).formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '2026';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  return `${year}-${month}`;
}

export function eventOccursOn(event: Pick<EventEntry, 'data'>, date: string) {
  return event.data.startDate <= date && (event.data.endDate ?? event.data.startDate) >= date;
}

export function eventOccursInMonth(event: Pick<EventEntry, 'data'>, month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  if (!year || !monthNumber) return true;
  const monthStart = `${year.toString().padStart(4, '0')}-${monthNumber.toString().padStart(2, '0')}-01`;
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const monthEnd = `${year.toString().padStart(4, '0')}-${monthNumber.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
  return event.data.startDate <= monthEnd && (event.data.endDate ?? event.data.startDate) >= monthStart;
}

export function eventMatchesTags(event: Pick<EventEntry, 'data'>, tags: string[]) {
  return tags.length === 0 || tags.some((tag) => event.data.tags.includes(tag));
}

export function eventMatchesPrograms(event: Pick<EventEntry, 'data'>, programs: string[] | string = []) {
  const selected = Array.isArray(programs) ? programs : programs ? [programs] : [];
  return selected.length === 0 || selected.some((program) => event.data.programs.includes(program));
}

function dateFromCivilDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function formatEventDate(value: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'numeric', year: 'numeric' }) {
  return new Intl.DateTimeFormat('cs-CZ', { ...options, timeZone: EVENT_TIME_ZONE }).format(dateFromCivilDate(value));
}

export function formatEventDateRange(event: Pick<EventEntry, 'data'>) {
  const start = formatEventDate(event.data.startDate);
  const endDate = event.data.endDate ?? event.data.startDate;
  const isRange = endDate !== event.data.startDate || Boolean(event.data.endTime);
  const startWithTime = event.data.startTime ? `${start} ${event.data.startTime}` : start;
  if (!isRange) return startWithTime;
  const end = formatEventDate(endDate);
  const endWithTime = event.data.endTime ? `${end} ${event.data.endTime}` : end;
  if (event.data.endDate === event.data.startDate) return `${startWithTime}–${event.data.endTime ? ` ${event.data.endTime}` : ` ${endWithTime}`}`;
  return `${startWithTime} – ${endWithTime}`;
}

export function eventTagLabels(tags: string[]) {
  return tags.map(eventTagLabel);
}

export function eventMetadata(event: EventEntry) {
  return {
    id: event.id,
    slug: event.id,
    title: event.data.title,
    excerpt: event.data.excerpt,
    startDate: event.data.startDate,
    startTime: event.data.startTime ?? '',
    endDate: event.data.endDate ?? '',
    endTime: event.data.endTime ?? '',
    location: event.data.location ?? '',
    tags: event.data.tags,
    programs: event.data.programs
  };
}
