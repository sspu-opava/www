import type { CollectionEntry } from 'astro:content';

export type ProjectStatus = 'active' | 'completed' | 'archived';
export type ProjectEntry = CollectionEntry<'projects'>;

const statusLabels: Record<ProjectStatus, string> = {
  active: 'Probíhá',
  completed: 'Ukončený',
  archived: 'Archivní'
};

export function projectStatusLabel(status: ProjectStatus) {
  return statusLabels[status];
}

export function projectStatusClass(status: ProjectStatus) {
  return `project-status-${status}`;
}

export function formatProjectDate(value?: string) {
  if (!value) return '';
  if (/^\d{4}$/.test(value)) return value;
  const date = new Date(`${value.length === 7 ? `${value}-01` : value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('cs-CZ', value.length === 7
    ? { month: 'long', year: 'numeric' }
    : { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export function projectPeriod(project: ProjectEntry['data']) {
  const start = formatProjectDate(project.startDate);
  const end = formatProjectDate(project.endDate);
  if (start && end) return `${start} – ${end}`;
  return start || end || 'Období neuvedeno';
}

export function projectYears(project: ProjectEntry['data']) {
  return [project.startDate, project.endDate]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.slice(0, 4));
}
