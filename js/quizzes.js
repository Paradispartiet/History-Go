// quizzes.js — History GO Quiz module (ROBUST: match på personId/placeId)
(function () {
  "use strict";

  console.log("quizzes.js LOADED (ROBUST)");

  // ───────────────────────────────
  // Avhengigheter (injiseres fra app.js)
  // ───────────────────────────────
  let API = {
    getPersonById: (id) => null,
    getPlaceById: (id) => null,
    getVisited: () => ({}),
    isTestMode: () => false,
    showToast: (msg) => console.log(msg),

    // (valgfritt) brukes bare for normalisering av display-cat → id
    catIdFromDisplay: (displayCat) => (displayCat || "vitenskap"),

    // rewards / progression / UI hooks
    addCompletedQuizAndMaybePoint: (displayCat, targetId) => {},
    markQuizAsDoneExternal: null, // ✅ MÅ være null som default
    showRewardPerson: (person) => {},
    showRewardPlace: (place) => {},
    showPersonPopup: (person) => {},
    showPlacePopup: (place) => {},
    pulseMarker: (lat, lon) => {},
    savePeopleCollected: (personId) => {},
    dispatchProfileUpdate: () => window.dispatchEvent(new Event("updateProfile")),

    // (valgfritt)
    logCorrectQuizAnswer: null,
    saveKnowledgeFromQuiz: null,
    saveTriviaPoint: null
  };

  let QUIZ_FEEDBACK_MS = 700;

  function normalizeId(x) {
    return String(x || "").trim().toLowerCase();
  }

  // ───────────────────────────────
  // Storage
  // ───────────────────────────────
  function saveQuizHistory(entry) {
    const hist = JSON.parse(localStorage.getItem("quiz_history") || "[]");
    hist.push(entry);
    localStorage.setItem("quiz_history", JSON.stringify(hist));
  }

  // ───────────────────────────────
  // Quiz files (oppdater kun hvis du flytter filer)
  // ───────────────────────────────
  const QUIZ_FILES = [
    "data/quiz/quiz_kunst.json",
    "data/quiz/quiz_sport.json",
    "data/quiz/quiz_politikk.json",
    "data/quiz/quiz_populaerkultur.json",
    "data/quiz/quiz_musikk.json",
    "data/quiz/quiz_subkultur.json",
    "data/quiz/quiz_vitenskap.json",
    "data/quiz/quiz_natur.json",
    "data/quiz/quiz_litteratur.json",
    "data/quiz/quiz_by.json",
    "data/quiz/quiz_historie.json",
    "data/quiz/quiz_naeringsliv.json"
  ];

  // Cache alle quiz-spørsmål (lastes kun én gang)
  let _allQuizCache = null;

  async function loadAllQuizzes() {
    if (_allQuizCache) return _allQuizCache;

    const all = await Promise.all(
      QUIZ_FILES.map(async (file) => {
        try {
          const r = await fetch(file, { cache: "no-store" });
          if (!r.ok) {
            console.warn("[HGQuiz] fetch fail", file, r.status);
            return [];
          }
          const data = await r.json();
          return Array.isArray(data) ? data : [];
        } catch (e) {
          console.warn("[HGQuiz] fetch/parse error", file, e);
          return [];
        }
      })
    );

    _allQuizCache = all.flat();
    console.log("[HGQuiz] loaded total questions:", _allQuizCache.length);
    return _allQuizCache;
  }

  // ───────────────────────────────
  // UI
  // ───────────────────────────────
  let _escWired = false;

  function ensureQuizUI() {
    if (document.getElementById("quizModal")) return;

    const m = document.createElement("div");
    m.id = "quizModal";
    m.className = "modal";
    m.innerHTML = `
      <div class="modal-body">
        <div class="modal-head">
          <strong id="quizTitle">Quiz</strong>
          <button class="ghost" id="quizClose">Lukk</button>
        </div>
        <div class="quiz-progress"><div class="bar"></div></div>
        <div class="sheet-body">
          <div id="quizQuestion" style="margin:6px 0 10px;font-weight:600"></div>
          <div id="quizChoices" class="quiz-choices"></div>
          <div style="display:flex;justify-content:space-between;margin-top:8px;">
            <span id="quizFeedback" class="quiz-feedback"></span>
            <small id="quizProgress" class="muted"></small>
          </div>
        </div>
      </div>`;
    document.body.appendChild(m);

    const modal = document.getElementById("quizModal");
    modal.querySelector("#quizClose").onclick = closeQuiz;
    modal.addEventListener("click", (e) => {
      if (e.target && e.target.id === "quizModal") closeQuiz();
    });

    if (!_escWired) {
      _escWired = true;
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeQuiz();
      });
    }
  }

  function openQuiz() {
    ensureQuizUI();
    const modal = document.getElementById("quizModal");
    modal.style.display = "flex";
    modal.classList.remove("fade-out");
  }

  function closeQuiz() {
    const modal = document.getElementById("quizModal");
    if (!modal) return;
    modal.classList.add("fade-out");
    setTimeout(() => modal.remove(), 450);
  }

  function markQuizAsDone(targetId) {
    const quizBtns = document.querySelectorAll(`[data-quiz="${targetId}"]`);
    quizBtns.forEach(btn => {
      const firstTime = !btn.classList.contains("quiz-done");
      btn.classList.add("quiz-done");
      btn.innerHTML = "✔️ Tatt (kan gjentas)";
      if (firstTime) {
        btn.classList.add("blink");
        setTimeout(() => btn.classList.remove("blink"), 1200);
      }
    });
  }

  // ───────────────────────────────
  // Flow
  // ───────────────────────────────
  async function startQuiz(targetId) {
    const person = API.getPersonById(targetId);
    const place  = API.getPlaceById(targetId);

    if (!person && !place) {
      API.showToast("Fant verken person eller sted");
      return;
    }

    // Krever fysisk besøk før quiz (ikke i testmodus)
    if (!API.isTestMode()) {
      const visitedPlaces = API.getVisited();

      if (place && !visitedPlaces[place.id]) {
        API.showToast("📍 Du må besøke stedet først for å ta denne quizen.");
        return;
      }
      if (person && person.placeId && !visitedPlaces[person.placeId]) {
        API.showToast("📍 Du må besøke stedet først for å ta denne quizen.");
        return;
      }
    }

    const all = await loadAllQuizzes();
    const tid = String(targetId);

    const questionsRaw = all.filter(q =>
      String(q.personId || "") === tid ||
      String(q.placeId  || "") === tid
    );

    console.log("[HGQuiz] startQuiz", { targetId: tid, found: questionsRaw.length });

    if (!questionsRaw.length) {
      API.showToast("Ingen quiz tilgjengelig her ennå");
      return;
    }

    // kategori tas fra spørsmålet
    const rawCat = questionsRaw[0].categoryId || "vitenskap";
    const displayCat = rawCat;
    const categoryId = normalizeId(
      (typeof API.catIdFromDisplay === "function" ? API.catIdFromDisplay(rawCat) : rawCat) || rawCat
    );

    const formatted = questionsRaw.map(q => ({
      ...q,
      text: q.question,
      choices: q.options || [],
      answerIndex: (q.options || []).findIndex(o => o === q.answer)
    }));

    openQuiz();

    runQuizFlow({
      title: person ? person.name : place.name,
      questions: formatted,
      onEnd: (correct, total) => {
        const perfect = correct === total;

        if (perfect) {
          API.addCompletedQuizAndMaybePoint(displayCat, targetId);

          if (typeof API.markQuizAsDoneExternal === "function") API.markQuizAsDoneExternal(targetId);
          else markQuizAsDone(targetId);

          const when = new Date().toISOString();
          const quizItem = formatted.map(q => ({
            question: q.question,
            answer: q.answer,
            knowledge: q.knowledge,
            topic: q.topic,
            dimension: q.dimension,
            trivia: q.trivia,
            core_concepts: Array.isArray(q.core_concepts) ? q.core_concepts : []
          }));

          const entry = {
            id: targetId,
            categoryId,
            name: person ? person.name : place.name,
            image: person ? person.imageCard : place.cardImage,
            date: when,
            correctAnswers: quizItem
          };

          saveQuizHistory(entry);

          if (typeof API.logCorrectQuizAnswer === "function") {
            API.logCorrectQuizAnswer(entry, person, place);
          }

          if (typeof API.saveKnowledgeFromQuiz === "function" && Array.isArray(entry.correctAnswers)) {
            entry.correctAnswers.forEach(q => {
              API.saveKnowledgeFromQuiz(
                {
                  id: `${entry.id}_${(q.topic || q.question || "").replace(/\s+/g, "_")}`.toLowerCase(),
                  categoryId: entry.categoryId,
                  dimension: q.dimension,
                  topic: q.topic,
                  question: q.question,
                  knowledge: q.knowledge,
                  answer: q.answer
                },
                { categoryId: entry.categoryId }
              );

              if (q.trivia && typeof API.saveTriviaPoint === "function") {
                API.saveTriviaPoint({
                  id: entry.id,
                  category: entry.categoryId,
                  trivia: q.trivia
                });
              }
            });
          }

          if (person) API.showRewardPerson(person);
          else if (place) API.showRewardPlace(place);

          if (person) API.savePeopleCollected(targetId);

          if (place) {
            const visitedPlaces = API.getVisited();
            if (visitedPlaces[place.id] || API.isTestMode()) {
              API.pulseMarker(place.lat, place.lon);
            }
          }

          setTimeout(() => {
            if (person) API.showPersonPopup(person);
            else if (place) API.showPlacePopup(place);
          }, 300);

          API.showToast(`Perfekt! ${total}/${total} riktige 🎯 Du fikk poeng og kort!`);
          API.dispatchProfileUpdate();
        } else {
          API.showToast(`Fullført: ${correct}/${total} – prøv igjen for full score.`);
        }

        if (person && person.placeId) {
          const plc = API.getPlaceById(person.placeId);
          if (plc) API.pulseMarker(plc.lat, plc.lon);
        }
      }
    });
  }

  function runQuizFlow({ title = "Quiz", questions = [], onEnd = () => {} }) {
    ensureQuizUI();

    const qs = {
      title: document.getElementById("quizTitle"),
      q: document.getElementById("quizQuestion"),
      choices: document.getElementById("quizChoices"),
      progress: document.getElementById("quizProgress"),
      feedback: document.getElementById("quizFeedback")
    };
    qs.title.textContent = title;

    let i = 0;
    let correctCount = 0;

    function step() {
      const q = questions[i];
      qs.q.textContent = q.text;
      qs.choices.innerHTML = (q.choices || [])
        .map((opt, idx) => `<button data-idx="${idx}">${opt}</button>`)
        .join("");

      qs.progress.textContent = `${i + 1}/${questions.length}`;
      qs.feedback.textContent = "";

      const bar = document.querySelector(".quiz-progress .bar");
      if (bar) bar.style.width = `${((i + 1) / questions.length) * 100}%`;

      qs.choices.querySelectorAll("button").forEach(btn => {
        btn.onclick = () => {
          const ok = Number(btn.dataset.idx) === q.answerIndex;
          btn.classList.add(ok ? "correct" : "wrong");
          qs.feedback.textContent = ok ? "Riktig ✅" : "Feil ❌";
          if (ok) correctCount++;

          qs.choices.querySelectorAll("button").forEach(b => (b.disabled = true));

          setTimeout(() => {
            i++;
            if (i < questions.length) step();
            else {
              closeQuiz();
              onEnd(correctCount, questions.length);
            }
          }, QUIZ_FEEDBACK_MS);
        };
      });
    }

    step();
  }

  function init(opts = {}) {
    API = { ...API, ...(opts || {}) };
    if (typeof opts.quizFeedbackMs === "number") QUIZ_FEEDBACK_MS = opts.quizFeedbackMs;
  }

  window.HGQuiz = { init, startQuiz };
})();
