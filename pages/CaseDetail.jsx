import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Upload, Plus, CheckCircle2, FileText, Receipt, Gavel, Calendar, Users, AlertTriangle, Mail, Phone, MapPin } from 'lucide-react';
import { CATEGORY_LABEL, CATEGORY_BADGE } from '@/lib/caseCategories';
import { formatCurrency, formatDate, COUNTRY_LABEL } from '@/lib/format';

const STATUS_BADGE = {
  intake: 'bg-blue-50 text-blue-700', conflict_check: 'bg-amber-50 text-amber-700', engagement: 'bg-indigo-50 text-indigo-700',
  filed: 'bg-cyan-50 text-cyan-700', discovery: 'bg-violet-50 text-violet-700', pre_trial: 'bg-orange-50 text-orange-700',
  trial: 'bg-red-50 text-red-700', pending_judgment: 'bg-yellow-50 text-yellow-700', closed_won: 'bg-emerald-50 text-emerald-700',
  closed_lost: 'bg-rose-50 text-rose-700', closed_settled: 'bg-teal-50 text-teal-700', appealed: 'bg-purple-50 text-purple-700',
  dismissed: 'bg-slate-100 text-slate-500'
};
const FEE_STATUS = {
  pending: 'bg-amber-50 text-amber-700', partial: 'bg-blue-50 text-blue-700', paid: 'bg-emerald-50 text-emerald-700', overdue: 'bg-red-50 text-red-700'
};

