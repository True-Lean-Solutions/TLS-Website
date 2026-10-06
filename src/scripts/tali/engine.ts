/**
 * Tali's conversation manager: decides how to answer each message, keeps the
 * conversation's context, and composes the reply. No DOM; no network unless
 * an optional general-AI provider is configured (provider.ts).
 *
 *   understand.ts ... what the visitor meant (social, TLS, general, action,
 *                     problem, injection; topic switches, "that"/"it")
 *   route (here) .... the response strategy, in this order:
 *                     memory      — answers to Tali's own question
 *                     social      — greetings, thanks, bye, Tali itself  (smalltalk.ts)
 *                     guards      — instructions, guarantees, unconfirmed facts
 *                     actions     — a person, contact, demo, getting started
 *                     general     — definitions, comparisons             (general.ts)
 *                     discovery   — a described business problem          (discovery.ts)
 *                     TLS         — solutions, facets, company, pricing   (knowledge.ts)
 *                     fallback    — honest "I don't know", or the provider
 *   memory .......... topic, last concept, discovery state, visitor goal,
 *                     recent messages (bounded, this tab only)
 *
 * TLS facts only ever come from knowledge.ts; general explanations never
 * claim anything about TLS beyond pointing to the matching solution.
 */
import { CONTACT, COMPANY, ENTITIES, NEEDS, byId, type Entity, type Link } from './knowledge';
import { RX, facetOf, understand, type Facet, type Understanding } from './understand';
import { conceptById, type Concept } from './general';
import { problemById, problemOf, type Problem, type ProblemId } from './discovery';
import { socialReply, variant } from './smalltalk';
import { askProvider, type GeneralAI } from './provider';
export { endpointProvider } from './provider';
import { STOP, clean, correct, has, norm, protect, words } from './language';

export interface Insight {
  title: string;
  excerpt: string;
  category: string;
  topics: string[];
  href: string;
}

export interface Card {
  title: string;
  text: string;
  href: string;
}

export interface Reply {
  text: string;
  points?: string[];
  /** A closing line, shown after the points. */
  note?: string;
  cards?: Card[];
  links?: Link[];
  /** Follow-up questions offered as chips. */
  chips?: string[];
  /** Tali's expression for this reply. */
  mood?: 'idle' | 'solution' | 'success';
  /** Which branch answered (for tests and quality review). */
  intent: string;
}

/** What the visitor seems to be trying to do. */
export type Goal = 'learn' | 'explore' | 'solve' | 'evaluate' | 'contact';

export interface EngineState {
  turns: number;
  /** The TLS solution being discussed (knowledge.ts id). */
  topic?: string;
  /** The general concept just explained, for "does TLS do that?". */
  concept?: string;
  /** Tali asked something and is waiting for the answer. */
  awaiting?: 'need' | 'problem' | 'pricing';
  /** The business problem being discussed. */
  problem?: ProblemId;
  /** Solutions recommended for that problem. */
  recommended?: string[];
  /** The answer chips Tali just offered (any of them counts as an answer). */
  offered?: string[];
  goal?: Goal;
  lastIntent?: string;
  /** The visitor's last few messages (for the optional provider). */
  recent: string[];
}

/* ------------------------------------------------------------- page context */

/** The page's own topic, so questions asked on a product page answer about it. */
export function topicForPath(path: string): string | undefined {
  const p = path.replace(/^\/[^/]*TLS-Website/i, '');
  return ENTITIES.find((e) => p.startsWith(e.url))?.id;
}

const STARTERS: [string, string[]][] = [
  ['/services/meeting-intelligence/', ['How does Meeting Intelligence work?', 'How is meeting knowledge preserved?', 'How is enterprise data controlled?', 'Can I request a demo?']],
  ['/services/ai-visibility-growth-team/', ['What is AI search visibility?', 'How does AI visibility optimization work?', 'What does the service include?', 'How can I get an initial assessment?']],
  ['/services/enterprise-ai/', ['What is Enterprise AI?', 'Tell me about Meeting Intelligence', 'How is my data kept private?', 'Can I book a demo?']],
  ['/services/workflow-automation/', ['What processes can be automated?', 'Can automation work with my existing tools?', 'How do I get started?']],
  ['/services/software/', ['What kind of software do you build?', 'How does a software project run?', 'I want to discuss a project']],
  ['/services/integrations/', ['Can you connect my existing tools?', 'How does an integration project run?', 'I want to discuss a project']],
  ['/services/technical-talent/', ['What roles do you place?', 'How does the hiring process work?', 'Do you offer contract-to-hire?']],
  ['/services/technology-strategy/', ['What does technology strategy include?', 'How does TLS approach technology strategy?', 'Can you help me assess my current technology?', 'What happens after the roadmap?']],
  ['/services/data-analytics/', ['What is Data & Analytics?', 'Which solution fits my business?', 'I want to discuss a project']],
  ['/services/cyber-security/', ['Explore TLS solutions', 'I want to discuss a project']],
  ['/services/', ['Explore TLS solutions', 'Which solution fits my business?', 'Tell me about Meeting Intelligence', 'I want to discuss a project']],
  ['/contact/', ['I want to discuss a new project', 'I need help choosing a service', 'How do I contact the TLS team?']],
  ['/about-us/', ['How did True Lean Solutions start?', 'Who is on the team?', 'How do you work?']],
  ['/insights/', ['Show me recent insights', 'Do you have case studies?', 'Which solution fits my business?']],
  ['/', ['What does True Lean Solutions do?', 'Which solution fits my business?', 'How can TLS help automate my work?', 'I want to discuss a project']],
];
const DEFAULT_STARTERS = ['Explore TLS solutions', 'Automate a business process', 'I need a custom AI or software solution', 'Tell me about Meeting Intelligence', 'I want to discuss a project'];

