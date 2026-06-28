// ============================================================
// CIVICATION UI
// ============================================================

/**
 * @typedef {Record<string, unknown>} CiviUiRecord
 * @typedef {{ id?: string, label?: string, triggers_on_choice?: string, [key: string]: unknown }} CiviUiChoice
 * @typedef {{ id?: string, status?: string, type?: string, title?: string, subject?: string, body?: string, message?: string, feedback?: string, from?: string, place_id?: string, brand_name?: string, task_id?: string, task_kind?: string, calendar_label?: string, situation?: unknown, pressure?: unknown, choices?: CiviUiChoice[], [key: string]: unknown }} CiviUiEvent
 * @typedef {{ status?: string, enqueued_at?: string, event?: CiviUiEvent, [key: string]: unknown }} CiviUiInboxItem
 * @typedef {{ stability?: string, warning_used?: boolean, strikes?: number, score?: number, active_role_key?: string|null, consumed?: CiviUiRecord, identity_tags?: unknown[], tracks?: unknown[], track_progress?: CiviUiRecord, unemployed_since_week?: string|null, career?: CiviUiRecord, [key: string]: unknown }} CiviUiState
 * @typedef {{ career_id?: string|number, career_name?: string|number, title?: string|number, achieved_at?: string|number, [key: string]: unknown }} CiviUiActivePosition
 * @typedef {{ career_id?: string|number, career_name?: string|number, threshold?: string|number, expires_iso?: string|number, offer_key?: string|number, ok?: boolean, [key: string]: unknown }} CiviUiPendingOffer
 * @typedef {{ ok?: boolean, [key: string]: unknown }} CiviUiOfferActionResult
 * @typedef {{ value?: number, max?: number, collapses?: number, lastCollapse?: { at?: string|number|Date, [key: string]: unknown }, [key: string]: unknown }} CiviUiPsycheTrust
 * @typedef {{ integrity?: number, visibility?: number, economicRoom?: number, autonomy?: number, trust?: CiviUiPsycheTrust, [key: string]: unknown }} CiviUiPsycheSnapshot
 * @typedef {{ tracks?: unknown[], track_progress?: CiviUiRecord, identity_tags?: unknown[], [key: string]: unknown }} CiviUiTrackHudState
 */

/**
 * @returns {Promise<void>}
 */
async function init() {

  // Sørg for at careers er lastet
  await window.ensureCiviCareerRulesLoaded?.();

  // 🔽 START-SEKVENS hvis systemet er tomt
  const inbox =
    window.CivicationMailEngine?.getInbox?.() ||
    window.CivicationState?.getInbox?.() ||
    [];
  if (
    !window.CivicationState?.getActivePosition?.() &&
    (!Array.isArray(inbox) || inbox.length === 0)
  ) {
    await window.HG_CiviEngine?.onAppOpen?.();
  }

  // Oppgraderingslogikk
  if (typeof checkTierUpgrades === "function") {
    checkTierUpgrades();
  }

  wireCivicationActions();

  renderCivication();
  renderCivicationInbox();
  renderWorkdayPanel();
  renderPsycheDashboard();
  renderCapital();
  renderHomeStatus();
  renderPublicFeed();
  renderTrackHUD();
  renderCivicationSummary();
  renderCivicationShop();

  window.addEventListener("updateProfile", () => {
    renderCivication();
    renderCivicationInbox();
    renderWorkdayPanel();
    renderPsycheDashboard();
    renderCapital();
    renderHomeStatus();
    renderPerception();
    renderTrackHUD();
    renderCivicationSummary();
    renderCivicationShop();
  });

  window.addEventListener("civi:homeChanged", renderHomeStatus);
}

/**
 * @param {string} previousEventId
 * @returns {void}
 */
