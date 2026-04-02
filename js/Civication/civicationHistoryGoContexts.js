


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



