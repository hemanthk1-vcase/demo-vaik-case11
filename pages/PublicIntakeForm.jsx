import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import Logo from '@/components/Logo';

export default function PublicIntakeForm() {
  const { id } = useParams();
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const f = await base44.entities.IntakeForm.get(id);
        setForm(f); setFields(JSON.parse(f.data?.form_fields || '[]'));
      } catch (e) { setForm(null); }
      finally { setLoading(false); }
    })();
  }, [id]);

  async function submit() {
    try {
      const data = { ...values };
      await base44.entities.IntakeSubmission.create({
        form_id: id, form_name: form?.data?.form_name, submitted_data: JSON.stringify(data),
        submitter_name: data.full_name || data.name || values[Object.keys(values)[0]] || '',
        submitter_email: data.email || '', submitter_phone: data.phone || '',
        status: 'new', submitted_date: new Date().toISOString(), ip_address: ''
      });
      setSubmitted(true);
    } catch (e) { toast({ variant: 'destructive', title: 'Submission failed', description: e.message }); }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  if (!form) return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Form not found.</div>;

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center"><Logo /></div>
        <p className="mt-6 text-lg font-heading">{form.data?.success_message || 'Thank you for your submission.'}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="flex justify-center mb-6"><Logo /></div>
        <div className="rounded-2xl border border-border bg-card shadow-sm p-8">
          <h1 className="font-heading text-xl font-semibold">{form.data?.form_name}</h1>
          {form.data?.form_description && <p className="text-sm text-muted-foreground mt-1">{form.data?.form_description}</p>}
          <div className="space-y-4 mt-6">
            {fields.map((f, i) => {
              const key = f.name || f.label || `field_${i}`;
              return (
                <div key={i}>
                  <Label>{f.label}{f.required && <span className="text-red-500"> *</span>}</Label>
                  {f.type === 'textarea' ? <Textarea rows={3} value={values[key]||''} onChange={e=>setValues(v=>({...v,[key]:e.target.value}))} />
                    : f.type === 'checkbox' ? <input type="checkbox" checked={!!values[key]} onChange={e=>setValues(v=>({...v,[key]:e.target.checked}))} />
                    : f.type === 'dropdown' ? <Select value={values[key]||''} onValueChange={val=>setValues(v=>({...v,[key]:val}))}><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger><SelectContent>{(f.options||[]).map(o=><SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select>
                    : <Input type={f.type==='date'?'date':f.type==='email'?'email':'text'} value={values[key]||''} onChange={e=>setValues(v=>({...v,[key]:e.target.value}))} />}
                </div>
              );
            })}
          </div>
          <Button className="w-full mt-6" onClick={submit}>Submit</Button>
        </div>
      </div>
    </div>
  );
}