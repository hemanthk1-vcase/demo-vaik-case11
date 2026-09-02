import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import TermsDialog from "@/components/TermsDialog";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [consent, setConsent] = useState(false);
  const [asLawyer, setAsLawyer] = useState(false);
  const [asClient, setAsClient] = useState(true);
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (phone.replace(/\D/g, "").length < 7) {
      setError("A valid phone number is required — your firm uses it to reach you.");
      return;
    }
    if (!asLawyer && !asClient) {
      setError("Select at least one role — you can be a lawyer, a client, or both.");
      return;
    }
    if (!consent) {
      setError("Please review and accept the Terms of Use & Consents before creating your account.");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(
        err.message?.includes("already exists")
          ? "This email already has an account — log in with it instead, or register with a different email address. (One account per email; a lawyer and a client each need their own email.)"
          : err.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
        try {
          const profile = {
            account_type: asLawyer && asClient ? "both" : asLawyer ? "lawyer" : "client",
            phone,
            phone_country_code: countryCode,
          };
          if (asLawyer) {
            profile.firm_code = "VC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
          }
          await base44.auth.updateMe(profile);
        } catch {
          // profile details can be completed later — don't block sign-in
        }
      }
      // Registration only creates the account — the user signs in explicitly
      // on the login page, where they're routed by the role they selected.
      await base44.auth.logout("/login?registered=1");
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({
        title: "Code sent",
        description: "Check your email for the new code.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", safeReturnTo());
  };

  if (showOtp) {
    return (
      <AuthLayout
        icon={Mail}
        title="Verify your email"
        subtitle={`We sent a code to ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Didn't receive the code?{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">
            Resend
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
    >
      <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3">
        <span className="text-sm text-muted-foreground">Already have an account?</span>
        <Button size="sm" asChild>
          <Link to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")}>
            Sign in
          </Link>
        </Button>
      </div>

      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

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
              className="pl-10 h-12"
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
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>I am registering as…</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["lawyer", "A lawyer / firm", asLawyer, () => setAsLawyer((v) => !v)],
              ["client", "A client", asClient, () => setAsClient((v) => !v)],
            ].map(([v, l, active, toggle]) => (
              <button
                type="button"
                key={v}
                onClick={toggle}
                className={`h-11 rounded-md border text-sm font-medium transition ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-muted/60"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            You can select both — a lawyer can also be a client of another firm with the same account.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone number <span className="text-destructive">*</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {[["+91", "🇮🇳 +91"], ["+1", "🇺🇸 +1"], ["+44", "🇬🇧 +44"]].map(([v, l]) => (
              <button
                type="button"
                key={v}
                onClick={() => setCountryCode(v)}
                className={`px-3 py-1.5 rounded-md border text-sm font-medium transition ${
                  countryCode === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background hover:bg-muted/60"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12"
            required
          />
        </div>
        <div className="flex items-start gap-2 pt-1">
          <Checkbox
            id="consent"
            checked={consent}
            onCheckedChange={(v) => setConsent(v === true)}
            className="mt-1"
          />
          <label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed">
            I confirm I have read and accept the <TermsDialog /> and the{" "}
            <a href="/privacy" target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline underline-offset-4">
              Privacy Policy
            </a>
            , and my{" "}
            <a href="/terms" target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline underline-offset-4">
              consent to electronic communications, records and e-signatures
            </a>{" "}
            as set out therein.
          </label>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading || !consent}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}