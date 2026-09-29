/**
 * Typography as motion: section headings reveal line by line out of a mask;
 * the eyebrow's rule draws; supporting copy follows with a short rise.
 * Replaces the whole-block fade-up for every heading block on the site
 * (SectionHeading and any reveal block that leads with an h2).
 *
 * Text is never changed: SplitText wraps lines only for the animation (with
 * an aria-label on the heading meanwhile) and is reverted once it finishes,
 * leaving the original markup.
 */
import { gsap, SplitText, ScrollTrigger, EASE, T } from './core';

/** Hand a [data-reveal] element over from the CSS fade-up to this layer. */
export function claim(el: HTMLElement, mode: string) {
  if (el.dataset.revealWas === undefined) el.dataset.revealWas = el.dataset.reveal ?? '';
  el.dataset.reveal = mode;
}
export function unclaim(el: HTMLElement) {
  if (el.dataset.revealWas === undefined) return;
  el.dataset.reveal = el.dataset.revealWas;
  delete el.dataset.revealWas;
}

const rendered = (el: Element) => !el.matches('script, style, link, template');
const isHeading = (el: Element) => /^H[1-3]$/.test(el.tagName);

/**
 * Masked line reveal for one heading. Returns `play` (animate in) and
 * `cleanup`. Lines start hidden below their mask; after the reveal the split
 * is reverted.
 */
export function maskLines(el: HTMLElement, opts: { stagger?: number; duration?: number } = {}) {
  let revealed = false;
  const split = SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'ix-line',
    autoSplit: true,
    onSplit(self) {
      // Room for descenders inside each line's mask.
      gsap.set(self.masks, { paddingBottom: '0.12em', marginBottom: '-0.12em' });
      if (!revealed) gsap.set(self.lines, { yPercent: 108 });
    },
  });
  const play = (delay = 0) => {
    if (revealed) return;
    revealed = true;
    return gsap.to(split.lines, {
      yPercent: 0,
      duration: opts.duration ?? 0.95,
      ease: 'power4.out',
      stagger: opts.stagger ?? 0.09,
      delay,
      onComplete: () => split.revert(),
    });
  };
  return { play, cleanup: () => split.revert() };
}

/**
 * Reveal a heading block's parts in sequence: eyebrow (rule draws), heading
 * lines, then the rest. `parts` are the block's direct children.
 */
function revealBlock(block: HTMLElement, parts: HTMLElement[], start = 'top 86%') {
  const eyebrows = parts.filter((p) => p.classList.contains('eyebrow'));
  const headings = parts.filter(isHeading);
  const rest = parts.filter((p) => !eyebrows.includes(p) && !headings.includes(p));
  const masks = headings.map((h) => maskLines(h));

  gsap.set(eyebrows, { opacity: 0 });
  gsap.set(rest, { opacity: 0, y: 16 });

  const trigger = ScrollTrigger.create({
    trigger: block,
    start,
    once: true,
    onEnter: () => {
      const tl = gsap.timeline({ defaults: { ease: EASE } });
      tl.to(eyebrows, { opacity: 1, duration: 0.6 }, 0);
      eyebrows.forEach((e) => {
        const rule = e.querySelector('.rule');
        if (rule) tl.from(rule, { scaleX: 0, transformOrigin: 'left center', duration: 0.9 }, 0.05);
      });
      masks.forEach((m, i) => tl.add(() => m.play(), 0.08 + i * 0.12));
      tl.to(rest, { opacity: 1, y: 0, duration: 0.75, stagger: T.stagger, clearProps: 'transform' }, 0.32);
    },
  });
  return () => {
    trigger.kill();
    masks.forEach((m) => m.cleanup());
    gsap.set([...eyebrows, ...rest], { clearProps: 'all' });
  };
}

/** Is this [data-reveal] block a heading block (it leads with an h1–h3)? */
function headingParts(block: HTMLElement) {
  const parts = [...block.children].filter(rendered) as HTMLElement[];
  return parts.some(isHeading) ? parts : null;
}

/**
 * Every heading block below the fold: SectionHeading (data-reveal=""), and
 * reveal groups that open with a heading (e.g. Common Challenges' intro,
 * About › Global Delivery). Returns a cleanup for gsap.matchMedia().
 */
export function initHeadingReveals() {
  const cleanups: (() => void)[] = [];
  for (const block of document.querySelectorAll<HTMLElement>('[data-reveal=""], [data-reveal="stagger"]')) {
    if (block.closest('.cta-card')) continue; // the CTA card runs its own sequence
    const parts = headingParts(block);
    if (!parts) continue;
    claim(block, 'heading');
    const undo = revealBlock(block, parts);
    cleanups.push(() => {
      undo();
      unclaim(block);
    });
  }

  // CTA band: the card settles in (slight scale), then its copy as a heading block.
  for (const card of document.querySelectorAll<HTMLElement>('.cta-card[data-reveal=""]')) {
    const copy = card.querySelector<HTMLElement>('.cta-copy');
    if (!copy) continue;
    claim(card, 'heading');
    gsap.set(card, { opacity: 0, scale: 0.97, y: 24 });
    const enter = ScrollTrigger.create({
      trigger: card,
      start: 'top 88%',
      once: true,
      onEnter: () =>
        gsap.to(card, { opacity: 1, scale: 1, y: 0, duration: T.section + 0.2, ease: EASE, clearProps: 'transform' }),
    });
    const undo = revealBlock(copy, [...copy.children].filter(rendered) as HTMLElement[], 'top 84%');
    cleanups.push(() => {
      enter.kill();
      undo();
      gsap.set(card, { clearProps: 'all' });
      unclaim(card);
    });
  }

  // Long-form reading: article sub-headings and pull quotes reveal as lines;
  // body paragraphs are left alone.
  for (const h of document.querySelectorAll<HTMLElement>('.article-content :is(h2, h3), .pull blockquote')) {
    const m = maskLines(h, { stagger: 0.07, duration: 0.85 });
    const st = ScrollTrigger.create({ trigger: h, start: 'top 90%', once: true, onEnter: () => m.play() });
    cleanups.push(() => {
      st.kill();
      m.cleanup();
    });
  }

  return () => cleanups.forEach((c) => c());
}
