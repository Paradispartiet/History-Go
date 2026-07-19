import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const VERIFIED_AT = '2026-07-20';
const AGGREGATE = 'data/places/by/oslo/places_by.json';
const INDEX = 'data/places/by/oslo/places_by_index.json';
const MANIFEST = 'data/places/by/oslo/places_by_manifest.json';
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-retro-audit-from-batch-6');
fs.mkdirSync(REPORT_DIR, { recursive: true });

const abs = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const writeJson = (rel, value) => fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`);
const sha256 = (rel) => crypto.createHash('sha256').update(fs.readFileSync(abs(rel))).digest('hex');

function findPlace(data, id, rel) {
  if (Array.isArray(data)) {
    const hits = data.filter((row) => row && row.id === id);
    if (hits.length !== 1) throw new Error(`${rel}: expected one ${id}, found ${hits.length}`);
    return hits[0];
  }
  if (data?.id === id) return data;
  throw new Error(`${rel}: missing ${id}`);
}

function currentCoordinate(place) {
  return {
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordType: place.coordType,
    coordNote: place.coordNote
  };
}

const streetCorrections = {
  torggata: {
    batch: 11,
    lat: 59.91535,
    lon: 10.75335,
    r: 180,
    coordType: 'street_midpoint',
    note: 'Dokumentert linjeanker for Torggata. Oslo byleksikon avgrenser gata fra Stortorvet til Ankertorget. History Go bruker et representativt midtpunkt mellom de eksisterende ruteankrene ved Youngstorget og Ankerbrua for den sentrale gate-/serveringsstrekningen; punktet er ikke et adressepunkt eller et påstått geometrisk sentrum for hele gateløpet.',
    sourceName: 'Oslo byleksikon – Torggata + dokumenterte ruteankre',
    sourceObjectId: 'oslobyleksikon:torggata',
    sourceUrl: 'https://oslobyleksikon.no/side/Torggata',
    anchors: [
      { id: 'torggata_sor_youngstorget', name: 'Torggata sør (Youngstorget)', type: 'route_point', lat: 59.9143, lon: 10.7513, r: 60 },
      { id: 'torggata_nord_ankerbrua', name: 'Torggata nord (Ankerbrua)', type: 'route_point', lat: 59.9164, lon: 10.7554, r: 60 }
    ]
  },
  storgata: {
    batch: 13,
    lat: 59.9154,
    lon: 10.7539,
    r: 230,
    coordType: 'street_midpoint',
    note: 'Dokumentert linjeanker for Storgata. Oslo byleksikon avgrenser gaten fra Dronningens gate ved Kirkeristen til Nybrua. History Go beholder hovedpunktet på den sentrale strekningen og eksisterende ruteankre ved Kirkeristen og Nybrua; punktet er ikke et adressepunkt.',
    sourceName: 'Oslo byleksikon – Storgata + dokumenterte ruteankre',
    sourceObjectId: 'oslobyleksikon:storgata',
    sourceUrl: 'https://oslobyleksikon.no/side/Storgata',
    anchors: [
      { id: 'storgata_sorvest_kirkeristen', name: 'Storgata sørvest (Kirkeristen)', type: 'route_point', lat: 59.914, lon: 10.7512, r: 70 },
      { id: 'storgata_nordost_nybrua', name: 'Storgata nordøst (Nybrua)', type: 'route_point', lat: 59.9166, lon: 10.7567, r: 70 }
    ]
  }
};

const sourceCorrections = {
  botsparken: {
    batch: 14,
    provider: 'municipality',
    name: 'Oslo kommune – Grønland park, del av Klosterenga',
    url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/gronland-park-del-av-klosterenga',
    objectId: 'oslo-kommune:park:gronland-park-klosterenga',
    quality: 'official_area_definition',
    finding: 'Oslo kommune dokumenterer Grønland park som del av Klosterenga og dermed den kommunale parkidentiteten som Botsparken-recorden representerer.',
    note: 'Representativt parkanker i Grønlands park/Botsparken, den vestlige delen av Klosterenga-systemet. Oslo kommune dokumenterer Grønland park som del av Klosterenga; punktet representerer parkrommet og ikke Botsfengselet eller Politihuset.'
  },
  carl_berner_plass: {
    batch: 16,
    provider: 'manual_research',
    name: 'Oslo byleksikon – Carl Berners plass',
    url: 'https://oslobyleksikon.no/side/Carl_Berners_plass',
    objectId: 'oslobyleksikon:carl-berners-plass',
    quality: 'documented_place_or_area_definition',
    finding: 'Oslo byleksikon dokumenterer Carl Berners plass som det navngitte trafikale plassrommet ved krysset Christian Michelsens gate, Tromsøgata, Trondheimsveien og Grenseveien.',
    note: 'Representativt områdeanker for selve Carl Berners plass som trafikalt plass- og fordelingsrom. Oslo byleksikon dokumenterer plassen ved krysset Christian Michelsens gate, Tromsøgata, Trondheimsveien og Grenseveien. Punktet brukes som area_anchor for plassrommet og holdes adskilt fra T-banestasjonen og holdeplasser med samme navn.'
  },
  okern: {
    batch: 16,
    provider: 'manual_research',
    name: 'Oslo byleksikon – Økern (strøk)',
    url: 'https://oslobyleksikon.no/side/%C3%98kern_%28str%C3%B8k%29',
    objectId: 'oslobyleksikon:okern-strok',
    quality: 'documented_place_or_area_definition',
    finding: 'Oslo byleksikon dokumenterer Økern som industri- og boligstrøk øst for Sinsen, øst for Ring 3 og med kommunikasjonssenteret ved Østre Aker vei og T-banen.',
    note: 'Representativt områdeanker for Økern som industri- og boligstrøk øst for Sinsen. Oslo byleksikon dokumenterer strøkets områdeidentitet og kommunikasjonssenter. Punktet er et semantic area anchor, ikke en enkelt adresse eller et påstått geometrisk sentrum for hele strøket.'
  },
  skoyen: {
    batch: 16,
    provider: 'manual_research',
    name: 'Oslo byleksikon – Skøyen (strøk)',
    url: 'https://oslobyleksikon.no/side/Sk%C3%B8yen_%28str%C3%B8k%29',
    objectId: 'oslobyleksikon:skoyen-strok',
    quality: 'documented_place_or_area_definition',
    finding: 'Oslo byleksikon dokumenterer Skøyen som bolig- og industristrøk innenfor eidet mellom Frognerkilen og Bestumkilen.',
    note: 'Representativt områdeanker for Skøyen som bolig- og industristrøk mellom Frognerkilen og Bestumkilen. Oslo byleksikon dokumenterer strøkets områdeidentitet; punktet er et semantic area anchor i det sentrale Skøyen-området, ikke stasjonen eller én adresse.'
  },
  torshov: {
    batch: 16,
    provider: 'manual_research',
    name: 'Oslo byleksikon – Torshov (strøk)',
    url: 'https://oslobyleksikon.no/side/Torshov_%28str%C3%B8k%29',
    objectId: 'oslobyleksikon:torshov-strok',
    quality: 'documented_place_or_area_definition',
    finding: 'Oslo byleksikon dokumenterer Torshov som sogn og boligstrøk nord for Grünerløkka med Torshovbyen, Torshovparken og Torshovdalen som sentrale deler.',
    note: 'Representativt områdeanker for Torshov som boligstrøk nord for Grünerløkka. Oslo byleksikon dokumenterer strøkets områdeidentitet rundt Torshovbyen, Torshovparken og Torshovdalen; punktet er et semantic area anchor, ikke én adresse eller et påstått geometrisk sentrum.'
  }
};

const aggregate = readJson(AGGREGATE);
const index = readJson(INDEX);
const touched = [];
const auditRows = [];

function updateFiles(id, mutatePlace, mutateEvidence) {
  const childRel = `data/places/by/oslo/places/${id}.json`;
  const evidenceRel = `data/coordinate-evidence/oslo/by/${id}.json`;
  const child = readJson(childRel);
  const a = findPlace(aggregate, id, AGGREGATE);
  const c = findPlace(child, id, childRel);
  const i = findPlace(index, id, INDEX);
  const before = { lat: c.lat, lon: c.lon, coordType: c.coordType, coordStatus: c.coordStatus, sourceProvider: c.sourceProvider, sourceObjectId: c.sourceObjectId };
  mutatePlace(a);
  mutatePlace(c);
  i.lat = c.lat;
  i.lon = c.lon;
  i.r = c.r;
  i.coordStatus = c.coordStatus;
  i.coordType = c.coordType;
  const evidence = readJson(evidenceRel);
  mutateEvidence(evidence, c);
  writeJson(childRel, child);
  writeJson(evidenceRel, evidence);
  touched.push({ id, rel: childRel });
  return before;
}

for (const [id, cfg] of Object.entries(streetCorrections)) {
  const before = updateFiles(id, (place) => {
    delete place.address;
    Object.assign(place, {
      lat: cfg.lat,
      lon: cfg.lon,
      r: cfg.r,
      coordType: cfg.coordType,
      coordStatus: 'verified_geometry',
      coordNote: cfg.note,
      anchors: cfg.anchors,
      locatorType: 'street',
      sourceProvider: 'manual_research',
      sourceObjectId: cfg.sourceObjectId,
      geocodeAccuracy: 'semantic_anchor',
      coordRole: 'line_anchor',
      coordSource: cfg.sourceName,
      coordSourceId: cfg.sourceObjectId,
      coordSourceUrl: cfg.sourceUrl,
      coordVerifiedAt: VERIFIED_AT
    });
  }, (evidence, place) => {
    evidence.currentCoordinate = currentCoordinate(place);
  });
  auditRows.push({ batch: cfg.batch, id, reason: 'Street record restored from incorrect single-address anchor to documented line representation.', before, after: { lat: cfg.lat, lon: cfg.lon, coordType: cfg.coordType, coordStatus: 'verified_geometry', sourceObjectId: cfg.sourceObjectId } });
}

for (const [id, cfg] of Object.entries(sourceCorrections)) {
  const before = updateFiles(id, (place) => {
    Object.assign(place, {
      sourceProvider: cfg.provider,
      sourceObjectId: cfg.objectId,
      coordSource: cfg.name,
      coordSourceId: cfg.objectId,
      coordSourceUrl: cfg.url,
      coordVerifiedAt: VERIFIED_AT,
      coordNote: cfg.note,
      coordStatus: 'verified_geometry',
      geocodeAccuracy: 'semantic_anchor',
      coordRole: 'area_anchor'
    });
  }, (evidence, place) => {
    evidence.currentCoordinate = currentCoordinate(place);
    evidence.evidenceStatus = 'applied_to_place';
    evidence.coordinateDecision = 'do_not_change_coordinates_yet';
    evidence.evidence = [{ sourceProvider: cfg.provider, sourceName: cfg.name, sourceUrl: cfg.url, sourceObjectId: cfg.objectId, sourceQuality: cfg.quality, finding: cfg.finding, canVerifyCoordinate: true, reason: cfg.note }];
    evidence.addressCandidates = [];
    evidence.sourceObjectCandidates = [{ sourceProvider: cfg.provider, sourceObjectId: cfg.objectId, canApplyToPlace: true }];
    evidence.geometryCandidates = [];
    evidence.coordinateCandidates = [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }];
    evidence.decision = { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt og representasjonsanker er anvendt på canonical place.' };
    evidence.notes = [cfg.note];
  });
  auditRows.push({ batch: cfg.batch, id, reason: 'Primary verification source replaced with a source that follows current source-priority rules.', before, after: { coordStatus: 'verified_geometry', sourceProvider: cfg.provider, sourceObjectId: cfg.objectId } });
}

writeJson(AGGREGATE, aggregate);
writeJson(INDEX, index);
const manifest = readJson(MANIFEST);
manifest.source_sha256 = sha256(AGGREGATE);
manifest.generated_at = new Date().toISOString();
for (const child of touched) {
  const row = (manifest.places || []).find((item) => item.id === child.id);
  if (!row) throw new Error(`${MANIFEST}: missing row for ${child.id}`);
  row.sha256 = sha256(child.rel);
}
writeJson(MANIFEST, manifest);

const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(abs(protocolRel), 'utf8');
const protocolPairs = [
  ['| 11 | `torggata` | Torggata | verified | `geonorge-adresser-v1:0301:17635:14` |', '| 11 | `torggata` | Torggata | verified_geometry | `oslobyleksikon:torggata` |'],
  ['| 13 | `storgata` | Storgata | verified | `geonorge-adresser-v1:0301:17059:25` |', '| 13 | `storgata` | Storgata | verified_geometry | `oslobyleksikon:storgata` |'],
  ['| 14 | `botsparken` | Botsparken | verified_geometry | `lokalhistoriewiki:gronlands-park` |', '| 14 | `botsparken` | Botsparken | verified_geometry | `oslo-kommune:park:gronland-park-klosterenga` |'],
  ['| 16 | `carl_berner_plass` | Carl Berners plass | verified_geometry | `wikidata:Q5039902` |', '| 16 | `carl_berner_plass` | Carl Berners plass | verified_geometry | `oslobyleksikon:carl-berners-plass` |'],
  ['| 16 | `okern` | Økern | verified_geometry | `wikidata:Q12011791` |', '| 16 | `okern` | Økern | verified_geometry | `oslobyleksikon:okern-strok` |'],
  ['| 16 | `skoyen` | Skøyen | verified_geometry | `wikidata:Q6514682` |', '| 16 | `skoyen` | Skøyen | verified_geometry | `oslobyleksikon:skoyen-strok` |'],
  ['| 16 | `torshov` | Torshov | verified_geometry | `wikidata:Q7827191` |', '| 16 | `torshov` | Torshov | verified_geometry | `oslobyleksikon:torshov-strok` |']
];
for (const [oldRow, newRow] of protocolPairs) {
  if (protocol.includes(oldRow)) protocol = protocol.replace(oldRow, newRow);
  else if (!protocol.includes(newRow)) throw new Error(`Protocol contains neither expected row: ${oldRow}`);
}
const note = 'Retrokontroll fra batch 6 (2026-07-20), pass 2: `torggata` og `storgata` er tilbakeført fra feilaktige enkeltadresseankre til dokumenterte lineære gateankre med ruteankre. `botsparken` bruker nå kommunal parkdefinisjon. De fire batch-16-recordene `carl_berner_plass`, `okern`, `skoyen` og `torshov` har fått dokumenterte steds-/områdefinisjoner fra Oslo byleksikon i stedet for Wikidata som primær verifikasjonskilde.';
if (!protocol.includes(note)) protocol = protocol.replace('### Dokumenterte Oslo-kontroller uten godkjent koordinat', `${note}\n\n### Dokumenterte Oslo-kontroller uten godkjent koordinat`);
fs.writeFileSync(abs(protocolRel), protocol);

