import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';

const placeId = 'ekeberg_helleristninger';
const placeRel = 'places/historie/oslo/places_historie/ekeberg_helleristninger.json';
const placePath = `data/places/${placeRel}`;
const evidenceRel = 'oslo/historie/ekeberg_helleristninger.json';
const evidencePath = `data/coordinate-evidence/${evidenceRel}`;
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const placeManifestPath = 'data/places/manifest.json';
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';

const indexRaw = JSON.parse(readFileSync('data/places/places_index.json', 'utf8'));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
if (places.some((place) => place.id === placeId)) {
  throw new Error(`${placeId} already exists on this branch; aborting duplicate production.`);
}

const protocolBefore = readFileSync(protocolPath, 'utf8');
const batchMatches = [...protocolBefore.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
if (!batchMatches.length) throw new Error('Could not determine latest Oslo coordinate batch from protocol table.');
const nextBatch = Math.max(...batchMatches) + 1;
const countMatch = protocolBefore.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\./);
if (!countMatch) throw new Error('Could not determine current Oslo verified-place count from protocol header.');
const currentCount = Number(countMatch[1]);
const nextCount = currentCount + 1;

const place = {
  id: placeId,
  name: 'Helleristningene på Ekeberg',
  lat: 59.8975599746796,
  lon: 10.759838207896665,
  r: 65,
  category: 'historie',
  year: -2500,
  period: 'Steinalder – omtrentlig datering',
  emne_ids: [
    'em_his_tid_periodisering_epoker',
    'em_his_historiske_lag_i_byrom'
  ],
  desc: 'Forhistorisk helleristningsfelt ved Sjømannsskolen på Ekeberg, med dyrefigurer, menneskefigur og andre innhogde motiver bevart i bergflaten.',
  popupDesc: 'Helleristningene på Ekeberg er et konkret spor etter mennesker som levde i Oslo-området flere tusen år før den historiske byen vokste fram. Feltet er registrert av Riksantikvaren som Ekeberg 2 (Sjømannsskolen) / Familiedalen, Kulturminne-ID 41907. Den offisielle registreringen beskriver 13 figurer: ni firbente dyr, rester av enda en dyrefigur, en fugl, en mannsfigur og en spissoval figur som kan være en dyrefelle, i tillegg til skålgroper. To av dyrefigurene kan bestemmes som elgokser.\n\nVisitOSLO omtaler ristningene som omtrent 4 000–5 000 år gamle. Årstallet i History Go er derfor bare et omtrentlig representasjonspunkt i denne brede dateringen, ikke en eksakt arkeologisk datering. Stedet modelleres som selve helleristningsfeltet ved Sjømannsskolen og skal ikke forveksles med Ekebergparken, Kongsveien eller et generelt Ekeberg-område.',
  quiz_profile: {
    place_type: 'arkeologisk_kulturminne',
    subtype: 'forhistorisk_helleristningsfelt',
    signature_features: [
      'Riksantikvarens lokalitet 41907 ved Sjømannsskolen på Ekeberg',
      '13 registrerte figurer i bergflaten',
      'dyremotiver der to figurer kan bestemmes som elgokser',
      'eget fysisk helleristningsfelt adskilt fra Ekebergparken'
    ],
    primary_angles: [
      'forhistorie',
      'arkeologi',
      'materielle_spor',
      'kildekritikk',
      'landskap_og_tid'
    ],
    question_families: [
      'gjenkjenning',
      'materielle_spor',
      'datering_og_kildekritikk',
      'motiv_og_tolkning',
      'kontrast'
    ],
    avoid_angles: [
      'late_som_ristningene_har_en_eksakt_datering',
      'forveksle_med_ekebergparken',
      'generisk_steinalder_uten_stedlig_kilde',
      'dikta_tolkninger_av_hva_figurene_betyr'
    ],
    must_include: [
      'den offisielle identiteten Ekeberg 2 (Sjømannsskolen) / Familiedalen',
      'at feltet har 13 registrerte figurer',
      'at datering og motivtolkning må behandles kildekritisk'
    ],
    contrast_targets: [
      'ekebergparken',
      'middelalder_oslo'
    ],
    notes: 'Eksterne arkeologiske og lokale kilder skal dominere synlig quizinnhold. År -2500 er bare et teknisk representasjonspunkt for VisitOSLOs brede 4 000–5 000-årsdatering og skal aldri spørres som eksakt år.'
  },
  locatorType: 'poi',
  sourceProvider: 'manual_research',
  sourceObjectId: 'kulturminnesok:41907',
  geocodeAccuracy: 'geometric_center',
  coordRole: 'site_center',
  coordStatus: 'verified_geometry',
  coordSource: 'kulturminnesok_askeladden',
  coordSourceId: 'kulturminnesok:41907',
  coordSourceUrl: 'https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner/collections/lokaliteter/items/41907-1?f=json',
  coordType: 'heritage_site_centroid',
  coordVerifiedAt: '2026-07-20',
  coordNote: 'Representasjonspunkt fra Riksantikvarens offisielle MultiPolygon-geometri for Kulturminne-ID 41907, objekt 41907-1. Punktet representerer helleristningsfeltet ved Sjømannsskolen på Ekeberg, ikke Karlsborgveien, Kongsveien eller Ekebergparken som helhet.',
  externalLinks: [
    {
      type: 'official',
      label: 'Riksantikvaren – offisielt kulturminneobjekt 41907-1',
      url: 'https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner/collections/lokaliteter/items/41907-1?f=json',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    },
    {
      type: 'source',
      label: 'Kulturminnesøk – lokalitet 41907',
      url: 'https://kulturminnesok.no/ra/lokalitet/41907',
      lang: 'nb',
      verifiedAt: '2026-07-20'
    }
  ]
};

