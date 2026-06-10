// civicationFriendsEngine.js
// Simulert sosial tilstedeværelse + fasepunkter for Civication-byen.
//
// VIKTIG: Dette er simulert spilltilstedeværelse, ikke ekte geografisk sporing.
// Ingen GPS, ingen live-posisjon. Når en venn er "hjemme" betyr det at vennens
// Civication-avatar er hjemme i spillet.
//
// Datadrevet: alt kommer fra data/Civication/map/phaseLocations.json og
// data/Civication/map/friends.json. Simuleringen er deterministisk – samme
// data + samme fase gir alltid samme tilstand, slik at testing er forutsigbar.
(function () {
  "use strict";

  if (window.CivicationFriendsEngine) return;

  const LOCATIONS_PATH = "data/Civication/map/phaseLocations.json";
  const FRIENDS_PATH = "data/Civication/map/friends.json";
  const SNAPSHOTS_PATH = "data/Civication/map/friendPhaseSnapshots.json";
  const PLAYER_SNAPSHOTS_KEY = "civi.playerPhaseSnapshots.v1";

  const DAY_PHASES = ["morning", "lunch", "afternoon", "evening", "day_end"];

  // Tilstander som aldri vises som figur på kartet.
  const HIDDEN_STATES = new Set(["unavailable", "offline_simulated"]);

  // Kort status-tekst pr. presence-state (norsk, brukervendt).
  const PRESENCE_TEXT = {
    walking_in_city: "Går rundt i byen",
    at_home: "Er hjemme",
    at_work: "Er på jobb",
    travelling: "På vei",
    training: "Trener",
    in_event: "På et arrangement",
    visiting_player: "Er innom deg",
    reflecting: "Reflekterer",
    unavailable: "Opptatt",
    offline_simulated: "Utilgjengelig"
  };

  // ---------------------------------------------------------------------------
  // Fase-minne (phase snapshots)
  // ---------------------------------------------------------------------------
  // Civication har semantiske livsfaser (morgen, arbeid, fritid, kveld,
  // refleksjon) som kartet bruker for å vise hver venns SISTE LAGREDE status i
  // nettopp den fasen spilleren selv er i. Dette er fase-minne, ikke live-status.
  const SNAPSHOT_PHASES = ["morning", "work", "leisure", "evening", "reflection"];

  // Kalenderens dagfaser -> semantisk Civication-fase brukt av fase-minnet.
  // Deterministisk oppslag, ingen klokkeslett-logikk på toppen av spillfasen.
  const DAY_PHASE_TO_SNAPSHOT = {
    morning: "morning",
    lunch: "work",
    afternoon: "leisure",
    evening: "evening",
    day_end: "evening"
  };

  // Semantisk fase -> representativ dagfase, brukt KUN som trygg fallback mot
  // friends.json presenceByPhase når et snapshot mangler for den aktive fasen.
  const SNAPSHOT_TO_DAY_PHASE = {
    morning: "morning",
    work: "lunch",
    leisure: "afternoon",
    evening: "evening",
    reflection: "day_end"
  };

  const SNAPSHOT_PHASE_LABEL = {
    morning: "Morgenfase",
    work: "Arbeidsfase",
    leisure: "Fritidsfase",
    evening: "Kveldsfase",
    reflection: "Refleksjonsfase"
  };

  // Brukervendt "sist sett"-tekst pr. fase (gjør det tydelig at dette er minne).
  const SNAPSHOT_LAST_SEEN_TEXT = {
    morning: "Sist sett i morgenfasen",
    work: "Siste arbeidsfase",
    leisure: "Siste fritidsfase",
    evening: "Siste kveldsfase",
    reflection: "Siste refleksjonsfase"
  };

  // Semantisk fase -> brukervendt frase ("i fritidsfasen"). Deterministisk.
  const SNAPSHOT_PHASE_IN_WORDS = {
    morning: "i morgenfasen",
    work: "i arbeidsfasen",
    leisure: "i fritidsfasen",
    evening: "i kveldsfasen",
    reflection: "i refleksjonsfasen"
  };

  // ---------------------------------------------------------------------------
  // Sosial tilgjengelighet (social availability)
  // ---------------------------------------------------------------------------
  // Enkel, eksplisitt tilstedeværelse for asynkrone sosiale møter. Dette er
  // IKKE live-status og IKKE GPS – det er en frivillig markering på spillerens/
  // vennens SISTE fasevalg om de er åpne for en henvendelse på det stedet.
  //   open_to_contact -> kan vises som mulig sosialt møte og henvendes til
  //   busy / private  -> vises ikke som sosialt møte på stedet
  //   hidden          -> verken på kart eller som møte
  const SOCIAL_AVAILABILITY_VALUES = ["open_to_contact", "busy", "private", "hidden"];

  const SOCIAL_AVAILABILITY_LABEL = {
    open_to_contact: "åpen for kontakt",
    busy: "opptatt",
    private: "privat",
    hidden: "skjult"
  };

  // Svarvalg en mottaker har på en sosial henvendelse (Mål 5).
  const SOCIAL_RESPONSE_OPTIONS = ["reply", "ignore", "decline"];

  // Stabil action-id for en henvendelse fra et sosialt sted (Mål 4/7).
  const SOCIAL_ENCOUNTER_ACTION = "approach";

  // action/svarvalg -> norsk knappetekst.
  const SOCIAL_RESPONSE_OPTION_LABEL = {
    approach: "Henvend deg",
    reply: "Svar",
    ignore: "Ignorer",
    decline: "Avvis"
  };

  let _locationsCache = null;
  let _friendsCache = null;
  let _snapshotsCache = null;

  // ---------------------------------------------------------------------------
  // Små rene hjelpere
  // ---------------------------------------------------------------------------
  function norm(value) {
    return String(value == null ? "" : value).trim();
  }

  function normalizePhase(phase) {
    const p = norm(phase).toLowerCase();
    return DAY_PHASES.includes(p) ? p : "morning";
  }

  // Normaliser til en gyldig semantisk fase-minne-fase. Godtar både semantiske
  // faser (morning/work/leisure/evening/reflection) og kalenderens dagfaser
  // (som mappes via DAY_PHASE_TO_SNAPSHOT).
  function normalizeSnapshotPhase(phase) {
    const p = norm(phase).toLowerCase();
    if (SNAPSHOT_PHASES.includes(p)) return p;
    if (DAY_PHASE_TO_SNAPSHOT[p]) return DAY_PHASE_TO_SNAPSHOT[p];
    return "morning";
  }

  function snapshotPhaseLabel(phase) {
    return SNAPSHOT_PHASE_LABEL[normalizeSnapshotPhase(phase)] || "Morgenfase";
  }

  function snapshotLastSeenText(phase) {
    return SNAPSHOT_LAST_SEEN_TEXT[normalizeSnapshotPhase(phase)] || "Sist sett";
  }

  function snapshotPhaseInWords(phase) {
    return SNAPSHOT_PHASE_IN_WORDS[normalizeSnapshotPhase(phase)] || "i fasen";
  }

  // Normaliser til en gyldig sosial tilgjengelighet. fallback brukes når verdien
  // mangler/er ugyldig (default "open_to_contact").
  function normalizeSocialAvailability(value, fallback) {
    const v = norm(value).toLowerCase();
    if (SOCIAL_AVAILABILITY_VALUES.includes(v)) return v;
    const fb = norm(fallback).toLowerCase();
    return SOCIAL_AVAILABILITY_VALUES.includes(fb) ? fb : "open_to_contact";
  }

  // social availability -> norsk label ("åpen for kontakt" …).
  function getSocialAvailabilityLabel(value) {
    return SOCIAL_AVAILABILITY_LABEL[normalizeSocialAvailability(value)] || "";
  }

  // svarvalg/approach -> norsk knappetekst ("Svar"/"Ignorer"/"Avvis"/"Henvend deg").
  function getResponseOptionLabel(option) {
    return SOCIAL_RESPONSE_OPTION_LABEL[norm(option).toLowerCase()] || "";
  }

  // Er denne tilstedeværelsen/verdien åpen for kontakt? Tar enten et presence-/
  // snapshot-objekt (leser .socialAvailability) eller en rå verdi.
  function isOpenToContact(presenceOrValue) {
    const v = presenceOrValue && typeof presenceOrValue === "object"
      ? presenceOrValue.socialAvailability
      : presenceOrValue;
    return normalizeSocialAvailability(v, "hidden") === "open_to_contact";
  }

  // ---------------------------------------------------------------------------
  // Brukervendte label-/tekst-hjelpere for vennedetaljen (rene, deterministiske)
  // ---------------------------------------------------------------------------
  // Stabile, testbare navn som UI-laget (og framtidige systemer) kan bygge på.
  // Alt er deterministisk: samme input gir alltid samme tekst, ingen klokke,
  // ingen tilfeldighet, ingen live-/GPS-data.

  // Semantisk fase -> norsk fase-label ("Morgenfase", "Arbeidsfase" …).
  function getPhaseLabel(phase) {
    return snapshotPhaseLabel(phase);
  }

  // Presence-state -> norsk, brukervendt status ("Er hjemme", "Trener" …).
  function getPresenceStateLabel(state) {
    return presenceText(state);
  }

  // Relasjonsnivå -> kort etikett. 0 = ny kontakt … 3+ = nær venn.
  function getRelationshipLabel(level) {
    const n = Number(level) || 0;
    if (n >= 3) return "nær venn";
    if (n === 2) return "venn";
    if (n === 1) return "bekjent";
    return "ny kontakt";
  }

  // Relasjonsnivå -> kort sosial tekst til profilkortet.
  function getRelationshipBlurb(level) {
    const n = Number(level) || 0;
    if (n >= 3) return "Dette er en nær venn i byen.";
    if (n === 2) return "Dere har begynt å bygge en relasjon.";
    if (n === 1) return "Dere kjenner hverandre litt.";
    return "Dere har akkurat blitt kjent i byen.";
  }

  // Norsk eieform som tåler navn på s/x/z (Kari -> Karis, Jonas -> Jonas').
  function possessiveName(name) {
    const n = norm(name);
    if (!n) return "";
    return /[sxzSXZ]$/.test(n) ? n + "'" : n + "s";
  }

  // Tydelig disclosure: fase-minne, IKKE live-posisjon. Brukes i vennedetaljen
  // slik at det aldri er tvil om at dette er simulert fasehistorikk.
  function getSnapshotDisclosureText(friendName, phase) {
    const who = possessiveName(friendName) || "Vennens";
    const phaseLabel = getPhaseLabel(phase).toLowerCase();
    return "Dette er " + who + " siste lagrede " + phaseLabel +
      " i Civication – simulert fasehistorikk, ikke live-posisjon.";
  }

  // Deterministisk hash (FNV-1a-aktig). Brukes kun som fallback når en venn
  // mangler eksplisitt presenceByPhase for en fase – aldri tilfeldig.
  function hashString(str) {
    let h = 2166136261;
    const s = String(str || "");
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function presenceText(state) {
    return PRESENCE_TEXT[norm(state)] || "Ute i byen";
  }

  function isHiddenState(state) {
    return HIDDEN_STATES.has(norm(state));
  }

  // ---------------------------------------------------------------------------
  // Presence-resolver (ren, deterministisk)
  // ---------------------------------------------------------------------------
  // Returnerer { state, locationId, activity, visibleOnMap } for en venn i en
  // gitt fase. Bruker eksplisitt presenceByPhase når den finnes, ellers en
  // deterministisk fallback basert på vennens hjem og en hash.
  function computePresence(friend, phase, dayIndex) {
    const ph = normalizePhase(phase);
    const byPhase = friend && friend.presenceByPhase && typeof friend.presenceByPhase === "object"
      ? friend.presenceByPhase
      : {};

    let entry = byPhase[ph];

    if (!entry || typeof entry !== "object") {
      entry = deterministicFallback(friend, ph, dayIndex);
    }

    const state = norm(entry.state) || "at_home";
    const homeId = norm(friend && friend.avatar && friend.avatar.homeId) || null;
    const locationId = norm(entry.locationId) || homeId;

    let visibleOnMap;
    if (typeof entry.visibleOnMap === "boolean") {
      visibleOnMap = entry.visibleOnMap;
    } else {
      visibleOnMap = !isHiddenState(state);
    }
    // Skjulte tilstander overstyrer alltid – ingen figur på kartet.
    if (isHiddenState(state)) visibleOnMap = false;

    return {
      state,
      locationId,
      activity: norm(entry.activity),
      visibleOnMap,
      statusText: presenceText(state)
    };
  }

  // Forutsigbar fallback: velger en tilstand ut fra fase + en hash av id-en.
  // Ingen Math.random – samme input gir samme output.
  function deterministicFallback(friend, phase, dayIndex) {
    const homeId = norm(friend && friend.avatar && friend.avatar.homeId) || null;
    const seed = hashString(`${friend && friend.id}:${phase}:${Number(dayIndex || 1)}`);

    if (phase === "morning" || phase === "day_end") {
      return { state: "at_home", locationId: homeId, activity: "hjemme" };
    }
    if (phase === "lunch") {
      return { state: "at_work", locationId: homeId, activity: "i arbeid" };
    }
    // afternoon / evening: enten ute i byen eller hjemme, deterministisk valgt.
    return (seed % 2 === 0)
      ? { state: "walking_in_city", locationId: homeId, activity: "ute i byen" }
      : { state: "at_home", locationId: homeId, activity: "hjemme" };
  }

  // ---------------------------------------------------------------------------
  // Liste-/oppslags-hjelpere (rene)
  // ---------------------------------------------------------------------------
  function locationById(locations, id) {
    const key = norm(id);
    if (!key) return null;
    return (Array.isArray(locations) ? locations : []).find((loc) => norm(loc && loc.id) === key) || null;
  }

  function activeLocations(locations, phase) {
    const ph = normalizePhase(phase);
    return (Array.isArray(locations) ? locations : []).filter((loc) => {
      const phases = Array.isArray(loc && loc.activePhases) ? loc.activePhases.map(norm) : [];
      // Ingen activePhases = alltid aktiv.
      return phases.length === 0 || phases.includes(ph);
    });
  }

  function isLocationActive(location, phase) {
    const phases = Array.isArray(location && location.activePhases) ? location.activePhases.map(norm) : [];
    return phases.length === 0 || phases.includes(normalizePhase(phase));
  }

  // Vennene med beregnet presence for en fase.
  function friendsForPhase(friends, phase, dayIndex) {
    return (Array.isArray(friends) ? friends : []).map((friend) => ({
      friend,
      presence: computePresence(friend, phase, dayIndex)
    }));
  }

  // Vennene som befinner seg på et gitt sted i en fase (kun synlige).
  function friendsAtLocation(friends, locationId, phase, dayIndex) {
    const key = norm(locationId);
    if (!key) return [];
    return friendsForPhase(friends, phase, dayIndex)
      .filter((row) => row.presence.visibleOnMap && norm(row.presence.locationId) === key);
  }

  // ---------------------------------------------------------------------------
  // Hjemmemodell for venner/personer (Del D)
  // ---------------------------------------------------------------------------
  // En venns "hjem" er avatar.homeId -> en location av type friend_home i
  // phaseLocations. Dette er et SIMULERT hjemmepunkt i spillet, IKKE en ekte
  // adresse og IKKE GPS. Modellen gjør hjemmet tydelig og trygt: den flagger
  // aldri en ekte privatadresse, og håndteres trygt når homeId mangler/peker
  // feil. Flere venner kan dele samme demo-hjem (Oda deler med Mariam) – det er
  // tillatt, men bør rapporteres som "shared demo home" i audit.

  function getFriendHomeId(friend) {
    return norm(friend && friend.avatar && friend.avatar.homeId) || null;
  }

  // Er en location et venne-hjem (type friend_home)?
  function isFriendHomeLocation(loc) {
    return norm(loc && loc.type) === "friend_home";
  }

  // Venens hjem-location (selve location-objektet) eller null.
  function getFriendHomeLocation(friend, locations) {
    const homeId = getFriendHomeId(friend);
    if (!homeId) return null;
    return locationById(locations, homeId);
  }

  // Kartanker for hjemmet: normalisert position og/eller mapZone. null når
  // hjemmet ikke kan slås opp.
  function getFriendHomeAnchor(friend, locations) {
    const loc = getFriendHomeLocation(friend, locations);
    if (!loc) return null;
    const pos = loc.position && typeof loc.position === "object" ? loc.position : null;
    const hasXY = pos && Number.isFinite(Number(pos.x)) && Number.isFinite(Number(pos.y));
    return {
      locationId: norm(loc.id),
      mapZone: norm(loc.mapZone) || null,
      position: hasXY ? { x: Number(pos.x), y: Number(pos.y) } : null,
      hasPosition: !!hasXY
    };
  }

  // Bakoverkompatibelt/forklarende alias.
  const resolveFriendHomeMapAnchor = getFriendHomeAnchor;

  // Brukervendt hjem-etikett. Spillkontekst ("simulert hjemmepunkt"/"hjem"),
  // aldri en fysisk adresse.
  function getFriendHomeLabel(friend, locations) {
    const loc = getFriendHomeLocation(friend, locations);
    if (loc && norm(loc.label)) return norm(loc.label);
    const first = friendFirstName(friend);
    return first && first !== "vennen" ? possessiveName(first) + " hjem" : "hjem";
  }

  // Samlet, tydelig hjemmemodell. anchorType "simulated_home",
  // isPrivateRealAddress=false, visibility "game_only" – aldri ekte adresse/GPS.
  function buildFriendHomeModel(friend, locations) {
    const f = friend && typeof friend === "object" ? friend : {};
    const homeId = getFriendHomeId(f);
    const loc = getFriendHomeLocation(f, locations);
    const anchor = getFriendHomeAnchor(f, locations);
    return {
      friendId: norm(f.id),
      homeId: homeId,
      label: getFriendHomeLabel(f, locations),
      mapZone: (loc && norm(loc.mapZone)) || null,
      position: anchor && anchor.position ? { x: anchor.position.x, y: anchor.position.y } : null,
      anchorType: "simulated_home",
      isPrivateRealAddress: false,
      visibility: "game_only",
      found: !!loc,
      isFriendHome: isFriendHomeLocation(loc),
      hasPosition: !!(anchor && anchor.hasPosition)
    };
  }

  // ---------------------------------------------------------------------------
  // Kartnode-klassifisering (Del A) – semantisk rolle pr. location
  // ---------------------------------------------------------------------------
  // Civication-kartet skiller mellom system-/spillnoder, venners hjem, ekte
  // sosiale steder (fra CivicationSocialPlaceResolver) og generiske sosiale
  // fallback-noder. Rene, deterministiske hjelpere som CityLayer og bymodellen
  // bruker for å rendre riktig og prioritere ekte socialPlaces. Ingen DOM/fetch.
  //
  // locationRole-verdier:
  //   system_node     – øvrige systembygg (NAV-kontor m.fl.)
  //   player_home     – spillerens hjem (id "home")
  //   work_node       – arbeidsplassen (id "workplace")
  //   insight_node    – Psykologirommet (id "psychology_room")
  //   friend_home     – venners simulerte hjem (type "friend_home")
  //   social_place    – ekte sosialt sted fra resolveren (sourcePlaceId + type)
  //   social_fallback – generisk sosial phaseLocation (cafe/park/football/…)
  const LOCATION_ROLES = {
    SYSTEM_NODE: "system_node",
    PLAYER_HOME: "player_home",
    WORK_NODE: "work_node",
    INSIGHT_NODE: "insight_node",
    FRIEND_HOME: "friend_home",
    SOCIAL_PLACE: "social_place",
    SOCIAL_FALLBACK: "social_fallback"
  };

  // Fast id -> rolle for system-/spillnodene som alltid skal vises.
  const SYSTEM_LOCATION_ROLE_BY_ID = {
    home: "player_home",
    workplace: "work_node",
    nav_office: "system_node",
    psychology_room: "insight_node"
  };

  // Generiske sosiale phaseLocations (id) -> socialPlaceType de "skygger for".
  // Når en ekte socialPlace av samme type finnes, kan den generiske noden tones
  // ned/skjules til fordel for det konkrete stedet.
  const GENERIC_SOCIAL_LOCATION_TYPE = {
    cafe: "coffee",
    park: "park_public_space",
    football: "sport_football",
    culture: "culture",
    gym: "sport_football",
    store: "retail_social"
  };

  // socialPlaceType for en generisk sosial phaseLocation, ellers null.
  function getGenericSocialPlaceType(loc) {
    const id = norm(loc && loc.id).toLowerCase();
    return GENERIC_SOCIAL_LOCATION_TYPE[id] || null;
  }

  // Er en location et ekte sosialt sted fra CivicationSocialPlaceResolver?
  // (Har både sourcePlaceId og socialPlaceType – brand-place eller place-only.)
  function isRealSocialPlace(loc) {
    const l = loc && typeof loc === "object" ? loc : {};
    return !!(norm(l.sourcePlaceId) && norm(l.socialPlaceType));
  }

  // Semantisk rolle for en location. Deterministisk; id-regler vinner, deretter
  // friend_home, deretter ekte sosialt sted, deretter generisk fallback.
  function getLocationRole(loc) {
    const l = loc && typeof loc === "object" ? loc : {};
    const id = norm(l.id).toLowerCase();
    if (SYSTEM_LOCATION_ROLE_BY_ID[id]) return SYSTEM_LOCATION_ROLE_BY_ID[id];
    if (isFriendHomeLocation(l)) return LOCATION_ROLES.FRIEND_HOME;
    if (isRealSocialPlace(l)) return LOCATION_ROLES.SOCIAL_PLACE;
    if (getGenericSocialPlaceType(l)) return LOCATION_ROLES.SOCIAL_FALLBACK;
    // Øvrige systembygg uten egen id-regel (butikk/service o.l.) -> systemnode.
    return LOCATION_ROLES.SYSTEM_NODE;
  }

  // Er dette en system-/spillnode (hjem, jobb, NAV, Psykologirommet, øvrige
  // systembygg)? Disse skjules ALDRI av sosiale steder.
  function isSystemLocation(loc) {
    const role = getLocationRole(loc);
    return role === LOCATION_ROLES.SYSTEM_NODE ||
      role === LOCATION_ROLES.PLAYER_HOME ||
      role === LOCATION_ROLES.WORK_NODE ||
      role === LOCATION_ROLES.INSIGHT_NODE;
  }

  // Er dette en generisk sosial fallback-node (cafe/park/football/culture/…)?
  function isGenericSocialFallback(loc) {
    return getLocationRole(loc) === LOCATION_ROLES.SOCIAL_FALLBACK;
  }

  // Hvilke socialPlaceType-er har ekte sosiale steder i en locations-liste?
  function getRealSocialPlaceTypes(locations) {
    const set = new Set();
    (Array.isArray(locations) ? locations : []).forEach((l) => {
      if (isRealSocialPlace(l)) {
        const t = norm(l.socialPlaceType);
        if (t) set.add(t);
      }
    });
    return set;
  }

  // Skal denne location rendres på bykartet i en gitt kontekst?
  //   - system-/spillnoder, venners hjem og ekte sosiale steder: alltid
  //   - generisk sosial fallback: kun når det IKKE finnes ekte sosiale steder av
  //     tilsvarende socialPlaceType (ellers skjules den til fordel for de
  //     konkrete stedene). Slik beholdes funksjonen når ingen ekte steder finnes.
  // context: { realSocialPlaceTypes?: Set|Array<string>, locations?: Array }
  function shouldRenderLocationOnCityMap(loc, context) {
    const ctx = context && typeof context === "object" ? context : {};
    if (getLocationRole(loc) !== LOCATION_ROLES.SOCIAL_FALLBACK) return true;
    const spt = getGenericSocialPlaceType(loc);
    if (!spt) return true;
    let types = ctx.realSocialPlaceTypes;
    if (types instanceof Set) { /* bruk som den er */ }
    else if (Array.isArray(types)) types = new Set(types.map(norm));
    else types = getRealSocialPlaceTypes(ctx.locations);
    return !types.has(spt);
  }

  // Sammenslåing av ekte sosiale steder inn i location-listen (dedup på id).
  // Holder engine uavhengig av resolveren (resolveren har en egen variant).
  function mergeSocialPlacesIntoLocations(locations, socialPlaces) {
    const base = (Array.isArray(locations) ? locations : []).slice();
    const seen = new Set(base.map((l) => norm(l && l.id)).filter(Boolean));
    (Array.isArray(socialPlaces) ? socialPlaces : []).forEach((sp) => {
      const id = norm(sp && sp.id);
      if (!id || seen.has(id)) return;
      seen.add(id);
      base.push(sp);
    });
    return base;
  }

  // ---------------------------------------------------------------------------
  // Fase-minne-resolver (ren, deterministisk)
  // ---------------------------------------------------------------------------
  // Slår opp et venne-snapshot for en gitt semantisk fase i en snapshots-array
  // (formen til friendPhaseSnapshots.json). Returnerer rå snapshot-objekt eller
  // null. Ren funksjon – ingen fetch, ingen cache.
  function snapshotEntryFor(snapshots, friendId, phase) {
    const fid = norm(friendId);
    const ph = normalizeSnapshotPhase(phase);
    if (!fid) return null;
    const list = Array.isArray(snapshots) ? snapshots : [];
    const record = list.find((r) => norm(r && r.friendId) === fid);
    if (!record || !record.snapshots || typeof record.snapshots !== "object") return null;
    const entry = record.snapshots[ph];
    return entry && typeof entry === "object" ? entry : null;
  }

  // Bygger et presence-objekt ut fra et rått snapshot. Beholder samme form som
  // computePresence, men legger til fase-minne-felt (mood, source, isSnapshot …).
  function presenceFromSnapshot(friend, phase, entry) {
    const ph = normalizeSnapshotPhase(phase);
    const state = norm(entry.state) || "at_home";
    const homeId = norm(friend && friend.avatar && friend.avatar.homeId) || null;
    const locationId = norm(entry.locationId) || homeId;

    let visibleOnMap;
    if (typeof entry.visibleOnMap === "boolean") {
      visibleOnMap = entry.visibleOnMap;
    } else {
      visibleOnMap = !isHiddenState(state);
    }
    if (isHiddenState(state)) visibleOnMap = false;

    const socialAvailability = normalizeSocialAvailability(
      entry.socialAvailability,
      visibleOnMap ? "open_to_contact" : "hidden"
    );

    return {
      state,
      locationId,
      activity: norm(entry.activity),
      mood: norm(entry.mood),
      visibleOnMap,
      socialAvailability,
      statusText: presenceText(state),
      source: "snapshot",
      isSnapshot: true,
      phase: ph,
      snapshotPhaseLabel: snapshotPhaseLabel(ph),
      lastSeenText: snapshotLastSeenText(ph),
      updatedAtLabel: norm(entry.updatedAtLabel)
    };
  }

  // Avgjør hvilken status kartet skal vise for en venn i den aktive fasen.
  // Prioritet:
  //   1) Snapshot for fasen (fase-minne) – vinner alltid hvis det finnes.
  //   2) Trygg fallback: friends.json presenceByPhase for tilsvarende dagfase.
  //   3) Ingen fasehistorikk -> skjult (visibleOnMap=false, source="none").
  // Ren og deterministisk: samme (friend, phase, snapshots) gir samme resultat.
  function resolveFriendMapPresence(friend, phase, snapshots, dayIndex) {
    const ph = normalizeSnapshotPhase(phase);
    const entry = snapshotEntryFor(snapshots, friend && friend.id, ph);
    if (entry) {
      return presenceFromSnapshot(friend, ph, entry);
    }

    // Fallback til eksisterende presence hvis vennen har den dagfasen.
    const dayPhase = SNAPSHOT_TO_DAY_PHASE[ph] || "morning";
    const byPhase = friend && friend.presenceByPhase && typeof friend.presenceByPhase === "object"
      ? friend.presenceByPhase
      : {};
    if (byPhase[dayPhase] && typeof byPhase[dayPhase] === "object") {
      const fallback = computePresence(friend, dayPhase, dayIndex);
      return {
        ...fallback,
        mood: "",
        // Fallback er IKKE et ekte fasevalg -> aldri et sosialt møte på stedet.
        socialAvailability: fallback.visibleOnMap ? "open_to_contact" : "hidden",
        source: "presence_fallback",
        isSnapshot: false,
        phase: ph,
        snapshotPhaseLabel: snapshotPhaseLabel(ph),
        lastSeenText: snapshotLastSeenText(ph),
        updatedAtLabel: ""
      };
    }

    // Verken snapshot eller fallback: skjul vennen trygt.
    return {
      state: "no_history",
      locationId: null,
      activity: "",
      mood: "",
      visibleOnMap: false,
      socialAvailability: "hidden",
      statusText: "Ingen fasehistorikk ennå",
      source: "none",
      isSnapshot: false,
      phase: ph,
      snapshotPhaseLabel: snapshotPhaseLabel(ph),
      lastSeenText: snapshotLastSeenText(ph),
      updatedAtLabel: ""
    };
  }

  // Vennene med resolvet fase-minne-presence for en semantisk fase.
  function friendSnapshotRows(friends, phase, snapshots, dayIndex) {
    return (Array.isArray(friends) ? friends : []).map((friend) => ({
      friend,
      presence: resolveFriendMapPresence(friend, phase, snapshots, dayIndex)
    }));
  }

  // ---------------------------------------------------------------------------
  // Vennehandlinger – datadrevet action-router (rent, deterministisk)
  // ---------------------------------------------------------------------------
  // Når spilleren trykker på en handling i vennens profilkort skal Civication
  // svare med riktig sosial spillflyt. Alt her er rene, deterministiske
  // hjelpere som UI-laget (CivicationCityLayer) bruker – ingen DOM, ingen
  // fetch, ingen live-/GPS-posisjon. "snapshot" betyr ALLTID vennens siste
  // lagrede fase-status (fase-minne), aldri sanntidsposisjon.

  // Stabile action-id-er for vennehandlingene. Endres aldri – UI, event-hooks
  // og framtidige systemer bygger på disse.
  const FRIEND_ACTIONS = ["message", "visit", "invite", "profile"];

  const FRIEND_ACTION_LABEL = {
    message: "Send melding",
    visit: "Besøk",
    invite: "Inviter",
    profile: "Se profil"
  };

  // Handlinger routeren kan bygge en modell for. UI-laget bruker rekken
  // message/approach/invite/profile; "visit" beholdes som bakoverkompatibel
  // intern handling (gamle data/tester), men er ikke lenger hovedhandling i UI.
  const ROUTABLE_FRIEND_ACTIONS = FRIEND_ACTIONS.concat(["approach"]);

  function isRoutableFriendAction(action) {
    return ROUTABLE_FRIEND_ACTIONS.includes(norm(action).toLowerCase());
  }

  // Fase -> kort "sted-ord" brukt i resultattekst ("siste morgensted" …).
  // Bevisst formulert som SISTE/minne, aldri som "er nå på".
  const SNAPSHOT_PHASE_PLACE_WORD = {
    morning: "morgensted",
    work: "arbeidssted",
    leisure: "fritidssted",
    evening: "kveldssted",
    reflection: "refleksjonssted"
  };

  // Fasebasert grunnetikett for invitasjoner. Kan forfines av stedstype.
  const INVITE_LABEL_BY_PHASE = {
    morning: "Inviter til kaffe",
    work: "Inviter til pause etter jobb",
    leisure: "Inviter til kafé eller park",
    evening: "Inviter hjem til kvelden",
    reflection: "Inviter til refleksjon"
  };

  // action-id -> norsk knappetekst ("Send melding", "Besøk" …).
  function getFriendActionLabel(action) {
    return FRIEND_ACTION_LABEL[norm(action).toLowerCase()] || "";
  }

  function isFriendAction(action) {
    return FRIEND_ACTIONS.includes(norm(action).toLowerCase());
  }

  // Fasebasert invitasjonsetikett, forfinet av stedstype når det er relevant.
  // Eksempler: morgen -> "Inviter til kaffe"; leisure+park -> "Inviter til park".
  function getInviteLabelForPhase(phase, locationType) {
    const ph = normalizeSnapshotPhase(phase);
    const type = norm(locationType).toLowerCase();
    if (ph === "leisure") {
      if (type === "training") return "Inviter til trening";
      if (type === "cafe") return "Inviter til kafé";
      if (type === "park") return "Inviter til park";
      return INVITE_LABEL_BY_PHASE.leisure;
    }
    if (ph === "reflection") {
      if (type === "insight") return "Inviter til Psykologirommet";
      return INVITE_LABEL_BY_PHASE.reflection;
    }
    return INVITE_LABEL_BY_PHASE[ph] || "Inviter til noe senere";
  }

  // Finn stedet en handling skal peke mot for en venn i en fase. Bruker
  // snapshotets locationId (fase-minne), faller tilbake til vennens hjem.
  // Returnerer stedmetadata fra phaseLocations (label/type/icon/mapZone).
  function resolveFriendActionTargetLocation(friend, snapshot, phase, locations) {
    const snap = snapshot && typeof snapshot === "object" ? snapshot : {};
    const homeId = norm(friend && friend.avatar && friend.avatar.homeId) || null;
    const locationId = norm(snap.locationId) || homeId || null;
    const loc = locationById(locations, locationId);
    return {
      locationId: locationId,
      label: loc ? norm(loc.label) || locationId : (locationId || ""),
      type: loc ? norm(loc.type) : "",
      icon: loc ? norm(loc.icon) : "",
      mapZone: loc ? norm(loc.mapZone) : "",
      channel: loc ? norm(loc.channel) : "",
      found: !!loc,
      fromHome: !norm(snap.locationId) && !!homeId
    };
  }

  function friendFirstName(friend) {
    const name = norm(friend && friend.name) || "vennen";
    return name.split(/\s+/)[0] || name;
  }

  // Brukervendt resultattekst pr. handling. Bevisst formulert som forberedt/
  // lagret/minne – aldri som live-posisjon. locations er valgfri (5. arg) og
  // brukes kun for å slå opp et lesbart stednavn til besøkstekst.
  function getFriendActionResultText(action, friend, snapshot, phase, locations) {
    const act = norm(action).toLowerCase();
    const first = friendFirstName(friend);
    const ph = normalizeSnapshotPhase(phase);
    const phaseLbl = snapshotPhaseLabel(ph).toLowerCase();
    const snap = snapshot && typeof snapshot === "object" ? snapshot : {};

    if (act === "message") {
      return "Melding til " + first + " er klar.";
    }
    if (act === "visit") {
      const placeWord = SNAPSHOT_PHASE_PLACE_WORD[ph] || "sted";
      let placeLabel = norm(snap.locationLabel);
      if (!placeLabel) {
        const loc = locationById(locations, snap.locationId);
        placeLabel = loc ? norm(loc.label) : norm(snap.locationId);
      }
      if (!placeLabel) placeLabel = "et sted";
      return "Du ser " + possessiveName(first) + " siste " + placeWord + ": " + placeLabel + ".";
    }
    if (act === "invite") {
      return "Invitasjon til " + first + " er laget for " + phaseLbl + ".";
    }
    if (act === "profile") {
      return "Viser profil for " + first + ".";
    }
    return "";
  }

  // ---- Action-byggere (returnerer rene action-modeller) ----------------------

  // Send melding: forbereder en personlig melding til vennen. Lokalt
  // action-state + stabil event-hook (civi:openPrivateMessage) som senere kan
  // kobles til et fullt privat meldingssystem. Muterer ikke innboksen her.
  function buildFriendMessageAction(friend, snapshot, phase, locations) {
    const ph = normalizeSnapshotPhase(phase);
    return {
      action: "message",
      intent: "message",
      friendId: norm(friend && friend.id),
      friendName: norm(friend && friend.name) || "vennen",
      phase: ph,
      label: getFriendActionLabel("message"),
      event: "civi:openPrivateMessage",
      status: "drafted",
      isSimulated: true,
      resultText: getFriendActionResultText("message", friend, snapshot, ph, locations)
    };
  }

  // Besøk: peker mot vennens siste simulerte sted for den aktive fasen. Dette
  // er simulert besøk i Civication (fase-minne), ikke fysisk posisjon.
  function buildFriendVisitAction(friend, snapshot, phase, locations) {
    const ph = normalizeSnapshotPhase(phase);
    const snap = snapshot && typeof snapshot === "object" ? snapshot : {};
    const target = resolveFriendActionTargetLocation(friend, snap, ph, locations);
    return {
      action: "visit",
      intent: "visit",
      friendId: norm(friend && friend.id),
      friendName: norm(friend && friend.name) || "vennen",
      phase: ph,
      locationId: target.locationId,
      locationLabel: target.label,
      locationType: target.type,
      locationIcon: target.icon,
      lastActivity: norm(snap.activity),
      lastSeenText: norm(snap.lastSeenText) || snapshotLastSeenText(ph),
      mood: norm(snap.mood),
      isSimulated: true,
      status: "ready",
      label: getFriendActionLabel("visit"),
      resultText: getFriendActionResultText("visit", friend, snap, ph, locations)
    };
  }

  // Henvend deg (fra vennens profilkort): bygger en personlig HENVENDELSE til
  // vennen som kobles til Personlige meldinger via CivicationFriendMessages
  // (privat kanal, aldri jobb). Bruker vennens siste fase/presence-locationId
  // som kontekst når den finnes; mangler den, lages en generell personlig
  // henvendelse uten konkret sted. Ekte stedskobling (sourcePlaceId/brandId/
  // socialPlaceType) følger med når målet er et CivicationSocialPlaceResolver-sted.
  // Setter ALDRI jobb-/karrierefelt.
  function buildFriendApproachAction(friend, snapshot, phase, locations) {
    const ph = normalizeSnapshotPhase(phase);
    const snap = snapshot && typeof snapshot === "object" ? snapshot : {};
    const target = resolveFriendActionTargetLocation(friend, snap, ph, locations);
    const loc = locationById(locations, target.locationId) || {};
    const model = {
      action: SOCIAL_ENCOUNTER_ACTION,
      intent: "approach",
      friendId: norm(friend && friend.id),
      friendName: norm(friend && friend.name) || "vennen",
      phase: ph,
      locationId: target.locationId || null,
      locationLabel: target.found ? target.label : "",
      label: getResponseOptionLabel(SOCIAL_ENCOUNTER_ACTION) || "Henvend deg",
      // Sosial henvendelse: privat kanal, svarbar (reply/ignore/decline).
      status: "pending_response",
      responseOptions: SOCIAL_RESPONSE_OPTIONS.slice(),
      source: "civication_social_encounter",
      isSimulated: true,
      resultText: getApproachActionResultText(friend, snap, ph, loc)
    };
    if (norm(loc.sourcePlaceId)) model.sourcePlaceId = norm(loc.sourcePlaceId);
    if (norm(loc.brandId)) model.brandId = norm(loc.brandId);
    if (norm(loc.socialPlaceType)) model.socialPlaceType = norm(loc.socialPlaceType);
    if (norm(loc.placeLabel)) model.placeLabel = norm(loc.placeLabel);
    return model;
  }

  // Inviter: lager en enkel, lokal sosial invitasjon knyttet til aktiv fase og
  // relevant sted. Trenger ingen backend – ren lokal spillhandling.
  function buildFriendInviteAction(friend, snapshot, phase, locations) {
    const ph = normalizeSnapshotPhase(phase);
    const snap = snapshot && typeof snapshot === "object" ? snapshot : {};
    const target = resolveFriendActionTargetLocation(friend, snap, ph, locations);
    return {
      action: "invite",
      intent: "invite",
      friendId: norm(friend && friend.id),
      friendName: norm(friend && friend.name) || "vennen",
      phase: ph,
      locationId: target.locationId,
      locationLabel: target.label,
      label: getInviteLabelForPhase(ph, target.type),
      status: "drafted",
      isSimulated: true,
      resultText: getFriendActionResultText("invite", friend, snap, ph, locations)
    };
  }

  // Se profil: returnerer en samlet profilmodell for vennen + siste snapshot for
  // aktiv fase. Tydelig merket som simulert fasehistorikk.
  function buildFriendProfileAction(friend, snapshot, phase, locations) {
    const ph = normalizeSnapshotPhase(phase);
    const f = friend && typeof friend === "object" ? friend : {};
    const avatar = f.avatar || {};
    const snap = snapshot && typeof snapshot === "object" ? snapshot : {};
    const homeLoc = locationById(locations, avatar.homeId);
    const snapLoc = locationById(locations, snap.locationId);
    const rel = Number(f.relationshipLevel) || 0;
    const hasHistory = norm(snap.source) !== "none" && norm(snap.source) !== "";
    return {
      action: "profile",
      intent: "profile",
      friendId: norm(f.id),
      friendName: norm(f.name) || "vennen",
      name: norm(f.name),
      role: norm(f.role),
      relationshipLevel: rel,
      relationshipLabel: getRelationshipLabel(rel),
      relationshipBlurb: getRelationshipBlurb(rel),
      style: norm(avatar.style),
      clothes: norm(avatar.clothes),
      vehicle: norm(avatar.vehicle),
      home: homeLoc ? norm(homeLoc.label) : (norm(avatar.homeId) || ""),
      homeId: norm(avatar.homeId),
      phase: ph,
      phaseLabel: snapshotPhaseLabel(ph),
      lastSeenText: norm(snap.lastSeenText) || snapshotLastSeenText(ph),
      lastSnapshot: {
        phase: ph,
        state: norm(snap.state),
        statusText: norm(snap.statusText),
        locationId: norm(snap.locationId),
        locationLabel: snapLoc ? norm(snapLoc.label) : (norm(snap.locationId) || ""),
        activity: norm(snap.activity),
        mood: norm(snap.mood),
        source: norm(snap.source)
      },
      hasHistory: hasHistory,
      disclosure: getSnapshotDisclosureText(norm(f.name), ph),
      navigateSection: "civiPeopleSection",
      status: "open",
      isSimulated: true,
      resultText: getFriendActionResultText("profile", friend, snap, ph, locations)
    };
  }

  // Resolver felles kontekst for en vennehandling: finn vennen, hennes siste
  // fase-minne for aktiv fase (med trygg fallback til presenceByPhase) og
  // målstedet. Bruker eksplisitt data fra opts når oppgitt, ellers cachen.
  function resolveFriendActionContext(friendId, activePhase, opts) {
    const o = opts && typeof opts === "object" ? opts : {};
    const friends = Array.isArray(o.friends) ? o.friends : (_friendsCache || []);
    const snapshots = Array.isArray(o.snapshots) ? o.snapshots : (_snapshotsCache || []);
    const locations = Array.isArray(o.locations) ? o.locations : (_locationsCache || []);
    const dayIndex = o.dayIndex != null ? Number(o.dayIndex) : 1;
    const ph = normalizeSnapshotPhase(activePhase);
    const fid = norm(friendId);
    const friend = friends.find((f) => norm(f && f.id) === fid) || null;
    const snapshot = friend ? resolveFriendMapPresence(friend, ph, snapshots, dayIndex) : null;
    const target = friend ? resolveFriendActionTargetLocation(friend, snapshot, ph, locations) : null;
    return {
      found: !!friend,
      friendId: fid,
      friend: friend,
      snapshot: snapshot,
      phase: ph,
      locations: locations,
      target: target
    };
  }

  // Hoved-router: tar (action, friendId, context) og returnerer et resultat
  // med en action-modell. context kan inneholde rådata (friends/snapshots/
  // locations/dayIndex) og enten "phase" eller en ferdig resolvet "friend"/
  // "snapshot". Ren funksjon – ingen DOM/events; UI-laget håndterer effekter.
  function handleFriendAction(action, friendId, context) {
    const act = norm(action).toLowerCase();
    const ctxIn = context && typeof context === "object" ? context : {};

    if (!isRoutableFriendAction(act)) {
      return { ok: false, action: act, friendId: norm(friendId), reason: "unknown_action" };
    }

    const phaseArg = ctxIn.phase != null ? ctxIn.phase : ctxIn.activePhase;
    const ctx = ctxIn.friend
      ? {
          found: true,
          friendId: norm(ctxIn.friend.id),
          friend: ctxIn.friend,
          snapshot: ctxIn.snapshot || null,
          phase: normalizeSnapshotPhase(phaseArg),
          locations: Array.isArray(ctxIn.locations) ? ctxIn.locations : (_locationsCache || []),
          target: null
        }
      : resolveFriendActionContext(friendId, phaseArg, ctxIn);

    if (!ctx.found || !ctx.friend) {
      return { ok: false, action: act, friendId: norm(friendId), reason: "friend_not_found" };
    }

    const { friend, snapshot, phase, locations } = ctx;
    let model = null;
    if (act === "message") model = buildFriendMessageAction(friend, snapshot, phase, locations);
    else if (act === "approach") model = buildFriendApproachAction(friend, snapshot, phase, locations);
    else if (act === "visit") model = buildFriendVisitAction(friend, snapshot, phase, locations);
    else if (act === "invite") model = buildFriendInviteAction(friend, snapshot, phase, locations);
    else if (act === "profile") model = buildFriendProfileAction(friend, snapshot, phase, locations);

    return {
      ok: true,
      action: act,
      friendId: norm(friend.id),
      phase: phase,
      model: model
    };
  }

  // ---------------------------------------------------------------------------
  // Stedsbaserte sosiale møter (asynkron sosial tilstedeværelse)
  // ---------------------------------------------------------------------------
  // Kjerneidé: når en spiller/venn etterlater sitt SISTE FASEVALG på et sosialt
  // sted (samme phase + samme locationId), kan andre som senere velger samme
  // sted i samme fase se dette som et "møte" og sende en "henvendelse".
  //
  // Dette er IKKE live multiplayer, IKKE GPS, IKKE fysisk posisjon – kun
  // asynkron sosial tilstedeværelse basert på siste fasevalg. Alle funksjonene
  // her er rene og deterministiske: samme (phase, locationId, data) gir alltid
  // samme møteliste.

  // Kort, brukervendt møte-tekst: "Mariam — Barista — avslappet — «aktivitet»".
  function getSocialEncounterText(friend, snapshot, phase, location) {
    const first = friendFirstName(friend);
    const snap = snapshot && typeof snapshot === "object" ? snapshot : {};
    const role = norm(friend && friend.role);
    const activity = norm(snap.activity);
    const parts = [first];
    if (role) parts.push(role);
    if (norm(snap.mood)) parts.push(norm(snap.mood));
    if (activity) parts.push("«" + activity + "»");
    return parts.join(" — ");
  }

  // Resultattekst når spilleren henvender seg til en person på et sted. Bevisst
  // formulert som siste fasevalg, aldri som live-posisjon.
  function getApproachActionResultText(friend, snapshot, phase, location) {
    const first = friendFirstName(friend);
    const ph = normalizeSnapshotPhase(phase);
    const snap = snapshot && typeof snapshot === "object" ? snapshot : {};
    const loc = location && typeof location === "object" ? location : {};
    let placeLabel = norm(loc.label) || norm(snap.locationId) || norm(snap.locationLabel);
    if (!placeLabel) placeLabel = "stedet";
    return "Du henvender deg til " + first + " på " + placeLabel.toLowerCase() +
      " " + snapshotPhaseInWords(ph) + ".";
  }

  // Bygger en ren sosial møte-modell for en venn på et sted i en fase. Tar
  // vennens fase-snapshot (siste fasevalg) eksplisitt, så den er testbar.
  function buildSocialEncounterModel(friend, snapshot, phase, location) {
    const ph = normalizeSnapshotPhase(phase);
    const f = friend && typeof friend === "object" ? friend : {};
    const snap = snapshot && typeof snapshot === "object" ? snapshot : {};
    const loc = location && typeof location === "object" ? location : {};
    const availability = normalizeSocialAvailability(
      snap.socialAvailability,
      snap.visibleOnMap ? "open_to_contact" : "hidden"
    );
    const locationId = norm(snap.locationId) || norm(loc.id);
    return {
      friendId: norm(f.id),
      friendName: norm(f.name) || "vennen",
      role: norm(f.role),
      phase: ph,
      phaseLabel: snapshotPhaseLabel(ph),
      locationId: locationId,
      locationLabel: norm(loc.label) || locationId,
      // Ekte stedskobling når stedet er et CivicationSocialPlaceResolver-sted.
      sourcePlaceId: norm(loc.sourcePlaceId) || null,
      brandId: norm(loc.brandId) || null,
      socialPlaceType: norm(loc.socialPlaceType) || null,
      placeLabel: norm(loc.placeLabel) || null,
      activity: norm(snap.activity),
      mood: norm(snap.mood),
      socialAvailability: availability,
      socialAvailabilityLabel: getSocialAvailabilityLabel(availability),
      lastSeenText: norm(snap.lastSeenText) || snapshotLastSeenText(ph),
      // Stabil action-id for "Henvend deg" (Mål 4).
      action: SOCIAL_ENCOUNTER_ACTION,
      actionLabel: getResponseOptionLabel(SOCIAL_ENCOUNTER_ACTION),
      encounterText: getSocialEncounterText(f, snap, ph, loc),
      // Svarvalg mottakeren senere får (Mål 5).
      responseOptions: SOCIAL_RESPONSE_OPTIONS.slice(),
      isSimulated: true
    };
  }

  // Rene rader: venner med EKTE fase-snapshot på samme sted i samme fase som er
  // synlige og åpne for kontakt. Mangler snapshot (kun presence-fallback/ingen
  // historikk) -> personen vises ALDRI som sosialt møte på stedet.
  function getVisibleFriendsAtSamePhaseLocation(phase, locationId, friendsArg, snapshotsArg, dayIndex) {
    const ph = normalizeSnapshotPhase(phase);
    const key = norm(locationId);
    if (!key) return [];
    const friends = Array.isArray(friendsArg) ? friendsArg : (_friendsCache || []);
    const snapshots = Array.isArray(snapshotsArg) ? snapshotsArg : (_snapshotsCache || []);
    return friendSnapshotRows(friends, ph, snapshots, dayIndex).filter((row) => {
      const p = row.presence;
      return p &&
        p.source === "snapshot" &&            // kun ekte siste fasevalg
        p.visibleOnMap === true &&
        norm(p.locationId) === key &&         // samme sted i siste fase
        isOpenToContact(p);                   // open_to_contact
    });
  }

  // Sosiale møte-modeller for et sted i en fase. opts kan bære rådata
  // (friends/snapshots/locations/dayIndex) for testing uten fetch/cache.
  function getSocialEncountersForLocation(phase, locationId, opts) {
    const o = opts && typeof opts === "object" ? opts : {};
    const friends = Array.isArray(o.friends) ? o.friends : (_friendsCache || []);
    const snapshots = Array.isArray(o.snapshots) ? o.snapshots : (_snapshotsCache || []);
    const locations = Array.isArray(o.locations) ? o.locations : (_locationsCache || []);
    const dayIndex = o.dayIndex != null ? Number(o.dayIndex) : 1;
    const ph = normalizeSnapshotPhase(phase);
    const key = norm(locationId);
    const location = locationById(locations, key);
    return getVisibleFriendsAtSamePhaseLocation(ph, key, friends, snapshots, dayIndex)
      .map((row) => buildSocialEncounterModel(row.friend, row.presence, ph, location));
  }

  // Kan spilleren henvende seg til denne vennen på dette stedet i denne fasen?
  function canApproachFriendAtLocation(friendId, phase, locationId, opts) {
    const fid = norm(friendId);
    if (!fid) return false;
    return getSocialEncountersForLocation(phase, locationId, opts)
      .some((enc) => enc.friendId === fid);
  }

  // ---------------------------------------------------------------------------
  // Runtime-kontekst (fase/dag fra kalenderen)
  // ---------------------------------------------------------------------------
  function getCurrentPhase() {
    return normalizePhase(window.CivicationCalendar?.getPhase?.() || "morning");
  }

  // Hvilken semantisk Civication-fase er spilleren i nå? Mapper kalenderens
  // dagfase til fase-minne-fasen. Kan overstyres med et eksplisitt argument
  // (f.eks. når refleksjon/psykologirommet er åpent).
  function getActivePhase(dayPhaseArg) {
    const dayPhase = dayPhaseArg != null ? normalizePhase(dayPhaseArg) : getCurrentPhase();
    return DAY_PHASE_TO_SNAPSHOT[dayPhase] || "morning";
  }

  function getDayIndex() {
    const clock = window.CivicationCalendar?.getClock?.() || {};
    return Number(clock.dayIndex || 1);
  }

  // ---------------------------------------------------------------------------
  // Async lasting (cachet)
  // ---------------------------------------------------------------------------
  async function fetchJson(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    return res.json();
  }

  async function loadLocations() {
    if (Array.isArray(_locationsCache)) return _locationsCache;
    try {
      const json = await fetchJson(LOCATIONS_PATH);
      _locationsCache = Array.isArray(json && json.phaseLocations) ? json.phaseLocations : [];
    } catch (e) {
      console.warn("[CivicationFriendsEngine] kunne ikke laste phaseLocations:", (e && e.message) || e);
      _locationsCache = [];
    }
    return _locationsCache;
  }

  async function loadFriends() {
    if (Array.isArray(_friendsCache)) return _friendsCache;
    try {
      const json = await fetchJson(FRIENDS_PATH);
      _friendsCache = Array.isArray(json && json.friends) ? json.friends : [];
    } catch (e) {
      console.warn("[CivicationFriendsEngine] kunne ikke laste friends:", (e && e.message) || e);
      _friendsCache = [];
    }
    return _friendsCache;
  }

  async function loadSnapshots() {
    if (Array.isArray(_snapshotsCache)) return _snapshotsCache;
    try {
      const json = await fetchJson(SNAPSHOTS_PATH);
      _snapshotsCache = Array.isArray(json && json.friendPhaseSnapshots) ? json.friendPhaseSnapshots : [];
    } catch (e) {
      // Fase-minne er valgfritt – uten fil faller motoren tilbake til presence.
      console.warn("[CivicationFriendsEngine] kunne ikke laste friendPhaseSnapshots:", (e && e.message) || e);
      _snapshotsCache = [];
    }
    return _snapshotsCache;
  }

  async function loadData() {
    const [locations, friends, snapshots] = await Promise.all([
      loadLocations(),
      loadFriends(),
      loadSnapshots()
    ]);
    return { locations, friends, snapshots };
  }

  // ---------------------------------------------------------------------------
  // Runtime-bekvemmelighet for fase-minne (bruker cache, men kan ta eksplisitt
  // data som siste argument – nyttig for testing uten fetch).
  // ---------------------------------------------------------------------------
  function getFriendSnapshotForPhase(friendId, phase, snapshotsArg) {
    const snapshots = Array.isArray(snapshotsArg) ? snapshotsArg : (_snapshotsCache || []);
    return snapshotEntryFor(snapshots, friendId, phase);
  }

  function getVisibleFriendSnapshotsForPhase(phase, friendsArg, snapshotsArg, dayIndex) {
    const friends = Array.isArray(friendsArg) ? friendsArg : (_friendsCache || []);
    const snapshots = Array.isArray(snapshotsArg) ? snapshotsArg : (_snapshotsCache || []);
    return friendSnapshotRows(friends, phase, snapshots, dayIndex)
      .filter((row) => row.presence && row.presence.visibleOnMap);
  }

  function getFriendsAtLocationForPhase(locationId, phase, friendsArg, snapshotsArg, dayIndex) {
    const key = norm(locationId);
    if (!key) return [];
    return getVisibleFriendSnapshotsForPhase(phase, friendsArg, snapshotsArg, dayIndex)
      .filter((row) => norm(row.presence.locationId) === key);
  }

  // ---------------------------------------------------------------------------
  // Lokalt spiller-fase-minne (player phase snapshots)
  // ---------------------------------------------------------------------------
  // Når spilleren spiller en fase (morgen/arbeid/fritid/kveld/refleksjon) lagrer
  // vi spillerens EGEN siste status for nettopp den fasen – på samme form som
  // venners fase-minne (friendPhaseSnapshots.json). Dette er grunnlaget for at
  // spilleren senere kan etterlate sin siste fase i byen for venner.
  //
  // Ingen backend/nettverk her: lagres i minne, speiles til localStorage hvis
  // tilgjengelig. Ingen GPS / live-posisjon / tidsstempel – kun deterministisk
  // fase-minne slik at testing er forutsigbar.

  // Deterministiske standardverdier pr. semantisk fase. Brukes når spilleren er
  // i en fase uten at et eksplisitt sted/aktivitet er oppgitt. locationId peker
  // til ekte steder i phaseLocations.json. channel speiler hvilken kanal/type
  // fasen tilhører (job/private/leisure/reflection), kompatibelt med kartdata.
  const PLAYER_PHASE_DEFAULTS = {
    morning: {
      state: "at_home",
      locationId: "home",
      activity: "starter dagen hjemme",
      mood: "rolig",
      updatedAtLabel: "sist morgenrunde",
      channel: "private",
      socialAvailability: "private"
    },
    work: {
      state: "at_work",
      locationId: "workplace",
      activity: "jobber med dagens oppgaver",
      mood: "fokusert",
      updatedAtLabel: "sist arbeidsrunde",
      channel: "job",
      socialAvailability: "busy"
    },
    leisure: {
      state: "walking_in_city",
      locationId: "park",
      activity: "tar en pause ute i byen",
      mood: "avslappet",
      updatedAtLabel: "sist fritidsrunde",
      channel: "leisure",
      socialAvailability: "open_to_contact"
    },
    evening: {
      state: "at_home",
      locationId: "home",
      activity: "roer ned hjemme",
      mood: "rolig",
      updatedAtLabel: "sist kveldsrunde",
      channel: "private",
      socialAvailability: "private"
    },
    reflection: {
      state: "reflecting",
      locationId: "psychology_room",
      activity: "reflekterer over dagen",
      mood: "ettertenksom",
      updatedAtLabel: "sist refleksjonsrunde",
      channel: "reflection",
      socialAvailability: "private"
    }
  };

  // Sosiale steder spilleren kan velge -> deterministisk state/aktivitet/
  // sosial tilgjengelighet for player-snapshotet. Keyed på stedets id (vinner)
  // og ellers stedstype. Speiler aktivitetene i oppgavens kjerneeksempler.
  const SOCIAL_PLACE_BY_ID = {
    football: { state: "at_match", activity: "drar på kamp", socialAvailability: "open_to_contact" },
    gym: { state: "at_training", activity: "går på trening", socialAvailability: "open_to_contact" },
    psychology_room: { state: "reflecting", activity: "går i Psykologirommet", socialAvailability: "private" }
  };

  const SOCIAL_PLACE_BY_TYPE = {
    cafe: { state: "at_cafe", activity: "drar på kafé", socialAvailability: "open_to_contact" },
    park: { state: "at_park", activity: "setter seg i parken", socialAvailability: "open_to_contact" },
    training: { state: "at_training", activity: "går på trening", socialAvailability: "open_to_contact" },
    culture: { state: "at_culture", activity: "går på kultursted", socialAvailability: "open_to_contact" },
    library: { state: "at_library", activity: "går på biblioteket", socialAvailability: "open_to_contact" },
    // Ekte sosiale stedstyper fra CivicationSocialPlaceResolver (utvidet sett).
    store_social: { state: "shopping", activity: "er innom en butikk", socialAvailability: "open_to_contact" },
    city_walk: { state: "walking_in_city", activity: "er på byvandring", socialAvailability: "open_to_contact" },
    insight: { state: "reflecting", activity: "går i Psykologirommet", socialAvailability: "private" },
    job: { state: "at_work", activity: "går på jobbpause", socialAvailability: "busy" },
    store: { state: "shopping", activity: "stikker innom butikken", socialAvailability: "busy" },
    service: { state: "at_service", activity: "ordner et ærend", socialAvailability: "busy" },
    home: { state: "at_home", activity: "er hjemme", socialAvailability: "private" },
    friend_home: { state: "visiting_player", activity: "er på besøk", socialAvailability: "private" }
  };

  // Slår opp en sosial sted-profil for en location (id vinner over type).
  function resolveSocialPlaceProfile(location) {
    const loc = location && typeof location === "object" ? location : {};
    const id = norm(loc.id).toLowerCase();
    const type = norm(loc.type).toLowerCase();
    return SOCIAL_PLACE_BY_ID[id] || SOCIAL_PLACE_BY_TYPE[type] || null;
  }

  let _playerPhaseSnapshots = null;

  function loadPlayerPhaseSnapshots() {
    if (_playerPhaseSnapshots) return _playerPhaseSnapshots;
    _playerPhaseSnapshots = {};
    try {
      const raw = window.localStorage && window.localStorage.getItem(PLAYER_SNAPSHOTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") _playerPhaseSnapshots = parsed;
      }
    } catch (_e) {
      // localStorage utilgjengelig (privat modus/test) – hold alt i minne.
    }
    return _playerPhaseSnapshots;
  }

  function persistPlayerPhaseSnapshots(store) {
    try {
      window.localStorage && window.localStorage.setItem(PLAYER_SNAPSHOTS_KEY, JSON.stringify(store));
    } catch (_e) {
      // Ignorer skrivefeil – minnet er fortsatt oppdatert.
    }
  }

  // Ren normalisering til ett player phase snapshot. Samme felt-form som
  // friend-snapshot (phase, state, locationId, activity, mood, updatedAtLabel,
  // visibleOnMap) pluss channel/type. Ingen tidsstempel/GPS-felt.
  function normalizePlayerSnapshot(phase, snapshot) {
    const ph = normalizeSnapshotPhase(phase);
    const s = snapshot && typeof snapshot === "object" ? snapshot : {};
    const state = norm(s.state) || "at_home";
    let visibleOnMap = typeof s.visibleOnMap === "boolean" ? s.visibleOnMap : true;
    if (isHiddenState(state)) visibleOnMap = false;
    const socialAvailability = normalizeSocialAvailability(
      s.socialAvailability,
      visibleOnMap ? "open_to_contact" : "hidden"
    );
    const snap = {
      phase: ph,
      state,
      locationId: norm(s.locationId) || null,
      activity: norm(s.activity),
      mood: norm(s.mood),
      updatedAtLabel: norm(s.updatedAtLabel),
      visibleOnMap,
      socialAvailability,
      channel: norm(s.channel)
    };
    // Ekte stedskobling (CivicationSocialPlaceResolver) – kun når den finnes, så
    // generiske snapshots beholder det opprinnelige formatet.
    if (norm(s.sourcePlaceId)) snap.sourcePlaceId = norm(s.sourcePlaceId);
    if (norm(s.brandId)) snap.brandId = norm(s.brandId);
    if (norm(s.socialPlaceType)) snap.socialPlaceType = norm(s.socialPlaceType);
    return snap;
  }

  // Bygger et player phase snapshot ut fra aktiv fase + spillerens nåværende
  // tilstand. currentState kan overstyre sted/aktivitet/stemning/kanal; det som
  // mangler fylles deterministisk fra PLAYER_PHASE_DEFAULTS. Ren funksjon.
  function buildPlayerSnapshotFromCurrentState(phase, currentState) {
    const ph = normalizeSnapshotPhase(phase);
    const def = PLAYER_PHASE_DEFAULTS[ph] || PLAYER_PHASE_DEFAULTS.morning;
    const cs = currentState && typeof currentState === "object" ? currentState : {};
    return normalizePlayerSnapshot(ph, {
      state: norm(cs.state) || def.state,
      locationId: norm(cs.locationId) || def.locationId,
      activity: norm(cs.activity) || def.activity,
      mood: norm(cs.mood) || def.mood,
      updatedAtLabel: norm(cs.updatedAtLabel) || def.updatedAtLabel,
      channel: norm(cs.channel) || def.channel,
      socialAvailability: norm(cs.socialAvailability) || def.socialAvailability,
      visibleOnMap: typeof cs.visibleOnMap === "boolean" ? cs.visibleOnMap : true
    });
  }

  // Bygger spillerens snapshot når et bestemt sosialt sted velges (Mål 6).
  // Henter state/aktivitet/sosial tilgjengelighet/kanal fra stedet via en
  // deterministisk sted-profil; overrides kan finjustere. Ren funksjon.
  function buildPlayerSnapshotForLocation(phase, location, overrides) {
    const ph = normalizeSnapshotPhase(phase);
    const loc = location && typeof location === "object" ? location : {};
    const profile = resolveSocialPlaceProfile(loc) || {};
    const def = PLAYER_PHASE_DEFAULTS[ph] || PLAYER_PHASE_DEFAULTS.morning;
    const o = overrides && typeof overrides === "object" ? overrides : {};
    return normalizePlayerSnapshot(ph, {
      state: norm(o.state) || profile.state || def.state,
      locationId: norm(o.locationId) || norm(loc.id) || def.locationId,
      activity: norm(o.activity) || profile.activity || def.activity,
      mood: norm(o.mood) || def.mood,
      updatedAtLabel: norm(o.updatedAtLabel) || def.updatedAtLabel,
      channel: norm(o.channel) || norm(loc.channel) || def.channel,
      socialAvailability: norm(o.socialAvailability) || profile.socialAvailability || def.socialAvailability,
      visibleOnMap: typeof o.visibleOnMap === "boolean" ? o.visibleOnMap : true,
      // Ekte stedskobling fra et CivicationSocialPlaceResolver-sted.
      sourcePlaceId: norm(o.sourcePlaceId) || norm(loc.sourcePlaceId),
      brandId: norm(o.brandId) || norm(loc.brandId),
      socialPlaceType: norm(o.socialPlaceType) || norm(loc.socialPlaceType)
    });
  }

  function getPlayerPhaseSnapshots() {
    return { ...loadPlayerPhaseSnapshots() };
  }

  function getPlayerSnapshotForPhase(phase) {
    const store = loadPlayerPhaseSnapshots();
    return store[normalizeSnapshotPhase(phase)] || null;
  }

  // Lagrer ett snapshot for én fase – overskriver KUN den fasen, ikke de andre.
  function savePlayerSnapshotForPhase(phase, snapshot) {
    const ph = normalizeSnapshotPhase(phase);
    const store = loadPlayerPhaseSnapshots();
    store[ph] = normalizePlayerSnapshot(ph, snapshot);
    persistPlayerPhaseSnapshots(store);
    return store[ph];
  }

  // Bygger og lagrer spillerens snapshot for den fasen den selv er i nå. Kalles
  // av UI når spilleren bytter fase eller bruker et sted/fullfører en fasehandling.
  function capturePlayerPhaseSnapshot(currentState, phaseArg) {
    const phase = phaseArg != null ? normalizeSnapshotPhase(phaseArg) : getActivePhase();
    return savePlayerSnapshotForPhase(phase, buildPlayerSnapshotFromCurrentState(phase, currentState));
  }

  // Lagrer spillerens snapshot for et valgt sosialt sted i aktiv fase (Mål 6).
  // Setter phase + locationId + activity + state + socialAvailability +
  // visibleOnMap deterministisk fra stedet. Dette er spillerens siste fasevalg.
  function capturePlayerPhaseSnapshotAtLocation(location, phaseArg, overrides) {
    const phase = phaseArg != null ? normalizeSnapshotPhase(phaseArg) : getActivePhase();
    return savePlayerSnapshotForPhase(phase, buildPlayerSnapshotForLocation(phase, location, overrides));
  }

  function clearPlayerPhaseSnapshotsForTesting() {
    _playerPhaseSnapshots = {};
    try {
      window.localStorage && window.localStorage.removeItem(PLAYER_SNAPSHOTS_KEY);
    } catch (_e) {
      // Ignorer – minnet er allerede nullstilt.
    }
    return {};
  }

  // Bakoverkompatible aliaser (scaffold-navn fra PR #1181).
  const getPlayerPhaseSnapshot = getPlayerSnapshotForPhase;
  const setPlayerPhaseSnapshot = savePlayerSnapshotForPhase;

  // Bekvemmelighet for UI: full kartmodell for nåværende fase. Vennelaget bruker
  // fase-minne (snapshot for aktiv semantisk fase), med trygg fallback til
  // presence. Steder bruker fortsatt dagfasen for aktiv/rolig-markering.
  // Henter ekte sosiale steder fra CivicationSocialPlaceResolver når den er
  // lastet. Trygt tomt array uten resolveren / ved feil (test/headless).
  async function loadRealSocialPlacesForCity() {
    const resolver = window.CivicationSocialPlaceResolver;
    if (!resolver || typeof resolver.loadAllSocialPlaces !== "function") return [];
    try {
      const places = await resolver.loadAllSocialPlaces();
      return Array.isArray(places) ? places : [];
    } catch (_e) {
      return [];
    }
  }

  async function getCityModel() {
    const { locations, friends, snapshots } = await loadData();
    const dayPhase = getCurrentPhase();
    const snapshotPhase = getActivePhase(dayPhase);
    const dayIndex = getDayIndex();

    // Del B: slå sammen ekte sosiale steder (resolver) med fasepunktene, og
    // bygg en render-liste der generiske sosiale fallback-noder skjules når
    // konkrete steder av samme socialPlaceType finnes. Systemnoder, venners
    // hjem og ekte sosiale steder vises alltid.
    const socialPlaces = await loadRealSocialPlacesForCity();
    const mergedLocations = mergeSocialPlacesIntoLocations(locations, socialPlaces);
    const renderLocations = mergedLocations.filter((l) =>
      shouldRenderLocationOnCityMap(l, { locations: mergedLocations }));

    return {
      phase: dayPhase,
      snapshotPhase,
      snapshotPhaseLabel: snapshotPhaseLabel(snapshotPhase),
      dayIndex,
      // Full liste (brukes for oppslag/locationById og sosiale møter).
      locations: mergedLocations,
      // Filtrert liste til rendering (Del B).
      renderLocations,
      socialPlaces,
      snapshots,
      friends: friendSnapshotRows(friends, snapshotPhase, snapshots, dayIndex),
      activeLocationIds: activeLocations(mergedLocations, dayPhase).map((l) => norm(l.id))
    };
  }

  window.CivicationFriendsEngine = {
    // konstanter
    DAY_PHASES: DAY_PHASES.slice(),
    SNAPSHOT_PHASES: SNAPSHOT_PHASES.slice(),
    PRESENCE_TEXT: { ...PRESENCE_TEXT },
    SNAPSHOT_PHASE_LABEL: { ...SNAPSHOT_PHASE_LABEL },
    SNAPSHOT_LAST_SEEN_TEXT: { ...SNAPSHOT_LAST_SEEN_TEXT },
    DAY_PHASE_TO_SNAPSHOT: { ...DAY_PHASE_TO_SNAPSHOT },
    SNAPSHOT_TO_DAY_PHASE: { ...SNAPSHOT_TO_DAY_PHASE },
    SOCIAL_AVAILABILITY_VALUES: SOCIAL_AVAILABILITY_VALUES.slice(),
    SOCIAL_AVAILABILITY_LABEL: { ...SOCIAL_AVAILABILITY_LABEL },
    SOCIAL_RESPONSE_OPTIONS: SOCIAL_RESPONSE_OPTIONS.slice(),
    SOCIAL_ENCOUNTER_ACTION,
    // rene hjelpere (testbare uten fetch/DOM)
    normalizePhase,
    normalizeSnapshotPhase,
    snapshotPhaseLabel,
    snapshotLastSeenText,
    snapshotPhaseInWords,
    presenceText,
    // sosial tilgjengelighet + labels (Mål 1/7)
    normalizeSocialAvailability,
    getSocialAvailabilityLabel,
    getResponseOptionLabel,
    isOpenToContact,
    // brukervendte label-/tekst-hjelpere (stabile, testbare navn)
    getPhaseLabel,
    getPresenceStateLabel,
    getRelationshipLabel,
    getRelationshipBlurb,
    getSnapshotDisclosureText,
    isHiddenState,
    computePresence,
    locationById,
    activeLocations,
    isLocationActive,
    friendsForPhase,
    friendsAtLocation,
    // hjemmemodell for venner/personer (Del D) – simulert hjemmepunkt, ikke GPS
    getFriendHomeId,
    isFriendHomeLocation,
    getFriendHomeLocation,
    getFriendHomeAnchor,
    resolveFriendHomeMapAnchor,
    getFriendHomeLabel,
    buildFriendHomeModel,
    // kartnode-klassifisering (Del A) – semantisk rolle pr. location
    LOCATION_ROLES: { ...LOCATION_ROLES },
    GENERIC_SOCIAL_LOCATION_TYPE: { ...GENERIC_SOCIAL_LOCATION_TYPE },
    getGenericSocialPlaceType,
    isRealSocialPlace,
    getLocationRole,
    isSystemLocation,
    isGenericSocialFallback,
    getRealSocialPlaceTypes,
    shouldRenderLocationOnCityMap,
    mergeSocialPlacesIntoLocations,
    // fase-minne (rene, deterministiske)
    snapshotEntryFor,
    resolveFriendMapPresence,
    friendSnapshotRows,
    // vennehandlinger – datadrevet action-router (rene, deterministiske)
    FRIEND_ACTIONS: FRIEND_ACTIONS.slice(),
    FRIEND_ACTION_LABEL: { ...FRIEND_ACTION_LABEL },
    ROUTABLE_FRIEND_ACTIONS: ROUTABLE_FRIEND_ACTIONS.slice(),
    isFriendAction,
    isRoutableFriendAction,
    getFriendActionLabel,
    getInviteLabelForPhase,
    getFriendActionResultText,
    resolveFriendActionTargetLocation,
    resolveFriendActionContext,
    buildFriendMessageAction,
    buildFriendApproachAction,
    buildFriendVisitAction,
    buildFriendInviteAction,
    buildFriendProfileAction,
    handleFriendAction,
    // stedsbaserte sosiale møter (rene, deterministiske) – Mål 2/7
    getSocialEncounterText,
    getApproachActionResultText,
    buildSocialEncounterModel,
    getVisibleFriendsAtSamePhaseLocation,
    getSocialEncountersForLocation,
    canApproachFriendAtLocation,
    // runtime-kontekst
    getCurrentPhase,
    getActivePhase,
    getDayIndex,
    // fase-minne runtime
    getFriendSnapshotForPhase,
    getVisibleFriendSnapshotsForPhase,
    getFriendsAtLocationForPhase,
    // lokalt spiller-fase-minne (grunnlag for framtidig synk til venner)
    PLAYER_PHASE_DEFAULTS: { ...PLAYER_PHASE_DEFAULTS },
    resolveSocialPlaceProfile,
    buildPlayerSnapshotFromCurrentState,
    buildPlayerSnapshotForLocation,
    getPlayerPhaseSnapshots,
    getPlayerSnapshotForPhase,
    savePlayerSnapshotForPhase,
    capturePlayerPhaseSnapshot,
    capturePlayerPhaseSnapshotAtLocation,
    clearPlayerPhaseSnapshotsForTesting,
    // bakoverkompatible aliaser
    getPlayerPhaseSnapshot,
    setPlayerPhaseSnapshot,
    // async
    loadData,
    loadLocations,
    loadFriends,
    loadSnapshots,
    loadRealSocialPlacesForCity,
    getCityModel
  };
})();
