// js/Civication/systems/civicationWorkdayMailBuilder.js
// CivicationWorkdayMailBuilder — arbeidsdagsadapter for canonicale jobbscener.
//
// Prinsipp (se js/Civication/README.md «To rytmer»):
//   Civication har to helt adskilte innholdssystemer:
//     1) Private fase-mailer  — CivicationPrivatePhaseMailBuilder
//     2) Arbeidslivsscener    — CivicationSceneDirector via denne adapteren
//
//   Arbeidslivsscener lever KUN i arbeidsdagen (forenoon/workday-runtime) og er
//   knyttet til arbeidsgiver/rolle/workday_day_index. SceneDirector velger neste
//   canonicale kandidat; denne filen stempler bare arbeidsdagens leveringsfelt.
//
//   Kontrakt: en arbeidslivsmail kan bare ha phase_tag "forenoon" eller
//   "workday". Alt annet avvises/klippes til arbeidsdagen.

(function () {
  "use strict";

  const WORK_PHASES = ["forenoon", "workday"];
  const WORK_MAIL_CLASS = "daily_workday";
  const SCENE_DIRECTOR_VERSION = 1;
  const SELECTION_TRACE_LIMIT = 80;
  const EVENT_ENGINE_PATCH_FLAG = "__civicationSceneDirectorBuildMailPoolPatched";

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

  function makeDefaultTagRules() {
    return {
      max_tags_per_choice: 2,
      memory_window: 12
    };
  }

  // SceneDirector bygger EventEngine-pakken direkte. Dette fjerner den gamle
  // dobbeltseleksjonen der MailRuntimes wrapper først kalte EventEngines
  // buildMailPool (som igjen kalte den offentlige selektoren) og deretter kalte
  // den interne MailRuntime-selektoren én gang til.
  async function buildEventEnginePack(director, engine, active, state, roleKey) {
    const candidates = await director.getWorkCandidates(active, state, {
      consumer: "event_engine_build_mail_pool"
    });
    const suppressFallback = candidates?.__career_outcome_terminal_closed === true;
    const taggedRuntimeMails = candidates.map((mail) => ({
      ...mail,
      source_type: norm(mail?.source_type) || "planned"
    }));

    if (taggedRuntimeMails.length || suppressFallback) {
      return {
        role: norm(active?.career_id) || null,
        tag_rules: makeDefaultTagRules(),
        tracks: [],
        mails: taggedRuntimeMails,
        __civication_mail_runtime: true,
        __civication_scene_director: true,
        __runtime_candidate_count: taggedRuntimeMails.length,
        __legacy_fallback: false,
        __terminal_closed: suppressFallback
      };
    }

    // Legacy brukes bare når den canonicale rollen faktisk ikke leverer noen
    // kandidat. Lastingen gjøres her, uten å kjøre en ny canonical seleksjon.
    const packFile = typeof engine?.resolvePackFile === "function"
      ? engine.resolvePackFile(active, roleKey)
      : null;
    const pack = typeof engine?.loadPack === "function"
      ? await engine.loadPack(packFile)
      : null;
    const packMails = Array.isArray(pack?.mails)
      ? pack.mails.map((mail) => ({
          ...mail,
          source_type: "legacy_pack"
        }))
      : [];

    const roleMails = await window.CiviRoleStoryletBridge?.makeCandidateMailsForActiveRole?.(
      active,
      state
    ) || [];
    const taggedRoleMails = roleMails.map((mail) => ({
      ...mail,
      source_type: norm(mail?.source_type) || "role"
    }));

    return {
      role: pack?.role || norm(active?.career_id) || null,
      tag_rules: pack?.tag_rules || makeDefaultTagRules(),
      tracks: Array.isArray(pack?.tracks) ? pack.tracks : [],
      mails: [...taggedRoleMails, ...packMails],
      __civication_mail_runtime: true,
      __civication_scene_director: true,
      __runtime_candidate_count: 0,
      __legacy_fallback: true,
      __terminal_closed: false
    };
  }

  function patchEventEngineCandidateOwner(director) {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || !director) return false;
    if (proto[EVENT_ENGINE_PATCH_FLAG] === true) return true;
    if (typeof proto.buildMailPool !== "function") return false;

    const previousBuildMailPool = proto.buildMailPool;
    proto.buildMailPool = async function sceneDirectorBuildMailPool(active, state, roleKey) {
      try {
        return await buildEventEnginePack(director, this, active, state, roleKey);
      } catch (error) {
        if (window.DEBUG) {
          console.warn("[CivicationSceneDirector] EventEngine-pack feilet; bruker forrige adapter", error);
        }
        return previousBuildMailPool.call(this, active, state, roleKey);
      }
    };

    proto[EVENT_ENGINE_PATCH_FLAG] = true;
    proto.__civicationSceneDirectorBuildMailPoolPatchedAt = new Date().toISOString();
    return true;
  }

  // Første SceneDirector-cutover: WorkdayBuilder lastes etter MailRuntime og
  // kandidat-utvidelsene (bl.a. CareerOutcomeRuntime). Den fanger derfor den
  // komplette, outcome-aware selektoren én gang og gjør Director til eneste
  // offentlige innsteg for Daily/Workday-kall. I 4B overtar Director også
  // EventEngines interne kandidatinnsteg.
  function ensureSceneDirector() {
    if (window.CivicationSceneDirector?.getWorkCandidates) {
      patchEventEngineCandidateOwner(window.CivicationSceneDirector);
      return window.CivicationSceneDirector;
    }

    const runtime = window.CivicationMailRuntime;
    const sourceSelector = runtime?.makeCandidateMailsForActiveRole;
    if (typeof sourceSelector !== "function") return null;

    const boundSourceSelector = sourceSelector.bind(runtime);
    const selectionTrace = [];

    function recordSelection(active, candidates, options = {}) {
      const first = Array.isArray(candidates) ? candidates[0] || null : null;
      selectionTrace.push({
        at: new Date().toISOString(),
        consumer: norm(options.consumer || "mail_runtime_compat") || "mail_runtime_compat",
        career_id: norm(active?.career_id),
        role_scope: resolveRoleScope(active),
        candidate_count: Array.isArray(candidates) ? candidates.length : 0,
        selected_id: norm(first?.id) || null,
        selected_type: norm(first?.mail_type) || null,
        selected_family: norm(first?.mail_family) || null
      });
      if (selectionTrace.length > SELECTION_TRACE_LIMIT) {
        selectionTrace.splice(0, selectionTrace.length - SELECTION_TRACE_LIMIT);
      }
    }

    async function getWorkCandidates(active, state = getState(), options = {}) {
      const candidates = await boundSourceSelector(active, state);
      const normalized = Array.isArray(candidates) ? candidates : [];
      recordSelection(active, normalized, options);
      return normalized;
    }

    async function getPrimaryWorkScene(active, state = getState(), options = {}) {
      const candidates = await getWorkCandidates(active, state, {
        ...options,
        consumer: norm(options.consumer || "primary_work_scene") || "primary_work_scene"
      });
      return candidates[0] || null;
    }

    async function getEventEnginePack(engine, active, state = getState(), roleKey) {
      return buildEventEnginePack(director, engine, active, state, roleKey);
    }

    function inspect() {
      const active = getActive();
      const proto = window.CivicationEventEngine?.prototype;
      return {
        version: SCENE_DIRECTOR_VERSION,
        owner: "CivicationSceneDirector",
        source_adapter: "CivicationMailRuntime.makeCandidateMailsForActiveRole",
        active_role_scope: active ? resolveRoleScope(active) : null,
        event_engine_candidate_owner: proto?.[EVENT_ENGINE_PATCH_FLAG] === true,
        selection_trace: selectionTrace.slice()
      };
    }

    const director = {
      version: SCENE_DIRECTOR_VERSION,
      getWorkCandidates,
      getPrimaryWorkScene,
      getEventEnginePack,
      inspect
    };

    window.CivicationSceneDirector = director;
    // Bakoverkompatibilitet: DailyMailBuilder og eldre kall bruker fortsatt dette
    // navnet, men funksjonsreferansen er nå Directorens autoritative innsteg.
    runtime.makeCandidateMailsForActiveRole = director.getWorkCandidates;
    patchEventEngineCandidateOwner(director);
    return director;
  }

  async function loadWorkdayCandidates(active, state = getState()) {
    const director = ensureSceneDirector();
    if (!director || typeof director.getWorkCandidates !== "function") return [];

    try {
      const list = await director.getWorkCandidates(active, state, {
        consumer: "workday_mail_builder"
      });
      return Array.isArray(list) ? list : [];
    } catch (error) {
      if (window.DEBUG) console.warn("[CivicationWorkdayMailBuilder] kunne ikke laste arbeidslivsscener", error);
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

  // Bygger arbeidsdag-køen: fordeler arbeidslivsscenene på forenoon (primær) og
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

  ensureSceneDirector();

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
    ensureSceneDirector,
    patchEventEngineCandidateOwner,
    loadWorkdayCandidates,
    toWorkdayMail,
    buildWorkdayItems
  };
})();
