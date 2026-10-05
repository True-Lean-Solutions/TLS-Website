/**
 * Tali's chat UI: opens and closes the panel, renders replies, handles the
 * composer and suggestions, the proactive prompts, and session memory.
 * It never decides what to say — that is engine.ts, loaded on first use so
 * pages that never open the chat pay nothing for it.
 *
 * Privacy: the conversation lives only in this tab (sessionStorage) so it
 * survives moving between pages; nothing is sent anywhere. "Close" clears it.
 * Hook for future measurement: a `tali:event` CustomEvent on window (open,
 * ask, answer with its intent); no listener ships.
 */
import type { Engine, Reply } from './engine';
import { PROMPT_TIMING as T, WELCOME_TITLE, SCROLL_TITLE, promptsFor } from './prompts';

type Msg = { role: 'user'; text: string } | { role: 'tali'; reply: Reply };

const KEY = { chat: 'tali:chat', reopen: 'tali:reopen' };
const store = {
  get(k: string) {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      sessionStorage.setItem(k, v);
    } catch {
      /* private mode: memory only */
    }
  },
  del(k: string) {
    try {
      sessionStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  },
};
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = () => window.matchMedia('(max-width: 560px)').matches;
const emit = (type: string, detail: Record<string, unknown> = {}) =>
  window.dispatchEvent(new CustomEvent('tali:event', { detail: { type, ...detail } }));

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

