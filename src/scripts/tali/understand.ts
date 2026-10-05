/**
 * Tali's message understanding: what did the visitor mean? Every message is
 * read here first, before anything is answered, so ordinary conversation
 * ("hii", "thanks", "okay cool") never reaches the knowledge base.
 *
 * It returns a plain description of the message (no reply): social intent,
 * TLS entities and the facet asked about, general concepts, whether it is a
 * definition or a comparison, whether it is aimed at TLS ("do you…",
 * "does TLS…"), whether it points back ("that", "it"), whether the visitor
 * changed the subject ("actually…"), and the leading greeting to echo.
 * engine.ts routes on this.
 */
import { ENTITIES, type Entity } from './knowledge';
import { detectConcepts, type Concept } from './general';
import { clean, norm, wordIn, words } from './language';

export type Facet = 'pricing' | 'process' | 'details' | 'audience' | 'control';

export type Social =
  | 'greeting'
  | 'howAreYou'
  | 'whatDoing'
  | 'present'
  | 'thanks'
  | 'ack'
  | 'positive'
  | 'laugh'
  | 'bye'
  | 'identity'
  | 'isBot'
  | 'isHuman'
  | 'capabilities';

/* Patterns run on cleaned text (slang already expanded: "whats" → "what is"). */
export const RX = {
  reset: /^(reset|start over|restart|clear( chat)?|new chat|start again|begin again)$/,
  // Attempts to get at Tali's instructions or internals. Narrow on purpose:
  // "do I own the source code?" or "do you need our API keys?" are fair questions.
  injection:
    /\b(ignore (all |any |your |the |previous |prior |above |earlier )*(instructions|rules|prompts?|directions|guidelines)|system prompt|(your|tali s|talis) (hidden |internal |initial |system )?(prompt|instructions|configuration|config|source code|training data|rules)|the (hidden|internal|initial|system) (prompt|instructions)|reveal (your|the) (prompt|instructions|rules|system|config\w*|secrets?)|jailbreak|developer mode|dan mode|(your|tali s|talis) (api keys?|secret keys?|access tokens?|passwords?|credentials)|internal (documents|docs|files|notes)|you are now|pretend (you are|to be)|act as (a |an )?(different|unrestricted|evil|human)|disregard (your|the|all) (instructions|rules))\b/,
  human: /\b(human|real person|talk to (a |an |the |your |our )?(person|expert|someone|somebody|team|sales|people|consultant)|speak (to|with) (a |an |the |your |our )?(person|someone|somebody|expert|team)|live agent|representative|someone from (your|the) team)\b/,
  getStarted: /\b(get started|getting started|how (do|can|should) (i|we) (start|begin)|first step|next steps?)\b/,
  prepare: /\b(what should i prepare|prepare|what do you need from (me|us)|what information do you need|what should (i|we) (bring|have ready))\b/,
  contact: /\b(contact|get in touch|reach (you|out|the team)|email|e-mail|phone|call you|your number|address)\b/,
  project: /\b(discuss|start a conversation|start a project|new project|my project|a project|work with you|hire you|engage|proposal|quote|consultation|book|schedule|demo|call)\b/,
  assessment: /\b(assessment|baseline|audit)\b/,
  discovery: /\b(which (solution|service|one)|what (solution|service) (fits|is right|should)|fits? my business|right for (me|us|my business)|help (me )?(choose|chose|decide|pick|find)|choosing|recommend\w*|suggest\w*|not sure (where|what|which)|where (do i|to|should i) (start|begin)|what should i)\b/,
  services: /\b(services|solutions|offerings|what do you (do|offer)|what (can|could) you (do|help)|what you do|capabilities|explore|how (can|could) you help|help my business)\b/,
  company: /\b(what do you (guys|all|folks|people) do|about (you|tls|the company|true lean)|who (are|is) (you guys|tls|true lean)|your company|the company|what is (tls|true lean)|what does (tls|true lean)( solutions)? do|true lean solutions|tls do)\b/,
  approach: /\b(your approach|approach|how do you work|how you work|how we work|methodology|way you work|lean thinking|why (tls|true lean|you|choose you|work with you))\b/,
  story: /\b(founded|founder|history|your story|began|how did .* start|when did .* start|origin|who owns|owner|ceo|president)\b/,
  team: /\b(team|who works|people behind|leadership|leaders|employees|staff)\b/,
  clients: /\b(clients|customers|who have you worked|worked with|who (do|does) (you|tls|true lean)( guys)? work (with|for)|references|portfolio|testimonials|reviews)\b/,
  insights: /\b(insights?|blog|articles?|posts?|read|resources?|guides?|case stud(y|ies)|news)\b/,
  location: /\b(where are you|located|location|office|offices|based|headquarter\w*)\b/,
  generalPricing: /\b(your (price|prices|pricing|rate|rates|fee|fees)|do you charge|how do you (charge|price)|what do you charge|(tls|true lean)( solutions)? (charge|cost|price)\w*)\b/,
  pricing: /\b(price|prices|pricing|cost|costs|how much|fee|fees|rate|rates|budget|charge|expensive|cheap|afford|per month|per year|subscription)\b/,
  process: /\b(how (does|do|would|will) [a-z ]*\b(work|works|run|runs|go|goes)|how it works|process|steps|stages|get started|getting started|onboard\w*|timeline|what happens|preserved|preserve)\b/,
  details: /\b(include|includes|included|features?|what (does|do) (it|the service|you) (do|offer|include|build)|what (kind|kinds|type|types) of|what do you (build|place)|roles|deliverables|tell me more|more (details|info|information)|in detail|capabilit)/,
  audience: /\b(who (is it|is this|it is|it is) for|who should|right for|good fit|a fit|suitable|do i need|signs|when (do|should) (i|we))\b/,
  control: /\b(secur\w*|privacy|private|data control|controlled|control (my|our|the) data|on.?prem\w*|deploy\w*|where .* data|data (stay|live|stored)|safe|confidential|ownership|lock-?in|used to train|train\w* (on|the|ai|models?|llms?))\b/,
  /** "Tell me more", or yes to the last answer: more on the current topic. */
  more: /^(more|tell me more|go on|continue|details|more details|explain( more| please| that)?|elaborate|yes|yes please|sure|please do|please|and|what else)$/,
  /** Certifications and compliance: nothing published, so never asserted. */
  certification: /\b(iso ?\d*|soc ?2|soc2|hipaa|gdpr|pci|fedramp|certif\w*|accredit\w*|complian\w*)\b/,
  guarantee: /\b(guarantee\w*|promise\w*|ensure (we|that we|our)|rank (first|1st|number one|on top|at the top)|be (first|number one|the top result))\b/,
  howMany: /\bhow many (employees|people|staff|developers|engineers|clients|customers|projects|years)\b/,
  /** What sets TLS apart (answered from the published values). */
  why: /\b(what makes (you|tls|true lean)( guys)? (different|unique|special|better)|why (should (i|we) )?(choose|pick|go with|hire|use|work with|trust) (you|tls|true lean)|why (tls|true lean)|differentiat\w*|set (you|tls) apart|stand out)\b/,
  /** Who TLS works with, by size (published positioning only). */
  size: /\b(small|smaller|mid-?sized?|medium(-sized)?|growing|smb|smbs|small and mid-?sized?) (business|businesses|companies|company|firms|teams|organizations|orgs)\b/,
  /** Asking Tali to do something it can't do from a chat window. */
  act: /\b(can|could|will|would) (you|tali) (please )?(book|schedule|set up|arrange|send|email|text|call|submit|sign (me|us) up|add (me|us)|register|reserve|create (an? )?(account|ticket))\b/,
  /** How Tali is built. */
  build: /\b((what|which) (model|llm|ai|engine)( are you| do you use| powers you| is (this|behind (this|you))| runs you)|who (made|built|created|programmed|trained) you|how (were|are) you (built|made|trained|programmed))\b/,
  offtopic:
    /\b(weather|forecast|joke|recipe|cook|movie|song|music|sports?|football|soccer|cricket|nba|nfl|world cup|who won|score|stock price|bitcoin|crypto|politic\w*|election|translate|poem|essay|homework|math|capital of|girlfriend|boyfriend|date me|meaning of life|horoscope|lottery|celebrity)\b/,
  define: /^(what is|what are|what does .+ mean|whats|define|definition of|meaning of|explain|can you explain|could you explain|tell me what .+ is|what do you mean by|what is meant by|eli5)\b/,
  compare: /\b(difference|differences|differ|vs|versus|compare|comparison|compared to|better than|or should i|which is better)\b/,
  question: /^(what|how|why|who|when|where|which|can|could|would|will|is|are|do|does|did|should|may|tell me|explain|show me|any)\b/,
  tlsDirected:
    /\b(tls|true lean|your|you guys|you all|y all|do you|are you|can you (help|do|build|make|connect|integrate|automate|handle|support|work|offer|provide|fix|create|develop|set up|implement)|(does|can|could|will|would) (tls|true lean)|do (tls|true lean))\b/,
  refers: /\b(that|this|it|those|them|these|something like (this|that))\b/,
  firstPerson: /\b(i|we|my|our|us|me|team|staff)\b/,
  /** Business/tech words: an unmatched question with these is about TLS, not off-topic. */
  domain:
    /\b(project|software|system|process|data|tool|app|application|website|code|source code|ip|intellectual property|nda|trial|free trial|pilot|discount|automat\w*|integrat\w*|ai|business|team|hire|hiring|developer|service|solution|cost|price|timeline|deadline|security|cloud|crm|erp|api|meeting|report\w*|contract|support|maintenance|onboarding|warranty)\b/,
};

