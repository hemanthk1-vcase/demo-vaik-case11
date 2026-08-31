import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/format';
import { Plus, CheckCircle2 } from 'lucide-react';

const PRIO = { low:'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', medium:'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300', high:'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300', urgent:'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' };

export default function Tasks() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const country = user?.data?.country || 'united_states';
  const [tasks, setTasks] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title:'', case_id:'', priority:'medium', due_date:'', assigned_to_name:'' });

  async function load() {
    setLoading(true);
    try { const [t,c] = await Promise.all([base44.entities.Task.list('-due_date', 200), base44.entities.Case.list('-created_date', 200)]); setTasks(t); setCases(c); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, []);

  const shown = tasks.filter(t => filter==='all' ? true : t.data?.status===filter);

  async function create() {
    if (!form.title) { toast({ variant:'destructive', title:'Title required' }); return; }
    const c = cases.find(x=>x.id===form.case_id);
    await base44.entities.Task.create({ ...form, case_title: c?.data?.title||'', status:'pending', assigned_to_id: user?.id, assigned_to_name: form.assigned_to_name||user?.full_name });
    setOpen(false); setForm({ title:'', case_id:'', priority:'medium', due_date:'', assigned_to_name:'' }); toast({ title:'Task created' }); load();
  }
  async function setStatus(t, status) { await base44.entities.Task.update(t.id, { status }); load(); }

  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">Track case-related tasks and deadlines</p>
        </div>
        <Button size="sm" onClick={()=>setOpen(true)}><Plus className="h-4 w-4 mr-1" />New Task</Button>
      </div>
      <div className="mb-4 flex gap-2">
        {['all','pending','in_progress','completed'].map(s => <button key={s} onClick={()=>setFilter(s)} className={`rounded-lg px-3 py-1.5 text-sm capitalize ${filter===s?'bg-primary text-primary-foreground':'bg-muted text-muted-foreground hover:bg-muted/70'}`}>{s.replace('_',' ')}</button>)}
      </div>
      <div className="space-y-2">
        {shown.map(t => (
          <div key={t.id} className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-wrap items-center gap-3">
            <button onClick={()=>setStatus(t, t.data?.status==='completed'?'pending':'completed')} className={`rounded-full h-5 w-5 border-2 flex items-center justify-center shrink-0 ${t.data?.status==='completed'?'border-emerald-500 bg-emerald-500':'border-border'}`}><CheckCircle2 className="h-3 w-3 text-white" /></button>
            <div className="flex-1 min-w-[180px]">
              <div className={`font-medium ${t.data?.status==='completed'?'line-through text-muted-foreground':''}`}>{t.data?.title}</div>
              <div className="text-xs text-muted-foreground">{t.data?.case_title} · Due {formatDate(t.data?.due_date, country)} · {t.data?.assigned_to_name}</div>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[11px] ${PRIO[t.data?.priority||'medium']}`}>{t.data?.priority}</span>
            {t.data?.status!=='completed' && <Select value={t.data?.status} onValueChange={v=>setStatus(t,v)}>
              <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="in_progress">In progress</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent>
            </Select>}
          </div>
        ))}
        {shown.length===0 && <div className="text-center py-12 text-muted-foreground">No tasks.</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></div>
            <div><Label>Case</Label>
              <Select value={form.case_id} onValueChange={v=>setForm(f=>({...f,case_id:v}))}>
                <SelectTrigger><SelectValue placeholder="Select case" /></SelectTrigger>
                <SelectContent>{cases.map(c=><SelectItem key={c.id} value={c.id}>{c.data?.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Priority</Label>
                <Select value={form.priority} onValueChange={v=>setForm(f=>({...f,priority:v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['low','medium','high','urgent'].map(p=><SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Due date</Label><Input type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} /></div>
            </div>
            <div><Label>Assign to</Label><Input value={form.assigned_to_name} onChange={e=>setForm(f=>({...f,assigned_to_name:e.target.value}))} placeholder={user?.full_name} /></div>
          </div>
          <DialogFooter><Button onClick={create}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}