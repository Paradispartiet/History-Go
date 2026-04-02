(function () {
  function patchCalendar() {
    const cal = window.CivicationCalendar;
    if (!cal || cal.__dayPhasePatched) return;
    cal.__dayPhasePatched = true;

    const DAY_PHASES = ["morning", "lunch", "afternoon", "evening", "day_end"];

    function getSafeClock() {
      const clock = cal.getClock ? cal.getClock() : {};
      return {
        ...(clock || {}),
        phase: String(clock?.phase || "morning"),
        phaseStatus: String(clock?.phaseStatus || "open"),
        dailyFlags:
          clock?.dailyFlags && typeof clock.dailyFlags === "object"
            ? clock.dailyFlags
            : {},
        dailySummary: clock?.dailySummary || null
      };
    }

    function setPhase(phase) {
      const next = DAY_PHASES.includes(String(phase))
        ? String(phase)
        : "morning";

      return cal.setClock({
        phase: next,
        phaseStatus: "open"
      });
    }

    function getPhase() {
      return getSafeClock().phase;
    }

    function getPhaseLabel(phase) {
      switch (String(phase || "")) {
        case "morning":
          return "Morgen";
        case "lunch":
          return "Lunsj";
        case "afternoon":
          return "Ettermiddag";
        case "evening":
          return "Kveld";
        case "day_end":
          return "Dagslutt";
        default:
          return "Morgen";
      }
    }

    function advancePhase() {
      const phase = getPhase();
      const idx = DAY_PHASES.indexOf(phase);

      if (idx === -1) return setPhase("morning");
      if (idx >= DAY_PHASES.length - 1) return resetForNewDay();

      return cal.setClock({
        phase: DAY_PHASES[idx + 1],
        phaseStatus: "open"
      });
    }

    function markDailyFlag(key, value = true) {
      const current = getSafeClock();
      const flags = { ...(current.dailyFlags || {}) };
      flags[String(key)] = value;
      return cal.setClock({ dailyFlags: flags });
    }

    function hasDailyFlag(key) {
      const flags = getSafeClock().dailyFlags || {};
      return !!flags[String(key)];
    }

    function setDailySummary(summary) {
      return cal.setClock({ dailySummary: summary || null });
    }

    function getDailySummary() {
      return getSafeClock().dailySummary || null;
    }

    function resetForNewDay() {
  const current = getSafeClock();
  const existingSummary =
    current.dailySummary && typeof current.dailySummary === "object"
      ? current.dailySummary
      : {};

  const carryover =
    existingSummary.nextDayCarryover && typeof existingSummary.nextDayCarryover === "object"
      ? existingSummary.nextDayCarryover
      : {
          visibilityBias: 0,
          processBias: 0,
          fatigue: 0
        };

  return cal.setClock({
    dayIndex: Number(current.dayIndex || 1) + 1,
    currentMinutes: Number(current.shiftStartMinutes || 8 * 60),
    phase: "morning",
    phaseStatus: "open",
    dailyFlags: {},
    dailySummary: {
      choiceLog: [],
      nextDayCarryover: carryover
    },
    lastAdvancedAt: Date.now()
  });
}

    function getPhaseModel() {
      const current = getSafeClock();

      return {
        dayIndex: Number(current.dayIndex || 1),
        phase: current.phase,
        phaseLabel: getPhaseLabel(current.phase),
        phaseStatus: current.phaseStatus,
        dailyFlags: current.dailyFlags || {},
        dailySummary: current.dailySummary || null,
        phases: DAY_PHASES.slice()
      };
    }

    const originalStartShiftForJob =
      typeof cal.startShiftForJob === "function"
        ? cal.startShiftForJob.bind(cal)
        : null;

    cal.DAY_PHASES = DAY_PHASES;
    cal.getPhase = getPhase;
    cal.setPhase = setPhase;
    cal.advancePhase = advancePhase;
    cal.markDailyFlag = markDailyFlag;
    cal.hasDailyFlag = hasDailyFlag;
    cal.setDailySummary = setDailySummary;
    cal.getDailySummary = getDailySummary;
    cal.resetForNewDay = resetForNewDay;
    cal.getPhaseModel = getPhaseModel;

    cal.startShiftForJob = function (active) {
      const res = originalStartShiftForJob
        ? originalStartShiftForJob(active)
        : getSafeClock();

      cal.setClock({
        phase: "morning",
        phaseStatus: "open",
        dailyFlags: {},
        dailySummary: null
      });

      return res;
    };
  }

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
  
  function makeLunchEvent(active) {
  const ctx = getLunchContext(active);
  const store = pickStoreContext(active, "lunch");

  const baseEvent = {
    id: `phase_lunch_${Date.now()}`,
    stage: "stable",
    source: "Civication",
    phase_tag: "lunch",
    subject: `Lunsjpause – ${store.name}`,
    situation: [
      `${ctx.line1} I dag trekkes du mot ${store.name}.`,
      `${store.blurb} ${ctx.line2}`
    ],
    lunch_context: {
      brand_name: ctx.brandName,
      visited_places_count: ctx.visitedCount,
      tier: ctx.tier,
      store_id: store.id,
      store_name: store.name,
      store_type: store.type
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
  return applyCareerFlavor(flavoredByStore, "lunch", active);
}

function makeEveningEvent(active) {
  const visitedCount = getVisitedPlacesCount();
  const store = pickStoreContext(active, "evening");
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
    situation: [line1, line2],
    evening_context: {
      brand_name: brandName,
      visited_places_count: visitedCount,
      store_id: store.id,
      store_name: store.name,
      store_type: store.type
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
  return applyCareerFlavor(flavoredByStore, "evening", active);
}

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


  function getCareerStorePool(active) {
  const careerId = String(active?.career_id || "").trim();
  const visitedCount = getVisitedPlacesCount();

  const allStores = [
    {
      id: "street_shop_generic",
      name: "Gatebutikken",
      type: "clothing",
      blurb: "Trygge valg. Mye logo. Litt sjel.",
      careers: ["subkultur", "populaerkultur", "musikk"]
    },
    {
      id: "work_shop_generic",
      name: "Arbeidsklær & Verktøy",
      type: "clothing",
      blurb: "Alt som tåler regn, kaffe og mellomlederblikk.",
      careers: ["naeringsliv", "by"]
    },
    {
      id: "hifi_shop_generic",
      name: "Hi-Fi & Lyd",
      type: "tech",
      blurb: "Du hører forskjell. (Du kommer til å si at du gjør det.)",
      careers: ["musikk", "vitenskap"]
    },
    {
      id: "car_dealer_generic",
      name: "Bilforhandler",
      type: "car",
      blurb: "Du trenger den ikke. Men du kommer til å ville ha den.",
      careers: ["naeringsliv", "by"],
      minVisitedPlaces: 10
    },
    {
      id: "housing_market",
      name: "Boligmarkedet",
      type: "housing",
      blurb: "Markedet er rolig i dag. (Neida.)",
      careers: ["by"],
      minVisitedPlaces: 8
    }
  ];

  const filtered = allStores.filter((store) => {
    const careerOk =
      !Array.isArray(store.careers) || store.careers.includes(careerId);

    const visitOk =
      !Number.isFinite(Number(store.minVisitedPlaces)) ||
      visitedCount >= Number(store.minVisitedPlaces);

    return careerOk && visitOk;
  });

  return filtered.length ? filtered : allStores.slice(0, 2);
}

function pickStoreContext(active, phaseTag) {
  const pool = getCareerStorePool(active);
  if (!pool.length) {
    return {
      id: "fallback_context",
      name: String(active?.brand_name || "").trim() || "miljøet ditt",
      type: "generic",
      blurb: "Et sted du kjenner litt, men ikke helt.",
      phaseTag
    };
  }

  const visitedCount = getVisitedPlacesCount();
  const idxBase =
    Number(window.CivicationCalendar?.getPhaseModel?.()?.dayIndex || 1) +
    (phaseTag === "evening" ? 1 : 0) +
    visitedCount;

  const chosen = pool[idxBase % pool.length];

  return {
    ...chosen,
    phaseTag,
    visitedCount
  };
}
  

function applyStoreTypeFlavor(eventObj, phaseTag, store) {
  const type = String(store?.type || "generic");
  const ev = {
    ...eventObj,
    choices: Array.isArray(eventObj?.choices)
      ? eventObj.choices.map((c) => ({ ...c }))
      : [],
    situation: Array.isArray(eventObj?.situation)
      ? eventObj.situation.slice()
      : []
  };

  if (phaseTag === "lunch") {
    if (type === "clothing") {
      ev.situation.push("Miljøet her handler om stil, signaler og hva slags person du ser ut som i andres øyne.");
      ev.choices = ev.choices.map((c) => {
        if (c.id === "B") {
          return {
            ...c,
            effect: Number(c.effect || 0) + 1,
            label: String(c.label || "").replace("Ta en sosial lunsj", "Ta en synlig lunsj")
          };
        }
        return c;
      });
    }

    if (type === "tech") {
      ev.situation.push("Samtalene her drar lett mot kvalitet, detaljer og hvem som faktisk kan noe.");
      ev.choices = ev.choices.map((c) => {
        if (c.id === "A") {
          return {
            ...c,
            effect: Number(c.effect || 0) + 1,
            label: String(c.label || "").replace("Spis raskt", "Ta en presis og fokusert lunsj")
          };
        }
        return c;
      });
    }

    if (type === "car") {
      ev.situation.push("Her handler alt litt mer om ambisjon, status og hvor raskt ting kan beveges videre.");
      ev.choices = ev.choices.map((c) => {
        if (c.id === "C") {
          return {
            ...c,
            effect: Number(c.effect || 0) + 1,
            label: String(c.label || "").replace("Hopp over lunsjen", "Dropp lunsjen og jag momentum")
          };
        }
        return c;
      });
    }

    if (type === "housing") {
      ev.situation.push("Stemningen her trekker mot stabilitet, forankring og spørsmålet om hvor livet egentlig er på vei.");
      ev.choices = ev.choices.map((c) => {
        if (c.id === "A") {
          return {
            ...c,
            effect: Number(c.effect || 0) + 1,
            label: String(c.label || "").replace("Spis raskt", "Ta en rolig og stabil lunsj")
          };
        }
        return c;
      });
    }
  }

  if (phaseTag === "evening") {
    if (type === "clothing") {
      ev.situation.push("Kvelden her handler om stil, scene og hvor synlig du vil gjøre deg selv.");
      ev.choices = ev.choices.map((c) => {
        if (c.id === "C") {
          return {
            ...c,
            effect: Number(c.effect || 0) + 1,
            label: String(c.label || "").replace("Oppsøk folk og miljø", "Gjør deg synlig i miljøet")
          };
        }
        return c;
      });
    }

    if (type === "tech") {
      ev.situation.push("Kvelden her handler mer om nerdekapital, presisjon og hvem som faktisk har oversikt.");
      ev.choices = ev.choices.map((c) => {
        if (c.id === "A") {
          return {
            ...c,
            effect: Number(c.effect || 0) + 1,
            label: String(c.label || "").replace("Ta frivillig overtid", "Fordyp deg og press ut mer verdi")
          };
        }
        return c;
      });
    }

    if (type === "car") {
      ev.situation.push("Alt rundt deg peker mot tempo, status og en litt mer risikovillig kveld.");
      ev.choices = ev.choices.map((c) => {
        if (c.id === "A" || c.id === "C") {
          return {
            ...c,
            effect: Number(c.effect || 0) + 1
          };
        }
        return c;
      });
    }

    if (type === "housing") {
      ev.situation.push("Kvelden her gjør det vanskelig å ignorere spørsmål om trygghet, plass og hvilken struktur livet ditt hviler på.");
      ev.choices = ev.choices.map((c) => {
        if (c.id === "B") {
          return {
            ...c,
            effect: Number(c.effect || 0) + 1,
            label: String(c.label || "").replace("Trekk deg rolig bort", "Trekk deg hjemover og la kvelden lande")
          };
        }
        return c;
      });
    }
  }

  return ev;
}

function applyCareerFlavor(eventObj, phaseTag, active) {
  const careerId = String(active?.career_id || "").trim();

  const ev = {
    ...eventObj,
    choices: Array.isArray(eventObj?.choices)
      ? eventObj.choices.map((c) => ({ ...c }))
      : [],
    situation: Array.isArray(eventObj?.situation)
      ? eventObj.situation.slice()
      : []
  };

  if (careerId === "naeringsliv") {
    ev.situation.push("Alt vurderes litt i lys av verdi, tempo og hva som faktisk flytter noe fremover.");
    ev.choices = ev.choices.map((c) => {
      if (c.id === "A") return { ...c, effect: Number(c.effect || 0) + 1 };
      return c;
    });
  }

  if (careerId === "by") {
    ev.situation.push("Du leser situasjonen gjennom struktur, koordinering og hvordan ting henger sammen i større skala.");
    ev.choices = ev.choices.map((c) => {
      if (c.id === "B") return { ...c, effect: Number(c.effect || 0) + 1 };
      return c;
    });
  }

  if (careerId === "musikk") {
    ev.situation.push("Du merker alt litt mer som scene, rytme og nærvær mellom mennesker.");
    ev.choices = ev.choices.map((c) => {
      if (c.id === "C") return { ...c, effect: Number(c.effect || 0) + 1 };
      return c;
    });
  }

  if (careerId === "politikk") {
    ev.situation.push("Du kjenner etter hvordan valgene dine leses offentlig, og hva de signaliserer utover seg selv.");
    ev.choices = ev.choices.map((c) => {
      if (c.id === "B" || c.id === "C") {
        return { ...c, effect: Number(c.effect || 0) + 1 };
      }
      return c;
    });
  }

  if (careerId === "media") {
    ev.situation.push("Du tenker fort i vinkler, oppmerksomhet og hvilke handlinger som faktisk blir lagt merke til.");
    ev.choices = ev.choices.map((c) => {
      if (c.id === "C") return { ...c, effect: Number(c.effect || 0) + 1 };
      return c;
    });
  }

  if (careerId === "historie") {
    ev.situation.push("Du leser stedet og øyeblikket som lag på lag av spor, institusjoner og minner.");
    ev.choices = ev.choices.map((c) => {
      if (c.id === "B") return { ...c, effect: Number(c.effect || 0) + 1 };
      return c;
    });
  }

  if (careerId === "vitenskap") {
    ev.situation.push("Du vurderer valgene gjennom presisjon, metode og hva som faktisk tåler nærmere gransking.");
    ev.choices = ev.choices.map((c) => {
      if (c.id === "A" || c.id === "B") {
        return { ...c, effect: Number(c.effect || 0) + 1 };
      }
      return c;
    });
  }

  if (careerId === "kunst") {
    ev.situation.push("Du kjenner etter uttrykk, symbolsk verdi og hva slags blikk situasjonen inviterer frem.");
    ev.choices = ev.choices.map((c) => {
      if (c.id === "C") return { ...c, effect: Number(c.effect || 0) + 1 };
      return c;
    });
  }

  if (careerId === "litteratur") {
    ev.situation.push("Du tenker i formuleringer, nyanser og hvordan små valg får mening over tid.");
    ev.choices = ev.choices.map((c) => {
      if (c.id === "B") return { ...c, effect: Number(c.effect || 0) + 1 };
      return c;
    });
  }

  if (careerId === "natur") {
    ev.situation.push("Du leser tempo, belastning og omgivelser som del av et større økologisk og kroppslig bilde.");
    ev.choices = ev.choices.map((c) => {
      if (c.id === "A" || c.id === "B") {
        return { ...c, effect: Number(c.effect || 0) + 1 };
      }
      return c;
    });
  }

  if (careerId === "sport") {
    ev.situation.push("Du oppfatter valgene som rytme, driv og hvor mye energi som faktisk er i kroppen akkurat nå.");
    ev.choices = ev.choices.map((c) => {
      if (c.id === "A") return { ...c, effect: Number(c.effect || 0) + 1 };
      return c;
    });
  }

  if (careerId === "populaerkultur") {
    ev.situation.push("Du leser situasjonen gjennom referanser, stemning og hva som fester seg i folks oppmerksomhet.");
    ev.choices = ev.choices.map((c) => {
      if (c.id === "C") return { ...c, effect: Number(c.effect || 0) + 1 };
      return c;
    });
  }

  if (careerId === "subkultur") {
    ev.situation.push("Du kjenner etter miljø, edge og hvem som faktisk hører hjemme i rommet.");
    ev.choices = ev.choices.map((c) => {
      if (c.id === "C") return { ...c, effect: Number(c.effect || 0) + 1 };
      return c;
    });
  }

  if (careerId === "film_tv") {
    ev.situation.push("Du ser lett situasjonen som scene, klipp og hvordan den ville tatt seg ut for et publikum.");
    ev.choices = ev.choices.map((c) => {
      if (c.id === "C") return { ...c, effect: Number(c.effect || 0) + 1 };
      return c;
    });
  }

  if (careerId === "teater") {
    ev.situation.push("Du kjenner etter timing, nærvær og hvordan rollen din spilles i møte med andre.");
    ev.choices = ev.choices.map((c) => {
      if (c.id === "C" || c.id === "B") {
        return { ...c, effect: Number(c.effect || 0) + 1 };
      }
      return c;
    });
  }

  if (careerId === "psykologi") {
    ev.situation.push("Du merker raskt hva som driver mennesker, og hvordan små valg setter spor i relasjoner og selvforståelse.");
    ev.choices = ev.choices.map((c) => {
      if (c.id === "B") return { ...c, effect: Number(c.effect || 0) + 1 };
      return c;
    });
  }

  return ev;
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
      const ev = makeLunchEvent(active);
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
      const ev = makeEveningEvent(active);
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
        const updated = {
          ...task,
          dayIndex: Number(phaseModel.dayIndex || 1),
          phase: String(mailEvent?.phase_tag || phaseModel.phase || "morning"),
          phase_required: true
        };

        const store = engine.getStore ? engine.getStore() : null;
        if (store?.byId?.[updated.id]) {
          store.byId[updated.id] = updated;
          engine.setStore?.(store);
        }

        return updated;
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

      const existing = host.querySelector(".civi-dayphase-hud");
      if (existing) existing.remove();

      host.insertAdjacentHTML("afterbegin", buildPhaseHud(model));
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
