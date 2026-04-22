(function () {
  "use strict";

  function formatPc(n) {
    const num = Number(n || 0);
    return Number.isFinite(num) ? num.toLocaleString("no-NO") : "0";
  }

  async function renderStorePanel() {
    const host = document.getElementById("civiStorePanel");
    if (!host) return;

    const shop = window.HG_CiviShop;
    if (!shop?.getVisibleStores || !shop?.getVisiblePacks) {
      host.innerHTML = `<div class="muted">Store-systemet er ikke lastet.</div>`;
      return;
    }

    const [stores, packs] = await Promise.all([
      shop.getVisibleStores(),
      shop.getVisiblePacks()
    ]);

    const wallet = typeof window.getPCWallet === "function"
      ? window.getPCWallet()
      : { balance: 0 };
    const owned = shop.getInv?.()?.packs || {};

    if (!stores.length && !packs.length) {
      host.innerHTML = `<div class="muted">Ingen tydelige butikker er åpne ennå. Lås opp flere steder i History Go for å gjøre byens kommersielle liv brukbart i Civication.</div>`;
      return;
    }

    host.innerHTML = `
      <div class="latest-knowledge-box">
        <div class="lk-topic">Tilgjengelige butikker og pakker</div>
        <div class="lk-category">PC-saldo: <strong>${formatPc(wallet?.balance || 0)}</strong></div>
        <div class="lk-text">Dette er butikker og pakker som faktisk finnes i livsverdenen din nå fordi du har åpnet relevante steder i History Go.</div>
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
      btn.addEventListener("click", async function () {
        const packId = btn.getAttribute("data-buy-pack");
        if (!packId) return;
        btn.disabled = true;
        const res = await shop.buyPack(packId);
        btn.disabled = false;
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
})();
