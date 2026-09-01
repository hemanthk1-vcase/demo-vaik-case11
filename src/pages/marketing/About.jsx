import React from "react";
import { Link } from "react-router-dom";
import { Scale, ShieldCheck, ArrowRight, Heart, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";

const VALUES = [
  { icon: ShieldCheck, title: "Security first", desc: "Client confidentiality is non-negotiable — we protect it at every layer." },
  { icon: Target, title: "Built for practitioners", desc: "Every feature is shaped by how Indian lawyers and firms actually work." },
  { icon: Heart, title: "Customer-obsessed", desc: "We succeed when your firm runs smoother and your clients are better served." },
];

export default function About() {
  return (
    <div>
      <section className="bg-slate-50 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <BrandLogo className="h-24 w-24 mx-auto" />
          <h1 className="mt-6 text-4xl md:text-5xl font-bold text-slate-900">About Vakil Case</h1>
          <p className="mt-4 text-lg text-slate-600">
            Vakil Case is the all-in-one practice management platform built for modern Indian law firms —
            unifying cases, clients, billing, documents, and trust accounting in one secure workspace.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 text-indigo-600 font-semibold text-sm">
            <Scale className="w-5 h-5" /> Our mission
          </div>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Let lawyers do law</h2>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Law firms lose countless hours to scattered documents, manual billing, and missed deadlines.
            Vakil Case exists to give that time back — replacing a patchwork of disconnected tools with a
            single, secure system of record so attorneys can focus on winning matters and serving clients.
          </p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            From solo advocates to multi-lawyer firms, Vakil Case scales with your practice — purpose-built
            for the Indian legal ecosystem with INR-native billing, state-bar credentialing, and
            jurisdiction-aware templates.
          </p>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-slate-200 p-6 bg-white">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4">
                <v.icon className="w-6 h-6" />
              </div>
              <div className="font-semibold text-slate-900">{v.title}</div>
              <div className="text-sm text-slate-500 mt-1">{v.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900">Join the firms modernising with Vakil Case</h2>
          <div className="mt-6">
            <Button size="lg" asChild>
              <Link to="/register">Start free <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}