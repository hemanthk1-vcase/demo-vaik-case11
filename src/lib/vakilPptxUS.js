import pptxgen from "pptxgenjs";

const INDIGO = "4F46E5";
const DARK = "0F172A";
const GRAY = "64748B";
const LIGHT = "E2E8F0";
const PANEL = "F8FAFC";
const W = 13.33;
const H = 7.5;

const FOOTER_TEXT = "© 2026 Vakil Case   ·   Demo.US.Vakilcase.com";

const usd = (n) => "$" + n.toLocaleString("en-US");

function footer(slide, onDark = false) {
  slide.addText(FOOTER_TEXT, {
    x: 0.6, y: 7.06, w: 12.1, h: 0.34,
    fontSize: 9, color: onDark ? "94A3B8" : GRAY, align: "left",
  });
}

const LOGO_URL = "https://media.base44.com/images/public/6a95d675a12ae82453682890/0ae5015c5_generated_image.png";

/** Website logo (scales + sword + "V"), preserved in its dark charcoal color. */
function brandLogo(slide, x, y, size = 1.2, onDark = false) {
  if (onDark) {
    slide.addShape("roundRect", {
      x: x - 0.18, y: y - 0.18, w: size + 0.36, h: size + 0.36, rectRadius: 0.12,
      fill: { color: "FFFFFF" },
    });
  }
  slide.addImage({
    path: LOGO_URL, x, y, w: size, h: size,
    sizing: { type: "contain", w: size, h: size },
  });
}

function header(slide, tag, title, subtitle) {
  slide.addShape("rect", { x: 0, y: 0, w: W, h: 0.09, fill: { color: INDIGO } });
  slide.addText(tag.toUpperCase(), { x: 0.6, y: 0.32, w: 8, h: 0.3, fontSize: 11, bold: true, color: INDIGO, charSpacing: 2 });
  slide.addText(title, { x: 0.6, y: 0.66, w: 12, h: 0.8, fontSize: 28, bold: true, color: DARK });
  if (subtitle) slide.addText(subtitle, { x: 0.6, y: 1.45, w: 12, h: 0.6, fontSize: 15, color: GRAY });
  return 2.25;
}

function bullets(slide, items, y, opts = {}) {
  slide.addText(
    items.map((t) => ({ text: t, options: { bullet: true, breakLine: true, paraSpaceAfter: 6 } })),
    { x: 0.7, y, w: 12, h: 4.5, fontSize: 15, color: DARK, valign: "top", ...opts }
  );
}

function table(slide, rows, y, colW) {
  const body = rows.map((r, ri) =>
    r.map((c) => ({
      text: c,
      options: {
        bold: ri === 0,
        color: ri === 0 ? GRAY : DARK,
        fill: { color: ri === 0 ? PANEL : "FFFFFF" },
        align: "left",
      },
    }))
  );
  slide.addTable(body, {
    x: 0.6, y, w: 12.1,
    colW,
    border: { type: "solid", color: LIGHT, pt: 1 },
    rowH: 0.45,
    fontSize: 13,
    valign: "middle",
  });
}

function kpis(slide, items, y) {
  const gap = 0.3;
  const cardW = (12.1 - gap * (items.length - 1)) / items.length;
  items.forEach(([label, value], i) => {
    const x = 0.6 + i * (cardW + gap);
    slide.addShape("roundRect", { x, y, w: cardW, h: 1.1, rectRadius: 0.08, fill: { color: PANEL }, line: { color: LIGHT } });
    slide.addText(label, { x: x + 0.15, y: y + 0.1, w: cardW - 0.3, h: 0.3, fontSize: 11, color: GRAY });
    slide.addText(value, { x: x + 0.15, y: y + 0.4, w: cardW - 0.3, h: 0.6, fontSize: 24, bold: true, color: INDIGO });
  });
}

