// js/Civication/systems/civicationWorkdayMailBuilder.js
// CivicationWorkdayMailBuilder — bygger ARBEIDSLIVSMAILENE.
//
// Prinsipp (se js/Civication/README.md «To rytmer»):
//   Civication har to helt adskilte innholdssystemer:
//     1) Private fase-mailer  — CivicationPrivatePhaseMailBuilder
//     2) Arbeidslivsmail       — DENNE filen
//
//   Arbeidslivsmail lever KUN i arbeidsdagen (forenoon/workday-runtime) og er
//   knyttet til arbeidsgiver/rolle/workday_day_index. De bygges fra mailPlan +
//   mailFamilies via CivicationMailRuntime (rolleprogresjonen), aldri fra de
//   private fase-familiene.
//
//   Kontrakt: en arbeidslivsmail kan bare ha phase_tag "forenoon" eller
//   "workday". Alt annet avvises/klippes til arbeidsdagen.

(function () {
  "use strict";

  const WORK_PHASES = ["forenoon", "workday"];
  const WORK_MAIL_CLASS = "daily_workday";

  const WORK_PHASE_LABELS = {
    forenoon: "Formiddag",
    workday: "Arbeidsdag"
  };

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

  function isWorkPhase(phaseId) {
    return WORK_PHASES.includes(norm(phaseId));
  }

  function phaseLabel(phaseId) {
    return WORK_PHASE_LABELS[norm(phaseId)] || norm(phaseId) || "Arbeidsdag";
  }

  function getState() {
    return window.CivicationState?.getState?.() || {};
  }

  function getActive() {
    return window.CivicationState?.getActivePosition?.() || null;
  }

  function resolveRoleScope(active) {
    const pos = active || getActive();
    const resolver = window.CivicationCareerRoleResolver?.resolveCareerRoleScope;
    if (typeof resolver === "function") {
      const resolved = norm(resolver(pos));
      if (resolved && resolved !== "unknown") return resolved;
    }
    return norm(pos?.role_scope || pos?.role_key || pos?.role_id);
  }

  function getEmployerId(active) {
    const pos = active || getActive();
    const wr = window.CivicationWorkdayRuntime;
    if (wr?.getEmployerId) {
      const id = norm(wr.getEmployerId(pos));
      if (id) return id;
    }
    return norm(pos?.brand_id || pos?.employer_id);
  }

  function getWorkdayDayIndex() {
    return Number(window.CivicationWorkdayRuntime?.getWorkdayDayIndex?.() || 0);
  }

  function normalizeChoices(choices) {
    if (!Array.isArray(choices)) return [];
    return choices
      .map((choice, index) => ({
        ...choice,
        id: norm(choice?.id) || String.fromCharCode(65 + index),
        label: norm(choice?.label || choice?.text || choice?.id)
      }))
      .filter((choice) => choice.id && choice.label);
  }

  // Klipper enhver fase til en gyldig arbeidsdag-fase. Arbeidslivsmail som kommer
  // inn med en privat/ukjent fase blir tvunget til «workday», aldri sluppet ut i
  // en privat fase.
  function clampWorkPhase(phaseId) {
    const phase = norm(phaseId);
    return isWorkPhase(phase) ? phase : "workday";
  }

  // Stempler de faste arbeidslivs-feltene autoritativt: arbeidsklasse, source,
  // arbeidsgiver/rolle-binding og workday_day_index. phase_tag klippes alltid til
  // forenoon/workday.
  function stampWorkdayFields(event, phaseId, active, options = {}) {
    const phase = clampWorkPhase(phaseId);
    const roleScope = resolveRoleScope(active);
    const employerId = getEmployerId(active);
    const pos = active || getActive();
    return {
      ...event,
      source_type: norm(event?.source_type) || (options.planned ? "planned" : "daily_extra"),
      mail_class: WORK_MAIL_CLASS,
      channel: "job",
      messageChannel: "job",
      workday_related: true,
      phase_tag: phase,
      role_scope: roleScope,
      career_id: norm(pos?.career_id),
      role_id: norm(pos?.role_id || pos?.role_key),
      employer_id: employerId,
      workday_day_index: getWorkdayDayIndex()
    };
  }

  // Henter arbeidslivs-kandidatene fra rolleprogresjonen (mailPlan + mailFamilies)
  // via CivicationMailRuntime. Dette er den eneste kilden til arbeidslivsmail.
  async function loadWorkdayCandidates(active, state = getState()) {
    const runtime = window.CivicationMailRuntime;
    if (typeof runtime?.makeCandidateMailsForActiveRole !== "function") return [];
    try {
      const list = await runtime.makeCandidateMailsForActiveRole(active, state);
      return Array.isArray(list) ? list : [];
    } catch (error) {
      if (window.DEBUG) console.warn("[CivicationWorkdayMailBuilder] kunne ikke laste arbeidslivsmail", error);
      return [];
    }
  }

  function toWorkdayMail(active, sourceMail, phaseId, index, options = {}) {
    const phase = clampWorkPhase(phaseId);
    const date = norm(options.date) || todayKey();
    const runtimeInstanceKey = norm(options.runtimeInstanceKey);
    const sourceId = norm(sourceMail?.id);
    const eventId = `${sourceId || "work"}__workday_${date}_${phase}_${index}${runtimeInstanceKey}`;

    return stampWorkdayFields({
      ...sourceMail,
      id: eventId,
      source_mail_id: sourceId,
      thread_key: norm(sourceMail?.thread_key) || `${resolveRoleScope(active) || "role"}.mail.${slugify(eventId)}`,
      stage: norm(sourceMail?.stage || "stable") || "stable",
      choices: normalizeChoices(sourceMail?.choices),
      daily_mail_meta: {
        date,
        phase,
        phase_label: phaseLabel(phase),
        slot: index === 0 ? "primary_work_mail" : "operational_mail",
        source_mail_id: sourceId,
        source_mail_type: norm(sourceMail?.mail_type),
        source_mail_family: norm(sourceMail?.mail_family),
        advances_role_plan: index === 0,
        workday_day_index: getWorkdayDayIndex()
      },
      mail_tags: [
        ...(Array.isArray(sourceMail?.mail_tags) ? sourceMail.mail_tags : []),
        "daily_mail",
        "daily_workday",
        phase
      ].filter(Boolean)
    }, phase, active, { planned: index === 0 });
  }

  // Bygger arbeidsdag-køen: fordeler arbeidslivsmailene på forenoon (primær) og
  // workday (resten). Returnerer runtime-rader klare til å legges inn i dagskøen.
  async function buildWorkdayItems(active, options = {}) {
    const pos = active || getActive();
    if (!pos) return [];
    const candidates = await loadWorkdayCandidates(pos, options.state || getState());
    if (!candidates.length) return [];

    const items = [];
    candidates.forEach((mail, index) => {
      const phase = index === 0 ? "forenoon" : "workday";
      items.push({
        status: "queued",
        phase,
        slot: index === 0 ? "primary_work_mail" : "operational_mail",
        event: toWorkdayMail(pos, mail, phase, index, options)
      });
    });
    return items;
  }

  window.CivicationWorkdayMailBuilder = {
    WORK_PHASES: WORK_PHASES.slice(),
    WORK_MAIL_CLASS,
    isWorkPhase,
    phaseLabel,
    clampWorkPhase,
    resolveRoleScope,
    getEmployerId,
    getWorkdayDayIndex,
    stampWorkdayFields,
    loadWorkdayCandidates,
    toWorkdayMail,
    buildWorkdayItems
  };
})();
