import { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, CheckCheck, FileText, Gavel, MessageSquare, UserPlus, CreditCard, Info, ShieldAlert } from 'lucide-react';

const TYPE_ICON = {
  case_update: FileText, hearing_reminder: Gavel, message: MessageSquare, new_client: UserPlus,
  payment_due: CreditCard, court_update: Gavel, system: Info, admin: ShieldAlert
};

export default function Notifications() {
  const { user } = useCurrentUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');

  async function load() {
    setLoading(true);
    try { setItems(await base44.entities.Notification.filter({ user_id: user.id }, '-created_date', 200)); }
    finally { setLoading(false); }
  }
  useEffect(() => { if (user?.id) load(); }, [user?.id]);

  const filtered = useMemo(() => items.filter((n) => typeFilter === 'all' || n.data?.notification_type === typeFilter), [items, typeFilter]);

  async function markAll() {
    try { await base44.entities.Notification.updateMany({ user_id: user.id, is_read: false }, { $set: { is_read: true } }); load(); } catch {}
  }
  async function toggle(n) {
    try { await base44.entities.Notification.update(n.id, { is_read: !n.data?.is_read }); load(); } catch {}
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">Your recent activity and alerts.</p>
        </div>
        <Button variant="outline" onClick={markAll}><CheckCheck className="h-4 w-4 mr-1.5" />Mark all read</Button>
      </div>

      <div className="mb-5">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.keys(TYPE_ICON).map((t) => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-16">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3 text-muted-foreground">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><Bell className="h-6 w-6" /></div>
          <div>No notifications.</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const d = n.data || {};
            const Icon = TYPE_ICON[d.notification_type] || Bell;
            return (
              <button key={n.id} onClick={() => toggle(n)} className={`flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm hover:shadow-md transition ${!d.is_read ? 'border-primary/30 bg-primary/5' : ''}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2"><span className="text-sm font-medium">{d.title}</span>{!d.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}</div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{d.message}</p>
                  <div className="mt-1 text-[11px] text-muted-foreground">{new Date(n.created_date).toLocaleString()}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}