import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const VERIFIED_AT = '2026-07-20';

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, data) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
}
function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data.id === 'string') return [data];
  return [];
}
function replaceOnce(text, before, after, label) {
  const first = text.indexOf(before);
  if (first < 0) throw new Error(`${label}: expected text not found`);
  if (text.indexOf(before, first + before.length) >= 0) throw new Error(`${label}: expected exactly one match`);
  return text.slice(0, first) + after + text.slice(first + before.length);
}
function assertNoActivePlaceId(placeId) {
  const hits = [];
  for (const entry of readJson(PLACE_MANIFEST).files || []) {
    const rel = `data/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    for (const row of rowsFrom(readJson(rel))) {
      if (row?.id === placeId) hits.push(rel);
    }
  }
  if (hits.length) throw new Error(`${placeId}: active place already exists in ${hits.join(', ')}`);
}

const historyEmner = [
  'em_his_spor_materialitet',
  'em_his_historiske_lag_i_byrom',
  'em_his_kulturminner_bevaring',
  'em_his_samtid_ettertid_fortelling'
];

const places = [
  {
    file: 'data/places/historie/oslo/places_historie/jodisk_museum_oslo.json',
    evidenceFile: 'data/coordinate-evidence/oslo/historie/jodisk_museum_oslo.json',
    evidenceManifestEntry: 'oslo/historie/jodisk_museum_oslo.json',
    manifestEntry: 'places/historie/oslo/places_historie/jodisk_museum_oslo.json',
    identity: 'Jødisk Museum i Oslo, museums- og kulturminnestedet i den tidligere synagogen i Calmeyers gate 15B',
    overlapNote: 'Stedet er et selvstendig museums- og kulturminnebygg. Koordinatverifikasjonen gjelder den fysiske adressen selv om museets lokaler er stengt for renovering fra 1. mai 2026 med estimert gjenåpning høsten 2028.',
    record: {
      id: 'jodisk_museum_oslo',
      name: 'Jødisk Museum i Oslo',
      lat: 59.916392056400085,
      lon: 10.755266642495423,
      r: 60,
      category: 'historie',
      year: 2005,
      desc: 'Museum og kultursenter for jødisk liv og historie i Norge, med tilhold i den tidligere synagogen i Calmeyers gate 15B siden 2005. Museumsbygget er stengt for renovering fra 1. mai 2026, med estimert gjenåpning høsten 2028.',
      popupDesc: 'Jødisk Museum i Oslo holder til i en tidligere synagoge i Calmeyers gate 15B, et sted med direkte spor etter jødisk liv i førkrigstidens Oslo. Museet begynte å leie første etasje i januar 2005 og startet restaurering av den nedslitte bygningen. Under arbeidet ble originale dekorasjoner og deler av inventaret fra synagogetiden avdekket og bevart. Stedet fungerer derfor både som museum og som et konkret kulturminne i seg selv.\n\nMuseet samler, bevarer, forsker på og formidler jødisk liv og historie i Norge. Fra 1. mai 2026 er selve museumsbygget stengt for en større renovering, med estimert ferdigstillelse høsten 2028. Undervisningsvirksomhet og byvandringer fortsetter utenfor bygget i stengeperioden. I History Go skal stedet fortsatt være et fysisk historisk anker, men spørsmål og beskrivelser må aldri omtale museet som ordinært åpent for drop-in mens renoveringen pågår.',
      emne_ids: historyEmner,
      quiz_profile: {
        place_type: 'museum_og_kulturminne',
        subtype: 'jodisk_museum_i_tidligere_synagoge',
        signature_features: [
          'holder til i en tidligere synagoge i Calmeyers gate 15B',
          'museet har hatt tilhold i første etasje siden 2005',
          'originale dekorasjoner og inventarspor fra synagogetiden er bevart',
          'formidler jødisk liv og historie i Norge',
          'museumsbygget er stengt for renovering fra 1. mai 2026 med estimert gjenåpning høsten 2028'
        ],
        primary_angles: ['jodisk_historie', 'minoritetshistorie', 'religionshistorie', 'kulturminne', 'museumshistorie'],
        question_families: ['historisk_endring', 'kulturminne', 'institusjonshistorie', 'minne_og_identitet', 'kontrast'],
        avoid_angles: ['omtale_museet_som_ordinart_apent_under_renoveringen', 'generisk_holocaustmuseum', 'losrive_museet_fra_synagogebyggets_historie'],
        must_include: [
          'den tidligere synagogen som fysisk historisk lag',
          'museets tilhold og restaureringsarbeid fra 2005',
          'den midlertidige stengingen fra 1. mai 2026 og estimert gjenåpning høsten 2028 når dagens besøksstatus omtales'
        ],
        contrast_targets: ['gronland_politistasjon', 'historisk_museum', 'norges_hjemmefrontmuseum'],
        notes: 'Coordinate verified betyr bare at det fysiske museumsstedet er entydig stedfestet. Det må ikke tolkes som at museet er åpent: selve bygget er stengt for renovering fra 1. mai 2026, mens undervisning og byvandringer fortsetter eksternt.'
      },
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:11019:15B',
      address: { street: 'Calmeyers gate', number: '15B', postcode: '0183', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordSourceId: 'geonorge-adresser-v1:0301:11019:15B',
      coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Calmeyers%20gate%2015B%20Oslo',
      coordType: 'address_point',
      coordVerifiedAt: VERIFIED_AT,
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Calmeyers gate 15B, OSLO. Punktet brukes som display-marker for Jødisk Museum i Oslo i den tidligere synagogebygningen. Koordinatverifikasjonen gjelder det fysiske stedet og innebærer ikke at museumsbygget er åpent under renoveringen 2026–2028.',
      externalLinks: [
        { type: 'official', label: 'Jødisk Museum i Oslo – besøksstatus', url: 'https://www.jodiskmuseumoslo.no/', lang: 'nb', verifiedAt: VERIFIED_AT },
        { type: 'official', label: 'Jødisk Museum i Oslo – museets historie', url: 'https://www.jodiskmuseumoslo.no/museets-historie', lang: 'nb', verifiedAt: VERIFIED_AT }
      ]
    }
  },
  {
    file: 'data/places/kunst/oslo/places_kunst/det_internasjonale_barnekunstmuseet.json',
    evidenceFile: 'data/coordinate-evidence/oslo/kunst/det_internasjonale_barnekunstmuseet.json',
    evidenceManifestEntry: 'oslo/kunst/det_internasjonale_barnekunstmuseet.json',
    manifestEntry: 'places/kunst/oslo/places_kunst/det_internasjonale_barnekunstmuseet.json',
    identity: 'Det internasjonale barnekunstmuseet, museumsinstitusjonen og samlingen i villaen i Lille Frøens vei 4',
    overlapNote: 'Stedet er en selvstendig museumsinstitusjon og fysisk villa. Koordinatverifikasjonen gjelder stedet selv om ordinær publikumsdrift har vært innstilt siden 8. desember 2025 uten fast gjenåpningsdato.',
    record: {
      id: 'det_internasjonale_barnekunstmuseet',
      name: 'Det internasjonale Barnekunstmuseet',
      lat: 59.93569216008246,
      lon: 10.71161396805781,
      r: 60,
      category: 'kunst',
      year: 1986,
      desc: 'Museum for kunst skapt av barn og unge fra hele verden, etablert i 1986. Museet holder til i Lille Frøens vei 4, men ordinære åpningstider har vært innstilt siden 8. desember 2025 etter bortfall av statlig driftsstøtte.',
      popupDesc: 'Det internasjonale Barnekunstmuseet ble etablert i 1986 av Stiftelsen Barnas Historie, Kunst og Kultur, med Rafael og Alla Goldin som sentrale initiativtakere. Museet har bygget opp en internasjonal samling av kunst laget av barn og unge og arbeider for å synliggjøre barns egne uttrykk, perspektiver og kulturelle rettigheter.\n\nMuseet holder til i en villa i Lille Frøens vei 4. Ordinære åpningstider har vært innstilt siden 8. desember 2025 etter at den årlige statlige driftsstøtten falt bort fra 2026. Museet arbeider fortsatt for videreføring og opplyser at normal drift kan gjenopptas dersom finansieringen kommer på plass, men per 20. juli 2026 finnes ingen fast gjenåpningsdato. History Go beholder stedet som et fysisk kunst- og kulturarvanker, men skal ikke presentere det som et ordinært åpent drop-in-museum før status faktisk endres.',
      emne_ids: [
        'em_kunst_institusjonskritikk_og_representasjon',
        'em_kunst_kvalitet_kritikk_og_symbolsk_kapital',
        'em_kunst_hverdagsestetikk'
      ],
      quiz_profile: {
        place_type: 'museum',
        subtype: 'internasjonalt_museum_for_barns_kunst',
        signature_features: [
          'etablert i 1986 av Stiftelsen Barnas Historie, Kunst og Kultur',
          'samler og viser kunst skapt av barn og unge fra mange land',
          'knytter barnekunst til barns stemmer, kultur og rettigheter',
          'holder til i en treetasjes villa i Lille Frøens vei 4',
          'ordinær publikumsdrift har vært innstilt siden 8. desember 2025 uten fast gjenåpningsdato'
        ],
        primary_angles: ['barnekunst', 'representasjon', 'barns_rettigheter', 'museumshistorie', 'kulturarv'],
        question_families: ['institusjonshistorie', 'representasjon', 'kunstbegrep', 'barns_perspektiver', 'kontrast'],
        avoid_angles: ['omtale_museet_som_ordinart_apent_under_driftsstansen', 'redusere_barnekunst_til_hobbyaktivitet', 'generisk_barneaktivitet'],
        must_include: [
          'etableringen i 1986',
          'barns kunst som selvstendig kulturelt uttrykk',
          'den innstilte ordinære publikumsdriften siden 8. desember 2025 når dagens besøksstatus omtales'
        ],
        contrast_targets: ['kunstnernes_hus', 'tbs_gallery', 'nasjonalmuseet'],
        notes: 'Coordinate verified betyr bare at museumsstedet er entydig stedfestet. Ordinære åpningstider er innstilt per 20. juli 2026, og ingen fast gjenåpningsdato skal oppgis før museet selv publiserer en.'
      },
      locatorType: 'building',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:14283:4',
      address: { street: 'Lille Frøens vei', number: '4', postcode: '0371', city: 'Oslo', country: 'NO' },
      geocodeAccuracy: 'rooftop',
      coordRole: 'display_marker',
      coordStatus: 'verified',
      coordSource: 'geonorge_adresser_v1',
      coordSourceId: 'geonorge-adresser-v1:0301:14283:4',
      coordSourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Lille%20Fr%C3%B8ens%20vei%204%20Oslo',
      coordType: 'address_point',
      coordVerifiedAt: VERIFIED_AT,
      coordNote: 'Offisiell adressekoordinat fra Geonorge Adresser API for Lille Frøens vei 4, OSLO. Punktet brukes som display-marker for Det internasjonale Barnekunstmuseets fysiske museumssted. Koordinatverifikasjonen innebærer ikke at ordinær publikumsdrift er gjenopptatt.',
      externalLinks: [
        { type: 'official', label: 'Barnekunstmuseet – besøksstatus', url: 'https://barnekunst.no/besok-oss/', lang: 'nb', verifiedAt: VERIFIED_AT },
        { type: 'official', label: 'Barnekunstmuseet – om museet', url: 'https://barnekunst.no/om-museet/', lang: 'nb', verifiedAt: VERIFIED_AT }
      ]
    }
  }
];

for (const item of places) {
  assertNoActivePlaceId(item.record.id);
  if (fs.existsSync(abs(item.file))) throw new Error(`${item.record.id}: place file already exists`);
  if (fs.existsSync(abs(item.evidenceFile))) throw new Error(`${item.record.id}: evidence file already exists`);
  writeJson(item.file, item.record);

  const p = item.record;
  writeJson(item.evidenceFile, {
    placeId: p.id,
    placeFile: item.file,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: {
      lat: p.lat,
      lon: p.lon,
      r: p.r,
      coordStatus: p.coordStatus,
      coordSource: p.coordSource,
      coordType: p.coordType,
      coordNote: p.coordNote
    },
    identity: {
      currentName: p.name,
      resolvedIdentity: item.identity,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: 'building',
      requiresSplit: false,
      splitReason: ''
    },
    requiredEvidence: ['entydig offisielt adressepunkt', 'offisiell museumsidentitet', 'eksplisitt skille mellom fysisk koordinatstatus og aktuell besøksstatus'],
    evidence: [
      {
        sourceProvider: 'official_address',
        sourceName: 'geonorge_adresser_v1',
        sourceUrl: p.coordSourceUrl,
        sourceObjectId: p.sourceObjectId,
        sourceQuality: 'official_address_plus_documented_identity',
        finding: `Geonorge gir et entydig offisielt adressepunkt for ${p.address.street} ${p.address.number} Oslo. ${item.overlapNote}`,
        canVerifyCoordinate: true,
        reason: p.coordNote
      }
    ],
    addressCandidates: [{ address: `${p.address.street} ${p.address.number} Oslo`, sourceProvider: 'official_address', sourceObjectId: p.sourceObjectId, canApplyToPlace: true }],
    sourceObjectCandidates: [{ sourceProvider: 'official_address', sourceObjectId: p.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: p.lat, lon: p.lon, coordRole: p.coordRole, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Fysisk koordinat og identitet er anvendt på canonical place; besøksstatus må vedlikeholdes separat i stedsinnholdet.' },
    notes: [p.coordNote, item.overlapNote]
  });
}

const placeManifest = readJson(PLACE_MANIFEST);
for (const item of places) {
  if (placeManifest.files.includes(item.manifestEntry)) throw new Error(`${item.manifestEntry}: already in place manifest`);
  placeManifest.files.push(item.manifestEntry);
}
writeJson(PLACE_MANIFEST, placeManifest);

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const item of places) {
  if (evidenceManifest.files.includes(item.evidenceManifestEntry)) throw new Error(`${item.evidenceManifestEntry}: already in evidence manifest`);
  evidenceManifest.files.push(item.evidenceManifestEntry);
}
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
protocol = replaceOnce(
  protocol,
  'Oslo-tabellen inneholder nå 193 verifiserte eller kildekontrollerte canonical steder. Batch 48 legger til TBS Gallery, The Viking Planet Oslo og The Salmon kunnskapssenter med entydige offisielle Geonorge-adressepunkter og eksplisitt avgrensede institusjonsidentiteter. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 37.',
  'Oslo-tabellen inneholder nå 195 verifiserte eller kildekontrollerte canonical steder. Batch 49 legger til Jødisk Museum i Oslo og Det internasjonale Barnekunstmuseet med entydige offisielle Geonorge-adressepunkter, samtidig som protokollen skiller fysisk koordinatverifikasjon fra midlertidig stengt publikumsdrift. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 37.',
  'Oslo summary'
);
protocol = replaceOnce(
  protocol,
  '| 48 | `the_salmon_vitensenter` | The Salmon – kunnskapssenter | verified | `geonorge-adresser-v1:0301:21458:11` |',
  '| 48 | `the_salmon_vitensenter` | The Salmon – kunnskapssenter | verified | `geonorge-adresser-v1:0301:21458:11` |\n| 49 | `jodisk_museum_oslo` | Jødisk Museum i Oslo | verified | `geonorge-adresser-v1:0301:11019:15B` |\n| 49 | `det_internasjonale_barnekunstmuseet` | Det internasjonale Barnekunstmuseet | verified | `geonorge-adresser-v1:0301:14283:4` |',
  'Batch 49 rows'
);
protocol = replaceOnce(
  protocol,
  'Batch 48 (2026-07-20) produserer tre stabile besøkssteder fra museumsauditens grensesone. `tbs_gallery` bruker Oscars gate 23 og modelleres som permanent kunstnersenter i et historisk villa- og stallanlegg, ikke som et tilfeldig kommersielt salgsgalleri. `viking_planet_oslo` bruker Fridtjof Nansens plass 4 og holdes fysisk separat fra Rådhusplassen og institusjonelt separat fra Vikingtidsmuseet på Bygdøy; den digitale formidlingen skal behandles kildekritisk. `the_salmon_vitensenter` bruker Strandpromenaden 11 og representerer det gratis kunnskapssenteret om havbruk, ikke restaurantdelen eller hele Tjuvholmen.',
  'Batch 48 (2026-07-20) produserer tre stabile besøkssteder fra museumsauditens grensesone. `tbs_gallery` bruker Oscars gate 23 og modelleres som permanent kunstnersenter i et historisk villa- og stallanlegg, ikke som et tilfeldig kommersielt salgsgalleri. `viking_planet_oslo` bruker Fridtjof Nansens plass 4 og holdes fysisk separat fra Rådhusplassen og institusjonelt separat fra Vikingtidsmuseet på Bygdøy; den digitale formidlingen skal behandles kildekritisk. `the_salmon_vitensenter` bruker Strandpromenaden 11 og representerer det gratis kunnskapssenteret om havbruk, ikke restaurantdelen eller hele Tjuvholmen.\n\nBatch 49 (2026-07-20) fullfører de to status-sensitive standardkandidatene fra museumsauditen. `jodisk_museum_oslo` bruker Calmeyers gate 15B som fysisk museums- og kulturminneanker; museumsbygget er stengt for renovering fra 1. mai 2026 med estimert gjenåpning høsten 2028, men undervisning og byvandringer fortsetter utenfor bygget. `det_internasjonale_barnekunstmuseet` bruker Lille Frøens vei 4 som fysisk museumsanker; ordinære åpningstider har vært innstilt siden 8. desember 2025 og det finnes per 20. juli 2026 ingen fast gjenåpningsdato. `verified` i denne tabellen gjelder koordinat og fysisk identitet, ikke aktuell publikumsåpning.',
  'Batch 49 note'
);
protocol = replaceOnce(
  protocol,
  'Disse kontrollene er fullført, men teller ikke blant de 193 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 195 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'needs_review count reference'
);
fs.writeFileSync(abs(PROTOCOL), protocol);

fs.unlinkSync(abs('scripts/coordinate-branch-job.mjs'));
console.log('Created Oslo museum production batch 49 with two status-sensitive physical places, evidence files, manifests and protocol rows.');
