
  function getVisitedPlacesCount() {
  try {
    const raw = JSON.parse(localStorage.getItem("visited_places") || "[]");
    if (Array.isArray(raw)) return raw.length;

    if (raw && typeof raw === "object") {
      return Object.keys(raw).filter((k) => !!raw[k]).length;
    }

    return 0;
  } catch {
    return 0;
  }
}



  function retagPendingEvent(engine, phaseTag) {
    const inbox = engine.getInbox ? engine.getInbox() : [];
    const idx = Array.isArray(inbox)
      ? inbox.findIndex((x) => x && x.status === "pending" && x.event)
      : -1;

    if (idx < 0) return null;

    inbox[idx] = {
      ...inbox[idx],
      event: {
        ...(inbox[idx].event || {}),
        phase_tag: phaseTag
      }
    };

    if (engine.setInbox) engine.setInbox(inbox);
    return inbox[idx];
  }



  






const CIVI_CONTACTS_KEY = "hg_civi_contacts_v1";

function getCiviContacts() {
  try {
    const raw = JSON.parse(localStorage.getItem(CIVI_CONTACTS_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveCiviContacts(contacts) {
  const safe = Array.isArray(contacts) ? contacts : [];
  localStorage.setItem(CIVI_CONTACTS_KEY, JSON.stringify(safe));
  return safe;
}

function addCiviContact(contact) {
  const contacts = getCiviContacts();

  const safeContact = {
    id: String(contact?.id || `contact_${Date.now()}`),
    type: String(contact?.type || "generic"),
    name: String(contact?.name || "Kontakt"),
    sourcePhase: String(contact?.sourcePhase || ""),
    sourceContextId: contact?.sourceContextId ? String(contact.sourceContextId) : null,
    sourceContextLabel: contact?.sourceContextLabel ? String(contact.sourceContextLabel) : null,
    careerId: String(contact?.careerId || ""),
    strength: Number(contact?.strength || 1),
    createdAt: String(contact?.createdAt || new Date().toISOString())
  };

  const existingIdx = contacts.findIndex(
    (c) =>
      String(c?.type || "") === safeContact.type &&
      String(c?.sourceContextId || "") === String(safeContact.sourceContextId || "") &&
      String(c?.careerId || "") === safeContact.careerId
  );

  let next;
  if (existingIdx >= 0) {
    next = contacts.map((c, i) =>
      i === existingIdx
        ? {
            ...c,
            strength: Number(c?.strength || 1) + 1
          }
        : c
    );
  } else {
    next = contacts.concat([safeContact]);
  }

  return saveCiviContacts(next);
}


function maybeCreateContactFromChoice(phaseTag, pendingEvent, choice, result) {
  const activeCareerId =
    window.CivicationState?.getActivePosition?.()?.career_id || "";

  const effect = Number(result?.effect || 0);
  const choiceId = String(choice?.id || "");
  const tags = Array.isArray(choice?.tags) ? choice.tags : [];

  const lunchContext = pendingEvent?.lunch_context || null;
  const eveningContext = pendingEvent?.evening_context || null;
  const ctx = phaseTag === "lunch" ? lunchContext : eveningContext;

  if (phaseTag === "lunch" && choiceId === "B") {
    addCiviContact({
      type: "miljo",
      name: "Lunsjkontakt",
      sourcePhase: "lunch",
      sourceContextId: ctx?.history_go_context_id || ctx?.store_id || null,
      sourceContextLabel:
        ctx?.history_go_context_label || ctx?.store_name || "Lunsjmiljø",
      careerId: activeCareerId,
      strength: 1
    });
    return true;
  }

  if (phaseTag === "evening" && choiceId === "C") {
    addCiviContact({
      type: "nettverk",
      name: "Kveldskontakt",
      sourcePhase: "evening",
      sourceContextId: ctx?.history_go_context_id || ctx?.store_id || null,
      sourceContextLabel:
        ctx?.history_go_context_label || ctx?.store_name || "Kveldsmiljø",
      careerId: activeCareerId,
      strength: 1
    });
    return true;
  }

  if (phaseTag === "afternoon" && effect > 0) {
    addCiviContact({
      type: "kollega",
      name: "Arbeidskontakt",
      sourcePhase: "afternoon",
      sourceContextId: activeCareerId || null,
      sourceContextLabel: activeCareerId || "Arbeidsmiljø",
      careerId: activeCareerId,
      strength: 1
    });
    return true;
  }

  if ((phaseTag === "lunch" || phaseTag === "evening") && tags.includes("visibility")) {
    addCiviContact({
      type: "synlighet",
      name: "Synlig kontakt",
      sourcePhase: phaseTag,
      sourceContextId: ctx?.history_go_context_id || ctx?.store_id || null,
      sourceContextLabel:
        ctx?.history_go_context_label || ctx?.store_name || "Synlig miljø",
      careerId: activeCareerId,
      strength: 1
    });
    return true;
  }

  return false;
}

function buildContactsHtml() {
  const contacts = getCiviContacts();
  if (!Array.isArray(contacts) || !contacts.length) return "";

  const sorted = contacts
    .slice()
    .sort((a, b) => Number(b?.strength || 0) - Number(a?.strength || 0))
    .slice(0, 5);

  return `
    <div class="civi-contacts-report" style="margin-bottom:12px;padding:12px;border:1px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.04);">
      <div style="font-weight:700;margin-bottom:8px;">Kontakter</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${sorted
          .map((c) => {
            const type = String(c?.type || "kontakt");
            const name = String(c?.name || "Kontakt");
            const label = String(c?.sourceContextLabel || "Ukjent miljø");
            const strength = Number(c?.strength || 1);

            return `
              <div style="padding:8px 10px;border:1px solid rgba(255,255,255,0.08);border-radius:10px;background:rgba(255,255,255,0.03);">
                <div style="font-weight:600;">${name}</div>
                <div style="font-size:0.9rem;opacity:0.9;">Type: ${type} · Miljø: ${label}</div>
                <div style="font-size:0.88rem;opacity:0.8;">Styrke: ${strength}</div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function applyContactBonusToEvent(eventObj, phaseTag) {
  const contacts = getCiviContacts();
  if (!Array.isArray(contacts) || !contacts.length) return eventObj;

  const ctx =
    phaseTag === "lunch"
      ? eventObj?.lunch_context || null
      : phaseTag === "evening"
        ? eventObj?.evening_context || null
        : null;

  if (!ctx) return eventObj;

  const contextId = String(ctx?.history_go_context_id || ctx?.store_id || "");
  if (!contextId) return eventObj;

  const matching = contacts.filter((c) => {
    const sourceId = String(c?.sourceContextId || "");
    return sourceId && sourceId === contextId;
  });

  if (!matching.length) return eventObj;

  const strongest = matching
    .slice()
    .sort((a, b) => Number(b?.strength || 0) - Number(a?.strength || 0))[0];

  const type = String(strongest?.type || "generic");
  const strength = Number(strongest?.strength || 1);

  const ev = {
    ...eventObj,
    choices: Array.isArray(eventObj?.choices)
      ? eventObj.choices.map((c) => ({ ...c }))
      : [],
    situation: Array.isArray(eventObj?.situation)
      ? eventObj.situation.slice()
      : []
  };

  let boostedChoiceId = null;

  if (phaseTag === "lunch") {
    if (type === "miljo" || type === "synlighet") {
      boostedChoiceId = "B";
    } else if (type === "kollega") {
      boostedChoiceId = "A";
    }
  }

  if (phaseTag === "evening") {
    if (type === "nettverk" || type === "synlighet") {
      boostedChoiceId = "C";
    } else if (type === "kollega") {
      boostedChoiceId = "A";
    }
  }

  if (!boostedChoiceId) return ev;

  ev.choices = ev.choices.map((c) => {
    if (String(c?.id || "") === boostedChoiceId) {
      return {
        ...c,
        effect: Number(c.effect || 0) + 1
      };
    }
    return c;
  });

  ev.situation.push(
    `En kontakt i dette miljøet gir deg litt ekstra handlingsrom akkurat her.`
  );

  ev.contact_bonus = {
    contactType: type,
    sourceContextId: contextId,
    strength,
    boostedChoiceId
  };

  return ev;
}
  
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

  
function patchEventEngine() {
  const proto = window.CivicationEventEngine?.prototype;
  if (!proto || proto.__dayPhasePatched) return;
  proto.__dayPhasePatched = true;

  const legacyOnAppOpen = proto.onAppOpen;
  const legacyAnswer = proto.answer;

  proto.onAppOpen = async function (opts = {}) {
    const active = window.CivicationState?.getActivePosition?.();

    if (!active) {
      return legacyOnAppOpen
        ? legacyOnAppOpen.call(this, opts)
        : { enqueued: false, reason: "no_active_job" };
    }

    const pending = this.getPendingEvent ? this.getPendingEvent() : null;
    if (pending?.event) {
      return { enqueued: false, reason: "pending_exists" };
    }

    const phase = window.CivicationCalendar?.getPhase?.() || "morning";
    const state = this.getState ? this.getState() : {};

    if (phase === "morning") {
      const carryover = getNextDayCarryover();
      applyMorningCarryoverEffects(carryover);
      const morningMode = getMorningModeFromCarryover(carryover);

      if (legacyOnAppOpen) {
        const res = await legacyOnAppOpen.call(this, { ...opts, force: true });
        const tagged = retagPendingEvent(this, "morning");

        if (tagged?.event) {
          const ev = applyMorningModeToEvent(tagged.event, morningMode);
          const extraLines = [];

      let adjustedChoices = Array.isArray(ev.choices)
      ? ev.choices.map((c) => ({ ...c }))
      : [];


          
let effectNotes = [];

if (carryover.visibilityBias > carryover.processBias && adjustedChoices.length) {
  adjustedChoices = adjustedChoices.map((c) => {
    if (c.id === "A") {
      return {
        ...c,
        effect: Number(c.effect || 0) + 1
      };
    }
    return c;
  });

  effectNotes.push("Synlighet fra gårsdagen gjør det lettere å vinne på et offensivt valg.");
}

if (carryover.processBias >= carryover.visibilityBias && carryover.processBias > 0 && adjustedChoices.length) {
  adjustedChoices = adjustedChoices.map((c) => {
    if (c.id === "B") {
      return {
        ...c,
        effect: Number(c.effect || 0) + 1
      };
    }
    return c;
  });

  effectNotes.push("Den ryddige rytmen fra gårsdagen styrker det kontrollerte valget.");
}

if (carryover.fatigue > 1 && adjustedChoices.length) {
  adjustedChoices = adjustedChoices.map((c) => {
    if (c.id === "C") {
      return {
        ...c,
        effect: Number(c.effect || 0) + 1
      };
    }
    return c;
  });

  effectNotes.push("Slitasje gjør det mer fristende å velge den minst krevende veien.");
}
          
if (carryover.visibilityBias > carryover.processBias && adjustedChoices.length) {
  adjustedChoices = adjustedChoices.map((c) => {
    if (c.id === "A") {
      return {
        ...c,
        label: String(c.label || "").replace("Lag en ryddig plan og dokumenter", "Ta styring og vær synlig tidlig")
      };
    }
    return c;
  });

  extraLines.push("Det ligger et lite sosialt og synlighetsmessig trykk i starten av dagen.");
}

if (carryover.processBias >= carryover.visibilityBias && carryover.processBias > 0 && adjustedChoices.length) {
  adjustedChoices = adjustedChoices.map((c) => {
    if (c.id === "B") {
      return {
        ...c,
        label: String(c.label || "").replace("Løs det raskt og send videre", "Løs det nøkternt og med kontroll")
      };
    }
    return c;
  });

  extraLines.push("Morgenen drar mer mot struktur, kontroll og presisjon.");
}

if (carryover.fatigue > 1 && adjustedChoices.length) {
  adjustedChoices = adjustedChoices.map((c) => {
    if (c.id === "C") {
      return {
        ...c,
        label: String(c.label || "").replace("La det ligge litt", "Trekk pusten og utsett litt")
      };
    }
    return c;
  });

  extraLines.push("Du merker at slit og treghet prøver å farge det første valget ditt.");
}

          if (carryover.fatigue > 1) {
            extraLines.push("Du kjenner litt slitasje fra gårsdagen idet morgenen starter.");
          } else if (carryover.visibilityBias > carryover.processBias) {
            extraLines.push("Morgenen føles litt mer sosial og eksponert enn vanlig.");
          } else if (carryover.processBias > 0) {
            extraLines.push("Morgenen har en mer ryddig og kontrollert tone enn vanlig.");
          }

          if (extraLines.length) {
            const inbox = this.getInbox ? this.getInbox() : [];
            const idx = Array.isArray(inbox)
              ? inbox.findIndex((x) => x && x.status === "pending" && x.event?.id === ev.id)
              : -1;

            if (idx >= 0) {
              inbox[idx] = {
                ...inbox[idx],
                event: {
                  ...ev,
                  phase_tag: "morning",
                  morning_mode: morningMode,
                  choices: adjustedChoices.length ? adjustedChoices : ev.choices,
                  situation: (Array.isArray(ev.situation) ? ev.situation : []).concat(extraLines, effectNotes),
                  carryover_context: carryover
               }
              };

              this.setInbox?.(inbox);

              setNextDayCarryover({
                visibilityBias: 0,
                processBias: 0,
                fatigue: 0
              });

              return { ...(res || {}), event: inbox[idx].event };
            }
          }

          setNextDayCarryover({
            visibilityBias: 0,
            processBias: 0,
            fatigue: 0
          });

          return { ...(res || {}), event: tagged.event };
        }
      }

      return { enqueued: false, reason: "morning_no_event" };
    }

    if (phase === "lunch") {
     const ev = await makeLunchEvent(active);
     this.enqueueEvent(ev);
     return { enqueued: true, type: "lunch", event: ev };
    }


    if (phase === "afternoon") {
      const base = this.makeGenericCareerEvent
        ? this.makeGenericCareerEvent(active, state, "day_phase_afternoon")
        : {
            id: `phase_afternoon_${Date.now()}`,
            stage: "stable",
            source: "Civication",
            subject: "Ettermiddagsleveranse",
            situation: ["Ettermiddagen krever en konkret leveranse."],
            choices: []
          };

      const ev = this.decorateWorkMail
        ? this.decorateWorkMail(
            {
              ...base,
              phase_tag: "afternoon",
              subject: "Ettermiddagsleveranse",
              situation: [
                "Ettermiddagen handler om å få noe faktisk levert.",
                "Hvordan du løser dette former inntrykket av deg."
              ],
              task_kind: "work_case"
            },
            active,
            "day_phase_afternoon"
          )
        : { ...base, phase_tag: "afternoon" };

      this.enqueueEvent(ev);
      return { enqueued: true, type: "job", event: ev };
    }

    if (phase === "evening") {
     const ev = await makeEveningEvent(active);
     this.enqueueEvent(ev);
     return { enqueued: true, type: "evening", event: ev };
    }

    if (phase === "day_end") {
      const ev = makeDayEndEvent();
      this.enqueueEvent(ev);
      return { enqueued: true, type: "day_end", event: ev };
    }

    return { enqueued: false, reason: "unknown_phase" };
  };

    proto.answer = function (eventId, choiceId) {
      const pending = this.getPendingEvent ? this.getPendingEvent() : null;
      const inferredPhaseTag =
        pending?.event?.phase_tag ||
        (window.CivicationCalendar?.getPhase?.() === "morning" ? "morning" : null);

      const phaseTag = inferredPhaseTag;

      let originalFollowup = null;
      if (phaseTag && typeof this.enqueueImmediateFollowupEvent === "function") {
        originalFollowup = this.enqueueImmediateFollowupEvent;
        this.enqueueImmediateFollowupEvent = function () {
          return Promise.resolve({
            enqueued: false,
            reason: "day_phase_blocked"
          });
        };
      }

      const result = legacyAnswer
        ? legacyAnswer.call(this, eventId, choiceId)
        : { ok: false };

      if (originalFollowup) {
        this.enqueueImmediateFollowupEvent = originalFollowup;
      }

      if (!result?.ok || !phaseTag) return result;

      const choice =
       Array.isArray(pending?.event?.choices)
        ? pending.event.choices.find((c) => c && c.id === choiceId)
        : null;

      appendDayChoiceLog({
       phase: phaseTag,
       subject: String(pending?.event?.subject || ""),
       choiceId,
       label: choice?.label || (phaseTag === "day_end" ? "Bekreftet dagslutt" : ""),
       feedback: String(result?.feedback || ""),
       effect: Number(result?.effect || 0)
      });

      applyPhaseChoiceEffects(phaseTag, choiceId, choice);
      maybeCreateContactFromChoice(phaseTag, pending?.event, choice, result);

      const cal = window.CivicationCalendar;
      if (!cal) return result;

      if (phaseTag === "morning") {
        cal.markDailyFlag?.("morning_done", true);
        cal.setPhase?.("lunch");
      } else if (phaseTag === "lunch") {
        cal.markDailyFlag?.("lunch_done", true);
        cal.setPhase?.("afternoon");
      } else if (phaseTag === "afternoon") {
        cal.markDailyFlag?.("afternoon_done", true);
        cal.setPhase?.("evening");
      } else if (phaseTag === "evening") {
        cal.markDailyFlag?.("evening_done", true);
        cal.setPhase?.("day_end");
     } else if (phaseTag === "day_end") {
       const summary = cal.getDailySummary?.();
       if (summary) {
        saveDailySummaryToWeek(summary);

        const activeCareerId =
        window.CivicationState?.getActivePosition?.()?.career_id || "";

        finalizeWeekIfNeeded(activeCareerId);
       }
       cal.resetForNewDay?.();
     }

      setTimeout(() => {
        try {
          window.HG_CiviEngine?.onAppOpen?.({ force: true });
          window.dispatchEvent(new Event("updateProfile"));
        } catch {}
      }, 0);

      return result;
    };
  }

function patchTaskEngine() {
  const engine = window.CivicationTaskEngine;
  if (!engine || engine.__dayPhasePatched) return;
  engine.__dayPhasePatched = true;

  const originalCreateTaskForMail = engine.createTaskForMail;

  if (typeof originalCreateTaskForMail === "function") {
    engine.createTaskForMail = function (mailEvent, active, options) {
      const task = originalCreateTaskForMail.call(engine, mailEvent, active, options);
      if (!task) return task;

      const phaseModel = window.CivicationCalendar?.getPhaseModel?.() || {};

      const gatedTask = applyKnowledgeGateToTask(task, mailEvent, active);

      const updated = {
        ...gatedTask,
        dayIndex: Number(phaseModel.dayIndex || 1),
        phase: String(mailEvent?.phase_tag || phaseModel.phase || "morning"),
        phase_required: true
      };

      const gatedMailEvent = applyKnowledgeGateToMailEvent(mailEvent, updated);

      const store = engine.getStore ? engine.getStore() : null;
      if (store?.byId?.[updated.id]) {
        store.byId[updated.id] = {
          ...updated,
          gated_mail_event: gatedMailEvent
        };
        engine.setStore?.(store);
      }

      return {
        ...updated,
        gated_mail_event: gatedMailEvent
      };
    };
  }

  engine.listOpenTasksForCurrentPhase = function () {
    const store = engine.getStore ? engine.getStore() : { byId: {}, order: [] };
    const order = Array.isArray(store.order) ? store.order : [];
    const phaseModel = window.CivicationCalendar?.getPhaseModel?.() || {};

    return order
      .map((id) => store.byId?.[id] || null)
      .filter(
        (task) =>
          task &&
          task.status === "open" &&
          Number(task.dayIndex || 1) === Number(phaseModel.dayIndex || 1) &&
          String(task.phase || "") === String(phaseModel.phase || "")
      );
  };
}

  function patchJobs() {
    const jobs = window.CivicationJobs;
    if (!jobs || jobs.__dayPhasePatched) return;
    jobs.__dayPhasePatched = true;

    const originalAcceptOffer = jobs.acceptOffer;
    if (typeof originalAcceptOffer !== "function") return;

    jobs.acceptOffer = function (offerKey) {
      const res = originalAcceptOffer.call(jobs, offerKey);

      if (res?.ok) {
        window.CivicationCalendar?.setPhase?.("morning");
        window.CivicationCalendar?.setDailySummary?.(null);
      }

      return res;
    };
  }

  function patchUI() {
    if (window.__civiDayPhaseUiPatched) return;
    if (typeof window.renderWorkdayPanel !== "function") return;
    window.__civiDayPhaseUiPatched = true;

    const legacyRenderWorkdayPanel = window.renderWorkdayPanel;

    function buildPhaseHud(model) {
      const flags = model.dailyFlags || {};
      const phaseOrder = [
        { id: "morning", label: "Morgen", doneKey: "morning_done" },
        { id: "lunch", label: "Lunsj", doneKey: "lunch_done" },
        { id: "afternoon", label: "Ettermiddag", doneKey: "afternoon_done" },
        { id: "evening", label: "Kveld", doneKey: "evening_done" },
        { id: "day_end", label: "Dagslutt", doneKey: null }
      ];

      return `
        <div class="civi-dayphase-hud" style="margin-bottom:12px;padding:12px;border:1px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.04);">
          <div style="font-weight:700;margin-bottom:8px;">Dag ${model.dayIndex} · ${model.phaseLabel}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${phaseOrder
              .map((item) => {
                const isActive = item.id === model.phase;
                const isDone = item.doneKey ? !!flags[item.doneKey] : false;
                const badge = isDone ? "✅" : isActive ? "🔵" : "⬜";
                return `<span style="padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.12);">${badge} ${item.label}</span>`;
              })
              .join("")}
          </div>
        </div>
      `;
    }

window.renderWorkdayPanel = function () {
  legacyRenderWorkdayPanel();

  const host = document.getElementById("civiWorkdayPanel");
  if (!host) return;

  const model = window.CivicationCalendar?.getPhaseModel?.();
  if (!model) return;

  const existingHud = host.querySelector(".civi-dayphase-hud");
  if (existingHud) existingHud.remove();

  const existingWeekly = host.querySelector(".civi-weekly-report");
  if (existingWeekly) existingWeekly.remove();

  const existingContacts = host.querySelector(".civi-contacts-report");
  if (existingContacts) existingContacts.remove();

  const weeklyHtml = buildWeeklyReportHtml();
  const contactsHtml = buildContactsHtml();

  const activeTasks =
   window.CivicationTaskEngine?.listOpenTasksForCurrentPhase?.() || [];
  const firstTask = Array.isArray(activeTasks) && activeTasks.length ? activeTasks[0] : null;
  const knowledgeHtml = buildKnowledgeTaskHtml(firstTask);

  const existingKnowledge = host.querySelector(".civi-knowledge-report");
   if (existingKnowledge) existingKnowledge.remove();

host.insertAdjacentHTML(
  "afterbegin",
  `${knowledgeHtml}${contactsHtml}${weeklyHtml}${buildPhaseHud(model)}`
);
};
    if (window.CivicationUI) {
      window.CivicationUI.renderWorkdayPanel = window.renderWorkdayPanel;
    }
  }

  function initPatches() {
    patchCalendar();
    patchEventEngine();
    patchTaskEngine();
    patchJobs();
    patchUI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPatches);
  } else {
    initPatches();
  }
})();
