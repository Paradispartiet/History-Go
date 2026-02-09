
// MINI-PROFIL + quiz-historikk på forsiden
function initMiniProfile() {
  const nm = document.getElementById("miniName");
  const st = document.getElementById("miniStats");
  if (!nm || !st) return;

  const name  = localStorage.getItem("user_name")  || "Utforsker #182";
  const color = localStorage.getItem("user_color") || "#f6c800";

  const visitedLS    = JSON.parse(localStorage.getItem("visited_places") || "{}");
  const meritsLS     = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const quizHist     = JSON.parse(localStorage.getItem("quiz_history") || "[]");

  const visitedCount = Object.keys(visitedLS).length;
  const badgeCount   = Object.keys(meritsLS).length;
  const quizCount    = quizHist.length;

  nm.textContent = name;
  nm.style.color = color;
  st.textContent = `${visitedCount} steder · ${badgeCount} merker · ${quizCount} quizzer`;
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
    const careerName = pos.career_name || pos.career_id || "Karriere";
    posEl.textContent = `💼 ${pos.title} · ${careerName}`;
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
      .map(m => window.BADGES.find(bb => bb.id === m.id))
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

    document.getElementById("miniLastQuizImg").src = img;
    document.getElementById("miniLastQuizName").textContent = n;

    lastQuizBox.style.display = "flex";
  } else {
    lastQuizBox.style.display = "none";
  }
}



window.addEventListener("hg:mpNextUp", (e) => {
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
      🧭 <b>Neste Sted:</b> ${spatial ? hgEsc(spatial.label) : "—"}
    </button>
  </div>

  <div class="mp-nextup-line">
    <button class="mp-nextup-link" data-mp="wk"
      ${wk ? `data-wk="${hgEscAttr(wk.entry_id)}" title="${hgEscAttr(wk.because || "")}"` : "disabled"}>
      🗃️ <b>Wonderkammer:</b> ${wk ? hgEsc(wk.label) : "—"}
    </button>
  </div>

  <div class="mp-nextup-line">
    <button class="mp-nextup-link" data-mp="story"
      ${narrative ? `data-nextplace="${hgEscAttr(narrative.next_place_id)}"` : "disabled"}>
      📖 <b>Neste Scene:</b> ${narrative ? hgEsc(narrative.label) : "—"}
    </button>
  </div>

  <div class="mp-nextup-line">
    <button class="mp-nextup-link" data-mp="emne"
      ${concept ? `data-emne="${hgEscAttr(concept.emne_id)}"` : "disabled"}>
      🧠 <b>Forstå:</b> ${concept ? hgEsc(concept.label) : "—"}
    </button>
  </div>

`;

    mount.querySelectorAll("[data-mp]").forEach((btn) => {
    btn.onclick = () => {
      const t = btn.dataset.mp;

      if (t === "goto") {
        const id = btn.dataset.place;
        if (!id) return;
        const pl = (window.PLACES || []).find(x => String(x.id) === String(id));
        if (pl) return window.openPlaceCard?.(pl);
        return window.showToast?.("Fant ikke stedet");
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
          window.showToast?.("Fant ikke Wonderkammer-visning");
        }
        return;
      }

      
      if (t === "story") {
        const nextId = btn.dataset.nextplace;
        if (!nextId) return;
        const pl = (window.PLACES || []).find(x => String(x.id) === String(nextId));
        if (pl) return window.openPlaceCard?.(pl);
        return window.showToast?.("Fant ikke neste kapittel-sted");
      }

      if (t === "emne") {
        const emneId = btn.dataset.emne;
        if (!emneId) return;
        window.location.href = `knowledge_by.html#${encodeURIComponent(emneId)}`;
      }
    };
  });
});


window.addEventListener("updateProfile", initMiniProfile);

function showQuizHistory() {
  const progress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
  const allCompleted = Object.entries(progress).flatMap(([cat, val]) =>
    (val.completed || []).map(id => ({ category: cat, id }))
  );

  if (!allCompleted.length) {
    showToast("Du har ingen fullførte quizzer ennå.");
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
        <button class="quiz-close" id="closeQuizHistory">✕</button>
        <h2>Fullførte quizzer</h2>
        <ul class="quiz-history-list">${list}</ul>
      </div>
    </div>`;

  document.body.insertAdjacentHTML("beforeend", html);

  const modal = document.getElementById("quizHistoryModal");
  document.getElementById("closeQuizHistory").onclick = () => modal.remove();
  modal.addEventListener("click", e => {
    if (e.target.id === "quizHistoryModal") modal.remove();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") modal.remove();
  });
}

function wireMiniProfileLinks() {
  document.getElementById("linkPlaces")?.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    enterMapMode();
    showToast("Viser steder på kartet");
  });

  document.getElementById("linkBadges")?.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    window.location.href = "profile.html#userBadgesGrid";
  });

  document.getElementById("linkQuiz")?.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    showQuizHistory();
  });
}
