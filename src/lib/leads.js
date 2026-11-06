import { DEMO_QUOTES, IS_PREVIEW } from "../config.js";
import { profileParts } from "./pricing.js";
import { LINE } from "../data/coverage.js";

/*
  Sends a lead to /api/lead (see api/lead.js). Stages:
    quote_request  someone finished the form and saw quotes
    callback       someone asked an advisor to call
    bind_request   someone chose a quote and asked to buy it
*/
export async function submitLead(stage, a, extra = {}) {
  const payload = {
    stage,
    contact: { name: a.name, business: a.business, email: a.email, phone: a.phone },
    profile: profileParts(a).join(" · "),
    answers: {
      industry: a.industry, businessType: a.businessType, zip: a.zip, space: a.space, sqft: a.sqft,
      revenue: a.revenue, employees: a.employees, years: a.years, claims: a.claims, vehicles: a.vehicles,
      coverage: a.lines.map((l) => LINE[l]?.name || l), timing: a.timing,
    },
    documents: a.docs ? { kinds: a.docs.kinds, carrier: a.docs.carrier, renews: a.docs.expiration, currentPremium: a.docs.premium } : null,
    ...extra,
    demo: DEMO_QUOTES,
    page: typeof window !== "undefined" ? window.location.href : "",
  };
  if (IS_PREVIEW) return { ok: false, preview: true };
  try {
    const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, ...body };
  } catch {
    return { ok: false, error: "network" };
  }
}
