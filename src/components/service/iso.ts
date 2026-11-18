/**
 * Isometric drawing helpers for the code-drawn service scenes (2026-11-18),
 * after the ones on the Cybersecurity page: ground (x, y) at height z,
 * projected around a screen origin. Everything returns strings ready for SVG
 * attributes.
 */
export type Pt = [number, number];
const COS = Math.cos(Math.PI / 6);
const r1 = (n: number) => Math.round(n * 10) / 10;

export const iso = (o: Pt, x: number, y: number, z = 0): Pt => [r1(o[0] + (x - y) * COS), r1(o[1] + (x + y) / 2 - z)];
export const poly = (ps: Pt[]) => ps.map((p) => p.join(',')).join(' ');
export const at = (p: Pt) => p.join(' ');

export interface Box {
  top: string;
  left: string;
  right: string;
  /** The lit front edge along the top. */
  edge: string;
  /** Screen position of the top face's center. */
  cap: Pt;
}

/** A box centered on ground point c, half-sizes a (x) and b (y), from height z0 to z1. */
export function box(o: Pt, c: Pt, a: number, b: number, z0: number, z1: number): Box {
  const p = (x: number, y: number, z: number) => iso(o, c[0] + x, c[1] + y, z);
  return {
    top: poly([p(-a, -b, z1), p(a, -b, z1), p(a, b, z1), p(-a, b, z1)]),
    left: poly([p(-a, b, z0), p(a, b, z0), p(a, b, z1), p(-a, b, z1)]),
    right: poly([p(a, -b, z0), p(a, b, z0), p(a, b, z1), p(a, -b, z1)]),
    edge: `M${at(p(-a, b, z1))} L${at(p(a, b, z1))} L${at(p(a, -b, z1))}`,
    cap: p(0, 0, z1),
  };
}

/** A circle of radius r on the ground plane at height z: an ellipse on screen. */
export const ring = (o: Pt, r: number, z = 0, c: Pt = [0, 0]) => {
  const [cx, cy] = iso(o, c[0], c[1], z);
  return { cx, cy, rx: r1(r * Math.SQRT2 * COS), ry: r1((r * Math.SQRT2) / 2) };
};

/** Ground grid lines within ±half, every `step`. */
export function floorGrid(o: Pt, half: number, step: number): string[] {
  const out: string[] = [];
  for (let k = -half; k <= half; k += step) {
    out.push(`M${at(iso(o, k, -half))} L${at(iso(o, k, half))}`);
    out.push(`M${at(iso(o, -half, k))} L${at(iso(o, half, k))}`);
  }
  return out;
}

/** Percent position inside a viewBox, for HTML labels laid over the SVG. */
export const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(2)}%`;
