// js/quizzes.js — QuizEngine (manifest + ID-basert + STRICT kontrakt)
// - Leser: data/quiz/manifest.json (m.files[] = paths til quiz_*.json)
// - KUN riktige svar trigger: knowledge + trivia + concepts/meta
// - Perfekt quiz (correct===total) gir progresjon (quiz_history, quiz_progress, merits, unlocks)
// - INGEN normalisering. Kun trim + strict schema.
// - Debug styres av window.DEBUG

(function () {
  "use strict";

  // ============================================================
  // CONFIG
  // ============================================================
  const QUIZ_MANIFEST_PATH = "data/quiz/manifest.json";

  const QUIZ_HISTORY_KEY = "quiz_history";          // badge-modal leser dette
  const QUIZ_PROGRESS_KEY = "quiz_progress";        // progresjon per kategori
  const HG_LEARNING_LOG_KEY = "hg_learning_log_v1"; // fremtid: kurs/diplom (append-only)

  const QUIZ_HISTORY_SCHEMA = 2;
  const HG_LEARNING_SCHEMA = 1;

  let QUIZ_FEEDBACK_MS = 700;

  function dlog(...args) { if (window.DEBUG) console.log("[QuizEngine]", ...args); }
  function dwarn(...args) { if (window.DEBUG) console.warn("[QuizEngine]", ...args); }

  // ============================================================
  // URL / FETCH
  // ============================================================
  function absUrl(path) {
    return new URL(String(path || ""), document.baseURI).toString();
  }

  async function fetchJson(path) {
    const url = absUrl(path);
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return await r.json();
  }

  async function loadManifestFiles() {
    const m = await fetchJson(QUIZ_MANIFEST_PATH);
    if (!m || !Array.isArray(m.files) || !m.files.length) {
      throw new Error("data/quiz/manifest.json mangler files[]");
    }
    return m.files;
  }

  // ============================================================
  // STORAGE HELPERS (STRICT, NO NORMALIZATION)
  // ============================================================
  function safeParse(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || "null");
      return v == null ? fallback : v;
    } catch (e) {
      dwarn("bad json in", key, e);
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      dwarn("write failed", key, e);
      return false;
    }
  }

  function s(x) { return String(x ?? "").trim(); }
  function arr(x) { return Array.isArray(x) ? x : []; }

  function appendToArrayKey(key, item) {
    const cur = safeParse(key, []);
    const list = Array.isArray(cur) ? cur : [];
    list.push(item);
    safeWrite(key, list);
  }

  // Strict + complete (badge-modal relies on this)
  function saveQuizHistory(entry) {
    try {
      if (!entry || typeof entry !== "object") throw new Error("entry missing");
      if (!s(entry.categoryId)) throw new Error("categoryId missing");
      if (!s(entry.targetId)) throw new Error("targetId missing");
      if (!s(entry.name)) throw new Error("name missing");
      if (!s(entry.date)) throw new Error("date missing");

      if (!Number.isFinite(entry.correctCount)) throw new Error("correctCount invalid");
      if (!Number.isFinite(entry.total)) throw new Error("total invalid");
      if (!Array.isArray(entry.correctAnswers)) throw new Error("correctAnswers must be array");

      appendToArrayKey(QUIZ_HISTORY_KEY, entry);
      return true;
    } catch (e) {
      dwarn("saveQuizHistory rejected:", e, entry);
      return false;
    }
  }

  // New system: append-only learning log (for kurs/diplom later)
  function appendLearningEvent(evt) {
    try {
      if (!evt || typeof evt !== "object") throw new Error("evt missing");
      if (!s(evt.categoryId)) throw new Error("categoryId missing");
      if (!s(evt.targetId)) throw new Error("targetId missing");
      appendToArrayKey(HG_LEARNING_LOG_KEY, evt);
      return true;
    } catch (e) {
      dwarn("appendLearningEvent rejected:", e, evt);
      return false;
    }
  }

  function markQuizProgress(categoryId, targetId) {
    try {
      const prog = safeParse(QUIZ_PROGRESS_KEY, {});
      const cat = s(categoryId) || "ukjent";
      const tid = s(targetId) || "";

      prog[cat] = prog[cat] || { completed: [] };
      prog[cat].completed = Array.isArray(prog[cat].completed) ? prog[cat].completed : [];

      if (tid && !prog[cat].completed.includes(tid)) prog[cat].completed.push(tid);

      safeWrite(QUIZ_PROGRESS_KEY, prog);
    } catch (e) {
      dwarn("could not save quiz_progress", e);
    }
  }

  // ============================================================
  // ENGINE STATE
  // ============================================================
  const QuizEngine = {};

  // API injiseres fra app.js
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
    saveTriviaPoint: null,

    // optional (HGInsights)
    logCorrectQuizAnswer: null
  };

  let _loaded = false;
  let _loading = null;

  const _byTarget = new Map(); // targetId -> questions[]
  const _all = [];

  function targetKey(q) {
    return s(q?.personId || q?.placeId || "");
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
            const data = await fetchJson(f);
            return Array.isArray(data) ? data : [];
          } catch (e) {
            dwarn("could not load", f, e);
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
      dlog("loaded questions:", _all.length, "targets:", _byTarget.size);
    })();

    return _loading;
  }

  // ============================================================
  // UI
  // ============================================================
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

  // ============================================================
  // RUN FLOW (LOCKED CONTRACT)
  // onEnd(correct, total, meta)
  // meta = { correctAnswers, conceptsCorrect, emnerTouched }
  // ============================================================
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

    const correctAnswers = [];   // [{question, answer}]
    const conceptsCorrect = [];  // string[]
    const emnerTouched = [];     // string[]

    function step() {
      const q = questions[i];

      const options = arr(q.options || q.choices);
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
          const chosenIdx = Number(btn.dataset.idx);
          const ok = chosenIdx === answerIndex;

          btn.classList.add(ok ? "correct" : "wrong");
          qs.feedback.textContent = ok ? "Riktig ✅" : "Feil ❌";

          const tid = s(targetId);
          const categoryId = s(q.categoryId || q.category_id || q.category || "");

          // --- KUN ved RIKTIG: registrer alt (knowledge/trivia/insight/meta) ---
if (ok) {
  correct++;

  const qText = q.question || q.text || "";
  const chosen = options[chosenIdx] ?? "";
  correctAnswers.push({ question: qText, answer: chosen });

  // meta: concepts
  if (Array.isArray(q.core_concepts)) {
    q.core_concepts.forEach((c) => {
      const cc = s(c);
      if (cc) conceptsCorrect.push(cc);
    });
  }

  // meta: emner
  if (q.emne_id) {
    const eid = s(q.emne_id);
    if (eid) emnerTouched.push(eid);
  }
  if (Array.isArray(q.related_emner)) {
    q.related_emner.forEach((x) => {
      const eid = s(x);
      if (eid) emnerTouched.push(eid);
    });
  }

  // --- categoryId (robust, men enkel) ---
const categoryId = s(q.categoryId || q.category_id || q.category || "") || "by";

// --- quizId (bruk quiz_id hvis finnes, ellers targetId) ---
const quizId = s(q.quiz_id || q.quizId || tid);

// ✅ HGUnlocks (kun ved riktig)
if (window.HGUnlocks && typeof window.HGUnlocks.recordFromQuiz === "function") {
  try {
    window.HGUnlocks.recordFromQuiz({
      quizId: quizId,          // <-- VIKTIG: bruk quizId, ikke tid hardkodet
      categoryId: categoryId,  // <-- konsekvent
      item: q,
      targetId: tid
    });
  } catch (e) {
    dwarn("HGUnlocks.recordFromQuiz failed", e);
  }
}

// 🌿 Nature unlocks (flora/fauna) — kun ved korrekt quiz
if (window.HGNatureUnlocks && typeof window.HGNatureUnlocks.recordFromQuiz === "function") {
  try {
    window.HGNatureUnlocks.recordFromQuiz({
  quizId: quizId,
  placeId: tid
});
  } catch (e) {
    console.error("[HGNatureUnlocks] recordFromQuiz failed", e);
  }
}

// HGInsights hook (valgfritt, hvis app injiserer)
  if (typeof API.logCorrectQuizAnswer === "function") {
  try { API.logCorrectQuizAnswer(tid, q); } catch (e) { dwarn("logCorrectQuizAnswer failed", e); }
   }

// knowledge hook (robust: fall back til window.* hvis API ikke er satt)
const saveKnowledge =
  (typeof API.saveKnowledgeFromQuiz === "function")
    ? API.saveKnowledgeFromQuiz
    : (typeof window.saveKnowledgeFromQuiz === "function")
      ? window.saveKnowledgeFromQuiz
      : null;

if (saveKnowledge) {
  try {
    saveKnowledge(
      {
        id: `${tid}_${(q.topic || q.question || "").replace(/\s+/g, "_")}`.toLowerCase(),
        categoryId: categoryId || "by",
        dimension: q.dimension,
        topic: q.topic,
        question: q.question,
        knowledge: q.knowledge,
        answer: q.answer,
        chosenAnswer: chosen,
        core_concepts: Array.isArray(q.core_concepts) ? q.core_concepts : []
      },
      { categoryId: categoryId || "by", targetId: tid }
    );
  } catch (e) {
    dwarn("saveKnowledgeFromQuiz failed", e);
  }
}

// trivia hook (robust: fall back til window.* hvis API ikke er satt)
const saveTrivia =
  (typeof API.saveTriviaPoint === "function")
    ? API.saveTriviaPoint
    : (typeof window.saveTriviaPoint === "function")
      ? window.saveTriviaPoint
      : null;

if (q.trivia && saveTrivia) {
  try {
    saveTrivia({
      id: tid,
      category: categoryId || "by",
      trivia: q.trivia,
      question: q.question
    });
  } catch (e) {
    dwarn("saveTriviaPoint failed", e);
  }
 }
}

          // disable
          qs.choices.querySelectorAll("button").forEach((b) => (b.disabled = true));

          setTimeout(() => {
            i++;
            if (i < questions.length) step();
            else {
              closeQuiz();
              const meta = { correctAnswers, conceptsCorrect, emnerTouched };
              try { onEnd(correct, questions.length, meta); }
              catch (e) { dwarn("onEnd crashed", e); }
            }
          }, QUIZ_FEEDBACK_MS);
        };
      });
    }

    step();
  }

  // ============================================================
  // PUBLIC: start(targetId)
  // ============================================================
  QuizEngine.start = async function (targetId) {
    try {
      await ensureLoaded();

      const tid = s(targetId);
      const person = API.getPersonById(tid);
      const place = API.getPlaceById(tid);

      if (!person && !place) {
        API.showToast("Fant verken person eller sted");
        return;
      }

      // Gate: krever besøkt (med din visited-kontrakt)
      if (!API.isTestMode()) {
        const visited = API.getVisited() || {};

        if (place && !visited[s(place.id)]) {
          API.showToast("📍 Du må trykke Lås opp før du kan ta denne quizen.");
          return;
        }

        if (person) {
          const candidates = [];
          if (person.placeId) candidates.push(s(person.placeId));
          if (Array.isArray(person.places)) person.places.forEach((x) => { const id = s(x); if (id) candidates.push(id); });

          if (candidates.length) {
            const ok = candidates.some((id) => !!visited[id]);
            if (!ok) {
              API.showToast("📍 Du må trykke Lås opp på et av personens steder før du kan ta denne quizen.");
              return;
            }
          }
        }
      }

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
        onEnd: (correct, total, meta) => {
          const perfect = correct === total;

          if (perfect) {
            const categoryId = s(questions[0]?.categoryId || "by");
            const ca = Array.isArray(meta?.correctAnswers) ? meta.correctAnswers : [];

            // 1) badge-modal kontrakt (STRICT)
            saveQuizHistory({
              schema: QUIZ_HISTORY_SCHEMA,
              id: tid,        // bakoverkompat
              targetId: tid,  // tydelig kontrakt
              categoryId,
              name: person ? person.name : (place ? place.name : "Quiz"),
              date: new Date().toISOString(),
              correctCount: correct,
              total,
              correctAnswers: ca
            });

            // 2) fremtid: læringslogg (kurs/diplom)
            appendLearningEvent({
              schema: HG_LEARNING_SCHEMA,
              type: "quiz_perfect",
              ts: Date.now(),
              targetId: tid,
              categoryId,
              correctCount: correct,
              total,
              concepts: Array.isArray(meta?.conceptsCorrect) ? meta.conceptsCorrect : [],
              related_emner: Array.isArray(meta?.emnerTouched) ? meta.emnerTouched : []
            });

            // 3) progresjon
            markQuizProgress(categoryId, tid);
            API.addCompletedQuizAndMaybePoint(categoryId, tid);

            // 4) UI “done”
            if (typeof API.markQuizAsDoneExternal === "function") API.markQuizAsDoneExternal(tid);
            else markQuizAsDone(tid);

            // 5) unlocks + reward
            if (person) API.savePeopleCollected(tid);
            if (person) API.showRewardPerson(person);
            else if (place) API.showRewardPlace(place);

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
      dwarn("start crashed:", e);
      API.showToast("Quiz-feil: noe krasjet i quizzes.js");
    }
  };

  // ============================================================
  // PUBLIC: init(opts)
  // ============================================================
  QuizEngine.init = function (opts = {}) {
    API = { ...API, ...(opts || {}) };
    if (typeof opts.quizFeedbackMs === "number") QUIZ_FEEDBACK_MS = opts.quizFeedbackMs;
  };

  window.QuizEngine = QuizEngine;
})();
