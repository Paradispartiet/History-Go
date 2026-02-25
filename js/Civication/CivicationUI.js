// ============================================================
// CIVICATION UI
// ============================================================

async function init() {
  await window.HG_CiviEngine?.onAppOpen?.();
  checkTierUpgrades();

  wireCivicationActions();
  renderCivication();
  renderCivicationInbox();
  renderPsycheDashboard();
  renderCapital();
  renderHomeStatus();
  renderPublicFeed();   // ← LEGG TIL DENNE

  window.addEventListener("updateProfile", () => {
  renderCivication();
  renderCivicationInbox();
  renderPsycheDashboard();
  renderCapital();
  renderHomeStatus();
  renderPerception();   // ← LEGG TIL
});

  window.addEventListener("civi:homeChanged", renderHomeStatus);
}

// ============================================================
// ACTION WIRING (KJØRES ÉN GANG)
// ============================================================

function wireCivicationActions() {
  const btnAccept  = document.getElementById("btnCiviAccept");
  const btnDecline = document.getElementById("btnCiviDecline");

  if (!btnAccept || !btnDecline) return;

  btnAccept.onclick = async () => {
    const offer = getLatestPendingOffer();
    if (!offer) return;

    const offers = getJobOffers();
    const idx = offers.findIndex(o => o && o.id === offer.id);
    if (idx >= 0) {
      offers[idx] = {
        ...offers[idx],
        status: "accepted",
        accepted_at: new Date().toISOString()
      };
      setJobOffers(offers);
    }

    setActivePosition({
      career_id: offer.career_id,
      career_name: offer.career_name,
      title: offer.title,
      threshold: offer.threshold ?? null,
      achieved_at: new Date().toISOString()
    });

    await window.HG_CiviEngine?.onAppOpen?.();

    window.dispatchEvent(new Event("updateProfile"));
  };

  btnDecline.onclick = () => {
    const offer = getLatestPendingOffer();
    if (!offer) return;

    const offers = getJobOffers();
    const idx = offers.findIndex(o => o && o.id === offer.id);
    if (idx >= 0) {
      offers[idx] = {
        ...offers[idx],
        status: "declined",
        declined_at: new Date().toISOString()
      };
      setJobOffers(offers);
    }

    window.dispatchEvent(new Event("updateProfile"));
  };
}

// ============================================================
// RENDER MAIN CIVICATION PANEL
// ============================================================

