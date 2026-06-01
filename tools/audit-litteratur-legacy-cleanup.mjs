import fs from 'fs';
import path from 'path';
import {
  PLACE_REF_KEYS,
  buildActivePlaceIdSet,
  manifestFilesToPaths,
  readJson,
  toArray,
} from './lib/placeRefAuditUtils.mjs';

const root = process.cwd();
const placesManifestPath = path.join(root, 'data/places/manifest.json');
const peopleManifestPath = path.join(root, 'data/people/manifest.json');
const legacyFileRel = 'people/people_litteratur.json';
const legacyFilePath = path.join(root, 'data', legacyFileRel);
const legacySourceFile = `data/${legacyFileRel}`;

const reportJsonPath = path.join(root, 'reports/litteratur-legacy-cleanup-audit.json');
const reportMdPath = path.join(root, 'reports/litteratur-legacy-cleanup-audit.md');

// Forventede gjenværende legacy-personer etter PR #759.
// Brukes BARE som forventet analysegrunnlag, ikke for å hardkode konklusjoner.
const EXPECTED_LEGACY_PEOPLE = [
  'sigrid_undset',
  'bjornstjerne_bjornson',
  'henrik_wergeland',
  'camilla_collett',
  'andre_bjerke',
  'inger_hagerup',
  'jon_fosse',
  'rolf_jacobsen',
  'alf_proysen',
  'per_petterson',
];

// Moderne people-schema som skal sjekkes.
const MODERN_PEOPLE_SCHEMA = [
  'id',
  'name',
  'initials',
  'desc',
  'tags',
  'placeId',
  'category',
  'year',
  'popupDesc',
  'places',
  'image',
  'cardImage',
];

// Kjernefelt: mangel på disse indikerer stub / mangelfull person.
const CORE_SCHEMA_FIELDS = ['name', 'initials', 'desc', 'placeId', 'year', 'popupDesc', 'places'];

function normalizeId(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.85;
  const at = new Set(a.split('-').filter(Boolean));
  const bt = new Set(b.split('-').filter(Boolean));
  if (!at.size || !bt.size) return 0;
  const inter = [...at].filter((t) => bt.has(t)).length;
  return inter / Math.max(at.size, bt.size);
}

// Fasit: aktive top-level placeId-er fra data/places/manifest.json (source-data).
const placeIds = buildActivePlaceIdSet(root, placesManifestPath);
const validPlaceIds = [...placeIds].sort((a, b) => a.localeCompare(b, 'nb'));
const validNormToIds = new Map();
for (const pid of validPlaceIds) {
  const n = normalizeId(pid);
  if (!validNormToIds.has(n)) validNormToIds.set(n, []);
  validNormToIds.get(n).push(pid);
}

// Valgfri ekstra runtime-sammenligning (IKKE fasit) mot places_index.json.
let placesIndexIds = null;
const placesIndexPath = path.join(root, 'data/places/places_index.json');
if (fs.existsSync(placesIndexPath)) {
  try {
    const idx = readJson(placesIndexPath);
    const rows = toArray(idx);
    placesIndexIds = new Set(
      rows.map((r) => (typeof r?.id === 'string' ? r.id.trim() : '')).filter(Boolean),
    );
  } catch {
    placesIndexIds = null;
  }
}

const peopleManifest = readJson(peopleManifestPath);
const manifestListsLegacy = (peopleManifest.files || []).includes(legacyFileRel);

// Forsiktige kandidatforslag for én ugyldig placeRef. Foreslår KUN, retter aldri.
function suggestCandidates(invalidPlaceId) {
  const norm = normalizeId(invalidPlaceId);
  const exact = validNormToIds.get(norm) || [];
  if (exact.length) {
    return {
      refClassification: 'likely_rename_to_existing_place',
      suggestions: exact.slice(0, 5).map((id) => ({ placeId: id, confidence: 'high' })),
    };
  }

  const scored = validPlaceIds
    .map((pid) => ({ placeId: pid, score: similarity(norm, normalizeId(pid)) }))
    .filter((r) => r.score >= 0.45)
    .sort((a, b) => b.score - a.score || a.placeId.localeCompare(b.placeId, 'nb'))
    .slice(0, 5)
    .map((r) => ({
      placeId: r.placeId,
      confidence: r.score >= 0.85 ? 'high' : r.score >= 0.7 ? 'medium' : 'low',
    }));

  if (!scored.length) {
    return { refClassification: 'missing_place_candidate', suggestions: [] };
  }

  const hasStrong = scored.some((s) => s.confidence === 'high' || s.confidence === 'medium');
  return {
    refClassification: hasStrong ? 'likely_rename_to_existing_place' : 'needs_manual_review',
    suggestions: scored,
  };
}

