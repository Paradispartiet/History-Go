// js/Civication/systems/civicationHistoryFigures.js
// CivicationHistoryFigures — «byens skikkelser»: samlede History Go-personer
// dukker opp som figurer på Civication-bykartet i fritids-/kveldsfasene.
//
// Prinsipp (hybridmodellen):
// - Skikkelsene er IKKE venner og går ikke inn i venne-/samtalesløyfen. De er
//   kulturelle nærvær: historiske personer spilleren har samlet, synlige på
//   kultur-/parkstedene som inspirasjon — aldri som hverdags-NPC-er med jobb.
// - Alt er deterministisk fase-simulering (samme samling + dag + fase gir
//   samme skikkelser), samme kontrakt som CivicationFriendsEngine.
// - Leser kun samlingen via CivicationHistoryPeopleBridge; skriver aldri.
(function () {
  "use strict";

  if (window.CivicationHistoryFigures) return;

  // Skikkelsene viser seg bare i fritids- og kveldsfasene (fase-minnefaser).
  const VISIBLE_SNAPSHOT_PHASES = ["leisure", "evening"];

  // Stedstyper der en historisk skikkelse kan dukke opp, i prioritert rekkefølge.
  const ELIGIBLE_LOCATION_TYPES = ["culture", "park", "cafe"];

  const MAX_FIGURES = 2;

  function norm(value) {
    return String(value || "").trim();
  }

  function stableHash(str) {
    let h = 0;
    const s = String(str || "");
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  function eligibleLocations(locations) {
    const rows = Array.isArray(locations) ? locations : [];
    return ELIGIBLE_LOCATION_TYPES
      .map((type) => rows.filter((loc) => norm(loc?.type) === type))
      .reduce((flat, group) => flat.concat(group), []);
  }

  function activityText(phase) {
    return phase === "evening"
      ? "Er til stede som byens skikkelse i kveld"
      : "Er til stede som byens skikkelse";
  }

  // Sted-kobling: bymodellens sosiale steder (CivicationSocialPlaceResolver)
  // bærer sourcePlaceId = ekte History Go-placeId. Første lokasjon per placeId
  // vinner (stabil rekkefølge i modellen -> deterministisk).
  function locationsByPlaceId(locations) {
    const map = new Map();
    (Array.isArray(locations) ? locations : []).forEach((loc) => {
      const pid = norm(loc?.sourcePlaceId);
      if (pid && !map.has(pid)) map.set(pid, loc);
    });
    return map;
  }

  function figureRow(person, loc, snapshotPhase, atHomePlace) {
    return {
      figure: {
        id: norm(person.id),
        name: norm(person.name),
        category: norm(person.category),
        desc: norm(person.desc),
        placeId: norm(person.placeId),
        year: Number.isFinite(Number(person.year)) ? Number(person.year) : null,
        image: norm(person.cardImage || person.image)
      },
      presence: {
        locationId: norm(loc.id),
        state: "in_event",
        activity: atHomePlace ? "Er ved sitt eget History Go-sted" : activityText(snapshotPhase),
        phase: snapshotPhase,
        atHomePlace: !!atHomePlace,
        visibleOnMap: true
      }
    };
  }

  // Ren og testbar: deterministisk utvalg av skikkelser for (fase, dag).
  // collected: samlede personer (LightPerson-rader fra indeksen), sortert-uavhengig.
  // Sted-kobling: personer hvis ekte placeId finnes i bymodellen prioriteres og
  // stilles ved sitt eget sted (uansett stedstype); resten fyller opp på de
  // generiske kultur-/park-/kafésstedene.
  function pickFiguresForPhase(collected, phase, dayIndex, locations) {
    const snapshotPhase = norm(phase);
    if (!VISIBLE_SNAPSHOT_PHASES.includes(snapshotPhase)) return [];

    const people = (Array.isArray(collected) ? collected : [])
      .filter((p) => norm(p?.id) && norm(p?.name))
      .sort((a, b) => norm(a.id).localeCompare(norm(b.id)));
    if (!people.length) return [];

    const byPlace = locationsByPlaceId(locations);
    const homePeople = people.filter((p) => byPlace.has(norm(p.placeId)));
    const otherPeople = people.filter((p) => !byPlace.has(norm(p.placeId)));
    const spots = eligibleLocations(locations);
    if (!homePeople.length && !spots.length) return [];

    const seedBase = "figday_" + String(Number(dayIndex) || 0) + "_" + snapshotPhase;
    const rows = [];

    // 1) Sted-koblede skikkelser først: personen står ved sitt ekte sted.
    if (homePeople.length) {
      const start = stableHash(seedBase + "_home") % homePeople.length;
      for (let i = 0; i < homePeople.length && rows.length < MAX_FIGURES; i++) {
        const person = homePeople[(start + i) % homePeople.length];
        rows.push(figureRow(person, byPlace.get(norm(person.placeId)), snapshotPhase, true));
      }
    }

    // 2) Fyll resten med generiske kultursteder.
    if (rows.length < MAX_FIGURES && otherPeople.length && spots.length) {
      const start = stableHash(seedBase) % otherPeople.length;
      const slots = Math.min(MAX_FIGURES - rows.length, otherPeople.length, spots.length);
      for (let i = 0; i < slots; i++) {
        const person = otherPeople[(start + i) % otherPeople.length];
        rows.push(figureRow(person, spots[i % spots.length], snapshotPhase, false));
      }
    }
    return rows;
  }

  // Samler alle samlede personer på tvers av kategoriene i indeksen.
  function allCollected(bridge) {
    const seen = new Set();
    const out = [];
    const categories = bridge.inspect?.().categories || [];
    categories.forEach((cat) => {
      (bridge.getCollectedByCategory(cat) || []).forEach((p) => {
        const id = norm(p?.id);
        if (id && !seen.has(id)) {
          seen.add(id);
          out.push(p);
        }
      });
    });
    return out;
  }

  // Async inngang for CityLayer.render(): tar bymodellen fra FriendsEngine
  // ({ snapshotPhase, dayIndex, locations }) og returnerer figur-rader.
  // Trygt tom liste når broen mangler eller ingenting er samlet.
  async function getFiguresForRender(model) {
    const bridge = window.CivicationHistoryPeopleBridge;
    if (!bridge?.load) return [];
    try {
      await bridge.load();
      return pickFiguresForPhase(
        allCollected(bridge),
        model?.snapshotPhase,
        model?.dayIndex,
        model?.locations
      );
    } catch {
      return [];
    }
  }

  window.CivicationHistoryFigures = {
    VISIBLE_SNAPSHOT_PHASES: VISIBLE_SNAPSHOT_PHASES.slice(),
    ELIGIBLE_LOCATION_TYPES: ELIGIBLE_LOCATION_TYPES.slice(),
    pickFiguresForPhase,
    getFiguresForRender
  };
})();
