// hgOntologyAdapter.js
export function toOntologyV1(item) {
  // item kan være emne/pensum/quiz/meta-blokk
  const module_id = item.module_id || item.emne_id || item.id || null;

  const discipline_id = item.discipline_id || item.subject_id || null;

  const field_id =
    item.field_id ||
    item.themeId ||
    item.badge_id ||
    item.category ||
    null;

  const concepts =
    item.concepts ||
    item.core_concepts ||
    [];

  const domain_id = item.domain_id || item.domain || null;

  return {
    module_id,
    field_id,
    discipline_id,
    domain_id,
    concepts
  };
}
