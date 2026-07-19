import fs from 'node:fs';

const aggregatePath = 'data/places/natur/oslo/places_oslo_alna.json';
const evidenceRoot = 'data/coordinate-evidence/oslo/natur';

const places = JSON.parse(fs.readFileSync(aggregatePath, 'utf8'));
const byId = new Map(places.map((place) => [place.id, place]));

const locatorFixes = {
  alnaelva: 'route',
  alnaelvstien: 'route',
  loelva_historisk: 'historic_site',
  trosterud_friomrade: 'natural_area',
  furuset_haugerud_skogbelte: 'natural_area',
  hellerud_gard: 'historic_site',
  alnabru_jernbane_og_logistikk: 'linear_area',
};

for (const [id, locatorType] of Object.entries(locatorFixes)) {
  const place = byId.get(id);
  if (!place) throw new Error(`Missing place ${id}`);
  place.locatorType = locatorType;
}

fs.writeFileSync(aggregatePath, `${JSON.stringify(places, null, 2)}\n`);

const evidenceFixes = {
  alnaelva: { decision: 'needs_geometry', locatorType: 'route' },
  alnaelvstien: { decision: 'needs_geometry', locatorType: 'route' },
  loelva_historisk: { decision: 'needs_identity_split', locatorType: 'historic_site' },
  trosterud_friomrade: { decision: 'needs_geometry', locatorType: 'natural_area' },
  furuset_haugerud_skogbelte: { decision: 'needs_geometry', locatorType: 'natural_area' },
  hellerud_gard: { decision: 'needs_identity_split', locatorType: 'historic_site' },
  alnabru_jernbane_og_logistikk: { decision: 'do_not_change_coordinates_yet', locatorType: 'linear_area' },
};

for (const [id, fix] of Object.entries(evidenceFixes)) {
  const file = `${evidenceRoot}/${id}.json`;
  const evidence = JSON.parse(fs.readFileSync(file, 'utf8'));
  evidence.coordinateDecision = fix.decision;
  if (evidence.identity) evidence.identity.locatorTypeCandidate = fix.locatorType;
  fs.writeFileSync(file, `${JSON.stringify(evidence, null, 2)}\n`);
}

console.log('Batch 31 coordinate contract locator/evidence normalization applied.');
