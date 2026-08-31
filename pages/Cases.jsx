import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Search, Briefcase } from 'lucide-react';
import { nextSeqId } from '@/lib/ids';
import { formatDate } from '@/lib/format';

const CASE_TYPES = [
  { value: 'criminal_law', label: 'Criminal' },
  { value: 'civil_litigation', label: 'Civil' },
  { value: 'family_law', label: 'Family' },
  { value: 'corporate_business', label: 'Corporate' },
  { value: 'immigration', label: 'Immigration' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'intellectual_property', label: 'IP' },
  { value: 'bankruptcy', label: 'Bankruptcy' },
  { value: 'personal_injury', label: 'Personal Injury' },
  { value: 'estate_planning_probate', label: 'Estate Planning' }
];

const STATUS_OPTIONS = [
  { value: 'intake', label: 'Intake' },
  { value: 'filed', label: 'Filed' },
  { value: 'active', label: 'Active' },
  { value: 'hearing', label: 'Hearing' },
  { value: 'pending_judgment', label: 'Pending Judgment' },
  { value: 'closed', label: 'Closed' },
  { value: 'appealed', label: 'Appealed' },
  { value: 'dismissed', label: 'Dismissed' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

const BILLING_OPTIONS = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'flat_fee', label: 'Flat Fee' },
  { value: 'contingency', label: 'Contingency' },
  { value: 'retainer', label: 'Retainer' }
];

const STATUS_BADGE = {
  intake: 'bg-blue-50 text-blue-700',
  filed: 'bg-cyan-50 text-cyan-700',
  active: 'bg-emerald-50 text-emerald-700',
  hearing: 'bg-violet-50 text-violet-700',
  pending_judgment: 'bg-yellow-50 text-yellow-700',
  closed: 'bg-slate-100 text-slate-600',
  appealed: 'bg-purple-50 text-purple-700',
  dismissed: 'bg-rose-50 text-rose-700'
};

const PRIORITY_BADGE = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-50 text-blue-700',
  high: 'bg-amber-50 text-amber-700',
  urgent: 'bg-red-50 text-red-700'
};

const empty = {
  title: '', case_category: '', case_type: '', status: 'intake', priority: 'medium',
  client_id: '', assigned_lawyer_id: '', assigned_senior_lawyer_id: '',
  court_name: '', jurisdiction: '', filing_date: '', next_hearing_date: '',
  description: '', billing_type: 'hourly', hourly_rate: '', retainer_amount: ''
};

// Auto-generate a unique case number: CASE-YYYY-XXXX
function nextCaseNumber(cases) {
  const year = new Date().getFullYear();
  let max = 0;
  (cases || []).forEach((c) => {
    const cn = c?.data?.case_number || c?.case_number;
    if (cn) {
      const m = cn.match(/^CASE-(\d{4})-(\d+)$/);
      if (m && Number(m[1]) === year) max = Math.max(max, Number(m[2]));
    }
  });
  return `CASE-${year}-${String(max + 1).padStart(4, '0')}`;
}

