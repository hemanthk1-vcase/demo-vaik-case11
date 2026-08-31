import { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatDate } from '@/lib/format';
import { Landmark, Plus, AlertTriangle, Download, ArrowLeftRight } from 'lucide-react';

function Card({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{title}</div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-1 text-2xl font-heading font-semibold">{value}</div>
    </div>
  );
}

export default function TrustAccounting() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const currency = user?.data?.currency || 'USD';
  const country = user?.data?.country || 'united_states';
  const [accounts, setAccounts] = useState([]);
  const [txns, setTxns] = useState([]);
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState({ type: 'all', caseId: 'all' });
  const [form, setForm] = useState({ trust_account_id: '', case_id: '', client_id: '', transaction_type: 'deposit', amount: '', description: '' });

  async function load() {
    setLoading(true);
    try {
      const [a, t, c, cl] = await Promise.all([
        base44.entities.TrustAccount.list('-created_date', 100),
        base44.entities.TrustTransaction.list('-transaction_date', 200),
        base44.entities.Case.list('-created_date', 100),
        base44.entities.Client.list('-created_date', 100),
      ]);
      setAccounts(a); setTxns(t); setCases(c); setClients(cl);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const trustTotal = accounts.filter(a => a.data?.account_type === 'trust').reduce((s, a) => s + (a.data?.current_balance || 0), 0);
  const opTotal = accounts.filter(a => a.data?.account_type === 'operating').reduce((s, a) => s + (a.data?.current_balance || 0), 0);
  const feeTransfers = txns.filter(t => t.data?.transaction_type === 'fee_transfer').length;
  const negative = accounts.some(a => (a.data?.current_balance || 0) < 0);

  const filtered = useMemo(() => txns.filter((t) => {
    if (filter.type !== 'all' && t.data?.transaction_type !== filter.type) return false;
    if (filter.caseId !== 'all' && t.data?.case_id !== filter.caseId) return false;
    return true;
  }), [txns, filter]);

  async function submit() {
    const acct = accounts.find(a => a.id === form.trust_account_id);
    const c = cases.find(x => x.id === form.case_id);
    const cl = clients.find(x => x.id === form.client_id);
    const amt = Number(form.amount);
    if (!acct || !c || !cl || !amt) { toast({ variant: 'destructive', title: 'Please fill all fields' }); return; }
    const cur = acct.data?.current_balance || 0;
    if ((form.transaction_type === 'withdrawal' || form.transaction_type === 'fee_transfer') && amt > cur) {
      toast({ variant: 'destructive', title: 'Insufficient trust funds', description: 'This transaction exceeds the account balance.' });
      return;
    }
    const delta = form.transaction_type === 'deposit' ? amt : -amt;
    const newBal = cur + delta;
    await base44.entities.TrustTransaction.create({
      trust_account_id: acct.id, account_name: acct.data?.account_name, case_id: c.id, case_title: c.data?.title,
      client_id: cl.id, client_name: cl.data?.full_name, transaction_type: form.transaction_type, amount: amt,
      currency: acct.data?.currency || 'USD', description: form.description, transaction_date: new Date().toISOString(),
      running_balance: newBal, created_by: user?.full_name
    });
    await base44.entities.TrustAccount.update(acct.id, { current_balance: newBal });
    if (form.transaction_type === 'fee_transfer') {
      const op = accounts.find(a => a.data?.account_type === 'operating');
      if (op) await base44.entities.TrustAccount.update(op.id, { current_balance: (op.data?.current_balance || 0) + amt });
    }
    setOpen(false); setForm({ trust_account_id: '', case_id: '', client_id: '', transaction_type: 'deposit', amount: '', description: '' });
    toast({ title: 'Transaction recorded' }); load();
  }

  function exportCSV() {
    const rows = [['Date','Account','Case','Client','Type','Amount','Running Balance','Description'],
      ...filtered.map(t => [formatDate(t.data?.transaction_date, country), t.data?.account_name, t.data?.case_title, t.data?.client_name, t.data?.transaction_type, t.data?.amount, t.data?.running_balance, t.data?.description])];
    const csv = rows.map(r => r.map(c => `"${(c ?? '').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'trust-transactions.csv'; a.click();
  }

  const trustAccts = accounts.filter(a => a.data?.account_type === 'trust');
  const bankBalance = trustTotal;
  const ledgerBalance = txns.filter(t => trustAccts.some(a => a.id === t.data?.trust_account_id)).reduce((s, t) => s + (t.data?.transaction_type === 'deposit' ? (t.data?.amount||0) : -(t.data?.amount||0)), 0);
  const subLedger = {};
  txns.forEach(t => { const k = t.data?.client_id || 'unknown'; subLedger[k] = (subLedger[k] || 0) + (t.data?.transaction_type === 'deposit' ? (t.data?.amount||0) : -(t.data?.amount||0)); });

  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Trust Accounting</h1>
          <p className="text-sm text-muted-foreground mt-1">IOLTA-compliant trust account management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" />Record Transaction</Button>
        </div>
      </div>

      {negative && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          <AlertTriangle className="h-5 w-5 shrink-0" /> Warning: One or more trust accounts has a negative balance. Immediate review required for IOLTA compliance.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card title="Total Trust Held" value={formatCurrency(trustTotal, currency)} icon={Landmark} />
        <Card title="Operating Balance" value={formatCurrency(opTotal, currency)} icon={Landmark} />
        <Card title="Fee Transfers" value={feeTransfers} icon={ArrowLeftRight} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm mb-6">
        <h2 className="font-heading text-base font-semibold mb-3">3-Way Reconciliation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div><div className="text-xs uppercase text-muted-foreground">Bank Balance</div><div className="mt-1 font-heading text-lg font-semibold">{formatCurrency(bankBalance, currency)}</div></div>
          <div><div className="text-xs uppercase text-muted-foreground">Ledger Balance</div><div className="mt-1 font-heading text-lg font-semibold">{formatCurrency(ledgerBalance, currency)}</div></div>
          <div><div className="text-xs uppercase text-muted-foreground">Sub-ledger (Matters)</div><div className="mt-1 font-heading text-lg font-semibold">{Object.keys(subLedger).length} matters</div></div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">Compare Bank vs Ledger vs Client matter balances. Investigate any discrepancy.</div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Select value={filter.type} onValueChange={(v) => setFilter(f => ({ ...f, type: v }))}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="withdrawal">Withdrawal</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="fee_transfer">Fee transfer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.caseId} onValueChange={(v) => setFilter(f => ({ ...f, caseId: v }))}>
          <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cases</SelectItem>
            {cases.map(c => <SelectItem key={c.id} value={c.id}>{c.data?.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Client / Case</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-4 py-3 font-medium text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(t => (
              <tr key={t.id} className="even:bg-muted/20 hover:bg-muted/30">
                <td className="px-4 py-3 text-muted-foreground">{formatDate(t.data?.transaction_date, country)}</td>
                <td className="px-4 py-3">{t.data?.account_name}</td>
                <td className="px-4 py-3">{t.data?.client_name}<div className="text-xs text-muted-foreground">{t.data?.case_title}</div></td>
                <td className="px-4 py-3 capitalize">{t.data?.transaction_type?.replace('_',' ')}</td>
                <td className="px-4 py-3 text-right font-medium">{t.data?.transaction_type === 'deposit' ? '+' : '−'}{formatCurrency(t.data?.amount, t.data?.currency || currency)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(t.data?.running_balance, t.data?.currency || currency)}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No transactions.</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Trust Transaction</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Trust Account</Label>
              <Select value={form.trust_account_id} onValueChange={(v) => setForm(f => ({ ...f, trust_account_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.data?.account_name} ({formatCurrency(a.data?.current_balance, a.data?.currency || currency)})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Case</Label>
              <Select value={form.case_id} onValueChange={(v) => setForm(f => ({ ...f, case_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select case" /></SelectTrigger>
                <SelectContent>{cases.map(c => <SelectItem key={c.id} value={c.id}>{c.data?.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Client</Label>
              <Select value={form.client_id} onValueChange={(v) => setForm(f => ({ ...f, client_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.data?.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Type</Label>
              <Select value={form.transaction_type} onValueChange={(v) => setForm(f => ({ ...f, transaction_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="fee_transfer">Fee Transfer (to operating)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={submit}>Record</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}