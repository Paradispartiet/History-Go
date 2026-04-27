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

    modal.querySelector(".nature-card-title").textContent = obj.title || obj.name || obj.id || "";
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

  // ------------------------------------------------------------
  // PlaceCard bridge
  // ------------------------------------------------------------
  // PlaceCard sin Natur-runding leser legacy-feltet place.flora.
  // Dette bygger feltet fra den kanoniske naturkilden:
  // data/natur/nature_unlock_map.json.
  // ------------------------------------------------------------

  let natureMapPromise = null;
  let natureIndexPromise = null;

  function normId(value) {
    return String(value || "").trim();
  }

  function quizKeyToPlaceId(key) {
    return normId(key).replace(/_quiz_\d+$/, "");
  }

  async function loadNatureUnlockMap() {
    if (natureMapPromise) return natureMapPromise;

    natureMapPromise = (async () => {
      const url = new URL("data/natur/nature_unlock_map.json", document.baseURI).toString();
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Kunne ikke laste nature_unlock_map.json: ${res.status}`);
      const data = await res.json();
      return data && typeof data === "object" ? data : {};
    })();

    return natureMapPromise;
  }

  function flattenNatureEntriesForBridge(arr, kind) {
    const out = [];

    (Array.isArray(arr) ? arr : []).forEach(entry => {
      if (!entry || typeof entry !== "object") return;

      if (entry.kind === "emne_pack" && Array.isArray(entry.items)) {
        entry.items.forEach(item => {
          if (item && typeof item === "object" && item.id) out.push(normalizeNatureForPlaceCard(item, kind));
        });
        return;
      }

      if (entry.id) out.push(normalizeNatureForPlaceCard(entry, kind));
    });

    return out;
  }

  function normalizeNatureForPlaceCard(obj, kind) {
    const title = obj.title || obj.name || obj.taxonomy?.norsk_navn || obj.id || "";
    const desc =
      obj.desc ||
      obj.description ||
      (Array.isArray(obj.kjennetegn) ? obj.kjennetegn.join(" · ") : "") ||
      "";

    return {
      ...obj,
      _kind: obj._kind || kind,
      name: obj.name || title,
      title,
      desc,
      image: obj.image || obj.imageCard || obj.img || "bilder/merker/natur.PNG"
    };
  }

  async function ensureNatureIndexForPlaceCard() {
    if (natureIndexPromise) return natureIndexPromise;

    natureIndexPromise = (async () => {
      if ((!Array.isArray(window.FLORA) || !Array.isArray(window.FAUNA)) && window.DataHub?.loadNature) {
        try { await window.DataHub.loadNature(); } catch {}
      }

      const flora = flattenNatureEntriesForBridge(window.FLORA || [], "flora");
      const fauna = flattenNatureEntriesForBridge(window.FAUNA || [], "fauna");

      const floraById = Object.create(null);
      const faunaById = Object.create(null);

      flora.forEach(obj => { if (obj.id) floraById[normId(obj.id)] = obj; });
      fauna.forEach(obj => { if (obj.id) faunaById[normId(obj.id)] = obj; });

      // Normaliser globale naturdata uten å blande flora og fauna.
      window.FLORA = flora;
      window.FAUNA = fauna;

      return { floraById, faunaById };
    })();

    return natureIndexPromise;
  }

  function idsForPlaceFromMap(map, placeId) {
    const pid = normId(placeId);
    const out = { flora: [], fauna: [] };
    if (!pid) return out;

    const floraSeen = new Set();
    const faunaSeen = new Set();

    for (const [quizOrPlaceId, hit] of Object.entries(map || {})) {
      if (quizKeyToPlaceId(quizOrPlaceId) !== pid) continue;

      (Array.isArray(hit?.flora) ? hit.flora : []).forEach(id => {
        const x = normId(id);
        if (x && !floraSeen.has(x)) {
          floraSeen.add(x);
          out.flora.push(x);
        }
      });

      (Array.isArray(hit?.fauna) ? hit.fauna : []).forEach(id => {
        const x = normId(id);
        if (x && !faunaSeen.has(x)) {
          faunaSeen.add(x);
          out.fauna.push(x);
        }
      });
    }

    return out;
  }

  async function getNatureForPlace(placeId) {
    const map = await loadNatureUnlockMap();
    const { floraById, faunaById } = await ensureNatureIndexForPlaceCard();
    const ids = idsForPlaceFromMap(map, placeId);

    return [
      ...ids.flora.map(id => floraById[id]).filter(Boolean),
      ...ids.fauna.map(id => faunaById[id]).filter(Boolean)
    ];
  }

  async function getNatureById(id) {
    const key = normId(id);
    if (!key) return null;

    const { floraById, faunaById } = await ensureNatureIndexForPlaceCard();
    return floraById[key] || faunaById[key] || null;
  }

  async function linkPlaceCardNatureFromMap() {
    const places = Array.isArray(window.PLACES) ? window.PLACES : [];
    if (!places.length) return;

    const map = await loadNatureUnlockMap();
    const { floraById } = await ensureNatureIndexForPlaceCard();

    places.forEach(place => {
      const ids = idsForPlaceFromMap(map, place?.id);
      const floraIds = ids.flora.filter(id => floraById[id]);
      if (!floraIds.length) return;

      const existing = Array.isArray(place.flora) ? place.flora : [];
      const next = [...new Set([...existing, ...floraIds].map(normId).filter(Boolean))];
      place.flora = next;
    });

    try { window.dispatchEvent(new Event("hg:place-nature-linked")); } catch {}
  }

  function installNatureBridge() {
    window.HGNatureUnlocks = window.HGNatureUnlocks || {};
    window.HGNatureUnlocks.getForPlace = getNatureForPlace;
    window.HGNatureUnlocks.getById = getNatureById;
    window.HGNatureUnlocks.linkPlaceCardNatureFromMap = linkPlaceCardNatureFromMap;

    const originalShowFloraPopup = window.showFloraPopup;
    if (typeof originalShowFloraPopup === "function" && !originalShowFloraPopup.__hgNatureCardBridge) {
      window.showFloraPopup = function showNatureObjectPopup(obj) {
        if (obj && typeof window.openNatureCard === "function") {
          return window.openNatureCard(obj);
        }
        return originalShowFloraPopup(obj);
      };
      window.showFloraPopup.__hgNatureCardBridge = true;
    }

    window.addEventListener("hg:nature-loaded", () => {
      linkPlaceCardNatureFromMap().catch(e => console.warn("[place-card nature bridge]", e));
    });

    // Hvis naturdata allerede er lastet før event-listeneren kom på plass.
    setTimeout(() => {
      if (Array.isArray(window.PLACES) && Array.isArray(window.FLORA)) {
        linkPlaceCardNatureFromMap().catch(e => console.warn("[place-card nature bridge]", e));
      }
    }, 0);
  }

  window.openNatureCard = openNatureCard;
  window.closeNatureCard = closeNatureCard;

  installNatureBridge();
})();
