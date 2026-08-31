import React from "react";
import { useLocation } from "react-router-dom";
import { Construction } from "lucide-react";

const TITLES = {
  "/clients": "Clients",
  "/cases": "Cases",
  "/documents": "Documents",
  "/document-templates": "Document Templates",
  "/messages": "Messages",
  "/intake-forms": "Intake Forms",
  "/invoices": "Invoices",
  "/trust-accounting": "Trust Accounting",
  "/time-tracking": "Time Tracking",
  "/tasks": "Tasks",
  "/e-signature": "E-Signature",
  "/email-log": "Email Log",
};

export default function SectionPlaceholder() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || "Section";

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">{title}</h1>
      <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-4">
          <Construction className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-base font-medium">{title} is part of the Vakil Case demo</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          This section is available in the full app. The dashboard overview is the focus of this demo build.
        </p>
      </div>
    </div>
  );
}