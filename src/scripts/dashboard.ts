/**
 * The illustrative dashboard (components/DashboardMock.astro): its sample
 * data, the chart geometry (shared by the server render and the browser),
 * and the behavior that makes it feel like a working product:
 *
 *   - a range switch (Last 6 months / Last 12 months / This quarter) that
 *     redraws every chart;
 *   - a crosshair and tooltip on the trend chart ("Mar · Above target");
 *   - legend ↔ donut highlighting;
 *   - when `live` and motion is allowed: the charts draw in, a light runs
 *     along the revenue line, the region bars refresh gently, the sparkline
 *     ends pulse. Nothing animates off screen or with reduced motion.
 *
 * Sample data only, and no figures anywhere: the mock-ups' numbers are
 * placeholders that are never published (docs/sources.md §5).
 */

export interface Range {
  label: string;
  axis: string[];
  actual: number[];
  target: number[];
  spark: number[][];
  regions: { a: number; t: number }[];
  shares: number[];
}

export const RANGES: Range[] = [
  {
    label: 'Last 6 months',
    axis: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    actual: [0.12, 0.22, 0.18, 0.34, 0.28, 0.45, 0.4, 0.55, 0.5, 0.66, 0.62, 0.8],
    target: [0.18, 0.21, 0.25, 0.28, 0.32, 0.35, 0.39, 0.42, 0.46, 0.49, 0.53, 0.56],
    spark: [
      [0.3, 0.42, 0.36, 0.55, 0.5, 0.7, 0.82],
      [0.25, 0.3, 0.42, 0.4, 0.55, 0.6, 0.72],
      [0.55, 0.6, 0.52, 0.62, 0.58, 0.64, 0.62],
      [0.2, 0.32, 0.3, 0.44, 0.52, 0.6, 0.74],
    ],
    regions: [
      { a: 0.88, t: 0.74 },
      { a: 0.7, t: 0.66 },
      { a: 0.6, t: 0.64 },
      { a: 0.5, t: 0.56 },
    ],
    shares: [0.38, 0.27, 0.21, 0.14],
  },
  {
    label: 'Last 12 months',
    axis: ['Jul', 'Sep', 'Nov', 'Jan', 'Mar', 'May'],
    actual: [0.2, 0.16, 0.28, 0.24, 0.3, 0.38, 0.33, 0.47, 0.52, 0.49, 0.64, 0.72],
    target: [0.22, 0.25, 0.27, 0.3, 0.33, 0.36, 0.4, 0.43, 0.46, 0.5, 0.54, 0.58],
    spark: [
      [0.2, 0.3, 0.28, 0.4, 0.46, 0.6, 0.7],
      [0.3, 0.28, 0.36, 0.44, 0.48, 0.58, 0.66],
      [0.5, 0.56, 0.6, 0.57, 0.62, 0.6, 0.65],
      [0.25, 0.28, 0.38, 0.42, 0.5, 0.62, 0.7],
    ],
    regions: [
      { a: 0.8, t: 0.76 },
      { a: 0.74, t: 0.68 },
      { a: 0.55, t: 0.6 },
      { a: 0.58, t: 0.54 },
    ],
    shares: [0.34, 0.3, 0.22, 0.14],
  },
  {
    label: 'This quarter',
    axis: ['Apr', 'May', 'Jun'],
    actual: [0.3, 0.36, 0.33, 0.42, 0.4, 0.5, 0.48, 0.57, 0.62, 0.6, 0.7, 0.76],
    target: [0.34, 0.37, 0.39, 0.42, 0.44, 0.47, 0.49, 0.52, 0.54, 0.57, 0.59, 0.62],
    spark: [
      [0.4, 0.45, 0.5, 0.48, 0.6, 0.66, 0.78],
      [0.35, 0.4, 0.45, 0.5, 0.52, 0.6, 0.68],
      [0.58, 0.62, 0.6, 0.64, 0.63, 0.66, 0.65],
      [0.3, 0.38, 0.45, 0.5, 0.56, 0.64, 0.72],
    ],
    regions: [
      { a: 0.92, t: 0.8 },
      { a: 0.66, t: 0.62 },
      { a: 0.64, t: 0.6 },
      { a: 0.46, t: 0.52 },
    ],
    shares: [0.4, 0.25, 0.23, 0.12],
  },
];

/** Chart box for the trend chart (viewBox units). */
export const W = 300;
export const H = 110;
const PAD = 8;

export const point = (vals: number[], i: number, w = W, h = H, pad = PAD) => ({
  x: (i / (vals.length - 1)) * w,
  y: h - pad - vals[i] * (h - pad * 2),
});

