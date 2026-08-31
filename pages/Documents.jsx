import { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Search, FileText, Lock } from 'lucide-react';

const DOC_TYPES = [
  { value: 'pleading', label: 'Pleading' },
  { value: 'evidence', label: 'Evidence' },
  { value: 'contract', label: 'Contract' },
  { value: 'court_filing', label: 'Court Filing' },
  { value: 'correspondence', label: 'Correspondence' },
  { value: 'photo', label: 'Photo' },
  { value: 'other', label: 'Other' }
];
const TYPE_LABEL = Object.fromEntries(DOC_TYPES.map((t) => [t.value, t.label]));

const MAX_BYTES = 25 * 1024 * 1024;

const emptyForm = { case_id: '', document_type: 'other', description: '', is_confidential: false };
const emptyFile = { file_url: '', file_name: '', file_size: '', mime_type: '' };

// Auto-generate DOC-YYYY-XXXX
function nextDocNumber(docs) {
  const year = new Date().getFullYear();
  let max = 0;
  (docs || []).forEach((d) => {
    const id = d?.data?.document_id || d?.document_id;
    if (id) {
      const m = id.match(/^DOC-(\d{4})-(\d+)$/);
      if (m && Number(m[1]) === year) max = Math.max(max, Number(m[2]));
    }
  });
  return `DOC-${year}-${String(max + 1).padStart(4, '0')}`;
}

export default function Documents() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [docs, setDocs] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(emptyFile);

  async function load() {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([
        base44.entities.CaseDocument.list('-created_date', 200),
        base44.entities.Case.list('-updated_date', 200)
      ]);
      setDocs(d);
      setCases(c);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const caseMap = useMemo(() => Object.fromEntries(cases.map((c) => [c.id, c])), [cases]);

  const filtered = useMemo(() => docs.filter((d) => {
    if (!query) return true;
    const dd = d.data || {};
    const q = query.toLowerCase();
    return dd.document_id?.toLowerCase().includes(q) || dd.document_name?.toLowerCase().includes(q) || dd.case_number?.toLowerCase().includes(q);
  }), [docs, query]);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_BYTES) {
      toast({ variant: 'destructive', title: 'File too large', description: 'Maximum file size is 25MB.' });
      e.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      setFile({
        file_url,
        file_name: f.name,
        file_size: f.size ? (f.size / 1024).toFixed(1) + ' KB' : '',
        mime_type: f.type || ''
      });
    } catch {
      toast({ variant: 'destructive', title: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.case_id) { toast({ variant: 'destructive', title: 'Case is required' }); return; }
    if (!form.document_type) { toast({ variant: 'destructive', title: 'Document type is required' }); return; }
    if (!file.file_url) { toast({ variant: 'destructive', title: 'A file is required' }); return; }
    setSaving(true);
    try {
      const cs = cases.find((c) => c.id === form.case_id);
      const document_id = nextDocNumber(docs);
      await base44.entities.CaseDocument.create({
        document_id,
        case_id: form.case_id,
        case_number: cs?.data?.case_number || '',
        client_id: cs?.data?.client_id || '',
        client_name: cs?.data?.client_name || '',
        uploaded_by: user.id,
        uploaded_by_name: user.full_name || user.email,
        document_name: file.file_name,
        document_type: form.document_type,
        file_url: file.file_url,
        file_size: file.file_size,
        mime_type: file.mime_type,
        description: form.description || undefined,
        is_confidential: !!form.is_confidential,
        access_level: form.is_confidential ? 'lawyer_only' : 'all_parties',
        version: 1
      });
      toast({ title: 'Document uploaded successfully', description: `Document ID ${document_id}` });
      setForm(emptyForm); setFile(emptyFile); setOpen(false); load();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">All case documents in one place.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Upload className="h-4 w-4 mr-1.5" /> Upload Document</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Upload document</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5"><Label>Case *</Label>
                <Select value={form.case_id} onValueChange={(v) => set('case_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select case" /></SelectTrigger>
                  <SelectContent>
                    {cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.data?.case_number ? `${c.data.case_number} · ` : ''}{c.data?.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Document type *</Label>
                <Select value={form.document_type} onValueChange={(v) => set('document_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>File *</Label>
                <Input type="file" onChange={onFile} disabled={uploading} />
                {file.file_url && <div className="text-xs text-emerald-600">{file.file_name}{file.file_size ? ` · ${file.file_size}` : ''}</div>}
                <div className="text-xs text-muted-foreground">Any file type, up to 25MB.</div>
              </div>
              <div className="space-y-1.5"><Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} />
              </div>
              <div className="flex items-center gap-2 rounded-md border border-border p-3">
                <Checkbox id="conf" checked={form.is_confidential} onCheckedChange={(v) => set('is_confidential', !!v)} />
                <Label htmlFor="conf" className="text-sm font-normal cursor-pointer">Is confidential — restrict to assigned lawyer, senior lawyer and admin</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={uploading || saving}>{uploading ? 'Uploading…' : saving ? 'Saving…' : 'Upload'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search documents…" className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-16">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3 text-muted-foreground">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><FileText className="h-6 w-6" /></div>
          <div>No documents found.</div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Document ID</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Case Number</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Document Type</th>
                  <th className="px-4 py-3 font-medium">File Name</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Uploaded By</th>
                  <th className="px-4 py-3 font-medium">Confidential</th>
                  <th className="px-4 py-3 font-medium hidden xl:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((d) => {
                  const dd = d.data || {};
                  const cs = caseMap[dd.case_id];
                  const caseNumber = dd.case_number || cs?.data?.case_number || '—';
                  return (
                    <tr key={d.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{dd.document_id || '—'}</td>
                      <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs">{caseNumber}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{TYPE_LABEL[dd.document_type] || dd.document_type}</td>
                      <td className="px-4 py-3 font-medium">
                        <a href={dd.file_url} target="_blank" rel="noreferrer" className="hover:text-primary inline-flex items-center gap-1.5">
                          {dd.is_confidential && <Lock className="h-3.5 w-3.5 text-amber-600" />}{dd.document_name || '—'}
                        </a>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{dd.uploaded_by_name || '—'}</td>
                      <td className="px-4 py-3">
                        {dd.is_confidential
                          ? <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">Yes</span>
                          : <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">No</span>}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">
                        {new Date(d.created_date).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}