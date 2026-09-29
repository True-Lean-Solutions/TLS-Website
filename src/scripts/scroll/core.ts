/**
 * Scroll layer core: GSAP + ScrollTrigger (+ SplitText), Lenis smooth
 * scrolling, and the shared motion vocabulary every scroll module uses.
 *
 * Motion only. Nothing here changes content or at-rest design; with reduced
 * motion, without JS, or on print, the site renders exactly as authored.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger, SplitText);
// Modules pass whatever a block contains (a heading with no eyebrow, a card
// with no cover): an empty target list is expected, not a mistake.
gsap.config({ nullTargetWarn: false });

/** One easing family for the whole site: a soft power curve, never bounce. */
export const EASE = 'power3.out';
export const EASE_IN_OUT = 'power2.inOut';

/** Timing scale (seconds): micro 0.2–0.4, section 0.6–0.9, hero 0.8–1.4. */
export const T = {
  micro: 0.3,
  section: 0.8,
  hero: 1.1,
  stagger: 0.08,
} as const;

/** Breakpoint + preference conditions, shared by every gsap.matchMedia(). */
export const MQ = {
  motion: '(prefers-reduced-motion: no-preference)',
  /** Wheel/trackpad users: smooth scrolling and cursor effects. */
  fine: '(hover: hover) and (pointer: fine)',
  tablet: '(min-width: 768px)',
  desktop: '(min-width: 1024px)',
  wide: '(min-width: 1280px)',
} as const;

export const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Height of the sticky header, for pins that sit below it. */
export const headerH = () =>
  (document.querySelector('.site-header') as HTMLElement | null)?.offsetHeight ?? 72;

let lenis: Lenis | null = null;

/**
 * Lenis: smooth wheel/trackpad scrolling that stays on the native scroll
 * position (sticky, anchors, find-in-page and back/forward keep working).
 * Touch keeps the device's own scrolling. Off for reduced motion.
 */
export function initSmoothScroll() {
  const mm = gsap.matchMedia();
  mm.add(`${MQ.motion} and ${MQ.fine}`, () => {
    lenis = new Lenis({
      lerp: 0.12, // responsive: catches up within a few frames, never "floaty"
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      // Let panels that scroll on their own (the mega-menu on short screens,
      // anything marked data-lenis-prevent) keep native wheel scrolling.
      prevent: (node: HTMLElement) => !!node.closest?.('.mega, [data-lenis-prevent]'),
    });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis?.destroy();
      lenis = null;
    };
  });
}

/** The page's actual scroll position (Lenis follows it a frame later). */
export const scrollPosition = () => window.scrollY;

/** Jump to a scroll position at once, keeping Lenis in step. */
export function scrollToY(y: number) {
  window.scrollTo(0, y);
  lenis?.scrollTo(y, { immediate: true, force: true });
}

/**
 * Layout can change after first paint (web fonts, lazy images); recompute
 * every trigger once those settle so pins and scrubs start in the right place.
 */
export function refreshWhenSettled() {
  let queued = 0;
  const refresh = () => {
    cancelAnimationFrame(queued);
    queued = requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  document.fonts?.ready.then(refresh);
  window.addEventListener('load', refresh, { once: true });
}

export { gsap, ScrollTrigger, SplitText };
