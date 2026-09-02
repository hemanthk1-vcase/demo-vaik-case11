import React from "react";
import { Building2, Briefcase, Receipt, CalendarClock, FileSignature } from "lucide-react";

/**
 * Static marketing preview of the Client Portal GUI — mirrors the real
 * /client-portal page so the website can show the product before signup.
 */
export default function PortalPreview() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600" />
          <span className="font-bold text-slate-900 text-sm">Vakil Case</span>
          <span className="text-xs text-slate-400">Client Portal</span>
        </div>
        <div className="text-xs text-slate-500">Ananya S.</div>
      </div>

      {/* Firm bar */}
      <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-200">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">Connected firm</div>
          <div className="text-sm font-bold text-slate-900">Meera Iyer &amp; Associates</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-5">
        {[
          [Briefcase, "Active matters", "2"],
          [Receipt, "Outstanding", "₹80,000"],
          [CalendarClock, "Next hearing", "14 Oct"],
        ].map(([Icon, label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Icon className="w-3 h-3" /> {label}
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="px-5 pb-5 space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-xs">
          <div>
            <div className="font-semibold text-slate-900">Custody agreement modification</div>
            <div className="text-slate-400">Delhi High Court · Discovery</div>
          </div>
          <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 font-medium">In progress</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-xs">
          <div>
            <div className="font-semibold text-slate-900">INV-2026-0087 — ₹1,20,000</div>
            <div className="text-slate-400">Partial · ₹40,000 paid</div>
          </div>
          <span className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 font-medium flex items-center gap-1">
            <FileSignature className="w-3 h-3" /> Pay online
          </span>
        </div>
      </div>
    </div>
  );
}