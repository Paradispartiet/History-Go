
// js/Civication/systems/day/dayCarryover.js
// Dag-valg-logg + dag-til-dag-signal. Eier dagens valg-logg (getDayChoiceLog/appendDayChoiceLog),
// fase-valg-effekter (applyPhaseChoiceEffects) og det ukentlige carryover-signalet
// (buildCarryoverFromChoiceLog), som mater dayWeeklyReview (visibility/process/fatigue-dager).
// Ingen egen LS-nøkkel; alt bor i kalenderens dailySummary / ukesoppsummeringen.
//
// PR F: de gamle morgen-carryover-helperne (getNextDayCarryover/setNextDayCarryover/
// applyMorningCarryoverEffects/getMorningModeFromCarryover/applyMorningModeToEvent) er fjernet.
// De justerte morgendagens valg basert på gårsdagen, men levde kun i den fjernede
// dayPatches.onAppOpen-morgengrenen (PR E) og hadde ingen gjenværende kallere. Dag-til-dag-
// momentum på morgenvalg er dermed ikke lenger en mekanikk; det ukentlige signalet beholdes.
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


  
