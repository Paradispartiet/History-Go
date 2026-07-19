import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATE = '2026-07-19';
const SOURCE_REL = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const SOURCE = path.join(ROOT, SOURCE_REL);
const SPLIT_DIR = path.join(ROOT, 'data/places/naeringsliv/oslo/places_naeringsliv');
const SPLIT_MANIFEST = path.join(ROOT, 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json');
const INDEX = path.join(ROOT, 'data/places/naeringsliv/oslo/places_naeringsliv_index.json');
const EVIDENCE_ROOT = path.join(ROOT, 'data/coordinate-evidence');
const EVIDENCE_MANIFEST = path.join(EVIDENCE_ROOT, 'manifest.json');
const PROTOCOL = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-23');
const REPORT = path.join(REPORT_DIR, 'README.md');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const snapshot = (place) => ({
  lat: place?.lat ?? null,
  lon: place?.lon ?? null,
  r: place?.r ?? null,
  coordStatus: place?.coordStatus ?? '',
  coordSource: place?.coordSource ?? '',
  coordType: place?.coordType ?? '',
  coordNote: place?.coordNote ?? '',
});
const replaceRequired = (text, from, to, label) => {
  if (!text.includes(from)) throw new Error(`Mangler forventet protokolltekst: ${label}`);
  return text.replace(from, to);
};

function parseFinder(file, label) {
  const raw = fs.readFileSync(file, 'utf8');
  const start = raw.indexOf('{');
  if (start < 0) throw new Error(`Fant ikke JSON i Geonorge-resultatet for ${label}`);
  const result = JSON.parse(raw.slice(start));
  if (!result?.ok || result?.status !== 'verified_candidate' || !result?.coordinate || !result?.sourceObjectId) {
    throw new Error(`${label} fikk ikke entydig verified_candidate: ${JSON.stringify({ status: result?.status, reason: result?.reason })}`);
  }
  return result;
}

const finderDefs = {
  vinmonopolet_lager: {
    label: 'Vinmonopolets hovedlager / sentralanlegg på Hasle',
    address: 'Haslevangen 16 Oslo',
    identitySource: 'Oslo byleksikon – Haslevangen / Vinmonopolet',
    identityUrl: 'https://oslobyleksikon.no/side/Haslevangen',
    finding: 'Oslo byleksikon dokumenterer Haslevangen 16 som det tidligere hovedkontoret og sentralanlegget til Vinmonopolet, tatt i bruk i 1933. Vinmonopolets egen historie dokumenterer det store produksjonsanlegget på Hasle.',
    note: 'Offisiell adressekoordinat fra Geonorge for Haslevangen 16, kryssjekket mot Oslo byleksikons identifikasjon av Vinmonopolets tidligere hovedkontor og sentralanlegg. Punktet brukes som display-marker for det historiske anlegget; radiusen beholdes for anleggets større fysiske omfang.',
  },
  jernbaneverkstedet_lodalen: {
    label: 'Lodalen jernbaneverksted',
    address: 'Dyvekes vei 2 Oslo',
    identitySource: 'Bane NOR – Lodalen verksted',
    identityUrl: 'https://www.banenor.no/for-deg-i-bransjen/togselskap/serviceanlegg/verksteder/lodalen/',
    finding: 'Bane NOR dokumenterer Lodalen verksted som et konkret verkstedsanlegg med adresse Dyvekes vei 2, 0192 Oslo.',
    note: 'Offisiell adressekoordinat fra Geonorge for Dyvekes vei 2, kryssjekket mot Bane NORs offisielle verkstedside. Punktet brukes som display-marker for Lodalen verksted; radiusen beholdes fordi verkstedet er et større jernbaneanlegg.',
  },
  grunnlovsbygget_bankplassen: {
    label: 'Den gamle Norges Bank',
    address: 'Bankplassen 3 Oslo',
    identitySource: 'Nasjonalmuseet – Nasjonalmuseet Arkitektur / Bankplassen 3',
    identityUrl: 'https://www.nasjonalmuseet.no/besok/visningssteder/nasjonalmuseet_arkitektur/norsk-arkitekturmuseums-historie/',
    finding: 'Nasjonalmuseet dokumenterer Bankplassen 3 som den tidligere Norges Bank-bygningen, i dag del av Nasjonalmuseet Arkitektur. Geonorge gir ett entydig adressepunkt for Bankplassen 3.',
    note: 'Offisiell adressekoordinat fra Geonorge for Bankplassen 3, kryssjekket mot Nasjonalmuseets identifikasjon av den tidligere Norges Bank-bygningen. Det eldre manuelle punktet erstattes av det offisielle bygningsankeret.',
  },
};

const finderResults = {};
for (const [id, def] of Object.entries(finderDefs)) {
  finderResults[id] = parseFinder(path.join(REPORT_DIR, 'lookups', `${id}-geonorge.json`), def.label);
}

const aggregate = readJson(SOURCE);
const byId = new Map(aggregate.map((place) => [place.id, place]));

for (const [id, def] of Object.entries(finderDefs)) {
  const place = byId.get(id);
  if (!place) throw new Error(`Mangler ${id} i ${SOURCE_REL}`);
  const result = finderResults[id];
  Object.assign(place, {
    lat: result.coordinate.lat,
    lon: result.coordinate.lon,
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: result.sourceObjectId,
    address: result.coordinate.address,
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceId: result.sourceObjectId,
    coordSourceUrl: result.sourceUrl,
    coordType: 'address_point',
    coordVerifiedAt: DATE,
    coordNote: def.note,
  });
  delete place.coordPrecision;
  delete place.coordPrecisionM;
}

writeJson(SOURCE, aggregate);

for (const id of Object.keys(finderDefs)) {
  const place = byId.get(id);
  writeJson(path.join(SPLIT_DIR, `${id}.json`), place);
}

const manifest = readJson(SPLIT_MANIFEST);
manifest.source_sha256 = sha256(SOURCE);
manifest.generated_at = new Date().toISOString();
for (const row of manifest.places || []) {
  if (!finderDefs[row.id]) continue;
  row.sha256 = sha256(path.join(path.dirname(SPLIT_MANIFEST), row.file));
}
writeJson(SPLIT_MANIFEST, manifest);

const index = readJson(INDEX);
for (const id of Object.keys(finderDefs)) {
  const place = byId.get(id);
  const row = index.find((item) => item?.id === id);
  if (!row) throw new Error(`Mangler ${id} i naeringsliv-index`);
  for (const key of ['name', 'lat', 'lon', 'r', 'coordStatus', 'coordType']) {
    if (place[key] !== undefined) row[key] = place[key];
  }
}
writeJson(INDEX, index);

function appliedEvidence(id) {
  const place = byId.get(id);
  const def = finderDefs[id];
  const result = finderResults[id];
  return {
    placeId: id,
    placeFile: SOURCE_REL,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: snapshot(place),
    identity: {
      currentName: place.name,
      resolvedIdentity: def.label,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: 'building',
      requiresSplit: false,
      splitReason: '',
    },
    requiredEvidence: ['entydig offisiell adresse', 'dokumentert kobling mellom adressen og det fysiske stedet', 'fysisk overlap-audit'],
    evidence: [
      {
        sourceProvider: 'official_address',
        sourceName: 'Geonorge Adresser API v1',
        sourceUrl: result.sourceUrl,
        sourceObjectId: result.sourceObjectId,
        sourceQuality: 'official_address',
        finding: `Geonorge returnerte ett entydig treff for ${def.address}.`,
        canVerifyCoordinate: true,
        reason: def.note,
      },
      {
        sourceProvider: 'manual_research',
        sourceName: def.identitySource,
        sourceUrl: def.identityUrl,
        sourceObjectId: `identity:${id}`,
        sourceQuality: 'documented_physical_identity',
        finding: def.finding,
        canVerifyCoordinate: true,
        reason: 'Kilden kobler det navngitte History Go-stedet til adressen som brukes som koordinatanker.',
      },
    ],
    addressCandidates: [{
      address: def.address,
      sourceProvider: 'official_address',
      sourceObjectId: result.sourceObjectId,
      canApplyToPlace: true,
    }],
    sourceObjectCandidates: [{
      sourceProvider: 'official_address',
      sourceObjectId: result.sourceObjectId,
      canApplyToPlace: true,
    }],
    geometryCandidates: [],
    coordinateCandidates: [{
      lat: place.lat,
      lon: place.lon,
      coordRole: place.coordRole,
      canApplyToPlace: true,
    }],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Offisielt adresseanker og dokumentert fysisk identitet er anvendt på canonical place.',
    },
    notes: [def.note],
  };
}

