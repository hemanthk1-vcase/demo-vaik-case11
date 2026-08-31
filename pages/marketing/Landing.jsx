import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase, Landmark, UserCheck, Receipt, Scale, Sparkles,
  ArrowRight, Minus,
} from "lucide-react";
import DashboardMockup from "@/components/marketing/DashboardMockup";
import { appUrl } from "@/lib/domain";
import { Slider } from "@/components/ui/slider";

const BTN_PRIMARY =
  "inline-flex items-center justify-center bg-neutral-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-black transition-colors";
const BTN_OUTLINE =
  "inline-flex items-center justify-center border border-neutral-900 text-neutral-900 px-6 py-3 rounded-lg text-sm font-medium hover:bg-neutral-900 hover:text-white transition-colors";

const WHY = [
  { icon: Briefcase, title: "Case Management", desc: "14 case categories, 80+ case types, 13-stage status flow, and cascading matter details." },
  { icon: Landmark, title: "Court API Integration", desc: "Live case updates from Indian eCourts, US federal courts, and UK court systems. Never miss a hearing." },
  { icon: UserCheck, title: "Client Onboarding", desc: "Custom intake forms, automated workflows, secure document collection — all paperless." },
  { icon: Receipt, title: "Billing & Payments", desc: "Trust accounting, multi-currency (USD, GBP, INR), automated invoices, online payment links." },
  { icon: Scale, title: "Lawyer Directory", desc: "A verified, admin-curated directory where clients find the right lawyer for their case." },
  { icon: Sparkles, title: "Built-in AI", desc: "Document summarization, case analysis, and smart automation — included in every plan, no upsell." },
];

const PRACTICE = ["Criminal Law", "Civil Litigation", "Family Law", "Corporate Law", "Immigration", "Real Estate", "Estate Planning", "Personal Injury", "Intellectual Property", "Tax Law", "Bankruptcy", "Employment Law", "Constitutional Law", "Cyber Law"];

const LAWYER_BENEFITS = [
  "Manage cases across US, UK, and India from one dashboard",
  "Real-time court updates via API integration",
  "Automated client intake and onboarding",
  "Trust accounting with multi-currency support",
  "Role-based access (lawyer, senior lawyer, admin)",
  "Built-in AI for document analysis",
];

const CLIENT_BENEFITS = [
  "Find verified lawyers by practice area and location",
  "Track your case status in real time",
  "Secure document upload and sharing",
  "Pay legal fees online (USD, GBP, or INR)",
  "Communicate securely with your lawyer",
  "Multilingual support (English, Hindi, Spanish, Tamil, Telugu, Kannada)",
];

const HIGHLIGHTS = [
  { stat: "5+ tools replaced", desc: "Case management, billing, intake, document automation, and client portal in one" },
  { stat: "3 countries served", desc: "United States, United Kingdom, and India from a single dashboard" },
  { stat: "6 languages", desc: "English, Hindi, Spanish, Tamil, Telugu, and Kannada" },
  { stat: "All-inclusive pricing", desc: "No add-ons. No upsells. No hidden costs." },
];

const TESTIMONIALS = [
  { quote: "VakilCase reduced our case prep time by 40% in the first quarter.", name: "[Lawyer name]", firm: "[Firm name], [City]" },
  { quote: "We collected invoices 30% faster with automated billing and payment links.", name: "[Lawyer name]", firm: "[Firm name], [City]" },
  { quote: "We expanded our practice to 3 countries on a single platform.", name: "[Lawyer name]", firm: "[Firm name], [City]" },
];

