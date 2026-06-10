
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

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

// Samme prinsipp som profile.js sin getCompletedQuizUnitCount(): union av
// HGLearningLog-historikken og quiz_progress.completed, uten duplikater.
function getCompletedQuizUnitCount() {
  const quizHistory = (window.HGLearningLog?.getQuizHistory?.() ?? []);
  const quizProgress = readJson("quiz_progress", {});

  const ids = new Set();

  if (Array.isArray(quizHistory)) {
    quizHistory.forEach(entry => {
      const id = String(entry?.id || entry?.targetId || "").trim();
      if (id) ids.add(id);
    });
  }

  if (quizProgress && typeof quizProgress === "object") {
    Object.values(quizProgress).forEach(value => {
      const completed = Array.isArray(value?.completed) ? value.completed : [];
      completed.forEach(id => {
        const key = String(id || "").trim();
        if (key) ids.add(key);
      });
    });
  }

  return ids.size;
}

// visited_places kan være object-map ({ id: true }) eller (historisk) array av
// ID-er. Teller kun sannferdige entries, som unike trimmede ID-er.
function getVisitedPlaceCount() {
  const raw = readJson("visited_places", {});
  const ids = new Set();
  const addId = (value) => {
    const id = String(value ?? "").trim();
    if (id) ids.add(id);
  };

  if (Array.isArray(raw)) {
    raw.filter(Boolean).forEach(addId);
  } else if (raw && typeof raw === "object") {
    Object.entries(raw).forEach(([id, value]) => {
      if (value) addId(id);
    });
  }

  return ids.size;
}

// Sørg for at #miniStats har sine #linkPlaces/#linkQuiz-spans. Normalt finnes de
// allerede i index.html. Hvis gammel kode hadde overskrevet #miniStats med
// textContent og slettet dem, rekonstrueres de rent og én gang med samme struktur.
function ensureMiniStatsSpans(st) {
  let linkPlaces = document.getElementById("linkPlaces");
  let linkQuiz   = document.getElementById("linkQuiz");
  if (linkPlaces && linkQuiz) {
    return { linkPlaces, linkQuiz, reconstructed: false };
  }

  st.textContent = "";

  linkPlaces = document.createElement("span");
  linkPlaces.id = "linkPlaces";
  linkPlaces.className = "linkish";

  linkQuiz = document.createElement("span");
  linkQuiz.id = "linkQuiz";
  linkQuiz.className = "linkish";

  st.appendChild(linkPlaces);
  st.appendChild(linkQuiz);

  return { linkPlaces, linkQuiz, reconstructed: true };
}

// MINI-PROFIL + quiz-historikk på forsiden
function initMiniProfile() {
  const nm = document.getElementById("miniName");
  const st = document.getElementById("miniStats");
  if (!nm || !st) return;

  // ProfileIdentity (js/profileIdentity.js) eier #miniName/profilnavnet og setter
  // det via applyProfileToDom(). MiniProfile er en ren statistikk-renderer og rører
  // bare navnet som nødfallback dersom HGUserProfile mangler helt – og bruker da
  // ALDRI "Logg inn" som tekst (navnefallback hører hjemme i profileIdentity.js).
  if (!window.HGUserProfile) {
    const fallbackName = localStorage.getItem("user_name");
    if (fallbackName) nm.textContent = fallbackName;
    const fallbackColor = localStorage.getItem("user_color");
    if (fallbackColor) nm.style.color = fallbackColor;
  }

  const meritsLS     = readJson("merits_by_category", {});
  const quizHist     = (window.HGLearningLog?.getQuizHistory?.() ?? []);

  const visitedCount = getVisitedPlaceCount();
  const badgeCount   = Object.keys(meritsLS).length;
  const quizCount    = getCompletedQuizUnitCount();

  // Oppdater eksisterende elementer i stedet for å skrive st.textContent – sistnevnte
  // ville slette #linkPlaces/#linkQuiz (og dermed de klikkbare miniProfile-funksjonene).
  const { linkPlaces, linkQuiz, reconstructed } = ensureMiniStatsSpans(st);
  linkPlaces.textContent = `${visitedCount} steder`;
  linkQuiz.textContent   = `${quizCount} quizzer`;

  const linkBadges = document.getElementById("linkBadges");
  if (linkBadges) linkBadges.textContent = String(badgeCount);

  // Hvis spanene måtte rekonstrueres (gammel kode hadde slettet dem), må de nye
  // elementene bindes. wireMiniProfileLinks() er idempotent, så dette dobbeltbinder ikke.
  if (reconstructed) window.wireMiniProfileLinks?.();

  window.renderCivicationInbox?.();
  
  /* -------------------------------------
     0.5) Aktiv stilling (fra karriere/merker)
  ------------------------------------- */
  let pos = null;
  try {
    pos = JSON.parse(localStorage.getItem("hg_active_position_v1") || "null");
  } catch {}

  // Lag/oppdater en egen linje under miniStats uten å være avhengig av HTML-endringer
  let posEl = document.getElementById("miniPositionLine");
  if (!posEl) {
    posEl = document.createElement("div");
    posEl.id = "miniPositionLine";
    posEl.className = "mini-position-line";
    // minimal styling (kan flyttes til CSS senere)
    posEl.style.fontSize = "12px";
    posEl.style.opacity = "0.92";
    posEl.style.marginTop = "2px";
    posEl.style.whiteSpace = "nowrap";
    posEl.style.overflow = "hidden";
    posEl.style.textOverflow = "ellipsis";

    // sett inn rett etter stats-linja
    st.insertAdjacentElement("afterend", posEl);
  }

  if (pos && pos.title) {
    const careerName = pos.career_name || pos.career_id || tUI("ui.miniprofile.careerFallback", "Karriere");
    posEl.textContent = tfUI("ui.miniprofile.careerLine", "💼 {position} · {career}", { position: pos.title, career: careerName });
    posEl.style.display = "";
  } else {
    posEl.style.display = "none";
  }
  
  /* -------------------------------------
     1) Siste tre merker (ikon-rad)
  ------------------------------------- */
  const badgeRow = document.getElementById("miniBadges");

  if (badgeRow && window.BADGES) {
    const latest = Object.values(meritsLS)
      .sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0,3)
      .map(m => /** @type {any[]} */ (window.BADGES).find(bb => bb.id === m.id))
      .filter(Boolean);

    badgeRow.innerHTML = latest
      .map(b => `<img src="${b.image}" alt="">`)
      .join("");
  }


  /* -------------------------------------
     2) Siste quiz
  ------------------------------------- */
  const lastQuizBox = document.getElementById("miniLastQuiz");

  if (quizHist.length) {
    const last = quizHist[quizHist.length - 1];

    const person = PEOPLE.find(p => p.id === last.id);
    const place  = PLACES.find(p => p.id === last.id);

    const img  = person?.imageCard || place?.cardImage || "";
    const n    = person?.name || place?.name || "Quiz";

    /** @type {HTMLImageElement} */ (document.getElementById("miniLastQuizImg")).src = img;
    document.getElementById("miniLastQuizName").textContent = n;

    lastQuizBox.style.display = "flex";
  } else {
    lastQuizBox.style.display = "none";
  }
}



