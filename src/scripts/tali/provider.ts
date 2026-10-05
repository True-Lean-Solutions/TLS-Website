/**
 * Optional general-AI provider: the seam where a language model can answer
 * what Tali's local layers can't place (a general question outside the
 * glossary, or a message it couldn't follow). Off by default — the site is
 * static and holds no API key — so nothing leaves the browser unless
 * `PUBLIC_TALI_AI_ENDPOINT` is set at build time (see docs/tali.md).
 *
 * The provider is never asked about TLS facts: pricing, services, claims and
 * contact details always come from knowledge.ts. Any failure (network, HTTP
 * error, timeout, empty or malformed answer) returns null, and Tali keeps its
 * local reply.
 */

export interface ProviderContext {
  message: string;
  /** The visitor's last few messages, oldest first (bounded). */
  recent: string[];
  page: string;
  topic?: string;
}

/** Returns an answer, or null to keep Tali's local reply. */
export type GeneralAI = (ctx: ProviderContext, signal: AbortSignal) => Promise<string | null>;

/** A provider behind a proxy endpoint: POST JSON `ProviderContext` → `{ "text": "…" }`. */
export function endpointProvider(url: string): GeneralAI {
  return async (ctx, signal) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(ctx),
      signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { text?: unknown };
    return typeof data.text === 'string' ? data.text : null;
  };
}

/** Ask the provider with a time limit; null on any failure. */
export async function askProvider(provider: GeneralAI, ctx: ProviderContext, timeoutMs = 8000): Promise<string | null> {
  const ctrl = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  // The race holds the limit even if a provider ignores the abort signal.
  const timeout = new Promise<null>((done) => {
    timer = setTimeout(() => {
      ctrl.abort();
      done(null);
    }, timeoutMs);
  });
  try {
    const answer = await Promise.race([provider(ctx, ctrl.signal), timeout]);
    const text = typeof answer === 'string' ? answer.trim() : '';
    return text ? text.slice(0, 1200) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
