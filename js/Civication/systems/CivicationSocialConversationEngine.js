// CivicationSocialConversationEngine.js
// Datadrevet sosial samtalemotor for Civication.
//
// Når en sosial henvendelse (actionId "approach") får responsen «Svar» (reply),
// skal positiv respons bli en faktisk, spillbar samtaletråd i Personlige
// meldinger – ikke bare relasjonspoeng. Denne motoren oppretter og driver en
// liten, datadrevet samtaletråd:
//   - knyttet til friendId, phase og (når møtet kom fra et sted) locationId
//   - bygger videre på actionId "approach"
//   - alltid PRIVAT/PERSONLIG (channel "private", mail_class "private_message")
//   - aldri jobbmail, aldri job/work/career-felt
//   - gir spilleren samtalevalg som påvirker relasjon/trust/familiarity
//   - kan avsluttes, fortsette eller bli stående åpen/på pause
//
// VIKTIG avgrensning (som resten av Civication-sosialflyten):
//   Ingen backend. Ingen live multiplayer. Ingen GPS. Ingen ekte chat mellom
//   spillere. Ingen jobbmail. Ingen karrierevalg. Alt er lokal, deterministisk
//   spillflyt (localStorage med minne-fallback) slik at det er testbart.
//
// Relasjonskonsekvensen går gjennom den eksisterende relasjonsmotoren
// (CivicationRelationshipEngine) for clamps + stage, og lagres i det samme
// lokale relasjonslageret som svarsløyfen bruker (via CivicationFriendMessages).
(function () {
  "use strict";

  if (window.CivicationSocialConversationEngine) return;

  // Stabilt kildemerke for ALT som hører til en sosial samtaletråd.
  const SOURCE = "civication_social_conversation";

  // Privat/personlig kanal – konsekvent slik at samtaler sorteres under
  // «Personlige meldinger», aldri «Jobbmail».
  const PRIVATE_CHANNEL = "private";
  const PRIVATE_MAIL_CLASS = "private_message";

  // Samtalen bygger alltid videre på henvendelsen.
  const ORIGIN_ACTION_ID = "approach";

  // Lokalt, testbart lager for samtaletråder (speiles til localStorage).
  const CONVERSATION_STORE_KEY = "civi.socialConversations.v1";

  // ---------------------------------------------------------------------------
  // Samtalestatus (enkel statusmodell) + norske labels
  // ---------------------------------------------------------------------------
  const STATUS_VALUES = ["open", "continued", "paused", "closed"];

  const STATUS_LABEL = {
    open: "åpen",
    continued: "fortsetter",
    paused: "på pause",
    closed: "avsluttet"
  };

  // ---------------------------------------------------------------------------
  // Samtalevalg (lite, robust, testbart sett) – datadrevet konsekvensmodell.
  // Hvert valg har norsk label, tone, deltas for relasjon/trust/familiaritet,
  // neste status og en deterministisk resultattekst.
  // ---------------------------------------------------------------------------
  const CHOICE_ORDER = [
    "friendly_reply",
    "ask_question",
    "share_something",
    "suggest_same_place_again",
    "end_politely"
  ];

  const CHOICE_DEF = {
    friendly_reply: {
      choiceId: "friendly_reply",
      label: "Svar vennlig",
      tone: "warm",
      relationshipDelta: 1,
      trustDelta: 1,
      familiarityDelta: 1,
      availabilityModifier: "warmer",
      nextStatus: "continued",
      resultText: "Du svarer vennlig. Samtalen fortsetter."
    },
    ask_question: {
      choiceId: "ask_question",
      label: "Still et spørsmål",
      tone: "curious",
      relationshipDelta: 0,
      trustDelta: 1,
      familiarityDelta: 1,
      availabilityModifier: "warmer",
      nextStatus: "continued",
      resultText: "Du stiller et spørsmål. Dere blir litt bedre kjent."
    },
    share_something: {
      choiceId: "share_something",
      label: "Del noe kort",
      tone: "open",
      relationshipDelta: 1,
      trustDelta: 0,
      familiarityDelta: 1,
      availabilityModifier: "warmer",
      nextStatus: "continued",
      resultText: "Du deler noe kort. Dere blir litt bedre kjent."
    },
    suggest_same_place_again: {
      choiceId: "suggest_same_place_again",
      label: "Foreslå å møtes her igjen",
      tone: "inviting",
      relationshipDelta: 1,
      trustDelta: 1,
      familiarityDelta: 0,
      availabilityModifier: "warmer",
      nextStatus: "paused",
      resultText: "Du foreslår å møtes her igjen. Samtalen settes på pause."
    },
    end_politely: {
      choiceId: "end_politely",
      label: "Avslutt høflig",
      tone: "polite",
      relationshipDelta: 0,
      trustDelta: 0,
      familiarityDelta: 0,
      availabilityModifier: "unchanged",
      nextStatus: "closed",
      resultText: "Du avslutter høflig. Samtalen er avsluttet."
    }
  };

  // Hvilke valg tilbys videre, gitt ny status. closed -> ingen flere valg.
  const NEXT_CHOICES_BY_STATUS = {
    open: CHOICE_ORDER.slice(),
    continued: CHOICE_ORDER.slice(),
    paused: ["friendly_reply", "suggest_same_place_again", "end_politely"],
    closed: []
  };

  // Deterministiske «venn svarer»-linjer pr. status (etter spillerens valg).
  const FRIEND_FOLLOW_LINE = {
    continued: " holder samtalen i gang.",
    paused: " liker idéen om å møtes her igjen.",
    closed: " takker for praten."
  };

  // ---------------------------------------------------------------------------
  // Små rene hjelpere
  // ---------------------------------------------------------------------------
  function norm(value) {
    return String(value == null ? "" : value).trim();
  }

  function obj(value) {
    return value && typeof value === "object" ? value : {};
  }

  function firstNumber() {
    for (let i = 0; i < arguments.length; i += 1) {
      const v = arguments[i];
      if (v == null || v === "") continue;
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    return null;
  }

  function firstName(name) {
    const n = norm(name) || "vennen";
    return n.split(/\s+/)[0] || n;
  }

  function normalizeStatus(status) {
    const s = norm(status).toLowerCase();
    return STATUS_VALUES.includes(s) ? s : "open";
  }

  function normalizeChoiceId(choiceId) {
    const c = norm(choiceId).toLowerCase();
    return CHOICE_DEF[c] ? c : "";
  }

  function normalizePhase(phase) {
    const eng = window.CivicationFriendsEngine;
    if (eng && typeof eng.normalizeSnapshotPhase === "function") {
      return eng.normalizeSnapshotPhase(phase);
    }
    const p = norm(phase).toLowerCase();
    return ["morning", "work", "leisure", "evening", "reflection"].includes(p) ? p : "morning";
  }

  function phaseLabel(phase) {
    const eng = window.CivicationFriendsEngine;
    if (eng && typeof eng.snapshotPhaseLabel === "function") {
      return eng.snapshotPhaseLabel(phase);
    }
    return "";
  }

  // Brukervendt stednavn fra et locationId via friends-engine når mulig.
  function resolveLocationLabel(locationId, context) {
    const ctx = obj(context);
    if (norm(ctx.locationLabel)) return norm(ctx.locationLabel);
    const lid = norm(locationId);
    if (!lid) return "";
    const eng = window.CivicationFriendsEngine;
    const locations = Array.isArray(ctx.locations) ? ctx.locations : null;
    if (eng && typeof eng.locationById === "function" && locations) {
      const loc = eng.locationById(locations, lid);
      if (loc && norm(loc.label)) return norm(loc.label);
    }
    // Fallback: pen versjon av id-en ("cafe" -> "Cafe").
    return lid.charAt(0).toUpperCase() + lid.slice(1);
  }

  // Stabil tråd-id pr. venn – samme konvensjon som de andre private meldingene.
  function resolveConversationThreadId(friendId) {
    const fid = norm(friendId);
    if (!fid) return "";
    const bridge = window.CivicationFriendMessages;
    if (bridge && typeof bridge.resolvePrivateThreadForFriend === "function") {
      const t = bridge.resolvePrivateThreadForFriend(fid);
      if (t) return t;
    }
    return "friend_" + fid;
  }

  // ---------------------------------------------------------------------------
  // Labels / tekster (rene)
  // ---------------------------------------------------------------------------
  function getConversationStatusLabel(status) {
    return STATUS_LABEL[normalizeStatus(status)] || "";
  }

  function getConversationChoiceLabel(choiceId) {
    const c = normalizeChoiceId(choiceId);
    return c ? CHOICE_DEF[c].label : "";
  }

  function getConversationChoiceResultText(choiceResult) {
    const cr = obj(choiceResult);
    const c = normalizeChoiceId(cr.choiceId);
    if (c) return CHOICE_DEF[c].resultText;
    return "";
  }

  // Valg-modeller (choiceId + label) for en gitt status. Brukes av view-modellen.
  function choicesForStatus(status) {
    const list = NEXT_CHOICES_BY_STATUS[normalizeStatus(status)] || [];
    return list.map((id) => ({ choiceId: id, label: CHOICE_DEF[id].label }));
  }

  // ---------------------------------------------------------------------------
  // Lokalt samtalelager (testbart, localStorage + minne-fallback)
  // ---------------------------------------------------------------------------
  let _store = null;

  function loadStore() {
    if (_store) return _store;
    _store = {};
    try {
      const raw = window.localStorage && window.localStorage.getItem(CONVERSATION_STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") _store = parsed;
      }
    } catch (_e) {
      // localStorage utilgjengelig (privat modus/test) – hold alt i minne.
    }
    return _store;
  }

  function persistStore(store) {
    try {
      window.localStorage && window.localStorage.setItem(CONVERSATION_STORE_KEY, JSON.stringify(store));
    } catch (_e) {
      // Ignorer skrivefeil – minnet er fortsatt oppdatert.
    }
  }

  function cloneConversation(conv) {
    if (!conv || typeof conv !== "object") return null;
    return JSON.parse(JSON.stringify(conv));
  }

  function saveConversation(conv) {
    const id = norm(conv && conv.conversationId);
    if (!id) return null;
    const store = loadStore();
    store[id] = conv;
    persistStore(store);
    return cloneConversation(conv);
  }

  function getConversationById(conversationId) {
    const id = norm(conversationId);
    if (!id) return null;
    const conv = loadStore()[id];
    return conv ? cloneConversation(conv) : null;
  }

  function getConversationsForFriend(friendId) {
    const fid = norm(friendId);
    if (!fid) return [];
    const store = loadStore();
    return Object.keys(store)
      .map((k) => store[k])
      .filter((c) => c && norm(c.friendId) === fid)
      .map(cloneConversation);
  }

  // Stabil, testbar conversationId: conv_{friendId}_{phase}[_{locationId}]_{NNN}
  // der NNN er løpenummer for samme venn+fase+sted (første = 001).
  function buildConversationId(friendId, phase, locationId) {
    const fid = norm(friendId) || "ukjent";
    const ph = normalizePhase(phase);
    const lid = norm(locationId);
    const baseParts = ["conv", fid, ph];
    if (lid) baseParts.push(lid);
    const base = baseParts.join("_");
    const store = loadStore();
    let count = 0;
    Object.keys(store).forEach((k) => {
      if (k === base || k.indexOf(base + "_") === 0) count += 1;
    });
    const index = String(count + 1).padStart(3, "0");
    return base + "_" + index;
  }

  // ---------------------------------------------------------------------------
  // Opprettelse av samtaletråd fra en positiv respons («Svar»)
  // ---------------------------------------------------------------------------
  // KUN responseId "reply" oppretter en samtale. ignore/decline gir null.
  // Resultatet er ALLTID privat/personlig – aldri job/work/career-felt.
  function createSocialConversationFromResponse(responseResult, context) {
    const rr = obj(responseResult);
    const ctx = obj(context);

    const responseId = norm(rr.responseId).toLowerCase();
    if (responseId !== "reply") return null;

    const friendId = norm(rr.friendId);
    if (!friendId) return null;

    const friendName = norm(rr.friendName) || "vennen";
    const phase = normalizePhase(rr.phase);
    const locationId = norm(rr.locationId) || null;
    // Ekte stedskobling (CivicationSocialPlaceResolver) når møtet kom fra et
    // ekte sosialt sted: sourcePlaceId, brandId, socialPlaceType, placeLabel.
    const sourcePlaceId = norm(rr.sourcePlaceId) || null;
    const brandId = norm(rr.brandId) || null;
    const socialPlaceType = norm(rr.socialPlaceType) || null;
    const locationLabel = norm(rr.placeLabel) || (locationId ? resolveLocationLabel(locationId, ctx) : "");
    const threadId = resolveConversationThreadId(friendId);
    const conversationId = buildConversationId(friendId, phase, locationId);

    // Relasjonsstage ved start (engine-konvensjon: engelsk id, norsk label).
    const summary = obj(rr.relationshipSummary);
    const relationshipStageAtStart = norm(summary.relationshipStage) || null;
    const relationshipStageLabelAtStart = norm(summary.stageLabel) || null;

    const first = firstName(friendName);
    const placePart = locationLabel ? (" på " + locationLabel.toLowerCase()) : "";
    const openingBody = first + " svarer på henvendelsen din" + placePart + ".";

    const conversation = {
      conversationId: conversationId,
      threadId: threadId,
      friendId: friendId,
      friendName: friendName,
      source: SOURCE,
      originActionId: ORIGIN_ACTION_ID,
      phase: phase,
      locationId: locationId,
      locationLabel: locationLabel || null,
      // Ekte stedskobling (kan være null for generiske steder).
      sourcePlaceId: sourcePlaceId,
      brandId: brandId,
      socialPlaceType: socialPlaceType,
      status: "open",
      statusLabel: getConversationStatusLabel("open"),
      turnIndex: 0,
      relationshipStageAtStart: relationshipStageAtStart,
      relationshipStageLabelAtStart: relationshipStageLabelAtStart,
      // Sporbar opprinnelse (hvilken henvendelse samtalen kom fra).
      originMessageId: norm(rr.messageId) || null,
      // Separasjon synlig i selve modellen.
      channel: PRIVATE_CHANNEL,
      mail_class: PRIVATE_MAIL_CLASS,
      messages: [
        {
          speaker: "friend",
          body: openingBody,
          phase: phase,
          locationId: locationId
        }
      ],
      choices: NEXT_CHOICES_BY_STATUS.open.map((id) => ({
        choiceId: id,
        label: CHOICE_DEF[id].label,
        tone: CHOICE_DEF[id].tone,
        relationshipDelta: CHOICE_DEF[id].relationshipDelta,
        trustDelta: CHOICE_DEF[id].trustDelta,
        familiarityDelta: CHOICE_DEF[id].familiarityDelta,
        nextStatus: CHOICE_DEF[id].nextStatus
      })),
      choiceLog: [],
      pendingHint: null
    };

    saveConversation(conversation);

    // Registrer samtaletråden i Personlige meldinger (privat kanal, aldri jobb).
    registerConversationMail(conversation, null);

    return cloneConversation(conversation);
  }

  // Bygg startvalgene for en samtale (kan finjusteres av relasjon senere).
  // I dag returneres det robuste standardsettet for samtalens status.
  function buildInitialConversationChoices(conversation, relationship) {
    const conv = obj(conversation);
    const status = normalizeStatus(conv.status || "open");
    void relationship; // reservert for framtidig relasjonsbasert finjustering
    return choicesForStatus(status);
  }

  // ---------------------------------------------------------------------------
  // Ren byggefunksjon for resultatet av et samtalevalg (ingen sideeffekter)
  // ---------------------------------------------------------------------------
  function buildSocialConversationChoiceResult(conversation, choiceId, relationship) {
    const conv = obj(conversation);
    const cid = normalizeChoiceId(choiceId);
    if (!cid) {
      return { ok: false, reason: "invalid_choice", choiceId: norm(choiceId), channel: PRIVATE_CHANNEL };
    }
    const def = CHOICE_DEF[cid];
    const baseLevel = firstNumber(
      relationship && relationship.relationshipLevel,
      conv.baseRelationshipLevel
    );
    const result = {
      ok: true,
      choiceId: cid,
      label: def.label,
      tone: def.tone,
      relationshipDelta: def.relationshipDelta,
      trustDelta: def.trustDelta,
      familiarityDelta: def.familiarityDelta,
      availabilityModifier: def.availabilityModifier,
      nextStatus: def.nextStatus,
      nextStatusLabel: getConversationStatusLabel(def.nextStatus),
      resultText: def.resultText,
      // Separasjon: alltid privat/personlig, aldri jobb.
      channel: PRIVATE_CHANNEL,
      mail_class: PRIVATE_MAIL_CLASS,
      source: SOURCE,
      // Sporbar kontekst.
      conversationId: norm(conv.conversationId),
      friendId: norm(conv.friendId),
      friendName: norm(conv.friendName),
      phase: normalizePhase(conv.phase),
      locationId: norm(conv.locationId) || null,
      // Ekte stedskobling følger samtalevalget.
      sourcePlaceId: norm(conv.sourcePlaceId) || null,
      brandId: norm(conv.brandId) || null,
      socialPlaceType: norm(conv.socialPlaceType) || null,
      baseRelationshipLevel: baseLevel
    };
    // «Foreslå å møtes her igjen» kan lage et senere sosialt hint knyttet til
    // samme phase + locationId.
    if (cid === "suggest_same_place_again") {
      result.socialHint = {
        friendId: result.friendId,
        phase: result.phase,
        locationId: result.locationId,
        source: SOURCE,
        kind: "meet_same_place_again"
      };
    }
    return result;
  }

  // ---------------------------------------------------------------------------
  // Relasjonskonsekvens av et samtalevalg
  // ---------------------------------------------------------------------------
  // Oppdaterer relationshipLevel/trust/familiarity gjennom relasjonsmotoren
  // (clamps + stage), appender en socialHistory-rad, og setter
  // lastInteractionPhase/locationId + lastConversationChoice/lastConversationStatus.
  // Lagres i det SAMME lokale relasjonslageret som svarsløyfen bruker.
  function applyConversationChoiceToRelationship(friendId, choiceResult) {
    const cr = obj(choiceResult);
    const fid = norm(friendId) || norm(cr.friendId);
    const bridge = window.CivicationFriendMessages;
    const engine = window.CivicationRelationshipEngine;

    const current = (bridge && typeof bridge.getSocialRelationship === "function")
      ? bridge.getSocialRelationship(fid)
      : null;

    const delta = {
      relationshipDelta: Number(cr.relationshipDelta) || 0,
      trustDelta: Number(cr.trustDelta) || 0,
      familiarityDelta: Number(cr.familiarityDelta) || 0,
      availabilityModifier: norm(cr.availabilityModifier) || "unchanged"
    };

    const phase = normalizePhase(cr.phase);
    const locationId = norm(cr.locationId) || null;

    const historyEntry = {
      conversationId: norm(cr.conversationId),
      choiceId: norm(cr.choiceId),
      actionId: ORIGIN_ACTION_ID,
      phase: phase,
      locationId: locationId,
      // Ekte stedskobling lagres i socialHistory (når relevant).
      sourcePlaceId: norm(cr.sourcePlaceId) || null,
      brandId: norm(cr.brandId) || null,
      socialPlaceType: norm(cr.socialPlaceType) || null,
      relationshipDelta: delta.relationshipDelta,
      trustDelta: delta.trustDelta,
      familiarityDelta: delta.familiarityDelta,
      source: SOURCE
    };

    let updated;
    if (engine && typeof engine.applyRelationshipDelta === "function") {
      const seed = firstNumber(cr.baseRelationshipLevel);
      const base = current && typeof current === "object"
        ? current
        : { friendId: fid, relationshipLevel: seed == null ? 0 : seed };
      updated = engine.applyRelationshipDelta(base, delta);
      updated.friendId = fid;
      updated.socialHistory = (Array.isArray(base.socialHistory) ? base.socialHistory.slice() : []);
    } else {
      // Fallback (motor ikke lastet): enkel, trygg clamp-modell.
      const baseRec = current && typeof current === "object" ? current : {
        friendId: fid,
        relationshipLevel: firstNumber(cr.baseRelationshipLevel) || 0,
        trust: 0,
        familiarity: 0,
        socialHistory: []
      };
      updated = {
        friendId: fid,
        relationshipLevel: Math.max(0, (Number(baseRec.relationshipLevel) || 0) + delta.relationshipDelta),
        trust: Math.max(0, (Number(baseRec.trust) || 0) + delta.trustDelta),
        familiarity: Math.max(0, (Number(baseRec.familiarity) || 0) + delta.familiarityDelta),
        availabilityModifier: norm(baseRec.availabilityModifier) || "normal",
        socialHistory: Array.isArray(baseRec.socialHistory) ? baseRec.socialHistory.slice() : []
      };
    }

    updated.socialHistory.push(historyEntry);
    updated.lastInteractionPhase = phase || updated.lastInteractionPhase || null;
    updated.lastInteractionLocationId = locationId || updated.lastInteractionLocationId || null;
    updated.lastConversationChoice = norm(cr.choiceId) || null;
    updated.lastConversationStatus = norm(cr.nextStatus) || null;

    if (bridge && typeof bridge.saveSocialRelationship === "function") {
      bridge.saveSocialRelationship(updated);
    }
    return { ...updated, socialHistory: updated.socialHistory.slice() };
  }

  // ---------------------------------------------------------------------------
  // Mail-event for en samtaletråd (privat melding i innkommende)
  // ---------------------------------------------------------------------------
  // Bygger konvolutten meldingssystemet forstår, eksplisitt merket privat/
  // personlig (channel "private" + mail_class "private_message"). Får ALDRI
  // job/work/career-felt. choiceResult er valgfri (null ved opprettelse).
  function createConversationMailEvent(conversation, choiceResult) {
    const conv = obj(conversation);
    const cr = choiceResult && typeof choiceResult === "object" ? choiceResult : null;
    const first = firstName(conv.friendName);
    const messages = Array.isArray(conv.messages) ? conv.messages : [];
    const lastMessage = messages.length ? messages[messages.length - 1] : null;
    const summary = cr ? cr.resultText : (lastMessage ? lastMessage.body : "");
    const status = normalizeStatus(conv.status);
    const id = norm(conv.conversationId) + "_turn_" + Number(conv.turnIndex || 0);
    return {
      id: id,
      mail_key: id,
      // Eksplisitt privat/personlig – aldri jobb.
      type: PRIVATE_CHANNEL,
      mail_type: PRIVATE_CHANNEL,
      channel: PRIVATE_CHANNEL,
      mail_class: PRIVATE_MAIL_CLASS,
      source: SOURCE,
      subject: "Samtale med " + first,
      summary: norm(summary),
      // Sporbar kontekst for personlige meldinger.
      friendId: norm(conv.friendId),
      friendName: norm(conv.friendName),
      phase: normalizePhase(conv.phase),
      locationId: norm(conv.locationId) || null,
      // Ekte stedskobling for personlige meldinger.
      sourcePlaceId: norm(conv.sourcePlaceId) || null,
      brandId: norm(conv.brandId) || null,
      socialPlaceType: norm(conv.socialPlaceType) || null,
      placeLabel: norm(conv.locationLabel) || null,
      actionId: ORIGIN_ACTION_ID,
      threadId: norm(conv.threadId) || resolveConversationThreadId(conv.friendId),
      conversationId: norm(conv.conversationId),
      status: status,
      statusLabel: getConversationStatusLabel(status),
      choices: choicesForStatus(status)
    };
  }

  // Registrerer samtale-meldingen i innkommende via mail-engine når tilgjengelig.
  // Trygg lokal fallback (ingen kast) når engine ikke er lastet (test/headless).
  function registerConversationMail(conversation, choiceResult) {
    const event = createConversationMailEvent(conversation, choiceResult);
    const mailEngine = window.CivicationMailEngine;
    if (mailEngine && typeof mailEngine.sendMail === "function") {
      try {
        const res = mailEngine.sendMail({ event: event });
        return { registered: !!(res && res.ok), mail: (res && res.mail) || null, event: event };
      } catch (_e) {
        return { registered: false, mail: null, event: event };
      }
    }
    return { registered: false, mail: null, event: event };
  }

  // ---------------------------------------------------------------------------
  // Behandle et samtalevalg (hovedinngang, med sideeffekter)
  // ---------------------------------------------------------------------------
  // Validerer trygt (manglende samtale / ugyldig valg / lukket / allerede
  // behandlet tur), oppdaterer relasjon, oppdaterer samtaletråden (meldinger,
  // status, turnIndex, choiceLog) og registrerer en oppdatert privat melding.
  function handleSocialConversationChoice(conversationId, choiceId, context) {
    const ctx = obj(context);
    const conv = (function () {
      const store = loadStore();
      const id = norm(conversationId);
      return id ? (store[id] || null) : null;
    })();

    if (!conv) {
      return { ok: false, reason: "missing_conversation", conversationId: norm(conversationId), channel: PRIVATE_CHANNEL };
    }

    const cid = normalizeChoiceId(choiceId);
    if (!cid) {
      return { ok: false, reason: "invalid_choice", choiceId: norm(choiceId), conversationId: conv.conversationId, channel: PRIVATE_CHANNEL };
    }

    if (normalizeStatus(conv.status) === "closed" && !ctx.force) {
      return { ok: false, reason: "conversation_closed", conversationId: conv.conversationId, status: "closed", statusLabel: getConversationStatusLabel("closed"), channel: PRIVATE_CHANNEL };
    }

    // Tur-vakt: et valg kan bare behandles én gang per samtaletur. Når kallstedet
    // peker på en bestemt tur (context.atTurnIndex) som ikke er den aktive, eller
    // turen allerede er logget, avvises det trygt (med mindre force).
    const currentTurn = Number(conv.turnIndex) || 0;
    const targetTurn = ctx.atTurnIndex != null ? Number(ctx.atTurnIndex) : currentTurn;
    const alreadyHandled = Array.isArray(conv.choiceLog) &&
      conv.choiceLog.some((e) => Number(e && e.turnIndex) === targetTurn);
    if (!ctx.force && (targetTurn !== currentTurn || alreadyHandled)) {
      return { ok: false, reason: "turn_already_handled", conversationId: conv.conversationId, turnIndex: targetTurn, channel: PRIVATE_CHANNEL };
    }

    const bridge = window.CivicationFriendMessages;
    const relationship = (bridge && typeof bridge.getSocialRelationship === "function")
      ? bridge.getSocialRelationship(conv.friendId)
      : null;

    const choiceResult = buildSocialConversationChoiceResult(conv, cid, relationship);
    if (!choiceResult.ok) return choiceResult;

    // Relasjonskonsekvens (clamps + socialHistory via relasjonsmotoren).
    const updatedRelationship = applyConversationChoiceToRelationship(conv.friendId, choiceResult);

    // Oppdater samtaletråden.
    const first = firstName(conv.friendName);
    const nextStatus = choiceResult.nextStatus;
    conv.messages = Array.isArray(conv.messages) ? conv.messages : [];
    conv.messages.push({
      speaker: "player",
      body: choiceResult.resultText,
      choiceId: cid,
      phase: conv.phase,
      locationId: conv.locationId || null
    });
    const followLine = FRIEND_FOLLOW_LINE[nextStatus] || FRIEND_FOLLOW_LINE.continued;
    conv.messages.push({
      speaker: "friend",
      body: first + followLine,
      phase: conv.phase,
      locationId: conv.locationId || null
    });

    conv.choiceLog = Array.isArray(conv.choiceLog) ? conv.choiceLog : [];
    conv.choiceLog.push({
      turnIndex: currentTurn,
      choiceId: cid,
      nextStatus: nextStatus,
      relationshipDelta: choiceResult.relationshipDelta,
      trustDelta: choiceResult.trustDelta,
      familiarityDelta: choiceResult.familiarityDelta
    });

    conv.status = nextStatus;
    conv.statusLabel = getConversationStatusLabel(nextStatus);
    conv.turnIndex = currentTurn + 1;
    conv.choices = choicesForStatus(nextStatus).map((c) => {
      const def = CHOICE_DEF[c.choiceId];
      return {
        choiceId: def.choiceId,
        label: def.label,
        tone: def.tone,
        relationshipDelta: def.relationshipDelta,
        trustDelta: def.trustDelta,
        familiarityDelta: def.familiarityDelta,
        nextStatus: def.nextStatus
      };
    });
    if (choiceResult.socialHint) conv.pendingHint = choiceResult.socialHint;

    saveConversation(conv);

    // Registrer en oppdatert privat melding (samtalens nye tilstand).
    const reg = registerConversationMail(conv, choiceResult);

    return {
      ok: true,
      conversationId: conv.conversationId,
      choiceId: cid,
      choiceResult: choiceResult,
      resultText: choiceResult.resultText,
      status: conv.status,
      statusLabel: conv.statusLabel,
      turnIndex: conv.turnIndex,
      handledTurnIndex: currentTurn,
      relationship: updatedRelationship,
      conversation: cloneConversation(conv),
      view: buildSocialConversationView(conv),
      mailRegistered: !!(reg && reg.registered),
      mailEvent: (reg && reg.event) || null,
      channel: PRIVATE_CHANNEL,
      mail_class: PRIVATE_MAIL_CLASS,
      source: SOURCE
    };
  }

  // ---------------------------------------------------------------------------
  // View-model for Personlige meldinger (stabil adapter for UI-laget)
  // ---------------------------------------------------------------------------
  function buildSocialConversationView(conversation) {
    const conv = obj(conversation);
    const first = firstName(conv.friendName);
    const status = normalizeStatus(conv.status);
    const messages = Array.isArray(conv.messages) ? conv.messages : [];
    const lastMessage = messages.length ? messages[messages.length - 1] : null;

    const phaseLbl = phaseLabel(conv.phase);
    const placeLbl = norm(conv.locationLabel) ||
      (norm(conv.locationId) ? resolveLocationLabel(conv.locationId, {}) : "");
    const subtitleParts = [];
    if (phaseLbl) subtitleParts.push(phaseLbl);
    if (placeLbl) subtitleParts.push(placeLbl);

    return {
      conversationId: norm(conv.conversationId),
      threadId: norm(conv.threadId) || resolveConversationThreadId(conv.friendId),
      friendId: norm(conv.friendId),
      friendName: norm(conv.friendName),
      title: "Samtale med " + first,
      subtitle: subtitleParts.join(" · "),
      body: lastMessage ? norm(lastMessage.body) : "",
      status: status,
      statusLabel: getConversationStatusLabel(status),
      // Separasjon synlig i selve view-modellen.
      channel: PRIVATE_CHANNEL,
      mail_class: PRIVATE_MAIL_CLASS,
      choices: choicesForStatus(status)
    };
  }

  function clearConversationsForTesting() {
    _store = {};
    try {
      window.localStorage && window.localStorage.removeItem(CONVERSATION_STORE_KEY);
    } catch (_e) {
      // Ignorer – minnet er allerede nullstilt.
    }
    return {};
  }

  window.CivicationSocialConversationEngine = {
    // konstanter
    SOURCE: SOURCE,
    PRIVATE_CHANNEL: PRIVATE_CHANNEL,
    PRIVATE_MAIL_CLASS: PRIVATE_MAIL_CLASS,
    ORIGIN_ACTION_ID: ORIGIN_ACTION_ID,
    STATUS_VALUES: STATUS_VALUES.slice(),
    STATUS_LABEL: { ...STATUS_LABEL },
    CHOICE_ORDER: CHOICE_ORDER.slice(),
    CHOICE_DEF: JSON.parse(JSON.stringify(CHOICE_DEF)),
    // labels / tekster
    getConversationStatusLabel: getConversationStatusLabel,
    getConversationChoiceLabel: getConversationChoiceLabel,
    getConversationChoiceResultText: getConversationChoiceResultText,
    // id-/tråd-hjelpere
    resolveConversationThreadId: resolveConversationThreadId,
    buildConversationId: buildConversationId,
    // opprettelse + valg
    createSocialConversationFromResponse: createSocialConversationFromResponse,
    buildInitialConversationChoices: buildInitialConversationChoices,
    buildSocialConversationChoiceResult: buildSocialConversationChoiceResult,
    handleSocialConversationChoice: handleSocialConversationChoice,
    applyConversationChoiceToRelationship: applyConversationChoiceToRelationship,
    // mail / inbox
    createConversationMailEvent: createConversationMailEvent,
    registerConversationMail: registerConversationMail,
    // oppslag
    getConversationById: getConversationById,
    getConversationsForFriend: getConversationsForFriend,
    // view-model
    buildSocialConversationView: buildSocialConversationView,
    // test
    clearConversationsForTesting: clearConversationsForTesting
  };
})();
