import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import { appUrl } from "@/lib/domain";

const BTN_PRIMARY =
  "inline-flex items-center justify-center bg-neutral-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-black transition-colors";
const BTN_OUTLINE =
  "inline-flex items-center justify-center border border-neutral-900 text-neutral-900 px-6 py-3 rounded-lg text-sm font-medium hover:bg-neutral-900 hover:text-white transition-colors";

const TIERS = [
  {
    name: "Solo", price: "$59", unit: "/user/month", desc: "For solo practitioners", popular: false,
    features: ["All core features", "Up to 50 active cases", "1 user", "Email support", "Basic reporting"],
  },
  {
    name: "Professional", price: "$89", unit: "/user/month", desc: "For small to mid-size firms", popular: true,
    features: ["Everything in Solo", "Unlimited cases", "Up to 10 users", "Priority support", "Advanced reporting", "Court API integration", "AI assistant", "Client portal"],
  },
  {
    name: "Enterprise", price: "Custom", unit: "", desc: "For large firms and enterprises", popular: false,
    features: ["Everything in Professional", "Unlimited users", "Custom workflows", "Dedicated account manager", "API access", "White-label options", "Multi-jurisdiction setup"],
  },
];

const INCLUDED = ["Case management", "Client onboarding", "Billing", "Document management", "Multi-currency support"];

const ROWS = [
  { f: "Active cases", s: "50", p: "Unlimited", e: "Unlimited" },
  { f: "Users", s: "1", p: "10", e: "Unlimited" },
  { f: "Court API integration", s: false, p: true, e: true },
  { f: "AI assistant", s: false, p: true, e: true },
  { f: "Client portal", s: false, p: true, e: true },
  { f: "Advanced reporting", s: false, p: true, e: true },
  { f: "Priority support", s: false, p: true, e: true },
  { f: "API access", s: false, p: false, e: true },
  { f: "White-label", s: false, p: false, e: true },
  { f: "Dedicated account manager", s: false, p: false, e: true },
  { f: "Multi-jurisdiction setup", s: false, p: false, e: true },
];

const FAQS = [
  { q: "Do I need a credit card to start?", a: "No. You can start your free trial without entering any payment details." },
  { q: "Which countries and currencies are supported?", a: "VakilCase supports firms in the US, UK, and India with USD, GBP, and INR billing." },
  { q: "Can I switch plans later?", a: "Yes — upgrade or downgrade at any time. Changes apply at the start of your next billing cycle." },
  { q: "Is my data secure?", a: "All data is encrypted in transit and at rest, with role-based access control and audit logging." },
  { q: "Do you offer support for onboarding?", a: "Professional and Enterprise plans include priority support, and Enterprise includes a dedicated account manager." },
  { q: "What does 'unlimited cases' mean?", a: "There's no cap on the number of matters you can manage — create as many cases as your firm handles." },
];

function Cell({ v }) {
  if (typeof v === "string") return <span className="text-xs text-neutral-600">{v}</span>;
  return v
    ? <Check className="w-4 h-4 text-neutral-900 mx-auto" />
    : <X className="w-4 h-4 text-neutral-300 mx-auto" />;
}

export default function Pricing() {
  return (
    <>
      <section className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900">Simple, transparent pricing. No add-ons. No surprises.</h1>
          <p className="mt-4 text-neutral-600">One price per user. Everything included. Cancel anytime.</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`rounded-xl border p-8 ${t.popular ? "border-neutral-900 shadow-[0_8px_30px_rgba(0,0,0,0.06)]" : "border-neutral-200"}`}
              >
                {t.popular && (
                  <span className="inline-block text-xs font-medium bg-neutral-900 text-white px-2.5 py-1 rounded-full mb-4">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-neutral-900">{t.name}</h3>
                <p className="text-sm text-neutral-500">{t.desc}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-neutral-900">{t.price}</span>
                  {t.unit && <span className="text-sm text-neutral-500">{t.unit}</span>}
                </div>
                {t.name === "Enterprise" ? (
                  <Link to="/demo" className={`${t.popular ? BTN_PRIMARY : BTN_OUTLINE} mt-6 w-full`}>
                    Contact Sales
                  </Link>
                ) : (
                  <a href={appUrl("/register")} className={`${t.popular ? BTN_PRIMARY : BTN_OUTLINE} mt-6 w-full`}>
                    Start Free Trial
                  </a>
                )}
                <ul className="mt-8 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-sm text-neutral-600">
                      <Check className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-neutral-600">
            <span className="font-medium text-neutral-900">All plans include:</span>
            {INCLUDED.map((f) => (
              <span key={f} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-900" /> {f}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 text-center">Compare plans in detail</h2>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left font-medium text-neutral-500 py-4 pr-4">Feature</th>
                  <th className="font-semibold text-neutral-900 py-4 px-4">Solo</th>
                  <th className="font-semibold text-neutral-900 py-4 px-4">Professional</th>
                  <th className="font-semibold text-neutral-900 py-4 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.f} className="border-b border-neutral-100">
                    <td className="py-4 pr-4 text-neutral-700">{r.f}</td>
                    <td className="py-4 px-4 text-center"><Cell v={r.s} /></td>
                    <td className="py-4 px-4 text-center"><Cell v={r.p} /></td>
                    <td className="py-4 px-4 text-center"><Cell v={r.e} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 text-center">Frequently asked questions</h2>
          <div className="mt-10">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`q${i}`} className="border-b border-neutral-200">
                  <AccordionTrigger className="text-left text-base text-neutral-900">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-neutral-600">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Still not sure?</h2>
          <p className="mt-3 text-neutral-400">Request a demo and we'll help you choose the right plan.</p>
          <div className="mt-8">
            <Link to="/demo" className="inline-flex items-center justify-center bg-white text-neutral-900 px-6 py-3 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors">
              Request a Demo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}