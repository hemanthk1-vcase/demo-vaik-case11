import { Quote } from 'lucide-react';

export default function FounderNote() {
  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Quote className="h-5 w-5 text-primary" />
        <h2 className="font-heading text-lg font-semibold">A Message from Our Founder</h2>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        The practice of law has evolved, but the tools lawyers use haven't. I've seen firsthand how fragmented systems, outdated processes, and endless paperwork weigh down legal professionals who should be focused on what matters most — their cases and their clients. VakilCase was born from a simple conviction: legal professionals deserve the same technological sophistication that other industries have enjoyed for years. We're not just building software — we're building trust, transparency, and a future where access to justice doesn't depend on geography. Whether you're a solo practitioner or a growing firm, whether you practice in New York, London, or Bangalore — VakilCase scales with you. This is the future of legal practice. And it starts here.
      </p>
      <p className="mt-4 text-sm font-medium text-foreground">— Hemanth Kumar, Founder &amp; CEO</p>
    </div>
  );
}