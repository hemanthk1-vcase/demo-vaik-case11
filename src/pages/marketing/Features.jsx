import React from "react";
import {
  Briefcase, Users, Receipt, FileText, Landmark, Clock, CheckSquare,
  FileSignature, ClipboardList, Mail, CalendarClock, ShieldCheck,
} from "lucide-react";

const GROUPS = [
  {
    title: "Manage your practice",
    items: [
      { icon: Briefcase, name: "Case Management", desc: "Track every matter from intake to judgment — 16 categories, 16 lifecycle stages, full risk and priority tracking." },
      { icon: Users, name: "Client Management", desc: "A complete CRM for prospects, onboarded, and active clients with conflict checks and lifecycle statuses." },
      { icon: CheckSquare, name: "Tasks", desc: "Assign tasks to team members with due dates and priority, synced to cases." },
    ],
  },
  {
    title: "Run your finances",
    items: [
      { icon: Receipt, name: "Invoices & Billing", desc: "Create, send, and track invoices in your local currency with partial payments and overdue alerts." },
      { icon: Landmark, name: "Trust Accounting", desc: "Separate trust and operating accounts with full deposit/withdrawal ledgers and running balances." },
      { icon: Clock, name: "Time Tracking", desc: "Log billable hours per case with rates and billing flags — never lose trackable time." },
    ],
  },
  {
    title: "Documents & communications",
    items: [
      { icon: FileText, name: "Document Library", desc: "Upload, categorize, and link documents to cases and clients with access-level controls." },
      { icon: FileSignature, name: "E-Signature", desc: "Send engagement letters and contracts for signature; track pending, viewed, signed, and declined." },
      { icon: Mail, name: "Email Log", desc: "Track inbound and outbound correspondence linked to cases and clients." },
    ],
  },
  {
    title: "Stay compliant & secure",
    items: [
      { icon: ClipboardList, name: "Intake Forms", desc: "Publish public intake forms that capture leads and convert them to clients and cases." },
      { icon: CalendarClock, name: "Court Updates", desc: "Log hearing outcomes, judges, and next dates to keep every matter current." },
      { icon: ShieldCheck, name: "Access Control", desc: "Row-level security with admin-only writes — no unauthorised access or edits." },
    ],
  },
];

export default function Features() {
  return (
    <div>
      <section className="bg-slate-50 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Everything your firm needs</h1>
          <p className="mt-4 text-lg text-slate-600">
            15+ modules covering cases, clients, billing, documents, trust accounting, and operations —
            all in one secure platform.
          </p>
        </div>
      </section>

      {GROUPS.map((g) => (
        <section key={g.title} className="py-14">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-slate-900">{g.title}</h2>
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              {g.items.map((f) => (
                <div key={f.name} className="rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition">
                  <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <div className="font-semibold text-slate-900">{f.name}</div>
                  <div className="text-sm text-slate-500 mt-1">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}