/* A whole message that is only social. Checked on the full cleaned text. */
const SOCIAL: [Social, RegExp][] = [
  ['bye', /^((ok|okay|thanks|thank you|cool|great|alright) )*(bye|bye bye|goodbye|see you|see ya|talk later|later|that is all|i am done|nothing else|no thanks|have to go|good night|take care|be right back)( tali| then| for now| now| again)?( thanks| thank you)?$/],
  ['thanks', /^((ok|okay|great|cool|perfect|awesome|nice|alright|got it|yes) )*(thanks|thank you|thank you so much|thank you very much|thanks so much|thanks a lot|many thanks|cheers|appreciate it|i appreciate it|much appreciated|perfect)( tali| again| a lot| so much| for the help| for your help| for that)?( that is| that was| very| really)*( helpful| great| perfect| useful)?$/],
  ['thanks', /^(that is|that was|very|really|super|so) (helpful|useful|great|perfect)( thanks| thank you)?$/],
  ['greeting', /^(hi+|hey+|hello+|hiya|howdy|yo|good (morning|afternoon|evening|day)|greetings|hi there|hey there|hello there)( there)?( tali)?$/],
  ['howAreYou', /^((hi|hey|hello) )?(tali )?(how are you( doing)?|how is it going|how are things|what is up|how do you do|how have you been|you good|how is your day)( tali| today)?$/],
  ['whatDoing', /^what are you (doing|up to)( now| today| tali)?$/],
  ['present', /^((hi|hey|hello) )?(is )?(anyone|anybody|someone|are you|you|tali)( still)? (there|here|around|awake|online)$/],
  ['identity', /^(who are you|what are you|what is tali|who is tali|what is your name|your name|tell me about (yourself|tali)|introduce yourself)( tali)?$/],
  ['isBot', /^(are you|is this|am i (talking|chatting) (to|with)) (an? )?(ai|bot|robot|chatbot|chat bot|machine|chatgpt|gpt|ai assistant|automated|real ai)( assistant)?$/],
  ['isHuman', /^(are you|is this|am i (talking|chatting) (to|with)) (an? )?(human|real person|person|real|real human|live person)$/],
  ['capabilities', /^(what can you do|what can you help (me )?with|how can you help( me)?|what can i ask( you)?|what are you able to do|what are you for|what do you know|help|what can you do for me|how do you work tali)$/],
  ['ack', /^(ok|okay|alright|all right|got it|understood|i see|makes sense|sounds good|fine|noted|right|ok cool|okay cool|cool cool|ok got it|okay got it|ok sure|okay sure|no|no worries|all good|hmm+)$/],
  ['positive', /^(nice|cool|great|awesome|amazing|love it|lovely|sweet|neat|wow|excellent|good|very good|very nice|smile|that is (cool|great|awesome|nice|amazing)|nice one|good to know|interesting)( thanks| tali)?$/],
  ['laugh', /^(haha+|ha ha|lol|lmao|hehe+|rofl|smile haha|haha smile)$/],
];

