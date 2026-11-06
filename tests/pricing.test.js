import { test } from "node:test";
import assert from "node:assert/strict";
import { computeQuotes, estimate, SORTS } from "../src/lib/pricing.js";
import { zipState } from "../src/data/geo.js";
import { searchBusinesses } from "../src/data/industries.js";
import { recommend } from "../src/data/coverage.js";

const base = {
  industry: "restaurant", businessType: "Café or coffee shop", zip: "78704", space: "lease", sqft: 2400, revenue: 850000,
  employees: "6-10", years: "3-10", claims: "0", lines: ["bop", "wc", "liquor"], vehicles: 2, name: "Maya", business: "Brightside Café",
};
const opts = { limit: "1/2", deductible: 1000, pay: "monthly", sort: "value" };

test("each quote's total is the sum of its coverage lines", () => {
  const { quotes } = computeQuotes(base, opts);
  assert.ok(quotes.length > 0);
  for (const q of quotes) assert.equal(q.annual, q.lines.reduce((s, l) => s + l.amt, 0));
});

test("exactly one best value and one lowest price badge", () => {
  const { quotes } = computeQuotes(base, opts);
  assert.equal(quotes.filter((q) => q.badges.includes("Best value")).length, 1);
  assert.equal(quotes.filter((q) => q.badges.includes("Lowest price")).length, 1);
  const lowest = [...quotes].sort(SORTS.price)[0];
  assert.ok(lowest.badges.includes("Lowest price"));
});

test("carriers that don't insure an industry are listed with a reason", () => {
  const { quotes, declined } = computeQuotes(base, opts);
  assert.ok(!quotes.some((q) => q.c.id === "kittering"));
  const k = declined.find((d) => d.c.id === "kittering");
  assert.match(k.reason, /restaurants/);
});

test("higher limits cost more and higher deductibles cost less", () => {
  const sum = (o) => computeQuotes(base, { ...opts, ...o }).quotes.reduce((s, q) => s + q.annual, 0);
  assert.ok(sum({ limit: "2/4" }) > sum({}));
  assert.ok(sum({ deductible: 5000 }) < sum({ deductible: 500 }));
});

test("claims history raises prices", () => {
  const total = (claims) => computeQuotes({ ...base, claims }, opts).quotes.find((q) => q.c.id === "everstone").annual;
  assert.ok(total("1") > total("0"));
});

test("estimate works before the form is finished", () => {
  const e = estimate({ industry: "contractor", zip: "", lines: [], revenue: 500000, sqft: 2500, vehicles: 2 }, opts);
  assert.ok(e && e.low > 0 && e.high >= e.low);
  assert.equal(estimate({ industry: null, lines: [] }, opts), null);
});

test("ZIP codes map to states", () => {
  assert.equal(zipState("78704"), "TX");
  assert.equal(zipState("10001"), "NY");
  assert.equal(zipState("90210"), "CA");
  assert.equal(zipState("33101"), "FL");
  assert.equal(zipState("00000"), null);
  assert.equal(zipState("123"), null);
});

test("business search finds common businesses", () => {
  assert.equal(searchBusinesses("dent")[0].label, "Dentist");
  assert.equal(searchBusinesses("food truck")[0].cls, "restaurant");
  assert.equal(searchBusinesses("hvac")[0].cls, "contractor");
  assert.equal(searchBusinesses("zzzz").length, 0);
});

test("solo owners aren't pushed toward workers' comp", () => {
  assert.ok(recommend({ industry: "restaurant", space: "lease", employees: "6-10" }).includes("wc"));
  assert.ok(!recommend({ industry: "restaurant", space: "lease", employees: "1" }).includes("wc"));
  assert.ok(!recommend({ industry: "retail", space: "home", employees: "1" }).includes("bop"));
});