async function renderCivication() {
  await ensureCiviCareerRulesLoaded();

  const title   = document.getElementById("civiRoleTitle");
  const details = document.getElementById("civiRoleDetails");
  const meritLn = document.getElementById("civiMeritLine");
  const salaryLn = document.getElementById("civiSalaryLine");

  const oBox   = document.getElementById("civiOfferBox");
  const oTitle = document.getElementById("civiOfferTitle");
  const oMeta  = document.getElementById("civiOfferMeta");

  if (!title || !details || !oBox || !oTitle || !oMeta) return;

  // ------------------------------------------------------------
  // AKTIV JOBB
  // ------------------------------------------------------------

  const active = getActivePosition();
  syncRoleBaseline();

  if (active && active.title) {
    title.textContent = `Rolle: ${active.title}`;

    const cn = active.career_name || active.career_id || "—";
    const dt = active.achieved_at
      ? new Date(active.achieved_at).toLocaleDateString("no-NO")
      : "";

    details.textContent =
      `Status: Aktiv · Felt: ${cn}` +
      (dt ? ` · Satt: ${dt}` : "");
  } else {
    title.textContent = "Rolle: —";
    details.textContent =
      "Status: Ingen aktiv jobb (ta quiz for å få jobbtilbud).";
  }

// ------------------------------------------------------------
// LØNN
// ------------------------------------------------------------

if (salaryLn && active?.career_id) {

  const merits =
    JSON.parse(localStorage.getItem("merits_by_category") || "{}");

  const points =
    Number(merits[active.career_id]?.points || 0);

  const badge =
    Array.isArray(window.BADGES)
      ? window.BADGES.find(b => b && String(b.id) === String(active.career_id))
      : null;

  const tierIndex =
    badge ? (deriveTierFromPoints(badge, points).tierIndex || 0) : 0;

  const career =
    Array.isArray(window.HG_CAREERS)
      ? window.HG_CAREERS.find(c => c && String(c.career_id) === String(active.career_id))
      : null;

  const weekly =
    (career && typeof window.calculateWeeklySalary === "function")
      ? window.calculateWeeklySalary(career, tierIndex)
      : NaN;

  salaryLn.textContent =
    Number.isFinite(weekly)
      ? `Lønn: ${weekly} PC / uke`
      : "Lønn: —";
}

  // ------------------------------------------------------------
  // JOBBTILBUD
  // ------------------------------------------------------------

  const offer = getLatestPendingOffer();

  if (!offer) {
    oBox.style.display = "none";
  } else {
    oBox.style.display = "";
    oTitle.textContent = "🧾 Jobbtilbud";

    const expTxt =
      offer.expires_iso
        ? new Date(offer.expires_iso).toLocaleDateString("no-NO")
        : "—";

    oMeta.textContent =
      `${offer.career_name || offer.career_id || ""} · ` +
      `Terskel: ${offer.threshold} · Utløper: ${expTxt}`;
  }

  // ------------------------------------------------------------
  // BESTE ROLLE (MERIT-PROFIL)
  // ------------------------------------------------------------

  if (!meritLn) return;

  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const keys = Object.keys(merits || {});

  if (!Array.isArray(BADGES) || !BADGES.length || !keys.length) {
    meritLn.textContent = "Merit: —";
    return;
  }

  const historyRaw =
    JSON.parse(localStorage.getItem("quiz_history") || "[]");
  const history =
    Array.isArray(historyRaw) ? historyRaw : [];

  let best = null;

  for (const k of keys) {
    const badge =
      BADGES.find(b => String(b?.id) === String(k));
    if (!badge) continue;

    const points =
      Number(merits[k]?.points || 0);

    const { tierIndex, label } =
      deriveTierFromPoints(badge, points);

    const last =
      history
        .filter(h => String(h?.categoryId) === String(k))
        .map(h => h?.date ? new Date(h.date).getTime() : 0)
        .reduce((mx, t) => Math.max(mx, t), 0);

    const item = {
      badgeName: badge.name || k,
      roleLabel: label || "Nybegynner",
      tierIndex: Number.isFinite(tierIndex) ? tierIndex : -1,
      points,
      lastQuizAt: last
    };

    if (!best) best = item;
    else if (
      item.tierIndex > best.tierIndex ||
      (item.tierIndex === best.tierIndex &&
       item.points > best.points)
    ) {
      best = item;
    }
  }

  if (!best) {
    meritLn.textContent = "Merit: —";
    return;
  }

  const lastTxt =
    best.lastQuizAt
      ? new Date(best.lastQuizAt).toLocaleDateString("no-NO")
      : "aldri";

  meritLn.textContent =
    `Merit: ${best.roleLabel} (${best.badgeName}) · ` +
    `${best.points} poeng · Sist: ${lastTxt}`;
}

