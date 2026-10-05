/**
 * Tali's conversation engine: understanding, context and answers, with no UI
 * and no network. It runs entirely in the browser over knowledge.ts (approved
 * site copy), so it is instant, free, works on static hosting, and cannot
 * invent a claim. The chat UI (ui.ts) only renders what this returns.
 *
 *   understand ... normalize → typo-correct → intents, entities, facets
 *   context ...... the current topic (from the page, then the conversation),
 *                  so "how much is it?" follows on from what came before
 *   respond ...... small talk, company, solutions, guided discovery, an
 *                  entity facet, insights, contact handoff, or a fallback
 *   suggest ...... page starters and as-you-type suggestions (local index)
 *
 * An LLM can replace `respond` later behind the same Reply shape.
 */
import { CONTACT, COMPANY, ENTITIES, NEEDS, byId, type Entity, type Link } from './knowledge';

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
  cards?: Card[];
  links?: Link[];
  /** Follow-up questions offered as chips. */
  chips?: string[];
  /** Tali's expression for this reply. */
  mood?: 'idle' | 'solution' | 'success';
  /** Which branch answered (for tests and quality review). */
  intent: string;
}

export interface EngineState {
  topic?: string;
  awaiting?: 'need';
  turns: number;
}

type Facet = 'pricing' | 'process' | 'details' | 'audience' | 'control';

/* ---------------------------------------------------------------- text */

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9.+\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const STOP = new Set('a an the i im me my we our you your to of for and or is are be can do does did it this that what how who which in on at with about any some please want need would like could should tell show give get have has'.split(' '));

/** Damerau–Levenshtein distance, capped (early exit above `max`). */
function dist(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let best = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      best = Math.min(best, d[i][j]);
    }
    if (best > max) return max + 1;
  }
  return d[a.length][b.length];
}

/* Words the engine knows, for typo correction ("meting" → "meeting"). */
const LEXICON = new Set<string>();
const learn = (s: string) => norm(s).split(' ').forEach((w) => w.length >= 3 && LEXICON.add(w));
ENTITIES.forEach((e) => [e.name, ...e.aliases].forEach(learn));
'price pricing cost costs much fee rate budget process steps work works started start include includes included features details security secure private privacy data controlled control deploy deployment premises who what fit right suitable solutions services offer company team founder founded history story clients customers insights articles blog case studies contact email phone call book demo discuss project help choose recommend thanks hello goodbye human person expert talk automation automate integration software meeting visibility assessment baseline'
  .split(' ')
  .forEach(learn);
'service solution article insight project process'.split(' ').forEach(learn);

function correct(word: string) {
  if (word.length < 4 || LEXICON.has(word) || /\d/.test(word)) return word;
  const max = word.length >= 7 ? 2 : 1;
  let best = word;
  let bestD = max + 1;
  for (const w of LEXICON) {
    if (Math.abs(w.length - word.length) > max || w[0] !== word[0]) continue;
    const d = dist(word, w, max);
    if (d < bestD) (best = w), (bestD = d);
  }
  return best;
}

const clean = (raw: string) => norm(raw).split(' ').map(correct).join(' ');
const has = (t: string, re: RegExp) => re.test(t);
const wordIn = (t: string, phrase: string) => new RegExp(`(^|\\s)${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|\\s)`).test(t);

/* ------------------------------------------------------------- understanding */