export function startersFor(path: string): string[] {
  const p = path.replace(/^\/[^/]*TLS-Website/i, '') || '/';
  if (p === '/' || p === '') return STARTERS.find(([k]) => k === '/')![1];
  return STARTERS.find(([k]) => k !== '/' && p.startsWith(k))?.[1] ?? DEFAULT_STARTERS;
}

/** Everything Tali can answer well, for as-you-type suggestions. */
const SUGGESTIONS = [
  ...new Set([
    ...STARTERS.flatMap(([, s]) => s),
    ...DEFAULT_STARTERS,
    ...ENTITIES.flatMap((e) => [`Tell me about ${e.name}`, ...(e.follow ?? [])]),
    ...ENTITIES.filter((e) => e.pricing).map((e) => `How much does ${e.name} cost?`),
    ...ENTITIES.filter((e) => e.process).map((e) => `How does ${e.name} work?`),
    'What are your prices?',
    'Who are your clients?',
    'Show me recent insights',
    'Talk to a person',
    'I need to hire technical talent',
    'Do you have case studies?',
    'Who is on the team?',
    'What is workflow automation?',
    'What is an API?',
    'What is AI visibility?',
    "What's the difference between custom software and system integration?",
    "Our systems don't talk to each other",
    'We need to automate approvals',
  ]),
].map((q) => ({ q, words: norm(q).split(' ').filter((w) => !STOP.has(w)) }));

export function suggestFor(partial: string, limit = 3): string[] {
  const t = norm(partial);
  if (t.length < 2) return [];
  const ws = t.split(' ');
  const last = ws.pop()!;
  const full = ws.map(correct).filter((w) => !STOP.has(w));
  const scored = SUGGESTIONS.map((s) => {
    let score = 0;
    for (const w of full) if (s.words.some((sw) => sw === w || (w.length > 3 && sw.startsWith(w.slice(0, -1))))) score += 2;
    const fixed = correct(last);
    if (last.length >= 2 && s.words.some((sw) => sw.startsWith(last) || (fixed !== last && sw.startsWith(fixed)))) score += STOP.has(last) ? 0.5 : 1.5;
    return { q: s.q, score };
  }).filter((s) => s.score >= 1.5 && norm(s.q) !== t);
  return scored.sort((a, b) => b.score - a.score || a.q.length - b.q.length).slice(0, limit).map((s) => s.q);
}

/* ------------------------------------------------------------- TLS answers */

/** Tools a visitor may name that the site never mentions: never confirmed. */
// Product names only, never everyday words ("sage" would swallow "safe" as a typo).
const UNCONFIRMED_TOOLS = 'hubspot sap netsuite oracle shopify jira servicenow workday xero asana airtable pipedrive zoho stripe woocommerce mailchimp freshdesk zendesk sharepoint trello odoo procore'.split(' ');
protect(UNCONFIRMED_TOOLS.join(' '));
const TOOL_NAMES: Record<string, string> = { hubspot: 'HubSpot', sap: 'SAP', netsuite: 'NetSuite', servicenow: 'ServiceNow', woocommerce: 'WooCommerce', sharepoint: 'SharePoint', zendesk: 'Zendesk' };

/** The core team (COMPANY.team), findable by first or last name. */
const TEAM = COMPANY.team.map((line) => {
  const [name, role] = line.split(' — ');
  const keys = norm(name).split(' ').filter((w) => w.length >= 4);
  protect(keys.join(' '));
  return { name, role, keys };
});

