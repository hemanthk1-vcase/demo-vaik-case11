import React from "react";
import {
  Scale, LayoutDashboard, Users, Briefcase, GraduationCap,
  Receipt, FileText, FileSignature, Clock, CheckSquare,
  Landmark, Mail,
} from "lucide-react";

export const NAV = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Users, label: "Clients" },
  { icon: Briefcase, label: "Cases" },
  { icon: GraduationCap, label: "Lawyer Management" },
  { icon: FileText, label: "Documents" },
  { icon: Receipt, label: "Invoices" },
];

export function MiniAppFrame({ active, children, title }) {
  return (
    <div className="rounded-xl border border-slate-200 shadow-2xl overflow-hidden bg-white">
      <div className="flex h-[340px]">
        <div className="w-48 bg-slate-900 text-slate-300 p-3 space-y-1 shrink-0">
          <div className="flex items-center gap-2 px-2 py-2 mb-3 text-white font-semibold">
            <Scale className="w-4 h-4" /> Vakil Case
          </div>
          {NAV.map((n) => (
            <div
              key={n.label}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs ${n.label === active ? "bg-indigo-600 text-white" : "text-slate-400"}`}
            >
              <n.icon className="w-3.5 h-3.5" /> {n.label}
            </div>
          ))}
        </div>
        <div className="flex-1 p-4 overflow-hidden">
          {title && <div className="text-sm font-semibold text-slate-800 mb-3">{title}</div>}
          {children}
        </div>
      </div>
    </div>
  );
}

export function KPICard({ label, value, sub, color = "indigo" }) {
  const ring = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  }[color];
  return (
    <div className="rounded-lg border border-slate-200 p-3 bg-white">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className={`text-xl font-bold mt-1 ${ring}`}>{value}</div>
      {sub && <div className="text-[11px] text-emerald-600 mt-0.5">{sub}</div>}
    </div>
  );
}

export function MiniTable({ headers, rows }) {
  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-slate-50 text-slate-500">
          <tr>{headers.map((h) => <th key={h} className="text-left font-medium px-3 py-2">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-100">
              {r.map((c, j) => <td key={j} className="px-3 py-2 text-slate-700">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pill({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    indigo: "bg-indigo-100 text-indigo-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${tones[tone]}`}>{children}</span>;
}

export function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-xl border border-slate-200 p-5 bg-white">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{desc}</p>
    </div>
  );
}