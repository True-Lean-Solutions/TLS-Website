/**
 * Review reel (ReviewReel.astro): client reviews as a continuous stream.
 *  - Two rows drift in opposite directions (one on phones), slowly, each at
 *    its own speed, and loop seamlessly: a row's track repeats its set of
 *    reviews, and the offset wraps by exactly one set's width.
 *  - Scrolling influences them: scrolling down carries both rows a little
 *    faster (up to 1.35x), scrolling up counteracts and, when fast, gently
 *    reverses them. The influence is smoothed, so the reel has momentum:
 *    it eases up and settles back rather than jumping.
 *  - Cards passing the middle of the screen are a touch more present; those
 *    near the edges a touch quieter (never unreadable).
 *  - Hovering (mouse), pressing (touch) or focusing a row eases it to a stop;
 *    so do the pause button and an open review (ReviewReel's own script).
 *  - Arrival: row 1 comes in from the left, row 2 from the right; on desktop
 *    the rows then drift apart slightly in depth as the page scrolls.
 * Transforms and opacity only, on one shared ticker, and asleep while the
 * reel is off screen. Reduced motion never runs this: the reviews stay a
 * still grid (ReviewReel's CSS).
 */
import { gsap, ScrollTrigger, EASE } from './core';

type Cleanup = () => void;

const SPEED = [32, 40]; // px/s: calm, not a ticker
const BOOST_MAX = 1.35; // scrolling down, at most this much faster
const BOOST_MIN = -0.5; // scrolling up fast: a gentle reverse
const V_FOR_1X = 4000; // px/s of scroll that adds 1x
const TAU_V = 0.2; // s: scroll-velocity smoothing
const TAU_BOOST = 0.5; // s: how the reel eases into and out of a boost
const TAU_HOLD = 0.35; // s: easing to a stop (hover, focus, pause) and back
const TOUCH_RESUME_MS = 1500;

interface Row {
  el: HTMLElement;
  track: HTMLElement;
  dir: number; // -1: content drifts left; 1: right
  speed: number;
  o: number; // offset into the loop, 0..w
  w: number; // width of one set of reviews (the loop length)
  lead: number; // one card's pitch: the track always starts a card left of the row
  hold: number; // 1 moving, 0 stopped (eased)
  held: boolean;
  left: number; // row's left edge in the viewport (cached)
  cards: HTMLElement[];
  lefts: number[];
  widths: number[];
  shown: number[]; // last written scale, to skip needless writes
  added: HTMLElement[]; // clones this module appended
}

const wrap = (v: number, w: number) => ((v % w) + w) % w;
const ease = (dt: number, tau: number) => 1 - Math.exp(-dt / tau);

export function initReviewReels(on: { desktop: boolean }): Cleanup {
  const cleanups = [...document.querySelectorAll<HTMLElement>('[data-rr]')].map((root) => reel(root, on));
  return () => cleanups.forEach((c) => c());
}

