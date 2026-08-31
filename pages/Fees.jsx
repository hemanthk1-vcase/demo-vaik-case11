import { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Search, Receipt, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/format';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'partial', label: 'Partial' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' }
];

const STATUS_BADGE = {
  paid: 'bg-emerald-50 text-emerald-700',
  partial: 'bg-yellow-50 text-yellow-700',
  sent: 'bg-yellow-50 text-yellow-700',
  overdue: 'bg-red-50 text-red-700',
  draft: 'bg-slate-100 text-slate-500',
  cancelled: 'bg-slate-100 text-slate-500'
};

const CURRENCY_SYMBOL = { USD: '$', GBP: '£', INR: '₹' };

const today = () => new Date().toISOString().slice(0, 10);

const emptyItem = () => ({ description: '', quantity: 1, unit_price: 0 });

// Auto-generate INV-YYYY-XXXX
function nextInvoiceNumber(invoices) {
  const year = new Date().getFullYear();
  let max = 0;
  (invoices || []).forEach((i) => {
    const n = i?.data?.invoice_number || i?.invoice_number;
    if (n) {
      const m = n.match(/^INV-(\d{4})-(\d+)$/);
      if (m && Number(m[1]) === year) max = Math.max(max, Number(m[2]));
    }
  });
  return `INV-${year}-${String(max + 1).padStart(4, '0')}`;
}