function analyzePerson(person) {
  const personId = typeof person?.id === 'string' && person.id.trim() ? person.id.trim() : '(missing-id)';
  const name = typeof person?.name === 'string' && person.name.trim() ? person.name.trim() : '(missing-name)';

  // Schema-analyse.
  const missingSchemaFields = MODERN_PEOPLE_SCHEMA.filter((field) => {
    const v = person?.[field];
    if (v === undefined || v === null) return true;
    if (typeof v === 'string' && v.trim() === '') return true;
    if (Array.isArray(v) && v.length === 0) return true;
    return false;
  });
  const divergentFields = Object.keys(person || {}).filter((k) => !MODERN_PEOPLE_SCHEMA.includes(k));
  const isStub = person?.stub === true;
  const missingCoreFields = CORE_SCHEMA_FIELDS.filter((f) => missingSchemaFields.includes(f));
  const hasLegacyOrDivergentSchema = isStub || divergentFields.length > 0 || missingCoreFields.length > 0;

  // Primary placeId.
  const rawPlaceId = typeof person?.placeId === 'string' ? person.placeId.trim() : '';
  const hasPlaceId = rawPlaceId.length > 0;
  let placeIdStatus;
  if (!hasPlaceId) placeIdStatus = 'missing';
  else if (placeIds.has(rawPlaceId)) placeIdStatus = 'valid';
  else placeIdStatus = 'invalid';

  // places[].
  const rawPlaces = Array.isArray(person?.places) ? person.places : [];
  const seen = new Set();
  const placeRefs = rawPlaces.map((entry, index) => {
    const value = typeof entry === 'string' ? entry.trim() : '';
    let status;
    if (!value) {
      status = 'missing_or_empty';
    } else if (seen.has(value)) {
      status = 'duplicate_within_person';
    } else {
      seen.add(value);
      status = placeIds.has(value) ? 'valid' : 'invalid';
    }
    return { index, placeRef: value, status };
  });

  const validRefs = placeRefs.filter((r) => r.status === 'valid').map((r) => r.placeRef);
  const invalidRefEntries = placeRefs.filter((r) => r.status === 'invalid');
  const invalidRefs = [...new Set(invalidRefEntries.map((r) => r.placeRef))].sort((a, b) => a.localeCompare(b, 'nb'));
  const duplicateRefs = placeRefs.filter((r) => r.status === 'duplicate_within_person').map((r) => r.placeRef);
  const emptyRefCount = placeRefs.filter((r) => r.status === 'missing_or_empty').length;

  const hasAtLeastOneValidPlace = placeIdStatus === 'valid' || validRefs.length > 0;
  const missingAllValidPlace = !hasAtLeastOneValidPlace;

  // Klassifiser hver ugyldige placeRef (forslag, ikke retting).
  const invalidRefAnalysis = invalidRefs.map((ref) => {
    const s = suggestCandidates(ref);
    return {
      placeRef: ref,
      refClassification: s.refClassification,
      suggestions: s.suggestions,
    };
  });

  // Hovedklassifisering – beregnet fra faktisk data.
  let classification;
  let recommendedNextAction;
  if (isStub || missingCoreFields.length >= 3) {
    classification = 'stub_needs_manual_completion';
    recommendedNextAction =
      'Kurater person manuelt i chat: fyll inn manglende schemafelt og bestem stedskobling før implementering.';
  } else if (missingAllValidPlace) {
    classification = 'missing_place_data_required';
    recommendedNextAction =
      'Mangler all gyldig stedskobling. Avgjør om sted finnes/skal opprettes før people kan ryddes.';
  } else if (placeIdStatus === 'valid' && invalidRefs.length === 0) {
    classification = 'ready_for_manual_mapping';
    recommendedNextAction =
      'Gyldig primary og kun gyldige refs. Kan tas i trygg manuell mapping-batch (evt. rydde duplikat/tomme refs).';
  } else if (placeIdStatus === 'valid') {
    const allRename = invalidRefAnalysis.every((r) => r.refClassification === 'likely_rename_to_existing_place');
    const anyMissing = invalidRefAnalysis.some((r) => r.refClassification === 'missing_place_candidate');
    if (allRename) {
      classification = 'ready_for_manual_mapping';
      recommendedNextAction =
        'Gyldig primary. Ugyldige sekundærrefs ligner sterkt på eksisterende steder – vurder manuell rename i mapping-batch.';
    } else {
      classification = 'has_valid_primary_but_invalid_secondary_refs';
      recommendedNextAction = anyMissing
        ? 'Gyldig primary, men sekundærrefs peker trolig på manglende steder. Beslutt place-data eller fjern refs manuelt.'
        : 'Gyldig primary med ugyldige sekundærrefs som krever manuell vurdering.';
    }
  } else {
    classification = 'needs_manual_review';
    recommendedNextAction = 'Kan ikke klassifiseres trygt automatisk. Krever manuell gjennomgang.';
  }

  return {
    personId,
    name,
    sourceFile: legacySourceFile,
    hasPlaceId,
    placeId: rawPlaceId || null,
    placeIdStatus,
    places: placeRefs,
    validPlaces: validRefs,
    invalidPlaces: invalidRefs,
    duplicatePlaces: duplicateRefs,
    emptyPlaceRefs: emptyRefCount,
    hasAtLeastOneValidPlace,
    missingAllValidPlace,
    isStub,
    hasLegacyOrDivergentSchema,
    divergentFields,
    missingSchemaFields,
    invalidRefAnalysis,
    classification,
    recommendedNextAction,
  };
}

