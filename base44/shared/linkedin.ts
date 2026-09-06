const SITE_URL = 'https://www.vakilcase.com';

export const TOPICS = [
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

// Topics rotate by calendar day so consecutive posts never repeat.
export function topicForDate(dateStr) {
  const dayIndex = Math.floor(Date.parse(dateStr + 'T00:00:00Z') / 86400000) % TOPICS.length;
  return TOPICS[dayIndex];
}

// Resolve the LinkedIn company page the connected account administers,
// preferring the Vakil Case page when several pages exist.
export async function resolveLinkedInOrganization(accessToken) {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'LinkedIn-Version': '202608',
    'X-Restli-Protocol-Version': '2.0.0'
  };
  const aclRes = await fetch(
    'https://api.linkedin.com/rest/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED',
    { headers }
  );
  if (!aclRes.ok) {
    throw new Error('Could not list administered organizations: ' + (await aclRes.text()));
  }
  const aclData = await aclRes.json();
  const rawElements = (aclData.elements || [])
    .map((el) => el.organization || el.organizationTarget)
    .filter(Boolean);
  const elements = [];
  for (const orgUrn of rawElements) {
    const orgId = String(orgUrn).split(':').pop();
    const orgRes = await fetch(`https://api.linkedin.com/rest/organizations/${orgId}`, { headers });
    const org = orgRes.ok ? await orgRes.json() : {};
    elements.push({
      organization: orgUrn,
      'organization~': { localizedName: org.localizedName || '', vanityName: org.vanityName || '' }
    });
  }
  if (!elements.length) {
    throw new Error('No administered LinkedIn page found for this account');
  }
  const preferred = elements.find((el) => {
    const org = el['organization~'] || {};
    const name = (org.localizedName || '') + ' ' + (org.vanityName || '');
    return name.toLowerCase().includes('vakil');
  });
  const chosen = preferred || elements[0];
  return {
    organization: chosen.organization,
    name: (chosen['organization~'] || {}).localizedName || 'the page'
  };
}

// Have the LLM write one short, professional post for the given topic.
export async function generateLinkedInPost(base44, topic) {
  const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt:
      'Write a LinkedIn post for the company page of Vakil Case, a practice management platform for modern law firms. ' +
      'Audience: solo practitioners and small-to-mid law firm owners who run their firm on spreadsheets, paper files and WhatsApp. ' +
      "Today's post topic: " + topic + '. ' +
      'Requirements: ' +
      '1) Keep it short: under 500 characters total, 3-4 short sentences or one short paragraph. ' +
      '2) Professional, attractive and simple: plain language, no jargon, no repetition, no filler phrases. Every sentence must add value. ' +
      '3) Vary the opening line - never start with a rhetorical question. ' +
      '4) Mention Vakil Case naturally by name once. ' +
      '5) End with the line: "Learn more: ' + SITE_URL + '" on its own line. Never mention any other URL or demo booking. ' +
      '6) No emojis, no hashtags, no markdown formatting, no quotes around the text. ' +
      'Return only the raw post text.',
    response_json_schema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text']
    }
  });
  return String(llm.text || '').trim();
}