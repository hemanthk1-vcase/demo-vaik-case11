import React from "react";
import CrudPage from "@/components/CrudPage";

export default function Clients() {
  return (
    <CrudPage
      entity="Client"
      title="Clients"
      singular="client"
      description="Manage your client roster."
      searchKeys={["full_name", "email", "phone", "assigned_lawyer_name", "status"]}
      columns={[
        { key: "full_name", label: "Name", render: (r) => <span className="font-medium">{r.full_name}</span> },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "status", label: "Status", render: (r) => <span className="capitalize">{r.status}</span> },
        { key: "assigned_lawyer_name", label: "Lawyer" },
      ]}
      fields={[
        { key: "full_name", label: "Full name", type: "text", required: true, full: true },
        { key: "email", label: "Email", type: "email", required: true },
        { key: "phone", label: "Phone", type: "text" },
        {
          key: "phone_country_code",
          label: "Phone country code",
          type: "country",
          default: "+91",
          full: true,
          countries: [["🇮🇳 India", "+91"], ["🇺🇸 USA", "+1"], ["🇬🇧 UK", "+44"]],
        },
        { key: "address", label: "Address", type: "text", full: true },
        { key: "date_of_birth", label: "Date of birth", type: "date" },
        { key: "occupation", label: "Occupation", type: "text", full: true },
        { key: "status", label: "Status", type: "select", options: ["prospect", "onboarded", "active", "archived"], default: "prospect" },
        { key: "assigned_lawyer_name", label: "Assigned lawyer", type: "text", full: true },
        { key: "notes", label: "Notes", type: "textarea", full: true },
      ]}
    />
  );
}