// Les KUN gjenværende personer i legacy-filen.
const legacyPeople = toArray(readJson(legacyFilePath));
const analyzed = legacyPeople.map(analyzePerson);
const analyzedById = new Map(analyzed.map((p) => [p.personId, p]));

const foundIds = analyzed.map((p) => p.personId);
const expectedFound = EXPECTED_LEGACY_PEOPLE.filter((id) => analyzedById.has(id));
const expectedMissing = EXPECTED_LEGACY_PEOPLE.filter((id) => !analyzedById.has(id));
const unexpectedRemaining = foundIds.filter((id) => !EXPECTED_LEGACY_PEOPLE.includes(id));

// Unike ugyldige placeRefs på tvers av personer.
const invalidRefMap = new Map();
for (const person of analyzed) {
  for (const entry of person.invalidRefAnalysis) {
    if (!invalidRefMap.has(entry.placeRef)) {
      invalidRefMap.set(entry.placeRef, {
        placeRef: entry.placeRef,
        refClassification: entry.refClassification,
        suggestions: entry.suggestions,
        usedBy: [],
      });
    }
    invalidRefMap.get(entry.placeRef).usedBy.push(person.personId);
  }
}
const uniqueInvalidRefs = [...invalidRefMap.values()]
  .map((r) => ({
    placeRef: r.placeRef,
    occurrences: r.usedBy.length,
    usedBy: [...r.usedBy].sort((a, b) => a.localeCompare(b, 'nb')),
    refClassification: r.refClassification,
    suggestions: r.suggestions,
    inPlacesIndex: placesIndexIds ? placesIndexIds.has(r.placeRef) : null,
  }))
  .sort((a, b) => a.placeRef.localeCompare(b.placeRef, 'nb'));

const totalInvalidRefOccurrences = analyzed.reduce((n, p) => n + p.invalidPlaces.length, 0);
const peopleWithValidPrimary = analyzed.filter((p) => p.placeIdStatus === 'valid');
const peopleWithoutValidPlace = analyzed.filter((p) => p.missingAllValidPlace);
const stubs = analyzed.filter((p) => p.isStub || p.classification === 'stub_needs_manual_completion');
const countMissingCandidate = uniqueInvalidRefs.filter((r) => r.refClassification === 'missing_place_candidate').length;
const countLikelyRename = uniqueInvalidRefs.filter((r) => r.refClassification === 'likely_rename_to_existing_place').length;
const countRefNeedsReview = uniqueInvalidRefs.filter((r) => r.refClassification === 'needs_manual_review').length;

