import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Briefcase, Receipt, Gavel, Users, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import FounderNote from '@/components/FounderNote';

const CASE_STATUS_COLORS = {
  intake: 'bg-blue-50 text-blue-700',
  conflict_check: 'bg-blue-50 text-blue-700',
  engagement: 'bg-indigo-50 text-indigo-700',
  filed: 'bg-sky-50 text-sky-700',
  discovery: 'bg-violet-50 text-violet-700',
  pre_trial: 'bg-amber-50 text-amber-700',
  trial: 'bg-rose-50 text-rose-700',
  pending_judgment: 'bg-amber-50 text-amber-700',
  closed_won: 'bg-emerald-50 text-emerald-700',
  closed_lost: 'bg-red-50 text-red-700',
  closed_settled: 'bg-emerald-50 text-emerald-700',
  appealed: 'bg-orange-50 text-orange-700',
  dismissed: 'bg-slate-100 text-slate-500',
  active: 'bg-emerald-50 text-emerald-700',
  on_hold: 'bg-amber-50 text-amber-700',
  closed: 'bg-slate-100 text-slate-600',
  won: 'bg-green-50 text-green-700',
  lost: 'bg-red-50 text-red-700'
};

function StatCard({ icon: Icon, label, value, tint }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tint}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 text-3xl font-heading font-semibold tracking-tight">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export default function Home() {
  const { user, role, isStaff, isClient, canSeeFinancials } = useCurrentUser();
  const [stats, setStats] = useState({ cases: 0, active: 0, pendingFees: 0, upcoming: 0, clients: 0 });
  const [recentCases, setRecentCases] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetched sequentially to avoid concurrent request rate limits.
        const cases = await base44.entities.Case.list('-updated_date', 200);
        const fees = await base44.entities.Fee.list('-updated_date', 200);
        let clients = [];
        if (isStaff) clients = await base44.entities.Client.list('-updated_date', 200);

        const TERMINAL = ['closed_won', 'closed_lost', 'closed_settled', 'dismissed', 'closed'];
        const activeCases = cases.filter((c) => !TERMINAL.includes(c.data?.status));
        const pending = fees.filter((f) => f.data?.status && f.data?.status !== 'paid');
        const today = new Date().toISOString().slice(0, 10);
        const upcomingCases = cases
          .filter((c) => c.data?.next_hearing_date && c.data?.next_hearing_date >= today)
          .sort((a, b) => (a.data?.next_hearing_date || '').localeCompare(b.data?.next_hearing_date || ''))
          .slice(0, 6);

        setStats({
          cases: cases.length,
          active: activeCases.length,
          pendingFees: pending.length,
          upcoming: upcomingCases.length,
          clients: clients.length
        });
        setRecentCases(cases.slice(0, 5));
        setUpcoming(upcomingCases);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isStaff]);

  const firstName = (user?.full_name || user?.email || '').split(' ')[0];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Welcome back{firstName ? `, ${firstName}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isClient ? 'Track your cases, documents, and upcoming hearings.' : 'Overview of your practice and active matters.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Briefcase} label={isClient ? 'My Cases' : 'Total Cases'} value={stats.cases} tint="bg-blue-50 text-blue-600" />
        <StatCard icon={TrendingUp} label="Active Matters" value={stats.active} tint="bg-emerald-50 text-emerald-600" />
        {canSeeFinancials && <StatCard icon={Receipt} label="Pending Fees" value={stats.pendingFees} tint="bg-amber-50 text-amber-600" />}
        <StatCard icon={Clock} label="Upcoming Hearings" value={stats.upcoming} tint="bg-violet-50 text-violet-600" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-heading font-semibold">Recent Cases</h2>
            <Link to="/cases" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {loading && <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</div>}
            {!loading && recentCases.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted-foreground">No cases yet.</div>}
            {recentCases.map((c) => (
              <Link key={c.id} to={`/cases/${c.id}`} className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/40 transition-colors">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{c.data?.title || '—'}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.data?.client_name || '—'}{c.data?.case_category ? ` · ${c.data.case_category.replace(/_/g, ' ')}` : ''}</div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${CASE_STATUS_COLORS[c.data?.status] || 'bg-slate-100 text-slate-600'}`}>
                  {(c.data?.status || '').replace('_', ' ')}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-heading font-semibold">Upcoming Hearings</h2>
            <Link to="/court-updates" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {loading && <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</div>}
            {!loading && upcoming.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground/50" />
                No upcoming hearings.
              </div>
            )}
            {upcoming.map((c) => (
              <Link key={c.id} to={`/cases/${c.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors">
                <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                  <span className="text-[10px] uppercase">{c.data?.next_hearing_date ? new Date(c.data.next_hearing_date).toLocaleString('en', { month: 'short' }) : ''}</span>
                  <span className="text-sm font-semibold leading-none">{c.data?.next_hearing_date ? new Date(c.data.next_hearing_date).getDate() : ''}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{c.data?.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{c.data?.client_name || '—'}{c.data?.court_name ? ` · ${c.data.court_name}` : ''}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <FounderNote />
    </div>
  );
}