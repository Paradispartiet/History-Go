import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';

const id = 'ekeberg_helleristninger';
const placeRel = 'places/historie/oslo/places_historie/ekeberg_helleristninger.json';
const placePath = `data/${placeRel}`;
const evidenceRel = 'oslo/historie/ekeberg_helleristninger.json';
const evidencePath = `data/coordinate-evidence/${evidenceRel}`;
const intake = JSON.parse(readFileSync('reports/visitoslo-oslo-east-audit-20260720/ekeberg-helleristninger/decision.json', 'utf8'));
const c = intake.coordinate;

const indexRaw = JSON.parse(readFileSync('data/places/places_index.json', 'utf8'));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
if (places.some((p) => p.id === id)) throw new Error(`${id} already exists; abort duplicate production.`);

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const protocolBefore = readFileSync(protocolPath, 'utf8');
const batches = [...protocolBefore.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1]));
const nextBatch = Math.max(...batches) + 1;
const countMatch = protocolBefore.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\./);
if (!countMatch) throw new Error('Could not parse verified Oslo count.');
const oldCount = Number(countMatch[1]);
const newCount = oldCount + 1;

const place = {
  id,
  name: 'Helleristningene på Ekeberg',
  lat: c.lat,
  lon: c.lon,
  r: c.r,
  category: 'historie',
  year: -2500,
  period: 'Steinalder – omtrentlig datering',
  emne_ids: ['em_his_tid_periodisering_epoker', 'em_his_historiske_lag_i_byrom'],
  desc: 'Forhistorisk helleristningsfelt ved Sjømannsskolen på Ekeberg, med dyrefigurer, menneskefigur og andre innhogde motiver bevart i bergflaten.',
  popupDesc: 'Helleristningene på Ekeberg er et konkret spor etter mennesker som levde i Oslo-området flere tusen år før den historiske byen vokste fram. Riksantikvaren registrerer feltet som Ekeberg 2 (Sjømannsskolen) / Familiedalen, Kulturminne-ID 41907. Den offisielle registreringen beskriver 13 figurer: ni firbente dyr, rester av enda en dyrefigur, en fugl, en mannsfigur og en spissoval figur som kan være en dyrefelle, i tillegg til skålgroper. To av dyrefigurene kan bestemmes som elgokser.\n\nVisitOSLO omtaler ristningene som omtrent 4 000–5 000 år gamle. År -2500 brukes derfor bare som et teknisk representasjonspunkt midt i en bred, omtrentlig datering og skal ikke forstås som et eksakt arkeologisk år. Stedet representerer selve helleristningsfeltet, ikke Ekebergparken, Kongsveien eller Ekeberg som helhet.',
  quiz_profile: {
    place_type: 'arkeologisk_kulturminne',
    subtype: 'forhistorisk_helleristningsfelt',
    signature_features: ['Riksantikvarens lokalitet 41907 ved Sjømannsskolen', '13 registrerte figurer i bergflaten', 'to dyrefigurer artsbestemt som elgokser', 'eget fysisk felt adskilt fra Ekebergparken'],
    primary_angles: ['forhistorie', 'arkeologi', 'materielle_spor', 'kildekritikk', 'landskap_og_tid'],
    question_families: ['gjenkjenning', 'materielle_spor', 'datering_og_kildekritikk', 'motiv_og_tolkning', 'kontrast'],
    avoid_angles: ['eksakt_datering_som_ikke_er_kildebelagt', 'forveksle_med_ekebergparken', 'generisk_steinalder_uten_stedlig_kilde', 'dikta_motivtolkning'],
    must_include: ['offisiell identitet Ekeberg 2 (Sjømannsskolen) / Familiedalen', '13 registrerte figurer', 'kildekritisk behandling av datering og motivtolkning'],
    contrast_targets: ['ekebergparken', 'middelalder_oslo'],
    notes: 'Eksterne arkeologiske og lokale kilder skal dominere synlig quizinnhold. År -2500 er et omtrentlig teknisk representasjonspunkt, aldri et eksakt faktaspørsmål.'
  },
  locatorType: c.locatorType,
  sourceProvider: c.sourceProvider,
  sourceObjectId: c.sourceObjectId,
  geocodeAccuracy: c.geocodeAccuracy,
  coordRole: c.coordRole,
  coordStatus: c.coordStatus,
  coordSource: c.coordSource,
  coordSourceId: c.sourceObjectId,
  coordSourceUrl: intake.source.sourceUrl,
  coordType: c.coordType,
  coordVerifiedAt: '2026-07-20',
  coordNote: c.coordNote,
  externalLinks: [
    { type: 'official', label: 'Riksantikvaren – objekt 41907-1', url: intake.source.sourceUrl, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'source', label: 'Kulturminnesøk – lokalitet 41907', url: intake.identity.linkKulturminnesok, lang: 'nb', verifiedAt: '2026-07-20' }
  ]
};
mkdirSync(dirname(placePath), { recursive: true });
writeFileSync(placePath, `${JSON.stringify(place, null, 2)}\n`);

