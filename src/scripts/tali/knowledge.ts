/**
 * Tali's knowledge: what Tali may say, and nothing else. Every line here is
 * approved copy already published on the site (the page named in `url`),
 * lightly trimmed for chat. Tali never generates claims; it selects from this
 * file and links to the source page. To change an answer, change the page
 * copy first, then mirror it here.
 *
 * Sources (by page): Home (1zAjHl6Vc7BeO-ApXSVLrsyMmJ5TxOMqRXTaPWgfHAwE),
 * About Us (17QpMfSbas3gC4XwfamL8SgRRytEN6Sj6UGkkwsEunKg), the four solution
 * docs (Enterprise AI, Custom Software, System Integration, Technical Talent;
 * see docs/sources.md §1), src/data/services.ts (the four further solutions),
 * Enterprise AI › Featured AI Solutions (pricing as published on the cards),
 * the Meeting Intelligence and AI Visibility Growth Team pages (Hemang,
 * 2026-10-02), src/data/site.ts (contact details), src/data/clients.ts,
 * src/data/team.ts. Insights posts come from the content collection at build
 * time (src/pages/tali/insights.json.ts).
 */

export interface Link {
  label: string;
  href: string;
  external?: boolean;
}

/** A thing a visitor can ask about: a solution, a product, the company. */
export interface Entity {
  id: string;
  name: string;
  /** Words and phrases that name it (matched with typo tolerance). */
  aliases: string[];
  url: string;
  overview: string;
  /** "What's included", capabilities, what we build. */
  details?: { lead?: string; points: string[] };
  /** How it works / how an engagement runs. */
  process?: { lead?: string; points: string[] };
  /** Who it's for. */
  audience?: { lead?: string; points: string[] };
  /** Published pricing only. */
  pricing?: string;
  /** Security, deployment, data control. */
  control?: string;
  /** Primary CTA for this entity. */
  cta?: Link;
  /** Follow-up questions Tali can answer about it. */
  follow?: string[];
}

export const CONTACT = {
  page: { label: 'Discuss Your Project', href: '/contact/' },
  booking: { label: 'Book a free 30-minute call', href: 'https://calendar.app.google/4V1G48o4zR2NRFSA9', external: true },
  email: 'success@trueleansolutions.com',
  phone: '(848) 777-5326',
} as const;

export const COMPANY = {
  positioning: 'We help organizations turn business needs into practical technology solutions.',
  headline: 'Solve the Right Problem. Build the Right Solution.',
  short: 'Others build what you ask for, we build what you actually need.',
  values: [
    'Built for growing businesses: everything we do is scoped and priced for the constraints you work under.',
    "Practical over theoretical: we don't deliver slide decks; we deliver working systems, documented processes, and measurable improvements.",
    'The right problem first: we work to understand what the business actually needs, challenge assumptions when necessary, and then determine the right solution.',
    "We stay after go-live: we stay engaged to ensure adoption, refine what we've built, and support your growth.",
  ],
  approach: [
    'Understanding: how your business actually runs — processes, tools, team, and goals.',
    'Identifying: where time and money are being lost — inefficient processes, disconnected systems, manual tasks, talent gaps.',
    'Designing: a plan tailored to your size, budget, and current infrastructure.',
    'Implementing & Optimizing: we deliver, measure, and refine — through go-live and beyond.',
  ],
  story:
    'True Lean Solutions formally began in 2025 under True Lean LLC, founded by Sajeed Lakhani. Its first major opportunity came through NRI North America, part of Nomura Research Institute. From talent solutions it grew into software engineering, application development, integrations, automation, AI solutions, and technical architecture. Today it operates as a technology execution company within the Akhani LLC family of brands.',
  team: [
    'Sajeed Lakhani — President & Founder',
    'Mack Akhani — CEO',
    'Hemang Dwivedi — Operations and Technology Leader',
    'Kranthi Kumar Goli — QA Architect',
    'Shruti Shrivastava — Marketing Manager',
  ],
  clients: [
    'NRI North America',
    'UV Concepts',
    'KSR Group',
    'Mudra Health',
    'Prudent Wealth Solutions',
    'Bravvox',
    'ACUVI Technology Solutions',
    'Mamacare 360',
    'Lohana Association of Dallas Fort Worth',
    "J Sterling's Wellness Spa",
    'Centric3',
    'Dwibros Infracon Private Limited',
  ],
};

const projectCta: Link = { label: 'Discuss Your Project', href: '/contact/' };

