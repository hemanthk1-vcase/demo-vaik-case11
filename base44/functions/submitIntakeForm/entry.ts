import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const MAX_VALUE_LEN = 500;
const MAX_FIELDS = 50;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const formId = String(body.form_id || '').trim();
    const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
    if (!formId) {
      return Response.json({ error: 'Form ID is required' }, { status: 400 });
    }

    let form = null;
    try {
      form = await base44.asServiceRole.entities.IntakeForm.get(formId);
    } catch {
      form = null;
    }
    if (!form || !form.is_published) {
      return Response.json({ error: 'This form is not available.' }, { status: 404 });
    }

    const entries = Object.entries(answers)
      .slice(0, MAX_FIELDS)
      .map(([k, v]) => [String(k).slice(0, 120), String(v ?? '').slice(0, MAX_VALUE_LEN)]);
    const data = Object.fromEntries(entries);

    const clean = (v) => (typeof v === 'string' ? v.slice(0, 200) : '');
    const sub = await base44.asServiceRole.entities.IntakeSubmission.create({
      form_id: formId,
      form_name: form.form_name,
      submitted_data: JSON.stringify(data),
      submitter_name: clean(body.submitter_name),
      submitter_email: clean(body.submitter_email),
      submitter_phone: clean(body.submitter_phone),
      status: 'new',
      submitted_date: new Date().toISOString(),
    });

    return Response.json({
      status: 'ok',
      submission_id: sub.id,
      success_message: form.success_message || 'Thank you — your submission has been received.',
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to submit' }, { status: 500 });
  }
}