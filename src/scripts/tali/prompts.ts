/**
 * Tali's proactive prompts: every timing, every line of bubble copy and every
 * page's quick suggestions, in one place (Hemang, 2026-10-03). ui.ts reads
 * this; the engine answers whatever a suggestion asks, exactly as if it had
 * been typed (each suggestion here is covered by the engine's tests).
 *
 * Two prompts per page load:
 *   welcome ...... `welcomeDelay` after load; hides after `welcomeDuration`
 *   scroll ....... once the visitor has scrolled `scrollThreshold` of the page
 *                  and stopped for `settle`, then `scrollDelay`; hides after
 *                  `scrollDuration`. Once per page load.
 * Never both at once, never over the open chat, never while the visitor is
 * typing in a field or has a menu open.
 */

export const PROMPT_TIMING = {
  welcomeDelay: 1500,
  welcomeDuration: 10000,
  scrollThreshold: 0.35,
  /** Wait for scrolling to stop for this long before counting down. */
  settle: 700,
  scrollDelay: 1200,
  scrollDuration: 7000,
  /** If something else is going on (a field focused, a menu open), retry. */
  retryEvery: 2000,
  maxRetries: 5,
} as const;

export const WELCOME_TITLE = 'Hi! 👋';
export const SCROLL_TITLE = 'Need any quick answers?';

export interface PagePrompts {
  /** Path prefix (after the deploy base). '/' matches only the home page. */
  match: string;
  welcome: string;
  welcomeChips: string[];
  scrollChips: string[];
}

const ask = 'Talk to our team';

/** Most specific first; the last entry is the fallback for any other page. */
export const PAGE_PROMPTS: PagePrompts[] = [
  {
    match: '/services/meeting-intelligence/',
    welcome: 'Want to know how Meeting Intelligence works?',
    welcomeChips: ['See key features', 'Ask about security', 'Get started'],
    scrollChips: ['How does Meeting Intelligence work?', 'How much does it cost?', 'Can I request a demo?'],
  },
  {
    match: '/services/ai-visibility-growth-team/',
    welcome: 'Want to improve how your brand appears in AI search?',
    welcomeChips: ['How does it work?', "What's included?", 'Get a baseline'],
    scrollChips: ['What is AI search visibility?', 'How much does it cost?', 'Get a baseline'],
  },
  {
    match: '/services/enterprise-ai/',
    welcome: 'Exploring AI for your business?',
    welcomeChips: ['Tell me about Meeting Intelligence', 'How is my data kept private?', 'Can I book a demo?'],
    scrollChips: ['Who is it for?', 'Tell me about AI Visibility Growth Team', 'Can I book a demo?'],
  },
  {
    match: '/services/workflow-automation/',
    welcome: 'Have a process that should run itself?',
    welcomeChips: ['What processes can be automated?', 'Can automation work with my existing tools?', ask],
    scrollChips: ['Which solution is right for me?', 'How can I get started?', ask],
  },
  {
    match: '/services/software/',
    welcome: 'Thinking about building something custom?',
    welcomeChips: ['What kind of software do you build?', 'How does a software project run?', ask],
    scrollChips: ['Can you modernize a legacy system?', 'How can I get started?', ask],
  },
  {
    match: '/services/integrations/',
    welcome: 'Want your tools to work together?',
    welcomeChips: ['Can you connect my existing tools?', 'How does an integration project run?', ask],
    scrollChips: ['Which solution is right for me?', 'How can I get started?', ask],
  },
  {
    match: '/services/technical-talent/',
    welcome: 'Looking for the right technical person?',
    welcomeChips: ['What roles do you place?', 'How does the hiring process work?', ask],
    scrollChips: ['Do you offer contract-to-hire?', 'How can I get started?', ask],
  },
  {
    match: '/services/',
    welcome: 'Looking for a solution to a specific challenge?',
    welcomeChips: ['Workflow automation', 'Custom software', ask],
    scrollChips: ['Which solution is right for me?', 'How does your process work?', 'How can I get started?'],
  },
  {
    match: '/about-us/',
    welcome: 'Want to learn more about our approach?',
    welcomeChips: ['How we work', 'Meet our team'],
    scrollChips: ['How did True Lean Solutions start?', 'Which solution is right for me?', ask],
  },
  {
    match: '/contact/',
    welcome: 'Ready to discuss your project?',
    welcomeChips: ['Start a conversation', 'What should I prepare?'],
    scrollChips: ['What should I prepare?', 'Which solution is right for me?', ask],
  },
  {
    match: '/insights/',
    welcome: 'Looking for something specific?',
    welcomeChips: ['Show me recent insights', 'Do you have case studies?', ask],
    scrollChips: ['Which solution is right for me?', 'How can I get started?', ask],
  },
  {
    match: '/',
    welcome: 'How can I help you today?',
    welcomeChips: ['Explore our solutions', 'What does TLS do?', ask],
    scrollChips: ['Which solution is right for me?', 'How does your process work?', 'How can I get started?'],
  },
];

export function promptsFor(path: string): PagePrompts {
  const p = path || '/';
  if (p === '/') return PAGE_PROMPTS[PAGE_PROMPTS.length - 1];
  return PAGE_PROMPTS.find((x) => x.match !== '/' && p.startsWith(x.match)) ?? { ...PAGE_PROMPTS[PAGE_PROMPTS.length - 1], match: p };
}
