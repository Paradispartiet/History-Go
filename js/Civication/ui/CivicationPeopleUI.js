(function () {
  "use strict";

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function findHistoryPerson(personId) {
    const id = String(personId || "").trim();
    if (!id) return null;
    const people = window.CivicationPeopleEngine?.getAvailablePeople?.() || [];
    return (Array.isArray(people) ? people : []).find(
      (person) => String(person?.hg_person?.id || "") === id && person?.can_converse === true
    ) || null;
  }

  // History Go-personer bruker den eksisterende sosiale samtalemotoren. De får
  // namespacet friendId slik at en historisk person aldri kolliderer med en
  // fiktiv Civication-venn/NPC. Samtalen registreres som Personlig melding av
  // CivicationSocialConversationEngine og får aldri jobb-/karrierefelt.
  function startHistoryConversation(personId) {
    const person = findHistoryPerson(personId);
    if (!person) return { ok: false, reason: "history_person_unavailable" };

    const engine = window.CivicationSocialConversationEngine;
    if (!engine || typeof engine.createSocialConversationFromResponse !== "function") {
      return { ok: false, reason: "conversation_engine_unavailable" };
    }

    const friendId = String(person.conversation_friend_id || "").trim();
    if (!friendId) return { ok: false, reason: "missing_conversation_friend_id" };

    const phase = window.CivicationFriendsEngine?.getCurrentPhase?.();
    const hgId = String(person.hg_person.id || "").trim();
    const conversation = engine.createSocialConversationFromResponse({
      responseId: "reply",
      friendId,
      friendName: String(person.name || person.hg_person.name || "Person"),
      phase,
      messageId: "history_go_collection_" + hgId
    }, {
      directStart: true,
      source: "history_go_collection"
    });

    if (!conversation) return { ok: false, reason: "conversation_not_created" };

    // Gjenbruk eksisterende private-message hook slik at UI kan åpne samme tråd
    // som samtalemotoren nettopp registrerte i Personlige meldinger.
    window.CivicationFriendMessages?.dispatchPrivateMessageOpen?.(friendId, {
      friendName: conversation.friendName,
      phase: conversation.phase,
      status: conversation.status,
      threadId: conversation.threadId,
      conversationId: conversation.conversationId
    });

    return {
      ok: true,
      personId: hgId,
      friendId,
      conversationId: conversation.conversationId,
      conversation
    };
  }

  function bindConversationClicks(host) {
    if (!host || host.__civiHistoryConversationBound) return;
    host.__civiHistoryConversationBound = true;
    host.addEventListener("click", function (event) {
      const button = event?.target?.closest?.("[data-civi-history-person]");
      if (!button) return;
      const personId = String(button.getAttribute("data-civi-history-person") || "").trim();
      const result = startHistoryConversation(personId);
      if (result?.ok) button.textContent = "Samtale åpnet";
    });
  }

  function renderPeoplePanel() {
    const host = document.getElementById("civiPeoplePanel");
    if (!host) return;
    bindConversationClicks(host);

    const active = window.CivicationState?.getActivePosition?.() || null;
    const allPeople = window.CivicationPeopleEngine?.getAvailablePeople?.() || [];
    // Uten aktiv rolle skal gamle rolle-/arbeidsfigurer ikke henge igjen fra
    // forrige state. History Go-samtalepartnerne er derimot rolleuavhengige.
    const people = (Array.isArray(allPeople) ? allPeople : []).filter(
      (person) => active || person?.source === "history_go_collection"
    );

    if (!people.length) {
      host.innerHTML = active
        ? `<div class="muted">Ingen tydelige personbaner tilgjengelige ennå. Lås opp flere steder og personer i History Go for å utvide miljøene dine.</div>`
        : `<div class="muted">Samle personer i History Go for å få mulige samtalepartnere i Civication.</div>`;
      return;
    }

    const collectedCount = people.filter((person) => person?.hg_person).length;
    const heading = active ? "Tilgjengelige mennesker og samtalepartnere" : "Samtalepartnere fra History Go";
    const intro = active
      ? `Rollen og stedene dine gir kontekstfigurer. I tillegg er alle personene du har samlet i History Go tilgjengelige som personlige samtalepartnere.${collectedCount ? ` Samlet: ${collectedCount}.` : ""}`
      : `Alle personene du har samlet i History Go er tilgjengelige her som personlige samtalepartnere. Samlet: ${collectedCount}.`;

    host.innerHTML = `
      <div class="latest-knowledge-box">
        <div class="lk-topic">${heading}</div>
        <div class="lk-text">${intro}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px;">
        ${people.map(function (person) {
          const style = String(person?.social_style || "generic");
          const type = String(person?.type || "person");
          const name = String(person?.name || "Person");
          const desc = String(person?.description || "");
          const score = Number(person?.score || 0);
          const hgPerson = person?.hg_person || null;
          const archetypeName = String(person?.archetype_name || "");
          const collectedLine = hgPerson
            ? `<div style="font-size:0.85rem;margin-top:4px;color:#ffd479;">✨ Fra History Go-samlingen din${archetypeName ? ` · Rolle i byen: ${esc(archetypeName)}` : ""}</div>`
            : "";
          const image = String(hgPerson?.cardImage || hgPerson?.image || "");
          const thumb = image
            ? `<img src="${esc(image)}" alt="" style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex:0 0 auto;" onerror="this.remove()">`
            : "";
          const meta = hgPerson
            ? `History Go · ${esc(hgPerson.category || "person")}${hgPerson.year ? ` · ${esc(hgPerson.year)}` : ""}`
            : `Type: ${esc(type)} · Stil: ${esc(style)} · Nærhet: ${score}`;
          const conversationButton = hgPerson && person?.can_converse
            ? `<button type="button" data-civi-history-person="${esc(hgPerson.id)}" style="margin-top:10px;">Samtale</button>`
            : "";
          return `
            <div style="padding:12px;border:1px solid rgba(255,255,255,0.10);border-radius:14px;background:rgba(255,255,255,0.04);">
              <div style="display:flex;align-items:center;gap:10px;">
                ${thumb}
                <div>
                  <div style="font-weight:700;">${esc(name)}</div>
                  ${collectedLine}
                </div>
              </div>
              <div style="font-size:0.92rem;opacity:0.85;margin-top:4px;">${meta}</div>
              <div style="margin-top:8px;line-height:1.45;">${esc(desc)}</div>
              ${conversationButton}
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  window.CivicationPeopleUI = {
    render: renderPeoplePanel,
    startHistoryConversation
  };

  document.addEventListener("DOMContentLoaded", renderPeoplePanel);
  window.addEventListener("updateProfile", renderPeoplePanel);
})();