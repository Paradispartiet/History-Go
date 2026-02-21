async function init() {
  await window.HG_CiviEngine?.onAppOpen?.();

  renderCivication();
  renderCivicationInbox();
  wireCivicationActions();

  // 👇 Civication håndterer selv sync
  window.addEventListener("updateProfile", () => {
    renderCivication();
    renderCivicationInbox();
  });
}

// ------------------------------------------------------------
// CIVICATION – wiring: Aksepter / Ikke nå (jobboffer)
// Plassering: rett etter getLatestPendingOffer(), før renderCivication()
// ------------------------------------------------------------
function wireCivicationActions() {
  const btnAccept  = document.getElementById("btnCiviAccept");
  const btnDecline = document.getElementById("btnCiviDecline");
  if (!btnAccept || !btnDecline) return;

  btnAccept.onclick = async () => {
    const offer = getLatestPendingOffer();
    if (!offer) return;

    // marker offer
    const offers = getJobOffers();
    const idx = offers.findIndex(o => o && o.id === offer.id);
    if (idx >= 0) offers[idx] = { ...offers[idx], status: "accepted", accepted_at: new Date().toISOString() };
    setJobOffers(offers);

    // sett aktiv jobb (rollen din)
    setActivePosition({
      career_id: offer.career_id,                 // forvent "naeringsliv"
      career_name: offer.career_name,
      title: offer.title,
      threshold: offer.threshold ?? null,
      achieved_at: new Date().toISOString()
    });

    // oppdater UI + trigge motor (som nå har aktiv jobb)
    renderCivication();
    await window.HG_CiviEngine?.onAppOpen?.();    // lager evt mail i inbox
    window.renderCivicationInbox?.();
    window.dispatchEvent(new Event("updateProfile"));
  };

  btnDecline.onclick = () => {
    const offer = getLatestPendingOffer();
    if (!offer) return;

    const offers = getJobOffers();
    const idx = offers.findIndex(o => o && o.id === offer.id);
    if (idx >= 0) offers[idx] = { ...offers[idx], status: "declined", declined_at: new Date().toISOString() };
    setJobOffers(offers);

    renderCivication();
    window.renderCivicationInbox?.();
    window.dispatchEvent(new Event("updateProfile"));
  };
}




