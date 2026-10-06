/**
 * Cyber Security page (2026-10-06): the two pieces of its story that scroll
 * drives directly (scroll position → progress, so scrolling back undoes them).
 *
 *   [data-layers] .... Security at Every Layer. The stage holds (CSS sticky)
 *                      while the six layer notes scroll past it; one scrubbed
 *                      timeline builds the stack, layer by layer: each slab
 *                      drops into place and its edge lights, its wire draws
 *                      out to its tag, the core beam rises through the stack
 *                      and the shield on top brightens until all six are in.
 *   [data-converge] .. People, process, technology: the three circles drift
 *                      together until they overlap around the core.
 *
 * Every element ends exactly as authored (the complete stack, the circles
 * overlapping); nothing runs with reduced motion.
 */
import { gsap, ScrollTrigger } from './core';

type Cleanup = () => void;

function layerStory(section: HTMLElement, desktop: boolean): Cleanup {
  const list = section.querySelector<HTMLElement>('.cs-layer-steps');
  const steps = [...section.querySelectorAll<HTMLElement>('.cs-layer-steps > li')];
  const n = steps.length;
  if (!list || n === 0) return () => {};

  const q = <T extends Element>(sel: string) => [...section.querySelectorAll<T>(sel)];
  const slabs = q<SVGGElement>('.cs-slab');
  const edges = q<SVGPathElement>('.cs-slab-edge');
  const wires = q<SVGPathElement>('.cs-wire-line');
  const dots = q<SVGCircleElement>('.cs-wire circle');
  const tags = q<HTMLElement>('.cs-tag');
  const beam = section.querySelector<SVGGElement>('.cs-beam-l');
  const crown = section.querySelector<SVGGElement>('.cs-crown');
  const glow = section.querySelector<SVGPathElement>('.cs-crown-glow');
  const halo = section.querySelector<SVGEllipseElement>('.cs-halo');

  section.classList.add('is-scene');
  const lengths = wires.map((w) => w.getTotalLength());
  wires.forEach((w, i) => gsap.set(w, { strokeDasharray: lengths[i] }));

  let active = -1;
  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
  };

  // The layer whose note is passing the reading line is the one being built:
  // mid-screen on desktop, lower on phones (the stage holds the top half).
  const line = desktop ? '50%' : '70%';
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: list,
      start: `top ${line}`,
      end: `bottom ${line}`,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => setActive(Math.min(n - 1, Math.floor(self.progress * n))),
    },
  });

  slabs.forEach((slab, k) => {
    tl.fromTo(slab, { y: -90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out' }, k + 0.05);
    if (edges[k]) tl.fromTo(edges[k], { opacity: 0.15 }, { opacity: 1, duration: 0.3 }, k + 0.45);
    if (wires[k]) tl.fromTo(wires[k], { strokeDashoffset: lengths[k] }, { strokeDashoffset: 0, duration: 0.3 }, k + 0.5);
    if (dots[k]) tl.fromTo(dots[k], { opacity: 0 }, { opacity: 1, duration: 0.15 }, k + 0.5);
    if (tags[k]) tl.fromTo(tags[k], { opacity: 0.2 }, { opacity: 1, duration: 0.25 }, k + 0.65);
  });
  if (beam) tl.fromTo(beam, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: n }, 0);
  if (crown) tl.fromTo(crown, { opacity: 0.35 }, { opacity: 1, duration: n }, 0);
  if (glow) tl.fromTo(glow, { opacity: 0 }, { opacity: 0.6, duration: n }, 0);
  if (halo) tl.fromTo(halo, { opacity: 0, scale: 0.7, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }, n - 0.45);
  setActive(0);

  // Adding .is-scene made the notes tall: re-measure every trigger once.
  const frame = requestAnimationFrame(() => ScrollTrigger.refresh());

  return () => {
    cancelAnimationFrame(frame);
    tl.scrollTrigger?.kill();
    tl.kill();
    const touched = [...slabs, ...edges, ...dots, ...tags, beam, crown, glow, halo].filter(Boolean) as Element[];
    gsap.set(touched, { clearProps: 'opacity,transform' });
    gsap.set(wires, { clearProps: 'strokeDasharray,strokeDashoffset' });
    steps.forEach((s) => s.classList.remove('is-active'));
    section.classList.remove('is-scene');
  };
}

function converge(fig: HTMLElement): Cleanup {
  const circles = [...fig.querySelectorAll<SVGGElement>('.cs-circle')];
  const core = fig.querySelector<SVGGElement>('.cs-venn-core');
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: fig, start: 'top 88%', end: 'center 50%', scrub: 0.6 },
  });
  circles.forEach((c) => {
    const d = 48;
    tl.fromTo(c, { x: Number(c.dataset.dx) * d, y: Number(c.dataset.dy) * d }, { x: 0, y: 0, duration: 1 }, 0);
  });
  if (core) tl.fromTo(core, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.35 }, 0.65);
  return () => {
    tl.scrollTrigger?.kill();
    tl.kill();
    gsap.set([...circles, core].filter(Boolean) as Element[], { clearProps: 'opacity,transform' });
  };
}

export function initSecurityPage(on: { desktop: boolean }): Cleanup {
  const cleanups: Cleanup[] = [];
  const layers = document.querySelector<HTMLElement>('[data-layers]');
  if (layers) cleanups.push(layerStory(layers, on.desktop));
  for (const fig of document.querySelectorAll<HTMLElement>('[data-converge]')) cleanups.push(converge(fig));
  return () => cleanups.forEach((fn) => fn());
}
