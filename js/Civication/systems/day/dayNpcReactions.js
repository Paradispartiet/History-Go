(function () {
  "use strict";

  function normStr(v) {
    return String(v || "").trim();
  }

  function getPeople() {
    const list = window.CivicationPeopleEngine?.getAvailablePeople?.() || [];
    return Array.isArray(list) ? list : [];
  }

  function choosePerson() {
    const people = getPeople();
    return people[0] || null;
  }

  function applyNpcReaction(ctx) {
    const { eventObj, choice } = ctx;

    const person = choosePerson();
    if (!person) return null;

    const reaction = {
      personName: person.name,
      title: `${person.name} reagerer på valget ditt`,
      line: "Dette påvirker hvordan de ser deg videre",
      trustDelta: Number(choice?.effect || 0)
    };

    window.dispatchEvent(new CustomEvent("civi:npcReaction", { detail: reaction }));
    return reaction;
  }

  function register() {
    if (!window.CivicationChoiceDirector) return;

    window.CivicationChoiceDirector.registerHandler(
      "npcReactions",
      applyNpcReaction,
      20
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", register, { once: true });
  } else {
    register();
  }
})();
