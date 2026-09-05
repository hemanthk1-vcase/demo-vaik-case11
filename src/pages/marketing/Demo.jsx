import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import BrandLogo from "@/components/BrandLogo";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Video,
    title: "A walkthrough built around you",
    text: "We tailor the demo to your practice area — litigation, family, corporate, estate planning, and more.",
  },
  {
    icon: Clock,
    title: "30 minutes, zero pressure",
    text: "See the full platform: cases, clients, billing, documents, trust accounting, and the built-in AI assistant.",
  },
  {
    icon: ShieldCheck,
    title: "Your data stays yours",
    text: "Row-level security, role-based access, and confidential document controls — compliance questions answered live.",
  },
];

const STEPS = [
  "Tell us a little about your firm",
  "We confirm a time that works for you",
  "Get a guided tour and a free trial setup",
];

export default function Demo() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    firm_name: "",
    firm_size: "1-9",
    practice_area: "",
    preferred_date: "",
    challenges: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.functions.invoke("captureLead", {
        ...form,
        firm_size: form.firm_size,
      });
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Something went wrong — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50">
      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 text-center">
          <div className="flex justify-center mb-4">
            <BrandLogo className="h-16 w-16" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            See Vakil Case in action
          </h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            The all-in-one practice management platform for modern law firms — cases, clients,
            billing, documents, and trust accounting in one secure workspace.
          </p>
          <p className="mt-6 text-sm text-slate-400 flex items-center justify-center gap-2">
            <Users className="w-4 h-4" /> Trusted by solo attorneys and growing firms alike
          </p>
        </div>
      </section>

      {/* Value highlights */}
      <section className="max-w-6xl mx-auto px-4 py-14 grid gap-6 md:grid-cols-3">
        {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-3">
              <Icon className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">{text}</p>
          </div>
        ))}
      </section>

      {/* Form + steps */}
      <section className="max-w-6xl mx-auto px-4 pb-20 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <ol className="mt-6 space-y-5">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-slate-700 pt-1">{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-900">
            Prefer to explore on your own?{" "}
            <Link to="/register" className="font-semibold underline underline-offset-4">
              Get started
            </Link>{" "}
            with a free account and take a look around first.
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          {done ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900">You're on the list!</h2>
              <p className="mt-2 text-slate-600 max-w-md mx-auto">
                Thanks, {form.name.split(" ")[0] || "there"} — we'll reach out to{" "}
                <span className="font-medium">{form.email}</span> within one business day to
                schedule your demo.
              </p>
              <Button className="mt-6" asChild>
                <Link to="/welcome">
                  <CalendarCheck className="w-4 h-4 mr-2" /> Back to home
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-900">Book your demo</h2>
              <p className="mt-1 text-sm text-slate-600">
                Takes less than a minute. No pricing pressure — this call is about your practice.
              </p>
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your name *</Label>
                    <Input id="name" value={form.name} onChange={set("name")} className="h-11" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      className="h-11"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firm">Firm name</Label>
                    <Input id="firm" value={form.firm_name} onChange={set("firm_name")} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Firm size</Label>
                    <select
                      id="size"
                      value={form.firm_size}
                      onChange={set("firm_size")}
                      className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="1">Just me (solo practice)</option>
                      <option value="2-9">2–9 attorneys</option>
                      <option value="10-49">10–49 attorneys</option>
                      <option value="50+">50+ attorneys</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="area">Primary practice area</Label>
                    <Input
                      id="area"
                      placeholder="e.g. Family law"
                      value={form.practice_area}
                      onChange={set("practice_area")}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Preferred date & time</Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      value={form.preferred_date}
                      onChange={set("preferred_date")}
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="challenges">
                    What's your biggest practice-management challenge?
                  </Label>
                  <Textarea
                    id="challenges"
                    rows={3}
                    placeholder="e.g. Billing takes too long, documents are scattered, we keep missing deadlines…"
                    value={form.challenges}
                    onChange={set("challenges")}
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="w-4 h-4 mr-2" /> Request my demo
                    </>
                  )}
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  We'll only use your details to schedule your demo. No spam, ever.
                </p>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}