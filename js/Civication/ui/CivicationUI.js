// ============================================================
// CIVICATION UI
// ============================================================

async function init() {

  // Sørg for at careers er lastet
  await window.ensureCiviCareerRulesLoaded?.();

  // 🔽 START-SEKVENS hvis systemet er tomt
  const inbox =
    window.CivicationMailEngine?.getInbox?.() ||
    window.CivicationState?.getInbox?.() ||
    [];
  if (
    !window.CivicationState.getActivePosition() &&
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

  window.addEventListener("updateProfile", () => {
    renderCivication();
    renderCivicationInbox();
    renderWorkdayPanel();
    renderPsycheDashboard();
    renderCapital();
    renderHomeStatus();
    renderPerception();
    renderTrackHUD();
  });

  window.addEventListener("civi:homeChanged", renderHomeStatus);
}

function refreshCivicationAfterAnswer(previousEventId) {
  function rerenderMailViews() {
    renderCivicationInbox();
    renderWorkdayPanel();
  }

  rerenderMailViews();

  const delays = [80, 220, 500, 900];
  delays.forEach(function (delay) {
    window.setTimeout(function () {
      const pending = window.HG_CiviEngine?.getPendingEvent?.();
      const nextId = String(pending?.event?.id || "").trim() || null;

      if (!previousEventId || nextId !== previousEventId || !nextId) {
        rerenderMailViews();
        return;
      }

      rerenderMailViews();
    }, delay);
  });
}

// ============================================================
// ACTION WIRING (KJØRES ÉN GANG)
// ============================================================

function wireCivicationActions() {
  const btnAccept = document.getElementById("btnCiviAccept");
  const btnDecline = document.getElementById("btnCiviDecline");

  if (btnAccept) {
    btnAccept.onclick = () => {
      const offer = window.CivicationJobs?.getLatestPendingOffer?.();
      if (!offer) return;

      const res = window.CivicationJobs?.acceptOffer?.(offer.offer_key);
      if (!res?.ok) return;

      window.dispatchEvent(new Event("updateProfile"));
    };
  }

  if (btnDecline) {
    btnDecline.onclick = () => {
      const offer = window.CivicationJobs?.getLatestPendingOffer?.();
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
// RENDER MAIN CIVICATION PANEL
// ============================================================
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
    const active = window.CivicationState.getActivePosition();
    syncRoleBaseline();

    if (active && active.title) {
      title.textContent = `Rolle: ${active.title}`;

      const cn = active.career_name || active.career_id || "—";
      const dt = active.achieved_at
        ? new Date(active.achieved_at).toLocaleDateString("no-NO")
        : "";

      details.textContent =
        `Status: Aktiv · Felt: ${cn}` + (dt ? ` · Satt: ${dt}` : "");
    } else {
      title.textContent = "Rolle: —";
      details.textContent =
        "Status: Ingen aktiv jobb (ta quiz for å få jobbtilbud).";
    }

    // LØNN
    if (salaryLn && active?.career_id) {
      const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
      const points = Number(merits[active.career_id]?.points || 0);

      const badge = Array.isArray(window.BADGES)
        ? window.BADGES.find(b => b && String(b.id) === String(active.career_id))
        : null;

      const tierIndex =
        badge ? (deriveTierFromPoints(badge, points).tierIndex || 0) : 0;

      const career = Array.isArray(window.HG_CAREERS)
        ? window.HG_CAREERS.find(c => c && String(c.career_id) === String(active.career_id))
        : null;

      const weekly =
        (career && typeof window.calculateWeeklySalary === "function")
          ? window.calculateWeeklySalary(career, tierIndex)
          : NaN;

      salaryLn.textContent =
        Number.isFinite(weekly) ? `Lønn: ${weekly} PC / uke` : "Lønn: —";
    }

    // JOBBTILBUD (profil = indikator, ingen handling)
const offer = window.CivicationJobs?.getLatestPendingOffer?.();

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

    // BESTE ROLLE (MERIT-PROFIL) – samme som din nå
    const merits2 = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
    const keys = Object.keys(merits2 || {});

    if (!Array.isArray(BADGES) || !BADGES.length || !keys.length) {
      meritLn.textContent = "Merit: —";
      return;
    }

    const history = window.HGLearningLog?.getQuizHistory?.() ?? [];

    let best = null;

    for (const k of keys) {
      const badge = BADGES.find(b => String(b?.id) === String(k));
      if (!badge) continue;

      const points = Number(merits2[k]?.points || 0);
      const { tierIndex, label } = deriveTierFromPoints(badge, points);

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
        (item.tierIndex === best.tierIndex && item.points > best.points)
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

    return;
  }

  // =========================
  // CIVICATION-MODE (Civication.html)
  // =========================
  const host = document.getElementById("activeJobCard");
  if (!host) return;

  const active = window.CivicationState.getActivePosition();
  const offer = window.CivicationJobs?.getLatestPendingOffer?.();

  // Lønn (best effort)
  let salaryTxt = "Lønn: —";
  if (active?.career_id && typeof window.calculateWeeklySalary === "function") {
    try {
      const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
      const points = Number(merits[active.career_id]?.points || 0);

      const badge = Array.isArray(window.BADGES)
        ? window.BADGES.find(b => b && String(b.id) === String(active.career_id))
        : null;

      const tierIndex =
        badge ? (deriveTierFromPoints(badge, points).tierIndex || 0) : 0;

      const career = Array.isArray(window.HG_CAREERS)
        ? window.HG_CAREERS.find(c => c && String(c.career_id) === String(active.career_id))
        : null;

      const weekly = career ? window.calculateWeeklySalary(career, tierIndex) : NaN;
      if (Number.isFinite(weekly)) salaryTxt = `Lønn: ${weekly} PC / uke`;
    } catch {}
  }

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
  const res = window.CivicationJobs?.acceptOffer?.(offer.offer_key);
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

 const active = window.CivicationState?.getActivePosition?.();

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
    ? window.BADGES.find(b => b && String(b.id) === String(careerId))
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

  const activeCareerId =
  window.CivicationState?.getActivePosition?.()?.career_id || null;
  
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


function renderWorkdayPanel() {
  const host = document.getElementById("civiWorkdayPanel");
  if (!host) return;

  const active = window.CivicationState?.getActivePosition?.();
  const state = window.CivicationState?.getState?.() || {};
  const career = state?.career || {};
  const progress = career?.progress || {};
  const contract = career?.contract || {};
  const pending = window.HG_CiviEngine?.getPendingEvent?.();
  const ev = pending?.event || null;

  const clock =
    window.CivicationCalendar?.getDisplayModel?.() || null;

  const task =
    ev?.task_id && window.CivicationTaskEngine?.getTaskById
      ? window.CivicationTaskEngine.getTaskById(ev.task_id)
      : null;

  if (!active) {
    host.innerHTML = `
      <div class="civi-workday-empty">
        <div>Ingen aktiv jobb akkurat nå.</div>
        <div class="muted">Ta imot et jobbtilbud for å starte arbeidsdagen.</div>
      </div>
    `;
    return;
  }

  const brandName =
    String(active?.brand_name || "").trim() ||
    String(ev?.brand_name || "").trim() ||
    "Ikke satt";

  const currentTime =
    clock?.currentLabel || "—";

  const shiftLabel =
    clock
      ? `${clock.shiftStartLabel}–${clock.shiftEndLabel}`
      : "—";

  const taskTitle =
    task?.title ||
    ev?.subject ||
    "Ingen aktiv oppgave";

  const taskDesc =
    task?.description ||
    (Array.isArray(ev?.situation) ? ev.situation[0] : "") ||
    "—";

  const windowLabel =
    ev?.calendar_label ||
    (task?.time_window
      ? `${task.time_window.startsAtLabel}–${task.time_window.deadlineAtLabel}`
      : "—");

  const answered = Number(progress?.answeredCount || 0);
  const expected = Number(progress?.expectedCount || 0);
  const pct = Math.max(
    0,
    Math.min(100, Math.round(Number(progress?.completionRate || 0) * 100))
  );

  const stability = String(state?.stability || "STABLE").toUpperCase();

  const statusLabel =
    stability === "WARNING"
      ? "Advarsel"
      : stability === "FIRED"
        ? "Sparket"
        : "Stabil";

  const daysSinceStart = Number(progress?.daysSinceStart || 0);
  const daysLeft = Math.max(
    0,
    Number(contract?.fireAfterDays || 14) - Math.floor(daysSinceStart)
  );

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
      <div class="civi-workday-card">
        <div class="civi-workday-label">Situasjon</div>
        <div class="civi-workday-task-title">${taskTitle}</div>
        <div class="civi-workday-task-desc">${taskDesc}</div>
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

host.querySelectorAll("[data-open-task]").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const mailId = btn.getAttribute("data-open-task");
    if (!mailId) return;
    openTaskModalByMailId(mailId);
  });
});
}

  
function getTaskWindowLabel(task, ev) {
  if (ev?.calendar_label) return ev.calendar_label;

  const tw = task?.time_window;
  if (!tw) return "—";

  return `${tw.startsAtLabel}–${tw.deadlineAtLabel}`;
}

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



