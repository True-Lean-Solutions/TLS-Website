/**
 * The Solutions page's portfolio model (Hemang, 2026-11-18: service portfolio
 * expansion). The ten solutions are grouped by where they sit in a business's
 * technology lifecycle, and the "start from what's in your way" finder maps
 * common business problems to the solutions that answer them.
 *
 * Copy here is framing (stage names and the problems visitors recognize), not
 * claims about TLS; every solution's own blurb comes from services.ts or the
 * Solutions page's source doc.
 */
import { solutions, type Service } from './services';

export type StageId = 'plan' | 'build' | 'connect' | 'run' | 'protect';

export interface Stage {
  id: StageId;
  /** Short verb shown on the lifecycle rail. */
  label: string;
  /** One line under the stage name. */
  line: string;
  /** Solution hrefs in this stage, in display order. */
  hrefs: string[];
}

export const stages: Stage[] = [
  {
    id: 'plan',
    label: 'Plan',
    line: 'Decide what to build, and on what evidence.',
    hrefs: ['/services/technology-strategy/', '/services/data-analytics/'],
  },
  {
    id: 'build',
    label: 'Build',
    line: 'Create the software and AI the business needs.',
    hrefs: ['/services/software/', '/services/enterprise-ai/'],
  },
  {
    id: 'connect',
    label: 'Connect',
    line: 'Make systems and workflows work as one.',
    hrefs: ['/services/integrations/', '/services/workflow-automation/'],
  },
  {
    id: 'run',
    label: 'Run',
    line: 'Keep people, systems and capacity in place.',
    hrefs: ['/services/managed-it/', '/services/technical-talent/'],
  },
  {
    id: 'protect',
    label: 'Protect',
    line: 'Secure the business and its foundation.',
    hrefs: ['/services/cyber-security/', '/services/cloud-infrastructure/'],
  },
];

/** The solution behind an href (every stage href is a real solution). */
export const solutionFor = (href: string): Service => {
  const s = solutions.find((x) => x.href === href);
  if (!s) throw new Error(`portfolio: no solution at ${href}`);
  return s;
};

export interface Challenge {
  id: string;
  /** In the visitor's words. */
  label: string;
  /** The solutions that answer it, most direct first. */
  hrefs: string[];
}

export const challenges: Challenge[] = [
  { id: 'automate', label: 'Our operations run on manual work', hrefs: ['/services/workflow-automation/', '/services/enterprise-ai/', '/services/integrations/'] },
  { id: 'software', label: 'We need software that fits how we work', hrefs: ['/services/software/', '/services/technology-strategy/'] },
  { id: 'connect', label: "Our systems don't talk to each other", hrefs: ['/services/integrations/', '/services/workflow-automation/'] },
  { id: 'unreliable', label: 'Our technology keeps letting us down', hrefs: ['/services/managed-it/', '/services/cloud-infrastructure/'] },
  { id: 'data', label: "We can't see what our data is telling us", hrefs: ['/services/data-analytics/', '/services/integrations/'] },
  { id: 'modernize', label: 'Our infrastructure is due for modernizing', hrefs: ['/services/cloud-infrastructure/', '/services/technology-strategy/'] },
  { id: 'secure', label: 'We need to secure the business', hrefs: ['/services/cyber-security/', '/services/managed-it/'] },
  { id: 'support', label: 'We need ongoing technology support', hrefs: ['/services/managed-it/', '/services/technical-talent/'] },
];