function renderPublicFeed() {
  const container = document.getElementById("civiPublicFeed");
  if (!container) return;

  const feed = window.HG_CivicationPublic?.getFeed() || [];

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
  const active = getActivePosition();

  if (!active?.career_id) {
    window.HG_CiviPsyche?.clearRoleBaseline?.();
    return;
  }

  const careerId = active.career_id;

  const badge = Array.isArray(window.BADGES)
    ? window.BADGES.find(b => b.id === careerId)
    : null;

  if (!badge) {
    window.HG_CiviPsyche?.clearRoleBaseline?.();
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

  window.HG_CiviPsyche?.applyRoleBaseline?.(baseline);
}

// ============================================================
// HOME STATUS UI
// ============================================================

function renderHomeStatus() {
  const el = document.getElementById("homeStatusContent");
  if (!el) return;

  const home = window.CivicationHome?.getState?.();
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

  const activeCareerId = getActivePosition()?.career_id || null;

  const snapshot = window.CivicationPsyche?.getSnapshot?.(activeCareerId);
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
    integrityEl.textContent = Number(snapshot.integrity ?? 0);

  if (visibilityEl)
    visibilityEl.textContent = Number(snapshot.visibility ?? 0);

  if (economicEl)
    economicEl.textContent = Number(snapshot.economicRoom ?? 0);

  if (autonomyEl)
    autonomyEl.textContent = Number(snapshot.autonomy ?? 0);

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

  const districts = window.CivicationHome?.DISTRICTS || {};

  list.innerHTML = "";

  Object.values(districts).forEach(d => {
    const canBuy = window.CivicationHome?.canPurchaseDistrict?.(d.id);

    const card = document.createElement("div");
    card.className = "district-card" + (canBuy ? "" : " locked");

    card.innerHTML = `
      <div class="district-name">${d.name}</div>
      <div class="district-cost">Pris: ${d.baseCost}</div>

      <div class="district-effects">
        ${Object.entries(d.modifiers || {})
          .map(([k,v]) => `${k}: ${v > 0 ? "+" : ""}${v}`)
          .join("<br>")}
      </div>

      <div class="district-requirements">
        ${Object.entries(d.quizRequirements || {})
          .map(([k,v]) => `${k}: ${v}`)
          .join("<br>")}
      </div>

      <button ${canBuy ? "" : "disabled"}>
        ${canBuy ? "Kjøp" : "Låst"}
      </button>
    `;

    if (canBuy) {
      card.querySelector("button").onclick = () => {
        window.CivicationHome.purchaseDistrict(d.id);
        modal.style.display = "none";
      };
    }

    list.appendChild(card);
  });

  modal.style.display = "flex";
}

// Viktig hvis knappen kaller openDistrictSelector() uten scope (inline onclick o.l.)
window.openDistrictSelector = openDistrictSelector;

// Close-knapp
document.getElementById("closeDistrictModal")
  ?.addEventListener("click", () => {
    document.getElementById("districtModal").style.display = "none";
  });

// ============================================================
// INBOX
// ============================================================

function renderCivicationInbox() {
  const box = document.getElementById("civiInboxBox");
  const subj = document.getElementById("civiMailSubject");
  const text = document.getElementById("civiMailText");
  const fb   = document.getElementById("civiMailFeedback");

  const btnA = document.getElementById("civiChoiceA");
  const btnB = document.getElementById("civiChoiceB");
  const btnC = document.getElementById("civiChoiceC");
  const btnOK = document.getElementById("civiChoiceOK");

  if (!box || !subj || !text || !btnA || !btnB || !btnC || !btnOK || !fb) return;

  const pending =
    window.HG_CiviEngine?.getPendingEvent?.();

  if (!pending?.event) {
    box.style.display = "none";
    return;
  }

  box.style.display = "";

  const ev = pending.event;

  subj.textContent = `📬 ${ev.subject || "—"}`;
  text.textContent =
    Array.isArray(ev.situation)
      ? ev.situation.join(" ")
      : (ev.situation || "—");

  fb.style.display = "none";
  btnOK.style.display = "none";
  btnA.style.display = "none";
  btnB.style.display = "none";
  btnC.style.display = "none";

  const choices =
    Array.isArray(ev.choices) ? ev.choices : [];

  function bindChoice(btn, id, label) {
    btn.textContent = label;
    btn.style.display = "";
    btn.onclick = () => {
      const res =
        window.HG_CiviEngine?.answer?.(ev.id, id);

      if (!res?.ok) return;

      fb.textContent = res.feedback || "—";
      fb.style.display = "";

      btnA.style.display = "none";
      btnB.style.display = "none";
      btnC.style.display = "none";

      btnOK.style.display = "";
      btnOK.onclick = () => {
        window.dispatchEvent(new Event("updateProfile"));
      };
    };
  }

  if (!choices.length) {
    fb.textContent = ev.feedback || "—";
    fb.style.display = "";

    btnOK.style.display = "";
    btnOK.onclick = () => {
      window.dispatchEvent(new Event("updateProfile"));
    };
    return;
  }

  const cA = choices.find(c => c?.id === "A");
  const cB = choices.find(c => c?.id === "B");
  const cC = choices.find(c => c?.id === "C");

  if (cA) bindChoice(btnA, "A", cA.label || "A");
  if (cB) bindChoice(btnB, "B", cB.label || "B");
  if (cC) bindChoice(btnC, "C", cC.label || "C");
}


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
      el.textContent = Math.round(capital[key] || 0);
    }
  });
}

// ============================================================
// IDENTITY PERCEPTION
// ============================================================

function renderPerception() {

  const el = document.getElementById("identityPerception");
  if (!el) return;

  const snapshot = window.CivicationPsyche?.getSnapshot?.();
  const capital = JSON.parse(localStorage.getItem("hg_capital_v1") || "{}");
  const identity = window.HG_IdentityCore?.getProfile?.() || {};

  const lines = window.HG_IdentityCore?.generatePerceptionProfile?.({
    ...capital,
    ...snapshot,
    dominant: identity.dominant
  }) || [];

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

// ============================================================
// EXPORT
// ============================================================

window.CivicationUI = {
  init,
  render: renderCivication,
  renderInbox: renderCivicationInbox
  
};
