(function () {
  "use strict";

  const LS_KEY = "hg_civi_npc_reactions_v1";

  function normStr(v) {
    return String(v || "").trim();
  }

  function readLog() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }

  function writeLog(rows) {
    const safe = Array.isArray(rows) ? rows : [];
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(safe.slice(-30)));
    } catch {}
    return safe;
  }

  function getRoleScope() {
    const active = window.CivicationState?.getActivePosition?.() || {};
    return normStr(window.CiviMailPlanBridge?.resolveRoleScope?.(active) || active.role_scope);
  }

  function getPeople() {
    const list = window.CivicationPeopleEngine?.getAvailablePeople?.() || [];
    return Array.isArray(list) ? list : [];
  }

  function choosePerson(eventObj, choice, result) {
    const people = getPeople();
    if (!people.length) return null;

    const family = normStr(eventObj?.mail_family);
    const effect = Number(choice?.effect ?? result?.effect ?? 0);
    const good = effect >= 1;

    const preferredStyles = [];

    if (family === "sliten_nokkelperson") {
      preferredStyles.push(good ? "social" : "economic");
    } else if (family === "krysspress") {
      preferredStyles.push(good ? "political" : "economic");
    } else if (family === "mellomleder_planlegging") {
      preferredStyles.push(good ? "institutional" : "economic");
    } else if (family === "driftskrise") {
      preferredStyles.push(good ? "social" : "political");
    }

    const scored = people
      .map((person) => {
        let score = Number(person?.score || 0);
        const style = normStr(person?.social_style);
        if (preferredStyles.includes(style)) score += 5;
        return { person, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored[0]?.person || people[0] || null;
  }

  function buildReaction(person, eventObj, choice, result) {
    const family = normStr(eventObj?.mail_family);
    const effect = Number(choice?.effect ?? result?.effect ?? 0);
    const good = effect >= 1;

    let title = "Noen merker valget ditt.";
    let line = "Valget setter spor i hvordan folk leser deg.";
    let trustDelta = good ? 1 : -1;

    if (family === "sliten_nokkelperson") {
      if (good) {
        title = `${person.name} merker at du beskytter folk når det koster.`;
        line = "Det gir respekt, men også en stilltiende forståelse av at driften blir hardere å holde sammen.";
        trustDelta = 2;
      } else {
        title = `${person.name} ser at du lot drift veie tyngre enn slitasje.`;
        line = "Det holder tempoet oppe, men gjør det vanskeligere å tro at du vil gripe inn før noen virkelig faller.";
        trustDelta = -2;
      }
    } else if (family === "krysspress") {
      if (good) {
        title = `${person.name} oppfatter at du valgte virkeligheten framfor målingen.`;
        line = "Det gjør deg mer troverdig nedenfra, selv om det også gjør deg mindre bekvem for systemet over deg.";
        trustDelta = 2;
      } else {
        title = `${person.name} merker at du valgte det målbare framfor det som faktisk fungerte.`;
        line = "Det ser ryddig ut, men etterlater et inntrykk av at folk må bære mer alene.";
        trustDelta = -2;
      }
    } else if (family === "mellomleder_planlegging") {
      if (good) {
        title = `${person.name} ser at du planlegger for virkeligheten, ikke bare for excelarket.`;
        line = "Det bygger tillit fordi folk kjenner igjen seg selv i rammen du lager.";
        trustDelta = 1;
      } else {
        title = `${person.name} skjønner at planen ble stående penere enn den ble sann.`;
        line = "Det gjør at neste avvik vil føles mindre som uhell og mer som noe som var valgt.";
        trustDelta = -1;
      }
    } else if (family === "driftskrise") {
      if (good) {
        title = `${person.name} ser at du tok styring da det faktisk gjaldt.`;
        line = "Det skaper ro, men også en forventning om at du må bære like tungt neste gang.";
        trustDelta = 2;
      } else {
        title = `${person.name} merker nølingen i det som skulle samle situasjonen.`;
        line = "Usikkerheten sprer seg raskt når folk ikke vet om noen faktisk holder rattet.";
        trustDelta = -2;
      }
    } else {
      if (good) {
        title = `${person.name} leser valget ditt som et forsøk på å holde både mennesker og system oppe.`;
        line = "Det gjør deg litt mer troverdig, selv om kostnaden ikke forsvinner.";
        trustDelta = 1;
      } else {
        title = `${person.name} merker at valget ditt gjorde avstanden litt større.`;
        line = "Det er ikke sikkert noen sier det høyt, men relasjonen blir tynnere av slike øyeblikk.";
        trustDelta = -1;
      }
    }

    return {
      id: `npc_reaction_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      personId: normStr(person?.id),
      personName: normStr(person?.name || "Person"),
      personType: normStr(person?.type || "person"),
      subject: normStr(eventObj?.subject),
      choiceLabel: normStr(choice?.label),
      title,
      line,
      trustDelta,
      createdAt: new Date().toISOString(),
      careerId: normStr(window.CivicationState?.getActivePosition?.()?.career_id)
    };
  }

  function maybeAddContactFromReaction(person, reaction) {
    if (typeof window.addCiviContact !== "function") return;
    window.addCiviContact({
      id: `npc_${normStr(person?.id || person?.name || "person")}`,
      type: "npc_relation",
      name: normStr(person?.name || "Person"),
      sourcePhase: "reaction",
      sourceContextId: normStr(person?.id || reaction?.subject || "reaction"),
      sourceContextLabel: normStr(reaction?.subject || "Arbeidsreaksjon"),
      careerId: normStr(window.CivicationState?.getActivePosition?.()?.career_id),
      strength: reaction?.trustDelta > 0 ? 2 : 1
    });
  }

  function applyNpcReaction(eventObj, choice, result) {
    if (getRoleScope() !== "mellomleder") return null;

    const person = choosePerson(eventObj, choice, result);
    if (!person) return null;

    const reaction = buildReaction(person, eventObj, choice, result);
    const current = readLog();
    writeLog(current.concat([reaction]));
    maybeAddContactFromReaction(person, reaction);

    window.dispatchEvent(new Event("updateProfile"));
    window.dispatchEvent(new CustomEvent("civi:npcReaction", { detail: reaction }));
    return reaction;
  }

  function patchAnswer() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || proto.__npcReactionsPatched || typeof proto.answer !== "function") return;

    const prev = proto.answer;
    proto.__npcReactionsPatched = true;

    proto.answer = async function (eventId, choiceId) {
      const pending = this.getPendingEvent ? this.getPendingEvent() : null;
      const eventObj = pending?.event || null;
      const choice = Array.isArray(eventObj?.choices)
        ? eventObj.choices.find((c) => c && normStr(c.id) === normStr(choiceId)) || null
        : null;

      const result = await prev.call(this, eventId, choiceId);

      if (result?.ok && eventObj && choice) {
        try {
          applyNpcReaction(eventObj, choice, result);
        } catch (err) {
          console.warn("[dayNpcReactions] failed", err);
        }
      }

      return result;
    };
  }

  window.CivicationNpcReactions = {
    getAll: readLog,
    getLatest(limit = 5) {
      return readLog().slice(-Math.max(1, Number(limit || 5))).reverse();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", patchAnswer, { once: true });
  } else {
    patchAnswer();
  }
})();
