import React, { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Users, Briefcase, FileText, Files, MessageSquare,
  ClipboardList, Receipt, Landmark, Clock, CheckSquare, PenTool, Mail, LogOut,
  GraduationCap,
  Presentation,
  UserCheck,
  Sparkles,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/registered-users", label: "Registrations", icon: UserCheck },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/cases", label: "Cases", icon: Briefcase },
  { to: "/ai-assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/lawyer-management", label: "Lawyer Management", icon: GraduationCap },
  { to: "/presentation", label: "Sales Deck", icon: Presentation },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/document-templates", label: "Document Templates", icon: Files },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/intake-forms", label: "Intake Forms", icon: ClipboardList },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/trust-accounting", label: "Trust Accounting", icon: Landmark },
  { to: "/time-tracking", label: "Time Tracking", icon: Clock },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/e-signature", label: "E-Signature", icon: PenTool },
  { to: "/email-log", label: "Email Log", icon: Mail },
];

const SITE_LINKS = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/welcome", label: "Visit site" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const name = user?.full_name || "User";
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const firstName = name.split(" ")[0];

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-card border-r border-border h-screen sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
        <BrandLogo className="h-12 w-12" />
        <span className="font-bold text-lg tracking-tight">Vakil Case</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-4 py-4 space-y-3">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-2">Website</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {SITE_LINKS.map(({ to, label }) => (
              <Link key={label} to={to} className="hover:text-foreground">{label}</Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted text-sm font-semibold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-muted-foreground">Lawyer</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}