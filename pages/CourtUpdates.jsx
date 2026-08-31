import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Gavel, Search, Calendar } from 'lucide-react';

const OUTCOME_BADGE = {
  scheduled: 'bg-blue-50 text-blue-700', adjourned: 'bg-amber-50 text-amber-700',
  completed: 'bg-emerald-50 text-emerald-700', order_passed: 'bg-violet-50 text-violet-700', other: 'bg-slate-100 text-slate-600'
};

export default function CourtUpdates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('all');

  async function load() {
    setLoading(true);
    try { setUpdates(await base44.entities.CourtUpdate.list('-hearing_date', 200)); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => updates.filter((u) => {
    if (outcomeFilter !== 'all' && u.data?.outcome !== outcomeFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      return u.data?.case_title?.toLowerCase().includes(q) || u.data?.summary?.toLowerCase().includes(q);
    }
    return true;
  }), [updates, query, outcomeFilter]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 lg:px-10">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Court Updates</h1>
        <p className="text-sm text-muted-foreground mt-1">Hearing logs and proceedings across all cases</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search updates…" className="pl-9" />
        </div>
        <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All outcomes</SelectItem>
            {['scheduled','adjourned','completed','order_passed','other'].map((o) => <SelectItem key={o} value={o} className="capitalize">{o.replace('_',' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? <div className="text-center text-sm text-muted-foreground py-16">Loading…</div> : filtered.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3 text-muted-foreground">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><Gavel className="h-6 w-6" /></div>
          <div>No court updates found.</div>
        </div>
      ) : (
        <ol className="relative border-l border-border ml-2 space-y-6 pl-6">
          {filtered.map((u) => (
            <li key={u.id}>
              <div className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(u.data?.hearing_date).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                {u.data?.judge && ` · ${u.data.judge}`}
                <span className={`rounded-full px-2 py-0.5 capitalize ${OUTCOME_BADGE[u.data?.outcome]}`}>{(u.data?.outcome || '').replace('_',' ')}</span>
              </div>
              <Link to={`/cases/${u.data?.case_id}`} className="mt-1.5 block text-sm font-semibold hover:text-primary">{u.data?.case_title}</Link>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{u.data?.summary}</p>
              {u.data?.next_hearing_date && <div className="mt-1 text-xs text-violet-600 font-medium">Next hearing: {new Date(u.data.next_hearing_date).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</div>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}