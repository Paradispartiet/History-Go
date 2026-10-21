// Skills is a small capability slice of the canonical hg_civi_state_v1.
// It does not own psychology, job learning, capital, badges or History Go records.
// Only explicit, successfully answered authored choices may award practice.
(function (root) {
  "use strict";

  const STATE_FIELD = "skills_v1";
  const VERSION = 1;
  const DEFINITIONS = Object.freeze([
    { id: "wisdom_judgement", label: "Visdom / dømmekraft" },
    { id: "social_awareness", label: "Sosial teft" },
    { id: "creativity", label: "Kreativitet" },
    { id: "practical_mastery", label: "Praktisk mestring" },
    { id: "communication", label: "Formidling" },
    { id: "agency", label: "Handlekraft" }
  ]);
  const SKILL_IDS = new Set(DEFINITIONS.map(function (entry) { return entry.id; }));
  const ALLOWED_SOURCES = new Set(["canonical_scene_choice", "life_story_choice"]);

  function record(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function numberInRange(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : fallback;
  }

  function getViewModel(state) {
    const source = record(record(state)[STATE_FIELD]);
    const scores = record(source.scores);
    const skills = DEFINITIONS.map(function (definition) {
      const hasScore = Object.prototype.hasOwnProperty.call(scores, definition.id) &&
        typeof scores[definition.id] === "number" && Number.isFinite(scores[definition.id]);
      return {
        id: definition.id,
        label: definition.label,
        score: hasScore ? numberInRange(scores[definition.id], 0) : null,
        measured: hasScore
      };
    });
    return {
      label: "Skills",
      skills: skills,
      documented_count: skills.filter(function (item) { return item.measured; }).length,
      note: "Skills øves gjennom dokumenterte valg og handlinger. Besøk og quiz gir ikke automatisk skillpoeng."
    };
  }

  function practicePatch(state, practice) {
    const data = record(practice);
    const eventId = String(data.event_id || "").trim();
    const choiceId = String(data.choice_id || "").trim();
    const activityType = String(data.activity_type || "").trim();
    const skillId = String(data.skill_id || "").trim();
    const source = String(data.source || "").trim();
    const delta = Number(data.delta);
    if (!ALLOWED_SOURCES.has(source) || !eventId || !choiceId || !activityType ||
        !SKILL_IDS.has(skillId) || !Number.isInteger(delta) || delta < 1 || delta > 3 ||
        eventId.length > 240 || choiceId.length > 240 || activityType.length > 100) {
      return { applied: false, reason: "unverified_practice" };
    }

    const original = record(record(state)[STATE_FIELD]);
    const processed = record(original.applied_event_ids);
    // A scene can earn practice only once, even if the player reloads,
    // changes choice on replay or different subsystems inspect the same event.
    if (Object.prototype.hasOwnProperty.call(processed, eventId)) {
      return { applied: false, reason: "already_counted" };
    }

    const scores = { ...record(original.scores) };
    const before = numberInRange(scores[skillId], 0);
    // Gentle progression: gains decrease at high mastery, without inferring
    // ability from pre-existing money, reputation, visits or job titles.
    const effectiveDelta = Math.max(1, Math.ceil(delta * (1 - before / 100)));
    const after = Math.min(100, before + effectiveDelta);
    scores[skillId] = after;

    const next = {
      ...original,
      version: VERSION,
      scores: scores,
      applied_event_ids: {
        ...processed,
        [eventId]: { skill_id: skillId, choice_id: choiceId, source: source, activity_type: activityType }
      },
      last_practice_by_skill: {
        ...record(original.last_practice_by_skill),
        [skillId]: { event_id: eventId, choice_id: choiceId, activity_type: activityType }
      }
    };

    return {
      applied: true,
      skill_id: skillId,
      before: before,
      after: after,
      patch: { [STATE_FIELD]: next }
    };
  }

  function applyPractice(practice) {
    const api = root.CivicationState;
    if (!api || typeof api.getState !== "function" || typeof api.setState !== "function") {
      return { applied: false, reason: "state_unavailable" };
    }
    const result = practicePatch(api.getState(), practice);
    if (result.applied) {
      api.setState(result.patch);
      render();
    }
    return result;
  }

  function render() {
    const doc = root.document;
    const panel = doc && doc.getElementById("civiSkillsPanel");
    if (!panel || !doc.createElement) return false;
    const model = getViewModel(root.CivicationState?.getState?.() || {});
    // Static labels and numbers only; never interpret game data as HTML.
    panel.replaceChildren();
    panel.setAttribute("aria-label", "Skills – seks egenskaper og dokumentert progresjon");

    model.skills.forEach(function (skill) {
      const item = doc.createElement("div");
      item.className = "civi-skill-card";
      item.dataset.skillId = skill.id;
      if (!skill.measured) item.classList.add("is-unmeasured");

      const head = doc.createElement("div");
      head.className = "civi-skill-head";
      const label = doc.createElement("div");
      label.className = "civi-skill-label";
      label.textContent = skill.label;
      const value = doc.createElement("div");
      value.className = "civi-skill-value";
      value.textContent = skill.measured ? String(skill.score) + " / 100" : "Ikke målt";
      head.appendChild(label);
      head.appendChild(value);

      const track = doc.createElement("div");
      track.className = "civi-skill-meter";
      // Unknown value is not a zero score and must not appear as an ARIA progressbar.
      if (skill.measured) {
        track.setAttribute("role", "progressbar");
        track.setAttribute("aria-label", skill.label);
        track.setAttribute("aria-valuemin", "0");
        track.setAttribute("aria-valuemax", "100");
        track.setAttribute("aria-valuenow", String(skill.score));
      } else {
        track.setAttribute("role", "img");
        track.setAttribute("aria-label", skill.label + ": ikke målt");
      }
      const fill = doc.createElement("div");
      fill.className = "civi-skill-meter-fill";
      fill.style.width = skill.measured ? String(skill.score) + "%" : "0%";
      track.appendChild(fill);

      const footer = doc.createElement("div");
      footer.className = "civi-skill-footer";
      footer.textContent = skill.measured
        ? "Dokumentert gjennom spillvalg"
        : "Ingen kvalifiserende handling registrert";

      item.appendChild(head);
      item.appendChild(track);
      item.appendChild(footer);
      panel.appendChild(item);
    });
    const summary = doc.getElementById("civiSkillsSummary");
    if (summary) summary.textContent = model.documented_count + " av 6 Skills med dokumentert praksis";
    return true;
  }

    root.CivicationSkills = { STATE_FIELD, VERSION, DEFINITIONS, getViewModel, practicePatch, applyPractice, render };
})(typeof window === "object" ? window : null);