const contactLinks = (cta?: Link): Link[] => [cta ?? CONTACT.page, CONTACT.booking];
/** "the AI Visibility Growth Team", but plain "Workflow Automation". */
const the = (e: Entity) => (/ team$/i.test(e.name) ? `the ${e.name}` : e.name);
const pageLink = (e: Entity): Link => ({ label: `Read more about ${e.name}`, href: e.url });
const card = (e: Entity): Card => ({ title: e.name, text: firstSentence(e.overview), href: e.url });
function firstSentence(s: string) {
  const m = s.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : s).trim();
}
/** Follow-ups for an entity, minus what was just asked or just answered. */
const followFor = (e: Entity, asked?: string, answered?: Facet | null) =>
  (e.follow ?? []).filter((q) => norm(q) !== asked && !(answered && facetOf(clean(q)) === answered)).slice(0, 3);

function entityReply(e: Entity, facet: Facet | null, asked: string): Reply {
  const chips = followFor(e, asked, facet);
  // Help first: the solution's page, not a sales button. Contact comes with
  // pricing, or when the visitor asks for it.
  const base = { links: [pageLink(e)], chips, mood: 'solution' as const };
  switch (facet) {
    case 'pricing':
      return e.pricing
        ? { ...base, intent: 'entity.pricing', text: `${e.pricing} For anything specific to your situation, the team can walk you through it.`, links: [e.cta ?? CONTACT.page, pageLink(e)] }
        : { ...base, intent: 'entity.pricing.none', text: `${e.name} is scoped to the work, so there's no published price — everything we do is scoped and priced for the constraints you work under. The quickest way to an estimate is a short call with the team.`, links: contactLinks(e.cta) };
    case 'control':
      if (e.control) return { ...base, intent: 'entity.control', text: e.control };
      break;
    case 'audience':
      if (e.audience) return { ...base, intent: 'entity.audience', text: e.audience.lead ?? `${e.name} fits when:`, points: e.audience.points };
      break;
    case 'details':
      if (e.details) return { ...base, intent: 'entity.details', text: e.details.lead ?? `${e.name} includes:`, points: e.details.points };
      break;
    case 'process':
      if (e.process) return { ...base, intent: 'entity.process', text: e.process.lead ?? `How ${e.name} works:`, points: e.process.points.length ? e.process.points : undefined };
      break;
  }
  // Overview (or a facet this entity has no approved copy for).
  const extra = !facet && !e.details && e.process?.points.length ? { points: e.process.points } : {};
  const note = facet ? "I don't have more detail on that here, but this is the overview:\n\n" : '';
  return { ...base, ...extra, intent: facet ? `entity.${facet}.fallback` : 'entity.overview', text: note + e.overview };
}

function contactReply(e?: Entity): Reply {
  return {
    intent: 'contact',
    mood: 'success',
    text: `The best next step is a conversation with the team. Tell us what you're trying to solve on the Contact page, or book a free 30-minute call — enough to figure out where to start. You can also email ${CONTACT.email} or call ${CONTACT.phone}.`,
    links: contactLinks(e?.cta),
    chips: ['Which solution fits my business?', 'Explore TLS solutions'],
  };
}

const APPROACH: Omit<Reply, 'intent'> = {
  text: 'Lean thinking, a consulting mindset, and technical execution. Every engagement follows the same four steps:',
  points: COMPANY.approach,
  chips: ['Which solution fits my business?', 'I want to discuss a project'],
};

const UNKNOWN: Omit<Reply, 'intent'> = {
  text: "I don't have a confirmed answer to that yet. I can help with what I do know about TLS, or you can connect with the team for a more specific answer.",
  links: [CONTACT.page],
  chips: ['What does TLS do?', 'Explore TLS solutions'],
};

const OUT_OF_SCOPE = "That's outside what I specialize in, but I can help with questions about TLS, technology, AI, or the business problem you're trying to solve.";

/* ------------------------------------------------------------- the engine */

