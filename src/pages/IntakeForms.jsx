import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Copy, Check, Loader2, ExternalLink, Inbox } from "lucide-react";
import IntakeFormEditor from "@/components/intake/IntakeFormEditor";
import IntakeSubmissions from "@/components/intake/IntakeSubmissions";

export default function IntakeForms() {
  const [forms, setForms] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submissionsFor, setSubmissionsFor] = useState(null);
  const [copied, setCopied] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [f, s] = await Promise.all([
        base44.entities.IntakeForm.list(),
        base44.entities.IntakeSubmission.list("-created_date", 500),
      ]);
      setForms(f || []);
      setSubs(s || []);
    } catch {
      setForms([]);
      setSubs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const countFor = (id) => subs.filter((s) => s.form_id === id).length;

  const remove = async (form) => {
    if (!confirm(`Delete "${form.form_name}"? Its submissions will remain in the inbox.`)) return;
    try {
      await base44.entities.IntakeForm.delete(form.id);
      load();
    } catch (e) {
      toast({ title: "Could not delete", description: e.message, variant: "destructive" });
    }
  };

  const copyLink = async (form) => {
    await navigator.clipboard?.writeText(`${window.location.origin}/intake/${form.id}`);
    setCopied(form.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Intake Forms</h1>
          <p className="text-muted-foreground mt-1">
            Build forms, share the public link, and convert submissions into clients.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setEditorOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />New form
        </Button>
      </div>

      {loading ? (
        <div className="p-10 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : forms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No intake forms yet — create one and share its public link.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {forms.map((f) => (
            <div key={f.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{f.form_name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {f.form_description || "No description"}
                  </p>
                </div>
                <Badge variant={f.is_published ? "default" : "secondary"} className="shrink-0">
                  {f.is_published ? "Published" : "Draft"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{window.location.origin}/intake/{f.id}</span>
                <button
                  onClick={() => copyLink(f)}
                  className="ml-auto text-muted-foreground hover:text-foreground shrink-0"
                  title="Copy public link"
                >
                  {copied === f.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setSubmissionsFor(f)}>
                  <Inbox className="w-4 h-4 mr-1.5" />
                  Submissions ({countFor(f.id)})
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(f);
                    setEditorOpen(true);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-1.5" /> Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(f)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <IntakeFormEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        editing={editing}
        onSaved={load}
      />
      {submissionsFor && (
        <IntakeSubmissions
          form={submissionsFor}
          submissions={subs}
          onClose={() => setSubmissionsFor(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}