// ============================================================
// === HISTORY GO – QUIZ.JS (v3.0, spørsmål og poeng) =========
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
    window.badges = badges || [];
  }

  // ----------------------------------------------------------
  // 2) STARTE QUIZ
  // ----------------------------------------------------------
  async function startQuiz(placeId) {
    try {
      const place = (window.data?.places || []).find(p => p.id === placeId);
      if (!place) return ui.showToast("Fant ikke sted for quiz");

      const category = place.category || "ukjent";
      const file = `data/quiz_${category}.json`;
      const quizData = await fetchJSON(file);
      if (!quizData || quizData.length === 0) return ui.showToast("Ingen spørsmål tilgjengelig");

      // Filtrer spørsmål for valgt sted
      allQuestions = quizData.filter(q => q.placeId === placeId);
      if (allQuestions.length === 0) {
        ui.showToast("Ingen spørsmål for dette stedet enda");
        return;
      }

      // Sett opp quiz
      currentQuiz = { placeId, category, file };
      currentIndex = 0;
      score = 0;

      runQuizFlow();
    } catch (err) {
      console.error("Feil ved startQuiz:", err);
      ui.showToast("Kunne ikke starte quiz");
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

    ui.openModal("Quiz", html);

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
      score += 5; // standardpoeng – senere: badges.json.points[0]
      ui.showToast("✅ Riktig!");
    } else {
      btn.classList.add("wrong");
      ui.showToast("❌ Feil svar");
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

    ui.closeModal();
    ui.showToast(`🎯 Du fikk ${totalPoints} poeng!`);

    // Send event til app.js for progresjon
    const ev = new CustomEvent("quizCompleted", { detail: result });
    document.dispatchEvent(ev);
  }

  // ----------------------------------------------------------
  // 7) EKSPORTERTE FUNKSJONER
  // ----------------------------------------------------------
  return {
    initQuizSystem,
    startQuiz,
    runQuizFlow,
    finalizeQuizResult,
  };
})();
