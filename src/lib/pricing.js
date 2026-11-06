/*
  DEMO PRICING ENGINE
  -------------------
  Produces realistic-looking sample quotes from the answers in the form so the
  product can be demoed end to end. Replace computeQuotes() with calls to real
  carrier APIs or a commercial comparative rater before launch. Everything in
  the UI reads the shape returned here:
    { quotes: [{ c, lines: [{ id, amt }], annual, monthly, payInFull, score, badges }], declined: [{ c, reason }], tiv }
*/
import { CLASS } from "../data/industries.js";
import { FACT, zipState, STATE_NAMES } from "../data/geo.js";
import { LINE, availableLines, recommend } from "../data/coverage.js";
import { CARRIERS, RATING } from "../data/carriers.js";
import { EMPLOYEES, YEARS, CLAIMS, opt } from "../data/questions.js";
import { hash, num, shortMoney, money } from "./format.js";

export const hasSpace = (a) => a.space === "own" || a.space === "lease";
export const empN = (a) => (opt(EMPLOYEES, a.employees) || { n: 1 }).n;

function noise(a, key) {
  return 0.93 + 0.14 * hash([key, a.industry, (a.zip || "").slice(0, 3), a.employees, a.space, a.years].join("|"));
}

export function basePremiums(a, o) {
  const ind = CLASS[a.industry] || CLASS.other;
  const st = zipState(a.zip);
  const f = (k) => (st && FACT[k][st]) || 1;
  const rev = a.revenue, emp = empN(a);
  const yrs = (opt(YEARS, a.years) || YEARS[3]).f, clm = (opt(CLAIMS, a.claims) || CLAIMS[0]).f, risk = yrs * clm;
  const hi = o.limit === "2/4", lim = hi ? 1.42 : 1;
  const ded = { 500: 1.08, 1000: 1, 2500: 0.9, 5000: 0.82 }[o.deductible] || 1;
  const sq = hasSpace(a) ? a.sqft : 0;
  const contents = Math.max(15000, sq * ind.contents);
  const building = a.space === "own" ? sq * 165 : a.space === "lease" ? sq * 12 : 0;
  const tiv = Math.max(15000, Math.round((contents + building) / 5000) * 5000);
  const glCore = Math.max(450, (rev / 1000) * ind.gl + sq * 0.04) * f("liab") * risk;
  const prop = Math.max(320, (tiv / 100) * 0.42 * ind.prop) * f("prop") * ded * (0.6 + 0.4 * risk);
  const autoCore = a.vehicles * 1850 * ind.auto * f("auto") * clm;
  const payroll = emp * ind.wage;
  return {
    tiv,
    p: {
      gl: glCore * lim,
      property: prop,
      bop: (glCore * lim + prop) * 0.86,
      wc: Math.max(550, (payroll / 100) * ind.wc * f("wc")) * clm * (yrs > 1.1 ? 1.06 : 1),
      pl: (550 + (rev / 1000) * ind.pl * 0.9) * f("liab") * risk * (hi ? 1.38 : 1),
      auto: autoCore,
      cyber: (420 + (rev / 1000) * 0.32 * ind.cyber) * (hi ? 1.5 : 1),
      umbrella: (480 + 0.12 * (glCore + (a.lines.includes("auto") ? autoCore : 0))) * (hi ? 1.6 : 1),
      epli: (380 + emp * 48) * (st === "CA" ? 1.6 : 1) * clm * (hi ? 1.3 : 1),
      tools: (240 + 75 * ind.gl) * clm,
      liquor: (520 + rev * 0.0011) * f("liab") * clm * lim,
    },
  };
}

export function declineReason(c, a) {
  const ind = CLASS[a.industry] || CLASS.other;
  if (c.noInd?.includes(a.industry)) return `Doesn’t insure ${ind.plural}`;
  const missing = a.lines.find((l) => c.noLines?.includes(l));
  if (missing) return `Doesn’t offer ${LINE[missing].name.toLowerCase()}`;
  if (c.maxRev && a.revenue > c.maxRev) return `Only insures businesses under ${shortMoney(c.maxRev)} in revenue`;
  if (c.maxEmp && empN(a) > c.maxEmp) return `Only insures businesses with ${c.maxEmp} or fewer people`;
  if (c.maxClaims != null && parseInt(a.claims, 10) > c.maxClaims) return "Requires fewer than 2 claims in the last 3 years";
  if (c.minYears && (a.years === "new" || a.years === "lt1")) return "Requires at least 1 year in business";
  return "";
}

