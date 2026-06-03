(function () {
  const LS_TASKS = "hg_civi_tasks_v1";

  const HISTORY_GO_TARGET_TYPES = [
    "place",
    "person",
    "knowledge",
    "debate",
    "unlock"
  ];

  const HISTORY_GO_TASK_KINDS = [
    "history_go_place",
    "history_go_person",
    "history_go_knowledge",
    "history_go_debate",
    "history_go_unlock"
  ];

  const HISTORY_GO_COMPLETION_MODES = [
    "open_place",
    "visit_place",
    "place_quiz",
    "read_story",
    "open_person",
    "person_quiz",
    "read_profile",
    "quiz_completed",
    "correct_answer",
    "read_leksikon",
    "debate_participated",
    "position_chosen",
    "unlocked"
  ];

  function cleanString(value) {
    if (value == null) return null;
    const text = String(value).trim();
    return text || null;
  }

  function cleanReturnContext(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return { ...value };
  }

  function firstString() {
    for (let i = 0; i < arguments.length; i += 1) {
      const text = cleanString(arguments[i]);
      if (text) return text;
    }

    return null;
  }

  function normalizeTargetType(taskKind, targetType) {
    const cleanTargetType = cleanString(targetType);
    if (HISTORY_GO_TARGET_TYPES.indexOf(cleanTargetType) !== -1) {
      return cleanTargetType;
    }

    if (taskKind === "history_go_place") return "place";
    if (taskKind === "history_go_person") return "person";
    if (taskKind === "history_go_knowledge") return "knowledge";
    if (taskKind === "history_go_debate") return "debate";
    if (taskKind === "history_go_unlock") return "unlock";

    return cleanTargetType;
  }

  function normalizeHistoryGoTaskPayload(payload) {
    const source = payload && typeof payload === "object" ? payload : {};
    const taskKind = cleanString(source.task_kind);
    const targetType = normalizeTargetType(taskKind, source.target_type);
    const placeId = firstString(source.place_id, source.placeId);
    const personId = firstString(source.person_id, source.personId);
    const categoryId = firstString(source.category_id, source.categoryId);
    const quizId = firstString(source.quiz_id, source.quizId);
    const emneId = firstString(source.emne_id, source.emneId);
    const debateId = firstString(source.debate_id, source.debateId);
    const conflictId = firstString(source.conflict_id, source.conflictId);
    const unlockId = firstString(source.unlock_id, source.unlockId);

    return {
      task_kind: taskKind,
      target_type: targetType,
      target_id: firstString(
        source.target_id,
        source.targetId,
        placeId,
        personId,
        quizId,
        categoryId,
        emneId,
        debateId,
        conflictId,
        unlockId
      ),
      place_id: placeId,
      person_id: personId,
      category_id: categoryId,
      quiz_id: quizId,
      emne_id: emneId,
      debate_id: debateId,
      conflict_id: conflictId,
      unlock_id: unlockId,
      required_kind: firstString(source.required_kind, source.requiredKind),
      completion_mode: firstString(source.completion_mode, source.completionMode),
      title: cleanString(source.title),
      description: cleanString(source.description),
      return_context: cleanReturnContext(source.return_context || source.returnContext)
    };
  }

  function isHistoryGoTaskPayload(payload) {
    if (!payload || typeof payload !== "object") return false;

    const normalized = normalizeHistoryGoTaskPayload(payload);
    const isHistoryGoKind = HISTORY_GO_TASK_KINDS.indexOf(normalized.task_kind) !== -1;
    const isHistoryGoTarget = HISTORY_GO_TARGET_TYPES.indexOf(normalized.target_type) !== -1;
    const isHistoryGoCompletion = HISTORY_GO_COMPLETION_MODES.indexOf(normalized.completion_mode) !== -1;
    const hasConcreteTarget = !!normalized.target_id;

    if (!hasConcreteTarget) return false;
    if (isHistoryGoKind && isHistoryGoTarget) return true;
    return isHistoryGoTarget && isHistoryGoCompletion;
  }
  function dispatchProfileUpdate() {
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
  }

  function safeParse(raw, fallback) {
    try {
      const v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch {
      return fallback;
    }
  }

  function getStore() {
    const raw = safeParse(localStorage.getItem(LS_TASKS), {});
    return {
      byId: {},
      byMailId: {},
      order: [],
      ...(raw || {})
    };
  }

  function setStore(next) {
    const nextRaw = JSON.stringify(next || {});
    const prevRaw = localStorage.getItem(LS_TASKS);
    if (prevRaw === nextRaw) return next;
    localStorage.setItem(LS_TASKS, nextRaw);
    dispatchProfileUpdate();
    return next;
  }

  function inferTaskKind(mailEvent, active) {
    if (mailEvent?.task_kind) {
      return String(mailEvent.task_kind);
    }

    const careerId = String(active?.career_id || "").trim();

    if (careerId === "naering" || careerId === "naeringsliv") {
      return "brand_knowledge";
    }

    if (careerId === "litteratur") {
      return "catalog_knowledge";
    }

    if (careerId === "by") {
      return "place_knowledge";
    }

    return "work_case";
  }

  function deriveKnowledgeTargets(mailEvent, active) {
    if (Array.isArray(mailEvent?.knowledge_targets) && mailEvent.knowledge_targets.length) {
      return mailEvent.knowledge_targets.slice(0, 8);
    }

    const careerId = String(active?.career_id || "").trim();
    const brandName = String(active?.brand_name || "").trim();

    if (careerId === "naering" || careerId === "naeringsliv") {
      return [
        brandName || "butikkprofil",
        "merkehistorikk",
        "produksjonssted",
        "kvalitet"
      ];
    }

    if (careerId === "litteratur") {
      return [
        "forfatter",
        "sjanger",
        "utgivelseshistorie",
        "forlagskunnskap"
      ];
    }

    if (careerId === "by") {
      return [
        "stedsforståelse",
        "lokalhistorie",
        "arkitektur",
        "byliv"
      ];
    }

    return [
      "arbeidsoppgave",
      "fagkunnskap"
    ];
  }

  function deriveQuizTargets(mailEvent, active) {
    if (Array.isArray(mailEvent?.quiz_targets) && mailEvent.quiz_targets.length) {
      return mailEvent.quiz_targets.slice(0, 8);
    }

    const careerId = String(active?.career_id || "").trim();
    if (!careerId) return [];

    return [careerId];
  }

  function buildTaskTitle(mailEvent, active, kind) {
    const brandName = String(active?.brand_name || "").trim();
    const title = String(active?.title || "").trim() || "Arbeidsoppgave";

    if (kind === "brand_knowledge") {
      return brandName
        ? `Læringsoppgave: ${brandName}`
        : `Læringsoppgave: ${title}`;
    }

    if (kind === "catalog_knowledge") {
      return `Katalogoppgave: ${title}`;
    }

    if (kind === "place_knowledge") {
      return `Stedsoppgave: ${title}`;
    }

    return `Oppgave: ${title}`;
  }

  function buildTaskDescription(mailEvent, active, kind) {
    const situation = Array.isArray(mailEvent?.situation)
      ? mailEvent.situation
      : [];

    const firstLine = situation[0] || String(mailEvent?.subject || "Ny arbeidsoppgave");
    const brandName = String(active?.brand_name || "").trim();

    if (kind === "brand_knowledge") {
      return brandName
        ? `${firstLine} Du skal bruke faktisk kunnskap om ${brandName} for å løse oppgaven.`
        : `${firstLine} Du skal bruke faktisk vare- og brandkunnskap for å løse oppgaven.`;
    }

    if (kind === "catalog_knowledge") {
      return `${firstLine} Du skal bruke faktisk bok- og katalogkunnskap.`;
    }

    if (kind === "place_knowledge") {
      return `${firstLine} Du skal bruke faktisk stedskunnskap.`;
    }

    return firstLine;
  }

  function createTaskForMail(mailEvent, active, options = {}) {
    if (!mailEvent?.id) return null;

    const store = getStore();
    const existingId = store.byMailId?.[mailEvent.id];

    if (existingId && store.byId?.[existingId]) {
      return store.byId[existingId];
    }

    const kind = inferTaskKind(mailEvent, active);
    const durationMinutes = Math.max(
      10,
      Number(mailEvent?.work_minutes || mailEvent?.duration_minutes || 45)
    );

    const windowInfo =
      options.windowInfo ||
      window.CivicationCalendar?.getWindow?.(durationMinutes) ||
      null;

    const taskId = `task_${mailEvent.id}`;
    const task = {
      id: taskId,
      mail_id: mailEvent.id,
      status: "open",
      created_at: new Date().toISOString(),
      kind: kind,
      title: buildTaskTitle(mailEvent, active, kind),
      description: buildTaskDescription(mailEvent, active, kind),
      durationMinutes: durationMinutes,
      career_id: String(active?.career_id || ""),
      career_name: String(active?.career_name || ""),
      brand_id: String(active?.brand_id || ""),
      brand_name: String(active?.brand_name || ""),
      knowledge_targets: deriveKnowledgeTargets(mailEvent, active),
      quiz_targets: deriveQuizTargets(mailEvent, active),
      time_window: windowInfo,
      task_payload: isHistoryGoTaskPayload(mailEvent?.task_payload)
        ? normalizeHistoryGoTaskPayload(mailEvent.task_payload)
        : mailEvent?.task_payload || null
    };

    const next = getStore();
    next.byId = next.byId || {};
    next.byMailId = next.byMailId || {};
    next.order = Array.isArray(next.order) ? next.order : [];

    next.byId[taskId] = task;
    next.byMailId[mailEvent.id] = taskId;

    if (next.order.indexOf(taskId) === -1) {
      next.order.unshift(taskId);
    }

    setStore(next);
    return task;
  }

  function ensureTaskForMail(mailEvent, active, options = {}) {
    return createTaskForMail(mailEvent, active, options);
  }

  function completeByMail(mailId, result = {}) {
    const store = getStore();
    const taskId = store.byMailId?.[mailId];

    if (!taskId || !store.byId?.[taskId]) {
      return null;
    }

    const current = store.byId[taskId];
    const nextTask = {
      ...current,
      status: "completed",
      completed_at: new Date().toISOString(),
      result: result || null
    };

    store.byId[taskId] = nextTask;
    setStore(store);

    return nextTask;
  }

  function getTaskById(taskId) {
    const store = getStore();
    return store.byId?.[taskId] || null;
  }

  function getTaskByMailId(mailId) {
    const store = getStore();
    const taskId = store.byMailId?.[mailId];
    if (!taskId) return null;
    return store.byId?.[taskId] || null;
  }

  function listOpenTasks() {
    const store = getStore();
    const order = Array.isArray(store.order) ? store.order : [];

    return order
      .map(function (id) {
        return store.byId?.[id] || null;
      })
      .filter(function (task) {
        return task && task.status === "open";
      });
  }

  window.CivicationTaskEngine = {
    getStore,
    setStore,
    normalizeHistoryGoTaskPayload,
    isHistoryGoTaskPayload,
    getTaskById,
    getTaskByMailId,
    createTaskForMail,
    ensureTaskForMail,
    completeByMail,
    listOpenTasks
  };
})();
