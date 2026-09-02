import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TYPE_LABEL = {
  lawyer: "Lawyer / Firm",
  client: "Client",
};

export default function RegisteredUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    base44.entities.User.list()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const copy = async (code) => {
    await navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 2000);
  };

  const lawyers = users.filter((u) => u.account_type === "lawyer");
  const clients = users.filter((u) => u.account_type === "client");

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registrations</h1>
        <p className="text-muted-foreground mt-1">
          Everyone who signed up — {lawyers.length} lawyer{lawyers.length === 1 ? "" : "s"} and{" "}
          {clients.length} client{clients.length === 1 ? "" : "s"} — with their phone number and
          unique firm code.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">No registered users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Name</th>
                  <th className="text-left font-medium px-4 py-3">Email</th>
                  <th className="text-left font-medium px-4 py-3">Type</th>
                  <th className="text-left font-medium px-4 py-3">Phone</th>
                  <th className="text-left font-medium px-4 py-3">Firm code</th>
                  <th className="text-left font-medium px-4 py-3">Connected firm</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3">{u.full_name || "—"}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.account_type === "lawyer" ? "default" : "outline"}>
                        {TYPE_LABEL[u.account_type] || (u.role || "user")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {u.phone ? `${u.phone_country_code || ""} ${u.phone}`.trim() : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {u.firm_code ? (
                        <span className="inline-flex items-center gap-2">
                          {u.firm_code}
                          <button
                            onClick={() => copy(u.firm_code)}
                            className="text-muted-foreground hover:text-foreground"
                            title="Copy firm code"
                          >
                            {copied === u.firm_code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono">{u.connected_firm_code || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}