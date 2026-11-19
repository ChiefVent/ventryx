import { useEffect, useRef } from "react";
import { startDemo } from "./invoice-demo-player";
import "./invoice-demo.css";

/** A phone-sized chat that plays one real TradesMate conversation: one typed line to a VAT invoice PDF. */
export function InvoiceDemo() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => (root.current ? startDemo(root.current) : undefined), []);

  return (
    <div ref={root} className="tmd">
      <div className="tmd-side">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">See it work</p>
        <h2>One line in. One invoice out.</h2>
        <p>
          This is the conversation the bot has today, played back for you. It all happens in a
          Telegram chat.
        </p>
        <ol className="tmd-steps" data-el="steps">
          <li>Type the job in one line</li>
          <li>Answer one VAT question</li>
          <li>Invoice numbered and logged</li>
          <li>PDF with both addresses, ready to forward</li>
        </ol>
        <button className="tmd-btn" type="button" data-replay>
          Replay
        </button>
        <p className="tmd-fine">Example names, addresses and bank details.</p>
      </div>

      <div className="tmd-phone" data-el="phone" aria-label="TradesMate chat demo">
        <div className="tmd-head">
          <span className="tmd-avatar" aria-hidden="true">
            TM
          </span>
          <div className="tmd-who">
            <b>TradesMate</b>
            <span data-el="status">bot</span>
          </div>
        </div>
        <div className="tmd-body">
          <div className="tmd-msgs" data-el="msgs" aria-live="polite">
            <div className="tmd-day">Today</div>
          </div>
          <div className="tmd-sheet" data-el="sheet" aria-hidden="true">
            <div className="tmd-sheet-bar">
              <span data-el="sheet-name" />
              <button type="button" data-el="sheet-close" aria-label="Close invoice">
                ×
              </button>
            </div>
            <div className="tmd-sheet-scroll">
              <div className="tmd-paper" data-el="paper" />
            </div>
          </div>
          <span className="tmd-tap" data-el="tap" aria-hidden="true" />
        </div>
        <div className="tmd-foot">
          <div className="tmd-composer" data-el="composer">
            <div className="tmd-field empty" data-el="field">
              Message
            </div>
            <span className="tmd-send" data-el="send" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </span>
          </div>
          <div className="tmd-end" data-el="end" hidden>
            <a
              className="tmd-btn primary"
              href="https://t.me/TradesMateAIBot"
              target="_blank"
              rel="noreferrer"
            >
              Try it free on Telegram
            </a>
            <button className="tmd-btn" type="button" data-replay>
              Replay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
