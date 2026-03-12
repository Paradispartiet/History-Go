export function buildByQuizPlan(place, emnerById) {
  const qp = place.quiz_profile;
  const families = dedupe(qp.question_families).slice(0, 4);
  const selectedAngles = qp.primary_angles.slice(0, 3);
  const plan = [];
  const usedEmneAngle = new Set();

  for (const family of families) {
    const angle = pickAngleForFamily(family, selectedAngles, qp.avoid_angles);
    const emneId = pickSupportingEmne(place.emne_ids, angle, emnerById, usedEmneAngle);
    const trait = pickTrait(qp, family);
    const signature = `${emneId}::${angle}`;
    if (usedEmneAngle.has(signature)) continue;

    plan.push({ family, angle, emneId, trait });
    usedEmneAngle.add(signature);
  }

  return validatePlan(plan, qp);
}
