import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Scale, Users, Briefcase, Receipt, FileText, ShieldCheck,
  CheckSquare, Clock, Landmark, FileSignature, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";

const FEATURES = [
  { icon: Briefcase, title: "Case Management", desc: "Track every matter from intake to judgment with status, priority, risk, and hearing dates." },
  { icon: Users, title: "Client Management", desc: "A complete CRM for prospects, onboarded, and active clients with conflict checks." },
  { icon: Receipt, title: "Billing & Invoices", desc: "Generate, send, and track invoices with partial-payment tracking." },
  { icon: FileText, title: "Documents & E-Sign", desc: "Store, organize, and request legally-binding e-signatures on any document." },
  { icon: Landmark, title: "Trust Accounting", desc: "Separate trust and operating accounts with full transaction ledgers." },
  { icon: Clock, title: "Time Tracking", desc: "Log billable hours per case with rates and billing flags." },
];

const STATS = [
  ["15+", "Modules"],
  ["100%", "Local currency billing"],
  ["16", "Case categories"],
  ["Secure", "Access control"],
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm">
              <Scale className="w-5 h-5" /> Built for modern law firms
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              The all-in-one platform for modern law firms
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-lg">
              Cases, clients, billing, documents, and trust accounting — unified in one secure,
              intuitive workspace. Spend less time on admin and more time winning matters.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/register">Get started <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing">View pricing</Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
              <div className="flex">{[0,1,2,3,4].map((i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}</div>
              Trusted by modern legal practices worldwide
            </div>
          </div>
          <div className="flex justify-center">
            <div className="rounded-3xl bg-white shadow-2xl border border-slate-200 p-10 flex flex-col items-center">
              <BrandLogo className="h-40 w-40" />
              <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                {STATS.map(([v, l]) => (
                  <div key={l} className="rounded-xl bg-slate-50 p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-600">{v}</div>
                    <div className="text-xs text-slate-500">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Law firms run on friction</h2>
          <p className="mt-3 text-slate-600">Disjointed tools and manual workflows drain billable hours and create risk.</p>
          <div className="mt-10 grid md:grid-cols-3 gap-6 text-left">
            {[
              ["Scattered documents", "Files spread across email, drives, and paper — hard to find and easy to lose."],
              ["Manual billing", "Invoices tracked in spreadsheets lead to missed revenue and delayed payments."],
              ["Missed hearings", "No central calendar means dates and deadlines slip through the cracks."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-xl border border-slate-200 p-6">
                <div className="w-2 h-2 rounded-full bg-rose-500 mb-3" />
                <div className="font-semibold text-slate-900">{t}</div>
                <div className="text-sm text-slate-500 mt-1">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">One platform for the entire firm</h2>
            <p className="mt-3 text-slate-600">Replaces a dozen disconnected tools with a single, secure system of record.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white border border-slate-200 p-6 hover:shadow-lg transition">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <div className="font-semibold text-slate-900">{f.title}</div>
                <div className="text-sm text-slate-500 mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-slate-900">Bank-grade security, by design</h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Your firm's data is locked down and accessible only to those you authorise. Confidential
            client information, case strategy, and financials — protected at every layer.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link to="/register">Get started free <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}