const LEAD_GREET = /^(hi+|hey+|hello+|hiya|howdy|yo|good (morning|afternoon|evening)|greetings)( there)?( tali)?\b ?/;
const LEAD_SWITCH = /^(actually|wait|hmm+|never ?mind|forget (it|that|about (it|that))|scratch that|on second thought|instead|change of plans?|no|ok(ay)? so|so)\b ?/;
const LEAD_ACK = /^(ok|okay|alright|cool|great|nice|got it|perfect|thanks|thank you|right)\b ?/;

export interface Understanding {
  /** The cleaned message. */
  text: string;
  /** The message without a leading greeting, acknowledgement or "actually". */
  rest: string;
  /** A greeting to echo ("Hiii", "Good morning") when one led the message. */
  greet?: string;
  /** The visitor changed the subject ("actually", "forget that"). */
  switched: boolean;
  social?: Social;
  entities: { e: Entity; score: number }[];
  concepts: Concept[];
  facet: Facet | null;
  define: boolean;
  compare: boolean;
  question: boolean;
  tlsDirected: boolean;
  refers: boolean;
  firstPerson: boolean;
  injection: boolean;
  offtopic: boolean;
}

export function detectEntities(t: string): { e: Entity; score: number }[] {
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

export function facetOf(t: string): Facet | null {
  if (RX.pricing.test(t)) return 'pricing';
  if (RX.control.test(t)) return 'control';
  if (RX.audience.test(t)) return 'audience';
  if (RX.details.test(t)) return 'details';
  if (RX.process.test(t)) return 'process';
  return null;
}

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function understand(raw: string): Understanding {
  const text = clean(raw);
  const social = SOCIAL.find(([, re]) => re.test(text))?.[0];

  // Peel off what leads the message: "hey, …", "actually …", "ok, …".
  let rest = text;
  let greet: string | undefined;
  let switched = false;
  for (let i = 0; i < 4 && !social; i++) {
    const g = rest.match(LEAD_GREET);
    const s = rest.match(LEAD_SWITCH);
    const a = rest.match(LEAD_ACK);
    const m = g ?? s ?? a;
    if (!m || m[0].length >= rest.length) break;
    if (g) greet ??= titleCase(g[0].trim().replace(/ tali$/, ''));
    if (s) switched = true;
    rest = rest.slice(m[0].length).trim();
  }

  const entities = detectEntities(rest);
  return {
    text,
    rest,
    greet,
    switched,
    social,
    entities,
    concepts: detectConcepts(rest, entities),
    facet: facetOf(rest),
    define: RX.define.test(rest),
    compare: RX.compare.test(rest),
    question: RX.question.test(rest) || /\?\s*$/.test(raw),
    tlsDirected: RX.tlsDirected.test(rest),
    refers: RX.refers.test(rest),
    firstPerson: RX.firstPerson.test(rest),
    injection: RX.injection.test(text),
    offtopic: RX.offtopic.test(rest),
  };
}

export { words };
