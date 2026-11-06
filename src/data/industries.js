/*
  Risk classes drive pricing. Business types are what people search for;
  each one maps to a class. Rating factors are illustrative.
*/
export const CLASSES = [
  { id: "restaurant", label: "Restaurant, café or bar", short: "Restaurant", plural: "restaurants and bars", gl: 2.4, prop: 1.5, wc: 1.6, wage: 30000, contents: 45, pl: 0.5, cyber: 1, auto: 1 },
  { id: "retail", label: "Retail store", short: "Retail", plural: "retail stores", gl: 1.5, prop: 1.1, wc: 1.3, wage: 32000, contents: 60, pl: 0.5, cyber: 1.3, auto: 1 },
  { id: "contractor", label: "Contractor or trades", short: "Contractor", plural: "contractors", gl: 4.6, prop: 1, wc: 6.2, wage: 52000, contents: 20, pl: 1, cyber: 0.8, auto: 1.3 },
  { id: "professional", label: "Professional services", short: "Professional services", plural: "professional services firms", gl: 0.9, prop: 0.8, wc: 0.25, wage: 72000, contents: 25, pl: 2.2, cyber: 1.4, auto: 0.9 },
  { id: "tech", label: "Tech or software", short: "Tech", plural: "tech companies", gl: 0.8, prop: 0.8, wc: 0.2, wage: 95000, contents: 30, pl: 2, cyber: 1.7, auto: 0.9 },
  { id: "healthcare", label: "Healthcare or wellness", short: "Healthcare", plural: "healthcare practices", gl: 1.6, prop: 1, wc: 1.1, wage: 58000, contents: 55, pl: 3, cyber: 2.2, auto: 0.9 },
  { id: "beauty", label: "Salon, spa or barber", short: "Beauty and personal care", plural: "salons and spas", gl: 1.8, prop: 1, wc: 1, wage: 30000, contents: 35, pl: 1.2, cyber: 0.9, auto: 1 },
  { id: "fitness", label: "Gym or fitness studio", short: "Fitness", plural: "gyms and studios", gl: 2.6, prop: 1, wc: 1.7, wage: 34000, contents: 40, pl: 1.3, cyber: 0.9, auto: 1 },
  { id: "cleaning", label: "Cleaning or janitorial", short: "Cleaning", plural: "cleaning companies", gl: 3, prop: 0.9, wc: 3.8, wage: 31000, contents: 10, pl: 0.8, cyber: 0.8, auto: 1.1 },
  { id: "autoservice", label: "Auto repair or detailing", short: "Auto services", plural: "auto service shops", gl: 2.8, prop: 1.3, wc: 3.2, wage: 42000, contents: 50, pl: 0.8, cyber: 0.9, auto: 1.2 },
  { id: "realestate", label: "Real estate or property owner", short: "Real estate", plural: "property owners", gl: 1.2, prop: 1.1, wc: 0.9, wage: 60000, contents: 15, pl: 1.5, cyber: 1.1, auto: 0.9 },
  { id: "manufacturing", label: "Manufacturing or wholesale", short: "Manufacturing", plural: "manufacturers", gl: 2.8, prop: 1.4, wc: 3.1, wage: 48000, contents: 70, pl: 0.9, cyber: 1.1, auto: 1.2 },
  { id: "transport", label: "Transportation or delivery", short: "Transportation", plural: "transportation companies", gl: 2.2, prop: 1, wc: 5, wage: 45000, contents: 10, pl: 0.8, cyber: 0.9, auto: 2.2 },
  { id: "other", label: "Something else", short: "Small business", plural: "most small businesses", gl: 1.8, prop: 1, wc: 1.8, wage: 40000, contents: 30, pl: 1, cyber: 1, auto: 1 },
];
export const CLASS = Object.fromEntries(CLASSES.map((c) => [c.id, c]));

