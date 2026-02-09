
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