const evidence = {
  placeId: id,
  placeFile: placePath,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
  identity: { currentName: place.name, resolvedIdentity: 'Riksantikvaren feature 41907-1, Ekeberg 2 (Sjømannsskolen) / Familiedalen, the registered rock-carving field itself', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'poi', requiresSplit: false, splitReason: '' },
  requiredEvidence: ['direkte offisielt objektoppslag for feature 41907-1', 'offisiell Kulturminne-ID 41907', 'skille fra Ekebergparken og brede områdeankre'],
  evidence: [{ sourceProvider: 'official_heritage_registry', sourceName: intake.source.sourceName, sourceUrl: intake.source.sourceUrl, sourceObjectId: c.sourceObjectId, sourceQuality: 'official_heritage_object_geometry', finding: 'Direkte Riksantikvaren-oppslag gir feature 41907-1, Ekeberg 2 (Sjømannsskolen) / Familiedalen, med offisiell MultiPolygon-geometri.', canVerifyCoordinate: true, reason: c.coordNote }],
  addressCandidates: [],
  sourceObjectCandidates: [{ sourceProvider: 'official_heritage_registry', sourceObjectId: c.sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [{ sourceProvider: 'official_heritage_registry', sourceObjectId: 'riksantikvaren-feature:41907-1', geometryType: 'MultiPolygon', canApplyToPlace: true }],
  coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Applied the geometric center of official Riksantikvaren feature 41907-1 as the site representation point.' },
  notes: [place.coordNote]
};
mkdirSync(dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

for (const [manifestPath, entry] of [['data/places/manifest.json', placeRel], ['data/coordinate-evidence/manifest.json', evidenceRel]]) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.files)) throw new Error(`${manifestPath} has no files array.`);
  if (manifest.files.includes(entry)) throw new Error(`${manifestPath} already contains ${entry}.`);
  manifest.files.push(entry);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

let protocol = protocolBefore.replace(/Oslo-tabellen inneholder nå \d+ verifiserte eller kildekontrollerte canonical steder\./, `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder.`);
const row = `| ${nextBatch} | \`${id}\` | Helleristningene på Ekeberg | verified_geometry | \`kulturminnesok:41907\` |`;
const rows = [...protocol.matchAll(/^\|\s*\d+\s*\|.*$/gm)];
const last = rows.at(-1);
if (!last) throw new Error('No coordinate table row found.');
const pos = last.index + last[0].length;
protocol = `${protocol.slice(0, pos)}\n${row}${protocol.slice(pos)}`;
protocol = `${protocol.trimEnd()}\n\nBatch ${nextBatch} (2026-07-20) produserer \`${id}\` som selve det registrerte helleristningsfeltet ved Sjømannsskolen på Ekeberg. Koordinaten er geometrisenteret for Riksantikvarens offisielle MultiPolygon-feature \`41907-1\`, koblet direkte til Kulturminne-ID 41907. Feltet holdes separat fra \`ekebergparken\`, Kongsveien og brede Ekeberg-områdeankre. Dateringen til omtrent 4 000–5 000 år er bred; år -2500 i place-recorden er et teknisk representasjonspunkt og ikke en eksakt arkeologisk datering.\n`;
writeFileSync(protocolPath, protocol);
console.log(`Produced ${id} as Oslo coordinate batch ${nextBatch}; ${oldCount} -> ${newCount}.`);
rmSync(new URL(import.meta.url));
