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

  async function loadSetFile(path) {

  const url = absUrl(path);
  if (_setFileCache.has(url)) {
    return _setFileCache.get(url);
  }

  const data = await fetchJson(path);
  _setFileCache.set(url, data);
  return data;
}

  
async function loadSetQuestions(setMeta) {

  const data = await loadSetFile(setMeta.file);
  if (!data || !Array.isArray(data.sets)) {
    return null;
  }

  const block = data.sets.find(s => s?.set_id === setMeta.set_id);
  if (!block || !Array.isArray(block.questions)) {
    return null;
  }

  return block.questions;
}

function findNextSet(setList, currentSetId) {

  const idx = setList.findIndex(s => s.set_id === currentSetId);

  if (idx === -1) return null;

  return setList[idx + 1] || null;
}

  
  async function loadManifestData() {
  const m = await fetchJson(QUIZ_MANIFEST_PATH);

  if (!m) {
    throw new Error("manifest mangler");
  }

  return {
    files: Array.isArray(m.files) ? m.files : [],
    sets: Array.isArray(m.sets) ? m.sets : []
  };
}


  function getQuizCount(targetId) {

  const sets = (_byTargetSets && _byTargetSets.get(targetId)) || [];

  if (sets.length) {
    return sets.length;
  }

  const legacy = (_byTarget && _byTarget.get(targetId)) || [];

  return legacy.length;
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

  function saveSetProgress(setId, score, total) {
  try {
    const key = "hg_quiz_sets_v1";
    const data = safeParse(key, {});
    const alreadyCompleted = !!data?.[setId]?.completed;

    data[setId] = {
      completed: true,
      score,
      total,
      timestamp: Date.now()
    };

    safeWrite(key, data);
    return { alreadyCompleted, data };
  } catch (e) {
    dwarn("could not save set progress", e);
    return { alreadyCompleted: false, data: {} };
  }
}

  function incrementMeritPoints(categoryId, amount = 1) {
    try {
      const key = s(categoryId);
      if (!key) return false;

      const merits = safeParse("merits_by_category", {});
      merits[key] = merits[key] || { points: 0 };
      merits[key].points = Number(merits[key].points || 0) + Number(amount || 0);
      safeWrite("merits_by_category", merits);
      return true;
    } catch (e) {
      dwarn("could not save merits_by_category", e);
      return false;
    }
  }

  function countCompletedSets(setList, progressMap) {
    const list = Array.isArray(setList) ? setList : [];
    const prog = progressMap && typeof progressMap === "object" ? progressMap : {};
    return list.filter((item) => !!prog[item?.set_id]?.completed).length;
  }

  function getQuizCategoryId(questions) {
    return s(
      questions?.[0]?.categoryId ||
      questions?.[0]?.category_id ||
      questions?.[0]?.category ||
      ""
    );
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

  const _byTarget = new Map();     // targetId -> questions[]
  const _byTargetSets = new Map(); // targetId -> setMeta[]
  const _setFileCache = new Map();
  const _all = [];

  function targetKey(q) {
    return s(q?.targetId || q?.personId || q?.placeId || "");
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
      const { files, sets } = await loadManifestData();

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



      
// ---- INDEX SET METADATA ----
// Støtter både:
// A) ferdig ekspandert manifest: { targetId, file, set_id, order }
// B) kompakt manifest:          { targetId, file }  -> ekspanderes fra file.sets[]

const expandedSets = [];
const seenSetKeys = new Set();

for (const entry of sets) {

  if (!entry || !entry.targetId || !entry.file) continue;

  const tid = s(entry.targetId);

  // FORMAT A: allerede ekspandert
  if (entry.set_id) {

    const key = `${tid}::${entry.set_id}`;
    if (seenSetKeys.has(key)) continue;

    seenSetKeys.add(key);

    expandedSets.push({
      targetId: tid,
      file: entry.file,
      set_id: entry.set_id,
      order: Number.isFinite(entry.order) ? entry.order : 0
    });

    continue;
  }

  // FORMAT B: kompakt -> les set-filen og ekspander
  try {

    const data = await loadSetFile(entry.file);

    if (!data || !Array.isArray(data.sets)) {
      dwarn("set file mangler sets[]:", entry.file);
      continue;
    }

    data.sets.forEach((block, idx) => {

      if (!block?.set_id) return;

      const key = `${tid}::${block.set_id}`;
      if (seenSetKeys.has(key)) return;

      seenSetKeys.add(key);

      expandedSets.push({
        targetId: tid,
        file: entry.file,
        set_id: block.set_id,
        order: Number.isFinite(block.order) ? block.order : (idx + 1)
      });

    });

  } catch (e) {
    dwarn("could not expand set file", entry.file, e);
  }
}

expandedSets.forEach((setMeta) => {

  const tid = setMeta.targetId;

  if (!_byTargetSets.has(tid)) {
    _byTargetSets.set(tid, []);
  }

  _byTargetSets.get(tid).push(setMeta);

});

// sorter etter order
for (const list of _byTargetSets.values()) {
  list.sort((a, b) => (a.order || 0) - (b.order || 0));
}

      
_loaded = true;
dlog("loaded questions:", _all.length, "targets:", _byTarget.size);
dlog("loaded sets:", _byTargetSets.size);

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
        if (e.key === "Escape") {
          closeQuizSummary();
          closeQuiz();
        }
      });
    }
  }

  function ensureQuizSummaryUI() {
    if (document.getElementById("quizSummaryModal")) return;

    const m = document.createElement("div");
    m.id = "quizSummaryModal";
    m.className = "modal";
    m.innerHTML = `
      <div class="modal-body">
        <div class="modal-head">
          <strong id="quizSummaryTitle">Quiz</strong>
          <button class="ghost" id="quizSummaryClose">Lukk</button>
        </div>
        <div class="sheet-body">
          <div id="quizSummaryLead" style="margin:0 0 10px;font-weight:600"></div>
          <div id="quizSummaryMeta" class="muted" style="margin:0 0 14px"></div>
          <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">
            <button class="ghost" id="quizSummarySecondary" style="display:none"></button>
            <button id="quizSummaryPrimary">Neste</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(m);

    const modal = document.getElementById("quizSummaryModal");
    modal.querySelector("#quizSummaryClose").onclick = closeQuizSummary;
    modal.addEventListener("click", (e) => {
      if (e.target && e.target.id === "quizSummaryModal") closeQuizSummary();
    });
  }

  function openQuizSummary({ title = "Quiz", lead = "", meta = "", primaryText = "Neste", onPrimary = null, secondaryText = "", onSecondary = null }) {
    ensureQuizSummaryUI();

    const modal = document.getElementById("quizSummaryModal");
    const titleEl = modal.querySelector("#quizSummaryTitle");
    const leadEl = modal.querySelector("#quizSummaryLead");
    const metaEl = modal.querySelector("#quizSummaryMeta");
    const primaryBtn = modal.querySelector("#quizSummaryPrimary");
    const secondaryBtn = modal.querySelector("#quizSummarySecondary");

    titleEl.textContent = title;
    leadEl.textContent = lead;
    metaEl.textContent = meta;
    primaryBtn.textContent = primaryText || "Neste";
    primaryBtn.onclick = () => {
      closeQuizSummary();
      if (typeof onPrimary === "function") onPrimary();
    };

    if (secondaryText) {
      secondaryBtn.style.display = "inline-flex";
      secondaryBtn.textContent = secondaryText;
      secondaryBtn.onclick = () => {
        closeQuizSummary();
        if (typeof onSecondary === "function") onSecondary();
      };
    } else {
      secondaryBtn.style.display = "none";
      secondaryBtn.onclick = null;
    }

    modal.style.display = "flex";
    modal.classList.remove("fade-out");
  }

  function closeQuizSummary() {
    const modal = document.getElementById("quizSummaryModal");
    if (!modal) return;
    modal.classList.add("fade-out");
    setTimeout(() => modal.remove(), 450);
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
function runQuizFlow({ title, targetId, questions, onEnd, titleSuffix = "", progressPrefix = "", autoClose = true }) {
  ensureQuizUI();

  const qs = {
    title: document.getElementById("quizTitle"),
    q: document.getElementById("quizQuestion"),
    choices: document.getElementById("quizChoices"),
    progress: document.getElementById("quizProgress"),
    feedback: document.getElementById("quizFeedback")
  };
  qs.title.textContent = [title || "Quiz", titleSuffix].filter(Boolean).join(" — ");

  let i = 0;
  let correct = 0;

  const correctAnswers = [];   // [{question, answer, chosenAnswer}]
  const conceptsCorrect = [];  // string[]
  const emnerTouched = [];     // string[]

  // ✅ categoryId beregnes ÉN gang per quiz-run (strict: ingen "by" fallback her)
  const categoryId = getQuizCategoryId(questions);

  if (!categoryId && window.DEBUG) {
    console.warn("[quiz] missing categoryId on quiz questions", {
      title,
      targetId: s(targetId),
      q0: questions?.[0]
    });
  }

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

    qs.progress.textContent = progressPrefix
      ? `${progressPrefix} • ${i + 1}/${questions.length}`
      : `${i + 1}/${questions.length}`;
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

        // --- KUN ved RIKTIG: registrer alt (meta + hooks) ---
        if (ok) {
          correct++;

          const qText = q.question || q.text || "";
          const chosenAnswer = options[chosenIdx] ?? "";
          const correctAnswer = options[answerIndex] ?? (q.answer ?? "");

          correctAnswers.push({ question: qText, answer: correctAnswer, chosenAnswer });

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

          // quizId (bruk quiz_id hvis finnes, ellers targetId)
          const quizId = s(q.quiz_id || q.quizId || tid);

          // ✅ HGUnlocks (kun ved riktig)
          if (window.HGUnlocks && typeof window.HGUnlocks.recordFromQuiz === "function") {
            try {
              window.HGUnlocks.recordFromQuiz({
                quizId,
                categoryId, // strict: kan være "" hvis data mangler
                item: q,
                targetId: tid
              });
            } catch (e) {
              dwarn("HGUnlocks.recordFromQuiz failed", e);
            }
          }

          // 🌿 Nature unlocks (kun ved riktig)
          if (window.HGNatureUnlocks && typeof window.HGNatureUnlocks.recordFromQuiz === "function") {
            try {
              window.HGNatureUnlocks.recordFromQuiz({ quizId, placeId: tid });
            } catch (e) {
              console.error("[HGNatureUnlocks] recordFromQuiz failed", e);
            }
          }

         const canTag = !!categoryId;

if (!canTag && window.DEBUG) {
  console.warn("[quiz] ok answer but missing categoryId; skipping knowledge/trivia hooks", q);
}

if (canTag) {
  // ------------------------------------------------------------
  // HOOKS (kun ved riktig): insights + knowledge + trivia
  // ------------------------------------------------------------

  // HGInsights hook (valgfritt)
  if (typeof API?.logCorrectQuizAnswer === "function") {
    try { API.logCorrectQuizAnswer(tid, q); }
    catch (e) { dwarn("logCorrectQuizAnswer failed", e); }
  }

  const saveKnowledge =
    (typeof API?.saveKnowledgeFromQuiz === "function")
      ? API.saveKnowledgeFromQuiz
      : (typeof window.saveKnowledgeFromQuiz === "function")
        ? window.saveKnowledgeFromQuiz
        : null;

  if (saveKnowledge && q.knowledge) {
    try {
      saveKnowledge(
        {
          id: `${tid}_${(q.topic || q.question || "").replace(/\s+/g, "_")}`.toLowerCase(),
          categoryId,
          dimension: q.dimension,
          topic: q.topic,
          question: q.question,
          knowledge: q.knowledge,
          answer: q.answer,
          chosenAnswer: chosenAnswer,
          core_concepts: Array.isArray(q.core_concepts) ? q.core_concepts : []
        },
        { categoryId, targetId: tid }
      );
    } catch (e) {
      dwarn("saveKnowledgeFromQuiz failed", e);
    }
  }

  const saveTrivia =
    (typeof API?.saveTriviaPoint === "function")
      ? API.saveTriviaPoint
      : (typeof window.saveTriviaPoint === "function")
        ? window.saveTriviaPoint
        : null;

  if (saveTrivia && q.trivia) {
    try {
      saveTrivia({
        id: tid,
        category: categoryId,
        trivia: q.trivia,
        question: q.question
      });
    } catch (e) {
      dwarn("saveTriviaPoint failed", e);
    }
  }
}
          
}
          
        // disable
        qs.choices.querySelectorAll("button").forEach((b) => (b.disabled = true));

        setTimeout(() => {
          i++;
          if (i < questions.length) step();
          else {
            if (autoClose) closeQuiz();
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

// ---- CHECK FOR SET FIRST ----

const setList = (_byTargetSets && _byTargetSets.get(tid)) || [];

if (setList.length) {

  setList.sort((a,b)=>(a.order||0)-(b.order||0));

  let progress = {};
  try {
    progress = safeParse("hg_quiz_sets_v1", {});
  } catch(e) {}

  const setMeta =
  setList.find(s => !progress[s.set_id]?.completed) || setList[0];

  const setData = await loadSetFile(setMeta.file);

  if (!setData) {
    API.showToast("Kunne ikke laste quiz-set");
    return;
  }

  const block = setData?.sets?.find(
    s => s?.set_id === setMeta.set_id
  ) || null;

  const setQuestions = Array.isArray(block?.questions)
    ? block.questions
    : null;

  if (!setQuestions) {
    API.showToast("Set-data feilformatert");
    return;
  }

  const setIndex = setList.findIndex((s) => s.set_id === setMeta.set_id);
  const totalSets = setList.length;
  const completedBefore = countCompletedSets(setList, progress);
  const alreadyCompleted = !!progress?.[setMeta.set_id]?.completed;
  const remainingBefore = Math.max(totalSets - completedBefore, 0);
  const remainingAfterThis = alreadyCompleted
    ? remainingBefore
    : Math.max(totalSets - (completedBefore + 1), 0);
  const setName = s(block?.title || block?.name || block?.label || "");
  const titleSuffix = setName
    ? `${setName} · Sett ${setIndex + 1}/${totalSets}`
    : `Sett ${setIndex + 1}/${totalSets}`;
  const progressPrefix = alreadyCompleted
    ? (remainingBefore > 0
        ? `Dette settet er allerede tatt • ${remainingBefore} sett mangler fortsatt`
        : `Alle sett er allerede fullført`)
    : (remainingAfterThis > 0
        ? `${remainingAfterThis} sett igjen etter dette • +1 poeng`
        : `Siste sett • +1 poeng`);

  localStorage.setItem("hg_active_set", setMeta.set_id);

  openQuiz();

  runQuizFlow({
    title: person ? person.name : (place ? place.name : "Quiz"),
    titleSuffix,
    progressPrefix,
    targetId: tid,
    questions: setQuestions,

    autoClose: false,
    onEnd: (correct, total, meta) => {


      localStorage.removeItem("hg_active_set");

      const saveResult = saveSetProgress(setMeta.set_id, correct, total);
      const firstCompletion = !saveResult.alreadyCompleted;
      const completedAfter = countCompletedSets(setList, saveResult.data);
      const remainingSets = Math.max(totalSets - completedAfter, 0);
      const categoryId = getQuizCategoryId(setQuestions);
      let awardedPoint = false;

      const compositeSetId = `${tid}::${setMeta.set_id}`;
      const displayName = [person ? person.name : (place ? place.name : "Quiz"), setName || `Sett ${setIndex + 1}/${totalSets}`]
        .filter(Boolean)
        .join(" — ");
      const image = s(place?.image || person?.image || "");

      if (firstCompletion && categoryId) {
       incrementMeritPoints(categoryId, 1);
       markQuizProgress(categoryId, compositeSetId);

       window.HG_CapitalMaintenance?.maintainFromQuiz?.(categoryId, 1, {
       source: "quiz_set_complete"
      });

        saveQuizHistory({
          schema: QUIZ_HISTORY_SCHEMA,
          id: compositeSetId,
          targetId: compositeSetId,
          categoryId,
          name: displayName,
          image,
          date: new Date().toISOString(),
          correctCount: correct,
          total,
          correctAnswers: Array.isArray(meta?.correctAnswers) ? meta.correctAnswers : []
        });

        appendLearningEvent({
          schema: HG_LEARNING_SCHEMA,
          type: "quiz_set_complete",
          ts: Date.now(),
          targetId: compositeSetId,
          parentTargetId: tid,
          setId: s(setMeta.set_id),
          categoryId,
          correctCount: correct,
          total,
          concepts: Array.isArray(meta?.conceptsCorrect) ? meta.conceptsCorrect : [],
          related_emner: Array.isArray(meta?.emnerTouched) ? meta.emnerTouched : []
        });

        awardedPoint = true;
      }

      if (window.KnowledgeLearning && Array.isArray(meta?.emnerTouched)) {
        const unique = [...new Set(meta.emnerTouched)];
        unique.forEach(emneId => {
          window.KnowledgeLearning.setUnderstood(emneId);
        });
      }

      if (remainingSets === 0) {
        if (typeof API.markQuizAsDoneExternal === "function") API.markQuizAsDoneExternal(tid);
        else markQuizAsDone(tid);

        if (firstCompletion) {
          if (person) {
            API.savePeopleCollected(tid);
            API.showRewardPerson(person);
          } else if (place) {
            if (typeof API.saveVisitedFromQuiz === "function") API.saveVisitedFromQuiz(tid);
            API.showRewardPlace(place);
          }
        }
      }

      const toastParts = [`Sett ${setIndex + 1}/${totalSets} fullført: ${correct}/${total}`];
      if (awardedPoint) toastParts.push("+1 poeng");
      else if (!firstCompletion) toastParts.push("allerede fullført tidligere");
      else if (firstCompletion && !categoryId) toastParts.push("mangler kategori – ingen poeng");
      if (remainingSets > 0) toastParts.push(`${remainingSets} sett gjenstår`);
      else toastParts.push("alle sett fullført");

      API.showToast(toastParts.join(" • "));
      API.dispatchProfileUpdate();

      const nextSet = findNextSet(setList, setMeta.set_id);
      const scoreLine = `Score: ${correct}/${total}`;
      const rewardLine = awardedPoint
        ? "+1 poeng"
        : (!firstCompletion
            ? "Ingen nye poeng – dette settet var allerede fullført."
            : (categoryId ? "Ingen nye poeng." : "Ingen poeng – mangler kategori på settet."));
      const remainingLine = remainingSets > 0
        ? `${remainingSets} sett gjenstår.`
        : "Alle sett for dette stedet er fullført.";

      closeQuiz();
      setTimeout(() => {
        openQuizSummary({
          title: person ? person.name : (place ? place.name : "Quiz"),
          lead: `Sett ${setIndex + 1} av ${totalSets} fullført`,
          meta: [scoreLine, rewardLine, remainingLine].filter(Boolean).join(" • "),
          primaryText: remainingSets > 0 ? "Neste sett" : "Ferdig",
          onPrimary: () => {
            if (remainingSets > 0) {
              QuizEngine.start(tid);
            }
          },
          secondaryText: remainingSets > 0 ? "Lukk" : "",
          onSecondary: () => {}
        });
      }, 180);
    }
  });

  return;
}

// ---- FALLBACK TO LEGACY ----
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
  const categoryId = getQuizCategoryId(questions);

  if (!categoryId) {
    if (window.DEBUG) console.warn("[quiz] perfect but missing categoryId; not awarding points", questions[0]);
    API.showToast("Perfekt, men mangler kategori på quiz-data (ingen poeng gitt).");
    API.dispatchProfileUpdate();
    return;
  }

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

           // ------------------------------------------------------------
          // KnowledgeLearningState → understood
          // ------------------------------------------------------------
            if (window.KnowledgeLearning && Array.isArray(meta?.emnerTouched)) {
              const unique = [...new Set(meta.emnerTouched)];
              unique.forEach(emneId => {
               window.KnowledgeLearning.setUnderstood(emneId);
              });
            }

            // 3) progresjon
          markQuizProgress(categoryId, tid);
          API.addCompletedQuizAndMaybePoint(categoryId, tid);

          window.HG_CapitalMaintenance?.maintainFromQuiz?.(categoryId, 1, {
            source: "quiz_perfect"
          });
  
            // 3.5) merits_by_category (profile.html bruker denne til badge-grid)
            try {
            const merits = safeParse("merits_by_category", {});
            const key = s(categoryId);
             if (key) {
            merits[key] = merits[key] || { points: 0 };
            merits[key].points = Number(merits[key].points || 0) + 1;
            safeWrite("merits_by_category", merits);
              }
            } catch (e) {
            dwarn("could not save merits_by_category", e);
            }
  
            // 4) UI “done”
            if (typeof API.markQuizAsDoneExternal === "function") API.markQuizAsDoneExternal(tid);
            else markQuizAsDone(tid);

            // 5) unlocks + reward
            if (person) {
            API.savePeopleCollected(tid);
             API.showRewardPerson(person);
            } else if (place) {
                // ✅ dette var manglende linje
            if (typeof API.saveVisitedFromQuiz === "function") API.saveVisitedFromQuiz(tid);
            API.showRewardPlace(place);
            }

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

  QuizEngine.getTargetSummary = async function (targetId) {
    const tid = s(targetId);
    if (!tid) {
      return { targetId: tid, mode: "none", hasAny: false, totalSets: 0, completedSets: 0, remainingSets: 0, isComplete: false };
    }

    await ensureLoaded();

    const setList = (_byTargetSets && _byTargetSets.get(tid)) || [];
    if (setList.length) {
      const progress = safeParse("hg_quiz_sets_v1", {});
      const completedSets = countCompletedSets(setList, progress);
      const totalSets = setList.length;
      return {
        targetId: tid,
        mode: "sets",
        hasAny: true,
        totalSets,
        completedSets,
        remainingSets: Math.max(totalSets - completedSets, 0),
        isComplete: completedSets >= totalSets && totalSets > 0
      };
    }

    const legacy = (_byTarget && _byTarget.get(tid)) || [];
    if (legacy.length) {
      const history = safeParse(QUIZ_HISTORY_KEY, []);
      const isComplete = Array.isArray(history) && history.some(h => s(h?.id || h?.targetId) === tid);
      return {
        targetId: tid,
        mode: "legacy",
        hasAny: true,
        totalSets: 1,
        completedSets: isComplete ? 1 : 0,
        remainingSets: isComplete ? 0 : 1,
        isComplete
      };
    }

    return {
      targetId: tid,
      mode: "none",
      hasAny: false,
      totalSets: 0,
      completedSets: 0,
      remainingSets: 0,
      isComplete: false
    };
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
