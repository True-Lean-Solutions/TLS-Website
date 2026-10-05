/**
 * TLS scroll experience: one entry point, one gsap.matchMedia() context.
 * Each effect runs only where it helps (see the conditions below); when a
 * condition changes (resize, rotate, reduced-motion toggled), everything is
 * reverted to the authored markup and re-applied for the new conditions.
 *
 * Hierarchy (restraint is the design):
 *   micro     hover, buttons, icons ................ CSS (motion.css)
 *   section   headings, cards, steps, images ...... text.ts, cards.ts, steps.ts, media.ts
 *   story     parallax, pinned + horizontal scenes . media.ts, story.ts, reel.ts
 *   signature heroes, Challenges, Solutions ........ media.ts, story.ts
 *   page      the Contact conversation ............. contact.ts
 *             product pages (Meeting Intelligence) .. product.ts
 */
import { gsap, ScrollTrigger, MQ, initSmoothScroll, refreshWhenSettled, scrollPosition, scrollToY } from './core';
import { initHeadingReveals } from './text';
import { initCardEntrances, initCardDepth } from './cards';
import { initHeroes, initMediaReveals, initSpotlights, initLogoDrift } from './media';
import { initChallengeStory, initSolutionsTrack, initSolutionsGrid } from './story';
import { initChrome, initFooterReveal } from './chrome';
import { initContact } from './contact';
import { initStepSequences } from './steps';
import { initReviewReels } from './reel';
import { initPlaceCards } from './places';
import { initProductPage } from './product';

/** Solutions page: horizontal card track (off: the cards show as a grid). */
const SOLUTIONS_TRACK = false;

/**
 * Reveals only ever fade (opacity), never hide (visibility): content waiting
 * to be revealed stays focusable and readable to assistive tech. And anything
 * a keyboard user tabs into is brought to full presence at once.
 */
function revealOnFocus() {
  document.addEventListener('focusin', (e) => {
    for (let el = e.target as HTMLElement | null; el && el !== document.body; el = el.parentElement) {
      if (el.style.opacity === '' || +el.style.opacity >= 1) continue;
      if (!el.closest('[data-reveal="cards"], [data-reveal="heading"], [data-reveal="media"], [data-reveal="track"], [data-reveal="form"], .site-footer')) continue;
      gsap.to(el, { opacity: 1, y: 0, duration: 0.3, overwrite: 'auto' });
    }
  });
}

/**
 * When a change of conditions rebuilds the layer (resize or rotation across a
 * breakpoint), ScrollTrigger re-measures from the top (twice) and, with Lenis
 * running, doesn't always come back. Put the reader back where they were, a
 * frame after the last re-measure.
 */
function keepPlace(y: number) {
  let frame = 0;
  const restore = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (Math.abs(scrollPosition() - y) > 1) scrollToY(y);
    });
  };
  ScrollTrigger.addEventListener('refresh', restore);
  restore();
  window.setTimeout(() => ScrollTrigger.removeEventListener('refresh', restore), 1000);
}

export function initScroll() {
  initSmoothScroll();
  initChrome(); // progress + compact header follow scroll for everyone
  revealOnFocus();

  const mm = gsap.matchMedia();
  let resumeAt: number | null = null;
  mm.add(
    {
      motion: MQ.motion,
      fine: MQ.fine,
      tablet: MQ.tablet,
      desktop: MQ.desktop,
      // Scenes need room: a pin taller than the screen would hide its own content.
      // 880px: the Challenges section (section padding) fits below the header.
      story: '(min-width: 1280px) and (min-height: 880px)',
      track: '(min-width: 1024px) and (min-height: 680px)',
      homeHero: '(min-width: 901px)',
      solutionHero: '(min-width: 641px)',
    },
    (ctx) => {
      const c = ctx.conditions as Record<string, boolean>;
      if (!c.motion) return; // reduced motion: the authored, static page

      const cleanups: (() => void)[] = [];
      const skip = new Set<HTMLElement>();

      // Scenes run with Lenis (mouse/trackpad) only; tablets and phones keep
      // the normal layouts. The Solutions page's horizontal track is off since
      // 2026-09-30 (Hemang: all cards visible together, as a grid); set
      // SOLUTIONS_TRACK to bring it back.
      if (SOLUTIONS_TRACK && c.track && c.fine) {
        const t = initSolutionsTrack();
        if (t.group) skip.add(t.group);
        cleanups.push(t.cleanup);
      } else {
        const g = initSolutionsGrid();
        if (g.group) skip.add(g.group);
        cleanups.push(g.cleanup);
      }
      cleanups.push(initContact({ desktop: c.desktop }));
      cleanups.push(initHeadingReveals());
      cleanups.push(initCardEntrances(skip));
      if (c.desktop) cleanups.push(initCardDepth(skip));
      cleanups.push(initStepSequences());
      cleanups.push(initReviewReels({ desktop: c.desktop }));
      cleanups.push(initPlaceCards({ desktop: c.desktop }));
      cleanups.push(initProductPage({ desktop: c.desktop }));
      cleanups.push(initHeroes({ home: c.homeHero, solution: c.solutionHero, pageHero: c.tablet }));
      cleanups.push(initMediaReveals(c.desktop));
      if (c.story && c.fine) cleanups.push(initChallengeStory());
      if (c.fine) cleanups.push(initSpotlights());
      if (c.tablet) cleanups.push(initLogoDrift());
      cleanups.push(initFooterReveal());

      if (resumeAt !== null) keepPlace(resumeAt);
      resumeAt = null;

      return () => {
        resumeAt = scrollPosition();
        cleanups.reverse().forEach((fn) => fn());
      };
    }
  );

  refreshWhenSettled();
}
