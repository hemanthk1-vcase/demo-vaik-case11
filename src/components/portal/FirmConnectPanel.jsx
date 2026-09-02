import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BrandLogo from "@/components/BrandLogo";

const genCode = () => "VC-" + Math.random().toString(36).slice(2, 8).toUpperCase();

/**
 * Shown in the Client Portal when the signed-in user has no client record yet.
 * Lawyers see their unique firm code (with copy / generate); clients can
 * connect to a firm by entering the code their lawyer shared with them.
 */
export default function FirmConnectPanel({ me }) {
  const isLawyer = me?.account_type === "lawyer";
  const [code, setCode] = useState(me?.firm_code || "");
  const [copied, setCopied] = useState(false);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generate = async () => {
    setBusy(true);
    try {
      const c = genCode();
      await base44.auth.updateMe({ firm_code: c });
      setCode(c);
    } catch {
      setMsg({ ok: false, text: "Could not generate your code — please try again." });
    } finally {
      setBusy(false);
    }
  };

  const connect = async () => {
    const c = input.trim().toUpperCase();
    if (c.length < 4) {
      setMsg({ ok: false, text: "Enter the firm code your lawyer shared with you." });
      return;
    }
    setBusy(true);
    try {
      await base44.auth.updateMe({ connected_firm_code: c });
      setMsg({
        ok: true,
        text: `Connection request sent to firm ${c}. Your matters will appear here once the firm confirms your access.`,
      });
      setInput("");
    } catch {
      setMsg({ ok: false, text: "Could not send the request — please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <BrandLogo className="h-16 w-16 mx-auto" />
        {isLawyer ? (
          <>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Your firm is ready</h1>
            <p className="mt-3 text-slate-600">
              Share this unique firm code with your clients so they can connect to you instantly.
            </p>
            {code ? (
              <>
                <div className="mt-5 inline-flex items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 px-6 py-3">
                  <span className="text-2xl font-bold tracking-widest text-slate-900">{code}</span>
                  <button onClick={copyCode} className="text-slate-400 hover:text-slate-900" title="Copy firm code">
                    {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                {copied && <p className="mt-2 text-xs text-emerald-600">Copied to clipboard</p>}
              </>
            ) : (
              <Button className="mt-5" onClick={generate} disabled={busy}>
                {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Generate my firm code
              </Button>
            )}
          </>
        ) : (
          <>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">No firm connected yet</h1>
            <p className="mt-3 text-slate-600">
              Your lawyer can send you a secure invite by email — or connect instantly with your
              firm's unique code.
            </p>
            <div className="mt-5 text-left space-y-2">
              <Label htmlFor="firm-code">Firm code</Label>
              <div className="flex gap-2">
                <Input
                  id="firm-code"
                  placeholder="e.g. VC-A1B2C3"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="h-11 uppercase"
                />
                <Button className="h-11" onClick={connect} disabled={busy}>
                  {busy ? "Sending..." : "Connect"}
                </Button>
              </div>
              {msg && (
                <p className={`text-sm ${msg.ok ? "text-emerald-600" : "text-destructive"}`}>{msg.text}</p>
              )}
            </div>
          </>
        )}
        <div className="mt-6 flex justify-center">
          <Button variant="outline" asChild>
            <Link to="/welcome"><ArrowLeft className="w-4 h-4 mr-1" /> Back to website</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}