const RX = {
  reset: /^(reset|start over|restart|clear( chat)?|new chat)$/,
  greeting: /^(hi+|hello+|hey+|hiya|howdy|yo|good (morning|afternoon|evening)|greetings)( there| tali)?$/,
  howAreYou: /\b(how are you|how r u|hows it going|how is it going|whats up|sup)\b/,
  thanks: /\b(thanks|thank you|thx|ty|cheers|appreciate it|great thanks|perfect)\b/,
  bye: /\b(bye|goodbye|see you|see ya|thats all|that is all|no thanks|nothing else|im done)\b/,
  identity: /\b(who are you|what are you|your name|who is tali|what is tali|are you (a )?(bot|robot|human|real|ai|person)|are you chatgpt)\b/,
  human: /\b(human|real person|talk to (a |an |the |your |our )?(person|expert|someone|team|sales|people)|speak (to|with) (a |an |the |your |our )?(person|someone|expert|team)|live agent|representative)\b/,
  getStarted: /\b(get started|getting started|how (do|can|should) (i|we) (start|begin)|first step|next step)\b/,
  prepare: /\b(what should i prepare|prepare|what do you need from (me|us)|what information do you need|what should (i|we) (bring|have ready))\b/,
  contact: /\b(contact|get in touch|reach (you|out|the team)|email|e-mail|phone|call you|your number|address)\b/,
  project: /\b(discuss|start a conversation|start a project|new project|my project|a project|work with you|hire you|engage|proposal|quote|consultation|book|schedule|demo|call)\b/,
  assessment: /\b(assessment|baseline|audit)\b/,
  discovery: /\b(which (solution|service|one)|what (solution|service) (fits|is right|should)|fits? my business|right for (me|us|my business)|help (me )?(choose|chose|decide|pick|find)|choosing|recommend|not sure (where|what|which)|where (do i|to|should i) (start|begin)|what should i)\b/,
  services: /\b(services|solutions|offerings|what do you (do|offer)|what (can|could) you (do|help)|what you do|capabilities|explore|how (can|could) you help|help my business)\b/,
  company: /\b(what do you (guys|all|folks|people) do|about (you|tls|the company|true lean)|who (are|is) (you guys|tls|true lean)|your company|the company|what is (tls|true lean)|what does (tls|true lean)( solutions)? do|true lean solutions|tls do)\b/,
  approach: /\b(your approach|approach|how do you work|how you work|how we work|methodology|way you work|lean thinking|why (tls|true lean|you|choose you|work with you))\b/,
  story: /\b(founded|founder|history|your story|began|how did .* start|when did .* start|origin|who owns|owner|ceo|president)\b/,
  team: /\b(team|who works|people behind|leadership|leaders|employees|staff)\b/,
  clients: /\b(clients|customers|who have you worked|worked with|references|portfolio|testimonials|reviews)\b/,
  insights: /\b(insights?|blog|articles?|posts?|read|resources?|guides?|case stud(y|ies)|news)\b/,
  location: /\b(where are you|located|location|office|offices|based|headquarter)\b/,
  generalPricing: /\b(your (price|prices|pricing|rate|rates|fee|fees)|do you charge|how do you (charge|price)|what do you charge)\b/,
  pricing: /\b(price|prices|pricing|cost|costs|how much|fee|fees|rate|rates|budget|charge|expensive|cheap|afford|per month|per year|subscription)\b/,
  process: /\b(how (does|do|would|will) [a-z ]*\b(work|works|run|runs|go|goes)|how it works|process|steps|stages|get started|getting started|onboard\w*|timeline|what happens|preserved|preserve)\b/,
  details: /\b(include|includes|included|features?|what (does|do) (it|the service|you) (do|offer|include|build)|what (kind|kinds|type|types) of|what do you (build|place)|roles|deliverables|tell me more|more (details|info|information)|in detail|capabilit)/,
  audience: /\b(who (is it|is this|its|it is) for|who should|right for|good fit|a fit|suitable|do i need|signs|when (do|should) (i|we))\b/,
  control: /\b(secur\w*|privacy|private|data control|controlled|control (my|our|the) data|on.?prem\w*|deploy\w*|where .* data|data (stay|live|stored)|safe|confidential|compliance|ownership|lock-?in)\b/,
  more: /^(more|tell me more|go on|and|continue|details|more details|explain|elaborate|yes|yes please|sure|ok|okay)$/,
  offtopic: /\b(weather|joke|recipe|movie|song|sports?|score|stock price|bitcoin|crypto|politic\w*|election|translate|poem|essay|homework|math|capital of|girlfriend|boyfriend|date me|meaning of life)\b/,
};

function detectEntities(t: string): { e: Entity; score: number }[] {
  const found: { e: Entity; score: number }[] = [];
  for (const e of ENTITIES) {
    let score = 0;
    for (const a of [e.name, ...e.aliases]) {
      const n = norm(a);
      if (n && wordIn(t, n)) score = Math.max(score, n.length);
    }
    if (score) found.push({ e, score });
  }
  return found.sort((a, b) => b.score - a.score);
}

function facetOf(t: string): Facet | null {
  if (has(t, RX.pricing)) return 'pricing';
  if (has(t, RX.control)) return 'control';
  if (has(t, RX.audience)) return 'audience';
  if (has(t, RX.details)) return 'details';
  if (has(t, RX.process)) return 'process';
  return null;
}

/** The page's own topic, so questions asked on a product page answer about it. */
export function topicForPath(path: string): string | undefined {
  const p = path.replace(/^\/[^/]*TLS-Website/i, '');
  return ENTITIES.find((e) => p.startsWith(e.url))?.id;
}

/* ------------------------------------------------------------- starters */

