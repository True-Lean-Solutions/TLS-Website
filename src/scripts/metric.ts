/**
 * Parse and format count-up metrics ("$3M", "15 hrs", "3 weeks"). Shared by
 * StatInline (renders the $0 starting state at build time) and motion.ts
 * (counts in the browser), so both always format the same way.
 */
export interface Metric {
  /** The original value, returned exactly at the end of a count. */
  final: string;
  prefix: string;
  target: number;
  suffix: string;
  /** " hrs", " weeks" (pluralized) vs a magnitude like "M" (dropped at zero). */
  isUnit: boolean;
  decimals: number;
}

export function parseMetric(value: string): Metric | null {
  const final = value.trim();
  const m = final.match(/^(\D*?)(\d+(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  const [, prefix, digits, suffix] = m;
  const target = parseFloat(digits);
  const isUnit = /^\s/.test(suffix);
  // Small magnitudes ($3M) count in tenths so the motion stays smooth.
  const decimals = !isUnit && target < 10 ? 1 : (digits.split('.')[1]?.length ?? 0);
  return { final, prefix, target, suffix, isUnit, decimals };
}

/** "$0", "$1.4M", "$3M" · "0 hrs", "1 hr", "15 hrs" · "1 week", "3 weeks". */
export function formatMetric(m: Metric, n: number): string {
  if (n >= m.target) return m.final;
  if (n <= 0) return `${m.prefix}0${m.isUnit ? m.suffix : ''}`;
  const unit = m.isUnit && n === 1 ? m.suffix.replace(/s$/, '') : m.suffix;
  return m.prefix + n.toFixed(m.decimals).replace(/\.0+$/, '') + unit;
}
