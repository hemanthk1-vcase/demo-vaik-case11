import React from "react";
import {
  ShieldCheck, Lock, IndianRupee, CalendarClock, FileSignature,
  Clock, CheckSquare, Landmark, ClipboardList, Mail, Star,
  Globe, Building2, ArrowRight, Users, Briefcase, Receipt,
  GraduationCap, FileText, Scale,
} from "lucide-react";
import { MiniAppFrame, KPICard, MiniTable, Pill, FeatureCard } from "./Mockups";
import BrandLogo from "@/components/BrandLogo";

const inr = (n) => "₹" + n.toLocaleString("en-IN");

export const slides = [
  {
    tag: "Sales Enablement Deck",
    title: "Vakil Case",
    subtitle: "The all-in-one practice management platform for modern law firms — cases, clients, billing, documents, and trust accounting in one secure workspace.",
    content: (
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold">
            <Scale className="w-5 h-5" /> Built for legal professionals
          </div>
          <p className="text-slate-600">
            Vakil Case unifies every part of a law firm's daily operations into a single,
            secure, and intuitive platform — so your team spends less time on admin and
            more time winning matters.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-2">
            <Stat value="15+" label="Modules" />
            <Stat value="100%" label="INR billing" />
            <Stat value="Secure" label="Access control" />
          </div>
        </div>
        <div className="flex justify-center">
          <BrandLogo className="h-44 w-44" />
        </div>
      </div>
    ),
  },
  {
    tag: "The Problem",
    title: "Law firms run on friction",
    subtitle: "Disjointed tools and manual workflows drain billable hours and create risk.",
    content: (
      <div className="grid md:grid-cols-2 gap-5">
        {[
          ["Scattered documents", "Case files spread across email, drives, and paper — hard to find and easy to lose."],
          ["Manual billing", "Invoices tracked in spreadsheets lead to missed revenue and delayed payments."],
          ["Missed hearings", "No central calendar means adjournments and deadlines slip through the cracks."],
          ["No visibility", "Partners can't see case status, workload, or firm performance in real time."],
          ["Data security risk", "Client confidentiality exposed when access isn't controlled per person."],
          ["Onboarding overhead", "Intake, conflict checks, and engagement letters handled by hand, case by case."],
        ].map(([t, d]) => (
          <div key={t} className="flex gap-3 rounded-xl border border-slate-200 p-4">
            <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <div>
              <div className="font-semibold text-slate-900 text-sm">{t}</div>
              <div className="text-sm text-slate-500">{d}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "The Solution",
    title: "One platform for the entire firm",
    subtitle: "Vakil Case replaces a dozen disconnected tools with a single, secure system of record.",
    content: (
      <div className="grid md:grid-cols-3 gap-5">
        <FeatureCard icon={Briefcase} title="Case Management" desc="Track every matter from intake to judgment with status, priority, risk, and hearing dates." />
        <FeatureCard icon={Users} title="Client Management" desc="A complete CRM for prospects, onboarded, and active clients with conflict checks." />
        <FeatureCard icon={GraduationCap} title="Lawyer Management" desc="Profiles, specializations, bar credentials, ratings, and verification in one place." />
        <FeatureCard icon={Receipt} title="Billing & Invoices" desc="Generate, send, and track invoices — fully in INR with partial-payment tracking." />
        <FeatureCard icon={FileText} title="Documents & E-Sign" desc="Store, organize, and request legally-binding e-signatures on any document." />
        <FeatureCard icon={Landmark} title="Trust Accounting" desc="Separate trust and operating accounts with full transaction ledgers." />
      </div>
    ),
  },
  {
    tag: "Screen 1 · Dashboard",
    title: "A command center for the whole firm",
    subtitle: "At-a-glance KPIs, recent activity, and upcoming hearings keep partners in control.",
    content: (
      <div className="grid lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-2">
          <MiniAppFrame active="Dashboard" title="Dashboard">
            <div className="grid grid-cols-4 gap-3">
              <KPICard label="Total Cases" value="48" color="indigo" />
              <KPICard label="Active" value="22" sub="+4 this week" color="emerald" />
              <KPICard label="Upcoming" value="6" color="amber" />
              <KPICard label="Pending ₹" value={inr(4.2) + "L"} color="rose" />
            </div>
            <div className="mt-4">
              <MiniTable
                headers={["Case", "Client", "Status", "Next hearing"]}
                rows={[
                  ["Sharma v. Mehta", "Rajesh Sharma", <Pill tone="indigo">Trial</Pill>, "12 Sep"],
                  ["Estate of Verma", "Anita Verma", <Pill tone="amber">Discovery</Pill>, "18 Sep"],
                  ["Sun Corp. Merger", "Sun Industries", <Pill tone="emerald">Filed</Pill>, "—"],
                ]}
              />
            </div>
          </MiniAppFrame>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <TalkPoint n="1" t="Real-time KPIs" d="Cases, active matters, hearings, and outstanding billing — all live." />
          <TalkPoint n="2" t="Upcoming hearings" d="Never miss a court date with a surfaced calendar." />
          <TalkPoint n="3" t="Recent activity" d="See exactly what changed across the firm today." />
        </div>
      </div>
    ),
  },
  {
    tag: "Screen 2 · Clients",
    title: "Manage your client roster with confidence",
    subtitle: "From first prospect to active engagement — every client, fully profiled.",
    content: (
      <div className="grid lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-2">
          <MiniAppFrame active="Clients" title="Clients">
            <MiniTable
              headers={["Name", "Email", "Phone", "Status", "Lawyer"]}
              rows={[
                ["Rajesh Sharma", "rajesh@email.com", "+91 98...", <Pill tone="emerald">Active</Pill>, "A. Gupta"],
                ["Anita Verma", "anita@email.com", "+91 99...", <Pill tone="indigo">Onboarded</Pill>, "S. Rao"],
                ["Sun Industries", "legal@sun.co", "+91 80...", <Pill tone="amber">Prospect</Pill>, "A. Gupta"],
              ]}
            />
          </MiniAppFrame>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <TalkPoint n="1" t="Full client profiles" d="Contact, ID, occupation, notes, and assigned lawyer." />
          <TalkPoint n="2" t="Lifecycle statuses" d="Prospect → onboarded → active → archived." />
          <TalkPoint n="3" t="Conflict checks" d="Flag conflicts before engagement to protect the firm." />
        </div>
      </div>
    ),
  },
  {
    tag: "Screen 3 · Cases",
    title: "Every matter, from intake to judgment",
    subtitle: "16 case categories, 16 lifecycle stages, and full risk + priority tracking.",
    content: (
      <div className="grid lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-2">
          <MiniAppFrame active="Cases" title="Cases">
            <MiniTable
              headers={["Title", "Category", "Status", "Priority", "Client"]}
              rows={[
                ["Sharma v. Mehta", "Civil Litigation", <Pill tone="indigo">Trial</Pill>, <Pill tone="rose">Urgent</Pill>, "Rajesh Sharma"],
                ["Estate of Verma", "Estate Planning", <Pill tone="amber">Discovery</Pill>, <Pill tone="amber">High</Pill>, "Anita Verma"],
                ["Sun Corp. Merger", "Corporate", <Pill tone="emerald">Filed</Pill>, <Pill>Medium</Pill>, "Sun Industries"],
              ]}
            />
          </MiniAppFrame>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <TalkPoint n="1" t="16 practice areas" d="Criminal, family, corporate, IP, tax, and more." />
          <TalkPoint n="2" t="Full lifecycle" d="Intake → conflict → engagement → filed → trial → closed." />
          <TalkPoint n="3" t="Risk & priority" d="Surface the matters that need attention first." />
        </div>
      </div>
    ),
  },
  {
    tag: "Screen 4 · Lawyer Management",
    title: "Your team, fully credentialled",
    subtitle: "Profiles, bar credentials, specializations, ratings, and verification status.",
    content: (
      <div className="grid lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-2">
          <MiniAppFrame active="Lawyer Management" title="Lawyer Management">
            <MiniTable
              headers={["Name", "Specialization", "Bar #", "Years", "Status"]}
              rows={[
                ["Adv. A. Gupta", "Criminal Law", "DL/1234", "12", <Pill tone="emerald">Verified</Pill>],
                ["Adv. S. Rao", "Family Law", "MH/5678", "8", <Pill tone="amber">Under Review</Pill>],
                ["Adv. P. Nair", "Corporate", "KL/9012", "15", <Pill tone="emerald">Verified</Pill>],
              ]}
            />
          </MiniAppFrame>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <TalkPoint n="1" t="Bar credentials" d="Registration number and bar council on every profile." />
          <TalkPoint n="2" t="Verification workflow" d="Pending → under review → verified → suspended." />
          <TalkPoint n="3" t="Ratings & reviews" d="Track performance and client satisfaction." />
        </div>
      </div>
    ),
  },
  {
    tag: "Screen 5 · Invoices & Billing",
    title: "Billing that gets you paid — in INR",
    subtitle: "Create, send, and track invoices with partial payments and overdue alerts.",
    content: (
      <div className="grid lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-2">
          <MiniAppFrame active="Invoices" title="Invoices">
            <MiniTable
              headers={["Invoice #", "Client", "Amount", "Paid", "Status", "Due"]}
              rows={[
                ["INV-1042", "Rajesh Sharma", inr(85000), inr(85000), <Pill tone="emerald">Paid</Pill>, "—"],
                ["INV-1043", "Anita Verma", inr(120000), inr(60000), <Pill tone="amber">Partial</Pill>, "20 Sep"],
                ["INV-1044", "Sun Industries", inr(250000), inr(0), <Pill tone="rose">Overdue</Pill>, "01 Sep"],
              ]}
            />
          </MiniAppFrame>
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          <TalkPoint n="1" t="Native INR billing" d="All invoices and trust ledgers in Indian Rupees." />
          <TalkPoint n="2" t="Payment tracking" d="Partial payments and outstanding balances at a glance." />
          <TalkPoint n="3" t="Status automation" d="Draft → sent → partial → paid, with overdue alerts." />
        </div>
      </div>
    ),
  },
  {
    tag: "Screen 6 · Documents & E-Signature",
    title: "Every file, organized and signed",
    subtitle: "Secure document storage with legally-binding e-signature requests.",
    content: (
      <div className="grid md:grid-cols-2 gap-5">
        <FeatureCard icon={FileText} title="Document Library" desc="Upload, categorize, and link documents to cases and clients with access-level controls." />
        <FeatureCard icon={FileSignature} title="E-Signature Requests" desc="Send engagement letters and contracts for signature; track pending, viewed, signed, and declined." />
        <FeatureCard icon={Building2} title="Document Templates" desc="Firm-wide templates for letters, court filings, contracts, and notices — jurisdiction-aware." />
        <FeatureCard icon={ShieldCheck} title="Confidentiality" desc="Mark documents confidential with lawyer-only or admin-only access levels." />
      </div>
    ),
  },
  {
    tag: "Screen 7 · Operations",
    title: "Trust accounting, time, tasks & intake",
    subtitle: "The operational backbone that keeps a firm compliant and on schedule.",
    content: (
      <div className="grid md:grid-cols-2 gap-5">
        <FeatureCard icon={Landmark} title="Trust Accounting" desc="Separate trust and operating accounts with full deposit/withdrawal ledgers and running balances." />
        <FeatureCard icon={Clock} title="Time Tracking" desc="Log billable hours per case with rates and billing flags — never lose trackable time again." />
        <FeatureCard icon={CheckSquare} title="Tasks" desc="Assign tasks to team members with due dates and priority, synced to cases." />
        <FeatureCard icon={ClipboardList} title="Intake Forms" desc="Publish public intake forms that capture leads and convert them to clients and cases." />
        <FeatureCard icon={Mail} title="Email Log" desc="Track inbound and outbound correspondence linked to cases and clients." />
        <FeatureCard icon={CalendarClock} title="Court Updates" desc="Log hearing outcomes, judges, and next dates to keep every matter current." />
      </div>
    ),
  },
  {
    tag: "Security & Access Control",
    title: "Bank-grade security, by design",
    subtitle: "Your firm's data is locked down and accessible only to those you authorise.",
    content: (
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-emerald-600 font-semibold">
            <Lock className="w-5 h-5" /> Locked to the account owner
          </div>
          <p className="text-slate-600">
            Every record in Vakil Case is protected by row-level security. Only authorised
            admin accounts can read, create, edit, or delete data — so no one outside your
            firm can access or change a thing.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <SecurityItem icon={ShieldCheck} t="Row-level security" d="Per-record access control" />
            <SecurityItem icon={Lock} t="Admin-only writes" d="No unauthorised edits" />
            <SecurityItem icon={IndianRupee} t="INR-only billing" d="Currency compliance" />
            <SecurityItem icon={Globe} t="Private access" d="Login required" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-8 bg-slate-50 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-slate-900">Your data stays yours</h3>
          <p className="text-sm text-slate-500 mt-1">
            Confidential client information, case strategy, and financials — protected at every layer.
          </p>
        </div>
      </div>
    ),
  },
  {
    tag: "Why Vakil Case",
    title: "Built for Indian law firms, ready to scale",
    subtitle: "Purpose-built for the way Indian advocates actually work.",
    content: (
      <div className="grid md:grid-cols-3 gap-5">
        <FeatureCard icon={IndianRupee} title="INR-native" desc="Every amount — fees, trust, retainers, subscriptions — is in Indian Rupees." />
        <FeatureCard icon={Globe} title="Jurisdiction-aware" desc="India-first with templates and fields tuned for Indian courts and bar councils." />
        <FeatureCard icon={Scale} title="All-in-one" desc="Replace 6+ disconnected tools with one secure platform." />
        <FeatureCard icon={Star} title="Easy to adopt" desc="Clean, intuitive interface your team learns in minutes." />
        <FeatureCard icon={Building2} title="Firm-ready" desc="From solo advocates to multi-lawyer firms." />
        <FeatureCard icon={ArrowRight} title="Fast to deploy" desc="Live in a day — no IT team required." />
      </div>
    ),
  },
  {
    tag: "Plans & Pricing",
    title: "Simple plans, in INR",
    subtitle: "Start free. Scale as your firm grows.",
    content: (
      <div className="grid md:grid-cols-4 gap-5">
        <PlanCard name="Free" price={inr(0)} period="forever" features={["Up to 10 cases", "Basic CRM", "1 user"]} />
        <PlanCard name="Starter" price={inr(1499)} period="/month" features={["Up to 100 cases", "Invoicing", "Documents"]} highlight />
        <PlanCard name="Professional" price={inr(3999)} period="/month" features={["Unlimited cases", "Trust accounting", "E-signature", "Time tracking"]} />
        <PlanCard name="Enterprise" price="Custom" period="" features={["Multi-lawyer", "SSO + audit logs", "Priority support"]} />
      </div>
    ),
  },
  {
    tag: "Let's talk",
    title: "See Vakil Case in action",
    subtitle: "Book a live walkthrough and we'll tailor the demo to your practice area.",
    content: (
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="text-slate-600">
            Our team will walk you through real workflows — from intake to invoice — and show
            how Vakil Case fits the way your firm already works.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-indigo-600" /> 30-minute live demo</li>
            <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-indigo-600" /> Tailored to your practice area</li>
            <li className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-indigo-600" /> Free trial setup</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center shadow-2xl">
          <BrandLogo className="h-20 w-20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">Vakil Case</h3>
          <p className="text-slate-500 text-sm mt-1">The modern practice management platform</p>
          <div className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg">
            <Mail className="w-4 h-4" /> Book a demo
          </div>
        </div>
      </div>
    ),
  },
];

function Stat({ value, label }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 text-center">
      <div className="text-2xl font-bold text-indigo-600">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function TalkPoint({ n, t, d }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">{n}</div>
      <div>
        <div className="font-semibold text-slate-900">{t}</div>
        <div className="text-slate-500">{d}</div>
      </div>
    </div>
  );
}

function SecurityItem({ icon: Icon, t, d }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <Icon className="w-5 h-5 text-emerald-600 mb-1" />
      <div className="text-sm font-semibold text-slate-900">{t}</div>
      <div className="text-xs text-slate-500">{d}</div>
    </div>
  );
}

function PlanCard({ name, price, period, features, highlight }) {
  return (
    <div className={`rounded-2xl border p-6 ${highlight ? "border-indigo-600 ring-2 ring-indigo-600" : "border-slate-200"}`}>
      <div className="text-sm font-semibold text-slate-500">{name}</div>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-3xl font-bold text-slate-900">{price}</span>
        <span className="text-sm text-slate-500 mb-1">{period}</span>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}