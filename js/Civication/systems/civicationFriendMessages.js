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

  window.CivicationFriendMessages = {
    SOURCE: SOURCE,
    SOCIAL_ENCOUNTER_SOURCE: SOCIAL_ENCOUNTER_SOURCE,
    RESPONSE_OPTIONS: RESPONSE_OPTIONS.slice(),
    PRIVATE_CHANNEL: PRIVATE_CHANNEL,
    resolvePrivateThreadForFriend: resolvePrivateThreadForFriend,
    createPrivateMessageFromFriendAction: createPrivateMessageFromFriendAction,
    createInviteMessageFromFriendAction: createInviteMessageFromFriendAction,
    createApproachMessageFromEncounter: createApproachMessageFromEncounter,
    buildEncounterResponseModel: buildEncounterResponseModel,
    toMailEvent: toMailEvent,
    registerPrivateMessage: registerPrivateMessage,
    dispatchPrivateMessageOpen: dispatchPrivateMessageOpen,
    handleCivicationFriendMessageAction: handleCivicationFriendMessageAction
  };
})();
