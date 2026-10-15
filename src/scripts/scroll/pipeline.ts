/**
 * Data & Analytics page: the modern data foundation assembles with the
 * scroll (scroll position → progress, so scrolling back takes it apart).
 * No hold: it builds over the natural scroll past the diagram.
 *
 *   [data-flow] ...... Desktop: the flow diagram. The five sources start
 *                      scattered and tilted (fragmented) and snap into a
 *                      column; their lines draw into Ingest & Transform; the
 *                      lakehouse stacks layer by layer; the semantic layer
 *                      lights; the lines fan out to Dashboards, Reports and
 *                      AI. Data dots flow along each line once it is drawn
 *                      (SVG animateMotion, paused off screen).
 *   [data-pipeline] .. Tablets and phones: the vertical list builds as it
 *                      passes through the screen, connectors filling in turn.
 *
 * One timeline per view. Every element ends exactly as authored; nothing runs
 * with reduced motion (the complete diagram shows, without the moving dots).
 */
import { gsap, ScrollTrigger } from './core';

type Cleanup = () => void;

/** Where each source starts, as a share of its own size: scattered, tilted. */
const SCATTER = [
  { x: 55, y: 70, r: -9 },
  { x: 150, y: -60, r: 7 },
  { x: -10, y: 95, r: -5 },
  { x: 120, y: -85, r: 10 },
  { x: 30, y: -120, r: -7 },
];

function flow(fig: HTMLElement): Cleanup {
  const q = <T extends Element>(s: string) => [...fig.querySelectorAll<T>(s)];
  const lines = (seg: string) => q<SVGPathElement>(`.flow-line[data-seg="${seg}"]`);
  const dots = (seg: string) => q<SVGGElement>(`.flow-dots[data-seg="${seg}"]`);
  const srcs = q<HTMLElement>('.flow-src');
  const ing = fig.querySelector<HTMLElement>('.flow-ing');
  const plt = fig.querySelector<HTMLElement>('.flow-plt');
  const slabs = q<SVGGElement>('.flow-slab');
  const sem = fig.querySelector<HTMLElement>('.flow-sem');
  const graph = q<SVGElement>('.flow-graph path, .flow-graph circle');
  const outs = q<HTMLElement>('.flow-out');
  const phases = q<HTMLElement>('.flow-phase');
  const svg = fig.querySelector<SVGSVGElement>('.da-flow-box > svg');
  const allLines = q<SVGPathElement>('.flow-line');
  const allDots = q<SVGGElement>('.flow-dots');

  allLines.forEach((l) => {
    const len = l.getTotalLength();
    gsap.set(l, { strokeDasharray: len, strokeDashoffset: len });
  });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: fig,
      start: 'top 82%',
      end: 'bottom 55%',
      scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => fig.classList.toggle('is-done', self.progress > 0.97),
    },
  });
  const draw = (els: SVGPathElement[], at: number, d = 0.7, stagger = 0) =>
    tl.to(els, { strokeDashoffset: 0, duration: d, stagger, ease: 'power1.inOut' }, at);
  const appear = (els: Element[], at: number, d = 0.4) => tl.fromTo(els, { opacity: 0 }, { opacity: 1, duration: d }, at);
  const pop = (el: Element | null, at: number) =>
    el && tl.fromTo(el, { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, at);

  // 1. Fragmented: the sources snap from scattered into a column.
  tl.fromTo(
    srcs,
    { xPercent: (i) => SCATTER[i % 5].x, yPercent: (i) => SCATTER[i % 5].y, rotate: (i) => SCATTER[i % 5].r, opacity: 0.55 },
    { xPercent: 0, yPercent: 0, rotate: 0, opacity: 1, duration: 1.6, stagger: 0.1, ease: 'power3.inOut' },
    0
  );
  // 2. Their lines run into Ingest & Transform; data starts to move.
  draw(lines('src'), 1.7, 0.8, 0.06);
  appear(dots('src'), 2.4);
  pop(ing, 2.3);
  // 3. Structured: into the lakehouse, layer by layer.
  draw(lines('ip'), 2.9, 0.5);
  appear(dots('ip'), 3.3);
  if (plt) tl.fromTo(plt, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 3.2);
  tl.fromTo(slabs, { opacity: 0, y: -22 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.22, ease: 'power2.out' }, 3.4);
  // 4. Trusted: the semantic layer lights, its graph draws.
  draw(lines('ps'), 4.3, 0.5);
  appear(dots('ps'), 4.7);
  pop(sem, 4.6);
  tl.fromTo(graph, { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.05 }, 4.9);
  // 5. Actionable: the lines fan out to the outputs.
  draw(lines('out'), 5.4, 0.7, 0.1);
  outs.forEach((o, i) => pop(o, 5.8 + i * 0.18));
  appear(dots('out'), 6.2);
  // The story band follows the build.
  [0, 2.3, 4.6, 5.8].forEach((at, i) => phases[i] && tl.fromTo(phases[i], { opacity: 0.25 }, { opacity: 1, duration: 0.4 }, at));
  tl.to({}, { duration: 0.3 });

  // The moving data runs only while the diagram is on screen.
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? svg?.unpauseAnimations() : svg?.pauseAnimations()));
  if (svg) io.observe(svg);

  return () => {
    io.disconnect();
    svg?.unpauseAnimations();
    tl.scrollTrigger?.kill();
    tl.kill();
    gsap.set([...srcs, ...slabs, ...graph, ...outs, ...phases, ...allDots, ing, plt, sem].filter(Boolean) as Element[], { clearProps: 'opacity,transform' });
    gsap.set(allLines, { clearProps: 'strokeDasharray,strokeDashoffset' });
    fig.classList.remove('is-done');
  };
}

