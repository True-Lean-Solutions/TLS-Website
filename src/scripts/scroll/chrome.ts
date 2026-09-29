/**
 * Site chrome in motion:
 *  - Scroll progress: a 2px TLS-red line across the top of the viewport.
 *  - Header: after the first scroll it becomes a little more compact and
 *    more defined (a lift shadow); back to full at the top. It never hides.
 *  - Footer: its columns settle in as the visitor reaches the end.
 */
import { gsap, ScrollTrigger, EASE, T } from './core';

type Cleanup = () => void;

/** Progress + header state. Runs for everyone: it follows scroll, it doesn't animate on its own. */
export function initChrome(): Cleanup {
  const bar = document.querySelector<HTMLElement>('.scroll-progress');
  const progress = bar
    ? gsap.fromTo(
        bar,
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } }
      )
    : null;

  const header = document.querySelector<HTMLElement>('.site-header');
  const compact = header
    ? ScrollTrigger.create({
        start: 24,
        end: 'max',
        onToggle: (self) => header.classList.toggle('is-compact', self.isActive),
      })
    : null;

  return () => {
    progress?.scrollTrigger?.kill();
    progress?.kill();
    compact?.kill();
    header?.classList.remove('is-compact');
  };
}

export function initFooterReveal(): Cleanup {
  const footer = document.querySelector<HTMLElement>('.site-footer');
  if (!footer) return () => {};
  const parts = [...footer.querySelectorAll<HTMLElement>('.top > *, .bottom')];
  gsap.set(parts, { opacity: 0, y: 22 });
  const st = ScrollTrigger.create({
    trigger: footer,
    start: 'top 92%',
    once: true,
    onEnter: () =>
      gsap.to(parts, { opacity: 1, y: 0, duration: T.section, ease: EASE, stagger: T.stagger, clearProps: 'transform' }),
  });
  return () => {
    st.kill();
    gsap.set(parts, { clearProps: 'all' });
  };
}
