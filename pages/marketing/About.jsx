import { Link } from "react-router-dom";
import { Lightbulb, Globe, ShieldCheck, Compass } from "lucide-react";

const BTN_PRIMARY =
  "inline-flex items-center justify-center bg-neutral-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-black transition-colors";

const VALUES = [
  { icon: Lightbulb, title: "Innovation", desc: "We rethink legal workflows from first principles, not legacy habits." },
  { icon: Globe, title: "Accessibility", desc: "A platform that works for lawyers and clients across continents and languages." },
  { icon: ShieldCheck, title: "Trust", desc: "Security, compliance, and auditability built into everything we ship." },
  { icon: Compass, title: "Global Reach", desc: "Designed for US, UK, and India — with every jurisdiction in mind." },
];

const TIMELINE = [
  { year: "2024", title: "Founded", desc: "VakilCase is founded to bridge traditional legal practice and modern technology." },
  { year: "2025", title: "Multi-jurisdiction launch", desc: "Platform expands to serve firms across the US, UK, and India." },
  { year: "2026", title: "AI & court integrations", desc: "Built-in AI assistant and live court API integrations ship to all plans." },
];

export default function About() {
  return (
    <>
      <section className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900">VakilCase is on a mission to modernize legal practice worldwide.</h1>
          <p className="mt-4 text-neutral-600">One platform for every jurisdiction — built for the way law is practiced today.</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-6 py-20 space-y-6 text-neutral-600 leading-relaxed text-lg">
          <p>VakilCase was founded to bridge the gap between traditional legal practice and modern technology. For too long, law firms have stitched together a dozen disjointed tools — case management here, billing there, court updates somewhere else — and paid a premium for the privilege.</p>
          <p>Today we serve firms across the United States, the United Kingdom, and India with a single unified platform. One place to manage cases, onboard clients, track court updates, and collect payments — in the currency and language that fits each matter.</p>
          <p>We are committed to accessibility, transparency, and innovation: a platform that's powerful enough for an enterprise firm and simple enough for a solo practitioner, with pricing that doesn't punish you for growing.</p>
        </div>
      </section>

      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Founder</h2>
          <div className="mt-8 flex flex-col sm:flex-row items-start gap-8 rounded-xl border border-neutral-200 bg-white p-8">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white text-xl font-bold">HK</div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Hemanth Kumar</h3>
              <p className="text-sm text-neutral-500">Founder &amp; CEO</p>
              <p className="mt-3 text-sm text-neutral-600 leading-relaxed">Hemanth founded VakilCase to bring modern software to legal practice across continents — making law firms faster, more transparent, and easier to run. (Bio placeholder — replace with the founder's official bio.)</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 text-center">Our values</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-neutral-200 p-6">
                <Icon className="w-6 h-6 text-neutral-900" strokeWidth={1.5} />
                <h3 className="mt-4 font-semibold text-neutral-900">{title}</h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 text-center">Our story</h2>
          <div className="mt-12 space-y-8">
            {TIMELINE.map((t, i) => (
              <div key={t.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-neutral-900" />
                  {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-neutral-300 mt-1" />}
                </div>
                <div className="pb-2">
                  <div className="text-sm font-medium text-neutral-900">{t.year}</div>
                  <h3 className="mt-1 font-semibold text-neutral-900">{t.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Join the VakilCase community</h2>
          <p className="mt-3 text-neutral-400">Law firms across 3 continents already trust VakilCase.</p>
          <div className="mt-8">
            <Link to="/demo" className={BTN_PRIMARY + " bg-white text-neutral-900 hover:bg-neutral-200"}>Request a Demo</Link>
          </div>
        </div>
      </section>
    </>
  );
}