function refreshCivicationAfterAnswer(previousEventId) {
  function rerenderMailViews() {
    renderCivicationInbox();
    renderWorkdayPanel();
  }

  rerenderMailViews();

  const delays = [80, 220, 500, 900];
  delays.forEach(function (delay) {
    window.setTimeout(function () {
      const pending = /** @type {CiviUiInboxItem|null|undefined} */ (window.HG_CiviEngine?.getPendingEvent?.());
      const nextId = String(pending?.event?.id || "").trim() || null;

      if (!previousEventId || nextId !== previousEventId || !nextId) {
        rerenderMailViews();
        return;
      }

      rerenderMailViews();
    }, delay);
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ============================================================
// ACTION WIRING (KJØRES ÉN GANG)
// ============================================================

function wireCivicationActions() {
  const btnAccept = document.getElementById("btnCiviAccept");
  const btnDecline = document.getElementById("btnCiviDecline");

  if (btnAccept) {
    btnAccept.onclick = () => {
      const offer = /** @type {CiviUiPendingOffer|null|undefined} */ (window.CivicationJobs?.getLatestPendingOffer?.());
      if (!offer) return;

      const res = /** @type {CiviUiOfferActionResult|null|undefined} */ (window.CivicationJobs?.acceptOffer?.(offer.offer_key));
      if (!res?.ok) return;

      window.dispatchEvent(new Event("updateProfile"));
    };
  }

  if (btnDecline) {
    btnDecline.onclick = () => {
      const offer = /** @type {CiviUiPendingOffer|null|undefined} */ (window.CivicationJobs?.getLatestPendingOffer?.());
      if (!offer) return;

      window.CivicationJobs?.declineOffer?.(offer.offer_key);
      window.dispatchEvent(new Event("updateProfile"));
    };
  }

  document.getElementById("civiTaskModalClose")
    ?.addEventListener("click", closeTaskModal);

  document.querySelectorAll("[data-close-task]").forEach(function (el) {
    el.addEventListener("click", closeTaskModal);
  });
}

// ============================================================
// JOBBTILBUD ELIGIBILITY (knowledge gate / learning gate / blockers)
// ============================================================
// Liten, ren visning av offer.eligibility som PR 989/991 legger på jobbtilbud via
// CivicationJobs.pushOffer. Dette er KUN visning av eksisterende eligibility-data — ingen
// ny jobbmatchinglogikk, ingen nye regler. Gamle tilbud uten eligibility faller stille
// tilbake til hasEligibility:false og rendrer ingen linje.

/** @typedef {{ kind: string, status: string, label: string, text: string }} CiviOfferEligibilityItem */

// Knowledge gate-statuser som faktisk skal vises. not_required / not_configured (og ukjente
// statuser) vises bevisst ikke — de skal ikke lage støy i UI.
const OFFER_KNOWLEDGE_TEXT = {
  passed: "Kunnskap: relevant quiz/progresjon er på plass.",
  missing: "Kunnskap: denne jobben bygger på quiz du kan styrke.",
  unknown: "Kunnskap: krav finnes, men progresjonen kan ikke bekreftes ennå."
};

// Learning gate-statuser som skal vises. not_required / not_configured (og ukjente) skjules.
const OFFER_LEARNING_TEXT = {
  ready_for_next_step: "Erfaring: ferdighetene dine kan brukes videre.",
  strong: "Erfaring: sterkt grunnlag fra mestrede roller.",
  building: "Erfaring: du bygger fortsatt grunnlaget."
};

/**
 * @param {unknown} value
 * @returns {string}
 */
function normOfferStatus(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/**
 * Plukk første korte, ikke-tomme reason. Brukes til å la en konkret reason erstatte den
 * generiske erfaringsteksten når den finnes og ikke er en lang tekstblokk.
 * @param {unknown} reasons
 * @returns {string}
 */
function pickShortOfferReason(reasons) {
  if (!Array.isArray(reasons)) return "";
  for (const r of reasons) {
    const text = typeof r === "string" ? r.trim() : "";
    if (text && text.length <= 90) return text;
  }
  return "";
}

/**
 * Pure view model for et jobbtilbuds eligibility. Tåler manglende offer/eligibility,
 * gamle tilbud uten eligibility, tomme arrays, undefined og ukjente statuser uten å kaste.
 * @param {any} offer
 * @returns {{ hasEligibility: boolean, items: CiviOfferEligibilityItem[], blockers: string[] }}
 */
function getOfferEligibilityViewModel(offer) {
  const empty = { hasEligibility: false, items: /** @type {CiviOfferEligibilityItem[]} */ ([]), blockers: /** @type {string[]} */ ([]) };
  if (!offer || typeof offer !== "object") return empty;
  const el = /** @type {Record<string, unknown>} */ (offer.eligibility);
  if (!el || typeof el !== "object") return empty;

  /** @type {CiviOfferEligibilityItem[]} */
  const items = [];

  // Knowledge gate. soft_required + missing er en forklaring, ikke en hard blokkering —
  // den vises som en vanlig linje, aldri som blocker.
  const knowledge = normOfferStatus(el.knowledge_gate);
  if (OFFER_KNOWLEDGE_TEXT[knowledge]) {
    items.push({ kind: "knowledge", status: knowledge, label: "Kunnskap", text: OFFER_KNOWLEDGE_TEXT[knowledge] });
  }

  // Learning gate. Foretrekk en kort, konkret reason når den finnes.
  const learning = normOfferStatus(el.learning_gate);
  if (OFFER_LEARNING_TEXT[learning]) {
    const reason = pickShortOfferReason(el.reasons);
    items.push({ kind: "learning", status: learning, label: "Erfaring", text: reason || OFFER_LEARNING_TEXT[learning] });
  }

  // Blockers: filtrer bort tomme/undefined slik at kortet aldri viser «undefined».
  const blockers = Array.isArray(el.blockers)
    ? el.blockers.map((b) => (typeof b === "string" ? b.trim() : "")).filter(Boolean)
    : [];

  return { hasEligibility: items.length > 0 || blockers.length > 0, items, blockers };
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function escapeOfferHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Bygger en liten eligibility-blokk for et jobbtilbud-kort. Returnerer "" når det ikke er
 * noe å vise (gamle tilbud uten eligibility, eller bare not_required/not_configured-støy).
 * @param {any} offer
 * @returns {string}
 */
function buildOfferEligibilityHtml(offer) {
  const vm = getOfferEligibilityViewModel(offer);
  if (!vm.hasEligibility) return "";

  const rows = [];
  for (const item of vm.items) {
    rows.push(
      "<div class=\"civi-offer-eligibility-row\" data-eligibility-kind=\"" + escapeOfferHtml(item.kind)
      + "\" data-eligibility-status=\"" + escapeOfferHtml(item.status) + "\">"
      + "<span class=\"civi-offer-eligibility-label\">" + escapeOfferHtml(item.label) + "</span>"
      + "<span class=\"civi-offer-eligibility-muted\">" + escapeOfferHtml(item.text) + "</span>"
      + "</div>"
    );
  }
  for (const blocker of vm.blockers) {
    rows.push(
      "<div class=\"civi-offer-eligibility-row\" data-eligibility-kind=\"blocker\">"
      + "<span class=\"civi-offer-eligibility-label\">Blokkert</span>"
      + "<span class=\"civi-offer-eligibility-muted\">" + escapeOfferHtml(blocker) + "</span>"
      + "</div>"
    );
  }

  return "<div class=\"civi-offer-eligibility\" aria-label=\"Hvorfor finnes dette jobbtilbudet\">" + rows.join("") + "</div>";
}

// ============================================================
// PROFILE CIVICATION SHOP
// ============================================================

/**
 * @param {unknown} value
 * @returns {string}
 */
function formatCiviShopPc(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num.toLocaleString("no-NO") : "0";
}

/**
 * @param {unknown} value
 * @returns {Record<string, unknown>}
 */
function civiShopRecord(value) {
  return value && typeof value === "object" ? /** @type {Record<string, unknown>} */ (value) : {};
}

/**
 * @returns {Promise<void>}
 */
async function renderCivicationShop() {
  const box = document.getElementById("civiShopBox");
  const balanceEl = document.getElementById("civiPcBalance");
  const hintEl = document.getElementById("civiShopHint");
  const packsEl = document.getElementById("civiShopPacks");
  const stylesEl = document.getElementById("civiStyleCounts");

  if (!box || !balanceEl || !hintEl || !packsEl || !stylesEl) return;

  const shop = window.HG_CiviShop;
  if (!shop) {
    box.style.display = "none";
    return;
  }

  box.style.display = "";

  let wallet = /** @type {{ balance?: unknown }} */ ({});
  let inv = /** @type {{ packs?: Record<string, unknown>, style_counts?: Record<string, unknown> }} */ ({});
  let packs = /** @type {any[]} */ ([]);

  try {
    wallet = civiShopRecord(shop.getWallet?.());
  } catch {
    wallet = {};
  }

  try {
    inv = /** @type {{ packs?: Record<string, unknown>, style_counts?: Record<string, unknown> }} */ (civiShopRecord(shop.getInv?.()));
  } catch {
    inv = {};
  }

  try {
    const visible = await shop.getVisiblePacks?.();
    packs = Array.isArray(visible) ? visible : [];
  } catch {
    packs = [];
  }

  balanceEl.textContent = formatCiviShopPc(wallet.balance);

  const styleCounts = civiShopRecord(inv.style_counts);
  const styleEntries = Object.entries(styleCounts)
    .map(function ([key, value]) {
      const label = String(key || "").trim();
      const count = Number(value || 0);
      if (!label || !Number.isFinite(count) || count <= 0) return null;
      return { label, count };
    })
    .filter(Boolean);

  if (!styleEntries.length) {
    stylesEl.textContent = "Ingen stil-tags ennå";
  } else {
    stylesEl.innerHTML = styleEntries
      .map(function (entry) {
        return `<span>${escapeOfferHtml(entry.label)} × ${formatCiviShopPc(entry.count)}</span>`;
      })
      .join(" ");
  }

  if (!packs.length) {
    hintEl.textContent = "Ingen pakker tilgjengelige ennå. Lås opp relevante merker eller steder.";
    packsEl.innerHTML = `<div>Ingen pakker tilgjengelige ennå. Lås opp relevante merker eller steder.</div>`;
    return;
  }

  hintEl.textContent = "Tilgjengelige pakker følger merker, steder og nabolag du har låst opp.";

  const ownedPacks = civiShopRecord(inv.packs);
  const ownedItems = civiShopRecord(/** @type {any} */ (inv).ownedItems);
  packsEl.innerHTML = packs.map(function (pack) {
    const packRecord = civiShopRecord(pack);
    const packId = String(packRecord.id || "").trim();
    const title = String(packRecord.title || packRecord.name || packId || "Pakke");
    const price = packRecord.price_pc ?? packRecord.price ?? 0;
    const isOwned = !!ownedPacks[packId] || !!ownedItems[packId];

    return `
      <div class="civi-shop-pack">
        <div><strong>${escapeOfferHtml(title)}</strong></div>
        <div>Pris: ${formatCiviShopPc(price)} PC</div>
        <div>${isOwned ? "Kjøpt" : `<button type="button" data-civi-buy-pack="${escapeOfferHtml(packId)}">Kjøp</button>`}</div>
      </div>
    `;
  }).join("");

  packsEl.querySelectorAll("[data-civi-buy-pack]").forEach(function (btn) {
    const buyBtn = /** @type {HTMLButtonElement} */ (btn);
    buyBtn.addEventListener("click", async function () {
      const packId = buyBtn.getAttribute("data-civi-buy-pack");
      if (!packId || !shop?.buyPack) return;

      buyBtn.disabled = true;
      let res = /** @type {{ ok?: boolean, reason?: string }} */ ({ ok: false });
      try {
        res = /** @type {{ ok?: boolean, reason?: string }} */ (await shop.buyPack(packId));
      } catch {
        res = { ok: false };
      } finally {
        buyBtn.disabled = false;
      }

      if (res?.ok) {
        renderCivicationSummary();
        await renderCivicationShop();
        window.dispatchEvent(new Event("updateProfile"));
        return;
      }

      if (res?.reason === "NOT_ENOUGH_PC") {
        hintEl.textContent = "Ikke nok PC til å kjøpe denne pakken.";
      } else if (res?.reason === "PACK_NOT_FOUND") {
        hintEl.textContent = "Pakken finnes ikke lenger eller er ikke låst opp.";
      }
    });
  });
}


/**
 * @param {string} key
 * @param {unknown} fallback
 * @returns {unknown}
 */
function readCiviProfileJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * @returns {{ activePosition: unknown, wallet: unknown, inventory: unknown, visiblePackCount: number, ownedPackCount: number, styleCounts: Record<string, unknown>, psyche: unknown, merits: unknown }}
 */
function getCivicationProfileSnapshot() {
  let activePosition = null;
  let wallet = null;
  let inventory = null;
  let visiblePacks = [];
  let psyche = null;

  try { activePosition = window.CivicationState?.getActivePosition?.() || null; } catch {}
  try { wallet = window.CivicationState?.getWallet?.() || window.HG_CiviShop?.getWallet?.() || null; } catch {}
  try { inventory = window.HG_CiviShop?.getInv?.() || null; } catch {}
  try {
    const visible = window.HG_CiviShop?.getVisiblePacks?.() || [];
    visiblePacks = Array.isArray(visible) ? visible : [];
  } catch {}

  const packs = civiShopRecord(civiShopRecord(inventory).packs);
  const ownedItems = civiShopRecord(civiShopRecord(inventory).ownedItems);
  const styleCounts = civiShopRecord(civiShopRecord(inventory).style_counts);
  const activeCareerId = civiShopRecord(activePosition).career_id || null;
  try { psyche = window.CivicationPsyche?.getSnapshot?.(activeCareerId) || null; } catch {}

  return {
    activePosition,
    wallet,
    inventory,
    visiblePackCount: visiblePacks.length,
    ownedPackCount: Object.keys(packs).filter((key) => Boolean(packs[key])).length + Object.keys(ownedItems).filter((key) => Boolean(ownedItems[key])).length,
    styleCounts,
    psyche,
    merits: readCiviProfileJson("merits_by_category", {})
  };
}

/**
 * @returns {void}
 */
function renderCivicationSummary() {
  const title = document.getElementById("civiRoleTitle");
  const details = document.getElementById("civiRoleDetails");
  const salaryLn = document.getElementById("civiSalaryLine");
  const meritLn = document.getElementById("civiMeritLine");
  const burnoutEl = document.getElementById("civiBurnoutStatus");
  if (!title && !details && !salaryLn && !meritLn && !burnoutEl) return;

  try { syncRoleBaseline(); } catch {}

  const active = /** @type {CiviUiActivePosition|null} */ (window.CivicationState?.getActivePosition?.() || null);
  const activeCareerId = active?.career_id ? String(active.career_id) : "";
  const merits = /** @type {Record<string, any>} */ (readCiviProfileJson("merits_by_category", {}));
  const psyche = /** @type {any} */ (window.CivicationPsyche?.getSnapshot?.(activeCareerId || null) || null);

  if (title) title.textContent = active?.title ? `Rolle: ${active.title}` : "Rolle: —";
  if (details) {
    const field = active?.career_name || active?.career_id || "—";
    const status = active ? "Aktiv" : "Ingen aktiv jobb";
    details.textContent = active ? `Status: ${status} · Felt: ${field}` : "Status: Ingen aktiv jobb (ta quiz for å få jobbtilbud).";
  }

  if (salaryLn) {
    let weekly = NaN;
    try {
      const points = Number(activeCareerId ? merits?.[activeCareerId]?.points || 0 : 0);
      const badge = Array.isArray(window.BADGES) ? window.BADGES.find((b) => b && String(b.id) === activeCareerId) : null;
      const tierIndex = badge ? (deriveTierFromPoints(badge, points).tierIndex || 0) : 0;
      const career = Array.isArray(window.HG_CAREERS) ? window.HG_CAREERS.find((c) => c && String(/** @type {any} */ (c).career_id) === activeCareerId) : null;
      weekly = (career && typeof window.calculateWeeklySalary === "function") ? Number(window.calculateWeeklySalary(career, tierIndex)) : NaN;
    } catch {}
    try {
      const snap = /** @type {any} */ (window.CivicationEconomyEngine?.getEconomySnapshot?.());
      if (snap) {
        const salary = Number(snap.weeklySalary || 0);
        const expenses = Number(snap.weeklyJobExpenses || 0);
        const rent = Number(snap.homeRent || 0);
        const net = Number(snap.estimatedNetAfterHome || 0);
        salaryLn.textContent = `Lønn: ${salary} PC / uke · Utgifter: ${expenses} · Husleie: ${rent} · Netto: ${net}`;
      } else {
        salaryLn.textContent = Number.isFinite(weekly) ? `Lønn: ${weekly} PC / uke` : "Lønn: —";
      }
    } catch {
      salaryLn.textContent = Number.isFinite(weekly) ? `Lønn: ${weekly} PC / uke` : "Lønn: —";
    }
  }

  if (meritLn) {
    const points = activeCareerId ? Number(merits?.[activeCareerId]?.points || 0) : NaN;
    const label = active?.career_name || active?.career_id || "aktiv karriere";
    meritLn.textContent = Number.isFinite(points) && activeCareerId ? `Merit: ${points} poeng · ${label}` : "Merit: —";
  }

  if (burnoutEl) {
    const activeBurnout = psyche?.burnoutActive === true || window.CivicationPsyche?.isBurnoutActive?.() === true;
    burnoutEl.style.display = activeBurnout ? "" : "none";
    burnoutEl.textContent = activeBurnout ? "🔥 Burnout aktiv: Autonomi midlertidig redusert." : "";
  }
}

// ============================================================
// RENDER MAIN CIVICATION PANEL
// ============================================================
/**
 * @returns {Promise<void>}
 */
async function renderCivication() {
  await window.ensureCiviCareerRulesLoaded?.();

  // =========================
  // PROFILE-MODE (profile.html)
  // =========================
  const title    = document.getElementById("civiRoleTitle");
  const details  = document.getElementById("civiRoleDetails");
  const meritLn  = document.getElementById("civiMeritLine");
  const salaryLn = document.getElementById("civiSalaryLine");

  const oBox   = document.getElementById("civiOfferBox");
  const oTitle = document.getElementById("civiOfferTitle");
  const oMeta  = document.getElementById("civiOfferMeta");

  const isProfile =
    title && details && meritLn && salaryLn && oBox && oTitle && oMeta;

  if (isProfile) {
    renderCivicationSummary();

    // JOBBTILBUD (profil = indikator, ingen handling)
    const offer = /** @type {CiviUiPendingOffer|null|undefined} */ (
      window.CivicationJobs?.getLatestPendingOffer?.()
    );

    if (!offer) {
      oBox.style.display = "none";
    } else {
      oBox.style.display = "";
      oTitle.textContent = "🧾 Nytt jobbtilbud";

      const expTxt =
        offer.expires_iso
          ? new Date(offer.expires_iso).toLocaleDateString("no-NO")
          : "—";

      const jobTxt = offer.career_name || offer.career_id || "Jobb";
      oMeta.textContent = `${jobTxt} · Utløper: ${expTxt} · Åpne Civication for å svare.`;
    }

    return;
  }

  // =========================
  // CIVICATION-MODE (Civication.html)
  // =========================
  const host = document.getElementById("activeJobCard");
  if (!host) return;

  const active = /** @type {CiviUiActivePosition|null|undefined} */ (
    window.CivicationState.getActivePosition()
  );
  const offer = /** @type {CiviUiPendingOffer|null|undefined} */ (
    window.CivicationJobs?.getLatestPendingOffer?.()
  );

  // Lønn (best effort)
  let salaryTxt = "Lønn: —";
  if (active?.career_id && typeof window.calculateWeeklySalary === "function") {
    try {
      const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
      const points = Number(merits[active.career_id]?.points || 0);

      const badge = Array.isArray(window.BADGES)
        ? window.BADGES.find((/** @type {any} */ b) => b && String(b.id) === String(active.career_id))
        : null;

      const tierIndex =
        badge ? (deriveTierFromPoints(badge, points).tierIndex || 0) : 0;

      const career = Array.isArray(window.HG_CAREERS)
        ? window.HG_CAREERS.find((/** @type {any} */ c) => c && String(c.career_id) === String(active.career_id))
        : null;

      const weekly = career ? window.calculateWeeklySalary(career, tierIndex) : NaN;
      if (Number.isFinite(weekly)) salaryTxt = `Lønn: ${weekly} PC / uke`;
    } catch {}
  }

  try {
    const snap = /** @type {any} */ (window.CivicationEconomyEngine?.getEconomySnapshot?.());
    if (snap) {
      const salary = Number(snap.weeklySalary || 0);
      const expenses = Number(snap.weeklyJobExpenses || 0);
      const rent = Number(snap.homeRent || 0);
      const net = Number(snap.estimatedNetAfterHome || 0);
      salaryTxt = `Lønn: ${salary} PC / uke · Utgifter: ${expenses} · Husleie: ${rent} · Netto: ${net}`;
    }
  } catch {}

  host.innerHTML = `
    <div>
      <div><strong>${active?.title ? `Rolle: ${active.title}` : "Rolle: —"}</strong></div>
      <div>${active ? `Felt: ${active.career_name || active.career_id || "—"}` : "Status: Ingen aktiv jobb"}</div>
      <div>${salaryTxt}</div>

      <hr style="border:none;border-top:1px solid rgba(0,0,0,0.15);margin:12px 0;">

      ${
        offer
          ? `
            <div><strong>🧾 Jobbtilbud</strong></div>
            <div>${offer.career_name || offer.career_id || ""}</div>
            <div>Terskel: ${offer.threshold}</div>
            <div>Utløper: ${offer.expires_iso ? new Date(offer.expires_iso).toLocaleDateString("no-NO") : "—"}</div>
            ${buildOfferEligibilityHtml(offer)}

            <div style="display:flex;gap:10px;margin-top:10px;">
              <button class="civi-btn primary" id="civiOfferAccept">Aksepter</button>
              <button class="civi-btn" id="civiOfferDecline">Ikke nå</button>
            </div>
          `
          : `<div>Ingen aktive jobbtilbud.</div>`
      }
    </div>
  `;

  if (offer?.offer_key) {
    host.querySelector("#civiOfferAccept")?.addEventListener("click", () => {
      const res = /** @type {CiviUiOfferActionResult|null|undefined} */ (
        window.CivicationJobs?.acceptOffer?.(offer.offer_key)
      );
      if (!res?.ok) return;

      window.dispatchEvent(new Event("updateProfile"));
    });

    host.querySelector("#civiOfferDecline")?.addEventListener("click", () => {
      window.CivicationJobs?.declineOffer?.(offer.offer_key);
      window.dispatchEvent(new Event("updateProfile"));
    });
  }
}



function renderPublicFeed() {
  const container = document.getElementById("civiPublicFeed");
  if (!container) return;

  const feed =
    /** @type {Array<{ timestamp?: string|number|Date, collapseType?: string, district?: string }>} */ (
      window.HG_CivicationPublic?.getFeed() || []
    );

  container.innerHTML = feed.map(e => {
    const date = new Date(e.timestamp).toLocaleTimeString("no-NO");
    return `
      <div class="civi-feed-item">
        <strong>${e.collapseType}</strong> – ${e.district}
        <div class="civi-feed-time">${date}</div>
      </div>
    `;
  }).join("");
}

window.addEventListener("civiPublicUpdated", renderPublicFeed);

// ============================================================
// ROLE → BASELINE SYNC (PER ROLLE / TIER)
// ============================================================

function syncRoleBaseline() {

 const active = /** @type {CiviUiActivePosition|null|undefined} */ (window.CivicationState?.getActivePosition?.());

 if (!active || !active.career_id) {
  window.CivicationPsyche?.clearRoleBaseline?.();
  return;
 }

 const careerId = active.career_id;

// 🔥 KONFLIKT-TEST
window.CivicationConflicts
  ?.load(careerId)
  ?.then(data => {
    const conflict = window.CivicationConflicts
      ?.getForTier(data, active.title);

    console.log("Active conflict:", conflict);
  });
  const badge = Array.isArray(window.BADGES)
    ? window.BADGES.find((/** @type {any} */ b) => b && String(b.id) === String(careerId))
    : null;

  if (!badge) {
    window.CivicationPsyche?.clearRoleBaseline?.();
    return;
  }

  const merits =
    JSON.parse(localStorage.getItem("merits_by_category") || "{}");

  const points = Number(merits[careerId]?.points || 0);

  const { tierIndex, label } =
    deriveTierFromPoints(badge, points);

  // --------------------------------------------------
  // Baseline-matrise per rolle + tier
  // --------------------------------------------------

  let baseline = { economicRoom: 0, visibility: 0, integrity: 0 };

  switch (careerId) {

    case "naeringsliv":

      if (tierIndex >= 3) {
        baseline = { economicRoom: 25, visibility: 20, integrity: -15 };
      } else if (tierIndex === 2) {
        baseline = { economicRoom: 15, visibility: 10, integrity: -5 };
      } else {
        baseline = { economicRoom: 5, visibility: 5, integrity: 0 };
      }

      break;

    case "subkultur":

      if (tierIndex >= 3) {
        baseline = { economicRoom: -10, visibility: 15, integrity: 20 };
      } else {
        baseline = { economicRoom: -15, visibility: 5, integrity: 10 };
      }

      break;

    case "vitenskap":

      baseline = {
        economicRoom: 10 + tierIndex * 3,
        visibility: 5 + tierIndex * 5,
        integrity: 10 + tierIndex * 2
      };

      break;

    default:
      baseline = { economicRoom: 0, visibility: 0, integrity: 0 };
  }

  window.CivicationPsyche?.applyRoleBaseline?.(baseline);
}

// ============================================================
// HOME STATUS UI
// ============================================================

function renderHomeStatus() {
  const el = document.getElementById("homeStatusContent");
  if (!el) return;

  const home = /** @type {any} */ (window.CivicationHome?.getState?.());
  if (!home) return;

  if (home.home?.status !== "settled") {
    el.innerHTML = `
      <div class="home-homeless">
        <p>Du har ikke kjøpt nabolag ennå.</p>
        <button id="buyDistrictBtn">Velg nabolag</button>
      </div>
    `;

    const btn = document.getElementById("buyDistrictBtn");
    if (btn) {
      btn.onclick = () => {
        openDistrictSelector();
      };
    }

  } else {
    el.innerHTML = `
      <div class="home-settled">
        <p><strong>${home.home.district}</strong></p>
        <p>Nivå: ${home.home.level || 1}</p>
        <button id="changeDistrictBtn">Flytt</button>
      </div>
    `;

    const btn = document.getElementById("changeDistrictBtn");
    if (btn) {
      btn.onclick = () => {
        openDistrictSelector();
      };
    }
  }
}

function renderPsycheDashboard() {

  /** @type {CiviUiActivePosition|null} */
  const activePosition = /** @type {CiviUiActivePosition|null} */ (
    window.CivicationState?.getActivePosition?.() || null
  );
  const activeCareerId = activePosition?.career_id || null;

  /** @type {CiviUiPsycheSnapshot|null} */
  const snapshot = /** @type {CiviUiPsycheSnapshot|null} */ (
    window.CivicationPsyche?.getSnapshot?.(activeCareerId) || null
  );
  if (!snapshot) return;

  const integrityEl  = document.getElementById("psyIntegrity");
  const visibilityEl = document.getElementById("psyVisibility");
  const economicEl   = document.getElementById("psyEconomic");
  const autonomyEl   = document.getElementById("psyAutonomy");
  const trustEl      = document.getElementById("psyTrust");
  const burnoutEl    = document.getElementById("psyBurnout");
  const collapseEl   = document.getElementById("psyCollapseHistory");

  // -----------------------------
  // Core values
  // -----------------------------

  if (integrityEl)
    integrityEl.textContent = String(Number(snapshot.integrity ?? 0));

  if (visibilityEl)
    visibilityEl.textContent = String(Number(snapshot.visibility ?? 0));

  if (economicEl)
    economicEl.textContent = String(Number(snapshot.economicRoom ?? 0));

  if (autonomyEl)
    autonomyEl.textContent = String(Number(snapshot.autonomy ?? 0));

  // -----------------------------
  // Trust (rolle-spesifikk)
  // -----------------------------

  if (trustEl) {
    if (snapshot.trust && Number.isFinite(snapshot.trust.value)) {
      trustEl.textContent =
        `${snapshot.trust.value} / ${snapshot.trust.max ?? 0}`;
    } else {
      trustEl.textContent = "—";
    }
  }

  // -----------------------------
  // Burnout
  // -----------------------------

  if (burnoutEl) {
    const isBurnout =
      window.CivicationPsyche?.isBurnoutActive?.() === true;

    if (isBurnout) {
      burnoutEl.style.display = "";
      burnoutEl.textContent =
        "🔥 Burnout aktiv: Autonomi midlertidig redusert.";
    } else {
      burnoutEl.style.display = "none";
      burnoutEl.textContent = "";
    }
  }

  // -----------------------------
  // Collapse history
  // -----------------------------

  if (collapseEl) {
    const collapses =
      snapshot.trust?.collapses ?? 0;

    if (collapses > 0) {
      const last = snapshot.trust?.lastCollapse;

      if (last?.at) {
        const date = new Date(last.at)
          .toLocaleDateString("no-NO");

        collapseEl.textContent =
          `${collapses} kollaps(er) · Sist: ${date}`;
      } else {
        collapseEl.textContent =
          `${collapses} kollaps(er)`;
      }
    } else {
      collapseEl.textContent =
        "Ingen registrerte kollapser";
    }
  }
}

// ============================================================
// DISTRICT SELECTOR
// ============================================================

function openDistrictSelector() {
  const modal = document.getElementById("districtModal");
  const list  = document.getElementById("districtList");
  if (!modal || !list) return;

  const civiHome = /** @type {any} */ (window.CivicationHome || {});
  /** @type {Record<string, { id?: string, name?: string, baseCost?: number, modifiers?: Record<string, number>, quizRequirements?: Record<string, unknown> }>} */
  const districts = civiHome.DISTRICTS || {};

  list.innerHTML = "";

  Object.values(districts).forEach(function (d) {
    /** @type {{ id?: string, name?: string, baseCost?: number, modifiers?: Record<string, number>, quizRequirements?: Record<string, unknown> }} */
    const district = d;
    const canBuy = window.CivicationHome?.canPurchaseDistrict?.(district.id);

    const card = document.createElement("div");
    card.className = "district-card" + (canBuy ? "" : " locked");

    card.innerHTML = `
      <div class="district-name">${district.name}</div>
      <div class="district-cost">Pris: ${district.baseCost}</div>

      <div class="district-effects">
        ${Object.entries(district.modifiers || {})
          .map(([k,v]) => `${k}: ${v > 0 ? "+" : ""}${v}`)
          .join("<br>")}
      </div>

      <div class="district-requirements">
        ${Object.entries(district.quizRequirements || {})
          .map(([k,v]) => `${k}: ${v}`)
          .join("<br>")}
      </div>

      <button ${canBuy ? "" : "disabled"}>
        ${canBuy ? "Kjøp" : "Låst"}
      </button>
    `;

    if (canBuy) {
      card.querySelector("button").onclick = () => {
        window.CivicationHome.purchaseDistrict(district.id);
        closeDistrictSelector();
      };
    }

    list.appendChild(card);
  });

  // Når nabolagsvelgeren åpnes mens en seksjons-popup er aktiv, skal listen
  // vises som et innebygd panel inni popupen. Ellers havner #districtModal bak
  // popupen, fordi popupen ligger i en høyere stacking-context (z-index 10000)
  // enn kart-/verdenslaget der #districtModal hører hjemme.
  const popup = document.getElementById("civiSectionPopup");
  const popupBody = document.getElementById("civiSectionPopupBody");
  const embed = !!(popup && popup.classList.contains("is-open") && popupBody);

  if (embed) {
    if (modal.parentElement !== popupBody) popupBody.appendChild(modal);
    modal.classList.add("is-embedded");
    modal.style.display = "";            // .is-embedded styrer visningen via CSS
    modal.scrollIntoView({ block: "nearest" });
  } else {
    modal.classList.remove("is-embedded");
    modal.style.display = "flex";
  }
}

function closeDistrictSelector() {
  const modal = document.getElementById("districtModal");
  if (!modal) return;

  modal.style.display = "none";
  modal.classList.remove("is-embedded");

  // Flytt panelet tilbake til verdenslaget slik at DOM-strukturen er konsistent
  // uavhengig av om det var innebygd i en popup eller vist som eget overlegg.
  const world = document.querySelector(".civi-world");
  if (world && modal.parentElement !== world) world.appendChild(modal);
}

// Viktig hvis knappen kaller openDistrictSelector() uten scope (inline onclick o.l.)
window.openDistrictSelector = openDistrictSelector;
window.closeDistrictSelector = closeDistrictSelector;

// Close-knapp
document.getElementById("closeDistrictModal")
  ?.addEventListener("click", closeDistrictSelector);


/**
 * @returns {void}
 */
/**
 * @typedef {{
 *   hasActiveJob: boolean,
 *   activePosition: CiviUiActivePosition|null,
 *   state: CiviUiState,
 *   clock: any,
 *   activeWorkdayItem: any,
 *   pendingEvent: any,
 *   task: any,
 *   eventViewModel: any,
 *   statusLabel: string,
 *   stability: string,
 *   roleLabel: string,
 *   placeLabel: string,
 *   currentTime: string,
 *   shiftLabel: string,
 *   taskTitle: string,
 *   taskDescription: string,
 *   timeWindowLabel: string,
 *   weekProgress: { answered: number, expected: number, pct: number },
 *   contractPressure: { daysLeft: number, daysSinceStart: number, fireAfterDays: number },
 *   dayPhase?: any
 * }} CiviUiWorkdayModel
 */

const DAY_PHASE_ORDER = [
  { id: "morning", label: "Morgen" },
  { id: "forenoon", label: "Formiddag" },
  { id: "workday", label: "Arbeidsdag" },
  { id: "lunch", label: "Lunsj" },
  { id: "afternoon", label: "Ettermiddag" },
  { id: "dinner", label: "Middag" },
  { id: "evening", label: "Kveld" },
  { id: "day_end", label: "Dagslutt / Natt" }
];

/**
 * PR D: native fasevisning for arbeidsdagspanelet. Leser fasen + dagens bunke direkte fra
 * CivicationDayProgression.inspect() og CivicationDailyMailBuilder.inspect() — begge er
 * read-only. Kaller IKKE onAppOpen/enqueue og rører ikke DOM. Erstatter fase-HUD-en som
 * tidligere ble lagt på via dayPatches.patchUI-monkey-patchen.
 * @returns {any}
 */
function computeDayPhaseModel() {
  const prog = window.CivicationDayProgression?.inspect?.() || null;
  const inspected = window.CivicationDailyMailBuilder?.inspect?.() || null;
  const items = Array.isArray(inspected?.runtime?.items) ? inspected.runtime.items : [];

  const phases = DAY_PHASE_ORDER.map((p) => {
    const rows = items.filter((row) => String(row?.phase || row?.event?.phase_tag || "") === p.id);
    const answered = rows.filter((r) => String(r?.status || "") === "answered").length;
    const delivered = rows.filter((r) => String(r?.status || "") === "delivered").length;
    const total = rows.length;
    const open = rows.filter((r) => String(r?.status || "") !== "answered").length;
    return {
      id: p.id,
      label: p.label,
      total,
      answered,
      delivered,
      open,
      done: total > 0 && open === 0,
      items: rows.map((r) => ({
        id: String(r?.event?.id || ""),
        subject: String(r?.event?.subject || ""),
        slot: String(r?.slot || ""),
        status: String(r?.status || "queued")
      }))
    };
  });

  const phase = String(prog?.phase || window.CivicationCalendar?.getPhase?.() || "morning");
  const fallbackModel = window.CivicationCalendar?.getPhaseModel?.() || {};

  const activePhase = phases.find((p) => p.id === phase) || null;
  const phaseTotal = Number(activePhase?.total || 0);
  const phaseCompleted = Number(activePhase?.answered || 0);
  const eveningSuggestions = phase === "evening" && phaseTotal === 0
    ? ["Hvil", "Les fagstoff", "Ring en venn", "Tren lett", "Planlegg morgendagen", "Legg deg tidlig", "Hobby", "Gaming / TV / lesing", "Ta en test"]
    : [];
  const blockingItems = Number(prog?.queuedItemsInPhase || 0) + Number(prog?.deliveredItemsInPhase || 0) + Number(prog?.openItemsInPhase || 0);
  const activePendingCount = Number(prog?.openItemsInPhase || 0) + Number(prog?.deliveredItemsInPhase || 0);
  const nextAction = Number(prog?.queuedItemsInPhase || 0) > 0 && activePendingCount === 0
    ? { kind: "open_bundle", label: Number(prog?.queuedItemsInPhase || 0) === 1 ? "Åpne neste" : "Åpne bolken" }
    : activePendingCount > 0
      ? { kind: "continue_bundle", label: "Svar direkte i bolken" }
      : (prog?.canAdvance && prog?.nextPhase && blockingItems === 0)
        ? { kind: "advance_phase", label: "Gå til neste fase" }
        : { kind: "wait", label: "Ingen handling" };

  return {
    hasBundle: items.length > 0,
    dayIndex: Number(prog?.dayIndex || fallbackModel.dayIndex || 1),
    phase,
    phaseLabel: String(prog?.phaseLabel || window.CivicationCalendar?.getPhaseLabel?.(phase) || ""),
    openItemsInPhase: Number(prog?.openItemsInPhase || 0),
    openItemSubjects: Array.isArray(prog?.openItemSubjects) ? prog.openItemSubjects : [],
    nextPhase: prog?.nextPhase ?? null,
    canAdvance: !!prog?.canAdvance,
    reason: String(prog?.reason || ""),
    pendingItem: prog?.pendingItem || null,
    nextQueuedItem: prog?.nextQueuedItem || null,
    completedItemsInPhase: Number(prog?.completedItemsInPhase || 0),
    queuedItemsInPhase: Number(prog?.queuedItemsInPhase || 0),
    deliveredItemsInPhase: Number(prog?.deliveredItemsInPhase || 0),
    totalItemsInPhase: phaseTotal,
    bundleItems: Array.isArray(prog?.phaseBundle?.items) ? prog.phaseBundle.items : (activePhase?.items || []),
    nextAction,
    eveningSuggestions,
    phases
  };
}


function buildDayPlanSectionHtml(_plan) {
  return "";
}

/**
 * Pure HTML for the native day-phase section. Read-only: WorkdayPanel viser fase + dagsbunke,
 * men starter ingen arbeidsdag selv (advansering eies av CivicationDayPhaseUI/DayProgression).
 * @param {any} dayPhase
 * @returns {string}
 */
function getBundleItemText(item) {
  const fields = [item?.body, item?.text, item?.situation, item?.description, item?.snippet, item?.prompt, item?.summary];
  for (const field of fields) {
    if (Array.isArray(field)) {
      const text = field.map((part) => String(part || "").trim()).filter(Boolean).join(" ");
      if (text) return text;
      continue;
    }
    const text = String(field || "").trim();
    if (text) return text;
  }
  return String(item?.subject || "").trim();
}

function isBundleTaskGate(item) {
  return [item?.mail_type, item?.type, item?.slot, item?.kind]
    .map((value) => String(value || "").toLowerCase())
    .join(" ")
    .includes("task_gate");
}

function formatDayPhaseReason(reason) {
  const key = String(reason || "").trim();
  const labels = {
    queued_items_in_phase: "du har hendelser igjen i denne bolken",
    delivered_items_in_phase: "du har en hendelse som må åpnes eller besvares",
    open_items_in_phase: "du har en åpen melding som må besvares",
    at_last_phase: "dagen er fullført",
    ready_to_advance: "ingenting"
  };
  return labels[key] || key.replace(/[_-]+/g, " ") || "ukjent";
}

function buildDayPhaseSectionHtml(dayPhase) {
  if (!dayPhase || !dayPhase.hasBundle) return "";

  const chips = (Array.isArray(dayPhase.phases) ? dayPhase.phases : [])
    .map((p) => {
      const isActive = p.id === dayPhase.phase;
      const badge = p.done ? "✅" : isActive ? "🔵" : "⬜";
      const count = p.total ? ` ${p.answered}/${p.total}` : "";
      const activeStyle = isActive ? "border-color:rgba(255,255,255,0.4);font-weight:700;" : "";
      return `<span class="civi-workday-phase-chip${isActive ? " is-active" : ""}" style="padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);${activeStyle}">${badge} ${p.label}${count}</span>`;
    })
    .join("");

  const current = (Array.isArray(dayPhase.phases) ? dayPhase.phases : []).find((p) => p.id === dayPhase.phase) || null;
  const openItems = Array.isArray(dayPhase.bundleItems)
    ? dayPhase.bundleItems.filter((it) => !["answered", "resolved"].includes(String(it.status || "").toLowerCase()))
    : (current && Array.isArray(current.items) ? current.items.filter((it) => it.status !== "answered") : []);

  const openList = openItems.length
    ? `<div class="civi-workday-bundle-list" style="display:grid;gap:8px;margin-top:8px;">${openItems
        .map((it) => {
          const id = String(it.id || "");
          const optional = it.optional === true || it.required === false;
          const choices = Array.isArray(it.choices) ? it.choices : [];
          const hasChoices = choices.length > 0 || it.hasChoices === true || Number(it.choiceCount || 0) > 0;
          const bodyText = getBundleItemText(it);
          const taskGate = isBundleTaskGate(it);
          let action = "";
          if (taskGate) {
            action = `<p class="civi-workday-sub">Oppgave som må gjøres før du kan gå videre</p><button class="civi-btn secondary" type="button" data-civi-bundle-task="${escapeHtml(id)}">Gjør oppgave</button>`;
          } else if (hasChoices && choices.length) {
            action = `<div class="civi-workday-bundle-choices" role="group" aria-label="Svaralternativer">${choices.map((choice) => `<button class="civi-btn secondary" type="button" data-civi-bundle-event="${escapeHtml(id)}" data-civi-bundle-choice="${escapeHtml(choice.id || "")}">${escapeHtml(choice.label || choice.id || "Velg")}</button>`).join(" ")}</div>`;
          } else if (hasChoices) {
            action = `<button class="civi-btn secondary" type="button" data-civi-bundle-event="${escapeHtml(id)}" data-civi-bundle-choice="A">Vis valg</button>`;
          } else {
            action = `<p class="civi-workday-sub">Dette er en beskjed eller automatisk hendelse. Bruk knappen når du er ferdig med å lese.</p><button class="civi-btn secondary" type="button" data-civi-bundle-handled="${escapeHtml(id)}" title="Brukes når dette bare er en beskjed eller automatisk hendelse.">Ferdig med denne</button>`;
          }
          const skip = optional ? `<button class="civi-btn secondary" type="button" data-civi-bundle-skip="${escapeHtml(id)}">Hopp over</button>` : "";
          return `<article class="civi-workday-bundle-card" style="padding:8px;border:1px solid rgba(255,255,255,0.12);border-radius:10px;">
            <strong>${escapeHtml(it.subject || it.slot || it.id || "Hendelse")}</strong>
            <div class="civi-workday-sub">${escapeHtml(it.mail_type || "mail")} · ${escapeHtml(it.slot || "slot")} · ${escapeHtml(it.status || "status")} · ${optional ? "Valgfri" : "Påkrevd"}</div>
            ${bodyText ? `<p class="civi-workday-sub">${escapeHtml(bodyText)}</p>` : ""}
            <div style="margin-top:6px;">${action} ${skip}</div>
          </article>`;
        })
        .join("")}</div>`
    : `<div class="civi-workday-sub"><strong>Bolken er ferdig.</strong></div>`;

  const action = dayPhase.nextAction || {};
  const remainingText = Number(dayPhase.queuedItemsInPhase || 0) > 0 ? `<div class="civi-workday-sub"><strong>${dayPhase.phaseLabel}bolk</strong> · ${dayPhase.queuedItemsInPhase} hendelser gjenstår</div>` : "";
  const openBundleLabel = Number(dayPhase.queuedItemsInPhase || 0) === 1 ? "Åpne neste" : "Åpne bolken";
  const actionHtml = action.kind === "open_bundle"
    ? `<button class="civi-btn" type="button" data-civi-open-phase-bundle>${openBundleLabel}</button>`
    : action.kind === "continue_bundle"
      ? `<span class="civi-workday-sub">Fortsett bolken: svar direkte i kortene under.</span>`
      : action.kind === "advance_phase"
      ? `<button class="civi-btn" type="button" data-civi-advance-phase>Gå til neste fase</button>`
      : `<span class="civi-workday-sub">${action.label || "Ingen handling"}</span>`;
  const suggestionsHtml = Array.isArray(dayPhase.eveningSuggestions) && dayPhase.eveningSuggestions.length
    ? `<div class="civi-workday-evening-suggestions"><strong>Kveldsforslag:</strong> ${dayPhase.eveningSuggestions.join(" · ")}</div>`
    : "";

  return `
    <div class="civi-workday-phase" style="margin-bottom:12px;padding:12px;border:1px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.04);">
      <div class="civi-workday-phase-head" style="font-weight:700;margin-bottom:8px;">Dag ${dayPhase.dayIndex} · ${dayPhase.phaseLabel || dayPhase.phase}</div>
      <div class="civi-workday-phase-chips" style="display:flex;gap:8px;flex-wrap:wrap;">${chips}</div>
      <div class="civi-workday-phase-open-head" style="margin-top:8px;font-weight:600;">Åpne i fasen: ${dayPhase.openItemsInPhase}</div>
      <div class="civi-workday-sub">Fullført/totalt i fasen: ${dayPhase.completedItemsInPhase || 0}/${dayPhase.totalItemsInPhase || ((dayPhase.completedItemsInPhase || 0) + (dayPhase.openItemsInPhase || 0))} · Åpent nå: ${(dayPhase.pendingItem && (dayPhase.pendingItem.subject || dayPhase.pendingItem.id)) || "—"} · Neste i kø: ${(dayPhase.nextQueuedItem && (dayPhase.nextQueuedItem.subject || dayPhase.nextQueuedItem.id)) || "—"} · Dette stopper neste fase: ${dayPhase.canAdvance ? "ingenting" : formatDayPhaseReason(dayPhase.reason)}</div>
      ${remainingText}
      <div class="civi-workday-phase-action" style="margin-top:8px;">${actionHtml}</div>
      ${suggestionsHtml}
      ${openList}
    </div>
  `;
}

/**
 * Single source of truth for the workday panel's data. Pure read of CivicationState,
 * CivicationCalendar, CivicationTaskEngine and the inbox — no DOM, no side effects. Both the
 * renderer (renderWorkdayPanel) and the read-only snapshot (getCurrentWorkdaySnapshot) use it,
 * so there is exactly one computation, not two.
 * @returns {CiviUiWorkdayModel}
 */
function computeWorkdayModel() {
  const active = /** @type {CiviUiActivePosition|null|undefined} */ (window.CivicationState?.getActivePosition?.()) || null;
  const state = /** @type {CiviUiState} */ (window.CivicationState?.getState?.() || {});
  const career = /** @type {any} */ (state?.career || {});
  const progress = career?.progress || {};
  const contract = career?.contract || {};
  const activeWorkdayItem = getActiveWorkdayInboxItem();
  const ev = activeWorkdayItem?.event || activeWorkdayItem || null;

  const clock = window.CivicationCalendar?.getDisplayModel?.() || null;

  const task =
    ev?.task_id && window.CivicationTaskEngine?.getTaskById
      ? window.CivicationTaskEngine.getTaskById(ev.task_id)
      : null;
  const eventViewModel = ev ? buildCiviEventViewModel(ev, { activePosition: active }) : null;

  const placeLabel =
    String(active?.brand_name || "").trim() ||
    String(ev?.brand_name || "").trim() ||
    "Ikke satt";

  const currentTime = clock?.currentLabel || "—";
  const shiftLabel = clock ? `${clock.shiftStartLabel}–${clock.shiftEndLabel}` : "—";

  const taskTitle =
    task?.title ||
    ev?.subject ||
    "Ingen aktiv arbeidsoppgave akkurat nå.";

  const taskDescription =
    task?.description ||
    (Array.isArray(ev?.situation) ? ev.situation[0] : "") ||
    (ev ? "—" : "Jobbstatus er aktiv, men ingen arbeidsoppgave venter på svar.");

  const timeWindowLabel =
    ev?.calendar_label ||
    (task?.time_window
      ? `${task.time_window.startsAtLabel}–${task.time_window.deadlineAtLabel}`
      : "—");

  const answered = Number(progress?.answeredCount || 0);
  const expected = Number(progress?.expectedCount || 0);
  const pct = Math.max(0, Math.min(100, Math.round(Number(progress?.completionRate || 0) * 100)));

  const stability = String(state?.stability || "STABLE").toUpperCase();
  const statusLabel =
    stability === "WARNING" ? "Advarsel" : stability === "FIRED" ? "Sparket" : "Stabil";

  const daysSinceStart = Number(progress?.daysSinceStart || 0);
  const fireAfterDays = Number(contract?.fireAfterDays || 14);
  const daysLeft = Math.max(0, fireAfterDays - Math.floor(daysSinceStart));

  return {
    hasActiveJob: !!active,
    activePosition: active,
    state,
    clock,
    activeWorkdayItem,
    pendingEvent: ev,
    task,
    eventViewModel,
    statusLabel,
    stability,
    roleLabel: String(active?.title || "—"),
    placeLabel,
    currentTime,
    shiftLabel,
    taskTitle,
    taskDescription,
    timeWindowLabel,
    weekProgress: { answered, expected, pct },
    contractPressure: { daysLeft, daysSinceStart, fireAfterDays },
    dayPhase: computeDayPhaseModel()
  };
}

/**
 * Read-only snapshot of the current workday state for debugging and future UI work. Does not
 * touch the DOM and does not depend on the panel host existing — safe to call any time.
 * Exposed as window.HG_CiviWorkdaySnapshot (see README/SYSTEM_REGISTRY.md).
 * @returns {CiviUiWorkdayModel}
 */
function getCurrentWorkdaySnapshot() {
  return computeWorkdayModel();
}

function renderWorkdayPanel() {
  const host = document.getElementById("civiWorkdayPanel");
  if (!host) return;

  const model = computeWorkdayModel();

  if (!model.hasActiveJob) {
    host.innerHTML = `
      <div class="civi-workday-empty">
        <div>Ingen aktiv jobb akkurat nå.</div>
        <div class="muted">Ta imot et jobbtilbud for å starte arbeidsdagen.</div>
      </div>
    `;
    return;
  }

  const active = model.activePosition;
  const ev = model.pendingEvent;
  const eventModel = model.eventViewModel;
  const brandName = model.placeLabel;
  const currentTime = model.currentTime;
  const shiftLabel = model.shiftLabel;
  const statusLabel = model.statusLabel;
  const taskTitle = model.taskTitle;
  const taskDesc = model.taskDescription;
  const windowLabel = model.timeWindowLabel;
  const answered = model.weekProgress.answered;
  const expected = model.weekProgress.expected;
  const pct = model.weekProgress.pct;
  const daysLeft = model.contractPressure.daysLeft;

  host.innerHTML = `
  <div class="civi-workday">
    <div class="civi-workday-top">
      <div class="civi-workday-clock">
        <div class="civi-workday-label">Klokke</div>
        <div class="civi-workday-time">${currentTime}</div>
        <div class="civi-workday-sub">Skift: ${shiftLabel}</div>
      </div>

      <div class="civi-workday-meta">
        <div class="civi-workday-row">
          <span class="muted">Rolle</span>
          <strong>${active?.title || "—"}</strong>
        </div>
        <div class="civi-workday-row">
          <span class="muted">Brand / sted</span>
          <strong>${brandName}</strong>
        </div>
        <div class="civi-workday-row">
          <span class="muted">Status</span>
          <strong>${statusLabel}</strong>
        </div>
      </div>
    </div>

    <div class="civi-workday-grid">
      <div class="civi-workday-card ${eventModel?.cssClass || ""}">
        <div class="civi-workday-label">${eventModel?.kicker || "Situasjon"}</div>
        <div class="civi-workday-task-title">${eventModel?.title || taskTitle}</div>
        <div class="civi-workday-task-desc">${eventModel?.bodyText || taskDesc}</div>
        ${
          eventModel?.metaLines?.length
            ? `<div class="civi-workday-sub">${eventModel.metaLines.join(" · ")}</div>`
            : ""
        }
        ${
          ev?.id
            ? `<button class="civi-task-open-btn" data-open-task="${ev.id}">Hva gjør du?</button>`
            : ``
        }
      </div>

      <div class="civi-workday-card">
        <div class="civi-workday-label">Tidsvindu</div>
        <div class="civi-workday-big">${windowLabel}</div>
        <div class="civi-workday-sub">Neste deadline i denne arbeidsøkten</div>
      </div>

      <div class="civi-workday-card">
        <div class="civi-workday-label">Ukeprogresjon</div>
        <div class="civi-workday-big">${answered} / ${expected}</div>
        <div class="civi-workday-sub">${pct}% fullført</div>
      </div>

      <div class="civi-workday-card">
        <div class="civi-workday-label">Kontraktspress</div>
        <div class="civi-workday-big">${daysLeft} dager</div>
        <div class="civi-workday-sub">igjen før ny vurdering</div>
      </div>
    </div>
  </div>
`;

// PR D/G: native fasevisning + dag-dekorasjoner øverst i panelet. Erstatter dayPatches sin
// renderWorkdayPanel-monkey-patch fullstendig: fase-HUD (buildDayPhaseSectionHtml) + ukesrapport,
// kontakter og kunnskaps-task, lest fra de eksisterende globale day*-helperne (defensivt — de
// lastes som klassiske script og finnes på runtime). Samme rekkefølge som monkey-patchen ga:
// kunnskap · kontakter · ukesrapport · fase-HUD · arbeidsdag-innhold.
const dayPlanHtml = buildDayPlanSectionHtml(model.dayPhase?.dayPlan);
const dayPhaseHtml = buildDayPhaseSectionHtml(model.dayPhase);
const weeklyHtml = typeof window.buildWeeklyReportHtml === "function" ? (window.buildWeeklyReportHtml() || "") : "";
const contactsHtml = typeof window.buildContactsHtml === "function" ? (window.buildContactsHtml() || "") : "";
const activePhaseTasks = window.CivicationTaskEngine?.listOpenTasksForCurrentPhase?.() || [];
const firstPhaseTask = Array.isArray(activePhaseTasks) && activePhaseTasks.length ? activePhaseTasks[0] : null;
const knowledgeHtml = typeof window.buildKnowledgeTaskHtml === "function" ? (window.buildKnowledgeTaskHtml(firstPhaseTask) || "") : "";

const prependHtml = `${knowledgeHtml}${contactsHtml}${weeklyHtml}${dayPlanHtml}${dayPhaseHtml}`;
if (prependHtml) {
  host.insertAdjacentHTML("afterbegin", prependHtml);
}

if (typeof host.addEventListener === "function" && !host.__civiWorkdayBundleDelegated) {
  host.__civiWorkdayBundleDelegated = true;
  host.addEventListener("click", async function (event) {
    const btn = event.target?.closest?.("button");
    if (!btn || !host.contains(btn) || btn.disabled) return;
    if (btn.matches("[data-civi-open-phase-bundle]")) {
      event.preventDefault();
      await window.CivicationDailyMailBuilder?.enqueuePhaseBundle?.(window.HG_CiviEngine || null, { ignorePending: true, limit: 5 });
      try { window.dispatchEvent(new Event("updateProfile")); } catch {}
      return;
    }
    if (btn.matches("[data-civi-open-next-event]")) {
      event.preventDefault();
      await window.CivicationDailyMailBuilder?.enqueueNext?.(window.HG_CiviEngine || null, { ignorePending: false });
      try { window.dispatchEvent(new Event("updateProfile")); } catch {}
      return;
    }
    if (btn.matches("[data-civi-bundle-choice]")) {
      event.preventDefault();
      const mailId = btn.getAttribute("data-civi-bundle-event");
      const choiceId = btn.getAttribute("data-civi-bundle-choice");
      if (mailId && choiceId) {
        const builder = window.CivicationDailyMailBuilder;
        if (typeof builder?.answerBundleItem === "function") await builder.answerBundleItem(mailId, choiceId);
        else await builder?.markAnswered?.(mailId, choiceId);
        try { window.dispatchEvent(new Event("updateProfile")); } catch {}
      }
      return;
    }
    if (btn.matches("[data-civi-bundle-handled], [data-civi-bundle-skip]")) {
      event.preventDefault();
      const mailId = btn.getAttribute("data-civi-bundle-handled") || btn.getAttribute("data-civi-bundle-skip");
      if (mailId) {
        await window.CivicationDailyMailBuilder?.markHandled?.(mailId, btn.matches("[data-civi-bundle-skip]") ? "skipped" : "handled");
        try { window.dispatchEvent(new Event("updateProfile")); } catch {}
      }
      return;
    }
    if (btn.matches("[data-civi-bundle-task]")) {
      event.preventDefault();
      const mailId = btn.getAttribute("data-civi-bundle-task");
      if (mailId) openTaskModalByMailId(mailId);
    }
  });
}

host.querySelectorAll("[data-civi-advance-phase]").forEach(function (btn) {
  btn.addEventListener("click", async function () {
    await window.CivicationDayProgression?.advancePhaseIfReady?.();
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
  });
});

host.querySelectorAll("[data-open-task]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const mailId = btn.getAttribute("data-open-task");
    if (!mailId) return;
    openTaskModalByMailId(mailId);
  });
});
}

  

function metricLabel(metricKey) {
  const labels = {
    kundetillit: "Kundetillit",
    brand_tillit: "Arbeidsgivers tillit",
    faglighet: "Faglighet",
    driftsflyt: "Driftsflyt",
    risiko: "Risiko",
    stress: "Stress",
    integritet: "Integritet"
  };
  if (labels[metricKey]) return labels[metricKey];
  const text = String(metricKey || "").replace(/_/g, " ").trim();
  if (!text) return "Ukjent";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function buildBrandConsequenceText(answerResult) {
  const delta = answerResult?.brand_consequence?.delta || answerResult?.delta || null;
  const normalized = delta && typeof delta === "object" ? delta : null;
  if (!normalized) return null;

  const parts = Object.entries(normalized)
    .map(function ([key, value]) {
      const num = Number(value || 0);
      if (!num) return null;
      return `${metricLabel(key)} ${num > 0 ? `+${num}` : String(num)}`;
    })
    .filter(Boolean);

  if (!parts.length) return null;
  return `Konsekvens: ${parts.join(" · ")}`;
}

function getTaskWindowLabel(task, ev) {
  if (ev?.calendar_label) return ev.calendar_label;

  const tw = task?.time_window;
  if (!tw) return "—";

  return `${tw.startsAtLabel}–${tw.deadlineAtLabel}`;
}

/**
 * @param {string} mailId
 * @returns {void}
 */
function openTaskModalByMailId(mailId) {
  const modal = document.getElementById("civiTaskModal");
  const body = document.getElementById("civiTaskModalBody");
  const title = document.getElementById("civiTaskModalTitle");
  if (!modal || !body || !title) return;

  const inbox =
    window.CivicationMailEngine?.getInbox?.() ||
    window.CivicationState?.getInbox?.() ||
    [];
  const ev =
    inbox
      .map(function (item) { return item?.event || null; })
      .find(function (eventObj) {
        return eventObj && eventObj.id === mailId;
      }) || null;

  const task =
    window.CivicationTaskEngine?.getTaskByMailId?.(mailId) || null;

  if (!ev && !task) return;

  const displayTitle =
    task?.title ||
    ev?.subject ||
    "Oppgave";

  const desc =
    task?.description ||
    (Array.isArray(ev?.situation) ? ev.situation[0] : "") ||
    "—";

  const knowledgeTargets = Array.isArray(task?.knowledge_targets)
    ? task.knowledge_targets
    : [];

  const quizTargets = Array.isArray(task?.quiz_targets)
    ? task.quiz_targets
    : [];

  const workType =
    String(task?.kind || ev?.task_kind || "oppgave");

  const duration =
    Number(task?.durationMinutes || ev?.work_minutes || ev?.duration_minutes || 0);

  const windowLabel = getTaskWindowLabel(task, ev);

  const brandName =
    String(task?.brand_name || ev?.brand_name || "").trim() || "—";

  title.textContent = displayTitle;

  body.innerHTML = `
    <div class="civi-task-box">
      <div class="civi-task-kicker">Oppgavebeskrivelse</div>
      <div class="civi-task-title">${displayTitle}</div>
      <div class="civi-task-desc">${desc}</div>
    </div>

    <div class="civi-task-meta">
      <div class="civi-task-box">
        <div class="civi-task-kicker">Arbeidstype</div>
        <div><strong>${workType}</strong></div>
      </div>

      <div class="civi-task-box">
        <div class="civi-task-kicker">Tidsvindu</div>
        <div><strong>${windowLabel}</strong></div>
      </div>

      <div class="civi-task-box">
        <div class="civi-task-kicker">Varighet</div>
        <div><strong>${duration ? `${duration} min` : "—"}</strong></div>
      </div>

      <div class="civi-task-box">
        <div class="civi-task-kicker">Brand / sted</div>
        <div><strong>${brandName}</strong></div>
      </div>
    </div>

    <div class="civi-task-box">
      <div class="civi-task-kicker">Kunnskapsmål</div>
      ${
        knowledgeTargets.length
          ? `<ul class="civi-task-list">${knowledgeTargets.map(function (x) {
              return `<li>${x}</li>`;
            }).join("")}</ul>`
          : `<div class="civi-task-desc">Ingen spesifikke kunnskapsmål registrert ennå.</div>`
      }
    </div>

    <div class="civi-task-box">
      <div class="civi-task-kicker">Quizkobling</div>
      ${
        quizTargets.length
          ? `<ul class="civi-task-list">${quizTargets.map(function (x) {
              return `<li>${x}</li>`;
            }).join("")}</ul>`
          : `<div class="civi-task-desc">Ingen quizkobling registrert ennå.</div>`
      }
    </div>

    <div class="civi-task-actions">
      <button class="civi-modal-close" type="button" id="civiTaskModalCloseInner">Lukk</button>
    </div>
  `;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");

  document.getElementById("civiTaskModalCloseInner")
    ?.addEventListener("click", closeTaskModal);
}

function closeTaskModal() {
  const modal = document.getElementById("civiTaskModal");
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}


function getInboxItemsForCivicationUi() {
  const fromFlow = window["CivicationIncomingFlow"]?.getInbox?.();
  if (Array.isArray(fromFlow)) return fromFlow;

  const fromMailEngine = window.CivicationMailEngine?.getInbox?.();
  if (Array.isArray(fromMailEngine)) return fromMailEngine;

  const fromState = window.CivicationState?.getInbox?.();
  if (Array.isArray(fromState)) return fromState;

  return [];
}

function normalizeCiviInboxClassifierValue(value) {
  return String(value || "").trim().toLowerCase();
}

function collectCiviInboxClassifierValues(target, output) {
  if (!target || typeof target !== "object") return;

  [
    "mail_type",
    "type",
    "source_type",
    "mail_class",
    "channel",
    "messageChannel",
    "task_kind",
    "task_domain",
    "source",
    "phase",
    "phase_tag",
    "kind",
    "track",
    "arc"
  ].forEach(function (key) {
    const normalized = normalizeCiviInboxClassifierValue(target[key]);
    if (normalized) output.add(normalized);
  });
}

function collectCiviInboxMetaValues(target, output) {
  if (!target || typeof target !== "object") return;

  Object.keys(target).forEach(function (key) {
    const value = target[key];
    if (Array.isArray(value)) {
      value.forEach(function (entry) {
        const normalized = normalizeCiviInboxClassifierValue(entry);
        if (normalized) output.add(normalized);
      });
      return;
    }

    if (value == null || typeof value === "object") return;
    const normalized = normalizeCiviInboxClassifierValue(value);
    if (normalized) output.add(normalized);
  });
}

/**
 * Visuell innboks-sortering for Civication.html.
 * Returnerer bare presentasjonsgruppene "job", "personal" eller "other"
 * og endrer ikke mail store, localStorage eller answer-flow. "other" vises
 * sammen med personlige meldinger nedenfor slik at usikre meldinger ikke skjules.
 *
 * @param {CiviUiInboxItem|CiviUiEvent|null|undefined} item
 * @returns {"job"|"personal"|"other"}
 */
function classifyCiviInboxItem(item) {
  const ev = /** @type {Record<string, any>} */ (item?.event || item || {});
  const kind = window.CivicationEventChannels?.classifyEvent?.(ev);
  if (kind === "system") return "other";

  const channel = window.CivicationEventChannels?.getMessageChannel?.(ev);
  if (channel === "job") return "job";
  if (channel === "private") return "personal";
  return "other";
}

window.classifyCiviInboxItem = classifyCiviInboxItem;


function getChannelBuckets() {
  const inbox = getInboxItemsForCivicationUi();
  const splitter = window.CivicationEventChannels?.splitInboxByMessageChannel;
  if (typeof splitter !== "function") {
    return { job: [], private: inbox, system: [], unknown: [] };
  }
  return splitter(inbox);
}

function hasWorkdayTaskData(event) {
  const ev = event || {};
  return !!(
    ev.task_id ||
    ev.task_kind ||
    ev.task_domain ||
    ev.work_minutes ||
    ev.duration_minutes ||
    ev.calendar_label
  );
}

function isPrivatePhaseEvent(event) {
  const ev = event || {};
  const values = [
    ev.source_type, ev.phase_tag, ev.phase, ev.slot, ev.timeSlot, ev.time_slot,
    ev.channel, ev.messageChannel, ev.mail_class, ev.mail_type, ev.type, ev.kind, ev.track, ev.arc
  ].map(function (value) { return normalizeCiviInboxClassifierValue(value); });

  return values.some(function (value) {
    return value === "private" ||
      value === "life" ||
      value === "evening" ||
      value === "free_time" ||
      value === "leisure" ||
      value === "fritid" ||
      value === "personal" ||
      value === "kveld";
  });
}

let selectedDailyMailId = null;

function findCiviInboxItemByMailId(mailId) {
  const id = String(mailId || "").trim();
  if (!id) return null;
  const inbox = getInboxItemsForCivicationUi();
  return (Array.isArray(inbox) ? inbox : []).find(function (item) {
    const ev = item?.event || item || null;
    return String(item?.id || "").trim() === id || String(ev?.id || "").trim() === id;
  }) || null;
}

function isTaskGateMailEvent(ev) {
  const type = String(ev?.mail_type || ev?.type || ev?.kind || "").toLowerCase();
  const source = String(ev?.source_type || "").toLowerCase();
  return type === "task_gate" || source === "task_gate" || !!ev?.task_id || !!ev?.task_kind;
}

function openDailyMailById(mailId) {
  const id = String(mailId || "").trim();
  if (!id) return false;
  const item = findCiviInboxItemByMailId(id);
  const ev = item?.event || item || null;
  if (ev && (isTaskGateMailEvent(ev) || window.CivicationTaskEngine?.getTaskByMailId?.(id))) {
    openTaskModalByMailId(id);
    return true;
  }
  if (!ev) return false;
  selectedDailyMailId = String(ev.id || id);
  window.CivicationMailEngine?.markRead?.(id);
  renderCivicationInbox();
  try { document.getElementById("civiInbox")?.scrollIntoView?.({ block: "start", behavior: "smooth" }); } catch {}
  return true;
}

function openFirstDailyMailFromInspection(inspection) {
  const items = Array.isArray(inspection?.phaseBundle?.items) ? inspection.phaseBundle.items : [];
  const first = items.find(function (it) {
    return !["answered", "resolved"].includes(String(it?.status || "").toLowerCase());
  });
  return first?.id ? openDailyMailById(first.id) : false;
}

function getActiveWorkdayInboxItem() {
  const fromFlow = window["CivicationIncomingFlow"]?.getActiveWorkdayItem?.();
  if (fromFlow) return fromFlow;

  const inbox = getInboxItemsForCivicationUi();
  const pendingItems = inbox.filter(function (item) {
    return item && String(item.status || "pending") === "pending";
  });
  const channels = window.CivicationEventChannels;

  const workday = pendingItems.find(function (item) {
    const ev = item?.event || item || null;
    if (!ev || isPrivatePhaseEvent(ev) || channels?.isPrivateMessage?.(ev)) return false;
    return channels?.isWorkdayEvent?.(ev) === true;
  });
  if (workday) return workday;

  return pendingItems.find(function (item) {
    const ev = item?.event || item || null;
    if (!ev || isPrivatePhaseEvent(ev) || channels?.isPrivateMessage?.(ev)) return false;
    return channels?.isJobMail?.(ev) === true && hasWorkdayTaskData(ev);
  }) || null;
}

function findPendingFromItems(items) {
  if (!Array.isArray(items)) return null;
  const pendingItem = items.find(function (item) { return item && item.status === "pending"; });
  return pendingItem?.event || null;
}

function normalizeDisplayText(value, fallback) {
  const text = String(value || "").trim();
  return text || fallback;
}

function buildCiviEventViewModel(event, options) {
  const ev = event || {};
  const opts = options || {};
  const kind = window.CivicationEventChannels?.classifyEvent?.(ev) || "unknown";
  const active = opts.activePosition || window.CivicationState?.getActivePosition?.() || null;
  const npc = ev.from && window.CivicationNPCs?.lookup?.(ev.from);
  const situation = Array.isArray(ev.situation) ? ev.situation.filter(Boolean).join(" ") : normalizeDisplayText(ev.situation, "");
  const choices = Array.isArray(ev.choices) ? ev.choices.filter(Boolean) : [];

  const model = {
    kind: "fallback",
    kicker: "Neste handling",
    title: normalizeDisplayText(ev.subject || ev.title, "Oppdatering"),
    metaLines: [],
    bodyText: situation || normalizeDisplayText(ev.message || ev.feedback, "Åpne meldingen for detaljer."),
    choices: choices,
    cssClass: "civi-event-card is-fallback"
  };

  if (kind === "workday") {
    model.kind = "workday";
    model.kicker = "Dagens situasjon";
    model.title = normalizeDisplayText(ev.subject || ev.title, "Arbeidsdag");
    model.metaLines.push(`Rolle: ${normalizeDisplayText(active?.title, "—")}`);
    if (active?.brand_name || ev?.brand_name) {
      model.metaLines.push(`Sted: ${normalizeDisplayText(active?.brand_name || ev?.brand_name, "—")}`);
    }
    if (ev.pressure) {
      const pressure = Array.isArray(ev.pressure) ? ev.pressure.join(", ") : ev.pressure;
      model.metaLines.push(`Press: ${normalizeDisplayText(pressure, "—")}`);
    }
    model.bodyText = situation || "Du er på jobb, og et valg krever handling.";
    model.cssClass = "civi-event-card is-workday";
    return model;
  }

  if (kind === "message") {
    model.kind = "message";
    model.kicker = "Melding";
    model.title = normalizeDisplayText(ev.subject || ev.title, "Ny melding");
    if (npc?.name) {
      model.metaLines.push(`Fra: ${npc.name}${npc?.title ? ` · ${npc.title}` : ""}`);
    } else if (ev.from) {
      model.metaLines.push(`Fra: ${ev.from}`);
    }
    if (ev.place_id) model.metaLines.push(`Sted: ${String(ev.place_id).replace(/_/g, " ")}`);
    model.cssClass = "civi-event-card is-message";
    return model;
  }

  if (kind === "milestone") {
    model.kind = "milestone";
    model.kicker = "Ny milepæl";
    model.title = normalizeDisplayText(ev.subject || ev.title, "Ny milepæl");
    model.bodyText = situation || "Du har låst opp et nytt steg i rollen din.";
    if (ev.brand_name || active?.brand_name) model.metaLines.push(`Arbeidssted: ${normalizeDisplayText(ev.brand_name || active?.brand_name, "—")}`);
    if (ev.feedback) model.metaLines.push(`Hvorfor: ${String(ev.feedback).trim()}`);
    model.cssClass = "civi-event-card is-milestone";
    return model;
  }

  if (kind === "system") {
    model.kind = "system";
    model.kicker = "Systembeskjed";
    model.cssClass = "civi-event-card is-system";
    return model;
  }

  model.kind = "fallback";
  model.kicker = "Melding";
  model.title = normalizeDisplayText(ev.subject || ev.title, "Oppdatering");
  model.cssClass = "civi-event-card is-fallback";
  return model;
}

// ============================================================
// INBOX
// ============================================================

/**
 * @returns {void}
 */
function renderCivicationInbox() {
  // =========================
  // PROFILE-MODE (profile.html)
  // =========================
  const box = document.getElementById("civiInboxBox");
  if (box) {
    const subj = document.getElementById("civiMailSubject");
    const text = document.getElementById("civiMailText");
    const fb   = document.getElementById("civiMailFeedback");

    const btnA = document.getElementById("civiChoiceA");
    const btnB = document.getElementById("civiChoiceB");
    const btnC = document.getElementById("civiChoiceC");
    const btnOK = document.getElementById("civiChoiceOK");

    if (!subj || !text || !btnA || !btnB || !btnC || !btnOK || !fb) return;

    const pending = /** @type {CiviUiInboxItem|null|undefined} */ (window.HG_CiviEngine?.getPendingEvent?.());

    if (!pending?.event) {
      box.style.display = "none";
      return;
    }

    box.style.display = "";

    const ev = pending.event;

    // V2 blueprint: vis avsender (NPC) og sted hvis satt.
    const npc = ev.from && window.CivicationNPCs?.lookup?.(ev.from);
    const senderPrefix = npc ? `✉️ ${npc.name} · ${npc.title}` : "";
    const placeLine = ev.place_id ? ` · 📍 ${ev.place_id.replace(/_/g, " ")}` : "";

    subj.innerHTML = senderPrefix
      ? `<span class="civi-mail-sender">${senderPrefix}${placeLine}</span><br>📬 ${ev.subject || "—"}`
      : `📬 ${ev.subject || "—"}${placeLine}`;

    text.textContent = /** @type {string} */ (
      Array.isArray(ev.situation)
        ? ev.situation.join(" ")
        : (ev.situation || "—")
    );

    fb.style.display = "none";
    btnOK.style.display = "none";
    btnA.style.display = "none";
    btnB.style.display = "none";
    btnC.style.display = "none";

    const choices = Array.isArray(ev.choices) ? ev.choices : [];

    function bindChoice(btn, id, label) {
      btn.textContent = label;
      btn.style.display = "";
      btn.onclick = () => {
        const res = /** @type {CiviUiOfferActionResult|null|undefined} */ (window.HG_CiviEngine?.answer?.(ev.id, id));
        if (!res?.ok) return;

        fb.innerHTML = `<div>${res.feedback || "—"}</div>`;
        const consequence = buildBrandConsequenceText(res);
        if (consequence) { fb.innerHTML += `<div class="civi-choice-consequence">${consequence}</div>`; }
        fb.style.display = "";

        btnA.style.display = "none";
        btnB.style.display = "none";
        btnC.style.display = "none";

        btnOK.style.display = "";
        btnOK.onclick = () => refreshCivicationAfterAnswer(ev.id);
      };
    }

    if (!choices.length) {
     fb.textContent = ev.feedback || "—";
     fb.style.display = "";

     btnOK.style.display = "";
     btnOK.onclick = () => {
      window.HG_CiviEngine?.answer?.(ev.id, null);
      refreshCivicationAfterAnswer(ev.id);
     };

     return;
     }

    const cA = choices.find(c => c?.id === "A");
    const cB = choices.find(c => c?.id === "B");
    const cC = choices.find(c => c?.id === "C");

    if (cA) bindChoice(btnA, "A", cA.label || "A");
    if (cB) bindChoice(btnB, "B", cB.label || "B");
    if (cC) bindChoice(btnC, "C", cC.label || "C");

    return;
  }

  // =========================
  // CIVICATION-MODE (Civication.html)
  // =========================
  const host = document.getElementById("civiInbox");
  if (!host) return;

  const buckets = getChannelBuckets();
  const flow = window["CivicationIncomingFlow"];
  const inboxItems = getInboxItemsForCivicationUi();
  const allInboxItems = inboxItems.length
    ? inboxItems
    : buckets.job.concat(buckets.private, buckets.system, buckets.unknown);
  const toEvent = function (item) { return item?.event || item || null; };
  const jobMails = flow?.getPendingJobMails?.().length
    ? flow.getPendingJobMails()
    : (buckets.job.length
      ? buckets.job
      : allInboxItems.filter(function (item) { return classifyCiviInboxItem(item) === "job"; }));
  const privateMessages = flow?.getPendingPrivateMessages?.().length
    ? flow.getPendingPrivateMessages()
    : (buckets.private.length
      ? buckets.private
      : allInboxItems.filter(function (item) { return classifyCiviInboxItem(item) === "personal"; }));
  const otherMessages = (buckets.unknown || []).filter(function (item) {
    const ev = item?.event || item || null;
    return window.CivicationEventChannels?.classifyEvent?.(ev) !== "system";
  });
  const selectedItem = selectedDailyMailId ? findCiviInboxItemByMailId(selectedDailyMailId) : null;
  const selectedEvent = selectedItem?.event || selectedItem || null;
  const ev = selectedEvent || findPendingFromItems(allInboxItems);

  const renderMessageList = function (items) {
    if (!Array.isArray(items) || !items.length) return "";
    return items.map(function (item) {
      const messageEvent = toEvent(item);
      const vm = buildCiviEventViewModel(messageEvent);
      const isPending = String(item?.status || "pending") === "pending";
      const batchLabel = [messageEvent?.batch_kind, Number.isFinite(Number(messageEvent?.sequence_index)) ? `#${Number(messageEvent.sequence_index) + 1}` : ""].filter(Boolean).join(" · ");
      const outcomeLabel = messageEvent?.career_outcome || messageEvent?.job_outcome || messageEvent?.role_outcome || messageEvent?.stability || "";
      return `
        <article class="${vm.cssClass} civi-inbox-list-card${isPending ? " is-pending" : ""}">
          ${batchLabel ? `<div class="civi-event-meta-line">Bolke: ${batchLabel}</div>` : ""}
          ${outcomeLabel ? `<div class="civi-event-meta-line">Utfall: ${outcomeLabel}</div>` : ""}
          <div class="civi-event-kicker">${vm.kicker}</div>
          <div class="civi-event-title">${vm.title}</div>
          <div class="civi-event-body">${vm.bodyText}</div>
        </article>
      `;
    }).join("");
  };

  const sectionsHtml = `
    <section class="civi-inbox-section civi-jobmail-section">
      <h2>Jobbmail</h2>
      <div id="civiJobMailList">${renderMessageList(jobMails) || '<div class="civi-inbox-empty">Ingen jobbmail akkurat nå.</div>'}</div>
    </section>
    <section class="civi-inbox-section civi-private-section">
      <h2>Personlige meldinger</h2>
      <div id="civiPrivateMessageList">${renderMessageList(privateMessages) || '<div class="civi-inbox-empty">Ingen personlige meldinger akkurat nå.</div>'}</div>
    </section>
    ${otherMessages.length ? `
      <section class="civi-inbox-section civi-other-section">
        <h2>Andre meldinger</h2>
        <div id="civiOtherMessageList">${renderMessageList(otherMessages)}</div>
      </section>
    ` : ""}
  `;

  if (!ev) {
    host.innerHTML = `${sectionsHtml}<div>Ingen meldinger akkurat nå.</div>`;
    return;
  }
  const model = buildCiviEventViewModel(ev);
  const choices = model.choices;
  const metaHtml = model.metaLines.map(function (line) {
    return `<div class="civi-event-meta-line">${line}</div>`;
  }).join("");

  host.innerHTML = `
    ${sectionsHtml}
    <div class="${model.cssClass}">
      <div class="civi-event-kicker">${model.kicker}</div>
      <div class="civi-event-title">${model.title}</div>
      ${metaHtml ? `<div class="civi-event-meta">${metaHtml}</div>` : ""}
      <div class="civi-event-body">${model.bodyText}</div>
      ${choices.length ? `<div class="civi-event-next">Hva gjør du?</div>` : ""}
      <div id="civiInboxChoices" class="civi-event-choices"></div>
      <div id="civiInboxFeedback" class="civi-event-feedback" style="display:none;"></div>
      <button class="civi-btn primary" id="civiInboxOK" style="display:none;margin-top:10px;">OK</button>
    </div>
  `;

  const choiceBox = /** @type {HTMLElement|null} */ (host.querySelector("#civiInboxChoices"));
  const fb = /** @type {HTMLElement|null} */ (host.querySelector("#civiInboxFeedback"));
  const ok = /** @type {HTMLButtonElement|null} */ (host.querySelector("#civiInboxOK"));

  function showOk(txt) {
    if (fb) {
      fb.innerHTML = `<div>${txt || "—"}</div>`;
      const consequence = buildBrandConsequenceText(arguments[1]);
      if (consequence) { fb.innerHTML += `<div class="civi-choice-consequence">${consequence}</div>`; }
      fb.style.display = "";
    }
    if (ok) { ok.style.display = ""; ok.onclick = () => refreshCivicationAfterAnswer(ev.id); }
  }

  if (!choices.length) {
  if (fb) { fb.textContent = ev.feedback || "—"; fb.style.display = ""; }
  if (ok) {
    ok.style.display = "";
    ok.onclick = () => {
      window.HG_CiviEngine?.answer?.(ev.id, null);
      refreshCivicationAfterAnswer(ev.id);
    };
  }
  return;
}

  choices.forEach(c => {
    const id = String(c?.id || "").trim();
    if (!id) return;

    const b = document.createElement("button");
    b.className = "civi-btn";
    b.textContent = String(c.label || id);

    b.onclick = () => {
      const res = /** @type {CiviUiOfferActionResult|null|undefined} */ (window.HG_CiviEngine?.answer?.(ev.id, id));
      if (!res?.ok) return;

      if (choiceBox) choiceBox.innerHTML = "";
      showOk(res.feedback || "—", res);
    };

    choiceBox?.appendChild(b);
  });
}


/**
 * @returns {void}
 */
function renderCapital() {
  const capital = JSON.parse(localStorage.getItem("hg_capital_v1")) || {};

  const map = {
  economic: "capEconomic",
  cultural: "capCultural",
  social: "capSocial",
  symbolic: "capSymbolic",
  political: "capPolitical",
  institutional: "capInstitutional",
  subculture: "capSubculture"
};

  Object.keys(map).forEach(key => {
    const el = document.getElementById(map[key]);
    if (el) {
      el.textContent = String(Math.round(capital[key] || 0));
    }
  });
}

// ============================================================
// IDENTITY PERCEPTION
// ============================================================

/**
 * @returns {void}
 */
function renderPerception() {

  const el = document.getElementById("identityPerception");
  if (!el) return;

  const snapshot = /** @type {CiviUiPsycheSnapshot|null|undefined} */ (window.CivicationPsyche?.getSnapshot?.());
  const capital = JSON.parse(localStorage.getItem("hg_capital_v1") || "{}");
  const identity = /** @type {any} */ (window.HG_IdentityCore?.getProfile?.() || {});

  const lines = /** @type {any[]} */ (window.HG_IdentityCore?.generatePerceptionProfile?.({
    ...capital,
    ...snapshot,
    dominant: identity.dominant
  }) || []);

  el.innerHTML = lines
    .map(l => `<div class="perception-line">${l}</div>`)
    .join("");
}

document.getElementById("identityPerceptionBtn")
  ?.addEventListener("click", () => {

    const el = document.getElementById("identityPerception");
    if (!el) return;

    el.classList.toggle("open");
  });

/**
 * @returns {void}
 */
function renderTrackHUD() {

  const state = /** @type {CiviUiTrackHudState|null|undefined} */ (window.CivicationState.getState());
  if (!state) return;

  const tracks = /** @type {string[]} */ (Array.isArray(state.tracks) ? state.tracks : []);
  const trackProgress = state.track_progress || {};
  const tags = /** @type {string[]} */ (Array.isArray(state.identity_tags) ? state.identity_tags : []);

  const nameEl = document.getElementById("civiTrackName");
  const progEl = document.getElementById("civiTrackProgress");
  const tagsEl = document.getElementById("civiTrackTags");

  if (!nameEl || !progEl || !tagsEl) return;

  if (!tracks.length) {
    nameEl.textContent = "Ingen retning ennå";
    progEl.textContent = "";
    tagsEl.innerHTML = "";
    return;
  }

  const activeTrack = tracks[0];
  const progress = Number(trackProgress[activeTrack] || 0);

  nameEl.textContent = activeTrack.replace(/_/g, " ");
  progEl.textContent = "Progresjon: " + progress;

  const recentTags = tags.slice(0, 3);

  tagsEl.innerHTML = recentTags
    .map(t => `<span>${t}</span>`)
    .join("");
}

async function render() {
  await renderCivication();
  renderCivicationSummary();
  await renderCivicationShop();
}

window.HG_CiviProfileSnapshot = getCivicationProfileSnapshot;

// ============================================================
// EXPORT
// ============================================================

window.CivicationUI = {
  init,
  render,
  renderInbox: renderCivicationInbox,
  renderWorkdayPanel,
  getActiveWorkdayInboxItem,
  getCurrentWorkdaySnapshot,
  buildDayPhaseSectionHtml,
  buildDayPlanSectionHtml,
  renderCapital,
  renderPerception,
  renderCivicationShop,
  renderCivicationSummary,
  getCivicationProfileSnapshot,
  buildCiviEventViewModel,
  openTaskModalByMailId,
  openDailyMailById,
  openFirstDailyMailFromInspection,
  getOfferEligibilityViewModel,
  buildOfferEligibilityHtml
};

// PR G: CivicationUI eier nå window.renderWorkdayPanel (innstegspunktet de øvrige day*UI-modulene
// dekorerer via patchRenderer). Tidligere ble denne publisert av dayPatches.patchUI-monkey-patchen;
// CivicationUI lastes før dayPatches og dekoratørene, så entrypoint-et finnes tidligere og kjeden
// (dayConsequencesUI / dayNarrativeConsequencesUI / CivicationHistoryGoDeepLink) wrapper den uendret.
window.renderWorkdayPanel = renderWorkdayPanel;

// Read-only debug/helper global: inspect current workday state without touching rendering.
// Registered in README/SYSTEM_REGISTRY.md. Never write through this — it is a pure snapshot.
window.HG_CiviWorkdaySnapshot = getCurrentWorkdaySnapshot;
