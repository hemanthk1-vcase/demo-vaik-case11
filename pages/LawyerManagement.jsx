import { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ShieldCheck, Star, CheckCircle2, XCircle, Ban, Plus } from 'lucide-react';
import { COUNTRY_LABEL } from '@/lib/format';
import { CASE_CATEGORIES, CATEGORY_LABEL } from '@/lib/caseCategories';

const STATUS_BADGE = {
  pending_review: 'bg-amber-50 text-amber-700',
  under_review: 'bg-blue-50 text-blue-700',
  verified: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-rose-50 text-rose-700',
  suspended: 'bg-slate-100 text-slate-600'
};

const emptyProfile = {
  full_name: '', bar_registration_number: '', bar_council_name: '', jurisdiction_country: 'united_states',
  specialization: 'civil_litigation', years_of_experience: '', education: '', bio: '', contact_email: '',
  contact_phone: '', office_address: '', languages_spoken: ''
};

export default function LawyerManagement() {
  const { isAdmin } = useCurrentUser();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'all', country: 'all', verified: 'all', featured: 'all' });
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyProfile);

  async function load() {
    setLoading(true);
    try {
      let res;
      try {
        res = await base44.entities.LawyerProfile.list('-updated_date', 200);
      } catch (e) {
        // Retry once after the initial request burst settles (rate-limit safety).
        await new Promise((r) => setTimeout(r, 800));
        res = await base44.entities.LawyerProfile.list('-updated_date', 200);
      }
      setProfiles(res);
    } catch (e) {
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => profiles.filter((p) => {
    const d = p.data || {};
    if (filter.status !== 'all' && d.status !== filter.status) return false;
    if (filter.country !== 'all' && d.jurisdiction_country !== filter.country) return false;
    if (filter.verified !== 'all' && (d.is_verified ? 'yes' : 'no') !== filter.verified) return false;
    if (filter.featured !== 'all' && (d.is_featured ? 'yes' : 'no') !== filter.featured) return false;
    return true;
  }), [profiles, filter]);

  const stats = useMemo(() => ({
    pending: profiles.filter((p) => ['pending_review', 'under_review'].includes(p.data?.status)).length,
    verified: profiles.filter((p) => p.data?.is_verified).length,
    suspended: profiles.filter((p) => p.data?.status === 'suspended' || p.data?.is_active === false).length,
    featured: profiles.filter((p) => p.data?.is_featured).length
  }), [profiles]);

  function openDetail(p) {
    setSelected(p);
    setNotes(p.data?.verification_notes || '');
    setRecommendation(p.data?.admin_recommendation || '');
  }

  async function action(kind) {
    const patch = {};
    if (kind === 'approve') { patch.is_verified = true; patch.status = 'verified'; patch.verification_date = new Date().toISOString().slice(0, 10); patch.verification_notes = notes; }
    if (kind === 'reject') { patch.status = 'rejected'; patch.is_verified = false; patch.verification_notes = notes; }
    if (kind === 'feature') { patch.is_featured = true; patch.admin_recommendation = recommendation; }
    if (kind === 'unfeature') { patch.is_featured = false; }
    if (kind === 'suspend') { patch.is_active = false; patch.status = 'suspended'; }
    if (kind === 'reinstate') { patch.is_active = true; patch.status = 'verified'; }
    if (kind === 'saveNotes') { patch.verification_notes = notes; if (selected.data?.is_featured) patch.admin_recommendation = recommendation; }
    try {
      await base44.entities.LawyerProfile.update(selected.id, patch);
      toast({ title: 'Updated' });
      const updated = { ...selected, data: { ...selected.data, ...patch } };
      setSelected(updated);
      setNotes(updated.data.verification_notes || '');
      setRecommendation(updated.data.admin_recommendation || '');
      load();
    } catch (e) { toast({ variant: 'destructive', title: 'Failed', description: e.message }); }
  }

  async function createProfile(e) {
    e.preventDefault();
    try {
      await base44.entities.LawyerProfile.create({
        ...form,
        years_of_experience: form.years_of_experience ? Number(form.years_of_experience) : 0,
        user_id: 'manual-' + Date.now(),
        status: 'pending_review', is_verified: false, is_featured: false, is_active: true,
        rating: 0, review_count: 0, submitted_date: new Date().toISOString().slice(0, 10)
      });
      toast({ title: 'Lawyer profile created' });
      setForm(emptyProfile); setCreateOpen(false); load();
    } catch (e) { toast({ variant: 'destructive', title: 'Failed', description: e.message }); }
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
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Lawyer Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Verify, feature, and manage lawyer profiles.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1.5" />Add lawyer</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add lawyer profile</DialogTitle></DialogHeader>
            <form onSubmit={createProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Full name *</Label><Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} required /></div>
                <div className="space-y-1.5"><Label>Bar number *</Label><Input value={form.bar_registration_number} onChange={(e) => setForm((f) => ({ ...f, bar_registration_number: e.target.value }))} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Bar council *</Label><Input value={form.bar_council_name} onChange={(e) => setForm((f) => ({ ...f, bar_council_name: e.target.value }))} required /></div>
                <div className="space-y-1.5"><Label>Jurisdiction</Label>
                  <Select value={form.jurisdiction_country} onValueChange={(v) => setForm((f) => ({ ...f, jurisdiction_country: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="united_states">United States</SelectItem>
                      <SelectItem value="united_kingdom">United Kingdom</SelectItem>
                      <SelectItem value="india">India</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Specialization</Label>
                  <Select value={form.specialization} onValueChange={(v) => setForm((f) => ({ ...f, specialization: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CASE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Years of experience</Label><Input type="number" value={form.years_of_experience} onChange={(e) => setForm((f) => ({ ...f, years_of_experience: e.target.value }))} /></div>
              </div>
              <div className="space-y-1.5"><Label>Education</Label><Input value={form.education} onChange={(e) => setForm((f) => ({ ...f, education: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Contact email</Label><Input type="email" value={form.contact_email} onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))} /></div>
                <div className="space-y-1.5"><Label>Contact phone</Label><Input value={form.contact_phone} onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))} /></div>
              </div>
              <div className="space-y-1.5"><Label>Office address</Label><Input value={form.office_address} onChange={(e) => setForm((f) => ({ ...f, office_address: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Languages spoken</Label><Input value={form.languages_spoken} onChange={(e) => setForm((f) => ({ ...f, languages_spoken: e.target.value }))} placeholder="English, Spanish" /></div>
              <div className="space-y-1.5"><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={2} /></div>
              <DialogFooter><Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit">Create</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        {[
          { label: 'Pending Reviews', value: stats.pending, tint: 'text-amber-600' },
          { label: 'Verified Lawyers', value: stats.verified, tint: 'text-emerald-600' },
          { label: 'Suspended', value: stats.suspended, tint: 'text-slate-500' },
          { label: 'Featured', value: stats.featured, tint: 'text-primary' }
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
            <div className={`mt-1 text-2xl font-heading font-semibold ${s.tint}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Select value={filter.status} onValueChange={(v) => setFilter((f) => ({ ...f, status: v }))}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {['pending_review', 'under_review', 'verified', 'rejected', 'suspended'].map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filter.country} onValueChange={(v) => setFilter((f) => ({ ...f, country: v }))}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All jurisdictions</SelectItem>
            <SelectItem value="united_states">United States</SelectItem>
            <SelectItem value="united_kingdom">United Kingdom</SelectItem>
            <SelectItem value="india">India</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.verified} onValueChange={(v) => setFilter((f) => ({ ...f, verified: v }))}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="yes">Verified</SelectItem><SelectItem value="no">Unverified</SelectItem></SelectContent>
        </Select>
        <Select value={filter.featured} onValueChange={(v) => setFilter((f) => ({ ...f, featured: v }))}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="yes">Featured</SelectItem><SelectItem value="no">Not featured</SelectItem></SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-16">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-muted-foreground">No lawyer profiles found.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Bar #</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Jurisdiction</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Specialization</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3 font-medium">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => {
                const d = p.data || {};
                return (
                  <tr key={p.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => openDetail(p)}>
                    <td className="px-4 py-3 font-medium">{d.full_name}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{d.bar_registration_number}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{COUNTRY_LABEL[d.jurisdiction_country] || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{CATEGORY_LABEL[d.specialization] || d.specialization || '—'}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${STATUS_BADGE[d.status]}`}>{(d.status || '').replace(/_/g, ' ')}</span></td>
                    <td className="px-4 py-3">{d.is_verified ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</td>
                    <td className="px-4 py-3">{d.is_featured ? <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3 text-muted-foreground">{Number(d.rating || 0).toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (() => {
            const d = selected.data || {};
            return (
              <>
                <DialogHeader><DialogTitle>{d.full_name}</DialogTitle></DialogHeader>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div><span className="text-muted-foreground">Bar #: </span>{d.bar_registration_number}</div>
                    <div><span className="text-muted-foreground">Council: </span>{d.bar_council_name}</div>
                    <div><span className="text-muted-foreground">Jurisdiction: </span>{COUNTRY_LABEL[d.jurisdiction_country]}</div>
                    <div><span className="text-muted-foreground">Experience: </span>{d.years_of_experience || 0} yrs</div>
                    <div><span className="text-muted-foreground">Education: </span>{d.education || '—'}</div>
                    <div><span className="text-muted-foreground">Languages: </span>{d.languages_spoken || '—'}</div>
                    <div><span className="text-muted-foreground">Email: </span>{d.contact_email || '—'}</div>
                    <div><span className="text-muted-foreground">Phone: </span>{d.contact_phone || '—'}</div>
                  </div>
                  <div><span className="text-muted-foreground">Address: </span>{d.office_address || '—'}</div>
                  {d.bio && <div className="pt-1"><span className="text-muted-foreground">Bio</span><p className="mt-1 text-muted-foreground leading-relaxed">{d.bio}</p></div>}
                </div>
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <div className="space-y-1.5">
                    <Label>Verification notes (admin only)</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Admin recommendation (shown when featured)</Label>
                    <Textarea value={recommendation} onChange={(e) => setRecommendation(e.target.value)} rows={2} />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => action('approve')}><CheckCircle2 className="h-4 w-4 mr-1.5" />Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => action('reject')}><XCircle className="h-4 w-4 mr-1.5" />Reject</Button>
                  {d.is_featured ? (
                    <Button size="sm" variant="outline" onClick={() => action('unfeature')}>Unfeature</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => action('feature')}><Star className="h-4 w-4 mr-1.5" />Feature</Button>
                  )}
                  {d.is_active ? (
                    <Button size="sm" variant="outline" onClick={() => action('suspend')}><Ban className="h-4 w-4 mr-1.5" />Suspend</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => action('reinstate')}>Reinstate</Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => action('saveNotes')}>Save notes</Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}