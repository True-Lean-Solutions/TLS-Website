/**
 * Product pages (Meeting Intelligence and AI Visibility Growth Team,
 * 2026-10-02): the motion that tells each page's story, on top of the
 * site-wide reveals (headings, cards, steps and illustrations already move
 * through text.ts, cards.ts, steps.ts and media.ts). Hooks, not page classes:
 *
 *   a.glide ............ in-page links glide to their target
 *   [data-hero-photo] .. the hero photo drifts down and in as the page scrolls
 *   [data-float] ....... a layer drifts against the scroll (speed: 1–3)
 *   [data-progress] .... a process line fills as the visitor scrolls through
 *                        it; each [data-step] lights as the line reaches it
 *   .mi-network ........ the knowledge network gathers around its core
 *   [data-chain] ....... stages arrive one after another, arrows first
 *   [data-cont] ........ the scattered handover lands, then the answer
 *   [data-search] ...... results fill in row by row
 *
 * Every element ends exactly as authored; nothing runs with reduced motion.
 */
import { gsap, ScrollTrigger, EASE, glideTo } from './core';

type Cleanup = () => void;

const scrub = (target: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars, st: ScrollTrigger.Vars) =>
  gsap.fromTo(target, from, { ...to, ease: 'none', scrollTrigger: { scrub: true, ...st } });

/** Play a paused timeline once its trigger comes into view. */
function onEnter(trigger: Element, tl: gsap.core.Timeline, start = 'top 85%') {
  return ScrollTrigger.create({ trigger, start, once: true, onEnter: () => tl.play() });
}

