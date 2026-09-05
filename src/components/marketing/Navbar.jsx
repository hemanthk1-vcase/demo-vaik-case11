import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";
import { base44 } from "@/api/base44Client";

const LINKS = [
  { to: "/welcome", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/for-lawyers", label: "For Lawyers" },
  { to: "/for-clients", label: "For Clients" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed).catch(() => setAuthed(false));
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/welcome" className="flex items-center gap-2 font-bold text-slate-900">
          <BrandLogo className="h-9 w-9" />
          <span className="text-lg">Vakil Case</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                pathname === l.to ? "text-indigo-600 bg-indigo-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {authed ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => base44.auth.logout("/welcome")}>
                <LogOut className="w-4 h-4 mr-1" /> Sign out
              </Button>
              <Button size="sm" asChild>
                <Link to="/">Open app</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/demo">Book a demo</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            {authed ? (
              <>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => base44.auth.logout("/welcome")}>
                  <LogOut className="w-4 h-4 mr-1" /> Sign out
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link to="/">Open app</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link to="/register">Get started</Link>
                </Button>
              </>
            )}
            <Button size="sm" className="w-full mt-2" asChild>
              <Link to="/demo">Book a demo</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}