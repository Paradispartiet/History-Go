(function (/** @type {any} */ root) {
  "use strict";
  let message = "";
  const money = (/** @type {unknown} */ value) => typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "Ukjent";
  function node(/** @type {string} */ tag, text = "") {
    const el = document.createElement(tag);
    el.textContent = text;
    return el;
  }
  function render() {
    const host = document.getElementById("civiEconomyPanel");
    if (!host) return;
    const focused = host.contains(document.activeElement);
    const focusedId = focused ? document.activeElement?.getAttribute("data-nok-invoice") : null;
    const wallet = root.CivicationState?.getWallet?.();
    const nok = wallet?.nok_v1;
    const active = nok?.active === true && nok?.version === 1;
    const panel = node("div");
    panel.className = "latest-knowledge-box";
    const heading = node("h3", "Min økonomi");
    heading.tabIndex = -1;
    panel.appendChild(heading);
    panel.appendChild(node("p", "Saldo: " + money(wallet?.balance) + (active ? " kr (PC)" : " PC")));
    if (!active) {
      panel.appendChild(node("p", "Kroneøkonomien er ikke aktivert. Eksisterende saldo og kjøp beholdes."));
    } else {
      const month = root.CivicationCalendar?.getMonthPeriod?.();
      panel.appendChild(node("p", "Spillmåned: " + (month?.id || "Ukjent")));
      const days = /** @type {Array<Record<string, any>>} */ (Array.isArray(nok.earnedDays) ? nok.earnedDays : []);
      const earned = days.filter(d => d.monthId === month?.id);
      const sum = (/** @type {string} */ key) => earned.every(d => Number.isSafeInteger(d[key]))
        ? earned.reduce((total, d) => total + d[key], 0) / 100 : null;
      const gross = sum("grossCents");
      const tax = sum("taxCents");
      panel.appendChild(node("p", "Opptjent brutto denne måneden: " + money(gross) + " kr"));
      panel.appendChild(node("p", "Estimert skatt: " + money(tax) + " kr"));
      panel.appendChild(node("p", "Opptjent netto: " + money(gross !== null && tax !== null ? gross - tax : null) + " kr"));
      panel.appendChild(node("p", "Lønn utbetales etter spillmånedens slutt. Skatt er et årsberegnet spillestimat."));
      const ledger = /** @type {Array<Record<string, any>>} */ (Array.isArray(nok.payrollLedger) ? nok.payrollLedger : []);
      const last = ledger[ledger.length - 1];
      if (last) panel.appendChild(node("p", "Siste lønnsoppgjør (" + last.monthId + "): "
        + money((last.grossCents - last.taxCents) / 100) + " kr netto"));
      panel.appendChild(node("h4", "Regninger"));
      const invoices = /** @type {Array<Record<string, any>>} */ (Array.isArray(nok.invoices) ? nok.invoices : []);
      if (!invoices.length) panel.appendChild(node("p", "Ingen registrerte regninger."));
      for (const invoice of invoices) {
        const row = node("div");
        row.style.overflowWrap = "anywhere";
        row.appendChild(node("p", String(invoice.title || invoice.contractId || invoice.id || "Regning")
          + " · " + money(invoice.amountNok) + " kr · Forfall: " + String(invoice.dueDateISO || "Ukjent")));
        if (invoice.status === "paid") row.appendChild(node("p", "Betalt " + String(invoice.paidDateISO || "")));
        else if (invoice.status === "pending") {
          const button = /** @type {HTMLButtonElement} */ (node("button", "Betal"));
          button.type = "button";
          button.className = "btn";
          button.setAttribute("data-nok-invoice", String(invoice.id || ""));
          button.setAttribute("aria-label", "Betal " + String(invoice.title || invoice.contractId || "regning") + ", " + money(invoice.amountNok) + " kroner");
          const date = root.CivicationCalendar?.getGameDate?.();
          const due = typeof invoice.dueDateISO === "string" && !!date && date >= invoice.dueDateISO;
          const affordable = typeof wallet?.balance === "number" && Number.isFinite(wallet.balance)
            && typeof invoice.amountNok === "number" && Number.isFinite(invoice.amountNok)
            && invoice.amountNok >= 0 && wallet.balance >= invoice.amountNok;
          button.disabled = !due || !affordable || !root.CivicationEconomyEngine?.payNokInvoice;
          button.addEventListener("click", () => {
            button.disabled = true;
            try {
              const result = root.CivicationEconomyEngine.payNokInvoice(invoice.id);
              message = result?.ok ? (result.skipped ? "Regningen var allerede betalt." : "Regningen er betalt.")
                : result?.reason === "NOT_ENOUGH_PC" ? "Ikke nok penger. Regningen er fortsatt ubetalt."
                : "Regningen kunne ikke betales. Ingen betaling er bekreftet.";
            } catch { message = "Betalingen kunne ikke bekreftes. Sjekk saldo og regningsstatus før nytt forsøk."; }
            render();
          });
          row.appendChild(button);
          if (!due) row.appendChild(node("p", "Ikke forfalt ennå."));
          else if (!affordable) row.appendChild(node("p", "Ikke nok penger til å betale."));
        } else row.appendChild(node("p", "Regningsstatus er ukjent."));
        panel.appendChild(row);
      }
    }
    const status = node("p", message);
    status.setAttribute("role", "status");
    panel.appendChild(status);
    host.replaceChildren(panel);
    if (focused) {
      const buttons = Array.from(host.querySelectorAll("button[data-nok-invoice]"));
      const next = /** @type {HTMLButtonElement|undefined} */ (buttons.find(b => b.getAttribute("data-nok-invoice") === focusedId));
      (next && !next.disabled ? next : heading).focus({ preventScroll: true });
    }
  }
  root.CivicationEconomyUI = { render };
  document.addEventListener("DOMContentLoaded", render);
  root.addEventListener("updateProfile", render);
  root.addEventListener("civi:dayPhaseChanged", render);
})(typeof window !== "undefined" ? window : globalThis);
