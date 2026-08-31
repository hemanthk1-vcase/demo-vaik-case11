import { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import { Download, Percent } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const CHART = ['hsl(var(--chart-1))','hsl(var(--chart-2))','hsl(var(--chart-3))','hsl(var(--chart-4))','hsl(var(--chart-5))'];
const TT = { contentStyle: { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: 8, fontSize: 12 } };

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase text-muted-foreground">{label}</div>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="mt-1 text-2xl font-heading font-semibold">{value}</div>
    </div>
  );
}
function Panel({ title, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-heading text-base font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

export default function Reports() {
  const { user } = useCurrentUser();
  const currency = user?.data?.currency || 'USD';
  const [cases, setCases] = useState([]);
  const [fees, setFees] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [time, setTime] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [range, setRange] = useState('all');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      // Fetched sequentially to avoid concurrent request rate limits.
      const c = await base44.entities.Case.list('-created_date', 500);
      setCases(c);
      const f = await base44.entities.Fee.list('-created_date', 500);
      setFees(f);
      const cl = await base44.entities.Client.list('-created_date', 500);
      setClients(cl);
      const t = await base44.entities.Task.list('-created_date', 500);
      setTasks(t);
      const tm = await base44.entities.TimeEntry.list('-created_date', 500);
      setTime(tm);
      const l = await base44.entities.LawyerProfile.list('-created_date', 200);
      setLawyers(l);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const rangeStart = useMemo(() => {
    const now = new Date();
    if (range === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
    if (range === 'quarter') return new Date(now.getFullYear(), Math.floor(now.getMonth()/3)*3, 1);
    if (range === 'year') return new Date(now.getFullYear(), 0, 1);
    return new Date(0);
  }, [range]);

  const inRange = (d) => new Date(d || 0) >= rangeStart;

  const billed = fees.filter(f => inRange(f.data?.issue_date || f.created_date)).reduce((s,f)=>s+Number(f.data?.amount||0),0);
  const collected = fees.filter(f => f.data?.status === 'paid').reduce((s,f)=>s+Number(f.data?.amount_paid||f.data?.amount||0),0);
  const outstanding = fees.filter(f => f.data?.status !== 'paid' && f.data?.status !== 'draft').reduce((s,f)=>s+Number(f.data?.amount||0)-Number(f.data?.amount_paid||0),0);
  const collectionRate = billed > 0 ? Math.round(collected/billed*100) : 0;

  const today = new Date();
  const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
  fees.filter(f => f.data?.status !== 'paid' && f.data?.status !== 'draft' && f.data?.due_date).forEach(f => {
    const days = Math.floor((today - new Date(f.data.due_date))/864e5);
    const owe = Number(f.data?.amount||0) - Number(f.data?.amount_paid||0);
    if (days <= 30) buckets['0-30'] += owe;
    else if (days <= 60) buckets['31-60'] += owe;
    else if (days <= 90) buckets['61-90'] += owe;
    else buckets['90+'] += owe;
  });
  const agingData = Object.entries(buckets).map(([k,v]) => ({ name: k, value: v }));

  const statusData = useMemo(() => {
    const m = {}; cases.forEach(c => { const s = c.data?.status || 'unknown'; m[s] = (m[s]||0)+1; });
    return Object.entries(m).map(([name,value]) => ({ name, value }));
  }, [cases]);

  const catData = useMemo(() => {
    const m = {}; cases.forEach(c => { const s = (c.data?.case_category||'other').replace(/_/g,' '); m[s] = (m[s]||0)+1; });
    return Object.entries(m).map(([name,value]) => ({ name, value }));
  }, [cases]);

  const growthData = useMemo(() => {
    const m = {};
    const key = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    clients.forEach(c => { const k = key(new Date(c.created_date)); m[k] = m[k] || { clients: 0, cases: 0, revenue: 0 }; m[k].clients++; });
    cases.forEach(c => { const k = key(new Date(c.created_date)); m[k] = m[k] || { clients:0, cases:0, revenue:0 }; m[k].cases++; });
    fees.forEach(f => { const k = key(new Date(f.data?.issue_date || f.created_date)); m[k] = m[k] || { clients:0, cases:0, revenue:0 }; m[k].revenue += Number(f.data?.amount||0); });
    return Object.entries(m).sort().map(([name,v]) => ({ name, ...v }));
  }, [cases, clients, fees]);

  const productivity = useMemo(() => lawyers.map(l => {
    const name = l.data?.full_name;
    return {
      name,
      caseCount: cases.filter(c => c.data?.assigned_lawyer_name === name).length,
      taskDone: tasks.filter(t => t.data?.assigned_to_name === name && t.data?.status === 'completed').length,
      hours: time.filter(t => t.data?.lawyer_name === name).reduce((s,t)=>s+Number(t.data?.hours||0),0),
    };
  }), [lawyers, cases, tasks, time]);

  function exportCSV() {
    const rows = [['Metric','Value'], ['Billed', billed], ['Collected', collected], ['Outstanding', outstanding], ['Collection rate %', collectionRate]];
    const csv = rows.map(r=>r.map(c=>`"${c}"`).join(',')).join('\n');
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='reports.csv'; a.click();
  }

  if (loading) return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Firm performance and financial insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="year">This year</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Billed" value={formatCurrency(billed, currency)} />
        <Stat label="Collected" value={formatCurrency(collected, currency)} />
        <Stat label="Outstanding" value={formatCurrency(outstanding, currency)} />
        <Stat label="Collection Rate" value={`${collectionRate}%`} icon={Percent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Panel title="A/R Aging">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={agingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip {...TT} />
              <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Case Status Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((_, i) => <Cell key={i} fill={CHART[i % CHART.length]} />)}
              </Pie>
              <Tooltip {...TT} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Case Category Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip {...TT} />
              <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Firm Growth (clients / cases / revenue)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip {...TT} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="clients" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cases" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Attorney Productivity">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground"><tr>
              <th className="px-3 py-2 font-medium">Lawyer</th><th className="px-3 py-2 font-medium text-right">Cases</th><th className="px-3 py-2 font-medium text-right">Tasks done</th><th className="px-3 py-2 font-medium text-right">Hours</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {productivity.map(p => (
                <tr key={p.name} className="even:bg-muted/20">
                  <td className="px-3 py-2 font-medium">{p.name}</td>
                  <td className="px-3 py-2 text-right">{p.caseCount}</td>
                  <td className="px-3 py-2 text-right">{p.taskDone}</td>
                  <td className="px-3 py-2 text-right">{p.hours.toFixed(1)}</td>
                </tr>
              ))}
              {productivity.length===0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">No data.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}