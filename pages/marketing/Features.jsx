import { Link } from "react-router-dom";
import {
  Briefcase, Landmark, UserCheck, Receipt, Scale, ShieldCheck,
  Sparkles, Languages, BarChart3, FileLock, ArrowRight,
} from "lucide-react";

const BTN_PRIMARY =
  "inline-flex items-center justify-center bg-neutral-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-black transition-colors";

const FEATURES = [
  { icon: Briefcase, title: "Case Management", desc: "14 case categories, 80+ case types, 13-stage status flow, and cascading dropdowns that capture exactly the matter details you need." },
  { icon: Landmark, title: "Court API Integration", desc: "Live hearing updates from eCourts India, US federal courts, and UK court systems — so you never miss a hearing." },
  { icon: UserCheck, title: "Client Onboarding", desc: "Custom intake forms, secure document collection, and automated workflows — entirely paperless." },
  { icon: Receipt, title: "Billing & Trust Accounting", desc: "Multi-currency invoices, automated reminders, and trust account compliance built in." },
  { icon: Scale, title: "Lawyer Directory", desc: "Admin-verified profiles, client search, and practice-area matching in a curated directory." },
  { icon: ShieldCheck, title: "Role-Based Access Control", desc: "Granular roles for clients, lawyers, senior lawyers, and admins — each sees exactly what they should." },
  { icon: Sparkles, title: "AI Assistant", desc: "Document summarization, case analysis, and smart automation — included in every plan." },
  { icon: Languages, title: "Multi-Language Support", desc: "6 languages — English active today, with Hindi, Tamil, Telugu, Kannada, and Spanish coming soon." },
  { icon: BarChart3, title: "Reporting & Analytics", desc: "Firm performance, case velocity, and revenue tracking with clean visual dashboards." },
  { icon: FileLock, title: "Secure Document Management", desc: "Encryption, version control, and client-controlled sharing for every file." },
];

function Preview({ icon: Icon }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 flex flex-col items-center justify-center min-h-[240px]">
      <Icon className="w-10 h-10 text-neutral-900" strokeWidth={1.25} />
      <div className="mt-6 w-full max-w-xs space-y-2.5">
        <div className="h-2.5 rounded bg-neutral-200 w-3/4 mx-auto" />
        <div className="h-2.5 rounded bg-neutral-200 w-1/2 mx-auto" />
        <div className="h-8 rounded bg-white border border-neutral-200 w-2/3 mx-auto mt-3" />
      </div>
    </div>
  );
}

function Row({ feature, i }) {
  const { icon: Icon, title, desc } = feature;
  const textRight = i % 2 === 1;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
      <div className={textRight ? "md:order-2" : ""}>
        <Icon className="w-7 h-7 text-neutral-900" strokeWidth={1.5} />
        <h3 className="mt-4 text-2xl font-semibold text-neutral-900">{title}</h3>
        <p className="mt-3 text-neutral-600 leading-relaxed">{desc}</p>
      </div>
      <div className={textRight ? "md:order-1" : ""}>
        <Preview icon={Icon} />
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <>
      <section className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900">One platform. Every tool your firm needs.</h1>
          <p className="mt-4 text-neutral-600">Ten core capabilities, designed to work together — and to get out of your way.</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="space-y-20 divide-y divide-neutral-100">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={i === 0 ? "" : "pt-20"}>
                <Row feature={f} i={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight">See it all in one demo</h2>
          <p className="mt-3 text-neutral-400">We'll walk you through every feature on your own data.</p>
          <div className="mt-8">
            <Link to="/demo" className="inline-flex items-center gap-2 bg-white text-neutral-900 px-6 py-3 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors">
              Request a Demo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}