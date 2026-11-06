export const SPACES = [
  { v: "lease", label: "I lease a space", hint: "Storefront, office, unit or warehouse" },
  { v: "own", label: "I own the building", hint: "You own the property you operate from" },
  { v: "home", label: "I work from home", hint: "Home office or home-based business" },
  { v: "mobile", label: "No fixed location", hint: "You work at customer sites or on the road" },
];
export const EMPLOYEES = [
  { v: "1", label: "Just me", n: 1 }, { v: "2-5", label: "2–5", n: 4 }, { v: "6-10", label: "6–10", n: 8 },
  { v: "11-25", label: "11–25", n: 18 }, { v: "26-50", label: "26–50", n: 38 }, { v: "51-100", label: "51–100", n: 75 },
  { v: "100+", label: "More than 100", n: 150 },
];
export const YEARS = [
  { v: "new", label: "Not open yet", f: 1.15 }, { v: "lt1", label: "Under 1 year", f: 1.12 }, { v: "1-3", label: "1–3 years", f: 1.05 },
  { v: "3-10", label: "3–10 years", f: 1 }, { v: "10+", label: "10+ years", f: 0.93 },
];
export const CLAIMS = [{ v: "0", label: "None", f: 1 }, { v: "1", label: "One", f: 1.2 }, { v: "2", label: "Two or more", f: 1.45 }];
export const TIMING = [
  { v: "now", label: "As soon as possible" }, { v: "30", label: "Within 30 days" }, { v: "renewal", label: "At my next renewal" }, { v: "browsing", label: "Just comparing" },
];
export const opt = (list, v) => list.find((o) => o.v === v) || null;
