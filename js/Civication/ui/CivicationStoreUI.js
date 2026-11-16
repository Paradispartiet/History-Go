(function () {
  "use strict";

  /** @typedef {{ id?: string|number, store_id?: string|number, title?: string, price_pc?: number, price?: number, price_band?: string, category?: string }} CiviStorePack */
  /** @typedef {{ id?: string|number, name?: string, type?: string, blurb?: string }} CiviStoreDef */

  function formatPc(n) {
    const num = Number(n || 0);
    return Number.isFinite(num) ? num.toLocaleString("no-NO") : "0";
  }

  const formatNok = (/** @type {number} */ value) => Number(value).toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  let purchaseMessage = "";
  /** @param {HTMLElement} host @param {any[]} stores @param {any[]} packs @param {any} wallet @param {any} shop */
  function renderNokStore(host, stores, packs, wallet, shop) {
    const node = (/** @type {string} */ tag, /** @type {string} */ text) => {
      const el = document.createElement(tag); el.textContent = text; return el;
    };
    const panel = node("div", "");
    const heading = node("h3", "Dagligvarer"); heading.tabIndex = -1; panel.appendChild(heading);
    panel.appendChild(node("p", "Saldo: " + formatNok(wallet.balance) + " kr"));
    panel.appendChild(node("p", "Daterte prisreferanser. Spillkjøp uten levering. Varer kan kjøpes flere ganger; ingen automatisk månedlig belastning."));
    for (const store of stores) {
      panel.appendChild(node("h4", String(store.name || "Butikk")));
      for (const pack of packs.filter(p => p.store_id === store.id)) {
        const row = node("div", "");
        row.appendChild(node("strong", String(pack.title || "Vare")));
        row.appendChild(node("p", String(pack.unitLabel || "") + " · " + formatNok(pack.priceNok) + " kr"));
        row.appendChild(node("p", "Priskilde: " + String(pack.retailer || "") + " · Kontrollert: " + String(pack.checkedOn || "")));
        row.appendChild(node("p", "På lager: " + String(wallet.nok_v1.shopping?.quantities?.[pack.id] || 0) + " pakninger"));
        const button = /** @type {HTMLButtonElement} */ (node("button", "Kjøp én pakning"));
        button.type = "button"; button.className = "btn";
        button.setAttribute("data-buy-pack", String(pack.id));
        button.disabled = !Number.isFinite(pack.priceNok) || pack.priceNok <= 0 || !Number.isFinite(wallet.balance) || wallet.balance < pack.priceNok;
        const requestId = shop.createPurchaseRequest();
        button.addEventListener("click", async () => {
          button.disabled = true;
          try {
            const result = await shop.buyPack(pack.id, requestId);
            purchaseMessage = result?.ok ? (result.skipped ? "Kjøpet var allerede registrert." : "Varen er kjøpt.")
              : result?.reason === "NOT_ENOUGH_PC" ? "Ikke nok penger. Ingen vare er kjøpt." : "Varen kunne ikke kjøpes.";
          } catch { purchaseMessage = "Kjøpet kunne ikke bekreftes. Sjekk saldo og beholdning før nytt forsøk."; }
          await renderStorePanel();
          const next = /** @type {HTMLButtonElement|undefined} */ (Array.from(host.querySelectorAll("[data-buy-pack]")).find(b => b.getAttribute("data-buy-pack") === String(pack.id)));
          (next && !next.disabled ? next : host.querySelector("h3"))?.focus({ preventScroll: true });
        });
        row.appendChild(button); panel.appendChild(row);
      }
    }
    if (!packs.length) panel.appendChild(node("p", "Ingen dokumenterte varepriser er tilgjengelige her ennå."));
    const status = node("p", purchaseMessage); status.setAttribute("role", "status"); panel.appendChild(status);
    host.replaceChildren(panel);
  }

  async function renderStorePanel() {
    const host = document.getElementById("civiStorePanel");
    if (!host) return;

    const shop = window.HG_CiviShop;
    if (!shop?.getVisibleStores || !shop?.getVisiblePacks) {
      host.innerHTML = `<div class="muted">Store-systemet er ikke lastet.</div>`;
      return;
    }

    const [stores, packs] = /** @type {[CiviStoreDef[], CiviStorePack[]]} */ (await Promise.all([
      shop.getVisibleStores(),
      shop.getVisiblePacks()
    ]));

    const rawWallet = /** @type {any} */ (window.CivicationState?.getWallet?.()
      ?? (typeof window.getPCWallet === "function" ? window.getPCWallet() : null));
    const wallet = typeof rawWallet === "number" ? { balance: rawWallet } : rawWallet;
    if (wallet?.nok_v1?.active === true) {
      renderNokStore(host, stores, packs, wallet, shop);
      return;
    }
    const inv = /** @type {{ packs?: Record<string, unknown> }} */ (shop.getInv?.() || {});
    const owned = inv.packs || {};

    if (!stores.length && !packs.length) {
      host.innerHTML = `<div class="muted">Ingen tydelige butikker er åpne ennå. Lås opp flere steder i History Go for å gjøre byens kommersielle liv brukbart i Civication.</div>`;
      return;
    }

    host.innerHTML = `
      <div class="latest-knowledge-box">
        <div class="lk-topic">Tilgjengelige butikker og pakker</div>
        <div class="lk-category">PC-saldo: <strong>${formatPc(wallet?.balance || 0)}</strong></div>
        <div class="lk-text">Dette er butikker og pakker som faktisk finnes i livsverdenen din nå fordi du har åpnet relevante steder i History Go eller valgt nabolag i Civication.</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px;">
        ${stores.map(function (store) {
          const offered = packs.filter((pack) => String(pack?.store_id || "") === String(store?.id || ""));
          return `
            <div style="padding:12px;border:1px solid rgba(255,255,255,0.10);border-radius:14px;background:rgba(255,255,255,0.04);">
              <div style="font-weight:700;">${store?.name || "Butikk"}</div>
              <div style="font-size:0.92rem;opacity:0.85;margin-top:4px;">Type: ${store?.type || "generic"}</div>
              <div style="margin-top:8px;line-height:1.45;">${store?.blurb || ""}</div>
              <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">
                ${offered.length ? offered.map(function (pack) {
                  const isOwned = !!owned[String(pack?.id || "")];
                  return `
                    <div style="padding:10px;border:1px solid rgba(255,255,255,0.08);border-radius:12px;background:rgba(255,255,255,0.03);">
                      <div style="font-weight:600;">${pack?.title || "Pakke"}</div>
                      <div style="font-size:0.9rem;opacity:0.85;">Pris: ${formatPc(pack?.price_pc || pack?.price || 0)} PC · Bånd: ${pack?.price_band || "—"}</div>
                      <div style="font-size:0.88rem;opacity:0.78;margin-top:4px;">Kategori: ${pack?.category || "—"}</div>
                      <div style="margin-top:8px;">${isOwned ? "Allerede kjøpt" : `<button class="btn" data-buy-pack="${pack?.id || ""}">Kjøp</button>`}</div>
                    </div>
                  `;
                }).join("") : `<div class="muted">Ingen pakker synlige her akkurat nå.</div>`}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    host.querySelectorAll("[data-buy-pack]").forEach(function (btn) {
      const buyBtn = /** @type {HTMLButtonElement} */ (btn);
      btn.addEventListener("click", async function () {
        const packId = buyBtn.getAttribute("data-buy-pack");
        if (!packId) return;
        buyBtn.disabled = true;
        const res = /** @type {{ ok?: boolean }} */ (await shop.buyPack(packId));
        buyBtn.disabled = false;
        if (!res?.ok) return;
        renderStorePanel();
      });
    });
  }

  window.CivicationStoreUI = {
    render: renderStorePanel
  };

  document.addEventListener("DOMContentLoaded", renderStorePanel);
  window.addEventListener("updateProfile", renderStorePanel);
  window.addEventListener("civi:homeChanged", renderStorePanel);
})();
