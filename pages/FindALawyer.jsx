import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Star, Scale, MapPin, Languages, Award, Mail, Briefcase } from 'lucide-react';
import { COUNTRY_LABEL } from '@/lib/format';
import { CASE_CATEGORIES, CATEGORY_LABEL } from '@/lib/caseCategories';

export default function FindALawyer() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jurisdiction, setJurisdiction] = useState('all');
  const [specialization, setSpecialization] = useState('all');
  const [lang, setLang] = useState('');

  useEffect(() => {
    base44.entities.LawyerProfile.list('-updated_date', 200)
      .then(setLawyers)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => lawyers.filter((l) => {
    const d = l.data || {};
    if (!(d.is_verified && d.is_active)) return false;
    if (jurisdiction !== 'all' && d.jurisdiction_country !== jurisdiction) return false;
    if (specialization !== 'all' && d.specialization !== specialization) return false;
    if (lang && !(d.languages_spoken || '').toLowerCase().includes(lang.toLowerCase())) return false;
    return true;
  }), [lawyers, jurisdiction, specialization, lang]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => (b.data?.is_featured ? 1 : 0) - (a.data?.is_featured ? 1 : 0)), [filtered]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Find a Lawyer</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse verified, active legal professionals.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select value={jurisdiction} onValueChange={setJurisdiction}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All jurisdictions</SelectItem>
            <SelectItem value="united_states">United States</SelectItem>
            <SelectItem value="united_kingdom">United Kingdom</SelectItem>
            <SelectItem value="india">India</SelectItem>
          </SelectContent>
        </Select>
        <Select value={specialization} onValueChange={setSpecialization}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All specializations</SelectItem>
            {CASE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input value={lang} onChange={(e) => setLang(e.target.value)} placeholder="Language…" className="w-[160px]" />
      </div>

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-16">Loading…</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3 text-muted-foreground">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"><Scale className="h-6 w-6" /></div>
          <div>No verified lawyers match your filters.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((l) => {
            const d = l.data || {};
            const initials = (d.full_name || '?').split(' ').map((s) => s[0]).slice(0, 2).join('');
            return (
              <div key={l.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col">
                <div className="flex items-start gap-3">
                  {d.profile_photo_url ? (
                    <Image src={d.profile_photo_url} fittingType="fill" className="h-14 w-14 rounded-full shrink-0" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">{initials}</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-heading font-semibold leading-snug">{d.full_name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{CATEGORY_LABEL[d.specialization] || d.specialization || '—'}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-amber-600"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {Number(d.rating || 0).toFixed(1)} ({d.review_count || 0})</div>
                  </div>
                </div>
                {d.is_featured && (
                  <div className="mt-3 rounded-lg bg-primary/10 px-3 py-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary"><Award className="h-3.5 w-3.5" /> Recommended by VakilCase</div>
                    {d.admin_recommendation && <p className="mt-1 text-xs text-muted-foreground">{d.admin_recommendation}</p>}
                  </div>
                )}
                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {COUNTRY_LABEL[d.jurisdiction_country] || '—'}</div>
                  <div className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {d.years_of_experience || 0} yrs experience</div>
                  {d.languages_spoken && <div className="flex items-center gap-1.5"><Languages className="h-3.5 w-3.5" /> {d.languages_spoken}</div>}
                </div>
                <div className="mt-4 pt-3 border-t border-border flex gap-2">
                  {d.contact_email && (
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <a href={`mailto:${d.contact_email}`}><Mail className="h-4 w-4 mr-1.5" />Contact</a>
                    </Button>
                  )}
                  <Button asChild size="sm" className="flex-1">
                    <Link to="/cases"><Briefcase className="h-4 w-4 mr-1.5" />Start case</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}