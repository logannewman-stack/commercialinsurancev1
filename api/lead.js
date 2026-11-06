/*
  POST /api/lead
  Receives quote requests, callback requests and policy requests from the site.

  Every lead is written to the function log (Vercel → Project → Logs).
  Optional delivery, set in Vercel → Project → Settings → Environment Variables:
    LEAD_WEBHOOK_URL   Any URL that accepts a JSON POST (Zapier, Make, a Slack workflow, your CRM).
    RESEND_API_KEY     A Resend API key (resend.com) to email each lead.
    LEAD_NOTIFY_EMAIL  Where lead emails go. Comma-separate several addresses.
    LEAD_FROM_EMAIL    Optional sender, e.g. "Keel <hello@yourdomain.com>" (needs a verified domain in Resend).
    SEND_CUSTOMER_EMAILS  Set to "true" to also email customers a confirmation. Needs RESEND_API_KEY and
                          LEAD_FROM_EMAIL. Never sent while the site is showing demo quotes.
*/
const STAGES = { quote_request: "Quote request", callback: "Callback request", bind_request: "Policy request" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(lead) {
  const c = lead.contact || {};
  const a = lead.answers || {};
  const lines = [
    `${STAGES[lead.stage]} ${lead.id}`,
    "",
    `Name: ${c.name || "-"}`,
    `Business: ${c.business || "-"}`,
    `Email: ${c.email || "-"}`,
    `Phone: ${c.phone || "-"}`,
    `Profile: ${lead.profile || "-"}`,
    `Coverage: ${(a.coverage || []).join(", ") || "-"}`,
    `Start timing: ${a.timing || "-"}`,
  ];
  if (lead.bestTime) lines.push(`Best time to call: ${lead.bestTime}`);
  if (Array.isArray(lead.quotes) && lead.quotes.length) {
    lines.push("", "Top quotes shown:");
    for (const q of lead.quotes) lines.push(`  ${q.carrier}: $${q.monthly}/mo ($${q.annual}/yr)`);
  }
  if (lead.demo) lines.push("", "Note: these were sample prices from the demo pricing engine.");
  if (lead.carrier) {
    lines.push("", `Carrier: ${lead.carrier}`, `Plan: ${lead.plan}`, `Start date: ${lead.startDate}`);
    if (lead.premium) lines.push(`Premium: $${lead.premium.annual}/yr ($${lead.premium.monthly}/mo)`);
    if (lead.address) {
      lines.push(`Address: ${[lead.address.street, lead.address.city, lead.address.state, lead.address.zip].filter(Boolean).join(", ")}`);
    }
  }
  lines.push("", `Received: ${lead.receivedAt}`, `Page: ${lead.page || "-"}`);
  return lines.join("\n");
}

function customerEmail(lead) {
  const c = lead.contact || {};
  const hi = c.name ? `Hi ${c.name},` : "Hi,";
  if (lead.stage === "quote_request") {
    const quotes = (lead.quotes || []).map((q) => `  ${q.carrier}: $${q.monthly}/mo`).join("\n");
    return {
      subject: `Your Keel quotes for ${c.business || "your business"}`,
      text: `${hi}\n\nThanks for comparing with Keel. Here are your top quotes:\n\n${quotes}\n\nWhen you’re ready, choose a quote on the site, or reply to this email and a licensed advisor will help.\n\nKeel`,
    };
  }
  if (lead.stage === "bind_request") {
    return {
      subject: `We received your request for ${lead.carrier}`,
      text: `${hi}\n\nWe received your request for a ${lead.carrier} policy starting ${lead.startDate}. Your reference is ${lead.id}.\n\nA licensed advisor will contact you shortly to confirm the details. Nothing has been charged.\n\nKeel`,
    };
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }
  if (!body || typeof body !== "object") return res.status(400).json({ error: "Missing body" });
  if (JSON.stringify(body).length > 20000) return res.status(413).json({ error: "Request too large" });
  if (!STAGES[body.stage]) return res.status(400).json({ error: "Unknown stage" });

  const contact = body.contact || {};
  const email = String(contact.email || "").trim();
  const phoneDigits = String(contact.phone || "").replace(/\D/g, "");
  const valid = body.stage === "callback" ? phoneDigits.length >= 10 : EMAIL_RE.test(email);
  if (!valid) {
    return res.status(400).json({ error: body.stage === "callback" ? "A phone number is required" : "A valid email is required" });
  }

  const id = "KL-" + crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  const lead = { id, receivedAt: new Date().toISOString(), ...body };
  console.log("[lead]", JSON.stringify(lead));

  const jobs = [];
  if (process.env.LEAD_WEBHOOK_URL) {
    jobs.push(
      fetch(process.env.LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      }),
    );
  }
  if (process.env.RESEND_API_KEY && process.env.LEAD_NOTIFY_EMAIL) {
    jobs.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.LEAD_FROM_EMAIL || "Keel Leads <onboarding@resend.dev>",
          to: process.env.LEAD_NOTIFY_EMAIL.split(",").map((s) => s.trim()).filter(Boolean),
          reply_to: EMAIL_RE.test(email) ? email : undefined,
          subject: `${STAGES[lead.stage]}: ${contact.business || contact.name || "New lead"}`,
          text: text(lead),
        }),
      }),
    );
  }
  const reply = customerEmail(lead);
  const canEmailCustomer = process.env.SEND_CUSTOMER_EMAILS === "true" && process.env.RESEND_API_KEY && process.env.LEAD_FROM_EMAIL;
  if (reply && !lead.demo && EMAIL_RE.test(email) && canEmailCustomer) {
    jobs.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.LEAD_FROM_EMAIL, to: [email], subject: reply.subject, text: reply.text }),
      }),
    );
  }
  const results = await Promise.allSettled(jobs);
  for (const r of results) {
    if (r.status === "rejected") console.error("[lead] delivery failed", r.reason);
    else if (!r.value.ok) console.error("[lead] delivery failed with status", r.value.status);
  }
  return res.status(200).json({ ok: true, id });
}
