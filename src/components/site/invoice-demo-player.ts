/**
 * Plays the TradesMate invoice conversation inside a `.tmd` root element.
 * The wording follows what the bot sends today (TM-04 Smart Invoice, TM-18 PDF).
 * Returns a function that stops playback.
 */
const JOB = {
  typed: "invoice Mary Murphy 1200 install EV charger",
  customer: "Mary Murphy",
  first: "Mary",
  customerAddress: "4 Oak Park, Swords, Co. Dublin",
  description: "install EV charger",
  item: "EV charger",
  net: 1200,
  rate: 13.5,
  number: "INV-0042",
  business: "Kavanagh Electrical",
  businessAddress: "12 Main Street, Lucan, Co. Dublin, K78 XY12",
  iban: "IE29 AIBK 9311 5212 3456 78",
  bic: "AIBKIE2D",
  vatNo: "IE1234567T",
};

type Key = { label: string; half?: boolean; el?: HTMLElement };

const STALE = Symbol("stale");
const pad = (n: number) => String(n).padStart(2, "0");
const fmtDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const eur = (n: number) => `€${n.toFixed(2)}`;
const eurSep = (n: number) =>
  `€${n.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function startDemo(root: HTMLElement): () => void {
  const el = <T extends HTMLElement = HTMLElement>(name: string) =>
    root.querySelector<T>(`[data-el="${name}"]`)!;
  const msgs = el("msgs");
  const field = el("field");
  const send = el("send");
  const status = el("status");
  const sheet = el("sheet");
  const tapEl = el("tap");
  const steps = Array.from(el("steps").children);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let run = 0;

  const today = new Date();
  const due = new Date(today.getTime() + 14 * 864e5);
  const vat = Math.round(JOB.net * JOB.rate) / 100;
  const total = JOB.net + vat;
  const fileName = `Invoice ${JOB.number}.pdf`;

  const clock = () => {
    const d = new Date();
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const sleep = (ms: number, id: number) =>
    new Promise<void>((resolve, reject) => {
      window.setTimeout(() => (id === run ? resolve() : reject(STALE)), reduced ? 0 : ms);
    });
  const toBottom = () => msgs.scrollTo({ top: msgs.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  const setStep = (n: number) => steps.forEach((s, i) => s.classList.toggle("on", i <= n));
  const openSheet = (open: boolean) => {
    sheet.classList.toggle("open", open);
    sheet.setAttribute("aria-hidden", open ? "false" : "true");
  };
  const glow = (on: boolean) =>
    root.querySelectorAll("[data-hl]").forEach((n) => n.classList.toggle("glow", on));

  function add(side: "me" | "bot", html: string, extra = "") {
    const row = document.createElement("div");
    row.className = `tmd-row ${side} ${extra}`.trim();
    row.innerHTML = `<div class="tmd-bubble">${html}<span class="tmd-meta">${clock()}${side === "me" ? " ✓✓" : ""}</span></div>`;
    msgs.appendChild(row);
    toBottom();
    return row;
  }
  function addKeys(row: HTMLElement, keys: Key[]) {
    const wrap = document.createElement("div");
    wrap.className = "tmd-keys";
    for (const k of keys) {
      const b = document.createElement("div");
      b.className = `tmd-key${k.half ? " half" : ""}`;
      b.textContent = k.label;
      wrap.appendChild(b);
      k.el = b;
    }
    row.appendChild(wrap);
    toBottom();
  }
  async function botTyping(ms: number, id: number, label = "typing…") {
    status.textContent = label;
    status.className = "live";
    const row = document.createElement("div");
    row.className = "tmd-row bot narrow";
    row.innerHTML = '<div class="tmd-bubble"><span class="tmd-dots"><i></i><i></i><i></i></span></div>';
    if (!reduced) {
      msgs.appendChild(row);
      toBottom();
    }
    try {
      await sleep(ms, id);
    } finally {
      row.remove();
      status.textContent = "bot";
      status.className = "";
    }
  }
  async function tap(target: HTMLElement, id: number) {
    // Scroll inside the chat only, never the page.
    const box = msgs.getBoundingClientRect();
    const r0 = target.getBoundingClientRect();
    if (r0.bottom > box.bottom - 8) msgs.scrollTop += r0.bottom - box.bottom + 16;
    else if (r0.top < box.top + 8) msgs.scrollTop -= box.top - r0.top + 16;
    await sleep(350, id);
    const host = tapEl.parentElement!.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    tapEl.style.left = `${r.left - host.left + r.width / 2}px`;
    tapEl.style.top = `${r.top - host.top + r.height / 2}px`;
    tapEl.classList.remove("go");
    void tapEl.offsetWidth;
    tapEl.classList.add("go");
    await sleep(200, id);
    target.classList.add("pressed");
    await sleep(380, id);
    target.classList.remove("pressed");
  }
  async function typeOut(text: string, id: number) {
    field.classList.remove("empty");
    field.classList.add("typing");
    field.textContent = "";
    for (let i = 0; i < text.length; i++) {
      field.textContent += text[i];
      field.scrollLeft = field.scrollWidth;
      if (i === 0) send.classList.add("ready");
      await sleep(text[i] === " " ? 95 : 42 + Math.random() * 50, id);
    }
    await sleep(450, id);
    send.classList.add("pressed");
    await sleep(160, id);
    send.classList.remove("pressed", "ready");
    field.classList.remove("typing");
    field.classList.add("empty");
    field.textContent = "Message";
  }

  function buildPaper() {
    el("sheet-name").textContent = fileName;
    el("paper").innerHTML =
      `<div class="p-top"><div><div class="p-biz">${JOB.business}</div>` +
      `<div class="p-grey p-hl" data-hl>${JOB.businessAddress}</div></div>` +
      `<div class="p-title"><b>Invoice</b><span>${JOB.number}</span></div></div>` +
      `<hr class="p-rule">` +
      `<div class="p-cols"><div><span class="p-label">BILLED TO</span><b>${JOB.customer}</b>` +
      `<div class="p-grey p-hl" data-hl>${JOB.customerAddress}</div></div>` +
      `<div><span class="p-label">ISSUED</span>${fmtDate(today)}</div>` +
      `<div><span class="p-label">DUE</span><b class="p-due">${fmtDate(due)}</b></div></div>` +
      `<div class="p-table"><div class="p-tr head"><span>DESCRIPTION</span><span>AMOUNT</span></div>` +
      `<div class="p-tr"><span>${JOB.description}</span><span>${eur(JOB.net)}</span></div></div>` +
      `<div class="p-totals"><div><span>Subtotal</span><span>${eur(JOB.net)}</span></div>` +
      `<div><span>VAT ${JOB.rate}%</span><span>${eur(vat)}</span></div>` +
      `<div class="due"><span>Total due</span><span>${eur(total)}</span></div></div>` +
      `<div class="p-bank"><span class="p-label">PAY BY BANK TRANSFER</span>` +
      `<div><span class="p-grey">Account name</span><span>${JOB.business}</span></div>` +
      `<div><span class="p-grey">IBAN</span><span>${JOB.iban}</span></div>` +
      `<div><span class="p-grey">BIC</span><span>${JOB.bic}</span></div>` +
      `<div><span class="p-grey">Reference</span><span class="p-mono">${JOB.number}</span></div></div>` +
      `<p class="p-small">Payment terms: 14 days. Please use the reference above so your payment can be matched.<br>VAT no. ${JOB.vatNo}</p>` +
      `<p class="p-foot">Sent on behalf of ${JOB.business} using TradesMate AI</p>`;
  }

  async function play() {
    const id = ++run;
    msgs.innerHTML = '<div class="tmd-day">Today</div>';
    openSheet(false);
    glow(false);
    setStep(-1);
    el("end").hidden = true;
    el("composer").hidden = false;
    field.className = "tmd-field empty";
    field.textContent = "Message";
    send.className = "tmd-send";
    try {
      await sleep(900, id);

      setStep(0);
      await typeOut(JOB.typed, id);
      add("me", JOB.typed);
      await sleep(500, id);

      await botTyping(1400, id);
      setStep(1);
      const question = add(
        "bot",
        `<p><b>🧮 Quick VAT check before I make it</b></p>` +
          `<p>${JOB.customer} · ${JOB.description} · ${eurSep(JOB.net)} before VAT</p>` +
          `<p>This job includes: <b>${JOB.item}</b>. Install and repair work is 13.5% VAT only while the materials (before VAT) are no more than two-thirds of the price. If they are more, the whole invoice is 23%.</p>` +
          `<p>Two-thirds of ${eurSep(JOB.net)} is ${eurSep((JOB.net * 2) / 3)}. Were the materials more than that?</p>` +
          `<p><i>Not sure? Ask your accountant. Nothing is made until you tap.</i></p>`,
      );
      const vatKeys: Key[] = [
        { label: "Materials under two-thirds: 13.5%" },
        { label: "Materials over two-thirds: 23%" },
        { label: "✖️ Cancel" },
      ];
      addKeys(question, vatKeys);
      await sleep(3200, id);
      await tap(vatKeys[0].el!, id);
      vatKeys[0].el!.classList.add("chosen");

      await botTyping(1500, id);
      setStep(2);
      const invoice = add(
        "bot",
        `<p>✅ <b>Invoice Created</b></p>` +
          `<p>📋 <b>${JOB.number}</b><br>👤 ${JOB.customer}<br>🔧 ${JOB.description}</p>` +
          `<p>💰 ${eur(JOB.net)} + VAT ${JOB.rate}% ${eur(vat)}<br>💵 <b>Total: ${eur(total)}</b><br>📅 Due: ${fmtDate(due)}</p>` +
          `<p>Logged to your sheet ✅</p>` +
          `<p>When ${JOB.first} pays, just tell me: <b>paid ${JOB.first}</b></p>`,
      );
      const invoiceKeys: Key[] = [
        { label: "✅ Mark paid", half: true },
        { label: "📧 Email it", half: true },
        { label: "💬 WhatsApp it", half: true },
        { label: "📄 PDF", half: true },
        { label: "📋 Copy details" },
      ];
      addKeys(invoice, invoiceKeys);
      await sleep(3000, id);
      await tap(invoiceKeys[3].el!, id);

      await botTyping(1300, id, "sending a file…");
      setStep(3);
      const doc = add(
        "bot",
        `<button class="tmd-doc" type="button" aria-label="Open ${fileName}">` +
          `<span class="tmd-doc-ico" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg></span>` +
          `<span><span class="tmd-doc-name">${fileName}</span><span class="tmd-doc-size">41.6 KB · PDF</span></span></button>` +
          `📄 ${JOB.number} for ${JOB.customer} – ${eur(total)}, due ${fmtDate(due)}<br>Forward this PDF straight to them.`,
      );
      const docButton = doc.querySelector<HTMLElement>(".tmd-doc")!;
      docButton.addEventListener("click", () => openSheet(true));

      if (!reduced) {
        await sleep(1800, id);
        await tap(docButton, id);
        openSheet(true);
        await sleep(1100, id);
        glow(true);
        await sleep(2400, id);
        glow(false);
      }
    } catch (error) {
      if (error !== STALE) throw error;
      return;
    }
    el("composer").hidden = true;
    el("end").hidden = false;
  }

  buildPaper();
  const onReplay = () => void play();
  const onClose = () => openSheet(false);
  const replays = root.querySelectorAll<HTMLElement>("[data-replay]");
  replays.forEach((b) => b.addEventListener("click", onReplay));
  el("sheet-close").addEventListener("click", onClose);

  // Start when the phone scrolls into view, once.
  const phone = el("phone");
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        void play();
      }
    },
    { threshold: 0.4 },
  );
  observer.observe(phone);

  return () => {
    run++;
    observer.disconnect();
    replays.forEach((b) => b.removeEventListener("click", onReplay));
    el("sheet-close").removeEventListener("click", onClose);
  };
}
