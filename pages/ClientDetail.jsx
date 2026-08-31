import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Plus, FileText, Briefcase, Receipt, Mail, Phone, MapPin, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';

const STATUS_BADGE = {
  prospect: 'bg-blue-50 text-blue-700', active: 'bg-emerald-50 text-emerald-700', archived: 'bg-slate-100 text-slate-600'
};
const FEE_STATUS = {
  draft: 'bg-slate-100 text-slate-600', sent: 'bg-blue-50 text-blue-700', pending: 'bg-amber-50 text-amber-700',
  partial: 'bg-indigo-50 text-indigo-700', paid: 'bg-emerald-50 text-emerald-700', overdue: 'bg-red-50 text-red-700'
};

function parseNotes(log) {
  try { const a = JSON.parse(log || '[]'); return Array.isArray(a) ? a : []; } catch { return []; }
}

export default function ClientDetail() {
  const { id } = useParams();
  const { user, isStaff } = useCurrentUser();
  const { toast } = useToast();
  const [client, setClient] = useState(null);
  const [cases, setCases] = useState([]);
  const [fees, setFees] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const currency = user?.data?.currency || 'USD';
  const country = user?.data?.country || 'united_states';

  async function loadAll() {
    setLoading(true);
    try {
      const [cl, allCases, allFees, allDocs] = await Promise.all([
        base44.entities.Client.get(id),
        base44.entities.Case.list('-updated_date', 200),
        base44.entities.Fee.list('-updated_date', 200),
        base44.entities.CaseDocument.list('-created_date', 200)
      ]);
      setClient(cl);
      setCases(allCases.filter((c) => c.data?.client_id === cl.data?.client_id || c.data?.client_id === id));
      setFees(allFees.filter((f) => f.data?.client_id === cl.data?.client_id || f.data?.client_id === id));
      setDocs(allDocs.filter((d) => d.data?.client_id === cl.data?.client_id || d.data?.client_id === id));
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, [id]);

  const d = client?.data || {};
  const notes = parseNotes(d.notes_log);

  async function addNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const entry = { text: noteText.trim(), author: user.full_name || user.email, ts: new Date().toISOString() };
      const updated = JSON.stringify([entry, ...notes]);
      await base44.entities.Client.update(id, { notes_log: updated });
      setClient((p) => ({ ...p, data: { ...p.data, notes_log: updated } }));
      setNoteText(''); setNoteOpen(false);
      toast({ title: 'Note added' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    } finally {
      setSavingNote(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading client…</div>;
  if (!client) return <div className="p-10 text-center text-sm text-muted-foreground">Client not found.</div>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
      <Link to="/clients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to clients
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-xs rounded-full bg-muted px-2.5 py-0.5">{d.client_id || '—'}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${STATUS_BADGE[d.status]}`}>{d.status}</span>
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{d.full_name || d.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {d.email && <span className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4" />{d.email}</span>}
            {d.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4" />{d.phone_country_code} {d.phone}</span>}
            {d.address && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{d.address}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <Info label="Date of birth" value={formatDate(d.date_of_birth, country)} />
        <Info label="Occupation" value={d.occupation || '—'} />
        <Info label="Assigned lawyer" value={d.assigned_lawyer_name || '—'} />
        <Info label="Onboarded" value={new Date(client.created_date).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })} />
      </div>

      {d.notes && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-2">Onboarding notes</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{d.notes}</p>
        </div>
      )}

      <Tabs defaultValue="notes">
        <TabsList>
          <TabsTrigger value="notes"><FileText className="h-4 w-4 mr-1.5" />Notes</TabsTrigger>
          <TabsTrigger value="cases"><Briefcase className="h-4 w-4 mr-1.5" />Cases</TabsTrigger>
          <TabsTrigger value="docs"><FileText className="h-4 w-4 mr-1.5" />Documents</TabsTrigger>
          <TabsTrigger value="invoices"><Receipt className="h-4 w-4 mr-1.5" />Invoices</TabsTrigger>
        </TabsList>

        {/* Notes timeline */}
        <TabsContent value="notes">
          <SectionCard title="Notes timeline" action={isStaff && (
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

        {/* Cases */}
        <TabsContent value="cases">
          <SectionCard title="Linked cases">
            {cases.length === 0 ? <Empty icon={Briefcase} text="No cases linked to this client." /> : (
              <div className="divide-y divide-border">
                {cases.map((c) => (
                  <Link key={c.id} to={`/cases/${c.id}`} className="flex items-center justify-between py-3 hover:bg-muted/40 -mx-2 px-2 rounded-lg">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{c.data?.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">{c.data?.case_id || '—'} · <span className="capitalize">{(c.data?.status || '').replace(/_/g, ' ')}</span></div>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatCurrency(c.data?.claim_amount, currency)}</span>
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="docs">
          <SectionCard title="Documents">
            {docs.length === 0 ? <Empty icon={FileText} text="No documents for this client." /> : (
              <div className="divide-y divide-border">
                {docs.map((doc) => (
                  <a key={doc.id} href={doc.data?.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 py-3 hover:bg-muted/40 -mx-2 px-2 rounded-lg">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{doc.data?.document_name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{doc.data?.document_id} · {(doc.data?.document_type || '').replace('_', ' ')} · {new Date(doc.created_date).toLocaleDateString('en', { day: 'numeric', month: 'short' })}</div>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* Invoices */}
        <TabsContent value="invoices">
          <SectionCard title="Invoices">
            {fees.length === 0 ? <Empty icon={Receipt} text="No invoices for this client." /> : (
              <div className="divide-y divide-border">
                {fees.map((f) => (
                  <div key={f.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-sm font-medium">{f.data?.invoice_number || formatCurrency(f.data?.amount, currency)}</div>
                      <div className="text-xs text-muted-foreground">{f.data?.case_title || '—'} · due {formatDate(f.data?.due_date, country)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{formatCurrency(f.data?.amount, currency)}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${FEE_STATUS[f.data?.status]}`}>{f.data?.status}</span>
                    </div>
                  </div>
                ))}
              </div>
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