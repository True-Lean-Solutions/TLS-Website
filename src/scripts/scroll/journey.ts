/**
 * Scroll stories (Journey.astro, 2026-11-18): the step in view drives a
 * pinned scene.
 *
 *   [data-journey] ........... gets .is-journey, data-step="0…n" (the step
 *                              in view) and --jp (0–1, progress through the
 *                              steps, for its rail).
 *     [data-journey-step] .... gets .is-current while in view, .is-done once
 *                              passed.
 *
 * Desktop with motion only (the scene is pinned beside the steps there);
 * elsewhere the markup shows the finished scene and a plain list.
 */
import { ScrollTrigger } from './core';

type Cleanup = () => void;

export function initJourneys(): Cleanup {
  const cleanups: Cleanup[] = [];
  for (const el of document.querySelectorAll<HTMLElement>('[data-journey]')) {
    const steps = [...el.querySelectorAll<HTMLElement>('[data-journey-step]')];
    if (steps.length === 0) continue;
    const go = (i: number) => {
      el.dataset.step = String(i);
      steps.forEach((s, k) => {
        s.classList.toggle('is-current', k === i);
        s.classList.toggle('is-done', k < i);
      });
    };
    el.classList.add('is-journey');
    go(0);
    const triggers = steps.map((s, i) =>
      ScrollTrigger.create({
        trigger: s,
        start: 'top 58%',
        end: 'bottom 58%',
        onToggle: (self) => self.isActive && go(i),
      })
    );
    triggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: 'top 58%',
        end: 'bottom 58%',
        onUpdate: (self) => el.style.setProperty('--jp', self.progress.toFixed(3)),
        onRefresh: (self) => el.style.setProperty('--jp', self.progress.toFixed(3)),
      })
    );
    cleanups.push(() => {
      triggers.forEach((t) => t.kill());
      el.classList.remove('is-journey');
      delete el.dataset.step;
      el.style.removeProperty('--jp');
      steps.forEach((s) => s.classList.remove('is-current', 'is-done'));
    });
  }
  return () => cleanups.forEach((fn) => fn());
}
