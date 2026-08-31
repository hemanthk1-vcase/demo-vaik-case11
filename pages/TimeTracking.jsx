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
import { formatCurrency, formatDate } from '@/lib/format';
import { Plus } from 'lucide-react';

export default function TimeTracking() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const currency = user?.data?.currency || 'USD';
  const country = user?.data?.country || 'united_states';
  const [entries, setEntries] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ case_id:'', date:new Date().toISOString().slice(0,10), hours:'', description:'', billable:true, rate:'' });

  async function load() {
    setLoading(true);
    try { const [e,c] = await Promise.all([base44.entities.TimeEntry.list('-date', 200), base44.entities.Case.list('-created_date', 200)]); setEntries(e); setCases(c); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, []);

  const totalHours = entries.reduce((s,e)=>s+Number(e.data?.hours||0),0);
  const billableHours = entries.filter(e=>e.data?.billable).reduce((s,e)=>s+Number(e.data?.hours||0),0);
  const unbilledValue = entries.filter(e=>e.data?.billable && !e.data?.is_billed).reduce((s,e)=>s+Number(e.data?.hours||0)*Number(e.data?.rate||0),0);

  async function create() {
    if (!form.case_id || !form.hours) { toast({ variant:'destructive', title:'Case and hours required' }); return; }
    const c = cases.find(x=>x.id===form.case_id);
    await base44.entities.TimeEntry.create({ ...form, hours:Number(form.hours), rate:Number(form.rate)||0, case_title:c?.data?.title||'', user_id:user?.id, lawyer_name:user?.full_name });
    setOpen(false); setForm({ case_id:'', date:new Date().toISOString().slice(0,10), hours:'', description:'', billable:true, rate:'' }); toast({ title:'Time logged' }); load();
  }
  async function toggleBill(e) { await base44.entities.TimeEntry.update(e.id, { is_billed: !e.data?.is_billed }); load(); }

  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Time Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">Log billable hours by case</p>
        </div>
        <Button size="sm" onClick={()=>setOpen(true)}><Plus className="h-4 w-4 mr-1" />Log Time</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="text-xs uppercase text-muted-foreground">Total Hours</div><div className="mt-1 text-2xl font-heading font-semibold">{totalHours.toFixed(1)}</div></div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="text-xs uppercase text-muted-foreground">Billable Hours</div><div className="mt-1 text-2xl font-heading font-semibold">{billableHours.toFixed(1)}</div></div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="text-xs uppercase text-muted-foreground">Unbilled Value</div><div className="mt-1 text-2xl font-heading font-semibold">{formatCurrency(unbilledValue, currency)}</div></div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground"><tr>
            <th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Case</th><th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium text-right">Hours</th><th className="px-4 py-3 font-medium text-right">Rate</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3"></th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {entries.map(e=>(
              <tr key={e.id} className="even:bg-muted/20 hover:bg-muted/30">
                <td className="px-4 py-3 text-muted-foreground">{formatDate(e.data?.date, country)}</td>
                <td className="px-4 py-3">{e.data?.case_title}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.data?.description}</td>
                <td className="px-4 py-3 text-right font-medium">{Number(e.data?.hours||0).toFixed(1)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(e.data?.rate, currency)}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-[11px] ${e.data?.is_billed?'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300':'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>{e.data?.is_billed?'Billed':e.data?.billable?'Unbilled':'Non-bill'}</span></td>
                <td className="px-4 py-3 text-right">{e.data?.billable && !e.data?.is_billed && <Button size="sm" variant="ghost" onClick={()=>toggleBill(e)}>Mark billed</Button>}</td>
              </tr>
            ))}
            {entries.length===0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No time entries.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Time</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Case</Label>
              <Select value={form.case_id} onValueChange={v=>setForm(f=>({...f,case_id:v}))}>
                <SelectTrigger><SelectValue placeholder="Select case" /></SelectTrigger>
                <SelectContent>{cases.map(c=><SelectItem key={c.id} value={c.id}>{c.data?.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date</Label><Input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} /></div>
              <div><Label>Hours</Label><Input type="number" step="0.25" value={form.hours} onChange={e=>setForm(f=>({...f,hours:e.target.value}))} /></div>
            </div>
            <div><Label>Rate ({currency})</Label><Input type="number" value={form.rate} onChange={e=>setForm(f=>({...f,rate:e.target.value}))} placeholder="0" /></div>
            <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.billable} onChange={e=>setForm(f=>({...f,billable:e.target.checked}))} />Billable</label>
          </div>
          <DialogFooter><Button onClick={create}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}