import fs from 'node:fs';
import path from 'node:path';

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};

const classificationPath = 'reports/visitoslo-galleries-audit-20260723/full-scope-classification/final-classification.json';
const classification = readJson(classificationPath);

const produced = [
  'edvard_munchs_atelier_ekely',
  'tegnerforbundet',
  'unge_kunstneres_samfund',
  'norske_grafikere',
  'the_mini_bottle_gallery',
  'galleri_lnm',
  'ram_galleri',
  'galleri_schaeffers_gate_5',
  'grafill'
];
const blocked = ['rom_for_kunst_og_arkitektur', 'soft_galleri'];

for (const item of classification.newCanonicalCandidates) {
  if (produced.includes(item.proposedPlaceId)) item.productionStatus = 'production_merged';
  if (item.proposedPlaceId === 'rom_for_kunst_og_arkitektur') {
    item.productionStatus = 'approved_scope_coordinate_blocked';
    item.coordinateBlocker = 'The ordinary Maridalsveien 3 address point exactly overlaps xray_ungdomskulturhus. ROM documents building O and its entrance area, but the 2026-07-24 OSM/Kartverket fallback pass did not produce one stable source object that uniquely resolves the ROM entrance or building O without inference.';
  }
}

const soft = classification.coordinateOnlyBacklog.find((item) => item.placeId === 'soft_galleri');
if (soft) {
  soft.status = 'approved_scope_coordinate_blocked_researched';
  soft.basis = 'The ordinary Rådhusgata 20 address point exactly overlaps fotografiens_hus. SOFT documents a corner entrance, but the 2026-07-24 OSM/Kartverket fallback pass found no entrance object on the containing building that can be uniquely tied to SOFT without guessing.';
}

classification.status = 'full_gallery_scope_classified_and_production_audited';
classification.productionClosure = {
  date: '2026-07-24',
  sourceItemsClassified: 66,
  newCanonicalCandidatesApproved: 10,
  newCanonicalProductionMerged: 9,
  parentReuseEnrichmentsCompleted: 4,
  approvedCoordinateBlockersRemaining: 2,
  unresolvedScopeDecisions: 0,
  producedPlaceIds: produced,
  coordinateBlockedPlaceIds: blocked,
  blockerResearch: 'reports/visitoslo-galleries-audit-20260723/distinct-anchor-research/anchor-research.json',
  policy: 'Do not invent offsets or choose an unnamed nearby entrance by proximity. ROM and SOFT remain approved scope items but are withheld from canonical production until a distinct authoritative entrance/building object is available.'
};
classification.nextWork.coordinateAndIdentityAuditQueue = [];
classification.nextWork.coordinateOnlyBacklog = blocked;
classification.nextWork.productionComplete = produced;
classification.nextWork.coordinateBlockerResearch = 'reports/visitoslo-galleries-audit-20260723/distinct-anchor-research/anchor-research.json';

writeJson(classificationPath, classification);

const closure = {
  version: '2026-07-24',
  status: 'visit_oslo_galleries_production_pass_closed',
  scope: {
    sourceCount: 66,
    classified: 66,
    unresolvedClassification: 0
  },
  production: {
    mergedNewCanonicalCount: 9,
    mergedNewCanonicalPlaceIds: produced,
    completedParentEnrichmentCount: 4,
    completedParentReuse: [
      'Oslo Kunstforening -> radmannsgarden_og_anatomibygget',
      'BO Billedkunstnerne i Oslo -> radmannsgarden_og_anatomibygget',
      'Oslo Glass Studio -> kirkeristen_basarene_brannvakten',
      'Atelier Nord -> hauges_minde'
    ]
  },
  remainingApprovedCoordinateBacklog: [
    {
      placeId: 'rom_for_kunst_og_arkitektur',
      sourceItem: 'Galleri ROM for kunst og arkitektur',
      conflict: 'Official Maridalsveien 3 address point exactly overlaps xray_ungdomskulturhus.',
      institutionPhysicalEvidence: [
        'ROM identifies its location as Maridalsveien 3, building O.',
        'ROM identifies the entrance area at the Maridalsveien/Brenneriveien meeting point and a route through the property entrance.',
        'ROM separately describes the square outside its main entrance where Brenneriveien and Maridalsveien meet.'
      ],
      machineFallbackResult: 'No named ROM POI and no uniquely attributable entrance/building O object was resolved. A first-pass false positive caused by matching “rom” inside “klasserom” was explicitly rejected.',
      decision: 'Remain coordinate-blocked; no synthetic offset and no proximity-only entrance selection.'
    },
    {
      placeId: 'soft_galleri',
      sourceItem: 'Soft galleri: Norske tekstilkunstnere',
      conflict: 'Official Rådhusgata 20 address point exactly overlaps fotografiens_hus.',
      institutionPhysicalEvidence: [
        'SOFT identifies its entrance as the corner entrance at Rådhusgata 20.',
        'SOFT identifies the large gallery window as facing northeast toward Rådhusgata.'
      ],
      machineFallbackResult: 'OSM resolved the containing building as osm:way/112191362, but no entrance node on that building uniquely identifies SOFT. The only nearby mapped main entrance returned by the pass is not a member of the containing building.',
      decision: 'Remain coordinate-blocked; do not convert a building-polygon corner or nearby entrance into a canonical coordinate by inference.'
    }
  ],
  researchFiles: [
    'reports/visitoslo-galleries-audit-20260723/distinct-anchor-research/anchor-research.json',
    'reports/visitoslo-galleries-audit-20260723/distinct-anchor-research/refined-anchor-analysis.json'
  ],
  finalRule: 'The VisitOSLO Galleries scope is fully decided. Production is complete for every approved candidate that currently has a defensible distinct coordinate anchor. The two remaining approved items are deliberately withheld until authoritative distinct anchors exist.'
};

writeJson('reports/visitoslo-galleries-audit-20260723/final-production-closure/closure.json', closure);
fs.mkdirSync('reports/visitoslo-galleries-audit-20260723/final-production-closure', { recursive: true });
fs.writeFileSync('reports/visitoslo-galleries-audit-20260723/final-production-closure/README.md', `# VisitOSLO Galleries — final production closure\n\nDate: 2026-07-24\n\nThe full 66-item source scope is classified with zero unresolved scope decisions. Nine of the ten newly approved canonical candidates have been produced and merged. All four parent-reuse cases are enriched.\n\nTwo approved places remain intentionally coordinate-blocked:\n\n- \`rom_for_kunst_og_arkitektur\` — Maridalsveien 3 address point collides with \`xray_ungdomskulturhus\`; official sources distinguish building O and the entrance area, but the current machine-readable fallback sources do not uniquely identify a stable entrance/building-O object.\n- \`soft_galleri\` — Rådhusgata 20 address point collides with \`fotografiens_hus\`; SOFT documents a corner entrance, but OSM currently has no entrance node on the containing building that uniquely resolves SOFT.\n\nNo synthetic offsets were created and no nearest unnamed entrance was promoted by proximity. These two records should be revisited only when a distinct authoritative source object becomes available.\n`);

console.log(JSON.stringify({
  status: closure.status,
  mergedNewCanonicalCount: produced.length,
  coordinateBlockedPlaceIds: blocked,
  classificationNextWork: classification.nextWork
}, null, 2));
