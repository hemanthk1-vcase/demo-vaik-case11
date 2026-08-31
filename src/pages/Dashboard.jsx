import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Briefcase, TrendingUp, CalendarClock, ChevronRight, Info } from "lucide-react";
import FounderNote from "@/components/FounderNote";

const ACTIVE_STATUSES = ["active", "hearing", "filed", "discovery", "pre_trial", "trial"];

export default function Dashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
    (async () => {
      try {
        const data = await base44.entities.Case.list("-created_date", 100);
        setCases(data || []);
      } catch {
        setCases([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const firstName = (user?.full_name || "there").split(" ")[0];
  const total = cases.length;
  const active = cases.filter((c) => ACTIVE_STATUSES.includes(c.status)).length;
  const now = new Date();
  const upcomingCases = cases
    .filter((c) => c.next_hearing_date && new Date(c.next_hearing_date) >= now)
    .sort((a, b) => new Date(a.next_hearing_date) - new Date(b.next_hearing_date));
  const upcoming = upcomingCases.length;
  const recent = cases.slice(0, 5);

  const metrics = [
    { label: "Total Cases", value: total, icon: Briefcase, tint: "bg-blue-50 text-blue-600" },
    { label: "Active Matters", value: active, icon: TrendingUp, tint: "bg-emerald-50 text-emerald-600" },
    { label: "Upcoming Hearings", value: upcoming, icon: CalendarClock, tint: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {firstName}</h1>
        <p className="text-muted-foreground mt-1">Overview of your practice and active matters.</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map(({ label, value, icon: Icon, tint }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-3xl font-bold mt-1">{loading ? "—" : value}</p>
              </div>
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-lg ${tint}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent cases + Upcoming hearings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Cases</h3>
            <Link to="/cases" className="text-sm text-primary hover:underline inline-flex items-center">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No cases yet.</p>
          ) : (
            <div className="space-y-3">
              {recent.map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b border-border last:border-0 pb-2 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.case_number || c.case_category}</p>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{c.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Upcoming Hearings</h3>
            <Link to="/cases" className="text-sm text-primary hover:underline inline-flex items-center">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {upcomingCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted mb-2">
                <Info className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No upcoming hearings.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingCases.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b border-border last:border-0 pb-2 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.court_name || "—"}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.next_hearing_date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Founder note */}
      <FounderNote />
    </div>
  );
}