const STARTERS: [string, string[]][] = [
  ['/services/meeting-intelligence/', ['How does Meeting Intelligence work?', 'How is meeting knowledge preserved?', 'How is enterprise data controlled?', 'Can I request a demo?']],
  ['/services/ai-visibility-growth-team/', ['What is AI search visibility?', 'How does AI visibility optimization work?', 'What does the service include?', 'How can I get an initial assessment?']],
  ['/services/enterprise-ai/', ['What is Enterprise AI?', 'Tell me about Meeting Intelligence', 'How is my data kept private?', 'Can I book a demo?']],
  ['/services/workflow-automation/', ['What processes can be automated?', 'Can automation work with my existing tools?', 'How do I get started?']],
  ['/services/software/', ['What kind of software do you build?', 'How does a software project run?', 'I want to discuss a project']],
  ['/services/integrations/', ['Can you connect my existing tools?', 'How does an integration project run?', 'I want to discuss a project']],
  ['/services/technical-talent/', ['What roles do you place?', 'How does the hiring process work?', 'Do you offer contract-to-hire?']],
  ['/services/technology-strategy/', ['Which solution fits my business?', 'How do you work?', 'I want to discuss a project']],
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
  ]),
].map((q) => ({ q, words: norm(q).split(' ').filter((w) => !STOP.has(w)) }));

export function suggestFor(partial: string, limit = 3): string[] {
  const t = norm(partial);
  if (t.length < 2) return [];
  const words = t.split(' ');
  const last = words.pop()!;
  const full = words.map(correct).filter((w) => !STOP.has(w));
  const scored = SUGGESTIONS.map((s) => {
    let score = 0;
    for (const w of full) if (s.words.some((sw) => sw === w || (w.length > 3 && sw.startsWith(w.slice(0, -1))))) score += 2;
    const fixed = correct(last);
    if (last.length >= 2 && s.words.some((sw) => sw.startsWith(last) || (fixed !== last && sw.startsWith(fixed)))) score += STOP.has(last) ? 0.5 : 1.5;
    return { q: s.q, score };
  }).filter((s) => s.score >= 1.5 && norm(s.q) !== t);
  return scored.sort((a, b) => b.score - a.score || a.q.length - b.q.length).slice(0, limit).map((s) => s.q);
}

/* ------------------------------------------------------------- replies */

const contactLinks = (cta?: Link): Link[] => [cta ?? CONTACT.page, CONTACT.booking];
function firstSentence(s: string) {
  const m = s.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : s).trim();
}
/** Follow-ups for an entity, minus what was just asked or just answered. */
const followFor = (e: Entity, asked?: string, answered?: Facet | null) =>
  (e.follow ?? [])
    .filter((q) => norm(q) !== asked && !(answered && facetOf(clean(q)) === answered))
    .slice(0, 3);

