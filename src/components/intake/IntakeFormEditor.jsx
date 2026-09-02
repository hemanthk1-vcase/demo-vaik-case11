import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const FIELD_TYPES = [
  ["name", "Full name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["text", "Short text"],
  ["textarea", "Long answer"],
  ["date", "Date"],
];

export default function IntakeFormEditor({ open, onOpenChange, editing, onSaved }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [published, setPublished] = useState(false);
  const [fields, setFields] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(editing?.form_name || "");
    setDescription(editing?.form_description || "");
    setSuccessMessage(editing?.success_message || "");
    setPublished(!!editing?.is_published);
    let parsed = [];
    try {
      parsed = JSON.parse(editing?.form_fields || "[]");
    } catch {
      parsed = [];
    }
    setFields(
      Array.isArray(parsed) && parsed.length
        ? parsed
        : [{ label: "Full name", type: "name", required: true }]
    );
    setError("");
  }, [open, editing]);

  const updateField = (i, patch) =>
    setFields((f) => f.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const save = async (e) => {
    e.preventDefault();
    const clean = fields.filter((f) => f.label.trim());
    if (!name.trim()) {
      setError("Form name is required");
      return;
    }
    if (!clean.length) {
      setError("Add at least one question");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        form_name: name.trim(),
        form_description: description.trim(),
        success_message: successMessage.trim(),
        is_published: published,
        form_fields: JSON.stringify(clean),
      };
      if (editing) await base44.entities.IntakeForm.update(editing.id, payload);
      else await base44.entities.IntakeForm.create(payload);
      onOpenChange(false);
      onSaved();
      toast({ title: editing ? "Form updated" : "Form created" });
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit intake form" : "New intake form"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="form-name">Form name</Label>
            <Input
              id="form-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. New client consultation"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="form-desc">Description</Label>
            <Input
              id="form-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Shown at the top of the public form"
            />
          </div>
          <div className="space-y-2">
            <Label>Questions</Label>
            <div className="space-y-2">
              {fields.map((f, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3"
                >
                  <Input
                    className="flex-1 min-w-40"
                    value={f.label}
                    onChange={(e) => updateField(i, { label: e.target.value })}
                    placeholder="Question label, e.g. Describe your legal issue"
                  />
                  <select
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={f.type}
                    onChange={(e) => updateField(i, { type: e.target.value })}
                  >
                    {FIELD_TYPES.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Checkbox
                      checked={!!f.required}
                      onCheckedChange={(v) => updateField(i, { required: v === true })}
                    />
                    Required
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFields((list) => list.filter((_, j) => j !== i))}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFields((l) => [...l, { label: "", type: "text", required: false }])}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Add question
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="success">Success message</Label>
            <Input
              id="success"
              value={successMessage}
              onChange={(e) => setSuccessMessage(e.target.value)}
              placeholder="Thank you — we'll be in touch shortly."
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="published"
              checked={published}
              onCheckedChange={(v) => setPublished(v === true)}
            />
            <label htmlFor="published" className="text-sm">
              Published — accept submissions on the public link
            </label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}