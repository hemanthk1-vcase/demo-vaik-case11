import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, FileText, Gavel, MessageSquare, UserPlus, CreditCard, Info, ShieldAlert } from 'lucide-react';

const TYPE_ICON = {
  case_update: FileText, hearing_reminder: Gavel, message: MessageSquare, new_client: UserPlus,
  payment_due: CreditCard, court_update: Gavel, system: Info, admin: ShieldAlert
};

function timeAgo(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

export default function NotificationBell() {
  const { user } = useCurrentUser();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  async function load() {
    if (!user?.id) return;
    try { setItems(await base44.entities.Notification.filter({ user_id: user.id }, '-created_date', 20)); } catch {}
  }
  useEffect(() => { load(); }, [user?.id]);

  const unread = items.filter((n) => !n.data?.is_read).length;

  async function markAll() {
    try {
      await base44.entities.Notification.updateMany({ user_id: user.id, is_read: false }, { $set: { is_read: true } });
      load();
    } catch {}
  }

  async function markOne(n) {
    try { await base44.entities.Notification.update(n.id, { is_read: true }); load(); } catch {}
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          {unread > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">{unread}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-semibold">Notifications</div>
          <Button variant="ghost" size="sm" onClick={markAll} disabled={unread === 0}><CheckCheck className="h-4 w-4 mr-1.5" />Mark all read</Button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications</div>
          ) : items.map((n) => {
            const d = n.data || {};
            const Icon = TYPE_ICON[d.notification_type] || Bell;
            return (
              <button key={n.id} onClick={() => markOne(n)} className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left hover:bg-muted/40 ${!d.is_read ? 'bg-primary/5' : ''}`}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-medium">{d.title}</span>{!d.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}</div>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{d.message}</p>
                  <div className="mt-1 text-[10px] text-muted-foreground">{timeAgo(n.created_date)}</div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="border-t border-border p-2">
          <Button asChild variant="ghost" size="sm" className="w-full" onClick={() => setOpen(false)}><Link to="/notifications">View all</Link></Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}