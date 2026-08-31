import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useCurrentUser, clearCachedUser } from '@/hooks/useCurrentUser';
import { Scale, LayoutDashboard, Briefcase, Users, Receipt, Menu, X, LogOut, KeyRound, UserCog, Globe, BookOpen, Quote, Settings as SettingsIcon, ShieldCheck, FileText, MessageSquare, Bell, ScrollText, LayoutTemplate, ClipboardList, Landmark, Clock, ListTodo, FileSignature, Mail, BarChart3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import SidebarLogo from '@/components/SidebarLogo';
import PasswordExpiryBanner from '@/components/PasswordExpiryBanner';
import NotificationBell from '@/components/NotificationBell';
import ThemeToggle from '@/components/ThemeToggle';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['client', 'lawyer', 'senior_lawyer', 'admin'] },
  { to: '/clients', label: 'Clients', icon: Users, roles: ['lawyer', 'senior_lawyer', 'admin'] },
  { to: '/cases', label: 'Cases', icon: Briefcase, roles: ['client', 'lawyer', 'senior_lawyer', 'admin'] },
  { to: '/documents', label: 'Documents', icon: FileText, roles: ['client', 'lawyer', 'senior_lawyer', 'admin'] },
  { to: '/document-templates', label: 'Document Templates', icon: LayoutTemplate, roles: ['lawyer', 'senior_lawyer', 'admin'] },
  { to: '/messages', label: 'Messages', icon: MessageSquare, roles: ['client', 'lawyer', 'senior_lawyer', 'admin'] },
  { to: '/intake-forms', label: 'Intake Forms', icon: ClipboardList, roles: ['lawyer', 'senior_lawyer', 'admin'] },
  { to: '/fees', label: 'Invoices', icon: Receipt, roles: ['client', 'lawyer', 'senior_lawyer', 'admin'] },
  { to: '/trust-accounting', label: 'Trust Accounting', icon: Landmark, roles: ['lawyer', 'senior_lawyer', 'admin'] },
  { to: '/time-tracking', label: 'Time Tracking', icon: Clock, roles: ['lawyer', 'senior_lawyer', 'admin'] },
  { to: '/tasks', label: 'Tasks', icon: ListTodo, roles: ['lawyer', 'senior_lawyer', 'admin'] },
  { to: '/e-signature', label: 'E-Signature', icon: FileSignature, roles: ['lawyer', 'senior_lawyer', 'admin'] },
  { to: '/email-log', label: 'Email Log', icon: Mail, roles: ['lawyer', 'senior_lawyer', 'admin'] },
  { to: '/reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['lawyer', 'senior_lawyer', 'admin'] },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['client', 'lawyer', 'senior_lawyer', 'admin'] },
  { to: '/stories', label: 'Brand Story', icon: BookOpen, roles: ['client', 'lawyer', 'senior_lawyer', 'admin'] },
  { to: '/founders-note', label: "Founder's Note", icon: Quote, roles: ['client', 'lawyer', 'senior_lawyer', 'admin'] },
  { to: '/find-a-lawyer', label: 'Find a Lawyer', icon: Scale, roles: ['client', 'lawyer', 'senior_lawyer', 'admin'] },
  { to: '/lawyer-management', label: 'Lawyer Management', icon: ShieldCheck, roles: ['admin'] },
  { to: '/audit-log', label: 'Audit & Compliance', icon: ScrollText, roles: ['admin'] },
  { to: '/users', label: 'Admin Panel', icon: UserCog, roles: ['admin'] },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, roles: ['client', 'lawyer', 'senior_lawyer', 'admin'] }
];

const ROLE_LABEL = {
  client: 'Client',
  lawyer: 'Lawyer',
  senior_lawyer: 'Senior Lawyer',
  admin: 'Administrator',
  solo: 'Solo'
};

const LANGS = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'spanish', label: 'Spanish' }
];

const CURRENCIES = [
  { value: 'USD', label: '$ USD' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'INR', label: '₹ INR' }
];

function LanguageSelector() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [value, setValue] = useState(user?.data?.preferred_language || 'english');

  const onChange = async (v) => {
    if (v !== 'english') {
      toast({ title: 'Coming soon', description: `${LANGS.find((l) => l.value === v)?.label} support is coming soon. Staying on English.` });
      return;
    }
    setValue('english');
    try { await base44.auth.updateMe({ preferred_language: 'english' }); } catch { /* ignore */ }
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-[130px] text-xs"><Globe className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
      <SelectContent>
        {LANGS.map((l) => (
          <SelectItem key={l.value} value={l.value}>
            {l.label}{l.value !== 'english' && <span className="ml-1.5 text-[10px] text-muted-foreground">soon</span>}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CurrencySelector() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [value, setValue] = useState(user?.data?.currency || 'USD');

  const onChange = async (v) => {
    setValue(v);
    try {
      await base44.auth.updateMe({ currency: v });
      toast({ title: 'Currency updated' });
    } catch { /* ignore */ }
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-[100px] text-xs"><SelectValue /></SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export default function Layout() {
  const { user, role, loading } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user?.id) return;
    base44.entities.Message.filter({ recipient_id: user.id, is_read: false })
      .then((m) => setUnreadMsgs(m.length))
      .catch(() => {});
  }, [user?.id, location.pathname]);

  const navRole = role === 'solo' ? 'admin' : role;
  const items = NAV.filter((n) => n.roles.includes(navRole));

  const lastChanged = user?.data?.password_last_changed;
  const passwordExpired = !!lastChanged && (Date.now() - new Date(lastChanged).getTime()) > 90 * 86400000;
  if (passwordExpired && location.pathname !== '/change-password') {
    return <Navigate to="/change-password?forced=1" replace />;
  }

  const handleLogout = async () => {
    clearCachedUser();
    try { await base44.auth.logout(); } catch { /* ignore */ }
    window.location.href = '/login';
  };

  const initials = (user?.full_name || user?.email || 'U').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="px-6 py-5 border-b border-sidebar-border">
        <SidebarLogo />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
              {item.to === '/messages' && unreadMsgs > 0 && (
                <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">{unreadMsgs}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 py-3">
        <p className="px-3 mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Website</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-3">
          <NavLink to="/features" className="text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground">Features</NavLink>
          <NavLink to="/pricing" className="text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground">Pricing</NavLink>
          <NavLink to="/about" className="text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground">About</NavLink>
          <NavLink to="/" end className="text-xs text-sidebar-foreground/60 hover:text-sidebar-foreground">Visit site</NavLink>
        </div>
      </div>

      <div className="border-t border-sidebar-border p-3 space-y-2">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{user?.full_name || user?.email}</div>
            <div className="text-[11px] text-muted-foreground">{ROLE_LABEL[role]}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
        <NavLink
          to="/change-password"
          onClick={() => setOpen(false)}
          className="flex w-full items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <KeyRound className="h-4 w-4" />
          Change password
        </NavLink>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative w-64 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-xl">
            <button className="absolute right-3 top-5 p-1 text-muted-foreground" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-3 border-b border-border bg-background px-4 sm:px-6 h-12 shadow-sm">
          <button onClick={() => setOpen(true)} className="lg:hidden p-1.5 rounded-md hover:bg-muted">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            <NotificationBell />
            <LanguageSelector />
            <CurrencySelector />
          </div>
        </header>

        <main key={location.pathname} className="flex-1 overflow-y-auto">
          {location.pathname !== '/change-password' && <PasswordExpiryBanner />}
          <Outlet />
        </main>
      </div>
    </div>
  );
}