export function computeQuotes(a, o) {
  const ok = availableLines(a.industry).map((l) => l.id);
  a = { ...a, lines: a.lines.filter((l) => ok.includes(l)) };
  const b = basePremiums(a, o);
  const quotes = [], declined = [];
  for (const c of CARRIERS) {
    const reason = declineReason(c, a);
    if (reason) { declined.push({ c, reason }); continue; }
    const lines = a.lines.map((id) => {
      let amt = b.p[id] * c.base * (c.lines?.[id] || 1) * (c.ind?.[a.industry] || 1) * noise(a, c.id + id);
      if (c.clean && a.claims === "0") amt *= c.clean;
      return { id, amt: Math.round(Math.max(amt, 125)) };
    });
    const annual = lines.reduce((s, l) => s + l.amt, 0);
    quotes.push({ c, lines, annual, payInFull: annual, monthly: annual / 12 + c.fee, score: annual * RATING[c.rating].adj, badges: [] });
  }
  if (quotes.length) {
    const byScore = [...quotes].sort((x, y) => x.score - y.score);
    const byPrice = [...quotes].sort((x, y) => x.annual - y.annual);
    const top = Math.max(...quotes.map((q) => RATING[q.c.rating].rank));
    const topRated = byPrice.find((q) => RATING[q.c.rating].rank === top);
    byScore[0].badges.push("Best value");
    byPrice[0].badges.push("Lowest price");
    if (topRated && topRated !== byScore[0]) topRated.badges.push("Top rated");
  }
  return { quotes, declined, tiv: b.tiv };
}

export const SORTS = {
  value: (x, y) => x.score - y.score,
  price: (x, y) => x.annual - y.annual,
  rating: (x, y) => RATING[y.c.rating].rank - RATING[x.c.rating].rank || x.annual - y.annual,
};

/* Fill gaps so an estimate can be shown before the form is finished. */
function withDefaults(a) {
  const d = { ...a };
  if (!d.space) d.space = "lease";
  if (!d.employees) d.employees = "2-5";
  if (!d.years) d.years = "3-10";
  if (!d.claims) d.claims = "0";
  if (!d.lines?.length) d.lines = recommend(d);
  return d;
}

export function estimate(a, o) {
  if (!a.industry) return null;
  const { quotes } = computeQuotes(withDefaults(a), o);
  if (!quotes.length) return null;
  const m = quotes.map((q) => q.monthly);
  return { low: Math.min(...m), high: Math.max(...m), count: quotes.length };
}

/* Typical monthly cost of each coverage for this business, used on the coverage step. */
export function lineEstimates(a, o) {
  if (!a.industry) return {};
  const d = withDefaults(a);
  const b = basePremiums(d, o);
  const out = {};
  for (const id of Object.keys(b.p)) out[id] = Math.max(125, b.p[id]) / 12;
  return out;
}

export function lineDetail(id, a, o, tiv) {
  const hi = o.limit === "2/4", L1 = hi ? "$2M" : "$1M", L2 = hi ? "$4M" : "$2M";
  switch (id) {
    case "gl": return `${L1} per claim · ${L2} total`;
    case "bop": return `${L1} / ${L2} liability · ${shortMoney(tiv)} property · ${money(o.deductible)} deductible`;
    case "property": return `${shortMoney(tiv)} coverage · ${money(o.deductible)} deductible`;
    case "wc": return "State statutory limits · $1M employer’s liability";
    case "pl": return `${L1} per claim`;
    case "auto": return `$1M combined limit · ${a.vehicles} vehicle${a.vehicles === 1 ? "" : "s"}`;
    case "cyber": return `${L1} limit`;
    case "umbrella": return `${L1} above your other policies`;
    case "epli": return `${L1} limit`;
    case "tools": return "$25k of tools and gear";
    case "liquor": return `${L1} per claim · ${L2} total`;
    default: return "";
  }
}

export function profileParts(a) {
  const ind = CLASS[a.industry];
  const st = zipState(a.zip);
  const parts = [];
  if (a.businessType || ind) parts.push(a.businessType || ind.short);
  if (st) parts.push(`${STATE_NAMES[st]} ${a.zip}`);
  if (a.space === "own") parts.push(`${num(a.sqft)} sq ft, owned`);
  else if (a.space === "lease") parts.push(`${num(a.sqft)} sq ft, leased`);
  else if (a.space === "home") parts.push("Home-based");
  else if (a.space === "mobile") parts.push("No fixed location");
  if (a.revenue) parts.push(`${shortMoney(a.revenue)} revenue`);
  const e = opt(EMPLOYEES, a.employees);
  if (e) parts.push(e.v === "1" ? "Just you" : `${e.label} people`);
  return parts;
}
