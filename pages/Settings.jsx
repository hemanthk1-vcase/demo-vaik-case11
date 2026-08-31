import { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useCurrentUser, clearCachedUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

export default function Settings() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [lang, setLang] = useState(user?.data?.preferred_language || 'english');
  const [country, setCountry] = useState(user?.data?.country || 'united_states');
  const [currency, setCurrency] = useState(user?.data?.currency || 'USD');
  const [saving, setSaving] = useState(false);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.auth.updateMe({ preferred_language: lang, country, currency });
      clearCachedUser();
      toast({ title: 'Settings saved' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-8 lg:px-10">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">Manage your language, region, and currency preferences.</p>
      <form onSubmit={save} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-1.5">
          <Label>Language</Label>
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="hindi">Hindi</SelectItem>
              <SelectItem value="kannada">Kannada</SelectItem>
              <SelectItem value="tamil">Tamil</SelectItem>
              <SelectItem value="telugu">Telugu</SelectItem>
              <SelectItem value="spanish">Spanish</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Country / Region</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="united_states">United States</SelectItem>
              <SelectItem value="united_kingdom">United Kingdom</SelectItem>
              <SelectItem value="india">India</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">$ USD</SelectItem>
              <SelectItem value="GBP">£ GBP</SelectItem>
              <SelectItem value="INR">₹ INR</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save preferences'}</Button>
      </form>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Security</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">Manage your password. Passwords expire every 90 days.</p>
        {user?.data?.password_last_changed ? (
          <p className="text-xs text-muted-foreground mb-4">
            Last changed {new Date(user.data.password_last_changed).toLocaleDateString()}.{' '}
            {(() => {
              const remaining = 90 - Math.floor((Date.now() - new Date(user.data.password_last_changed).getTime()) / 86400000);
              if (remaining <= 0) return <span className="text-destructive font-medium">Expired — please change it now.</span>;
              return <>Expires in {remaining} day{remaining === 1 ? '' : 's'}.</>;
            })()}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mb-4">No password change recorded yet.</p>
        )}
        <Button asChild variant="outline"><Link to="/change-password">Change password</Link></Button>
      </div>
    </div>
  );
}