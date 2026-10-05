/**
 * Images and heroes: depth, not decoration. Every effect moves an existing
 * image; none changes its source, crop at rest, or content.
 *  - Heroes: the image drifts slower than the page and eases in scale while
 *    the copy lifts away, so the hero hands over to the next section as one
 *    continuous scene.
 *  - Large images: a clip/scale reveal as they arrive, then light parallax.
 *  - Solutions hero: a faint spotlight that follows the cursor.
 *  - Client logos (fewer than a marquee needs): a slow scroll-linked drift.
 */
import { gsap, ScrollTrigger, EASE, T } from './core';
import { claim, unclaim } from './text';

type Cleanup = () => void;

/** A scrubbed tween across `trigger`'s trip through the viewport. */
function scrub(target: gsap.TweenTarget, from: gsap.TweenVars, to: gsap.TweenVars, st: ScrollTrigger.Vars) {
  return gsap.fromTo(target, from, { ...to, ease: 'none', scrollTrigger: { scrub: true, ...st } });
}

/**
 * Hero exits, where the layout allows: the Home photo only while it sits
 * beside the copy (≥901px), solution heroes above phone width (phones show
 * the photo as its own band), text heroes from tablet up.
 */
export function initHeroes(on: { home: boolean; solution: boolean; pageHero: boolean }): Cleanup {
  // Home: photo drifts down and eases in; copy lifts and softens.
  const home = document.querySelector<HTMLElement>('.hero');
  if (home && on.home) {
    const photo = home.querySelector('.hero-photo');
    const copy = home.querySelector('.hero-copy');
    const st = { trigger: home, start: 'top top', end: 'bottom top' };
    if (photo) scrub(photo, { yPercent: 0, scale: 1 }, { yPercent: 9, scale: 1.06 }, st);
    if (copy) scrub(copy, { y: 0, opacity: 1 }, { y: -70, opacity: 0.25 }, st);
  }

  // Solution heroes: the photo scales ≥ 2× its drift, so no edge ever shows.
  for (const hero of document.querySelectorAll<HTMLElement>('.sh')) {
    if (!on.solution) break;
    const st = { trigger: hero, start: 'top top', end: 'bottom top' };
    const bg = hero.querySelector('.sh-bg');
    const copy = hero.querySelector('.sh-copy');
    if (bg) scrub(bg, { yPercent: 0, scale: 1 }, { yPercent: 6, scale: 1.14 }, st);
    if (copy) scrub(copy, { y: 0, opacity: 1 }, { y: -60, opacity: 0.3 }, st);
  }

  // Text-only page heroes: a gentle lift, so the page opens with depth.
  for (const wrap of document.querySelectorAll<HTMLElement>('.page-hero > .wrap')) {
    if (!on.pageHero) break;
    scrub(wrap, { y: 0, opacity: 1 }, { y: -36, opacity: 0.55 }, {
      trigger: wrap.parentElement!,
      start: 'top top',
      end: 'bottom top',
    });
  }

  // Article cover: settles back slightly as the reader moves into the text.
  for (const cover of document.querySelectorAll<HTMLElement>('.article img.cover')) {
    if (!on.pageHero) break;
    scrub(cover, { y: 0, scale: 1 }, { y: 48, scale: 0.965 }, { trigger: cover, start: 'top 30%', end: 'bottom top' });
  }
  return () => {};
}

/**
 * Large images that sit inside the page: reveal (clip or scale) once, then a
 * little parallax while on screen (desktop). `data-reveal` blocks that are
 * media are claimed from the CSS fade-up.
 */
