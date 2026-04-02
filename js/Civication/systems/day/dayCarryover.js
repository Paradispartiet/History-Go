
function getDayChoiceLog() {
  const cal = window.CivicationCalendar;
  const model = cal?.getPhaseModel?.() || {};
  const summary = model.dailySummary && typeof model.dailySummary === "object"
    ? model.dailySummary
    : {};

  return Array.isArray(summary.choiceLog) ? summary.choiceLog : [];
}

function appendDayChoiceLog(entry) {
  const cal = window.CivicationCalendar;
  const model = cal?.getPhaseModel?.() || {};
  const currentSummary =
    model.dailySummary && typeof model.dailySummary === "object"
      ? model.dailySummary
      : {};

  const currentLog = Array.isArray(currentSummary.choiceLog)
    ? currentSummary.choiceLog
    : [];

const nextLog = currentLog.concat([
  {
    phase: String(entry?.phase || ""),
    subject: String(entry?.subject || ""),
    choiceId: entry?.choiceId ?? null,
    label: String(entry?.label || ""),
    feedback: String(entry?.feedback || ""),
    effect: Number(entry?.effect || 0)
  }
]);

  cal?.setDailySummary?.({
    ...currentSummary,
    choiceLog: nextLog
  });

  return nextLog;
}


function getNextDayCarryover() {
  const cal = window.CivicationCalendar;
  const model = cal?.getPhaseModel?.() || {};
  const summary =
    model.dailySummary && typeof model.dailySummary === "object"
      ? model.dailySummary
      : {};

  return summary.nextDayCarryover && typeof summary.nextDayCarryover === "object"
    ? summary.nextDayCarryover
    : {
        visibilityBias: 0,
        processBias: 0,
        fatigue: 0
      };
}

function setNextDayCarryover(carryover) {
  const cal = window.CivicationCalendar;
  const model = cal?.getPhaseModel?.() || {};
  const currentSummary =
    model.dailySummary && typeof model.dailySummary === "object"
      ? model.dailySummary
      : {};

  cal?.setDailySummary?.({
    ...currentSummary,
    nextDayCarryover: {
      visibilityBias: Number(carryover?.visibilityBias || 0),
      processBias: Number(carryover?.processBias || 0),
      fatigue: Number(carryover?.fatigue || 0)
    }
  });
}

function applyMorningCarryoverEffects(carryover) {
  const vis = Number(carryover?.visibilityBias || 0);
  const proc = Number(carryover?.processBias || 0);
  const fatigue = Number(carryover?.fatigue || 0);

  try {
    if (fatigue > 1) {
      window.CivicationPsyche?.updateEconomicRoom?.(-1);
      window.CivicationPsyche?.updateIntegrity?.(-1);
    }

    if (vis > proc && vis > 0) {
      window.CivicationPsyche?.updateVisibility?.(1);
    }

    if (proc >= vis && proc > 0) {
      window.CivicationPsyche?.updateIntegrity?.(1);
    }
  } catch {}
}

  
function buildCarryoverFromChoiceLog(choiceLog) {
  const log = Array.isArray(choiceLog) ? choiceLog : [];

  let visibilityBias = 0;
  let processBias = 0;
  let fatigue = 0;

  for (const entry of log) {
    const feedback = String(entry?.feedback || "");
    const label = String(entry?.label || "");
    const effect = Number(entry?.effect || 0);

    if (/sosial|synlig|miljø|overtid/i.test(label + " " + feedback)) {
      visibilityBias += 1;
    }

    if (/rolig|ryddig|struktur|effektiv|nøkternt/i.test(label + " " + feedback)) {
      processBias += 1;
    }

    if (/overtid|hopp over lunsj|presser dagen/i.test(label + " " + feedback)) {
      fatigue += 1;
    }

    if (effect < 0) fatigue += 1;
  }

  return { visibilityBias, processBias, fatigue };
}
  
  function getMorningModeFromCarryover(carryover) {
  const vis = Number(carryover?.visibilityBias || 0);
  const proc = Number(carryover?.processBias || 0);
  const fatigue = Number(carryover?.fatigue || 0);

  if (fatigue > 1) return "fatigued";
  if (vis > proc && vis > 0) return "visible";
  if (proc > 0) return "structured";
  return "neutral";
}

function applyMorningModeToEvent(ev, mode) {
  const baseChoices = Array.isArray(ev?.choices)
    ? ev.choices.map((c) => ({ ...c }))
    : [];

  const baseSituation = Array.isArray(ev?.situation)
    ? ev.situation.slice()
    : [];

  if (mode === "visible") {
    return {
      ...ev,
      morning_mode: "visible",
      subject: `Synlig start: ${String(ev?.subject || "Arbeidsdag")}`,
      situation: baseSituation.concat([
        "Du går inn i morgenen med litt mer sosialt momentum enn vanlig."
      ]),
      choices: baseChoices.map((c) => {
        if (c.id === "A") {
          return {
            ...c,
            label: "Ta styring og vær synlig tidlig",
            effect: Number(c.effect || 0) + 1
          };
        }
        return c;
      })
    };
  }

  if (mode === "structured") {
    return {
      ...ev,
      morning_mode: "structured",
      subject: `Kontrollert start: ${String(ev?.subject || "Arbeidsdag")}`,
      situation: baseSituation.concat([
        "Morgenen har en mer ryddig, disiplinert og kontrollert tone."
      ]),
      choices: baseChoices.map((c) => {
        if (c.id === "B") {
          return {
            ...c,
            label: "Løs det nøkternt og med kontroll",
            effect: Number(c.effect || 0) + 1
          };
        }
        return c;
      })
    };
  }

  if (mode === "fatigued") {
    return {
      ...ev,
      morning_mode: "fatigued",
      subject: `Treg start: ${String(ev?.subject || "Arbeidsdag")}`,
      situation: baseSituation.concat([
        "Du kjenner slitasje fra gårsdagen, og morgenen starter med litt tyngre bein."
      ]),
      choices: baseChoices.map((c) => {
        if (c.id === "C") {
          return {
            ...c,
            label: "Trekk pusten og utsett litt",
            effect: Number(c.effect || 0) + 1
          };
        }
        return c;
      })
    };
  }

  return {
    ...ev,
    morning_mode: "neutral",
    choices: baseChoices,
    situation: baseSituation
  };
}

function applyPhaseChoiceEffects(phaseTag, choiceId, choice) {
  const label = String(choice?.label || "");
  const tags = Array.isArray(choice?.tags) ? choice.tags : [];

  try {
    if (phaseTag === "lunch") {
      if (choiceId === "A") {
        window.CivicationPsyche?.updateIntegrity?.(1);
      } else if (choiceId === "B") {
        window.CivicationPsyche?.updateVisibility?.(1);
      } else if (choiceId === "C") {
        window.CivicationPsyche?.updateEconomicRoom?.(1);
        window.CivicationPsyche?.updateIntegrity?.(-1);
      }
    }

    if (phaseTag === "evening") {
      if (choiceId === "A") {
        window.CivicationPsyche?.updateEconomicRoom?.(1);
        window.CivicationPsyche?.updateIntegrity?.(-1);
      } else if (choiceId === "B") {
        window.CivicationPsyche?.updateIntegrity?.(1);
      } else if (choiceId === "C") {
        window.CivicationPsyche?.updateVisibility?.(1);
      }
    }

    if (tags.includes("legitimacy")) {
      window.CivicationPsyche?.updateIntegrity?.(1);
    }

    if (tags.includes("visibility")) {
      window.CivicationPsyche?.updateVisibility?.(1);
    }
  } catch {}
}


  
