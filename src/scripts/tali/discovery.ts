/**
 * Business-problem discovery. When a visitor describes a problem ("my team
 * spends hours copying data between systems"), Tali doesn't jump to a sales
 * pitch: it reflects the problem back, asks one useful question, and only
 * then recommends where to look.
 *
 *   understand → clarify (one question) → recommend → next step (on request)
 *
 * The recommendation names TLS solutions from knowledge.ts and links to their
 * pages; Contact is offered when the visitor asks about cost or a person.
 */
import { has } from './language';

export type ProblemId =
  | 'automate'
  | 'manual'
  | 'dataEntry'
  | 'approvals'
  | 'disconnected'
  | 'reporting'
  | 'requests'
  | 'meetings'
  | 'legacy'
  | 'aiSearch'
  | 'open';

export interface Problem {
  id: ProblemId;
  detect: RegExp;
  /** The one question Tali asks (`t` is the visitor's message). */
  ask: (t: string) => { text: string; chips: string[] };
  /** Where to look, in order (knowledge.ts ids). */
  recommend: string[];
  /** Why those fit, in general terms (no claims about TLS). */
  why: string;
}

const EMAIL = /\b(e-?mails?|inbox|outlook|gmail)\b/;
const SHEET = /\b(spreadsheets?|excel|sheets?|google sheets?)\b/;

