/*
  Plain-language starting drafts. They describe how this site actually handles
  data, but they are not legal advice. Have an attorney review both pages
  (insurance agencies have extra privacy duties, such as Gramm-Leach-Bliley
  notices) before launch.
*/
import { Link } from "react-router-dom";
import { COMPANY, DEMO_QUOTES } from "../config.js";
import { useTitle } from "../lib/useTitle.js";

const UPDATED = "November 6, 2026";
const contact = COMPANY.supportEmail || "[support email: set it in src/config.js]";

function Doc({ title, children }) {
  return (
    <main className="legal">
      <div className="wrap legal-wrap">
        <p className="eyebrow">Last updated {UPDATED}</p>
        <h1 className="res-title">{title}</h1>
        {DEMO_QUOTES && <p className="legal-draft">Draft for review before launch.</p>}
        <div className="legal-body">{children}</div>
      </div>
    </main>
  );
}

export function Privacy() {
  useTitle("Privacy policy");
  return (
    <Doc title="Privacy policy">
      <p>{COMPANY.legalName} (“{COMPANY.name}”, “we”) is an independent insurance agency. This policy explains what we collect when you use this website, why, and who we share it with.</p>
      <h2>What we collect</h2>
      <ul>
        <li><b>What you tell us about your business:</b> type of business, location, building size, revenue, number of employees, business history and the coverage you want.</li>
        <li><b>Insurance documents you upload:</b> certificates of insurance, ACORD applications, declarations pages or loss runs.</li>
        <li><b>Contact details:</b> your name, business name, email address, phone number and business address.</li>
        <li><b>Your choices:</b> the quotes you view, the policy you request, your start date and payment plan.</li>
        <li><b>Technical data:</b> our hosting provider records basic request data such as IP address, browser type and pages visited. If site analytics are turned on, they count page views without using cookies.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To prepare quotes and show you prices from insurance carriers.</li>
        <li>To read documents you upload and fill in your quote automatically, using an AI service provider that processes them on our behalf.</li>
        <li>To contact you about quotes or policies you ask about, or when you ask for a call.</li>
        <li>To finalize and service policies you choose to buy.</li>
        <li>To run, secure and improve this website, and to meet legal and regulatory duties.</li>
      </ul>
      <h2>Who we share it with</h2>
      <ul>
        <li><b>Insurance carriers</b> that can quote your business, and the carrier you choose.</li>
        <li><b>Service providers</b> that host this site, read uploaded documents and deliver email for us. They may use your information only to provide those services.</li>
        <li><b>Authorities</b> when the law requires it.</li>
      </ul>
      <p>We don’t sell your personal information.</p>
      <h2>Information stored on your device</h2>
      <p>To let you pick up where you left off, this site saves your quote answers in your browser’s local storage. Your email address and phone number are kept only until you close the tab. You can remove this information at any time by clearing this site’s data in your browser.</p>
      <h2>How long we keep it</h2>
      <p>We keep quote requests for as long as we need them to respond to you and to meet record-keeping rules for insurance agencies. We keep policy records for as long as the law requires.</p>
      <h2>Your choices</h2>
      <p>You can ask us to show you, correct or delete the personal information we hold about you by emailing {contact}. Depending on where you live, you may have additional rights under state law.</p>
      <h2>Children</h2>
      <p>This site is for businesses and isn’t directed to anyone under 18.</p>
      <h2>Changes</h2>
      <p>If we change this policy, we’ll update the date at the top of this page.</p>
      <h2>Contact</h2>
      <p>Questions about privacy: {contact}.</p>
    </Doc>
  );
}

export function Terms() {
  useTitle("Terms of use");
  return (
    <Doc title="Terms of use">
      <p>These terms apply when you use this website. By using it, you agree to them.</p>
      <h2>Who we are</h2>
      <p>{COMPANY.legalName} is an independent insurance agency. We compare quotes from insurance carriers and help you buy a policy. We aren’t an insurance company. The carrier you choose issues your policy and pays covered claims.</p>
      <h2>Quotes are estimates</h2>
      <p>Prices on this site are based on the answers you give. A carrier sets the final price when it reviews your application, and it may decline to offer coverage. Make sure your answers are complete and accurate; incorrect answers can change your price or affect a claim.</p>
      <h2>Coverage doesn’t start until a policy is issued</h2>
      <p>Requesting a quote or a policy on this site doesn’t put coverage in place. You’re covered only once the carrier issues the policy and confirms your start date.</p>
      <h2>Not advice</h2>
      <p>Information on this site, including coverage descriptions and example claims, is general and simplified. Your policy documents describe exactly what is and isn’t covered. A licensed advisor can help you decide what you need.</p>
      <h2>Using this site</h2>
      <p>Don’t misuse the site, submit information that isn’t yours, or try to disrupt it. We may change or stop offering any part of the site.</p>
      <h2>Liability</h2>
      <p>The site is provided as is. To the extent the law allows, we aren’t liable for indirect or consequential losses from using it.</p>
      <h2>Contact</h2>
      <p>Questions about these terms: {contact}. See also our <Link to="/privacy">privacy policy</Link>.</p>
    </Doc>
  );
}
