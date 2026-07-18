// js/ui/nature-unlock-toast.js
// HGNatureUnlockToast — lytter på hg:nature og viser et kort, feirende
// popup for hver art brukeren låser opp via quiz.
//
// Event-kontrakt (fra HGNatureUnlocks.recordFromQuiz):
//   detail.added = { flora: [id, ...], fauna: [id, ...] }
//
// For hver id slår vi opp tittel/latin/bilde i window.FLORA/FAUNA,
// med fallback til emoji hvis ingenting finnes.
//
// Denne tidlig lastede naturmodulen bootstrapper også artskortet og
// place-map-broen når den kritiske app-runtime er klar. Det gjør at
// Natur-rundingen igjen viser alle kartlagte flora- og faunaarter.

(function () {
  "use strict";

  const STACK_ID = "natureUnlockStack";
  let naturePlaceCardRuntimePromise = null;

  function tUI(key, fallback = "") {
    try {
      return window.HG_I18N?.t?.(key, fallback) || fallback;
    } catch {
      return fallback;
    }
  }

  function tfUI(key, fallback = "", vars = {}) {
    const template = tUI(key, fallback);
    return String(template).replace(/\{(\w+)\}/g, (_, name) =>
      Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : `{${name}}`
    );
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
  const AUTO_DISMISS_MS = 4500;

  function ensureStack() {
    let stack = document.getElementById(STACK_ID);
    if (stack) return stack;
    stack = document.createElement("div");
    stack.id = STACK_ID;
    stack.className = "nature-unlock-stack";
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);
    return stack;
  }

  function findEntry(id, kind) {
    const needle = String(id || "").trim();
    if (!needle) return null;

    const list = kind === "fauna" ? (window.FAUNA || []) : (window.FLORA || []);
    const altKey = kind === "fauna" ? "related_fauna_id" : "related_flora_id";

    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      if (item.id === needle || item[altKey] === needle) return item;
      if (item.kind === "emne_pack" && Array.isArray(item.items)) {
        for (const sub of item.items) {
          if (sub && (sub.id === needle || sub[altKey] === needle)) return sub;
        }
      }
    }
    return null;
  }

  function loadRuntimeScript(src, isReady) {
    if (isReady()) return Promise.resolve();

    window.__HG_NATURE_RUNTIME_SCRIPT_PROMISES__ = window.__HG_NATURE_RUNTIME_SCRIPT_PROMISES__ || Object.create(null);
    if (window.__HG_NATURE_RUNTIME_SCRIPT_PROMISES__[src]) {
      return window.__HG_NATURE_RUNTIME_SCRIPT_PROMISES__[src];
    }

    window.__HG_NATURE_RUNTIME_SCRIPT_PROMISES__[src] = new Promise((resolve, reject) => {
      const absolute = new URL(src, document.baseURI).href;
      const existing = Array.from(document.scripts || []).find(script => {
        const attr = script.getAttribute("src") || "";
        if (!attr) return false;
        try { return new URL(attr, document.baseURI).href === absolute; } catch { return attr === src; }
      });

      const finish = () => {
        if (isReady()) resolve();
        else reject(new Error(`Natur-runtime lastet uten forventet API: ${src}`));
      };

      if (existing) {
        if (isReady()) {
          resolve();
          return;
        }
        existing.addEventListener("load", finish, { once: true });
        existing.addEventListener("error", () => reject(new Error(`Kunne ikke laste natur-runtime: ${src}`)), { once: true });
        queueMicrotask(() => { if (isReady()) resolve(); });
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.dataset.role = "nature-place-card-runtime";
      script.addEventListener("load", finish, { once: true });
      script.addEventListener("error", () => reject(new Error(`Kunne ikke laste natur-runtime: ${src}`)), { once: true });
      document.head.appendChild(script);
    });

    return window.__HG_NATURE_RUNTIME_SCRIPT_PROMISES__[src];
  }

  async function ensureNaturePlaceCardRuntime() {
    if (naturePlaceCardRuntimePromise) return naturePlaceCardRuntimePromise;

    naturePlaceCardRuntimePromise = (async () => {
      await loadRuntimeScript("js/ui/nature-card.js", () => typeof window.openNatureCard === "function");
      await loadRuntimeScript("js/nature_place_map_bridge.js", () => !!window.HGNaturePlaceMap);

      window.HGNaturePlaceMap?.patchOpenPlaceCard?.();

      const currentPlaceId = String(document.getElementById("placeCard")?.dataset?.currentPlaceId || "").trim();
      const currentPlace = (Array.isArray(window.PLACES) ? window.PLACES : [])
        .find(place => String(place?.id || "").trim() === currentPlaceId);

      if (currentPlace) {
        await window.HGNaturePlaceMap?.applyToPlaceCard?.(currentPlace);
      }
    })().catch(error => {
      naturePlaceCardRuntimePromise = null;
      throw error;
    });

    return naturePlaceCardRuntimePromise;
  }

  function scheduleNaturePlaceCardRuntime() {
    ensureNaturePlaceCardRuntime().catch(error => {
      if (window.DEBUG) console.warn("[NaturePlaceCardRuntime]", error);
    });
  }

  function showUnlock(obj, kind) {
    const stack = ensureStack();

    const card = document.createElement("div");
    card.className = `nature-unlock-card is-${kind}`;

    const title = obj?.title || obj?.id || "Ny art";
    const latin = obj?.latin || obj?.taxonomy?.latin_navn || "";
    const icon = kind === "fauna" ? "🐞" : "🌿";
    const imgSrc = (typeof window.resolveNatureImage === "function")
      ? window.resolveNatureImage(obj || {}, kind)
      : "";

    const thumb = imgSrc
      ? `<img class="nature-unlock-thumb" src="${imgSrc}" alt=""
              onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'nature-unlock-thumb nature-unlock-thumb-icon',textContent:'${icon}'}))">`
      : `<div class="nature-unlock-thumb nature-unlock-thumb-icon">${icon}</div>`;

    card.innerHTML = `
      ${thumb}
      <div class="nature-unlock-body">
        <div class="nature-unlock-kicker"></div>
        <div class="nature-unlock-title"></div>
        <div class="nature-unlock-latin"></div>
      </div>
      <button class="nature-unlock-close" type="button" aria-label="${escapeHtml(tUI("ui.attr.close", "Lukk"))}">✕</button>
    `;
    card.querySelector(".nature-unlock-kicker").textContent = kind === "fauna"
      ? tUI("ui.nature.unlock.newSpecies", "✨ Ny art samlet")
      : tUI("ui.nature.unlock.newPlant", "✨ Ny plante samlet");
    card.querySelector(".nature-unlock-title").textContent = title;
    card.querySelector(".nature-unlock-latin").textContent = latin;

    stack.appendChild(card);

    // Slide inn på neste frame
    requestAnimationFrame(() => card.classList.add("is-visible"));

    function dismiss() {
      if (!card.parentNode) return;
      card.classList.remove("is-visible");
      card.classList.add("is-leaving");
      setTimeout(() => card.remove(), 250);
    }

    card.querySelector(".nature-unlock-close").addEventListener("click", dismiss);
    card.addEventListener("click", (e) => {
      const target = e.target;
      if (target instanceof Element && target.closest(".nature-unlock-close")) return;
      if (obj && typeof window.openNatureCard === "function") {
        window.openNatureCard({ ...obj, _kind: kind });
        dismiss();
      }
    });

    setTimeout(dismiss, AUTO_DISMISS_MS);
  }

  function handleUnlock(detail) {
    const added = detail?.added || {};
    const flora = Array.isArray(added.flora) ? added.flora : [];
    const fauna = Array.isArray(added.fauna) ? added.fauna : [];

    // Maks 3 synlige samtidig for ikke å spamme skjermen.
    const MAX = 3;
    let shown = 0;

    for (const id of flora) {
      if (shown >= MAX) break;
      const obj = findEntry(id, "flora") || { id, title: id };
      showUnlock(obj, "flora");
      shown++;
    }
    for (const id of fauna) {
      if (shown >= MAX) break;
      const obj = findEntry(id, "fauna") || { id, title: id };
      showUnlock(obj, "fauna");
      shown++;
    }

    const total = flora.length + fauna.length;
    if (total > MAX) {
      const stack = ensureStack();
      const more = document.createElement("div");
      more.className = "nature-unlock-card is-more";
      more.innerHTML = `<div class="nature-unlock-body"><div class="nature-unlock-title">${escapeHtml(tfUI("ui.nature.unlock.moreCollectedCount", "+{count} til samlet", { count: total - MAX }))}</div></div>`;
      stack.appendChild(more);
      requestAnimationFrame(() => more.classList.add("is-visible"));
      setTimeout(() => {
        more.classList.remove("is-visible");
        setTimeout(() => more.remove(), 250);
      }, AUTO_DISMISS_MS);
    }
  }

  window.addEventListener("hg:nature", (e) => {
    const event = /** @type {CustomEvent} */ (e);
    try { handleUnlock(event.detail); } catch (err) {
      if (window.DEBUG) console.warn("[NatureUnlockToast]", err);
    }
  });

  // place-card.js og DataHub er tilgjengelige når criticalReady sendes.
  // appReady beholdes som sikker fallback dersom oppstartsrekkefølgen endres.
  window.addEventListener("hg:criticalReady", scheduleNaturePlaceCardRuntime, { once: true });
  window.addEventListener("hg:appReady", scheduleNaturePlaceCardRuntime, { once: true });
  if (window.HG_PLACES_READY === true) queueMicrotask(scheduleNaturePlaceCardRuntime);

  // Artsknapper i Natur-rundingen skal alltid åpne det fulle artskortet,
  // både for flora og fauna. Capture gjør at eldre direkte onclick-bindere
  // ikke overstyrer den kanoniske naturkortvisningen.
  document.addEventListener("click", (e) => {
    const target = e.target instanceof Element
      ? e.target.closest("[data-flora], [data-fauna]")
      : null;
    if (!(target instanceof HTMLElement)) return;

    const kind = target.hasAttribute("data-fauna") ? "fauna" : "flora";
    const id = String(kind === "fauna" ? target.dataset.fauna : target.dataset.flora || "").trim();
    const obj = findEntry(id, kind);
    if (!obj || typeof window.openNatureCard !== "function") return;

    e.preventDefault();
    e.stopImmediatePropagation();
    window.openNatureCard({ ...obj, _kind: kind });
  }, true);
})();
