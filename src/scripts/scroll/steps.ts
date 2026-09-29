/**
 * Process steps (StepRow lists: Home › Our Approach, and the steps on System
 * Integration, Custom Software and Technical Talent) arrive as a sequence,
 * not all at once: 01, then 02, then 03, then 04. For each step in turn its
 * number marker settles in, its colored rule draws, then its title and text
 * rise. Only the existing elements move, and once the sequence has played
 * every inline style is cleared.
 */
import { gsap, ScrollTrigger, EASE } from './core';
import { claim, unclaim } from './text';

const rendered = (el: Element) => !el.matches('script, style, link, template');

export function initStepSequences() {
  const cleanups: (() => void)[] = [];
  for (const list of document.querySelectorAll<HTMLElement>('ol[data-reveal="stagger"]')) {
    const steps = [...list.children].filter(rendered) as HTMLElement[];
    if (steps.length < 2 || !steps.every((s) => s.matches('li.step'))) continue;
    claim(list, 'steps');

    const parts = steps.map((s) => ({
      marker: s.querySelector<HTMLElement>(':scope > .marker'),
      rule: s.querySelector<HTMLElement>(':scope > .rule'),
      text: [...s.querySelectorAll<HTMLElement>(':scope > h3, :scope > p')],
    }));
    const markers = parts.flatMap((p) => (p.marker ? [p.marker] : []));
    const rules = parts.flatMap((p) => (p.rule ? [p.rule] : []));
    const texts = parts.flatMap((p) => p.text);
    const all = [...markers, ...rules, ...texts];

    gsap.set(markers, { opacity: 0, scale: 0.6 });
    gsap.set(rules, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(texts, { opacity: 0, y: 14 });

    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: EASE },
      onComplete: () => gsap.set(all, { clearProps: 'opacity,transform,transformOrigin' }),
    });
    parts.forEach((p, i) => {
      const at = i * 0.22;
      if (p.marker) tl.to(p.marker, { opacity: 1, scale: 1, duration: 0.6 }, at);
      if (p.rule) tl.to(p.rule, { scaleX: 1, duration: 0.7 }, at + 0.16);
      tl.to(p.text, { opacity: 1, y: 0, duration: 0.7, stagger: 0.06 }, at + 0.24);
    });

    const st = ScrollTrigger.create({ trigger: list, start: 'top 85%', once: true, onEnter: () => tl.play() });
    cleanups.push(() => {
      st.kill();
      tl.kill();
      gsap.set(all, { clearProps: 'opacity,transform,transformOrigin' });
      unclaim(list);
    });
  }
  return () => cleanups.forEach((c) => c());
}
