import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Scale, Briefcase, Receipt, Clock, ShieldCheck, GraduationCap, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";

const BENEFITS = [
  { icon: Briefcase, title: "Win more matters", desc: "Track every case from intake to judgment with clear status, priority, and hearing dates." },
  { icon: Receipt, title: "Get paid faster", desc: "Automated invoicing in your local currency with partial-payment tracking and overdue alerts." },
  { icon: Clock, title: "Capture every billable hour", desc: "Log time per case with rates and billing flags — no more lost time." },
  { icon: GraduationCap, title: "Credential your team", desc: "Bar registration numbers, specializations, ratings, and verification on every profile." },
  { icon: Landmark, title: "Trust accounting built in", desc: "Separate trust and operating ledgers with full transaction history." },
  { icon: ShieldCheck, title: "Protect client confidentiality", desc: "Row-level security and access-level controls keep sensitive data locked down." },
];

export default function ForLawyers() {
  return (
    <div>
      <section className="bg-slate-50 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm">
            <Scale className="w-5 h-5" /> For Lawyers & Law Firms
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-slate-900">Spend less time on admin, more time in court</h1>
          <p className="mt-4 text-lg text-slate-600">
            Vakil Case replaces the patchwork of tools lawyers juggle daily with one secure platform —
            built for the way modern law firms actually work.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link to="/register">Get started <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl border border-slate-200 p-6 flex gap-4">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <b.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">{b.title}</div>
                <div className="text-sm text-slate-500 mt-1">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900">From solo advocates to multi-lawyer firms</h2>
          <p className="mt-3 text-slate-600">Vakil Case scales with your practice — get started, upgrade as you grow.</p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link to="/pricing">See plans <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}