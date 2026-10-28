/**
 * Dr. Wally Potts — TLS's advisor for technology strategy and enterprise
 * transformation (Technology Strategy page and its Q&A page).
 *
 * source: "Wally Potts Resume (19).pdf", role-level bullets only (Hemang,
 * 2026-10-28: a page-scoped exception to the six-metric rule; see
 * docs/decisions.md). Every figure here is the advisor's, from a role he held
 * at another organization, and is shown credited to him — never as a TLS
 * result. The one-page bio card's quotes are not used (no permission yet),
 * and no phone number or email address appears anywhere.
 *
 * DRAFT pending Dr. Potts's approval.
 */

export const advisor = {
  name: 'Dr. Wally Potts',
  credentials: 'Ed.D, MBA, PMP',
  title: 'Advisor, Technology Strategy & Enterprise Transformation',
  photo: '/team/wally-potts.webp',
  linkedin: 'https://www.linkedin.com/in/wallyp/',
  /** Three short paragraphs (resume summary, Leidos, HP, Veterans Engineering). */
  bio: [
    'Dr. Potts advises and mentors True Lean Solutions on technology strategy, enterprise transformation and operational excellence.',
    'He brings 15+ years of enterprise technology and operations leadership across Fortune 50, federal, healthcare and private equity-backed organizations, including a $472M enterprise services portfolio at Leidos and 9,000+ applications migrated to hybrid cloud platforms at HP.',
    'Most recently, he led M&A execution — due diligence, data room development and integration planning — for the sale of Veterans Engineering to Aretum, after scaling its backlog from $6M to $170M+.',
  ],
  alumniOf: ['Baylor University', 'University of Arkansas', 'Brigham Young University'],
} as const;

/** Roles, as the resume names them (captions: "Role, employer, years"). */
const ROLE = {
  leidos: 'CIO, Infrastructure Operations Support Services, Leidos, 2019–2021',
  ve: 'VP, Advisory Services, Veterans Engineering, 2022–2026',
  hp: 'Head of Infrastructure Architecture & Hybrid Cloud Services, HP Inc., 2014–2016',
  clear: 'Director of Operations (Acting COO), ClearDATA, 2018–2019',
  trinet: 'Senior Manager, DevOps & Enterprise Platforms, TriNet, 2016–2018',
  walmart: 'Portfolio Manager, Walmart, 2011–2014',
};

export interface Proof {
  figure: string;
  label: string;
  caption: string;
}

/** The four proof tiles under Advisory Value. */
export const proofTiles: Proof[] = [
  { figure: '$472M', label: 'Enterprise services portfolio led', caption: ROLE.leidos },
  { figure: '$140M+', label: 'Savings delivered, including $80M within the first 90 days', caption: ROLE.leidos },
  { figure: '9,000+', label: 'Applications migrated to hybrid cloud platforms', caption: ROLE.hp },
  { figure: '15+ years', label: 'Of enterprise technology and operations leadership', caption: 'Career summary, 2011–present' },
];

/** The "Realized results" reel: the approved proof points, in resume order. */
export const results: Proof[] = [
  { figure: '$140M+', label: 'Cost savings, including $80M within the first 90 days', caption: ROLE.leidos },
  { figure: '$472M', label: 'Enterprise services portfolio across 1,600+ facilities and 386 data centers', caption: ROLE.leidos },
  { figure: '20K → 250K', label: 'Users scaled in one week', caption: ROLE.leidos },
  { figure: '$6M → $170M+', label: 'Backlog growth; acquisition readiness three years ahead of plan', caption: ROLE.ve },
  { figure: '$60M+', label: 'Contracts, including cybersecurity operations monitoring 850,000+ endpoints', caption: ROLE.ve },
  { figure: '700+', label: 'Cloud migrations and 2,232 readiness assessments', caption: ROLE.ve },
  { figure: '9,000+', label: 'Applications migrated to hybrid cloud platforms', caption: ROLE.hp },
  { figure: '63%', label: 'Cost savings, with a $7.5M+ run-rate reduction and $2.7M in vendor credits', caption: ROLE.hp },
  { figure: '$200M+', label: 'Vendor contracts negotiated and governed', caption: ROLE.hp },
  { figure: '$25M → $150M', label: 'Recurring revenue; backlog reduced 80% in 90 days', caption: ROLE.clear },
  { figure: 'Months → <1 week', label: 'Incident resolution time; NPS up 30%', caption: ROLE.clear },
  { figure: '12 months', label: 'To full SOX compliance; mean time to resolution (MTTR) improved 37%', caption: ROLE.trinet },
  { figure: '$100M+', label: 'Cost savings; 20% ($16M) vendor cost reduction', caption: ROLE.walmart },
];
