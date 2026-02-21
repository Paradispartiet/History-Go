// ============================================================
// CIVICATION UI
// ============================================================

async function init() {
  await window.HG_CiviEngine?.onAppOpen?.();

  wireCivicationActions();
  renderCivication();
  renderCivicationInbox();

  // Civication håndterer selv sync
  window.addEventListener("updateProfile", () => {
    renderCivication();
    renderCivicationInbox();
  });
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

    const weekly =
      getWeeklySalaryFromBadges(active.career_id, points);

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

  const merits = ls("merits_by_category", {});
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

// ============================================================
// EXPORT
// ============================================================

window.CivicationUI = {
  init,
  render: renderCivication,
  renderInbox: renderCivicationInbox
};
