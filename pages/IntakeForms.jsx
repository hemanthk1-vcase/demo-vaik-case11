import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/format';
import { Plus, Copy, Eye, ArrowUp, ArrowDown, Trash2, CheckCircle2 } from 'lucide-react';

const FIELD_TYPES = ['text','email','phone','dropdown','date','checkbox','textarea','file'];
const ORIGIN = window.location.origin;

function FormPreview({ fields }) {
  return (
    <div className="space-y-3">
      {fields.map((f,i) => (
        <div key={i}>
          <Label>{f.label}{f.required && <span className="text-red-500"> *</span>}</Label>
          {f.type === 'textarea' ? <Textarea rows={2} /> : f.type === 'checkbox' ? <input type="checkbox" /> :
            f.type === 'dropdown' ? <Select><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger><SelectContent>{(f.options||[]).map(o=><SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select> :
            <Input type={f.type==='date'?'date':f.type==='email'?'email':'text'} />}
        </div>
      ))}
      {fields.length===0 && <div className="text-muted-foreground text-sm">No fields.</div>}
      <Button className="w-full" disabled>Submit (preview)</Button>
    </div>
  );
}

export default function IntakeForms() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const country = user?.data?.country || 'united_states';
  const [forms, setForms] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('forms');
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ form_name: '', form_description: '', target_entity: 'both', success_message: 'Thank you for your submission.' });
  const [fields, setFields] = useState([]);

  async function load() {
    setLoading(true);
    try {
      const [f, s] = await Promise.all([base44.entities.IntakeForm.list('-created_date', 100), base44.entities.IntakeSubmission.list('-submitted_date', 200)]);
      setForms(f); setSubs(s);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function addField(type) { setFields(fs => [...fs, { id: Date.now()+Math.random(), name: '', label: '', type, required: false, options: '' }]); }
  function updateField(id, key, val) { setFields(fs => fs.map(f => f.id===id?{...f,[key]:val}:f)); }
  function removeField(id) { setFields(fs => fs.filter(f=>f.id!==id)); }
  function move(id, dir) { setFields(fs => { const i=fs.findIndex(f=>f.id===id); if(i<0)return fs; const j=i+dir; if(j<0||j>=fs.length)return fs; const c=[...fs]; [c[i],c[j]]=[c[j],c[i]]; return c; }); }

  async function save() {
    if (!form.form_name) { toast({ variant:'destructive', title:'Form name required' }); return; }
    const clean = fields.map(f => ({ name: f.name || f.label.toLowerCase().replace(/\s+/g,'_'), label: f.label, type: f.type, required: f.required, options: f.options ? f.options.split(',').map(s=>s.trim()) : [] }));
    const created = await base44.entities.IntakeForm.create({ ...form, form_fields: JSON.stringify(clean), is_published: true, public_url: `${ORIGIN}/public/forms/pending`, created_by: user?.full_name });
    await base44.entities.IntakeForm.update(created.id, { public_url: `${ORIGIN}/public/forms/${created.id}` });
    setOpen(false); setForm({ form_name:'', form_description:'', target_entity:'both', success_message:'Thank you for your submission.' }); setFields([]);
    toast({ title: 'Form published' }); load();
  }

  async function convert(sub) {
    try {
      const data = JSON.parse(sub.data?.submitted_data || '{}');
      const client = await base44.entities.Client.create({ full_name: sub.data?.submitter_name || data.full_name || data.name || 'New Client', email: sub.data?.submitter_email || data.email || '', phone: sub.data?.submitter_phone || data.phone || '', status: 'onboarded' });
      await base44.entities.IntakeSubmission.update(sub.id, { status: 'converted', converted_client_id: client.id });
      toast({ title: 'Converted to client' }); load();
    } catch (e) { toast({ variant:'destructive', title:'Conversion failed', description: e.message }); }
  }

  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Intake Forms</h1>
          <p className="text-sm text-muted-foreground mt-1">Build custom intake forms and convert submissions into clients</p>
        </div>
        <Button size="sm" onClick={() => { setForm({ form_name:'', form_description:'', target_entity:'both', success_message:'Thank you for your submission.' }); setFields([]); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />New Form</Button>
      </div>

      <div className="mb-4 flex gap-2">
        {['forms','submissions'].map(t => <button key={t} onClick={()=>setTab(t)} className={`rounded-lg px-3 py-1.5 text-sm capitalize ${tab===t?'bg-primary text-primary-foreground':'bg-muted text-muted-foreground hover:bg-muted/70'}`}>{t}</button>)}
      </div>

      {tab === 'forms' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {forms.map(f => {
            const fSubs = subs.filter(s => s.data?.form_id === f.id);
            const conv = fSubs.filter(s => s.data?.status === 'converted').length;
            return (
              <div key={f.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-heading font-semibold">{f.data?.form_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{f.data?.form_description}</div>
                  </div>
                  <button onClick={()=>setPreview(f)} className="p-1.5 rounded-md hover:bg-muted"><Eye className="h-4 w-4" /></button>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 dark:bg-emerald-950 dark:text-emerald-300">{fSubs.length} submissions</span>
                  <span className="rounded-full bg-muted px-2 py-0.5">{fSubs.length?Math.round(conv/fSubs.length*100):0}% converted</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Input readOnly value={f.data?.public_url || ''} className="text-xs h-8" />
                  <Button size="sm" variant="outline" onClick={()=>{navigator.clipboard?.writeText(f.data?.public_url||''); toast({title:'Link copied'});}}><Copy className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={()=>{navigator.clipboard?.writeText(`<iframe src="${f.data?.public_url}" width="100%" height="600" frameborder="0"></iframe>`); toast({title:'Embed code copied'});}}>Embed</Button>
                </div>
              </div>
            );
          })}
          {forms.length===0 && <div className="text-muted-foreground text-center py-12">No forms yet.</div>}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground"><tr>
              <th className="px-4 py-3 font-medium">Submitted</th><th className="px-4 py-3 font-medium">Form</th><th className="px-4 py-3 font-medium">Submitter</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium"></th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {subs.map(s => (
                <tr key={s.id} className="even:bg-muted/20 hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(s.data?.submitted_date, country)}</td>
                  <td className="px-4 py-3">{s.data?.form_name}</td>
                  <td className="px-4 py-3">{s.data?.submitter_name}<div className="text-xs text-muted-foreground">{s.data?.submitter_email}</div></td>
                  <td className="px-4 py-3 capitalize"><span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{s.data?.status}</span></td>
                  <td className="px-4 py-3 text-right">{s.data?.status === 'new' && <Button size="sm" variant="outline" onClick={()=>convert(s)}><CheckCircle2 className="h-4 w-4 mr-1" />Convert</Button>}</td>
                </tr>
              ))}
              {subs.length===0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No submissions.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Form Builder</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <div><Label>Form name</Label><Input value={form.form_name} onChange={e=>setForm(f=>({...f,form_name:e.target.value}))} /></div>
            <div><Label>Description</Label><Input value={form.form_description} onChange={e=>setForm(f=>({...f,form_description:e.target.value}))} /></div>
            <div><Label>Success message</Label><Input value={form.success_message} onChange={e=>setForm(f=>({...f,success_message:e.target.value}))} /></div>
            <div className="flex flex-wrap gap-2 pt-2">
              {FIELD_TYPES.map(t => <Button key={t} size="sm" variant="outline" onClick={()=>addField(t)}><Plus className="h-3.5 w-3.5 mr-1" />{t}</Button>)}
            </div>
            <div className="space-y-2">
              {fields.map(f => (
                <div key={f.id} className="rounded-lg border border-border p-3 space-y-2 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase px-2 py-0.5 rounded bg-muted">{f.type}</span>
                    <Input placeholder="Label" value={f.label} onChange={e=>updateField(f.id,'label',e.target.value)} className="h-8 flex-1" />
                    <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={f.required} onChange={e=>updateField(f.id,'required',e.target.checked)} />Required</label>
                    <button onClick={()=>move(f.id,-1)} className="p-1 hover:bg-muted rounded"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button onClick={()=>move(f.id,1)} className="p-1 hover:bg-muted rounded"><ArrowDown className="h-3.5 w-3.5" /></button>
                    <button onClick={()=>removeField(f.id)} className="p-1 hover:bg-muted rounded text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <Input placeholder="Field name (key)" value={f.name} onChange={e=>updateField(f.id,'name',e.target.value)} className="h-8" />
                  {f.type === 'dropdown' && <Input placeholder="Options (comma-separated)" value={f.options} onChange={e=>updateField(f.id,'options',e.target.value)} className="h-8" />}
                </div>
              ))}
              {fields.length===0 && <div className="text-sm text-muted-foreground text-center py-4">Add fields using the buttons above.</div>}
            </div>
          </div>
          <div className="flex justify-end pt-2"><Button onClick={save}>Publish form</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!preview} onOpenChange={()=>setPreview(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{preview?.data?.form_name}</DialogTitle></DialogHeader>
          <FormPreview fields={preview?JSON.parse(preview.data?.form_fields||'[]'):[]} />
        </DialogContent>
      </Dialog>
    </div>
  );
}