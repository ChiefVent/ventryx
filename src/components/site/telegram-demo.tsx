import type { ReactNode } from "react";

export function TelegramDemo() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg-elevated">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="grid size-8 place-items-center rounded-full bg-accent text-xs font-medium text-accent-fg">
          TM
        </span>
        <div>
          <p className="text-sm font-medium leading-none">TradesMate</p>
          <p className="mt-1 text-xs text-subtle">Telegram · online</p>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <Bubble who="you">Photo of Chadwicks receipt</Bubble>
        <Bubble who="bot">
          Logged. Chadwicks · €47.80 · materials.
          <br />
          Sheet updated.
        </Bubble>
        <Bubble who="you">Quote for Mrs Byrne, 2 radiators, Tallaght</Bubble>
        <Bubble who="bot">
          Draft quote Q-184 · €620 incl. VAT.
          <br />
          Send it, or change the price?
        </Bubble>
        <Bubble who="you">Send it</Bubble>
        <Bubble who="bot">Sent. I’ll chase if it’s unpaid next Monday.</Bubble>
      </div>
    </div>
  );
}

function Bubble({
  who,
  children,
}: {
  who: "you" | "bot";
  children: ReactNode;
}) {
  const mine = who === "you";
  return (
    <div className={mine ? "flex justify-end" : "flex justify-start"}>
      <p
        className={
          mine
            ? "max-w-[85%] rounded-lg rounded-br-xs bg-accent px-3 py-2 text-sm leading-relaxed text-accent-fg"
            : "max-w-[85%] rounded-lg rounded-bl-xs bg-surface px-3 py-2 text-sm leading-relaxed text-fg"
        }
      >
        {children}
      </p>
    </div>
  );
}
