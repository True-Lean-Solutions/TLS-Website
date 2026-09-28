/**
 * The four solutions (labeled "Solutions" on the site since 2026-09-28), in
 * the fixed order: AI & Automation (formerly Enterprise AI),
 * Custom Software, System Integration, Technical Talent.
 * Home-card blurbs are verbatim from the Home doc's "What We Do" section.
 * source: 1zAjHl6Vc7BeO-ApXSVLrsyMmJ5TxOMqRXTaPWgfHAwE (Home Page 2026-09-27)
 */
import type { IconName } from '../components/iconTypes';

export type Accent = 'red' | 'blue' | 'plum';

export interface Service {
  title: string;
  href: string;
  icon: IconName;
  /** Per-card accent color (mock-up rotates red/blue/purple). */
  accent: Accent;
  /** Short blurb used on cards. Empty = name only. */
  blurb: string;
  /** One-line header-menu summary (Hemang, 2026-09-28); cards keep the blurb. */
  summary: string;
}

export const services: Service[] = [
  {
    title: 'AI & Automation',
    summary: 'AI solutions for your business data',
    href: '/services/enterprise-ai/',
    icon: 'ai',
    accent: 'red',
    blurb:
      'Put AI to work on your business data — governed, secured, and under your control.',
  },
  {
    title: 'Custom Software',
    summary: 'Custom apps and internal tools',
    href: '/services/software/',
    icon: 'software',
    accent: 'blue',
    blurb:
      'Build the applications, portals, and internal tools your spreadsheets and email threads are standing in for.',
  },
  {
    title: 'System Integration',
    summary: 'Connect systems and workflows',
    href: '/services/integrations/',
    icon: 'integration',
    accent: 'plum',
    blurb:
      'Connect the tools you already run so data moves without anyone rekeying it.',
  },
  {
    title: 'Technical Talent',
    summary: 'Add the right technical expertise',
    href: '/services/technical-talent/',
    icon: 'talent',
    accent: 'red',
    blurb:
      'Add technical talent when a critical role or delivery capacity is the gap.',
  },
];

/**
 * Four further solutions (added 2026-09-28; Mack approved, per Hemang). Shown
 * on the Solutions page and in the header menu, not on Home. Each has a short
 * page at /services/<slug>/ (src/pages/services/[solution].astro) until full
 * content exists. No new claims: every blurb traces to a source below.
 */
export const moreSolutions: Service[] = [
  {
    title: 'Workflow Automation',
    summary: 'Improve workflows and operations',
    href: '/services/workflow-automation/',
    icon: 'workflow',
    accent: 'blue',
    // source: Brand Guide v2.3, capability "Process Improvement & Automation"
    blurb:
      'Turn a workflow that creates friction into a better operating process — through redesign, automation, and tool configuration.',
  },
  {
    title: 'Technology Strategy',
    summary: 'Define the right technology path',
    href: '/services/technology-strategy/',
    icon: 'compass',
    accent: 'plum',
    // drafted from existing positioning only (v2.3 §01; Home hero: "we help
    // make sure you're building what you actually need"), Hemang 2026-09-28
    blurb:
      'Work out what you actually need before you build — challenge assumptions early, then define the right solution.',
  },
  {
    title: 'Data & Analytics',
    summary: 'Turn business data into insight',
    href: '/services/data-analytics/',
    icon: 'analytics',
    accent: 'red',
    // source: TLS Website: Data & Analytics (Mack, 2026-09-28),
    // 1ukO2kvtwRtS00MqQ84yRgNMEZtv2PG1ESHGLrOmMt7Y — hero copy
    blurb:
      'Connect, organize, and visualize your data — and turn it into intelligence your teams can actually use.',
  },
  {
    title: 'Cyber Security',
    summary: 'Protect systems and information',
    href: '/services/cyber-security/',
    icon: 'security',
    accent: 'blue',
    // No source copy yet: name only until it exists (Hemang, 2026-09-28).
    blurb: '',
  },
];

/** All eight, in order: the four core solutions, then the four above. */
export const solutions: Service[] = [...services, ...moreSolutions];
