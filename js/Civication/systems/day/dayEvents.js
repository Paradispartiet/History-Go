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
    semantic_event_key: `lunch:${store.id}`,
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
    semantic_event_key: `evening:${store.id}`,
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
  return applyContactBonusToEvent(flavoredByCareer, "evening");
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

function getAccessAwareStoreSignals(phaseTag) {
  const bridge = window.CivicationPlaceAccessBridge;
  if (!bridge?.getBucket) {
    return {
      work: [],
      leisure: [],
      store: []
    };
  }

  return {
    work: bridge.getBucket("work"),
    leisure: bridge.getBucket("leisure"),
    store: bridge.getBucket("store"),
    phaseTag
  };
}

function storeMatchesAccess(store, phaseTag, signals) {
  const type = String(store?.type || "generic");
  const work = Array.isArray(signals?.work) ? signals.work : [];
  const leisure = Array.isArray(signals?.leisure) ? signals.leisure : [];
  const storeAccess = Array.isArray(signals?.store) ? signals.store : [];

  const map = {
    clothing: {
      lunch: ["business_style", "streetwear", "clothing"],
      evening: ["streetwear", "shopping", "afterwork", "clothing"]
    },
    food: {
      lunch: ["coffee", "kafe", "local_cafe", "afterwork"],
      evening: ["afterwork", "kafe", "streetlife", "food"]
    },
    tech: {
      lunch: ["audio", "electronics", "vitenskap", "music"],
      evening: ["audio", "records", "music", "subculture"]
    },
    car: {
      lunch: ["equipment", "naeringsliv", "eiendom"],
      evening: ["status", "afterwork", "naeringsliv"]
    },
    housing: {
      lunch: ["home", "bolig", "nabolag"],
      evening: ["housing", "quiet_district", "family_friendly", "stable_home"]
    },
    generic: {
      lunch: ["afterwork", "city_walk"],
      evening: ["afterwork", "streetlife", "networking"]
    }
  };

  const wanted = map?.[type]?.[phaseTag] || map.generic[phaseTag] || [];
  const haystack = new Set([
    ...work.map(String),
    ...leisure.map(String),
    ...storeAccess.map(String)
  ]);

  if (!haystack.size) return true;
  return wanted.some((key) => haystack.has(String(key)));
}

function getCareerStorePool(active, phaseTag) {
  const careerId = String(active?.career_id || "").trim();
  const visitedCount = getVisitedPlacesCount();
  const accessSignals = getAccessAwareStoreSignals(phaseTag);

  const allStores = [
    {
      id: "street_shop_generic",
      name: "Gatebutikken",
      type: "clothing",
      blurb: "Trygge valg. Mye logo. Litt sjel.",
      careers: ["subkultur", "populaerkultur", "musikk", "naeringsliv"]
    },
    {
      id: "work_shop_generic",
      name: "Arbeidsklær & Verktøy",
      type: "clothing",
      blurb: "Alt som tåler regn, kaffe og mellomlederblikk.",
      careers: ["naeringsliv", "by"]
    },
    {
      id: "canteen_generic",
      name: "Kantina & Kaffebaren",
      type: "food",
      blurb: "Halv pause, halv strategi. Mye småprat. Nakne lysrør.",
      careers: ["naeringsliv", "by", "vitenskap", "media"]
    },
    {
      id: "hifi_shop_generic",
      name: "Hi-Fi & Lyd",
      type: "tech",
      blurb: "Du hører forskjell. (Du kommer til å si at du gjør det.)",
      careers: ["musikk", "vitenskap", "naeringsliv"],
      minVisitedPlaces: 5
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

  const careerFiltered = allStores.filter((store) => {
    const careerOk =
      !Array.isArray(store.careers) || store.careers.includes(careerId);

    const visitOk =
      !Number.isFinite(Number(store.minVisitedPlaces)) ||
      visitedCount >= Number(store.minVisitedPlaces);

    return careerOk && visitOk;
  });

  const accessFiltered = careerFiltered.filter((store) =>
    storeMatchesAccess(store, phaseTag, accessSignals)
  );

  if (accessFiltered.length) return accessFiltered;
  if (careerFiltered.length) return careerFiltered;
  return allStores.slice(0, 2);
}

function getDayEventHistory() {
  try {
    const raw = localStorage.getItem("hg_day_event_history_v1");
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setDayEventHistory(history) {
  try {
    localStorage.setItem(
      "hg_day_event_history_v1",
      JSON.stringify(Array.isArray(history) ? history.slice(-30) : [])
    );
  } catch {}
}

function getRecentDayEventKeys(phaseTag, careerId) {
  return getDayEventHistory()
    .filter((entry) => {
      return String(entry?.phaseTag || "") === String(phaseTag || "") &&
        String(entry?.careerId || "") === String(careerId || "");
    })
    .slice(-3)
    .map((entry) => String(entry?.storeId || "").trim())
    .filter(Boolean);
}

function rememberDayEventStore(active, phaseTag, store) {
  const history = getDayEventHistory();
  history.push({
    at: new Date().toISOString(),
    careerId: String(active?.career_id || "").trim(),
    phaseTag: String(phaseTag || "").trim(),
    storeId: String(store?.id || "").trim(),
    storeName: String(store?.name || "").trim()
  });
  setDayEventHistory(history);
}

function pickStoreContext(active, phaseTag) {
  const pool = getCareerStorePool(active, phaseTag);
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

  const careerId = String(active?.career_id || "").trim();
  const recentStoreIds = new Set(getRecentDayEventKeys(phaseTag, careerId));
  const rotated = pool.slice(idxBase % pool.length).concat(pool.slice(0, idxBase % pool.length));
  const nonRecent = rotated.filter((store) => !recentStoreIds.has(String(store?.id || "").trim()));
  const chosen = nonRecent[0] || rotated[0] || pool[0];

  rememberDayEventStore(active, phaseTag, chosen);

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
