import { useState } from "react";
import { Link } from "react-router-dom";
import { Scale, Activity, FileLock, CreditCard, Languages, MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { appUrl } from "@/lib/domain";

const AREAS = ["Criminal Law", "Civil Litigation", "Family Law", "Corporate Law", "Immigration", "Real Estate", "Estate Planning", "Personal Injury", "Intellectual Property", "Tax Law", "Bankruptcy", "Employment Law", "Constitutional Law", "Cyber Law"];

const BENEFITS = [
  { icon: Scale, title: "Search verified lawyers", desc: "Browse a curated directory by practice area and location." },
  { icon: Activity, title: "Real-time case status", desc: "Track every update to your matter as it happens." },
  { icon: FileLock, title: "Secure document sharing", desc: "Upload and share files safely with your lawyer." },
  { icon: CreditCard, title: "Online payments", desc: "Pay legal fees in USD, GBP, or INR — securely." },
  { icon: Languages, title: "Multilingual support", desc: "English, Hindi, Spanish, Tamil, Telugu, and Kannada." },
  { icon: MessageSquare, title: "Direct communication", desc: "Message your lawyer directly through a secure portal." },
];

export default function ForClients() {
  const [area, setArea] = useState("");
  const [location, setLocation] = useState("");
  const search = (e) => {
    e.preventDefault();
    window.location.href = appUrl("/find-a-lawyer");
  };

  return (
    <>
      <section className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900">Find the right lawyer. Track your case. Stay informed.</h1>
          <p className="mt-4 text-neutral-600">VakilCase puts you in control of your legal matter — from finding a verified lawyer to tracking every update.</p>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="rounded-xl border border-neutral-200 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-neutral-900">Find a Lawyer</h2>
            <p className="text-sm text-neutral-500 mt-1">Search our verified directory by practice area and location.</p>
            <form onSubmit={search} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-500">Practice area</label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger className="mt-1.5 bg-white"><SelectValue placeholder="Select an area" /></SelectTrigger>
                  <SelectContent>
                    {AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-neutral-500">Location</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City or postcode" className="mt-1.5 bg-white" />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" className="w-full bg-neutral-900 text-white hover:bg-black">
                  <Search className="w-4 h-4 mr-2" /> Find a Lawyer Now
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200 rounded-xl overflow-hidden">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-8">
                <Icon className="w-6 h-6 text-neutral-900" strokeWidth={1.5} />
                <h3 className="mt-4 text-lg font-semibold text-neutral-900">{title}</h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a href={appUrl("/find-a-lawyer")} className="inline-flex items-center justify-center bg-neutral-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-black transition-colors">
              Find a Lawyer Now
            </a>
          </div>
        </div>
      </section>
    </>
  );
}