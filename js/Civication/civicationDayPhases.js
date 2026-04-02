
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


  function inferPlaceContextsFromBadges() {
  const merits =
    JSON.parse(localStorage.getItem("merits_by_category") || "{}");

  return {
    historie: Number(merits?.historie?.points || 0),
    vitenskap: Number(merits?.vitenskap?.points || 0),
    kunst: Number(merits?.kunst?.points || 0),
    by: Number(merits?.by?.points || 0),
    musikk: Number(merits?.musikk?.points || 0),
    litteratur: Number(merits?.litteratur?.points || 0),
    natur: Number(merits?.natur?.points || 0),
    sport: Number(merits?.sport?.points || 0),
    politikk: Number(merits?.politikk?.points || 0),
    naeringsliv: Number(merits?.naeringsliv?.points || 0),
    populaerkultur: Number(merits?.populaerkultur?.points || 0),
    subkultur: Number(merits?.subkultur?.points || 0),
    film_tv: Number(merits?.film_tv?.points || 0),
    teater: Number(merits?.teater?.points || 0),
    media: Number(merits?.media?.points || 0),
    psykologi: Number(merits?.psykologi?.points || 0)
  };
}

  function getActiveCivicationContexts() {
  const fields = inferPlaceContextsFromBadges();

  return Object.entries(fields)
    .filter(([, points]) => Number(points) > 0)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 4)
    .map(([id, points]) => ({ id, points }));
}

function getContextFlavorForCareer(active) {
  const contexts = getActiveCivicationContexts();
  const careerId = String(active?.career_id || "").trim();

  const map = {
    historie: {
      lunch: "arkiv, institusjoner og historiske spor",
      evening: "gamle lag i byen og steder med lang hukommelse"
    },
    vitenskap: {
      lunch: "faglige miljøer, metode og presisjon",
      evening: "fordypning, detaljer og teknisk nysgjerrighet"
    },
    kunst: {
      lunch: "uttrykk, smak og blikk",
      evening: "vernissager, symbolsk verdi og scene"
    },
    by: {
      lunch: "byrom, struktur og koordinering",
      evening: "nabolag, utvikling og hvordan byen faktisk virker"
    },
    musikk: {
      lunch: "rytme, miljø og folk som kjenner scenen",
      evening: "scene, lyd og nattlig energi"
    },
    politikk: {
      lunch: "offentlighet, signaler og taktikk",
      evening: "makt, konflikt og hvem som setter tonen"
    },
    naeringsliv: {
      lunch: "tempo, handel og effektivitet",
      evening: "nettverk, verdi og neste trekk"
    },
    media: {
      lunch: "vinkler, oppmerksomhet og historier i omløp",
      evening: "profil, offentlig blikk og synlighet"
    },
    subkultur: {
      lunch: "miljø, edge og tilhørighet",
      evening: "undergrunn, scene og hvem som faktisk er der"
    }
  };

  const relevant = contexts
    .map((c) => ({ ...c, flavor: map[c.id] || null }))
    .filter((c) => c.flavor);

  if (!relevant.length) return null;

  const idx =
    (Number(window.CivicationCalendar?.getPhaseModel?.()?.dayIndex || 1) +
      careerId.length) % relevant.length;

  return relevant[idx];
}

function getVisitedPlaceIds() {
  try {
    const raw = JSON.parse(localStorage.getItem("visited_places") || "[]");

    if (Array.isArray(raw)) {
      return raw.map(String);
    }

    if (raw && typeof raw === "object") {
      return Object.keys(raw).filter((k) => !!raw[k]).map(String);
    }

    return [];
  } catch {
    return [];
  }
}

let __civiPlaceContextsCache = null;

async function loadPlaceContexts() {
  if (Array.isArray(__civiPlaceContextsCache)) {
    return __civiPlaceContextsCache;
  }

  try {
    const res = await fetch("data/Civication/place_contexts.json", {
      cache: "no-store"
    });

    if (!res.ok) {
      __civiPlaceContextsCache = [];
      return __civiPlaceContextsCache;
    }

    const json = await res.json();
    __civiPlaceContextsCache = Array.isArray(json?.contexts)
      ? json.contexts
      : [];

    return __civiPlaceContextsCache;
  } catch {
    __civiPlaceContextsCache = [];
    return __civiPlaceContextsCache;
  }
}

