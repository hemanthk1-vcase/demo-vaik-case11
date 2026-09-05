import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIRM_SIZES = ['1', '2-9', '10-49', '50+'];
const MAX = 500;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const str = (v) => (typeof v === 'string' ? v.trim().slice(0, MAX) : '');
    const name = str(body.name);
    const email = str(body.email).toLowerCase();
    if (!name) return Response.json({ error: 'Your name is required.' }, { status: 400 });
    if (!EMAIL_RE.test(email)) return Response.json({ error: 'A valid email is required.' }, { status: 400 });

    const firm_size = FIRM_SIZES.includes(body.firm_size) ? body.firm_size : '1';
    const practice_area = str(body.practice_area).slice(0, 120);
    const preferred_date =
      typeof body.preferred_date === 'string' && body.preferred_date
        ? new Date(body.preferred_date).toISOString().slice(0, 35)
        : '';
    const challenges = str(body.challenges);

    const lead = await base44.asServiceRole.entities.Lead.create({
      name,
      email,
      firm_name: str(body.firm_name),
      firm_size,
      practice_area,
      country: 'united_states',
      preferred_date: preferred_date || '',
      challenges,
      status: 'new',
      source: 'marketing_demo',
    });

    return Response.json({ status: 'ok', lead_id: lead.id });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to submit request' }, { status: 500 });
  }
}