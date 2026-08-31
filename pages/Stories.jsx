import { Target, Compass, Heart, Eye, Globe, Lock } from 'lucide-react';

const VALUES = [
  {
    icon: Eye,
    title: 'Transparency',
    text: 'Legal work has too often been a black box. We bring clarity — real-time case updates, clear billing, and open communication between lawyers and the clients they serve.'
  },
  {
    icon: Globe,
    title: 'Accessibility',
    text: "Justice shouldn't depend on geography or the size of a firm. VakilCase works the way you do — across jurisdictions, languages, and currencies."
  },
  {
    icon: Lock,
    title: 'Security',
    text: 'In law, confidentiality is a foundation, not a feature. Bank-level encryption, role-based access, and audit trails are built into everything we build.'
  }
];

export default function Stories() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 lg:px-10">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Our Story</p>
      <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight">
        Building the future of legal practice
      </h1>
      <p className="mt-4 text-base text-muted-foreground leading-relaxed">
        VakilCase exists to bridge the gap between a centuries-old profession and the modern
        technology it deserves — one platform for the entire lifecycle of legal work.
      </p>

      <section className="mt-14">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-xl font-semibold">Our Mission</h2>
        </div>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          To democratize legal technology for lawyers and clients alike. We believe the tools to
          run a modern legal practice shouldn't be reserved for large firms with deep pockets.
          VakilCase puts the same powerful, secure, and intuitive platform in the hands of solo
          practitioners, growing firms, and the clients they serve — across the United States, the
          United Kingdom, and India. When the tools are equal, the quality of legal service can be
          too.
        </p>
      </section>

      <section className="mt-14">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-xl font-semibold">The Journey</h2>
        </div>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          VakilCase began with a simple observation: lawyers were spending more time juggling
          fragmented tools and paperwork than actually practicing law. Founded by Hemanth Kumar,
          the company set out to build a single platform covering the entire lifecycle of legal
          practice — from client onboarding and case management to billing, document storage, and
          court updates. What started as an effort to reduce inefficiency has grown into a mission
          to make quality legal service more accessible to everyone, everywhere.
        </p>
      </section>

      <section className="mt-14">
        <div className="flex items-center gap-2 mb-5">
          <Heart className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-xl font-semibold">Our Values</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}