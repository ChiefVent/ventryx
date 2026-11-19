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
          <span className="tmd-round" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
          </span>
          <div className="tmd-title">
            <img className="tmd-avatar" src="/images/tradesmate-bot.png" alt="" width={36} height={36} />
            <div className="tmd-who">
              <b>TradesMate AI</b>
              <span data-el="status">bot</span>
            </div>
          </div>
          <span className="tmd-round" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="12" cy="19" r="1.8" />
            </svg>
          </span>
        </div>
        <div className="tmd-pin" aria-hidden="true">
          <div className="tmd-pin-text">
            <b>Pinned Message</b>
            <span>📌 Your money · updated today</span>
          </div>
          <span className="tmd-pin-btn">📊 Open my money</span>
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
            <span className="tmd-menu" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Menu
            </span>
            <div className="tmd-field empty" data-el="field">
              Message
            </div>
            <span className="tmd-clip" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5l-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.9-8.9a3.7 3.7 0 0 1 5.2 5.2l-8.9 8.9a1.8 1.8 0 0 1-2.6-2.6l8.2-8.2" />
              </svg>
            </span>
            <span className="tmd-send" data-el="send" aria-hidden="true">
              <svg className="mic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
                <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
              </svg>
              <svg className="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
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
