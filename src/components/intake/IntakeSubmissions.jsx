import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const STATUS_VARIANT = {
  new: "outline",
  reviewed: "secondary",
  converted: "default",
  rejected: "destructive",
};

export default function IntakeSubmissions({ form, submissions, onClose, onChanged }) {
  const [busyId, setBusyId] = useState(null);
  const mine = submissions.filter((s) => s.form_id === form.id);

  const setStatus = async (sub, status) => {
    setBusyId(sub.id);
    try {
      await base44.entities.IntakeSubmission.update(sub.id, { status });
      onChanged();
    } catch {
      toast({ title: "Could not update", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const convert = async (sub) => {
    setBusyId(sub.id);
    try {
      let data = {};
      try {
        data = JSON.parse(sub.submitted_data || "{}");
      } catch {
        data = {};
      }
      const client = await base44.entities.Client.create({
        full_name: sub.submitter_name || "Intake lead",
        email: sub.submitter_email || "",
        phone: sub.submitter_phone || "",
        status: "prospect",
        notes: `Converted from intake form "${sub.form_name}".`,
      });
      await base44.entities.IntakeSubmission.update(sub.id, {
        status: "converted",
        converted_client_id: client.id,
      });
      toast({
        title: "Converted to client",
        description: "The lead was added to your Clients roster.",
      });
      onChanged();
    } catch (err) {
      toast({ title: "Could not convert", description: err.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submissions — {form.form_name}</DialogTitle>
        </DialogHeader>
        {mine.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No submissions yet. Share the public link to start collecting intake forms.
          </p>
        ) : (
          <div className="space-y-3">
            {mine.map((s) => {
              let answers = [];
              try {
                answers = Object.entries(JSON.parse(s.submitted_data || "{}"));
              } catch {
                answers = [];
              }
              return (
                <div key={s.id} className="rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {s.submitter_name || s.submitter_email || "Anonymous"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {s.submitter_email || "No email"}
                        {s.submitter_phone ? ` · ${s.submitter_phone}` : ""}
                        {" · "}
                        {new Date(s.created_date).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant={STATUS_VARIANT[s.status] || "outline"} className="capitalize shrink-0">
                      {s.status}
                    </Badge>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                    {answers.length ? (
                      answers.map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="text-muted-foreground shrink-0">{k}:</span>
                          <span className="break-words">{String(v)}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No answers recorded</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => convert(s)}
                      disabled={busyId === s.id || s.status === "converted"}
                    >
                      {busyId === s.id ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Convert to client
                    </Button>
                    {s.status === "new" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === s.id}
                        onClick={() => setStatus(s, "reviewed")}
                      >
                        Mark reviewed
                      </Button>
                    )}
                    {s.status !== "rejected" && s.status !== "converted" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === s.id}
                        onClick={() => setStatus(s, "rejected")}
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}