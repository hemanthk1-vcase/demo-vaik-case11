import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const TYPE_LABEL = {
  lawyer: "Lawyer / Firm",
  client: "Client",
  both: "Lawyer & Client",
};

export default function RegisteredUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");
  const [busyId, setBusyId] = useState(null);

  const toggleAccess = async (u) => {
    const grant = u.role !== "admin";
    setBusyId(u.id);
    try {
      await base44.entities.User.update(u.id, { role: grant ? "admin" : "user" });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: grant ? "admin" : "user" } : x)));
      toast({
        title: grant ? "Workspace access granted" : "Workspace access revoked",
        description: `${u.full_name || u.email} ${grant ? "can now sign in to the firm workspace." : "will now be routed to the client portal."}`,
      });
    } catch {
      toast({ title: "Could not update access", description: "Please try again.", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

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

  const lawyers = users.filter((u) => u.account_type === "lawyer" || u.account_type === "both");
  const clients = users.filter((u) => u.account_type === "client" || u.account_type === "both");
  const pending = users.filter(
    (u) => (u.account_type === "lawyer" || u.account_type === "both") && u.role !== "admin"
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registrations</h1>
        <p className="text-muted-foreground mt-1">
          Everyone who signed up — {lawyers.length} lawyer{lawyers.length === 1 ? "" : "s"} and{" "}
          {clients.length} client{clients.length === 1 ? "" : "s"} — with their phone number and
          unique firm code.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Lawyers/firms need your approval below. Clients don't — they connect themselves with a
          firm code and appear in <span className="font-medium text-foreground">Clients</span>.
        </p>
      </div>

      {!loading && pending.length > 0 && (
        <div className="rounded-xl border border-amber-300/70 bg-amber-50 p-4 space-y-3">
          <div>
            <h2 className="font-semibold text-amber-900">
              {pending.length} signup{pending.length === 1 ? "" : "s"} awaiting your approval
            </h2>
            <p className="text-sm text-amber-800/80">
              Approve a lawyer/firm signup to give it access to your workspace.
            </p>
          </div>
          <div className="space-y-2">
            {pending.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{u.full_name || u.email}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {u.email} · {TYPE_LABEL[u.account_type]}
                    {u.phone ? ` · ${u.phone_country_code || ""} ${u.phone}` : ""}
                  </div>
                </div>
                <Button size="sm" disabled={busyId === u.id} onClick={() => toggleAccess(u)}>
                  {busyId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Approve"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <th className="text-left font-medium px-4 py-3">Workspace</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3">{u.full_name || "—"}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.account_type === "lawyer" || u.account_type === "both" ? "default" : "outline"}>
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
                    <td className="px-4 py-3">
                      {u.account_type === "lawyer" || u.account_type === "both" ? (
                        <Button
                          size="sm"
                          variant={u.role === "admin" ? "outline" : "default"}
                          disabled={busyId === u.id}
                          onClick={() => toggleAccess(u)}
                        >
                          {busyId === u.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : u.role === "admin" ? (
                            "Revoke"
                          ) : (
                            "Approve"
                          )}
                        </Button>
                      ) : (
                        "—"
                      )}
                    </td>
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