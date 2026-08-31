import { useEffect, useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { LayoutTemplate, Plus, Wand2 } from 'lucide-react';

const TYPES = ['engagement_letter','demand_letter','court_filing','client_update','contract','notice','other'];
const MERGE = ['client_name','case_number','case_title','court_name','lawyer_name','opposing_counsel','judge_name','filing_date','next_hearing_date','amount','date'];
const JURIS = { all:'All', united_states:'United States', united_kingdom:'United Kingdom', india:'India' };

export default function DocumentTemplates() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [tpl, setTpl] = useState(null);
  const [content, setContent] = useState('');
  const [meta, setMeta] = useState({ template_name:'', template_type:'engagement_letter', category:'', jurisdiction:'all', description:'' });
  const quillRef = useRef(null);
  const [gen, setGen] = useState({ template_id:'', case_id:'' });
  const [previewHtml, setPreviewHtml] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [t, c] = await Promise.all([base44.entities.DocumentTemplate.list('-created_date', 200), base44.entities.Case.list('-created_date', 200)]);
      setTemplates(t); setCases(c);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openNew() { setTpl(null); setMeta({ template_name:'', template_type:'engagement_letter', category:'', jurisdiction:'all', description:'' }); setContent(''); setEditOpen(true); }
  function openEdit(t) { setTpl(t); setMeta({ template_name:t.data?.template_name, template_type:t.data?.template_type, category:t.data?.category||'', jurisdiction:t.data?.jurisdiction||'all', description:t.data?.description||'' }); setContent(t.data?.template_content||''); setEditOpen(true); }
  function insertField(f) {
    const ed = quillRef.current?.getEditor?.();
    if (ed) { const r = ed.getSelection?.() || { index: ed.getLength() }; ed.insertText(r.index, `{{${f}}}`); }
    else setContent(c => c + `{{${f}}}`);
  }
  async function save() {
    if (!meta.template_name) { toast({ variant:'destructive', title:'Name required' }); return; }
    if (tpl) { await base44.entities.DocumentTemplate.update(tpl.id, { ...meta, template_content: content }); toast({ title:'Template updated' }); }
    else { await base44.entities.DocumentTemplate.create({ ...meta, template_content: content, is_active: true, is_firmwide: false, created_by: user?.full_name }); toast({ title:'Template created' }); }
    setEditOpen(false); load();
  }

  function buildMap(c) {
    return {
      client_name: c.data?.client_name || '', case_number: c.data?.case_number || '', case_title: c.data?.title || '',
      court_name: c.data?.court_name || '', lawyer_name: c.data?.assigned_lawyer_name || '', opposing_counsel: c.data?.opposing_counsel_name || '',
      judge_name: c.data?.judge_name || '', filing_date: c.data?.filing_date || '', next_hearing_date: c.data?.next_hearing_date || '',
      amount: c.data?.claim_amount || '', date: new Date().toLocaleDateString()
    };
  }
  function populate(html, m) { return html.replace(/\{\{(\w+)\}\}/g, (_,k)=>m[k] ?? ''); }

  async function generate() {
    const t = templates.find(x => x.id === gen.template_id);
    const c = cases.find(x => x.id === gen.case_id);
    if (!t || !c) { toast({ variant:'destructive', title:'Select template and case' }); return; }
    setPreviewHtml(populate(t.data?.template_content || '', buildMap(c)));
  }
  async function saveToCase() {
    const t = templates.find(x => x.id === gen.template_id);
    const c = cases.find(x => x.id === gen.case_id);
    if (!t || !c) return;
    try {
      const file = new File([previewHtml], `${t.data?.template_name}.html`, { type: 'text/html' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.CaseDocument.create({ case_id: c.id, uploaded_by: user?.id, uploaded_by_name: user?.full_name, document_name: t.data?.template_name, document_type: 'other', file_url, description: 'Generated from template', access_level: 'lawyer_only' });
      toast({ title: 'Saved to case documents' }); setGenOpen(false); setPreviewHtml(''); setGen({ template_id:'', case_id:'' });
    } catch (e) { toast({ variant:'destructive', title:'Save failed', description: e.message }); }
  }

  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Document Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Assemble documents from merge-field templates</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={()=>setGenOpen(true)}><Wand2 className="h-4 w-4 mr-1" />Generate</Button>
          <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />New Template</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <div key={t.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] uppercase text-muted-foreground">{t.data?.template_type?.replace('_',' ')}</span>
            </div>
            <div className="mt-2 font-heading font-semibold">{t.data?.template_name}</div>
            <div className="text-xs text-muted-foreground mt-1">{t.data?.category || 'General'} · {JURIS[t.data?.jurisdiction||'all']}</div>
            {t.data?.is_firmwide && <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px]">Firm-wide</span>}
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={()=>openEdit(t)}>Edit</Button>
              {!t.data?.is_firmwide && user?.role==='admin' && <Button size="sm" variant="ghost" onClick={async()=>{ await base44.entities.DocumentTemplate.update(t.id,{is_firmwide:true}); toast({title:'Marked firm-wide'}); load(); }}>Share firm-wide</Button>}
            </div>
          </div>
        ))}
        {templates.length===0 && <div className="text-muted-foreground text-center py-12 col-span-full">No templates.</div>}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{tpl?'Edit Template':'New Template'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={meta.template_name} onChange={e=>setMeta(m=>({...m,template_name:e.target.value}))} /></div>
              <div><Label>Type</Label>
                <Select value={meta.template_type} onValueChange={v=>setMeta(m=>({...m,template_type:v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map(t=><SelectItem key={t} value={t}>{t.replace('_',' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Category</Label><Input value={meta.category} onChange={e=>setMeta(m=>({...m,category:e.target.value}))} placeholder="Family Law" /></div>
              <div><Label>Jurisdiction</Label>
                <Select value={meta.jurisdiction} onValueChange={v=>setMeta(m=>({...m,jurisdiction:v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(JURIS).map(([k,v])=><SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description</Label><Input value={meta.description} onChange={e=>setMeta(m=>({...m,description:e.target.value}))} /></div>
            <div>
              <Label>Merge fields</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {MERGE.map(f => <button key={f} type="button" onClick={()=>insertField(f)} className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs hover:bg-accent">{`{{${f}}}`}</button>)}
              </div>
            </div>
            <div className="rounded-md border border-border">
              <ReactQuill ref={quillRef} theme="snow" value={content} onChange={setContent} />
            </div>
          </div>
          <DialogFooter><Button onClick={save}>Save template</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={genOpen} onOpenChange={setGenOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Generate Document</DialogTitle></DialogHeader>
          {!previewHtml ? (
            <div className="space-y-3">
              <div><Label>Template</Label>
                <Select value={gen.template_id} onValueChange={v=>setGen(g=>({...g,template_id:v}))}>
                  <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                  <SelectContent>{templates.map(t=><SelectItem key={t.id} value={t.id}>{t.data?.template_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Case</Label>
                <Select value={gen.case_id} onValueChange={v=>setGen(g=>({...g,case_id:v}))}>
                  <SelectTrigger><SelectValue placeholder="Select case" /></SelectTrigger>
                  <SelectContent>{cases.map(c=><SelectItem key={c.id} value={c.id}>{c.data?.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={generate}>Preview</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-md border border-border bg-muted/20 p-4 max-h-[50vh] overflow-y-auto text-sm" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={()=>setPreviewHtml('')}>Back</Button>
                <Button onClick={saveToCase}>Save to case documents</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}