export default function Fees() {
  const { user, isStaff, canSeeFinancials } = useCurrentUser();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ case_id: '', client_name: '', case_number: '', issue_date: today(), due_date: '', notes: '', status: 'draft' });
  const [items, setItems] = useState([emptyItem()]);

  const currency = user?.data?.currency || 'USD';
  const symbol = CURRENCY_SYMBOL[currency] || '$';

  async function load() {
    setLoading(true);
    try {
      const [inv, cs] = await Promise.all([
        base44.entities.Fee.list('-created_date', 200),
        base44.entities.Case.list('-updated_date', 200)
      ]);
      setInvoices(inv);
      setCases(cs);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => invoices.filter((i) => {
    if (!query) return true;
    const d = i.data || {};
    const q = query.toLowerCase();
    return d.invoice_number?.toLowerCase().includes(q) || d.case_number?.toLowerCase().includes(q) || d.client_name?.toLowerCase().includes(q);
  }), [invoices, query]);

  const total = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onCaseChange = (caseId) => {
    const cs = cases.find((c) => c.id === caseId);
    setForm((f) => ({
      ...f,
      case_id: caseId,
      client_id: cs?.data?.client_id || '',
      client_name: cs?.data?.client_name || '',
      case_number: cs?.data?.case_number || ''
    }));
  };

  const updateItem = (i, k, v) => setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  const addItem = () => setItems((arr) => [...arr, emptyItem()]);
  const removeItem = (i) => setItems((arr) => arr.filter((_, idx) => idx !== i));

  async function submit(e) {
    e.preventDefault();
    if (!form.case_id) { toast({ variant: 'destructive', title: 'Case is required' }); return; }
    if (!form.issue_date) { toast({ variant: 'destructive', title: 'Issue date is required' }); return; }
    if (!form.due_date) { toast({ variant: 'destructive', title: 'Due date is required' }); return; }
    const lineItems = items.filter((it) => it.description || Number(it.quantity) || Number(it.unit_price));
    if (lineItems.length === 0) { toast({ variant: 'destructive', title: 'Add at least one line item' }); return; }
    setSaving(true);
    try {
      const invoice_number = nextInvoiceNumber(invoices);
      await base44.entities.Fee.create({
        invoice_number,
        case_id: form.case_id,
        case_number: form.case_number,
        case_title: cases.find((c) => c.id === form.case_id)?.data?.title || '',
        client_id: form.client_id || undefined,
        client_name: form.client_name,
        amount: Number(total.toFixed(2)),
        currency,
        issue_date: form.issue_date,
        due_date: form.due_date,
        items: JSON.stringify(lineItems),
        notes: form.notes || undefined,
        status: form.status
      });
      toast({ title: 'Invoice created successfully', description: `Invoice number ${invoice_number}` });
      setForm({ case_id: '', client_name: '', case_number: '', issue_date: today(), due_date: '', notes: '', status: 'draft' });
      setItems([emptyItem()]);
      setOpen(false);
      load();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not create invoice', description: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and track invoices for your cases.</p>
        </div>
        {isStaff && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" /> Create Invoice</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create invoice</DialogTitle></DialogHeader>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5"><Label>Case *</Label>
                  <Select value={form.case_id} onValueChange={onCaseChange}>
                    <SelectTrigger><SelectValue placeholder="Select case" /></SelectTrigger>
                    <SelectContent>
                      {cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.data?.case_number ? `${c.data.case_number} · ` : ''}{c.data?.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Client</Label>
                  <Input value={form.client_name} readOnly placeholder="Auto-filled from case" className="bg-muted/40" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Issue date *</Label>
                    <Input type="date" value={form.issue_date} onChange={(e) => set('issue_date', e.target.value)} required />
                  </div>
                  <div className="space-y-1.5"><Label>Due date *</Label>
                    <Input type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Line items</Label>
                  <div className="space-y-2">
                    {items.map((it, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center">
                        <Input className="col-span-5" value={it.description} onChange={(e) => updateItem(i, 'description', e.target.value)} placeholder="Description" />
                        <Input className="col-span-2" type="number" min="0" step="1" value={it.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} placeholder="Qty" />
                        <Input className="col-span-3" type="number" min="0" step="0.01" value={it.unit_price} onChange={(e) => updateItem(i, 'unit_price', e.target.value)} placeholder="Unit price" />
                        <div className="col-span-1 text-right text-xs text-muted-foreground">{symbol}{((Number(it.quantity) || 0) * (Number(it.unit_price) || 0)).toFixed(0)}</div>
                        <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1} className="col-span-1 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="h-3.5 w-3.5 mr-1" /> Add line item</Button>
                </div>
                <div className="space-y-1.5"><Label>Amount (auto-calculated)</Label>
                  <Input value={`${symbol}${total.toFixed(2)}`} readOnly className="bg-muted/40 font-medium" />
                </div>
                <div className="space-y-1.5"><Label>Notes</Label>
                  <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} />
                </div>
                <div className="space-y-1.5"><Label>Payment status</Label>
                  <Select value={form.status} onValueChange={(v) => set('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create invoice'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search invoices…" className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-16">Loading invoices…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3 text-muted-foreground">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><Receipt className="h-6 w-6" /></div>
          <div>No invoices found.</div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice Number</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Case Number</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Client Name</th>
                  {canSeeFinancials && <th className="px-4 py-3 font-medium">Amount</th>}
                  <th className="px-4 py-3 font-medium">Payment Status</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Issue Date</th>
                  <th className="px-4 py-3 font-medium hidden xl:table-cell">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((inv) => {
                  const d = inv.data || {};
                  const statusLabel = STATUS_OPTIONS.find((s) => s.value === d.status)?.label || d.status;
                  return (
                    <tr key={inv.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{d.invoice_number || '—'}</td>
                      <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs">{d.case_number || '—'}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{d.client_name || '—'}</td>
                      {canSeeFinancials && <td className="px-4 py-3 font-medium">{CURRENCY_SYMBOL[d.currency] || symbol}{Number(d.amount || 0).toFixed(2)}</td>}
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_BADGE[d.status] || 'bg-slate-100 text-slate-500'}`}>{statusLabel}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{d.issue_date ? formatDate(d.issue_date, user?.data?.country || 'united_states') : '—'}</td>
                      <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">{d.due_date ? formatDate(d.due_date, user?.data?.country || 'united_states') : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}