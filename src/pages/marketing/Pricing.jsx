import React from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const inr = (n) => "₹" + n.toLocaleString("en-IN");

const PLANS = [
  {
    name: "Free", price: inr(0), period: "forever",
    features: ["Up to 10 cases", "Basic CRM", "1 user"],
  },
  {
    name: "Starter", price: inr(1499), period: "/month", highlight: true,
    features: ["Up to 100 cases", "Invoicing", "Documents", "2 users"],
  },
  {
    name: "Professional", price: inr(3999), period: "/month",
    features: ["Unlimited cases", "Trust accounting", "E-signature", "Time tracking", "5 users"],
  },
  {
    name: "Enterprise", price: "Custom", period: "",
    features: ["Multi-lawyer firm", "SSO + audit logs", "Priority support", "Dedicated onboarding"],
  },
];

const FAQ = [
  ["Can I start for free?", "Yes — the Free plan lets you manage up to 10 cases with 1 user, no credit card required."],
  ["Do you bill in INR?", "Every plan, invoice, and trust ledger is in Indian Rupees (₹)."],
  ["Is my data secure?", "All records are protected by row-level security with admin-only writes — your data stays yours."],
  ["Can I upgrade later?", "Absolutely. Start free and upgrade to Starter, Professional, or Enterprise as your firm grows."],
];

export default function Pricing() {
  return (
    <div>
      <section className="bg-slate-50 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Simple plans, in ₹</h1>
          <p className="mt-4 text-lg text-slate-600">Start free. Scale as your firm grows.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-6">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl border p-6 flex flex-col ${
                p.highlight ? "border-indigo-600 ring-2 ring-indigo-600" : "border-slate-200"
              }`}
            >
              <div className="text-sm font-semibold text-slate-500">{p.name}</div>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-3xl font-bold text-slate-900">{p.price}</span>
                <span className="text-sm text-slate-500 mb-1">{p.period}</span>
              </div>
              <ul className="mt-5 space-y-2 text-sm text-slate-600 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" variant={p.highlight ? "default" : "outline"} asChild>
                <Link to="/register">Choose {p.name}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 text-center">Frequently asked questions</h2>
          <div className="mt-8 space-y-4">
            {FAQ.map(([q, a]) => (
              <div key={q} className="rounded-xl border border-slate-200 p-5 bg-white">
                <div className="font-semibold text-slate-900">{q}</div>
                <div className="text-sm text-slate-500 mt-1">{a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900">Ready to modernise your practice?</h2>
          <div className="mt-6">
            <Button size="lg" asChild>
              <Link to="/register">Start free <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}