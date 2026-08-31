import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { user_id, email, full_name, auth_method } = body;
    if (!email) return Response.json({ error: 'email is required' }, { status: 400 });

    // Fetch all admin users (custom role_type "admin"). Fall back to listing
    // and filtering client-side in case role_type isn't set on legacy admins.
    let admins = [];
    try {
      admins = await base44.asServiceRole.entities.User.filter({ role_type: 'admin' });
    } catch {
      admins = [];
    }
    if (!admins || admins.length === 0) {
      const all = await base44.asServiceRole.entities.User.list();
      admins = (all || []).filter((u) => u.role === 'admin' || u.data?.role_type === 'admin');
    }
    const adminEmails = (admins || [])
      .map((u) => u.email)
      .filter((e) => !!e && e !== email);

    if (adminEmails.length === 0) {
      return Response.json({ status: 'no_admins', notified: 0 });
    }

    const displayName = full_name || email;
    const approveLink = 'https://app.vakilcase.com/users?tab=pending';
    const subject = `New signup pending approval: ${displayName}`;
    const bodyText = [
      'A new user has signed up and is awaiting admin approval.',
      '',
      `Name: ${displayName}`,
      `Email: ${email}`,
      `Auth method: ${auth_method || 'password'}`,
      '',
      'Review and approve or reject this request in the admin panel:',
      approveLink,
      '',
      '— VakilCase',
    ].join('\n');

    let sent = 0;
    for (const to of adminEmails) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to,
          subject,
          body: bodyText,
        });
        sent++;
      } catch {
        // continue to next admin
      }
    }

    return Response.json({ status: 'ok', notified: sent, total_admins: adminEmails.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}