export function GhostDemo() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg-elevated">
      <div className="border-b border-border px-5 py-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          Your town · Ireland
        </p>
        <p className="mt-2 font-serif text-3xl leading-tight">Your business</p>
        <p className="mt-2 text-sm text-muted">A one-page site from a Google listing</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="inline-flex h-10 items-center rounded-full bg-fg px-4 text-sm font-medium text-bg">
            Call
          </span>
          <span className="inline-flex h-10 items-center rounded-full border border-border-strong px-4 text-sm">
            WhatsApp
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-border text-center">
        <Stat k="4.5" v="Google" />
        <Stat k="Open" v="till 3pm" />
        <Stat k="Est." v="2014" />
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="px-3 py-4">
      <p className="font-serif text-xl">{k}</p>
      <p className="mt-1 text-xs text-subtle">{v}</p>
    </div>
  );
}