export default function Cases() {
  const { user, isStaff } = useCurrentUser();
  const { toast } = useToast();
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [c, cl, us] = await Promise.all([
        base44.entities.Case.list('-updated_date', 200),
        isStaff ? base44.entities.Client.list('-updated_date', 200) : Promise.resolve([]),
        isStaff ? base44.entities.User.list() : Promise.resolve([])
      ]);
      setCases(c);
      setClients(cl);
      setLawyers(us.filter((u) => u.data?.role_type === 'senior_lawyer' || u.data?.role_type === 'lawyer'));
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => cases.filter((c) => {
    if (!query) return true;
    const d = c.data || {};
    const q = query.toLowerCase();
    return d.title?.toLowerCase().includes(q) || d.case_number?.toLowerCase().includes(q) || d.client_name?.toLowerCase().includes(q) || d.case_type?.toLowerCase().includes(q);
  }), [cases, query]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onCaseTypeChange = (val) => {
    const opt = CASE_TYPES.find((o) => o.value === val);
    setForm((f) => ({ ...f, case_category: val, case_type: opt?.label || '' }));
  };

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) { toast({ variant: 'destructive', title: 'Case title is required' }); return; }
    if (!form.case_category) { toast({ variant: 'destructive', title: 'Case type is required' }); return; }
    if (!form.client_id) { toast({ variant: 'destructive', title: 'Client is required' }); return; }
    setSaving(true);
    try {
      const client = clients.find((c) => c.id === form.client_id);
      const lawyer = lawyers.find((l) => l.id === form.assigned_lawyer_id);
      const senior = lawyers.find((l) => l.id === form.assigned_senior_lawyer_id);
      const case_number = nextCaseNumber(cases);
      const case_id = nextSeqId('CS', cases, 'case_id');
      const payload = {
        title: form.title.trim(),
        case_id,
        case_number,
        case_category: form.case_category,
        case_type: form.case_type,
        status: form.status,
        priority: form.priority,
        client_id: form.client_id,
        client_name: client?.data?.full_name || client?.data?.name || '',
        assigned_lawyer_id: form.assigned_lawyer_id || undefined,
        assigned_lawyer_name: lawyer?.full_name || lawyer?.email || '',
        assigned_senior_lawyer_id: form.assigned_senior_lawyer_id || undefined,
        assigned_senior_lawyer_name: senior?.full_name || senior?.email || '',
        court_name: form.court_name || undefined,
        jurisdiction: form.jurisdiction || undefined,
        filing_date: form.filing_date || undefined,
        next_hearing_date: form.next_hearing_date || undefined,
        description: form.description || undefined,
        billing_type: form.billing_type,
        hourly_rate: (form.billing_type === 'hourly' || form.billing_type === 'retainer') && form.hourly_rate ? Number(form.hourly_rate) : undefined,
        retainer_amount: form.billing_type === 'retainer' && form.retainer_amount ? Number(form.retainer_amount) : undefined
      };
      await base44.entities.Case.create(payload);
      toast({ title: 'Case added successfully', description: `Case number ${case_number}` });
      setForm(empty);
      setOpen(false);
      load();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not create case', description: err.message });
    } finally {
      setSaving(false);
    }
  }

  const showHourlyRate = form.billing_type === 'hourly' || form.billing_type === 'retainer';
  const showRetainerAmount = form.billing_type === 'retainer';
  const country = user?.data?.country || 'united_states';

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Cases</h1>
          <p className="text-sm text-muted-foreground mt-1">{isStaff ? 'Manage all legal matters' : 'Your legal matters'}</p>
        </div>
        {isStaff && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-1.5" /> Add New Case</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add a new case</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Case title *</Label>
                  <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Acme Corp v. City" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Case type *</Label>
                    <Select value={form.case_category} onValueChange={onCaseTypeChange}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {CASE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Client *</Label>
                    <Select value={form.client_id} onValueChange={(v) => set('client_id', v)}>
                      <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.data?.full_name || c.data?.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => set('status', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => set('priority', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Assigned lawyer</Label>
                    <Select value={form.assigned_lawyer_id} onValueChange={(v) => set('assigned_lawyer_id', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {lawyers.map((l) => <SelectItem key={l.id} value={l.id}>{l.full_name || l.email}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Senior lawyer</Label>
                    <Select value={form.assigned_senior_lawyer_id} onValueChange={(v) => set('assigned_senior_lawyer_id', v)}>
                      <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                      <SelectContent>
                        {lawyers.map((l) => <SelectItem key={l.id} value={l.id}>{l.full_name || l.email}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Court name</Label>
                    <Input value={form.court_name} onChange={(e) => set('court_name', e.target.value)} placeholder="e.g. Superior Court" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Jurisdiction</Label>
                    <Input value={form.jurisdiction} onChange={(e) => set('jurisdiction', e.target.value)} placeholder="e.g. California, US" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Filing date</Label>
                    <Input type="date" value={form.filing_date} onChange={(e) => set('filing_date', e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Next hearing date</Label>
                    <Input type="date" value={form.next_hearing_date} onChange={(e) => set('next_hearing_date', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Billing type</Label>
                    <Select value={form.billing_type} onValueChange={(v) => set('billing_type', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BILLING_OPTIONS.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {showHourlyRate && (
                    <div className="space-y-1.5">
                      <Label>Hourly rate</Label>
                      <Input type="number" min="0" step="0.01" value={form.hourly_rate} onChange={(e) => set('hourly_rate', e.target.value)} placeholder="0.00" />
                    </div>
                  )}
                  {showRetainerAmount && (
                    <div className="space-y-1.5">
                      <Label>Retainer amount</Label>
                      <Input type="number" min="0" step="0.01" value={form.retainer_amount} onChange={(e) => set('retainer_amount', e.target.value)} placeholder="0.00" />
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save case'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cases…" className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-16">Loading cases…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3 text-muted-foreground">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><Briefcase className="h-6 w-6" /></div>
          <div>No cases found.</div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Case Number</th>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Case Type</th>
                <th className="px-5 py-3 font-medium hidden md:table-cell">Client Name</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium hidden lg:table-cell">Priority</th>
                <th className="px-5 py-3 font-medium hidden xl:table-cell">Next Hearing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => {
                const d = c.data || {};
                const statusLabel = STATUS_OPTIONS.find((s) => s.value === d.status)?.label || d.status;
                const priorityLabel = PRIORITY_OPTIONS.find((p) => p.value === d.priority)?.label || d.priority;
                return (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3.5 font-mono text-xs">{d.case_number || '—'}</td>
                    <td className="px-5 py-3.5">
                      <Link to={`/cases/${c.id}`} className="font-medium hover:text-primary">{d.title || '—'}</Link>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">{d.case_type || '—'}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-muted-foreground">{d.client_name || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_BADGE[d.status] || 'bg-slate-100 text-slate-600'}`}>{statusLabel}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${PRIORITY_BADGE[d.priority] || 'bg-slate-100 text-slate-600'}`}>{priorityLabel}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden xl:table-cell text-xs text-muted-foreground">
                      {d.next_hearing_date ? formatDate(d.next_hearing_date, country) : '—'}
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