export function initProductPage(on: { desktop: boolean }): Cleanup {
  const cleanups: Cleanup[] = [];
  const touched: Element[] = [];
  const track = (els: Element[]) => (touched.push(...els), els);

  // In-page jumps ("Explore Meeting Intelligence") glide rather than cut.
  const jump = (e: Event) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a.glide[href^="#"]');
    const target = a && document.querySelector<HTMLElement>(a.hash);
    if (!target) return;
    e.preventDefault();
    glideTo(target);
    history.pushState(null, '', a.hash);
  };
  document.addEventListener('click', jump);
  cleanups.push(() => document.removeEventListener('click', jump));

  // Hero photo (desktop): eases down and in as the visitor scrolls away.
  for (const photo of document.querySelectorAll<HTMLElement>('[data-hero-photo]')) {
    const hero = photo.closest('section');
    if (!hero || !on.desktop) break;
    track([photo]);
    scrub(photo, { y: 0, scale: 1 }, { y: 80, scale: 1.06 }, { trigger: hero, start: 'top top', end: 'bottom top' });
  }

  // Depth layers (desktop): drift against the scroll while on screen.
  for (const layer of document.querySelectorAll<HTMLElement>('[data-float]')) {
    if (!on.desktop) break;
    const d = 14 * Number(layer.dataset.float || 1);
    track([layer]);
    scrub(layer, { y: d }, { y: -d }, { trigger: layer, start: 'top bottom', end: 'bottom top' });
  }

  // Process lines: fill with the scroll; each step lights as the line reaches it.
  for (const line of document.querySelectorAll<HTMLElement>('[data-progress]')) {
    const steps = [...line.querySelectorAll<HTMLElement>('[data-step]')];
    const state = { p: 0 };
    const paint = () => {
      line.style.setProperty('--p', state.p.toFixed(3));
      steps.forEach((s, i) => s.classList.toggle('is-on', state.p >= (steps.length > 1 ? i / (steps.length - 1) : 0) - 0.02));
    };
    paint();
    const tw = gsap.to(state, {
      p: 1,
      ease: 'none',
      onUpdate: paint,
      scrollTrigger: { trigger: line, start: 'top 78%', end: 'bottom 52%', scrub: 0.6 },
    });
    cleanups.push(() => {
      tw.scrollTrigger?.kill();
      tw.kill();
      line.style.removeProperty('--p');
      steps.forEach((s) => s.classList.remove('is-on'));
    });
  }

  // Memory: satellites gather around the core, the links light up; then the
  // whole network drifts gently against the scroll.
  const memory = document.querySelector<HTMLElement>('.mi-memory');
  const network = memory?.querySelector<HTMLElement>('.mi-network');
  if (memory && network) {
    const core = network.querySelector('.mi-core');
    const nodes = track([...network.querySelectorAll('.mi-node')]);
    const links = track([...network.querySelectorAll('.mi-links')]);
    track(core ? [core] : []);
    gsap.set(nodes, { opacity: 0, scale: 0.6 });
    gsap.set(links, { opacity: 0 });
    if (core) gsap.set(core, { opacity: 0, scale: 0.8 });
    const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } });
    if (core) tl.to(core, { opacity: 1, scale: 1, duration: 0.9 }, 0);
    tl.to(nodes, { opacity: 1, scale: 1, duration: 0.7, stagger: { each: 0.09, from: 'random' } }, 0.25);
    tl.to(links, { opacity: 1, duration: 1.1 }, 0.55);
    const st = onEnter(network, tl, 'top 80%');
    cleanups.push(() => (st.kill(), tl.kill()));
    if (on.desktop) {
      track([network]);
      scrub(network, { y: 40 }, { y: -40 }, { trigger: memory, start: 'top bottom', end: 'bottom top' });
      const bg = memory.querySelector('.mi-memory-bg');
      if (bg) track([bg]), scrub(bg, { yPercent: -6 }, { yPercent: 6 }, { trigger: memory, start: 'top bottom', end: 'bottom top' });
    }
  }

  // Chains: each stage arrives in turn, its arrow drawing toward it first.
  for (const chain of document.querySelectorAll<HTMLElement>('[data-chain]')) {
    const items = track([...chain.querySelectorAll<HTMLElement>(':scope > .chain-item')]);
    const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } });
    items.forEach((item, i) => {
      const arrow = item.querySelector(':scope > .chain-arrow');
      const rest = [...item.children].filter((c) => c !== arrow);
      gsap.set(rest, { opacity: 0, y: 12 });
      if (arrow) gsap.set(arrow, { opacity: 0, x: -10 });
      track([...rest, ...(arrow ? [arrow] : [])]);
      const at = i * 0.2;
      if (arrow) tl.to(arrow, { opacity: 1, x: 0, duration: 0.4 }, at);
      tl.to(rest, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05 }, at + 0.12);
    });
    const st = onEnter(chain, tl);
    cleanups.push(() => (st.kill(), tl.kill()));
  }

  // Continuity: the handover lands scattered and settles; then the answer.
  const cont = document.querySelector<HTMLElement>('[data-cont]');
  if (cont) {
    const frag = track([...cont.querySelectorAll('.mi-frag li')]);
    const gaps = track([...cont.querySelectorAll('.mi-gaps li')]);
    const arrow = track([...cont.querySelectorAll('.mi-cont-arrow')]);
    const after = track([...cont.querySelectorAll('.mi-after')]);
    gsap.set(frag, { opacity: 0, y: (i) => (i % 2 ? -14 : 14), rotate: (i) => (i % 2 ? 6 : -6) });
    gsap.set(gaps, { opacity: 0 });
    gsap.set(arrow, { opacity: 0, scale: 0.6 });
    gsap.set(after, { opacity: 0, x: on.desktop ? 40 : 0, y: on.desktop ? 0 : 24 });
    const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } });
    tl.to(frag, { opacity: 1, y: 0, rotate: 0, duration: 0.8, stagger: 0.1 }, 0)
      .to(gaps, { opacity: 1, duration: 0.5, stagger: 0.1 }, 0.55)
      .to(arrow, { opacity: 1, scale: 1, duration: 0.5 }, 0.8)
      .to(after, { opacity: 1, x: 0, y: 0, duration: 0.9 }, 0.95);
    const st = onEnter(cont, tl, 'top 78%');
    cleanups.push(() => (st.kill(), tl.kill()));
  }

  // Search: the answer fills in, one result row at a time.
  for (const box of document.querySelectorAll<HTMLElement>('[data-search]')) {
    const rows = track([...box.querySelectorAll('li')]);
    const bars = track([...box.querySelectorAll('.mi-r-bars i')]);
    gsap.set(rows, { opacity: 0, x: -12 });
    gsap.set(bars, { scaleX: 0 });
    const tl = gsap.timeline({ paused: true, defaults: { ease: EASE } });
    tl.to(rows, { opacity: 1, x: 0, duration: 0.55, stagger: 0.12 }, 0.2)
      .to(bars, { scaleX: 1, duration: 0.7, stagger: 0.06 }, 0.35);
    const st = onEnter(box, tl, 'top 80%');
    cleanups.push(() => (st.kill(), tl.kill()));
  }

  return () => {
    cleanups.forEach((fn) => fn());
    gsap.killTweensOf(touched);
    gsap.set(touched, { clearProps: 'opacity,transform' });
  };
}
