patchPlaceCardNatureLinks();

document.addEventListener("DOMContentLoaded", async () => {
  await safeRun("boot", window.boot);

  // Globalt søk lå i repoet, men var ikke lastet inn av index.html.
  // Lastes etter boot slik at window.PLACES / window.PEOPLE / kategorier finnes.
  await safeRun("loadGlobalSearch", () => loadScriptOnce("js/ui/search.js"));

  await safeRun("initMiniProfile", window.initMiniProfile);
  await safeRun("wireMiniProfileLinks", window.wireMiniProfileLinks);
  await safeRun("initLeftPanel", window.initLeftPanel);
  await safeRun("HGRoutes.init", () => window.HGRoutes?.init?.());

  if (window.HGPos?.request) {
    await safeRun("HGPos.request", window.HGPos.request);
  }
});

function patchPlaceCardNatureLinks() {
  const originalOpenPlaceCard = window.openPlaceCard;

  if (typeof originalOpenPlaceCard !== "function") return;
  if (originalOpenPlaceCard.__hgNaturePlaceLinksPatched) return;

  window.openPlaceCard = async function patchedOpenPlaceCard(place) {
    const result = await originalOpenPlaceCard.apply(this, arguments);

    try {
      renderLinkedNaturePlacesInPlaceCard(place);
    } catch (e) {
      console.warn("[place-card nature links]", e);
    }

    return result;
  };

  window.openPlaceCard.__hgNaturePlaceLinksPatched = true;
}

function renderLinkedNaturePlacesInPlaceCard(place) {
  if (!place) return;

  const natureEl = document.getElementById("pcNatureList");
  const natureIcon = document.getElementById("pcNatureIcon");
  if (!natureEl && !natureIcon) return;

  const places = Array.isArray(window.PLACES) ? window.PLACES : [];
  if (!places.length) return;

  const rawNatureIds = [
    ...(Array.isArray(place.naturePlaceIds) ? place.naturePlaceIds : []),
    ...(Array.isArray(place.nature_places) ? place.nature_places : []),
    ...(Array.isArray(place.natursteder) ? place.natursteder : []),
    ...(Array.isArray(place.nature) ? place.nature : []),
    ...(Array.isArray(place.natur) ? place.natur : [])
  ];

  const natureIds = rawNatureIds
    .map(item => {
      if (typeof item === "string") return item;
      return item?.id || item?.place_id || item?.placeId || item?.target_id || item?.targetId || "";
    })
    .map(id => String(id || "").trim())
    .filter(Boolean);

  if (!natureIds.length) return;

  const seen = new Set();
  const naturePlaces = natureIds
    .map(id => places.find(p => String(p?.id || "").trim() === id))
    .filter(p => p && String(p.category || "").trim() === "natur")
    .filter(p => {
      const id = String(p.id || "").trim();
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

  if (!naturePlaces.length) return;

  if (natureEl) {
    let row = natureEl.querySelector(".pc-flora-row");

    if (!row) {
      natureEl.innerHTML = `<div class="pc-flora-row"></div>`;
      row = natureEl.querySelector(".pc-flora-row");
    }

    row.querySelectorAll("[data-nature-place]").forEach(el => el.remove());

    row.insertAdjacentHTML("beforeend", naturePlaces.map(pl => {
      const img = pl.cardImage || pl.image || pl.frontImage || "";
      const name = escapeHtml(pl.name || pl.id || "Natursted");
      const id = escapeHtml(pl.id || "");

      return `
        <button class="pc-flora" data-place="${id}" data-nature-place="${id}" aria-label="${name}" title="${name}">
          ${img ? `<img src="${escapeHtml(img)}" class="pc-person-img" alt="">` : `<span class="pc-nature-emoji">🌿</span>`}
          <span class="pc-person-meta">
            <span class="pc-person-name">${name}</span>
          </span>
        </button>
      `;
    }).join(""));

    row.querySelectorAll("[data-nature-place]").forEach(btn => {
      btn.onclick = () => {
        const id = String(btn.dataset.naturePlace || "").trim();
        const linkedPlace = places.find(p => String(p?.id || "").trim() === id);
        if (linkedPlace && typeof window.showPlacePopup === "function") {
          window.showPlacePopup(linkedPlace);
        }
      };
    });
  }

  if (natureIcon) {
    const existingImg = natureIcon.querySelector("img");
    if (!existingImg) {
      const firstWithImage = naturePlaces.find(p => p.cardImage || p.image || p.frontImage);
      const img = firstWithImage ? (firstWithImage.cardImage || firstWithImage.image || firstWithImage.frontImage || "") : "";

      if (img) {
        natureIcon.innerHTML = `<img src="${escapeHtml(img)}" class="pc-person-img" alt="">`;
      } else {
        const existingCount = natureEl ? natureEl.querySelectorAll("[data-flora]").length : 0;
        setRoundNatureLabel(natureIcon, existingCount + naturePlaces.length);
      }
    }
  }
}

function setRoundNatureLabel(el, count = 0) {
  if (!el) return;

  el.innerHTML = `
    <div class="pc-round-label">
      <span class="pc-round-emoji">🌿</span>
      <span class="pc-round-count">${count}</span>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (!src) return resolve();

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "1") return resolve();
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.dataset.loaded = "0";
    script.onload = () => {
      script.dataset.loaded = "1";
      resolve();
    };
    script.onerror = () => reject(new Error(`Kunne ikke laste ${src}`));
    document.body.appendChild(script);
  });
}

async function safeRun(label, fn) {
  try {
    const out = fn?.();

    if (out && typeof out.then === "function") {
      return await out;
    }

    return out;
  } catch (e) {
    console.error(`[${label}]`, e);

    if (window.DEBUG) {
      window.__HG_LAST_ERROR__ = {
        label,
        message: String(e),
        stack: e?.stack || null
      };
    }

    throw e;
  }
}
