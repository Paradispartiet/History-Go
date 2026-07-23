import fs from 'node:fs';
import path from 'node:path';
import { findNorwegianAddressCoordinate } from '../../dist/tools/address-first-coordinate-finder.mjs';

const candidates = [
  {
    id: 'figurteatret_i_nordland',
    path: 'data/places/scenekunst/nordland/figurteatret_i_nordland.json',
    manifestPath: 'places/scenekunst/nordland/figurteatret_i_nordland.json',
    query: 'J M Johansens vei 23 Stamsund',
    expected: {
      street: 'J M Johansens vei',
      number: '23',
      postcode: '8340',
      city: 'STAMSUND',
    },
    base: {
      id: 'figurteatret_i_nordland',
      name: 'Figurteatret i Nordland',
      aliases: ['Nordland Visual Theatre', 'Figurteateret i Nordland', 'FiN'],
      visual: { designCode: 'theatre_miniature' },
      r: 80,
      category: 'scenekunst',
      secondaryBadgeIds: ['kunst'],
      fylke: 'nordland',
      kommune: 'Vestvågøy',
      period: 'Internasjonalt produksjonsteater for figurteater, visuell scenekunst og residensarbeid',
      desc: 'Prosjektorientert teater og produksjonsmiljø i Stamsund for figurteater, visuell scenekunst, residens og internasjonale samarbeid.',
      popupDesc: 'Figurteatret i Nordland ble etablert i 1991 og utvikler forestillinger sammen med kunstnere og kompanier fra Norge og utlandet. Arbeidet spenner fra tradisjonelt dukketeater til scenekunst som kombinerer objekter, billedkunst, skuespill, dans, lyd og multimedia. Huset i J. M. Johansens vei 23 rommer produksjon, prøver, verkstedarbeid og offentlige visninger, og fungerer som en sentral faglig infrastruktur for figurteaterfeltet.',
      tags: ['figurteater', 'visuell_scenekunst', 'residens', 'samproduksjon', 'stamsund', 'internasjonalt'],
      emne_ids: [
        'em_scenekunst_dramaturgi_iscenesettelse',
        'em_scenekunst_regi_scenografi',
        'em_scenekunst_publikum_fjerde_vegg',
      ],
      physicalScope: 'Figurteatrets scene-, prøve-, verksted-, produksjons- og publikumsfunksjoner i J. M. Johansens vei 23. Turnéspillesteder, festivalarenaer og den planlagte framtidige utviklingen av andre bygg i Stamsund inngår ikke i samme markør.',
      quiz_profile: {
        place_type: 'prosjektteater_for_figurteater_og_visuell_scenekunst',
        subtype: 'produksjon_residens_samproduksjon_og_visning',
        signature_features: [
          'etablert i Stamsund i 1991',
          'prosjektteater uten fast skuespillerensemble',
          'kombinerer figurteater med billedkunst, dans og multimedia',
        ],
        primary_angles: ['figurteater', 'visuell_dramaturgi', 'objektteater', 'internasjonal_samproduksjon'],
        question_families: ['institusjon', 'kunstbegrep', 'arbeidsprosess', 'sceneformat'],
        avoid_angles: ['redusere_til_barneteater', 'forveksle_med_hele_stamsund_teaterfestival'],
        must_include: ['figurens og objektets sceniske funksjon', 'prosjektteatrets internasjonale produksjonsmodell'],
        contrast_targets: ['nordland_teater', 'teater_nor_stamsund'],
        notes: 'Spør om hvordan objekter, figurer og visuelle virkemidler kan bære dramaturgi og skuespillerfunksjoner.',
      },
      knowledge: {
        one_liner: 'Figurteatret i Nordland er et internasjonalt produksjonsteater for figurteater og visuell scenekunst i Stamsund.',
        why_it_matters: [
          'Teatret har gjort Stamsund til et internasjonalt produksjonssted for en scenekunstform som ellers har få permanente institusjoner i Norge.',
          'Prosjektmodellen kobler kunstnere, verksteder, residens og turné i én produksjonskjede.',
        ],
        what_to_notice: [
          'Hvordan figurer, objekter og scenografi kan opptre som dramatiske aktører.',
          'Sammenhengen mellom verksted, prøverom og visningsrom.',
          'At produksjonene ofte utvikles på tvers av språk og kunstformer.',
        ],
        terms: ['figurteater', 'objektteater', 'visuell_dramaturgi', 'samproduksjon'],
        sources: [
          'https://figurteateret.no/',
          'https://figurteateret.no/figurteateret/kontakt/',
          'https://sceneweb.no/nb/organisation/2786/Figurteatret_i%20Nordland',
        ],
      },
      year: 1991,
    },
  },
  {
    id: 'teater_nor_stamsund',
    path: 'data/places/scenekunst/nordland/teater_nor_stamsund.json',
    manifestPath: 'places/scenekunst/nordland/teater_nor_stamsund.json',
    query: 'J M Johansens vei 97 Stamsund',
    expected: {
      street: 'J M Johansens vei',
      number: '97',
      postcode: '8340',
      city: 'STAMSUND',
    },
    base: {
      id: 'teater_nor_stamsund',
      name: 'Teater NOR – Stamsund Teaterfestival',
      aliases: ['Teater NOR', 'Stamsund Teaterfestival', 'Stamsund Internasjonale Teater'],
      visual: { designCode: 'theatre_miniature' },
      r: 80,
      category: 'scenekunst',
      secondaryBadgeIds: ['subkultur'],
      fylke: 'nordland',
      kommune: 'Vestvågøy',
      period: 'Kunstnerdrevet samtidsscenekunst, produksjon og internasjonal festival',
      desc: 'Kunstnerdrevet teaterbase og festivalhus i Stamsund for eksperimentell, tverrkunstnerisk og internasjonal scenekunst.',
      popupDesc: 'Teater NOR har arbeidet fra Stamsund siden 1990 med eksperimentell scenekunst og møter mellom teater, performance og andre kunstformer. Fra huset i J. M. Johansens vei 97 organiseres også Stamsund Teaterfestival, som hvert år gjør fiskeværet til arena for norsk og internasjonal samtidsscenekunst. Markøren gjelder den faste teaterbasen og scenene ved huset, ikke festivalens mange midlertidige spillesteder rundt i Stamsund.',
      tags: ['fri_scenekunst', 'performance', 'teaterfestival', 'kunstnerdrevet', 'stamsund', 'tverrkunstnerisk'],
      emne_ids: [
        'em_scenekunst_dramaturgi_iscenesettelse',
        'em_scenekunst_regi_scenografi',
        'em_scenekunst_publikum_fjerde_vegg',
      ],
      physicalScope: 'Teater NORs faste scene-, prøve-, kontor- og publikumsfunksjoner i J. M. Johansens vei 97. Festivalens midlertidige arenaer, kaier, butikker, uterom og Figurteatret i Nordland på nummer 23 er egne steder og inngår ikke.',
      quiz_profile: {
        place_type: 'kunstnerdrevet_teater_og_festivalbase',
        subtype: 'eksperimentell_samtidsscenekunst_og_stedsspesifikk_festival',
        signature_features: [
          'Teater NOR etablert i Stamsund i 1990',
          'fast teaterbase kombinert med årlig internasjonal festival',
          'festivalen bruker hele fiskeværet som utvidet scenisk landskap',
        ],
        primary_angles: ['fri_scenekunst', 'performance', 'festivaldramaturgi', 'stedsspesifikt_teater'],
        question_families: ['institusjon', 'kulturgeografi', 'publikumsrolle', 'kunstbegrep'],
        avoid_angles: ['forveksle_fast_hus_med_alle_festivalarenaer', 'forveksle_med_figurteatret_i_nordland'],
        must_include: ['forholdet mellom fast produksjonsbase og midlertidige festivalrom', 'den kunstnerdrevne og eksperimentelle profilen'],
        contrast_targets: ['figurteatret_i_nordland', 'halogaland_teater'],
        notes: 'Spør om hvordan et lite sted kan bli internasjonal scene gjennom kombinasjonen av fast hus og midlertidige rom.',
      },
      knowledge: {
        one_liner: 'Teater NOR er en kunstnerdrevet base som lar Stamsund Teaterfestival utvide scenekunsten fra teaterhuset til hele fiskeværet.',
        why_it_matters: [
          'Stedet viser hvordan fri scenekunst kan utvikle varig infrastruktur langt fra de største byene.',
          'Festivalen kobler lokale rom og landskap til internasjonale kunstnerskap og nye publikumsformer.',
        ],
        what_to_notice: [
          'Forskjellen mellom den faste teaterbasen og festivalens skiftende arenaer.',
          'Hvordan nærmiljø, havn og industribygninger brukes dramaturgisk.',
          'Den korte avstanden til Figurteatret i Nordland, men at institusjonene har ulike roller.',
        ],
        terms: ['fri_scenekunst', 'festivaldramaturgi', 'stedsspesifikk_scenekunst', 'kunstnerdrevet'],
        sources: [
          'https://stamfest.no/nb/',
          'https://stamfest.no/2026/nb/kontakt/',
          'https://teaternor.com/tn/default.asp?cmd=200',
        ],
      },
      year: 1990,
    },
  },
  {
    id: 'kvaaniteatteri_halti_kulturscene',
    path: 'data/places/scenekunst/troms/kvaaniteatteri_halti_kulturscene.json',
    manifestPath: 'places/scenekunst/troms/kvaaniteatteri_halti_kulturscene.json',
    query: 'Hovedvegen 2 Storslett',
    expected: {
      street: 'Hovedvegen',
      number: '2',
      postcode: '9151',
      city: 'STORSLETT',
    },
    base: {
      id: 'kvaaniteatteri_halti_kulturscene',
      name: 'Kvääniteatteri – Halti kulturscene',
      aliases: ['Kvääniteatteri', 'Kventeateret', 'Halti kulturscene'],
      visual: { designCode: 'theatre_miniature' },
      r: 80,
      category: 'scenekunst',
      secondaryBadgeIds: ['historie'],
      fylke: 'troms',
      kommune: 'Nordreisa',
      period: 'Profesjonelt kvensk minoritetsteater med base i Nord-Troms',
      desc: 'Kvääniteatteris base ved Halti i Storslett for utvikling, produksjon og formidling av kvensk scenekunst.',
      popupDesc: 'Kvääniteatteri ble stiftet som eget selskap i 2022 og arbeider for å utvikle kvensk språk, identitet, historie og samtidskunst gjennom teater. Institusjonen er etablert i tilknytning til Halti i Nordreisa og bruker Halti kulturscene som lokal publikumsarena, samtidig som produksjonene turnerer i kvenske kjerneområder og andre deler av Norge og Nordkalotten.',
      tags: ['kvensk', 'minoritetsteater', 'sprak', 'identitet', 'nord_troms', 'turne'],
      emne_ids: [
        'em_scenekunst_dramaturgi_iscenesettelse',
        'em_scenekunst_teaterinstitusjon_repertoar',
        'em_scenekunst_publikum_fjerde_vegg',
      ],
      physicalScope: 'Kvääniteatteris faste base og publikumsfunksjon ved Halti kulturscene, Hovedvegen 2. Haltis museums-, biblioteks- og øvrige kulturfunksjoner samt teatrets turnéspillesteder i kvenske områder inngår ikke i samme markør.',
      quiz_profile: {
        place_type: 'nasjonalt_orientert_minoritetsteater',
        subtype: 'kvensk_sprak_identitet_og_turnerende_scenekunst',
        signature_features: [
          'eget teaterselskap stiftet i 2022',
          'base ved Halti i Nordreisa',
          'utvikler kvensk språk og kultur gjennom profesjonell scenekunst',
        ],
        primary_angles: ['minoritetsteater', 'kvensk_sprak', 'identitetsarbeid', 'turneteater'],
        question_families: ['institusjon', 'kulturgeografi', 'sprak_og_identitet', 'samfunnsrolle'],
        avoid_angles: ['framstille_som_kun_lokal_amatorvirksomhet', 'forveksle_teatret_med_hele_halti'],
        must_include: ['det kvenske språket som kunstnerisk materiale', 'teatrets regionale base og nasjonale minoritetsoppdrag'],
        contrast_targets: ['beaivvas_coarvematta', 'samovarteateret_sor_varanger_kultursal'],
        notes: 'Spør om hvordan scenekunst kan være både språkpolitikk, identitetsbygging og kunstnerisk nyskaping.',
      },
      knowledge: {
        one_liner: 'Kvääniteatteri utvikler kvensk språk og identitet gjennom profesjonell scenekunst med base ved Halti i Storslett.',
        why_it_matters: [
          'Teatret gir den kvenske nasjonale minoriteten en profesjonell scenekunstinstitusjon med eget kunstnerisk perspektiv.',
          'Turnémodellen knytter basen i Nordreisa til kvenske miljøer i flere fylker og på Nordkalotten.',
        ],
        what_to_notice: [
          'Hvordan kvensk språk brukes på scenen og i publikumsarbeidet.',
          'Sammenhengen mellom teater, kulturarv og nåtidige minoritetserfaringer.',
          'At Halti er en flerfunksjonell institusjon, mens markøren gjelder teatrets scenekunstfunksjon.',
        ],
        terms: ['minoritetsteater', 'kvensk', 'sprakrevitalisering', 'turneteater'],
        sources: [
          'https://kvaaniteatteri.no/',
          'https://kvaaniteatteri.no/om-kvaaniteatteri/',
          'https://kvaaniteatteri.no/program/international-theatre-afternoon/',
        ],
      },
      year: 2022,
    },
  },
  {
    id: 'ras_sandnes_kulturhus',
    path: 'data/places/scenekunst/rogaland/ras_sandnes_kulturhus.json',
    manifestPath: 'places/scenekunst/rogaland/ras_sandnes_kulturhus.json',
    query: 'Mauritz Kartevolds plass 1 Sandnes',
    expected: {
      street: 'Mauritz Kartevolds plass',
      number: '1',
      postcode: '4306',
      city: 'SANDNES',
    },
    base: {
      id: 'ras_sandnes_kulturhus',
      name: 'RAS – Regional Arena for Samtidsdans',
      aliases: ['RAS', 'Regional Arena for Samtidsdans', 'RAS Sandnes'],
      visual: { designCode: 'theatre_miniature' },
      r: 80,
      category: 'scenekunst',
      secondaryBadgeIds: ['kunst'],
      fylke: 'rogaland',
      kommune: 'Sandnes',
      period: 'Programmerende og produserende regional scene for samtidsdans',
      desc: 'Regional scene og kompetansesenter i Sandnes Kulturhus for samtidsdans, residens, produksjon og publikumsmøter.',
      popupDesc: 'RAS er en programmerende og produserende scene og et regionalt kompetansesenter for dans. Fra Sandnes Kulturhus presenterer RAS lokal, nasjonal og internasjonal dansekunst, legger til rette for residensopphold og åpner kunstneriske prosesser gjennom arbeidsvisninger, samtaler og seminarer. Hovedmarkøren ligger ved kulturhuset, der RAS bruker både stor og liten sal.',
      tags: ['samtidsdans', 'koreografi', 'residens', 'produksjon', 'sandnes', 'kompetansesenter'],
      emne_ids: [
        'em_scenekunst_dans_koreografi',
        'em_scenekunst_dramaturgi_iscenesettelse',
        'em_scenekunst_publikum_fjerde_vegg',
      ],
      physicalScope: 'RAS sin hovedbase og bruk av stor og liten sal i Sandnes Kulturhus, Mauritz Kartevolds plass 1. KinoKino i Olav Kyrres gate, samarbeidsscener, turnéarenaer og kulturhusets øvrige musikk- og konferansefunksjoner inngår ikke i samme markør.',
      quiz_profile: {
        place_type: 'regional_scene_og_kompetansesenter_for_dans',
        subtype: 'programmering_produksjon_residens_og_formidling',
        signature_features: [
          'regional arena for samtidsdans i Sandnes',
          'bruker både stor og liten sal i kulturhuset',
          'kombinerer forestillinger, residens og åpne arbeidsprosesser',
        ],
        primary_angles: ['samtidsdans', 'koreografi', 'residens', 'publikumsutvikling'],
        question_families: ['institusjon', 'kunstbegrep', 'arbeidsprosess', 'sceneformat'],
        avoid_angles: ['redusere_til_generelt_kulturhus', 'forveksle_med_alle_arrangementer_i_sandnes_kulturhus'],
        must_include: ['samtidsdans som hovedfelt', 'koblingen mellom produksjon, residens og offentlig visning'],
        contrast_targets: ['studio_bergen_carte_blanche', 'rimi_imir_scenekunst'],
        notes: 'Spør om hvordan en regional dansearena støtter både ferdige forestillinger og kunstneriske prosesser.',
      },
      knowledge: {
        one_liner: 'RAS gjør Sandnes Kulturhus til en regional hovedarena for samtidsdans, residens og koreografisk utvikling.',
        why_it_matters: [
          'Arenaen gir dansekunstnere produksjons- og visningsmuligheter utenfor de største nasjonale institusjonene.',
          'Publikum møter både ferdige verk og prosesser under utvikling.',
        ],
        what_to_notice: [
          'Hvordan salene tilpasses kropp, bevegelse og ulike publikumsoppsett.',
          'At arbeidsvisninger og samtaler er en del av formidlingen.',
          'Forskjellen mellom RAS-programmet og kulturhusets øvrige arrangementer.',
        ],
        terms: ['samtidsdans', 'koreografi', 'residens', 'arbeidsvisning'],
        sources: [
          'https://www.sandnes-kulturhus.no/ras-dans/regional-arena-for-dans/',
          'https://www.sandnes-kulturhus.no/ras-dans/',
          'https://www.sandnes-kulturhus.no/informasjon/praktisk-informasjon/',
        ],
      },
    },
  },
  {
    id: 'parkteatret_moss',
    path: 'data/places/scenekunst/ostfold/parkteatret_moss.json',
    manifestPath: 'places/scenekunst/ostfold/parkteatret_moss.json',
    query: 'Dronningens gate 25 Moss',
    expected: {
      street: 'Dronningens gate',
      number: '25',
      postcode: '1530',
      city: 'MOSS',
    },
    base: {
      id: 'parkteatret_moss',
      name: 'Parkteatret Moss',
      aliases: ['Moss Kulturhus – Parkteatret', 'Parkteatret'],
      visual: { designCode: 'theatre_miniature' },
      r: 80,
      category: 'scenekunst',
      secondaryBadgeIds: ['by'],
      fylke: 'ostfold',
      kommune: 'Moss',
      period: 'Regional teatersal for turnéteater, scenekunst, konserter og lokale produksjoner',
      desc: 'Moss Kulturhus sin faste teatersal med amfi, scene og publikumsfunksjoner for turnerende og lokal scenekunst.',
      popupDesc: 'Parkteatret er Moss Kulturhus sin teatersal i Dronningens gate 25. Salen har fast amfi med parkett, balkong og losje og brukes til teater, konserter, humor, dans og andre sceniske formater. Den er et fast stoppested for turnerende produksjoner og fungerer samtidig som publikumsarena for regionale og lokale aktører.',
      tags: ['teatersal', 'gjestespill', 'turneteater', 'moss', 'flerbruksscene', 'publikumsarena'],
      emne_ids: [
        'em_scenekunst_teaterinstitusjon_repertoar',
        'em_scenekunst_regi_scenografi',
        'em_scenekunst_publikum_fjerde_vegg',
      ],
      physicalScope: 'Parkteatrets teatersal, scene, amfi, balkong, losje, backstage, foajé og publikumsfunksjoner i Dronningens gate 25. Moss Samfunnshus i Kirkegata 13 og kulturhusadministrasjonen i Storgata 25 er separate steder.',
      quiz_profile: {
        place_type: 'kommunal_regional_teatersal',
        subtype: 'gjestespill_turneteater_konsert_og_lokal_produksjon',
        signature_features: [
          'fast teatersal i Dronningens gate 25',
          'amfi med parkett, balkong og losje',
          'regional arena for både turnerende og lokale produksjoner',
        ],
        primary_angles: ['gjestespill', 'turneteater', 'publikumsrom', 'kommunal_kulturinfrastruktur'],
        question_families: ['sceneformat', 'institusjon', 'publikumsrolle', 'kulturgeografi'],
        avoid_angles: ['forveksle_med_parkteatret_oslo', 'forveksle_med_moss_samfunnshus'],
        must_include: ['rollen som fast teatersal i Moss', 'kombinasjonen av turnerende og lokalt produsert scenekunst'],
        contrast_targets: ['fredrikshalds_teater', 'ostfold_teater'],
        notes: 'Spør om hvordan en regional teatersal gjør turnerende scenekunst tilgjengelig uten å være et eget produserende ensembleteater.',
      },
      knowledge: {
        one_liner: 'Parkteatret er Moss sin faste teatersal for gjestespill, turnéteater og lokale sceniske produksjoner.',
        why_it_matters: [
          'Scenen gir byen regelmessig tilgang til profesjonell turnerende scenekunst.',
          'Den faste salstrukturen gjør det mulig å ta imot produksjoner med omfattende lys-, lyd- og scenetekniske behov.',
        ],
        what_to_notice: [
          'Oppbygningen med parkett, balkong og losje.',
          'Hvordan foajé, backstage og scene inngår i samme publikums- og produksjonsløp.',
          'At Parkteatret og Samfunnshuset er to forskjellige kulturhusadresser.',
        ],
        terms: ['gjestespill', 'turneteater', 'amfi', 'flerbruksscene'],
        sources: [
          'https://www.mosskulturhus.no/parkteatret/',
          'https://www.mosskulturhus.no/teknisk-info/',
          'https://www.mosskulturhus.no/praktisk-info/',
        ],
      },
    },
  },
];

