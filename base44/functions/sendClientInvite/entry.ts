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
    const firmCode = admin.firm_code ? String(admin.firm_code) : '';
    const lines = [
      `Hi ${clientName || 'there'},`,
      '',
      'Your law firm has set up a secure client portal for you on Vakil Case. Sign in to view your matters, hearing dates, invoices, and shared documents.',
      '',
      `Sign in: ${APP_URL}/login`,
      `New here? Create your account: ${APP_URL}/register`,
      '',
      'When you sign in, choose "A client".',
      ...(firmCode ? ['', `To connect to the firm, use this firm code: ${firmCode}`] : []),
      '',
      '— Vakil Case',
    ];
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: clientEmail,
      subject: 'Your invitation to the Vakil Case client portal',
      body: lines.join('\n'),
    });
    return Response.json({ status: 'ok', sent: true });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to send invite' }, { status: 500 });
  }
}