function getChannelBuckets() {
  const inbox = window.CivicationState?.getInbox?.() || [];
  const splitter = window.CivicationEventChannels?.splitInbox;
  if (typeof splitter !== "function") {
    return { messages: inbox, workday: [], milestones: [], system: [], unknown: [] };
  }
  return splitter(inbox);
}

function findPendingFromItems(items) {
  if (!Array.isArray(items)) return null;
  const pendingItem = items.find(function (item) { return item && item.status === "pending"; });
  return pendingItem?.event || null;
}

// ============================================================
// INBOX
// ============================================================

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

    const pending = window.HG_CiviEngine?.getPendingEvent?.();

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

    text.textContent =
      Array.isArray(ev.situation)
        ? ev.situation.join(" ")
        : (ev.situation || "—");

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
        const res = window.HG_CiviEngine?.answer?.(ev.id, id);
        if (!res?.ok) return;

        // V2 blueprint: hvis valget har triggers_on_choice, enkø
        // thread-mail i inbox (vises som "Re:"-oppfølger).
        try {
          const chosen = choices.find(c => String(c?.id) === String(id));
          const tid = chosen?.triggers_on_choice;
          if (tid && window.CivicationThreadBridge?.enqueueThread) {
            window.CivicationThreadBridge.enqueueThread(tid, { triggeredBy: ev.id });
          }
        } catch (err) {
          if (window.DEBUG) console.warn("[Civi] thread enqueue failed", err);
        }

        fb.textContent = res.feedback || "—";
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
  const messageItems = buckets.messages.concat(buckets.unknown);
  const ev = findPendingFromItems(messageItems);

  if (!ev) {
    host.innerHTML = `<div>Ingen meldinger akkurat nå.</div>`;
    return;
  }
  const situation = Array.isArray(ev.situation) ? ev.situation.join(" ") : (ev.situation || "—");
  const choices = Array.isArray(ev.choices) ? ev.choices : [];

  // V2 blueprint: avsender + sted
  const npc = ev.from && window.CivicationNPCs?.lookup?.(ev.from);
  const senderLine = npc
    ? `<div class="civi-mail-sender">✉️ ${npc.name} · ${npc.title}</div>`
    : "";
  const placeLine = ev.place_id
    ? `<div class="civi-mail-place">📍 ${String(ev.place_id).replace(/_/g, " ")}</div>`
    : "";

  host.innerHTML = `
    <div>
      ${senderLine}
      ${placeLine}
      <div><strong>📬 ${ev.subject || "—"}</strong></div>
      <div style="margin-top:6px;">${situation}</div>

      <div id="civiInboxChoices" style="display:flex;flex-direction:column;gap:8px;margin-top:10px;"></div>

      <div id="civiInboxFeedback" style="display:none;margin-top:10px;"></div>
      <button class="civi-btn primary" id="civiInboxOK" style="display:none;margin-top:10px;">OK</button>
    </div>
  `;

  const choiceBox = host.querySelector("#civiInboxChoices");
  const fb = host.querySelector("#civiInboxFeedback");
  const ok = host.querySelector("#civiInboxOK");

  function showOk(txt) {
    if (fb) { fb.textContent = txt || "—"; fb.style.display = ""; }
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
      const res = window.HG_CiviEngine?.answer?.(ev.id, id);
      if (!res?.ok) return;

      // V2 blueprint: enkø thread-mail hvis choice har triggers_on_choice
      try {
        const tid = c?.triggers_on_choice;
        if (tid && window.CivicationThreadBridge?.enqueueThread) {
          window.CivicationThreadBridge.enqueueThread(tid, { triggeredBy: ev.id });
        }
      } catch (err) {
        if (window.DEBUG) console.warn("[Civi] thread enqueue failed", err);
      }

      if (choiceBox) choiceBox.innerHTML = "";
      showOk(res.feedback || "—");
    };

    choiceBox?.appendChild(b);
  });
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

function renderTrackHUD() {

  const state = window.CivicationState.getState();
  if (!state) return;

  const tracks = Array.isArray(state.tracks) ? state.tracks : [];
  const trackProgress = state.track_progress || {};
  const tags = Array.isArray(state.identity_tags) ? state.identity_tags : [];

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

// ============================================================
// EXPORT
// ============================================================

window.CivicationUI = {
  init,
  render: renderCivication,
  renderInbox: renderCivicationInbox,
  renderWorkdayPanel,
  renderCapital,
  renderPerception
};
