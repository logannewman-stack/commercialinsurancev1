/*
  Content for the industry landing pages at /insurance/:slug.
  Good targets for ads and search ("restaurant insurance", "contractor insurance").
*/
export const INDUSTRY_PAGES = [
  {
    slug: "restaurants", cls: "restaurant", name: "Restaurant insurance",
    h1: "Restaurant insurance, compared.",
    intro: "Cafés, bars, bakeries and food trucks face a mix of risks most businesses don’t: hot kitchens, busy dining rooms and, often, alcohol. Compare carriers that understand food service in one application.",
    risks: [
      ["Guest injuries", "Slips on a wet floor, a fall on the patio, or a reaction to something on the menu."],
      ["Kitchen fires", "Grease fires and equipment failures can close you for weeks."],
      ["Staff injuries", "Burns, cuts and strains are among the most common restaurant workers’ comp claims."],
      ["Alcohol", "If you serve drinks, you can be sued over what a guest does after leaving."],
    ],
    claim: "A grease fire damages the kitchen of a 60-seat café. Repairs, spoiled food and three weeks of lost income come to about $85,000.",
    faqs: [
      ["Do I need liquor liability if I only serve beer and wine?", "Usually, yes. Liquor liability covers claims involving anyone you served, and general liability policies typically exclude them. Many states and landlords also require it."],
      ["Does a business owner’s policy cover spoiled food?", "Many carriers offer food spoilage coverage as an add-on to a BOP for losses from a power outage or equipment breakdown. Ask your advisor to include it."],
    ],
  },
  {
    slug: "contractors", cls: "contractor", name: "Contractor insurance",
    h1: "Contractor insurance, compared.",
    intro: "General contractors, electricians, plumbers, roofers and every other trade need proof of insurance before they can start most jobs. Get the coverage clients ask for at a price that still lets you win the bid.",
    risks: [
      ["Property damage", "A slipped tool or a flooded bathroom on a client’s job site."],
      ["Crew injuries", "Falls and equipment injuries make trades some of the highest-risk work for workers’ comp."],
      ["Vehicles", "Trucks and vans driving between job sites all day."],
      ["Stolen tools", "Equipment left in trucks and on job sites overnight."],
    ],
    claim: "A plumber’s fitting fails after a remodel and floods a finished basement. Repairs and the homeowner’s hotel stay come to about $42,000.",
    faqs: [
      ["What is a certificate of insurance?", "A one-page document that proves you’re insured. Clients and general contractors usually ask for one before you start work, and some want to be added as an additional insured. Our advisors can issue certificates quickly once you’re covered."],
      ["Does general liability cover my own tools?", "No. General liability covers damage you cause to other people’s property. Tools and equipment coverage protects your own gear on job sites and in your truck."],
    ],
  },
  {
    slug: "retail", cls: "retail", name: "Retail store insurance",
    h1: "Retail store insurance, compared.",
    intro: "Boutiques, convenience stores, florists and online shops with a storefront all depend on their inventory and a steady flow of customers. Protect both with one application.",
    risks: [
      ["Customer injuries", "Trips over displays and slips at the entrance."],
      ["Theft and break-ins", "Stolen inventory, cash and a broken storefront."],
      ["Damaged stock", "Fire, burst pipes and storms can wipe out inventory overnight."],
      ["Card data", "Taking payments means holding data that’s worth protecting."],
    ],
    claim: "A burst pipe floods a boutique’s stockroom overnight. Ruined inventory and repairs total about $31,000.",
    faqs: [
      ["Is my inventory covered by general liability?", "No. Inventory is covered by commercial property insurance or a business owner’s policy, which bundles property with general liability."],
      ["Do I need product liability?", "If you sell products, claims that something you sold hurt someone are usually covered under the products portion of general liability. Check the limits with your advisor if you sell your own branded products."],
    ],
  },
  {
    slug: "professional-services", cls: "professional", name: "Professional services insurance",
    h1: "Insurance for professional services firms, compared.",
    intro: "Consultants, accountants, agencies, architects and lawyers sell expertise. The biggest risk is a client saying your work cost them money. Compare professional liability and the rest of your coverage in one place.",
    risks: [
      ["Mistakes and oversights", "A missed deadline, a wrong number or advice that didn’t work out."],
      ["Contract disputes", "Claims that your work didn’t match what was promised."],
      ["Data breaches", "Client files and financial data are prime targets."],
      ["Client requirements", "Many contracts require professional liability before you can sign."],
    ],
    claim: "A client says a missed filing deadline led to $60,000 in penalties and sues. Legal defense alone runs about $25,000.",
    faqs: [
      ["What’s the difference between professional and general liability?", "Professional liability covers financial harm from your work or advice. General liability covers injuries and property damage. Most firms that meet clients in person carry both."],
      ["I work from home. Do I still need coverage?", "Usually, yes. Homeowner’s policies rarely cover business claims, and professional liability follows your work wherever you do it."],
    ],
  },
  {
    slug: "tech", cls: "tech", name: "Tech company insurance",
    h1: "Tech and software insurance, compared.",
    intro: "Software companies, IT providers and freelance developers carry risks that standard business policies weren’t built for: outages, bugs and breaches. Compare tech-focused coverage in minutes.",
    risks: [
      ["Errors in your product", "A bug or outage that costs a customer money."],
      ["Cyber attacks", "Ransomware, breaches and fraudulent payment requests."],
      ["Client contracts", "Enterprise customers often require specific limits."],
      ["Growing teams", "Employment claims rise as you hire."],
    ],
    claim: "A billing bug double-charges a client’s customers for a week. The client claims $90,000 in refunds and lost business.",
    faqs: [
      ["What does tech E&O cover?", "Technology errors and omissions covers claims that your software or services failed to perform as promised. Many policies combine it with cyber coverage."],
      ["Do I need cyber insurance if I use cloud providers?", "Usually, yes. Cloud providers secure their infrastructure, but breaches through your accounts, code or staff are typically your responsibility."],
    ],
  },
  {
    slug: "healthcare", cls: "healthcare", name: "Healthcare practice insurance",
    h1: "Insurance for healthcare practices, compared.",
    intro: "Dental offices, therapists, chiropractors and clinics need malpractice coverage, plus protection for the practice itself. Compare carriers that understand healthcare in one application.",
    risks: [
      ["Professional claims", "Allegations that care or advice caused harm."],
      ["Patient injuries", "Falls in the waiting room or treatment area."],
      ["Patient records", "Health data is heavily regulated and costly to breach."],
      ["Equipment", "Expensive diagnostic and treatment equipment on site."],
    ],
    claim: "Ransomware locks a dental office’s scheduling and records system for five days. Recovery, notification and lost appointments cost about $70,000.",
    faqs: [
      ["Is malpractice the same as professional liability?", "Yes. In healthcare, professional liability is often called malpractice insurance. It covers claims that your care caused harm."],
      ["Does my employer’s policy cover me?", "If you’re employed, maybe. If you own the practice or work independently, you usually need your own policy."],
    ],
  },
  {
    slug: "salons-and-spas", cls: "beauty", name: "Salon and spa insurance",
    h1: "Salon and spa insurance, compared.",
    intro: "Hair salons, barbershops, nail studios and spas work hands-on with clients every day. Compare coverage for the services you provide and the space you provide them in.",
    risks: [
      ["Service injuries", "Chemical burns, allergic reactions and cuts."],
      ["Slips and falls", "Wet floors and loose hair around the chairs."],
      ["Equipment and products", "Chairs, dryers and retail inventory."],
      ["Booth renters", "Renters may need their own coverage, and you may need proof of it."],
    ],
    claim: "A client has a severe reaction to a hair treatment and needs medical care. The claim settles for about $18,000.",
    faqs: [
      ["Do booth renters need their own insurance?", "Usually, yes. Your policy typically covers your employees, not independent booth renters. Many owners require renters to carry their own professional and general liability."],
      ["What covers a reaction to a product I applied?", "Professional liability, sometimes called beauty professional liability, covers injuries caused by services you perform."],
    ],
  },
  {
    slug: "fitness", cls: "fitness", name: "Gym and fitness insurance",
    h1: "Gym and fitness studio insurance, compared.",
    intro: "Gyms, yoga and pilates studios and personal trainers help people push their limits, which comes with risk. Compare coverage built for fitness businesses.",
    risks: [
      ["Member injuries", "Strains, falls and equipment accidents."],
      ["Training advice", "Claims that a program or instruction caused an injury."],
      ["Equipment", "Machines, weights and mirrors are expensive to replace."],
      ["Instructors", "Employees and independent instructors need the right coverage."],
    ],
    claim: "A member is injured when a cable machine fails mid-set. Medical bills and the settlement total about $55,000.",
    faqs: [
      ["Do waivers protect my gym?", "Waivers help, but they don’t stop every lawsuit, and courts don’t always enforce them. Liability insurance pays for your defense either way."],
      ["I’m a personal trainer who works in other gyms. What do I need?", "Most independent trainers carry general and professional liability. The gym’s policy usually doesn’t cover independent trainers."],
    ],
  },
  {
    slug: "cleaning", cls: "cleaning", name: "Cleaning business insurance",
    h1: "Cleaning business insurance, compared.",
    intro: "Commercial cleaners, maid services and janitorial companies work inside other people’s homes and offices. Clients expect you to be insured, and many ask for proof.",
    risks: [
      ["Damage to client property", "A broken heirloom or a stained floor."],
      ["Theft accusations", "Claims that something went missing after a cleaning."],
      ["Crew injuries", "Slips, lifting injuries and chemical exposure."],
      ["Vehicles", "Driving crews and supplies between jobs."],
    ],
    claim: "A cleaning product ruins a client’s hardwood floors. Refinishing and furniture moving cost about $12,000.",
    faqs: [
      ["What is a janitorial bond?", "A bond that reimburses your client if an employee steals from them. It isn’t insurance for you, but many commercial clients require it. Ask your advisor to add one."],
      ["Does general liability cover damage while I’m cleaning?", "Generally, yes, for accidental damage to client property. Some policies limit damage to items you’re working on directly, so check the policy details."],
    ],
  },
  {
    slug: "auto-services", cls: "autoservice", name: "Auto service insurance",
    h1: "Auto repair and detailing insurance, compared.",
    intro: "Repair shops, body shops, car washes and mobile detailers spend their days with customers’ vehicles. Compare coverage for the cars in your care and the shop around them.",
    risks: [
      ["Customer vehicles", "Damage to a car while it’s in your shop or being detailed."],
      ["Faulty work", "A repair that fails after the car leaves."],
      ["Shop injuries", "Lifts, tools and chemicals."],
      ["Equipment", "Lifts, diagnostic tools and pressure washers."],
    ],
    claim: "A customer’s car rolls off a lift and hits a workbench. Repairs to the car and the shop come to about $16,000.",
    faqs: [
      ["Does general liability cover customers’ cars?", "Usually not while they’re in your care. Garagekeepers coverage protects customer vehicles you’re storing, repairing or detailing. Ask your advisor to include it."],
      ["I’m a mobile detailer. Do I need commercial auto?", "If you drive your vehicle for work and carry equipment, a personal auto policy may not cover accidents. Commercial auto or a business-use endorsement usually does."],
    ],
  },
  {
    slug: "real-estate", cls: "realestate", name: "Real estate insurance",
    h1: "Insurance for property owners and real estate pros, compared.",
    intro: "Landlords, property managers and agents carry risks that follow the property and the deal. Compare coverage for buildings, tenants and the advice you give.",
    risks: [
      ["Tenant and visitor injuries", "Falls on stairs, icy walkways and common areas."],
      ["Building damage", "Fire, storms and water damage to the property."],
      ["Lost rent", "Income lost while a damaged unit can’t be rented."],
      ["Transaction claims", "Agents and managers can be sued over advice and disclosures."],
    ],
    claim: "A tenant’s guest falls on an icy walkway and breaks a hip. Medical bills and the settlement total about $140,000.",
    faqs: [
      ["Is a landlord policy different from homeowner’s insurance?", "Yes. Homeowner’s policies usually don’t cover properties you rent out. Landlord or commercial property policies cover the building, your liability and lost rent."],
      ["Do I need an umbrella policy?", "Owners with several properties often add an umbrella for extra liability limits, since a single serious injury can exceed a standard $1M limit."],
    ],
  },
  {
    slug: "transportation", cls: "transport", name: "Transportation insurance",
    h1: "Trucking and delivery insurance, compared.",
    intro: "Trucking companies, couriers, movers and towing operators spend their business on the road. Compare commercial auto and the rest of your coverage in one application.",
    risks: [
      ["Accidents", "Crashes involving your vehicles and drivers."],
      ["Cargo", "Damage to or theft of the goods you carry."],
      ["Driver injuries", "Loading, unloading and long hours behind the wheel."],
      ["Large claims", "Serious accidents can exceed standard limits."],
    ],
    claim: "A box truck rear-ends a car in traffic. Vehicle repairs and medical bills total about $65,000.",
    faqs: [
      ["Do I need cargo insurance?", "If you haul goods for others, usually yes. Shippers and brokers often require motor truck cargo coverage, and commercial auto doesn’t cover the freight itself."],
      ["Why is commercial auto so expensive for trucking?", "Heavier vehicles, more miles and larger potential claims all raise the price. Driver records and safety programs have a big effect, so comparing carriers matters."],
    ],
  },
];

export const INDUSTRY_PAGE = Object.fromEntries(INDUSTRY_PAGES.map((p) => [p.slug, p]));
export const PAGE_FOR_CLASS = Object.fromEntries(INDUSTRY_PAGES.map((p) => [p.cls, p]));
