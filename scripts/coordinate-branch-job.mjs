import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const BASELINE = '15ed74e57cb18940bb9fcba6b4907ac7dc862ae0';
const PLACE = 'data/places/by/oslo/places/torggata.json';
const EVIDENCE = 'data/coordinate-evidence/oslo/by/torggata.json';
const CHECKLIST = 'docs/PLACE_PRODUCTION_CHECKLIST.md';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const WORKCARD = 'reports/place-production/torggata-workcard-current.md';
const RESEARCH = 'reports/place-production/torggata-coordinate-research-v2.md';
const QA = 'reports/place-production/torggata-coordinate-qa-v3.md';
const NULLMAALING = 'reports/place-production/torggata-nullmaaling-v1.md';
const RESTORE_REPORT = 'reports/place-production/torggata-coordinate-restore-pr3775.md';

function gitShow(ref, path) {
  return execFileSync('git', ['show', `${ref}:${path}`], { encoding: 'utf8' });
}

async function read(path) {
  return readFile(path, 'utf8');
}

async function write(path, text) {
  await writeFile(path, text.endsWith('\n') ? text : `${text}\n`, 'utf8');
}

function prependOnce(text, banner) {
  if (text.includes(banner.trim())) return text;
  return `${banner}\n\n${text}`;
}

// 1) Restore only coordinate-owned fields on the current place from the last
// legitimate pre-reopen baseline. Keep all newer editorial/source content.
const currentPlace = JSON.parse(await read(PLACE));
const baselinePlace = JSON.parse(gitShow(BASELINE, PLACE));
const coordinateKeys = [
  'lat',
  'lon',
  'r',
  'coordType',
  'coordStatus',
  'coordNote',
  'locatorType',
  'sourceProvider',
  'sourceObjectId',
  'geocodeAccuracy',
  'coordRole',
  'coordSource',
  'coordVerifiedAt',
  'anchors',
  'coordSourceId',
  'coordSourceUrl',
  'sourceHint',
  'routeSegments',
  'externalLinks'
];
for (const key of coordinateKeys) {
  if (Object.prototype.hasOwnProperty.call(baselinePlace, key)) {
    currentPlace[key] = baselinePlace[key];
  } else {
    delete currentPlace[key];
  }
}
await write(PLACE, JSON.stringify(currentPlace, null, 2));

// 2) Coordinate evidence had no legitimate post-baseline changes before the
// erroneous reopening, so restore the entire evidence file from that baseline.
await write(EVIDENCE, gitShow(BASELINE, EVIDENCE));