export const ENTITIES: Entity[] = [
  {
    id: 'ai',
    name: 'AI & Automation',
    aliases: ['ai & automation', 'ai and automation', 'enterprise ai', 'custom ai', 'ai solution', 'ai solutions', 'ai for my business', 'ai automation', 'artificial intelligence', 'wisebric', 'governed ai', 'private ai', 'ai governance', 'ai assistants', 'ai agents', 'ai chat'],
    url: '/services/enterprise-ai/',
    overview:
      'Put AI to work on your business data — governed, private, and under your control. Enterprise AI is an intelligent layer between your people, your organizational knowledge, your business systems, and approved AI models, all governed through one secure platform.',
    details: {
      lead: 'From chat to autonomous agents:',
      points: [
        'Enterprise AI Chat — a secure AI workspace for everyday productivity.',
        'AI Assistants — purpose-built intelligence for departments, roles, and business functions.',
        'AI Agents — use approved tools, data, and systems to support or automate defined processes, within controlled boundaries.',
      ],
    },
    audience: {
      lead: "You'll recognize the problem if:",
      points: [
        "Your team is using AI tools you didn't approve.",
        "You're paying for AI but can't control the cost.",
        'You need AI that understands your business context.',
        "You want to adopt AI but can't risk vendor lock-in.",
      ],
    },
    control:
      'Built on three pillars — security, governance, and control: private and on-premises deployment, role-based access, full audit logging, and an LLM-agnostic architecture with no vendor lock-in. Your data stays inside your controlled environment.',
    process: {
      lead: 'True Lean Solutions is the exclusive US implementation partner for Wisebric, an Enterprise AI governance and orchestration platform. The fastest way in is Meeting Intelligence — no integration required: start with one practical problem, prove the value, and expand when you\'re ready.',
      points: [],
    },
    cta: { label: 'Book a Demo', href: '/contact/' },
    follow: ['What is Meeting Intelligence?', 'How is my data kept private?', 'Who is it for?'],
  },
  {
    id: 'meeting',
    name: 'Meeting Intelligence',
    aliases: ['meeting intelligence', 'meetings', 'meeting', 'minutes', 'meeting minutes', 'transcripts', 'transcription', 'recording', 'record meetings', 'teams zoom', 'zoom', 'google meet', 'microsoft teams', 'mom', 'action items'],
    url: '/services/meeting-intelligence/',
    overview:
      'Meeting Intelligence turns every meeting into secure, searchable knowledge. It automatically captures, transcribes and organizes your Teams, Zoom and Google Meet meetings — with professional minutes, action items and searchable summaries.',
    details: {
      lead: 'What it includes:',
      points: [
        'Automatic meeting recording (Teams, Zoom, Google Meet)',
        'Professional Minutes of Meeting',
        'Action items and follow-ups',
        'Ask AI about any meeting',
        'Search years of meeting history',
        'Enterprise-grade security and private deployment',
      ],
    },
    process: {
      lead: 'From conversation to knowledge:',
      points: [
        'Capture — automatically join and record meetings from Microsoft Teams, Zoom and Google Meet.',
        'Understand — transcribe conversations and create structured summaries and professional minutes.',
        'Extract — identify key discussion points, decisions, commitments, action items and important topics.',
        'Preserve — turn individual meetings into persistent organizational knowledge.',
        'Search & Ask — find information across your meetings or ask AI a question to retrieve relevant context.',
      ],
    },
    audience: {
      lead: 'It helps when:',
      points: [
        'Meeting knowledge is scattered across recordings, transcripts, notes and individual memory.',
        'A key account manager leaves and their customer context would leave with them.',
        'Teams need to find the decisions and commitments behind past conversations.',
      ],
    },
    control:
      'Private deployment: your data stays in your environment, with no public AI exposure and complete ownership and control. Your recordings, transcripts, and the knowledge built from them belong to you.',
    pricing: 'Meeting Intelligence is published at $5,000 / year.',
    cta: { label: 'Discuss Meeting Intelligence', href: '/contact/' },
    follow: ['How does Meeting Intelligence work?', 'How is enterprise data controlled?', 'How much does it cost?', 'Can I request a demo?'],
  },
  {
    id: 'visibility',
    name: 'AI Visibility Growth Team',
    aliases: ['ai visibility', 'visibility', 'ai search', 'ai search visibility', 'aio', 'ai search optimization', 'chatgpt', 'perplexity', 'gemini', 'google ai', 'seo', 'get cited', 'citations', 'generative search', 'geo', 'recommended by ai'],
    url: '/services/ai-visibility-growth-team/',
    overview:
      "Your customers are increasingly asking AI before they visit your website. The AI Visibility Growth Team helps your brand become more visible, credible, and discoverable across ChatGPT, Google AI, Gemini, Perplexity, and other AI-driven discovery platforms — similar to SEO, but built for AI search.",
    details: {
      lead: 'What the team does:',
      points: [
        'AI search optimization (AIO)',
        'Technical and content optimization',
        'Entity and authority building',
        'AI-targeted content creation',
        'Citation and digital PR support',
        'Analytics, reporting and ongoing optimization',
      ],
    },
    process: {
      lead: 'From baseline to growth:',
      points: [
        'Discover — your business, audience, current digital presence, and visibility goals.',
        'Establish your baseline — your current AI discovery presence, content, technical foundations, and opportunities.',
        'Optimize and build — prioritized improvements across content, technical structure, brand authority, and discoverability.',
        'Measure and refine — review progress, identify gaps, and adapt as AI search evolves.',
      ],
    },
    audience: {
      lead: 'It fits when:',
      points: [
        'Your customers research with AI assistants before they reach your website.',
        'You want your business information easier for AI-driven platforms to understand and surface.',
        'You want to strengthen the signals that support credible recommendations and citations.',
      ],
    },
    pricing:
      'The AI Visibility Growth Team is published at $4,500 / month for 100 hours of expert capacity — a $45/hr effective blended rate.',
    cta: { label: 'Get Your AI Visibility Baseline', href: '/contact/' },
    follow: ['What is AI search visibility?', 'What does the service include?', 'How does it work?', 'How can I get an initial assessment?'],
  },
  {
    id: 'software',
    name: 'Custom Software',
    aliases: ['custom software', 'software', 'software development', 'app', 'application', 'web app', 'portal', 'internal tool', 'build an app', 'saas', 'legacy', 'modernization', 'mvp', 'api', 'develop'],
    url: '/services/software/',
    overview:
      "Build exactly what you need — not a workaround. When your workflows, processes, or customer experiences are unique to how you operate, custom software lets you build for your business instead of bending it to fit someone else's product.",
    details: {
      lead: 'What we build:',
      points: [
        'Web & enterprise applications — customer portals, internal workflow systems, SaaS platforms, partner and vendor management systems.',
        'Legacy system modernization — phased migrations to modern, cloud-ready platforms with minimal downtime.',
        'API development & integrations — connect your systems and enable seamless data flow.',
        'Cloud-native applications — optimized for performance, scalability, and resilience.',
      ],
    },
    process: {
      lead: 'How a build runs:',
      points: [
        'Discover & Define — goals, workflows, requirements, and a clear scope upfront.',
        'Design & Architect — you see and approve designs before code is written.',
        'Build & Iterate — Agile sprints; you see working software regularly.',
        'Test & Secure — testing, performance tuning, and security best practices.',
        "Deploy & Support — smooth deployment and ongoing support. We don't disappear after launch.",
      ],
    },
    audience: {
      lead: 'It fits when:',
      points: [
        "Off-the-shelf tools aren't cutting it.",
        'You have a manual process that should be a product.',
        'Your legacy systems are holding you back.',
        'You need to build customer-facing technology.',
      ],
    },
    cta: { label: 'Discuss What You Need to Build', href: '/contact/' },
    follow: ['How does a software project run?', 'Can you modernize a legacy system?', 'I want to discuss a project'],
  },
  {
    id: 'integration',
    name: 'System Integration',
    aliases: ['system integration', 'integration', 'integrations', 'integrate', 'connect systems', 'connect my tools', 'zapier', 'make.com', 'middleware', 'sync', 'data sync', 'crm', 'erp', 'salesforce', 'quickbooks', 'existing tools', 'disconnected'],
    url: '/services/integrations/',
    overview:
      "Your tools should work together — so your team doesn't have to. Most small businesses run on 5–15 disconnected tools; we connect the systems you already run so information moves without anyone rekeying it.",
    audience: {
      lead: 'Signs you need it:',
      points: [
        'Manual data transfer between systems every week.',
        "Disconnected reporting — no clear picture without combining reports by hand.",
        'Process breakdowns at handoffs between departments or tools.',
        'Scaling pains — processes built on manual coordination start breaking.',
      ],
    },
    process: {
      lead: 'How we work:',
      points: [
        'Systems Audit — map every tool and where the manual gaps are.',
        'Integration Design — which systems connect, what data flows where, edge cases.',
        'Build & Connect — native connectors, middleware like Zapier or Make, custom APIs, or direct database integrations.',
        'Test & Validate — end-to-end testing before go-live.',
        'Monitor & Optimize — we stay involved post-launch.',
      ],
    },
    cta: { label: 'Discuss Your Integration', href: '/contact/' },
    follow: ['Can automation work with my existing tools?', 'How does an integration project run?'],
  },
  {
    id: 'talent',
    name: 'Technical Talent',
    aliases: ['technical talent', 'talent', 'hiring', 'hire', 'recruiting', 'recruitment', 'staffing', 'developers', 'developer', 'engineers', 'contractor', 'contract to hire', 'contract-to-hire', 'it recruiting', 'staff augmentation', 'roles', 'place'],
    url: '/services/technical-talent/',
    overview:
      'The right person for the role — at the right time. Add technical talent when a critical role or delivery capacity is the gap, with contract, contract-to-hire, or permanent staff depending on the engagement.',
    details: {
      lead: 'Roles we place include:',
      points: [
        'Software Developers (Java, Python, .NET, Full Stack, Mobile)',
        'Cloud & DevOps Engineers',
        'System & Solution Architects',
        'Data Engineers & Analysts',
        'Technical Project Managers & Product Owners',
        'QA & Automation Engineers',
        'Security & IAM Specialists',
        'Technical Business Analysts',
      ],
    },
    process: {
      lead: 'How a search runs:',
      points: [
        'Role Definition — technical requirements plus business context and success criteria.',
        'Sourcing & Screening — every candidate is technically screened before they reach you.',
        'Shortlist & Present — a curated shortlist with our assessment of each candidate.',
        'Interview Support — structured guidance and honest feedback.',
        'Offer & Onboarding — competitive offers, counteroffers, and onboarding support.',
      ],
    },
    cta: { label: 'Talk to Us About the Role', href: '/contact/' },
    follow: ['What roles do you place?', 'How does the hiring process work?'],
  },
  {
    id: 'workflow',
    name: 'Workflow Automation',
    aliases: ['workflow automation', 'workflow', 'workflows', 'automation', 'automate', 'automating', 'manual work', 'manual process', 'repetitive', 'process improvement', 'operations', 'spreadsheets'],
    url: '/services/workflow-automation/',
    overview:
      'Turn a workflow that creates friction into a better operating process — through redesign, automation, and tool configuration.',
    process: {
      lead: 'Related solutions that often work together with it:',
      points: [
        'System Integration — connect the tools you already run so data moves without rekeying.',
        'Custom Software — when a manual process should become a proper system.',
      ],
    },
    cta: { label: 'Discuss the Workflow', href: '/contact/' },
    follow: ['What processes can be automated?', 'Can automation work with my existing tools?', 'How do I get started?'],
  },
  {
    id: 'strategy',
    name: 'Technology Strategy',
    aliases: ['technology strategy', 'strategy', 'roadmap', 'consulting', 'advice', 'not sure', 'where to start', 'right solution', 'assessment'],
    url: '/services/technology-strategy/',
    overview:
      'Work out what you actually need before you build — challenge assumptions early, then define the right solution.',
    cta: { label: 'Bring Us the Need', href: '/contact/' },
    follow: ['Which solution fits my business?', 'I want to discuss a project'],
  },
  {
    id: 'data',
    name: 'Data & Analytics',
    aliases: ['data & analytics', 'data and analytics', 'analytics', 'data analytics', 'dashboards', 'dashboard', 'business intelligence', 'power bi', 'data strategy', 'make sense of our data', 'data warehouse'],
    url: '/services/data-analytics/',
    overview:
      'Your data already contains answers. We help you connect it, organize it, visualize it, and turn it into intelligence your teams can actually use.',
    cta: projectCta,
    follow: ['Which solution fits my business?', 'I want to discuss a project'],
  },
  {
    id: 'security',
    name: 'Cyber Security',
    aliases: ['cyber security', 'cybersecurity', 'cyber'],
    url: '/services/cyber-security/',
    overview:
      'Cyber Security is one of our solutions: protect what your business depends on. The details are best worked through with our team for your situation.',
    cta: projectCta,
    follow: ['I want to discuss a project'],
  },
];

