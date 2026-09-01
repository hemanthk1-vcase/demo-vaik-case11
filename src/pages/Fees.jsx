import React from "react";
import CrudPage from "@/components/CrudPage";

const inr = (n) => (n == null ? "—" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n));
const STATUSES = ["draft", "sent", "pending", "partial", "paid", "overdue", "cancelled"];

export default function Fees() {
  return (
    <CrudPage
      entity="Fee"
      title="Invoices"
      singular="invoice"
      description="Billing and invoices — all amounts in INR."
      searchKeys={["invoice_number", "client_name", "case_title", "status"]}
      columns={[
        { key: "invoice_number", label: "Invoice #", render: (r) => <span className="font-medium">{r.invoice_number || "—"}</span> },
        { key: "client_name", label: "Client" },
        { key: "case_title", label: "Case" },
        { key: "amount", label: "Amount", render: (r) => inr(r.amount) },
        { key: "amount_paid", label: "Paid", render: (r) => inr(r.amount_paid) },
        { key: "currency", label: "Currency" },
        { key: "status", label: "Status", render: (r) => <span className="capitalize">{r.status}</span> },
        { key: "due_date", label: "Due date" },
      ]}
      fields={[
        { key: "invoice_number", label: "Invoice number", type: "text", full: true },
        { key: "client_name", label: "Client name", type: "text", full: true },
        { key: "case_title", label: "Case title", type: "text", full: true },
        { key: "case_id", label: "Case ID", type: "text" },
        { key: "amount", label: "Amount (INR)", type: "number", required: true },
        { key: "amount_paid", label: "Amount paid (INR)", type: "number", default: 0 },
        { key: "currency", label: "Currency", type: "select", options: ["INR"], default: "INR" },
        { key: "status", label: "Status", type: "select", options: STATUSES, default: "pending" },
        { key: "issue_date", label: "Issue date", type: "date" },
        { key: "due_date", label: "Due date", type: "date" },
        { key: "paid_date", label: "Paid date", type: "date" },
        { key: "description", label: "Description", type: "textarea", full: true },
      ]}
    />
  );
}