for (const id of Object.keys(finderDefs)) {
  writeJson(path.join(EVIDENCE_ROOT, `oslo/naeringsliv/${id}.json`), appliedEvidence(id));
}

const reviewDefs = {
  nrk_marienlyst: {
    status: 'rejected',
    decision: 'needs_identity_split',
    resolved: 'legacy/duplikat-record for samme fysiske Marienlyst-anlegg som canonical `nrk_huset_marienlyst`',
    problem: 'Repoets Oslo place-audit dokumenterer at `nrk_marienlyst` allerede finnes funksjonelt som `nrk_huset_marienlyst`. Begge beskriver NRKs hovedanlegg på Marienlyst.',
    sourceName: 'History Go – Oslo place-audit batch 01',
    sourceUrl: 'reports/oslo-place-audit-batch-01.md',
    sourceObjectId: 'history-go:duplicate:nrk_marienlyst:nrk_huset_marienlyst',
    next: 'Migrer eventuelle gamle naeringsliv-referanser til `nrk_huset_marienlyst`; ikke godkjenn et separat fysisk punkt for duplikatet.',
  },
  fornebu_teknologipark: {
    status: 'needs_research',
    decision: 'needs_identity_split',
    resolved: 'Fornebu som teknologisk nærings- og utviklingsområde i Bærum kommune',
    problem: 'Recorden ligger i Oslo-kilden, men Fornebu ligger i Bærum. Navnet «Fornebu Teknologipark» brukes dessuten som et bredt nærings-/utviklingsområde, ikke som ett entydig fysisk objekt som dagens punkt dokumenterer.',
    sourceName: 'Bærum kommune – Nye Fornebu',
    sourceUrl: 'https://www.baerum.kommune.no/politikk-og-samfunn/samfunnsutvikling/stedsutvikling-i-barum/nye-fornebu/',
    sourceObjectId: 'baerum-kommune:fornebu-utviklingsomrade',
    next: 'Flytt eller erstatt recorden i korrekt Bærum/Akershus-kontekst etter at et entydig fysisk teknologipark-objekt eller eksplisitt områdegeometri er definert.',
  },
  ulven_handelspark: {
    status: 'needs_research',
    decision: 'needs_identity_split',
    resolved: 'et påstått handels-/næringsområde på Ulven i Oslo',
    problem: 'Audit fant Ulven som dokumentert transformasjons- og næringsområde, men ingen stabil offentlig eller lokalhistorisk fysisk entitet med navnet «Ulven handelspark». Dagens generiske punkt kan derfor ikke verifiseres mot et kildeobjekt.',
    sourceName: 'Oslo kommune – Hovinbyen / Ulven',
    sourceUrl: 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/hovinbyen/',
    sourceObjectId: 'oslo-kommune:hovinbyen:ulven',
    next: 'Identifiser det konkrete handels-/næringsanlegget som recorden skal representere, eller erstatt recorden med et dokumentert Ulven-områdeobjekt før koordinaten godkjennes.',
  },
  akershus_energi: {
    status: 'needs_research',
    decision: 'needs_identity_split',
    resolved: 'Akershus Energi Varme som selskap med flere fjernvarmeanlegg i Akershus',
    problem: 'Recorden ligger i Oslo-kilden og har et Oslo-punkt, men Akershus Energi Varme har forretningsadresse i Lillestrøm og dokumenterte fjernvarmeanlegg flere steder i Akershus. Ett Oslo-punkt kan ikke representere selskapets anleggsnett.',
    sourceName: 'NVE – Lillestrøm og Rælingen fjernvarmeanlegg / Brønnøysundregistrene',
    sourceUrl: 'https://www.nve.no/konsesjon/konsesjonssaker/konsesjonssak?id=396&type=A',
    sourceObjectId: 'nve:fjernvarme:199901674+200600183+200705636',
    next: 'Definer ett konkret Akershus Energi-anlegg som eget place, eller modeller selskapet som aktør med flere anleggsrelasjoner; ikke behold et generisk Oslo-koordinatpunkt.',
  },
};