function entityReply(e: Entity, facet: Facet | null, asked: string): Reply {
  const page: Link = { label: `Read more about ${e.name}`, href: e.url };
  const chips = followFor(e, asked, facet);
  const base = { links: [page, ...(e.cta ? [e.cta] : [])], chips, mood: 'solution' as const };
  switch (facet) {
    case 'pricing':
      return e.pricing
        ? { ...base, intent: 'entity.pricing', text: `${e.pricing} For anything specific to your situation, the team can walk you through it.`, links: [e.cta ?? CONTACT.page, page] }
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

export function createEngine(opts: { path: string; insights?: Insight[]; state?: EngineState }) {
  let state: EngineState = opts.state ?? { turns: 0 };
  let insights = opts.insights ?? [];
  const pageTopic = topicForPath(opts.path);

  const fallback = (): Reply => ({
    intent: 'fallback',
    text: "I don't have a confident answer to that from our website. I can help you explore our solutions, find the right fit, or connect you with the team.",
    chips: ['Explore TLS solutions', 'Which solution fits my business?', 'Talk to a person'],
    links: [CONTACT.page],
  });

  function insightReply(t: string, explicit = true): Reply | null {
    if (!insights.length) return null;
    const wantCases = has(t, /case stud/);
    const words = t.split(' ').filter((w) => w.length > 3 && !STOP.has(w) && !/^(insights?|blog|articles?|posts?|read|resources?|guides?|recent|latest|show|case|studies|study|news)$/.test(w));
    let list = insights;
    if (wantCases) list = insights.filter((i) => i.category === 'case-studies');
    if (words.length) {
      const scored = list
        .map((i) => ({ i, s: words.filter((w) => norm(`${i.title} ${i.excerpt} ${i.topics.join(' ')}`).includes(w)).length }))
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

  function respond(raw: string): Reply {
    const t = clean(raw);
    if (!t) return fallback();
    const topic = state.topic ?? pageTopic;
    const topicEntity = topic ? byId(topic) : undefined;
    const found = detectEntities(t);
    const facet = facetOf(t);

    if (RX.reset.test(t)) return { intent: 'reset', text: "Fresh start. What are you trying to solve?", chips: startersFor(opts.path) };

    // Guided discovery: the visitor is choosing what they need.
    if (state.awaiting === 'need') {
      const need = NEEDS.find((n) => norm(n.label) === t) ?? NEEDS.find((n) => t.length > 3 && norm(n.label).includes(t));
      if (need) {
        state.awaiting = undefined;
        const first = byId(need.entities[0])!;
        state.topic = first.id;
        return {
          intent: 'discovery.result',
          mood: 'solution',
          text: need.note,
          cards: need.entities.map((id) => byId(id)!).map((e) => ({ title: e.name, text: firstSentence(e.overview), href: e.url })),
          links: [first.cta ?? CONTACT.page],
          chips: followFor(first),
        };
      }
      state.awaiting = undefined;
    }

    const short = t.split(' ').length <= 4;
    if (short && RX.greeting.test(t)) return { intent: 'greeting', mood: 'idle', text: "Hi! I'm Tali, your True Lean AI Assistant. What are you trying to solve today?", chips: startersFor(opts.path) };
    if (has(t, RX.identity)) return { intent: 'identity', text: "I'm Tali, the AI assistant for True Lean Solutions. I answer from our own website, so I can help you explore our solutions and find the right next step. For anything I can't answer, I'll connect you with the team.", chips: startersFor(opts.path).slice(0, 3) };
    if (has(t, RX.howAreYou) && short) return { intent: 'smalltalk', text: "Doing well, thanks for asking! What are you working on?", chips: startersFor(opts.path).slice(0, 3) };
    if (has(t, RX.thanks) && t.split(' ').length <= 6) return { intent: 'thanks', mood: 'success', text: "You're welcome! Is there anything else I can help you with?", chips: ['Explore TLS solutions', 'I want to discuss a project'] };
    if (has(t, RX.bye) && t.split(' ').length <= 6) return { intent: 'goodbye', mood: 'success', text: "Thanks for stopping by! Whenever you're ready, the team is one message away.", links: [CONTACT.page] };
    if (has(t, RX.offtopic) && !found.length) return { intent: 'offtopic', text: "That's outside what I can help with — I'm focused on True Lean Solutions: our solutions, how we work, and how to get started.", chips: ['Explore TLS solutions', 'Which solution fits my business?'] };
    if (has(t, RX.human)) return { ...contactReply(found[0]?.e ?? topicEntity), intent: 'human' };

    // What to bring, and how to begin (Contact page copy).
    if (has(t, RX.prepare)) {
      return {
        intent: 'prepare',
        text: "Just the problem you're trying to solve. The contact form asks about your business challenge and your timeline. Most businesses we work with know something isn't working but aren't sure which lever to pull first — that's a fine place to start.",
        links: contactLinks(topicEntity?.cta),
        chips: ['Which solution is right for me?'],
      };
    }
    if (has(t, RX.getStarted)) {
      const e = found[0]?.e ?? topicEntity;
      if (e) state.topic = e.id;
      return {
        intent: 'start',
        mood: 'success',
        text: "Start by telling us what you're trying to solve: share it on the Contact page and we'll get back to you, or book a free 30-minute call to talk it through.",
        links: contactLinks(e?.cta),
        chips: e ? followFor(e, t, 'process') : ['What should I prepare?', 'Which solution is right for me?'],
      };
    }

    // Next steps: an assessment, a demo or a project conversation.
    if (has(t, RX.assessment) && (found[0]?.e.id === 'visibility' || topic === 'visibility')) {
      const e = byId('visibility')!;
      state.topic = e.id;
      return { intent: 'assessment', mood: 'success', text: 'Every engagement starts by establishing your baseline: a review of your current AI discovery presence, content, technical foundations, and opportunities. Get in touch and the team will start there.', links: contactLinks(e.cta) };
    }
    if (has(t, RX.discovery)) {
      state.awaiting = 'need';
      return { intent: 'discovery', text: "Happy to help you find the right fit. What's closest to what you're trying to solve?", chips: NEEDS.map((n) => n.label) };
    }
    if ((has(t, RX.project) && !facet) || (has(t, RX.contact) && !found.length)) {
      const e = found[0]?.e ?? (has(t, /\b(demo|book)\b/) ? topicEntity : undefined);
      if (e) state.topic = e.id;
      return contactReply(e);
    }

    // A specific solution or product.
    if (found.length) {
      const [top, second] = found;
      if (second && second.score >= top.score * 0.6 && !facet && !wordIn(t, norm(top.e.name))) {
        state.topic = top.e.id;
        return {
          intent: 'entity.multiple',
          mood: 'solution',
          text: 'A few of our solutions fit that:',
          cards: found.slice(0, 3).map(({ e }) => ({ title: e.name, text: firstSentence(e.overview), href: e.url })),
          chips: [`Tell me about ${top.e.name}`, `Tell me about ${second.e.name}`, 'I want to discuss a project'],
        };
      }
      state.topic = top.e.id;
      return entityReply(top.e, facet, t);
    }

    // A question about the current topic ("what does the service include?").
    if (topicEntity && facet && !has(t, RX.generalPricing) && !has(t, RX.company) && !has(t, RX.story)) {
      state.topic = topicEntity.id;
      return entityReply(topicEntity, facet, t);
    }

    // Company-level questions.
    if (has(t, RX.story)) return { intent: 'story', text: COMPANY.story, links: [{ label: 'Our story', href: '/about-us/' }], chips: ['Who is on the team?', 'How do you work?'] };
    if (has(t, RX.company)) {
      state.topic = undefined;
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
        cards: ENTITIES.filter((e) => e.id !== 'meeting' && e.id !== 'visibility').map((e) => ({ title: e.name, text: firstSentence(e.overview), href: e.url })),
        chips: ['Tell me about Meeting Intelligence', 'Which solution fits my business?', 'I want to discuss a project'],
      };
    }
    if (has(t, RX.clients)) return { intent: 'clients', text: "Some of the organizations we've worked with:", points: COMPANY.clients, links: [{ label: 'See what our clients say', href: '/' }], chips: ['Do you have case studies?', 'I want to discuss a project'] };
    if (has(t, RX.team)) return { intent: 'team', text: 'Our core team includes:', points: COMPANY.team, links: [{ label: 'Meet the team', href: '/about-us/' }], chips: ['How did True Lean Solutions start?', 'How do you work?'] };
    if (has(t, RX.approach) && !topicEntity) return { intent: 'approach', text: 'Lean thinking, a consulting mindset, and technical execution. Every engagement follows the same four steps:', points: COMPANY.approach, links: [{ label: 'Why True Lean Solutions', href: '/' }], chips: ['Which solution fits my business?', 'I want to discuss a project'] };
    if (has(t, RX.location)) return { intent: 'location', text: 'You can see where our team delivers from on our About page — and we work with clients remotely.', links: [{ label: 'Global delivery', href: '/about-us/' }, CONTACT.page] };
    if (has(t, RX.insights)) {
      const r = insightReply(t);
      if (r) return r;
    }

    // Follow-ups about the current topic ("how much is it?", "tell me more").
    if (topicEntity && (facet || RX.more.test(t)) && !has(t, RX.generalPricing)) {
      state.topic = topicEntity.id;
      const f: Facet | null = facet ?? (topicEntity.details ? 'details' : topicEntity.process ? 'process' : null);
      return entityReply(topicEntity, f, t);
    }
    if (facet === 'pricing' || has(t, RX.generalPricing)) {
      const priced = ENTITIES.filter((e) => e.pricing);
      return {
        intent: 'pricing',
        text: 'Everything we do is scoped and priced for the work. Two of our offerings have published prices:',
        points: priced.map((e) => e.pricing!),
        links: contactLinks(),
        chips: priced.map((e) => `Tell me about ${e.name}`),
      };
    }
    if (has(t, RX.approach) || (facet === 'process' && !topicEntity)) return { intent: 'approach', text: 'Lean thinking, a consulting mindset, and technical execution. Every engagement follows the same four steps:', points: COMPANY.approach, chips: ['Which solution fits my business?', 'I want to discuss a project'] };

    // Last resort before the fallback: an insight that matches the words.
    const r = insightReply(t, false);
    if (r && t.split(' ').filter((w) => !STOP.has(w)).length >= 2) return { ...r, text: "I don't have a direct answer, but these articles may help:" };
    return fallback();
  }

  return {
    reply(raw: string): Reply {
      state.turns++;
      return respond(raw.slice(0, 500));
    },
    get state() {
      return state;
    },
    setInsights(list: Insight[]) {
      insights = list;
    },
    reset() {
      state = { turns: 0 };
    },
  };
}

export type Engine = ReturnType<typeof createEngine>;