/* Most specific first. `automate` and `open` are the general fallbacks. */
export const PROBLEMS: Problem[] = [
  {
    id: 'dataEntry',
    detect: /\b(copy\w*|copied|paste|re-?enter\w*|re-?typ\w*|rekey\w*|retyp\w*|data entry|manual entry|manually (enter|input|type|update|move|copy)\w*|(moving|move|transfer\w*) (data|information|records|details|orders)|double entry|enter(ing)? the same)\b/,
    ask: (t) =>
      has(t, EMAIL) && has(t, SHEET)
        ? {
            text: "That sounds like a repetitive data-entry workflow. There may be an opportunity to automate the transfer from email into your spreadsheet or business system. What happens after the information reaches the spreadsheet?",
            chips: ['It feeds a report', 'Someone reviews and approves it', 'It goes into another system', 'Not sure'],
          }
        : {
            text: 'That sounds like a repetitive data-entry workflow — the kind of work that can often be automated. Where does the information start, and where does it need to end up?',
            chips: ['Email to a spreadsheet', 'Forms to a CRM', 'Between two business systems', 'Something else'],
          },
    recommend: ['workflow', 'integration'],
    why: 'Moving information by hand is usually solved by automating the transfer, or by connecting the systems directly so no one has to rekey it.',
  },
  {
    id: 'approvals',
    detect: /\b(approv\w*|sign-?offs?|sign off)\b/,
    ask: () => ({
      text: 'I can help you think through that. What kind of approvals are involved?',
      chips: ['Purchase approvals', 'Customer approvals', 'Internal requests', 'Something else'],
    }),
    recommend: ['workflow', 'integration'],
    why: 'Approvals that run on email, reminders and spreadsheets are a common place to redesign and automate the workflow — so requests route themselves and nothing waits in an inbox.',
  },
  {
    id: 'disconnected',
    detect: /\b((do not|does not|cannot|never|will not) (talk|connect|sync|integrate|work together|communicate)|disconnected|not connected|siloed|silos|out of sync|not in sync)\b/,
    ask: () => ({
      text: "That's a common one — when tools don't talk to each other, someone ends up moving information between them by hand. Which systems are involved?",
      chips: ['A CRM', 'Accounting or finance', 'Spreadsheets', 'Something else'],
    }),
    recommend: ['integration', 'workflow'],
    why: 'Connecting the systems you already run means information moves between them without anyone rekeying it.',
  },
  {
    id: 'reporting',
    detect: /\b(reports?|reporting|dashboards?|kpis?|metrics)\b.*\b(manual\w*|hours|takes|days|build|compile|pull|put together|by hand|every (week|month))\b|\b(manual\w*|hours|takes|build|compile|pull)\b.*\b(reports?|reporting|dashboards?)\b/,
    ask: () => ({
      text: 'Reporting that eats hours is usually a sign the data lives in too many places. Where does the data for those reports come from today?',
      chips: ['Spreadsheets', 'Several different systems', 'A CRM or ERP', 'Not sure'],
    }),
    recommend: ['data', 'integration'],
    why: 'When reports are assembled by hand from several places, the fix is usually connecting the data sources and building the reporting on top of them.',
  },
  {
    id: 'requests',
    detect: /\b(customers?|clients?) (requests?|inquir\w*|enquir\w*|emails?|tickets?|orders?|questions?|onboarding)\b|\b(requests?|tickets?|inquir\w*) (from|by) (customers?|clients?)\b/,
    ask: () => ({
      text: 'Got it. Are those requests currently coming through email, a form, a CRM, or somewhere else?',
      chips: ['Email', 'A web form', 'A CRM', 'Somewhere else'],
    }),
    recommend: ['workflow', 'integration'],
    why: 'Requests that arrive in one place and get handled by hand can usually be routed, tracked and followed up automatically, connected to the tools you already use.',
  },
  {
    id: 'meetings',
    detect: /\b(meetings?)\b.*\b(lost|forget\w*|scattered|nobody remembers|no one remembers|lose track|disappear\w*|notes)\b|\blose track of (decisions|action items|what was decided)\b/,
    ask: () => ({
      text: 'So decisions and action items get lost after meetings. Which platform does your team meet on?',
      chips: ['Microsoft Teams', 'Zoom', 'Google Meet', 'A mix'],
    }),
    recommend: ['meeting'],
    why: 'Meeting Intelligence captures, transcribes and organizes meetings, so decisions, commitments and action items stay searchable instead of disappearing.',
  },
  {
    id: 'legacy',
    detect: /\b(old|legacy|outdated|ancient|aging|slow|clunky) (system|software|app|application|platform|tool|database|erp|crm)s?\b/,
    ask: () => ({
      text: "Older systems often become the thing holding everything else back. What's the biggest problem with it today?",
      chips: ["It's slow or unreliable", "It's hard to change", "It doesn't connect to our other tools", 'Not sure'],
    }),
    recommend: ['software', 'integration'],
    why: 'An aging system is usually either modernized in phases, or connected to newer tools so it stops holding the business back.',
  },
  {
    id: 'aiSearch',
    detect: /\b(chatgpt|perplexity|gemini|ai search|ai|google)\b.*\b(does not|do not|never|will not|cannot|not) (mention|recommend|show|cite|find|know about|list)\w*|\bnot (showing up|visible|appearing) (in|on) (ai|chatgpt|google)/,
    ask: () => ({
      text: "That's increasingly important as customers ask AI before they visit a website. Where would you most like to show up?",
      chips: ['ChatGPT', "Google's AI results", 'Across AI platforms', 'Not sure'],
    }),
    recommend: ['visibility'],
    why: 'Being understood and cited by AI-driven discovery platforms is what the AI Visibility Growth Team works on.',
  },
  {
    id: 'manual',
    detect: /\b(is|are) (all |completely |mostly |still |very |entirely )?(manual|done by hand|done manually|paper-?based|on paper)\b|\bby hand\b|\bmanual (process|processes|work|steps?|tasks?|workflows?)\b/,
    ask: () => ({
      text: "That's usually a good candidate for automation. Which part takes the most time today?",
      chips: ['Data entry', 'Approvals', 'Reporting', 'Something else'],
    }),
    recommend: ['workflow', 'integration'],
    why: 'A manual process is usually redesigned first, then automated step by step, with the tools around it connected so information flows on its own.',
  },
  {
    id: 'automate',
    detect: /\b(i|we) (need|want|would like|have|are trying|am trying|are looking|am looking|would love) to (automate|streamline)\b|\bautomate (something|stuff|things|a process|a workflow|our|my|some)\b|\bhelp (me |us )?automat\w*/,
    ask: () => ({
      text: 'Sure. What kind of process are you trying to automate?',
      chips: ['Data entry', 'Approvals', 'Reporting', 'Something else'],
    }),
    recommend: ['workflow', 'integration'],
    why: 'Most automation starts with one repetitive process: redesign it, automate the manual steps, and connect the tools around it.',
  },
  {
    id: 'open',
    detect: /\b(i|we) (have|got|am having|are having|face|am facing|are facing) (a |an |some )?(problem|issue|challenge|question|situation)s?\b|\b(having|have) (trouble|issues|problems|difficulty)\b|\bstruggling\b|\bneed (some )?help\b|\bi have a problem\b/,
    ask: () => ({
      text: "Sure — what's going on? Tell me a bit about it, or pick what's closest:",
      chips: [],
    }),
    recommend: ['strategy'],
    why: "When the problem isn't clear yet, the first step is working out what the business actually needs.",
  },
];

export const problemById = (id?: string) => PROBLEMS.find((p) => p.id === id);

/**
 * The problem a message describes. `inFlow` relaxes the first-person rule
 * when the visitor is answering Tali's question ("something with customer
 * requests").
 */
export function problemOf(t: string, firstPerson: boolean, inFlow = false): Problem | undefined {
  if (!firstPerson && !inFlow) return undefined;
  return PROBLEMS.find((p) => p.detect.test(t));
}
