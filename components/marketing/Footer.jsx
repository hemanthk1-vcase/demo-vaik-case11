import { Link } from "react-router-dom";

const COLS = [
  {
    title: "Product",
    links: [
      { label: "Features", to: "/features" },
      { label: "Pricing", to: "/pricing" },
      { label: "For Lawyers", to: "/for-lawyers" },
      { label: "For Clients", to: "/for-clients" },
      { label: "Integrations", to: "/features" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Blog", to: "/about" },
      { label: "Careers", to: "/about" },
      { label: "Contact", to: "/demo" },
      { label: "Press", to: "/about" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/about" },
      { label: "Terms of Service", to: "/about" },
      { label: "Security", to: "/about" },
      { label: "Compliance", to: "/about" },
    ],
  },
];

const LANGS = ["English", "Español", "हिंदी", "தமிழ்", "తెలుగు", "ಕನ್ನಡ"];

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="text-xl font-bold text-white tracking-tight mb-4">VakilCase</div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Legal practice management for the modern world. Serving US, UK, and India.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-medium text-white mb-4">{c.title}</h4>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">© 2026 VakilCase. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-neutral-500">
            {LANGS.map((l, i) => (
              <span key={l} className={i === 0 ? "text-white" : ""}>
                {l}
                {i < LANGS.length - 1 && <span className="ml-3 text-neutral-700">·</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}