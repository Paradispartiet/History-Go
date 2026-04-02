
function getLunchContext(active) {
  const visitedCount = getVisitedPlacesCount();
  const brandName =
    String(active?.brand_name || "").trim() || "stedet ditt";

  if (visitedCount >= 20) {
    return {
      brandName,
      visitedCount,
      tier: "rich",
      line1: `Du har vært mange steder i History Go og kjenner byen bedre enn før. Lunsjen rundt ${brandName} føles som en del av nettverket ditt.`,
      line2: "Du kan bruke lunsjen til rytme, nettverk eller ren effektivitet."
    };
  }

  if (visitedCount >= 5) {
    return {
      brandName,
      visitedCount,
      tier: "mid",
      line1: `Du begynner å få fotfeste i byen. Lunsjen rundt ${brandName} er ikke tilfeldig lenger.`,
      line2: "Valget ditt kan gjøre dagen litt lettere eller litt skarpere."
    };
  }

  return {
    brandName,
    visitedCount,
    tier: "basic",
    line1: `Du er fortsatt tidlig i løypa og bruker lunsjen rundt ${brandName} mest for å holde dagen samlet.`,
    line2: "Det er fortsatt et valg mellom ro, sosialt spill og ren effektivitet."
  };
}
  
async function makeLunchEvent(active) {
  const ctx = getLunchContext(active);
  const store = pickStoreContext(active, "lunch");

  const visitedIds = getVisitedPlaceIds();
  const placeContexts = await loadPlaceContexts();
  const matchedContexts = getMatchedHistoryGoContexts(placeContexts, visitedIds);
  const historyGoContext = pickHistoryGoContext(
    matchedContexts,
    "lunch",
    active
  );

  const contextFlavor = getContextFlavorForCareer(active);

  const extraContextLine = contextFlavor?.flavor?.lunch
    ? `Du trekkes også mot miljøer preget av ${contextFlavor.flavor.lunch}.`
    : null;

  const historyGoLine = historyGoContext?.lunch_text
    ? `Bylivet ditt trekker også mot ${historyGoContext.lunch_text}.`
    : null;

  const baseEvent = {
    id: `phase_lunch_${Date.now()}`,
    stage: "stable",
    source: "Civication",
    phase_tag: "lunch",
    subject: `Lunsjpause – ${store.name}`,
    situation: [
      `${ctx.line1} I dag trekkes du mot ${store.name}.`,
      `${store.blurb} ${ctx.line2}`,
      ...(extraContextLine ? [extraContextLine] : []),
      ...(historyGoLine ? [historyGoLine] : [])
    ],
    lunch_context: {
      brand_name: ctx.brandName,
      visited_places_count: ctx.visitedCount,
      tier: ctx.tier,
      store_id: store.id,
      store_name: store.name,
      store_type: store.type,
      history_go_context_id: historyGoContext?.id || null,
      history_go_context_label: historyGoContext?.label || null,
      history_go_match_count: Number(historyGoContext?.matchCount || 0)
    },
    choices: [
      {
        id: "A",
        label: `Spis raskt ved ${store.name}`,
        effect: 0,
        tags: ["process", "craft"],
        feedback:
          ctx.visitedCount >= 5
            ? `Du holder rytmen og bruker ${store.name} nøkternt.`
            : `Du bruker ${store.name} uten å gjøre noe større ut av lunsjen.`
      },
      {
        id: "B",
        label: `Ta en sosial lunsj ved ${store.name}`,
        effect: 1,
        tags: ["visibility", "legitimacy"],
        feedback:
          ctx.visitedCount >= 5
            ? `Du bruker lunsjen ved ${store.name} til å bli litt mer synlig i miljøet rundt deg.`
            : `Du blir sett rundt ${store.name}, og dagen åpner seg litt mer sosialt.`
      },
      {
        id: "C",
        label: `Hopp over lunsjen og gå forbi ${store.name}`,
        effect: -1,
        tags: ["avoidance", "laziness"],
        feedback:
          ctx.visitedCount >= 20
            ? `Du kunne brukt ${store.name} bedre, men velger ren effektivitet.`
            : `Du sparer tid, men lar muligheten ved ${store.name} passere.`
      }
    ]
  };

const flavoredByStore = applyStoreTypeFlavor(baseEvent, "lunch", store);
const flavoredByCareer = applyCareerFlavor(flavoredByStore, "lunch", active);
return applyContactBonusToEvent(flavoredByCareer, "lunch");
}

