/**
 * Card groups: a depth entrance (rise + settle from a hair smaller, cover
 * images easing out of a slight zoom) in batches as rows reach the viewport,
 * and on desktop a barely-there scroll-linked drift that differs by column,
 * so a grid reads as layered rather than flat.
 *
 * A card group is any [data-reveal="stagger"] whose children are cards
 * (.ix-card, or an item wrapping one). Hover stays in CSS on the `translate`
 * property, so it composes with these transforms. Insight cards' titles also
 * rise line by line out of a mask as their card arrives.
 */
import { gsap, ScrollTrigger, EASE, T } from './core';
import { claim, unclaim, maskLines } from './text';

const rendered = (el: Element) => !el.matches('script, style, link, template');
const isCard = (el: Element) => el.matches('.ix-card') || !!el.querySelector(':scope > .ix-card');

/** Groups whose every rendered child is a card. */
export function cardGroups(scope: ParentNode = document) {
  return [...scope.querySelectorAll<HTMLElement>('[data-reveal="stagger"]')].filter((g) => {
    const kids = [...g.children].filter(rendered);
    return kids.length > 0 && kids.every(isCard);
  });
}

/** Column index of each card from its rendered position (grid-agnostic). */
function columns(cards: HTMLElement[]) {
  const lefts = [...new Set(cards.map((c) => Math.round(c.offsetLeft)))].sort((a, b) => a - b);
  return cards.map((c) => lefts.indexOf(Math.round(c.offsetLeft)));
}

/** Drift amplitude by column, as % of the card's height (≈ 0–15px). */
const DRIFT = [0, 3.2, 1.6, 4.4];

export function initCardEntrances(skip: Set<HTMLElement>) {
  const cleanups: (() => void)[] = [];
  for (const group of cardGroups()) {
    if (skip.has(group)) continue;
    const cards = [...group.children].filter(rendered) as HTMLElement[];
    claim(group, 'cards');
    const covers = cards.flatMap((c) => [...c.querySelectorAll<HTMLElement>('img.cover')]);
    const titles = new Map(
      cards.flatMap((c) => {
        const h = c.querySelector<HTMLElement>('.insight-card h3');
        return h ? [[c, maskLines(h, { stagger: 0.07, duration: 0.85 })] as const] : [];
      })
    );
    gsap.set(cards, { opacity: 0, y: 48, scale: 0.97 });
    // The covers' own CSS transition (their hover zoom) is held off while the
    // entrance drives them, then handed back with no inline transform left.
    gsap.set(covers, { scale: 1.12, transition: 'none' });

    const enter = (entering: HTMLElement[]) => {
      gsap.to(entering, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: T.section + 0.15,
        ease: EASE,
        stagger: T.stagger,
        overwrite: 'auto',
      });
      const imgs = entering.flatMap((c) => [...c.querySelectorAll('img.cover')]);
      gsap.to(imgs, { scale: 1, duration: 1.4, ease: EASE, stagger: T.stagger, clearProps: 'transform,transition' });
      entering.forEach((c, i) => titles.get(c)?.play(0.12 + i * T.stagger));
    };
    const batch = ScrollTrigger.batch(cards, {
      start: 'top 90%',
      once: true,
      onEnter: (entering) => enter(entering as HTMLElement[]),
    });
    // Keyboard focus never waits on a title that hasn't risen yet.
    const onFocus = (e: FocusEvent) => {
      const card = cards.find((c) => c.contains(e.target as Node));
      if (card) titles.get(card)?.play();
    };
    group.addEventListener('focusin', onFocus);
    cleanups.push(() => {
      batch.forEach((t) => t.kill());
      group.removeEventListener('focusin', onFocus);
      titles.forEach((m) => m.cleanup());
      gsap.set([...cards, ...covers], { clearProps: 'all' });
      unclaim(group);
    });
  }
  return () => cleanups.forEach((c) => c());
}

/** Desktop only: per-column drift while the group crosses the viewport. */
export function initCardDepth(skip: Set<HTMLElement>) {
  const tweens: gsap.core.Tween[] = [];
  for (const group of cardGroups()) {
    if (skip.has(group)) continue;
    const cards = [...group.children].filter(rendered) as HTMLElement[];
    const cols = columns(cards);
    if (Math.max(...cols) < 1) continue; // single column: nothing to layer
    cards.forEach((card, i) => {
      const amp = DRIFT[cols[i] % DRIFT.length];
      if (!amp) return;
      tweens.push(
        gsap.fromTo(
          card,
          { yPercent: amp },
          {
            yPercent: -amp,
            ease: 'none',
            scrollTrigger: { trigger: group, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        )
      );
    });
  }
  return () => {
    tweens.forEach((t) => {
      t.scrollTrigger?.kill();
      t.kill();
    });
    const targets = tweens.flatMap((t) => t.targets() as HTMLElement[]);
    if (targets.length) gsap.set(targets, { yPercent: 0 });
  };
}
