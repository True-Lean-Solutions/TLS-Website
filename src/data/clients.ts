/**
 * Client logos. Real clients only — never add a logo without a source.
 * source: Drive IDs in docs/sources.md §4 (Client logo: NRI, UV Concepts).
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
];

/** The client whose logo represents a testimonial's company, if we have one. */
export function clientFor(company?: string): Client | undefined {
  return company ? clients.find((c) => c.name === company) : undefined;
}
