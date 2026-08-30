export function projectSociologyMilestone(production, category, ordinal) {
  if (production.progress.strictCompletionProven !== true) return;
  if (production.progress.materializedDomains !== 12 || production.progress.totalDomains !== 12 || production.materialized.length !== 12) {
    throw new Error('Strict completion-state er inkonsistent og kan ikke projiseres til en historisk felt-audit');
  }
  const subcategory = category.canonicalSubcategories.politikk.find((row) => row.id === 'sosiologi_antropologi');
  if (subcategory?.status !== 'foundation_materialized') throw new Error('Strict completion krever foundation_materialized canonical status');
  production.progress.materializedDomains = ordinal;
  production.progress.strictCompletionProven = false;
  production.materialized = production.materialized.slice(0, ordinal);
  subcategory.status = 'expansion_planned';
}
