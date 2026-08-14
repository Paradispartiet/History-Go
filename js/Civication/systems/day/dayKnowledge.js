
// js/Civication/systems/day/dayKnowledge.js
// Kunnskaps-gate: utleder kunnskapstagger fra mail, leser merits_by_category og bruker
// kunnskapskrav på mail-event/task (+ bygger kunnskaps-task-HTML).
// Sømmen mellom History GO-kunnskap og Civication-oppgaver.
function getMeritsByCategorySafe() {
  try {
    const raw = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function getKnowledgePointsForTag(tag) {
  const merits = getMeritsByCategorySafe();
  return Number(merits?.[String(tag || "")]?.points || 0);
}

function hasRelevantContact(contactTypes, contextId) {
  const contacts = getCiviContacts();
  if (!Array.isArray(contacts) || !contacts.length) return false;

  return contacts.some((c) => {
    const typeOk =
      !Array.isArray(contactTypes) ||
      !contactTypes.length ||
      contactTypes.includes(String(c?.type || ""));

    const contextOk =
      !contextId ||
      String(c?.sourceContextId || "") === String(contextId || "");

    return typeOk && contextOk;
  });
}

function inferKnowledgeTagsFromMail(mailEvent, active) {
  const careerId = String(active?.career_id || "").trim();
  const tags = new Set();

  if (careerId) tags.add(careerId);

  const subject = String(mailEvent?.subject || "");
  const situation = Array.isArray(mailEvent?.situation)
    ? mailEvent.situation.join(" ")
    : "";

  const text = `${subject} ${situation}`.toLowerCase();

  if (/by|plan|utvikling|struktur|nabolag/.test(text)) tags.add("by");
  if (/scene|musikk|lyd|konsert/.test(text)) tags.add("musikk");
  if (/politikk|offentlig|makt|institusjon/.test(text)) tags.add("politikk");
  if (/kunst|uttrykk|kultur|vernissage/.test(text)) tags.add("kunst");
  if (/media|oppmerksomhet|profil|vinkel/.test(text)) tags.add("media");
  if (/historie|arkiv|minne|spor/.test(text)) tags.add("historie");
  if (/analyse|metode|presisjon|teknisk/.test(text)) tags.add("vitenskap");

  return Array.from(tags);
}

function inferContactTypesFromMail(mailEvent) {
  const phaseTag = String(mailEvent?.phase_tag || "");

  if (phaseTag === "lunch") return ["miljo", "synlighet"];
  if (phaseTag === "evening") return ["nettverk", "synlighet"];
  if (phaseTag === "afternoon") return ["kollega"];

  return [];
}

function buildKnowledgeProfileForTask(mailEvent, active, task) {
  const requiredKnowledgeTags = Array.isArray(task?.required_knowledge_tags)
    ? task.required_knowledge_tags
    : inferKnowledgeTagsFromMail(mailEvent, active);

  const requiredContactTypes = Array.isArray(task?.required_contact_types)
    ? task.required_contact_types
    : inferContactTypesFromMail(mailEvent);

  const contextId =
    mailEvent?.lunch_context?.history_go_context_id ||
    mailEvent?.evening_context?.history_go_context_id ||
    mailEvent?.lunch_context?.store_id ||
    mailEvent?.evening_context?.store_id ||
    null;

  const knowledgeScores = requiredKnowledgeTags.map((tag) => ({
    tag,
    points: getKnowledgePointsForTag(tag)
  }));

  const strongKnowledgeCount = knowledgeScores.filter((x) => x.points >= 60).length;
  const weakKnowledgeCount = knowledgeScores.filter((x) => x.points > 0).length;
  const hasContactSupport = hasRelevantContact(requiredContactTypes, contextId);

  let knowledgeState = "missing";
  if (strongKnowledgeCount >= 1) knowledgeState = "qualified";
  else if (weakKnowledgeCount >= 1 || hasContactSupport) knowledgeState = "assisted";

  const knowledgeRefs = Array.isArray(mailEvent?.knowledge_refs_resolved)
    ? mailEvent.knowledge_refs_resolved
    : (Array.isArray(task?.knowledge_refs_resolved) ? task.knowledge_refs_resolved : []);
  const bridgeEvaluation = knowledgeRefs.length
    ? window.CivicationCareerKnowledgeBridge?.evaluateKnowledgeRefsSync?.(
        { ...mailEvent, knowledge_refs_resolved: knowledgeRefs },
        { subject_id: String(active?.career_id || mailEvent?.category || "") }
      )
    : null;

  if (bridgeEvaluation?.source === "career_knowledge_bridge") {
    knowledgeState = String(bridgeEvaluation.knowledge_state || "missing");
  }

  return {
    requiredKnowledgeTags,
    requiredContactTypes,
    contextId,
    knowledgeScores,
    hasContactSupport,
    knowledgeState,
    source: bridgeEvaluation?.source || "category_merits",
    matchedRefIds: Array.isArray(bridgeEvaluation?.matched_ref_ids) ? bridgeEvaluation.matched_ref_ids : [],
    unresolvedRefIds: Array.isArray(bridgeEvaluation?.unresolved_ref_ids) ? bridgeEvaluation.unresolved_ref_ids : [],
    choicePolicy: String(bridgeEvaluation?.choice_policy || "legacy_locking"),
    authorityEffect: String(bridgeEvaluation?.authority_effect || "none"),
    eligibilityEffect: String(bridgeEvaluation?.eligibility_effect || "none")
  };
}

function applyKnowledgeGateToTask(task, mailEvent, active) {
  const profile = buildKnowledgeProfileForTask(mailEvent, active, task);
  const isCareerBridge = profile.source === "career_knowledge_bridge";

  let knowledgeNote = "Du mangler foreløpig nok relevant innsikt og må støtte deg på enklere vurderinger.";
  let solutionMode = "fallback";
  let lockedChoices = ["best"];
  let unlockedChoices = ["basic", "help"];

  if (profile.knowledgeState === "assisted") {
    knowledgeNote = "Du har noe relevant innsikt eller støtte, men ser ikke hele bildet ennå.";
    solutionMode = "assisted";
    lockedChoices = [];
    unlockedChoices = ["basic", "help", "assisted"];
  }

  if (profile.knowledgeState === "qualified") {
    knowledgeNote = "Du har nok relevant kunnskap til å forstå oppgaven på riktig nivå.";
    solutionMode = "qualified";
    lockedChoices = [];
    unlockedChoices = ["basic", "help", "assisted", "best"];
  }

  if (isCareerBridge) {
    lockedChoices = [];
    unlockedChoices = ["basic", "help", "assisted", "best"];
    if (profile.knowledgeState === "missing") {
      knowledgeNote = "Du mangler dokumentert innsikt i akkurat dette fagproblemet. Alle valg er fortsatt mulige, men du får svakere beslutningsstøtte og bør vurdere hjelp.";
      solutionMode = "supported_risk";
    } else if (profile.knowledgeState === "assisted") {
      knowledgeNote = "Du har relevant faggrunnlag, men ikke et sikkert treff på situasjonen. Bruk hjelpespor eller gjør usikkerheten eksplisitt.";
      solutionMode = "assisted";
    } else {
      knowledgeNote = "Din lagrede History Go-kunnskap treffer det faglige problemet og gir et bedre beslutningsgrunnlag.";
      solutionMode = "qualified";
    }
  }

  return {
    ...task,
    required_knowledge_tags: profile.requiredKnowledgeTags,
    required_contact_types: profile.requiredContactTypes,
    history_go_context_id: profile.contextId,
    knowledge_state: profile.knowledgeState,
    knowledge_scores: profile.knowledgeScores,
    has_contact_support: profile.hasContactSupport,
    knowledge_source: profile.source,
    matched_knowledge_ref_ids: profile.matchedRefIds,
    unresolved_knowledge_ref_ids: profile.unresolvedRefIds,
    knowledge_choice_policy: profile.choicePolicy,
    knowledge_authority_effect: profile.authorityEffect,
    knowledge_eligibility_effect: profile.eligibilityEffect,
    knowledge_contract: mailEvent?.knowledge_contract || task?.knowledge_contract || null,
    knowledge_refs_resolved: mailEvent?.knowledge_refs_resolved || task?.knowledge_refs_resolved || [],
    solution_mode: solutionMode,
    locked_choices: lockedChoices,
    unlocked_choices: unlockedChoices,
    knowledge_note: knowledgeNote
  };
}

function applyKnowledgeGateToMailEvent(mailEvent, task) {
  const solutionMode = String(task?.solution_mode || "fallback");
  const choices = Array.isArray(mailEvent?.choices)
    ? mailEvent.choices.map((c) => ({ ...c }))
    : [];

  if (!choices.length) return mailEvent;

  let visibleChoices = choices;

  const advisory = String(task?.knowledge_choice_policy || "") === "advisory";
  if (advisory) {
    visibleChoices = choices;
  } else if (solutionMode === "fallback") {
    visibleChoices = choices.filter((c) => {
      const id = String(c?.id || "");
      return id !== "A";
    });
  } else if (solutionMode === "assisted") {
    visibleChoices = choices.filter((c) => {
      const id = String(c?.id || "");
      return id !== "A" || /hjelp|råd|kontakt/i.test(String(c?.label || ""));
    });
  } else if (solutionMode === "qualified") {
    visibleChoices = choices;
  }

  const knowledgeLine =
    solutionMode === "qualified"
      ? "Du forstår oppgaven på riktig nivå og ser de beste løsningsmulighetene."
      : solutionMode === "assisted"
        ? "Du ser deler av løsningen, men er fortsatt delvis avhengig av støtte eller enklere vurderinger."
        : "Du mangler nok innsikt til å se den beste løsningen direkte.";

  return {
    ...mailEvent,
    choices: visibleChoices,
    knowledge_state: String(task?.knowledge_state || "missing"),
    solution_mode: solutionMode,
    knowledge_source: String(task?.knowledge_source || ""),
    knowledge_choice_policy: String(task?.knowledge_choice_policy || ""),
    matched_knowledge_ref_ids: Array.isArray(task?.matched_knowledge_ref_ids) ? task.matched_knowledge_ref_ids : [],
    knowledge_contract: task?.knowledge_contract || mailEvent?.knowledge_contract || null,
    knowledge_refs_resolved: Array.isArray(task?.knowledge_refs_resolved) ? task.knowledge_refs_resolved : (mailEvent?.knowledge_refs_resolved || []),
    knowledge_note: String(task?.knowledge_note || knowledgeLine),
    situation: (Array.isArray(mailEvent?.situation) ? mailEvent.situation : []).concat([
      knowledgeLine
    ])
  };
}

function buildKnowledgeTaskHtml(task) {
  if (!task) return "";

  const knowledgeState = String(task?.knowledge_state || "");
  const knowledgeNote = String(task?.knowledge_note || "").trim();
  const solutionMode = String(task?.solution_mode || "");

  if (!knowledgeState && !knowledgeNote) return "";

  const label =
    knowledgeState === "qualified"
      ? "Kunnskapsnivå: Kvalifisert"
      : knowledgeState === "assisted"
        ? "Kunnskapsnivå: Delvis støtte"
        : "Kunnskapsnivå: Mangler innsikt";

  return `
    <div class="civi-knowledge-report" style="margin-bottom:12px;padding:12px;border:1px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.04);">
      <div style="font-weight:700;margin-bottom:8px;">Oppgaveforståelse</div>
      <div style="font-size:0.95rem;line-height:1.4;">${label}</div>
      ${solutionMode ? `<div style="font-size:0.9rem;opacity:0.9;margin-top:4px;">Løsningsnivå: ${solutionMode}</div>` : ""}
      ${knowledgeNote ? `<div style="margin-top:8px;font-size:0.95rem;line-height:1.45;">${knowledgeNote}</div>` : ""}
    </div>
  `;
}
