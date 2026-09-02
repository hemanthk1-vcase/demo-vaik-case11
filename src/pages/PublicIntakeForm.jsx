import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function PublicIntakeForm() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("getIntakeForm", { form_id: formId });
        const data = res?.data ?? res;
        let parsed = [];
        try {
          parsed = JSON.parse(data.form?.form_fields || "[]");
        } catch {
          parsed = [];
        }
        setForm(data.form);
        setFields(Array.isArray(parsed) ? parsed : []);
      } catch (err) {
        setError(err?.response?.data?.error || "This form is not available.");
      } finally {
        setLoading(false);
      }
    })();
  }, [formId]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const missing = fields.filter((f) => f.required && !String(answers[f.label] ?? "").trim());
    if (missing.length) {
      setError(`${missing[0].label} is required`);
      return;
    }
    setSubmitting(true);
    try {
      const get = (type) => {
        const f = fields.find((x) => x.type === type);
        return f ? answers[f.label] || "" : "";
      };
      const res = await base44.functions.invoke("submitIntakeForm", {
        form_id: formId,
        answers,
        submitter_name: get("name"),
        submitter_email: get("email"),
        submitter_phone: get("phone"),
      });
      const data = res?.data ?? res;
      setDone(data.success_message || "Thank you — your submission has been received.");
    } catch (err) {
      setError(err?.response?.data?.error || "Could not submit — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-sm border border-border p-8">
        {done ? (
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold">Submission received</h1>
            <p className="text-muted-foreground mt-2">{done}</p>
          </div>
        ) : error && !form ? (
          <div className="text-center">
            <BrandLogo className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-xl font-bold">Form unavailable</h1>
            <p className="text-muted-foreground mt-2">{error}</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <BrandLogo className="h-16 w-16 mx-auto mb-3" />
              <h1 className="text-2xl font-bold tracking-tight">{form.form_name}</h1>
              {form.form_description && (
                <p className="text-muted-foreground mt-1">{form.form_description}</p>
              )}
            </div>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            <form onSubmit={submit} className="space-y-4">
              {fields.map((f) => (
                <div key={f.label} className="space-y-2">
                  <Label htmlFor={f.label}>
                    {f.label}
                    {f.required && <span className="text-destructive"> *</span>}
                  </Label>
                  {f.type === "textarea" ? (
                    <Textarea
                      id={f.label}
                      rows={4}
                      value={answers[f.label] ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [f.label]: e.target.value }))}
                    />
                  ) : (
                    <Input
                      id={f.label}
                      type={f.type === "date" ? "date" : f.type === "email" ? "email" : f.type === "phone" ? "tel" : "text"}
                      value={answers[f.label] ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [f.label]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
              <Button type="submit" className="w-full h-11 font-medium" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}