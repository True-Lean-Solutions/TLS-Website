import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Insights posts. Markdown files in src/content/insights/.
 * Categories follow decision 11. Every post records its Drive `source` ID.
 * Adding a post is a commit (decision 2026-09-28, interim: no CMS in v1).
 */
const insights = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/insights' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** ISO date. Sheet dates are day-first; convert before storing. */
      date: z.coerce.date(),
      category: z.enum(['perspectives', 'case-studies', 'guides', 'news']),
      excerpt: z.string(),
      /** Cover image downloaded into the repo — never a Drive hotlink. */
      cover: image().optional(),
      coverAlt: z.string().optional(),
      /** Topics power "Browse by Topic" and the topic filter. */
      topics: z.array(z.string()).default([]),
      author: z.string().optional(),
      /** Keep out of nav, listings, and sitemap while true. */
      draft: z.boolean().default(false),
      /** Provenance: the Drive file ID this post was imported from. */
      source: z.string(),
    }),
});

export const collections = { insights };
