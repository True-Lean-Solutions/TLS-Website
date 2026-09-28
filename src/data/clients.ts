/**
 * Client logos. Real clients only — never add a logo without a source.
 * source: Drive IDs in docs/sources.md §4 (Client logo: NRI, UV Concepts).
 */
export interface Client {
  name: string;
  logo: string;
  width: number;
  height: number;
  /** Rendered height in px, tuned so marks of different shapes look balanced. */
  displayHeight: number;
  /**
   * Muted state before hover. 'grayscale' only where it doesn't damage the
   * mark; 'fade' keeps the logo's own colors at reduced opacity.
   */
  muted: 'grayscale' | 'fade';
}

export const clients: Client[] = [
  {
    name: 'NRI North America',
    logo: '/clients/nri.png',
    width: 400,
    height: 80,
    displayHeight: 34,
    muted: 'grayscale',
  },
  {
    name: 'UV Concepts',
    logo: '/clients/uv-concepts.png',
    width: 66,
    height: 66,
    displayHeight: 52,
    // A pale mark whose only color is its blue center: grayscale would erase it.
    muted: 'fade',
  },
];

/** The client whose logo represents a testimonial's company, if we have one. */
export function clientFor(company?: string): Client | undefined {
  return company ? clients.find((c) => c.name === company) : undefined;
}
