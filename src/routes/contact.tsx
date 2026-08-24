import { createFileRoute } from "@tanstack/react-router";
import { ContactForm } from "@/components/site/contact-form";
import { SiteShell } from "@/components/site/shell";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  return (
    <SiteShell>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
            Contact
          </p>
          <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">
            Get in touch with the studio.
          </h1>
          <p className="mt-5 max-w-md leading-relaxed text-muted">
            Partnerships, Ghost Site previews, custom builds, or just curious.
            We respond within 24 hours.
          </p>
          <dl className="mt-10 space-y-5 text-sm">
            <div>
              <dt className="text-subtle">Email</dt>
              <dd className="mt-1">
                <a className="text-fg underline underline-offset-4" href="mailto:chief@ventryx.io">
                  chief@ventryx.io
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-subtle">Telegram</dt>
              <dd className="mt-1">
                <a
                  className="text-fg underline underline-offset-4"
                  href="https://t.me/TradesMateAIBot"
                  rel="noreferrer"
                >
                  @TradesMateAIBot
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-subtle">Studio</dt>
              <dd className="mt-1 text-fg">Dublin, Ireland</dd>
            </div>
          </dl>
        </div>
        <ContactForm />
      </section>
    </SiteShell>
  );
}
