/**
 * Shared by the field-guide form and the floating card: what the visitor has
 * already done, kept in localStorage. Storage can be blocked (private modes,
 * strict settings), so every read and write is guarded; without it the card
 * simply behaves as if this were a first visit.
 */
export const GUIDE_DONE_KEY = 'tls:guide:done';
export const GUIDE_DISMISSED_KEY = 'tls:guide:dismissed';
export const GUIDE_SHOWN_KEY = 'tls:guide:shown';

export const guideStore = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* storage unavailable: nothing to remember */
    }
  },
};
