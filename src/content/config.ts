import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { EVENT_TAG_VALUES } from '../data/eventTags';
import { isCivilDate } from '../lib/publication.mjs';

const status = z.enum(['published', 'draft']).default('published');
// Pages CMS reference fields naturally store a collection entry name such as
// `informacni-technologie.md`. The public site uses Astro slugs without the
// Markdown extension, so accept both forms at the content boundary.
const contentReference = z.string().trim().min(1).transform(value => value.replace(/\.md$/i, ''));
const optionalReference = z.preprocess(value => value == null || value === '' ? undefined : value, contentReference.optional());
const slugList = z.array(contentReference).default([]);
const optionalDate = z.preprocess((value) => value == null || value === '' ? undefined : value, z.coerce.date().optional());
const optionalUrl = z.preprocess((value) => value == null || value === '' ? undefined : value, z.string().url().optional());
const optionalString = z.preprocess((value) => value == null || value === '' ? undefined : value, z.string().optional());
const projectDate = z.preprocess(value => value == null || value === '' ? undefined : value, z.string().regex(/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/, 'Použijte rok, měsíc nebo datum ve formátu RRRR, RRRR-MM nebo RRRR-MM-DD.').optional());
const seo = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  canonical: optionalUrl,
  image: z.string().optional(),
  noindex: z.boolean().default(false)
}).optional();

const tableRow = z.union([
  z.array(z.string()),
  z.object({ cells: z.array(z.string()) })
]);
const contentBlock = z.discriminatedUnion('type', [
  z.object({ type: z.literal('heading'), level: z.enum(['h2', 'h3']).default('h2'), text: z.string() }),
  z.object({ type: z.literal('text'), title: z.string().optional(), text: z.string() }),
  z.object({ type: z.literal('richText'), title: z.string().optional(), text: z.string() }),
  z.object({ type: z.literal('image'), image: z.string(), alt: z.string(), caption: z.string().optional() }),
  z.object({ type: z.literal('youtube'), url: z.string().url(), title: z.string().optional() }),
  z.object({ type: z.literal('audio'), src: z.string().min(1), title: z.string().optional() }),
  z.object({ type: z.literal('table'), caption: z.string().optional(), headers: z.array(z.string()).min(1), rows: z.array(tableRow).default([]) }),
  z.object({ type: z.literal('notice'), title: z.string(), text: z.string() }),
  z.object({ type: z.literal('cta'), title: z.string(), text: z.string(), label: z.string(), href: z.string() }),
  // `columns` stays for existing content; Pages CMS offers the clearer 2/3-column variants below.
  z.object({ type: z.literal('columns'), items: z.array(z.object({ title: z.string(), text: z.string() })).min(2).max(4) }),
  z.object({ type: z.literal('twoColumns'), items: z.array(z.object({ title: z.string(), text: z.string() })).length(2) }),
  z.object({ type: z.literal('threeColumns'), items: z.array(z.object({ title: z.string(), text: z.string() })).length(3) }),
  z.object({ type: z.literal('gallery'), gallery: contentReference }),
  z.object({ type: z.literal('documents'), documents: slugList }),
  z.object({ type: z.literal('articles'), articles: slugList }),
  z.object({ type: z.literal('people'), people: slugList, showHeading: z.boolean().default(true), eyebrow: z.string().optional(), title: z.string().optional() }),
  z.object({ type: z.literal('downloads'), eyebrow: z.string().optional(), title: z.string().optional(), showHeading: z.boolean().default(true), variant: z.enum(['default', 'night']).default('default'), items: z.array(z.object({ label: z.string(), url: z.string(), description: z.string().optional() })).default([]) }),
  z.object({ type: z.literal('links'), eyebrow: z.string().optional(), title: z.string().optional(), items: z.array(z.object({ label: z.string(), url: z.string().min(1), description: z.string().optional(), kind: z.enum(['external', 'document']).default('external') })).default([]) }),
  z.object({
    type: z.literal('resourceGroups'),
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    groups: z.array(z.object({
      title: z.string(),
      category: z.string().optional(),
      description: z.string().optional(),
      items: z.array(z.object({ label: z.string(), url: z.string().min(1), description: z.string().optional(), kind: z.enum(['external', 'document']).default('document') })).default([]),
      series: z.array(z.object({
        urlTemplate: z.string().min(1),
        labelTemplate: z.string().optional(),
        count: z.number().int().positive(),
        start: z.number().int().default(1),
        pad: z.number().int().min(0).default(2),
        kind: z.enum(['external', 'document']).default('document')
      })).default([])
    })).default([])
  }),
  z.object({ type: z.literal('faq'), items: z.array(z.object({ question: z.string(), answer: z.string() })) })
]);
const contentBlocks = z.array(contentBlock).default([]);
const civilDate = z.string().refine(isCivilDate, 'Zadejte skutečné datum ve formátu RRRR-MM-DD.');
const localTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Použijte čas ve formátu HH:mm.');
const eventTags = z.array(z.enum(EVENT_TAG_VALUES)).default([]);

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: optionalDate,
    author: z.preprocess(value => value == null || value === '' ? 'Redakce školy' : value, z.string()),
    categories: slugList,
    tags: slugList,
    programs: slugList,
    cover: z.string().optional(),
    coverAlt: optionalString,
    gallery: optionalReference,
    attachments: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
    related: slugList,
    contentBlocks,
    homepage: z.object({
      featured: z.boolean().default(false),
      order: z.number().int().default(0)
    }).default({}),
    status,
    seo
  })
});