export function initMediaReveals(parallax: boolean): Cleanup {
  const cleanups: Cleanup[] = [];

  // Isometric art (Home › Our Approach, CTA band): settles from a hair smaller.
  for (const art of document.querySelectorAll<HTMLElement>('.split-art[data-reveal=""], .cta-art')) {
    const claimed = art.matches('[data-reveal]');
    if (claimed) claim(art, 'media');
    gsap.set(art, { opacity: 0, scale: 0.92, y: 30 });
    const st = ScrollTrigger.create({
      trigger: art,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(art, { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: EASE }),
    });
    const drift = parallax
      ? scrub(art.firstElementChild ?? art, { y: 36 }, { y: -36 }, { trigger: art, start: 'top bottom', end: 'bottom top' })
      : null;
    cleanups.push(() => {
      st.kill();
      drift?.scrollTrigger?.kill();
      if (claimed) unclaim(art);
    });
  }

  // About › Global Delivery map: unveiled bottom-up through a clip, the
  // image easing out of a slight zoom; pins ride along inside the clip.
  for (const map of document.querySelectorAll<HTMLElement>('.map[data-reveal=""]')) {
    claim(map, 'media');
    const img = map.querySelector('img');
    gsap.set(map, { clipPath: 'inset(18% 6% 18% 6% round 24px)', opacity: 0 });
    if (img) gsap.set(img, { scale: 1.12 });
    const st = ScrollTrigger.create({
      trigger: map,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        map.classList.add('is-in'); // starts the pins' pulse (GlobalDelivery.astro)
        gsap.to(map, {
          clipPath: 'inset(0% 0% 0% 0% round 0px)',
          opacity: 1,
          duration: 1.3,
          ease: 'power3.inOut',
          clearProps: 'clipPath',
        });
        if (img) gsap.to(img, { scale: 1, duration: 1.6, ease: EASE });
      },
    });
    const drift = parallax ? scrub(map, { y: 30 }, { y: -30 }, { trigger: map, start: 'top bottom', end: 'bottom top' }) : null;
    cleanups.push(() => {
      st.kill();
      drift?.scrollTrigger?.kill();
      unclaim(map);
    });
  }

  // Article images: unveiled top-down through a clip.
  for (const fig of document.querySelectorAll<HTMLElement>('.img-block')) {
    const img = fig.querySelector('img');
    gsap.set(fig, { clipPath: 'inset(0% 0% 100% 0%)' });
    if (img) gsap.set(img, { scale: 1.08 });
    const st = ScrollTrigger.create({
      trigger: fig,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(fig, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.inOut', clearProps: 'clipPath' });
        if (img) gsap.to(img, { scale: 1, duration: 1.4, ease: EASE });
      },
    });
    cleanups.push(() => st.kill());
  }

  // Featured AI product illustrations: restrained depth across the section.
  if (parallax) {
    for (const visual of document.querySelectorAll<HTMLElement>('[data-feature-parallax]')) {
      const layers = [...visual.querySelectorAll<HTMLElement>('[data-parallax]')];
      const drifts = layers.map((layer) => {
        const speed = layer.dataset.parallax;
        const range = speed === 'fast' ? 18 : speed === 'slow' ? 10 : 5;
        return scrub(layer, { y: range }, { y: -range }, {
          trigger: visual,
          start: 'top bottom',
          end: 'bottom top',
        });
      });
      cleanups.push(() => {
        drifts.forEach((drift) => {
          drift.scrollTrigger?.kill();
          drift.kill();
        });
        gsap.set(layers, { y: 0 });
      });
    }
  }

  return () => cleanups.forEach((c) => c());
}

/** Solutions hero: a soft light that follows the cursor (fine pointers). */
export function initSpotlights(): Cleanup {
  const offs: Cleanup[] = [];
  for (const hero of document.querySelectorAll<HTMLElement>('.sh')) {
    const spot = hero.querySelector<HTMLElement>('.sh-spot');
    if (!spot) continue;
    const toX = gsap.quickTo(spot, 'x', { duration: 0.9, ease: 'power3' });
    const toY = gsap.quickTo(spot, 'y', { duration: 0.9, ease: 'power3' });
    const move = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      toX(e.clientX - r.left);
      toY(e.clientY - r.top);
    };
    const enter = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      gsap.set(spot, { x: e.clientX - r.left, y: e.clientY - r.top });
      gsap.to(spot, { autoAlpha: 1, duration: 0.6, ease: EASE });
    };
    const leave = () => gsap.to(spot, { autoAlpha: 0, duration: 0.6, ease: EASE });
    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerenter', enter);
    hero.addEventListener('pointerleave', leave);
    offs.push(() => {
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerenter', enter);
      hero.removeEventListener('pointerleave', leave);
      gsap.set(spot, { clearProps: 'all' });
    });
  }
  return () => offs.forEach((o) => o());
}

/**
 * Client logos. With too few logos for a marquee (it would repeat the same
 * two across the screen), the row drifts slowly sideways with scroll instead.
 * A real marquee (6+ logos) keeps its CSS loop.
 */
export function initLogoDrift(): Cleanup {
  for (const row of document.querySelectorAll<HTMLElement>('.logos--static .logos-row')) {
    scrub(row, { x: 48 }, { x: -48 }, { trigger: row, start: 'top bottom', end: 'bottom top' });
  }
  return () => {};
}

export { T };
