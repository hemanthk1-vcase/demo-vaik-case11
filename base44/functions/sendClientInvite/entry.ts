import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const APP_URL = 'https://demo-vaik-case.base44.app';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await base44.auth.me();
    if (!admin || admin.role !== 'admin') {
      return Response.json({ error: 'Only firm admins can send client invites' }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const clientName = String(body.client_name || '').trim();
    const clientEmail = String(body.client_email || '').trim();
    if (!EMAIL_RE.test(clientEmail)) {
      return Response.json({ error: 'A valid client email is required' }, { status: 400 });
    }
    const senderName = String(admin.full_name || 'Your attorney').trim();
    const firmName = String(admin.firm_name || '').trim();
    const firmCode = admin.firm_code ? String(admin.firm_code) : '';
    const requester = firmName ? `Adv. ${senderName} of ${firmName}` : `Adv. ${senderName}`;
    const firmDisplayName = firmName || senderName;

    const lines = [
      `Dear ${clientName || 'Client'},`,
      '',
      `${requester} has requested that you be granted access to your matters through the Vakil Case Client Portal.`,
      '',
      'Through the portal, you will be able to:',
      '',
      '- View live case status and upcoming hearing dates',
      '- Access documents shared by the firm and add your e-signature where requested',
      '- Review invoices and make secure online payments',
      '',
      'To get started, please accept the invitation below and create your password. This link is valid for 7 days.',
      '',
      'Accept Invitation & Create Your Password:',
      `${APP_URL}/register`,
      '',
      'Already have a Vakil Case account with another firm? Simply log in — this firm will appear automatically in your account.',
      '',
      'If you did not expect this invitation, please disregard this email.',
      '',
      ...(firmCode ? [`Firm reference code: ${firmCode}`, ''] : []),
      'Visit us at www.vakilcase.com',
      '',
      'Warm regards,',
      firmDisplayName,
    ];
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: clientEmail,
      subject: `Invitation to Access Your Matters — ${firmDisplayName} via Vakil Case`,
      body: lines.join('\n'),
    });
    return Response.json({ status: 'ok', sent: true });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to send invite' }, { status: 500 });
  }
}