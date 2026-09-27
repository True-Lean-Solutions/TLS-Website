/**
 * The four services, in the fixed order (CLAUDE.md): Enterprise AI,
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
  /** Short blurb used on the Home "What We Do" cards. */
  blurb: string;
}

export const services: Service[] = [
  {
    title: 'Enterprise AI',
    href: '/services/enterprise-ai/',
    icon: 'ai',
    accent: 'red',
    blurb:
      'Put AI to work on your business data — governed, secured, and under your control.',
  },
  {
    title: 'Custom Software',
    href: '/services/software/',
    icon: 'software',
    accent: 'blue',
    blurb:
      'Build the applications, portals, and internal tools your spreadsheets and email threads are standing in for.',
  },
  {
    title: 'System Integration',
    href: '/services/integrations/',
    icon: 'integration',
    accent: 'plum',
    blurb:
      'Connect the tools you already run so data moves without anyone rekeying it.',
  },
  {
    title: 'Technical Talent',
    href: '/services/technical-talent/',
    icon: 'talent',
    accent: 'red',
    blurb:
      'Add technical talent when a critical role or delivery capacity is the gap.',
  },
];
