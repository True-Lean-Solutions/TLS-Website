/**
 * TLS interaction layer — the small amount of JS behind src/styles/motion.css.
 *  - Scroll reveals: [data-reveal] and the children of [data-reveal="stagger"]
 *    get .is-in as they enter the viewport; items entering together stagger.
 *  - Cursor light: .ix-light surfaces track the pointer via --mx / --my.
 *  - Magnetic CTAs: [data-magnetic] buttons lean at most 3px toward the cursor.
 *  - Count-up metrics: [data-count-up] count from zero each time they scroll in.
 * Everything is progressive. Without this script, or with reduced motion, the
 * page renders fully visible and static (the CSS only hides content once the
 * head script has set html.ix).
 */

import { parseMetric, formatMetric, type Metric } from './metric';

declare global {
  interface Window {
    __ixReady?: boolean;
  }
}

window.__ixReady = true;

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

const STAGGER_MS = 80;
const MAX_STAGGER_STEPS = 5;

function initReveal() {
  if (!root.classList.contains('ix')) return;

  // Non-rendered children (e.g. a component's inline <script>) never intersect.
  const rendered = (el: Element) => !el.matches('script, style, link, template');

  const targets: Element[] = [];
  for (const el of document.querySelectorAll<HTMLElement>('[data-reveal]')) {
    const mode = el.dataset.reveal;
    if (mode === 'load') continue; // CSS-only, above the fold
    if (mode === 'stagger') targets.push(...[...el.children].filter(rendered));
    else targets.push(el);
  }

  const pending = new Set<Element>();

  /** Reveal `el`; `step` staggers it within a batch, -1 shows it in place. */
  const show = (el: Element, step: number) => {
    pending.delete(el);
    io.unobserve(el);
    if (step < 0) {
      el.classList.add('is-in', 'ix-instant');
      return;
    }
    (el as HTMLElement).style.setProperty(
      '--ix-d',
      `${Math.min(step, MAX_STAGGER_STEPS) * STAGGER_MS}ms`
    );
    el.classList.add('is-in');
  };

  const io = new IntersectionObserver(
    (entries) => {
      let step = 0;
      for (const entry of entries) {
        if (entry.isIntersecting) show(entry.target, step++);
      }
      // Anything scrolled past too fast to ever intersect (scrollbar drag,
      // End key, a hard fling) is shown in place, never left hidden above.
      for (const el of pending) {
        if (el.getBoundingClientRect().bottom < 0) show(el, -1);
      }
    },
    { rootMargin: '0px 0px -8% 0px' }
  );

  for (const el of targets) {
    // Already scrolled past (restored scroll position, anchor jump): show it
    // without animating, so nothing above the reader is left invisible.
    if (el.getBoundingClientRect().bottom < 0) {
      el.classList.add('is-in', 'ix-instant');
    } else {
      pending.add(el);
      io.observe(el);
    }
  }
}

/** CSS cubic-bezier() as a JS easing function (Newton's method + bisection). */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const x = (t: number) => ((ax * t + bx) * t + cx) * t;
  const y = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (p: number) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let t = p;
    for (let i = 0; i < 8; i++) {
      const err = x(t) - p;
      if (Math.abs(err) < 1e-6) return y(t);
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0, hi = 1;
    t = p;
    for (let i = 0; i < 30; i++) {
      if (x(t) < p) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return y(t);
  };
}

/**
 * Count-up for [data-count-up] metrics (the $0 starting state is rendered by
 * StatInline; see motion.css). Plays every time its [data-count-group] comes
 * ≥25% into view, and resets to zero once the group has fully left the view.
 * One requestAnimationFrame loop per group, cancelled before any restart.
 */
function initCountUp() {
  const DURATION_MS = 3000;
  const ENTER_RATIO = 0.25;
  const ease = cubicBezier(0.22, 1, 0.36, 1);

  interface Counter {
    el: HTMLElement;
    metric: Metric;
    step: number;
  }
  const groups = new Map<Element, Counter[]>();
  for (const el of document.querySelectorAll<HTMLElement>('[data-count-up]')) {
    const metric = parseMetric(el.textContent ?? '');
    if (!metric) continue;
    const group = el.closest('[data-count-group]') ?? el;
    const list = groups.get(group) ?? [];
    list.push({ el, metric, step: 10 ** -metric.decimals });
    groups.set(group, list);
  }

  for (const [group, counters] of groups) {
    let frame = 0;
    let armed = true; // showing zero, ready to count on the next entry

    const show = (c: Counter, n: number) =>
      c.el.setAttribute('data-count-live', formatMetric(c.metric, n));

    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      counters.forEach((c) => show(c, 0));
      armed = true;
    };

    const play = () => {
      cancelAnimationFrame(frame); // never more than one loop
      armed = false;
      const t0 = performance.now();
      const tick = (now: number) => {
        let running = false;
        counters.forEach((c, i) => {
          // Same 80ms rhythm as the cards' reveal stagger.
          const p = Math.min(1, Math.max(0, now - t0 - i * STAGGER_MS) / DURATION_MS);
          if (p < 1) {
            running = true;
            show(c, Math.round((c.metric.target * ease(p)) / c.step) * c.step);
          } else {
            c.el.removeAttribute('data-count-live'); // back to the exact real text
          }
        });
        frame = running ? requestAnimationFrame(tick) : 0;
      };
      frame = requestAnimationFrame(tick);
    };

    reset();
    new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) reset();
          else if (armed && entry.intersectionRatio >= ENTER_RATIO) play();
        }
      },
      { threshold: [0, ENTER_RATIO] }
    ).observe(group);
  }
}

/** Calls `update` at most once per frame with the latest pointer event. */
function onPointerFrame(el: HTMLElement, update: (e: PointerEvent, rect: DOMRect) => void) {
  let frame = 0;
  let last: PointerEvent;
  el.addEventListener('pointermove', (e) => {
    last = e;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      update(last, el.getBoundingClientRect());
    });
  });
  return () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
}

function initCursorLight() {
  for (const el of document.querySelectorAll<HTMLElement>('.ix-light')) {
    onPointerFrame(el, (e, r) => {
      el.style.setProperty('--mx', `${Math.round(e.clientX - r.left)}px`);
      el.style.setProperty('--my', `${Math.round(e.clientY - r.top)}px`);
    });
  }
}

function initMagnetic() {
  const PULL_X = 3;
  const PULL_Y = 2;
  for (const el of document.querySelectorAll<HTMLElement>('[data-magnetic]')) {
    const cancel = onPointerFrame(el, (e, r) => {
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.setProperty('--mag-x', `${(dx * PULL_X).toFixed(2)}px`);
      el.style.setProperty('--mag-y', `${(dy * PULL_Y).toFixed(2)}px`);
    });
    el.addEventListener('pointerleave', () => {
      cancel();
      el.style.removeProperty('--mag-x');
      el.style.removeProperty('--mag-y');
    });
  }
}

initReveal();
// Reduced motion: leave the real values exactly as rendered, no counting.
if (!reduceMotion) initCountUp();
if (finePointer && !reduceMotion) {
  initCursorLight();
  initMagnetic();
}

export {};