export function initTali() {
  const found = document.querySelector<HTMLElement>('[data-tali]');
  if (!found || found.dataset.ready) return;
  const root: HTMLElement = found;
  root.dataset.ready = '1';

  const $ = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const launcher = $<HTMLButtonElement>('[data-launcher]');
  const panel = $('[data-panel]');
  const log = $('[data-log]');
  const suggest = $('[data-suggest]');
  const form = $<HTMLFormElement>('[data-composer]');
  const input = $<HTMLTextAreaElement>('[data-input]');
  const send = $<HTMLButtonElement>('[data-send]');
  const nudge = $('[data-nudge]');

  const base = (root.dataset.base || '/').replace(/\/$/, '');
  const face = root.dataset.face || '';
  const path = (location.pathname.startsWith(base) ? location.pathname.slice(base.length) : location.pathname) || '/';
  const url = (href: string) => (/^https?:|^mailto:|^tel:/.test(href) ? href : `${base}${href}`);

  let history: Msg[] = [];
  let engine: Engine | null = null;
  let loading: Promise<Engine> | null = null;
  let mod: typeof import('./engine') | null = null;
  let busy = false;

  /* ------------------------------------------------------------ engine */
  const saved = (() => {
    try {
      return JSON.parse(store.get(KEY.chat) || 'null') as { history: Msg[]; state?: import('./engine').EngineState } | null;
    } catch {
      return null;
    }
  })();

  function load(): Promise<Engine> {
    loading ??= import('./engine').then((m) => {
      mod = m;
      // An optional general-AI endpoint (PUBLIC_TALI_AI_ENDPOINT); off unless configured.
      const provider = root.dataset.ai ? m.endpointProvider(root.dataset.ai) : undefined;
      engine = m.createEngine({ path, state: saved?.state, provider });
      fetch(url('/tali/insights.json'))
        .then((r) => (r.ok ? r.json() : []))
        .then((list) => engine?.setInsights(list))
        .catch(() => {});
      return engine;
    });
    return loading;
  }

  const save = () => store.set(KEY.chat, JSON.stringify({ history: history.slice(-40), state: engine?.state }));

  /* ------------------------------------------------------------ render */
  function scrollDown(smooth = true) {
    log.scrollTo({ top: log.scrollHeight, behavior: smooth && !reduced() ? 'smooth' : 'auto' });
  }

  function faceEl() {
    const f = el('span', 'tm-face');
    const img = el('img');
    img.src = face;
    img.alt = '';
    img.width = 28;
    img.height = 28;
    f.append(img);
    return f;
  }

  function link(l: { label: string; href: string; external?: boolean }, cls: string) {
    const a = el('a', cls, l.label);
    a.href = url(l.href);
    // The next step (Contact, booking) is the one filled button.
    if (cls === 'tm-link' && (l.href === '/contact/' || l.href.includes('calendar.app.google'))) a.classList.add('is-primary');
    if (l.external || /^https?:/.test(l.href)) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    } else {
      // Following an answer to another page keeps the conversation open there.
      a.addEventListener('click', () => store.set(KEY.reopen, '1'));
    }
    return a;
  }

  function renderUser(text: string, animate: boolean) {
    const m = el('div', `tm tm-user${animate ? ' is-new' : ''}`);
    m.append(el('div', 'tm-bubble', text));
    log.append(m);
  }

  function renderTali(r: Reply, animate: boolean, isError = false) {
    const m = el('div', `tm tm-tali${animate ? ' is-new' : ''}${isError ? ' tm-error' : ''}`);
    const body = el('div', 'tm-body');
    const bubble = el('div', 'tm-bubble');
    r.text.split('\n\n').forEach((p) => bubble.append(el('p', undefined, p)));
    if (r.points?.length) {
      const ul = el('ul');
      r.points.forEach((p) => ul.append(el('li', undefined, p)));
      bubble.append(ul);
    }
    if (r.note) bubble.append(el('p', 'tm-note', r.note));
    body.append(bubble);
    if (r.cards?.length) {
      const cards = el('div', 'tm-cards');
      r.cards.forEach((c) => {
        const a = link({ label: '', href: c.href }, 'tm-card');
        a.textContent = '';
        a.append(el('strong', undefined, c.title), el('span', undefined, c.text));
        cards.append(a);
      });
      body.append(cards);
    }
    if (r.links?.length) {
      const links = el('div', 'tm-links');
      r.links.forEach((l) => links.append(link(l, 'tm-link')));
      body.append(links);
    }
    if (r.chips?.length) {
      const chips = el('div', 'tm-chips');
      chips.setAttribute('role', 'group');
      chips.setAttribute('aria-label', 'Suggested replies');
      r.chips.forEach((c) => {
        const b = el('button', 'tm-chip', c);
        b.type = 'button';
        b.addEventListener('click', () => ask(c));
        chips.append(b);
      });
      body.append(chips);
    }
    m.append(faceEl(), body);
    log.append(m);
  }

  function retireChips() {
    log.querySelectorAll('.tm-chips').forEach((c) => c.setAttribute('aria-disabled', 'true'));
  }

  function renderAll() {
    log.querySelectorAll('.tm').forEach((n) => n.remove());
    history.forEach((m) => (m.role === 'user' ? renderUser(m.text, false) : renderTali(m.reply, false)));
    const last = log.querySelectorAll('.tm-chips');
    last.forEach((c, i) => i < last.length - 1 && c.setAttribute('aria-disabled', 'true'));
  }

  /* ------------------------------------------------------------ suggestions */
  function showSuggestions(list: string[], label = 'Suggested questions') {
    suggest.replaceChildren();
    suggest.setAttribute('aria-label', label);
    list.forEach((q) => {
      const b = el('button', undefined, q);
      b.type = 'button';
      b.addEventListener('click', () => ask(q));
      suggest.append(b);
    });
  }
  function starters() {
    if (history.length || input.value.trim()) return;
    load().then(() => mod && !history.length && !input.value.trim() && showSuggestions(mod.startersFor(path)));
  }
  let typeTimer = 0;
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
    window.clearTimeout(typeTimer);
    typeTimer = window.setTimeout(() => {
      const v = input.value.trim();
      if (!v) return history.length ? suggest.replaceChildren() : starters();
      if (mod) showSuggestions(mod.suggestFor(v), 'Suggestions as you type');
    }, 120);
  });

  /* ------------------------------------------------------------ conversation */
  async function ask(text: string) {
    const q = text.trim().slice(0, 500);
    if (!q || busy) return;
    busy = true;
    send.disabled = true;
    retireChips();
    suggest.replaceChildren();
    input.value = '';
    input.style.height = 'auto';
    history.push({ role: 'user', text: q });
    renderUser(q, true);
    emit('ask');

    const typing = el('div', 'tm tm-tali is-new');
    const dots = el('span', 'tm-typing');
    dots.setAttribute('aria-label', 'Tali is typing');
    dots.append(el('i'), el('i'), el('i'));
    typing.append(faceEl(), dots);
    log.append(typing);
    scrollDown();

    try {
      const e = await load();
      const r = await e.replyAsync(q);
      // A short, human pause: answers are instant, a beat reads better.
      await new Promise((ok) => setTimeout(ok, reduced() ? 120 : Math.min(900, 380 + q.length * 6)));
      typing.remove();
      if (r.intent === 'reset') return restart();
      history.push({ role: 'tali', reply: r });
      renderTali(r, true);
      emit('answer', { intent: r.intent });
      save();
    } catch {
      typing.remove();
      renderTali(
        {
          intent: 'error',
          text: "Sorry — I'm having trouble right now. You can still reach the team directly on the Contact page.",
          links: [{ label: 'Discuss Your Project', href: '/contact/' }],
        },
        true,
        true
      );
    } finally {
      busy = false;
      send.disabled = false;
      scrollDown();
      if (!phone()) input.focus();
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    ask(input.value);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      ask(input.value);
    }
  });

  /* ------------------------------------------------------------ open / close */
  let vvSync: (() => void) | null = null;
  function fitPhone(on: boolean) {
    const vv = window.visualViewport;
    if (!vv) return;
    if (on && !vvSync) {
      vvSync = () => {
        if (!phone()) return panel.style.removeProperty('top'), root.style.removeProperty('--tali-vh');
        root.style.setProperty('--tali-vh', `${vv.height}px`);
        panel.style.top = `${vv.offsetTop}px`;
        scrollDown(false);
      };
      vv.addEventListener('resize', vvSync);
      vv.addEventListener('scroll', vvSync);
      vvSync();
    } else if (!on && vvSync) {
      vv.removeEventListener('resize', vvSync);
      vv.removeEventListener('scroll', vvSync);
      vvSync = null;
      panel.style.removeProperty('top');
      root.style.removeProperty('--tali-vh');
    }
  }

  function open(focus = true) {
    engaged();
    panel.hidden = false;
    panel.classList.remove('is-in');
    void panel.offsetWidth;
    panel.classList.add('is-in');
    root.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    if (phone()) document.documentElement.style.overflow = 'hidden';
    fitPhone(true);
    load().catch(() => {});
    starters();
    scrollDown(false);
    if (focus) input.focus({ preventScroll: true });
    emit('open');
  }
  function hide() {
    if (panel.hidden) return;
    panel.hidden = true;
    root.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    document.documentElement.style.removeProperty('overflow');
    fitPhone(false);
    launcher.focus({ preventScroll: true });
  }
  function clear() {
    history = [];
    engine?.reset();
    store.del(KEY.chat);
    renderAll();
    input.value = '';
    suggest.replaceChildren();
  }
  function restart() {
    clear();
    starters();
    input.focus({ preventScroll: true });
  }

  launcher.addEventListener('click', () => open());
  $('[data-minimize]').addEventListener('click', hide);
  $('[data-close]').addEventListener('click', () => {
    clear();
    hide();
  });
  $('[data-restart]').addEventListener('click', restart);
  // Esc closes the chat when focus is in it, or nowhere in particular (the
  // chat reopened on a new page without taking focus).
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || panel.hidden) return;
    const a = document.activeElement;
    if (a && a !== document.body && !panel.contains(a)) return;
    e.stopPropagation();
    hide();
  });

  /* ------------------------------------------------------------ proactive prompts */
  /*
   * One bubble at a time: `welcome` on every page load, then a `scroll` prompt
   * once the visitor has explored the page. States: idle → welcome / scroll →
   * idle; chat-open ends both for this page load. Copy, suggestions and
   * timings: prompts.ts.
   */
  type Mode = 'idle' | 'welcome' | 'scroll' | 'chat-open';
  let mode: Mode = 'idle';
  const shownThisPage = { welcome: false, scroll: false };
  let scrollQueued = false;
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  };
  let hideTimer = 0;
  const page = promptsFor(path);
  const titleEl = $('[data-nudge-title]');
  const textEl = $('[data-nudge-text]');
  const chipsEl = $('[data-nudge-chips]');

  /** Something else has the visitor's attention: a field, or an open menu. */
  function occupied() {
    const a = document.activeElement as HTMLElement | null;
    if (a && !root.contains(a) && a.matches('input, textarea, select, [contenteditable="true"]')) return true;
    return !!document.querySelector('.site-header [aria-expanded="true"]');
  }

  function showPrompt(kind: 'welcome' | 'scroll', attempt = 0) {
    if (mode === 'chat-open' || shownThisPage[kind]) return;
    if (mode !== 'idle') {
      // The welcome is still up: the scroll prompt waits its turn.
      if (kind === 'scroll') scrollQueued = true;
      return;
    }
    if (occupied()) {
      if (attempt < T.maxRetries) later(() => showPrompt(kind, attempt + 1), T.retryEvery);
      return;
    }
    shownThisPage[kind] = true;
    mode = kind;
    titleEl.textContent = kind === 'welcome' ? WELCOME_TITLE : SCROLL_TITLE;
    textEl.textContent = kind === 'welcome' ? page.welcome : '';
    chipsEl.replaceChildren(
      ...(kind === 'welcome' ? page.welcomeChips : page.scrollChips).map((q) => {
        const b = el('button', undefined, q);
        b.type = 'button';
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          open(!phone());
          ask(q);
        });
        return b;
      })
    );
    nudge.classList.remove('is-out');
    nudge.hidden = false;
    nudge.classList.add('is-in');
    root.classList.add('is-greeting');
    window.setTimeout(() => root.classList.remove('is-greeting'), 3400);
    armHide(kind === 'welcome' ? T.welcomeDuration : T.scrollDuration);
    emit('prompt', { kind });
  }

  function armHide(ms: number) {
    window.clearTimeout(hideTimer);
    hideTimer = later(() => hidePrompt(), ms);
  }

  function hidePrompt(now = false) {
    if (mode !== 'welcome' && mode !== 'scroll') return;
    const was = mode;
    window.clearTimeout(hideTimer);
    mode = 'idle';
    root.classList.remove('is-greeting');
    const done = () => {
      nudge.hidden = true;
      nudge.classList.remove('is-in', 'is-out');
    };
    if (now || reduced()) done();
    else {
      nudge.classList.add('is-out');
      later(done, 220);
    }
    // The scroll prompt reached its moment while the welcome was up.
    if (was === 'welcome' && scrollQueued) {
      scrollQueued = false;
      later(() => showPrompt('scroll'), T.scrollDelay);
    }
  }

  /** The visitor opened the chat: no more proactive prompts on this page. */
  function engaged() {
    hidePrompt(true);
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    scrollQueued = false;
    shownThisPage.welcome = shownThisPage.scroll = true;
    window.removeEventListener('scroll', onScroll);
    mode = 'chat-open';
  }

  nudge.querySelector('[data-nudge-close]')!.addEventListener('click', (e) => {
    e.stopPropagation();
    hidePrompt();
  });
  // Pointing at the bubble restarts its countdown (a resting pointer can't
  // pin it open); keyboard focus holds it until focus moves on.
  nudge.addEventListener('pointermove', () => mode !== 'idle' && armHide(T.scrollDuration));
  nudge.addEventListener('focusin', () => window.clearTimeout(hideTimer));
  nudge.addEventListener('focusout', (e) => !nudge.contains(e.relatedTarget as Node) && mode !== 'idle' && armHide(4000));
  nudge.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      hidePrompt();
      launcher.focus({ preventScroll: true });
    }
  });

  // Scroll prompt: past the threshold, once scrolling has settled.
  let ticking = false;
  let settleTimer = 0;
  let reached = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (!reached && max > 0 && window.scrollY / max >= T.scrollThreshold) reached = true;
      if (!reached) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        window.removeEventListener('scroll', onScroll);
        later(() => showPrompt('scroll'), T.scrollDelay);
      }, T.settle);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Stay clear of the footer's back-to-top button. */
  const toTop = document.querySelector('.to-top');
  if (toTop && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => root.style.setProperty('--tali-lift', e.isIntersecting ? '64px' : '0px')).observe(toTop);
  }

  /* ------------------------------------------------------------ restore */
  if (saved?.history?.length) {
    history = saved.history;
    renderAll();
  }
  if (store.get(KEY.reopen)) {
    store.del(KEY.reopen);
    open(false);
  } else if (history.some((m) => m.role === 'user')) {
    // A conversation is under way in this tab: Tali waits to be reopened
    // rather than interrupting it with a fresh welcome.
    engaged();
  } else {
    later(() => showPrompt('welcome'), T.welcomeDelay);
  }
}