// Batchforslag (foreslår, endrer ikke data).
const batchA = analyzed
  .filter((p) =>
    p.classification === 'ready_for_manual_mapping' ||
    p.classification === 'has_valid_primary_but_invalid_secondary_refs')
  .map((p) => p.personId);
const batchB = uniqueInvalidRefs
  .filter((r) => r.refClassification === 'missing_place_candidate')
  .map((r) => r.placeRef);
const batchC = analyzed
  .filter((p) =>
    p.classification === 'stub_needs_manual_completion' ||
    p.classification === 'missing_place_data_required' ||
    p.classification === 'needs_manual_review')
  .map((p) => p.personId);

const report = {
  generatedAt: new Date().toISOString(),
  input: {
    placesManifest: 'data/places/manifest.json',
    peopleManifest: 'data/people/manifest.json',
    legacyFile: legacySourceFile,
    placesManifestIsSourceOfTruth: true,
    peopleJsonUsed: false,
    placesIndexUsedAsSourceOfTruth: false,
    placesIndexUsedForRuntimeComparison: placesIndexIds !== null,
    legacyFileStillInPeopleManifest: manifestListsLegacy,
    activePlaceIdCount: placeIds.size,
  },
  expectedLegacyPeople: EXPECTED_LEGACY_PEOPLE,
  expected_legacy_people_missing: expectedMissing,
  unexpected_remaining_legacy_people: unexpectedRemaining,
  summary: {
    legacyPeopleRead: analyzed.length,
    expectedLegacyPeopleFound: expectedFound.length,
    unexpectedLegacyPeople: unexpectedRemaining.length,
    peopleWithValidPrimaryPlaceId: peopleWithValidPrimary.length,
    peopleWithoutValidPlace: peopleWithoutValidPlace.length,
    stubs: stubs.length,
    invalidPlaceRefOccurrences: totalInvalidRefOccurrences,
    uniqueInvalidPlaceRefs: uniqueInvalidRefs.length,
    missingPlaceCandidate: countMissingCandidate,
    likelyRenameToExistingPlace: countLikelyRename,
    refNeedsManualReview: countRefNeedsReview,
    classificationCounts: analyzed.reduce((acc, p) => {
      acc[p.classification] = (acc[p.classification] || 0) + 1;
      return acc;
    }, {}),
  },
  people: analyzed,
  invalidRefsGroupedByPerson: analyzed
    .filter((p) => p.invalidPlaces.length > 0)
    .map((p) => ({
      personId: p.personId,
      name: p.name,
      classification: p.classification,
      invalidPlaces: p.invalidPlaces,
      invalidRefAnalysis: p.invalidRefAnalysis,
    })),
  uniqueInvalidPlaceRefs: uniqueInvalidRefs,
  peopleWithoutValidPlace: peopleWithoutValidPlace.map((p) => ({
    personId: p.personId,
    name: p.name,
    placeIdStatus: p.placeIdStatus,
    classification: p.classification,
  })),
  stubsAndDivergentSchema: analyzed
    .filter((p) => p.isStub || p.hasLegacyOrDivergentSchema)
    .map((p) => ({
      personId: p.personId,
      name: p.name,
      isStub: p.isStub,
      divergentFields: p.divergentFields,
      missingSchemaFields: p.missingSchemaFields,
      classification: p.classification,
    })),
  recommendedNextCleanupBatches: {
    batchA: {
      description:
        'Trygge personer med gyldig primary placeId. Ugyldige sekundærrefs kan fjernes eller mappes etter manuell beslutning.',
      people: batchA,
    },
    batchB: {
      description:
        'missing_place_candidate placeRefs som bør få egne places (egen place-beslutning) før people kan ryddes.',
      placeRefs: batchB,
    },
    batchC: {
      description:
        'Stubber / personer uten gyldig sted som må kurateres manuelt i chat før implementering.',
      people: batchC,
    },
  },
};

fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

// ---- Markdown ----
const md = [];
md.push('# Litteratur legacy cleanup audit');
md.push('');
md.push(`Generert: ${report.generatedAt}`);
md.push('');
md.push(`Analysert kilde: \`${legacySourceFile}\` (kun gjenværende legacy-personer).`);
md.push(`Fasit for aktive placeId-er: \`data/places/manifest.json\` (${placeIds.size} aktive placeId-er).`);
md.push('`data/people.json` brukes ikke. `places_index.json` brukes ikke som fasit.');
md.push('');
md.push('Denne rapporten endrer ingen data – den klassifiserer kun gjenværende litteratur-legacy.');
md.push('');

md.push('## 1. Sammendrag');
md.push(`- Legacy-personer lest: **${report.summary.legacyPeopleRead}**`);
md.push(`- Forventede legacy-personer funnet: **${report.summary.expectedLegacyPeopleFound} / ${EXPECTED_LEGACY_PEOPLE.length}**`);
md.push(`- Uventede legacy-personer: **${report.summary.unexpectedLegacyPeople}**`);
md.push(`- Personer med gyldig primary placeId: **${report.summary.peopleWithValidPrimaryPlaceId}**`);
md.push(`- Personer uten gyldig sted: **${report.summary.peopleWithoutValidPlace}**`);
md.push(`- Stubber: **${report.summary.stubs}**`);
md.push(`- Ugyldige placeRefs (treff totalt): **${report.summary.invalidPlaceRefOccurrences}**`);
md.push(`- Unike ugyldige placeRefs: **${report.summary.uniqueInvalidPlaceRefs}**`);
md.push(`- missing_place_candidate: **${report.summary.missingPlaceCandidate}**`);
md.push(`- likely_rename_to_existing_place: **${report.summary.likelyRenameToExistingPlace}**`);
md.push(`- needs_manual_review (refs): **${report.summary.refNeedsManualReview}**`);
md.push('');
md.push('Klassifisering (personer):');
for (const [cls, n] of Object.entries(report.summary.classificationCounts).sort((a, b) => a[0].localeCompare(b[0]))) {
  md.push(`- ${cls}: **${n}**`);
}
if (expectedMissing.length) {
  md.push('');
  md.push('**expected_legacy_people_missing:**');
  for (const id of expectedMissing) md.push(`- ${id}`);
}
if (unexpectedRemaining.length) {
  md.push('');
  md.push('**unexpected_remaining_legacy_people:**');
  for (const id of unexpectedRemaining) md.push(`- ${id}`);
}
md.push('');

md.push('## 2. Gjenværende legacy-personer');
for (const p of report.people) {
  md.push(`### ${p.personId} — ${p.name}`);
  md.push(`- classification: **${p.classification}**`);
  md.push(`- placeId: \`${p.placeId ?? '(mangler)'}\` (status: ${p.placeIdStatus})`);
  md.push(`- valid places: ${p.validPlaces.length ? p.validPlaces.map((x) => `\`${x}\``).join(', ') : '(ingen)'}`);
  md.push(`- invalid places: ${p.invalidPlaces.length ? p.invalidPlaces.map((x) => `\`${x}\``).join(', ') : '(ingen)'}`);
  if (p.duplicatePlaces.length) {
    md.push(`- duplikate refs i person: ${p.duplicatePlaces.map((x) => `\`${x}\``).join(', ')}`);
  }
  if (p.emptyPlaceRefs) md.push(`- tomme placeRefs: ${p.emptyPlaceRefs}`);
  md.push(`- manglende schemafelt: ${p.missingSchemaFields.length ? p.missingSchemaFields.join(', ') : '(ingen)'}`);
  if (p.divergentFields.length) md.push(`- avvikende felt: ${p.divergentFields.join(', ')}`);
  md.push(`- stub: ${p.isStub ? 'true' : 'false'}`);
  md.push(`- anbefalt neste handling: ${p.recommendedNextAction}`);
  md.push('');
}

md.push('## 3. Ugyldige placeRefs gruppert per person');
if (!report.invalidRefsGroupedByPerson.length) {
  md.push('Ingen ugyldige placeRefs funnet.');
} else {
  for (const g of report.invalidRefsGroupedByPerson) {
    md.push(`- **${g.personId}** (${g.name}) — ${g.classification}`);
    for (const r of g.invalidRefAnalysis) {
      md.push(`  - \`${r.placeRef}\` → ${r.refClassification}`);
    }
  }
}
md.push('');

