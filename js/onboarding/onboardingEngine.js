(function () {
  "use strict";

  const LS_KEY = "hg_onboarding_v1";
  const SESSION_WELCOME_KEY = "hg_welcome_toast_seen_v1";

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
            updated_at: parsed.updated_at || null,
            current_guidance: parsed.current_guidance && typeof parsed.current_guidance === "object" ? parsed.current_guidance : null
          }
        : { announced: {}, current_step: null, updated_at: null, current_guidance: null };
    } catch {
      return { announced: {}, current_step: null, updated_at: null, current_guidance: null };
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

  function getNearbyVisibleCount() {
    const host = document.getElementById("nearbyList");
    if (!host) return 0;
    return Number(host.children?.length || 0);
  }

  function hasActiveJob() {
    return !!window.CivicationState?.getActivePosition?.();
  }

  function getPendingMailCount() {
    const inbox = window.HG_CiviEngine?.getInbox?.() || [];
    return inbox.filter(function (item) {
      return String(item?.status || "") === "pending";
    }).length;
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

  function getPeopleCount() {
    const people = window.CivicationPeopleEngine?.getAvailablePeople?.() || [];
    return Array.isArray(people) ? people.length : 0;
  }

  async function getStoreCount() {
    try {
      const stores = await window.HG_CiviShop?.getVisibleStores?.();
      return Array.isArray(stores) ? stores.length : 0;
    } catch {
      return 0;
    }
  }

  function buildGuidance(progress) {
    const stepKey = progress.currentStep;
    const meta = STEP_META[stepKey] || null;
    const guidance = {
      stepKey,
      title: meta?.title || "Neste steg",
      nextText: meta?.nextText || "Fortsett å utforske byen og la Civication reagere.",
      unlockText: meta?.unlockText || "Dette steget bygger bro mellom History Go og Civication.",
      blocker: null,
      detail: null,
      toastText: null,
      stats: {
        quizCount: progress.quizCount,
        visitedCount: progress.visitedCount,
        nearbyVisibleCount: progress.nearbyVisibleCount,
        pendingOffer: !!progress.pendingOffer,
        pendingOfferCount: Number(progress.pendingOfferCount || 0),
        pendingMailCount: Number(progress.pendingMailCount || 0),
        peopleCount: Number(progress.peopleCount || 0),
        storeCount: Number(progress.storeCount || 0)
      }
    };

    if (stepKey === "first_quiz" || stepKey === "second_quiz" || stepKey === "third_quiz_signal" || stepKey === "fourth_quiz_world") {
      guidance.blocker = "quiz";
      guidance.detail = `Du mangler først og fremst flere quizzer. Du har ${progress.quizCount} fullførte quizzer og ${progress.visitedCount} åpne steder.`;
      return guidance;
    }

    if (stepKey === "fifth_quiz_job_ready") {
      guidance.blocker = "quiz_for_job";
      guidance.detail = progress.pendingOffer
        ? `Du har allerede ${progress.pendingOfferCount || 1} ventende jobbtilbud. Gå inn i Civication og se rollen.`
        : `Du trenger litt mer kunnskapsprogresjon før arbeidslivet åpner seg tydelig. Du har ${progress.quizCount} quizzer nå.`;
      return guidance;
    }

    if (stepKey === "first_job") {
      guidance.blocker = progress.pendingOffer ? "accept_job" : "job_offer_missing";
      guidance.detail = progress.pendingOffer
        ? `Du har ${progress.pendingOfferCount || 1} ventende jobbtilbud. Neste naturlige steg er å akseptere rollen i Civication.`
        : "Du mangler fortsatt selve rollevalget. Sjekk jobbtilbud og fortsett å bygge merit hvis tilbud ikke vises.";
      return guidance;
    }

    if (stepKey === "first_day_event") {
      guidance.blocker = "day_event";
      guidance.detail = progress.pendingMailCount > 0
        ? `Du har ${progress.pendingMailCount} ventende meldinger eller hendelser. Gå inn i Civication og la dagen spille seg videre.`
        : "Du har rolle, men mangler første tydelige hverdagsutslag. Gå inn i Civication og la dagen spille seg videre.";
      return guidance;
    }

    if (stepKey === "first_person") {
      guidance.blocker = "people";
      guidance.detail = `Du mangler fortsatt tydelige mennesker i livsverdenen. Akkurat nå har du ${progress.peopleCount} personer åpne.`;
      return guidance;
    }

    if (stepKey === "first_debate") {
      guidance.blocker = "debate";
      guidance.detail = progress.pendingMailCount > 0
        ? `Du har ${progress.pendingMailCount} ventende meldinger eller hendelser, men mangler fortsatt første debatt.`
        : "Du har kommet til punktet der kunnskap og rolle bør møte motstand. Neste milepæl er første debatt.";
      return guidance;
    }

    if (stepKey === "first_store") {
      guidance.blocker = "store";
      guidance.detail = `Du mangler fortsatt tydelig butikkverden i Civication. Akkurat nå har du ${progress.storeCount} synlige butikker.`;
      return guidance;
    }

    return guidance;
  }

  function buildWelcomeToast(progress) {
    const parts = [];

    if (progress.quizCount > 0 || progress.visitedCount > 0) {
      parts.push("Velkommen tilbake. Ta en quiz og se hvor den fører deg videre. History Go handler ikke bare om riktige svar, men om at byen gradvis åpner seg som kunnskap, steder og livsbaner.");
    } else {
      parts.push("Velkommen. Ta en quiz og se hvor den fører deg. Start med et sted i nærheten, og bruk det som inngang til hele byen.");
    }

    if (progress.visitedCount > 0) {
      parts.push(`Du har allerede åpnet ${progress.visitedCount} steder, så du har et faktisk utgangspunkt å bygge videre fra.`);
    }

    if (progress.nearbyVisibleCount > 0) {
      parts.push(`Akkurat nå har du ${progress.nearbyVisibleCount} steder i nærheten som kan være neste naturlige steg.`);
    }

    if (progress.pendingOfferCount > 0) {
      parts.push(`Du har ${progress.pendingOfferCount} ventende jobbtilbud i Civication. De ligger der og venter til du vil gå videre fra kunnskap til rolle.`);
    }

    if (progress.pendingMailCount > 0) {
      parts.push(`Du har også ${progress.pendingMailCount} ventende meldinger eller hendelser som kan drive livet ditt videre når du åpner Civication.`);
    }

    parts.push("Velg ett sted, ta en quiz, og la resten av systemet reagere på det du faktisk lærer.");

    return parts.join(" ");
  }

  function buildToastText(stepKey, progress) {
    if (stepKey === "first_quiz") {
      return "✨ Første sted åpnet. Dette gir deg ditt første faktiske fotfeste i byen. Nå er målet å ta ett sted til, slik at kunnskapen begynner å få retning i stedet for å stå alene.";
    }
    if (stepKey === "second_quiz") {
      return `✨ Kunnskapen din begynner å få retning. Du har nå ${progress.quizCount} quizzer som bygger videre på hverandre. Fortsetter du litt til, begynner Civication å reagere tydeligere på hva du faktisk har åpnet.`;
    }
    if (stepKey === "third_quiz_signal") {
      return "✨ Civication begynner å reagere. Flere av stedene dine kan nå prege miljøer, hverdagsliv og hvilke typer situasjoner du etter hvert får tilgang til.";
    }
    if (stepKey === "fourth_quiz_world") {
      return `✨ Livsverdenen din blir større. Du har nå ${progress.visitedCount} åpne steder som kan gi flere miljøer, mennesker og små hverdagssignaler. Ett sted til kan være nok til at arbeidslivet åpner seg tydelig.`;
    }
    if (stepKey === "fifth_quiz_job_ready") {
      return progress.pendingOffer
        ? `✨ Du har ${progress.pendingOfferCount || 1} ventende jobbtilbud. Gå inn i Civication og se hvilken rolle byen din nå åpner for deg. Dette er punktet der quizkunnskap begynner å bli til faktisk liv og arbeid.`
        : "✨ Arbeidslivet begynner å åpne seg. Nå er det verdt å bygge litt mer merit for å få første rolle, slik at byen kan bli til arbeid, ansvar og hverdag.";
    }
    if (stepKey === "first_job") {
      return "✨ Første rolle valgt. Nå blir byen til arbeid, ansvar og et faktisk livslag i Civication. Det betyr at valgene dine ikke bare handler om steder, men også om hvem du holder på å bli.";
    }
    if (stepKey === "first_day_event") {
      return progress.pendingMailCount > 0
        ? `✨ Du har ${progress.pendingMailCount} ventende meldinger eller hendelser. Hverdagen din er i ferd med å begynne, og det er nå Civication for alvor begynner å speile det du har åpnet i byen.`
        : "✨ Første day-event åpnet. Hverdagen din begynner nå å bli påvirket av steder du faktisk har lært. Det er her byen går fra kart til levd erfaring.";
    }
    if (stepKey === "first_person") {
      return `✨ Første mennesker åpnet. Du har nå ${progress.peopleCount} tydelige personer eller miljøfigurer i livsverdenen din. Det betyr at byen ikke lenger bare er steder, men også relasjoner og typer du faktisk krysser med.`;
    }
    if (stepKey === "first_debate") {
      return "✨ Første debatt åpnet. Nå kan du bruke kunnskap, kapital, identitet og psyke mot andre. Dette er første tydelige punkt der det du har lært får sosial og strategisk betydning.";
    }
    if (stepKey === "first_store") {
      return `✨ Første butikkverden åpnet. Du har nå ${progress.storeCount} synlige butikker som faktisk springer ut av byen din. Det betyr at også ting, stil og miljø begynner å kobles til stedene du har åpnet.`;
    }
    return null;
  }

  function hasAnnouncedAnything(state) {
    return Object.keys(state?.announced || {}).length > 0;
  }

  function seedHistoricalUnlockedSteps(state, progress) {
    const now = new Date().toISOString();
    for (const step of STEP_ORDER) {
      if (progress.unlocked[step] && !state.announced[step]) {
        state.announced[step] = now;
      }
    }
  }

  async function evaluateProgress() {
    const quizCount = getQuizCount();
    const visitedCount = getVisitedCount();
    const nearbyVisibleCount = getNearbyVisibleCount();
    const activeJob = hasActiveJob();
    const dayEvent = hasDayEvent();
    const people = hasPeople();
    const debate = hasDebate();
    const store = await hasStore();
    const pendingOffer = !!window.CivicationJobs?.getLatestPendingOffer?.();
    const pendingOfferCount = Array.isArray(window.CivicationJobs?.getOffers?.())
      ? window.CivicationJobs.getOffers().filter(function (o) {
          return String(o?.status || "") === "pending";
        }).length
      : 0;
    const pendingMailCount = getPendingMailCount();
    const peopleCount = getPeopleCount();
    const storeCount = await getStoreCount();

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

    const progress = {
      quizCount,
      visitedCount,
      nearbyVisibleCount,
      pendingOffer,
      pendingOfferCount,
      pendingMailCount,
      unlocked,
      currentStep,
      peopleCount,
      storeCount
    };

    progress.guidance = buildGuidance(progress);
    return progress;
  }

  function setNextUp(guidance) {
    const el = document.getElementById("mpNextUp");
    if (!el) return;
    if (!guidance) {
      el.textContent = "";
      return;
    }

    const parts = [guidance.nextText];
    if (guidance?.detail) parts.push(guidance.detail);
    el.textContent = `Neste steg: ${parts.join(" ")}`;
  }

  function announceStep(stepKey, state, progress) {
    const meta = STEP_META[stepKey];
    if (!meta) return;
    if (state.announced?.[stepKey]) return;

    state.announced[stepKey] = new Date().toISOString();
    writeState(state);

    if (typeof window.showToast === "function") {
      const specific = buildToastText(stepKey, progress);
      window.showToast(specific || `✨ ${meta.title}: ${meta.unlockText}`);
    }
  }

  async function refreshOnboarding(options = {}) {
    const state = readState();
    const progress = await evaluateProgress();

    const shouldSeedHistorical = !!options.seedHistorical &&
      !hasAnnouncedAnything(state) &&
      (progress.quizCount > 0 || progress.visitedCount > 0 || progress.pendingOfferCount > 0 || progress.pendingMailCount > 0 || progress.peopleCount > 0 || progress.storeCount > 0);

    if (shouldSeedHistorical) {
      seedHistoricalUnlockedSteps(state, progress);
    } else {
      for (const step of STEP_ORDER) {
        if (progress.unlocked[step]) {
          announceStep(step, state, progress);
        }
      }
    }

    state.current_step = progress.currentStep;
    state.current_guidance = progress.guidance;
    state.updated_at = new Date().toISOString();
    writeState(state);
    setNextUp(progress.guidance);

    return {
      state,
      progress
    };
  }

  function maybeShowWelcomeToast(progress) {
    if (typeof window.showToast !== "function") return;

    try {
      if (sessionStorage.getItem(SESSION_WELCOME_KEY) === "1") return;
      sessionStorage.setItem(SESSION_WELCOME_KEY, "1");
    } catch {}

    window.showToast(buildWelcomeToast(progress));
  }

  window.HGOnboarding = {
    getState: readState,
    refresh: refreshOnboarding,
    evaluateProgress,
    getCurrentStepMeta: function () {
      const state = readState();
      return STEP_META[state.current_step] || null;
    },
    getCurrentGuidance: function () {
      return readState().current_guidance || null;
    },
    buildWelcomeToast
  };

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(async function () {
      const result = await window.HGOnboarding?.refresh?.({ seedHistorical: true });
      if (result?.progress) {
        maybeShowWelcomeToast(result.progress);
      }
    }, 120);
  });

  window.addEventListener("updateProfile", function () {
    window.HGOnboarding?.refresh?.();
  });
})();
