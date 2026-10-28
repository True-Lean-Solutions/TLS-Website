/**
 * Scroll-scrubbed diagrams (Technology Strategy, 2026-10-28): scroll position
 * → progress, so scrolling back takes a diagram apart again. One hook, any
 * number of diagrams:
 *
 *   [data-scrub] ............ the diagram. Its progress (0–1) runs from
 *                             `data-scrub-start` (default "top 96%": it starts
 *                             building as it comes into view) to
 *                             `data-scrub-end` (default "bottom 92%": complete
 *                             once the whole diagram is on screen) and is
 *                             written to --p on the element.
 *     .scrub-path ........... an SVG path that draws with the progress; with
 *                             `data-from` / `data-to` (0–1) it draws only
 *                             within that part of the progress.
 *     [data-at="0.4"] ....... lights (.is-on) once the progress passes 0.4.
 *
 * The element carries .is-scrub while the hook runs, so its "not yet" states
 * live under .is-scrub in CSS: without motion (reduced motion, no JS) every
 * diagram is complete and still.
 */
import { gsap, ScrollTrigger } from './core';

type Cleanup = () => void;

function scrub(el: HTMLElement): Cleanup {
  const paths = [...el.querySelectorAll<SVGPathElement | SVGLineElement | SVGPolylineElement>('.scrub-path')].map((p) => {
    // Normalized length (pathLength 1): dashes stay right at any scale.
    const authored = p.hasAttribute('pathLength');
    if (!authored) p.setAttribute('pathLength', '1');
    const len = Number(p.getAttribute('pathLength'));
    const from = Number(p.dataset.from ?? 0);
    const to = Number(p.dataset.to ?? 1);
    p.style.strokeDasharray = `${len} ${len}`;
    return { p, len, from, to, authored };
  });
  const marks = [...el.querySelectorAll<HTMLElement | SVGElement>('[data-at]')].map((m) => ({ m, at: Number(m.dataset.at) }));
  el.classList.add('is-scrub');

  const paint = (pr: number) => {
    el.style.setProperty('--p', pr.toFixed(3));
    for (const { p, len, from, to } of paths) {
      const k = Math.min(1, Math.max(0, (pr - from) / Math.max(0.001, to - from)));
      p.style.strokeDashoffset = String(len * (1 - k));
    }
    for (const { m, at } of marks) m.classList.toggle('is-on', pr >= at);
  };
  paint(0);

  // Eased toward the scroll position, so the drawing glides rather than
  // ticking with each wheel step; reversible both ways.
  const state = { p: 0 };
  const follow = (to: number) =>
    gsap.to(state, { p: to, duration: 0.45, ease: 'power2.out', overwrite: true, onUpdate: () => paint(state.p) });
  const st = ScrollTrigger.create({
    trigger: el,
    start: el.dataset.scrubStart ?? 'top 96%',
    end: el.dataset.scrubEnd ?? 'bottom 92%',
    invalidateOnRefresh: true,
    onUpdate: (self) => follow(self.progress),
    onRefresh: (self) => {
      state.p = self.progress;
      paint(self.progress);
    },
  });

  return () => {
    st.kill();
    gsap.killTweensOf(state);
    reset();
  };

  function reset() {
    el.classList.remove('is-scrub');
    el.style.removeProperty('--p');
    for (const { p, authored } of paths) {
      if (!authored) p.removeAttribute('pathLength');
      p.style.removeProperty('stroke-dasharray');
      p.style.removeProperty('stroke-dashoffset');
    }
    for (const { m } of marks) m.classList.remove('is-on');
  }
}

export function initScrubs(): Cleanup {
  const cleanups = [...document.querySelectorAll<HTMLElement>('[data-scrub]')].map(scrub);
  return () => cleanups.forEach((fn) => fn());
}

