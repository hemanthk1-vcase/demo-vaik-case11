import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Scale } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUGGESTIONS = [
  "What documents are typically needed for estate planning?",
  "Summarize the key deadlines in a personal injury claim",
  "Draft a short client update on a pending hearing",
];

function MessageBubble({ role, text }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export default function AiAssistant() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  const ask = async (q) => {
    const text = (q ?? question).trim();
    if (!text || loading) return;
    setQuestion("");
    setError("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await base44.functions.invoke("aiAssistant", { question: text });
      setMessages((m) => [...m, { role: "assistant", text: res.data.answer }]);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold">AI Legal Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Research, draft, and summarize — right inside Vakil Case.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm flex flex-col h-[62vh]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-muted mb-4">
                <Scale className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="font-medium">Ask me anything</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Legal research, first drafts, case summaries — answered in the platform.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => ask(s)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} text={m.text} />
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="px-4 pb-2 text-sm text-destructive">{error}</p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask();
          }}
          className="border-t border-border p-3 flex gap-2"
        >
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a legal research question…"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !question.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        AI-generated answers — verify against current law and your jurisdiction before relying on them.
      </p>
    </div>
  );
}