/** Guided discovery: what a visitor is trying to solve → where to look. */
export const NEEDS: { label: string; entities: string[]; note: string }[] = [
  { label: 'Repetitive manual work', entities: ['workflow', 'integration'], note: 'Manual, repetitive work is usually a workflow and integration problem.' },
  { label: "Our systems don't talk to each other", entities: ['integration'], note: 'Disconnected tools are exactly what System Integration solves.' },
  { label: 'We need an app, portal or internal tool', entities: ['software'], note: 'When off-the-shelf tools don\'t fit, Custom Software does.' },
  { label: 'We need technical people', entities: ['talent'], note: 'When a critical role or delivery capacity is the gap:' },
  { label: 'Using AI safely with our data', entities: ['ai'], note: 'For AI that is governed, private, and under your control:' },
  { label: 'Meeting knowledge gets lost', entities: ['meeting'], note: 'For decisions and commitments that disappear after meetings:' },
  { label: 'Showing up in AI search', entities: ['visibility'], note: 'For being found, cited, and recommended by AI:' },
  { label: 'Making sense of our data', entities: ['data'], note: 'For turning data into decisions:' },
  { label: "Not sure yet", entities: ['strategy'], note: "That's a good place to start — we help work out the right problem before building." },
];

export const byId = (id: string) => ENTITIES.find((e) => e.id === id);
