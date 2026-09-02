import React, { useState } from "react";
import CrudPage from "@/components/CrudPage";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function Clients() {
  const [inviting, setInviting] = useState(null);

  const invite = async (row) => {
    setInviting(row.id);
    try {
      await base44.functions.invoke("sendClientInvite", {
        client_name: row.full_name,
        client_email: row.email,
      });
      toast({
        title: "Invite sent",
        description: `${row.full_name} will receive an email asking them to sign in to the client portal.`,
      });
    } catch (err) {
      toast({
        title: "Could not send invite",
        description: err?.response?.data?.error || err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setInviting(null);
    }
  };

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
      extraActions={(row) => (
        <Button
          variant="ghost"
          size="icon"
          title="Email invite to log in"
          disabled={!row.email || inviting === row.id}
          onClick={() => invite(row)}
        >
          {inviting === row.id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
        </Button>
      )}
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