// 3) Make prior-work discovery a mandatory gate in the canonical checklist.
let checklist = await read(CHECKLIST);
const priorWorkHeading = '### Fase -1 — obligatorisk kontroll av tidligere arbeid';
if (!checklist.includes(priorWorkHeading)) {
  const marker = '## Obligatorisk arbeidsmåte — nullmåling og én fase om gangen\n';
  const block = `\n${priorWorkHeading}\n\n**Denne gaten kommer før nullmålingens produksjonsplan og før en subsystemfase kan åpnes.** Målet er å hindre at ferdig, validert arbeid bygges på nytt eller «forbedres» uten dokumentert feil.\n\nFor hvert relevant subsystem skal det først søkes etter om jobben allerede er utført. Kontrollen skal minst omfatte:\n\n- [ ] dagens canonical felt og eksplisitte statusfelt;\n- [ ] subsystemets evidence-/protokoll-/manifest-/runtimefiler;\n- [ ] tidligere produksjons- og auditrapporter;\n- [ ] tidligere PR-er og commits for samme place-ID/subsystem;\n- [ ] generated/runtime-paritet der subsystemet har genererte avledninger;\n- [ ] kjent prosjektkontinuitet fra tidligere stedarbeid når den finnes.\n\n**Beslutningsregel:**\n\n- Er arbeidet allerede komplett, validert og internt konsistent, settes fasen til **ALLEREDE OPPFYLT / GODKJENT FRA TIDLIGERE PRODUKSJON**. Den skal ikke produseres på nytt.\n- En fase kan bare gjenåpnes når det finnes en **konkret dokumentert feil**, en kildekonflikt, en kontraktendring som faktisk gjør den gamle leveransen ugyldig, eller en nåværende gate/validator som feiler.\n- «Dette kan kanskje modelleres bedre», en alternativ semantisk tolkning eller et ønske om å rydde opp er **ikke** tilstrekkelig grunn til å erstatte tidligere validert sannhet.\n- Hvis en fase gjenåpnes, skal arbeidskortet eksplisitt føre **hvilket tidligere arbeid som ble funnet, hvorfor det ikke lenger er tilstrekkelig, og hvilken konkret evidens som utløste gjenåpningen**.\n\n#### Ekstra prior-work gate for koordinater\n\nFør koordinatfasen åpnes skal det i tillegg kontrolleres:\n\n- [ ] `data/coordinate-evidence/.../<placeId>.json`;\n- [ ] `docs/coordinates/coordinate-control-protocol.md`;\n- [ ] tidligere coordinate-research-/productionrapporter;\n- [ ] tidligere coordinate-PR-er/commits;\n- [ ] canonical `coordStatus`, `coordType`, `coordSource`, `sourceObjectId` og eventuelle `anchors`/`routeSegments`;\n- [ ] `data/places/places_index.json` mot canonical source.\n\nEt eksisterende `verified`, `verified_geometry` eller `verified_historical_source`-sted skal **ikke** få ny koordinatmodell uten en konkret dokumentert feil i den eksisterende løsningen. Ved tvil beholdes den tidligere validerte koordinatsannheten til en reell feil er bevist.\n`;
  if (!checklist.includes(marker)) throw new Error('Checklist insertion marker not found');
  checklist = checklist.replace(marker, `${marker}${block}\n`);
}
if (!checklist.includes('TIDLIGERE ARBEID / PR-ER SJEKKET:')) {
  checklist = checklist.replace(
    'CANONICAL SOURCE-FIL:\nMANIFEST:',
    'CANONICAL SOURCE-FIL:\nTIDLIGERE ARBEID / PR-ER SJEKKET:\nFASESTATUS SOM ALLEREDE ER OPPFYLT:\nDOKUMENTERT GRUNN FOR EVENTUELL GJENÅPNING:\nMANIFEST:'
  );
}
await write(CHECKLIST, checklist);

// 4) Restore the protocol row to its pre-reopen control source and record why.
let protocol = await read(PROTOCOL);
const wrongProtocolRow = '| 11 | `torggata` | Torggata | verified_geometry | `osm-way:112054930` |';
const restoredProtocolRow = '| 11 | `torggata` | Torggata | verified_geometry | `oslobyleksikon:torggata` |';
if (protocol.includes(wrongProtocolRow)) {
  protocol = protocol.replace(wrongProtocolRow, restoredProtocolRow);
}
const correctionNote = '**Korrigering 2026-08-11 — `torggata`:** Coordinate-arbeidet var allerede fullført i PR #3773 (research) og PR #3775 (produksjon). PR #3775 plasserte markøren som deterministisk lengdemidtpunkt på navngitt Torggata-geometri og synkroniserte coordinate-evidence/runtime. Den senere stedproduksjonen i PR #4797/#4799/#4800/#4802 gjenåpnet fasen uten først å kontrollere dette tidligere arbeidet og erstattet feilaktig in-street-markøren med Youngstorget som semantisk anker. Restore-løpet 2026-08-11 tilbakefører coordinate-eide felter til siste legitime pre-reopen-baseline `15ed74e5…`; dette er en rollback til tidligere validert produksjon, ikke en ny coordinate-inferens.';
if (!protocol.includes(correctionNote)) {
  if (!protocol.includes(restoredProtocolRow)) throw new Error('Torggata protocol row not found');
  protocol = protocol.replace(restoredProtocolRow, `${restoredProtocolRow}\n\n${correctionNote}`);
}
await write(PROTOCOL, protocol);

