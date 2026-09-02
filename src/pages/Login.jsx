import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2 } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import { MicrosoftIcon, FacebookIcon, AppleIcon } from "@/components/SocialAuthIcons";
import BrandLogo from "@/components/BrandLogo";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();
  const justRegistered = new URLSearchParams(window.location.search).get("registered") === "1";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      // No explicit destination — route by the role chosen at registration.
      let dest = returnTo;
      if (dest === "/") {
        try {
          const me = await base44.auth.me();
          if (me?.account_type === "client") dest = "/client-portal";
        } catch {
          // fall through to "/"
        }
      }
      window.location.href = dest;
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const providers = [
    { id: "google", label: "Continue with Google", Icon: GoogleIcon },
    { id: "microsoft", label: "Continue with Microsoft", Icon: MicrosoftIcon },
    { id: "facebook", label: "Continue with Facebook", Icon: FacebookIcon },
    { id: "apple", label: "Continue with Apple", Icon: AppleIcon },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-sm border border-border p-8">
        {/* Logo + heading */}
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo className="h-20 w-20 mb-3" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome to Vakil Case</h1>
          <p className="text-muted-foreground mt-1">Sign in to continue</p>
        </div>

        {justRegistered && (
          <div className="mb-6 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">
            Your account is ready — log in with your email and password to continue.
          </div>
        )}

        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3">
          <span className="text-sm text-muted-foreground">Need an account?</span>
          <Button size="sm" asChild>
            <Link to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}>
              Sign up
            </Link>
          </Button>
        </div>

        {/* Social providers */}
        <div className="space-y-3 mb-6">
          {providers.map(({ id, label, Icon }) => (
            <Button
              key={id}
              type="button"
              variant="outline"
              className="w-full h-11 text-sm font-medium"
              onClick={() => base44.auth.loginWithProvider(id, returnTo)}
            >
              <Icon className="w-5 h-5" />
              <span className="ml-2.5">{label}</span>
            </Button>
          ))}
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground">or</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        {/* Footer links */}
        <div className="text-center mt-6 text-sm">
          <Link to="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}