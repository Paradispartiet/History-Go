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

function runtimeBadgeId(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const bridge = window.DomainRegistry?.toRuntimeCategoryId;
  if (typeof bridge === "function") {
    try {
      return String(bridge(raw) || "").trim();
    } catch (err) {
      if (window.DEBUG) console.warn("[badge-modal] unknown runtime badge id", raw, err);
    }
  }

  return raw;
}

async function handleBadgeClick(badgeEl) {
  const badgeId = runtimeBadgeId(badgeEl.getAttribute("data-badge-id"));
  const modal = document.getElementById("badgeModal");
  if (!badgeId || !modal) return;

  await ensureBadgesLoaded();
  const badge = BADGES.find(b => runtimeBadgeId(b.id) === badgeId);
  if (!badge) return;

  const localMerits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const meritKey = runtimeBadgeId(badge.id);
  const info =
    localMerits[meritKey] ||
    { points: 0 };


  const points = Number(info.points || 0);
  const { label } = deriveTierFromPoints(badge, points);

  const imgEl   = /** @type {HTMLImageElement} */ (modal.querySelector(".badge-img"));
  const titleEl = modal.querySelector(".badge-title");
  const levelEl = modal.querySelector(".badge-level");
  const textEl  = modal.querySelector(".badge-progress-text");
  const barEl   = /** @type {HTMLElement} */ (modal.querySelector(".badge-progress-bar"));

  if (imgEl)  imgEl.src = (badge.image || badge.icon || badge.img || badge.imageCard || "");
  if (titleEl) titleEl.textContent = badge.name;

  // Kanonisk: vis nivå ut fra tiers+points (ikke lagret level-tekst)
  if (levelEl) levelEl.textContent = label || tUI("ui.badge.modalTitleFallback", "Nybegynner");
  if (textEl)  textEl.textContent = tfUI("ui.badge.progressPoints", "{points} poeng", { points });

  // Progressbar
  if (barEl && Array.isArray(badge.tiers) && badge.tiers.length) {
    const max = Number(badge.tiers[badge.tiers.length - 1].threshold || 1);
    const pct = Math.max(0, Math.min(100, (points / Math.max(1, max)) * 100));
    barEl.style.width = `${pct}%`;
  } else if (barEl) {
    barEl.style.width = "0%";
  }

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");

  const closeBtn = /** @type {HTMLElement} */ (modal.querySelector(".close-btn"));
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.style.display = "none";
      modal.setAttribute("aria-hidden", "true");
    };
  }
}
