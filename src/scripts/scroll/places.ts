/**
 * About › Global Delivery location cards: each place arrives with its skyline.
 *  - As a card comes into view, its skyline rises out of a mask from the
 *    ground up (easing out of a slight zoom), the status and the place's name
 *    settle, and the status bar draws across. Cards arriving together go left
 *    to right. (The card itself enters with the site's card depth: cards.ts.)
 *  - Desktop: the skylines drift a few pixels as the page scrolls past.
 * Transform, opacity and clip-path only. Reduced motion never runs this: the
 * cards are still and complete (GlobalDelivery.astro's CSS).
 */
import { gsap, ScrollTrigger, EASE } from './core';

type Cleanup = () => void;
const DONE = 'transform,opacity,clipPath,transition';

export function initPlaceCards(on: { desktop: boolean }): Cleanup {
  const cards = [...document.querySelectorAll<HTMLElement>('.loc')].filter((c) => c.querySelector('.skyline img'));
  if (!cards.length) return () => {};
  const list = cards[0].parentElement as HTMLElement;
  const touched: Element[] = [];
  const tweens: gsap.core.Animation[] = [];

  const parts = cards.map((card) => {
    const p = {
      box: card.querySelector<HTMLElement>('.skyline')!,
      img: card.querySelector<HTMLElement>('.skyline img')!,
      text: [...card.querySelectorAll<HTMLElement>(':scope > .loc-head, :scope > h3, :scope > p')],
      rule: card.querySelector<HTMLElement>('.rule'),
    };
    touched.push(p.box, p.img, ...p.text, ...(p.rule ? [p.rule] : []));
    gsap.set(p.box, { clipPath: 'inset(100% 0% 0% 0%)' });
    // The image's own CSS transition (hover) is held off while this drives it.
    gsap.set(p.img, { scale: 1.08, transformOrigin: 'center bottom', transition: 'none' });
    gsap.set(p.text, { opacity: 0, y: 10 });
    if (p.rule) gsap.set(p.rule, { scaleX: 0, transformOrigin: 'left center' });
    return p;
  });

  const play = (i: number, delay: number) => {
    const p = parts[i];
    const tl = gsap.timeline({ delay, defaults: { ease: EASE } });
    tl.to(p.text, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, clearProps: DONE }, 0)
      .to(p.box, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, clearProps: DONE }, 0.15)
      .to(p.img, { scale: 1, duration: 1.4, clearProps: 'scale,transition' }, 0.15);
    if (p.rule) tl.to(p.rule, { scaleX: 1, duration: 0.9, clearProps: DONE }, 0.5);
    tweens.push(tl);
  };

  const batch = ScrollTrigger.batch(cards, {
    start: 'top 85%',
    once: true,
    onEnter: (entering) => entering.forEach((c, k) => play(cards.indexOf(c as HTMLElement), k * 0.12)),
  });

  // Desktop: skylines drift a little as the row passes.
  if (on.desktop) {
    for (const p of parts) {
      tweens.push(
        gsap.fromTo(
          p.img,
          { y: 8 },
          { y: -8, ease: 'none', scrollTrigger: { trigger: list, start: 'top bottom', end: 'bottom top', scrub: true } }
        )
      );
    }
  }

  return () => {
    batch.forEach((t) => t.kill());
    tweens.forEach((t) => {
      t.scrollTrigger?.kill();
      t.kill();
    });
    gsap.set(touched, { clearProps: DONE });
  };
}