md.push('## 4. Unike ugyldige placeRefs');
if (!report.uniqueInvalidPlaceRefs.length) {
  md.push('Ingen ugyldige placeRefs.');
} else {
  for (const r of report.uniqueInvalidPlaceRefs) {
    md.push(`### \`${r.placeRef}\``);
    md.push(`- antall treff: ${r.occurrences}`);
    md.push(`- brukt av: ${r.usedBy.join(', ')}`);
    md.push(`- klassifisering: **${r.refClassification}**`);
    if (r.inPlacesIndex !== null) md.push(`- finnes i places_index.json (kun runtime-sammenligning): ${r.inPlacesIndex}`);
    if (!r.suggestions.length) {
      md.push('- kandidatforslag: missing_place_candidate (ingen god kandidat)');
    } else {
      md.push('- kandidatforslag:');
      for (const s of r.suggestions) md.push(`  - \`${s.placeId}\` (confidence: ${s.confidence})`);
    }
    md.push('');
  }
}

md.push('## 5. People uten gyldig sted');
if (!report.peopleWithoutValidPlace.length) {
  md.push('Ingen.');
} else {
  for (const p of report.peopleWithoutValidPlace) {
    md.push(`- **${p.personId}** (${p.name}) — placeId-status: ${p.placeIdStatus}, classification: ${p.classification}`);
  }
}
md.push('');

md.push('## 6. Stubber / avvikende schema');
if (!report.stubsAndDivergentSchema.length) {
  md.push('Ingen.');
} else {
  for (const p of report.stubsAndDivergentSchema) {
    md.push(`- **${p.personId}** (${p.name}) — stub: ${p.isStub}, classification: ${p.classification}`);
    if (p.divergentFields.length) md.push(`  - avvikende felt: ${p.divergentFields.join(', ')}`);
    if (p.missingSchemaFields.length) md.push(`  - manglende schemafelt: ${p.missingSchemaFields.join(', ')}`);
  }
}
md.push('');

md.push('## 7. Anbefalt neste ryddebatch');
md.push('Foreslår neste arbeid uten å utføre det. Ingen data endres av denne rapporten.');
md.push('');
md.push('### Batch A — trygge personer med gyldig primary placeId');
md.push(report.recommendedNextCleanupBatches.batchA.description);
if (report.recommendedNextCleanupBatches.batchA.people.length) {
  for (const id of report.recommendedNextCleanupBatches.batchA.people) md.push(`- ${id}`);
} else {
  md.push('- (ingen)');
}
md.push('');
md.push('### Batch B — missing place-data candidates');
md.push(report.recommendedNextCleanupBatches.batchB.description);
if (report.recommendedNextCleanupBatches.batchB.placeRefs.length) {
  for (const ref of report.recommendedNextCleanupBatches.batchB.placeRefs) md.push(`- \`${ref}\``);
} else {
  md.push('- (ingen)');
}
md.push('');
md.push('### Batch C — stubber / personer uten gyldig sted');
md.push(report.recommendedNextCleanupBatches.batchC.description);
if (report.recommendedNextCleanupBatches.batchC.people.length) {
  for (const id of report.recommendedNextCleanupBatches.batchC.people) md.push(`- ${id}`);
} else {
  md.push('- (ingen)');
}
md.push('');

fs.writeFileSync(reportMdPath, `${md.join('\n')}\n`, 'utf8');
console.log(`Wrote ${path.relative(root, reportJsonPath)} and ${path.relative(root, reportMdPath)}`);
console.log(
  `Legacy-personer: ${analyzed.length}, forventet funnet: ${expectedFound.length}/${EXPECTED_LEGACY_PEOPLE.length}, uventede: ${unexpectedRemaining.length}, unike ugyldige refs: ${uniqueInvalidRefs.length}`,
);
