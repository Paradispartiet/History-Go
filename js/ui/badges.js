// ==============================
// UI – MERKER / BADGES
// ==============================

// Scripts may be loaded more than once by legacy and post-ready loaders.
// Store mutable state on window to survive a repeated classic-script evaluation.
// Use var (not top-level let/const), so a second evaluation cannot trigger a
// SyntaxError before the idempotency guards have a chance to run.
var __hgBadgeRuntimeState = window.__hgBadgeRuntimeState || (window.__hgBadgeRuntimeState = {
  loadPromise: null,
  patchApplied: false,
  toggleBound: false
});

function pulseBadge(cat) {
  const cards = document.querySelectorAll(".badge-mini");
  cards.forEach(card => {
    const name =
      card.querySelector(".badge-mini-label")?.textContent || "";

    if (name.trim().toLowerCase() === cat.trim().toLowerCase()) {
      card.classList.add("badge-pulse");
      setTimeout(() => {
        card.classList.remove("badge-pulse");
      }, 1200);
    }
  });
}

async function loadBadgesFromDataHub() {
  const loader = window.DataHub?.loadBadges;
  if (typeof loader !== "function") {
    throw new Error("DataHub.loadBadges mangler");
  }

  const badges = await loader({ cache: "no-store" });
  if (!Array.isArray(badges)) {
    throw new Error("DataHub.loadBadges returnerte ikke array");
  }

  return badges;
}

async function ensureBadgesLoaded() {
  if (Array.isArray(window.BADGES) && window.BADGES.length) {
    return window.BADGES;
  }

  if (__hgBadgeRuntimeState.loadPromise) {
    return __hgBadgeRuntimeState.loadPromise;
  }

  __hgBadgeRuntimeState.loadPromise = loadBadgesFromDataHub()
    .then((badges) => {
      window.BADGES = Array.isArray(badges) ? badges : [];
      return /** @type {any} */ (window.BADGES);
    })
    .catch((err) => {
      console.warn("[HGBadges] badge-load failed", err);
      window.BADGES = [];
      return /** @type {any} */ (window.BADGES);
    })
    .finally(() => {
      __hgBadgeRuntimeState.loadPromise = null;
    });

  return __hgBadgeRuntimeState.loadPromise;
}

function getBadgesList() {
  return Array.isArray(window.BADGES) ? window.BADGES : [];
}

function runtimeCategoryId(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const bridge = window.DomainRegistry?.toRuntimeCategoryId;
  if (typeof bridge === "function") {
    try {
      return String(bridge(raw) || "").trim();
    } catch (err) {
      if (window.DEBUG) console.warn("[HGBadges] unknown runtime category", raw, err);
    }
  }

  return raw;
}

function getBadgeForPlace(place) {
  const categoryId = runtimeCategoryId(place?.category);
  if (!categoryId) return null;

  return getBadgesList().find((/** @type {any} */ badge) =>
    runtimeCategoryId(badge?.id) === categoryId
  ) || null;
}

