/**
 * The section outline of an Insights post ("In This Article"), and the
 * matching heading ids, computed once from its content blocks.
 *
 * Sections are the post's own headings: `##` headings inside rich text, and
 * the titled card, step and stat blocks. Every heading gets an id here, in
 * document order, and the renderers use exactly these ids, so a link in the
 * outline always lands on its heading.
 */
import { Marked, marked, type Token, type Tokens } from 'marked';
import type { Block } from '../content.config';

export interface OutlineItem {
  id: string;
  text: string;
}

export interface Outline {
  /** Sections for the "In This Article" list, in reading order. */
  items: OutlineItem[];
  /** Per block (same index as `blocks`): the ids of that block's headings, in order. */
  headingIds: string[][];
}

/** marked's token text is HTML-escaped ("isn&#39;t"); undo that for display. */
const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
function decode(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] !== '#') return ENTITIES[e.toLowerCase()] ?? m;
    const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : m;
  });
}

/** Plain text of a heading: inline markdown (links, emphasis, code) reduced to its words. */
function plain(tokens: Token[] | undefined, fallback: string): string {
  if (!tokens?.length) return decode(fallback);
  return decode(
    tokens
      .map((t) => ('tokens' in t && t.tokens ? plain(t.tokens as Token[], '') : 'text' in t ? String(t.text) : ''))
      .join('')
  ).trim();
}

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  // Long headings: cut at a word boundary, not mid-word.
  const short = slug.length > 60 ? slug.slice(0, 61).replace(/-[^-]*$/, '') : slug;
  return short || 'section';
}

/** Rich-text headings in the order marked renders them (nested ones included). */
export function markdownHeadings(markdown: string): Tokens.Heading[] {
  const out: Tokens.Heading[] = [];
  marked.walkTokens(marked.lexer(markdown), (t) => {
    if (t.type === 'heading') out.push(t as Tokens.Heading);
  });
  return out;
}

/**
 * Markdown to HTML, giving the headings `ids` in document order (the same
 * order articleOutline() assigned them). Lives here rather than in
 * RichText.astro: HTML inside a template string trips the .astro compiler.
 */
export function renderMarkdown(markdown: string, ids: string[] = []): string {
  let next = 0;
  const md = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const id = ids[next++];
        const attr = id ? ' id="' + id + '"' : '';
        return '<h' + depth + attr + '>' + this.parser.parseInline(tokens) + '</h' + depth + '>\n';
      },
    },
  });
  return md.parse(markdown, { async: false }) as string;
}

export function articleOutline(blocks: Block[]): Outline {
  const used = new Map<string, number>();
  const idFor = (text: string) => {
    const base = slugify(text);
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    return n === 0 ? base : `${base}-${n + 1}`;
  };

  const items: OutlineItem[] = [];
  const headingIds = blocks.map((b) => {
    if (b.type === 'richtext') {
      return markdownHeadings(b.markdown).map((h) => {
        const text = plain(h.tokens, h.text);
        const id = idFor(text);
        if (h.depth === 2) items.push({ id, text });
        return id;
      });
    }
    if ((b.type === 'cards' || b.type === 'steps' || b.type === 'stats') && b.heading) {
      const id = idFor(b.heading);
      items.push({ id, text: b.heading });
      return [id];
    }
    return [];
  });

  return { items, headingIds };
}
