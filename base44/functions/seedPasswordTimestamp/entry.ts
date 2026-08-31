import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Runs on every signup (via the "On User Signup" workflow). Seeds the
// approval + auth-method fields so the admin's Pending Approvals tab can
// surface the new user, and starts the 90-day password-expiry clock for
// password-based signups (social-login users have no password).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { user_id, auth_method } = body;
    if (!user_id) return Response.json({ error: 'user_id is required' }, { status: 400 });

    const update = {
      approval_status: 'pending',
      auth_method: auth_method || 'password',
    };

    // Only password signups have a password to expire.
    if (!auth_method || auth_method === 'password') {
      update.password_last_changed = new Date().toISOString();
    }

    await base44.asServiceRole.entities.User.update(user_id, update);
    return Response.json({ status: 'ok' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}