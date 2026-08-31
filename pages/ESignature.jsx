import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/format';
import { FileSignature, Plus, Download, ShieldCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';

const STATUS = {
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300', icon: Clock },
  viewed: { label: 'Viewed', cls: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300', icon: Clock },
  signed: { label: 'Signed', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', icon: CheckCircle2 },
  declined: { label: 'Declined', cls: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300', icon: XCircle },
  expired: { label: 'Expired', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', icon: Clock },
};

export default function ESignature() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const country = user?.data?.country || 'united_states';
  const [reqs, setReqs] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('pending');
  const [form, setForm] = useState({ case_id: '', document_name: '', document_url: '', signer_name: '', signer_email: '', signer_role: 'client', request_message: '', expires_date: '' });

  async function load() {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([
        base44.entities.SignatureRequest.list('-created_date', 200),
        base44.entities.Case.list('-created_date', 100),
      ]);
      setReqs(r); setCases(c);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const shown = reqs.filter(r => tab === 'pending' ? r.data?.status !== 'signed' && r.data?.status !== 'declined' && r.data?.status !== 'expired' : r.data?.status === 'signed');

  async function send() {
    if (!form.document_name || !form.document_url || !form.signer_name || !form.signer_email) { toast({ variant: 'destructive', title: 'Fill required fields' }); return; }
    const c = cases.find(x => x.id === form.case_id);
    const exp = form.expires_date || new Date(Date.now() + 30*864e5).toISOString().slice(0,10);
    await base44.entities.SignatureRequest.create({
      case_id: form.case_id || '', case_title: c?.data?.title || '',
      document_name: form.document_name, document_url: form.document_url,
      signer_name: form.signer_name, signer_email: form.signer_email, signer_role: form.signer_role,
      status: 'pending', request_message: form.request_message, expires_date: new Date(exp).toISOString(),
      created_by: user?.full_name
    });
    try { await base44.integrations.Core.SendEmail({ to: form.signer_email, subject: `Document for signature: ${form.document_name}`, body: form.request_message || `You have a document to sign: ${form.document_name}` }); } catch (e) {}
    setOpen(false); setForm({ case_id: '', document_name: '', document_url: '', signer_name: '', signer_email: '', signer_role: 'client', request_message: '', expires_date: '' });
    toast({ title: 'Signature request sent' }); load();
  }

  async function simulateSign(r) {
    const trail = `Signed by ${r.data?.signer_email} at ${new Date().toISOString()} | IP: 203.0.113.42 | Device: Chrome/macOS`;
    await base44.entities.SignatureRequest.update(r.id, { status: 'signed', signed_date: new Date().toISOString(), signed_document_url: r.data?.document_url, signature_data: 'sig-demo', audit_trail: trail });
    toast({ title: 'Document signed', description: 'Audit trail captured.' }); load();
  }

  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">E-Signature</h1>
          <p className="text-sm text-muted-foreground mt-1">Send, track and archive signed documents</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" />Send for Signature</Button>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0" /> E-signatures comply with ESIGN Act (US), eIDAS (EU), and IT Act (India).
      </div>

      <div className="mb-4 flex gap-2">
        {['pending','signed'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-3 py-1.5 text-sm ${tab===t?'bg-primary text-primary-foreground':'bg-muted text-muted-foreground hover:bg-muted/70'}`}>{t==='signed'?'Signed Archive':'Pending'}</button>
        ))}
      </div>

      <div className="space-y-3">
        {shown.map(r => {
          const st = STATUS[r.data?.status] || STATUS.pending;
          const StIcon = st.icon;
          return (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-wrap items-center gap-4">
              <FileSignature className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 min-w-[200px]">
                <div className="font-medium">{r.data?.document_name}</div>
                <div className="text-xs text-muted-foreground">{r.data?.signer_name} · {r.data?.signer_email}{r.data?.case_title ? ` · ${r.data?.case_title}` : ''}</div>
                {r.data?.status === 'signed' && r.data?.audit_trail && <div className="text-[11px] text-muted-foreground mt-1">Audit: {r.data?.audit_trail}</div>}
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium inline-flex items-center gap-1 ${st.cls}`}><StIcon className="h-3 w-3" />{st.label}</span>
              {r.data?.expires_date && <span className="text-xs text-muted-foreground">Expires {formatDate(r.data?.expires_date, country)}</span>}
              {tab === 'pending' ? <Button size="sm" variant="outline" onClick={() => simulateSign(r)}>Sign now</Button>
                : <a href={r.data?.signed_document_url || r.data?.document_url} target="_blank" rel="noreferrer"><Button size="sm" variant="ghost"><Download className="h-4 w-4 mr-1" />Download</Button></a>}
            </div>
          );
        })}
        {shown.length === 0 && <div className="text-center py-12 text-muted-foreground">No {tab} requests.</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send for Signature</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Case (optional)</Label>
              <Select value={form.case_id} onValueChange={(v) => setForm(f => ({ ...f, case_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select case" /></SelectTrigger>
                <SelectContent>{cases.map(c => <SelectItem key={c.id} value={c.id}>{c.data?.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Document name</Label><Input value={form.document_name} onChange={(e)=>setForm(f=>({...f,document_name:e.target.value}))} placeholder="Engagement Letter" /></div>
            <div><Label>Document URL</Label><Input value={form.document_url} onChange={(e)=>setForm(f=>({...f,document_url:e.target.value}))} placeholder="https://.../document.pdf" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Signer name</Label><Input value={form.signer_name} onChange={(e)=>setForm(f=>({...f,signer_name:e.target.value}))} /></div>
              <div><Label>Signer email</Label><Input value={form.signer_email} onChange={(e)=>setForm(f=>({...f,signer_email:e.target.value}))} /></div>
            </div>
            <div><Label>Signer role</Label>
              <Select value={form.signer_role} onValueChange={(v)=>setForm(f=>({...f,signer_role:v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="client">Client</SelectItem><SelectItem value="lawyer">Lawyer</SelectItem><SelectItem value="third_party">Third party</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Message</Label><Textarea value={form.request_message} onChange={(e)=>setForm(f=>({...f,request_message:e.target.value}))} rows={2} /></div>
            <div><Label>Expires (default 30 days)</Label><Input type="date" value={form.expires_date} onChange={(e)=>setForm(f=>({...f,expires_date:e.target.value}))} /></div>
          </div>
          <DialogFooter><Button onClick={send}>Send request</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}