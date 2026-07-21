from pathlib import Path
import json
import re


def read(path):
    return Path(path).read_text()


def write(path, content):
    Path(path).write_text(content)


def replace_exact(source, before, after, label):
    if before not in source:
        raise RuntimeError(f"Missing {label}")
    return source.replace(before, after, 1)


def replace_regex(source, pattern, after, label):
    next_source, count = re.subn(pattern, after, source, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError(f"Missing {label}")
    return next_source


quizzes = read("js/quizzes.js")
quizzes = replace_exact(
    quizzes,
    '  const emnerTouched = [];     // string[]\n',
    '  const emnerTouched = [];     // string[]\n  const answers = [];            // [{question_id, question, answer, chosenAnswer, correct}]\n',
    "quiz answers collection",
)
quizzes = replace_exact(
    quizzes,
    '''        const tid = s(targetId);

        // --- KUN ved RIKTIG: registrer alt (meta + hooks) ---
        if (ok) {
          correct++;

          const qText = q.question || q.text || "";
          const chosenAnswer = options[chosenIdx] ?? "";
          const correctAnswer = options[answerIndex] ?? (q.answer ?? "");''',
    '''        const tid = s(targetId);
        const qText = q.question || q.text || "";
        const chosenAnswer = options[chosenIdx] ?? "";
        const correctAnswer = options[answerIndex] ?? (q.answer ?? "");
        answers.push({
          question_id: s(q.quiz_id || q.quizId || q.id || tid),
          question: qText,
          answer: correctAnswer,
          chosenAnswer,
          correct: ok
        });

        // --- KUN ved RIKTIG: registrer alt (meta + hooks) ---
        if (ok) {
          correct++;''',
    "quiz answer evidence",
)
quizzes = replace_exact(
    quizzes,
    '            const meta = { correctAnswers, conceptsCorrect, emnerTouched };',
    '            const meta = { correctAnswers, conceptsCorrect, emnerTouched, answers };',
    "quiz completion meta",
)
review_engine = r'''

  // ============================================================
  // PUBLIC: startReview({ targetId, setId, questionIds })
  // Målrettet repetisjon uten poeng eller progresjonsmutasjon.
  // ============================================================
  QuizEngine.startReview = async function (request = {}) {
    try {
      await ensureLoaded();

      const tid = s(request.targetId || request.target_id);
      const requestedSetId = s(request.setId || request.set_id);
      const wantedIds = new Set(arr(request.questionIds || request.question_ids).map(s).filter(Boolean));
      if (!tid || !requestedSetId || !wantedIds.size) {
        API.showToast("Fant ingen spørsmål som trenger repetisjon");
        return false;
      }

      const person =
        API.getPersonById(tid) ||
        (Array.isArray(window.PEOPLE) ? window.PEOPLE.find((p) => s(p?.id) === tid) : null);
      const place =
        API.getPlaceById(tid) ||
        (Array.isArray(window.PLACES) ? window.PLACES.find((p) => s(p?.id) === tid) : null);
      if (!person && !place) {
        API.showToast(tt("ui.quiz.targetMissing", "Fant verken person eller sted"));
        return false;
      }

      const setList = (_byTargetSets && _byTargetSets.get(tid)) || [];
      const setMeta = setList.find((item) => s(item?.set_id) === requestedSetId);
      if (!setMeta) {
        API.showToast("Fant ikke quizsettet som skal repeteres");
        return false;
      }

      const setData = await loadSetFile(setMeta.file);
      const block = arr(setData?.sets).find((item) => s(item?.set_id) === requestedSetId);
      const allQuestions = arr(block?.questions);
      const questions = allQuestions.filter((question) => wantedIds.has(s(question?.quiz_id || question?.quizId || question?.id)));
      if (!questions.length) {
        API.showToast("Fant ikke spørsmålene som skal repeteres");
        return false;
      }

      const setName = s(block?.title || block?.name || block?.label || requestedSetId);
      localStorage.setItem("hg_active_set", requestedSetId);
      openQuiz();
      runQuizFlow({
        title: person ? person.name : (place ? place.name : tt("ui.quiz.title", "Quiz")),
        titleSuffix: `${setName} · Repetisjon`,
        progressPrefix: "Repetisjon",
        targetId: tid,
        questions,
        autoClose: false,
        onEnd: (correct, total, meta) => {
          localStorage.removeItem("hg_active_set");
          const categoryId = getQuizCategoryId(questions);
          const compositeSetId = `${tid}::${requestedSetId}`;
          try {
            window.dispatchEvent(new CustomEvent("hg:quizReviewCompleted", { detail: {
              quizId: compositeSetId,
              targetId: tid,
              placeId: place ? tid : null,
              setId: requestedSetId,
              domain: categoryId,
              categoryId,
              questionIds: Array.from(wantedIds),
              correct,
              total,
              correctAnswers: Array.isArray(meta?.correctAnswers) ? meta.correctAnswers : [],
              answers: Array.isArray(meta?.answers) ? meta.answers : []
            }}));
          } catch {}

          closeQuiz();
          setTimeout(() => {
            openQuizSummary({
              title: person ? person.name : (place ? place.name : tt("ui.quiz.title", "Quiz")),
              lead: "Repetisjon fullført",
              meta: `Score: ${correct}/${total} · Ingen nye poeng`,
              primaryText: tt("ui.quiz.done", "Ferdig"),
              onPrimary: () => {},
              secondaryText: "",
              onSecondary: null
            });
          }, 180);
        }
      });
      return true;
    } catch (error) {
      dwarn("startReview crashed:", error);
      API.showToast("Kunne ikke starte repetisjonen");
      return false;
    }
  };
'''
quizzes = replace_exact(
    quizzes,
    '  QuizEngine.getTargetSummary = async function (targetId) {',
    review_engine + '\n  QuizEngine.getTargetSummary = async function (targetId) {',
    "targeted review engine",
)
write("js/quizzes.js", quizzes)


memory = read("js/knowledgeQuizMemory.ts")
memory = replace_exact(
    memory,
    'const STORAGE_KEY = "hg_knowledge_memory_v1";\n',
    'const STORAGE_KEY = "hg_knowledge_memory_v1";\nconst REVIEW_REQUEST_KEY = "hg_quiz_review_request_v1";\n',
    "review request storage key",
)
review_core = r'''
  function reviewQuestionIds(bundleValue: unknown): string[] {
    return unique(array<JsonObject>(object(bundleValue).knowledge_units)
      .filter((unit) => unit.assessment?.state === "needs_review")
      .map((unit) => unit.source_question_id || unit.unit_id));
  }

  function reviewCount(bundleValue: unknown): number {
    return array<JsonObject>(object(bundleValue).knowledge_units)
      .filter((unit) => unit.assessment?.state === "needs_review").length;
  }

  function applyReviewBundle(bundleIdValue: unknown, reviewedValue: unknown): JsonObject | null {
    const bundleId = text(bundleIdValue);
    const memory = readMemory();
    const existing = object(memory.bundles?.[bundleId]);
    if (!bundleId || !Object.keys(existing).length) return null;

    const reviewed = sanitizeBundle(reviewedValue);
    const reviewedByQuestion = new Map<string, JsonObject>();
    array<JsonObject>(reviewed.knowledge_units).forEach((unit) => {
      const questionId = text(unit.source_question_id || unit.unit_id);
      if (questionId && !reviewedByQuestion.has(questionId)) reviewedByQuestion.set(questionId, unit);
    });
    if (!reviewedByQuestion.size) return existing;

    const now = new Date().toISOString();
    const knowledgeUnits = array<JsonObject>(existing.knowledge_units).map((unit) => {
      const questionId = text(unit.source_question_id || unit.unit_id);
      const reviewedUnit = reviewedByQuestion.get(questionId);
      if (!reviewedUnit) return unit;
      const previousReview = object(unit.review);
      return {
        ...unit,
        assessment: { ...object(unit.assessment), ...object(reviewedUnit.assessment) },
        review: {
          attempt_count: Number(previousReview.attempt_count || 0) + 1,
          last_reviewed_at: now,
          last_result: text(reviewedUnit.assessment?.state),
          correct: reviewedUnit.assessment?.correct === true
        }
      };
    });

    const previousReview = object(existing.review);
    return saveBundle({
      ...existing,
      knowledge_units: knowledgeUnits,
      review: {
        attempt_count: Number(previousReview.attempt_count || 0) + 1,
        last_reviewed_at: now,
        correct: Number(reviewed.result?.correct || 0),
        total: Number(reviewed.result?.total || 0)
      },
      updated_at: now
    });
  }

  function startReview(bundleOrId: unknown): boolean {
    const memory = readMemory();
    const bundle = typeof bundleOrId === "string" ? object(memory.bundles?.[bundleOrId]) : object(bundleOrId);
    const questionIds = reviewQuestionIds(bundle);
    if (!bundle.bundle_id || !bundle.target_id || !bundle.set_id || !questionIds.length) return false;

    const request = {
      bundleId: text(bundle.bundle_id),
      targetId: text(bundle.target_id),
      setId: text(bundle.set_id),
      questionIds,
      requestedAt: new Date().toISOString()
    };

    closeKnowledgePopup();
    root.document?.getElementById("quizSummaryModal")?.remove();
    if (typeof root.QuizEngine?.startReview === "function") {
      void Promise.resolve(root.QuizEngine.startReview(request));
      return true;
    }

    try { root.localStorage?.setItem(REVIEW_REQUEST_KEY, JSON.stringify(request)); } catch { return false; }
    if (root.location) root.location.href = new URL("index.html", root.location.href).toString();
    return true;
  }

  function consumePendingReview(): boolean {
    if (typeof root.QuizEngine?.startReview !== "function") return false;
    let request: JsonObject = {};
    try { request = JSON.parse(root.localStorage?.getItem(REVIEW_REQUEST_KEY) || "null") || {}; } catch {}
    if (!request.targetId || !request.setId || !array(request.questionIds).length) return false;
    try { root.localStorage?.removeItem(REVIEW_REQUEST_KEY); } catch {}
    void Promise.resolve(root.QuizEngine.startReview(request));
    return true;
  }
'''
memory = replace_exact(
    memory,
    '  function memorySummary(memory: JsonObject = readMemory()): JsonObject {',
    review_core + '\n  function memorySummary(memory: JsonObject = readMemory()): JsonObject {',
    "review core",
)
popup_function = r'''  function knowledgePopupHtml(bundle: JsonObject): string {
    const units = array<JsonObject>(bundle.knowledge_units);
    const facts = array<JsonObject>(bundle.fun_facts);
    const stories = array<JsonObject>(bundle.stories);
    const mastered = units.filter((unit) => unit.assessment?.state === "mastered").length;
    const review = reviewCount(bundle);
    const unitHtml = units.map((unit) => `<article style="padding:11px 0;border-bottom:1px solid rgba(255,255,255,.12)"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><strong>${escapeHtml(unit.topic || unit.dimension || "Kunnskap")}</strong><small style="white-space:nowrap">${unit.assessment?.state === "mastered" ? "Mestret" : "Til repetisjon"}</small></div><p style="margin:6px 0 0;line-height:1.45">${escapeHtml(unit.text)}</p>${renderChips([unit.emne_ids, unit.concepts, unit.concept_focus, unit.terms])}</article>`).join("");
    const reviewAction = review > 0 ? `<div style="display:flex;justify-content:flex-end;margin:14px 0"><button class="ghost" id="quizKnowledgeMemoryReview" type="button">Gjenta feil (${review})</button></div>` : "";
    return `<div class="modal-body" style="max-height:min(86vh,900px);overflow:hidden"><div class="modal-head"><div><small class="muted">Knowledge-minnekammer</small><strong style="display:block">${escapeHtml(bundle.set_title || bundle.target_id || "Kunnskapen du samlet")}</strong></div><button class="ghost" id="quizKnowledgeMemoryClose">Lukk</button></div><div class="sheet-body" style="overflow:auto;max-height:68vh"><p class="muted" style="margin-top:0">${mastered} mestret • ${review} til repetisjon • ${units.length} kunnskapspunkter</p>${reviewAction}${unitHtml || "<p>Ingen strukturerte kunnskapspunkter ble funnet.</p>"}${facts.length ? `<section style="margin-top:18px"><h3>Funfacts og trivia</h3>${facts.map((row) => `<p>• ${escapeHtml(row.text)}</p>`).join("")}</section>` : ""}${stories.length ? `<section style="margin-top:18px"><h3>Historier</h3>${stories.map((row) => `<p>• ${escapeHtml(row.text)}</p>`).join("")}</section>` : ""}</div></div>`;
  }

  function closeKnowledgePopup'''
memory = replace_regex(
    memory,
    r'  function knowledgePopupHtml\(bundle: JsonObject\): string \{.*?\n  \}\n\n  function closeKnowledgePopup',
    popup_function,
    "review popup",
)
memory = replace_exact(
    memory,
    '''    const close = modal.querySelector<HTMLElement>("#quizKnowledgeMemoryClose");
    if (close) close.onclick = closeKnowledgePopup;
    modal.addEventListener("click", (event: MouseEvent) => { if (event.target === modal) closeKnowledgePopup(); });''',
    '''    const close = modal.querySelector<HTMLElement>("#quizKnowledgeMemoryClose");
    if (close) close.onclick = closeKnowledgePopup;
    const reviewButton = modal.querySelector<HTMLElement>("#quizKnowledgeMemoryReview");
    if (reviewButton) reviewButton.onclick = () => { startReview(bundle.bundle_id); };
    modal.addEventListener("click", (event: MouseEvent) => { if (event.target === modal) closeKnowledgePopup(); });''',
    "popup review binding",
)
summary_function = r'''  function attachBundleToSummary(bundleValue: unknown): boolean {
    const bundle = object(bundleValue);
    const modal = root.document?.getElementById("quizSummaryModal");
    const primary = modal?.querySelector<HTMLElement>("#quizSummaryPrimary");
    const actions = primary?.parentElement;
    if (!modal || !actions || !bundle.bundle_id) return false;
    let button = modal.querySelector<HTMLButtonElement>("#quizSummaryKnowledge");
    if (!button) {
      button = root.document.createElement("button");
      button.id = "quizSummaryKnowledge";
      button.className = "ghost";
      actions.insertBefore(button, primary);
    }
    button.textContent = `Kunnskapen du samlet (${array(bundle.knowledge_units).length})`;
    button.onclick = () => { openKnowledgePopup(bundle.bundle_id); };

    const review = reviewCount(bundle);
    let reviewButton = modal.querySelector<HTMLButtonElement>("#quizSummaryReview");
    if (review > 0) {
      if (!reviewButton) {
        reviewButton = root.document.createElement("button");
        reviewButton.id = "quizSummaryReview";
        reviewButton.className = "ghost";
        actions.insertBefore(reviewButton, primary);
      }
      reviewButton.textContent = `Gjenta feil (${review})`;
      reviewButton.onclick = () => { startReview(bundle.bundle_id); };
    } else {
      reviewButton?.remove();
    }

    const meta = modal.querySelector("#quizSummaryMeta");
    if (meta && !modal.querySelector("#quizSummaryKnowledgeLine")) {
      const line = root.document.createElement("div");
      line.id = "quizSummaryKnowledgeLine";
      line.className = "muted";
      line.style.margin = "-6px 0 14px";
      line.textContent = `${array(bundle.knowledge_units).length} kunnskapspunkter er automatisk lagt til i Knowledge.`;
      meta.insertAdjacentElement("afterend", line);
    }
    return true;
  }

  function watchForSummary'''
memory = replace_regex(
    memory,
    r'  function attachBundleToSummary\(bundleValue: unknown\): boolean \{.*?\n  \}\n\n  function watchForSummary',
    summary_function,
    "summary review action",
)
review_capture = r'''
  async function captureReviewCompletion(detailValue: unknown = {}): Promise<JsonObject | null> {
    try {
      const detail = object(detailValue);
      const context = await resolveSetContext(detail);
      const questionIds = new Set(array(detail.questionIds).map(text).filter(Boolean));
      const questions = array<JsonObject>(context.questions).filter((question) => questionIds.has(text(question.quiz_id || question.quizId || question.id)));
      const reviewed = buildQuizKnowledgeBundle({
        targetId: context.targetId,
        categoryId: text(detail.categoryId || detail.domain || context.setData?.categoryId),
        setId: context.setId,
        sourceFile: context.sourceFile,
        setData: context.setData,
        setBlock: context.setBlock,
        questions,
        result: {
          correct: Number(detail.correct || 0),
          total: Number(detail.total || 0),
          correctAnswers: array(detail.correctAnswers),
          answers: array(detail.answers)
        }
      });
      const saved = applyReviewBundle(stableId(context.targetId, context.setId), reviewed);
      pendingBundle = saved;
      if (saved && attachBundleToSummary(saved)) pendingBundle = null;
      return saved;
    } catch (error) {
      if (root.DEBUG) console.warn("[HGKnowledgeV2.quizMemory] review capture failed", error, detailValue);
      return null;
    }
  }
'''
memory = replace_exact(
    memory,
    '  function renderOverview(profileValue: unknown): void {',
    review_capture + '\n  function renderOverview(profileValue: unknown): void {',
    "review completion capture",
)
overview_function = r'''  function renderOverview(profileValue: unknown): void {
    if (!root.document) return;
    const profile = object(profileValue);
    const content = root.document.getElementById("knowledgeContent");
    if (!content) return;
    let panel = root.document.getElementById("knowledgeMemoryOverview");
    if (!panel) {
      panel = root.document.createElement("section");
      panel.id = "knowledgeMemoryOverview";
      panel.className = "kv2-panel";
      panel.style.marginBottom = "18px";
      content.parentElement?.insertBefore(panel, content);
    }
    const memory = object(profile.quiz_memory);
    const summary = object(memory.summary);
    const selectedSubject = text(new URLSearchParams(root.location?.search || "").get("subject"));
    const bundles = array<JsonObject>(memory.bundles).filter((bundle) => !selectedSubject || text(bundle.subject_id) === selectedSubject).slice(0, 8);
    if (!Number(summary.bundle_count || 0)) {
      panel.innerHTML = `<div class="kv2-panel-head"><div><span class="kv2-eyebrow">Quiz-minnekammer</span><h2>Kunnskap fra fullførte quizzer</h2></div></div><p class="kv2-empty">Ingen kunnskapsbundle er samlet ennå.</p>`;
      return;
    }
    panel.innerHTML = `<div class="kv2-panel-head"><div><span class="kv2-eyebrow">Quiz-minnekammer</span><h2>Kunnskap samlet i quiz</h2></div><span class="kv2-panel-meta">Kunnskap, historier, funfacts og vurderingsevidens er separate roller i samme TypeScript-motor.</span></div><div class="kv2-summary" style="margin:0 0 16px"><article class="kv2-stat"><strong>${Number(summary.bundle_count || 0)}</strong><span>Quizforløp</span></article><article class="kv2-stat"><strong>${Number(summary.knowledge_unit_count || 0)}</strong><span>Kunnskapsenheter</span></article><article class="kv2-stat"><strong>${Number(summary.mastered_count || 0)}</strong><span>Mestret</span></article><article class="kv2-stat"><strong>${Number(summary.review_count || 0)}</strong><span>Til repetisjon</span></article></div>${bundles.length ? `<div class="kv2-recent-list">${bundles.map((bundle) => { const review = reviewCount(bundle); return `<article class="kv2-recent-item"><span class="kv2-recent-meta">${escapeHtml(root.HGKnowledgeV2?.SUBJECT_LABELS?.[bundle.subject_id] || bundle.subject_id)} · ${escapeHtml(bundle.reading?.state || "Samlet")}</span><button type="button" data-knowledge-bundle="${escapeHtml(bundle.bundle_id)}" style="appearance:none;border:0;background:none;color:inherit;padding:0;text-align:left;font:inherit;cursor:pointer;font-weight:700">${escapeHtml(bundle.set_title || humanize(bundle.target_id) || "Quizkunnskap")}</button><p>${Number(bundle.result?.correct || 0)} av ${Number(bundle.result?.total || 0)} riktig · ${array(bundle.knowledge_units).length} kunnskapspunkter</p>${review > 0 ? `<button type="button" class="ghost" data-knowledge-review="${escapeHtml(bundle.bundle_id)}">Gjenta feil (${review})</button>` : ""}</article>`; }).join("")}</div>` : ""}`;
    panel.querySelectorAll<HTMLElement>("[data-knowledge-bundle]").forEach((button) => {
      button.addEventListener("click", () => openKnowledgePopup(button.getAttribute("data-knowledge-bundle") || ""));
    });
    panel.querySelectorAll<HTMLElement>("[data-knowledge-review]").forEach((button) => {
      button.addEventListener("click", () => startReview(button.getAttribute("data-knowledge-review") || ""));
    });
  }

  function initBrowserIntegration'''
memory = replace_regex(
    memory,
    r'  function renderOverview\(profileValue: unknown\): void \{.*?\n  \}\n\n  function initBrowserIntegration',
    overview_function,
    "Knowledge overview review action",
)
integration_function = r'''  function initBrowserIntegration(): void {
    if (!root.addEventListener || !root.document || !root.fetch || root.__HG_KNOWLEDGE_MEMORY_BROWSER_INTEGRATION__) return;
    root.__HG_KNOWLEDGE_MEMORY_BROWSER_INTEGRATION__ = true;
    watchForSummary();
    root.addEventListener("hg:quizCompleted", (event: CustomEvent) => { void captureCompletion(event.detail || {}); });
    root.addEventListener("hg:quizReviewCompleted", (event: CustomEvent) => { void captureReviewCompletion(event.detail || {}); });
    root.addEventListener("hg:appReady", () => { consumePendingReview(); });
  }

  return {'''
memory = replace_regex(
    memory,
    r'  function initBrowserIntegration\(\): void \{.*?\n  \}\n\n  return \{',
    integration_function,
    "review browser integration",
)
memory = replace_exact(
    memory,
    '''    memorySummary,
    attachMemoryToProfile,
    openKnowledgePopup,
    attachBundleToSummary,
    captureCompletion,
    renderOverview,
    initBrowserIntegration''',
    '''    memorySummary,
    attachMemoryToProfile,
    reviewQuestionIds,
    reviewCount,
    applyReviewBundle,
    startReview,
    consumePendingReview,
    openKnowledgePopup,
    attachBundleToSummary,
    captureCompletion,
    captureReviewCompletion,
    renderOverview,
    initBrowserIntegration''',
    "review API exports",
)
write("js/knowledgeQuizMemory.ts", memory)


integration_test_path = "tests/knowledge-profile-memory-integration.test.js"
integration_test = read(integration_test_path)
integration_test += r'''

test("målrettet repetisjon bevarer hele bundlen og oppdaterer bare feilspørsmålet", () => {
  const api = loadRuntime();
  const questions = [
    { quiz_id: "q1", categoryId: "by", targetId: "sted", knowledge: "Første påstand.", emne_id: "em_by_test" },
    { quiz_id: "q2", categoryId: "by", targetId: "sted", knowledge: "Andre påstand.", emne_id: "em_by_test" }
  ];
  const original = api.quizMemory.buildQuizKnowledgeBundle({
    targetId: "sted", categoryId: "by", setId: "set_1", questions,
    result: { correct: 1, total: 2, answers: [{ question_id: "q1", correct: true }] }
  });
  api.quizMemory.saveBundle(original);
  const reviewed = api.quizMemory.buildQuizKnowledgeBundle({
    targetId: "sted", categoryId: "by", setId: "set_1", questions: [questions[1]],
    result: { correct: 1, total: 1, answers: [{ question_id: "q2", correct: true }] }
  });
  const updated = api.quizMemory.applyReviewBundle(original.bundle_id, reviewed);
  assert.equal(updated.knowledge_units.length, 2);
  assert.equal(api.quizMemory.reviewCount(updated), 0);
  assert.equal(updated.knowledge_units.every((unit) => unit.assessment.state === "mastered"), true);
  assert.equal(updated.review.attempt_count, 1);
});
'''
write(integration_test_path, integration_test)


browser_test_path = "tests/knowledge-browser-e2e.test.mjs"
browser_test = read(browser_test_path)
browser_test = replace_exact(
    browser_test,
    '''assert.match(await page.textContent("#quizKnowledgeMemoryModal"), /E2E-stedet åpnet i 2020/);
await page.reload();''',
    '''assert.match(await page.textContent("#quizKnowledgeMemoryModal"), /E2E-stedet åpnet i 2020/);
await page.waitForSelector("#quizKnowledgeMemoryReview");
await page.click("#quizKnowledgeMemoryReview");
await page.waitForFunction(() => document.querySelector("#quizQuestion")?.textContent?.includes("Hvem tegnet"));
assert.match(await page.textContent("#quizProgress"), /1\\/1/);
await page.click('#quizChoices button[data-idx="0"]');
await page.waitForSelector("#quizSummaryModal");
await page.waitForFunction(() => {
  const memory = JSON.parse(localStorage.getItem("hg_knowledge_memory_v1"));
  return memory.bundles["e2e_place::set_1"].knowledge_units.every((unit) => unit.assessment.state === "mastered");
});
const reviewed = await page.evaluate(() => JSON.parse(localStorage.getItem("hg_knowledge_memory_v1")).bundles["e2e_place::set_1"]);
assert.equal(reviewed.knowledge_units.length, 2);
assert.equal(reviewed.knowledge_units.filter((unit) => unit.assessment.state === "needs_review").length, 0);
assert.equal(reviewed.review.attempt_count, 1);
await page.reload();''',
    "browser review flow",
)
browser_test = replace_exact(
    browser_test,
    'assert.match(await page.textContent("#knowledgeContent"), /Arkitekt A tegnet E2E-stedet/);',
    'assert.match(await page.textContent("#knowledgeContent"), /Arkitekt A tegnet E2E-stedet/);\nassert.equal(profile.quiz_memory.summary.review_count, 0);\nassert.equal((await page.textContent("#knowledgeMemoryOverview")).includes("Gjenta feil"), false);',
    "review completion profile assertions",
)
write(browser_test_path, browser_test)


manifest_path = "data/knowledge/knowledge_manifest.json"
manifest = json.loads(read(manifest_path))
manifest["runtime"]["migrationStatus"] = "v7_targeted_review_active"
manifest["runtime"]["currentBehavior"] = "Quizminne, capture, evidenssynkronisering, profilbygging og målrettet repetisjon eies av én TypeScript-runtime. needs_review peker tilbake til det eksakte quizsettet og bare feilbesvarte spørsmål repeteres uten nye poeng; resultatet oppdaterer den eksisterende bundlen idempotent."
manifest["runtime"]["nextRuntimeRequirements"] = [
    item for item in manifest["runtime"]["nextRuntimeRequirements"]
    if "targeted repetition" not in str(item)
]
manifest["runtime"]["nextRuntimeRequirements"].append("Add spaced repetition scheduling after targeted review has stable usage telemetry.")
write(manifest_path, json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")

print("Targeted Knowledge review applied")
