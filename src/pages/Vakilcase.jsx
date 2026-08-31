import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Star, GitFork, GitCommit, FileCode, ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function Vakilcase() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("getVakilcaseRepo", {});
      setData(res.data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to load repo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-destructive">{error}</p>
        <Button onClick={load} variant="outline">Try again</Button>
      </div>
    );
  }

  const { repo, commits, readme, files } = data;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Repo info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileCode className="w-6 h-6" />
                  {repo.name}
                </CardTitle>
                <p className="text-muted-foreground">{repo.description || "No description"}</p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
                  <Badge variant="outline" className="gap-1"><Star className="w-3 h-3" /> {repo.stars}</Badge>
                  <Badge variant="outline" className="gap-1"><GitFork className="w-3 h-3" /> {repo.forks}</Badge>
                  <Badge variant="outline">{repo.openIssues} open issues</Badge>
                </div>
              </div>
              <Button asChild size="sm">
                <a href={repo.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" /> View on GitHub
                </a>
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent commits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GitCommit className="w-5 h-5" /> Recent Commits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {commits.length === 0 && <p className="text-muted-foreground text-sm">No commits</p>}
              {commits.map((c) => (
                <div key={c.sha} className="border-l-2 border-slate-200 pl-3">
                  <p className="text-sm font-medium truncate">{c.message}</p>
                  <p className="text-xs text-muted-foreground">{c.author} · {new Date(c.date).toLocaleDateString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* File tree */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileCode className="w-5 h-5" /> Files ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-auto font-mono text-xs space-y-1">
                {files.map((f) => (
                  <div key={f} className="text-muted-foreground truncate">{f}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* README */}
        {readme && (
          <Card>
            <CardHeader>
              <CardTitle>README.md</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">{readme}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}