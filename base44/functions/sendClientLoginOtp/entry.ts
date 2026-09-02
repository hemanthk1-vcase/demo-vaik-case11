import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { genCode, makeChallenge } from '../../shared/loginOtp.ts';

const OTP_TTL_MS = 10 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return Response.json({ error: 'A valid email is required' }, { status: 400 });
    }

    let user = null;
    try {
      const all = await base44.asServiceRole.entities.User.list();
      user = (all || []).find((u) => (u.email || '').toLowerCase() === email) || null;
    } catch {
      user = null;
    }

    // Only client accounts get the email-code step; lawyers/firms sign in with
    // their password only. Unknown accounts respond the same way so the
    // endpoint does not reveal who is registered.
    if (!user || (user.account_type !== 'client' && user.account_type !== 'both')) {
      return Response.json({ status: 'ok' });
    }

    const code = genCode();
    const expires = Date.now() + OTP_TTL_MS;
    const challenge = await makeChallenge(user.id, code, expires);
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: 'Your Vakil Case sign-in code',
      body: [
        `Your one-time sign-in code is: ${code}`,
        '',
        'It expires in 10 minutes.',
        '',
        'If you did not try to sign in, you can ignore this email.',
        '',
        '— Vakil Case',
      ].join('\n'),
    });
    return Response.json({ status: 'ok', challenge });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to send code' }, { status: 500 });
  }
}