async function makeEveningEvent(active) {
  const visitedCount = getVisitedPlacesCount();
  const store = pickStoreContext(active, "evening");

  const visitedIds = getVisitedPlaceIds();
  const placeContexts = await loadPlaceContexts();
  const matchedContexts = getMatchedHistoryGoContexts(placeContexts, visitedIds);
  const historyGoContext = pickHistoryGoContext(
    matchedContexts,
    "evening",
    active
  );

  const contextFlavor = getContextFlavorForCareer(active);

  const extraContextLine = contextFlavor?.flavor?.evening
    ? `Kvelden bærer også preg av ${contextFlavor.flavor.evening}.`
    : null;

  const historyGoLine = historyGoContext?.evening_text
    ? `Kvelden bærer også preg av ${historyGoContext.evening_text}.`
    : null;

  const brandName =
    String(active?.brand_name || "").trim() || store.name || "miljøet ditt";

  let line1 =
    `Arbeidsdelen av dagen er over, og kvelden trekker deg mot ${store.name}.`;
  let line2 =
    `Rundt ${store.name} må du velge om kvelden skal handle om ekstra innsats, ro eller synlighet.`;

  if (visitedCount >= 20) {
    line1 =
      `Du kjenner byen godt nå, og kvelden ved ${store.name} føles som en forlengelse av posisjonen din.`;
    line2 =
      `${store.blurb} Kvelden kan brukes til å styrke nettverk, hente inn mer verdi eller trekke deg smart tilbake.`;
  } else if (visitedCount >= 5) {
    line1 =
      `Du begynner å få flere muligheter rundt ${store.name} også etter arbeidstid.`;
    line2 =
      `${store.blurb} Kvelden handler om hva slags retning du vil gi dagen som helhet.`;
  }

  const baseEvent = {
    id: `phase_evening_${Date.now()}`,
    stage: "stable",
    source: "Civication",
    phase_tag: "evening",
    subject: `Kveld – ${store.name}`,
    situation: [
      line1,
      line2,
      ...(extraContextLine ? [extraContextLine] : []),
      ...(historyGoLine ? [historyGoLine] : [])
    ],
    evening_context: {
      brand_name: brandName,
      visited_places_count: visitedCount,
      store_id: store.id,
      store_name: store.name,
      store_type: store.type,
      history_go_context_id: historyGoContext?.id || null,
      history_go_context_label: historyGoContext?.label || null,
      history_go_match_count: Number(historyGoContext?.matchCount || 0)
    },
    choices: [
      {
        id: "A",
        label: `Ta frivillig overtid før du drar fra ${store.name}`,
        effect: 1,
        tags: ["craft", "visibility"],
        feedback:
          visitedCount >= 5
            ? `Du bruker kvelden rundt ${store.name} til å presse ut litt mer verdi av dagen.`
            : `Du presser dagen litt lenger før du forlater ${store.name}.`
      },
      {
        id: "B",
        label: `Trekk deg rolig bort fra ${store.name}`,
        effect: 0,
        tags: ["process", "legitimacy"],
        feedback:
          visitedCount >= 5
            ? `Du holder strukturen og lar dagen lande uten unødvendig støy rundt ${store.name}.`
            : `Du lar kvelden roe seg ned etter ${store.name}.`
      },
      {
        id: "C",
        label: `Oppsøk folk og miljø rundt ${store.name}`,
        effect: 1,
        tags: ["visibility", "shortcut"],
        feedback:
          visitedCount >= 20
            ? `Du bruker miljøet rundt ${store.name} aktivt, og gjør kvelden mer strategisk.`
            : `Kvelden blir mer sosial og mer åpen rundt ${store.name}.`
      }
    ]
  };

  const flavoredByStore = applyStoreTypeFlavor(baseEvent, "evening", store);
  const flavoredByCareer = applyCareerFlavor(flavoredByStore, "evening", active);
  return applyContactBonusToEvent(flavoredByCareer, "evening");}