async function renderCivication() {

  await ensureCiviCareerRulesLoaded();

  // --- DOM ---
  const title   = document.getElementById("civiRoleTitle");
  const details = document.getElementById("civiRoleDetails");
  const meritLn = document.getElementById("civiMeritLine");

  const oBox   = document.getElementById("civiOfferBox");
  const oTitle = document.getElementById("civiOfferTitle");
  const oMeta  = document.getElementById("civiOfferMeta");

  if (!title || !details || !oBox || !oTitle || !oMeta) return;

  // ------------------------------------------------------------
  // 1) AKTIV JOBB (akseptert offer) – dette er "rollen din"
  // ------------------------------------------------------------
  const active = getActivePosition();
  if (active && active.title) {
    title.textContent = `Rolle: ${active.title}`;
    const cn = active.career_name || active.career_id || "—";
    const dt = active.achieved_at ? new Date(active.achieved_at).toLocaleDateString("no-NO") : "";
    details.textContent = `Status: Aktiv · Felt: ${cn}${dt ? " · Satt: " + dt : ""}`;
  } else {
    title.textContent = "Rolle: —";
    details.textContent = "Status: Ingen aktiv jobb (ta quiz for å få jobbtilbud).";
  }

  // ------------------------------------------------------------
// LØNN (riktig modell: career → annual_salary / 52)
// ------------------------------------------------------------
const salaryLn = document.getElementById("civiSalaryLine");

if (salaryLn && active && active.career_id) {
  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const points = Number(merits[active.career_id]?.points || 0);

  const weekly = getWeeklySalaryFromBadges(active.career_id, points);

  salaryLn.textContent = Number.isFinite(weekly)
    ? `Lønn: ${weekly} PC / uke`
    : "Lønn: —";
}


  // ------------------------------------------------------------
  // 2) JOBBTILBUD (pending)
  // ------------------------------------------------------------
  const offer = getLatestPendingOffer();
  if (!offer) {
    oBox.style.display = "none";
  } else {
    oBox.style.display = "";
    oTitle.textContent = `🧾 Jobbtilbud`;
    const expTxt = offer.expires_iso ? new Date(offer.expires_iso).toLocaleDateString("no-NO") : "—";
    oMeta.textContent =
      `${offer.career_name || offer.career_id || ""} · ` +
      `Terskel: ${offer.threshold} · Utløper: ${expTxt}`;

        // Wire buttons (Aksepter / Ikke nå)
    const btnAccept = document.getElementById("btnCiviAccept");
    const btnDecline = document.getElementById("btnCiviDecline");

    if (btnAccept) {
      btnAccept.onclick = async () => {
        const accepted = acceptOfferById(offer.offer_key);
        if (!accepted) return;

        // Synk motor + kjør en puls så inbox kan komme
        await window.HG_CiviEngine?.onAppOpen?.();

        renderCivication();
        window.renderCivicationInbox?.();
        window.dispatchEvent(new Event("updateProfile"));
      };
    }

    if (btnDecline) {
      btnDecline.onclick = () => {
        declineOfferById(offer.offer_key);
        renderCivication();
      };
    }
  }

  // ------------------------------------------------------------
  // 3) "BESTE ROLLE" (auto fra merits + tiers) – beholdes!
  //    (Dette er merit/karriereprofil, ikke nødvendigvis aktiv jobb)
  // ------------------------------------------------------------
  if (!meritLn) return;

  const merits = ls("merits_by_category", {});
  const keys = Object.keys(merits || {});
  if (!Array.isArray(BADGES) || !BADGES.length || !keys.length) {
    meritLn.textContent = "Merit: —";
    return;
  }

  // quiz_history brukes her kun for "sist relevant quiz"-dato (ikke tvang)
  const historyRaw = JSON.parse(localStorage.getItem("quiz_history") || "[]");
  const history = Array.isArray(historyRaw) ? historyRaw : [];

  let best = null;

  for (const k of keys) {
    const catId = String(k || "").trim();
    if (!catId) continue;

    const badge = BADGES.find(b => String(b?.id || "").trim() === catId);
    if (!badge) continue;

    const points = Number(merits[k]?.points || 0);
    const { tierIndex, label } = deriveTierFromPoints(badge, points);

    const last = history
      .filter(h => String(h?.categoryId || "").trim() === catId)
      .map(h => h?.date ? new Date(h.date).getTime() : 0)
      .reduce((mx, t) => Math.max(mx, t), 0);

    const item = {
      badgeName: String(badge.name || "").trim() || catId,
      roleLabel: String(label || "").trim() || "Nybegynner",
      tierIndex: Number.isFinite(tierIndex) ? tierIndex : -1,
      points,
      lastQuizAt: last
    };

    if (!best) best = item;
    else {
      if (item.tierIndex > best.tierIndex) best = item;
      else if (item.tierIndex === best.tierIndex && item.points > best.points) best = item;
    }
  } // ✅ LUKK for (const k of keys)

  if (!best) {
    meritLn.textContent = "Merit: —";
    return;
  }

  const lastTxt = best.lastQuizAt
    ? new Date(best.lastQuizAt).toLocaleDateString("no-NO")
    : "aldri";

  meritLn.textContent = `Merit: ${best.roleLabel} (${best.badgeName}) · ${best.points} poeng · Sist: ${lastTxt}`;
} // ✅ LUKK function renderCivication()


  
function renderCivicationInbox() {
  const box = document.getElementById("civiInboxBox");
  const subj = document.getElementById("civiMailSubject");
  const text = document.getElementById("civiMailText");
  const fb = document.getElementById("civiMailFeedback");

  const btnA = document.getElementById("civiChoiceA");
  const btnB = document.getElementById("civiChoiceB");
  const btnC = document.getElementById("civiChoiceC");
  const btnOK = document.getElementById("civiChoiceOK");

  if (!box || !subj || !text || !btnA || !btnB || !btnC || !btnOK || !fb) return;

  const pending = window.HG_CiviEngine?.getPendingEvent?.();
  if (!pending || !pending.event) {
    box.style.display = "none";
    return;
  }

  box.style.display = "";
  const ev = pending.event;

  subj.textContent = `📬 ${ev.subject || "—"}`;
  text.textContent = Array.isArray(ev.situation) ? ev.situation.join(" ") : (ev.situation || "—");

  fb.style.display = "none";
  btnOK.style.display = "none";
  btnA.style.display = "none";
  btnB.style.display = "none";
  btnC.style.display = "none";

  const choices = Array.isArray(ev.choices) ? ev.choices : [];

  function bindChoice(btn, choiceId, label) {
    btn.textContent = label;
    btn.style.display = "";
    btn.onclick = () => {
      const res = window.HG_CiviEngine?.answer?.(ev.id, choiceId);
      if (!res || !res.ok) return;

      fb.textContent = res.feedback || "—";
      fb.style.display = "";

      btnA.style.display = "none";
      btnB.style.display = "none";
      btnC.style.display = "none";

      btnOK.style.display = "";
      btnOK.onclick = () => {
        renderCivication();
        window.renderCivicationInbox();
        window.dispatchEvent(new Event("updateProfile"));
      };
    };
  }

  if (!choices.length) {
    fb.textContent = ev.feedback || "—";
    fb.style.display = "";

    btnOK.style.display = "";
    btnOK.onclick = () => {
      renderCivication();
      window.renderCivicationInbox?.();
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

window.renderCivicationInbox = renderCivicationInbox;  

window.CivicationUI = {
  init,
  render: renderCivication,
  renderInbox: renderCivicationInbox,
  wireActions: wireCivicationActions
};
