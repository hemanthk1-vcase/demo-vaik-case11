import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { resolveLinkedInOrganization, generateLinkedInPost, topicForDate } from '../../shared/linkedin.ts';

// Runs daily at 6 AM ET: publishes today's post to the Vakil Case LinkedIn page.
// If the 4 PM preview function already wrote and emailed today's post, that exact
// text is published; otherwise a fresh post is generated on the spot.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('linkedin');
    if (!accessToken) {
      return Response.json({ error: 'LinkedIn connection not found' }, { status: 500 });
    }
    const { organization: orgUrn, name: orgName } = await resolveLinkedInOrganization(accessToken);

    const today = new Date().toISOString().slice(0, 10);
    const topic = topicForDate(today);

    const stored = await base44.entities.LinkedInPost.filter({ post_date: today, status: 'pending' });
    const commentary = stored.length > 0
      ? String(stored[0].content || '').trim()
      : await generateLinkedInPost(base44, topic);
    if (!commentary || commentary.length > 2800) {
      return Response.json({ error: 'Generated post was empty or too long' }, { status: 500 });
    }

    if (dryRun) {
      return Response.json({
        dryRun: true,
        page: orgName,
        organization: orgUrn,
        topic,
        source: stored.length > 0 ? 'previewed' : 'fresh',
        post: commentary
      });
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
    // LinkedIn returns 201 with an empty body and the post id in a header.
    const postId = postRes.headers.get('x-restli-id') || postRes.headers.get('x-linkedin-id') || null;

    if (stored.length > 0) {
      await base44.entities.LinkedInPost.update(stored[0].id, { status: 'published' });
    } else {
      await base44.entities.LinkedInPost.create({ post_date: today, topic, content: commentary, status: 'published' });
    }

    return Response.json({
      posted: true,
      page: orgName,
      topic,
      post: commentary,
      post_id: postId
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}