mkdirSync(dirname(placePath), { recursive: true });
writeFileSync(placePath, `${JSON.stringify(place, null, 2)}\n`);

const evidence = {
  placeId,
  placeFile: `data/places/${placeRel}`,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordType: place.coordType,
    coordNote: place.coordNote
  },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'Riksantikvaren locality 41907-1, Ekeberg 2 (Sjømannsskolen) / Familiedalen, the registered rock-carving field itself',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'poi',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [
    'direkte offisielt objektoppslag for Riksantikvaren feature 41907-1',
    'offisiell Kulturminne-ID 41907 og identitet ved Sjømannsskolen på Ekeberg',
    'eksplisitt skille fra Ekebergparken og brede områdeankre'
  ],
  evidence: [
    {
      sourceProvider: 'official_heritage_registry',
      sourceName: 'Riksantikvaren – Lokaliteter, Enkeltminner og Sikringssoner OGC API',
      sourceUrl: place.coordSourceUrl,
      sourceObjectId: 'kulturminnesok:41907',
      sourceQuality: 'official_heritage_object_geometry',
      finding: 'Direkte oppslag på feature 41907-1 gir den offisielle lokaliteten Ekeberg 2 (Sjømannsskolen) / Familiedalen med MultiPolygon-geometri og lenke til Kulturminne-ID 41907.',
      canVerifyCoordinate: true,
      reason: place.coordNote
    }
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    {
      sourceProvider: 'official_heritage_registry',
      sourceObjectId: 'kulturminnesok:41907',
      canApplyToPlace: true
    }
  ],
  geometryCandidates: [
    {
      sourceProvider: 'official_heritage_registry',
      sourceObjectId: 'riksantikvaren-feature:41907-1',
      geometryType: 'MultiPolygon',
      canApplyToPlace: true
    }
  ],
  coordinateCandidates: [
    {
      lat: place.lat,
      lon: place.lon,
      coordRole: place.coordRole,
      canApplyToPlace: true
    }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Applied the geometric center of Riksantikvaren feature 41907-1 as the site representation point for the registered Ekeberg rock-carving field.'
  },
  notes: [place.coordNote]
};
mkdirSync(dirname(evidencePath), { recursive: true });
writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

const placeManifest = JSON.parse(readFileSync(placeManifestPath, 'utf8'));
if (!Array.isArray(placeManifest.files)) throw new Error('Place manifest has no files array.');
if (placeManifest.files.includes(placeRel)) throw new Error(`Place manifest already contains ${placeRel}.`);
placeManifest.files.push(placeRel);
writeFileSync(placeManifestPath, `${JSON.stringify(placeManifest, null, 2)}\n`);

const evidenceManifest = JSON.parse(readFileSync(evidenceManifestPath, 'utf8'));
if (!Array.isArray(evidenceManifest.files)) throw new Error('Coordinate evidence manifest has no files array.');
if (evidenceManifest.files.includes(evidenceRel)) throw new Error(`Evidence manifest already contains ${evidenceRel}.`);
evidenceManifest.files.push(evidenceRel);
writeFileSync(evidenceManifestPath, `${JSON.stringify(evidenceManifest, null, 2)}\n`);

let protocol = protocolBefore.replace(
  /Oslo-tabellen inneholder nå \d+ verifiserte eller kildekontrollerte canonical steder\./,
  `Oslo-tabellen inneholder nå ${nextCount} verifiserte eller kildekontrollerte canonical steder.`
);
const row = `| ${nextBatch} | \`${placeId}\` | Helleristningene på Ekeberg | verified_geometry | \`kulturminnesok:41907\` |`;
const tableRows = [...protocol.matchAll(/^\|\s*\d+\s*\|.*$/gm)];
if (!tableRows.length) throw new Error('No coordinate table rows found for protocol insertion.');
const lastRow = tableRows.at(-1);
const insertAt = lastRow.index + lastRow[0].length;
protocol = `${protocol.slice(0, insertAt)}\n${row}${protocol.slice(insertAt)}`;
protocol = `${protocol.trimEnd()}\n\nBatch ${nextBatch} (2026-07-20) produserer \`${placeId}\` som selve det registrerte helleristningsfeltet ved Sjømannsskolen på Ekeberg. Koordinaten er geometrisenteret for Riksantikvarens offisielle MultiPolygon-feature \`41907-1\`, koblet direkte til Kulturminne-ID 41907. Feltet holdes fysisk og semantisk separat fra \`ekebergparken\`, Kongsveien og brede Ekeberg-områdeankre. Den brede dateringen til omtrent 4 000–5 000 år behandles som omtrentlig; place-feltets år -2500 er et teknisk representasjonspunkt og ikke en eksakt arkeologisk datering.\n`;
writeFileSync(protocolPath, protocol);

console.log(`Produced ${placeId} as Oslo coordinate batch ${nextBatch}; verified Oslo count ${currentCount} -> ${nextCount}.`);
rmSync(new URL(import.meta.url));
