import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const OWNER = "hemanthk1-vcase";
const REPO = "vakil-case";

async function gh(token, url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "base44-app-vakilcase" }
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${await res.text()}`);
  return res.json();
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("github");

    const [info, commits, readme, tree] = await Promise.all([
      gh(accessToken, `https://api.github.com/repos/${OWNER}/${REPO}`),
      gh(accessToken, `https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=10`),
      gh(accessToken, `https://api.github.com/repos/${OWNER}/${REPO}/readme`),
      gh(accessToken, `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/main?recursive=1`).catch(() => null)
    ]);

    const readmeContent = readme?.content
      ? decodeURIComponent(escape(atob(readme.content)))
      : null;

    const files = tree?.tree
      ? tree.tree.filter(t => t.type === "blob").map(t => t.path).slice(0, 100)
      : [];

    return Response.json({
      repo: {
        name: info.full_name,
        description: info.description,
        url: info.html_url,
        stars: info.stargazers_count,
        forks: info.forks_count,
        openIssues: info.open_issues_count,
        language: info.language,
        defaultBranch: info.default_branch,
        updatedAt: info.updated_at
      },
      commits: commits.map(c => ({
        message: c.commit?.message?.split("\n")[0],
        author: c.commit?.author?.name,
        date: c.commit?.author?.date,
        sha: c.sha,
        url: c.html_url
      })),
      readme: readmeContent,
      files
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}