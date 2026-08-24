import { Link } from "@tanstack/react-router";
import { VentryxMark } from "@/components/brand/mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <VentryxMark />
            <span className="font-serif text-xl">Ventryx</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            A Dublin AI studio building vertical products for Irish service
            businesses. No generic tools. One industry at a time.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-subtle">
            Products
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <Link to="/tradesmate" className="hover:text-fg">
                TradesMate
              </Link>
            </li>
            <li>
              <Link to="/ghost" className="hover:text-fg">
                Ghost Website
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-subtle">
            Studio
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <Link to="/contact" className="hover:text-fg">
                Contact
              </Link>
            </li>
            <li>
              <a href="mailto:chief@ventryx.io" className="hover:text-fg">
                chief@ventryx.io
              </a>
            </li>
            <li>Dublin, Ireland</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 Ventryx Studio. All rights reserved.</p>
          <p>ventryx.io</p>
        </div>
      </div>
    </footer>
  );
}