function makeDayEndEvent() {
  const cal = window.CivicationCalendar;
  const model = cal?.getPhaseModel?.() || {};
  const flags = model.dailyFlags || {};

  const doneCount = [
    "morning_done",
    "lunch_done",
    "afternoon_done",
    "evening_done"
  ].filter((k) => !!flags[k]).length;

  const state = window.CivicationState?.getState?.() || {};
  const score = Number(state.score || 0);
  const stability = String(state.stability || "STABLE");

  const existingSummary =
    model.dailySummary && typeof model.dailySummary === "object"
      ? model.dailySummary
      : {};

  const choiceLog = Array.isArray(existingSummary.choiceLog)
    ? existingSummary.choiceLog
    : [];

  let quality = "jevn";
  if (doneCount >= 4 && score >= 1) quality = "sterk";
  else if (doneCount <= 2 || score < 0) quality = "ujevn";

  const nextDayCarryover = buildCarryoverFromChoiceLog(choiceLog);

  const summary = {
    dayIndex: Number(model.dayIndex || 1),
    completedPhases: doneCount,
    score,
    stability,
    quality,
    choiceLog,
    nextDayCarryover
  };

  cal?.setDailySummary?.(summary);

  let line1 = `Dag ${summary.dayIndex} går mot slutten. Du fullførte ${summary.completedPhases} av 4 hovedfaser.`;
  let line2 = `Statusen din er ${summary.stability.toLowerCase()}, og dagen står igjen som ${summary.quality}.`;

  if (quality === "sterk") {
    line2 = "Du holder en tydelig rytme, og dagen virker samlet og solid.";
  } else if (quality === "ujevn") {
    line2 = "Dagen hang ikke helt sammen, og noe av trykket ble med videre.";
  }

  const recentChoices = choiceLog
    .slice(-3)
    .map((x) => {
      const phaseLabel =
        x?.phase === "morning"
          ? "Morgen"
          : x?.phase === "lunch"
            ? "Lunsj"
            : x?.phase === "afternoon"
              ? "Ettermiddag"
              : x?.phase === "evening"
                ? "Kveld"
                : x?.phase === "day_end"
                  ? "Dagslutt"
                  : "Fase";

      const label = String(x?.label || "").trim();
      if (!label) return null;

      return `${phaseLabel}: ${label}`;
    })
    .filter(Boolean);

  const line3 = recentChoices.length
    ? `Valg du faktisk tok i dag: ${recentChoices.join(" · ")}.`
    : "Dagen har foreløpig få registrerte valg.";

  const line4 =
    nextDayCarryover.fatigue > 1
      ? "Neste morgen kan starte med litt slitasje."
      : nextDayCarryover.visibilityBias > nextDayCarryover.processBias
        ? "Neste morgen kan bli mer sosial og synlig."
        : nextDayCarryover.processBias > 0
          ? "Neste morgen kan bli mer ryddig og prosessorientert."
          : "Neste morgen starter uten tydelig etterslep.";

  return {
    id: `phase_day_end_${Date.now()}`,
    stage: "stable",
    source: "Civication",
    phase_tag: "day_end",
    subject: `Dag ${summary.dayIndex} er over`,
    situation: [line1, line2, line3, line4],
    day_end_context: summary,
    choices: [],
    feedback: "Dagen lukkes. En ny dag starter."
  };
}


