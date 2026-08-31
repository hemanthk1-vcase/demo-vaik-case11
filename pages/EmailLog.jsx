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
import { Plus, Search, Link2, Clock } from 'lucide-react';

export default function EmailLog() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const country = user?.data?.country || 'united_states';
  const [emails, setEmails] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [caseFilter, setCaseFilter] = useState('all');
  const [compose, setCompose] = useState(false);
  const [form, setForm] = useState({ case_id:'', recipient_email:'', subject:'', body_text:'' });

  async function load() {
    setLoading(true);
    try {
      const [e, c] = await Promise.all([base44.entities.EmailLog.list('-received_date', 200), base44.entities.Case.list('-created_date', 200)]);
      setEmails(e); setCases(c);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = emails.filter(e => {
    if (caseFilter !== 'all' && e.data?.case_id !== caseFilter) return false;
    if (q) { const s = q.toLowerCase(); return (e.data?.subject||'').toLowerCase().includes(s) || (e.data?.body_text||'').toLowerCase().includes(s); }
    return true;
  });

  async function send() {
    if (!form.recipient_email || !form.subject) { toast({ variant:'destructive', title:'Recipient and subject required' }); return; }
    try {
      await base44.integrations.Core.SendEmail({ to: form.recipient_email, subject: form.subject, body: form.body_text });
      const c = cases.find(x=>x.id===form.case_id);
      await base44.entities.EmailLog.create({ case_id: form.case_id||'', case_title: c?.data?.title||'', direction:'outbound', sender_email: user?.email||'', recipient_email: form.recipient_email, subject: form.subject, body_text: form.body_text, received_date: new Date().toISOString(), created_by: user?.full_name });
      setCompose(false); setForm({case_id:'',recipient_email:'',subject:'',body_text:''}); toast({ title:'Email sent & logged' }); load();
    } catch (e) { toast({ variant:'destructive', title:'Send failed', description: e.message }); }
  }

  async function linkCase(em, caseId) {
    const c = cases.find(x=>x.id===caseId);
    await base44.entities.EmailLog.update(em.id, { case_id: caseId, case_title: c?.data?.title||'' });
    toast({ title:'Linked to case' }); load();
  }

  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Email Log</h1>
          <p className="text-sm text-muted-foreground mt-1">Case email correspondence and communication</p>
        </div>
        <Button size="sm" onClick={()=>setCompose(true)}><Plus className="h-4 w-4 mr-1" />Compose</Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search subjects and bodies…" className="pl-9" />
        </div>
        <Select value={caseFilter} onValueChange={setCaseFilter}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All cases</SelectItem>{cases.map(c=><SelectItem key={c.id} value={c.id}>{c.data?.title}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map(e => (
          <div key={e.id} className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-wrap items-start gap-3">
            <div className={`mt-0.5 rounded-full px-2 py-0.5 text-[10px] uppercase ${e.data?.direction==='inbound'?'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300':'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>{e.data?.direction}</div>
            <div className="flex-1 min-w-[220px]">
              <div className="font-medium">{e.data?.subject || '(no subject)'}</div>
              <div className="text-xs text-muted-foreground">{e.data?.direction==='inbound'?`From ${e.data?.sender_email}`:`To ${e.data?.recipient_email}`} · {formatDate(e.data?.received_date, country)}{e.data?.case_title?` · ${e.data?.case_title}`:''}</div>
              <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{e.data?.body_text}</div>
            </div>
            <div className="flex items-center gap-2">
              {e.data?.is_billable && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{e.data?.time_logged||0}h</span>}
              <Select value={e.data?.case_id||''} onValueChange={(v)=>linkCase(e,v)}>
                <SelectTrigger className="h-8 w-[160px] text-xs"><span className="inline-flex items-center gap-1"><Link2 className="h-3 w-3" />{e.data?.case_title?'Linked':'Link case'}</span></SelectTrigger>
                <SelectContent><SelectItem value={null}>Unlink</SelectItem>{cases.map(c=><SelectItem key={c.id} value={c.id}>{c.data?.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        ))}
        {filtered.length===0 && <div className="text-center py-12 text-muted-foreground">No emails.</div>}
      </div>

      <Dialog open={compose} onOpenChange={setCompose}>
        <DialogContent>
          <DialogHeader><DialogTitle>Compose Email</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Case (optional)</Label>
              <Select value={form.case_id} onValueChange={v=>setForm(f=>({...f,case_id:v}))}>
                <SelectTrigger><SelectValue placeholder="Select case" /></SelectTrigger>
                <SelectContent>{cases.map(c=><SelectItem key={c.id} value={c.id}>{c.data?.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>To</Label><Input value={form.recipient_email} onChange={e=>setForm(f=>({...f,recipient_email:e.target.value}))} /></div>
            <div><Label>Subject</Label><Input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} /></div>
            <div><Label>Body</Label><Textarea rows={5} value={form.body_text} onChange={e=>setForm(f=>({...f,body_text:e.target.value}))} /></div>
          </div>
          <DialogFooter><Button onClick={send}>Send</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}