// 5) Preserve mistaken reports as audit trail, but make them impossible to use as active truth.
const supersededBanner = '> **SUPERSEDED — IKKE BRUK SOM AKTIV COORDINATE-EVIDENS.** Coordinate-fasen for Torggata var allerede fullført og validert i PR #3773/#3775. Denne 2026-08-11-gjenåpningen erstattet feilaktig den validerte in-street-markøren og er senere tilbakeført til siste legitime pre-reopen-baseline `15ed74e5…`.';
await write(RESEARCH, prependOnce(await read(RESEARCH), supersededBanner));
await write(QA, prependOnce(await read(QA), supersededBanner));

const nullCorrection = '> **KORRIGERING 2026-08-11:** Nullmålingens coordinate-avvik ble senere vurdert som en falsk blokkering. Torggatas coordinate-produksjon var allerede fullført i PR #3773/#3775. Coordinate-fasen skal derfor regnes som tidligere oppfylt; se `torggata-coordinate-restore-pr3775.md`.';
await write(NULLMAALING, prependOnce(await read(NULLMAALING), nullCorrection));

// 6) Replace the active workcard with the corrected phase state.
const workcard = `# Torggata – aktivt stedproduksjonskort\n\n- Oppdatert: 2026-08-11\n- Place ID: \`torggata\`\n- Canonical source: \`data/places/by/oslo/places/torggata.json\`\n- Styrende kontrakt: \`docs/PLACE_PRODUCTION_CHECKLIST.md\`\n- Nullmåling: \`reports/place-production/torggata-nullmaaling-v1.md\`\n- Kildebase: \`reports/place-production/torggata-source-base-v1.md\`\n- Coordinate restore: \`reports/place-production/torggata-coordinate-restore-pr3775.md\`\n\n## Obligatorisk prior-work audit\n\nCoordinate-arbeidet ble kontrollert mot repo-historikken før videre produksjon. Funnet er entydig:\n\n- PR #3773 — **Research exact Torggata and Storgata street geometry** — dokumenterte feilen og låste kandidat;\n- PR #3775 — **Fix Torggata and Storgata map points** — produserte og validerte Torggata-punktet på navngitt gategeometri;\n- siste legitime pre-reopen-baseline i dette stedløpet er \`15ed74e57cb18940bb9fcba6b4907ac7dc862ae0\`;\n- coordinate-fasen var derfor allerede ferdig før Torggata-stedproduksjonen startet.\n\n## Fasestatus\n\n| Fase | Status | Bevis |\n| --- | --- | --- |\n| 0. Nullmåling | **GODKJENT MED COORDINATE-KORRIGERING** | PR #4794; coordinate-delen er korrigert som falsk blokkering |\n| 1. Canonical identity/source | **GODKJENT** | PR #4795, merge \`3f8d3b3a832e8604f2c1d1406365398c13e21c49\` |\n| 2. Kildebase | **GODKJENT** | PR #4796, merge \`15ed74e57cb18940bb9fcba6b4907ac7dc862ae0\` |\n| 3. Koordinater/geometri | **ALLEREDE OPPFYLT FØR DETTE LØPET** | PR #3773 + PR #3775; restore tilbakefører feilaktig 2026-08-11-gjenåpning |\n| 4. Kategori-/Fagverk-stedskobling | **NESTE LEGITIME FASE** | åpnes først etter egen prior-work audit |\n| 5–15 | **IKKE STARTET / MÅ PRIOR-WORK-AUDITERES FØR ÅPNING** | checklist |\n\n## Coordinate-fasit som beholdes\n\nTorggata bruker den tidligere validerte in-street-modellen fra PR #3775:\n\n- \`lat: 59.91700148933685\`;\n- \`lon: 10.75330911912394\`;\n- \`r: 180\`;\n- \`coordType: street_geometry_midpoint\`;\n- \`coordStatus: verified_geometry\`;\n- \`sourceObjectId: osm-way:467290774\`;\n- deterministisk lengdemidtpunkt på navngitt Torggata-geometri;\n- punktavstand til navngitt gategeometri: 0 meter;\n- 12 ordnede \`routeSegments\` fra den validerte produksjonen.\n\nIngen ny coordinate-modell skal produseres her. Eventuell fremtidig gjenåpning krever en konkret dokumentert feil eller feilet canonical gate.\n\n## Feilaktig 2026-08-11-gjenåpning — audit trail\n\nPR #4797, #4799, #4800 og #4802 tilhører en feilaktig gjenåpning av en allerede ferdig coordinate-fase. Rapportene beholdes som audit trail, men er merket **SUPERSEDED** og skal ikke drive coordinate-sannhet.\n\n## Andre kjente senere faser\n\n- Leksikon har tidligere registrerte kilde-/chronology-hull; vurderes først når Leksikon-fasen åpnes etter prior-work audit.\n- Rundinger skal vurderes etter dagens rundingkontrakt, men først etter kontroll av tidligere rundingsarbeid.\n- Kategori og \`emne_ids\` revideres bare dersom fase 4-prior-work-auditen viser at dette faktisk ikke allerede er ferdigstilt.\n\n## Neste steg\n\n**Fase 4 — men først prior-work audit av kategori-/Fagverk-stedskoblingen.** Vi skal ikke automatisk produsere noe i fase 4 før repo, rapporter og tidligere PR-er er kontrollert for eksisterende arbeid.\n`;
await write(WORKCARD, workcard);

