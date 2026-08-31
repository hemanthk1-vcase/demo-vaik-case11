import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Clock, ShieldX, LogOut } from 'lucide-react';

const COPY = {
  pending: {
    icon: Clock,
    title: 'Account pending approval',
    message: 'Your account is pending admin approval. You will receive an email once approved.',
  },
  rejected: {
    icon: ShieldX,
    title: 'Account rejected',
    message: 'Your account has been rejected. Please contact support.',
  },
};

// Shown by ProtectedRoute when an authenticated user's approval_status blocks
// access — pending (awaiting admin) or rejected. Renders in place of the app
// so a blocked user can't reach any protected page, with a logout action.
export default function AccountStatusGate({ status = 'pending' }) {
  const navigate = useNavigate();
  const { icon: Icon, title, message } = COPY[status] || COPY.pending;

  const handleLogout = async () => {
    try { await base44.auth.logout(); } catch { /* ignore */ }
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" className="mt-6" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" /> Log out
        </Button>
      </div>
    </div>
  );
}