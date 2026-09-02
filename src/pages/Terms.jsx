import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLAUSES } from "@/lib/termsClauses";

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link to="/register"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
      </Button>

      <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Terms of Use &amp; Consents</h1>
      <p className="mt-2 text-sm text-slate-500">
        Vakil Case · Last updated: 2 September 2026 · Effective upon acceptance at registration
      </p>

      <p className="mt-6 text-slate-600 leading-relaxed">
        These Terms form a binding agreement between the User and Vakil Case and are accepted,
        without electronic reservation, by ticking the consent box on the registration form. Where
        the User is a client of a legal practitioner or firm, these Terms govern solely the User's
        access to and use of the Platform, and are without prejudice to any engagement agreement
        entered into between the User and their Firm.
      </p>

      <div className="mt-10 space-y-8">
        {CLAUSES.map((c) => (
          <section key={c.title}>
            <h2 className="font-semibold text-slate-900">{c.title}</h2>
            <p className="mt-2 text-slate-600 leading-relaxed">{c.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm text-slate-500">
        Questions concerning these Terms may be addressed to your Firm or through the Platform's
        support channels. Continued use of the Platform constitutes acceptance of the Terms as
        amended from time to time.
      </p>

      <p className="mt-6 text-sm font-medium text-slate-900">www.vakilcase.com</p>
    </div>
  );
}