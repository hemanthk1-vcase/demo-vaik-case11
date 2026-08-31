import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { appUrl } from "@/lib/domain";

const AREAS = ["Criminal Law", "Civil Litigation", "Family Law", "Corporate Law", "Immigration", "Real Estate", "Estate Planning", "Personal Injury", "Intellectual Property", "Tax Law", "Bankruptcy", "Employment Law", "Constitutional Law", "Cyber Law"];
const SIZES = [{ v: "1", l: "Just me" }, { v: "2-9", l: "2–9" }, { v: "10-49", l: "10–49" }, { v: "50+", l: "50+" }];
const COUNTRIES = [{ v: "united_states", l: "United States" }, { v: "united_kingdom", l: "United Kingdom" }, { v: "india", l: "India" }, { v: "other", l: "Other" }];

export default function Demo() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", firm_name: "", firm_size: "1", practice_area: "", country: "united_states", preferred_date: "", challenges: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 1) return form.name && form.email && form.firm_name;
    if (step === 2) return form.firm_size && form.practice_area;
    if (step === 3) return form.country && form.preferred_date;
    return true;
  };

  const submit = async () => {
    setSaving(true);
    try {
      await base44.entities.Lead.create({
        name: form.name,
        email: form.email,
        firm_name: form.firm_name,
        firm_size: form.firm_size,
        practice_area: form.practice_area,
        country: form.country,
        preferred_date: form.preferred_date ? new Date(form.preferred_date).toISOString() : null,
        challenges: form.challenges,
        source: "marketing_demo",
      });
    } catch (e) {
      // swallow — we still surface the thank-you state
    } finally {
      setSaving(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white min-h-[80vh] flex items-center justify-center px-6 pt-16">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white">
            <Check className="w-6 h-6" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900">We'll be in touch within 24 hours.</h1>
          <p className="mt-3 text-neutral-600">Thanks, {form.name || "there"}. A VakilCase specialist will reach out to schedule your personalized demo.</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/" className="inline-flex items-center justify-center border border-neutral-900 text-neutral-900 px-6 py-3 rounded-lg text-sm font-medium hover:bg-neutral-900 hover:text-white transition-colors">Back to home</Link>
            <a href={appUrl("/login")} className="inline-flex items-center justify-center bg-neutral-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-black transition-colors">Log In</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">See VakilCase in action</h1>
          <p className="mt-4 text-neutral-600">Tell us about your firm and we'll set up a personalized demo. Takes about 2 minutes.</p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-neutral-900" : "bg-neutral-200"}`} />
          ))}
        </div>
        <div className="text-sm text-neutral-500 mb-8">Step {step} of 4</div>

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1.5" placeholder="Jane Doe" />
            </div>
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="mt-1.5" placeholder="jane@firm.com" />
            </div>
            <div>
              <Label htmlFor="firm">Firm name</Label>
              <Input id="firm" value={form.firm_name} onChange={(e) => set("firm_name", e.target.value)} className="mt-1.5" placeholder="Doe & Partners" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <Label>Firm size</Label>
              <Select value={form.firm_size} onValueChange={(v) => set("firm_size", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SIZES.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Primary practice area</Label>
              <Select value={form.practice_area} onValueChange={(v) => set("practice_area", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select an area" /></SelectTrigger>
                <SelectContent>
                  {AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <Label>Country</Label>
              <Select value={form.country} onValueChange={(v) => set("country", v)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="when">Preferred demo date &amp; time</Label>
              <Input id="when" type="datetime-local" value={form.preferred_date} onChange={(e) => set("preferred_date", e.target.value)} className="mt-1.5" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="challenges">What challenges are you looking to solve? (optional)</Label>
              <Textarea id="challenges" value={form.challenges} onChange={(e) => set("challenges", e.target.value)} className="mt-1.5 min-h-[140px]" placeholder="e.g. managing cases across multiple jurisdictions, faster billing, etc." />
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          ) : <span />}
          {step < 4 ? (
            <Button className="bg-neutral-900 text-white hover:bg-black" disabled={!canNext()} onClick={() => setStep(step + 1)}>
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button className="bg-neutral-900 text-white hover:bg-black" disabled={saving} onClick={submit}>
              {saving ? "Submitting..." : "Request Demo"}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}