/** A smooth curve through the values (monotone-ish cubic), left to right. */
export function line(vals: number[], w = W, h = H, pad = PAD) {
  const p = vals.map((_, i) => point(vals, i, w, h, pad));
  let d = `M${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1];
    const b = p[i];
    const dx = (b.x - a.x) / 2.4;
    d += ` C${(a.x + dx).toFixed(1)} ${a.y.toFixed(1)} ${(b.x - dx).toFixed(1)} ${b.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d;
}
export const area = (vals: number[], w = W, h = H, pad = PAD) => `${line(vals, w, h, pad)} L${w} ${h} L0 ${h} Z`;

/** Donut arcs (circumference 100) for shares that sum to 1. */
export const R = 15.915;
export function arcs(shares: number[]) {
  let at = 25;
  return shares.map((s) => {
    const len = s * 100;
    const a = { dash: `${(len - 1.4).toFixed(2)} ${(100 - len + 1.4).toFixed(2)}`, offset: at.toFixed(2), len: len - 1.4 };
    at -= len;
    return a;
  });
}

const statusAt = (r: Range, i: number) => {
  const diff = r.actual[i] - r.target[i];
  return diff > 0.03 ? 'Above target' : diff < -0.03 ? 'Below target' : 'On target';
};

/* ------------------------------------------------------------ browser */

export function initDashboards() {
  const motionOK = () => window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

  for (const root of document.querySelectorAll<HTMLElement>('[data-dash]')) {
    if (root.dataset.ready) continue;
    root.dataset.ready = '1';
    const live = root.hasAttribute('data-live');
    let range = RANGES[0];
    let visible = false;
    let hovering = false;

    const $ = <T extends Element>(s: string) => root.querySelector<T>(s);
    const $$ = <T extends Element>(s: string) => [...root.querySelectorAll<T>(s)];
    const trend = $<HTMLElement>('.dash-trend-plot');
    const actualPath = $<SVGPathElement>('.dash-actual');
    const targetPath = $<SVGPathElement>('.dash-target');
    const areaPath = $<SVGPathElement>('.dash-area');
    const axis = $<HTMLElement>('.dash-axis');
    const runner = $<HTMLElement>('.dash-runner');
    const cross = $<HTMLElement>('.dash-cross');
    const tip = $<HTMLElement>('.dash-tip');
    const dotA = $<HTMLElement>('.dash-dot-a');
    const dotT = $<HTMLElement>('.dash-dot-t');
    const pill = $<HTMLButtonElement>('.dash-pill');
    const kpis = $$<HTMLElement>('.dash-kpi');
    const bars = $$<HTMLElement>('.dash-bar-pair');
    const donutArcs = $$<SVGCircleElement>('.dash-arc');
    const keys = $$<HTMLElement>('.dash-key li');

    /** Draw a path in (stroke-dash), from nothing to its full length. */
    const drawIn = (el: SVGPathElement | null, ms = 1100, delay = 0) => {
      if (!el || !motionOK()) return;
      // The lines don't scale their stroke (vector-effect), so their dashes
      // are in screen pixels: measure the path in screen pixels too.
      const svg = el.ownerSVGElement;
      const vb = svg?.viewBox.baseVal;
      const box = svg?.getBoundingClientRect();
      const scale = vb && box && vb.width ? Math.max(box.width / vb.width, box.height / vb.height) : 1;
      const len = Math.ceil(el.getTotalLength() * scale) + 2;
      el.style.strokeDasharray = `${len}`;
      el.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: ms, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      // Once drawn, the line goes back to its own stroke (the target's dashes).
      window.setTimeout(() => el.style.removeProperty('stroke-dasharray'), ms + delay + 40);
    };

    const render = (animate: boolean) => {
      actualPath?.setAttribute('d', line(range.actual));
      targetPath?.setAttribute('d', line(range.target));
      areaPath?.setAttribute('d', area(range.actual));
      if (axis) axis.innerHTML = range.axis.map((m) => `<span>${m}</span>`).join('');
      kpis.forEach((k, i) => {
        const vals = range.spark[i];
        k.querySelector('.dash-spark-line')?.setAttribute('d', line(vals, 120, 36, 4));
        k.querySelector('.dash-spark-area')?.setAttribute('d', area(vals, 120, 36, 4));
        const end = k.querySelector<HTMLElement>('.dash-spark-end');
        if (end) end.style.top = `${(1 - (4 + vals[vals.length - 1] * 28) / 36) * 100}%`;
      });
      bars.forEach((b, i) => {
        const [a, t] = [...b.querySelectorAll<HTMLElement>('i')];
        a?.style.setProperty('--h', String(range.regions[i].a));
        t?.style.setProperty('--h', String(range.regions[i].t));
      });
      arcs(range.shares).forEach((a, i) => {
        const c = donutArcs[i];
        if (!c) return;
        c.setAttribute('stroke-dasharray', a.dash);
        c.setAttribute('stroke-dashoffset', a.offset);
        if (animate && motionOK()) {
          c.animate([{ strokeDasharray: `0 100` }, { strokeDasharray: a.dash }], { duration: 700, delay: 120 + i * 110, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
        }
      });
      if (animate) {
        drawIn(actualPath, 1200, 80);
        drawIn(targetPath, 1000, 0);
        kpis.forEach((k, i) => drawIn(k.querySelector<SVGPathElement>('.dash-spark-line'), 900, 120 + i * 90));
      }
      if (pill) {
        pill.querySelector('span')!.textContent = range.label;
        const next = RANGES[(RANGES.indexOf(range) + 1) % RANGES.length];
        pill.setAttribute('aria-label', `Showing ${range.label.toLowerCase()} (sample data). Switch to ${next.label.toLowerCase()}.`);
      }
    };

    pill?.addEventListener('click', () => {
      range = RANGES[(RANGES.indexOf(range) + 1) % RANGES.length];
      root.classList.add('is-switching');
      render(true);
      window.setTimeout(() => root.classList.remove('is-switching'), 500);
    });

    /* Crosshair + tooltip on the trend chart. */
    const showAt = (i: number) => {
      if (!trend || !cross || !tip || !dotA || !dotT) return;
      const pa = point(range.actual, i);
      const pt = point(range.target, i);
      const x = (pa.x / W) * 100;
      cross.style.left = dotA.style.left = dotT.style.left = `${x}%`;
      dotA.style.top = `${(pa.y / H) * 100}%`;
      dotT.style.top = `${(pt.y / H) * 100}%`;
      const month = range.axis[Math.min(range.axis.length - 1, Math.floor((i * range.axis.length) / range.actual.length))];
      tip.textContent = `${month} · ${statusAt(range, i)}`;
      tip.style.left = `${Math.min(78, Math.max(22, x))}%`;
      tip.style.top = `${(Math.min(pa.y, pt.y) / H) * 100}%`;
    };
    trend?.addEventListener('pointermove', (e) => {
      const r = trend.getBoundingClientRect();
      const i = Math.round(((e.clientX - r.left) / r.width) * (range.actual.length - 1));
      hovering = true;
      root.classList.add('is-hovering');
      showAt(Math.max(0, Math.min(range.actual.length - 1, i)));
    });
    trend?.addEventListener('pointerleave', () => {
      hovering = false;
      if (!scanning) root.classList.remove('is-hovering');
    });

    /* The tour's "explore" step: the crosshair sweeps the trend chart. */
    let scanning = false;
    let scanTimer = 0;
    root.addEventListener('dash:scan', (e) => {
      const on = (e as CustomEvent<boolean>).detail;
      window.clearInterval(scanTimer);
      scanning = on;
      root.classList.toggle('is-scanning', on);
      root.classList.toggle('is-hovering', on || hovering);
      if (!on) return;
      let i = 3;
      showAt(i);
      if (!motionOK()) return;
      scanTimer = window.setInterval(() => {
        if (hovering) return;
        i = i >= range.actual.length - 1 ? 1 : i + 1;
        showAt(i);
      }, 520);
    });

    /* Legend ↔ donut. */
    keys.forEach((k, i) => {
      k.addEventListener('pointerenter', () => (root.classList.add('is-seg'), donutArcs.forEach((c, n) => c.classList.toggle('is-on', n === i))));
      k.addEventListener('pointerleave', () => (root.classList.remove('is-seg'), donutArcs.forEach((c) => c.classList.remove('is-on'))));
    });

    /* Live: a light runs along the revenue line; bars refresh now and then. */
    let raf = 0;
    let t0 = 0;
    let lastJitter = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden || !motionOK()) return;
      if (!t0) t0 = t;
      if (runner && actualPath && !hovering) {
        const len = actualPath.getTotalLength();
        const f = (((t - t0) / 4200) % 1 + 1) % 1;
        const p = actualPath.getPointAtLength(f * len);
        runner.style.left = `${(p.x / W) * 100}%`;
        runner.style.top = `${(p.y / H) * 100}%`;
        runner.style.opacity = String(Math.min(1, f * 8, (1 - f) * 8));
      }
      if (t - lastJitter > 2600) {
        lastJitter = t;
        bars.forEach((b, i) =>
          b.querySelectorAll<HTMLElement>('i').forEach((bar, k) => {
            const base = k ? range.regions[i].t : range.regions[i].a;
            bar.style.setProperty('--h', String(Math.max(0.2, Math.min(0.98, base + (Math.random() - 0.5) * 0.1))));
          })
        );
      }
    };

    const io = new IntersectionObserver(
      ([e]) => {
        const first = e.isIntersecting && !visible && !root.dataset.drawn;
        visible = e.isIntersecting;
        // The first time it comes into view, the charts draw in (unless the
        // scroll layer draws this one: [data-draw]). The tour waits for the
        // laptop to open before it starts.
        if (first && !root.hasAttribute('data-draw')) {
          root.dataset.drawn = '1';
          render(true);
        }
      },
      { threshold: 0.2 }
    );
    io.observe(root);
    if (live) raf = requestAnimationFrame(tick);
    render(false);

    // Stop the loop and the observer when the page goes away.
    window.addEventListener('pagehide', () => (cancelAnimationFrame(raf), io.disconnect()), { once: true });
  }
}

/* ------------------------------------------------------------ guided tour */

/**
 * A guided tour of a dashboard ([data-bi-tour]): each [data-step] button
 * brings one part of the dashboard forward (focus-<step> on the dashboard),
 * moves the callout, lights the matching [data-tech] items and, for
 * "explore", sweeps the trend chart. It advances on its own while on screen
 * — the active step's progress bar is the timer (its CSS animation ends →
 * next step), so hover and off-screen pauses come free — until the visitor
 * picks a step, which hands them control. Reduced motion: no auto-play.
 */
const CALLOUTS: Record<string, { text: string; x: number; y: number }> = {
  kpis: { text: 'KPIs at a glance', x: 50, y: 9 },
  ops: { text: 'What needs attention', x: 47, y: 61 },
  explore: { text: 'Explore any period', x: 34, y: 24 },
  secure: { text: 'Each user sees only their data', x: 32, y: 40 },
};

export function initTours() {
  const motionOK = () => window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  for (const sec of document.querySelectorAll<HTMLElement>('[data-bi-tour]')) {
    if (sec.dataset.ready) continue;
    sec.dataset.ready = '1';
    const dash = sec.querySelector<HTMLElement>('[data-dash]');
    const btns = [...sec.querySelectorAll<HTMLButtonElement>('[data-step]')];
    const callout = sec.querySelector<HTMLElement>('.da-callout');
    const calloutText = callout?.querySelector<HTMLElement>('.da-callout-text');
    const techs = [...sec.querySelectorAll<HTMLElement>('[data-tech]')];
    const caption = sec.querySelector<HTMLElement>('.da-tour-caption');
    if (!dash || btns.length === 0) continue;
    const names = btns.map((b) => b.dataset.step ?? '');
    let at = -1;

    const set = (k: number) => {
      at = k;
      const name = names[k];
      btns.forEach((b, n) => {
        b.setAttribute('aria-pressed', String(n === k));
        const li = b.closest('li');
        li?.classList.remove('is-active');
        if (n === k && li) {
          void li.offsetWidth; // restart the progress bar
          li.classList.add('is-active');
        }
      });
      names.forEach((n) => dash.classList.toggle(`focus-${n}`, n === name));
      if (caption) caption.textContent = btns[k].closest('li')?.querySelector('p')?.textContent ?? '';
      dash.dispatchEvent(new CustomEvent('dash:scan', { detail: name === 'explore' }));
      techs.forEach((t) => t.classList.toggle('is-on', (t.dataset.tech ?? '').split(' ').includes(name)));
      const c = CALLOUTS[name];
      if (callout && calloutText && c) {
        callout.classList.remove('is-in');
        void callout.offsetWidth;
        calloutText.textContent = c.text;
        callout.style.left = `${c.x}%`;
        callout.style.top = `${c.y}%`;
        callout.classList.add('is-in');
      }
    };

    btns.forEach((b, k) =>
      b.addEventListener('click', () => {
        sec.classList.add('is-manual');
        set(k);
      })
    );
    // The progress bar is the clock: when it fills, move on.
    sec.addEventListener('animationend', (e) => {
      if ((e as AnimationEvent).animationName !== 'da-tour-progress' || sec.classList.contains('is-manual')) return;
      set((at + 1) % names.length);
    });
    // Pause off screen; start once the laptop is open and in view.
    const io = new IntersectionObserver(
      ([e]) => {
        sec.classList.toggle('is-paused', !e.isIntersecting);
        if (e.isIntersecting && at < 0 && motionOK()) window.setTimeout(() => at < 0 && set(0), 900);
      },
      { threshold: 0.55 }
    );
    io.observe(dash);
  }
}
