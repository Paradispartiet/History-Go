
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

  return {
    requiredKnowledgeTags,
    requiredContactTypes,
    contextId,
    knowledgeScores,
    hasContactSupport,
    knowledgeState
  };
}

function applyKnowledgeGateToTask(task, mailEvent, active) {
  const profile = buildKnowledgeProfileForTask(mailEvent, active, task);

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

  return {
    ...task,
    required_knowledge_tags: profile.requiredKnowledgeTags,
    required_contact_types: profile.requiredContactTypes,
    history_go_context_id: profile.contextId,
    knowledge_state: profile.knowledgeState,
    knowledge_scores: profile.knowledgeScores,
    has_contact_support: profile.hasContactSupport,
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

  if (solutionMode === "fallback") {
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
