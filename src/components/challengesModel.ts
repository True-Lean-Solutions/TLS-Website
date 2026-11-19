/**
 * Geometry for the code-drawn platform model in Home › Common Business
 * Challenges (ChallengesModel.astro, 2026-11-20). Everything is worked out
 * here, in plain TypeScript, and handed to the component as ready SVG
 * strings.
 *
 * The canvas has the shape of the picture it replaces (1672 x 941) and keeps
 * the platform in the same place, so the section's positioning and edge
 * fades apply unchanged.
 */
export type Pt = [number, number];

export const W = 1672;
export const H = 941;
/** Where the platform stands: the ground origin, on screen. */
export const O: Pt = [895, 505];

const COS = Math.cos(Math.PI / 6);
const r = (n: number) => Math.round(n * 10) / 10;
const P = (p: Pt) => `${p[0]} ${p[1]}`;
const lerp = (a: Pt, b: Pt, t: number): Pt => [r(a[0] + (b[0] - a[0]) * t), r(a[1] + (b[1] - a[1]) * t)];

/** Ground (x, y) at height z, projected to the screen. */
export const iso = (x: number, y: number, z = 0): Pt => [r(O[0] + (x - y) * COS), r(O[1] + (x + y) / 2 - z)];
/** The ground point under a screen point. */
const ground = (sx: number, sy: number): Pt => {
  const dx = (sx - O[0]) / COS;
  const dy = 2 * (sy - O[1]);
  return [r((dx + dy) / 2), r((dy - dx) / 2)];
};
const line = (pts: Pt[]) => 'M' + pts.map((p) => P(iso(p[0], p[1]))).join(' L');

/** A square slab with rounded corners: half-size h, from height z0 to z1. */
export function slab(h: number, z0: number, z1: number, t = 0.2) {
  const face = (z: number) => {
    // back, right, front, left
    const V: Pt[] = [iso(-h, -h, z), iso(h, -h, z), iso(h, h, z), iso(-h, h, z)];
    const a = V.map((v, i) => lerp(v, V[(i + 3) % 4], t));
    const b = V.map((v, i) => lerp(v, V[(i + 1) % 4], t));
    const m = V.map((v, i): Pt => [r((a[i][0] + 2 * v[0] + b[i][0]) / 4), r((a[i][1] + 2 * v[1] + b[i][1]) / 4)]);
    return { V, a, b, m };
  };
  const top = face(z1);
  const bot = face(z0);
  type Face = ReturnType<typeof face>;
  const full = (f: Face) => 'M' + P(f.a[0]) + f.V.map((v, i) => ` Q${P(v)} ${P(f.b[i])} L${P(f.a[(i + 1) % 4])}`).join('') + ' Z';
  // The visible front edge: from the left corner, round the front, to the right corner.
  const front = (f: Face) =>
    `M${P(f.m[3])} Q${P(lerp(f.a[3], f.V[3], 0.5))} ${P(f.a[3])} L${P(f.b[2])} Q${P(f.V[2])} ${P(f.a[2])} L${P(f.b[1])} Q${P(lerp(f.b[1], f.V[1], 0.5))} ${P(f.m[1])}`;
  const back = (f: Face) =>
    ` L${P(f.m[1])} Q${P(lerp(f.b[1], f.V[1], 0.5))} ${P(f.b[1])} L${P(f.a[2])} Q${P(f.V[2])} ${P(f.b[2])} L${P(f.a[3])} Q${P(lerp(f.a[3], f.V[3], 0.5))} ${P(f.m[3])} Z`;
  return {
    top: full(top),
    /** The two visible sides, as one shape. */
    side: front(top) + back(bot),
    /** The lit edge along the bottom of the front. */
    edge: front(bot),
    /** The highlight along the top of the front. */
    rim: front(top),
    cap: iso(0, 0, z1),
    left: top.V[3][0],
    right: top.V[1][0],
  };
}

export const base = slab(190, 0, 26);
export const middle = slab(165, 46, 72);
export const upper = slab(140, 96, 128);

/**
 * The four glass panels. Each stands upright and is turned toward the
 * viewer: `k` is its slope on screen (gentler than the floor's, as in the
 * picture, so the words stay easy to read).
 */