function RoiCalculator() {
  const [cases, setCases] = useState(20);
  const [rate, setRate] = useState(200);
  const hoursPerMonth = cases * 3;
  const annual = hoursPerMonth * rate * 12;
  return (
    <div className="max-w-3xl mx-auto rounded-xl border border-neutral-200 bg-white p-8">
      <div className="space-y-8">
        <div>
          <div className="flex justify-between mb-3">
            <label className="text-sm text-neutral-600">How many cases do you handle per month?</label>
            <span className="text-sm font-medium text-neutral-900">{cases}</span>
          </div>
          <Slider value={[cases]} min={1} max={100} step={1} onValueChange={(v) => setCases(v[0])} />
        </div>
        <div>
          <div className="flex justify-between mb-3">
            <label className="text-sm text-neutral-600">Average billing rate per hour (USD)</label>
            <span className="text-sm font-medium text-neutral-900">${rate}</span>
          </div>
          <Slider value={[rate]} min={50} max={500} step={10} onValueChange={(v) => setRate(v[0])} />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-5">
          <div className="text-xs text-neutral-500 mb-1">Estimated annual revenue recovered</div>
          <div className="text-2xl font-bold text-neutral-900">${annual.toLocaleString()}</div>
        </div>
        <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-5">
          <div className="text-xs text-neutral-500 mb-1">Hours saved per month</div>
          <div className="text-2xl font-bold text-neutral-900">{hoursPerMonth}</div>
        </div>
      </div>
      <div className="mt-6 text-center">
        <Link to="/demo" className={BTN_PRIMARY}>Get a detailed ROI report</Link>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-28 pb-20 min-h-screen flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center w-full">
            <div className="lg:col-span-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-600">
                Now serving US, UK &amp; India
              </span>
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.05]">
                The legal practice platform built for the modern world.
              </h1>
              <p className="mt-6 text-lg text-neutral-600 max-w-xl leading-relaxed">
                Manage cases, track court updates, onboard clients, collect payments, and grow your firm — across US, UK, and India. One platform. Every jurisdiction.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/demo" className={BTN_PRIMARY}>Request a Demo</Link>
                <Link to="/features" className={BTN_OUTLINE}>Explore Features</Link>
              </div>
              <p className="mt-5 text-xs text-neutral-500">
                No credit card required · Setup in minutes · Trusted by firms across 3 continents
              </p>
            </div>
            <div className="lg:col-span-2">
              <DashboardMockup className="-rotate-1" />
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[["14", "case categories"], ["80+", "case types"], ["6", "languages"]].map(([n, l]) => (
                  <div key={l} className="rounded-lg border border-neutral-200 py-3">
                    <div className="text-lg font-bold text-neutral-900">{n}</div>
                    <div className="text-[11px] text-neutral-500">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-neutral-500">Trusted by law firms across the United States, United Kingdom, and India</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-neutral-400">
            <span>US Bar Associations</span><span>UK Law Society</span><span>Bar Council of India</span>
          </div>
        </div>
      </section>

      {/* Why VakilCase */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">Everything your firm needs. Nothing it doesn't.</h2>
            <p className="mt-4 text-neutral-600">VakilCase replaces 5+ tools with one unified platform — at a fraction of what competitors charge.</p>
          </div>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200 rounded-xl overflow-hidden">
            {WHY.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-8">
                <Icon className="w-6 h-6 text-neutral-900" strokeWidth={1.5} />
                <h3 className="mt-4 text-lg font-semibold text-neutral-900">{title}</h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/features" className="inline-flex items-center gap-1 text-sm font-medium text-neutral-900 hover:gap-2 transition-all">
              See all features <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Practice areas */}
      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 text-center">From criminal defense to corporate law</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {PRACTICE.map((p) => (
              <span key={p} className="rounded-full border border-neutral-300 px-4 py-2 text-sm text-neutral-700">{p}</span>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-neutral-500">And 80+ specific case types within these categories</p>
        </div>
      </section>

      {/* For Lawyers vs Clients */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-xl border border-neutral-200 p-8">
              <h3 className="text-xl font-semibold text-neutral-900">For Lawyers &amp; Law Firms</h3>
              <ul className="mt-6 space-y-3">
                {LAWYER_BENEFITS.map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-neutral-600">
                    <Minus className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <a href={appUrl("/register")} className={`${BTN_PRIMARY} mt-8 w-full sm:w-auto`}>Start Free Trial</a>
            </div>
            <div className="rounded-xl border border-neutral-200 p-8">
              <h3 className="text-xl font-semibold text-neutral-900">For Clients</h3>
              <ul className="mt-6 space-y-3">
                {CLIENT_BENEFITS.map((b) => (
                  <li key={b} className="flex gap-3 text-sm text-neutral-600">
                    <Minus className="w-4 h-4 mt-0.5 text-neutral-400 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <a href={appUrl("/find-a-lawyer")} className={`${BTN_OUTLINE} mt-8 w-full sm:w-auto`}>Find a Lawyer</a>
            </div>
          </div>
        </div>
      </section>

      {/* ROI */}
      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 text-center">See how much VakilCase can save your firm</h2>
          <div className="mt-12"><RoiCalculator /></div>
        </div>
      </section>

      {/* Platform Highlights */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">One platform. Zero compromises.</h2>
            <p className="mt-4 text-neutral-600">Everything you need to run a modern legal practice — without juggling 5 different tools.</p>
          </div>
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HIGHLIGHTS.map((h) => (
              <div key={h.stat} className="rounded-xl border border-neutral-200 p-8">
                <div className="text-2xl font-bold text-neutral-900">{h.stat}</div>
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 text-center">What firms say about VakilCase</h2>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 bg-white p-8">
                <div className="text-5xl text-neutral-200 leading-none font-serif">&ldquo;</div>
                <p className="mt-2 text-neutral-700 leading-relaxed">{t.quote}</p>
                <div className="mt-6 text-sm">
                  <div className="font-medium text-neutral-900">{t.name}</div>
                  <div className="text-neutral-500">{t.firm}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-neutral-400">Placeholder testimonials — replace with real quotes before launch.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Ready to modernize your practice?</h2>
          <p className="mt-4 text-neutral-400">Join law firms across 3 continents who trust VakilCase.</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/demo" className="inline-flex items-center justify-center bg-white text-neutral-900 px-6 py-3 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors">Request a Demo</Link>
            <a href={appUrl("/register")} className="inline-flex items-center justify-center border border-white text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-white hover:text-neutral-900 transition-colors">Start Free Trial</a>
          </div>
          <p className="mt-5 text-xs text-neutral-500">No credit card required · Cancel anytime</p>
        </div>
      </section>
    </>
  );
}