function getLunchContext(active) {
  const visitedCount = getVisitedPlacesCount();
  const brandName =
    String(active?.brand_name || "").trim() || "stedet ditt";

  if (visitedCount >= 20) {
    return {
      brandName,
      visitedCount,
      tier: "rich",
      line1: `Du har vært mange steder i History Go og kjenner byen bedre enn før. Lunsjen rundt ${brandName} føles som en del av nettverket ditt.`,
      line2: "Du kan bruke lunsjen til rytme, nettverk eller ren effektivitet."
    };
  }

  if (visitedCount >= 5) {
    return {
      brandName,
      visitedCount,
      tier: "mid",
      line1: `Du begynner å få fotfeste i byen. Lunsjen rundt ${brandName} er ikke tilfeldig lenger.`,
      line2: "Valget ditt kan gjøre dagen litt lettere eller litt skarpere."
    };
  }

  return {
    brandName,
    visitedCount,
    tier: "basic",
    line1: `Du er fortsatt tidlig i løypa og bruker lunsjen rundt ${brandName} mest for å holde dagen samlet.`,
    line2: "Det er fortsatt et valg mellom ro, sosialt spill og ren effektivitet."
  };
}
  
async function makeLunchEvent(active) {
  const ctx = getLunchContext(active);
  const store = pickStoreContext(active, "lunch");

  const visitedIds = getVisitedPlaceIds();
  const placeContexts = await loadPlaceContexts();
  const matchedContexts = getMatchedHistoryGoContexts(placeContexts, visitedIds);
  const historyGoContext = pickHistoryGoContext(
    matchedContexts,
    "lunch",
    active
  );

  const contextFlavor = getContextFlavorForCareer(active);

  const extraContextLine = contextFlavor?.flavor?.lunch
    ? `Du trekkes også mot miljøer preget av ${contextFlavor.flavor.lunch}.`
    : null;

  const historyGoLine = historyGoContext?.lunch_text
    ? `Bylivet ditt trekker også mot ${historyGoContext.lunch_text}.`
    : null;

  const baseEvent = {
    id: `phase_lunch_${Date.now()}`,
    stage: "stable",
    source: "Civication",
    phase_tag: "lunch",
    subject: `Lunsjpause – ${store.name}`,
    situation: [
      `${ctx.line1} I dag trekkes du mot ${store.name}.`,
      `${store.blurb} ${ctx.line2}`,
      ...(extraContextLine ? [extraContextLine] : []),
      ...(historyGoLine ? [historyGoLine] : [])
    ],
    lunch_context: {
      brand_name: ctx.brandName,
      visited_places_count: ctx.visitedCount,
      tier: ctx.tier,
      store_id: store.id,
      store_name: store.name,
      store_type: store.type,
      history_go_context_id: historyGoContext?.id || null,
      history_go_context_label: historyGoContext?.label || null,
      history_go_match_count: Number(historyGoContext?.matchCount || 0)
    },
    choices: [
      {
        id: "A",
        label: `Spis raskt ved ${store.name}`,
        effect: 0,
        tags: ["process", "craft"],
        feedback:
          ctx.visitedCount >= 5
            ? `Du holder rytmen og bruker ${store.name} nøkternt.`
            : `Du bruker ${store.name} uten å gjøre noe større ut av lunsjen.`
      },
      {
        id: "B",
        label: `Ta en sosial lunsj ved ${store.name}`,
        effect: 1,
        tags: ["visibility", "legitimacy"],
        feedback:
          ctx.visitedCount >= 5
            ? `Du bruker lunsjen ved ${store.name} til å bli litt mer synlig i miljøet rundt deg.`
            : `Du blir sett rundt ${store.name}, og dagen åpner seg litt mer sosialt.`
      },
      {
        id: "C",
        label: `Hopp over lunsjen og gå forbi ${store.name}`,
        effect: -1,
        tags: ["avoidance", "laziness"],
        feedback:
          ctx.visitedCount >= 20
            ? `Du kunne brukt ${store.name} bedre, men velger ren effektivitet.`
            : `Du sparer tid, men lar muligheten ved ${store.name} passere.`
      }
    ]
  };

const flavoredByStore = applyStoreTypeFlavor(baseEvent, "lunch", store);
const flavoredByCareer = applyCareerFlavor(flavoredByStore, "lunch", active);
return applyContactBonusToEvent(flavoredByCareer, "lunch");
}

