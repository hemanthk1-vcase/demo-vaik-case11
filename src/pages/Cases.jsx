import React from "react";
import CrudPage from "@/components/CrudPage";

const CATEGORIES = [
  "criminal_law", "civil_litigation", "family_law", "corporate_business", "employment_labor",
  "immigration", "real_estate", "estate_planning_probate", "bankruptcy", "tax_law",
  "constitutional_civil_rights", "administrative_law", "environmental_law", "education_law",
  "intellectual_property", "personal_injury"
];
const STATUSES = ["intake", "conflict_check", "engagement", "filed", "discovery", "pre_trial", "trial", "pending_judgment", "closed_won", "closed_lost", "closed_settled", "appealed", "dismissed", "active", "hearing", "closed"];

export default function Cases() {
  return (
    <CrudPage
      entity="Case"
      title="Cases"
      singular="case"
      description="Track all matters across your practice."
      searchKeys={["title", "case_number", "client_name", "assigned_lawyer_name", "status"]}
      columns={[
        { key: "title", label: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
        { key: "case_category", label: "Category", render: (r) => <span className="capitalize">{(r.case_category || "").replace(/_/g, " ")}</span> },
        { key: "status", label: "Status", render: (r) => <span className="capitalize">{(r.status || "").replace(/_/g, " ")}</span> },
        { key: "priority", label: "Priority", render: (r) => <span className="capitalize">{r.priority}</span> },
        { key: "client_name", label: "Client" },
        { key: "assigned_lawyer_name", label: "Lawyer" },
        { key: "next_hearing_date", label: "Next hearing" },
      ]}
      fields={[
        { key: "title", label: "Title", type: "text", required: true, full: true },
        { key: "case_category", label: "Category", type: "select", options: CATEGORIES, default: "civil_litigation", required: true },
        { key: "case_type", label: "Case type", type: "text", required: true, full: true },
        { key: "status", label: "Status", type: "select", options: STATUSES, default: "intake" },
        { key: "priority", label: "Priority", type: "select", options: ["low", "medium", "high", "urgent"], default: "medium" },
        { key: "risk_assessment", label: "Risk", type: "select", options: ["low", "medium", "high"], default: "medium" },
        { key: "client_name", label: "Client name", type: "text", full: true },
        { key: "assigned_lawyer_name", label: "Assigned lawyer", type: "text", full: true },
        { key: "assigned_senior_lawyer_name", label: "Senior lawyer", type: "text", full: true },
        { key: "court_name", label: "Court", type: "text", full: true },
        { key: "jurisdiction_country", label: "Jurisdiction", type: "select", options: ["india", "united_states", "united_kingdom"], default: "india" },
        { key: "claim_amount", label: "Claim amount (INR)", type: "number" },
        { key: "filing_date", label: "Filing date", type: "date" },
        { key: "next_hearing_date", label: "Next hearing date", type: "date" },
        { key: "billing_type", label: "Billing type", type: "select", options: ["hourly", "flat_fee", "contingency", "retainer"], default: "hourly" },
        { key: "hourly_rate", label: "Hourly rate (INR)", type: "number" },
        { key: "retainer_amount", label: "Retainer (INR)", type: "number" },
        { key: "description", label: "Description", type: "textarea", full: true },
      ]}
    />
  );
}