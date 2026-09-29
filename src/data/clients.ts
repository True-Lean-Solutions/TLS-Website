/**
 * Client logos. Real clients only — never add a logo without a source.
 * source: Drive IDs in docs/sources.md §4 (Client logo: NRI, UV Concepts; the
 * "Final Logos" folder for the rest; KSR Group's green logo from Hemang,
 * 2026-09-29). Tech Transpire's logo is in that folder but never shown
 * (CLAUDE.md: no Tech Transpire branding).
 */
export interface Client {
  name: string;
  logo: string;
  width: number;
  height: number;
  /**
   * Base rendered height in px, tuned so marks of different shapes carry
   * similar visual weight (the logo rail shows them 1.25x this). Logos are
   * always shown in their own colors at full strength.
   */
  displayHeight: number;
}

export const clients: Client[] = [
  {
    name: 'NRI North America',
    logo: '/clients/nri.png',
    width: 400,
    height: 80,
    displayHeight: 34,
  },
  {
    name: 'UV Concepts',
    logo: '/clients/uv-concepts.png',
    width: 66,
    height: 66,
    // Source is 66 px square (the Drive original too): 52 x 1.25 = 65 keeps it
    // at native size, so it stays crisp.
    displayHeight: 52,
  },
  {
    name: 'KSR Group',
    logo: '/clients/ksr-group.webp',
    width: 1026,
    height: 160,
    displayHeight: 27,
  },
  {
    name: 'Mudra Health',
    logo: '/clients/mudra-health.webp',
    width: 200,
    height: 200,
    displayHeight: 44,
  },
  {
    name: 'Prudent Wealth Solutions',
    logo: '/clients/prudent-wealth-solutions.webp',
    width: 896,
    height: 120,
    displayHeight: 24,
  },
  {
    name: 'Bravvox',
    logo: '/clients/bravvox.webp',
    width: 200,
    height: 200,
    // A solid tile carries more weight than an outline mark: a touch smaller.
    displayHeight: 40,
  },
  {
    name: 'ACUVI Technology Solutions',
    logo: '/clients/acuvi.webp',
    width: 867,
    height: 200,
    displayHeight: 34,
  },
  {
    name: 'Mamacare 360',
    logo: '/clients/mamacare-360.webp',
    width: 315,
    height: 240,
    displayHeight: 50,
  },
  {
    name: 'Lohana Association of Dallas Fort Worth',
    logo: '/clients/ladfw.webp',
    width: 239,
    height: 240,
    displayHeight: 54,
  },
  {
    name: "J Sterling's Wellness Spa",
    logo: '/clients/j-sterlings-wellness-spa.webp',
    width: 489,
    height: 199,
    displayHeight: 44,
  },
  {
    name: 'Centric3',
    logo: '/clients/centric3.webp',
    width: 792,
    height: 200,
    // The supplied file is the white-lettering (dark background) version; the
    // lettering is set in Ink Black at Hemang's request (2026-09-30). The blue
    // symbol is unchanged.
    displayHeight: 34,
  },
  {
    name: 'Dwibros Infracon Private Limited',
    logo: '/clients/dipl.webp',
    width: 771,
    height: 392,
    displayHeight: 50,
  },
];

/** The client whose logo represents a testimonial's company, if we have one. */
export function clientFor(company?: string): Client | undefined {
  return company ? clients.find((c) => c.name === company) : undefined;
}
