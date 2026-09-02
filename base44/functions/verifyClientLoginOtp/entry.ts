import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { checkChallenge } from '../../shared/loginOtp.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const challenge = String(body.challenge || '');
    const code = String(body.code || '').trim();
    if (!challenge || !/^\d{6}$/.test(code)) {
      return Response.json({ error: 'Enter the 6-digit code from your email' }, { status: 400 });
    }
    const result = await checkChallenge(challenge, code);
    if (!result.ok) {
      return Response.json({ error: 'Invalid or expired code' }, { status: 401 });
    }
    return Response.json({ status: 'ok' });
  } catch (error) {
    return Response.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}