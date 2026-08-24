import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const subject = encodeURIComponent(`Ventryx enquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
    window.location.href = `mailto:chief@ventryx.io?subject=${subject}&body=${body}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8">
        <p className="font-serif text-2xl text-fg">We’ll be in touch.</p>
        <p className="mt-3 text-muted">
          Your mail client should open with the message ready. If it doesn’t,
          write to{" "}
          <a className="text-fg underline underline-offset-4" href="mailto:chief@ventryx.io">
            chief@ventryx.io
          </a>
          . We reply within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">What can we help with?</Label>
        <Textarea
          id="message"
          name="message"
          required
          minLength={12}
          placeholder="TradesMate trial, a Ghost Site, a custom build…"
        />
      </div>
      <Button type="submit" size="lg">
        Send message
      </Button>
    </form>
  );
}
