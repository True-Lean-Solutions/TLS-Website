/**
 * Timed sequences (Technology Strategy, 2026-10-28): a short motion graphic
 * that plays at its own pace once its element is fully on screen, so a
 * change too small to read in a scroll window (five years folding into two)
 * gets the time to be seen.
 *
 *   [data-sequence="0,400,1500"] ... the time (ms) each stage starts. The
 *                                    element's data-stage steps 0, 1, 2… and
 *                                    CSS draws each stage.
 *
 *   [data-sequence-loop="4500"] ... loops instead (Cyber Security hero,
 *                                    2026-11-02): while the element is on
 *                                    screen it plays, holds the last stage
 *                                    this long (ms), clears and plays again.
 *
 * The element carries .is-seq while the hook runs; without it (reduced
 * motion, no JS) CSS shows the finished picture. Scrolling back above the
 * element resets it, so it plays again on the way down.
 */
import { ScrollTrigger } from './core';

type Cleanup = () => void;

function sequence(el: HTMLElement): Cleanup {
  const times = (el.dataset.sequence ?? '').split(',').map(Number).filter((n) => !Number.isNaN(n));
  const last = String(times.length - 1);
  let timers: number[] = [];
  let played = false;

  const stage = (s: string) => (el.dataset.stage = s);
  const play = () => {
    if (played) return;
    played = true;
    timers = times.map((t, i) => window.setTimeout(() => stage(String(i)), t));
  };
  const reset = () => {
    timers.forEach(clearTimeout);
    timers = [];
    played = false;
    stage('0');
  };

  el.classList.add('is-seq');
  stage('0');

  if (el.dataset.sequenceLoop !== undefined) {
    const hold = Number(el.dataset.sequenceLoop) || 3000;
    const CLEAR = 800; // stage 0 fades everything out before the next run
    let running = false;
    const cycle = () => {
      stage('0');
      timers = times.map((t, i) => window.setTimeout(() => stage(String(i)), CLEAR + t));
      timers.push(window.setTimeout(cycle, CLEAR + times[times.length - 1] + hold));
    };
    const start = () => {
      if (running) return;
      running = true;
      cycle();
    };
    const stop = () => {
      running = false;
      timers.forEach(clearTimeout);
      timers = [];
    };
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top', // on screen at all
      onToggle: (self) => (self.isActive ? start() : stop()),
      onRefresh: (self) => self.isActive && start(),
    });
    return () => {
      st.kill();
      stop();
      el.classList.remove('is-seq');
      delete el.dataset.stage;
    };
  }

  const st = ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom 88%', // the whole element on screen
    onLeave: play,
    onLeaveBack: reset,
    onRefresh: (self) => {
      // Already past it (a reload mid-page): the finished picture.
      if (self.progress === 1 && !played) {
        played = true;
        stage(last);
      }
    },
  });

  return () => {
    st.kill();
    timers.forEach(clearTimeout);
    el.classList.remove('is-seq');
    delete el.dataset.stage;
  };
}

export function initSequences(): Cleanup {
  const cleanups = [...document.querySelectorAll<HTMLElement>('[data-sequence]')].map(sequence);
  return () => cleanups.forEach((fn) => fn());
}