const norm = (value) => String(value ?? '')
  .normalize('NFC')
  .toUpperCase()
  .replace(/[.,]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const displayCity = (value) => {
  const s = String(value ?? '').toLocaleLowerCase('nb-NO');
  return s.replace(/(^|[\s-])\p{L}/gu, (m) => m.toLocaleUpperCase('nb-NO'));
};

const existingIndex = JSON.parse(fs.readFileSync('data/places/places_index.json', 'utf8'));
const existingIds = new Set(existingIndex.map((place) => place?.id).filter(Boolean));
for (const candidate of candidates) {
  if (existingIds.has(candidate.id)) throw new Error(`${candidate.id}: id already exists in canonical places index`);
}

const coordinateResults = [];
for (const candidate of candidates) {
  const result = await findNorwegianAddressCoordinate(candidate.query);
  if (!result.ok || result.status !== 'verified_candidate' || !result.coordinate) {
    throw new Error(`${candidate.id}: Geonorge lookup failed: ${JSON.stringify(result)}`);
  }

  const got = result.coordinate.address;
  for (const key of ['street', 'number', 'postcode', 'city']) {
    if (norm(got[key]) !== norm(candidate.expected[key])) {
      throw new Error(`${candidate.id}: expected ${key}=${candidate.expected[key]}, got ${got[key]}`);
    }
  }

  const overlaps = existingIndex
    .filter((place) =>
      typeof place?.lat === 'number' &&
      typeof place?.lon === 'number' &&
      Math.abs(place.lat - result.coordinate.lat) < 1e-12 &&
      Math.abs(place.lon - result.coordinate.lon) < 1e-12
    )
    .map((place) => place.id);

  if (overlaps.length) {
    throw new Error(`${candidate.id}: exact coordinate overlaps existing canonical ids: ${overlaps.join(', ')}`);
  }

  const address = { ...result.coordinate.address, city: displayCity(result.coordinate.address.city) };
  const place = {
    ...candidate.base,
    lat: result.coordinate.lat,
    lon: result.coordinate.lon,
    coordType: 'address_point',
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordSourceUrl: result.sourceUrl,
    coordVerifiedAt: '2026-07-23',
    coordNote: `Offisiell adressekoordinat fra Geonorge Adresser API for ${address.street} ${address.number}, ${address.city}. Punktet representerer den fysisk avgrensede scenekunstfunksjonen og brukes som display-marker.`,
    locatorType: 'building',
    sourceProvider: 'official_address',
    sourceObjectId: result.sourceObjectId,
    address,
    geocodeAccuracy: 'rooftop',
    coordRole: 'display_marker',
    coLocationAudit: {
      status: 'reviewed',
      nearbyCanonicalIds: overlaps,
      intentionalSharedAnchor: false,
      note: 'Ingen eksisterende canonical place-record deler det eksakte adressepunktet.',
    },
  };

  fs.mkdirSync(path.dirname(candidate.path), { recursive: true });
  fs.writeFileSync(candidate.path, JSON.stringify([place], null, 2) + '\n');
  coordinateResults.push({
    id: candidate.id,
    query: candidate.query,
    sourceUrl: result.sourceUrl,
    sourceObjectId: result.sourceObjectId,
    coordinate: { lat: result.coordinate.lat, lon: result.coordinate.lon },
    address,
    exactOverlapIds: overlaps,
    overlapDecision: 'no_overlap',
  });
}

const manifestPath = 'data/places/manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
for (const candidate of candidates) {
  if (!manifest.files.includes(candidate.manifestPath)) manifest.files.push(candidate.manifestPath);
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

const generatedAt = new Date().toISOString();
const report = {
  generatedAt,
  status: 'validated',
  category: 'scenekunst',
  batch: 'new_venues_8',
  baseCommit: 'current_main_resilient_builder',
  addedPlaceIds: candidates.map((candidate) => candidate.id),
  sourceFiles: candidates.map((candidate) => candidate.manifestPath),
  officialInstitutionSources: Object.fromEntries(candidates.map((candidate) => [candidate.id, candidate.base.knowledge.sources])),
  coordinateResults,
  physicalScopeDecisions: Object.fromEntries(candidates.map((candidate) => [candidate.id, candidate.base.physicalScope])),
  validation: {
    geonorgeExactAddressLookup: 'pass',
    overlapAudit: 'pass',
    placesIndexBuild: 'pending',
    placesChecks: 'pending',
    categoryAudit: 'pending',
    fullRepositoryGates: 'pending',
  },
  validatedAt: generatedAt,
};

const reportJson = 'reports/scenekunst-new-venues-batch-8-2026-07-23.json';
const reportMd = 'reports/scenekunst-new-venues-batch-8-2026-07-23.md';
fs.writeFileSync(reportJson, JSON.stringify(report, null, 2) + '\n');

const md = [
  '# Scenekunst – nye nasjonale steder, batch 8',
  '',
  `Generert: ${generatedAt}`,
  '',
  '## Nye steder',
  '',
  ...candidates.map((candidate) => `- \`${candidate.id}\` – ${candidate.base.name}`),
  '',
  '## Koordinater',
  '',
  ...coordinateResults.map((item) =>
    `- ${item.id}: ${item.address.street} ${item.address.number}, ${item.address.city} → \`${item.coordinate.lat}, ${item.coordinate.lon}\` (${item.sourceObjectId})`
  ),
  '',
  '## Fysisk avgrensning',
  '',
  ...candidates.map((candidate) => `- **${candidate.base.name}:** ${candidate.base.physicalScope}`),
  '',
  '## Valideringskrav',
  '',
  '- Eksakt Geonorge-adresse for alle fem steder',
  '- Ingen eksakte overlapper mot eksisterende canonical steder',
  '- Regenerert global place-indeks',
  '- Places- og People-kontroll',
  '- Kategori- og quiz-governance',
  '- Knowledge V2, Nature og Lesespor',
  '- `git diff --check`',
  '',
].join('\n');
fs.writeFileSync(reportMd, md);