window.addEventListener("hg:mpNextUp", (/** @type {CustomEvent} */ e) => {
  const mount = document.getElementById("mpNextUp");
  if (!mount) return;

  const tri = e.detail?.tri || {};
  const becauseLine = e.detail?.becauseLine || "";

// Persistér "Fordi" til profilsiden
try {
  localStorage.setItem("hg_nextup_because", String(becauseLine || ""));
  localStorage.setItem("hg_nextup_tri", JSON.stringify(tri || {}));
} catch {}
  
  const spatial = tri.spatial || null;
  const narrative = tri.narrative || null;
  const concept = tri.concept || null;
  const wk = tri.wk || null; // ✅ Wonderkammer NextUp (valgfri)

  mount.innerHTML = `
  <div class="mp-nextup-line">
    <button class="mp-nextup-link" data-mp="goto"
      ${spatial ? `data-place="${hgEscAttr(spatial.place_id)}"` : "disabled"}>
      🧭 <b>${hgEsc(tUI("ui.miniprofile.nextPlace", "Neste Sted:"))}</b> ${spatial ? hgEsc(spatial.label) : "—"}
    </button>
  </div>

  <div class="mp-nextup-line">
    <button class="mp-nextup-link" data-mp="wk"
      ${wk ? `data-wk="${hgEscAttr(wk.entry_id)}" title="${hgEscAttr(wk.because || "")}"` : "disabled"}>
      🗃️ <b>${hgEsc(tUI("ui.miniprofile.wonderkammer", "Wonderkammer:"))}</b> ${wk ? hgEsc(wk.label) : "—"}
    </button>
  </div>

  <div class="mp-nextup-line">
    <button class="mp-nextup-link" data-mp="story"
      ${narrative ? `data-nextplace="${hgEscAttr(narrative.next_place_id)}"` : "disabled"}>
      📖 <b>${hgEsc(tUI("ui.miniprofile.nextScene", "Neste Scene:"))}</b> ${narrative ? hgEsc(narrative.label) : "—"}
    </button>
  </div>

  <div class="mp-nextup-line">
    <button class="mp-nextup-link" data-mp="emne"
      ${concept ? `data-emne="${hgEscAttr(concept.emne_id)}" data-knowledge-href="${hgEscAttr(concept.knowledge_href || "")}"` : "disabled"}>
      🧠 <b>${hgEsc(tUI("ui.miniprofile.understand", "Forstå:"))}</b> ${concept ? hgEsc(concept.label) : "—"}
    </button>
  </div>

`;

    mount.querySelectorAll("[data-mp]").forEach((/** @type {HTMLElement} */ btn) => {
    btn.onclick = () => {
      const t = btn.dataset.mp;

      if (t === "goto") {
        const id = btn.dataset.place;
        if (!id) return;
        const pl = (window.PLACES || []).find(x => String(x.id) === String(id));
        if (pl) return window.openPlaceCard?.(pl);
        return window.showToast?.(tUI("ui.miniprofile.placeNotFound", "Fant ikke stedet"));
      }

      if (t === "wk") {
        const id = btn.dataset.wk;
        if (!id) return;

        // Åpne Wonderkammer-entry
        if (window.Wonderkammer && typeof window.Wonderkammer.openEntry === "function") {
          window.Wonderkammer.openEntry(id);
        } else if (typeof window.openWonderkammerEntry === "function") {
          window.openWonderkammerEntry(id);
        } else {
          console.warn("[mpNextUp] No Wonderkammer open handler found for", id);
          window.showToast?.(tUI("ui.miniprofile.wonderkammerViewNotFound", "Fant ikke Wonderkammer-visning"));
        }
        return;
      }

      
      if (t === "story") {
        const nextId = btn.dataset.nextplace;
        if (!nextId) return;
        const pl = (window.PLACES || []).find(x => String(x.id) === String(nextId));
        if (pl) return window.openPlaceCard?.(pl);
        return window.showToast?.(tUI("ui.miniprofile.nextChapterPlaceNotFound", "Fant ikke neste kapittel-sted"));
      }

      if (t === "emne") {
        const emneId = btn.dataset.emne;
        const knowledgeHref = btn.dataset.knowledgeHref;
        if (!emneId) return;
        if (knowledgeHref) {
          window.location.href = knowledgeHref;
          return;
        }
        window.location.href = `knowledge_by.html#${encodeURIComponent(emneId)}`;
      }
    };
  });
});


