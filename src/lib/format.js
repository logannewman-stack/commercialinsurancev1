export const money = (n) => "$" + Math.round(n || 0).toLocaleString("en-US");
export const num = (n) => Math.round(n || 0).toLocaleString("en-US");
export function shortMoney(v) {
  if (v >= 1e6) { const m = v / 1e6; return "$" + (Number.isInteger(m) ? m : m.toFixed(1)) + "M"; }
  if (v >= 1e3) return "$" + Math.round(v / 1e3) + "k";
  return "$" + Math.round(v);
}
export function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967295;
}
export function initials(name) {
  const w = name.trim().split(/\s+/);
  return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase();
}
