// js/quizEngine.js — NYTT QUIZ SYSTEM (ID-basert + manifest + knowledge/trivia per RIKTIG svar)
// - Ingen tagToCat / kategori-gjetting
// - Finner quiz via personId/placeId
// - Leser quiz-filer fra data/quiz/manifest.json (uten / foran)
// - Lagrer knowledge + trivia KUN når brukeren svarer riktig på et spørsmål

(function () {
  "use strict";

  // ✅ Base-path fra hvor quizzes.js faktisk lastes fra
  function scriptBase() {
    try {
      const src = document.currentScript && document.currentScript.src;
      if (!src) return "";
      return src.split("/js/")[0] + "/";
    } catch {
      return "";
    }
  }

  const BASE = scriptBase(); // f.eks. ".../History-Go/"
  const QUIZ_MANIFEST_URL = BASE + "data/quiz/manifest.json";

  const QuizEngine = {};

  // ───────────────────────────────
  // API (injiseres fra app.js)
  // ───────────────────────────────
  let API = {
    // data
    getPersonById: (id) => null,
    getPlaceById: (id) => null,

    // gate
    getVisited: () => ({}),
    isTestMode: () => false,

    // ui
    showToast: (msg) => console.log(msg),

    // progression + hooks
    addCompletedQuizAndMaybePoint: (categoryId, targetId) => {},
    markQuizAsDoneExternal: null,

    // rewards
    showRewardPerson: (person) => {},
    showRewardPlace: (place) => {},
    showPersonPopup: (person) => {},
    showPlacePopup: (place) => {},
    pulseMarker: (lat, lon) => {},
    savePeopleCollected: (personId) => {},
    dispatchProfileUpdate: () => window.dispatchEvent(new Event("updateProfile")),

    // knowledge hooks (valgfritt)
    saveKnowledgeFromQuiz: null,
    saveTriviaPoint: null
  };

  let QUIZ_FEEDBACK_MS = 700;

  // ───────────────────────────────
  // State: index + cache
  // ───────────────────────────────
  let _loaded = false;
  let _loading = null;

  const _byTarget = new Map(); // targetId -> questions[]
  const _all = [];

  function norm(x) {
    return String(x || "").trim();
  }

  function targetKey(q) {
    const pid = norm(q?.personId);
    const plc = norm(q?.placeId);
    return pid || plc || "";
  }

  function indexQuestion(q) {
    const key = targetKey(q);
    if (!key) return;
    if (!_byTarget.has(key)) _byTarget.set(key, []);
    _byTarget.get(key).push(q);
  }

  async function fetchJson(url) {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return await r.json();
  }

  async function loadManifest() {
    // Manifest uten / foran (slik du ba om)
    try {
      const m = await fetchJson(QUIZ_MANIFEST_URL);
      if (m && Array.isArray(m.files) && m.files.length) return m.files;
    } catch (e) {
      console.warn("[QuizEngine] manifest missing or invalid:", e);
    }

    // Fallback (kan fjernes når manifest alltid finnes)
    return [
      "data/quiz/quiz_kunst.json",
      "data/quiz/quiz_historie.json",
      "data/quiz/quiz_vitenskap.json"
    ];
  }

  async function ensureLoaded() {
    if (_loaded) return;
    if (_loading) return _loading;

    _loading = (async () => {
      const files = await loadManifest();

      const lists = await Promise.all(
        files.map(async (f) => {
          try {
            const data = await fetchJson(f);
            return Array.isArray(data) ? data : [];
          } catch (e) {
            console.warn("[QuizEngine] could not load", f, e);
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
          if (ok) correct++;

          // ✅ KUN ved RIKTIG: knowledge-event
          if (ok && typeof API.saveKnowledgeFromQuiz === "function") {
            const tid = String(targetId || "");
            API.saveKnowledgeFromQuiz(
              {
                id: `${tid}_${(q.topic || q.question || "").replace(/\s+/g, "_")}`.toLowerCase(),
                categoryId: String(q.categoryId || "vitenskap"),
                dimension: q.dimension,
                topic: q.topic,
                question: q.question,
                knowledge: q.knowledge,
                answer: q.answer,
                core_concepts: Array.isArray(q.core_concepts) ? q.core_concepts : []
              },
              { categoryId: String(q.categoryId || "vitenskap"), targetId: tid }
            );
          }

          // ✅ KUN ved RIKTIG: trivia-point
          if (ok && q.trivia && typeof API.saveTriviaPoint === "function") {
            API.saveTriviaPoint({
              id: String(targetId || ""),
              category: String(q.categoryId || "vitenskap"),
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
              onEnd(correct, questions.length);
            }
          }, QUIZ_FEEDBACK_MS);
        };
      });
    }

    step();
  }


function saveQuizHistory(entry) {
  try {
    const hist = JSON.parse(localStorage.getItem("quiz_history") || "[]");
    hist.push(entry);
    localStorage.setItem("quiz_history", JSON.stringify(hist));
  } catch (e) {
    console.warn("[QuizEngine] could not save quiz_history", e);
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

  
  // ───────────────────────────────
  // Public: start quiz
  // ───────────────────────────────
  QuizEngine.start = async function (targetId) {
    await ensureLoaded();

    const person = API.getPersonById(targetId);
    const place = API.getPlaceById(targetId);

    if (!person && !place) {
      API.showToast("Fant verken person eller sted");
      return;
    }

   // Gate: krever besøkt (robust for person: placeId ELLER places[])
if (!API.isTestMode()) {
  const visited = API.getVisited() || {};

  // Sted: må være besøkt
  if (place && !visited[String(place.id).trim()]) {
    API.showToast("📍 Du må trykke Lås opp før du kan ta denne quizen.");
    return;
  }

  // Person: ok hvis ett av personens steder er besøkt
  if (person) {
    const candidates = [];

    if (person.placeId) candidates.push(String(person.placeId).trim());

    if (Array.isArray(person.places)) {
      person.places.forEach(x => {
        const id = String(x || "").trim();
        if (id) candidates.push(id);
      });
    }

    // Hvis personen faktisk har stedkobling, krev at minst ett er besøkt.
    // Hvis ikke: ikke blokker person-quiz (ellers mister du alle person-quizer pga data-rot).
    if (candidates.length) {
      const ok = candidates.some(id => !!visited[id]);
      if (!ok) {
        API.showToast("📍 Du må trykke Lås opp på et av personens steder før du kan ta denne quizen.");
        return;
      }
    }
  }
}
    
    const tid = String(targetId);
    const questions = _byTarget.get(tid) || [];

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

      // ✅ skriv quiz_history (brukes av popup-utils) KUN ved perfekt
      if (typeof saveQuizHistory === "function") {
        saveQuizHistory({
          id: tid,
          categoryId,
          name: person ? person.name : (place ? place.name : "Quiz"),
          date: new Date().toISOString(),
          correctCount: correct,
          total
        });
      }

      // ✅ oppdater quiz_progress (brukes av showQuizHistory)
      if (typeof markQuizProgress === "function") {
        markQuizProgress(categoryId, tid);
      }

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
  };

  QuizEngine.init = function (opts = {}) {
    API = { ...API, ...(opts || {}) };
    if (typeof opts.quizFeedbackMs === "number") QUIZ_FEEDBACK_MS = opts.quizFeedbackMs;
  };

  window.QuizEngine = QuizEngine;
})();
