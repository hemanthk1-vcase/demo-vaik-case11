import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useCurrentUser, clearCachedUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { KeyRound, Eye, EyeOff, Check, X } from 'lucide-react';

const rules = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { label: 'One number', test: (v) => /[0-9]/.test(v) },
  { label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export default function ChangePassword() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const forced = new URLSearchParams(location.search).get('forced') === '1';
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const allRulesPassed = rules.every((r) => r.test(next));
  const match = next === confirm && confirm.length > 0;
  const canSubmit = current.length > 0 && next.length > 0 && confirm.length > 0 && allRulesPassed && match && !busy;

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!allRulesPassed) { setError('New password does not meet all the requirements.'); return; }
    if (next !== confirm) { setError('New password and confirmation do not match.'); return; }
    setBusy(true);
    try {
      await base44.auth.changePassword({ userId: user.id, currentPassword: current, newPassword: next });
      await base44.auth.updateMe({ password_last_changed: new Date().toISOString() });
      clearCachedUser();
      toast({ title: 'Password changed successfully.' });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = (err?.message || '').toLowerCase();
      const wrongCurrent = /(password|credential|current|unauthorized)/.test(msg) || err?.status === 401 || err?.statusCode === 401;
      setError(wrongCurrent ? 'Current password is incorrect.' : 'Failed to change password. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-8 lg:px-10">
      <div className="flex items-center gap-2 mb-1">
        <KeyRound className="h-5 w-5 text-primary" />
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Change password</h1>
      </div>
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        {forced ? 'Your password has expired. Please set a new password to continue using VakilCase.' : 'Choose a strong password. Passwords expire every 90 days for your security.'}
      </p>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-1.5">
          <Label htmlFor="current">Current password</Label>
          <div className="relative">
            <Input id="current" type={show ? 'text' : 'password'} value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Toggle password visibility">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new">New password</Label>
          <Input id="new" type={show ? 'text' : 'password'} value={next} onChange={(e) => setNext(e.target.value)} required autoComplete="new-password" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input id="confirm" type={show ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
          {confirm.length > 0 && !match && <p className="text-xs text-destructive">Passwords do not match.</p>}
        </div>
        <div className="rounded-md border border-border bg-muted/30 p-3 space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Password requirements</p>
          {rules.map((r) => {
            const ok = r.test(next);
            return (
              <div key={r.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-40" />}
                {r.label}
              </div>
            );
          })}
        </div>
        <Button type="submit" className="w-full" disabled={!canSubmit}>{busy ? 'Saving…' : 'Update password'}</Button>
      </form>
    </div>
  );
}