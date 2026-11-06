import { IS_PREVIEW } from "../config.js";
import { CLASS } from "../data/industries.js";
import { LINE } from "../data/coverage.js";

export const KINDS = [
  { v: "certificate", label: "Certificate (ACORD 25)" },
  { v: "application", label: "ACORD application" },
  { v: "declarations", label: "Declarations page" },
  { v: "loss_runs", label: "Loss runs" },
  { v: "other", label: "Something else" },
];
export const KIND = Object.fromEntries(KINDS.map((k) => [k.v, k]));

const PDF = "application/pdf";
const OK_IMAGE = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_FILES = 10;
const MAX_PDF = 3_000_000;
const MAX_TOTAL = 3_200_000; // raw bytes; ~4.3 MB once base64-encoded

export function guessKind(name = "") {
  const n = name.toLowerCase();
  if (/acord[\s_-]*25|certificate|\bcoi\b/.test(n)) return "certificate";
  if (/acord|application|\bapp\b|12[5-7]|130|140/.test(n)) return "application";
  if (/dec(laration)?s?[\s_-]*page|declarations|\bdec\b|policy/.test(n)) return "declarations";
  if (/loss[\s_-]*run/.test(n)) return "loss_runs";
  return "certificate";
}

const toBase64 = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(",")[1] || "");
  r.onerror = () => reject(r.error);
  r.readAsDataURL(blob);
});

/* Shrinks a photo to at most 2000px on its long side as a JPEG. Also converts HEIC where the browser can decode it. */
async function compress(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale), h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("encode");
  return blob;
}

let seq = 0;
/* Turns a File into an upload item, or throws an Error with a message for the customer. */
export async function prepare(file) {
  const isPdf = file.type === PDF || /\.pdf$/i.test(file.name);
  const isHeic = /hei[cf]$/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
  if (!isPdf && !file.type.startsWith("image/") && !isHeic) throw new Error(`${file.name} isn’t a PDF or photo.`);
  if (isPdf) {
    if (file.size > MAX_PDF) throw new Error(`${file.name} is over 3 MB. Upload just the pages with your coverage details.`);
    return { id: ++seq, name: file.name, type: PDF, size: file.size, data: await toBase64(file), kind: guessKind(file.name), preview: null };
  }
  let blob;
  try { blob = await compress(file); }
  catch {
    if (!OK_IMAGE.includes(file.type) || file.size > MAX_PDF) throw new Error(`We couldn’t open ${file.name}. Try a JPG or PNG, or take a new photo.`);
    blob = file;
  }
  const name = file.name.replace(/\.(hei[cf]|png|webp|gif)$/i, ".jpg");
  return { id: ++seq, name, type: blob.type || "image/jpeg", size: blob.size, data: await toBase64(blob), kind: guessKind(file.name), preview: URL.createObjectURL(blob) };
}

export const totalBytes = (items) => items.reduce((s, f) => s + f.size, 0);
export const tooBig = (items) => totalBytes(items) > MAX_TOTAL;

/* Sends the files to /api/documents. In the claude.ai preview there's no backend. */
export async function readDocuments(items, contact) {
  if (IS_PREVIEW) return { ok: false, preview: true };
  try {
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: contact.email, phone: contact.phone, files: items.map(({ name, type, kind, data }) => ({ name, type, kind: KIND[kind]?.label || kind, data })) }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: body.error || "We couldn’t upload your documents. Try again." };
    return body;
  } catch {
    return { ok: false, error: "We couldn’t reach Keel. Check your connection and try again." };
  }
}

const bucket = (n) => (n <= 1 ? "1" : n <= 5 ? "2-5" : n <= 10 ? "6-10" : n <= 25 ? "11-25" : n <= 50 ? "26-50" : n <= 100 ? "51-100" : "100+");
function yearsBucket(start) {
  const y = new Date().getFullYear() - start;
  return y < 1 ? "lt1" : y < 3 ? "1-3" : y <= 10 ? "3-10" : "10+";
}

