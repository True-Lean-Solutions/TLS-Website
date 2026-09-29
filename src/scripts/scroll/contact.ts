/**
 * Contact page: the conversation arrives, stage by stage.
 *  - The form card rises into place while its clip opens out (opacity, a
 *    touch of scale, clip-path and a short lift), not a plain fade.
 *  - Each stage's head draws its rule and lifts its number and name, then
 *    the stage's fields follow in a short stagger (About you's four fields
 *    one by one).
 *  - The support panel (steps, Prefer to talk?, Reach us directly) settles in
 *    just behind the form: from the side beside it, from below on phones.
 *  - The ambient light behind the page drifts slightly with scroll (desktop).
 *
 * The current stage, completed fields and the send states belong to the form
 * (ContactForm.astro) and work without this module. Keyboard users never wait:
 * focusing anything in the form finishes every entrance at once. Entrances
 * play once per page view: when layout conditions change (a resize or a
 * rotation re-runs the scroll layer), nothing is hidden again.
 */
import { gsap, ScrollTrigger, EASE } from './core';
import { claim, unclaim } from './text';

type Cleanup = () => void;
const DONE = 'opacity,transform,clipPath';

/** Set once the entrance has started (or been finished early). */
let played = false;

export function initContact(on: { desktop: boolean }): Cleanup {
  const card = document.querySelector<HTMLElement>('.contact-grid .form-col');
  const form = card?.querySelector<HTMLElement>('.contact-form');
  if (!card || !form) return () => {};
  const side = document.querySelector<HTMLElement>('.contact-grid .side');
  const ambient = document.querySelector<HTMLElement>('.contact .c-ambient');
  const stages = [...form.querySelectorAll<HTMLElement>('.stage')];

  // Ambient light: a slow drift against the scroll (desktop; rebuilt on every run).
  const drift =
    on.desktop && ambient
      ? gsap.fromTo(
          ambient,
          { yPercent: 0 },
          {
            yPercent: -7,
            ease: 'none',
            scrollTrigger: { trigger: ambient.parentElement, start: 'top top', end: 'bottom top', scrub: true },
          }
        )
      : null;
  const stopDrift = () => {
    drift?.scrollTrigger?.kill();
    drift?.kill();
    if (ambient) gsap.set(ambient, { clearProps: 'transform' });
  };
  // Already played (or the visitor is in the form): claim the card and panel
  // so the CSS fade-up leaves them visible, and animate nothing.
  if (played || form.contains(document.activeElement)) {
    played = true;
    claim(card, 'form');
    if (side) claim(side, 'form');
    return () => {
      stopDrift();
      unclaim(card);
      if (side) unclaim(side);
    };
  }

  const triggers: ScrollTrigger[] = [];
  const calls: gsap.core.Tween[] = [];
  const t0 = performance.now();
  /** What's in view on arrival waits for the heading to lead; later, no wait. */
  const after = (lead: number, fn: () => void) =>
    calls.push(gsap.delayedCall(Math.max(0, lead - (performance.now() - t0) / 1000), fn));

  claim(card, 'form');

  // 1. The card: rises, settles from a hair smaller, its clip opening out
  //    past the edges so the shadow arrives with it.
  const cardTl = gsap.timeline({ paused: true }).fromTo(
    card,
    { opacity: 0, y: 36, scale: 0.985, clipPath: 'inset(48px 24px 0px 24px round 24px)' },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      clipPath: 'inset(-48px -48px -48px -48px round 64px)',
      duration: 1.1,
      ease: EASE,
      clearProps: DONE,
    }
  );
  triggers.push(
    ScrollTrigger.create({
      trigger: card,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        played = true;
        after(0.3, () => cardTl.play());
      },
    })
  );

  // 2. Each stage: head (number, rule, name), then its fields.
  const stageTls = stages.map((stage) => {
    const head = [...stage.querySelectorAll<HTMLElement>('.stage-n, .stage-t')];
    const rule = stage.querySelector<HTMLElement>('.stage-rule');
    const items = [...stage.querySelectorAll<HTMLElement>(':scope > .row > .field, :scope > .field, :scope > .send')];
    const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } });
    tl.fromTo(head, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, clearProps: DONE }, 0);
    if (rule) {
      tl.fromTo(
        rule,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, transformOrigin: 'left center', clearProps: DONE },
        0.05
      );
    }
    tl.fromTo(items, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, clearProps: DONE }, 0.15);
    return tl;
  });
  stages.forEach((stage, i) =>
    triggers.push(
      ScrollTrigger.create({
        trigger: stage,
        start: 'top 88%',
        once: true,
        onEnter: () => after(0.5 + i * 0.12, () => stageTls[i].play()),
      })
    )
  );

  // 3. The support panel.
  let sideParts: HTMLElement[] = [];
  const revealSide = () => gsap.set(sideParts, { clearProps: DONE });

  const finish = () => {
    played = true;
    calls.forEach((c) => c.kill());
    cardTl.progress(1);
    stageTls.forEach((tl) => tl.progress(1));
    revealSide();
  };
  form.addEventListener('focusin', finish);

  if (side) {
    claim(side, 'form');
    sideParts = ([...side.children] as HTMLElement[]).filter((el) => getComputedStyle(el).display !== 'none');
    gsap.set(sideParts, on.desktop ? { opacity: 0, x: 28 } : { opacity: 0, y: 24 });
    triggers.push(
      ScrollTrigger.create({
        trigger: side,
        start: 'top 90%',
        once: true,
        onEnter: () =>
          after(0.55, () =>
            gsap.to(sideParts, { opacity: 1, x: 0, y: 0, duration: 0.9, ease: EASE, stagger: 0.1, clearProps: DONE })
          ),
      })
    );
    side.addEventListener('focusin', revealSide);
  }

  return () => {
    form.removeEventListener('focusin', finish);
    side?.removeEventListener('focusin', revealSide);
    triggers.forEach((t) => t.kill());
    calls.forEach((c) => c.kill());
    [cardTl, ...stageTls].forEach((tl) => tl.kill());
    stopDrift();
    const touched = [
      card,
      ...sideParts,
      ...stages.flatMap((s) => [...s.querySelectorAll<HTMLElement>('.stage-n, .stage-t, .stage-rule, .field, .send')]),
    ];
    gsap.set(touched, { clearProps: DONE });
    unclaim(card);
    if (side) unclaim(side);
  };
}
