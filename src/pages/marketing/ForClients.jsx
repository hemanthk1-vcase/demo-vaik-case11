import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users, FileSignature, ShieldCheck, Clock, Mail, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import PortalPreview from "@/components/marketing/PortalPreview";

const BENEFITS = [
  { icon: Users, title: "Find the right lawyer", desc: "Browse verified lawyer profiles with specializations, bar credentials, and ratings." },
  { icon: FileSignature, title: "Sign documents online", desc: "Review and e-sign engagement letters and contracts from anywhere — no printing required." },
  { icon: ShieldCheck, title: "Confidential & secure", desc: "Your information is protected by bank-grade access controls and never shared without consent." },
  { icon: Clock, title: "Stay informed", desc: "Track the status of your matter and get reminders for hearings and deadlines." },
  { icon: Mail, title: "Clear communication", desc: "Message your lawyer and track correspondence linked to your case." },
  { icon: Scale, title: "Transparent process", desc: "See case progress, court updates, and billing in one clear view." },
];

export default function ForClients() {
  return (
    <div>
      <section className="bg-slate-50 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm">
            <Users className="w-5 h-5" /> For Clients
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-slate-900">Your legal matter, handled with clarity</h1>
          <p className="mt-4 text-lg text-slate-600">
            Vakil Case connects you with verified lawyers and keeps every step of your matter —
            documents, updates, and billing — clear, secure, and in one place.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link to="/register">Get started <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-6">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-2xl border border-slate-200 p-6 flex gap-4">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <b.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">{b.title}</div>
                <div className="text-sm text-slate-500 mt-1">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Client Portal */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm">
              <FileSignature className="w-5 h-5" /> Client Portal
            </div>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              One secure login for every firm you work with
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Your lawyer sends you a secure invite — or you connect with your firm's unique code —
              and all your matters appear in your portal instantly. Working with more than one firm?
              Switch between them with a single click; each firm only ever sees its own files.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-slate-600">
              {[
                "Live case status and upcoming hearing dates",
                "Documents shared by your firm, with e-signature on request",
                "Invoices with partial-payment status and online payment",
                "Bank-grade security — your data is never shared without consent",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/client-portal">Preview the portal</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/register">Create your account</Link>
              </Button>
            </div>
          </div>
          <PortalPreview />
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900">A better way to work with your lawyer</h2>
          <p className="mt-3 text-slate-600">Verified professionals, secure documents, and total transparency — from first meeting to resolved matter.</p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link to="/register">Create your account <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}