for (const [id, def] of Object.entries(reviewDefs)) {
  const place = byId.get(id);
  if (!place) throw new Error(`Mangler ${id} i ${SOURCE_REL}`);
  writeJson(path.join(EVIDENCE_ROOT, `oslo/naeringsliv/${id}.json`), {
    placeId: id,
    placeFile: SOURCE_REL,
    evidenceStatus: def.status,
    coordinateDecision: def.decision,
    currentCoordinate: snapshot(place),
    identity: {
      currentName: place.name,
      resolvedIdentity: def.resolved,
      identityStatus: 'conflict',
      identityProblem: def.problem,
      locatorTypeCandidate: 'linear_area',
      requiresSplit: false,
      splitReason: def.problem,
    },
    requiredEvidence: ['entydig fysisk scope', 'korrekt kommune/fylke der relevant', 'overlap-audit mot eksisterende canonical places'],
    evidence: [{
      sourceProvider: 'manual_research',
      sourceName: def.sourceName,
      sourceUrl: def.sourceUrl,
      sourceObjectId: def.sourceObjectId,
      sourceQuality: 'identity_geography_audit',
      finding: def.problem,
      canVerifyCoordinate: false,
      reason: def.problem,
    }],
    addressCandidates: [],
    sourceObjectCandidates: [{
      sourceProvider: 'manual_research',
      sourceObjectId: def.sourceObjectId,
      canApplyToPlace: false,
    }],
    geometryCandidates: [],
    coordinateCandidates: [],
    decision: {
      canBecomeVerified: false,
      blockedReason: def.problem,
      nextAction: def.next,
    },
    notes: ['Ingen koordinatendring i batch 23.'],
  });
}

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const id of [...Object.keys(finderDefs), ...Object.keys(reviewDefs)]) {
  const file = `oslo/naeringsliv/${id}.json`;
  if (!evidenceManifest.files.includes(file)) evidenceManifest.files.push(file);
}
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(PROTOCOL, 'utf8');
protocol = replaceRequired(
  protocol,
  'Oslo-tabellen inneholder nå 128 verifiserte eller kildekontrollerte canonical steder. Batch 22 godkjenner fire nye ankere: Klassekampen-redaksjonen på dagens Grønland 4, Oslo Gassverk ved den bevarte kontorbygningen i Storgata 36C, det historiske Hovedpostkontoret i Dronningens gate 15 og Telegrafbygningen som identifisert bygningsobjekt i Kongens gate 21. Good Game-redaksjonen, Aftenposten i Akersgata og Dagbladet i Akersgata står som nye dokumenterte `needs_review`-utfall på grunn av fysisk overlap eller fleradresse-identitet. 13 fullførte kontroller står dermed separat uten godkjent Oslo-koordinat. Sekundærkøen fortsetter i `naeringsliv` etter at `media` er ferdig og `musikk` ikke ga nye placeId-er.',
  'Oslo-tabellen inneholder nå 131 verifiserte eller kildekontrollerte canonical steder. Batch 23 godkjenner tre nye konkrete bygningsankre: Vinmonopolets historiske sentralanlegg på Hasle, Lodalen jernbaneverksted og Den gamle Norges Bank på Bankplassen 3. `nrk_marienlyst`, `fornebu_teknologipark`, `ulven_handelspark` og `akershus_energi` står som nye dokumenterte `needs_review`-utfall på grunn av duplikat, feil geografi eller manglende entydig fysisk scope. 17 fullførte kontroller står dermed separat uten godkjent Oslo-koordinat.',
  'Oslo-sammendrag'
);

