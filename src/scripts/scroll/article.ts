/**
 * Insights articles: the "In This Article" section list (ArticleLayout).
 *  - Click a section: glide to its heading, clear of the sticky header (a
 *    plain jump with reduced motion), move focus there, and close the folded
 *    list on phones and tablets.
 *  - While reading: the section in view is marked in the list
 *    (aria-current="location"), shown as a red bar beside it.
 * Runs for everyone: it follows scrolling, it doesn't animate on its own.
 */
import { ScrollTrigger, glideTo, headerH, reduceMotion } from './core';

type Cleanup = () => void;

export function initArticleNav(): Cleanup {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc] a[href^="#"]')];
  if (links.length === 0) return () => {};

  const idOf = (a: HTMLAnchorElement) => decodeURIComponent(a.hash.slice(1));
  const sections = [...new Set(links.map(idOf))]
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);

  const mark = (id: string | null) => {
    for (const a of links) {
      if (id !== null && idOf(a) === id) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    }
  };

  // A section is "current" from when its heading crosses a line a quarter of
  // the way down the screen (below the header) until the next heading does.
  const line = () => headerH() + window.innerHeight * 0.25;
  const triggers = sections.map((el, i) => {
    const next = sections[i + 1];
    return ScrollTrigger.create({
      trigger: el,
      start: () => `top ${line()}px`,
      endTrigger: next ?? el.closest('.main-col') ?? el,
      end: next ? () => `top ${line()}px` : 'bottom top',
      onToggle: (self) => {
        if (self.isActive) mark(el.id);
        else if (i === 0 && self.direction < 0) mark(null); // back above the first section
      },
    });
  });

  const onClick = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('[data-toc] a[href^="#"]');
    const target = a && document.getElementById(idOf(a));
    if (!a || !target) return;
    e.preventDefault();
    a.closest('details')?.removeAttribute('open');
    if (reduceMotion()) target.scrollIntoView();
    else glideTo(target);
    history.pushState(null, '', a.hash);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    mark(target.id);
  };
  document.addEventListener('click', onClick);

  return () => {
    document.removeEventListener('click', onClick);
    triggers.forEach((t) => t.kill());
    mark(null);
  };
}