function list(section: HTMLElement): Cleanup {
  const pipe = section.querySelector<HTMLElement>('.da-pipe');
  const nodes = [...section.querySelectorAll<HTMLElement>('.da-node')];
  if (!pipe || nodes.length === 0) return () => {};
  const n = nodes.length;
  const fills = nodes.map((node) => node.querySelector<HTMLElement>('.da-conn-fill'));
  const sources = [...nodes[0].querySelectorAll<HTMLElement>('.da-node-tags li')];
  const outputs = [...nodes[n - 1].querySelectorAll<HTMLElement>('.da-node-tags li')];

  let active = -1;
  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    nodes.forEach((node, k) => node.classList.toggle('is-active', k === i));
  };
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: pipe,
      start: 'top 80%',
      end: 'bottom 55%',
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => setActive(Math.min(n - 1, Math.floor(self.progress * n))),
    },
  });
  nodes.forEach((node, k) => {
    const fill = fills[k];
    if (fill) tl.fromTo(fill, { scaleY: 0 }, { scaleY: 1, duration: 0.45 }, k - 0.5);
    tl.fromTo(node, { opacity: 0.22, y: 18, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power2.out' }, k);
  });
  sources.forEach((chip, i) =>
    tl.fromTo(
      chip,
      { opacity: 0, x: ((i % 3) - 1) * 26, y: i % 2 ? -22 : 18, rotate: i % 2 ? 8 : -8 },
      { opacity: 1, x: 0, y: 0, rotate: 0, duration: 0.4, ease: 'power2.out' },
      0.1 + i * 0.06
    )
  );
  tl.fromTo(outputs, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.08, ease: 'power2.out' }, n - 1 + 0.25);
  setActive(0);

  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    gsap.set([...nodes, ...sources, ...outputs], { clearProps: 'opacity,transform' });
    gsap.set(fills.filter(Boolean) as HTMLElement[], { clearProps: 'transform' });
    nodes.forEach((node) => node.classList.remove('is-active'));
  };
}

export function initPipelines(on: { desktop: boolean }): Cleanup {
  const cleanups: Cleanup[] = [];
  for (const section of document.querySelectorAll<HTMLElement>('[data-pipeline]')) {
    const fig = section.querySelector<HTMLElement>('[data-flow]');
    cleanups.push(on.desktop && fig ? flow(fig) : list(section));
  }
  if (cleanups.length) requestAnimationFrame(() => ScrollTrigger.refresh());
  return () => cleanups.forEach((fn) => fn());
}