const lastApproved = '| 22 | `telegrafbygningen` | Telegrafbygningen | verified_geometry | `wikidata:Q17195132` |';
const approvedRows = [
  `| 23 | \`vinmonopolet_lager\` | Vinmonopolets hovedlager | verified | \`${finderResults.vinmonopolet_lager.sourceObjectId}\` |`,
  `| 23 | \`jernbaneverkstedet_lodalen\` | Lodalen jernbaneverksted | verified | \`${finderResults.jernbaneverkstedet_lodalen.sourceObjectId}\` |`,
  `| 23 | \`grunnlovsbygget_bankplassen\` | Den gamle Norges Bank | verified | \`${finderResults.grunnlovsbygget_bankplassen.sourceObjectId}\` |`,
].join('\n');
protocol = replaceRequired(protocol, lastApproved, `${lastApproved}\n${approvedRows}`, 'batch 23 godkjente rader');

protocol = protocol.replace(
  'Disse kontrollene er fullført, men teller ikke blant de 128 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 131 verifiserte eller kildekontrollerte canonical Oslo-stedene.'
);

const dagbladetRow = '| `dagbladet_akersgata` – Dagbladet i Akersgata | needs_review | Historisk redaksjonsforankring omfatter både Akersgata 36 og 47/49, men recorden har bare ett punkt. | Krever flerankre eller et eksplisitt tidsavgrenset hovedanker. |';
const reviewRows = [
  '| `nrk_marienlyst` – NRK Marienlyst | needs_review | Repoets place-audit dokumenterer at recorden dupliserer canonical `nrk_huset_marienlyst` for det samme fysiske NRK-anlegget. | Migrer gamle næringsliv-referanser til `nrk_huset_marienlyst`; ikke godkjenn et separat fysisk punkt. |',
  '| `fornebu_teknologipark` – Fornebu Teknologipark | needs_review | Recorden ligger i Oslo-kilden, men Fornebu ligger i Bærum; navnet beskriver dessuten et bredt nærings-/utviklingsområde uten ett dokumentert fysisk hovedanker. | Flytt/erstatt i Bærum-kontekst etter at fysisk scope eller områdegeometri er eksplisitt definert. |',
  '| `ulven_handelspark` – Ulven handelspark | needs_review | Audit fant Ulven som transformasjons- og næringsområde, men ingen stabil dokumentert fysisk entitet med navnet «Ulven handelspark». | Identifiser konkret handels-/næringsanlegg eller erstatt med et dokumentert områdeobjekt før koordinaten godkjennes. |',
  '| `akershus_energi` – Akershus Energi Varme | needs_review | Recorden ligger i Oslo-kilden og har ett Oslo-punkt, men selskapet har flere dokumenterte fjernvarmeanlegg i Akershus og forretningsadresse i Lillestrøm. | Definer ett konkret anlegg som place eller modeller selskapet som aktør med flere anleggsrelasjoner; ikke behold generisk Oslo-punkt. |',
].join('\n');
protocol = replaceRequired(protocol, dagbladetRow, `${dagbladetRow}\n${reviewRows}`, 'batch 23 needs_review-rader');