const T = (label, cls, extra = {}) => ({ label, cls, ...extra });
export const BUSINESS_TYPES = [
  T("Restaurant", "restaurant", { k: "dining diner grill" }), T("Café or coffee shop", "restaurant", { k: "coffee espresso" }),
  T("Bar or pub", "restaurant", { k: "tavern lounge nightclub" }), T("Bakery", "restaurant", { k: "pastry donut" }),
  T("Food truck", "restaurant", { space: "mobile", k: "mobile food" }), T("Catering", "restaurant", { space: "mobile" }),
  T("Pizzeria", "restaurant"), T("Ice cream or dessert shop", "restaurant", { k: "frozen yogurt" }),
  T("Clothing boutique", "retail", { k: "apparel fashion" }), T("Convenience store", "retail", { k: "corner store gas" }),
  T("Florist", "retail", { k: "flowers" }), T("Gift shop", "retail"), T("Jewelry store", "retail"), T("Pet store", "retail", { k: "pet supply" }),
  T("Furniture store", "retail"), T("Liquor store", "retail", { k: "wine beer" }), T("Online store", "retail", { space: "home", k: "ecommerce e-commerce shopify amazon" }),
  T("General contractor", "contractor", { k: "construction builder remodel" }), T("Electrician", "contractor", { space: "mobile", k: "electrical" }),
  T("Plumber", "contractor", { space: "mobile", k: "plumbing" }), T("HVAC contractor", "contractor", { space: "mobile", k: "heating air conditioning" }),
  T("Roofer", "contractor", { space: "mobile", k: "roofing" }), T("Painter", "contractor", { space: "mobile", k: "painting" }),
  T("Carpenter", "contractor", { space: "mobile", k: "woodwork cabinets" }), T("Handyman", "contractor", { space: "mobile", k: "repairs" }),
  T("Landscaper", "contractor", { space: "mobile", k: "lawn care mowing gardening tree" }), T("Flooring installer", "contractor", { space: "mobile", k: "tile carpet" }),
  T("Accountant or CPA", "professional", { k: "tax bookkeeping" }), T("Bookkeeper", "professional"), T("Law firm", "professional", { k: "lawyer attorney legal" }),
  T("Consultant", "professional", { k: "consulting advisor" }), T("Marketing agency", "professional", { k: "advertising seo social media" }),
  T("Architect", "professional"), T("Engineer", "professional", { k: "engineering" }), T("Graphic designer", "professional", { space: "home", k: "design" }),
  T("Staffing agency", "professional", { k: "recruiter recruiting" }), T("Photographer", "professional", { space: "mobile", k: "photography video" }),
  T("Software company", "tech", { k: "saas startup app" }), T("IT services", "tech", { k: "msp managed services computer repair" }),
  T("Web developer", "tech", { space: "home", k: "website freelance" }),
  T("Dentist", "healthcare", { k: "dental orthodontist" }), T("Chiropractor", "healthcare"), T("Physical therapist", "healthcare", { k: "pt rehab" }),
  T("Medical clinic", "healthcare", { k: "doctor physician urgent care" }), T("Mental health therapist", "healthcare", { k: "counselor psychologist" }),
  T("Massage therapist", "healthcare", { k: "massage" }), T("Optometrist", "healthcare", { k: "eye" }), T("Veterinarian", "healthcare", { k: "vet animal hospital" }),
  T("Med spa", "healthcare", { k: "botox aesthetics" }), T("Home health care", "healthcare", { space: "mobile", k: "caregiver senior" }),
  T("Hair salon", "beauty", { k: "hairdresser stylist" }), T("Barbershop", "beauty", { k: "barber" }), T("Nail salon", "beauty", { k: "manicure" }),
  T("Day spa", "beauty", { k: "spa facial" }), T("Tattoo studio", "beauty", { k: "piercing" }), T("Esthetician", "beauty", { k: "skin care lash brow" }),
  T("Gym", "fitness", { k: "fitness center health club" }), T("Yoga studio", "fitness"), T("Pilates studio", "fitness"), T("CrossFit box", "fitness"),
  T("Personal trainer", "fitness", { space: "mobile", k: "coach" }), T("Martial arts studio", "fitness", { k: "karate jiu jitsu boxing" }), T("Dance studio", "fitness"),
  T("Commercial cleaning", "cleaning", { space: "mobile", k: "office cleaning" }), T("House cleaning", "cleaning", { space: "mobile", k: "maid residential" }),
  T("Janitorial service", "cleaning", { space: "mobile", k: "janitor" }), T("Carpet cleaning", "cleaning", { space: "mobile" }),
  T("Window cleaning", "cleaning", { space: "mobile" }), T("Pressure washing", "cleaning", { space: "mobile", k: "power washing" }),
  T("Pest control", "cleaning", { space: "mobile", k: "exterminator" }),
  T("Auto repair shop", "autoservice", { k: "mechanic garage" }), T("Mobile detailing", "autoservice", { space: "mobile", k: "car detailing auto detail" }),
  T("Car wash", "autoservice"), T("Auto body shop", "autoservice", { k: "collision paint" }), T("Tire shop", "autoservice"),
  T("Mobile mechanic", "autoservice", { space: "mobile" }),
  T("Landlord or rental property", "realestate", { k: "apartment rental lessor" }), T("Property management", "realestate", { k: "property manager hoa" }),
  T("Real estate agent", "realestate", { k: "realtor broker brokerage" }), T("Short-term rental host", "realestate", { k: "airbnb vrbo vacation" }),
  T("Manufacturer", "manufacturing", { k: "factory fabrication" }), T("Wholesaler or distributor", "manufacturing", { k: "wholesale distribution" }),
  T("Machine shop", "manufacturing", { k: "cnc welding" }), T("Print shop", "manufacturing", { k: "printing signs" }), T("Brewery or distillery", "manufacturing", { k: "winery beer spirits" }),
  T("Trucking company", "transport", { space: "mobile", k: "freight hauling semi" }), T("Courier or delivery", "transport", { space: "mobile", k: "last mile courier" }),
  T("Moving company", "transport", { space: "mobile", k: "movers" }), T("Towing company", "transport", { space: "mobile", k: "tow" }),
  T("Limo or car service", "transport", { space: "mobile", k: "chauffeur rideshare" }),
  T("Event planner", "other", { space: "home", k: "wedding" }), T("Daycare", "other", { k: "childcare preschool" }), T("Nonprofit", "other", { k: "charity church" }),
  T("Pet groomer", "other", { k: "dog grooming" }), T("Dog walker or pet sitter", "other", { space: "mobile", k: "pet sitting" }), T("Tutoring", "other", { space: "home", k: "education teacher" }),
];

export const POPULAR = ["Restaurant", "General contractor", "Clothing boutique", "Consultant", "Hair salon", "Auto repair shop", "Commercial cleaning", "Dentist"];

function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim(); }

export function searchBusinesses(query, limit = 7) {
  const q = norm(query || "");
  if (!q) return POPULAR.map((l) => BUSINESS_TYPES.find((b) => b.label === l)).filter(Boolean).slice(0, limit);
  const scored = [];
  for (const b of BUSINESS_TYPES) {
    const label = norm(b.label), extra = norm((b.k || "") + " " + CLASS[b.cls].label);
    let s = 0;
    if (label.startsWith(q)) s = 5;
    else if (label.split(" ").some((w) => w.startsWith(q))) s = 4;
    else if (label.includes(q)) s = 3;
    else if (extra.split(" ").some((w) => w.startsWith(q))) s = 2;
    else if (extra.includes(q)) s = 1;
    if (s) scored.push([s, b]);
  }
  scored.sort((a, b) => b[0] - a[0] || a[1].label.length - b[1].label.length);
  return scored.slice(0, limit).map((x) => x[1]);
}
