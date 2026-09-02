import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const SECTIONS = [
  {
    title: "1. Data We Collect",
    body: "We collect and process: (a) account data (name, email address, and, where applicable, phone number); (b) matter-related data uploaded by you or your Firm, including case details, documents, invoices and hearing information; and (c) technical data (IP address, device and browser information, and access logs) required for the secure operation of the Platform.",
  },
  {
    title: "2. Purpose and Lawful Basis",
    body: "Your data is processed solely for: providing and securing your access to the Platform; enabling your Firm to manage matters, documents, invoices and communications with you; issuing service and security notices; and complying with legal obligations. Processing is undertaken on the basis of the performance of your use of the Platform, your consent, and the legitimate interests of the Platform and your Firm.",
  },
  {
    title: "3. Sharing and Disclosure",
    body: "Your data is disclosed only to (a) the Firm(s) to which you are connected, (b) trusted service providers bound by contractual confidentiality (including hosting and email delivery), and (c) authorities where required by law or an order of a court of competent jurisdiction. We do not sell or rent personal data to any third party.",
  },
  {
    title: "4. Security",
    body: "Data is protected by encryption in transit and at rest, row-level access controls restricting each user to records they are authorised to access, and audit logging. Access to production data is limited to authorised personnel on a need-to-know basis.",
  },
  {
    title: "5. Retention",
    body: "Account and matter data is retained for as long as your account is active or as required to service your relationship with your Firm, and thereafter in accordance with applicable statutory limitation periods, save where earlier deletion is requested and lawfully permissible.",
  },
  {
    title: "6. Your Rights",
    body: "You may, at any time, request access to, correction or erasure of your personal data, object to or restrict its processing, or withdraw consent to non-essential processing by contacting your Firm or the Platform's support channels. Withdrawal of consent does not affect the lawfulness of processing prior to such withdrawal.",
  },
  {
    title: "7. Grievance Redressal",
    body: "Any question, concern or complaint regarding this Policy may be raised with the Platform through its support channels, and, where applicable, escalated to the Data Protection Authority of your jurisdiction.",
  },
];

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link to="/register"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link>
      </Button>

      <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">
        Vakil Case · Last updated: 2 September 2026 · Read together with the Terms of Use &amp; Consents
      </p>

      <p className="mt-6 text-slate-600 leading-relaxed">
        This Privacy Policy describes how Vakil Case ('the Platform') collects, uses, discloses and
        safeguards your personal data when you access the Platform as a client or legal practitioner.
        Capitalised terms bear the meanings assigned in the{" "}
        <Link to="/terms" className="text-indigo-600 font-medium hover:underline underline-offset-4">
          Terms of Use &amp; Consents
        </Link>
        .
      </p>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="font-semibold text-slate-900">{s.title}</h2>
            <p className="mt-2 text-slate-600 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-10 text-sm text-slate-500">
        By creating an account on the Platform, you acknowledge that you have read and understood
        this Privacy Policy, which forms part of the Terms accepted at registration.
      </p>

      <p className="mt-6 text-sm font-medium text-slate-900">www.vakilcase.com</p>
    </div>
  );
}