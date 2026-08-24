import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  FileText,
  MapPin,
  MessageCircle,
  Mic,
  Receipt,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/site/shell";
import { ContactForm } from "@/components/site/contact-form";
import { TelegramDemo } from "@/components/site/telegram-demo";
import { GhostDemo } from "@/components/site/ghost-demo";

export const Route = createFileRoute("/")({ component: Home });

const TRADES = [
  "Plumbers",
  "Electricians",
  "Carpenters",
  "Cleaners",
  "Cafés",
  "Landscapers",
  "Sole traders",
];

const FEATURES = [
  {
    icon: Receipt,
    title: "Receipt scanning",
    body: "Photo of a receipt becomes a logged expense. Duplicate detection included.",
  },
  {
    icon: FileText,
    title: "Quotes & invoices",
    body: "Priced at your rates. Convert a quote to an invoice with one command.",
  },
  {
    icon: Mic,
    title: "Voice job logging",
    body: "Speak the job on the way home. It writes itself into your records.",
  },
  {
    icon: MessageCircle,
    title: "Payment chasing",
    body: "Polite Monday reminders for unpaid invoices. You stay the good guy.",
  },
  {
    icon: MapPin,
    title: "Mileage tracker",
    body: "Log trips for tax relief without another spreadsheet.",
  },
  {
    icon: Star,
    title: "Review requests",
    body: "Automatic after every paid invoice — while the job is still warm.",
  },
];

function Home() {
  return (
    <SiteShell>
      <Hero />
      <Ticker />
      <Products />
      <How />
      <Features />
      <Studio />
      <Close />
    </SiteShell>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 md:pt-24 md:pb-24">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent">
        Dublin · Built for Irish operators
      </p>
      <h1 className="mt-6 max-w-4xl font-serif text-4xl leading-[1.05] tracking-tight text-fg sm:text-6xl lg:text-[5.25rem]">
        AI that does the admin.
        <span className="italic text-fg/80"> You do the work.</span>
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
        Vertical AI products for Irish micro-businesses. No extra apps. No
        dashboards. Tools that meet you where you already are.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button asChild size="lg">
          <a href="https://t.me/TradesMateAIBot" rel="noreferrer">
            Try TradesMate free
            <ArrowUpRight />
          </a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/ghost">See Ghost Website</Link>
        </Button>
      </div>
      <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-border pt-8">
        <div>
          <dt className="text-xs uppercase tracking-[0.16em] text-subtle">TradesMate</dt>
          <dd className="mt-2 font-mono text-sm">€99 / month</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.16em] text-subtle">Ghost Website</dt>
          <dd className="mt-2 font-mono text-sm">€99 setup</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.16em] text-subtle">Studio</dt>
          <dd className="mt-2 font-mono text-sm">Dublin</dd>
        </div>
      </dl>
    </section>
  );
}

function Ticker() {
  return (
    <div className="border-y border-border bg-bg-elevated">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-4 text-xs font-medium uppercase tracking-[0.18em] text-muted sm:px-6">
        {TRADES.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function Products() {
  return (
    <section id="products" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
        Products
      </p>
      <h2 className="mt-3 max-w-2xl font-serif text-3xl tracking-tight sm:text-4xl">
        Built for the way Irish businesses actually work.
      </h2>
      <p className="mt-4 max-w-2xl text-muted">
        We don’t sell generic chatbots. We go deep on one industry at a time —
        language, workflow, and taboos included.
      </p>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface p-2">
          <TelegramDemo />
          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              Live · Telegram
            </p>
            <h3 className="mt-2 font-serif text-3xl">TradesMate</h3>
            <p className="mt-3 flex-1 leading-relaxed text-muted">
              The office manager in your pocket. Receipts, quotes, invoices,
              mileage and payment chasing — all from Telegram. No app. No
              login.
            </p>
            <p className="mt-5 font-mono text-sm text-fg">€99 / month · 14-day trial</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/tradesmate">See how it works</Link>
              </Button>
              <Button asChild variant="outline">
                <a href="https://t.me/TradesMateAIBot" rel="noreferrer">
                  Open in Telegram
                </a>
              </Button>
            </div>
          </div>
        </article>

        <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface p-2">
          <GhostDemo />
          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
              New
            </p>
            <h3 className="mt-2 font-serif text-3xl">Ghost Website</h3>
            <p className="mt-3 flex-1 leading-relaxed text-muted">
              A professional one-page website from a Google listing. Ready in
              a day. Built for trades, cafés and anyone who still lives on
              reviews.
            </p>
            <p className="mt-5 font-mono text-sm text-fg">€99 setup + €19 / month</p>
            <div className="mt-6">
              <Button asChild>
                <Link to="/ghost">See Ghost Website</Link>
              </Button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function How() {
  const steps = [
    {
      n: "01",
      t: "Meet you where you are",
      d: "Telegram, Google listing, or a short call. Nobody downloads another app.",
    },
    {
      n: "02",
      t: "Do the boring work",
      d: "Quotes, receipts, websites — handled with your approval on anything that goes public.",
    },
    {
      n: "03",
      t: "Stay in the job",
      d: "You keep the tools and the hours. We keep the admin moving while you’re on site.",
    },
  ];
  return (
    <section id="how" className="border-y border-border bg-bg-elevated">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          How it works
        </p>
        <h2 className="mt-3 max-w-xl font-serif text-3xl tracking-tight sm:text-4xl">
          Talk to us on the way home.
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <article key={s.n} className="border-t border-border pt-6">
              <p className="font-mono text-sm text-accent">{s.n}</p>
              <h3 className="mt-3 font-serif text-2xl">{s.t}</h3>
              <p className="mt-3 leading-relaxed text-muted">{s.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
        TradesMate
      </p>
      <h2 className="mt-3 max-w-2xl font-serif text-3xl tracking-tight sm:text-4xl">
        The whole office, without the office.
      </h2>
      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <article key={f.title} className="bg-bg p-6 sm:p-7">
            <f.icon className="size-5 text-accent" strokeWidth={1.6} />
            <h3 className="mt-4 font-medium text-fg">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Studio() {
  const points = [
    {
      t: "Vertical over horizontal",
      d: "Every trade has its own language. We respect that — Revenue, Chadwicks, RCD boards and all.",
    },
    {
      t: "Ship, then talk",
      d: "Our first customer was live 21 days after first code. Iterate with operators, not decks.",
    },
    {
      t: "Small team, serious work",
      d: "We’re building what small operators actually want — not another bloated platform.",
    },
  ];
  return (
    <section id="studio" className="border-y border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
            Studio
          </p>
          <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
            A Dublin studio. Not a Silicon Valley template.
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-muted">
            Ventryx is based in Dublin, building vertical AI products for Irish
            service businesses. Public prices. No “contact sales” theatre.
          </p>
        </div>
        <div className="space-y-8">
          {points.map((p) => (
            <article key={p.t} className="border-t border-border pt-5">
              <h3 className="font-serif text-xl">{p.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Close() {
  return (
    <section id="contact" className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          Get in touch
        </p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">
          Try TradesMate, or talk about a custom build.
        </h2>
        <p className="mt-4 max-w-md leading-relaxed text-muted">
          Studio enquiries, partnerships, Ghost Site previews. We respond within
          24 hours. Urgent? Email{" "}
          <a className="text-fg underline underline-offset-4" href="mailto:chief@ventryx.io">
            chief@ventryx.io
          </a>
          .
        </p>
      </div>
      <ContactForm />
    </section>
  );
}
