import React from "react";
import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";

const COLS = [
  { title: "Product", links: [["/features", "Features"], ["/pricing", "Pricing"], ["/welcome", "Overview"]] },
  { title: "Audiences", links: [["/for-lawyers", "For Lawyers"], ["/for-clients", "For Clients"]] },
  { title: "Company", links: [["/about", "About"], ["/welcome", "Contact"]] },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <Link to="/welcome" className="flex items-center gap-2 font-bold text-slate-900">
            <BrandLogo className="h-9 w-9" />
            <span className="text-lg">Vakil Case</span>
          </Link>
          <p className="mt-3 text-sm text-slate-500 max-w-xs">
            The all-in-one practice management platform for modern Indian law firms.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <div className="text-sm font-semibold text-slate-900">{c.title}</div>
            <ul className="mt-3 space-y-2">
              {c.links.map(([to, label]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-slate-500 hover:text-indigo-600">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>© 2026 Vakil Case. All rights reserved.</span>
          <span>www.vakilcase.com</span>
        </div>
      </div>
    </footer>
  );
}