async function makeEveningEvent(active) {
  const visitedCount = getVisitedPlacesCount();
  const store = pickStoreContext(active, "evening");

  const visitedIds = getVisitedPlaceIds();
  const placeContexts = await loadPlaceContexts();
  const matchedContexts = getMatchedHistoryGoContexts(placeContexts, visitedIds);
  const historyGoContext = pickHistoryGoContext(
    matchedContexts,
    "evening",
    active
  );

  const contextFlavor = getContextFlavorForCareer(active);

  const extraContextLine = contextFlavor?.flavor?.evening
    ? `Kvelden bærer også preg av ${contextFlavor.flavor.evening}.`
    : null;

  const historyGoLine = historyGoContext?.evening_text
    ? `Kvelden bærer også preg av ${historyGoContext.evening_text}.`
    : null;

  const brandName =
    String(active?.brand_name || "").trim() || store.name || "miljøet ditt";

  let line1 =
    `Arbeidsdelen av dagen er over, og kvelden trekker deg mot ${store.name}.`;
  let line2 =
    `Rundt ${store.name} må du velge om kvelden skal handle om ekstra innsats, ro eller synlighet.`;

  if (visitedCount >= 20) {
    line1 =
      `Du kjenner byen godt nå, og kvelden ved ${store.name} føles som en forlengelse av posisjonen din.`;
    line2 =
      `${store.blurb} Kvelden kan brukes til å styrke nettverk, hente inn mer verdi eller trekke deg smart tilbake.`;
  } else if (visitedCount >= 5) {
    line1 =
      `Du begynner å få flere muligheter rundt ${store.name} også etter arbeidstid.`;
    line2 =
      `${store.blurb} Kvelden handler om hva slags retning du vil gi dagen som helhet.`;
  }

  const baseEvent = {
    id: `phase_evening_${Date.now()}`,
    stage: "stable",
    source: "Civication",
    phase_tag: "evening",
    subject: `Kveld – ${store.name}`,
    situation: [
      line1,
      line2,
      ...(extraContextLine ? [extraContextLine] : []),
      ...(historyGoLine ? [historyGoLine] : [])
    ],
    evening_context: {
      brand_name: brandName,
      visited_places_count: visitedCount,
      store_id: store.id,
      store_name: store.name,
      store_type: store.type,
      history_go_context_id: historyGoContext?.id || null,
      history_go_context_label: historyGoContext?.label || null,
      history_go_match_count: Number(historyGoContext?.matchCount || 0)
    },
    choices: [
      {
        id: "A",
        label: `Ta frivillig overtid før du drar fra ${store.name}`,
        effect: 1,
        tags: ["craft", "visibility"],
        feedback:
          visitedCount >= 5
            ? `Du bruker kvelden rundt ${store.name} til å presse ut litt mer verdi av dagen.`
            : `Du presser dagen litt lenger før du forlater ${store.name}.`
      },
      {
        id: "B",
        label: `Trekk deg rolig bort fra ${store.name}`,
        effect: 0,
        tags: ["process", "legitimacy"],
        feedback:
          visitedCount >= 5
            ? `Du holder strukturen og lar dagen lande uten unødvendig støy rundt ${store.name}.`
            : `Du lar kvelden roe seg ned etter ${store.name}.`
      },
      {
        id: "C",
        label: `Oppsøk folk og miljø rundt ${store.name}`,
        effect: 1,
        tags: ["visibility", "shortcut"],
        feedback:
          visitedCount >= 20
            ? `Du bruker miljøet rundt ${store.name} aktivt, og gjør kvelden mer strategisk.`
            : `Kvelden blir mer sosial og mer åpen rundt ${store.name}.`
      }
    ]
  };

  const flavoredByStore = applyStoreTypeFlavor(baseEvent, "evening", store);
  const flavoredByCareer = applyCareerFlavor(flavoredByStore, "evening", active);
  return applyContactBonusToEvent(flavoredByCareer, "evening");}

