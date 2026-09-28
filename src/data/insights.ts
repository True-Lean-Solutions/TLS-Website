import { getCollection, type CollectionEntry } from 'astro:content';

/** Insights category metadata (decision 11). */
export const categoryMeta = {
  perspectives: {
    label: 'Perspectives',
    description: 'Ideas, trends and expert thinking.',
  },
  'case-studies': {
    label: 'Case Studies',
    description: 'Real challenges, real solutions.',
  },
  guides: {
    label: 'Guides',
    description: 'Practical frameworks and how-to resources.',
  },
  news: {
    label: 'News',
    description: 'Company updates and announcements.',
  },
} as const;

export type CategorySlug = keyof typeof categoryMeta;
export const categoryOrder: CategorySlug[] = [
  'perspectives',
  'case-studies',
  'guides',
  'news',
];

export type Post = CollectionEntry<'insights'>;

/** All published (non-draft) posts, newest first. */
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('insights', (p) => !p.data.draft);
  return posts.sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );
}

/** Category slugs that have at least one published post (menu/pages hide empties). */
export function categoriesWithPosts(posts: Post[]): CategorySlug[] {
  const present = new Set(posts.map((p) => p.data.category));
  return categoryOrder.filter((c) => present.has(c));
}

/** Distinct topics across published posts, alphabetized. */
export function allTopics(posts: Post[]): string[] {
  const set = new Set<string>();
  for (const p of posts) for (const t of p.data.topics) set.add(t);
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Format an ISO date as e.g. "August 10, 2026" (US). */
export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