function reel(root: HTMLElement, on: { desktop: boolean }): Cleanup {
  const abort = new AbortController();
  const { signal } = abort;
  const rows: Row[] = [...root.querySelectorAll<HTMLElement>('.rr-row')]
    .filter((el) => getComputedStyle(el).display !== 'none')
    .map((el, i) => {
      const track = el.querySelector<HTMLElement>('.rr-track')!;
      return {
        el,
        track,
        dir: Number(el.dataset.dir) || (i ? 1 : -1),
        speed: SPEED[i % SPEED.length],
        o: 0,
        w: 0,
        lead: 0,
        hold: 1,
        held: false,
        left: 0,
        cards: [],
        lefts: [],
        widths: [],
        shown: [],
        added: [],
      };
    });
  if (!rows.length) return () => {};

  /** Measure a row, and make sure its track covers the view plus one full set. */
  const measure = (r: Row, first = false) => {
    const set = Number(r.track.dataset.set) || 1;
    let cards = [...r.track.children] as HTMLElement[];
    if (cards.length <= set) return;
    r.w = cards[set].offsetLeft - cards[0].offsetLeft;
    r.lead = cards[1].offsetLeft - cards[0].offsetLeft;
    const need = r.el.clientWidth + r.w + r.lead + 1;
    while (r.track.scrollWidth < need) {
      for (const c of cards.slice(0, set)) {
        const copy = c.cloneNode(true) as HTMLElement;
        copy.setAttribute('aria-hidden', 'true');
        copy.setAttribute('data-clone', '');
        copy.querySelectorAll('button, a').forEach((b) => b.setAttribute('tabindex', '-1'));
        r.track.append(copy);
        r.added.push(copy);
      }
      cards = [...r.track.children] as HTMLElement[];
    }
    r.cards = cards;
    r.lefts = cards.map((c) => c.offsetLeft);
    r.widths = cards.map((c) => c.offsetWidth);
    r.shown = cards.map(() => -1);
    r.left = r.el.getBoundingClientRect().left;
    r.o = first ? (rows.indexOf(r) % 2 ? r.w / 2 : 0) : wrap(r.o, r.w);
  };
  rows.forEach((r) => measure(r, true));

  // Scroll velocity, from the page's own position (Lenis or native, touch too).
  let lastY = window.scrollY;
  let v = 0;
  let boost = 1;
  const mid = () => window.innerWidth / 2;

  const tick = (_time: number, deltaMs: number) => {
    const dt = Math.min(deltaMs, 64) / 1000;
    if (dt <= 0) return;
    const y = window.scrollY;
    v += ((y - lastY) / dt - v) * ease(dt, TAU_V);
    lastY = y;
    const target = Math.min(BOOST_MAX, Math.max(BOOST_MIN, 1 + v / V_FOR_1X));
    boost += (target - boost) * ease(dt, TAU_BOOST);
    const stopAll = root.hasAttribute('data-paused') || root.hasAttribute('data-open');
    const m = mid();
    for (const r of rows) {
      if (!r.w) continue;
      r.hold += ((stopAll || r.held ? 0 : 1) - r.hold) * ease(dt, TAU_HOLD);
      r.o = wrap(r.o - r.dir * r.speed * boost * r.hold * dt, r.w);
      const shift = r.o + r.lead;
      r.track.style.transform = `translate3d(${(-shift).toFixed(2)}px, 0, 0)`;
      // Center focus: a card is most present as it passes the middle.
      for (let i = 0; i < r.cards.length; i++) {
        const cx = r.left + r.lefts[i] - shift + r.widths[i] / 2;
        const d = Math.min(1, Math.abs(cx - m) / m);
        const s = Math.round((1 - 0.04 * d * d) * 1000) / 1000;
        if (s === r.shown[i]) continue;
        r.shown[i] = s;
        r.cards[i].style.scale = String(s);
        r.cards[i].style.opacity = String(Math.round((1 - 0.12 * d * d) * 1000) / 1000);
      }
    }
  };

  // Run only while the reel is on (or near) the screen.
  let running = false;
  const start = () => {
    if (running) return;
    running = true;
    lastY = window.scrollY;
    v = 0;
    gsap.ticker.add(tick);
  };
  const stop = () => {
    if (!running) return;
    running = false;
    gsap.ticker.remove(tick);
  };
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: '200px 0px' });
  io.observe(root);

  const ro = new ResizeObserver(() => rows.forEach((r) => measure(r)));
  ro.observe(root);

  // Hover (mouse), press (touch) and keyboard focus ease a row to a stop.
  for (const r of rows) {
    let resume = 0;
    r.el.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') r.held = true; }, { signal });
    r.el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') r.held = false; }, { signal });
    r.el.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      window.clearTimeout(resume);
      r.held = true;
    }, { signal });
    const release = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      window.clearTimeout(resume);
      resume = window.setTimeout(() => (r.held = false), TOUCH_RESUME_MS);
    };
    r.el.addEventListener('pointerup', release, { signal });
    r.el.addEventListener('pointercancel', release, { signal });
    r.el.addEventListener('focusin', (e) => {
      r.held = true;
      reveal();
      // Bring the focused review to the middle of the row.
      const i = r.cards.findIndex((c) => c.contains(e.target as Node));
      if (i < 0) return;
      const to = wrap(r.lefts[i] + r.widths[i] / 2 - r.el.clientWidth / 2 - r.lead, r.w);
      let from = r.o;
      if (Math.abs(to - from) > r.w / 2) from += to > from ? r.w : -r.w;
      const s = { o: from };
      gsap.to(s, { o: to, duration: 0.6, ease: EASE, onUpdate: () => (r.o = wrap(s.o, r.w)) });
    }, { signal });
    r.el.addEventListener('focusout', (e) => {
      if (!r.el.contains(e.relatedTarget as Node | null)) r.held = false;
    }, { signal });
  }

  // Arrival: row 1 from the left, row 2 from the right, into their drift.
  const rowEls = rows.map((r) => r.el);
  gsap.set(rowEls, { x: (i: number) => (i % 2 ? 90 : -90), opacity: 0 });
  let arrived = false;
  const reveal = () => {
    if (arrived) return;
    arrived = true;
    gsap.to(rowEls, { x: 0, opacity: 1, duration: 1.3, ease: EASE, stagger: 0.18 });
  };
  const enter = ScrollTrigger.create({ trigger: root, start: 'top 85%', once: true, onEnter: reveal });

  // Depth on desktop: the rows part slightly as the page scrolls past.
  const depth = on.desktop
    ? rows.map((r, i) =>
        gsap.fromTo(
          r.el,
          { y: i % 2 ? -12 : 12 },
          { y: i % 2 ? 12 : -12, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true } }
        )
      )
    : [];

  return () => {
    stop();
    io.disconnect();
    ro.disconnect();
    abort.abort();
    enter.kill();
    depth.forEach((t) => {
      t.scrollTrigger?.kill();
      t.kill();
    });
    for (const r of rows) {
      r.added.forEach((c) => c.remove());
      r.track.style.removeProperty('transform');
      r.cards.forEach((c) => {
        c.style.removeProperty('scale');
        c.style.removeProperty('opacity');
      });
    }
    gsap.set(rowEls, { clearProps: 'transform,opacity' });
  };
}
