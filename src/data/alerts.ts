import settings from './homepage-alerts.json';
import { civilToday } from '../lib/publication.mjs';
import type { CollectionEntry } from 'astro:content';

export type AlertVariant = 'text' | 'banner';
export type AlertTone = 'night' | 'brand' | 'mist' | 'accent';
export type AlertColumns = 4 | 6 | 8;

export type HomepageAlertDefinition = {
  id: string;
  articleId: string;
  enabled: boolean;
  variant: AlertVariant;
  tone: AlertTone;
  desktopColumns: AlertColumns;
  label?: string;
  expiresAt?: string;
};

export type ResolvedHomepageAlert = HomepageAlertDefinition & {
  article: CollectionEntry<'articles'>;
};

/**
 * Alert stores only presentation and editorial placement. The article remains
 * the single source of truth for title, perex, date and public URL.
 */
export const homepageAlertDefinitions = settings.alerts as HomepageAlertDefinition[];

export function resolveHomepageAlerts(articles: CollectionEntry<'articles'>[]): ResolvedHomepageAlert[] {
  const articleById = new Map(articles.map((article) => [article.id, article]));
  return homepageAlertDefinitions
    .filter((definition) => definition.enabled && (!definition.expiresAt || definition.expiresAt >= civilToday()))
    .map((definition) => {
      const article = articleById.get(definition.articleId.replace(/\.md$/i, ''));
      return article ? { ...definition, article } : undefined;
    })
    .filter((alert): alert is ResolvedHomepageAlert => Boolean(alert));
}
