import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
import { nextSeqId } from '@/lib/ids';
import { Plus, Search, Users, Mail, Phone, Upload, FileText } from 'lucide-react';

const STATUS_BADGE = {
  prospect: 'bg-blue-50 text-blue-700',
  onboarded: 'bg-violet-50 text-violet-700',
  active: 'bg-emerald-50 text-emerald-700',
  archived: 'bg-slate-100 text-slate-600'
};

const COUNTRY_CODES = [
  { code: '+1', label: '+1 (US)' },
  { code: '+44', label: '+44 (UK)' },
  { code: '+91', label: '+91 (IN)' },
  { code: '+61', label: '+61 (AU)' },
  { code: '+971', label: '+971 (UAE)' },
  { code: '+1-876', label: '+1-876' },
  { code: '+27', label: '+27 (ZA)' }
];

const ID_TYPES = [
  { value: 'driver_license', label: 'Driver License' },
  { value: 'passport', label: 'Passport' },
  { value: 'state_id', label: 'State ID' },
  { value: 'other', label: 'Other' }
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const empty = {
  full_name: '', email: '', phone: '', phone_country_code: '+1', address: '',
  date_of_birth: '', id_type: '', id_number: '', occupation: '', emergency_contact: '',
  status: 'prospect', notes: '', case_id: '', assigned_lawyer_id: '', conflict_checked: false
};

export default function Clients() {
  const { user, isStaff } = useCurrentUser();
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [cl, cs, us] = await Promise.all([
        base44.entities.Client.list('-updated_date', 200),
        base44.entities.Case.list('-updated_date', 200),
        isStaff ? base44.entities.User.list() : Promise.resolve([])
      ]);
      setClients(cl);
      setCases(cs);
      setLawyers(us.filter((u) => u.data?.role_type === 'senior_lawyer' || u.data?.role_type === 'lawyer'));
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => clients.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const name = c.data?.full_name || c.data?.name || '';
    return name.toLowerCase().includes(q) || c.data?.email?.toLowerCase().includes(q) || c.data?.client_id?.toLowerCase().includes(q) || c.data?.phone?.includes(q);
  }), [clients, query]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      setFileUrl(file_url);
    } catch {
      toast({ variant: 'destructive', title: 'Upload failed' });
    } finally {
      setUploading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.full_name.trim()) { toast({ variant: 'destructive', title: 'Client name is required' }); return; }
    if (!form.email.trim() || !EMAIL_RE.test(form.email)) { toast({ variant: 'destructive', title: 'A valid email is required' }); return; }
    if (!form.phone.trim()) { toast({ variant: 'destructive', title: 'Phone number is required' }); return; }
    setSaving(true);
    try {
      const client_id = nextSeqId('CL', clients, 'client_id');
      const lawyer = lawyers.find((l) => l.id === form.assigned_lawyer_id);
      const linkedCase = cases.find((c) => c.id === form.case_id);
      const payload = {
        client_id,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        phone_country_code: form.phone_country_code,
        address: form.address || undefined,
        date_of_birth: form.date_of_birth || undefined,
        id_type: form.id_type || undefined,
        id_number: form.id_number || undefined,
        occupation: form.occupation || undefined,
        emergency_contact: form.emergency_contact || undefined,
        status: form.status,
        notes: form.notes || undefined,
        assigned_lawyer_id: form.assigned_lawyer_id || undefined,
        assigned_lawyer_name: lawyer?.full_name || lawyer?.email || '',
        conflict_checked: !!form.conflict_checked
      };
      await base44.entities.Client.create(payload);

      // Link an existing case to this client if selected
      if (linkedCase && !linkedCase.data?.client_id) {
        await base44.entities.Case.update(linkedCase.id, { client_id: client_id, client_name: form.full_name });
      }

      // Save uploaded document against the selected case (or first case) so it appears in Documents
      if (fileUrl && (form.case_id || linkedCase)) {
        const doc_id = nextSeqId('DOC', [], 'document_id');
        await base44.entities.CaseDocument.create({
          document_id: doc_id,
          case_id: form.case_id,
          client_id: client_id,
          client_name: form.full_name,
          uploaded_by: user.id,
          uploaded_by_name: user.full_name || user.email,
          document_name: file?.name || 'Client document',
          document_type: 'id_proof',
          file_url: fileUrl,
          file_size: file?.size ? (file.size / 1024).toFixed(1) + ' KB' : '',
          description: 'Uploaded during client onboarding',
          access_level: 'all_parties'
        });
      }

      toast({ title: 'Client added successfully', description: `${form.full_name} is now in the client list` });
      setForm(empty); setFile(null); setFileUrl(''); setOpen(false); load();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">Onboard and manage clients</p>
        </div>
        {isStaff && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="bg-black text-white hover:bg-black/90"><Plus className="h-4 w-4 mr-1.5" /> Add New Client</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add a new client</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5"><Label>Client name *</Label><Input value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required /></div>
                  <div className="space-y-1.5"><Label>Phone *</Label>
                    <div className="flex gap-2">
                      <Select value={form.phone_country_code} onValueChange={(v) => set('phone_country_code', v)}>
                        <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                        <SelectContent>{COUNTRY_CODES.map((c) => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Number" className="flex-1" required />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5"><Label>Address</Label><Textarea value={form.address} onChange={(e) => set('address', e.target.value)} rows={2} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Date of birth</Label><Input type="date" value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>ID type</Label>
                    <Select value={form.id_type} onValueChange={(v) => set('id_type', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{ID_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>ID number</Label><Input value={form.id_number} onChange={(e) => set('id_number', e.target.value)} /></div>
                  <div className="space-y-1.5"><Label>Occupation</Label><Input value={form.occupation} onChange={(e) => set('occupation', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Emergency contact</Label><Input value={form.emergency_contact} onChange={(e) => set('emergency_contact', e.target.value)} placeholder="Phone number" /></div>
                  <div className="space-y-1.5"><Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => set('status', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="onboarded">Onboarded</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Assigned lawyer</Label>
                    <Select value={form.assigned_lawyer_id} onValueChange={(v) => set('assigned_lawyer_id', v)}>
                      <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                      <SelectContent>{lawyers.map((l) => <SelectItem key={l.id} value={l.id}>{l.full_name || l.email}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Link to case</Label>
                    <Select value={form.case_id} onValueChange={(v) => set('case_id', v)}>
                      <SelectTrigger><SelectValue placeholder="Skip" /></SelectTrigger>
                      <SelectContent>
                        {cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.data?.case_id ? `${c.data.case_id} · ` : ''}{c.data?.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-border p-3">
                  <Checkbox id="conflict" checked={form.conflict_checked} onCheckedChange={(v) => set('conflict_checked', !!v)} />
                  <Label htmlFor="conflict" className="text-sm font-normal cursor-pointer">Conflict checked — conflict of interest has been verified</Label>
                </div>
                <div className="space-y-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} /></div>
                <div className="space-y-1.5"><Label>Document upload</Label>
                  <Input type="file" onChange={onFile} disabled={uploading} />
                  {fileUrl && <div className="text-xs text-emerald-600 flex items-center gap-1"><FileText className="h-3 w-3" />{file?.name} ready</div>}
                  {!form.case_id && fileUrl && <div className="text-xs text-amber-600">A case must be linked for the document to attach. Select a case above.</div>}
                </div>
                <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={saving || uploading}>{saving ? 'Saving…' : 'Save client'}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search clients…" className="pl-9" />
      </div>

      {loading ? <div className="text-center text-sm text-muted-foreground py-16">Loading…</div> : filtered.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3 text-muted-foreground">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><Users className="h-6 w-6" /></div>
          <div>No clients yet.</div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Client Name</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Email</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Phone</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium hidden lg:table-cell">Assigned Lawyer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => {
                const name = c.data?.full_name || c.data?.name || '—';
                return (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3.5">
                      <Link to={`/clients/${c.id}`} className="font-medium hover:text-primary">{name}</Link>
                      {c.data?.client_id && <div className="text-xs text-muted-foreground font-mono">{c.data.client_id}</div>}
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      {c.data?.email ? <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{c.data.email}</span> : '—'}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {c.data?.phone ? <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{c.data.phone_country_code} {c.data.phone}</span> : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${STATUS_BADGE[c.data?.status] || 'bg-slate-100 text-slate-600'}`}>{c.data?.status || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-muted-foreground">
                      {c.data?.assigned_lawyer_name || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}