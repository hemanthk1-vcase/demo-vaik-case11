import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus, Shield, Clock, Check, X } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const ROLE_LABEL = { client: 'Client', lawyer: 'Lawyer', senior_lawyer: 'Senior Lawyer', admin: 'Administrator', solo: 'Solo' };
const ROLE_BADGE = {
  client: 'bg-slate-100 text-slate-700', lawyer: 'bg-blue-50 text-blue-700',
  senior_lawyer: 'bg-violet-50 text-violet-700', admin: 'bg-amber-50 text-amber-700',
  solo: 'bg-cyan-50 text-cyan-700'
};

export default function Users() {
  const { toast } = useToast();
  const { user: currentUser } = useCurrentUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('lawyer');
  const [inviting, setInviting] = useState(false);
  const [actingId, setActingId] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const [tab, setTab] = useState(urlParams.get('tab') === 'pending' ? 'pending' : 'all');

  async function load() {
    setLoading(true);
    try { setUsers(await base44.entities.User.list()); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function invite(e) {
    e.preventDefault();
    if (!email) return;
    setInviting(true);
    try {
      const platformRole = (role === 'admin' || role === 'solo') ? 'admin' : 'user';
      await base44.users.inviteUser(email, platformRole);
      toast({ title: 'Invitation sent', description: `${email} invited as ${ROLE_LABEL[role]}. Set their role after they join.` });
      setEmail(''); setOpen(false); load();
    } catch (err) { toast({ variant: 'destructive', title: 'Invitation failed', description: err.message }); }
    finally { setInviting(false); }
  }

  async function changeRole(u, newRole) {
    try {
      // Solo = platform admin (full access incl. user management) + 'solo' display marker.
      const payload = newRole === 'solo' ? { role: 'admin', role_type: 'solo' } : { role: newRole, role_type: newRole };
      await base44.entities.User.update(u.id, payload);
      toast({ title: 'Role updated successfully', description: `${u.full_name || u.email} is now ${ROLE_LABEL[newRole]}` });
      load();
    } catch (err) { toast({ variant: 'destructive', title: 'Failed to update role', description: err.message }); }
  }

  async function setApproval(u, status) {
    setActingId(u.id);
    try {
      await base44.entities.User.update(u.id, { approval_status: status });
      const name = u.full_name || u.email;
      if (status === 'approved') {
        try {
          await base44.integrations.Core.SendEmail({
            to: u.email,
            subject: 'Your VakilCase account has been approved',
            body: `Hi ${name},\n\nYour VakilCase account has been approved. You can now log in at app.vakilcase.com.\n\n— VakilCase`
          });
        } catch { /* notification is best-effort */ }
        toast({ title: 'User approved', description: `${name} can now access the app` });
      } else {
        try {
          await base44.integrations.Core.SendEmail({
            to: u.email,
            subject: 'Your VakilCase account registration has been declined',
            body: `Hi ${name},\n\nYour VakilCase account registration has been declined.\n\n— VakilCase`
          });
        } catch { /* notification is best-effort */ }
        toast({ title: 'User rejected', description: `${name} has been notified and rejected` });
      }
      load();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Action failed', description: err.message });
    } finally { setActingId(null); }
  }

  const pendingUsers = users.filter((u) => {
    // User custom fields (approval_status, role_type, auth_method) live at the
    // top level of the record (u.approval_status), NOT under u.data (which is
    // null). Reading u.data?.approval_status always returns undefined.
    const s = u.approval_status ?? u.data?.approval_status;
    const isPending = s === 'pending' || s == null;
    const isAdmin = u.role === 'admin' || u.role_type === 'admin' || u.data?.role_type === 'admin';
    const isSelf = currentUser?.id && u.id === currentUser.id;
    return isPending && !isAdmin && !isSelf;
  });

  const renderTable = (rows, showApprovals = false) => (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3 font-medium">Name</th>
            <th className="px-5 py-3 font-medium hidden sm:table-cell">Email</th>
            {showApprovals && <th className="px-5 py-3 font-medium hidden md:table-cell">Auth method</th>}
            {showApprovals && <th className="px-5 py-3 font-medium hidden md:table-cell">Signed up</th>}
            <th className="px-5 py-3 font-medium">Role</th>
            {showApprovals && <th className="px-5 py-3 font-medium text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((u) => {
            const r = (u.role_type || u.data?.role_type) === 'solo'
              ? 'solo'
              : (['client', 'lawyer', 'senior_lawyer', 'admin'].includes(u.role) ? u.role : (u.role_type || u.data?.role_type || 'client'));
            return (
              <tr key={u.id} className="hover:bg-muted/30">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {(u.full_name || u.email || 'U').split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <span className="font-medium">{u.full_name || u.email}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 hidden sm:table-cell text-muted-foreground">{u.email}</td>
                {showApprovals && <td className="px-5 py-3.5 hidden md:table-cell text-muted-foreground capitalize">{u.auth_method || u.data?.auth_method || '—'}</td>}
                {showApprovals && <td className="px-5 py-3.5 hidden md:table-cell text-muted-foreground">{u.created_date ? new Date(u.created_date).toLocaleDateString() : '—'}</td>}
                <td className="px-5 py-3.5">
                  <Select value={r} onValueChange={(v) => changeRole(u, v)}>
                    <SelectTrigger className="h-7 w-[140px] text-[11px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="lawyer">Lawyer</SelectItem>
                      <SelectItem value="senior_lawyer">Senior Lawyer</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="solo">Solo</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                {showApprovals && (
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="default" disabled={actingId === u.id} onClick={() => setApproval(u, 'approved')}>
                        <Check className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" disabled={actingId === u.id} onClick={() => setApproval(u, 'rejected')}>
                        <X className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr><td colSpan={showApprovals ? 6 : 3} className="px-5 py-10 text-center text-sm text-muted-foreground">No users to show.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage firm members, roles, and signup approvals</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><UserPlus className="h-4 w-4 mr-1.5" /> Invite user</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Invite a new user</DialogTitle></DialogHeader>
            <form onSubmit={invite} className="space-y-4">
              <div className="space-y-1.5"><Label>Email address *</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@firm.com" /></div>
              <div className="space-y-1.5"><Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="lawyer">Lawyer</SelectItem>
                    <SelectItem value="senior_lawyer">Senior Lawyer</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="solo">Solo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={inviting}>{inviting ? 'Sending…' : 'Send invite'}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? <div className="text-center text-sm text-muted-foreground py-16">Loading…</div> : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all"><Shield className="h-4 w-4 mr-1.5" /> All users</TabsTrigger>
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-1.5" /> Pending approvals
              {pendingUsers.length > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-semibold text-white">{pendingUsers.length}</span>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">{renderTable(users, false)}</TabsContent>
          <TabsContent value="pending">
            {pendingUsers.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card py-16 text-center">
                <Check className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No pending signup approvals. You're all caught up.</p>
              </div>
            ) : renderTable(pendingUsers, true)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}