/* Maps what was read from the documents onto the quote answers. Only fills what was found. */
export function answersFrom(ex, a) {
  const p = {};
  if (ex.industry && ex.industry !== "unknown" && CLASS[ex.industry]) p.industry = ex.industry;
  if (ex.business_description) p.businessType = ex.business_description.slice(0, 48);
  if (ex.zip && /^\d{5}/.test(ex.zip)) p.zip = ex.zip.slice(0, 5);
  if (ex.owns_building === true) p.space = "own";
  else if (ex.owns_building === false) p.space = "lease";
  if (ex.square_feet > 0) p.sqft = ex.square_feet;
  if (ex.annual_revenue > 0) p.revenue = ex.annual_revenue;
  if (ex.employee_count > 0) p.employees = bucket(ex.employee_count);
  if (ex.year_started > 1800 && ex.year_started <= new Date().getFullYear()) p.years = yearsBucket(ex.year_started);
  if (Number.isInteger(ex.claims_last_3_years)) p.claims = ex.claims_last_3_years === 0 ? "0" : ex.claims_last_3_years === 1 ? "1" : "2";
  if (ex.vehicles > 0) p.vehicles = ex.vehicles;
  let lines = [...new Set((ex.coverages || []).map((c) => c.line).filter((l) => LINE[l]))];
  if (lines.includes("bop")) lines = lines.filter((l) => l !== "gl" && l !== "property");
  if (lines.length) p.lines = lines;
  if (ex.business_name) p.business = ex.business_name;
  if (ex.contact_name && !a.name) p.name = ex.contact_name.split(/\s+/)[0];
  if (ex.contact_phone && !a.phone) p.phone = ex.contact_phone;
  if (ex.policy_expiration && new Date(ex.policy_expiration) > new Date()) p.timing = "renewal";
  p.docs = {
    kinds: (ex.documents || []).map((d) => d.kind),
    carrier: ex.current_carrier || null,
    expiration: ex.policy_expiration || null,
    premium: ex.current_annual_premium || null,
    coverages: ex.coverages || [],
    notes: ex.notes || [],
  };
  p.fromDocs = true;
  const m = { ...a, ...p };
  const fixed = m.space === "own" || m.space === "lease";
  p.seen = [...new Set([...(a.seen || []),
    ...(p.industry ? ["industry"] : []), ...(p.zip ? ["zip"] : []),
    ...(p.space && (!fixed || p.sqft) ? ["space"] : []), ...(p.revenue ? ["revenue"] : []),
    ...(p.employees ? ["team"] : []), ...(p.years && p.claims ? ["history"] : []), ...(p.lines ? ["coverage"] : []),
  ])];
  if (p.lines) p.recFor = [m.industry, m.space, m.employees].join("|");
  return p;
}

/* Shown only in the claude.ai preview, clearly labeled as a sample. */
export const SAMPLE_EXTRACTION = {
  documents: [{ kind: "acord_25_certificate", summary: "Sample certificate of liability insurance." }],
  business_name: "Brightside Café LLC", business_description: "Coffee shop", industry: "restaurant",
  contact_name: "Maya Ortiz", contact_email: null, contact_phone: null,
  street: "1200 S Lamar Blvd", city: "Austin", state: "TX", zip: "78704",
  owns_building: false, square_feet: 2400, annual_revenue: 850000, employee_count: 8, annual_payroll: null,
  year_started: 2019, claims_last_3_years: 0, vehicles: null,
  current_carrier: "Sample Mutual", policy_expiration: `${new Date().getFullYear() + 1}-02-01`, current_annual_premium: 7400,
  coverages: [
    { line: "bop", carrier: "Sample Mutual", limits: "$1M / $2M", expiration: null },
    { line: "wc", carrier: "Sample Mutual", limits: "Statutory / $1M", expiration: null },
    { line: "liquor", carrier: "Sample Mutual", limits: "$1M", expiration: null },
  ],
  notes: ["This is a sample, not a real document."],
};