function makeDayEndEvent() {
  const cal = window.CivicationCalendar;
  const model = cal?.getPhaseModel?.() || {};
  const flags = model.dailyFlags || {};

  const doneCount = [
    "morning_done",
    "lunch_done",
    "afternoon_done",
    "evening_done"
  ].filter((k) => !!flags[k]).length;

  const state = window.CivicationState?.getState?.() || {};
  const score = Number(state.score || 0);
  const stability = String(state.stability || "STABLE");

  const existingSummary =
    model.dailySummary && typeof model.dailySummary === "object"
      ? model.dailySummary
      : {};

  const choiceLog = Array.isArray(existingSummary.choiceLog)
    ? existingSummary.choiceLog
    : [];

  let quality = "jevn";
  if (doneCount >= 4 && score >= 1) quality = "sterk";
  else if (doneCount <= 2 || score < 0) quality = "ujevn";

  const nextDayCarryover = buildCarryoverFromChoiceLog(choiceLog);

  const summary = {
    dayIndex: Number(model.dayIndex || 1),
    completedPhases: doneCount,
    score,
    stability,
    quality,
    choiceLog,
    nextDayCarryover
  };

  cal?.setDailySummary?.(summary);

  let line1 = `Dag ${summary.dayIndex} går mot slutten. Du fullførte ${summary.completedPhases} av 4 hovedfaser.`;
  let line2 = `Statusen din er ${summary.stability.toLowerCase()}, og dagen står igjen som ${summary.quality}.`;

  if (quality === "sterk") {
    line2 = "Du holder en tydelig rytme, og dagen virker samlet og solid.";
  } else if (quality === "ujevn") {
    line2 = "Dagen hang ikke helt sammen, og noe av trykket ble med videre.";
  }

  const recentChoices = choiceLog
    .slice(-3)
    .map((x) => {
      const phaseLabel =
        x?.phase === "morning"
          ? "Morgen"
          : x?.phase === "lunch"
            ? "Lunsj"
            : x?.phase === "afternoon"
              ? "Ettermiddag"
              : x?.phase === "evening"
                ? "Kveld"
                : x?.phase === "day_end"
                  ? "Dagslutt"
                  : "Fase";

      const label = String(x?.label || "").trim();
      if (!label) return null;

      return `${phaseLabel}: ${label}`;
    })
    .filter(Boolean);

  const line3 = recentChoices.length
    ? `Valg du faktisk tok i dag: ${recentChoices.join(" · ")}.`
    : "Dagen har foreløpig få registrerte valg.";

  const line4 =
    nextDayCarryover.fatigue > 1
      ? "Neste morgen kan starte med litt slitasje."
      : nextDayCarryover.visibilityBias > nextDayCarryover.processBias
        ? "Neste morgen kan bli mer sosial og synlig."
        : nextDayCarryover.processBias > 0
          ? "Neste morgen kan bli mer ryddig og prosessorientert."
          : "Neste morgen starter uten tydelig etterslep.";

  return {
    id: `phase_day_end_${Date.now()}`,
    stage: "stable",
    source: "Civication",
    phase_tag: "day_end",
    subject: `Dag ${summary.dayIndex} er over`,
    situation: [line1, line2, line3, line4],
    day_end_context: summary,
    choices: [],
    feedback: "Dagen lukkes. En ny dag starter."
  };
}
