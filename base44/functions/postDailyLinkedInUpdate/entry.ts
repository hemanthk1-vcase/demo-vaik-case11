import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const DEMO_URL = 'https://demo-vaik-case.base44.app/demo';

const TOPICS = [
  'the daily chaos of managing cases with spreadsheets, WhatsApp and paper files',
  'how a client portal reduces the "any update on my case?" phone calls',
  'why law firms struggle to get invoices paid on time and how to fix it',
  'trust account compliance and clean bookkeeping for law firms',
  'unbilled time: the hours firms lose when no one tracks them',
  'getting engagement letters and retainer agreements signed faster with e-signature',
  'reusable document templates for notices, filings and engagement letters',
  'an AI assistant that drafts documents, summarizes cases and speeds up legal research',
  'online intake forms that turn website visitors into qualified leads',
  'missing hearing dates and court deadlines, and how to never miss one again',
  'growing a small law firm without adding overhead',
  'collaboration between senior lawyers and associates on shared case files'
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('linkedin');
    if (!accessToken) {
      return Response.json({ error: 'LinkedIn connection not found' }, { status: 500 });
    }

    // Resolve the organization (company page) the connected user administers.
    const aclRes = await fetch(
      'https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED',
      { headers: { 'Authorization': `Bearer ${accessToken}`, 'LinkedIn-Version': '202608', 'X-Restli-Protocol-Version': '2.0.0' } }
    );
    if (!aclRes.ok) {
      return Response.json({ error: 'Could not list administered organizations: ' + (await aclRes.text()) }, { status: 500 });
    }
    const aclData = await aclRes.json();
    const rawElements = (aclData.elements || [])
      .map((el) => el.organization || el.organizationTarget)
      .filter(Boolean);
    const elements = [];
    for (const orgUrn of rawElements) {
      const orgId = String(orgUrn).split(':').pop();
      const orgRes = await fetch(`https://api.linkedin.com/rest/organizations/${orgId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'LinkedIn-Version': '202608', 'X-Restli-Protocol-Version': '2.0.0' }
      });
      const org = orgRes.ok ? await orgRes.json() : {};
      elements.push({
        organization: orgUrn,
        'organization~': { localizedName: org.localizedName || '', vanityName: org.vanityName || '' }
      });
    }
    if (!elements.length) {
      return Response.json({ error: 'No administered LinkedIn page found for this account' }, { status: 500 });
    }
    // Prefer the Vakil Case page if multiple pages are administered.
    const preferred = elements.find((el) => {
      const org = el['organization~'] || {};
      const name = (org.localizedName || '') + ' ' + (org.vanityName || '');
      return name.toLowerCase().includes('vakil');
    });
    const chosen = preferred || elements[0];
    const orgUrn = chosen.organization;
    const orgName = (chosen['organization~'] || {}).localizedName || 'the page';

    // Rotate the topic by day so consecutive posts never repeat.
    const dayIndex = Math.floor(Date.now() / 86400000) % TOPICS.length;
    const topic = TOPICS[dayIndex];
    const today = new Date().toISOString().slice(0, 10);

    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        'Write a LinkedIn post for the company page of Vakil Case, a practice management platform for modern law firms. ' +
        'Audience: solo practitioners and small-to-mid law firm owners who run their firm on spreadsheets, paper files and WhatsApp. ' +
        "Today's post topic: " + topic + '. ' +
        'Requirements: ' +
        '1) Under 1200 characters total. ' +
        '2) Professional, practical, warm tone; write like a peer who understands law firm life, not a corporate ad. ' +
        '3) Vary the opening line - never start with a rhetorical question. ' +
        '4) Mention Vakil Case naturally by name once. ' +
        '5) End with a call to action: "Book a free demo: ' + DEMO_URL + '" on its own line. ' +
        '6) On the last line add 2-3 hashtags from this set only: #LegalTech #LawFirmManagement #PracticeManagement #LegalPractice. ' +
        '7) No emojis, no markdown formatting, no quotes around the text. ' +
        '8) Reference that it is written on ' + today + ' only if it fits naturally; otherwise ignore the date. ' +
        'Return only the raw post text.',
      response_json_schema: {
        type: 'object',
        properties: { text: { type: 'string' } },
        required: ['text']
      }
    });

    const commentary = String(llm.text || '').trim();
    if (!commentary || commentary.length > 2800) {
      return Response.json({ error: 'Generated post was empty or too long' }, { status: 500 });
    }

    if (dryRun) {
      return Response.json({ dryRun: true, page: orgName, organization: orgUrn, topic, post: commentary });
    }

    const postRes = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202608',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify({
        author: orgUrn,
        commentary: commentary,
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: []
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false
      })
    });
    if (!postRes.ok) {
      return Response.json({ error: 'LinkedIn post failed: ' + (await postRes.text()) }, { status: 500 });
    }
    const postResult = await postRes.json();

    return Response.json({
      posted: true,
      page: orgName,
      topic,
      post: commentary,
      post_id: postResult.id || null
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}