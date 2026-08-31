import React from "react";
import { Quote } from "lucide-react";

const NOTE = `The practice of law has evolved, but the tools lawyers use haven't. I've seen firsthand how fragmented systems, outdated processes, and endless paperwork weigh down legal professionals who should be focused on what matters most — their cases and their clients.

VakilCase was born from a simple conviction: legal professionals deserve the same technological sophistication that other industries have enjoyed for years. We're not just building software — we're building trust, transparency, and a future where access to justice doesn't depend on geography.

Whether you're a solo practitioner or a growing firm, whether you practice in New York, London, or Bangalore — VakilCase scales with you. This is the future of legal practice. And it starts here.`;

export default function FounderNote() {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10">
          <Quote className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-base font-semibold">A Message from Our Founder</h3>
      </div>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        {NOTE.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">— Hemanth Kumar, Founder &amp; CEO</p>
    </div>
  );
}