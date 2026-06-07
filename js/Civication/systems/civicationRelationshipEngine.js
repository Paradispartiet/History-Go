// civicationRelationshipEngine.js
// Datadrevet relasjonsmotor for Civication sosiale møter.
//
// Mål: gjøre forholdet mellom spilleren og en venn til en levende sosial
// progresjon over flere møter. En relasjon er ikke bare +1/0/-1 – den har
// tydelige nivåer (en trapp), historikk, tekstlig status og konsekvenser for
// senere sosial tilgjengelighet.
//
// Alt her er RENT, DETERMINISTISK og TESTBART: samme input gir alltid samme
// output. Ingen klokke, ingen tilfeldighet, ingen backend/nettverk. Lagring og
// localStorage-speiling skjer i bridgen (civicationFriendMessages.js); denne
// motoren beskriver bare modellen og konsekvensene.
//
// KONVENSJON for stage-id-er: stage-id-ene er engelske nøkler (stranger …
// close_friend) mens ALLE brukervendte labels/blurbs er norske. Den eldre
// hurtig-etiketten i CivicationFriendsEngine.getRelationshipLabel (4-trinns:
// «ny kontakt»/«bekjent»/«venn»/«nær venn») beholdes uendret for bakover-
// kompatibilitet; denne motoren legger den rikere 6-trinns relasjonstrappen
// oppå den, brukt av den lokale relasjonslagringen og profil-/stedskortet.
(function () {
  "use strict";

  if (window.CivicationRelationshipEngine) return;

  // ---------------------------------------------------------------------------
  // Trygge grenser (clamps)
  // ---------------------------------------------------------------------------
  const MIN_LEVEL = 0;
  const MAX_LEVEL = 5;
  const MIN_TRUST = 0;
  const MAX_TRUST = 5;
  const MIN_FAMILIARITY = 0;
  const MAX_FAMILIARITY = 8; // familiaritet vokser litt videre enn tillit/nivå

  // ---------------------------------------------------------------------------
  // Relasjonstrapp 0..5 (level -> stage-id)
  //   0 -> fremmed, 1 -> gjenkjent, 2 -> bekjent,
  //   3 -> vennlig kontakt, 4 -> venn, 5 -> nær venn
  // ---------------------------------------------------------------------------
  const STAGE_BY_LEVEL = [
    "stranger",
    "recognized",
    "acquaintance",
    "friendly_contact",
    "friend",
    "close_friend"
  ];

  const STAGE_LABEL = {
    stranger: "fremmed",
    recognized: "gjenkjent",
    acquaintance: "bekjent",
    friendly_contact: "vennlig kontakt",
    friend: "venn",
    close_friend: "nær venn"
  };

  const STAGE_BLURB = {
    stranger: "Dere er fremmede for hverandre ennå.",
    recognized: "Dere har begynt å gjenkjenne hverandre.",
    acquaintance: "Dere er bekjente.",
    friendly_contact: "Dere har begynt å bygge en vennlig kontakt.",
    friend: "Dere er venner i byen.",
    close_friend: "Dette er en nær venn i byen."
  };

  // ---------------------------------------------------------------------------
  // Sosial tilgjengelighet (availability modifier) – hvordan vennen vises senere
  // ---------------------------------------------------------------------------
  const AVAILABILITY_VALUES = ["warmer", "normal", "cooler", "distant"];

  const AVAILABILITY_LABEL = {
    warmer: "mer åpen",
    normal: "normal",
    cooler: "mer reservert",
    distant: "distansert"
  };

  // ---------------------------------------------------------------------------
  // Datadrevet konsekvensmodell pr. svarvalg (reply / ignore / decline).
  // availabilityModifier her er et HINT ("warmer"/"unchanged"/"cooler") som
  // oversettes til en faktisk modifier-tilstand i nextAvailabilityModifier().
  // ---------------------------------------------------------------------------
  const RESPONSE_DELTA = {
    reply: { relationshipDelta: 1, trustDelta: 1, familiarityDelta: 1, availabilityModifier: "warmer" },
    ignore: { relationshipDelta: 0, trustDelta: 0, familiarityDelta: 0, availabilityModifier: "unchanged" },
    decline: { relationshipDelta: -1, trustDelta: -1, familiarityDelta: 0, availabilityModifier: "cooler" }
  };

  // status -> svarvalg (når et resultat kun bærer status, ikke responseId).
  const STATUS_TO_RESPONSE = { replied: "reply", ignored: "ignore", declined: "decline" };

  // svarvalg -> norsk knappetekst (for relasjonssammendrag).
  const RESPONSE_LABEL = { reply: "Svar", ignore: "Ignorer", decline: "Avvis" };

  // ---------------------------------------------------------------------------
  // Små rene hjelpere
  // ---------------------------------------------------------------------------
  function norm(value) {
    return String(value == null ? "" : value).trim();
  }

  function toNum(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : (Number.isFinite(fallback) ? fallback : 0);
  }

  function clamp(value, lo, hi) {
    return Math.max(lo, Math.min(hi, toNum(value, lo)));
  }

  // ---------------------------------------------------------------------------
  // Clamp-hjelpere (relasjonsnivå, tillit, familiaritet)
  // ---------------------------------------------------------------------------
  function clampRelationshipLevel(level) {
    return clamp(level, MIN_LEVEL, MAX_LEVEL);
  }

  function clampTrust(value) {
    return clamp(value, MIN_TRUST, MAX_TRUST);
  }

  function clampFamiliarity(value) {
    return clamp(value, MIN_FAMILIARITY, MAX_FAMILIARITY);
  }

  // ---------------------------------------------------------------------------
  // Stage-hjelpere (rene)
  // ---------------------------------------------------------------------------
  function getRelationshipStage(level) {
    return STAGE_BY_LEVEL[clampRelationshipLevel(level)] || "stranger";
  }

  function getRelationshipStageLabel(stage) {
    return STAGE_LABEL[norm(stage).toLowerCase()] || "";
  }

  function getRelationshipStageBlurb(stage) {
    return STAGE_BLURB[norm(stage).toLowerCase()] || "";
  }

  function getAvailabilityModifierLabel(value) {
    return AVAILABILITY_LABEL[norm(value).toLowerCase()] || "";
  }

  function normalizeAvailabilityModifier(value, fallback) {
    const v = norm(value).toLowerCase();
    if (AVAILABILITY_VALUES.includes(v)) return v;
    const fb = norm(fallback).toLowerCase();
    return AVAILABILITY_VALUES.includes(fb) ? fb : "normal";
  }

  // Normaliser et svarvalg til en gyldig id, ellers "".
  function normalizeResponseId(responseId) {
    const r = norm(responseId).toLowerCase();
    return RESPONSE_DELTA[r] ? r : "";
  }

  // Utled svarvalg fra et resultat-objekt (responseId, ev. status) eller en rå
  // streng. Trygt: returnerer "" når ingenting gjenkjennes.
  function resolveResponseId(source) {
    if (source && typeof source === "object") {
      const direct = normalizeResponseId(source.responseId || source.response);
      if (direct) return direct;
      const byStatus = STATUS_TO_RESPONSE[norm(source.status).toLowerCase()];
      return byStatus ? normalizeResponseId(byStatus) : "";
    }
    return normalizeResponseId(source);
  }

  // ---------------------------------------------------------------------------
  // Konsekvensmodell: bygg delta fra et sosialt svar
  // ---------------------------------------------------------------------------
  // Tar et svar-resultat ({ responseId } eller { status }) eller en rå id-streng
  // og returnerer en ren delta-modell. Ukjent svar gir en nøytral delta.
  function buildRelationshipDeltaFromSocialResponse(responseResult) {
    const rid = resolveResponseId(responseResult);
    const base = RESPONSE_DELTA[rid] ||
      { relationshipDelta: 0, trustDelta: 0, familiarityDelta: 0, availabilityModifier: "unchanged" };
    return {
      responseId: rid,
      relationshipDelta: base.relationshipDelta,
      trustDelta: base.trustDelta,
      familiarityDelta: base.familiarityDelta,
      availabilityModifier: base.availabilityModifier
    };
  }

  // Oversett et availability-hint + nytt nivå til en faktisk modifier-tilstand.
  //   warmer    -> "warmer" (gjentatte svar holder relasjonen mer åpen)
  //   cooler    -> "cooler", eskalerer til "distant" ved gjentakelse / nivå 0
  //   unchanged -> behold nåværende modifier
  function nextAvailabilityModifier(current, hint, level) {
    const cur = normalizeAvailabilityModifier(current, "normal");
    const h = norm(hint).toLowerCase();
    if (h === "warmer") return "warmer";
    if (h === "cooler") {
      if (cur === "cooler" || cur === "distant" || clampRelationshipLevel(level) <= MIN_LEVEL) {
        return "distant";
      }
      return "cooler";
    }
    return cur; // unchanged
  }

  // Normaliser et relasjonsobjekt til full, trygg form (med clamps + stage).
  function normalizeRelationship(relationship) {
    const r = relationship && typeof relationship === "object" ? relationship : {};
    const level = clampRelationshipLevel(r.relationshipLevel);
    return {
      friendId: norm(r.friendId),
      relationshipLevel: level,
      relationshipStage: getRelationshipStage(level),
      trust: clampTrust(r.trust),
      familiarity: clampFamiliarity(r.familiarity),
      lastSocialResponse: normalizeResponseId(r.lastSocialResponse) || null,
      lastInteractionPhase: norm(r.lastInteractionPhase) || null,
      lastInteractionLocationId: norm(r.lastInteractionLocationId) || null,
      availabilityModifier: normalizeAvailabilityModifier(r.availabilityModifier, "normal"),
      socialHistory: Array.isArray(r.socialHistory) ? r.socialHistory.slice() : []
    };
  }

  // ---------------------------------------------------------------------------
  // Ren anvendelse av en delta på en relasjon (ingen historikk-append).
  // relationshipLevel/trust/familiarity clampes; stage + availabilityModifier
  // oppdateres deterministisk.
  // ---------------------------------------------------------------------------
  function applyRelationshipDelta(relationship, delta) {
    const r = normalizeRelationship(relationship);
    const d = delta && typeof delta === "object" ? delta : {};
    const level = clampRelationshipLevel(r.relationshipLevel + toNum(d.relationshipDelta, 0));
    return {
      friendId: r.friendId,
      relationshipLevel: level,
      relationshipStage: getRelationshipStage(level),
      trust: clampTrust(r.trust + toNum(d.trustDelta, 0)),
      familiarity: clampFamiliarity(r.familiarity + toNum(d.familiarityDelta, 0)),
      lastSocialResponse: r.lastSocialResponse,
      lastInteractionPhase: r.lastInteractionPhase,
      lastInteractionLocationId: r.lastInteractionLocationId,
      availabilityModifier: nextAvailabilityModifier(r.availabilityModifier, d.availabilityModifier, level),
      socialHistory: r.socialHistory.slice()
    };
  }

  // ---------------------------------------------------------------------------
  // Full relasjonsoppdatering fra et sosialt svar (ren – ingen lagring).
  // Bygger delta fra svaret, anvender den, og appender en socialHistory-rad.
  // Idempotent pr. melding: samme messageId gir ALDRI dobbel relasjonseffekt.
  // ---------------------------------------------------------------------------
  function updateRelationshipFromSocialResponse(message, responseResult, currentRelationship) {
    const m = message && typeof message === "object" ? message : {};
    const rr = responseResult && typeof responseResult === "object" ? responseResult : {};
    const base = normalizeRelationship(currentRelationship);

    const friendId = norm(rr.friendId) || norm(m.friendId) || base.friendId;
    const messageId = norm(rr.messageId) || norm(m.id || m.mail_key);

    // Dobbel-effekt-vakt: er denne meldingen allerede talt i historikken?
    if (messageId && base.socialHistory.some((h) => norm(h && h.messageId) === messageId)) {
      return { ...base, friendId: friendId, socialHistory: base.socialHistory.slice() };
    }

    const delta = buildRelationshipDeltaFromSocialResponse(rr);
    const applied = applyRelationshipDelta(base, delta);

    const phase = norm(rr.phase) || norm(m.phase) || base.lastInteractionPhase || null;
    const locationId = norm(rr.locationId) || norm(m.locationId) || base.lastInteractionLocationId || null;

    const entry = {
      messageId: messageId,
      actionId: norm(rr.actionId || m.actionId) || "approach",
      responseId: delta.responseId,
      phase: phase,
      locationId: locationId,
      relationshipDelta: delta.relationshipDelta,
      trustDelta: delta.trustDelta,
      familiarityDelta: delta.familiarityDelta
    };

    return {
      friendId: friendId,
      relationshipLevel: applied.relationshipLevel,
      relationshipStage: applied.relationshipStage,
      trust: applied.trust,
      familiarity: applied.familiarity,
      lastSocialResponse: delta.responseId || base.lastSocialResponse,
      lastInteractionPhase: phase,
      lastInteractionLocationId: locationId,
      availabilityModifier: applied.availabilityModifier,
      socialHistory: base.socialHistory.concat([entry])
    };
  }

  // ---------------------------------------------------------------------------
  // Sosial tilgjengelighet utledet fra relasjonen
  // ---------------------------------------------------------------------------
  // Eksplisitt lagret (ikke-normal) modifier vinner; ellers utledes den av siste
  // respons + nivå (svar -> mer åpen, avvisning -> mer reservert / distansert).
  function getAvailabilityModifierFromRelationship(relationship) {
    const r = normalizeRelationship(relationship);
    if (r.availabilityModifier && r.availabilityModifier !== "normal") {
      return r.availabilityModifier;
    }
    const last = norm(r.lastSocialResponse).toLowerCase();
    if (last === "reply") return "warmer";
    if (last === "decline") return r.relationshipLevel <= MIN_LEVEL ? "distant" : "cooler";
    return "normal";
  }

  // Skal vennen fortsatt vises som et sosialt møte gitt relasjonen? Den
  // underliggende synligheten styres allerede av fase-minne/socialAvailability i
  // CivicationFriendsEngine; dette er et EKSTRA, enkelt relasjonsfilter: en
  // distansert relasjon (gjentatte avvisninger på lavt nivå) skjuler møtet.
  // phase/locationId er med i signaturen som kontekst for framtidig finjustering.
  function shouldShowFriendAsSocialEncounter(friendId, phase, locationId, relationship) {
    const fid = norm(friendId);
    if (!fid) return false;
    if (!relationship || typeof relationship !== "object") return true;
    const r = normalizeRelationship(relationship);
    if (r.friendId && r.friendId !== fid) return true; // relasjon for en annen venn
    return getAvailabilityModifierFromRelationship(r) !== "distant";
  }

  // ---------------------------------------------------------------------------
  // Brukervendt sammendrag (for profilkort / stedskort / followup)
  // ---------------------------------------------------------------------------
  function buildRelationshipStatusText(stage, modifier) {
    let text = getRelationshipStageBlurb(stage);
    if (modifier === "warmer") text += " Relasjonen er litt varmere etter siste svar.";
    else if (modifier === "cooler") text += " Relasjonen er litt mer reservert etter siste svar.";
    else if (modifier === "distant") text += " Relasjonen har blitt distansert.";
    return norm(text);
  }

  function buildRelationshipSummary(relationship) {
    const r = normalizeRelationship(relationship);
    const stage = r.relationshipStage;
    const modifier = getAvailabilityModifierFromRelationship(r);
    const lastResponse = norm(r.lastSocialResponse).toLowerCase() || null;
    return {
      friendId: r.friendId,
      relationshipLevel: r.relationshipLevel,
      relationshipStage: stage,
      stageLabel: getRelationshipStageLabel(stage),
      stageBlurb: getRelationshipStageBlurb(stage),
      trust: r.trust,
      familiarity: r.familiarity,
      availabilityModifier: modifier,
      availabilityModifierLabel: getAvailabilityModifierLabel(modifier),
      lastSocialResponse: lastResponse,
      lastSocialResponseLabel: lastResponse ? (RESPONSE_LABEL[lastResponse] || "") : "",
      lastInteractionPhase: r.lastInteractionPhase || null,
      lastInteractionLocationId: r.lastInteractionLocationId || null,
      historyCount: r.socialHistory.length,
      statusText: buildRelationshipStatusText(stage, modifier)
    };
  }

  window.CivicationRelationshipEngine = {
    // konstanter
    MIN_LEVEL: MIN_LEVEL,
    MAX_LEVEL: MAX_LEVEL,
    MIN_TRUST: MIN_TRUST,
    MAX_TRUST: MAX_TRUST,
    MIN_FAMILIARITY: MIN_FAMILIARITY,
    MAX_FAMILIARITY: MAX_FAMILIARITY,
    STAGE_BY_LEVEL: STAGE_BY_LEVEL.slice(),
    STAGE_LABEL: { ...STAGE_LABEL },
    STAGE_BLURB: { ...STAGE_BLURB },
    AVAILABILITY_VALUES: AVAILABILITY_VALUES.slice(),
    AVAILABILITY_LABEL: { ...AVAILABILITY_LABEL },
    RESPONSE_DELTA: { ...RESPONSE_DELTA },
    // clamps
    clampRelationshipLevel: clampRelationshipLevel,
    clampTrust: clampTrust,
    clampFamiliarity: clampFamiliarity,
    // stage-/label-hjelpere
    getRelationshipStage: getRelationshipStage,
    getRelationshipStageLabel: getRelationshipStageLabel,
    getRelationshipStageBlurb: getRelationshipStageBlurb,
    getAvailabilityModifierLabel: getAvailabilityModifierLabel,
    normalizeAvailabilityModifier: normalizeAvailabilityModifier,
    normalizeRelationship: normalizeRelationship,
    // konsekvensmodell
    buildRelationshipDeltaFromSocialResponse: buildRelationshipDeltaFromSocialResponse,
    applyRelationshipDelta: applyRelationshipDelta,
    updateRelationshipFromSocialResponse: updateRelationshipFromSocialResponse,
    // sosial tilgjengelighet
    getAvailabilityModifierFromRelationship: getAvailabilityModifierFromRelationship,
    shouldShowFriendAsSocialEncounter: shouldShowFriendAsSocialEncounter,
    // sammendrag
    buildRelationshipSummary: buildRelationshipSummary
  };
})();
