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

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, value) { fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`); }
function sha256(rel) { return crypto.createHash('sha256').update(fs.readFileSync(abs(rel))).digest('hex'); }
function findPlace(data, id, rel) {
  if (Array.isArray(data)) {
    const matches = data.filter((row) => row && row.id === id);
    if (matches.length !== 1) throw new Error(`${rel}: expected exactly one ${id}, found ${matches.length}`);
    return matches[0];
  }
  if (data && typeof data === 'object' && data.id === id) return data;
  throw new Error(`${rel}: place ${id} not found`);
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

const corrections = [
  {
    id: 'torggata',
    batch: 11,
    reason: 'Street record was incorrectly converted to a single Geonorge house-number point in PR #2486.',
    fields: {
      lat: 59.91535,
      lon: 10.75335,
      r: 180,
      coordType: 'street_midpoint',
      coordStatus: 'verified_geometry',
      coordNote: 'Dokumentert linjeanker for Torggata. Oslo byleksikon avgrenser gata fra Stortorvet til Ankertorget. History Go bruker et representativt midtpunkt mellom de eksisterende ruteankrene ved Youngstorget og Ankerbrua for den sentrale gate-/serveringsstrekningen; punktet er ikke et adressepunkt eller et påstått geometrisk sentrum for hele gateløpet.',
      anchors: [
        { id: 'torggata_sor_youngstorget', name: 'Torggata sør (Youngstorget)', type: 'route_point', lat: 59.9143, lon: 10.7513, r: 60 },
        { id: 'torggata_nord_ankerbrua', name: 'Torggata nord (Ankerbrua)', type: 'route_point', lat: 59.9164, lon: 10.7554, r: 60 }
      ],
      locatorType: 'street',
      sourceProvider: 'manual_research',
      sourceObjectId: 'oslobyleksikon:torggata',
      geocodeAccuracy: 'semantic_anchor',
      coordRole: 'line_anchor',
      coordSource: 'Oslo byleksikon – Torggata + dokumenterte ruteankre',
      coordSourceId: 'oslobyleksikon:torggata',
      coordSourceUrl: 'https://oslobyleksikon.no/side/Torggata',
      coordVerifiedAt: VERIFIED_AT
    },
    deleteFields: ['address']
  },
  {
    id: 'storgata',
    batch: 13,
    reason: 'Street record was incorrectly converted to a single Geonorge house-number point in PR #2486.',
    fields: {
      lat: 59.9154,
      lon: 10.7539,
      r: 230,
      coordType: 'street_midpoint',
      coordStatus: 'verified_geometry',
      coordNote: 'Dokumentert linjeanker for Storgata. Oslo byleksikon avgrenser gaten fra Dronningens gate ved Kirkeristen til Nybrua. History Go beholder hovedpunktet på den sentrale strekningen og eksisterende ruteankre ved Kirkeristen og Nybrua; punktet er ikke et adressepunkt.',
      anchors: [
        { id: 'storgata_sorvest_kirkeristen', name: 'Storgata sørvest (Kirkeristen)', type: 'route_point', lat: 59.914, lon: 10.7512, r: 70 },
        { id: 'storgata_nordost_nybrua', name: 'Storgata nordøst (Nybrua)', type: 'route_point', lat: 59.9166, lon: 10.7567, r: 70 }
      ],
      locatorType: 'street',
      sourceProvider: 'manual_research',
      sourceObjectId: 'oslobyleksikon:storgata',
      geocodeAccuracy: 'semantic_anchor',
      coordRole: 'line_anchor',
      coordSource: 'Oslo byleksikon – Storgata + dokumenterte ruteankre',
      coordSourceId: 'oslobyleksikon:storgata',
      coordSourceUrl: 'https://oslobyleksikon.no/side/Storgata',
      coordVerifiedAt: VERIFIED_AT
    },
    deleteFields: ['address']
  },
  {
    id: 'botsparken',
    batch: 14,
    reason: 'An official municipal park definition is available and has higher source priority than the prior Lokalhistoriewiki source.',
    source: {
      provider: 'municipality',
      name: 'Oslo kommune – Grønland park, del av Klosterenga',
      url: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/gronland-park-del-av-klosterenga',
      objectId: 'oslo-kommune:park:gronland-park-klosterenga',
      quality: 'official_area_definition',
      finding: 'Oslo kommune dokumenterer Grønland park som del av Klosterenga og dermed den kommunale parkidentiteten som Botsparken-recorden representerer.',
      note: 'Representativt parkanker i Grønlands park/Botsparken, den vestlige delen av Klosterenga-systemet. Oslo kommune dokumenterer Grønland park som del av Klosterenga; punktet representerer parkrommet og ikke Botsfengselet eller Politihuset.'
    }
  },
  {
    id: 'carl_berner_plass',
    batch: 16,
    reason: 'Wikidata cannot remain the primary source for verified geometry.',
    source: {
      provider: 'manual_research',
      name: 'Oslo byleksikon – Carl Berners plass',
      url: 'https://oslobyleksikon.no/side/Carl_Berners_plass',
      objectId: 'oslobyleksikon:carl-berners-plass',
      quality: 'documented_place_or_area_definition',
      finding: 'Oslo byleksikon dokumenterer Carl Berners plass som det navngitte trafikale plassrommet ved krysset Christian Michelsens gate, Tromsøgata, Trondheimsveien og Grenseveien.',
      note: 'Representativt områdeanker for selve Carl Berners plass som trafikalt plass- og fordelingsrom. Oslo byleksikon dokumenterer plassen ved krysset Christian Michelsens gate, Tromsøgata, Trondheimsveien og Grenseveien. Punktet brukes som area_anchor for plassrommet og holdes adskilt fra T-banestasjonen og holdeplasser med samme navn.'
    }
  },
  {
    id: 'okern',
    batch: 16,
    reason: 'Wikidata cannot remain the primary source for verified geometry.',
    source: {
      provider: 'manual_research',
      name: 'Oslo byleksikon – Økern (strøk)',
      url: 'https://oslobyleksikon.no/side/%C3%98kern_%28str%C3%B8k%29',
      objectId: 'oslobyleksikon:okern-strok',
      quality: 'documented_place_or_area_definition',
      finding: 'Oslo byleksikon dokumenterer Økern som industri- og boligstrøk øst for Sinsen, øst for Ring 3 og med kommunikasjonssenteret ved Østre Aker vei og T-banen.',
      note: 'Representativt områdeanker for Økern som industri- og boligstrøk øst for Sinsen. Oslo byleksikon dokumenterer strøkets områdeidentitet og kommunikasjonssenter. Punktet er et semantic area anchor, ikke en enkelt adresse eller et påstått geometrisk sentrum for hele strøket.'
    }
  },
  {
    id: 'skoyen',
    batch: 16,
    reason: 'Wikidata cannot remain the primary source for verified geometry.',
    source: {
      provider: 'manual_research',
      name: 'Oslo byleksikon – Skøyen (strøk)',
      url: 'https://oslobyleksikon.no/side/Sk%C3%B8yen_%28str%C3%B8k%29',
      objectId: 'oslobyleksikon:skoyen-strok',
      quality: 'documented_place_or_area_definition',
      finding: 'Oslo byleksikon dokumenterer Skøyen som bolig- og industristrøk innenfor eidet mellom Frognerkilen og Bestumkilen.',
      note: 'Representativt områdeanker for Skøyen som bolig- og industristrøk mellom Frognerkilen og Bestumkilen. Oslo byleksikon dokumenterer strøkets områdeidentitet; punktet er et semantic area anchor i det sentrale Skøyen-området, ikke stasjonen eller én adresse.'
    }
  },
  {
    id: 'torshov',
    batch: 16,
    reason: 'Wikidata cannot remain the primary source for verified geometry.',
    source: {
      provider: 'manual_research',
      name: 'Oslo byleksikon – Torshov (strøk)',
      url: 'https://oslobyleksikon.no/side/Torshov_%28str%C3%B8k%29',
      objectId: 'oslobyleksikon:torshov-strok',
      quality: 'documented_place_or_area_definition',
      finding: 'Oslo byleksikon dokumenterer Torshov som sogn og boligstrøk nord for Grünerløkka med Torshovbyen, Torshovparken og Torshovdalen som sentrale deler.',
      note: 'Representativt områdeanker for Torshov som boligstrøk nord for Grünerløkka. Oslo byleksikon dokumenterer strøkets områdeidentitet rundt Torshovbyen, Torshovparken og Torshovdalen; punktet er et semantic area anchor, ikke én adresse eller et påstått geometrisk sentrum.'
    }
  }
];

const aggregate = readJson(AGGREGATE);
const index = readJson(INDEX);
const touchedChildren = [];
const auditRows = [];

for (const correction of corrections) {
  const childRel = `data/places/by/oslo/places/${correction.id}.json`;
  const evidenceRel = `data/coordinate-evidence/oslo/by/${correction.id}.json`;
  const child = readJson(childRel);
  const aggregatePlace = findPlace(aggregate, correction.id, AGGREGATE);
  const childPlace = findPlace(child, correction.id, childRel);
  const indexPlace = findPlace(index, correction.id, INDEX);
  const before = {
    lat: childPlace.lat,
    lon: childPlace.lon,
    coordType: childPlace.coordType,
    coordStatus: childPlace.coordStatus,
    sourceProvider: childPlace.sourceProvider,
    sourceObjectId: childPlace.sourceObjectId
  };

  for (const place of [aggregatePlace, childPlace]) {
    if (correction.deleteFields) for (const field of correction.deleteFields) delete place[field];
    if (correction.fields) Object.assign(place, correction.fields);
    if (correction.source) {
      place.sourceProvider = correction.source.provider;
      place.sourceObjectId = correction.source.objectId;
      place.coordSource = correction.source.name;
      place.coordSourceId = correction.source.objectId;
      place.coordSourceUrl = correction.source.url;
      place.coordVerifiedAt = VERIFIED_AT;
      place.coordNote = correction.source.note;
      place.coordStatus = 'verified_geometry';
      place.geocodeAccuracy = 'semantic_anchor';
      place.coordRole = 'area_anchor';
    }
  }

  indexPlace.lat = childPlace.lat;
  indexPlace.lon = childPlace.lon;
  indexPlace.r = childPlace.r;
  indexPlace.coordStatus = childPlace.coordStatus;
  indexPlace.coordType = childPlace.coordType;

  const evidence = readJson(evidenceRel);
  evidence.currentCoordinate = currentCoordinate(childPlace);
  if (correction.source) {
    evidence.evidenceStatus = 'applied_to_place';
    evidence.coordinateDecision = 'do_not_change_coordinates_yet';
    evidence.evidence = [{
      sourceProvider: correction.source.provider,
      sourceName: correction.source.name,
      sourceUrl: correction.source.url,
      sourceObjectId: correction.source.objectId,
      sourceQuality: correction.source.quality,
      finding: correction.source.finding,
      canVerifyCoordinate: true,
      reason: correction.source.note
    }];
    evidence.addressCandidates = [];
    evidence.sourceObjectCandidates = [{
      sourceProvider: correction.source.provider,
      sourceObjectId: correction.source.objectId,
      canApplyToPlace: true
    }];
    evidence.geometryCandidates = [];
    evidence.coordinateCandidates = [{
      lat: childPlace.lat,
      lon: childPlace.lon,
      coordRole: childPlace.coordRole,
      canApplyToPlace: true
    }];
    evidence.decision = {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Kildekontrakt og representasjonsanker er anvendt på canonical place.'
    };
    evidence.notes = [correction.source.note];
  }
  writeJson(evidenceRel, evidence);
  writeJson(childRel, child);
  touchedChildren.push({ id: correction.id, rel: childRel });
  auditRows.push({
    batch: correction.batch,
    id: correction.id,
    reason: correction.reason,
    before,
    after: {
      lat: childPlace.lat,
      lon: childPlace.lon,
      coordType: childPlace.coordType,
      coordStatus: childPlace.coordStatus,
      sourceProvider: childPlace.sourceProvider,
      sourceObjectId: childPlace.sourceObjectId
    }
  });
}

writeJson(AGGREGATE, aggregate);
writeJson(INDEX, index);

const manifest = readJson(MANIFEST);
manifest.source_sha256 = sha256(AGGREGATE);
manifest.generated_at = new Date().toISOString();
for (const child of touchedChildren) {
  const row = (manifest.places || []).find((item) => item.id === child.id);
  if (!row) throw new Error(`${MANIFEST}: missing manifest row for ${child.id}`);
  row.sha256 = sha256(child.rel);
}
writeJson(MANIFEST, manifest);

const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(abs(protocolRel), 'utf8');
const replacements = [
  ['| 11 | `torggata` | Torggata | verified | `geonorge-adresser-v1:0301:17635:14` |', '| 11 | `torggata` | Torggata | verified_geometry | `oslobyleksikon:torggata` |'],
  ['| 13 | `storgata` | Storgata | verified | `geonorge-adresser-v1:0301:17059:25` |', '| 13 | `storgata` | Storgata | verified_geometry | `oslobyleksikon:storgata` |'],
  ['| 14 | `botsparken` | Botsparken | verified_geometry | `lokalhistoriewiki:gronlands-park` |', '| 14 | `botsparken` | Botsparken | verified_geometry | `oslo-kommune:park:gronland-park-klosterenga` |'],
  ['| 16 | `carl_berner_plass` | Carl Berners plass | verified_geometry | `wikidata:Q5039902` |', '| 16 | `carl_berner_plass` | Carl Berners plass | verified_geometry | `oslobyleksikon:carl-berners-plass` |'],
  ['| 16 | `okern` | Økern | verified_geometry | `wikidata:Q12011791` |', '| 16 | `okern` | Økern | verified_geometry | `oslobyleksikon:okern-strok` |'],
  ['| 16 | `skoyen` | Skøyen | verified_geometry | `wikidata:Q6514682` |', '| 16 | `skoyen` | Skøyen | verified_geometry | `oslobyleksikon:skoyen-strok` |'],
  ['| 16 | `torshov` | Torshov | verified_geometry | `wikidata:Q7827191` |', '| 16 | `torshov` | Torshov | verified_geometry | `oslobyleksikon:torshov-strok` |']
];
for (const [from, to] of replacements) {
  if (!protocol.includes(from)) throw new Error(`Protocol row not found: ${from}`);
  protocol = protocol.replace(from, to);
}
const note = 'Retrokontroll fra batch 6 (2026-07-20), pass 2: `torggata` og `storgata` er tilbakeført fra feilaktige enkeltadresseankre til dokumenterte lineære gateankre med ruteankre. `botsparken` bruker nå kommunal parkdefinisjon. De fire batch-16-recordene `carl_berner_plass`, `okern`, `skoyen` og `torshov` har fått dokumenterte steds-/områdefinisjoner fra Oslo byleksikon i stedet for Wikidata som primær verifikasjonskilde.';
if (!protocol.includes(note)) {
  const marker = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
  if (!protocol.includes(marker)) throw new Error('Protocol insertion marker not found');
  protocol = protocol.replace(marker, `${note}\n\n${marker}`);
}
fs.writeFileSync(abs(protocolRel), protocol);

writeJson('reports/oslo-coordinate-retro-audit-from-batch-6/pass-2-batches-11-16.json', {
  date: VERIFIED_AT,
  auditStartBatch: 6,
  corrections: auditRows,
  nextResearchPass: [
    'henrik_wergeland_statue: exact monument object or downgrade',
    'telegrafbygningen: replace Wikidata primary source with exact physical object geometry',
    'ovre_foss: run address-first lookup for Sagveien 23 before any geometry fallback'
  ]
});

const readmeRel = 'reports/oslo-coordinate-retro-audit-from-batch-6/README.md';
let readme = fs.existsSync(abs(readmeRel)) ? fs.readFileSync(abs(readmeRel), 'utf8') : '# Oslo coordinate retro-audit from batch 6\n';
const section = `\n## Pass 2 — deterministic corrections through batch 16\n\n- Batch 11: \`torggata\` restored to its documented street/line representation. The Geonorge point for Torggata 14 is a valid address point, but it does not represent the street record.\n- Batch 13: \`storgata\` restored to its documented street/line representation for the same reason.\n- Batch 14: \`botsparken\` moved from a lower-priority Lokalhistoriewiki source to Oslo kommune's official park definition.\n- Batch 16: \`carl_berner_plass\`, \`okern\`, \`skoyen\` and \`torshov\` no longer use Wikidata as the primary source for \`verified_geometry\`; each now uses a documented Oslo byleksikon place/area definition with an explicit semantic area-anchor rule.\n\n### Remaining source-research corrections already identified\n\n- Batch 21: \`henrik_wergeland_statue\` needs an exact monument object or must be downgraded; a geotagged Wikimedia photo is not sufficient as sole primary geometry source.\n- Batch 22: \`telegrafbygningen\` needs its exact physical OSM/cultural-heritage object promoted over Wikidata.\n- Batch 24: \`ovre_foss\` has a concrete documented address at Sagveien 23 and must go through the Geonorge address-first finder before any fallback is accepted.\n`;
if (!readme.includes('## Pass 2 — deterministic corrections through batch 16')) readme += section;
fs.writeFileSync(abs(readmeRel), readme);

console.log(JSON.stringify({ ok: true, corrected: auditRows.map((row) => row.id), nextResearchPass: ['henrik_wergeland_statue', 'telegrafbygningen', 'ovre_foss'] }, null, 2));
