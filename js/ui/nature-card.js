// js/ui/nature-card.js
// HGNatureCard — modal med full detaljvisning for flora/fauna-objekter.
// Bruker #natureCard-modal (injiseres ved første åpning).

(function () {
  "use strict";

  function ensureModal() {
    let modal = document.getElementById("natureCard");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "natureCard";
    modal.className = "nature-card-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.style.display = "none";

    modal.innerHTML = `
      <div class="nature-card-inner" role="dialog" aria-modal="true">
        <button class="nature-card-close" type="button" aria-label="Lukk">✕</button>
        <div class="nature-card-image-wrap">
          <img class="nature-card-image" alt="">
          <span class="nature-card-icon" aria-hidden="true"></span>
        </div>
        <div class="nature-card-body">
          <header class="nature-card-head">
            <h2 class="nature-card-title"></h2>
            <p class="nature-card-latin"></p>
            <p class="nature-card-family muted"></p>
            <p class="nature-card-unlocked-hint"></p>
          </header>
          <div class="nature-card-sections"></div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeNatureCard();
    });
    modal.querySelector(".nature-card-close").addEventListener("click", closeNatureCard);

    return modal;
  }

  function closeNatureCard() {
    const modal = document.getElementById("natureCard");
    if (!modal) return;
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") closeNatureCard();
  }

  function sectionHTML(title, html) {
    if (!html) return "";
    return `
      <section class="nature-card-section">
        <h3>${title}</h3>
        ${html}
      </section>
    `;
  }

  function listHTML(items) {
    const arr = Array.isArray(items) ? items.filter(x => x && String(x).trim() && String(x).trim() !== "-") : [];
    if (!arr.length) return "";
    return `<ul>${arr.map(x => `<li>${escapeHtml(String(x))}</li>`).join("")}</ul>`;
  }

  function dlHTML(pairs) {
    const rows = pairs.filter(([, v]) => v && (Array.isArray(v) ? v.length : true));
    if (!rows.length) return "";
    return `
      <dl class="nature-dl">
        ${rows.map(([k, v]) => `
          <dt>${escapeHtml(k)}</dt>
          <dd>${Array.isArray(v) ? escapeHtml(v.filter(Boolean).join(", ")) : escapeHtml(String(v))}</dd>
        `).join("")}
      </dl>
    `;
  }

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    }[c]));
  }

  function openNatureCard(obj) {
    if (!obj || typeof obj !== "object") return;

    const modal = ensureModal();
    const root = modal.querySelector(".nature-card-inner");
    const kind = obj._kind || (obj.related_fauna_id ? "fauna" : obj.related_flora_id ? "flora" : "flora");

    root.dataset.kind = kind;

    modal.querySelector(".nature-card-title").textContent = obj.title || obj.id || "";
    modal.querySelector(".nature-card-latin").textContent = obj.latin || obj.taxonomy?.latin_navn || "";
    modal.querySelector(".nature-card-family").textContent = obj.taxonomy?.familie ? `Familie: ${obj.taxonomy.familie}` : "";

    const img = modal.querySelector(".nature-card-image");
    const iconEl = modal.querySelector(".nature-card-icon");
    const imgSrc = (typeof window.resolveNatureImage === "function") ? window.resolveNatureImage(obj, kind) : "";
    if (imgSrc) {
      img.src = imgSrc;
      img.style.display = "";
      iconEl.textContent = "";
      img.onerror = () => {
        img.onerror = null;
        img.style.display = "none";
        iconEl.textContent = kind === "fauna" ? "🐞" : "🌿";
      };
    } else {
      img.removeAttribute("src");
      img.style.display = "none";
      iconEl.textContent = kind === "fauna" ? "🐞" : "🌿";
    }

    const unlocked = (typeof window.isNatureUnlocked === "function")
      ? window.isNatureUnlocked(obj.id)
      : false;
    const hint = modal.querySelector(".nature-card-unlocked-hint");
    hint.textContent = unlocked
      ? "✔ Låst opp — du har samlet denne."
      : "🔒 Ikke samlet ennå. Ta en quiz på riktig sted.";
    hint.className = "nature-card-unlocked-hint " + (unlocked ? "is-unlocked" : "is-locked");

    const sections = modal.querySelector(".nature-card-sections");
    sections.innerHTML = [
      sectionHTML("Kjennetegn", listHTML(obj.kjennetegn)),
      sectionHTML("Habitat", dlHTML([
        ["Biotop", obj.habitat?.biotop],
        ["Jord", obj.habitat?.jord],
        ["Lys", obj.habitat?.lys],
        ["Fukt", obj.habitat?.fukt],
      ])),
      sectionHTML("Fenologi", dlHTML([
        ["Aktiv", obj.fenologi?.aktiv],
        ["Blomstring", obj.fenologi?.blomstring],
        ["Strategi", obj.fenologi?.strategi],
      ])),
      sectionHTML("Økologi", dlHTML([
        ["Rolle", obj.økologi?.rolle],
        ["Samspill", obj.økologi?.samspill],
      ])),
      sectionHTML("I byen", dlHTML([
        ["Typiske steder", obj.bykontekst?.typiske_steder],
        ["Observert typisk", obj.bykontekst?.oslo_observert_typisk],
      ])),
      sectionHTML("Observasjonstips", listHTML(obj.observasjonstips)),
      `<section class="nature-card-section nature-card-places" data-places-slot>
         <h3>${unlocked ? "Her samlet du den" : "Hvor du kan finne den"}</h3>
         <div class="nature-places-loading muted">Leter etter steder …</div>
       </section>`,
    ].filter(Boolean).join("");

    modal.style.display = "";
    modal.setAttribute("aria-hidden", "false");
    document.addEventListener("keydown", onKeyDown);

    renderPlacesForNature(modal, obj.id, unlocked);
  }

  async function renderPlacesForNature(modal, natureId, unlocked) {
    const slot = modal.querySelector("[data-places-slot]");
    if (!slot) return;

    let places = [];
    try {
      if (typeof window.getNaturePlaces === "function") {
        places = await window.getNaturePlaces(natureId);
      }
    } catch {}

    if (!places.length) {
      slot.innerHTML = `
        <h3>${unlocked ? "Her samlet du den" : "Hvor du kan finne den"}</h3>
        <p class="muted">Ingen steder koblet til denne arten ennå.</p>
      `;
      return;
    }

    const items = places.slice(0, 6).map(({ place, distance }) => {
      const distLabel = distance != null ? ` · ${distance} m` : "";
      return `
        <li class="nature-place-item" data-place-id="${escapeHtml(String(place.id))}">
          <button type="button" class="nature-place-btn">
            <span class="nature-place-title">${escapeHtml(place.name || place.id)}</span>
            <span class="nature-place-meta">${escapeHtml(place.category || "")}${distLabel}</span>
          </button>
        </li>
      `;
    }).join("");

    slot.innerHTML = `
      <h3>${unlocked ? "Her samlet du den" : "Hvor du kan finne den"}</h3>
      <ul class="nature-places-list">${items}</ul>
    `;

    slot.querySelectorAll(".nature-place-btn").forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        const place = places[idx]?.place;
        if (!place) return;
        if (typeof window.flyToPlace === "function") window.flyToPlace(place);
        closeNatureCard();
      });
    });
  }

  window.openNatureCard = openNatureCard;
  window.closeNatureCard = closeNatureCard;
})();
