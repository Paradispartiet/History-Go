(function () {
  "use strict";

  const LS_KEY = "hg_onboarding_v1";

  const STEP_ORDER = [
    "first_quiz",
    "second_quiz",
    "third_quiz_signal",
    "fourth_quiz_world",
    "fifth_quiz_job_ready",
    "first_job",
    "first_day_event",
    "first_person",
    "first_debate",
    "first_store"
  ];

  const STEP_META = {
    first_quiz: {
      title: "Første sted åpnet",
      unlockText: "Du har åpnet ditt første sted. Fortsett med et nytt sted for å begynne å bygge en retning.",
      nextText: "Finn et nytt sted i nærheten og ta quiz nummer 2."
    },
    second_quiz: {
      title: "Kategoriretning",
      unlockText: "Du bygger nå faktisk kunnskap. Kategorier kan bli til roller, miljøer og debatter.",
      nextText: "Ta ett sted til. Etter tre quiz begynner Civication å reagere tydeligere."
    },
    third_quiz_signal: {
      title: "Første Civication-signal",
      unlockText: "Byen begynner nå å påvirke livet ditt i Civication. Stedene dine er ikke lenger bare quizpunkter.",
      nextText: "Åpne ett sted til for å gjøre livsverdenen rikere."
    },
    fourth_quiz_world: {
      title: "Livsverdenen blir større",
      unlockText: "Du åpner nå flere miljøer, mennesker og hverdagsmuligheter i Civication.",
      nextText: "Ta quiz nummer 5 for å nærme deg første jobbtilbud."
    },
    fifth_quiz_job_ready: {
      title: "Arbeidslivet åpner seg",
      unlockText: "Du har nå nok erfaring til at første jobbtilbud kan bli tilgjengelig.",
      nextText: "Gå inn i Civication og se om en rolle er klar for deg."
    },
    first_job: {
      title: "Første rolle valgt",
      unlockText: "Du har gått inn i ditt første livslag. Nå begynner byen å bli til arbeid, ansvar og retning.",
      nextText: "Følg rollen og se hvordan første arbeidsdag formes."
    },
    first_day_event: {
      title: "Første hverdagssignal",
      unlockText: "Dine åpne steder påvirker nå hverdagen din direkte gjennom day-events.",
      nextText: "Følg med på hvilke miljøer og små valg som begynner å definere livet ditt."
    },
    first_person: {
      title: "Første menneske åpnet",
      unlockText: "Byen er ikke bare steder. Den er befolket. Du krysser nå med nye typer mennesker fordi livet ditt har fått mer form.",
      nextText: "Hold rollen og byen i bevegelse for å møte flere mennesker."
    },
    first_debate: {
      title: "Første debatt",
      unlockText: "Nå bruker du kunnskap, kapital, identitet og psyke til å få gjennomslag mot andre.",
      nextText: "Lær mer hvis du vil stå sterkere i neste konfrontasjon."
    },
    first_store: {
      title: "Første butikkverden åpnet",
      unlockText: "Butikker og pakker speiler nå faktisk den byen du har åpnet i History Go.",
      nextText: "Fortsett å åpne steder for å gjøre både livet og byen rikere."
    }
  };

  function readState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      return parsed && typeof parsed === "object"
        ? {
            announced: parsed.announced && typeof parsed.announced === "object" ? parsed.announced : {},
            current_step: parsed.current_step || null,
            updated_at: parsed.updated_at || null
          }
        : { announced: {}, current_step: null, updated_at: null };
    } catch {
      return { announced: {}, current_step: null, updated_at: null };
    }
  }

  function writeState(state) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {}
    return state;
  }

  function getQuizCount() {
    try {
      const progress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
      return Object.values(progress || {}).reduce(function (sum, entry) {
        const completed = Array.isArray(entry?.completed) ? entry.completed.length : 0;
        return sum + completed;
      }, 0);
    } catch {
      return 0;
    }
  }

  function getVisitedCount() {
    try {
      const raw = JSON.parse(localStorage.getItem("visited_places") || "[]");
      if (Array.isArray(raw)) return raw.length;
      if (raw && typeof raw === "object") return Object.keys(raw).filter((k) => !!raw[k]).length;
      return 0;
    } catch {
      return 0;
    }
  }

  function hasActiveJob() {
    return !!window.CivicationState?.getActivePosition?.();
  }

  function hasDayEvent() {
    const inbox = window.HG_CiviEngine?.getInbox?.() || [];
    return inbox.some(function (item) {
      const id = String(item?.event?.id || "");
      return id.startsWith("phase_");
    });
  }

  function hasPeople() {
    const people = window.CivicationPeopleEngine?.getAvailablePeople?.() || [];
    return Array.isArray(people) && people.length > 0;
  }

  function hasDebate() {
    return !!window.CivicationDebateEngine?.getCurrentDebate?.();
  }

  async function hasStore() {
    try {
      const stores = await window.HG_CiviShop?.getVisibleStores?.();
      return Array.isArray(stores) && stores.length > 0;
    } catch {
      return false;
    }
  }

  async function evaluateProgress() {
    const quizCount = getQuizCount();
    const visitedCount = getVisitedCount();
    const activeJob = hasActiveJob();
    const dayEvent = hasDayEvent();
    const people = hasPeople();
    const debate = hasDebate();
    const store = await hasStore();
    const pendingOffer = !!window.CivicationJobs?.getLatestPendingOffer?.();

    const unlocked = {
      first_quiz: quizCount >= 1 || visitedCount >= 1,
      second_quiz: quizCount >= 2,
      third_quiz_signal: quizCount >= 3,
      fourth_quiz_world: quizCount >= 4,
      fifth_quiz_job_ready: quizCount >= 5 || pendingOffer,
      first_job: activeJob,
      first_day_event: dayEvent,
      first_person: people,
      first_debate: debate,
      first_store: store
    };

    let currentStep = null;
    for (const step of STEP_ORDER) {
      if (!unlocked[step]) {
        currentStep = step;
        break;
      }
    }

    if (!currentStep) currentStep = "first_store";

    return {
      quizCount,
      visitedCount,
      pendingOffer,
      unlocked,
      currentStep
    };
  }

  function setNextUp(stepKey, progress) {
    const el = document.getElementById("mpNextUp");
    if (!el) return;
    const meta = STEP_META[stepKey];
    if (!meta) {
      el.textContent = "";
      return;
    }

    const quizInfo = progress?.quizCount ? ` · Quizzer: ${progress.quizCount}` : "";
    el.textContent = `Neste steg: ${meta.nextText}${quizInfo}`;
  }

  function announceStep(stepKey, state) {
    const meta = STEP_META[stepKey];
    if (!meta) return;
    if (state.announced?.[stepKey]) return;

    state.announced[stepKey] = new Date().toISOString();
    writeState(state);

    if (typeof window.showToast === "function") {
      window.showToast(`✨ ${meta.title}: ${meta.unlockText}`);
    }
  }

  async function refreshOnboarding() {
    const state = readState();
    const progress = await evaluateProgress();

    for (const step of STEP_ORDER) {
      if (progress.unlocked[step]) {
        announceStep(step, state);
      }
    }

    state.current_step = progress.currentStep;
    state.updated_at = new Date().toISOString();
    writeState(state);
    setNextUp(progress.currentStep, progress);

    return {
      state,
      progress
    };
  }

  window.HGOnboarding = {
    getState: readState,
    refresh: refreshOnboarding,
    evaluateProgress,
    getCurrentStepMeta: function () {
      const state = readState();
      return STEP_META[state.current_step] || null;
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      window.HGOnboarding?.refresh?.();
    }, 50);
  });

  window.addEventListener("updateProfile", function () {
    window.HGOnboarding?.refresh?.();
  });
})();
