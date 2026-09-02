import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const fmt = (n, currency) =>
  currency === "INR" ? "₹" + n.toLocaleString("en-IN") : "$" + n.toLocaleString("en-US");

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
      includes: "Starter",
      features: ["5 users", "100 cases", "Trust accounting", "E-signature", "Time tracking"],
    },
    {
      name: "Enterprise",
      custom: true, currency: "INR",
      includes: "Professional",
      features: ["Multi-lawyer firm", "SSO + audit logs", "Priority support", "Dedicated onboarding"],
    },
  ],
  USD: [
    {
      name: "Starter",
      monthly: 25, yearly: 250, currency: "USD",
      features: ["1 user", "25 cases", "Invoicing", "Documents", "Client CRM"],
      highlight: true,
    },
    {
      name: "Professional",
      monthly: 99, yearly: 990, currency: "USD",
      includes: "Starter",
      features: ["5 users", "100 cases", "Trust accounting", "E-signature", "Time tracking"],
    },
    {
      name: "Team",
      monthly: 150, yearly: 1500, currency: "USD",
      includes: "Professional",
      features: ["10 users", "200 cases"],
    },
    {
      name: "Enterprise",
      custom: true, currency: "USD",
      includes: "Team",
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
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
            value === opt.value
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
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
  const [mode, setMode] = useState("dark"); // 'dark' | 'light'
  const plans = PLANS[region];

  return (
    <div className={mode === "dark" ? "dark" : ""}>
      <div className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
        {/* Hero */}
        <section className="py-16 md:py-20 bg-slate-50 dark:bg-transparent">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <h1 className="text-4xl md:text-5xl font-bold">Simple, transparent pricing</h1>
              <button
                onClick={() => setMode((m) => (m === "dark" ? "light" : "dark"))}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
                aria-label="Toggle theme"
                title={mode === "dark" ? "Switch to light" : "Switch to dark"}
              >
                {mode === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400">Choose your region. No free tier — every plan is production-ready.</p>
            <div className="mt-8 flex justify-center">
              <Toggle
                options={[{ value: "INR", label: "🇮🇳 India" }, { value: "USD", label: "🇺🇸 US" }]}
                value={region}
                onChange={setRegion}
              />
            </div>
          </div>
        </section>

        {/* Plans box — billing toggle lives inside the box */}
        <section className="pb-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex flex-col items-center gap-3 mb-8">
                <Toggle
                  options={[{ value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" }]}
                  value={cycle}
                  onChange={setCycle}
                />
                {cycle === "yearly" && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Save ~17% with annual billing</p>
                )}
              </div>

              <div className={`grid gap-6 ${plans.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
                {plans.map((p) => {
                  const price = p.custom ? "Custom" : fmt(cycle === "monthly" ? p.monthly : p.yearly, p.currency);
                  const period = p.custom ? "" : cycle === "monthly" ? "/month" : "/year";
                  return (
                    <div
                      key={p.name}
                      className={`rounded-2xl border p-6 flex flex-col ${
                        p.highlight
                          ? "border-indigo-600 ring-2 ring-indigo-600 dark:border-indigo-500 dark:ring-indigo-500"
                          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{p.name}</div>
                      <div className="mt-2 flex items-end gap-1">
                        <span className="text-3xl font-bold">{price}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 mb-1">{period}</span>
                      </div>
                      <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300 flex-1">
                        {p.includes && (
                          <li className="text-slate-400 dark:text-slate-500 italic mb-1">Everything in {p.includes}, plus:</li>
                        )}
                        {p.features.map((f) => (
                          <li key={f} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" /> {f}
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
            </div>
          </div>
        </section>

        {/* Why we're different */}
        <section className="py-16 bg-white dark:bg-transparent">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center">Why Vakil Case is different</h2>
            <p className="mt-3 text-center text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Most legal platforms bill <strong>per user, per month</strong> — fees climb as your firm grows.
              We don't.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Flat per-firm pricing",
                  body: "Clio, MyCase & PracticePanther charge $39–$149 per user. Our price is per firm — add a paralegal or associate without your bill jumping.",
                },
                {
                  title: "No surprise add-ons",
                  body: "Trust accounting, e-signature, invoicing and payments are bundled. Competitors gate these behind mid tiers or charge $39/mo extra for accounting.",
                },
                {
                  title: "Transparent INR & USD",
                  body: "Clear tiers for both regions — no quote-only enterprise wall and no $399 onboarding fee to get started.",
                },
              ].map((c) => (
                <div key={c.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{c.title}</div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center">Frequently asked questions</h2>
            <div className="mt-8 space-y-4">
              {FAQ[region].map(([q, a]) => (
                <div key={q} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{q}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold">Ready to modernise your practice?</h2>
            <div className="mt-6">
              <Button size="lg" asChild>
                <Link to="/register">Start now <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}