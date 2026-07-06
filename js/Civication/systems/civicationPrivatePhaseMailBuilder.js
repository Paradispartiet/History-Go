// js/Civication/systems/civicationPrivatePhaseMailBuilder.js
// CivicationPrivatePhaseMailBuilder — bygger de PRIVATE fase-mailene i døgnrytmen.
//
// Prinsipp (se js/Civication/README.md «To rytmer»):
//   Civication har to helt adskilte innholdssystemer:
//     1) Private fase-mailer  — morning, lunch, afternoon, dinner, evening, day_end
//     2) Arbeidslivsmail       — kun forenoon/workday, inne i arbeidsdag-runtime
//
//   Denne filen eier KUN de private fase-mailene. De handler om livet utenfor
//   jobben: morgenrutine, mat, hvile, økonomi, familie, venner, fritid, helse,
//   søvn, læring, personlig kalender, sosialt liv, energi og psyke.
//
//   De skal ALDRI handle om aktiv jobbcase, arbeidsgiveroppgave, plansjef,
//   utvalg, utbygger, plankart, Lillebekk, varelevering, rolleprogresjon,
//   mailPlan, role_scope eller arbeidsleveranse.
//
//   Builderen bruker IKKE mailPlan, IKKE role mail families, IKKE plannedPrimary
//   og IKKE role_scope. Den leser bare data/Civication/privatePhaseMailFamilies/.
//
//   Hvor kommer innholdet fra? Fra spillerens History Go-profil, via
//   CivicationProfileSignalBridge: steder samlet, badges, quiz-styrker, kapital,
//   identitet, psyke og folk møtt. Mailer med `requiresAnyProfileTags` velges
//   kun når spillerens profileTags matcher, og vektes via `weightFrom`-stier
//   inn i signalobjektet (f.eks. "capital.cultural", "privatePhaseWeights.sport").
//   Mailer uten match-regler er den trygge generiske fallback-poolen.
//
//   Kontrakt: maks 1 aktiv privat fase-mail per private fase.