export function createEngine(opts: {
  path: string;
  insights?: Insight[];
  state?: Partial<EngineState>;
  provider?: GeneralAI;
  providerTimeoutMs?: number;
}) {
  const hydrate = (s?: Partial<EngineState>): EngineState => ({ ...s, turns: s?.turns ?? 0, recent: Array.isArray(s?.recent) ? s!.recent.slice(-6) : [] });
  let state = hydrate(opts.state);
  let insights = opts.insights ?? [];
  const pageTopic = topicForPath(opts.path);
  const v = <T>(list: T[]) => variant(list, state.turns);

  /** The solution in play: a concept just explained, the conversation's topic, or the page's. */
  const current = (): Entity | undefined => byId(conceptById(state.concept)?.entity ?? state.topic ?? pageTopic ?? '');
  const setTopic = (e: Entity) => {
    state.topic = e.id;
    state.concept = undefined;
  };

  /* ---------------------------------------------------- composed replies */

  function insightReply(t: string, explicit = true): Reply | null {
    if (!insights.length) return null;
    const wantCases = has(t, /case stud/);
    const ws = t.split(' ').filter((w) => w.length > 3 && !STOP.has(w) && !/^(insights?|blog|articles?|posts?|read|resources?|guides?|recent|latest|show|case|studies|study|news)$/.test(w));
    let list = insights;
    if (wantCases) list = insights.filter((i) => i.category === 'case-studies');
    if (ws.length) {
      const scored = list
        .map((i) => ({ i, s: ws.filter((w) => norm(`${i.title} ${i.excerpt} ${i.topics.join(' ')}`).includes(w)).length }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s);
      if (scored.length) list = scored.map((x) => x.i);
      else if (!explicit) return null;
    }
    const top = list.slice(0, 3);
    if (!top.length) return null;
    return {
      intent: wantCases ? 'insights.cases' : 'insights',
      text: wantCases ? 'Here are some of our case studies:' : 'Here are some of our insights you might find useful:',
      cards: top.map((i) => ({ title: i.title, text: i.excerpt, href: i.href })),
      links: [{ label: 'All insights', href: wantCases ? '/insights/case-studies/' : '/insights/' }],
      chips: ['Which solution fits my business?', 'I want to discuss a project'],
    };
  }

  /** A general explanation, with a light pointer to TLS where it applies. */
  function conceptReply(c: Concept): Reply {
    state.concept = c.id;
    state.goal = 'learn';
    const e = byId(c.entity ?? '');
    const bridge = e
      ? v([`If it's useful, TLS works on this through ${the(e)}.`, `TLS also helps businesses with this through ${the(e)}.`, `This is also something TLS works on, through ${the(e)}.`])
      : c.company === 'approach'
        ? 'It is also at the core of how True Lean Solutions works.'
        : '';
    return {
      intent: 'general.concept',
      text: bridge ? `${c.def}\n\n${bridge}` : c.def,
      chips: e ? ['How does TLS help with this?'] : c.company ? ['How does TLS work?'] : undefined,
    };
  }

  /** "What is X, and does TLS do it?": the explanation, then TLS's answer. */
  function hybridReply(c: Concept, onPage = false): Reply {
    if (c.company === 'approach') {
      state.concept = undefined;
      return { ...APPROACH, intent: 'hybrid', text: `${c.def}\n\nIt's also at the core of how True Lean Solutions works — ${APPROACH.text.charAt(0).toLowerCase()}${APPROACH.text.slice(1)}` };
    }
    const e = byId(c.entity ?? '');
    if (!e) return conceptReply(c);
    setTopic(e);
    state.goal = 'explore';
    if (onPage) return { ...entityReply(e, null, ''), text: `${c.def}\n\n${e.overview}` };
    return {
      intent: 'hybrid',
      mood: 'solution',
      text: `${c.def}\n\nYes — TLS works on this through ${the(e)}. ${e.overview}`,
      note: e.id === 'workflow' ? "If you tell me what process you're trying to improve, I can help you explore what might fit." : "If you tell me a bit about your situation, I can help you work out what might fit.",
      links: [pageLink(e)],
      chips: followFor(e),
    };
  }

  /** "What's the difference between X and Y?" */
  function compareReply(u: Understanding): Reply | null {
    const cs = u.concepts.slice(0, 4);
    const es = u.entities.map((x) => x.e).slice(0, 3);
    if (cs.length < 2 && es.length < 2) return null;
    state.goal = 'learn';
    const related = [...new Set((cs.length >= 2 ? cs.map((c) => byId(c.entity ?? '')) : es).filter((e): e is Entity => !!e))];
    if (related[0]) state.topic = related[0].id;
    state.concept = undefined;
    return {
      intent: 'compare',
      text: v(["Here's the simplest way to think about it:", 'Good question. In short:', "Here's how they differ:"]),
      points: cs.length >= 2 ? cs.map((c) => c.def) : es.map((e) => `${e.name} — ${firstSentence(e.overview)}`),
      note: "If you tell me what you're trying to connect or build, I can help you work out which direction fits.",
      chips: related.slice(0, 2).map((e) => `Tell me about ${e.name}`),
    };
  }

  /* ---------------------------------------------------- discovery */

  function askProblem(p: Problem, t: string): Reply {
    state.problem = p.id;
    state.goal = 'solve';
    state.concept = undefined;
    const q = p.ask(t);
    if (p.id === 'open') {
      state.awaiting = 'need';
      return { intent: 'discovery.ask', text: q.text, chips: NEEDS.map((n) => n.label) };
    }
    state.awaiting = 'problem';
    state.offered = q.chips;
    return { intent: 'discovery.ask', text: q.text, chips: q.chips };
  }

  function recommend(p: Problem): Reply {
    const es = p.recommend.map((id) => byId(id)).filter((e): e is Entity => !!e);
    state.awaiting = undefined;
    state.recommended = es.map((e) => e.id);
    state.offered = undefined;
    state.goal = 'solve';
    setTopic(es[0]);
    const names = es.map((e) => e.name).join(' or ');
    return {
      intent: 'discovery.result',
      mood: 'solution',
      text: p.id === 'open' ? `${p.why} Here's where that usually starts:` : `Based on what you've described, ${names} could be relevant. ${p.why}`,
      cards: es.map(card),
      chips: ['How would that work?', 'What would something like this cost?', 'Talk to someone'],
    };
  }

  /** Is this message an answer to Tali's discovery question, or something new? */
  const answersQuestion = (u: Understanding) => {
    if (state.offered?.some((c) => clean(c) === u.text)) return true;
    if (u.switched || u.define || u.compare) return false;
    // A short reply ("Email", "A CRM", "Zoom") answers the question asked.
    if (words(u.rest) <= 3 && !u.question) return true;
    return (
      words(u.rest) <= 10 &&
      !u.facet &&
      !(u.question && (u.tlsDirected || u.entities.length > 0)) &&
      ![RX.human, RX.discovery, RX.project, RX.company, RX.contact].some((re) => re.test(u.rest))
    );
  };

  /* ---------------------------------------------------- routing */

  function route(u: Understanding): Reply {
    const t = u.rest;
    const found = u.entities;
    const facet = u.facet;

    /* Memory: Tali asked a question; is this the answer? */
    if (state.awaiting === 'need') {
      state.awaiting = undefined;
      const need = NEEDS.find((n) => norm(n.label) === t) ?? NEEDS.find((n) => t.length > 3 && norm(n.label).includes(t));
      if (need) {
        const first = byId(need.entities[0])!;
        setTopic(first);
        state.goal = 'solve';
        state.recommended = need.entities;
        return { intent: 'discovery.result', mood: 'solution', text: need.note, cards: need.entities.map((id) => card(byId(id)!)), chips: followFor(first) };
      }
      const p = answersQuestion(u) ? problemOf(t, true, true) : undefined;
      if (p && p.id !== 'open') return askProblem(p, t);
      if (state.problem === 'open' && answersQuestion(u) && !found.length && words(t) >= 3) return recommend(problemById('open')!);
    }
    if (state.awaiting === 'problem' && state.problem) {
      state.awaiting = undefined;
      if (answersQuestion(u)) {
        const p = problemById(state.problem)!;
        if (p.id === 'automate' || p.id === 'manual') {
          const sub = problemOf(t, true, true);
          if (sub && !['automate', 'manual', 'open'].includes(sub.id)) return askProblem(sub, t);
        }
        return recommend(p);
      }
    }
    if (state.awaiting === 'pricing') {
      state.awaiting = undefined;
      if (found.length) {
        setTopic(found[0].e);
        return entityReply(found[0].e, 'pricing', t);
      }
      if (/\b(custom|project|something else|other|general|everything|all|both)\b/.test(t)) return pricingOverview();
    }

    /* Guards: never guess at what isn't published. */
    if (has(t, RX.certification)) {
      const e = found[0]?.e ?? current();
      return {
        intent: 'tls.unconfirmed',
        text: `I don't have a confirmed answer on specific certifications or compliance standards, so I won't guess.${e?.control ? ` What I can tell you about ${e.name}: ${e.control}` : ''} The team can confirm exactly what applies to your situation.`,
        links: [CONTACT.page],
      };
    }
    if (has(t, RX.guarantee)) {
      const ai = (found[0]?.e.id ?? current()?.id) === 'visibility' || /\b(ai|chatgpt|gemini|perplexity|google|rank\w*|search)\b/.test(t);
      return {
        intent: 'guarantee',
        text: ai
          ? 'No one can honestly guarantee how AI platforms rank or cite a business — those platforms decide what they show. What the AI Visibility Growth Team works on is strengthening the signals that support credible recommendations and citations, and measuring progress over time.'
          : "I can't promise specific outcomes. Every engagement is scoped to your situation, and the team can walk you through what to realistically expect.",
        links: ai ? [pageLink(byId('visibility')!)] : [CONTACT.page],
      };
    }
    if (has(t, RX.howMany)) return { ...UNKNOWN, intent: 'tls.unknown', text: "I don't have a confirmed number to share.", chips: ['Who is on the team?', 'Who are your clients?'] };
    if (has(t, RX.act)) {
      // Tali can't act outside the chat: say so, and point to where it's done.
      return {
        intent: 'action.unavailable',
        text: "I can't do that myself from here — but you can book a free 30-minute call directly, or share what you need on the Contact page and the team will take it from there.",
        links: [CONTACT.booking, CONTACT.page],
      };
    }
    if (has(t, RX.build)) {
      return {
        intent: 'identity',
        text: "I'm Tali, the AI assistant for True Lean Solutions. I don't go into how I'm built, but I'm happy to help with anything about TLS or the challenge you're working on.",
      };
    }
    const member = TEAM.find((m) => m.keys.some((k) => new RegExp(`\\b${k}\\b`).test(t)));
    if (member) {
      return { intent: 'team.member', text: `${member.name} is the ${member.role} at True Lean Solutions.`, links: [{ label: 'Meet the team', href: '/about-us/' }], chips: ['Who is on the team?', 'How did True Lean Solutions start?'] };
    }
    if (has(t, RX.why)) {
      return { intent: 'why', text: 'What sets True Lean Solutions apart:', points: COMPANY.values, links: [{ label: 'About us', href: '/about-us/' }], chips: ['How do you work?', 'Which solution fits my business?'] };
    }
    if (has(t, RX.size) && (u.tlsDirected || u.question)) {
      return {
        intent: 'audience.company',
        text: `Yes — True Lean Solutions is built for growing businesses: ${COMPANY.values[0].replace(/^Built for growing businesses: /, '')}`,
        chips: ['Which solution fits my business?', 'Who are your clients?'],
      };
    }

    /* Actions: a person, contact, getting started. */
    if (has(t, RX.human)) {
      state.goal = 'contact';
      return {
        ...contactReply(found[0]?.e ?? current()),
        intent: 'human',
        text: `I can't hand you over to a person live from here, but the team is easy to reach: share what you're working on through the Contact page, or book a free 30-minute call. You can also email ${CONTACT.email} or call ${CONTACT.phone}.`,
        chips: ['What should I prepare?'],
      };
    }
    if (has(t, RX.prepare)) {
      return {
        intent: 'prepare',
        text: "Just the problem you're trying to solve. The contact form asks about your business challenge and your timeline. Most businesses we work with know something isn't working but aren't sure which lever to pull first — that's a fine place to start.",
        links: contactLinks(current()?.cta),
        chips: ['Which solution is right for me?'],
      };
    }
    if (has(t, RX.getStarted)) {
      const e = found[0]?.e ?? current();
      if (e) setTopic(e);
      state.goal = 'contact';
      return {
        intent: 'start',
        mood: 'success',
        text: "Start by telling us what you're trying to solve: share it on the Contact page and we'll get back to you, or book a free 30-minute call to talk it through.",
        links: contactLinks(e?.cta),
        chips: e ? followFor(e, t, 'process') : ['What should I prepare?', 'Which solution is right for me?'],
      };
    }
    if (has(t, RX.assessment) && (found[0]?.e.id === 'visibility' || current()?.id === 'visibility')) {
      const e = byId('visibility')!;
      setTopic(e);
      state.goal = 'contact';
      return { intent: 'assessment', mood: 'success', text: 'Every engagement starts by establishing your baseline: a review of your current AI discovery presence, content, technical foundations, and opportunities. Get in touch and the team will start there.', links: contactLinks(e.cta) };
    }

    /* General knowledge: comparisons and definitions. */
    if (u.compare) {
      const r = compareReply(u);
      if (r) return r;
    }
    const c = u.concepts[0];
    if (u.define && c) {
      if (u.tlsDirected) return hybridReply(c);
      if (c.entity && c.entity === pageTopic) return hybridReply(c, true);
      return conceptReply(c);
    }

    /* "Does TLS do that?": resolve "that" from the conversation. */
    if (u.refers && u.tlsDirected && !found.length && !c) {
      const concept = conceptById(state.concept);
      if (concept?.company === 'approach') {
        state.concept = undefined;
        return { ...APPROACH, intent: 'approach', text: `Yes — it's at the core of how True Lean Solutions works. ${APPROACH.text}` };
      }
      const e = current();
      if (e) {
        setTopic(e);
        if (facet) return entityReply(e, facet, t);
        return { ...entityReply(e, null, t), text: `${concept ? `Yes — TLS works on this through ${the(e)}.` : `Yes — that's ${e.name}.`}\n\n${e.overview}` };
      }
      return { intent: 'clarify', text: 'Which service do you mean?', chips: ['Explore TLS solutions', 'Which solution fits my business?'] };
    }

    /* Guided discovery and described problems. */
    if (has(t, RX.discovery)) {
      const p = problemById(state.problem);
      if (p && p.id !== 'open') return recommend(p);
      state.awaiting = 'need';
      state.goal = 'solve';
      return { intent: 'discovery', text: "Happy to help you find the right fit. What's closest to what you're trying to solve?", chips: NEEDS.map((n) => n.label) };
    }
    if (!u.tlsDirected) {
      const p = problemOf(t, u.firstPerson);
      if (p) return askProblem(p, t);
    }

    /* Next steps: a project conversation, a demo, contact details. */
    if ((has(t, RX.project) && !facet) || (has(t, RX.contact) && !found.length)) {
      const e = found[0]?.e ?? (has(t, /\b(demo|book)\b/) ? current() : undefined);
      if (e) setTopic(e);
      state.goal = 'contact';
      return contactReply(e);
    }

    if (u.offtopic && !found.length && !c) return { intent: 'offtopic', text: OUT_OF_SCOPE, chips: ['What does TLS do?', 'Explore TLS solutions'] };

    /* A tool the site never mentions: don't imply a ready-made connector. */
    const tool = UNCONFIRMED_TOOLS.find((x) => new RegExp(`\\b${x}\\b`).test(t));
    if (tool && (found.some((x) => x.e.id === 'integration') || u.tlsDirected || /\b(integrat|connect|sync|work with|link)\w*/.test(t))) {
      const e = byId('integration')!;
      setTopic(e);
      const name = TOOL_NAMES[tool] ?? tool.charAt(0).toUpperCase() + tool.slice(1);
      return {
        intent: 'entity.unconfirmed',
        text: `I can't confirm a ready-made connection to ${name} from what I know. Integration work uses native connectors, middleware like Zapier or Make, custom APIs, or direct database integrations — the team can confirm what fits your setup.`,
        links: [pageLink(e), CONTACT.page],
        chips: ['How does an integration project run?'],
      };
    }

    /* TLS knowledge: a specific solution or product. */
    if (found.length) {
      const [top, second] = found;
      state.goal = facet === 'pricing' ? 'evaluate' : 'explore';
      if (second && second.score >= top.score * 0.6 && !facet && !t.includes(norm(top.e.name))) {
        setTopic(top.e);
        return {
          intent: 'entity.multiple',
          mood: 'solution',
          text: 'A few of our solutions fit that:',
          cards: found.slice(0, 3).map(({ e }) => card(e)),
          chips: [`Tell me about ${top.e.name}`, `Tell me about ${second.e.name}`, 'I want to discuss a project'],
        };
      }
      setTopic(top.e);
      return entityReply(top.e, facet, t);
    }

    /* A question about the solution in play ("what does it include?"). */
    const topicEntity = current();
    if (topicEntity && facet && !has(t, RX.generalPricing) && !has(t, RX.company) && !has(t, RX.story)) {
      setTopic(topicEntity);
      if (facet === 'pricing') state.goal = 'evaluate';
      return entityReply(topicEntity, facet, t);
    }

    /* Company-level questions. */
    if (has(t, RX.story)) return { intent: 'story', text: COMPANY.story, links: [{ label: 'Our story', href: '/about-us/' }], chips: ['Who is on the team?', 'How do you work?'] };
    if (has(t, RX.company)) {
      state.topic = undefined;
      state.concept = undefined;
      return {
        intent: 'company',
        text: `${COMPANY.positioning} ${COMPANY.short}\n\nWe work across AI & automation, custom software, system integration and technical talent — and we start by making sure we're solving the right problem.`,
        links: [{ label: 'About us', href: '/about-us/' }, { label: 'Our solutions', href: '/services/' }],
        chips: ['Explore TLS solutions', 'How do you work?', 'Which solution fits my business?'],
      };
    }
    if (has(t, RX.services)) {
      return {
        intent: 'services',
        mood: 'solution',
        text: 'Here are our solutions. Each one links to its page:',
        cards: ENTITIES.filter((e) => e.id !== 'meeting' && e.id !== 'visibility').map(card),
        chips: ['Tell me about Meeting Intelligence', 'Which solution fits my business?', 'I want to discuss a project'],
      };
    }
    if (has(t, RX.clients)) return { intent: 'clients', text: "Some of the organizations we've worked with:", points: COMPANY.clients, links: [{ label: 'See what our clients say', href: '/' }], chips: ['Do you have case studies?', 'I want to discuss a project'] };
    if (has(t, RX.team)) return { intent: 'team', text: 'Our core team includes:', points: COMPANY.team, links: [{ label: 'Meet the team', href: '/about-us/' }], chips: ['How did True Lean Solutions start?', 'How do you work?'] };
    if (has(t, RX.approach) && !topicEntity) return { ...APPROACH, intent: 'approach', links: [{ label: 'Why True Lean Solutions', href: '/' }] };
    if (has(t, RX.location)) return { intent: 'location', text: 'You can see where our team delivers from on our About page — and we work with clients remotely.', links: [{ label: 'Global delivery', href: '/about-us/' }, CONTACT.page] };
    if (has(t, RX.insights)) {
      const r = insightReply(t);
      if (r) return r;
    }

    /* Follow-ups about the topic ("tell me more", "yes"). */
    if (topicEntity && (facet || RX.more.test(t)) && !has(t, RX.generalPricing)) {
      setTopic(topicEntity);
      const f: Facet | null = facet ?? (topicEntity.details ? 'details' : topicEntity.process ? 'process' : null);
      return entityReply(topicEntity, f, t);
    }
    if (has(t, RX.generalPricing)) return pricingOverview();
    // "Tell me more" with nothing in play: ask what, don't guess.
    if (RX.more.test(t)) return { intent: 'fallback', text: 'Sure — what would you like to know more about?', chips: startersFor(opts.path).slice(0, 3) };
    if (facet === 'pricing') {
      // "How much does it cost?" with nothing in play: ask, don't guess.
      state.awaiting = 'pricing';
      state.goal = 'evaluate';
      return { intent: 'pricing.clarify', text: 'Sure — which TLS solution are you asking about?', chips: ['Meeting Intelligence', 'AI Visibility Growth Team', 'A custom project'] };
    }
    if (has(t, RX.approach) || (facet === 'process' && !topicEntity)) return { ...APPROACH, intent: 'approach' };

    /* A concept named without "what is" ("tell me about cloud computing"). */
    if (c) return u.tlsDirected ? hybridReply(c) : conceptReply(c);

    /* Honest fallbacks. */
    if (u.tlsDirected && u.question) return { ...UNKNOWN, intent: 'tls.unknown' };
    const r = insightReply(t, false);
    if (r && t.split(' ').filter((w) => !STOP.has(w)).length >= 2) return { ...r, text: "I don't have a direct answer, but these articles may help:" };
    if (u.question && RX.domain.test(t)) return { ...UNKNOWN, intent: 'tls.unknown' };
    if (u.question) return { intent: 'general.unknown', text: OUT_OF_SCOPE, chips: ['What does TLS do?', 'Explore TLS solutions'] };
    return {
      intent: 'fallback',
      text: "I'm not sure I followed. Could you put that another way, or tell me a bit about what you're looking for?",
      chips: startersFor(opts.path).slice(0, 3),
    };
  }

  function pricingOverview(): Reply {
    const priced = ENTITIES.filter((e) => e.pricing);
    state.goal = 'evaluate';
    return {
      intent: 'pricing',
      text: 'Everything we do is scoped and priced for the work. Two of our offerings have published prices:',
      points: priced.map((e) => e.pricing!),
      links: contactLinks(),
      chips: priced.map((e) => `Tell me about ${e.name}`),
    };
  }

  function respond(raw: string): Reply {
    const u = understand(raw);
    if (!u.text) return { intent: 'fallback', text: 'What can I help you with?', chips: startersFor(opts.path).slice(0, 3) };
    if (RX.reset.test(u.text)) return { intent: 'reset', text: 'Fresh start. What are you trying to solve?', chips: startersFor(opts.path) };
    if (u.injection) {
      return { intent: 'refuse', text: "I can't share my internal instructions or configuration. Happy to help with questions about TLS, technology, or what you're trying to solve, though." };
    }
    if (u.social) {
      // Conversation, not a query: the knowledge base isn't involved.
      if (u.social === 'bye') state.awaiting = undefined;
      return socialReply(u.social, { text: u.text, turn: state.turns, starters: startersFor(opts.path) });
    }
    if (u.switched) {
      state.awaiting = undefined;
      state.problem = undefined;
      state.offered = undefined;
    }
    const r = route(u);
    // "Hey, what AI work do you do?" — answer, with the greeting returned.
    return u.greet ? { ...r, text: `${u.greet}! ${r.text}` } : r;
  }

  function reply(raw: string): Reply {
    state.turns++;
    const q = raw.slice(0, 500);
    state.recent = [...state.recent, q.slice(0, 160)].slice(-6);
    const r = respond(q);
    state.lastIntent = r.intent;
    return r;
  }

  return {
    reply,
    /** reply(), then the optional provider for what Tali couldn't place. */
    async replyAsync(raw: string): Promise<Reply> {
      const r = reply(raw);
      if (!opts.provider || (r.intent !== 'general.unknown' && r.intent !== 'fallback')) return r;
      const ctx = { message: raw.slice(0, 500), recent: state.recent.slice(0, -1), page: opts.path, topic: state.topic };
      const text = await askProvider(opts.provider, ctx, opts.providerTimeoutMs);
      if (!text) return r;
      state.lastIntent = 'general.ai';
      return { intent: 'general.ai', text, chips: ['What does TLS do?', 'Explore TLS solutions'] };
    },
    get state() {
      return state;
    },
    setInsights(list: Insight[]) {
      insights = list;
    },
    reset() {
      state = hydrate();
    },
  };
}

export type Engine = ReturnType<typeof createEngine>;
