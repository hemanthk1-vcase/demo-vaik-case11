import { Quote } from 'lucide-react';

export default function FoundersNote() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 lg:px-10">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Founder's Note</p>
      <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight">Why VakilCase exists</h1>

      <div className="mt-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-base font-semibold">
          HK
        </div>
        <div>
          <div className="text-sm font-medium">Hemanth Kumar</div>
          <div className="text-xs text-muted-foreground">Founder &amp; CEO, VakilCase</div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-primary">
        <Quote className="h-5 w-5" />
        <span className="text-xs uppercase tracking-widest text-muted-foreground">A personal note</span>
      </div>

      <div className="mt-4 space-y-5 text-sm text-muted-foreground leading-relaxed">
        <p>
          When I first spent time around legal professionals, one thing struck me immediately: the
          people responsible for navigating our most complex, high-stakes problems were themselves
          navigating some of the most outdated, fragmented tools I had ever seen. Spreadsheets for
          case tracking. Shared inboxes for client communication. Paper files that could be lost in
          an instant. The contrast was hard to ignore.
        </p>
        <p>
          VakilCase started with a simple question: what if running a legal practice felt as modern
          and seamless as the rest of the software we use every day? Not a patchwork of
          disconnected tools, but one platform — built for the way lawyers and clients actually
          work.
        </p>
        <p>
          We built VakilCase for the solo practitioner taking on their first client, and for the
          growing firm juggling hundreds of cases. For the lawyer in New York, London, and
          Bangalore. For the client who deserves to know where their case stands without having to
          ask. Security, transparency, and accessibility aren't features we added later — they're
          the foundation we started from.
        </p>
        <p>
          This is still early. We're listening, learning, and building every day. If you're here,
          you're part of that journey. Thank you for trusting us with your practice.
        </p>
      </div>

      <div className="mt-8 border-t border-border pt-6 text-sm font-medium text-foreground">
        — Hemanth Kumar, Founder &amp; CEO
      </div>
    </div>
  );
}