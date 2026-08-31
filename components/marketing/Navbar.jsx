import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import { base44 } from "@/api/base44Client";
import { appUrl } from "@/lib/domain";

const LINKS = [
  { label: "Features", to: "/features" },
  { label: "For Lawyers", to: "/for-lawyers" },
  { label: "For Clients", to: "/for-clients" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed).catch(() => setAuthed(false));
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur border-b border-neutral-200" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center shrink-0" aria-label="VakilCase home">
          <Logo size="sm" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {authed ? (
            <a href={appUrl("/dashboard")} className="text-sm text-neutral-600 hover:text-neutral-900">
              Dashboard
            </a>
          ) : (
            <a href={appUrl("/login")} className="text-sm text-neutral-600 hover:text-neutral-900">
              Log In
            </a>
          )}
          <Link
            to="/demo"
            className="text-sm font-medium bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
          >
            Request Demo
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-neutral-900"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-white border-t border-neutral-200 px-6 py-4 space-y-3">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block text-sm text-neutral-700"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-neutral-200 flex gap-3">
            <a
              href={appUrl(authed ? "/dashboard" : "/login")}
              onClick={() => setOpen(false)}
              className="flex-1 text-center text-sm py-2 border border-neutral-900 rounded-lg text-neutral-900"
            >
              {authed ? "Dashboard" : "Log In"}
            </a>
            <Link
              to="/demo"
              onClick={() => setOpen(false)}
              className="flex-1 text-center text-sm py-2 bg-neutral-900 text-white rounded-lg"
            >
              Request Demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}