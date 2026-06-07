// civicationFriendMessages.js
// Bro mellom Civication-vennehandlinger (profilkortet på bykartet) og spillets
// personlige meldinger / innkommende.
//
// Når spilleren bruker en sosial handling på en venn (Send melding / Inviter)
// skal handlingen bli synlig som en PERSONLIG melding i innkommende-systemet –
// aldri som jobbmail. Denne modulen lager en trygg, deterministisk action-modell
// for meldingen og registrerer den i det eksisterende meldingssystemet via en
// tydelig adapter.
//
// VIKTIG separasjon:
//   - Personlige vennehandlinger bruker ALLTID channel "private"/"personal".
//   - Vi setter aldri jobb-/karrierefelt (role_*, career_*, brand_*) på disse,
//     slik at de aldri kan havne i Jobbmail.
//   - Jobbmail og personlige meldinger forblir adskilte flyter.
//
// Ingen backend, ingen ekte multiplayer-synk – kun lokal, datadrevet spillflyt.
(function () {
  "use strict";

  if (window.CivicationFriendMessages) return;

  // Stabilt kildemerke for alle meldinger som kommer fra vennehandlinger.
  const SOURCE = "civication_friend_action";

  // Kildemerke for henvendelser som starter fra et sosialt sted (samme sted i
  // siste fase). Holdes adskilt fra vanlige vennehandlinger, men er fortsatt en
  // PERSONLIG melding (privat kanal, aldri jobbmail).
  const SOCIAL_ENCOUNTER_SOURCE = "civication_social_encounter";

  // Svarvalg mottakeren får på en sosial henvendelse (Mål 5).
  const RESPONSE_OPTIONS = ["reply", "ignore", "decline"];

  // Personlig/privat kanal. Brukes konsekvent slik at meldingene sorteres under
  // "Personlige meldinger" i innkommende, aldri under "Jobbmail".
  const PRIVATE_CHANNEL = "private";

  // Kildemerke for en NY personlig melding som oppstår når spilleren svarer på en
  // sosial henvendelse (followup / samtalestart). Egen kilde, fortsatt privat.
  const SOCIAL_RESPONSE_SOURCE = "civication_social_response";

  // Hvilke actionId-er som regnes som en sosial henvendelse (kan besvares).
  // Holdes eksplisitt smal: kun "approach" i dag. Jobbmail er ALDRI her.
  const SOCIAL_ACTIONS = ["approach"];

  // Norske labels for svarvalgene (fallback når motoren ikke er lastet).
  const SOCIAL_RESPONSE_LABEL = { reply: "Svar", ignore: "Ignorer", decline: "Avvis" };

  // Datadrevet konsekvensmodell pr. svarvalg. status/relationshipDelta/canFollowup
  // og brukervendt resultattekst – alt deterministisk, ingen tilfeldighet.
  //
  // Relasjonsmotoren (CivicationRelationshipEngine) er kilden til de fulle
  // dimensjonene (trust/familiarity/availability). Vi speiler dem her som rene
  // data slik at bridgen også fungerer i fallback uten motoren lastet.
  const SOCIAL_RESPONSE_CONSEQUENCE = {
    reply: {
      status: "replied",
      relationshipDelta: 1,
      trustDelta: 1,
      familiarityDelta: 1,
      availabilityModifier: "warmer",
      canFollowup: true,
      text: "Du svarer på henvendelsen. Samtalen kan fortsette."
    },
    ignore: {
      status: "ignored",
      relationshipDelta: 0,
      trustDelta: 0,
      familiarityDelta: 0,
      availabilityModifier: "unchanged",
      canFollowup: false,
      text: "Du ignorerer henvendelsen."
    },
    decline: {
      status: "declined",
      relationshipDelta: -1,
      trustDelta: -1,
      familiarityDelta: 0,
      availabilityModifier: "cooler",
      canFollowup: false,
      text: "Du avviser henvendelsen."
    }
  };

  // status -> kort, brukervendt resultatetikett i Personlige meldinger.
  const SOCIAL_RESPONSE_STATUS_LABEL = {
    pending_response: "Venter på svar",
    replied: "Besvart",
    ignored: "Ignorert",
    declined: "Avvist"
  };

  // Lokale, testbare lager for sosial relasjon + behandlede henvendelser.
  // Speiles til localStorage når tilgjengelig; ellers holdes alt i minne.
  const RELATIONSHIP_STORE_KEY = "civi.socialRelationships.v1";
  const RESPONSE_STORE_KEY = "civi.socialResponses.v1";

  // Semantisk fase -> brukervendt frase ("i fritidsfasen"). Deterministisk;
  // ingen klokke, ingen tilfeldighet.
  const PHASE_WORD = {
    morning: "morgenfasen",
    work: "arbeidsfasen",
    leisure: "fritidsfasen",
    evening: "kveldsfasen",
    reflection: "refleksjonsfasen"
  };

  const SNAPSHOT_PHASES = ["morning", "work", "leisure", "evening", "reflection"];

  // Enkel, lokal sekvensteller slik at hver registrerte melding får en unik id
  // selv om flere meldinger sendes til samme tråd i samme runde.
  let _seq = 0;
  function nextSeq() {
    _seq += 1;
    return _seq;
  }

  function norm(value) {
    return String(value == null ? "" : value).trim();
  }

  function obj(value) {
    return value && typeof value === "object" ? value : {};
  }

  // Første endelige tall blant argumentene, ellers null. Brukes for å lese et
  // valgfritt seed-relasjonsnivå fra kontekst/melding uten å kaste.
  function firstNumber() {
    for (let i = 0; i < arguments.length; i += 1) {
      const v = arguments[i];
      if (v == null || v === "") continue;
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
    return null;
  }

  // Normaliser til en gyldig semantisk fase. Faller trygt tilbake til "morning".
  function normalizePhase(phase) {
    const eng = window.CivicationFriendsEngine;
    if (eng && typeof eng.normalizeSnapshotPhase === "function") {
      return eng.normalizeSnapshotPhase(phase);
    }
    const p = norm(phase).toLowerCase();
    return SNAPSHOT_PHASES.includes(p) ? p : "morning";
  }

  function firstName(name) {
    const n = norm(name) || "vennen";
    return n.split(/\s+/)[0] || n;
  }

  function phaseInWords(phase) {
    return PHASE_WORD[normalizePhase(phase)] || "fasen";
  }

  // Stabil tråd-id pr. venn. Eksempel: friendId "friend_demo_01" ->
  // "friend_friend_demo_01". Samme venn gir alltid samme tråd.
  function resolvePrivateThreadForFriend(friendId) {
    const fid = norm(friendId);
    if (!fid) return "";
    return "friend_" + fid;
  }

  // Leser felles kontekst ut av et action-resultat. Tåler både hele resultatet
  // fra CivicationFriendsEngine.handleFriendAction ({ ok, action, model, ... })
  // og en rå action-modell. Trygt ved manglende/ufullstendig snapshot.
  function readActionContext(actionResult) {
    const ar = actionResult && typeof actionResult === "object" ? actionResult : {};
    const model = ar.model && typeof ar.model === "object" ? ar.model : ar;
    return {
      friendId: norm(model.friendId || ar.friendId),
      friendName: norm(model.friendName || model.name) || "vennen",
      phase: normalizePhase(model.phase || ar.phase),
      locationId: norm(model.locationId) || null,
      locationLabel: norm(model.locationLabel) || "",
      actionId: norm(model.action || model.actionId || ar.action).toLowerCase()
    };
  }

  // ---------------------------------------------------------------------------
  // Action-modeller (rene, deterministiske, testbare)
  // ---------------------------------------------------------------------------
  // Form per oppgaven: type/channel "private", source, actionId, friendId,
  // phase, threadId, title, body, status. locationId følger med for invite.

  // Send melding: forbereder en personlig meldingstråd med vennen.
  function createPrivateMessageFromFriendAction(actionResult) {
    const ctx = readActionContext(actionResult);
    const first = firstName(ctx.friendName);
    return {
      type: PRIVATE_CHANNEL,
      channel: PRIVATE_CHANNEL,
      source: SOURCE,
      actionId: "message",
      friendId: ctx.friendId,
      friendName: ctx.friendName,
      phase: ctx.phase,
      threadId: resolvePrivateThreadForFriend(ctx.friendId),
      title: "Melding til " + first,
      body: "Du starter en personlig melding til " + first + ".",
      status: "draft"
    };
  }

  // Inviter: lager en personlig invitasjon knyttet til aktiv fase (og sted når
  // det er relevant).
  function createInviteMessageFromFriendAction(actionResult) {
    const ctx = readActionContext(actionResult);
    const first = firstName(ctx.friendName);
    const placePart = ctx.locationLabel ? (" til " + ctx.locationLabel) : "";
    const message = {
      type: PRIVATE_CHANNEL,
      channel: PRIVATE_CHANNEL,
      source: SOURCE,
      actionId: "invite",
      friendId: ctx.friendId,
      friendName: ctx.friendName,
      phase: ctx.phase,
      threadId: resolvePrivateThreadForFriend(ctx.friendId),
      title: "Invitasjon til " + first,
      body: "Du inviterer " + first + placePart + " i " + phaseInWords(ctx.phase) + ".",
      status: "draft"
    };
    if (ctx.locationId) message.locationId = ctx.locationId;
    return message;
  }

  // Henvend deg: lager en personlig HENVENDELSE fra et sosialt sted (samme sted
  // i siste fase). Egen kilde (civication_social_encounter), status
  // "pending_response" og svarvalg reply/ignore/decline (Mål 4/5). Fortsatt en
  // personlig melding (privat kanal) – aldri jobb-/karrierefelt.
  function createApproachMessageFromEncounter(actionResult) {
    const ctx = readActionContext(actionResult);
    const first = firstName(ctx.friendName);
    const placeLabel = ctx.locationLabel || ctx.locationId || "stedet";
    const message = {
      type: PRIVATE_CHANNEL,
      channel: PRIVATE_CHANNEL,
      source: SOCIAL_ENCOUNTER_SOURCE,
      actionId: "approach",
      friendId: ctx.friendId,
      friendName: ctx.friendName,
      phase: ctx.phase,
      threadId: resolvePrivateThreadForFriend(ctx.friendId),
      title: "Henvendelse til " + first,
      body: "Du henvender deg til " + first + " på " + placeLabel.toLowerCase() +
        " i " + phaseInWords(ctx.phase) + ".",
      status: "pending_response",
      responseOptions: RESPONSE_OPTIONS.slice()
    };
    if (ctx.locationId) message.locationId = ctx.locationId;
    return message;
  }

  // Mål 5: modell for mottakerens svarvalg på en henvendelse. Bruker motorens
  // label-hjelper når den finnes, ellers trygg lokal fallback.
  function buildEncounterResponseModel(messageOrEvent) {
    const m = messageOrEvent && typeof messageOrEvent === "object" ? messageOrEvent : {};
    const opts = Array.isArray(m.responseOptions) && m.responseOptions.length
      ? m.responseOptions
      : RESPONSE_OPTIONS.slice();
    const eng = window.CivicationFriendsEngine;
    const fallbackLabels = { reply: "Svar", ignore: "Ignorer", decline: "Avvis" };
    const labelFor = (o) => {
      if (eng && typeof eng.getResponseOptionLabel === "function") {
        const lbl = eng.getResponseOptionLabel(o);
        if (lbl) return lbl;
      }
      return fallbackLabels[norm(o).toLowerCase()] || "";
    };
    return {
      friendId: norm(m.friendId),
      threadId: norm(m.threadId) || resolvePrivateThreadForFriend(m.friendId),
      status: norm(m.status) || "pending_response",
      options: opts.map((o) => ({ id: norm(o).toLowerCase(), label: labelFor(o) }))
    };
  }

  // ---------------------------------------------------------------------------
  // Adapter mot eksisterende meldingssystem
  // ---------------------------------------------------------------------------
  // Mapper en personlig vennemeldings-modell til konvolutten som
  // CivicationMailEngine forstår, og merker den eksplisitt som privat/personlig
  // (channel "private" + mail_class "private_message"). Da sorteres den under
  // "Personlige meldinger" i innkommende, og isJobRelatedMail/getMessageChannel
  // returnerer aldri "job" for den.
  //
  // TODO: Når innkommende får et fullverdig trådbasert privat meldingslager kan
  // denne adapteren peke dit i stedet. Inntil da gjenbruker vi mail-engine slik
  // at jobbmail og private meldinger holdes adskilt via channel/mail_class.
  function toMailEvent(message) {
    const m = message && typeof message === "object" ? message : {};
    const threadId = norm(m.threadId) || resolvePrivateThreadForFriend(m.friendId);
    const actionId = norm(m.actionId) || "message";
    const id = threadId + "_" + actionId + "_" + nextSeq();
    const event = {
      id: id,
      mail_key: id,
      // Eksplisitt privat/personlig – aldri jobb.
      type: PRIVATE_CHANNEL,
      mail_type: PRIVATE_CHANNEL,
      channel: PRIVATE_CHANNEL,
      mail_class: "private_message",
      // Behold kilden (vennehandling vs. sosial henvendelse), default vennehandling.
      source: norm(m.source) || SOURCE,
      // Brukervendt innhold.
      subject: norm(m.title) || "Personlig melding",
      summary: norm(m.body),
      // Sporbar kontekst for personlige meldinger.
      friendId: norm(m.friendId),
      friendName: norm(m.friendName),
      phase: normalizePhase(m.phase),
      actionId: actionId,
      threadId: threadId,
      locationId: norm(m.locationId) || null,
      status: norm(m.status) || "draft"
    };
    // Svarvalg følger med for sosiale henvendelser (Mål 5).
    if (Array.isArray(m.responseOptions) && m.responseOptions.length) {
      event.responseOptions = m.responseOptions.slice();
    }
    return event;
  }

  // Registrerer meldingen i innkommende via mail-engine når den er tilgjengelig.
  // Trygg lokal fallback (ingen kast) når engine ikke er lastet (test/headless).
  function registerPrivateMessage(message) {
    const event = toMailEvent(message);
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

  // Stabil event-hook: be UI-laget åpne den personlige meldingstråden med vennen.
  // Beholder bakoverkompatible felt (friendId/friendName/phase/status) i tillegg
  // til ny trådkontekst (threadId/channel/message).
  function dispatchPrivateMessageOpen(friendId, messageContext) {
    const msg = messageContext && typeof messageContext === "object" ? messageContext : {};
    const detail = {
      friendId: norm(friendId),
      friendName: norm(msg.friendName),
      phase: normalizePhase(msg.phase),
      threadId: resolvePrivateThreadForFriend(friendId),
      channel: PRIVATE_CHANNEL,
      status: norm(msg.status) || "draft",
      source: "civicationFriendMessages",
      message: messageContext || null
    };
    try {
      if (typeof window.dispatchEvent === "function" && typeof window.CustomEvent === "function") {
        window.dispatchEvent(new window.CustomEvent("civi:openPrivateMessage", { detail: detail }));
      }
    } catch (_e) {
      // Stille – event-hook er bekvemmelighet, ikke en hard avhengighet.
    }
    return detail;
  }

  // ---------------------------------------------------------------------------
  // Hoved-bro
  // ---------------------------------------------------------------------------
  // Tar et action-resultat (eller en modell) fra en vennehandling og kobler de
  // sosiale handlingene Send melding / Inviter til personlige meldinger:
  //   - bygger riktig personlig action-modell,
  //   - registrerer den i innkommende (privat kanal, aldri jobbmail),
  //   - åpner/forbereder tråden (kun Send melding),
  //   - returnerer en brukervendt feedback-tekst til kartlaget.
  function handleCivicationFriendMessageAction(actionResult) {
    // Respekter et eksplisitt feilresultat fra action-routeren (f.eks. ukjent
    // venn / ukjent handling) – da lager vi ingen personlig melding.
    if (actionResult && typeof actionResult === "object" && actionResult.ok === false) {
      const failedAction = norm(actionResult.action).toLowerCase();
      return {
        ok: false,
        reason: norm(actionResult.reason) || "action_not_ok",
        actionId: failedAction,
        channel: PRIVATE_CHANNEL
      };
    }

    const ctx = readActionContext(actionResult);
    const actionId = ctx.actionId;

    if (actionId !== "message" && actionId !== "invite" && actionId !== "approach") {
      return { ok: false, reason: "not_a_message_action", actionId: actionId, channel: PRIVATE_CHANNEL };
    }
    if (!ctx.friendId) {
      return { ok: false, reason: "missing_friend", actionId: actionId, channel: PRIVATE_CHANNEL };
    }

    let message;
    if (actionId === "approach") message = createApproachMessageFromEncounter(actionResult);
    else if (actionId === "invite") message = createInviteMessageFromFriendAction(actionResult);
    else message = createPrivateMessageFromFriendAction(actionResult);

    const reg = registerPrivateMessage(message);

    // Send melding åpner/forbereder tråden; Inviter/Henvend deg legges i innkommende.
    if (actionId === "message") {
      dispatchPrivateMessageOpen(message.friendId, message);
    }

    const first = firstName(ctx.friendName);
    let feedbackText;
    if (actionId === "message") {
      feedbackText = "Personlig melding til " + first + " er klar i Innkommende.";
    } else if (actionId === "approach") {
      feedbackText = "Henvendelse til " + first + " er lagt i Personlige meldinger.";
    } else {
      feedbackText = "Invitasjon til " + first + " er lagt i Personlige meldinger.";
    }

    return {
      ok: true,
      channel: PRIVATE_CHANNEL,
      actionId: actionId,
      friendId: message.friendId,
      threadId: message.threadId,
      message: message,
      mailEvent: reg.event,
      registered: reg.registered,
      // Svarvalg-modell følger med for henvendelser (Mål 5).
      responseModel: actionId === "approach" ? buildEncounterResponseModel(message) : null,
      feedbackText: feedbackText
    };
  }

  // ---------------------------------------------------------------------------
  // Sosial svarsløyfe (Svar / Ignorer / Avvis) – datadrevet, testbar
  // ---------------------------------------------------------------------------
  // Når en sosial henvendelse (actionId "approach", privat kanal,
  // mail_class "private_message") ligger i Personlige meldinger, kan spilleren
  // svare. Valget lagres som en sosial respons og gir tydelig konsekvens:
  //   reply   -> status "replied",  relationshipDelta +1, kan starte samtale
  //   ignore  -> status "ignored",  relationshipDelta  0, ingen ny samtale
  //   decline -> status "declined", relationshipDelta -1, ingen ny samtale
  //
  // SEPARASJON: denne flyten behandler ALDRI jobbmail. Resultatet er alltid
  // privat/personlig (channel "private", mail_class "private_message") og får
  // aldri job/work/career-felt. Alt er deterministisk og lokalt (ingen backend).

  // Normaliser et svarvalg til en gyldig id, ellers "" (ugyldig/manglende).
  function normalizeResponseId(responseId) {
    const r = norm(responseId).toLowerCase();
    return RESPONSE_OPTIONS.includes(r) ? r : "";
  }

  // Svarvalg -> norsk knappetekst ("Svar"/"Ignorer"/"Avvis"). Bruker motorens
  // label-hjelper når den finnes, ellers trygg lokal fallback.
  function getSocialResponseLabel(responseId) {
    const r = normalizeResponseId(responseId);
    if (!r) return "";
    const eng = window.CivicationFriendsEngine;
    if (eng && typeof eng.getResponseOptionLabel === "function") {
      const lbl = eng.getResponseOptionLabel(r);
      if (lbl) return lbl;
    }
    return SOCIAL_RESPONSE_LABEL[r] || "";
  }

  // status -> kort resultatetikett ("Besvart"/"Ignorert"/"Avvist").
  function getSocialResponseStatusLabel(status) {
    return SOCIAL_RESPONSE_STATUS_LABEL[norm(status).toLowerCase()] || "";
  }

  // Brukervendt resultattekst for et svar (fra responseId, ev. fra status).
  function getSocialResponseResultText(responseResult) {
    const rr = obj(responseResult);
    const rid = normalizeResponseId(rr.responseId);
    if (rid) return SOCIAL_RESPONSE_CONSEQUENCE[rid].text;
    const byStatus = { replied: "reply", ignored: "ignore", declined: "decline" }[norm(rr.status).toLowerCase()];
    return byStatus ? SOCIAL_RESPONSE_CONSEQUENCE[byStatus].text : "";
  }

  // Har meldingen noen jobb-/arbeids-/karrierefelt? Hard separasjonsvakt slik at
  // jobbmail aldri kan behandles av den sosiale svarsløyfen.
  function hasJobFields(message) {
    const m = obj(message);
    const jobKeys = [
      "career_id", "role_key", "role_id", "role_scope", "brand_id", "brand_name",
      "task_domain", "career_outcome_meta", "role_content_meta", "mail_plan_meta",
      "brand_progression_meta"
    ];
    if (jobKeys.some((k) => norm(m[k]))) return true;
    const ch = norm(m.channel || m.messageChannel).toLowerCase();
    if (ch === "job" || ch === "jobmail") return true;
    const mc = norm(m.mail_class).toLowerCase();
    if (mc === "job_message" || mc === "career_outcome" || mc === "daily_workday" ||
        mc === "opportunity_blocked" || mc === "job_milestone") return true;
    // Siste vakt: la channel-klassifiseringen bekrefte at dette ikke er jobbmail.
    const channels = window.CivicationEventChannels;
    if (channels && typeof channels.isJobMail === "function") {
      try { if (channels.isJobMail(m)) return true; } catch (_e) { /* trygt videre */ }
    }
    return false;
  }

  // Les felles kontekst ut av en henvendelses-melding. Tåler både mail-eventet
  // (fra innkommende, med id/mail_class) og en rå approach-modell.
  function readResponseMessageContext(message) {
    const m = obj(message);
    return {
      messageId: norm(m.id || m.mail_key),
      friendId: norm(m.friendId),
      friendName: norm(m.friendName) || "vennen",
      phase: normalizePhase(m.phase),
      locationId: norm(m.locationId) || null,
      threadId: norm(m.threadId) || resolvePrivateThreadForFriend(m.friendId),
      actionId: norm(m.actionId || m.action).toLowerCase() || "approach",
      channel: norm(m.channel || m.type || m.mail_type).toLowerCase(),
      mailClass: norm(m.mail_class).toLowerCase(),
      source: norm(m.source).toLowerCase(),
      status: norm(m.status).toLowerCase()
    };
  }

  // Validerer at meldingen er en sosial henvendelse som KAN besvares. Returnerer
  // { ok, reason }. Avviser jobbmail, feil kanal/mail_class og ikke-sosiale
  // handlinger trygt (ingen kast).
  function validateSocialEncounterMessage(message) {
    const m = obj(message);
    if (!message || typeof message !== "object" || Array.isArray(message) || Object.keys(m).length === 0) {
      return { ok: false, reason: "missing_message" };
    }
    // Jobbmail kan ALDRI behandles av den sosiale svarsløyfen.
    if (hasJobFields(m)) return { ok: false, reason: "job_mail_not_allowed" };
    const ctx = readResponseMessageContext(m);
    if (ctx.channel !== "private" && ctx.channel !== "personal") {
      return { ok: false, reason: "not_private_channel" };
    }
    if (ctx.mailClass && ctx.mailClass !== "private_message") {
      return { ok: false, reason: "not_private_message" };
    }
    const isSocialAction = SOCIAL_ACTIONS.includes(ctx.actionId);
    const isSocialSource = ctx.source === SOCIAL_ENCOUNTER_SOURCE;
    if (!isSocialAction && !isSocialSource) {
      return { ok: false, reason: "not_social_action" };
    }
    return { ok: true, reason: "" };
  }

  // Er meldingen en besvarbar sosial henvendelse? (boolsk bekvemmelighet).
  function isSocialEncounterMessage(message) {
    return validateSocialEncounterMessage(message).ok;
  }

  // Bygger en NY personlig melding (samtalestart) når spilleren svarer. Kun for
  // "reply". Returnerer null for ignore/decline. Privat kanal, aldri jobb.
  function createFollowupMessageFromSocialResponse(responseResult) {
    const rr = obj(responseResult);
    const rid = normalizeResponseId(rr.responseId);
    const cons = rid ? SOCIAL_RESPONSE_CONSEQUENCE[rid] : null;
    if (!cons || !cons.canFollowup) return null;
    const friendId = norm(rr.friendId);
    const first = firstName(rr.friendName);
    const followup = {
      type: PRIVATE_CHANNEL,
      channel: PRIVATE_CHANNEL,
      source: SOCIAL_RESPONSE_SOURCE,
      actionId: "reply",
      friendId: friendId,
      friendName: norm(rr.friendName),
      phase: normalizePhase(rr.phase),
      threadId: norm(rr.threadId) || resolvePrivateThreadForFriend(friendId),
      title: "Samtale med " + first,
      body: "Du svarer " + first + ". Samtalen er i gang.",
      status: "open"
    };
    if (norm(rr.locationId)) followup.locationId = norm(rr.locationId);
    return followup;
  }

  // Ren byggefunksjon: bygger resultatet av et svar på en henvendelse uten
  // sideeffekter (ingen lagring, ingen registrering). Trygg ved ugyldig svar /
  // ikke-sosial melding. Resultatet er ALLTID privat, aldri jobb.
  function buildSocialEncounterResponseResult(message, responseId, context) {
    const ctxIn = obj(context);
    const rid = normalizeResponseId(responseId);
    if (!rid) {
      return { ok: false, reason: "invalid_response", responseId: norm(responseId), channel: PRIVATE_CHANNEL };
    }
    const valid = validateSocialEncounterMessage(message);
    if (!valid.ok) {
      return { ok: false, reason: valid.reason, responseId: rid, channel: PRIVATE_CHANNEL };
    }
    const mctx = readResponseMessageContext(message);
    const cons = SOCIAL_RESPONSE_CONSEQUENCE[rid];
    const messageId = norm(ctxIn.messageId) || mctx.messageId || (mctx.threadId + "_" + mctx.actionId);
    const baseLevel = firstNumber(
      ctxIn.relationshipLevel,
      ctxIn.friend && ctxIn.friend.relationshipLevel,
      message && message.relationshipLevel
    );
    const result = {
      ok: true,
      responseId: rid,
      responseLabel: getSocialResponseLabel(rid),
      status: cons.status,
      statusLabel: getSocialResponseStatusLabel(cons.status),
      relationshipDelta: cons.relationshipDelta,
      // Fulle relasjonsdimensjoner (datadrevet konsekvensmodell).
      trustDelta: cons.trustDelta,
      familiarityDelta: cons.familiarityDelta,
      availabilityModifier: cons.availabilityModifier,
      resultText: cons.text,
      canFollowup: cons.canFollowup,
      // Separasjon: alltid privat/personlig, aldri jobb.
      channel: PRIVATE_CHANNEL,
      mail_class: "private_message",
      source: SOCIAL_RESPONSE_SOURCE,
      // Sporbar kontekst.
      messageId: messageId,
      actionId: mctx.actionId || "approach",
      friendId: mctx.friendId,
      friendName: mctx.friendName,
      phase: mctx.phase,
      locationId: mctx.locationId,
      threadId: mctx.threadId,
      baseRelationshipLevel: baseLevel
    };
    if (norm(ctxIn.at)) result.respondedAt = norm(ctxIn.at);
    result.followup = cons.canFollowup ? createFollowupMessageFromSocialResponse(result) : null;
    return result;
  }

  // ---- Lokal relasjonsmodell (testbar) ---------------------------------------
  let _relationshipStore = null;

  function loadRelationshipStore() {
    if (_relationshipStore) return _relationshipStore;
    _relationshipStore = {};
    try {
      const raw = window.localStorage && window.localStorage.getItem(RELATIONSHIP_STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") _relationshipStore = parsed;
      }
    } catch (_e) {
      // localStorage utilgjengelig (privat modus/test) – hold alt i minne.
    }
    return _relationshipStore;
  }

  function persistRelationshipStore(store) {
    try {
      window.localStorage && window.localStorage.setItem(RELATIONSHIP_STORE_KEY, JSON.stringify(store));
    } catch (_e) {
      // Ignorer skrivefeil – minnet er fortsatt oppdatert.
    }
  }

  // Oppdaterer (eller oppretter) sosial relasjon for en venn ut fra et
  // svar-resultat. relationshipLevel seedes fra responseResult.baseRelationshipLevel
  // første gang vennen ses, og justeres deretter.
  //
  // Når relasjonsmotoren (CivicationRelationshipEngine) er lastet brukes den
  // rikere modellen (relationshipStage/trust/familiarity/availabilityModifier +
  // lastInteractionPhase/locationId), med clamps og dobbel-effekt-vakt. Uten
  // motoren faller vi trygt tilbake til den enkle nivå-/historikk-modellen slik
  // at bridgen aldri kaster og eldre tester fortsatt passerer.
  function applySocialRelationshipDelta(friendId, responseResult) {
    const rr = obj(responseResult);
    const fid = norm(friendId) || norm(rr.friendId);
    const store = loadRelationshipStore();
    let record = store[fid];

    const engine = window.CivicationRelationshipEngine;
    if (engine && typeof engine.updateRelationshipFromSocialResponse === "function") {
      let base = record && typeof record === "object" ? record : null;
      if (!base) {
        const seed = firstNumber(rr.baseRelationshipLevel);
        base = { friendId: fid, relationshipLevel: seed == null ? 0 : seed };
      }
      const messageCtx = {
        friendId: fid,
        id: norm(rr.messageId),
        phase: norm(rr.phase),
        locationId: norm(rr.locationId),
        actionId: norm(rr.actionId) || "approach"
      };
      const updated = engine.updateRelationshipFromSocialResponse(messageCtx, rr, base);
      // Bevar tidsmerket fra svaret (motoren er tidsuavhengig).
      updated.lastSocialResponseAt = norm(rr.respondedAt) ||
        (record && record.lastSocialResponseAt) || null;
      store[fid] = updated;
      persistRelationshipStore(store);
      return { ...updated, socialHistory: updated.socialHistory.slice() };
    }

    // ---- Fallback (motor ikke lastet): enkel nivå-/historikk-modell ----------
    const delta = Number(rr.relationshipDelta) || 0;
    if (!record || typeof record !== "object") {
      const seed = firstNumber(rr.baseRelationshipLevel);
      record = {
        friendId: fid,
        relationshipLevel: seed == null ? 0 : seed,
        lastSocialResponse: null,
        lastSocialResponseAt: null,
        socialHistory: []
      };
    }
    record.friendId = fid;
    record.relationshipLevel = Math.max(0, (Number(record.relationshipLevel) || 0) + delta);
    record.lastSocialResponse = normalizeResponseId(rr.responseId) || record.lastSocialResponse;
    record.lastSocialResponseAt = norm(rr.respondedAt) || record.lastSocialResponseAt || null;
    record.socialHistory = Array.isArray(record.socialHistory) ? record.socialHistory : [];
    record.socialHistory.push({
      messageId: norm(rr.messageId),
      actionId: norm(rr.actionId) || "approach",
      responseId: normalizeResponseId(rr.responseId),
      phase: normalizePhase(rr.phase),
      locationId: norm(rr.locationId) || null,
      relationshipDelta: delta
    });
    store[fid] = record;
    persistRelationshipStore(store);
    return { ...record, socialHistory: record.socialHistory.slice() };
  }

  function getSocialRelationship(friendId) {
    const fid = norm(friendId);
    const r = loadRelationshipStore()[fid];
    return r ? { ...r, socialHistory: Array.isArray(r.socialHistory) ? r.socialHistory.slice() : [] } : null;
  }

  // Skriver et helt relasjonsrecord tilbake til det samme lokale lageret.
  // Brukes av den sosiale samtalemotoren (CivicationSocialConversationEngine)
  // slik at samtalevalg lagrer relasjon i SAMME lager som svarsløyfen. Krever et
  // friendId; ellers ingen skriving (trygt). Returnerer en kopi.
  function saveSocialRelationship(record) {
    const rec = obj(record);
    const fid = norm(rec.friendId);
    if (!fid) return null;
    const store = loadRelationshipStore();
    store[fid] = rec;
    persistRelationshipStore(store);
    return { ...rec, socialHistory: Array.isArray(rec.socialHistory) ? rec.socialHistory.slice() : [] };
  }

  // Brukervendt relasjonssammendrag via relasjonsmotoren. Returnerer null når
  // motoren ikke er lastet eller relasjonen mangler – trygt for kallsteder.
  function buildRelationshipSummary(relationship) {
    if (!relationship || typeof relationship !== "object") return null;
    const engine = window.CivicationRelationshipEngine;
    if (engine && typeof engine.buildRelationshipSummary === "function") {
      return engine.buildRelationshipSummary(relationship);
    }
    return null;
  }

  // Bekvemmelighet for UI: hent relasjonssammendrag for en venn direkte fra det
  // lokale lageret (eller null når ingen relasjon / ingen motor).
  function getRelationshipSummaryForFriend(friendId) {
    return buildRelationshipSummary(getSocialRelationship(friendId));
  }

  function clearSocialRelationshipsForTesting() {
    _relationshipStore = {};
    try {
      window.localStorage && window.localStorage.removeItem(RELATIONSHIP_STORE_KEY);
    } catch (_e) {
      // Ignorer – minnet er allerede nullstilt.
    }
    return {};
  }

  // ---- Behandlede henvendelser (hindrer dobbel respons) ----------------------
  let _responseStore = null;

  function loadResponseStore() {
    if (_responseStore) return _responseStore;
    _responseStore = {};
    try {
      const raw = window.localStorage && window.localStorage.getItem(RESPONSE_STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") _responseStore = parsed;
      }
    } catch (_e) {
      // hold i minne ved utilgjengelig localStorage.
    }
    return _responseStore;
  }

  function persistResponseStore(store) {
    try {
      window.localStorage && window.localStorage.setItem(RESPONSE_STORE_KEY, JSON.stringify(store));
    } catch (_e) {
      // Ignorer skrivefeil.
    }
  }

  function getSocialResponseRecord(messageId) {
    const mid = norm(messageId);
    if (!mid) return null;
    return loadResponseStore()[mid] || null;
  }

  function recordSocialResponse(messageId, result) {
    const mid = norm(messageId);
    if (!mid) return null;
    const store = loadResponseStore();
    store[mid] = {
      messageId: mid,
      responseId: result.responseId,
      status: result.status,
      friendId: result.friendId,
      relationshipDelta: result.relationshipDelta,
      phase: result.phase,
      locationId: result.locationId
    };
    persistResponseStore(store);
    return store[mid];
  }

  function clearSocialResponsesForTesting() {
    _responseStore = {};
    try {
      window.localStorage && window.localStorage.removeItem(RESPONSE_STORE_KEY);
    } catch (_e) {
      // Ignorer.
    }
    return {};
  }

  // Hoved-inngang: håndterer spillerens svar på en sosial henvendelse. Tar
  // (messageId, responseId, context). context.message (eller .event) skal være
  // henvendelses-meldingen. Validerer, hindrer dobbel respons, oppdaterer
  // relasjon, og lager/registrerer en followup ved "Svar". Kaster aldri.
  function handleSocialEncounterResponse(messageId, responseId, context) {
    const ctx = obj(context);
    const message = ctx.message || ctx.event || ctx.mail || null;
    const rid = normalizeResponseId(responseId);
    if (!rid) {
      return { ok: false, reason: "invalid_response", responseId: norm(responseId), channel: PRIVATE_CHANNEL };
    }
    const valid = validateSocialEncounterMessage(message);
    if (!valid.ok) {
      return { ok: false, reason: valid.reason, responseId: rid, channel: PRIVATE_CHANNEL };
    }
    const mctx = readResponseMessageContext(message);
    const mid = norm(messageId) || mctx.messageId || (mctx.threadId + "_" + mctx.actionId);

    // Dobbel-respons-vakt: samme melding kan ikke besvares to ganger uten at
    // kallstedet eksplisitt setter context.force = true.
    const prior = getSocialResponseRecord(mid);
    if (prior && !ctx.force) {
      return {
        ok: false,
        reason: "already_responded",
        responseId: prior.responseId,
        status: prior.status,
        statusLabel: getSocialResponseStatusLabel(prior.status),
        messageId: mid,
        channel: PRIVATE_CHANNEL,
        existing: prior
      };
    }

    const result = buildSocialEncounterResponseResult(message, rid, { ...ctx, messageId: mid });
    if (!result.ok) return result;

    // Relasjonskonsekvens.
    result.relationship = applySocialRelationshipDelta(result.friendId, result);
    // Brukervendt relasjonssammendrag (for followup-melding / profilkort) når
    // relasjonsmotoren er lastet. Trygt fravær uten motoren.
    result.relationshipSummary = buildRelationshipSummary(result.relationship);

    // Marker meldingen som behandlet (hindrer dobbel respons senere).
    recordSocialResponse(mid, result);

    // Ved "Svar" registreres en followup som personlig melding (privat kanal).
    if (result.followup) {
      try {
        const reg = registerPrivateMessage(result.followup);
        result.followupRegistered = !!(reg && reg.registered);
        result.followupEvent = (reg && reg.event) || null;
      } catch (_e) {
        result.followupRegistered = false;
        result.followupEvent = null;
      }
    }

    // Positiv respons («Svar») skal bli en faktisk samtaletråd, ikke bare
    // relasjonspoeng. Når samtalemotoren er lastet åpner/oppretter vi en liten
    // sosial samtaletråd i Personlige meldinger. Followup-meldingen over bevares;
    // her kobler vi den til samtalens conversationId. Trygt fravær uten motoren.
    if (result.followup && window.CivicationSocialConversationEngine &&
        typeof window.CivicationSocialConversationEngine.createSocialConversationFromResponse === "function") {
      try {
        const conv = window.CivicationSocialConversationEngine
          .createSocialConversationFromResponse(result, { message: message });
        if (conv) {
          result.conversation = conv;
          result.conversationId = conv.conversationId;
          if (result.followupEvent) result.followupEvent.conversationId = conv.conversationId;
        }
      } catch (_e) {
        // Samtaletråd er en utvidelse – aldri en hard avhengighet for svaret.
      }
    }

    return result;
  }

  // Stabil adapter/view-model for Personlige meldinger: gir meldingssystemet alt
  // det trenger for å vise valgene (Svar/Ignorer/Avvis) og – etter svar –
  // resultatet (Besvart/Ignorert/Avvist) uten ny logikk. Ren funksjon.
  function buildSocialEncounterResponseView(message, context) {
    const ctx = obj(context);
    const valid = validateSocialEncounterMessage(message);
    const mctx = readResponseMessageContext(message);
    const messageId = norm(ctx.messageId) || mctx.messageId || (mctx.threadId + "_" + mctx.actionId);
    const record = getSocialResponseRecord(messageId);
    const responded = !!record;
    const options = RESPONSE_OPTIONS.map((id) => ({ id: id, label: getSocialResponseLabel(id) }));
    const status = responded ? record.status : (mctx.status || "pending_response");
    return {
      isSocialEncounter: valid.ok,
      reason: valid.reason || "",
      messageId: messageId,
      friendId: mctx.friendId,
      friendName: mctx.friendName,
      phase: mctx.phase,
      locationId: mctx.locationId,
      threadId: mctx.threadId,
      // Separasjon synlig i selve view-modellen.
      channel: PRIVATE_CHANNEL,
      mail_class: "private_message",
      responded: responded,
      status: status,
      statusLabel: getSocialResponseStatusLabel(status),
      responseId: responded ? record.responseId : null,
      // Valg vises kun før svar; etter svar viser vi resultatet i stedet.
      options: (valid.ok && !responded) ? options : [],
      canRespond: valid.ok && !responded
    };
  }

  window.CivicationFriendMessages = {
    SOURCE: SOURCE,
    SOCIAL_ENCOUNTER_SOURCE: SOCIAL_ENCOUNTER_SOURCE,
    SOCIAL_RESPONSE_SOURCE: SOCIAL_RESPONSE_SOURCE,
    RESPONSE_OPTIONS: RESPONSE_OPTIONS.slice(),
    SOCIAL_ACTIONS: SOCIAL_ACTIONS.slice(),
    SOCIAL_RESPONSE_LABEL: { ...SOCIAL_RESPONSE_LABEL },
    SOCIAL_RESPONSE_CONSEQUENCE: { ...SOCIAL_RESPONSE_CONSEQUENCE },
    SOCIAL_RESPONSE_STATUS_LABEL: { ...SOCIAL_RESPONSE_STATUS_LABEL },
    PRIVATE_CHANNEL: PRIVATE_CHANNEL,
    resolvePrivateThreadForFriend: resolvePrivateThreadForFriend,
    createPrivateMessageFromFriendAction: createPrivateMessageFromFriendAction,
    createInviteMessageFromFriendAction: createInviteMessageFromFriendAction,
    createApproachMessageFromEncounter: createApproachMessageFromEncounter,
    buildEncounterResponseModel: buildEncounterResponseModel,
    toMailEvent: toMailEvent,
    registerPrivateMessage: registerPrivateMessage,
    dispatchPrivateMessageOpen: dispatchPrivateMessageOpen,
    handleCivicationFriendMessageAction: handleCivicationFriendMessageAction,
    // sosial svarsløyfe (Svar / Ignorer / Avvis) – datadrevet, testbar
    normalizeResponseId: normalizeResponseId,
    getSocialResponseLabel: getSocialResponseLabel,
    getSocialResponseStatusLabel: getSocialResponseStatusLabel,
    getSocialResponseResultText: getSocialResponseResultText,
    isSocialEncounterMessage: isSocialEncounterMessage,
    validateSocialEncounterMessage: validateSocialEncounterMessage,
    buildSocialEncounterResponseResult: buildSocialEncounterResponseResult,
    createFollowupMessageFromSocialResponse: createFollowupMessageFromSocialResponse,
    handleSocialEncounterResponse: handleSocialEncounterResponse,
    buildSocialEncounterResponseView: buildSocialEncounterResponseView,
    // lokal relasjonsmodell
    applySocialRelationshipDelta: applySocialRelationshipDelta,
    getSocialRelationship: getSocialRelationship,
    saveSocialRelationship: saveSocialRelationship,
    buildRelationshipSummary: buildRelationshipSummary,
    getRelationshipSummaryForFriend: getRelationshipSummaryForFriend,
    getSocialResponseRecord: getSocialResponseRecord,
    clearSocialRelationshipsForTesting: clearSocialRelationshipsForTesting,
    clearSocialResponsesForTesting: clearSocialResponsesForTesting
  };
})();
