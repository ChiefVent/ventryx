import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { VentryxMark } from "@/components/brand/mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/tradesmate", label: "TradesMate" },
  { href: "/ghost", label: "Ghost Website" },
  { href: "/#studio", label: "Studio" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 text-fg"
          onClick={() => setOpen(false)}
        >
          <VentryxMark className="size-8" />
          <span className="font-serif text-xl tracking-tight">Ventryx</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex" aria-label="Primary">
          {NAV.map((item) =>
            item.href.startsWith("/") && !item.href.includes("#") ? (
              <Link
                key={item.href}
                to={item.href}
                className="transition-colors hover:text-fg"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-fg"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="outline" size="sm">
            <a href="https://t.me/TradesMateAIBot" rel="noreferrer">
              Try TradesMate
            </a>
          </Button>
          <Button asChild size="sm">
            <Link to="/contact">Talk to us</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full border border-border text-fg md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className={cn(
          "border-t border-border bg-bg md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3" aria-label="Mobile">
          {NAV.map((item) =>
            item.href.startsWith("/") && !item.href.includes("#") ? (
              <Link
                key={item.href}
                to={item.href}
                className="min-h-11 py-3 text-base text-fg"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="min-h-11 py-3 text-base text-fg"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ),
          )}
          <div className="flex flex-col gap-2 py-3">
            <Button asChild>
              <a href="https://t.me/TradesMateAIBot" rel="noreferrer">
                Try TradesMate
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact" onClick={() => setOpen(false)}>
                Talk to us
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
