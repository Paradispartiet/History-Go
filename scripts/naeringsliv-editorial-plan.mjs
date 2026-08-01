const COMPLETE_GATE = 'maintenance_and_source_refresh';

export function evaluateNaeringslivEditorialPlan(registrySubject, canonicalDomainIds = []) {
  const plan = registrySubject?.editorialPlan || {};
  const minimum = Number(plan?.targetChapterRange?.minimum || 0);
  const maximum = Number(plan?.targetChapterRange?.maximum || 0);
  const inProgressGate = String(plan?.inProgressGate || '').trim();
  if (minimum < 1 || maximum < minimum) throw new Error('Næringsliv mangler gyldig målområde for redigerte kapitler');
  if (!inProgressGate) throw new Error('Næringsliv mangler redaksjonell inProgressGate');

  const chapters = Array.isArray(registrySubject?.chapters) ? registrySubject.chapters : [];
  const coveredDomains = new Set(chapters.map((chapter) => String(chapter?.primary_domain_id || '').trim()).filter(Boolean));
  const allCanonicalDomainsCovered = canonicalDomainIds.every((domainId) => coveredDomains.has(domainId));
  const withinTargetRange = chapters.length >= minimum && chapters.length <= maximum;
  const allChaptersReady = chapters.every((chapter) => chapter?.editorialStatus === 'chapter_ready' && chapter?.claimTraceRequired === true);
  const complete = withinTargetRange && allCanonicalDomainsCovered && allChaptersReady;
  return {
    chapterCount: chapters.length,
    minimum,
    maximum,
    allCanonicalDomainsCovered,
    withinTargetRange,
    allChaptersReady,
    complete,
    expectedEditorialStatus: complete ? 'complete' : chapters.length ? 'chapters_in_progress' : 'structure_ready',
    expectedNextGate: complete ? COMPLETE_GATE : inProgressGate
  };
}