writeJson('reports/oslo-coordinate-retro-audit-from-batch-6/pass-2-batches-11-16.json', { date: VERIFIED_AT, corrections: auditRows, nextResearchPass: ['henrik_wergeland_statue', 'telegrafbygningen', 'ovre_foss'] });
const readmeRel = 'reports/oslo-coordinate-retro-audit-from-batch-6/README.md';
let readme = fs.existsSync(abs(readmeRel)) ? fs.readFileSync(abs(readmeRel), 'utf8') : '# Oslo coordinate retro-audit from batch 6\n';
const section = '\n## Pass 2 — deterministic corrections through batch 16\n\n- Batch 11: `torggata` restored to documented street/line representation.\n- Batch 13: `storgata` restored to documented street/line representation.\n- Batch 14: `botsparken` now uses Oslo kommune as the primary park-definition source.\n- Batch 16: `carl_berner_plass`, `okern`, `skoyen` and `torshov` no longer use Wikidata as the primary verification source.\n\nRemaining research corrections: `henrik_wergeland_statue`, `telegrafbygningen`, `ovre_foss`.\n';
if (!readme.includes('## Pass 2 — deterministic corrections through batch 16')) readme += section;
fs.writeFileSync(abs(readmeRel), readme);

console.log(JSON.stringify({ ok: true, corrected: auditRows.map((row) => row.id), nextResearchPass: ['henrik_wergeland_statue', 'telegrafbygningen', 'ovre_foss'] }, null, 2));
