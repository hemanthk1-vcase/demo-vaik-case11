import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";

export default function CrudPage({ entity, title, singular, description, columns, fields, defaultSort = "-created_date", searchKeys }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities[entity].list(defaultSort, 200);
      setRecords(data || []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const blank = () =>
    fields.reduce((acc, f) => {
      acc[f.key] = f.default ?? (f.type === "number" ? "" : "");
      return acc;
    }, {});

  const openCreate = () => { setEditing(null); setForm(blank()); setError(""); setOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setForm(fields.reduce((acc, f) => { acc[f.key] = row[f.key] ?? f.default ?? ""; return acc; }, {}));
    setError(""); setOpen(true);
  };

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const filtered = useMemo(() => {
    if (!query.trim()) return records;
    const q = query.toLowerCase();
    const keys = searchKeys || columns.map((c) => c.key);
    return records.filter((r) => keys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)));
  }, [records, query]);

  const save = async (e) => {
    e.preventDefault();
    const missing = fields.filter((f) => f.required && !String(form[f.key] ?? "").trim());
    if (missing.length) { setError(`${missing[0].label} is required`); return; }
    setSaving(true); setError("");
    try {
      const payload = {};
      fields.forEach((f) => {
        let v = form[f.key];
        if (f.type === "number") v = v === "" || v == null ? null : Number(v);
        if (v !== null && v !== undefined && v !== "") payload[f.key] = v;
      });
      if (editing) await base44.entities[entity].update(editing.id, payload);
      else await base44.entities[entity].create(payload);
      setOpen(false);
      load();
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!confirm(`Delete this ${singular}?`)) return;
    try { await base44.entities[entity].delete(row.id); load(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="pl-9 w-56" />
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />New</Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">No records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  {columns.map((c) => <th key={c.key} className="text-left font-medium px-4 py-3 whitespace-nowrap">{c.label}</th>)}
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-border hover:bg-muted/30">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3 whitespace-nowrap">{c.render ? c.render(row) : (row[c.key] ?? "—")}</td>
                    ))}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(row)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(row)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${singular}` : `New ${singular}`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.key} className={f.full ? "sm:col-span-2 space-y-2" : "space-y-2"}>
                  <Label htmlFor={f.key}>{f.label}{f.required && <span className="text-destructive"> *</span>}</Label>
                  {f.type === "select" ? (
                    <select id={f.key} value={form[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">—</option>
                      {f.options.map((o) => <option key={o} value={o}>{f.labels ? f.labels[o] : o}</option>)}
                    </select>
                  ) : f.type === "textarea" ? (
                    <Textarea id={f.key} value={form[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} rows={3} />
                  ) : (
                    <Input id={f.key} type={f.type} value={form[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editing ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}