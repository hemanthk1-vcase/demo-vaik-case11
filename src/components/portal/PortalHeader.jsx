import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function PortalHeader({ me }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/welcome" className="flex items-center gap-2 font-bold text-slate-900">
          <BrandLogo className="h-9 w-9" /> <span>Vakil Case</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/welcome" className="text-sm text-slate-500 hover:text-slate-900 hidden sm:block">
            <ArrowLeft className="w-4 h-4 inline mr-1" /> Website
          </Link>
          {me?.firm_code && (
            <span
              className="hidden sm:inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-semibold text-slate-700"
              title="Your firm code — share it with your clients"
            >
              Firm code: {me.firm_code}
            </span>
          )}
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-900">{me?.full_name || me?.email}</div>
            <div className="text-xs text-slate-500">{me?.firm_code ? "Firm & Client Portal" : "Client Portal"}</div>
          </div>
        </div>
      </div>
    </header>
  );
}