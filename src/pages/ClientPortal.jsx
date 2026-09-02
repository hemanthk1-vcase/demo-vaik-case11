import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import {
  Briefcase, Receipt, FileText, CalendarClock, Building2, ArrowLeft,
} from "lucide-react";

const fmtMoney = (fee) =>
  fee.currency === "INR"
    ? "₹" + Number(fee.amount || 0).toLocaleString("en-IN")
    : "$" + Number(fee.amount || 0).toLocaleString("en-US");

const TABS = [
  ["overview", "Overview"],
  ["cases", "Cases"],
  ["invoices", "Invoices"],
  ["hearings", "Hearings"],
  ["documents", "Documents"],
];

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <Icon className="w-4 h-4" /> {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

function Row({ title, subtitle, right, rightSub }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="text-sm text-slate-500">{subtitle}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-semibold text-slate-900">{right}</div>
        {rightSub && <div className="text-xs text-slate-500">{rightSub}</div>}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

export default function ClientPortal() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [clients, setClients] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [cases, setCases] = useState([]);
  const [fees, setFees] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [tab, setTab] = useState("overview");

  const activeClient = clients.find((c) => c.id === activeId) || null;

  const loadFirmData = async (client) => {
    const ids = [client.client_id, client.id].filter(Boolean);
    const [allCases, allFees, allUpdates, allDocs] = await Promise.all([
      base44.entities.Case.list(),
      base44.entities.Fee.list(),
      base44.entities.CourtUpdate.list(),
      base44.entities.Document.list(),
    ]);
    setCases(allCases.filter((c) => ids.includes(c.client_id)));
    setFees(allFees.filter((f) => ids.includes(f.client_id)));
    setHearings(allUpdates.filter((h) => ids.includes(h.client_id)));
    setDocuments(allDocs.filter((d) => ids.includes(d.client_id)));
  };

  useEffect(() => {
    (async () => {
      const user = await base44.auth.me();
      setMe(user);
      let mine = await base44.entities.Client.filter({ client_user_id: user.id });
      if (!mine.length) {
        const all = await base44.entities.Client.list();
        mine = all.filter(
          (c) => c.email && user.email && c.email.toLowerCase() === user.email.toLowerCase()
        );
      }
      setClients(mine);
      if (mine[0]) {
        setActiveId(mine[0].id);
        await loadFirmData(mine[0]);
      }
      setLoading(false);
    })();
  }, []);

  const switchFirm = async (id) => {
    setActiveId(id);
    const c = clients.find((x) => x.id === id);
    if (c) await loadFirmData(c);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!activeClient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <BrandLogo className="h-16 w-16 mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">No firm connected yet</h1>
          <p className="mt-3 text-slate-600">
            Your lawyer will send you a secure invite by email. If you have a firm code from your
            law firm, enter it after creating your account — your matters will appear here instantly.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild><Link to="/register">Create your account</Link></Button>
            <Button variant="outline" asChild><Link to="/welcome"><ArrowLeft className="w-4 h-4 mr-1" /> Back to website</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  const activeCaseCount = cases.filter((c) => !String(c.status).startsWith("closed")).length;
  const outstanding = fees.reduce((s, f) => s + ((f.amount || 0) - (f.amount_paid || 0)), 0);
  const nextHearing = hearings
    .filter((h) => h.next_hearing_date)
    .sort((a, b) => a.next_hearing_date.localeCompare(b.next_hearing_date))[0];
  const firmName = activeClient.assigned_lawyer_name || "Your law firm";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/welcome" className="flex items-center gap-2 font-bold text-slate-900">
            <BrandLogo className="h-9 w-9" /> <span>Vakil Case</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/welcome" className="text-sm text-slate-500 hover:text-slate-900 hidden sm:block">
              <ArrowLeft className="w-4 h-4 inline mr-1" /> Website
            </Link>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">{me?.full_name || me?.email}</div>
              <div className="text-xs text-slate-500">Client Portal</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Firm switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Connected firm</div>
              <div className="text-lg font-bold text-slate-900">{firmName}</div>
            </div>
          </div>
          {clients.length > 1 && (
            <select
              value={activeId}
              onChange={(e) => switchFirm(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.assigned_lawyer_name || "My firm"}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <StatCard icon={Briefcase} label="Active matters" value={activeCaseCount} hint={cases.length + " total handled by this firm"} />
          <StatCard icon={Receipt} label="Outstanding balance" value={outstanding ? "₹" + outstanding.toLocaleString("en-IN") : "₹0"} hint="Invoices due & partially paid" />
          <StatCard icon={CalendarClock} label="Next hearing" value={nextHearing ? fmtDate(nextHearing.next_hearing_date) : "—"} hint={nextHearing ? nextHearing.case_title : "No hearings scheduled"} />
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 overflow-x-auto border-b border-slate-200">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                tab === id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {(tab === "overview" || tab === "cases") && (cases.length
            ? cases.map((c) => (
                <Row
                  key={c.id}
                  title={c.title}
                  subtitle={`${c.court_name || ""} · Filed ${fmtDate(c.filing_date)}`}
                  right={c.status.replace(/_/g, " ")}
                  rightSub={`Next hearing: ${fmtDate(c.next_hearing_date)}`}
                />
              ))
            : <Empty text="No matters yet — your firm will post updates here." />)}

          {tab === "invoices" && (fees.length
            ? fees.map((f) => (
                <Row
                  key={f.id}
                  title={`${f.invoice_number || "Invoice"} — ${fmtMoney(f)}`}
                  subtitle={`${f.case_title || ""} · Due ${fmtDate(f.due_date)}`}
                  right={f.status}
                  rightSub={`Paid ₹${Number(f.amount_paid || 0).toLocaleString("en-IN")}`}
                />
              ))
            : <Empty text="No invoices from this firm yet." />)}

          {tab === "hearings" && (hearings.length
            ? hearings.map((h) => (
                <Row
                  key={h.id}
                  title={fmtDate(h.hearing_date) + " — " + (h.judge || "Hearing")}
                  subtitle={h.summary}
                  right={h.outcome}
                  rightSub={`Next: ${fmtDate(h.next_hearing_date)}`}
                />
              ))
            : <Empty text="No hearing updates yet." />)}

          {tab === "documents" && (documents.length
            ? documents.map((d) => (
                <Row
                  key={d.id}
                  title={d.title || d.document_name}
                  subtitle={d.doc_type || "Document"}
                  right="View"
                />
              ))
            : <Empty text="Documents shared by your firm will appear here — including ones awaiting your e-signature." />)}
        </div>
      </main>
    </div>
  );
}