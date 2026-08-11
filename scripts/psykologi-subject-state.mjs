export const PSYKOLOGI_UNIVERSITY_GATE = 'university_matrix_topic_articles_concept_registry_and_methods';
export const PSYKOLOGI_MAINTENANCE_GATE = 'maintenance_source_refresh_and_place_case_expansion';

export function psykologiPostBaselineStateIsConsistent(statusEntry, registrySubject) {
  const state = {
    editorialStatus: statusEntry?.editorialStatus,
    nextGate: statusEntry?.nextGate
  };
  const isUniversityExpansion = state.editorialStatus === 'expanded_and_audited'
    && state.nextGate === PSYKOLOGI_UNIVERSITY_GATE;
  const isCompleteMaintenance = state.editorialStatus === 'complete'
    && state.nextGate === PSYKOLOGI_MAINTENANCE_GATE;
  return (isUniversityExpansion || isCompleteMaintenance)
    && registrySubject?.editorialPlan?.nextGate === state.nextGate;
}