protocol = replaceRequired(
  protocol,
  '- Neste nye Oslo-kontroll er nummer 140 og starter batch 23.\n- Batch 22 er fullført med fire godkjente ankere og tre nye dokumenterte `needs_review`-utfall.\n- Sekundærkøen fortsetter i `data/places/naeringsliv/oslo/places_naeringsliv_manifest.json` fra første ukontrollerte record etter `telegrafbygningen`.\n- Fortsett alltid med koordinatmetode etter fysisk objekttype; et manifest er bare køkilde, ikke metodevalg.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  '- Neste nye Oslo-kontroll er nummer 147 og starter batch 24.\n- Batch 23 er fullført med tre godkjente ankere og fire nye dokumenterte `needs_review`-utfall.\n- Sekundærkøen fortsetter i `data/places/naeringsliv/oslo/places_naeringsliv_manifest.json` fra første ukontrollerte record etter `akershus_energi`; `sagene_kvernhus` er neste kandidat.\n- Fortsett alltid med koordinatmetode etter fysisk objekttype; et manifest er bare køkilde, ikke metodevalg.\n- Før alle fullførte `needs_review`-kontroller i den separate Oslo-tabellen samme dag som avgjørelsen tas.',
  'Neste arbeid'
);
fs.writeFileSync(PROTOCOL, protocol);

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT, `# Oslo koordinatkontroll – batch 23

Dato: ${DATE}

Sju kontroller er fullført. Tre konkrete fysiske steder er godkjent med entydige Geonorge-adresseankre og dokumentert identitetskilde. Fire records står som needs_review på grunn av duplikat, feil kommune eller manglende entydig fysisk scope.

| placeId | resultat | kilde / avgjørelse |
|---|---|---|
| \`vinmonopolet_lager\` | verified | \`${finderResults.vinmonopolet_lager.sourceObjectId}\` |
| \`nrk_marienlyst\` | needs_review | duplikat av \`nrk_huset_marienlyst\` |
| \`jernbaneverkstedet_lodalen\` | verified | \`${finderResults.jernbaneverkstedet_lodalen.sourceObjectId}\` |
| \`grunnlovsbygget_bankplassen\` | verified | \`${finderResults.grunnlovsbygget_bankplassen.sourceObjectId}\` |
| \`fornebu_teknologipark\` | needs_review | feil Oslo-geografi + bredt område uten entydig objekt |
| \`ulven_handelspark\` | needs_review | ingen stabil dokumentert fysisk entitet med dette navnet |
| \`akershus_energi\` | needs_review | selskap med flere Akershus-anlegg, ikke ett Oslo-anlegg |

## Koordinatavgjørelser

- Vinmonopolets historiske sentralanlegg flyttes fra det gamle feilpunktet til den dokumenterte adressen Haslevangen 16.
- Lodalen verksted flyttes til Bane NORs dokumenterte verkstedsadresse Dyvekes vei 2. Radiusen beholdes fordi stedet er et større jernbaneanlegg.
- Den gamle Norges Bank flyttes fra et eldre manuelt kontrollpunkt til det offisielle adressepunktet Bankplassen 3.
- Ingen koordinater endres for de fire needs_review-recordene.
`);

console.log('Completed Oslo coordinate batch 23: 3 verified, 4 needs_review');
