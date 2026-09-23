export const TIME_ZONE = 'Europe/Prague';

export function civilToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function isCivilDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(Number(date)) && date.toISOString().slice(0, 10) === value;
}

export function isMonth(value) {
  return typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function publicationDue(value, now = new Date()) {
  if (value == null || value === '') return true;
  const iso = value instanceof Date ? value.toISOString() : String(value);
  if (isCivilDate(iso) || /^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/.test(iso)) return iso.slice(0, 10) <= civilToday(now);
  return Number(new Date(iso)) <= Number(now);
}

export function isPublished(collection, data, now = new Date()) {
  if (collection === 'projects') return data.publicationStatus !== 'draft';
  if (collection === 'jobOffers' || collection === 'job-offers') return data.visible !== false && publicationDue(data.publishedAt, now);
  return data.status === 'published' && (collection !== 'articles' || publicationDue(data.publishedAt, now));
}

/** Civil date/time in Prague, including the applicable daylight-saving offset. */
export function eventDateTime(date, time) {
  if (!time) return date;
  if (!isCivilDate(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new RangeError('Neplatné datum nebo čas události.');
  const formatter = new Intl.DateTimeFormat('sv-SE', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  // During the autumn overlap choose the first occurrence. A skipped spring
  // time has no occurrence and must be corrected by the editor.
  for (const offset of ['+02:00', '+01:00']) {
    const value = `${date}T${time}:00${offset}`;
    if (formatter.format(new Date(value)) === `${date} ${time}`) return value;
  }
  throw new RangeError('Tento místní čas neexistuje kvůli přechodu na letní čas.');
}
