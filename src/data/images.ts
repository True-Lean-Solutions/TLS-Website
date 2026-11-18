/**
 * Responsive `srcset` for images that have generated width variants (brief
 * T2.2). The variants and this manifest come from
 * `node scripts/responsive-images.mjs`; an image without variants simply gets
 * no srcset, so callers can use this unconditionally.
 */
import manifest from './image-variants.json';
import { href } from './site';

type Entry = { width: number; height: number; variants: number[] };
const images = manifest as Record<string, Entry>;

/** `srcset` (base-prefixed) for a public image path, or undefined if none. */
export function srcsetFor(src: string): string | undefined {
  const e = images[src];
  if (!e || e.variants.length === 0) return undefined;
  const parts = e.variants.map((w) => `${href(src.replace(/\.webp$/, `-${w}.webp`))} ${w}w`);
  parts.push(`${href(src)} ${e.width}w`);
  return parts.join(', ');
}

/** An image's own pixel size, when it is in the manifest (so frames can match its shape). */
export function dimsFor(src: string): { width: number; height: number } | undefined {
  const e = images[src];
  return e ? { width: e.width, height: e.height } : undefined;
}

/** The data a `<link rel="preload" as="image">` needs for the LCP image. */
export interface PreloadImage {
  src: string;
  srcset?: string;
  sizes?: string;
}

/** Preload descriptor for a public image path, with its `sizes`. */
export function preloadFor(src: string, sizes: string): PreloadImage {
  return { src: href(src), srcset: srcsetFor(src), sizes };
}

/*
 * `sizes` for each LCP image, matched to its CSS at each breakpoint.
 * - Home hero photo: 60% of the viewport beside the copy; full width ≤900px.
 * - Solution hero: full bleed, but `object-fit: cover` on a 2:1 photo, so the
 *   width it needs is set by its height on tablets (≤720px tall) and phones
 *   (a 400px band), not by the viewport.
 * - Article cover: aligned with the article's columns: 1120px, or 760px on
 *   tablets, and the full width (less the gutters) between and below.
 * - Insight cards: three columns, two ≤900px, one ≤640px.
 */
export const HOME_HERO = { src: '/hero/hero-team.webp', sizes: '(max-width: 900px) 100vw, 60vw' };
export const SOLUTION_HERO = {
  src: '/solutions/hero-solutions.webp',
  sizes: '(max-width: 640px) 800px, (max-width: 1024px) 1440px, 100vw',
};
export const ARTICLE_COVER_SIZES =
  '(max-width: 792px) calc(100vw - 32px), (max-width: 1024px) 760px, (max-width: 1152px) calc(100vw - 32px), 1120px';
export const CARD_COVER_SIZES = '(max-width: 640px) calc(100vw - 32px), (max-width: 900px) 50vw, 400px';
