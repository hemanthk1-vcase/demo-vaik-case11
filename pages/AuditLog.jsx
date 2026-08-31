import { useEffect, useState, useMemo } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, Download } from 'lucide-react';

const ACTIONS = ['login', 'logout', 'create', 'update', 'delete', 'view', 'verify', 'suspend', 'reject', 'feature'];

export default function AuditLog() {
  const { isAdmin } = useCurrentUser();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '', user: '', action: 'all', entity: '', q: '' });

  async function load() {
    setLoading(true);
    try { setLogs(await base44.entities.AuditLog.list('-created_date', 500)); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => logs.filter((l) => {
    const d = l.data || {};
    const ts = new Date(l.created_date);
    if (filters.from && ts < new Date(filters.from)) return false;
    if (filters.to && ts > new Date(filters.to + 'T23:59:59')) return false;
    if (filters.user && !(d.user_id || '').toLowerCase().includes(filters.user.toLowerCase())) return false;
    if (filters.action !== 'all' && d.action_type !== filters.action) return false;
    if (filters.entity && !(d.entity_type || '').toLowerCase().includes(filters.entity.toLowerCase())) return false;
    if (filters.q && !((d.notes || '') + (d.field_changed || '') + (d.old_value || '') + (d.new_value || '')).toLowerCase().includes(filters.q.toLowerCase())) return false;
    return true;
  }), [logs, filters]);

  function exportCsv() {
    const rows = [['Timestamp', 'User', 'Role', 'Action', 'Entity', 'Entity ID', 'Field', 'Old', 'New', 'Notes']];
    filtered.forEach((l) => {
      const d = l.data || {};
      rows.push([l.created_date, d.user_id, d.user_role, d.action_type, d.entity_type, d.entity_id, d.field_changed, d.old_value, d.new_value, d.notes]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'audit-log.csv'; a.click(); URL.revokeObjectURL(url);
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h1 className="font-heading text-xl font-semibold">Access Denied — Admin Only</h1>
        <p className="text-sm text-muted-foreground mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Audit & Compliance</h1>
          <p className="text-sm text-muted-foreground mt-1">System activity and audit trail.</p>
        </div>
        <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1.5" />Export CSV</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-3 lg:grid-cols-6">
        <Input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
        <Input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
        <Input placeholder="User ID" value={filters.user} onChange={(e) => setFilters((f) => ({ ...f, user: e.target.value }))} />
        <Select value={filters.action} onValueChange={(v) => setFilters((f) => ({ ...f, action: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All actions</SelectItem>{ACTIONS.map((a) => <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="Entity type" value={filters.entity} onChange={(e) => setFilters((f) => ({ ...f, entity: e.target.value }))} />
        <Input placeholder="Search notes…" value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-16">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-muted-foreground">No audit records found.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Role</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Entity</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((l) => {
                const d = l.data || {};
                const details = [d.field_changed, (d.old_value != null && d.old_value !== '') ? `${d.old_value} → ${d.new_value}` : '', d.notes].filter(Boolean).join(' · ');
                return (
                  <tr key={l.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{new Date(l.created_date).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium">{d.user_id}</td>
                    <td className="px-4 py-3 hidden sm:table-cell capitalize text-muted-foreground">{d.user_role || '—'}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium capitalize">{d.action_type}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{d.entity_type || '—'}{d.entity_id ? ` · ${String(d.entity_id).slice(-6)}` : ''}</td>
                    <td className="px-4 py-3 text-muted-foreground">{details || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}