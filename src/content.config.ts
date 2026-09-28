import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const accent = z.enum(['red', 'blue', 'plum']);

/**
 * Structured content blocks for Insights posts. Every block type here is
 * authorable in the CMS (see public/admin/config.yml) so cards, stats,
 * callouts, steps and icons can be created without a developer.
 */
const richtext = z.object({
  type: z.literal('richtext'),
  markdown: z.string(),
});
const stats = z.object({
  type: z.literal('stats'),
  heading: z.string().optional(),
  accent: accent.default('red'),
  items: z.array(z.object({ value: z.string(), label: z.string() })),
});
const cards = z.object({
  type: z.literal('cards'),
  heading: z.string().optional(),
  columns: z.coerce.number().default(3),
  items: z.array(
    z.object({
      icon: z.string().optional(),
      title: z.string(),
      body: z.string(),
      accent: accent.optional(),
    })
  ),
});
const steps = z.object({
  type: z.literal('steps'),
  heading: z.string().optional(),
  accent: accent.default('red'),
  items: z.array(z.object({ title: z.string(), body: z.string() })),
});
const callout = z.object({
  type: z.literal('callout'),
  title: z.string().optional(),
  body: z.string(),
  tag: z.string().optional(),
  variant: z.enum(['light', 'dark']).default('dark'),
});
const quote = z.object({
  type: z.literal('quote'),
  text: z.string(),
  attribution: z.string().optional(),
});
const imageBlock = z.object({
  type: z.literal('image'),
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});

const block = z.discriminatedUnion('type', [
  richtext,
  stats,
  cards,
  steps,
  callout,
  quote,
  imageBlock,
]);

export type Block = z.infer<typeof block>;

const insights = defineCollection({
  // Structured YAML posts (block-based). Adding a post is a commit or a CMS
  // publish (Sveltia writes to this folder). Never a Drive hotlink.
  loader: glob({ pattern: '**/*.yaml', base: './src/content/insights' }),
  schema: z.object({
    title: z.string(),
    /** ISO date. Sheet dates are day-first; convert before storing. */
    date: z.coerce.date(),
    category: z.enum(['perspectives', 'case-studies', 'guides', 'news']),
    excerpt: z.string(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
    topics: z.array(z.string()).default([]),
    author: z.string().optional(),
    readTime: z.string().optional(),
    draft: z.boolean().default(false),
    /** Ordered content blocks rendered by BlockRenderer. */
    blocks: z.array(block).default([]),
    /** Provenance: the Drive file ID this post was imported from. */
    source: z.string().optional(),
  }),
});

export const collections = { insights };