const programs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    code: z.string(),
    form: z.string(),
    capacity: z.number().int().nonnegative(),
    description: z.string(),
    heroImage: z.string().optional(),
    highlights: z.array(z.string()),
    careers: z.array(z.string()),
    relatedPeople: slugList,
    contentBlocks,
    status,
    seo
  })
});

const galleries = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    cover: z.preprocess(value => value == null ? '' : value, z.string().default('')),
    photos: z.array(z.object({ src: z.string(), alt: z.string(), caption: z.string().optional() })),
    article: optionalReference,
    programs: slugList,
    categories: slugList,
    tags: slugList,
    status,
    seo
  })
});

const documents = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    file: z.string(),
    category: z.string(),
    date: z.coerce.date(),
    validUntil: optionalDate,
    programs: slugList,
    tags: slugList,
    pages: slugList,
    status,
    seo
  })
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // Astro exposes the filename slug as `entry.slug` and omits the reserved
    // frontmatter key from `data`, so CMS-authored records keep this field optional.
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug smí obsahovat pouze malá písmena, číslice a pomlčky.').optional(),
    status: z.enum(['active', 'completed', 'archived']),
    publicationStatus: z.enum(['published', 'draft']).default('published'),
    startDate: projectDate,
    endDate: projectDate,
    programme: optionalString,
    call: optionalString,
    registrationNumber: optionalString,
    projectNumber: optionalString,
    funding: optionalString,
    topics: z.array(z.string()).default([]),
    summary: z.string(),
    featured: z.boolean().default(false),
    heroImage: z.string().optional(),
    gallery: z.array(z.object({ src: z.string().min(1), alt: z.string().min(1), caption: z.string().optional() })).default([]),
    partners: z.array(z.object({ name: z.string(), url: optionalUrl })).default([]),
    links: z.array(z.object({ label: z.string(), url: z.string().min(1), type: z.enum(['external', 'document', 'video']).optional() })).default([]),
    seo
  })
});

const events = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    contentBlocks,
    startDate: civilDate,
    startTime: optionalString.pipe(localTime.optional()),
    endDate: optionalString.pipe(civilDate.optional()),
    endTime: optionalString.pipe(localTime.optional()),
    location: optionalString,
    tags: eventTags,
    programs: slugList,
    attachments: z.array(z.object({ file: z.string().min(1), label: z.string(), description: z.string().optional() })).default([]),
    url: optionalUrl,
    article: optionalReference,
    gallery: optionalReference,
    status,
    seo
  }).superRefine((event, context) => {
    const endDate = event.endDate ?? event.startDate;
    if (endDate < event.startDate) context.addIssue({ code: z.ZodIssueCode.custom, path: ['endDate'], message: 'Konec události nemůže být před začátkem.' });
    if (endDate === event.startDate && event.startTime && event.endTime && event.endTime <= event.startTime) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['endTime'], message: 'Čas konce musí být pozdější než čas začátku.' });
    }
  })
});

const people = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    titlesBefore: optionalString,
    titlesAfter: optionalString,
    position: optionalString,
    workplace: optionalString,
    // Legacy aliases kept so existing Pages CMS records remain valid.
    role: optionalString,
    department: optionalString,
    phone: z.string().optional(),
    phones: z.array(z.string()).default([]),
    email: z.string().email(),
    photo: z.union([
      z.string(),
      z.object({ src: z.string(), alt: z.string().default(''), focalPoint: optionalString })
    ]).optional(),
    photoAlt: optionalString,
    photoFocalPoint: optionalString,
    profile: z.string().default(''),
    contentBlocks,
    groups: z.array(z.string()).default([]),
    studyFields: slugList,
    // Legacy alias kept for existing content and third-party imports.
    programs: slugList,
    showInContacts: z.boolean().optional(),
    contactVisible: z.boolean().optional(),
    status,
    seo
  }).superRefine((person, context) => {
    if (!person.position && !person.role) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['position'], message: 'Vyplňte funkci nebo pozici osoby.' });
    }
    if (!person.workplace && !person.department && person.groups.length === 0) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['workplace'], message: 'Vyplňte pracoviště osoby.' });
    }
  })
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    eyebrow: z.string().optional(),
    highlight: z.string().optional(),
    contentBlocks,
    status,
    seo
  })
});

const jobOffers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/job-offers' }),
  schema: z.object({
    title: z.string(),
    // Astro derives the public slug from the filename; keep the field optional
    // so CMS-authored records can still carry the explicit identifier.
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug smí obsahovat pouze malá písmena, číslice a pomlčky.').optional(),
    company: z.string(),
    companyUrl: optionalUrl,
    position: z.string(),
    type: z.enum(['job', 'brigade', 'internship', 'practice']).default('job'),
    status: z.enum(['active', 'needs-review', 'closed', 'archived']),
    visible: z.boolean().default(true),
    needsReview: z.boolean().default(false),
    location: optionalString,
    employmentType: optionalString,
    field: optionalString,
    summary: optionalString,
    publishedAt: optionalDate,
    expiresAt: optionalDate,
    featured: z.boolean().default(false),
    applyUrl: optionalUrl,
    attachments: z.array(z.object({ label: z.string(), file: z.string().min(1), type: optionalString })).default([]),
    sourceLinks: z.array(z.object({ label: z.string(), url: z.string().min(1), type: optionalString })).default([]),
    contactEmail: optionalString,
    contactPhone: optionalString
  })
});

const categories = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    status
  })
});

export const collections = { articles, programs, galleries, documents, projects, events, people, pages, jobOffers, categories };