(function () {
  "use strict";

  const PRIVATE_PHASES = ["morning", "lunch", "afternoon", "dinner", "evening", "day_end"];
  const FAMILY_DIR = "data/Civication/privatePhaseMailFamilies";

  const PRIVATE_PHASE_LABELS = {
    morning: "Morgen",
    lunch: "Lunsj",
    afternoon: "Ettermiddag",
    dinner: "Middag",
    evening: "Kveld",
    day_end: "Dagslutt / Natt"
  };

  // De faste feltene som ALLE private fase-mailer må bære. Stemples autoritativt
  // av builderen slik at ingen jobb-binding kan lekke inn, uansett datainnhold.
  const PRIVATE_MAIL_FIELDS = Object.freeze({
    source_type: "daily_private_phase",
    channel: "private",
    messageChannel: "private",
    mail_class: "daily_private",
    role_scope: "",
    career_id: "",
    role_id: "",
    employer_id: "",
    workday_related: false,
    profile_signal_source: true
  });

  // Signaturord/-felt som aldri skal finnes i en privat fase-mail. Brukes både
  // som defensivt filter og av testene.
  const WORKDAY_FORBIDDEN_TERMS = [
    "lillebekk", "plankart", "utvalg", "plansjef", "utbygger", "varelevering",
    "rolleprogresjon", "mailplan", "role_scope", "arbeidsleveranse",
    "arbeidsgiveroppgave", "arealplanlegger"
  ];

  // Demping av ikke-hvile-mailer når profilen sier «lav energi».
  const LOW_ENERGY_DAMPING = 0.3;

  const jsonCache = new Map();

  function norm(value) {
    return String(value == null ? "" : value).trim();
  }

  function slugify(value) {
    return norm(value)
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/^_+|_+$/g, "") || "x";
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function isPrivatePhase(phaseId) {
    return PRIVATE_PHASES.includes(norm(phaseId));
  }

  function phaseLabel(phaseId) {
    return PRIVATE_PHASE_LABELS[norm(phaseId)] || norm(phaseId) || "Privat";
  }

  function hashString(input) {
    let hash = 0;
    const str = norm(input);
    for (let i = 0; i < str.length; i += 1) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  async function loadJson(path) {
    if (jsonCache.has(path)) return jsonCache.get(path);
    let data = null;
    try {
      const store = window.CivicationJsonStore;
      if (store?.load) {
        data = await store.load(path);
      } else if (typeof fetch === "function") {
        const res = await fetch(path);
        if (res?.ok) data = await res.json();
      }
    } catch (error) {
      if (window.DEBUG) console.warn("[CivicationPrivatePhaseMailBuilder] kunne ikke laste", path, error);
      data = null;
    }
    jsonCache.set(path, data);
    return data;
  }

  async function loadPhaseFamily(phaseId) {
    if (!isPrivatePhase(phaseId)) return null;
    return await loadJson(`${FAMILY_DIR}/${norm(phaseId)}.json`);
  }

  function normalizeChoices(choices) {
    if (!Array.isArray(choices)) return [];
    return choices
      .map((choice, index) => ({
        id: norm(choice?.id) || String.fromCharCode(65 + index),
        label: norm(choice?.label || choice?.text || choice?.id),
        reply: norm(choice?.reply),
        effect: Number.isFinite(Number(choice?.effect)) ? Number(choice.effect) : 0,
        tags: Array.isArray(choice?.tags) ? choice.tags.map(norm).filter(Boolean) : [],
        feedback: norm(choice?.feedback)
      }))
      .filter((choice) => choice.id && choice.label);
  }

  // Defensivt innholds-filter: en mail regnes som jobbinnhold hvis den bærer et
  // av signaturordene i tekst/emne. Brukes for å utelukke feilaktig innhold.
  function containsWorkContent(mail) {
    if (!mail || typeof mail !== "object") return false;
    const haystack = JSON.stringify({
      subject: mail.subject,
      summary: mail.summary,
      situation: mail.situation,
      topic: mail.topic,
      choices: mail.choices
    }).toLowerCase();
    return WORKDAY_FORBIDDEN_TERMS.some((term) => haystack.includes(term));
  }

  // Stempler de faste private feltene på et event. Autoritativ: overstyrer alt
  // som måtte ligge i datakilden slik at ingen jobb-binding kan lekke inn.
  function stampPrivateFields(event, phaseId) {
    const phase = norm(phaseId);
    return {
      ...event,
      ...PRIVATE_MAIL_FIELDS,
      phase_tag: phase
    };
  }

  function collectPhaseMails(family) {
    if (!family || typeof family !== "object") return [];
    const direct = Array.isArray(family.mails) ? family.mails : [];
    const nested = Array.isArray(family.families)
      ? family.families.flatMap((fam) => (Array.isArray(fam?.mails) ? fam.mails : []))
      : [];
    return [...direct, ...nested].filter((mail) => mail && typeof mail === "object");
  }

  // ------------------------------------------------------------
  // Profil-signaler (History Go → private fase-mailer)
  // ------------------------------------------------------------

  // Henter profil-signaler fra CivicationProfileSignalBridge. Mangler broen
  // (eller feiler den) returneres null, og valget faller tilbake til den
  // generiske poolen — private mailer skal aldri knekke av manglende profil.
  async function readProfileSignals(options = {}) {
    if (options.signals && typeof options.signals === "object") return options.signals;
    try {
      const bridge = window.CivicationProfileSignalBridge;
      if (!bridge?.getSignals) return null;
      const signals = await bridge.getSignals();
      return signals && typeof signals === "object" ? signals : null;
    } catch {
      return null;
    }
  }

  function mailTags(mail) {
    return Array.isArray(mail?.requiresAnyProfileTags)
      ? mail.requiresAnyProfileTags.map((t) => norm(t).toLowerCase()).filter(Boolean)
      : [];
  }

  function mailAvoidTags(mail) {
    return Array.isArray(mail?.avoidAnyProfileTags)
      ? mail.avoidAnyProfileTags.map((t) => norm(t).toLowerCase()).filter(Boolean)
      : [];
  }

  // Slår opp en "a.b.c"-sti i signalobjektet. Verdier over 1 tolkes som
  // 0..100-skala (kapital/psyke) og normaliseres til 0..1.
  function resolveWeightPath(signals, pathStr) {
    const parts = norm(pathStr).split(".").filter(Boolean);
    let node = signals;
    for (const part of parts) {
      if (!node || typeof node !== "object") return 0;
      node = node[part];
    }
    const value = Number(node);
    if (!Number.isFinite(value)) return 0;
    const normalized = value > 1 ? value / 100 : value;
    return Math.max(0, Math.min(1, normalized));
  }

  function scoreProfileMail(mail, signals, profileTagSet) {
    const tags = mailTags(mail);
    const matched = tags.filter((tag) => profileTagSet.has(tag));

    let score = 0;
    const weightFrom = Array.isArray(mail?.weightFrom) ? mail.weightFrom : [];
    weightFrom.forEach((pathStr) => {
      score += resolveWeightPath(signals, pathStr);
    });
    if (!weightFrom.length) score += 0.3;
    score += matched.length * 0.05;

    // Lav energi: hvile/søvn/ro skal vinne — aldri mer press. Alt som ikke selv
    // er hvile dempes, og hvile-mailer løftes.
    const lowEnergy = profileTagSet.has("low_energy");
    const isRestMail = tags.includes("rest") || tags.includes("low_energy");
    if (lowEnergy && !isRestMail) score *= LOW_ENERGY_DAMPING;
    if (lowEnergy && isRestMail) score += 0.5;

    return { score, matched };
  }

  // Velger mail ut fra profil-signaler: mailer med requiresAnyProfileTags er
  // kandidater kun når spillerens profileTags matcher (og avoidAnyProfileTags
  // ikke gjør det); høyest vektsum vinner deterministisk. Uten profiltreff
  // brukes den generiske poolen (mailer uten match-regler) med dato-rotasjon.
  function chooseMail(mails, signals, seed) {
    const profileTags = Array.isArray(signals?.profileTags) ? signals.profileTags : [];
    const profileTagSet = new Set(profileTags.map((t) => norm(t).toLowerCase()).filter(Boolean));

    const profilePool = mails.filter((mail) => mailTags(mail).length > 0);
    const genericPool = mails.filter((mail) => mailTags(mail).length === 0);

    let best = null;
    if (signals && profileTagSet.size) {
      for (const mail of profilePool) {
        if (!mailTags(mail).some((tag) => profileTagSet.has(tag))) continue;
        if (mailAvoidTags(mail).some((tag) => profileTagSet.has(tag))) continue;
        const { score, matched } = scoreProfileMail(mail, signals, profileTagSet);
        // Deterministisk tie-break på mail-id, uavhengig av fil-rekkefølge.
        const jitter = (hashString(`${seed}:${mail.id}`) % 1000) / 1000000;
        const total = score + jitter;
        if (!best || total > best.total) {
          best = { mail, total, matched };
        }
      }
    }

    if (best) {
      return { mail: best.mail, profileMatched: true, matchedTags: best.matched };
    }

    // Trygg generisk fallback: aldri jobbtekst, aldri «som {rolle}» /
    // «arbeidsdagen» — den generiske poolen består kun av nøytrale privatmailer.
    const pool = genericPool.length ? genericPool : mails;
    if (!pool.length) return null;
    const chosen = pool[hashString(seed) % pool.length];
    return { mail: chosen, profileMatched: false, matchedTags: [] };
  }

  // Bygger ÉN privat fase-mail for gitt fase. Profilmatch er deterministisk pr.
  // profil; generisk fallback er deterministisk pr. dato + fase, så dagen er
  // stabil, men roterer over dager. Returnerer null hvis fasen ikke er privat
  // eller familien mangler innhold.
  async function buildPhaseMail(phaseId, active, options = {}) {
    const phase = norm(phaseId);
    if (!isPrivatePhase(phase)) return null;

    const family = await loadPhaseFamily(phase);
    const mails = collectPhaseMails(family).filter((mail) => !containsWorkContent(mail));
    if (!mails.length) return null;

    const date = norm(options.date) || todayKey();
    const runtimeInstanceKey = norm(options.runtimeInstanceKey);
    const seed = `${date}:${phase}:${norm(options.rotation || "")}`;

    const signals = await readProfileSignals(options);
    const selection = chooseMail(mails, signals, seed);
    if (!selection) return null;
    const chosen = selection.mail;

    const baseId = slugify(chosen?.id || `${phase}_private`);
    const eventId = `${baseId}__private_${date}_${phase}${runtimeInstanceKey}`;

    const event = stampPrivateFields({
      id: eventId,
      thread_key: `private.mail.${slugify(eventId)}`,
      source: "Civication",
      source_mail_id: norm(chosen?.id),
      mail_type: phase === "day_end" ? "private_day_end" : "private_phase",
      mail_family: norm(family?.id || `private_${phase}`),
      topic: norm(chosen?.topic),
      stage: "private",
      subject: norm(chosen?.subject) || `${phaseLabel(phase)}: et lite valg`,
      summary: norm(chosen?.summary) || norm(Array.isArray(chosen?.situation) ? chosen.situation[0] : chosen?.situation),
      situation: Array.isArray(chosen?.situation)
        ? chosen.situation.map(norm).filter(Boolean)
        : [norm(chosen?.situation)].filter(Boolean),
      choices: normalizeChoices(chosen?.choices),
      narrative_arc: `privat_${phase}`,
      daily_mail_meta: {
        date,
        phase,
        phase_label: phaseLabel(phase),
        slot: `private_${phase}`,
        source_mail_id: norm(chosen?.id),
        source_family: norm(family?.id),
        advances_role_plan: false,
        private_phase: true,
        profile_matched: selection.profileMatched,
        profile_tags_matched: selection.matchedTags
      },
      mail_tags: [
        "daily_mail",
        "daily_private_phase",
        phase,
        norm(chosen?.topic),
        ...selection.matchedTags.map((tag) => `profile_${tag}`)
      ].filter(Boolean)
    }, phase);

    return event;
  }

  // Bygger ett kø-item pr. private fase (maks 1 aktiv mail per private fase).
  // Returnerer runtime-rader klare til å legges inn i dagskøen. Profil-signalene
  // hentes én gang og gjenbrukes for alle fasene.
  async function buildPrivatePhaseItems(active, options = {}) {
    const items = [];
    const signals = await readProfileSignals(options);
    const phaseOptions = signals ? { ...options, signals } : options;
    for (const phase of PRIVATE_PHASES) {
      const event = await buildPhaseMail(phase, active, phaseOptions);
      if (!event) continue;
      items.push({
        status: "queued",
        phase,
        slot: `private_${phase}`,
        optional: phase === "day_end" ? true : false,
        event
      });
    }
    return items;
  }

  window.CivicationPrivatePhaseMailBuilder = {
    PRIVATE_PHASES: PRIVATE_PHASES.slice(),
    PRIVATE_MAIL_FIELDS: { ...PRIVATE_MAIL_FIELDS },
    WORKDAY_FORBIDDEN_TERMS: WORKDAY_FORBIDDEN_TERMS.slice(),
    isPrivatePhase,
    phaseLabel,
    stampPrivateFields,
    containsWorkContent,
    loadPhaseFamily,
    readProfileSignals,
    resolveWeightPath,
    chooseMail,
    buildPhaseMail,
    buildPrivatePhaseItems
  };
})();
