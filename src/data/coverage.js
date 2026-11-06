export const LINES = [
  { id: "gl", name: "General liability", short: "General liability", abbr: "GL",
    desc: "Customer injuries, damage you cause to someone else’s property, and advertising claims.",
    covers: ["Customer injuries at your business", "Damage you cause to a client’s property", "Libel, slander and advertising claims", "Legal defense, even for groundless suits"],
    excludes: ["Injuries to your own employees", "Your own building and equipment", "Mistakes in professional advice"],
    example: "A customer slips on a wet floor and breaks a wrist. Medical bills and a settlement come to $38,000.",
    who: "Almost every business. Landlords and clients often require it." },
  { id: "bop", name: "Business owner’s policy", short: "Business owner’s policy", abbr: "BOP",
    desc: "General liability and commercial property in one bundled policy, usually for less.",
    covers: ["Everything in general liability", "Your building, equipment and stock", "Lost income while you’re closed after a covered loss"],
    excludes: ["Workers’ compensation", "Business vehicles", "Professional mistakes"],
    example: "A kitchen fire closes a café for three weeks. The BOP pays for repairs and the income lost while it was closed.",
    who: "Small businesses with a storefront, office or inventory." },
  { id: "property", name: "Commercial property", short: "Property",
    desc: "Your building, equipment, furniture and stock after a fire, theft or storm.",
    covers: ["Your building, if you own it", "Equipment, furniture and inventory", "Improvements you made to a leased space"],
    excludes: ["Flood and earthquake, which are usually separate", "Normal wear and tear"],
    example: "A weekend break-in: $14,000 of stolen equipment and a broken storefront window.",
    who: "Anyone who owns a building or keeps valuable equipment on site." },
  { id: "wc", name: "Workers’ compensation", short: "Workers’ comp", abbr: "WC",
    desc: "Medical bills and lost wages when an employee is hurt on the job. Required in most states once you hire.",
    covers: ["Medical bills for on-the-job injuries", "A share of wages while an employee recovers", "Legal costs if an employee sues over an injury"],
    excludes: ["Injuries outside of work", "Independent contractors, in most cases"],
    example: "A line cook burns a hand and misses six weeks of work. Medical bills and wages come to $21,000.",
    who: "Any business with employees. Most states require it." },
  { id: "pl", name: "Professional liability", short: "Professional liability", abbr: "E&O",
    desc: "Claims that your advice, design or service cost a client money.",
    covers: ["Mistakes, oversights and missed deadlines", "Claims that your work didn’t meet the contract", "Defense costs, even if you did nothing wrong"],
    excludes: ["Injuries and property damage", "Intentional wrongdoing"],
    example: "A client says a missed tax filing cost them $60,000 in penalties.",
    who: "Consultants, agencies, healthcare providers and tech firms." },
  { id: "auto", name: "Commercial auto", short: "Commercial auto",
    desc: "Accidents in cars, trucks and vans the business owns or drives.",
    covers: ["Accidents in business-owned vehicles", "Injuries and damage to other people", "Your own vehicle, with collision coverage"],
    excludes: ["Employees’ personal cars, unless you add hired and non-owned auto"],
    example: "A delivery van rear-ends a car at a red light. Repairs and medical bills total $27,000.",
    who: "Businesses with vehicles or crews that drive to job sites." },
  { id: "cyber", name: "Cyber liability", short: "Cyber liability",
    desc: "Data breaches, ransomware, and the cost of notifying customers.",
    covers: ["Breach response and customer notification", "Ransomware recovery and lost income", "Fraudulent wire transfers, with social engineering coverage"],
    excludes: ["Upgrades to your systems", "Known security flaws you didn’t fix, on some policies"],
    example: "Ransomware locks a booking system for four days. Recovery and lost sales total $45,000.",
    who: "Anyone who stores customer data or takes card payments." },
  { id: "umbrella", name: "Commercial umbrella", short: "Umbrella",
    desc: "Extra limits on top of your liability and auto policies for large claims.",
    covers: ["Extra limits above general liability, auto and employer’s liability", "Large judgments that exceed your other policies"],
    excludes: ["Anything your underlying policies exclude"],
    example: "A serious accident leads to a $1.6M judgment. The auto policy pays $1M and the umbrella pays the rest.",
    who: "Businesses with big contracts or higher-risk work." },
  { id: "epli", name: "Employment practices liability", short: "Employment practices", abbr: "EPLI",
    desc: "Employee claims of harassment, discrimination or wrongful termination.",
    covers: ["Harassment and discrimination claims", "Wrongful termination claims", "Defense costs and settlements"],
    excludes: ["Wage and hour disputes, on most policies"],
    example: "A former employee sues over a firing. Defense and settlement cost $52,000.",
    who: "Businesses with several employees." },
  { id: "tools", name: "Tools and equipment", short: "Tools and equipment",
    desc: "Gear you take to job sites, covered wherever it goes.",
    covers: ["Tools and equipment on job sites and in transit", "Theft from a locked vehicle"],
    excludes: ["Wear and tear", "Equipment you rent out to others"],
    example: "Thieves take $9,000 of tools from a work truck overnight.",
    who: "Contractors and mobile service businesses." },
  { id: "liquor", name: "Liquor liability", short: "Liquor liability", only: ["restaurant"],
    desc: "Claims involving a guest you served alcohol.",
    covers: ["Injuries or damage caused by a guest you served", "Legal defense"],
    excludes: ["Your own employees drinking on the job"],
    example: "A guest leaves after several drinks and causes a crash. The injured driver sues the bar.",
    who: "Restaurants and bars that serve alcohol." },
];
export const LINE = Object.fromEntries(LINES.map((l) => [l.id, l]));
export const EXPLORER = ["gl", "bop", "property", "wc", "pl", "auto", "cyber", "umbrella"];

const REC = {
  restaurant: ["bop", "wc", "liquor"], retail: ["bop", "wc", "cyber"], contractor: ["gl", "wc", "auto", "tools"],
  professional: ["pl", "gl", "cyber"], tech: ["pl", "cyber", "gl"], healthcare: ["pl", "gl", "wc"], beauty: ["bop", "pl", "wc"],
  fitness: ["bop", "pl", "wc"], cleaning: ["gl", "wc", "auto"], autoservice: ["bop", "wc"], realestate: ["property", "gl", "umbrella"],
  manufacturing: ["gl", "property", "wc", "auto"], transport: ["auto", "gl", "wc"], other: ["bop", "wc"],
};

export function availableLines(industry) {
  return LINES.filter((l) => !l.only || l.only.includes(industry));
}

export function recommend(a) {
  let r = [...(REC[a.industry] || REC.other)];
  if (a.employees === "1") r = r.filter((x) => x !== "wc" && x !== "epli");
  const fixed = a.space === "own" || a.space === "lease";
  if (a.space && !fixed) r = r.map((x) => (x === "bop" ? "gl" : x === "property" ? "tools" : x));
  if (a.space === "mobile" && !r.includes("tools") && ["cleaning", "autoservice", "beauty", "fitness"].includes(a.industry)) r.push("tools");
  return r.filter((x, i) => r.indexOf(x) === i);
}