function getMatchedHistoryGoContexts(contexts, visitedIds) {
  const ids = new Set((visitedIds || []).map(String));

  return (contexts || [])
    .map((ctx) => {
      const matches = (ctx.matches_place_ids || []).filter((id) =>
        ids.has(String(id))
      );

      return {
        ...ctx,
        matchCount: matches.length,
        matchedPlaceIds: matches
      };
    })
    .filter((ctx) => ctx.matchCount > 0)
    .sort((a, b) => Number(b.matchCount || 0) - Number(a.matchCount || 0));
}

function pickHistoryGoContext(matchedContexts, phaseTag, active) {
  if (!Array.isArray(matchedContexts) || !matchedContexts.length) return null;

  const careerId = String(active?.career_id || "").trim();

  const weighted = matchedContexts
    .map((ctx) => {
      const bias =
        Array.isArray(ctx.badge_bias) && ctx.badge_bias.includes(careerId)
          ? 2
          : 0;

      return {
        ...ctx,
        score: Number(ctx.matchCount || 0) + bias
      };
    })
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0));

  const dayIndex = Number(
    window.CivicationCalendar?.getPhaseModel?.()?.dayIndex || 1
  );
  const offset = phaseTag === "evening" ? 1 : 0;
  return weighted[(dayIndex + offset) % weighted.length] || weighted[0];
}



const CIVI_WEEKLY_REVIEW_KEY = "hg_civi_weekly_review_v1";

function getWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const dayNum = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dayNum + 3);

  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const firstDayNum = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDayNum + 3);

  const weekNo =
    1 + Math.round((d - firstThursday) / (7 * 24 * 60 * 60 * 1000));

  return `${d.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getWeeklyReview() {
  try {
    const raw = JSON.parse(
      localStorage.getItem(CIVI_WEEKLY_REVIEW_KEY) || "null"
    );

    if (!raw || typeof raw !== "object") {
      return {
        weekKey: getWeekKey(),
        days: [],
        summary: null,
        applied: false
      };
    }

    return {
      weekKey: String(raw.weekKey || getWeekKey()),
      days: Array.isArray(raw.days) ? raw.days : [],
      summary: raw.summary && typeof raw.summary === "object" ? raw.summary : null,
      applied: !!raw.applied
    };
  } catch {
    return {
      weekKey: getWeekKey(),
      days: [],
      summary: null,
      applied: false
    };
  }
}

function saveWeeklyReview(review) {
  const safeReview = {
    weekKey: String(review?.weekKey || getWeekKey()),
    days: Array.isArray(review?.days) ? review.days : [],
    summary: review?.summary && typeof review.summary === "object"
      ? review.summary
      : null,
    applied: !!review?.applied
  };

  localStorage.setItem(CIVI_WEEKLY_REVIEW_KEY, JSON.stringify(safeReview));
  return safeReview;
}

function saveDailySummaryToWeek(summary) {
  if (!summary || typeof summary !== "object") return null;

  const currentWeekKey = getWeekKey();
  const review = getWeeklyReview();

  const baseReview =
    review.weekKey === currentWeekKey
      ? review
      : {
          weekKey: currentWeekKey,
          days: [],
          summary: null,
          applied: false
        };

  const entry = {
    dayIndex: Number(summary.dayIndex || 0),
    completedPhases: Number(summary.completedPhases || 0),
    score: Number(summary.score || 0),
    stability: String(summary.stability || "STABLE"),
    quality: String(summary.quality || "jevn"),
    nextDayCarryover:
      summary.nextDayCarryover && typeof summary.nextDayCarryover === "object"
        ? {
            visibilityBias: Number(summary.nextDayCarryover.visibilityBias || 0),
            processBias: Number(summary.nextDayCarryover.processBias || 0),
            fatigue: Number(summary.nextDayCarryover.fatigue || 0)
          }
        : {
            visibilityBias: 0,
            processBias: 0,
            fatigue: 0
          },
    choiceLog: Array.isArray(summary.choiceLog)
      ? summary.choiceLog.map((x) => ({
          phase: String(x?.phase || ""),
          subject: String(x?.subject || ""),
          choiceId: x?.choiceId ?? null,
          label: String(x?.label || ""),
          feedback: String(x?.feedback || ""),
          effect: Number(x?.effect || 0)
        }))
      : []
  };

  const existingIdx = baseReview.days.findIndex(
    (d) => Number(d?.dayIndex || 0) === entry.dayIndex
  );

  const nextDays =
    existingIdx >= 0
      ? baseReview.days.map((d, i) => (i === existingIdx ? entry : d))
      : baseReview.days.concat([entry]);

  const weeklySummary = buildWeeklySummary(nextDays);

return saveWeeklyReview({
  ...baseReview,
  days: nextDays,
  summary: weeklySummary,
  applied: false
});
}

function buildWeeklySummary(days) {
  const safeDays = Array.isArray(days) ? days : [];

  const summary = {
    daysCount: safeDays.length,
    strongDays: 0,
    evenDays: 0,
    unevenDays: 0,
    visibilityDays: 0,
    processDays: 0,
    fatigueDays: 0,
    avgScore: 0
  };

  if (!safeDays.length) return summary;

  let scoreTotal = 0;

  for (const day of safeDays) {
    const quality = String(day?.quality || "jevn");
    const score = Number(day?.score || 0);
    const carry = day?.nextDayCarryover && typeof day.nextDayCarryover === "object"
      ? day.nextDayCarryover
      : { visibilityBias: 0, processBias: 0, fatigue: 0 };

    scoreTotal += score;

    if (quality === "sterk") summary.strongDays += 1;
    else if (quality === "ujevn") summary.unevenDays += 1;
    else summary.evenDays += 1;

    if (Number(carry.visibilityBias || 0) > Number(carry.processBias || 0)) {
      summary.visibilityDays += 1;
    }

    if (Number(carry.processBias || 0) > 0) {
      summary.processDays += 1;
    }

    if (Number(carry.fatigue || 0) > 1 || quality === "ujevn") {
      summary.fatigueDays += 1;
    }
  }

  summary.avgScore = Number((scoreTotal / safeDays.length).toFixed(2));
  return summary;
}

function applyWeeklyConsequences(summary, activeCareerId) {
  const safe = summary && typeof summary === "object" ? summary : {};

  const strongDays = Number(safe.strongDays || 0);
  const unevenDays = Number(safe.unevenDays || 0);
  const visibilityDays = Number(safe.visibilityDays || 0);
  const processDays = Number(safe.processDays || 0);
  const fatigueDays = Number(safe.fatigueDays || 0);
  const avgScore = Number(safe.avgScore || 0);

  const trustDelta = 0;
  let integrityDelta = 0;
  let visibilityDelta = 0;
  let economicRoomDelta = 0;
  let burnoutPressure = 0;

  if (strongDays >= 3) {
    economicRoomDelta += 1;
  }

  if (unevenDays >= 2 || fatigueDays >= 2) {
    integrityDelta -= 1;
    economicRoomDelta -= 1;
    burnoutPressure += 1;
  }

  if (visibilityDays >= 3) {
    visibilityDelta += 1;
    burnoutPressure += 1;
  }

  if (processDays >= 3) {
    integrityDelta += 1;
  }

  if (avgScore >= 1.5) {
    economicRoomDelta += 1;
  } else if (avgScore < 0) {
    economicRoomDelta -= 1;
  }

  try {
    if (integrityDelta !== 0) {
      window.CivicationPsyche?.updateIntegrity?.(integrityDelta);
    }

    if (visibilityDelta !== 0) {
      window.CivicationPsyche?.updateVisibility?.(visibilityDelta);
    }

    if (economicRoomDelta !== 0) {
      window.CivicationPsyche?.updateEconomicRoom?.(economicRoomDelta);
    }

    if (burnoutPressure > 0) {
      window.CivicationPsyche?.updateIntegrity?.(-1 * burnoutPressure);
    }
  } catch {}

  return {
    integrityDelta,
    visibilityDelta,
    economicRoomDelta,
    burnoutPressure,
    trustDelta,
    activeCareerId: String(activeCareerId || "")
  };
}


function finalizeWeekIfNeeded(activeCareerId) {
  const review = getWeeklyReview();
  const summary =
    review?.summary && typeof review.summary === "object"
      ? review.summary
      : null;

  if (!summary) return null;
  if (review?.applied) return review;
  if (Number(summary.daysCount || 0) < 3) return review;

  const effects = applyWeeklyConsequences(summary, activeCareerId);

  const nextReview = saveWeeklyReview({
    ...review,
    applied: true,
    summary: {
      ...summary,
      appliedEffects: effects,
      weeklyNote:
        Number(summary.strongDays || 0) >= 3
          ? "Uken hang godt sammen og gir deg litt mer rom."
          : Number(summary.unevenDays || 0) >= 2
            ? "Uken ble ujevn, og presset setter noen spor."
            : Number(summary.visibilityDays || 0) >= 3
              ? "Du har vært synlig denne uken, men det koster litt."
              : Number(summary.processDays || 0) >= 3
                ? "Du har holdt struktur gjennom uken og bygger troverdighet."
                : "Uken gir et lite, men merkbart avtrykk."
    }
  });

  return nextReview;
}
  

function buildWeeklyReportHtml() {
  const review = getWeeklyReview();
  const summary =
    review?.summary && typeof review.summary === "object"
      ? review.summary
      : null;

  if (!summary) return "";

  const daysCount = Number(summary.daysCount || 0);
  if (daysCount <= 0) return "";

  const note = String(summary.weeklyNote || "").trim();
  const effects =
    summary.appliedEffects && typeof summary.appliedEffects === "object"
      ? summary.appliedEffects
      : null;

  const effectBits = [];
  if (effects) {
    if (Number(effects.integrityDelta || 0) !== 0) {
      effectBits.push(`Integritet ${effects.integrityDelta > 0 ? "+" : ""}${effects.integrityDelta}`);
    }
    if (Number(effects.visibilityDelta || 0) !== 0) {
      effectBits.push(`Synlighet ${effects.visibilityDelta > 0 ? "+" : ""}${effects.visibilityDelta}`);
    }
    if (Number(effects.economicRoomDelta || 0) !== 0) {
      effectBits.push(`Handlingsrom ${effects.economicRoomDelta > 0 ? "+" : ""}${effects.economicRoomDelta}`);
    }
    if (Number(effects.burnoutPressure || 0) > 0) {
      effectBits.push(`Press +${effects.burnoutPressure}`);
    }
  }

  return `
    <div class="civi-weekly-report" style="margin-bottom:12px;padding:12px;border:1px solid rgba(255,255,255,0.12);border-radius:14px;background:rgba(255,255,255,0.04);">
      <div style="font-weight:700;margin-bottom:8px;">Ukerapport · ${String(review.weekKey || "")}</div>
      <div style="font-size:0.95rem;line-height:1.4;">
        Dager: ${daysCount} · Sterke: ${Number(summary.strongDays || 0)} · Jevne: ${Number(summary.evenDays || 0)} · Ujevne: ${Number(summary.unevenDays || 0)}
      </div>
      <div style="font-size:0.95rem;line-height:1.4;margin-top:4px;">
        Synlighet: ${Number(summary.visibilityDays || 0)} · Struktur: ${Number(summary.processDays || 0)} · Slitasje: ${Number(summary.fatigueDays || 0)} · Snittscore: ${Number(summary.avgScore || 0)}
      </div>
      ${note ? `<div style="margin-top:8px;font-size:0.95rem;line-height:1.45;">${note}</div>` : ""}
      ${effectBits.length ? `<div style="margin-top:8px;font-size:0.9rem;opacity:0.9;">${effectBits.join(" · ")}</div>` : ""}
    </div>
  `;
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
