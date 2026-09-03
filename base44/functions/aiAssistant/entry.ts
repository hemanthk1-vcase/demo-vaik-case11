import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }
    const body = await req.json();
    const question = String(body?.question || '').trim().slice(0, 2000);
    if (!question) {
      return Response.json({ error: 'A question is required' }, { status: 400 });
    }

    const prompt =
      'You are the Vakil Case Legal Research Assistant — an AI aide built into a law-firm practice management platform, used by licensed attorneys.\n\n' +
      'Answer the attorney\u2019s question clearly and professionally. When web sources are available, reference them. ' +
      'Structure longer answers with short headings or bullet points. ' +
      'If the question calls for advice on a specific matter, remind the attorney to verify against current statutes and their jurisdiction before relying on the answer.\n\n' +
      `Attorney\u2019s question: ${question}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'gemini_3_flash',
      add_context_from_internet: true,
    });

    return Response.json({ answer: String(result) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}