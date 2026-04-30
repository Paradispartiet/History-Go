// ==============================
// UI – MERKER / BADGES
// ==============================

let __badgesLoadPromise = null;
let __placeCardBadgePatchApplied = false;
let __placeCardBadgeToggleBound = false;

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

function getBadgesUrl() {
  try {
    return new URL("data/badges.json", window.location.href).toString();
  } catch {
    return "/History-Go/data/badges.json";
  }
}

async function ensureBadgesLoaded() {
  if (Array.isArray(window.BADGES) && window.BADGES.length) {
    return window.BADGES;
  }

  if (__badgesLoadPromise) {
    return __badgesLoadPromise;
  }

  __badgesLoadPromise = fetch(getBadgesUrl(), { cache: "no-store" })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      window.BADGES = Array.isArray(data?.badges) ? data.badges : [];
      return window.BADGES;
    })
    .catch(() => {
      window.BADGES = [];
      return window.BADGES;
    })
    .finally(() => {
      __badgesLoadPromise = null;
    });

  return __badgesLoadPromise;
}

function getBadgesList() {
  return Array.isArray(window.BADGES) ? window.BADGES : [];
}

function getBadgeForPlace(place) {
  const categoryId = String(place?.category || "").trim();
  if (!categoryId) return null;

  return getBadgesList().find(badge =>
    String(badge?.id || "").trim() === categoryId
  ) || null;
}

function badgeImagePath(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  // Badges.json bruker både emoji-icon og image-path. Bare paths/URL-er skal inn i <img>.
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

function renderBadgeSubcategories(place, badge) {
  const categoryId = badgeText(place?.category) || "ukjent";

  if (!badge) {
    return `<div class="pc-empty">Badges.json mangler badge for category: ${escapeBadgeHtml(categoryId)}</div>`;
  }

  const badgeName = badgeText(badge.name || badge.title || badge.id) || "Badge";
  const subs = Array.isArray(badge.sub) ? badge.sub.map(normalizeBadgeSubcategory).filter(Boolean) : [];

  if (!subs.length) {
    return `
      <div class="pc-badge-header">
        <strong>${escapeBadgeHtml(badgeName)}</strong>
      </div>
      <div class="pc-empty">Badges.json mangler underkategori-data for ${escapeBadgeHtml(badgeName)}</div>
    `;
  }

  return `
    <div class="pc-badge-header">
      <strong>${escapeBadgeHtml(badgeName)}</strong>
    </div>
    ${subs.map(sub => `
      <div class="pc-badge pc-badge-subcategory" data-badge-sub="${escapeBadgeHtml(sub.id || sub.name)}">
        ${sub.image ? `<img src="${escapeBadgeHtml(sub.image)}" alt="">` : ``}
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

  const badge = getBadgeForPlace(place);
  const badgeName = badgeText(badge?.name || badge?.title || badge?.id) || "Badge";
  const img = badgeImagePath(badge?.image || badge?.icon);
  const emojiIcon = !img ? badgeText(badge?.icon) : "";

  badgesEl.innerHTML = renderBadgeSubcategories(place, badge);

  badgesIcon.setAttribute("aria-label", badge ? badgeName : "Badge mangler");
  badgesIcon.title = badge ? badgeName : `Badges.json mangler badge for ${badgeText(place?.category) || "ukjent kategori"}`;

  if (img) {
    badgesIcon.innerHTML = `<img src="${escapeBadgeHtml(img)}" class="pc-badge-round-img" alt="${escapeBadgeHtml(badgeName)}" title="${escapeBadgeHtml(badgeName)}">`;
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
  if (__placeCardBadgeToggleBound) return;
  __placeCardBadgeToggleBound = true;

  document.addEventListener("click", (e) => {
    const badgeIcon = e.target?.closest?.("#pcBadgesIcon");
    if (!badgeIcon) return;

    const badgePopup = document.querySelector(".hg-popup.placecard-round-popup .pc-round-popup-badges")?.closest(".hg-popup");
    if (!badgePopup) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    badgePopup.remove();
  }, true);
}

function patchPlaceCardBadgeRound() {
  if (__placeCardBadgePatchApplied) return;
  if (typeof window.openPlaceCard !== "function") return;

  __placeCardBadgePatchApplied = true;
  bindPlaceCardBadgeToggle();

  const originalOpenPlaceCard = window.openPlaceCard;

  window.openPlaceCard = async function patchedOpenPlaceCard(place) {
    const result = await originalOpenPlaceCard.apply(this, arguments);
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
