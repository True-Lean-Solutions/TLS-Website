/**
 * Story moments: the two places where scroll drives a sequence.
 *
 * 1. Home › Common Business Challenges (wide desktop, tall-enough screens):
 *    the section is held below the header and the four challenges activate
 *    one at a time as the visitor scrolls (the active card comes forward,
 *    the others stay readable but subdued) while the image drifts; then it
 *    lets go with every card back to normal.
 * 2. Solutions page (desktop): the eight solution cards run as one
 *    horizontal sequence, driven by vertical scroll; each card comes up to
 *    full presence as it travels in.
 *
 * Both are held with native position: sticky (see makeScene), not
 * ScrollTrigger pinning: no per-frame work, no layout shift.
 *
 * Content and order never change; only presentation, and only while the
 * scene is active. Everywhere else (touch devices, phones, short screens,
 * reduced motion, no JS) both sections are their normal static layouts.
 */
import { gsap, ScrollTrigger, headerH } from './core';
import { claim, unclaim } from './text';

type Cleanup = () => void;

/**
 * A scroll "scene": the section is wrapped in a taller box and held with
 * native position: sticky while the visitor scrolls through the extra
 * height. The compositor keeps it in place (no per-frame JS, no layout
 * shift, no jitter); GSAP only reads the progress. Returns the wrapper and
 * an undo that restores the original markup and styles.
 */
function makeScene(section: HTMLElement, stickTop: () => number, travel: () => number) {
  const scene = document.createElement('div');
  scene.className = 'ix-scene';
  section.before(scene);
  scene.append(section);
  const size = () => {
    section.style.top = `${stickTop()}px`;
    scene.style.height = `${section.offsetHeight + travel()}px`;
  };
  section.style.position = 'sticky';
  size();
  return {
    scene,
    size,
    /** ScrollTrigger range: from sticking to un-sticking. */
    range: {
      trigger: scene,
      start: () => `top ${stickTop()}px`,
      end: () => `bottom ${stickTop() + section.offsetHeight}px`,
    },
    undo: () => {
      scene.before(section);
      scene.remove();
      section.style.removeProperty('position');
      section.style.removeProperty('top');
    },
  };
}

export function initChallengeStory(): Cleanup {
  const section = document.querySelector<HTMLElement>('.cc');
  if (!section) return () => {};
  const cards = [...section.querySelectorAll<HTMLElement>('.cc-card')];
  const img = section.querySelector<HTMLElement>('.cc-visual img');
  if (cards.length < 2) return () => {};

  let active = -1;
  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    cards.forEach((c, n) => c.classList.toggle('is-active', n === i));
  };
  const clear = () => {
    section.classList.remove('is-story');
    cards.forEach((c) => c.classList.remove('is-active'));
    active = -1;
  };

  // Held centred in the space below the header, for ~a quarter screen of
  // scrolling per challenge: long enough to read, never a slog.
  const scene = makeScene(
    section,
    () => Math.max(headerH(), Math.round((window.innerHeight + headerH()) / 2 - section.offsetHeight / 2)),
    () => Math.round(window.innerHeight * 1.1)
  );
  const tl = gsap.timeline({
    scrollTrigger: {
      ...scene.range,
      scrub: true,
      invalidateOnRefresh: true,
      onRefreshInit: scene.size,
      onToggle: (self) => (self.isActive ? section.classList.add('is-story') : clear()),
      onUpdate: (self) => {
        if (!self.isActive) return;
        setActive(Math.min(cards.length - 1, Math.floor(self.progress * cards.length)));
      },
    },
  });
  // The platform eases forward a touch across the story.
  if (img) tl.fromTo(img, { scale: 1, yPercent: 2 }, { scale: 1.05, yPercent: -2, ease: 'none' });

  return () => {
    clear();
    if (img) gsap.set(img, { clearProps: 'transform' });
    scene.undo();
  };
}

export function initSolutionsTrack(): { cleanup: Cleanup; group: HTMLElement | null } {
  const section = document.querySelector<HTMLElement>('.sol-intro');
  const track = section?.querySelector<HTMLElement>('.cards');
  if (!section || !track) return { cleanup: () => {}, group: null };

  claim(track, 'track');
  section.classList.add('is-track');
  // A held scene taller than the space below the header would hide its own
  // cards: keep the normal grid on such screens.
  if (section.offsetHeight > window.innerHeight - headerH()) {
    section.classList.remove('is-track');
    unclaim(track);
    return { cleanup: () => {}, group: null };
  }
  const cards = [...track.children] as HTMLElement[];
  const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);

  // Held just below the header while vertical scroll runs the row sideways,
  // one pixel of scroll per pixel of travel.
  const scene = makeScene(section, headerH, distance);
  const move = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      ...scene.range,
      scrub: true,
      invalidateOnRefresh: true,
      onRefreshInit: scene.size,
    },
  });

  // Each card arrives: from slightly smaller and quieter at the right edge
  // to full presence by the time it's well inside the view.
  cards.forEach((card) =>
    gsap.fromTo(
      card,
      { opacity: 0.35, scale: 0.94 },
      {
        opacity: 1,
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          containerAnimation: move,
          start: 'left 100%',
          end: 'left 68%',
          scrub: true,
        },
      }
    )
  );

  return {
    group: track,
    cleanup: () => {
      section.classList.remove('is-track');
      unclaim(track);
      scene.undo();
    },
  };
}

export { ScrollTrigger };
