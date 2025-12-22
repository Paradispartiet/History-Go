// js/quizzes.js — QuizEngine (manifest + ID-basert + knowledge/trivia kun ved riktig)
// Leser: data/quiz/manifest.json
// Forventer manifest.files[] med paths som "data/quiz/quiz_*.json"

(function () {
  "use strict";

  // ---------- URL helpers ----------
  function absUrl(path) {
    return new URL(String(path || ""), document.baseURI).toString();
  }

  async function fetchJson(path) {
    const url = absUrl(path);
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return await r.json();
  }

  const QUIZ_MANIFEST_PATH = "data/quiz/manifest.json";

  async function loadManifestFiles() {
    const m = await fetchJson(QUIZ_MANIFEST_PATH);
    if (!m || !Array.isArray(m.files) || !m.files.length) {
      throw new Error("data/quiz/manifest.json mangler files[]");
    }
    return m.files;
  }

  // ---------- Engine ----------
  const QuizEngine = {};

  // API (injiseres fra app.js)
  let API = {
    getPersonById: (id) => null,
    getPlaceById: (id) => null,

    getVisited: () => ({}),
    isTestMode: () => false,

    showToast: (msg) => console.log(msg),

    addCompletedQuizAndMaybePoint: (categoryId, targetId) => {},
    markQuizAsDoneExternal: null,

    showRewardPerson: (person) => {},
    showRewardPlace: (place) => {},
    showPersonPopup: (person) => {},
    showPlacePopup: (place) => {},
    pulseMarker: (lat, lon) => {},
    savePeopleCollected: (personId) => {},
    dispatchProfileUpdate: () => window.dispatchEvent(new Event("updateProfile")),

    saveKnowledgeFromQuiz: null,
    saveTriviaPoint: null
  };

  let QUIZ_FEEDBACK_MS = 700;

  // State
  let _loaded = false;
  let _loading = null;

  const _byTarget = new Map(); // targetId -> questions[]
  const _all = [];

  function targetKey(q) {
    return String(q?.personId || q?.placeId || "").trim();
  }

  function indexQuestion(q) {
    const key = targetKey(q);
    if (!key) return;
    if (!_byTarget.has(key)) _byTarget.set(key, []);
    _byTarget.get(key).push(q);
  }

  async function ensureLoaded() {
    if (_loaded) return;
    if (_loading) return _loading;

    _loading = (async () => {
      const files = await loadManifestFiles();

      const lists = await Promise.all(
        files.map(async (f) => {
          try {
            // manifest kan være "data/quiz/..." (relativt) eller full url
            const data = await fetchJson(f);
            return Array.isArray(data) ? data : [];
          } catch (e) {
            if (window.DEBUG) console.warn("[QuizEngine] could not load", f, e);
            return [];
          }
        })
      );

      const flat = lists.flat();
      flat.forEach((q) => {
        _all.push(q);
        indexQuestion(q);
      });

      _loaded = true;
      console.log("[QuizEngine] loaded questions:", _all.length, "targets:", _byTarget.size);
    })();

    return _loading;
  }

  // ---------- UI ----------
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
    quizBtns.forEach((btn) => {
      const firstTime = !btn.classList.contains("quiz-done");
      btn.classList.add("quiz-done");
      btn.innerHTML = "✔️ Tatt (kan gjentas)";
      if (firstTime) {
        btn.classList.add("blink");
        setTimeout(() => btn.classList.remove("blink"), 1200);
      }
    });
  }

  function saveQuizHistory(entry) {
  try {
    // --- STRICT VALIDATION (no normalization) ---
    if (!entry || typeof entry !== "object") throw new Error("entry missing");
    if (!entry.categoryId) throw new Error("categoryId missing");
    if (!entry.targetId) throw new Error("targetId missing");
    if (!entry.name) throw new Error("name missing");
    if (!entry.date) throw new Error("date missing");

    if (!Number.isFinite(entry.correctCount)) throw new Error("correctCount missing/invalid");
    if (!Number.isFinite(entry.total)) throw new Error("total missing/invalid");

    if (!Array.isArray(entry.correctAnswers)) throw new Error("correctAnswers missing (must be array)");

    // (optional) sanity:
    // if (entry.correctAnswers.length !== entry.correctCount) throw new Error("correctAnswers length != correctCount");

    const hist = JSON.parse(localStorage.getItem("quiz_history") || "[]");
    const arr = Array.isArray(hist) ? hist : [];

    arr.push(entry);
    localStorage.setItem("quiz_history", JSON.stringify(arr));
  } catch (e) {
    if (window.DEBUG) console.warn("[QuizEngine] saveQuizHistory rejected entry", e, entry);
  }
}

  function markQuizProgress(categoryId, targetId) {
    try {
      const prog = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
      const cat = String(categoryId || "ukjent");
      const tid = String(targetId || "");

      prog[cat] = prog[cat] || { completed: [] };
      prog[cat].completed = Array.isArray(prog[cat].completed) ? prog[cat].completed : [];

      if (!prog[cat].completed.includes(tid)) prog[cat].completed.push(tid);

      localStorage.setItem("quiz_progress", JSON.stringify(prog));
    } catch (e) {
      console.warn("[QuizEngine] could not save quiz_progress", e);
    }
  }

  function runQuizFlow({ title, targetId, questions, onEnd }) {
    ensureQuizUI();

    const qs = {
      title: document.getElementById("quizTitle"),
      q: document.getElementById("quizQuestion"),
      choices: document.getElementById("quizChoices"),
      progress: document.getElementById("quizProgress"),
      feedback: document.getElementById("quizFeedback")
    };
    qs.title.textContent = title || "Quiz";

    let i = 0;
    let correct = 0;
    let correctAnswers = []; // <-- NY: brukes til badge-modal

    function step() {
      const q = questions[i];

      const options = q.options || q.choices || [];
      const answerIndex =
        typeof q.answerIndex === "number"
          ? q.answerIndex
          : options.findIndex((o) => o === q.answer);

      qs.q.textContent = q.question || q.text || "";
      qs.choices.innerHTML = options
        .map((opt, idx) => `<button data-idx="${idx}">${opt}</button>`)
        .join("");

      qs.progress.textContent = `${i + 1}/${questions.length}`;
      qs.feedback.textContent = "";

      const bar = document.querySelector(".quiz-progress .bar");
      if (bar) bar.style.width = `${((i + 1) / questions.length) * 100}%`;

      qs.choices.querySelectorAll("button").forEach((btn) => {
        btn.onclick = () => {
          const ok = Number(btn.dataset.idx) === answerIndex;

          btn.classList.add(ok ? "correct" : "wrong");
          qs.feedback.textContent = ok ? "Riktig ✅" : "Feil ❌";
          if (ok) {
            correct++;
            const qText = q.question || q.text || "";
            const chosen = options[Number(btn.dataset.idx)] ?? "";
            correctAnswers.push({ question: qText, answer: chosen });
          }

          // ✅ KUN ved RIKTIG: knowledge-event
          if (ok && typeof API.saveKnowledgeFromQuiz === "function") {
            const tid = String(targetId || "");
            API.saveKnowledgeFromQuiz(
              {
                id: `${tid}_${(q.topic || q.question || "").replace(/\s+/g, "_")}`.toLowerCase(),
                categoryId: String(q.categoryId || "vitenskap").trim(),
                dimension: q.dimension,
                topic: q.topic,
                question: q.question,
                knowledge: q.knowledge,
                answer: q.answer,
                core_concepts: Array.isArray(q.core_concepts) ? q.core_concepts : []
              },
              { categoryId: String(q.categoryId || "vitenskap").trim(), targetId: tid }
            );
          }

          // ✅ KUN ved RIKTIG: trivia-point
          if (ok && q.trivia && typeof API.saveTriviaPoint === "function") {
            API.saveTriviaPoint({
              id: String(targetId || ""),
              category: String(q.categoryId || "vitenskap").trim(),
              trivia: q.trivia,
              question: q.question
            });
          }

          qs.choices.querySelectorAll("button").forEach((b) => (b.disabled = true));

          setTimeout(() => {
            i++;
            if (i < questions.length) step();
            else {
              closeQuiz();
              onEnd(correct, questions.length, correctAnswers);
            }
          }, QUIZ_FEEDBACK_MS);
        };
      });
    }

    step();
  }

  // ---------- Public: start ----------
  QuizEngine.start = async function (targetId) {
    try {
      await ensureLoaded();

      const person = API.getPersonById(targetId);
      const place = API.getPlaceById(targetId);

      if (!person && !place) {
        API.showToast("Fant verken person eller sted");
        return;
      }

      // Gate: krever besøkt
      if (!API.isTestMode()) {
        const visited = API.getVisited() || {};

        if (place && !visited[String(place.id).trim()]) {
          API.showToast("📍 Du må trykke Lås opp før du kan ta denne quizen.");
          return;
        }

        if (person) {
          const candidates = [];
          if (person.placeId) candidates.push(String(person.placeId).trim());
          if (Array.isArray(person.places)) {
            person.places.forEach((x) => {
              const id = String(x || "").trim();
              if (id) candidates.push(id);
            });
          }
          if (candidates.length) {
            const ok = candidates.some((id) => !!visited[id]);
            if (!ok) {
              API.showToast("📍 Du må trykke Lås opp på et av personens steder før du kan ta denne quizen.");
              return;
            }
          }
        }
      }

      const tid = String(targetId || "").trim();
      const questions = (_byTarget && _byTarget.get(tid)) || [];

      if (!questions.length) {
        API.showToast("Ingen quiz tilgjengelig her ennå");
        return;
      }

      openQuiz();

      runQuizFlow({
        title: person ? person.name : (place ? place.name : "Quiz"),
        targetId: tid,
        questions,
        onEnd: (correct, total) => {
          const perfect = correct === total;

          if (perfect) {
            const categoryId = String(questions[0]?.categoryId || "vitenskap").trim();

            saveQuizHistory({
              id: tid,
              categoryId,
              name: person ? person.name : (place ? place.name : "Quiz"),
              date: new Date().toISOString(),
              correctCount: correct,
              total
            });

            markQuizProgress(categoryId, tid);

            API.addCompletedQuizAndMaybePoint(categoryId, tid);

            if (typeof API.markQuizAsDoneExternal === "function") API.markQuizAsDoneExternal(tid);
            else markQuizAsDone(tid);

            if (person) API.savePeopleCollected(tid);

            if (person) API.showRewardPerson(person);
            else if (place) API.showRewardPlace(place);

            setTimeout(() => {
              if (person) API.showPersonPopup(person);
              else if (place) API.showPlacePopup(place);
            }, 300);

            API.showToast(`Perfekt! ${total}/${total} 🎯`);
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

    } catch (e) {
      if (window.DEBUG) console.warn("[QuizEngine] start crashed:", e);
      API.showToast("Quiz-feil: noe krasjet i quizzes.js");
    }
  };

  QuizEngine.init = function (opts = {}) {
    API = { ...API, ...(opts || {}) };
    if (typeof opts.quizFeedbackMs === "number") QUIZ_FEEDBACK_MS = opts.quizFeedbackMs;
  };

  window.QuizEngine = QuizEngine;
})();