window.addEventListener("updateProfile", initMiniProfile);
window.addEventListener("aha:auth-ready", initMiniProfile);
window.addEventListener("historygo:aha-readback", initMiniProfile);

function showQuizHistory() {
  const progress = readJson("quiz_progress", {});
  const allCompleted = Object.entries(progress).flatMap(([cat, val]) =>
    (val.completed || []).map(id => ({ category: cat, id }))
  );

  if (!allCompleted.length) {
    showToast(tUI("ui.miniprofile.noCompletedQuizzes", "Du har ingen fullførte quizzer ennå."));
    return;
  }

  const recent = allCompleted.slice(-8).reverse();
  const list = recent
    .map(item => {
      const person = PEOPLE.find(p => p.id === item.id);
      const place = PLACES.find(p => p.id === item.id);
      const name = person?.name || place?.name || item.id;
      const cat = item.category || "–";
      return `<li><strong>${name}</strong><br><span class="muted">${cat}</span></li>`;
    })
    .join("");

  const html = `
    <div class="quiz-modal" id="quizHistoryModal">
      <div class="quiz-modal-inner">
        <button class="quiz-close" id="closeQuizHistory" aria-label="${hgEscAttr(tUI("ui.attr.close", "Lukk"))}">✕</button>
        <h2>${hgEsc(tUI("ui.miniprofile.completedQuizzes", "Fullførte quizzer"))}</h2>
        <ul class="quiz-history-list">${list}</ul>
      </div>
    </div>`;

  document.body.insertAdjacentHTML("beforeend", html);

  const modal = document.getElementById("quizHistoryModal");
  document.getElementById("closeQuizHistory").onclick = () => modal.remove();
  modal.addEventListener("click", e => {
    if (/** @type {Element} */ (e.target).id === "quizHistoryModal") modal.remove();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") modal.remove();
  });
}

// Idempotent: binder klikk på #linkPlaces/#linkBadges/#linkQuiz høyst én gang per
// element. Markeres med dataset.hgMiniProfileBound slik at gjentatte kall (fra
// updateProfile/hg:appReady/aha:auth-ready) ikke dobbeltbinder samme listener.
function wireMiniProfileLinks() {
  const linkPlaces = document.getElementById("linkPlaces");
  if (linkPlaces && linkPlaces.dataset.hgMiniProfileBound !== "1") {
    linkPlaces.dataset.hgMiniProfileBound = "1";
    linkPlaces.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      enterMapMode();
      showToast(tUI("ui.miniprofile.showingPlacesOnMap", "Viser steder på kartet"));
    });
  }

  const linkBadges = document.getElementById("linkBadges");
  if (linkBadges && linkBadges.dataset.hgMiniProfileBound !== "1") {
    linkBadges.dataset.hgMiniProfileBound = "1";
    linkBadges.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      window.location.href = "profile.html#userBadgesGrid";
    });
  }

  const linkQuiz = document.getElementById("linkQuiz");
  if (linkQuiz && linkQuiz.dataset.hgMiniProfileBound !== "1") {
    linkQuiz.dataset.hgMiniProfileBound = "1";
    linkQuiz.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      showQuizHistory();
    });
  }
}

window.initMiniProfile = initMiniProfile;
window.wireMiniProfileLinks = wireMiniProfileLinks;
