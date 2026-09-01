import React from "react";
import CrudPage from "@/components/CrudPage";

const STATUSES = ["pending_review", "under_review", "verified", "rejected", "suspended"];

export default function LawyerManagement() {
  return (
    <CrudPage
      entity="LawyerProfile"
      title="Lawyer Management"
      singular="lawyer"
      description="Create and manage lawyer profiles."
      searchKeys={["full_name", "specialization", "bar_registration_number", "status"]}
      columns={[
        { key: "full_name", label: "Name", render: (r) => <span className="font-medium">{r.full_name}</span> },
        { key: "specialization", label: "Specialization" },
        { key: "bar_registration_number", label: "Bar #" },
        { key: "years_of_experience", label: "Years" },
        { key: "rating", label: "Rating" },
        { key: "status", label: "Status", render: (r) => <span className="capitalize">{(r.status || "").replace(/_/g, " ")}</span> },
      ]}
      fields={[
        { key: "full_name", label: "Full name", type: "text", required: true, full: true },
        { key: "bar_registration_number", label: "Bar registration #", type: "text", required: true },
        { key: "bar_council_name", label: "Bar council", type: "text", required: true, full: true },
        { key: "specialization", label: "Specialization", type: "text", full: true },
        { key: "years_of_experience", label: "Years of experience", type: "number" },
        { key: "jurisdiction_country", label: "Jurisdiction", type: "select", options: ["india", "united_states", "united_kingdom"], default: "india" },
        { key: "status", label: "Status", type: "select", options: STATUSES, default: "pending_review" },
        { key: "is_verified", label: "Verified (type 'true')", type: "text", default: "true" },
        { key: "rating", label: "Rating", type: "number", default: 0 },
        { key: "contact_email", label: "Contact email", type: "email", full: true },
        { key: "contact_phone", label: "Contact phone", type: "text" },
        { key: "office_address", label: "Office address", type: "text", full: true },
        { key: "bio", label: "Bio", type: "textarea", full: true },
      ]}
    />
  );
}