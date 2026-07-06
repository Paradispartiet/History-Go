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
    workday_related: false
  });

  // Signaturord/-felt som aldri skal finnes i en privat fase-mail. Brukes både
  // som defensivt filter og av testene.
  const WORKDAY_FORBIDDEN_TERMS = [
    "lillebekk", "plankart", "utvalg", "plansjef", "utbygger", "varelevering",
    "rolleprogresjon", "mailplan", "role_scope", "arbeidsleveranse",
    "arbeidsgiveroppgave"
  ];

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

  // Bygger ÉN privat fase-mail for gitt fase. Deterministisk pr. dato + fase, så
  // dagen er stabil, men roterer over dager. Returnerer null hvis fasen ikke er
  // privat eller familien mangler innhold.
  async function buildPhaseMail(phaseId, active, options = {}) {
    const phase = norm(phaseId);
    if (!isPrivatePhase(phase)) return null;

    const family = await loadPhaseFamily(phase);
    const mails = collectPhaseMails(family).filter((mail) => !containsWorkContent(mail));
    if (!mails.length) return null;

    const date = norm(options.date) || todayKey();
    const runtimeInstanceKey = norm(options.runtimeInstanceKey);
    const seed = `${date}:${phase}:${norm(options.rotation || "")}`;
    const chosen = mails[hashString(seed) % mails.length];

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
        private_phase: true
      },
      mail_tags: [
        "daily_mail",
        "daily_private_phase",
        phase,
        norm(chosen?.topic)
      ].filter(Boolean)
    }, phase);

    return event;
  }

  // Bygger ett kø-item pr. private fase (maks 1 aktiv mail per private fase).
  // Returnerer runtime-rader klare til å legges inn i dagskøen.
  async function buildPrivatePhaseItems(active, options = {}) {
    const items = [];
    for (const phase of PRIVATE_PHASES) {
      const event = await buildPhaseMail(phase, active, options);
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
    buildPhaseMail,
    buildPrivatePhaseItems
  };
})();