function badgeImagePath(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  // Badge-data bruker både emoji-icon og image-path. Bare paths/URL-er skal inn i <img>.
  if (/^(https?:)?\/\//.test(raw)) return raw;
  if (raw.includes("/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(raw)) return raw;
  return "";
}

function badgeText(value) {
  return String(value || "").trim();
}

function escapeBadgeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatSubcategoryLabel(rawValue) {
  const raw = badgeText(rawValue);
  if (!raw) return "";

  return raw
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^./, c => c.toUpperCase());
}

function normalizeBadgeSubcategory(sub) {
  if (typeof sub === "string") {
    return {
      id: sub,
      name: formatSubcategoryLabel(sub),
      image: "",
      icon: "",
      description: ""
    };
  }

  if (!sub || typeof sub !== "object") return null;

  const id = badgeText(sub.id || sub.key || sub.slug || sub.name || sub.title || sub.label);
  const name = badgeText(sub.name || sub.title || sub.label) || formatSubcategoryLabel(id);
  const image = badgeImagePath(sub.image || sub.img || sub.icon);
  const icon = image ? "" : badgeText(sub.icon);
  const description = badgeText(sub.description || sub.desc || sub.text);

  if (!id && !name) return null;
  return { id, name, image, icon, description };
}

function relevantPlaceSubBadgeIds(place, badge) {
  if (!badge || !place) return [];
  const available = badge.subBadgeImages && typeof badge.subBadgeImages === "object" ? badge.subBadgeImages : {};
  const canonical = window.HGPlaceBadgeRelevantSubcategories;
  if (typeof canonical === "function") {
    return canonical(place, badge).filter(id => badgeImagePath(available[id]));
  }
  const fields = [place.subcategory, place.subcategory_id, place.subcategoryId, place.subcategoryIds,
    place.secondaryBadgeIds, place.secondary_badge_ids, place.underbadge_ids, place.sub_badges,
    place.subBadges, place.badge_subcategories, place.badgeSubcategories, place.underbadges,
    place.underBadges, place.merke_sub, place.merkeSub];
  const valid = new Set((Array.isArray(badge.sub) ? badge.sub : []).map(sub =>
    String(typeof sub === "string" ? sub : sub?.id || "").trim().toLowerCase().replace(/[\s-]+/g, "_")));
  const ids = new Set();
  const visit = value => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (value && typeof value === "object") return visit(value.id || value.slug || value.key || value.value || value.label);
    const id = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (valid.has(id) && badgeImagePath(available[id])) ids.add(id);
  };
  fields.forEach(visit);
  return [...ids];
}
function renderBadgeSubcategories(place, badge) {
  const categoryId = runtimeCategoryId(place?.category) || "ukjent";

  if (!badge) {
    return `<div class="pc-empty">Badge mangler for category: ${escapeBadgeHtml(categoryId)}</div>`;
  }

  const badgeName = badgeText(badge.name || badge.title || badge.id) || "Badge";
  const matching = new Set(relevantPlaceSubBadgeIds(place, badge));
  const subs = Array.isArray(badge.sub) ? badge.sub.map(normalizeBadgeSubcategory).filter(sub => sub && matching.has(String(sub.id || "").trim())) : [];

  if (!subs.length) {
    return `
      <div class="pc-badge-header">
        <strong>${escapeBadgeHtml(badgeName)}</strong>
      </div>
      <div class="pc-empty">Ingen stedsspesifikke undermerker registrert ennå</div>
    `;
  }

  return `
    <div class="pc-badge-header">
      <strong>${escapeBadgeHtml(badgeName)}</strong>
    </div>
    ${subs.map(sub => `
      <div class="pc-badge pc-badge-subcategory" data-badge-sub="${escapeBadgeHtml(sub.id || sub.name)}">
        ${badgeImagePath(badge.subBadgeImages?.[sub.id]) ? `<img class="pc-underbadge-thumb" src="${escapeBadgeHtml(badgeImagePath(badge.subBadgeImages[sub.id]))}" alt="">` : sub.image ? `<img class="pc-underbadge-thumb" src="${escapeBadgeHtml(sub.image)}" alt="">` : ``}
        ${sub.icon ? `<span class="pc-badge-sub-icon">${escapeBadgeHtml(sub.icon)}</span>` : ``}
        <span>${escapeBadgeHtml(sub.name)}</span>
        ${sub.description ? `<div class="pc-badge-sub-desc">${escapeBadgeHtml(sub.description)}</div>` : ``}
      </div>
    `).join("")}
  `;
}

function applyPlaceCardBadgeRound(place) {
  const card = document.getElementById("placeCard");
  const badgesIcon = document.getElementById("pcBadgesIcon");
  const badgesEl = document.getElementById("pcBadgesList");
  if (!card || !badgesIcon || !badgesEl) return;

  const currentPlaceId = String(card.dataset.currentPlaceId || "").trim();
  const incomingPlaceId = String(place?.id || "").trim();
  if (incomingPlaceId && currentPlaceId && incomingPlaceId !== currentPlaceId) return;

  const hydrated = window.HGPlaceOpen?.getPlace?.(currentPlaceId);
  const cardPlace = hydrated && typeof hydrated === "object" ? { ...place, ...hydrated } : place;
  const badge = /** @type {any} */ (getBadgeForPlace(cardPlace));
  const badgeName = badgeText(badge?.name || badge?.title || badge?.id) || "Badge";
  const selectedId = relevantPlaceSubBadgeIds(cardPlace, badge)[0] || "";
  const selectedImage = selectedId ? badgeImagePath(badge?.subBadgeImages?.[selectedId]) : "";
  const selectedLabel = selectedId ? formatSubcategoryLabel(selectedId) : badgeName;
  const img = selectedImage || badgeImagePath(badge?.image || badge?.icon);
  const emojiIcon = !img ? badgeText(badge?.icon) : "";

  badgesEl.innerHTML = renderBadgeSubcategories(cardPlace, badge);

  badgesIcon.setAttribute("aria-label", badge ? selectedLabel : "Badge mangler");
  badgesIcon.title = badge ? selectedLabel : `Badge mangler for ${runtimeCategoryId(cardPlace?.category) || "ukjent kategori"}`;

  if (img) {
    badgesIcon.innerHTML = `<img src="${escapeBadgeHtml(img)}" class="pc-badge-round-img" alt="${escapeBadgeHtml(selectedLabel)}" title="${escapeBadgeHtml(selectedLabel)}">`;
    return;
  }

  badgesIcon.innerHTML = `
    <div class="pc-round-label">
      <span class="pc-round-emoji">${escapeBadgeHtml(emojiIcon || "🏅")}</span>
      <span class="pc-round-count">${badge ? "" : "0"}</span>
    </div>
  `;
}

function bindPlaceCardBadgeToggle() {
  if (__hgBadgeRuntimeState.toggleBound) return;
  __hgBadgeRuntimeState.toggleBound = true;

  document.addEventListener("click", (e) => {
    const badgeIcon = /** @type {Element|null} */ (e.target)?.closest?.("#pcBadgesIcon");
    if (!badgeIcon) return;

    const badgePopup = document.querySelector(".hg-popup.placecard-round-popup .pc-round-popup-badges")?.closest(".hg-popup");
    if (!badgePopup) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    badgePopup.remove();
  }, true);
}

function patchPlaceCardBadgeRound() {
  if (__hgBadgeRuntimeState.patchApplied) return;
  if (typeof window.openPlaceCard !== "function") return;

  __hgBadgeRuntimeState.patchApplied = true;
  bindPlaceCardBadgeToggle();

  const originalOpenPlaceCard = window.openPlaceCard;

  window.openPlaceCard = async function patchedOpenPlaceCard(place) {
    const result = await originalOpenPlaceCard.apply(this, arguments);
    if (!result) return result;
    await ensureBadgesLoaded();
    applyPlaceCardBadgeRound(place);
    return result;
  };
}

// global eksponering (samme mønster som resten)
window.pulseBadge = pulseBadge;
window.ensureBadgesLoaded = ensureBadgesLoaded;
window.getBadgeForPlace = getBadgeForPlace;
window.applyPlaceCardBadgeRound = applyPlaceCardBadgeRound;
window.HGBadges = {
  ensureBadgesLoaded,
  getBadgesList,
  getBadgeForPlace,
  renderBadgeSubcategories,
  applyPlaceCardBadgeRound
};

patchPlaceCardBadgeRound();
