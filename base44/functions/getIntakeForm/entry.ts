import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const formId = String(body.form_id || '').trim();
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
    return Response.json({
      form: {
        id: form.id,
        form_name: form.form_name,
        form_description: form.form_description,
        form_fields: form.form_fields,
        success_message: form.success_message,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to load form' }, { status: 500 });
  }
}