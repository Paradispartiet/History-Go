(function () {

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

function clearPendingEventById(engine, eventId) {
  if (!engine || !eventId) return false;

  const inbox = engine.getInbox ? engine.getInbox() : [];
  if (!Array.isArray(inbox) || !inbox.length) return false;

  const nextInbox = inbox.filter((item) => {
    return String(item?.event?.id || "") !== String(eventId);
  });

  if (nextInbox.length === inbox.length) return false;

  engine.setInbox?.(nextInbox);
  return true;
}

function rerenderCivicationUiNow() {
  try {
    window.renderCivicationInbox?.();
    window.renderWorkdayPanel?.();
  } catch {}

  try {
    window.CivicationUI?.renderCivicationInbox?.();
    window.CivicationUI?.renderWorkdayPanel?.();
  } catch {}
}

function isOnboardingEvent(eventObj) {
  return String(eventObj?.mail_class || "").trim() === "onboarding";
}

function isOnboardingComplete(active) {
  const onboarding = window.CivicationState?.getOnboardingState?.(active);
  return !!onboarding?.complete;
}

function updateOnboardingFromEvent(active, eventObj) {
  const tag = String(eventObj?.onboarding_tag || "").trim();
  if (!active || !tag) return null;

  if (tag === "first_job_intro") {
    return window.CivicationState?.setOnboardingState?.(active, {
      intro_done: true
    });
  }

  if (tag === "first_job_day") {
    return window.CivicationState?.setOnboardingState?.(active, {
      first_day_done: true,
      complete: true
    });
  }

  return null;
}

async function advancePlanProgressFromEvent(active, eventObj) {
  if (!active || String(eventObj?.source_type || "").trim() !== "planned") {
    return null;
  }

  const planPath = window.CiviMailPlanBridge?.getPlanPath?.(active);
  if (!planPath) return null;

  const plan = await window.CiviMailPlanBridge?.loadJson?.(planPath);
  if (!plan) return null;

  return window.CiviMailPlanBridge?.advancePlanProgress?.(plan) || null;
}

function getTaskCapitalPlan(phaseTag, pendingEvent, choice, result) {
  const tags = Array.isArray(choice?.tags) ? choice.tags.map(String) : [];
  const careerId =
    String(
      pendingEvent?.career_id ||
      window.CivicationState?.getActivePosition?.()?.career_id ||
      ""
    ).trim();

  const taskKind = String(
    pendingEvent?.task_kind ||
    pendingEvent?.phase_tag ||
    ""
  ).trim();

  const plan = [];

  function push(type, amount) {
    if (!type) return;
    const n = Number(amount || 0);
    if (!Number.isFinite(n) || n === 0) return;
    plan.push({ type, amount: n });
  }

  if (phaseTag === "afternoon" || pendingEvent?.task_id || taskKind === "work_case") {
    push("institutional", 0.15);
    push("economic", 0.08);
  }

  if (taskKind === "brand_knowledge") {
    push("economic", 0.10);
    push("symbolic", 0.04);
  }

  if (taskKind === "catalog_knowledge") {
    push("cultural", 0.12);
    push("institutional", 0.05);
  }

  if (taskKind === "place_knowledge") {
    push("symbolic", 0.10);
    push("institutional", 0.05);
  }

  if (tags.includes("craft")) {
    push("cultural", 0.12);
    push("institutional", 0.08);
  }

  if (tags.includes("process")) {
    push("institutional", 0.12);
    push("economic", 0.04);
  }

  if (tags.includes("legitimacy")) {
    push("institutional", 0.10);
    push("political", 0.05);
  }

  if (tags.includes("visibility")) {
    push("symbolic", 0.10);
    push("social", 0.05);
  }

  if (tags.includes("community")) {
    push("social", 0.10);
  }

  if (tags.includes("status")) {
    push("symbolic", 0.08);
    push("economic", 0.04);
  }

  if (tags.includes("risk")) {
    push("economic", 0.06);
    push("symbolic", 0.04);
  }

  if (tags.includes("shortcut") || tags.includes("opportunism")) {
    push("economic", 0.03);
  }

  if (tags.includes("avoidance")) {
    push("social", -0.02);
    push("institutional", -0.02);
  }

  if (careerId === "naeringsliv") {
    push("economic", 0.05);
    push("institutional", 0.03);
  }

  if (careerId === "politikk") {
    push("political", 0.06);
    push("institutional", 0.03);
  }

  if (careerId === "media") {
    push("symbolic", 0.06);
    push("political", 0.02);
  }

  if (careerId === "kunst" || careerId === "litteratur") {
    push("cultural", 0.05);
    push("symbolic", 0.03);
  }

  if (careerId === "subkultur") {
    push("subculture", 0.06);
    push("symbolic", 0.03);
  }

  return plan;
}

function mergeCapitalPlan(plan) {
  const merged = {};

  (Array.isArray(plan) ? plan : []).forEach((row) => {
    const type = String(row?.type || "").trim();
    const amount = Number(row?.amount || 0);
    if (!type || !Number.isFinite(amount) || amount === 0) return;
    merged[type] = Number(merged[type] || 0) + amount;
  });

  return merged;
}

function applyTaskCapitalFromChoice(phaseTag, pendingEvent, choice, result) {
  if (!pendingEvent || !choice) return null;

  const plan = getTaskCapitalPlan(phaseTag, pendingEvent, choice, result);
  const merged = mergeCapitalPlan(plan);
  const entries = Object.entries(merged);

  if (!entries.length) return null;

  const applied = entries.map(([type, amount]) => {
    return window.HG_CapitalMaintenance?.maintain?.(type, amount, {
      source: `task_${phaseTag || "work"}`,
      useIdentityBoost: true
    });
  });

  window.dispatchEvent(new Event("updateProfile"));

  return {
    phaseTag,
    appliedTypes: entries.map(([type]) => type),
    totals: merged,
    applied
  };
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

    const onboarding = window.CivicationState?.getOnboardingState?.(active);
    if (onboarding && onboarding.complete !== true) {
      return { enqueued: false, reason: "onboarding_incomplete" };
    }

    const phase = window.CivicationCalendar?.getPhase?.() || "morning";
    const state = this.getState ? this.getState() : {};

if (phase === "morning") {
  const carryover = getNextDayCarryover();
  applyMorningCarryoverEffects(carryover);
  const morningMode = getMorningModeFromCarryover(carryover);

  const roleKey =
    typeof this.resolveRoleKey === "function"
      ? this.resolveRoleKey()
      : null;

  const pool =
    typeof this.buildMailPool === "function"
      ? await this.buildMailPool(active, state, roleKey)
      : null;

  const selected =
    pool && typeof this.pickEventFromPack === "function"
      ? this.pickEventFromPack(pool, state)
      : null;

  const evBase =
    selected || this.makeGenericCareerEvent?.(active, state, "fallback_no_mail");

  if (evBase) {
    const evPrepared =
      typeof this.decorateWorkMail === "function"
        ? this.decorateWorkMail(evBase, active, "day_phase_morning")
        : evBase;

    this.enqueueEvent?.(evPrepared);

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

              return { enqueued: true, type: "morning", event: inbox[idx].event };
            }
          }

          setNextDayCarryover({
            visibilityBias: 0,
            processBias: 0,
            fatigue: 0
          });

          return { enqueued: true, type: "morning", event: tagged.event };
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

    proto.answer = async function (eventId, choiceId) {
      const pending = this.getPendingEvent ? this.getPendingEvent() : null;
      const pendingEventId = String(pending?.event?.id || eventId || "").trim();
      const active = window.CivicationState?.getActivePosition?.();
      const onboardingEvent = pending?.event && isOnboardingEvent(pending.event);

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
        ? await legacyAnswer.call(this, eventId, choiceId)
        : { ok: false };

      if (originalFollowup) {
        this.enqueueImmediateFollowupEvent = originalFollowup;
      }

      if (!result?.ok) return result;

      if (onboardingEvent) {
        updateOnboardingFromEvent(active, pending.event);
        clearPendingEventById(this, pendingEventId);

        try {
          const onboarding = window.CivicationState?.getOnboardingState?.(active);
          if (onboarding?.complete === true) {
            await this.onAppOpen?.({ force: true });
          }
        } catch {}

        rerenderCivicationUiNow();
        window.dispatchEvent(new Event("updateProfile"));
        return result;
      }

      if (!phaseTag) return result;

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
applyTaskCapitalFromChoice(phaseTag, pending?.event, choice, result);

      try {
        await advancePlanProgressFromEvent(active, pending?.event);
      } catch {}

window.CivicationTaskEngine?.completeByMail?.(
  pending?.event?.id,
  {
    choiceId,
    effect: Number(result?.effect || 0),
    feedback: String(result?.feedback || ""),
    capitalApplied: true
  }
);

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

      clearPendingEventById(this, pendingEventId);

      try {
        clearPendingEventById(this, pendingEventId);
        await this.onAppOpen?.({ force: true });
      } catch {}

      rerenderCivicationUiNow();
      window.dispatchEvent(new Event("updateProfile"));

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
     window.CAPITAL_ENGINE?.syncRuntimeCapitalToStorage?.();
     window.dispatchEvent(new Event("updateProfile"));
    }
      return res;
    };
  }

  function patchUI() {
  if (window.__civiDayPhaseUiPatched) return;

  const legacyRenderWorkdayPanel =
    typeof window.renderWorkdayPanel === "function"
      ? window.renderWorkdayPanel
      : window.CivicationUI?.renderWorkdayPanel;

  if (typeof legacyRenderWorkdayPanel !== "function") return;

  window.__civiDayPhaseUiPatched = true;

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
    legacyRenderWorkdayPanel.call(window.CivicationUI || window);

    const host = document.getElementById("civiWorkdayPanel");
    if (!host) return;

    const model = window.CivicationCalendar?.getPhaseModel?.();
    if (!model) return;

    host.querySelector(".civi-dayphase-hud")?.remove();
    host.querySelector(".civi-weekly-report")?.remove();
    host.querySelector(".civi-contacts-report")?.remove();
    host.querySelector(".civi-knowledge-report")?.remove();

    const weeklyHtml = buildWeeklyReportHtml();
    const contactsHtml = buildContactsHtml();

    const activeTasks =
      window.CivicationTaskEngine?.listOpenTasksForCurrentPhase?.() || [];
    const firstTask =
      Array.isArray(activeTasks) && activeTasks.length ? activeTasks[0] : null;
    const knowledgeHtml = buildKnowledgeTaskHtml(firstTask);

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
