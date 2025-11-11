// ============================================================
// === HISTORY GO – QUIZ.JS (v3.1, stabil) ====================
// ============================================================
//
// Ansvar:
//  • Starte quiz for valgt sted (eller kategori)
//  • Vise spørsmål og alternativer i modal
//  • Beregne poeng, lagre resultat og sende event “quizCompleted”
//  • Vise bekreftelse / oppnådd poengsum
//
// ============================================================

const quiz = (() => {

  let currentQuiz = null;
  let currentIndex = 0;
  let score = 0;
  let allQuestions = [];

  // ----------------------------------------------------------
  // 1) INITIERING
  // ----------------------------------------------------------
  function initQuizSystem(badges = []) {
    console.log("🧩 Quizsystem klart");
    window.HG = window.HG || {};
    HG.badges = badges || [];
  }

  // ----------------------------------------------------------
  // 2) STARTE QUIZ
  // ----------------------------------------------------------
  async function startQuiz(placeId) {
    try {
      // Bruk HG.data (ikke window.data)
      const place = (HG.data?.places || []).find(p => p.id === placeId);
      if (!place) return showToast("Fant ikke sted for quiz");

      const category = (place.category || "ukjent").toLowerCase();
      const file = `data/quiz_${category}.json`;
      const quizData = await fetchJSON(file);
      if (!quizData || quizData.length === 0) return showToast("Ingen spørsmål tilgjengelig");

      // Filtrer spørsmål for valgt sted
      allQuestions = quizData.filter(q => q.placeId === placeId);
      if (allQuestions.length === 0) {
        showToast("Ingen spørsmål for dette stedet enda");
        return;
      }

      // Sett opp quiz
      currentQuiz = { placeId, category, file };
      currentIndex = 0;
      score = 0;

      runQuizFlow();
    } catch (err) {
      console.error("Feil ved startQuiz:", err);
      showToast("Kunne ikke starte quiz");
    }
  }

  // ----------------------------------------------------------
  // 3) VIS OG HÅNDTER SPØRSMÅL
  // ----------------------------------------------------------
  function runQuizFlow() {
    if (!allQuestions || allQuestions.length === 0) return;

    const q = allQuestions[currentIndex];
    const optionsHTML = q.options.map(opt => `
      <button class="quiz-option" data-answer="${opt}">
        ${opt}
      </button>
    `).join("");

    const html = `
      <p class="quiz-question">${q.question}</p>
      <div class="quiz-options">${optionsHTML}</div>
      <p class="quiz-progress">${currentIndex + 1} / ${allQuestions.length}</p>
    `;

    openModal("Quiz", html);

    document.querySelectorAll(".quiz-option").forEach(btn => {
      btn.addEventListener("click", () => handleAnswer(q, btn.dataset.answer, btn));
    });
  }

  // ----------------------------------------------------------
  // 4) SVARHÅNDTERING
  // ----------------------------------------------------------
  function handleAnswer(q, answer, btn) {
    const correct = q.answer.trim() === answer.trim();

    if (correct) {
      btn.classList.add("correct");
      score += 5; // standardpoeng
      showToast("✅ Riktig!");
    } else {
      btn.classList.add("wrong");
      showToast("❌ Feil svar");
    }

    // Deaktiver alle knapper
    document.querySelectorAll(".quiz-option").forEach(b => b.disabled = true);

    setTimeout(() => nextQuestion(), 800);
  }

  // ----------------------------------------------------------
  // 5) NESTE SPØRSMÅL / RESULTAT
  // ----------------------------------------------------------
  function nextQuestion() {
    currentIndex++;
    if (currentIndex < allQuestions.length) {
      runQuizFlow();
    } else {
      finalizeQuizResult();
    }
  }

  // ----------------------------------------------------------
  // 6) FULLFØR QUIZ OG SEND RESULTAT
  // ----------------------------------------------------------
  function finalizeQuizResult() {
    const totalPoints = score;
    const placeId = currentQuiz.placeId;
    const categoryId = currentQuiz.category;
    const quizId = `${placeId}_${Date.now()}`;

    // Lag resultatobjekt
    const result = {
      quizId,
      placeId,
      categoryId,
      points: totalPoints,
      timestamp: new Date().toISOString(),
    };

    closeModal();
    showToast(`🎯 Du fikk ${totalPoints} poeng!`);

    // Send event til app.js for progresjon
    document.dispatchEvent(new CustomEvent("quizCompleted", { detail: result }));
  }

  // ----------------------------------------------------------
  // 7) MODAL & TOAST HJELPERE
  // ----------------------------------------------------------
  function openModal(title, content) {
    const modal = document.getElementById("modal");
    const titleEl = document.getElementById("modalTitle");
    const bodyEl = document.getElementById("modalContent");

    if (!modal || !titleEl || !bodyEl) return;
    titleEl.textContent = title;
    bodyEl.innerHTML = content;
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    const modal = document.getElementById("modal");
    if (modal) modal.setAttribute("aria-hidden", "true");
  }

  function showToast(msg) {
    const t = document.getElementById("toast");
    if (t) t.textContent = msg;
  }

  // ----------------------------------------------------------
  // 8) DATAHJELPERE
  // ----------------------------------------------------------
  async function fetchJSON(path) {
    try {
      const r = await fetch(path);
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } catch (err) {
      console.warn("Feil ved lasting av", path, err);
      return [];
    }
  }

  // ----------------------------------------------------------
  // 9) EKSPORT
  // ----------------------------------------------------------
  return {
    initQuizSystem,
    startQuiz,
    runQuizFlow,
    finalizeQuizResult,
  };
})();

// Automatisk init ved DOM-load
window.addEventListener("DOMContentLoaded", () => {
  if (quiz && quiz.initQuizSystem) quiz.initQuizSystem();
});