export default function CaseDetail() {
  const { id } = useParams();
  const { user, isStaff, isClient, canSeeFinancials } = useCurrentUser();
  const { toast } = useToast();
  const [c, setCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [fees, setFees] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [statusEdit, setStatusEdit] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // doc form
  const [docOpen, setDocOpen] = useState(false);
  const [docForm, setDocForm] = useState({ title: '', doc_type: 'other', description: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // fee form
  const [feeOpen, setFeeOpen] = useState(false);
  const [feeForm, setFeeForm] = useState({ amount: '', description: '', due_date: '' });

  // update form
  const [updOpen, setUpdOpen] = useState(false);
  const [updForm, setUpdForm] = useState({ hearing_date: '', judge: '', summary: '', next_hearing_date: '', outcome: 'scheduled' });

  const [parties, setParties] = useState([]);
  const [partyOpen, setPartyOpen] = useState(false);
  const [partyForm, setPartyForm] = useState({ full_name: '', party_role: 'respondent', is_primary_contact: false, phone: '', email: '', address: '', notes: '' });

  // notes
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  function parseNotes(log) {
    try { const a = JSON.parse(log || '[]'); return Array.isArray(a) ? a : []; } catch { return []; }
  }

  async function addNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const entry = { text: noteText.trim(), author: user.full_name || user.email, ts: new Date().toISOString() };
      const updated = JSON.stringify([entry, ...notes]);
      await base44.entities.Case.update(id, { notes_log: updated });
      setCase((p) => ({ ...p, data: { ...p.data, notes_log: updated } }));
      setNoteText(''); setNoteOpen(false);
      toast({ title: 'Note added' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    } finally {
      setSavingNote(false);
    }
  }

  async function loadAll() {
    setLoading(true);
    try {
      const [cse, ds, fs, us, ps] = await Promise.all([
        base44.entities.Case.get(id),
        base44.entities.Document.filter({ case_id: id }, '-updated_date', 100),
        base44.entities.Fee.filter({ case_id: id }, '-updated_date', 100),
        base44.entities.CourtUpdate.filter({ case_id: id }, '-hearing_date', 100),
        base44.entities.CaseParty.filter({ case_id: id }, '-updated_date', 100)
      ]);
      setCase(cse); setDocs(ds); setFees(fs); setUpdates(us); setParties(ps);
      setNewStatus(cse.data?.status);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, [id]);

  const d = c?.data || {};
  const notes = parseNotes(d.notes_log);
  const canEdit = isStaff;
  const currency = user?.data?.currency || 'USD';
  const country = user?.data?.country || 'united_states';

  async function saveStatus() {
    try {
      await base44.entities.Case.update(id, { status: newStatus, next_hearing_date: d.next_hearing_date });
      setCase((p) => ({ ...p, data: { ...p.data, status: newStatus } }));
      setStatusEdit(false);
      toast({ title: 'Status updated' });
    } catch (e) { toast({ variant: 'destructive', title: 'Failed', description: e.message }); }
  }

  async function uploadDoc(e) {
    e.preventDefault();
    if (!file || !docForm.title) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Document.create({
        case_id: id, case_title: d.title, client_id: d.client_id, client_name: d.client_name,
        lawyer_id: d.assigned_lawyer_id, senior_lawyer_id: d.assigned_senior_lawyer_id,
        title: docForm.title, doc_type: docForm.doc_type, description: docForm.description, file_url
      });
      toast({ title: 'Document uploaded' });
      setDocForm({ title: '', doc_type: 'other', description: '' }); setFile(null); setDocOpen(false);
      loadAll();
    } catch (err) { toast({ variant: 'destructive', title: 'Upload failed', description: err.message }); }
    finally { setUploading(false); }
  }

  async function addFee(e) {
    e.preventDefault();
    try {
      await base44.entities.Fee.create({
        case_id: id, case_title: d.title, client_id: d.client_id, client_name: d.client_name,
        lawyer_id: d.assigned_lawyer_id, senior_lawyer_id: d.assigned_senior_lawyer_id,
        amount: Number(feeForm.amount), description: feeForm.description, due_date: feeForm.due_date, status: 'pending', amount_paid: 0
      });
      toast({ title: 'Fee added' });
      setFeeForm({ amount: '', description: '', due_date: '' }); setFeeOpen(false);
      loadAll();
    } catch (err) { toast({ variant: 'destructive', title: 'Failed', description: err.message }); }
  }

  async function markPaid(fee) {
    try {
      await base44.entities.Fee.update(fee.id, { status: 'paid', amount_paid: fee.data.amount, paid_date: new Date().toISOString().slice(0, 10) });
      toast({ title: 'Payment recorded' });
      loadAll();
    } catch (e) { toast({ variant: 'destructive', title: 'Failed', description: e.message }); }
  }

  async function addUpdate(e) {
    e.preventDefault();
    try {
      await base44.entities.CourtUpdate.create({
        case_id: id, case_title: d.title, client_id: d.client_id, client_name: d.client_name,
        lawyer_id: d.assigned_lawyer_id, senior_lawyer_id: d.assigned_senior_lawyer_id,
        hearing_date: updForm.hearing_date, judge: updForm.judge, summary: updForm.summary,
        next_hearing_date: updForm.next_hearing_date, outcome: updForm.outcome
      });
      if (updForm.next_hearing_date) {
        await base44.entities.Case.update(id, { next_hearing_date: updForm.next_hearing_date });
      }
      toast({ title: 'Court update added' });
      setUpdForm({ hearing_date: '', judge: '', summary: '', next_hearing_date: '', outcome: 'scheduled' }); setUpdOpen(false);
      loadAll();
    } catch (err) { toast({ variant: 'destructive', title: 'Failed', description: err.message }); }
  }

  async function addParty(e) {
    e.preventDefault();
    if (!partyForm.full_name) return;
    try {
      await base44.entities.CaseParty.create({
        ...partyForm,
        case_id: id, lawyer_id: d.assigned_lawyer_id, senior_lawyer_id: d.assigned_senior_lawyer_id
      });
      toast({ title: 'Party added' });
      setPartyForm({ full_name: '', party_role: 'respondent', is_primary_contact: false, phone: '', email: '', address: '', notes: '' });
      setPartyOpen(false);
      loadAll();
    } catch (err) { toast({ variant: 'destructive', title: 'Failed', description: err.message }); }
  }

  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading case…</div>;
  if (!c) return <div className="p-10 text-center text-sm text-muted-foreground">Case not found.</div>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
      <Link to="/cases" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to cases
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${CATEGORY_BADGE[d.case_category]}`}>{CATEGORY_LABEL[d.case_category] || 'Uncategorized'}</span>
            {d.case_type && <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium">{d.case_type}</span>}
            {statusEdit ? (
              <div className="flex items-center gap-2">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="h-7 w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['intake','conflict_check','engagement','filed','discovery','pre_trial','trial','pending_judgment','closed_won','closed_lost','closed_settled','appealed','dismissed'].map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={saveStatus}>Save</Button>
              </div>
            ) : (
              <button onClick={() => canEdit && setStatusEdit(true)} className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${STATUS_BADGE[d.status]}`}>
                {(d.status || '').replace(/_/g, ' ')}
              </button>
            )}
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{d.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {d.case_id && <span className="font-mono">{d.case_id} · </span>}{d.case_number || 'No case number'} · {d.client_name}
          </p>
        </div>
        {d.priority && (
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Priority</div>
            <div className="font-medium capitalize">{d.priority}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <Info label="Court" value={d.court_name} />
        <Info label="Department" value={d.court_department} />
        <Info label="Judge" value={d.judge_name} />
        <Info label="Opposing counsel" value={d.opposing_counsel_name} />
        <Info label="Filed" value={formatDate(d.filing_date, country)} />
        <Info label="Next hearing" value={formatDate(d.next_hearing_date, country)} />
        <Info label="Lead lawyer" value={d.assigned_lawyer_name || '—'} />
        {canSeeFinancials && <Info label="Claim amount" value={formatCurrency(d.claim_amount, currency)} />}
        <Info label="Jurisdiction" value={COUNTRY_LABEL[d.jurisdiction_country] || '—'} />
      </div>

      {d.statute_of_limitations_date && (() => {
        const days = Math.ceil((new Date(d.statute_of_limitations_date) - new Date()) / 86400000);
        const danger = days <= 0;
        const warn = days > 0 && days <= 30;
        if (!danger && !warn) return null;
        return (
          <div className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 ${danger ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
            <AlertTriangle className={`h-5 w-5 mt-0.5 ${danger ? 'text-red-600' : 'text-amber-600'}`} />
            <div className="text-sm">
              <div className={`font-semibold ${danger ? 'text-red-800' : 'text-amber-800'}`}>{danger ? 'Statute of limitations expired' : 'Statute of limitations approaching'}</div>
              <div className={danger ? 'text-red-700' : 'text-amber-700'}>{new Date(d.statute_of_limitations_date).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })}{danger ? ' has passed.' : ` — ${days} day(s) remaining.`}</div>
            </div>
          </div>
        );
      })()}

      {d.description && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-2">Case description</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{d.description}</p>
        </div>
      )}

      <Tabs defaultValue="notes">
        <TabsList>
          <TabsTrigger value="notes"><FileText className="h-4 w-4 mr-1.5" />Notes</TabsTrigger>
          <TabsTrigger value="parties"><Users className="h-4 w-4 mr-1.5" />Parties</TabsTrigger>
          <TabsTrigger value="docs"><FileText className="h-4 w-4 mr-1.5" />Documents</TabsTrigger>
          {canSeeFinancials && <TabsTrigger value="fees"><Receipt className="h-4 w-4 mr-1.5" />Fees</TabsTrigger>}
          <TabsTrigger value="updates"><Gavel className="h-4 w-4 mr-1.5" />Court Updates</TabsTrigger>
        </TabsList>

        {/* Notes */}
        <TabsContent value="notes">
          <SectionCard title="Case notes" action={isStaff && (
            <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
              <Button size="sm" variant="outline" onClick={() => setNoteOpen(true)}><Plus className="h-4 w-4 mr-1.5" />Add note</Button>
              <DialogContent>
                <DialogHeader><DialogTitle>Add note</DialogTitle></DialogHeader>
                <form onSubmit={addNote} className="space-y-4">
                  <div className="space-y-1.5"><Label>Note *</Label><Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4} required autoFocus /></div>
                  <DialogFooter><Button type="button" variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button><Button type="submit" disabled={savingNote}>{savingNote ? 'Saving…' : 'Save note'}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}>
            {notes.length === 0 ? <Empty icon={FileText} text="No notes yet." /> : (
              <ol className="relative border-l border-border ml-2 space-y-5 pl-5">
                {notes.map((n, i) => (
                  <li key={i}>
                    <div className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{n.author}</span>
                      <span>· {new Date(n.ts).toLocaleString('en', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{n.text}</p>
                  </li>
                ))}
              </ol>
            )}
          </SectionCard>
        </TabsContent>

        {/* Parties */}
        <TabsContent value="parties">
          <SectionCard title="Parties" action={isStaff && (
            <Dialog open={partyOpen} onOpenChange={setPartyOpen}>
              <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1.5" />Add party</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add party</DialogTitle></DialogHeader>
                <form onSubmit={addParty} className="space-y-4">
                  <div className="space-y-1.5"><Label>Full name *</Label><Input value={partyForm.full_name} onChange={(e) => setPartyForm((f) => ({ ...f, full_name: e.target.value }))} required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Role *</Label>
                      <Select value={partyForm.party_role} onValueChange={(v) => setPartyForm((f) => ({ ...f, party_role: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['petitioner','respondent','co_petitioner','co_defendant','intervenor','guardian_ad_litem','witness','opposing_counsel'].map((r) => <SelectItem key={r} value={r} className="capitalize">{r.replace(/_/g, ' ')}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>Phone</Label><Input value={partyForm.phone} onChange={(e) => setPartyForm((f) => ({ ...f, phone: e.target.value }))} /></div>
                  </div>
                  <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={partyForm.email} onChange={(e) => setPartyForm((f) => ({ ...f, email: e.target.value }))} /></div>
                  <div className="space-y-1.5"><Label>Address</Label><Input value={partyForm.address} onChange={(e) => setPartyForm((f) => ({ ...f, address: e.target.value }))} /></div>
                  <div className="space-y-1.5"><Label>Notes</Label><Textarea value={partyForm.notes} onChange={(e) => setPartyForm((f) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={partyForm.is_primary_contact} onChange={(e) => setPartyForm((f) => ({ ...f, is_primary_contact: e.target.checked }))} /> Primary contact</label>
                  <DialogFooter><Button type="button" variant="outline" onClick={() => setPartyOpen(false)}>Cancel</Button><Button type="submit">Add party</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}>
            {parties.length === 0 ? <Empty icon={Users} text="No parties added yet." /> : (
              <div className="divide-y divide-border">
                {parties.map((p) => (
                  <div key={p.id} className="py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{p.data?.full_name}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] capitalize">{(p.data?.party_role || '').replace(/_/g, ' ')}</span>
                      {p.data?.is_primary_contact && <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-medium">Primary</span>}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {p.data?.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{p.data.phone}</span>}
                      {p.data?.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{p.data.email}</span>}
                      {p.data?.address && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{p.data.address}</span>}
                    </div>
                    {p.data?.notes && <p className="mt-1 text-xs text-muted-foreground">{p.data.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="docs">
          <SectionCard title="Documents" action={(
            <Dialog open={docOpen} onOpenChange={setDocOpen}>
              <DialogTrigger asChild><Button size="sm" variant="outline"><Upload className="h-4 w-4 mr-1.5" />Upload</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Upload document</DialogTitle></DialogHeader>
                <form onSubmit={uploadDoc} className="space-y-4">
                  <div className="space-y-1.5"><Label>Title *</Label><Input value={docForm.title} onChange={(e) => setDocForm((f) => ({ ...f, title: e.target.value }))} required /></div>
                  <div className="space-y-1.5"><Label>Type</Label>
                    <Select value={docForm.doc_type} onValueChange={(v) => setDocForm((f) => ({ ...f, doc_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['contract','evidence','filing','court_order','id_proof','other'].map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace('_',' ')}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>File *</Label><Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required /></div>
                  <div className="space-y-1.5"><Label>Description</Label><Textarea value={docForm.description} onChange={(e) => setDocForm((f) => ({ ...f, description: e.target.value }))} rows={2} /></div>
                  <DialogFooter><Button type="button" variant="outline" onClick={() => setDocOpen(false)}>Cancel</Button><Button type="submit" disabled={uploading}>{uploading ? 'Uploading…' : 'Upload'}</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}>
            {docs.length === 0 ? <Empty icon={FileText} text="No documents yet." /> : (
              <div className="divide-y divide-border">
                {docs.map((doc) => (
                  <a key={doc.id} href={doc.data?.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 py-3 hover:bg-muted/40 -mx-2 px-2 rounded-lg">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{doc.data?.title}</div>
                      <div className="text-xs text-muted-foreground capitalize">{doc.data?.doc_type?.replace('_', ' ')} · {new Date(doc.created_date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* Fees */}
        {canSeeFinancials && (
        <TabsContent value="fees">
          <SectionCard title="Fees" action={isStaff && (
            <Dialog open={feeOpen} onOpenChange={setFeeOpen}>
              <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1.5" />Add fee</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add fee</DialogTitle></DialogHeader>
                <form onSubmit={addFee} className="space-y-4">
                  <div className="space-y-1.5"><Label>Amount *</Label><Input type="number" value={feeForm.amount} onChange={(e) => setFeeForm((f) => ({ ...f, amount: e.target.value }))} required /></div>
                  <div className="space-y-1.5"><Label>Due date</Label><Input type="date" value={feeForm.due_date} onChange={(e) => setFeeForm((f) => ({ ...f, due_date: e.target.value }))} /></div>
                  <div className="space-y-1.5"><Label>Description</Label><Textarea value={feeForm.description} onChange={(e) => setFeeForm((f) => ({ ...f, description: e.target.value }))} rows={2} /></div>
                  <DialogFooter><Button type="button" variant="outline" onClick={() => setFeeOpen(false)}>Cancel</Button><Button type="submit">Add</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}>
            {fees.length === 0 ? <Empty icon={Receipt} text="No fees recorded." /> : (
              <div className="divide-y divide-border">
                {fees.map((f) => (
                  <div key={f.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-sm font-medium">{formatCurrency(f.data?.amount, currency)}</div>
                      <div className="text-xs text-muted-foreground">{f.data?.description || 'Fee'} {f.data?.due_date && `· due ${formatDate(f.data.due_date, country)}`}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${FEE_STATUS[f.data?.status]}`}>{f.data?.status}</span>
                      {isStaff && f.data?.status !== 'paid' && (
                        <Button size="sm" variant="ghost" onClick={() => markPaid(f)}><CheckCircle2 className="h-4 w-4 mr-1" />Mark paid</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>
        )}

        {/* Court updates */}
        <TabsContent value="updates">
          <SectionCard title="Court updates" action={isStaff && (
            <Dialog open={updOpen} onOpenChange={setUpdOpen}>
              <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1.5" />Add update</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add court update</DialogTitle></DialogHeader>
                <form onSubmit={addUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Hearing date *</Label><Input type="date" value={updForm.hearing_date} onChange={(e) => setUpdForm((f) => ({ ...f, hearing_date: e.target.value }))} required /></div>
                    <div className="space-y-1.5"><Label>Next hearing</Label><Input type="date" value={updForm.next_hearing_date} onChange={(e) => setUpdForm((f) => ({ ...f, next_hearing_date: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label>Judge</Label><Input value={updForm.judge} onChange={(e) => setUpdForm((f) => ({ ...f, judge: e.target.value }))} /></div>
                    <div className="space-y-1.5"><Label>Outcome</Label>
                      <Select value={updForm.outcome} onValueChange={(v) => setUpdForm((f) => ({ ...f, outcome: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['scheduled','adjourned','completed','order_passed','other'].map((o) => <SelectItem key={o} value={o} className="capitalize">{o.replace('_',' ')}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5"><Label>Summary *</Label><Textarea value={updForm.summary} onChange={(e) => setUpdForm((f) => ({ ...f, summary: e.target.value }))} rows={3} required /></div>
                  <DialogFooter><Button type="button" variant="outline" onClick={() => setUpdOpen(false)}>Cancel</Button><Button type="submit">Add</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}>
            {updates.length === 0 ? <Empty icon={Gavel} text="No court updates yet." /> : (
              <ol className="relative border-l border-border ml-2 space-y-5 pl-5">
                {updates.map((u) => (
                  <li key={u.id}>
                    <div className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(u.data?.hearing_date, country)}
                      {u.data?.judge && ` · ${u.data.judge}`}
                      <span className="rounded-full bg-muted px-2 py-0.5 capitalize">{(u.data?.outcome || '').replace('_',' ')}</span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed">{u.data?.summary}</p>
                    {u.data?.next_hearing_date && <div className="mt-1 text-xs text-violet-600 font-medium">Next: {formatDate(u.data.next_hearing_date, country)}</div>}
                  </li>
                ))}
              </ol>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-1 truncate">{value}</div>
    </div>
  );
}

function SectionCard({ title, action, children }) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h3 className="font-heading font-semibold text-sm">{title}</h3>
        {action}
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  );
}

function Empty({ icon: Icon, text }) {
  return (
    <div className="py-8 flex flex-col items-center gap-2 text-muted-foreground text-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted"><Icon className="h-5 w-5" /></div>
      {text}
    </div>
  );
}