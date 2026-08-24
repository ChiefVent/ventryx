import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/site/shell";
import { TelegramDemo } from "@/components/site/telegram-demo";

export const Route = createFileRoute("/tradesmate")({ component: TradesMatePage });

const ITEMS = [
  "Receipt scanning with duplicate detection",
  "Quotes priced at your own rates",
  "Invoices and Monday payment chasing",
  "Voice job logging on the way home",
  "Mileage for tax relief",
  "Weekly profit snapshot every Friday",
  "Review requests after paid invoices",
  "Quote to invoice in one command",
];

function TradesMatePage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6 md:pt-24">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          TradesMate
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
          No apps. No dashboards. No logins. Just Telegram.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          Built for plumbers, electricians, carpenters and the rest of the van
          fleet. Start a chat. Answer five questions. Done.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href="https://t.me/TradesMateAIBot" rel="noreferrer">
              Message @TradesMateAIBot
              <ArrowUpRight />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/contact">Ask a question</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-4 pb-8 sm:px-6">
        <TelegramDemo />
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        <div>
          <h2 className="font-serif text-3xl">What it handles</h2>
          <p className="mt-4 text-muted">
            One Telegram bot. Your own Google Sheet behind it. Flat €99 a month.
            14-day trial, no card required to start.
          </p>
          <p className="mt-6 font-mono text-sm text-fg">€99 / month · public price</p>
        </div>
        <ul className="space-y-3">
          {ITEMS.map((item) => (
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
