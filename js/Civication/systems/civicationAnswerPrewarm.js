// js/Civication/systems/civicationAnswerPrewarm.js
//
// Holder svar-overflaten varm: alle JSON-filer svarstien kan trenge
// (rolleplan, alle mailfamilier, dagsprogram, narrativ-strømmer, personfiler)
// forhåndslastes i bakgrunnen mens spilleren leser meldingen. Målet er at et
// trykk på et svaralternativ ALDRI venter på nettverket — neste melding for
// ethvert valg skal allerede ligge i minnecachene til runtimene.
//
// Trigges ved boot, ved rollebytte/dagfase (updateProfile/civi:dayPhaseChanged,
// debounced) og eksplisitt fra NextActionUI når modalen åpnes/rendrer.
// All lasting er fire-and-forget og cache-idempotent: andre gang er alt no-op.

(function () {
  "use strict";

  let inFlight = null;
  let queued = false;
  /** @type {ReturnType<typeof setTimeout> | 0} */
  let debounceTimer = 0;
  let lastResult = null;
  let lastPeopleKey = null;

  /** @returns {{ career_id?: string, role_key?: string, title?: string } | null} */
  function getActive() {
    try { return window.CivicationState?.getActivePosition?.() || null; } catch { return null; }
  }

  async function runPrewarm() {
    const active = getActive();
    const tasks = [];

    if (window.CivicationMailRuntime?.prewarm) {
      tasks.push(window.CivicationMailRuntime.prewarm(active).catch(() => null));
    }
    if (window.CivicationDailyMailBuilder?.prewarm) {
      tasks.push(window.CivicationDailyMailBuilder.prewarm(active).catch(() => null));
    }
    // Personmotoren laster people_access_map + kategori-/rollefiler. Rebuild
    // bare ved rollebytte — filene holdes uansett varme av dedupe-cachene.
    const peopleKey = active ? `${active.career_id || ""}:${active.role_key || active.title || ""}` : null;
    if (peopleKey && peopleKey !== lastPeopleKey && window.CivicationPeopleEngine?.rebuildPeopleState) {
      lastPeopleKey = peopleKey;
      tasks.push(Promise.resolve(window.CivicationPeopleEngine.rebuildPeopleState(active)).catch(() => null));
    }

    // Livsstilsdata brukes av svar-effektene; manglende fil negativ-caches.
    if (window.HG_Lifestyle?.ensureLifeData) {
      tasks.push(Promise.resolve(window.HG_Lifestyle.ensureLifeData()).catch(() => null));
    } else if (window.CivicationJsonStore?.fetchJson) {
      tasks.push(window.CivicationJsonStore.fetchJson("data/Civication/lifestyles.json").catch(() => null));
    }

    const settled = await Promise.all(tasks);
    lastResult = {
      at: new Date().toISOString(),
      active_role: active?.role_key || active?.title || null,
      tasks: settled.length
    };
    return lastResult;
  }

  function prewarm() {
    if (inFlight) {
      queued = true;
      return inFlight;
    }
    inFlight = runPrewarm()
      .catch(() => null)
      .finally(() => {
        inFlight = null;
        if (queued) {
          queued = false;
          prewarm();
        }
      });
    return inFlight;
  }

  function schedulePrewarm() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = 0;
      prewarm();
    }, 400);
  }

  window.addEventListener("civi:booted", schedulePrewarm);
  window.addEventListener("civi:dayPhaseChanged", schedulePrewarm);
  window.addEventListener("updateProfile", schedulePrewarm);

  window.CivicationAnswerPrewarm = {
    prewarm,
    _inspect() {
      return { inFlight: !!inFlight, lastResult };
    }
  };

  // Første varming så snart modulen er lastet (cache-idempotent).
  schedulePrewarm();
})();