// 7) Write a durable restore report.
const restoreReport = `# Torggata — restore av tidligere ferdig coordinate-produksjon\n\nDato: 2026-08-11\n\n## Konklusjon\n\nTorggatas coordinate-jobb var allerede ferdig før sted-for-sted-produksjonen startet. Denne korreksjonen restaurerer den tidligere validerte in-street-markøren og gjør ingen ny coordinate-inferens.\n\n## Tidligere ferdig arbeid\n\n- PR #3773: \`Research exact Torggata and Storgata street geometry\`\n  - målte daværende Torggata-punkt 125,9 m fra navngitt gategeometri;\n  - fant 12-segments sammenhengende Torggata-rute på 574,5 m;\n  - anbefalte deterministisk lengdemidtpunkt \`59.91700148933685, 10.75330911912394\` på \`osm-way:467290774\`;\n  - nytt punkt hadde 0 m avstand til navngitt gategeometri.\n- PR #3775: \`Fix Torggata and Storgata map points\`\n  - anvendte koordinaten på canonical place;\n  - lagret de 12 ordnede \`routeSegments\`;\n  - synkroniserte aggregate/index/manifest/evidence via coordinate runner.\n\n## Restore-baseline\n\n\`15ed74e57cb18940bb9fcba6b4907ac7dc862ae0\` er siste legitime Torggata-tilstand etter stedløpets kildebase, men før coordinate-fasen feilaktig ble åpnet på nytt. Restore-jobben kopierer bare coordinate-eide place-felter fra denne committen og restaurerer coordinate-evidence fra samme commit. Nyere redaksjonelt stedinnhold beholdes.\n\n## Feilen som korrigeres\n\nPR #4797/#4799/#4800/#4802 behandlet coordinate-fasen som åpen uten først å kontrollere PR #3773/#3775. Det førte til at in-street-markøren ble erstattet med Youngstorget som semantisk anker. Youngstorget er relevant for Torggatas identitet, men er et dårligere markerpunkt for denne PlaceCard-en og skulle ikke ha erstattet en allerede validert gategeometrimarkør.\n\n## Permanent prosessendring\n\n\`docs/PLACE_PRODUCTION_CHECKLIST.md\` har nå en obligatorisk **Fase -1 / prior-work audit**. En subsystemfase skal ikke åpnes før tidligere canonical status, evidence/protokoll, rapporter, PR-er/commits og runtime-paritet er kontrollert. Eksisterende \`verified*\` coordinates skal ikke gjenåpnes uten konkret dokumentert feil.\n`;
await write(RESTORE_REPORT, restoreReport);

console.log('Torggata restore prepared from pre-reopen baseline:', BASELINE);
console.log('Restored coordinate:', currentPlace.lat, currentPlace.lon, currentPlace.sourceObjectId);
