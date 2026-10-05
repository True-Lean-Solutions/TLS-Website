/**
 * Tali's general knowledge: short, neutral explanations of the business and
 * technology ideas visitors ask about ("what is an API?"), so a definition
 * never has to go through TLS's knowledge base. These are general facts, not
 * claims about TLS. Where TLS has a solution for the idea, `entity` names it,
 * and Tali can bridge to it ("does TLS do that?") from knowledge.ts.
 *
 * Questions outside this list go to the optional general-AI provider when one
 * is configured (provider.ts); otherwise Tali explains what it covers.
 */
import type { Entity } from './knowledge';
import { norm, wordIn } from './language';

export interface Concept {
  id: string;
  name: string;
  aliases: string[];
  def: string;
  /** The TLS solution that works on this, if any (knowledge.ts id). */
  entity?: string;
  /** For ideas TLS answers at company level rather than with a solution. */
  company?: 'approach';
}

export const CONCEPTS: Concept[] = [
  {
    id: 'ai',
    name: 'Artificial intelligence',
    aliases: ['ai', 'artificial intelligence', 'a.i'],
    def: 'Artificial intelligence (AI) is software that does tasks that normally need human judgment — understanding language, spotting patterns, making predictions, or generating content. Most business AI today runs on machine-learning models trained on large amounts of data.',
    entity: 'ai',
  },
  {
    id: 'ml',
    name: 'Machine learning',
    aliases: ['machine learning', 'ml'],
    def: 'Machine learning is a branch of AI where software learns patterns from data instead of following hand-written rules, then uses those patterns to make predictions or decisions.',
    entity: 'ai',
  },
  {
    id: 'llm',
    name: 'Large language models',
    aliases: ['llm', 'llms', 'large language model', 'large language models', 'language model', 'gpt'],
    def: 'A large language model (LLM) is an AI model trained on large amounts of text so it can understand and generate language. Assistants like ChatGPT, Gemini and Claude are built on LLMs.',
    entity: 'ai',
  },
  {
    id: 'genai',
    name: 'Generative AI',
    aliases: ['generative ai', 'gen ai', 'genai'],
    def: 'Generative AI is AI that creates new content — text, images, code or audio — from patterns it learned during training.',
    entity: 'ai',
  },
  {
    id: 'agents',
    name: 'AI agents',
    aliases: ['ai agent', 'ai agents', 'agentic ai', 'autonomous agents'],
    def: 'An AI agent is AI that can take actions toward a goal — using tools, data and systems to complete steps of a task, not just answer a question.',
    entity: 'ai',
  },
  {
    id: 'chatbot',
    name: 'Chatbots',
    aliases: ['chatbot', 'chatbots', 'chat bot', 'virtual assistant'],
    def: 'A chatbot is software that holds a conversation through text or voice — answering questions, guiding people to what they need, or handing them to a person.',
    entity: 'ai',
  },
  {
    id: 'automation',
    name: 'Automation',
    aliases: ['automation', 'business automation', 'process automation', 'business process automation'],
    def: 'Automation means using technology to do repetitive tasks people would otherwise do by hand — moving data, sending notifications, routing approvals, and so on.',
    entity: 'workflow',
  },
  {
    id: 'workflow',
    name: 'Workflow automation',
    aliases: ['workflow automation', 'automated workflows', 'workflow'],
    def: 'Workflow automation means using software to reduce or eliminate repetitive manual steps in a process, so work moves from one step to the next without someone pushing it along.',
    entity: 'workflow',
  },
  {
    id: 'rpa',
    name: 'Robotic process automation',
    aliases: ['rpa', 'robotic process automation'],
    def: "Robotic process automation (RPA) uses software 'bots' to repeat the clicks and keystrokes a person would make in an application — useful when a system has no API to connect to.",
    entity: 'workflow',
  },
  {
    id: 'api',
    name: 'APIs',
    aliases: ['api', 'apis', 'application programming interface'],
    def: 'An API (application programming interface) is a defined way for one piece of software to ask another for data or actions. APIs are how most modern systems connect to each other.',
    entity: 'integration',
  },
  {
    id: 'integration',
    name: 'System integration',
    aliases: ['system integration', 'systems integration', 'integration', 'software integration'],
    def: 'System integration connects separate software systems so they can exchange information and work together — a CRM sharing customer data with an accounting tool, for example — instead of people moving it by hand.',
    entity: 'integration',
  },
  {
    id: 'middleware',
    name: 'Middleware',
    aliases: ['middleware', 'ipaas'],
    def: 'Middleware is software that sits between other systems and passes data between them, often with rules for transforming or routing it. Zapier and Make are common examples.',
    entity: 'integration',
  },
  {
    id: 'custom',
    name: 'Custom software',
    aliases: ['custom software', 'bespoke software', 'custom development', 'custom software development'],
    def: "Custom software is built for one organization's own workflows and needs, rather than an off-the-shelf product designed for many customers.",
    entity: 'software',
  },
  {
    id: 'saas',
    name: 'SaaS',
    aliases: ['saas', 'software as a service'],
    def: 'SaaS (software as a service) is software you use over the internet on a subscription, rather than installing and running it yourself.',
    entity: 'software',
  },
  {
    id: 'legacy',
    name: 'Legacy systems',
    aliases: ['legacy system', 'legacy systems', 'legacy software', 'legacy modernization', 'modernization'],
    def: 'A legacy system is older software a business still depends on but that has become hard to maintain, change or connect to newer tools. Modernizing it usually means moving to a newer platform in phases.',
    entity: 'software',
  },
  {
    id: 'cloud',
    name: 'Cloud computing',
    aliases: ['cloud', 'cloud computing', 'the cloud', 'cloud native', 'cloud-native'],
    def: 'Cloud computing means running software and storing data on infrastructure provided over the internet, instead of on your own servers.',
    entity: 'software',
  },
  {
    id: 'mvp',
    name: 'MVP',
    aliases: ['mvp', 'minimum viable product'],
    def: 'An MVP (minimum viable product) is the smallest version of a product that delivers real value — built to learn from real users before investing further.',
    entity: 'software',
  },
  {
    id: 'crm',
    name: 'CRM',
    aliases: ['crm', 'customer relationship management'],
    def: 'A CRM (customer relationship management) system keeps customers, contacts, deals and interactions in one place. Salesforce and HubSpot are common examples.',
    entity: 'integration',
  },
  {
    id: 'erp',
    name: 'ERP',
    aliases: ['erp', 'enterprise resource planning'],
    def: 'An ERP (enterprise resource planning) system runs core operations — finance, inventory, purchasing, HR — on one shared platform.',
    entity: 'integration',
  },
  {
    id: 'cyber',
    name: 'Cybersecurity',
    aliases: ['cybersecurity', 'cyber security', 'information security', 'infosec'],
    def: 'Cybersecurity is protecting systems, networks and data from attacks, unauthorized access and damage — through technology, processes and people.',
    entity: 'security',
  },
  {
    id: 'analytics',
    name: 'Data analytics',
    aliases: ['data analytics', 'analytics', 'business intelligence', 'bi', 'data analysis'],
    def: 'Data analytics is examining data to find patterns and answer questions, so decisions rest on evidence. Business intelligence (BI) tools turn that into dashboards and reports.',
    entity: 'data',
  },
  {
    id: 'visibility',
    name: 'AI visibility',
    aliases: ['ai visibility', 'ai search visibility', 'ai search optimization', 'aio', 'generative engine optimization', 'geo', 'ai search'],
    def: "AI visibility is how well your brand can be understood and surfaced by AI-driven discovery — ChatGPT, Google's AI results, Gemini, Perplexity and similar tools. Improving it is similar to SEO, but aimed at how AI systems find, interpret and cite information.",
    entity: 'visibility',
  },
  {
    id: 'seo',
    name: 'SEO',
    aliases: ['seo', 'search engine optimization'],
    def: 'SEO (search engine optimization) is improving your website and content so it ranks better in traditional search results such as Google.',
    entity: 'visibility',
  },
  {
    id: 'staffaug',
    name: 'Staff augmentation',
    aliases: ['staff augmentation', 'staff aug', 'team augmentation'],
    def: 'Staff augmentation means adding outside technical people to your team for a period of time, to fill a skill gap or add capacity, while you keep directing the work.',
    entity: 'talent',
  },
  {
    id: 'c2h',
    name: 'Contract-to-hire',
    aliases: ['contract-to-hire', 'contract to hire'],
    def: "Contract-to-hire means someone starts on a contract and can move into a permanent role if it's a good fit for both sides.",
    entity: 'talent',
  },
  {
    id: 'transformation',
    name: 'Digital transformation',
    aliases: ['digital transformation', 'technology strategy', 'it strategy'],
    def: 'Digital transformation is using technology to change how a business operates and serves customers — not just digitizing existing steps, but rethinking them.',
    entity: 'strategy',
  },
  {
    id: 'lean',
    name: 'Lean thinking',
    aliases: ['lean', 'lean thinking', 'lean methodology', 'lean management'],
    def: 'Lean thinking is an approach to improving work by focusing on what creates value for the customer and steadily removing waste — waiting, rework, handoffs and unnecessary steps.',
    company: 'approach',
  },
];

export const conceptById = (id?: string) => CONCEPTS.find((c) => c.id === id);

/**
 * Concepts named in the text. A concept is dropped when a longer name that
 * contains it also matched ("enterprise ai" is the TLS product, not "ai").
 */
export function detectConcepts(t: string, entities: { e: Entity }[]): Concept[] {
  // The company's own name is never the concept ("true lean" is not "lean").
  const entityNames = [...entities.flatMap(({ e }) => [e.name, ...e.aliases].map(norm)), 'true lean solutions', 'true lean'].filter(
    (a) => a && wordIn(t, a)
  );
  const hits: { c: Concept; alias: string }[] = [];
  for (const c of CONCEPTS) {
    const alias = c.aliases.map(norm).filter((a) => wordIn(t, a)).sort((a, b) => b.length - a.length)[0];
    if (alias) hits.push({ c, alias });
  }
  const longer = (a: string) => [...entityNames, ...hits.map((h) => h.alias)].some((b) => b.length > a.length && wordIn(b, a));
  return hits
    .filter((h) => !longer(h.alias))
    .sort((a, b) => t.indexOf(a.alias) - t.indexOf(b.alias))
    .map((h) => h.c);
}
