import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { resolveLinkedInOrganization, generateLinkedInPost, topicForDate } from '../../shared/linkedin.ts';

const PREVIEW_EMAILS = ['hemanthk1@gmail.com', 'hemanthk@yahoo.com'];

// Runs daily at 4 PM ET: writes tomorrow's post, stores it, and emails the
// exact text that will be published the next morning at 6 AM ET.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('linkedin');
    if (!accessToken) {
      return Response.json({ error: 'LinkedIn connection not found' }, { status: 500 });
    }
    await resolveLinkedInOrganization(accessToken);

    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const topic = topicForDate(tomorrow);
    const content = await generateLinkedInPost(base44, topic);
    if (!content || content.length > 2800) {
      return Response.json({ error: 'Generated post was empty or too long' }, { status: 500 });
    }

    const existing = await base44.entities.LinkedInPost.filter({ post_date: tomorrow });
    if (existing.length > 0) {
      await base44.entities.LinkedInPost.update(existing[0].id, { topic, content, status: 'pending' });
    } else {
      await base44.entities.LinkedInPost.create({ post_date: tomorrow, topic, content, status: 'pending' });
    }

    for (const to of PREVIEW_EMAILS) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to,
        subject: 'Tomorrow\'s Vakil Case LinkedIn post (' + tomorrow + ')',
        body:
          'Here is the post scheduled to publish on the Vakil Case LinkedIn page tomorrow at 6 AM ET:\n\n' +
          content +
          '\n\nYou receive this preview daily at 4 PM ET, the day before publishing.'
      });
    }

    return Response.json({ emailed: PREVIEW_EMAILS, post_date: tomorrow, topic, post: content });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}