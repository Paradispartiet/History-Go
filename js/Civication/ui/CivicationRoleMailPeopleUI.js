// CivicationRoleMailPeopleUI
// History Go-personer brukes her KUN når den aktive rollemailen selv har
// koblet dem inn via role_model_meta.history_people. Laget lager ingen global
// kontaktliste og gir ingen rolleuavhengig tilgang til samlingen.
(function () {
  "use strict";

  if (window.CivicationRoleMailPeopleUI) return;

  const SOURCE = "civication_role_mail_person";
  const NEXT_ACTION_BODY_ID = "civiNextActionModalBody";
  let apiPatched = false;
  let clickBound = false;
  let decorateQueued = false;

  function norm(value) {
    return String(value == null ? "" : value).trim();
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function slugify(value) {
    return norm(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function getActiveRole() {
    try { return window.CivicationState?.getActivePosition?.() || null; } catch (_e) { return null; }
  }

  function resolveRoleScope(active) {
    const resolver = window.CivicationCareerRoleResolver?.resolveCareerRoleScope;
    if (typeof resolver === "function") {
      try {
        const resolved = norm(resolver(active));
        if (resolved && resolved !== "unknown") return resolved;
      } catch (_e) {}
    }
    return slugify(active?.role_scope || active?.role_key || active?.title || "");
  }

  function getInbox() {
    try {
      const inbox = window.CivicationMailEngine?.getInbox?.() || window.CivicationState?.getInbox?.() || [];
      return Array.isArray(inbox) ? inbox : [];
    } catch (_e) {
      return [];
    }
  }

  function findMail(mailId) {
    const id = norm(mailId);
    if (!id) return null;
    const row = getInbox().find(function (item) {
      const ev = item?.event || item || {};
      return norm(item?.id || ev?.id || ev?.mail_key) === id || norm(ev?.id || ev?.mail_key) === id;
    });
    return row?.event || row || null;
  }

  function getRoleMailContext(mailId) {
    const event = findMail(mailId);
    const meta = event?.role_model_meta;
    const active = getActiveRole();
    if (!event || !meta || typeof meta !== "object" || !active) return null;

    const activeScope = resolveRoleScope(active);
    const mailScope = norm(meta.role_scope);
    if (mailScope && activeScope && mailScope !== activeScope) return null;

    const activeCategory = norm(active?.career_id);
    const mailCategory = norm(meta.category);
    if (mailCategory && activeCategory && mailCategory !== activeCategory) return null;

    const people = Array.isArray(meta.history_people)
      ? meta.history_people.filter(function (person) { return norm(person?.id) && norm(person?.name); }).slice(0, 3)
      : [];
    if (!people.length) return null;

    return { event, meta, active, people };
  }

  function findCollectedPerson(meta, personRef) {
    const bridge = window.CivicationHistoryPeopleBridge;
    const category = norm(meta?.category);
    const personId = norm(personRef?.id);
    if (!bridge?.getCollectedByCategory || !category || !personId) return personRef || null;
    try {
      const rows = bridge.getCollectedByCategory(category) || [];
      return rows.find(function (person) { return norm(person?.id) === personId; }) || personRef || null;
    } catch (_e) {
      return personRef || null;
    }
  }

  function firstText(values) {
    const list = Array.isArray(values) ? values : [values];
    for (const value of list) {
      if (typeof value === "string" && norm(value)) return norm(value);
      if (value && typeof value === "object") {
        const text = norm(value.description || value.setup || value.title || value.label || value.name || value.id);
        if (text) return text;
      }
    }
    return "";
  }

  function situationText(event) {
    if (Array.isArray(event?.situation)) {
      return event.situation.map(norm).filter(Boolean).join(" ");
    }
    return norm(event?.situation || event?.body || event?.summary || event?.message);
  }

  function buildRoleConversationBody(context, personRef) {
    const event = context.event || {};
    const meta = context.meta || {};
    const person = findCollectedPerson(meta, personRef) || personRef || {};
    const name = norm(person?.name || personRef?.name) || "personen";
    const roleTitle = norm(meta.title || context.active?.title || meta.role_scope) || "rollen";
    const subject = norm(event.subject || event.title) || "denne oppgaven";
    const historical = norm(person?.desc || person?.description);
    const situation = situationText(event);
    const expected = norm(event?.task_payload?.expected_output || event?.expected_output);
    const professional = firstText(meta.professional_description);
    const competence = firstText(meta.selected_competence_axes);
    const problem = firstText(meta.selected_ideal_type_problems);

    const parts = [
      `Du bruker ${name} som historisk perspektiv på ${roleTitle}-rollen og saken «${subject}».`
    ];
    if (historical) parts.push(`Historisk utgangspunkt: ${historical}`);
    if (situation) parts.push(`Dagens situasjon: ${situation}`);
    if (expected) parts.push(`Oppgaven ber deg om: ${expected}`);
    if (professional) parts.push(`Rolleforståelse: ${professional}`);
    if (competence) parts.push(`Faglig nøkkel: ${competence}`);
    if (problem) parts.push(`Problem du bør undersøke: ${problem}`);
    return parts.join(" ");
  }

  function startRoleMailConversation(mailId, personId) {
    const context = getRoleMailContext(mailId);
    if (!context) return { ok: false, reason: "role_mail_people_unavailable" };

    const id = norm(personId);
    const personRef = context.people.find(function (person) { return norm(person?.id) === id; }) || null;
    if (!personRef) return { ok: false, reason: "person_not_linked_to_role_mail" };

    const friendMessages = window.CivicationFriendMessages;
    if (!friendMessages?.registerPrivateMessage || !friendMessages?.dispatchPrivateMessageOpen) {
      return { ok: false, reason: "private_message_bridge_unavailable" };
    }

    const person = findCollectedPerson(context.meta, personRef) || personRef;
    const friendName = norm(person?.name || personRef.name) || "Person";
    const friendId = "history_go_person_" + id;
    const threadId = friendMessages.resolvePrivateThreadForFriend?.(friendId) || ("friend_" + friendId);
    const phase = norm(
      context.event?.phase ||
      context.event?.phase_tag ||
      context.event?.daily_mail_meta?.phase ||
      window.CivicationFriendsEngine?.getCurrentPhase?.()
    ) || "work";
    const subject = norm(context.event?.subject || context.event?.title) || norm(context.meta?.title) || "oppgaven";

    const message = {
      type: "private",
      channel: "private",
      source: SOURCE,
      actionId: "message",
      friendId,
      friendName,
      phase,
      threadId,
      title: friendName + " om " + subject,
      body: buildRoleConversationBody(context, personRef),
      status: "open"
    };

    let registration = null;
    try { registration = friendMessages.registerPrivateMessage(message); } catch (_e) {}

    let conversation = null;
    const conversationEngine = window.CivicationSocialConversationEngine;
    if (conversationEngine?.createSocialConversationFromResponse) {
      try {
        conversation = conversationEngine.createSocialConversationFromResponse({
          responseId: "reply",
          friendId,
          friendName,
          phase,
          messageId: "role_mail_" + norm(mailId) + "_" + id
        }, {
          directStart: true,
          source: SOURCE
        });
      } catch (_e) {}
    }

    try {
      friendMessages.dispatchPrivateMessageOpen(friendId, {
        friendName,
        phase,
        status: "open",
        threadId,
        source: SOURCE,
        message,
        conversationId: conversation?.conversationId || null
      });
    } catch (_e) {}

    return {
      ok: true,
      mailId: norm(mailId),
      personId: id,
      friendId,
      threadId,
      message,
      registered: !!registration?.registered,
      conversationId: conversation?.conversationId || null
    };
  }

  function buildPeopleHtml(mailId) {
    const context = getRoleMailContext(mailId);
    if (!context) return "";

    const buttons = context.people.map(function (person) {
      return "<button class=\"civi-btn secondary\" type=\"button\" data-civi-role-mail-person=\""
        + esc(person.id) + "\" data-mail-id=\"" + esc(mailId) + "\">Snakk med "
        + esc(person.name) + " om oppgaven</button>";
    }).join(" ");

    return "<section class=\"civi-role-mail-people\" style=\"margin-top:12px;padding:10px;border:1px solid rgba(255,255,255,0.12);border-radius:12px;\">"
      + "<div class=\"civi-task-kicker\">Personer som kan utdype oppgaven</div>"
      + "<p class=\"civi-next-action-sub muted\">Disse personene kommer fra History Go-samlingen din fordi akkurat denne rollemailen har koblet dem til rollen. Samtalen utdyper arbeidslivet og oppgaven; den er ikke en fri kontaktliste.</p>"
      + "<div class=\"civi-next-action-choices\" role=\"group\" aria-label=\"Relevante samtalepartnere\">"
      + buttons
      + "</div></section>";
  }

  function decorateNextAction() {
    decorateQueued = false;
    const ui = window.CivicationNextActionUI;
    const action = ui?.getCurrent?.() || null;
    const body = document.getElementById(NEXT_ACTION_BODY_ID);
    if (!action || !body || typeof body.querySelector !== "function") return false;

    const card = body.querySelector(".civi-next-action-card");
    if (!card) return false;
    card.querySelector?.(".civi-role-mail-people")?.remove?.();

    const html = buildPeopleHtml(norm(action.id));
    if (!html) return false;

    const choices = card.querySelector?.(".civi-next-action-choices");
    if (choices && typeof choices.insertAdjacentHTML === "function") {
      choices.insertAdjacentHTML("beforebegin", html);
    } else if (typeof card.insertAdjacentHTML === "function") {
      card.insertAdjacentHTML("beforeend", html);
    }
    return true;
  }

  function queueDecorate() {
    if (decorateQueued) return;
    decorateQueued = true;
    const run = function () { decorateNextAction(); };
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(run);
    } else {
      setTimeout(run, 0);
    }
  }

  function patchNextActionApi() {
    const ui = window.CivicationNextActionUI;
    if (!ui || ui.__roleMailPeoplePatched) return false;

    ["open", "render", "refresh"].forEach(function (name) {
      const original = ui[name];
      if (typeof original !== "function") return;
      ui[name] = function roleMailPeopleDecoratedCall() {
        const result = original.apply(ui, arguments);
        queueDecorate();
        return result;
      };
    });

    ui.__roleMailPeoplePatched = true;
    apiPatched = true;
    return true;
  }

  function bindClicks() {
    if (clickBound || !document?.addEventListener) return;
    clickBound = true;
    document.addEventListener("click", function (event) {
      const target = event?.target;
      if (!target || typeof target.closest !== "function") return;

      const personButton = target.closest("[data-civi-role-mail-person]");
      if (personButton) {
        const mailId = norm(personButton.getAttribute("data-mail-id"));
        const personId = norm(personButton.getAttribute("data-civi-role-mail-person"));
        const result = startRoleMailConversation(mailId, personId);
        if (result.ok) personButton.textContent = "Samtale åpnet";
        return;
      }

      if (target.closest("#civiNextActionModal")) queueDecorate();
    });
  }

  function boot() {
    patchNextActionApi();
    bindClicks();
    queueDecorate();
    return apiPatched;
  }

  ["civi:dayPhaseChanged", "civi:inboxChanged", "updateProfile"].forEach(function (eventName) {
    window.addEventListener?.(eventName, queueDecorate);
  });

  window.CivicationRoleMailPeopleUI = {
    SOURCE,
    boot,
    getRoleMailContext,
    buildRoleConversationBody,
    buildPeopleHtml,
    startRoleMailConversation,
    decorateNextAction
  };

  boot();
})();
