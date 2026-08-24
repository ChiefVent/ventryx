import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/site/shell";
import { GhostDemo } from "@/components/site/ghost-demo";

export const Route = createFileRoute("/ghost")({ component: GhostPage });

const INCLUDED = [
  "One-page site from a Google listing — no brief required",
  "Call and WhatsApp buttons, large enough to tap on site",
  "Hours, address, parking / public transport notes",
  "Google rating and selected reviews, shown up front",
  "Map, Instagram, and directions",
  "Irish English copy — not American brochure-speak",
  "Mobile-first layout. Preview before anything goes live",
  "Hosting, domain help, and a small monthly keep-alive",
];

const STEPS = [
  {
    n: "01",
    t: "Send a listing",
    d: "A Google Maps link, or the business name and town. That’s the brief.",
  },
  {
    n: "02",
    t: "We draft the site",
    d: "Hours, reviews, photos, phone, tone. You get a preview — not a live page.",
  },
  {
    n: "03",
    t: "You approve. We publish.",
    d: "Nothing goes live, no domain is bought, until you say so.",
  },
];

function GhostPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6 md:pt-24">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          Ghost Website
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
          A proper website for businesses that still live on Google.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          Cafés, trades, salons, garages — thousands of Irish operators have
          reviews and a phone number, and nothing else. Ghost Website turns
          that listing into a one-page site they can send to customers.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/contact">Request a preview</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="mailto:chief@ventryx.io?subject=Ghost%20Website%20preview">
              Email a Google listing
            </a>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-4 pb-8 sm:px-6">
        <GhostDemo />
      </section>

      <section className="border-y border-border bg-bg-elevated">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
            How it works
          </p>
          <h2 className="mt-3 max-w-xl font-serif text-3xl tracking-tight">
            No questionnaire. No six-week web project.
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <article key={s.n} className="border-t border-border pt-6">
                <p className="font-mono text-sm text-accent">{s.n}</p>
                <h3 className="mt-3 font-serif text-2xl">{s.t}</h3>
                <p className="mt-3 leading-relaxed text-muted">{s.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        <div>
          <h2 className="font-serif text-3xl">What’s on the page</h2>
          <p className="mt-4 text-muted">
            Built for people who search on their phone, then call. Public
            price. Preview first — we never publish without your say-so.
          </p>
          <p className="mt-6 font-mono text-sm text-fg">
            €99 setup + €19 / month
          </p>
        </div>
        <ul className="space-y-3">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-3 text-fg">
              <Check className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.8} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </SiteShell>
  );
}
