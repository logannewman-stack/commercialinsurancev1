/*
  DEMO CARRIERS. These companies are fictional and exist only so the site
  can be shown working. Replace this file (and src/lib/pricing.js) with real
  carrier or comparative-rater integrations before launch.
*/
export const CARRIERS = [
  { id: "everstone", name: "Everstone Indemnity", rating: "A+", base: 1.03, fee: 0, lines: { wc: 0.86, gl: 0.97 },
    about: "A national carrier known for workers’ comp and fast certificates.",
    perks: ["Pay-as-you-go workers’ comp", "Certificates issued same day", "No installment fees"] },
  { id: "ashgrove", name: "Ashgrove Mutual", rating: "A+", base: 1.06, fee: 6, lines: { property: 0.86, bop: 0.91 }, noInd: ["transport"],
    about: "A policyholder-owned mutual that’s strong on property coverage.",
    perks: ["Claims handled in-house", "Policyholder dividends in good years"] },
  { id: "bellmoor", name: "Bellmoor Casualty", rating: "A", base: 0.99, fee: 0, lines: { gl: 0.93 }, ind: { contractor: 0.88, cleaning: 0.9, autoservice: 0.92 }, noInd: ["healthcare", "tech"],
    about: "A small-business specialist with sharp pricing for trades and services.",
    perks: ["Monthly billing with no fees", "Certificates issued same day"] },
  { id: "copperline", name: "Copperline", rating: "A-", base: 0.9, fee: 4, noInd: ["contractor", "transport", "manufacturing"], noLines: ["auto", "umbrella"], maxRev: 5e6,
    about: "A digital carrier for lower-risk small businesses.",
    perks: ["Change your policy online anytime", "Instant certificates"] },
  { id: "driftwood", name: "Driftwood Specialty", rating: "A", base: 1.17, fee: 8, ind: { contractor: 0.9, transport: 0.88, fitness: 0.94, restaurant: 0.97 },
    about: "A specialty carrier for higher-risk and hard-to-place businesses.",
    perks: ["Insures hard-to-place businesses", "Flexible underwriting"] },
  { id: "fernhill", name: "Fernhill Assurance", rating: "A", base: 1.01, fee: 5, lines: { cyber: 0.78, pl: 0.83 }, noInd: ["manufacturing", "transport", "autoservice"], noLines: ["auto", "liquor"],
    about: "Focused on professional and cyber coverage for service firms.",
    perks: ["24/7 data breach response team", "Free legal hotline"] },
  { id: "halden", name: "Halden Commercial", rating: "A-", base: 0.95, fee: 6, clean: 0.94, maxClaims: 1, maxRev: 1e7,
    about: "A regional carrier that rewards a clean claims history.",
    perks: ["Discount for a clean claims history", "Save up to 10% when you bundle"] },
  { id: "kittering", name: "Kittering Underwriters", rating: "A+", base: 1.09, fee: 0, noInd: ["restaurant", "beauty"], minYears: true,
    about: "A high-touch carrier for established businesses.",
    perks: ["A dedicated account manager", "Free annual coverage review", "No installment fees"] },
  { id: "lanternbay", name: "Lanternbay", rating: "A-", base: 0.94, fee: 3, maxRev: 2.5e6, maxEmp: 25, noLines: ["umbrella", "epli", "liquor"],
    about: "An online-first carrier for very small businesses.",
    perks: ["Buy online in minutes", "Cancel anytime with no fee"] },
];
export const CARRIER = Object.fromEntries(CARRIERS.map((c) => [c.id, c]));
export const RATING = { "A+": { rank: 3, adj: 0.93, word: "Superior" }, A: { rank: 2, adj: 1, word: "Excellent" }, "A-": { rank: 1, adj: 1.05, word: "Excellent" } };