const CARD_W = 320;
const CARD_H = 165;
const TURN = 0.94; // how much of the panel's width shows
const SLOPE = 0.34;
const panel = (key: string, l1: string, l2: string, c: string, ink: string, at: Pt, k: number, i: number) => {
  // The floor point under the middle of the panel's bottom edge.
  const foot: Pt = [r(at[0] + (CARD_W / 2) * TURN), r(at[1] + CARD_H + (CARD_W / 2) * k + 62)];
  const g = ground(foot[0], foot[1]);
  // A circuit trace from the panel to the nearest side of the platform.
  const alongX = Math.abs(g[0]) > Math.abs(g[1]);
  const s = Math.sign(alongX ? g[0] : g[1]);
  const turn = s * (190 + (Math.abs(alongX ? g[0] : g[1]) - 190) / 2);
  const route: Pt[] = alongX
    ? [g, [turn, g[1]], [turn, 0], [s * 190, 0]]
    : [g, [g[0], turn], [0, turn], [0, s * 190]];
  return {
    key,
    l1,
    l2,
    c,
    ink,
    i,
    matrix: `matrix(${TURN} ${k} 0 1 ${at[0]} ${at[1]})`,
    /** Glass thickness: a second sheet, set back from the first. */
    depth: `translate(${k < 0 ? 10 : -10} ${r(5 + 10 * SLOPE)})`,
    foot,
    trace: line(route),
    /** The lead from the trace up to the panel. */
    stem: `M${P(foot)} L${foot[0]} ${r(foot[1] - 62)}`,
  };
};
export const card = { w: CARD_W, h: CARD_H };
export const cards = [
  panel('problem', 'Business', 'Problem', '#ff5d5d', '#d94040', [425, 205], -SLOPE, 0),
  panel('thinking', 'Lean', 'Thinking', '#4fb6ff', '#1288cf', [1068, 92], SLOPE, 1),
  panel('solution', 'Right', 'Solution', '#c77dff', '#873662', [345, 520], SLOPE, 2),
  panel('results', 'Measurable', 'Results', '#928dff', '#5b4fd6', [1108, 728], -SLOPE, 3),
];

/** Fainter traces running off toward the edges of the floor. */
const decor = (pts: Pt[], c: string) => ({ d: line(pts), c, end: iso(pts[pts.length - 1][0], pts[pts.length - 1][1]) });
export const traces = [
  decor([[-190, -40], [-330, -40], [-330, -240], [-640, -240]], '#ff5d5d'),
  decor([[-60, -190], [-60, -330], [200, -330], [200, -640]], '#4fb6ff'),
  decor([[190, 40], [330, 40], [330, 250], [660, 250]], '#928dff'),
  decor([[40, 190], [40, 330], [-230, 330], [-230, 640]], '#c77dff'),
  decor([[-190, -110], [-470, -110], [-470, -380]], '#ff5d5d'),
  decor([[-190, 120], [-560, 120], [-560, 330]], '#ff5d5d'),
  decor([[110, -190], [110, -470], [380, -470]], '#4fb6ff'),
  decor([[-120, -190], [-120, -520]], '#4fb6ff'),
  decor([[190, 110], [470, 110], [470, 400]], '#928dff'),
  decor([[190, -120], [540, -120], [540, -330]], '#4fb6ff'),
  decor([[-110, 190], [-110, 470], [-380, 470]], '#c77dff'),
  decor([[120, 190], [120, 600]], '#c77dff'),
];

/** The floor: tile lines, and a scatter of tiles that sit a shade apart. */
const STEP = 95;
const REACH = 1425;
export const grid: string[] = [];
for (let k = -REACH; k <= REACH; k += STEP) {
  grid.push(`M${P(iso(k, -REACH))} L${P(iso(k, REACH))}`);
  grid.push(`M${P(iso(-REACH, k))} L${P(iso(REACH, k))}`);
}
export const tiles: { points: string; tone: number }[] = [];
for (let i = -9; i <= 8; i++) {
  for (let j = -9; j <= 8; j++) {
    const hash = Math.abs((i * 73 + j * 151 + i * j * 7) % 11);
    if (hash > 3) continue;
    // Not under the platform.
    if (i >= -3 && i <= 2 && j >= -3 && j <= 2) continue;
    const x = i * STEP + 6;
    const y = j * STEP + 6;
    const e = STEP - 12;
    tiles.push({
      points: [iso(x, y), iso(x + e, y), iso(x + e, y + e), iso(x, y + e)].map((p) => p.join(',')).join(' '),
      tone: hash,
    });
  }
}

/**
 * The floor's outline. The picture hid its edges in a blur; the model's
 * floor ends cleanly instead: it is a field of dark tiles, whole in the
 * middle, shrinking and thinning toward the rim. FIELD is the field's reach
 * on screen around the platform (a soft-cornered oval).
 */
const FIELD = { rx: 575, ry: 420, power: 3, solid: 0.54 };
const TILE = 64;
export const field: string[] = [];
for (let i = -13; i <= 12; i++) {
  for (let j = -13; j <= 12; j++) {
    const cx = (i + 0.5) * TILE;
    const cy = (j + 0.5) * TILE;
    const c = iso(cx, cy);
    const d = Math.abs((c[0] - O[0]) / FIELD.rx) ** FIELD.power + Math.abs((c[1] - O[1]) / FIELD.ry) ** FIELD.power;
    if (d >= 1) continue;
    // Whole tiles overlap a touch, so no seams show; rim tiles shrink to dots.
    const k = d < FIELD.solid ? 1.04 : 0.94 * (1 - ((d - FIELD.solid) / (1 - FIELD.solid)) * 0.82);
    const h = (TILE / 2) * k;
    field.push([iso(cx - h, cy - h), iso(cx + h, cy - h), iso(cx + h, cy + h), iso(cx - h, cy + h)].map((q) => q.join(',')).join(' '));
  }
}
