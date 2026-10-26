// Connect explicit authored Skills practice to the ONE canonical choice boundary.
// No automatic reward for quiz, visit, mail open, phase change or role selection.
(function (root) {
  "use strict";
  const director = root.CivicationChoiceDirector;
  if (!director || typeof director.registerHandler !== "function") return;

  director.registerHandler("documented_skills_practice", function (context) {
    const authored = context?.choice?.skills_practice;
    if (!authored || typeof authored !== "object" || Array.isArray(authored)) return null;
    if (!context?.result?.ok) return null;

    return root.CivicationSkills?.applyPractice?.({
      source: "canonical_scene_choice",
      event_id: context.eventId || context.eventObj?.id,
      choice_id: context.choiceId,
      activity_type: authored.activity_type,
      skill_id: authored.skill_id,
      delta: authored.delta
    }) || null;
  }, 70);
})(typeof window === "object" ? window : null);