export function buildVakilPptxUS() {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Vakil Case";
  pptx.title = "Vakil Case - US Sales Presentation";
  pptx.subject = "Practice management platform for US law firms";

  // 1 — Cover
  let s = pptx.addSlide();
  s.background = { color: "F4F7FA" };
  s.addShape("rect", { x: 0, y: 0, w: 0.18, h: H, fill: { color: INDIGO } });
  brandLogo(s, 5.57, 0.7, 2.2);
  s.addText("SALES ENABLEMENT DECK · US", { x: 1, y: 3.15, w: 11.3, h: 0.4, fontSize: 13, bold: true, color: INDIGO, charSpacing: 3, align: "center" });
  s.addText("Vakil Case", { x: 1, y: 3.65, w: 11.3, h: 1.1, fontSize: 50, bold: true, color: DARK, align: "center" });
  s.addText("The all-in-one practice management platform for modern American law firms — cases, clients, billing, documents, and trust accounting in one secure workspace.", { x: 1.5, y: 4.85, w: 10.3, h: 1.1, fontSize: 17, color: GRAY, align: "center" });
  s.addText("15+ Modules   ·   100% USD Billing   ·   Secure Access Control", { x: 1, y: 6.05, w: 11.3, h: 0.4, fontSize: 14, bold: true, color: INDIGO, align: "center" });
  footer(s);

  // 2 — Problem
  s = pptx.addSlide();
  let y = header(s, "The Problem", "Law firms run on friction", "Disjointed tools and manual workflows drain billable hours and create risk.");
  const probs = [
    ["Scattered documents", "Case files spread across email, drives, and paper — hard to find and easy to lose."],
    ["Manual billing", "Invoices tracked in spreadsheets lead to missed revenue and delayed payments."],
    ["Missed hearings", "No central calendar means continuances and deadlines slip through the cracks."],
    ["No visibility", "Partners can't see case status, workload, or firm performance in real time."],
    ["Data security risk", "Client confidentiality exposed when access isn't controlled per person."],
    ["Onboarding overhead", "Intake, conflict checks, and engagement letters handled by hand, case by case."],
  ];
  probs.forEach((p, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 6.2;
    const yy = y + row * 1.3;
    s.addShape("roundRect", { x, y: yy, w: 6, h: 1.15, fill: { color: PANEL }, line: { color: LIGHT } });
    s.addShape("ellipse", { x: x + 0.15, y: yy + 0.4, w: 0.2, h: 0.2, fill: { color: "EF4444" } });
    s.addText(p[0], { x: x + 0.5, y: yy + 0.1, w: 5.3, h: 0.4, fontSize: 14, bold: true, color: DARK });
    s.addText(p[1], { x: x + 0.5, y: yy + 0.5, w: 5.3, h: 0.6, fontSize: 12, color: GRAY });
  });
  footer(s);

  // 3 — Solution
  s = pptx.addSlide();
  y = header(s, "The Solution", "One platform for the entire firm", "Vakil Case replaces a dozen disconnected tools with a single, secure system of record.");
  const sol = [
    ["Case Management", "Track every matter from intake to judgment with status, priority, risk, and hearing dates."],
    ["Client Management", "A complete CRM for prospects, onboarded, and active clients with conflict checks."],
    ["Lawyer Management", "Profiles, specializations, bar credentials, ratings, and verification in one place."],
    ["Billing & Invoices", "Generate, send, and track invoices — fully in USD with partial-payment tracking."],
    ["Documents & E-Sign", "Store, organize, and request legally-binding e-signatures on any document."],
    ["Trust Accounting", "Separate trust and operating accounts (IOLTA-ready) with full transaction ledgers."],
  ];
  sol.forEach((p, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.6 + col * 4.1;
    const yy = y + row * 2;
    s.addShape("roundRect", { x, y: yy, w: 3.9, h: 1.8, fill: { color: PANEL }, line: { color: LIGHT } });
    s.addShape("roundRect", { x: x + 0.2, y: yy + 0.2, w: 0.5, h: 0.5, fill: { color: INDIGO } });
    s.addText(p[0], { x: x + 0.85, y: yy + 0.2, w: 2.9, h: 0.5, fontSize: 14, bold: true, color: DARK, valign: "middle" });
    s.addText(p[1], { x: x + 0.2, y: yy + 0.85, w: 3.5, h: 0.85, fontSize: 12, color: GRAY });
  });
  footer(s);

  // 4 — Dashboard
  s = pptx.addSlide();
  y = header(s, "Screen 1 · Dashboard", "A command center for the whole firm", "At-a-glance KPIs, recent activity, and upcoming hearings keep partners in control.");
  kpis(s, [["Total Cases", "48"], ["Active", "22"], ["Upcoming", "6"], ["Pending $", "$42,000"]], y);
  table(s, [
    ["Case", "Client", "Status", "Next hearing"],
    ["Carter v. Pierce", "Emily Carter", "Trial", "Sep 12"],
    ["Estate of Williams", "Sophia Bennett", "Discovery", "Sep 18"],
    ["Meridian Corp. Merger", "Meridian Industries", "Filed", "—"],
  ], y + 1.4, [4.5, 3.2, 2.4, 2.0]);
  bullets(s, [
    "Real-time KPIs — cases, active matters, hearings, and outstanding billing, all live.",
    "Upcoming hearings surfaced so no court date is ever missed.",
    "Recent activity shows exactly what changed across the firm today.",
  ], y + 3.2, { x: 0.7, w: 12, h: 1.5, fontSize: 13 });
  footer(s);

  // 5 — Clients
  s = pptx.addSlide();
  y = header(s, "Screen 2 · Clients", "Manage your client roster with confidence", "From first prospect to active engagement — every client, fully profiled.");
  table(s, [
    ["Name", "Email", "Phone", "Status", "Lawyer"],
    ["Emily Carter", "emily.carter@email.com", "+1 415...", "Active", "E. Davis"],
    ["Sophia Bennett", "sophia.b@email.com", "+1 212...", "Onboarded", "S. Martinez"],
    ["Meridian Industries", "legal@meridian.co", "+1 312...", "Prospect", "E. Davis"],
  ], y, [2.8, 3.0, 1.8, 2.0, 2.5]);
  bullets(s, [
    "Full client profiles — contact, ID, occupation, notes, and assigned lawyer.",
    "Lifecycle statuses — prospect → onboarded → active → archived.",
    "Conflict checks flag risks before engagement to protect the firm.",
  ], y + 2.4, { x: 0.7, w: 12, h: 1.8, fontSize: 14 });
  footer(s);

  // 6 — Cases
  s = pptx.addSlide();
  y = header(s, "Screen 3 · Cases", "Every matter, from intake to judgment", "16 case categories, 16 lifecycle stages, and full risk + priority tracking.");
  table(s, [
    ["Title", "Category", "Status", "Priority", "Client"],
    ["Carter v. Pierce", "Civil Litigation", "Trial", "Urgent", "Emily Carter"],
    ["Estate of Williams", "Estate Planning", "Discovery", "High", "Sophia Bennett"],
    ["Meridian Corp. Merger", "Corporate", "Filed", "Medium", "Meridian Industries"],
  ], y, [3.2, 2.6, 1.8, 1.8, 2.7]);
  bullets(s, [
    "16 practice areas — criminal, family, corporate, IP, tax, and more.",
    "Full lifecycle — intake → conflict → engagement → filed → trial → closed.",
    "Risk & priority surface the matters that need attention first.",
  ], y + 2.4, { x: 0.7, w: 12, h: 1.8, fontSize: 14 });
  footer(s);

  // 7 — Lawyer Management
  s = pptx.addSlide();
  y = header(s, "Screen 4 · Lawyer Management", "Your team, fully credentialled", "Profiles, state bar credentials, specializations, ratings, and verification status.");
  table(s, [
    ["Name", "Specialization", "Bar #", "Years", "Status"],
    ["Attorney Emily Davis", "Criminal Law", "CA #246813", "12", "Verified"],
    ["Attorney Sophia Martinez", "Family Law", "NY #135790", "8", "Under Review"],
    ["Attorney Marcus Lee", "Corporate", "DE #987654", "15", "Verified"],
  ], y, [2.8, 3.0, 2.0, 1.3, 3.0]);
  bullets(s, [
    "State bar credentials — bar number and state bar association on every profile.",
    "Verification workflow — pending → under review → verified → suspended.",
    "Ratings & reviews to track performance and client satisfaction.",
  ], y + 2.4, { x: 0.7, w: 12, h: 1.8, fontSize: 14 });
  footer(s);

  // 8 — Invoices
  s = pptx.addSlide();
  y = header(s, "Screen 5 · Invoices & Billing", "Billing that gets you paid — in USD", "Create, send, and track invoices with partial payments and overdue alerts.");
  table(s, [
    ["Invoice #", "Client", "Amount", "Paid", "Status", "Due"],
    ["INV-1042", "Emily Carter", usd(1250), usd(1250), "Paid", "—"],
    ["INV-1043", "Sophia Bennett", usd(2400), usd(1200), "Partial", "Sep 20"],
    ["INV-1044", "Meridian Industries", usd(5500), usd(0), "Overdue", "Sep 01"],
  ], y, [1.8, 2.6, 2.0, 1.9, 1.8, 2.0]);
  bullets(s, [
    "Native USD billing — all invoices and trust ledgers in US Dollars.",
    "Payment tracking — partial payments and outstanding balances at a glance.",
    "Status automation — draft → sent → partial → paid, with overdue alerts.",
  ], y + 2.4, { x: 0.7, w: 12, h: 1.8, fontSize: 14 });
  footer(s);

  // 9 — Documents & E-Sign
  s = pptx.addSlide();
  y = header(s, "Screen 6 · Documents & E-Signature", "Every file, organized and signed", "Secure document storage with legally-binding e-signature requests.");
  const docs = [
    ["Document Library", "Upload, categorize, and link documents to cases and clients with access-level controls."],
    ["E-Signature Requests", "Send engagement letters and contracts for signature; track pending, viewed, signed, and declined."],
    ["Document Templates", "Firm-wide templates for letters, court filings, contracts, and notices — jurisdiction-aware."],
    ["Confidentiality", "Mark documents confidential with lawyer-only or admin-only access levels."],
  ];
  docs.forEach((p, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 6.2;
    const yy = y + row * 1.9;
    s.addShape("roundRect", { x, y: yy, w: 6, h: 1.7, fill: { color: PANEL }, line: { color: LIGHT } });
    s.addShape("roundRect", { x: x + 0.2, y: yy + 0.25, w: 0.5, h: 0.5, fill: { color: INDIGO } });
    s.addText(p[0], { x: x + 0.85, y: yy + 0.25, w: 5, h: 0.5, fontSize: 15, bold: true, color: DARK, valign: "middle" });
    s.addText(p[1], { x: x + 0.2, y: yy + 0.9, w: 5.6, h: 0.7, fontSize: 12, color: GRAY });
  });
  footer(s);

  // 10 — Operations
  s = pptx.addSlide();
  y = header(s, "Screen 7 · Operations", "Trust accounting, time, tasks & intake", "The operational backbone that keeps a firm compliant and on schedule.");
  bullets(s, [
    "Trust Accounting (IOLTA) — separate trust and operating accounts with full deposit/withdrawal ledgers and running balances.",
    "Time Tracking — log billable hours per case with rates and billing flags; never lose trackable time again.",
    "Tasks — assign tasks to team members with due dates and priority, synced to cases.",
    "Intake Forms — publish public intake forms that capture leads and convert them to clients and cases.",
    "Email Log — track inbound and outbound correspondence linked to cases and clients.",
    "Court Updates — log hearing outcomes, judges, and next dates to keep every matter current.",
  ], y, { fontSize: 15 });
  footer(s);

  // 10b — Built-in AI
  s = pptx.addSlide();
  y = header(s, "Screen 8 · Built-in AI", "An AI assistant inside the platform", "Research, draft, and summarize — without ever leaving Vakil Case.");
  const ai = [
    ["Legal Research Assistant", "Ask a legal question and get a sourced answer right inside the dashboard."],
    ["Draft Documents", "Generate first drafts of letters, notices, and client updates from templates."],
    ["Summarize Case Files", "Condense case history, notes, and hearing logs into a brief summary."],
    ["Triage Intake Submissions", "AI reviews new intake submissions and flags the matters worth pursuing."],
  ];
  ai.forEach((p, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 6.2;
    const yy = y + row * 1.7;
    s.addShape("roundRect", { x, y: yy, w: 6, h: 1.5, fill: { color: PANEL }, line: { color: LIGHT } });
    s.addShape("roundRect", { x: x + 0.2, y: yy + 0.2, w: 0.5, h: 0.5, fill: { color: INDIGO } });
    s.addText(p[0], { x: x + 0.85, y: yy + 0.2, w: 5, h: 0.5, fontSize: 15, bold: true, color: DARK, valign: "middle" });
    s.addText(p[1], { x: x + 0.2, y: yy + 0.75, w: 5.6, h: 0.65, fontSize: 12, color: GRAY });
  });
  s.addShape("roundRect", { x: 0.6, y: y + 3.65, w: 12.1, h: 1.1, fill: { color: "EEF2FF" }, line: { color: "C7D2FE" } });
  s.addText("Built in — no separate AI accounts or websites to visit. External AI models (e.g., ChatGPT, Claude) can also be connected through the backend, so lawyers never leave your platform.", { x: 0.9, y: y + 3.8, w: 11.5, h: 0.8, fontSize: 13, color: "3730A3" });
  footer(s);

  // 11 — Security
  s = pptx.addSlide();
  y = header(s, "Security & Access Control", "Bank-grade security, by design", "Your firm's data is locked down and accessible only to those you authorise.");
  bullets(s, [
    "Row-level security — every record protected; only authorised admin accounts can read, create, edit, or delete.",
    "Admin-only writes — no unauthorised edits are ever possible.",
    "USD-only billing — currency consistency built in across fees, trust, and subscriptions.",
    "Private access — login required; the platform is locked to the account owner.",
    "Confidentiality controls — lawyer-only and admin-only document access levels.",
  ], y, { fontSize: 16, h: 3.5 });
  s.addShape("roundRect", { x: 0.6, y: 5.5, w: 12.1, h: 1.3, fill: { color: "ECFDF5" }, line: { color: "A7F3D0" } });
  s.addText("Your data stays yours", { x: 0.9, y: 5.6, w: 11, h: 0.4, fontSize: 16, bold: true, color: "065F46" });
  s.addText("Confidential client information, case strategy, and financials — protected at every layer.", { x: 0.9, y: 6.0, w: 11, h: 0.5, fontSize: 13, color: "047857" });
  footer(s);

  // 12 — Why Vakil Case
  s = pptx.addSlide();
  y = header(s, "Why Vakil Case", "Built for US law firms, ready to scale", "Purpose-built for the way American attorneys actually work.");
  const why = [
    ["USD-native", "Every amount — fees, trust, retainers, subscriptions — in US Dollars."],
    ["Multi-state ready", "US-first with templates tuned for state bars and US courts."],
    ["All-in-one", "Replace 6+ disconnected tools with one secure platform."],
    ["Easy to adopt", "Clean, intuitive interface your team learns in minutes."],
    ["Firm-ready", "From solo attorneys to multi-lawyer firms."],
    ["Fast to deploy", "Live in a day — no IT team required."],
  ];
  why.forEach((p, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.6 + col * 4.1;
    const yy = y + row * 1.9;
    s.addShape("roundRect", { x, y: yy, w: 3.9, h: 1.7, fill: { color: PANEL }, line: { color: LIGHT } });
    s.addText(p[0], { x: x + 0.2, y: yy + 0.2, w: 3.5, h: 0.4, fontSize: 15, bold: true, color: INDIGO });
    s.addText(p[1], { x: x + 0.2, y: yy + 0.65, w: 3.5, h: 1, fontSize: 12, color: GRAY });
  });
  footer(s);

  // 13 — Pricing
  s = pptx.addSlide();
  y = header(s, "Plans & Pricing", "Simple plans, in USD", "Start free. Scale as your firm grows.");
  const plans = [
    ["Free", usd(0), "forever", "Up to 10 cases\nBasic CRM\n1 user"],
    ["Starter", usd(29), "/month", "Up to 100 cases\nInvoicing\nDocuments"],
    ["Professional", usd(59), "/month", "Unlimited cases\nTrust accounting\nE-signature\nTime tracking"],
    ["Enterprise", "Custom", "", "Multi-lawyer\nSSO + audit logs\nPriority support"],
  ];
  const pw = 2.95, gap = 0.15;
  plans.forEach((p, i) => {
    const x = 0.6 + i * (pw + gap);
    const featured = i === 2;
    s.addShape("roundRect", { x, y, w: pw, h: 4.2, fill: { color: "FFFFFF" }, line: { color: featured ? INDIGO : LIGHT, width: featured ? 2 : 1 } });
    if (featured) s.addShape("roundRect", { x, y, w: pw, h: 0.5, fill: { color: INDIGO } });
    s.addText(p[0].toUpperCase(), { x, y: y + (featured ? 0.1 : 0.25), w: pw, h: 0.3, fontSize: 12, bold: true, color: featured ? "FFFFFF" : GRAY, align: "center" });
    s.addText(p[1], { x, y: y + 0.7, w: pw, h: 0.6, fontSize: 26, bold: true, color: DARK, align: "center" });
    s.addText(p[2], { x, y: y + 1.3, w: pw, h: 0.3, fontSize: 12, color: GRAY, align: "center" });
    s.addText(p[3], { x: x + 0.2, y: y + 1.9, w: pw - 0.4, h: 2.1, fontSize: 13, color: DARK, valign: "top" });
  });
  footer(s);

  // 14 — CTA
  s = pptx.addSlide();
  s.background = { color: INDIGO };
  brandLogo(s, 6.0, 1.0, 1.3, true);
  s.addText("LET'S TALK", { x: 1, y: 2.6, w: 11.3, h: 0.4, fontSize: 13, bold: true, color: "C7D2FE", charSpacing: 3, align: "center" });
  s.addText("See Vakil Case in action", { x: 1, y: 3.1, w: 11.3, h: 1, fontSize: 40, bold: true, color: "FFFFFF", align: "center" });
  s.addText("Book a live walkthrough and we'll tailor the demo to your practice area.", { x: 2, y: 4.3, w: 9.3, h: 0.6, fontSize: 18, color: "E0E7FF", align: "center" });
  s.addText("30-minute live demo  ·  Tailored to your practice area  ·  Free trial setup", { x: 1, y: 5.1, w: 11.3, h: 0.5, fontSize: 15, color: "C7D2FE", align: "center" });
  s.addShape("roundRect", { x: 5.16, y: 5.8, w: 3, h: 0.8, fill: { color: "FFFFFF" } });
  s.addText("Book a demo", { x: 5.16, y: 5.8, w: 3, h: 0.8, fontSize: 16, bold: true, color: INDIGO, align: "center", valign: "middle" });
  footer(s, true);

  return pptx.writeFile({ fileName: "Vakil-Case-US-Sales-Deck.pptx" });
}