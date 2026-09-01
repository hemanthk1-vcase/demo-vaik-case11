import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fmt = (n, currency) =>
  currency === "INR" ? "₹" + n.toLocaleString("en-IN") : "$" + n.toLocaleString("en-US");

// PLAN shape: { name, monthly, yearly, currency, features[], highlight }
const PLANS = {
  INR: [
    {
      name: "Starter",
      monthly: 100, yearly: 1000, currency: "INR",
      features: ["1 user", "25 cases", "Invoicing", "Documents", "Client CRM"],
      highlight: true,
    },
    {
      name: "Professional",
      monthly: 350, yearly: 3500, currency: "INR",
      features: ["5 users", "100 cases", "Trust accounting", "E-signature", "Time tracking"],
    },
    {
      name: "Enterprise",
      custom: true, currency: "INR",
      features: ["Multi-lawyer firm", "SSO + audit logs", "Priority support", "Dedicated onboarding"],
    },
  ],
  USD: [
    {
      name: "Starter",
      monthly: 19, yearly: 190, currency: "USD",
      features: ["1 user", "25 cases", "Invoicing", "Documents", "Client CRM"],
      highlight: true,
    },
    {
      name: "Professional",
      monthly: 99, yearly: 990, currency: "USD",
      features: ["5 users", "100 cases", "Trust accounting", "E-signature", "Time tracking"],
    },
    {
      name: "Enterprise",
      custom: true, currency: "USD",
      features: ["Multi-lawyer firm", "SSO + audit logs", "Priority support", "Dedicated onboarding"],
    },
  ],
};

const FAQ = {
  INR: [
    ["Is there a free plan?", "No. Vakil Case starts at ₹100/month so every firm gets full access to a production-ready workspace."],
    ["Do you bill in INR?", "Yes — every plan, invoice, and trust ledger is in Indian Rupees (₹)."],
    ["Is my data secure?", "All records are protected by row-level security with admin-only writes."],
    ["Can I upgrade later?", "Yes — start on Starter and move to Professional or Enterprise as your firm grows."],
  ],
  USD: [
    ["Is there a free plan?", "No. Plans start at $19/month, giving every firm a production-ready workspace."],
    ["Do you bill in USD?", "Yes — all plans and invoices are billed in US Dollars ($)."],
    ["Is my data secure?", "All records are protected by row-level security with admin-only writes."],
    ["Can I upgrade later?", "Yes — start on Starter and move to Professional or Enterprise as you grow."],
  ],
};

function Toggle({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
            value === opt.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function Pricing() {
  const [region, setRegion] = useState("INR");
  const [cycle, setCycle] = useState("monthly");
  const plans = PLANS[region];

  return (
    <div>
      <section className="bg-slate-50 py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Simple, transparent pricing</h1>
          <p className="mt-4 text-lg text-slate-600">Choose your region and billing cycle. No free tier — every plan is production-ready.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Toggle
              options={[{ value: "INR", label: "🇮🇳 India" }, { value: "USD", label: "🇺🇸 US" }]}
              value={region}
              onChange={setRegion}
            />
            <Toggle
              options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]}
              value={cycle}
              onChange={setCycle}
            />
          </div>
          {cycle === "yearly" && (
            <p className="mt-3 text-sm text-emerald-600 font-medium">Save ~17% with annual billing</p>
          )}
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const price = p.custom ? "Custom" : fmt(cycle === "monthly" ? p.monthly : p.yearly, p.currency);
            const period = p.custom ? "" : cycle === "monthly" ? "/month" : "/year";
            return (
              <div
                key={p.name}
                className={`rounded-2xl border p-6 flex flex-col ${
                  p.highlight ? "border-indigo-600 ring-2 ring-indigo-600" : "border-slate-200"
                }`}
              >
                <div className="text-sm font-semibold text-slate-500">{p.name}</div>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-3xl font-bold text-slate-900">{price}</span>
                  <span className="text-sm text-slate-500 mb-1">{period}</span>
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
            );
          })}
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 text-center">Frequently asked questions</h2>
          <div className="mt-8 space-y-4">
            {FAQ[region].map(([q, a]) => (
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
              <Link to="/register">Start now <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}