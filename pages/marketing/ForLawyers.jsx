import { Link } from "react-router-dom";
import { Briefcase, Landmark, Receipt, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { appUrl } from "@/lib/domain";

const BTN_PRIMARY =
  "inline-flex items-center justify-center bg-neutral-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-black transition-colors";
const BTN_OUTLINE =
  "inline-flex items-center justify-center border border-neutral-900 text-neutral-900 px-6 py-3 rounded-lg text-sm font-medium hover:bg-neutral-900 hover:text-white transition-colors";

const BENEFITS = [
  { icon: Briefcase, title: "Case management across jurisdictions", desc: "Handle matters in the US, UK, and India from a single, unified dashboard." },
  { icon: Landmark, title: "Court API live updates", desc: "Automatic hearing reminders and status changes from connected court systems." },
  { icon: Receipt, title: "Automated billing & trust accounting", desc: "Multi-currency invoices, payment links, and compliant trust ledgers." },
  { icon: MessageSquare, title: "Client communication", desc: "SMS, WhatsApp, and a secure client portal — all in one thread." },
  { icon: ShieldCheck, title: "Role-based team management", desc: "Lawyers, senior lawyers, and admins — each with the right access." },
  { icon: Sparkles, title: "AI-powered document analysis", desc: "Summarize filings, extract key facts, and draft faster with built-in AI." },
];

const STEPS = [
  { n: "01", t: "Sign up & verify", d: "Create your firm account and complete bar verification in minutes." },
  { n: "02", t: "Add cases & clients", d: "Import matters and onboard clients with custom intake forms." },
  { n: "03", t: "Manage everything in one place", d: "Track hearings, billing, documents, and communications from one dashboard." },
];

export default function ForLawyers() {
  return (
    <>
      <section className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900">Run your entire practice from one dashboard.</h1>
          <p className="mt-4 text-neutral-600">Everything a modern firm needs to manage cases, clients, and billing — across every jurisdiction you serve.</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <a href={appUrl("/register")} className={BTN_PRIMARY}>Start Free Trial</a>
            <Link to="/demo" className={BTN_OUTLINE}>Request a Demo</Link>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200 rounded-xl overflow-hidden">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-8">
                <Icon className="w-6 h-6 text-neutral-900" strokeWidth={1.5} />
                <h3 className="mt-4 text-lg font-semibold text-neutral-900">{title}</h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 text-center">How it works</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="text-3xl font-bold text-neutral-300">{s.n}</div>
                <h3 className="mt-3 text-lg font-semibold text-neutral-900">{s.t}</h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Start your free trial today</h2>
          <p className="mt-3 text-neutral-400">No credit card required. Set up in minutes.</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <a href={appUrl("/register")} className="inline-flex items-center justify-center bg-white text-neutral-900 px-6 py-3 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors">Start Free Trial</a>
            <Link to="/demo" className="inline-flex items-center justify-center border border-white text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-white hover:text-neutral-900 transition-colors">Request a Demo</Link>
          </div>
        </div>
      </section>
    </>
  );
}