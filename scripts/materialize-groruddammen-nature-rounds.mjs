import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, value) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`);
};
const source = (title, url) => ({ title, url });

const placeId = 'groruddammen';
const placePath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/groruddammen.json';
const routeManifestPath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute_manifest.json';
const quizPath = 'data/quiz/natur/groruddammen_sets.json';
const storyPath = 'data/stories/stories_groruddammen.json';
const articlePath = 'data/leksikon/places/oslo/natur/leksikon_groruddammen.json';
const reportPath = 'reports/groruddammen-nature-rounds-batch1.md';
const testPath = 'tests/groruddammen-nature-rounds-batch1.test.js';

const mapFiles = [
  'data/natur/nature_place_map.json',
  'data/natur/nature_bird_place_map.json',
  'data/natur/nature_oslo_expansion_place_map.json',
  'data/natur/nature_routes_place_map.json',
  'data/natur/nature_etne_place_map.json'
];
const union = { flora: [], fauna: [] };
for (const file of mapFiles) {
  const raw = readJson(file);
  const entry = (raw.places || raw)[placeId];
  if (!entry) continue;
  union.flora.push(...(entry.flora || []));
  union.fauna.push(...(entry.fauna || []));
}
union.flora = [...new Set(union.flora)].sort();
union.fauna = [...new Set(union.fauna)].sort();
const expectedFlora = ['emne_gress_aakerkvein'];
const expectedFauna = ['emne_fauna_stokkand'];
if (JSON.stringify(union.flora) !== JSON.stringify(expectedFlora) || JSON.stringify(union.fauna) !== JSON.stringify(expectedFauna)) {
  throw new Error(`Uventet artsunion: ${JSON.stringify(union)}`);
}

const grass = readJson('data/natur/flora/gress.json').find(x => x.id === expectedFlora[0]);
const mallard = readJson('data/natur/fauna/fugler_by.json').find(x => x.id === expectedFauna[0]);
if (!grass || !mallard) throw new Error('Fant ikke artskortene for Groruddammen');

const refs = {
  kommunePark: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/grorudparken',
  byleksPark: 'https://oslobyleksikon.no/side/Grorudparken',
  byleksAlna: 'https://oslobyleksikon.no/side/Alnaelva',
  elveforum: 'https://www.osloelveforum.org/om-alnaelva/',
  overvann: 'https://www.oslo.kommune.no/vann-og-avlop/handtering-av-overvann-og-oversvommelser/relevante-dokumenter-om-overvann-og-overvannshandtering/',
  grorudStation: 'https://magasin.oslo.kommune.no/byplan/neste-stopp-grorud-stasjon',
  routeMap: 'data/natur/nature_routes_place_map.json',
  grassData: 'data/natur/flora/gress.json',
  birdData: 'data/natur/fauna/fugler_by.json'
};
const commonSources = [
  source('Oslo kommune: Grorudparken', refs.kommunePark),
  source('Oslo byleksikon: Grorudparken', refs.byleksPark),
  source('Oslo byleksikon: Alnaelva', refs.byleksAlna),
  source('Oslo Elveforum: Om Alnaelva', refs.elveforum),
  source('Oslo kommune: styrende dokumenter om overvann', refs.overvann),
  source('Oslo kommune: Neste stopp, Grorud stasjon!', refs.grorudStation),
  source('History Go: aktive naturrutekoblinger', refs.routeMap),
  source('History Go: gressarter', refs.grassData),
  source('History Go: byfugler', refs.birdData)
];

const oldPlace = readJson(placePath);
const place = {
  ...oldPlace,
  desc: 'Dam og blågrønt parkrom i Grorudparken, der Alnaelva, flomsikring, overvann, kantvegetasjon og hverdagsnatur møtes.',
  popupDesc: 'Groruddammen ligger i Grorudparken langs Alnaelva. Parken åpnet i 2013 og ble utformet med særlig vekt på flomsikring, rensing av overvann fra Kalbakkveien og håndtering av forurensede masser ved dammen. Vannflaten, kantene, turveien og parkbruken gjør stedet til et konkret læringsrom for blågrønn infrastruktur. History Gos aktive naturkart knytter åkerkvein og stokkand til stedet. Artskortene viser mulige observasjonsspor, men er ikke en garanti for at artene finnes ved hvert besøk.',
  nature_profile: {
    type: 'dam / parkvann / elvekorridor / overvannsanlegg / bydelspark',
    title: 'Groruddammen som parkvann, flomrom og artsmiljø',
    summary: `Groruddammen ligger i Grorudparken, en 119 dekar stor bydelspark som åpnet i 2013. Parken følger Alnaelva fra Grorud senter til Hølaløkka og inngår i turvei D9 og Alnastien. Dammen er derfor ikke et isolert vannspeil, men en del av et sammenhengende blågrønt landskap der elv, park, ferdsel og tett bystruktur møtes. Fra fast dekke kan spilleren lese forskjellen mellom åpen vannflate, vegeterte kanter, parkplen, turvei, broer og veianlegg. Disse sonene har ulike funksjoner for vann, arter og mennesker.\n\nDa Grorudparken ble anlagt, ble det lagt stor vekt på flomsikring, rensing av overvann fra Kalbakkveien og håndtering av forurensede masser ved Groruddammen. Dette gjør stedet særlig egnet til å forklare blågrønn infrastruktur. Ved kraftig regn beveger vann seg fra tette flater mot lavere terreng og vassdrag. Et park- og dammiljø kan gi vannet mer plass, forsinke avrenning og gjøre forurensningsproblemer synlige og håndterbare før vannet går videre i Alna-systemet. Dammen skal ikke beskrives som en fullstendig teknisk løsning alene; den inngår i et større nett av terreng, vegetasjon, overvannstiltak og elveløp.\n\nVannflaten og kantsonene skaper også et annet habitat enn de tørre parkflatene. History Gos fem aktive naturkart gir en union på to arter for place-id-en: åkerkvein (Agrostis gigantea) og stokkand (Anas platyrhynchos). Åkerkvein er et hjemmehørende gress knyttet til åpne kanter og forstyrret mark. Arten har en luftig blomsterstand og kan ligne engkvein, men står ofte høyere og grovere. Stokkand er en vanlig vannfugl i elver, dammer og parkvann. Hannen kjennes ofte på grønt hode og gult nebb, mens hunnen er brunspettet. Begge artskortene må brukes kildekritisk: en aktiv kartkobling er et observasjonsspor, ikke dokumentasjon på at arten er synlig akkurat nå.\n\nGroruddammen er samtidig et mye brukt rekreasjonssted. Oslo kommune oppgir dammen, rekreasjonsområde, bålpanne og piknikmuligheter som deler av Grorudparken, og turvei D9 ligger i nærheten. Naturlesningen må derfor ta hensyn til andre brukere og til sårbare kanter. Spilleren skal holde seg på etablerte flater, unngå å gå ned i våte soner, ikke mate fugler og ikke samle planter. En god observasjon registrerer det som faktisk kan ses: fuglens fjærdrakt og atferd, gressets vekstform, vannets nivå, spor etter avrenning eller erosjon og hvordan ferdselen er styrt.\n\nStedets viktigste læringspoeng er forbindelsen mellom natur og byforvaltning. Groruddammen viser hvordan et parkvann kan være habitat, landskapselement, rekreasjonsrom og del av klimatilpasningen på samme tid. Det gir også en naturlig kontrast til Alnsjøen som kildeområde, Alnaparken som elvepark, Smalvoll som elvelandskap og Svartdalen som trangere skog- og ravinepreg. Ved å følge vannets vei gjennom disse stedene blir Alna lesbar som ett sammenhengende system, selv om hvert delområde har ulike former, arter og belastninger.`,
    themes: [
      'Grorudparken åpnet i 2013',
      '119 dekar stor bydelspark',
      'Groruddammen som del av Alnaelva',
      'flomsikring og plass til vann',
      'rensing av overvann fra Kalbakkveien',
      'forurensede masser ved dammen',
      'parkvann og vegeterte kantsoner',
      'turvei D9 og Alnastien',
      'åkerkvein som aktiv florakobling',
      'stokkand som aktiv faunakobling',
      'kartlagt artsmulighet mot faktisk feltfunn',
      'rekreasjon, ferdsel og kantvern'
    ],
    species_inventory: {
      source_maps: mapFiles,
      flora: [{ id: grass.id, name: grass.title, latin: grass.latin, status: grass.status?.type || 'hjemmehørende', map: 'nature_routes_place_map.json' }],
      fauna: [{ id: mallard.id, name: mallard.title, latin: mallard.latin, status: 'hjemmehørende_vannfugl', map: 'nature_routes_place_map.json' }],
      total_species: 2,
      rule: 'all_active_mapped_species_for_place'
    },
    nearby_place_ids: ['alnsjoen_alna_kilde', 'alnaparken', 'alna_smalvoll']
  },
  tags: ['dam', 'vatmark', 'vannfugl', 'overvann', 'klimatilpasning', 'byokologi'],
  underbadge_ids: [
    'dam_og_tjern', 'vatmark', 'vann_og_vassdrag', 'elv', 'elvebredde',
    'flom_og_overvann', 'vannkvalitet', 'kantvegetasjon', 'vannfugl', 'fugler',
    'planter_og_blomster', 'okosystem', 'habitat', 'blagronn_struktur', 'klimatilpasning',
    'miljotiltak', 'artsregistrering', 'friluftsforvaltning', 'tursti', 'rekreasjon'
  ],
  visual: { designCode: 'waterfront_miniature' },
  emne_ids: ['em_natur_arter_habitat_mangfold'],
  quiz_profile: {
    place_type: 'parkdam, elvekorridor og overvannsrom',
    subtype: 'groruddammen_grorudparken',
    signature_features: [
      'Grorudparken åpnet i 2013',
      'parken er 119 dekar',
      'flomsikring og overvannsrensing var sentrale anleggshensyn',
      'dammen inngår i Alnaelvas park- og turveikorridor',
      'to aktive artskoblinger: åkerkvein og stokkand'
    ],
    primary_angles: ['parkvann_og_kantsoner', 'flom_og_overvann', 'bydelspark', 'artsobservasjon', 'ferdsel_og_forvaltning'],
    question_families: ['stedsspesifikk_naturfunksjon', 'blagronn_infrastruktur', 'artsidentifikasjon', 'kildekritikk', 'forvaltningsvalg', 'observasjon_fra_sti'],
    avoid_angles: ['artsfunn_som_garanti', 'fuglemating', 'plukking_av_gress', 'vading_eller_isferdsel', 'udokumenterte_vannkvalitetstall'],
    must_include: ['at Grorudparken åpnet i 2013', 'at flomsikring og overvannsrensing var sentrale hensyn', 'at kartkoblingene ikke garanterer funn'],
    contrast_targets: ['alnsjoen_alna_kilde', 'alnaparken', 'alna_smalvoll', 'svartdalen'],
    notes: 'Start ved vannflaten, kantsonene, turveien og parkens terreng. Artskort brukes til observasjon, ikke til innsamling eller garanti.'
  },
  externalLinks: [
    { type: 'reference', label: 'Oslo kommune: Grorudparken', url: refs.kommunePark, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo byleksikon: Grorudparken', url: refs.byleksPark, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo byleksikon: Alnaelva', url: refs.byleksAlna, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo Elveforum: Om Alnaelva', url: refs.elveforum, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo kommune: overvannshåndtering', url: refs.overvann, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo kommune: Neste stopp, Grorud stasjon!', url: refs.grorudStation, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: aktive naturrutekoblinger', url: refs.routeMap, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: gressarter', url: refs.grassData, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: byfugler', url: refs.birdData, lang: 'nb', verifiedAt: '2026-07-20' }
  ],
  tasks_profile: {
    title: 'Les dammen som blågrønt system',
    summary: 'Fire oppgaver kobler vannflate, overvann, arter og parkbruk uten å gå ned i kantsonene.',
    tasks: [
      { id: 'groruddammen_oppgave_soner', title: 'Kartlegg sonene fra fast dekke', instruction: 'Stå på etablert turvei og noter rekkefølgen vannflate, vegetert kant, plen, sti og vei eller bebyggelse.', why: 'Sonene viser hvordan parkvann, habitat og bystruktur er koblet.' },
      { id: 'groruddammen_oppgave_overvann', title: 'Se etter vannets mulige vei', instruction: 'Finn lavpunkter, renner, helninger eller vegeterte flater som kan lede eller bremse regnvann. Beskriv bare det du faktisk kan observere.', why: 'Oppgaven trener forståelsen av flom- og overvannshåndtering uten å late som hvert synlig trekk har én sikker teknisk funksjon.' },
      { id: 'groruddammen_oppgave_aakerkvein', title: 'Sammenlign kveingress', instruction: 'Se fra stien etter middels høyt gress med luftig blomsterstand. Registrer åkerkvein bare når kjennetegnene kan skilles fra lignende kveinarter.', why: 'Åkerkvein-kortet trener artsbestemmelse og usikkerhet, ikke innsamling.' },
      { id: 'groruddammen_oppgave_stokkand', title: 'Observer stokkand uten mating', instruction: 'Se etter grønn-hodet hann, brunspettet hunn og atferd ved vannkanten. Ikke mat fuglene eller gå nær hvilende dyr.', why: 'Atferd og fjærdrakt gir bedre feltdata enn å lokke fuglene til seg.' }
    ]
  },
  training_profile: {
    title: 'Rolig parkøkt rundt dammen',
    summary: 'Tre enkle øvelser bruker turvei og robuste parkflater uten å belaste våte kanter eller forstyrre fuglelivet.',
    safety: 'Hold deg på turvei og tørre, faste parkflater. Ikke gå ned i vannkanten, vad, gå ut på is eller klatre på flomsikrings- og overvannselementer. Ikke mat eller jag fugler, og ikke plukk gress. Vis hensyn til gående, syklister og andre som bruker parken.',
    exercises: [
      { id: 'groruddammen_trening_damrunde', title: 'Rolig orienteringsrunde', instruction: 'Gå i 15 minutter på etablerte stier og bruk synlige parkknutepunkter som vendepunkt.', duration_minutes: 15, intensity: 'rolig', why: 'Runden gjør forbindelsen mellom dammen, Alnaelva og parkens ferdselsnett fysisk lesbar.' },
      { id: 'groruddammen_trening_gangdrag', title: 'Fire kontrollerte gangdrag', instruction: 'Velg en bred og oversiktlig strekning. Gå raskt i 60 sekunder og rolig i 90 sekunder, fire ganger.', duration_minutes: 10, intensity: 'moderat', why: 'Intervallene bruker robust underlag og holder aktiviteten unna kantsonene.' },
      { id: 'groruddammen_trening_bevegelighet', title: 'Bevegelighet på tørr flate', instruction: 'Avslutt med rolige ankel-, hofte- og skulderbevegelser på et flatt sted utenfor ferdselsstrømmen.', duration_minutes: 5, intensity: 'lett', why: 'Øvelsen gir en trygg avslutning uten inngrep i naturmiljøet.' }
    ]
  },
  civication_store: [
    { id: 'groruddammen_blaagronn_relief', title: 'Relieff av Groruddammen og Alna', type: 'relieffmodell', kind: 'physical_object', desc: 'En fysisk modell av vannflaten, elveløpet, kantsonene, turveien og omkringliggende terreng.', placeSpecificReason: 'Modellen viser hvordan Groruddammen inngår i Grorudparkens blågrønne struktur.', historicalFunction: 'Knytter parkåpningen i 2013 til moderne flom- og overvannshåndtering.', physicalObject: true, placeSpecific: true, storePrice: 48, currency: 'PC', collection: 'groruddammen', collectable: true },
    { id: 'groruddammen_overvannskart', title: 'Kart over vannveier og parksoner', type: 'overvannskart', kind: 'physical_object', desc: 'Et lagkart med tette flater, helninger, vegetasjon, dam og elvekorridor.', placeSpecificReason: 'Flomsikring og rensing av overvann fra Kalbakkveien var sentrale hensyn ved anlegget.', historicalFunction: 'Viser hvordan byparker i 2010-årene ble brukt som klimatilpasning og rekreasjon samtidig.', physicalObject: true, placeSpecific: true, storePrice: 44, currency: 'PC', collection: 'groruddammen', collectable: true },
    { id: 'groruddammen_aakerkvein_feltkort', title: 'Åkerkvein – sammenligningskort', type: 'artskort', kind: 'physical_object', desc: 'Et feltkort med luftig blomsterstand, veksthøyde og forskjeller mot engkvein.', placeSpecificReason: 'Åkerkvein er stedets aktive florakobling i naturkartene.', historicalFunction: 'Dokumenterer hvordan moderne artsdata kobles til bynære grøntdrag.', physicalObject: true, placeSpecific: true, storePrice: 22, currency: 'PC', collection: 'groruddammen', collectable: true },
    { id: 'groruddammen_stokkand_feltkort', title: 'Stokkand – fjærdrakt og atferd', type: 'artskort', kind: 'physical_object', desc: 'Et feltkort for hann, hunn, vannkantatferd og regelen mot mating.', placeSpecificReason: 'Stokkand er stedets aktive faunakobling i naturkartene.', historicalFunction: 'Viser hvordan vanlig parkfugl kan brukes til presis, ikke-inngripende observasjon.', physicalObject: true, placeSpecific: true, storePrice: 24, currency: 'PC', collection: 'groruddammen', collectable: true }
  ],
  brands: [
    { id: 'groruddammen_actor', name: 'Groruddammen', brand_kind: 'urban_pond', brand_type: 'primary_place' },
    { id: 'grorudparken_actor', name: 'Grorudparken', brand_kind: 'district_park', brand_type: 'park_context' },
    { id: 'alnaelva_actor_groruddammen', name: 'Alnaelva', brand_kind: 'urban_river', brand_type: 'natural_system' },
    { id: 'oslo_kommune_groruddammen', name: 'Oslo kommune', brand_kind: 'municipality', brand_type: 'planning_and_management_authority' },
    { id: 'bymiljoetaten_groruddammen', name: 'Bymiljøetaten', brand_kind: 'municipal_agency', brand_type: 'park_and_path_manager' },
    { id: 'vav_groruddammen', name: 'Vann- og avløpsetaten', brand_kind: 'municipal_agency', brand_type: 'water_management_actor' },
    { id: 'bydel_grorud_groruddammen', name: 'Bydel Grorud', brand_kind: 'city_district', brand_type: 'local_public_actor' },
    { id: 'groruddalssatsingen_groruddammen', name: 'Groruddalssatsingen', brand_kind: 'area_programme', brand_type: 'urban_development_framework' },
    { id: 'oslo_elveforum_groruddammen', name: 'Oslo Elveforum', brand_kind: 'river_forum', brand_type: 'knowledge_and_advocacy_actor' },
    { id: 'alnaelvas_venner_groruddammen', name: 'Alnaelvas Venner', brand_kind: 'local_association', brand_type: 'river_care_actor' }
  ],
  for_na: {
    title: 'Fra belastet elvekant til bydelspark med vannforvaltning',
    before: 'Alna-korridoren gjennom Grorud var lenge preget av veier, industri, lukkede eller sterkt endrede vannløp og forurensede masser. Dammen og elva lå i et landskap der vannet ofte ble behandlet som et teknisk problem eller en bakside av byen.',
    now: 'Grorudparken åpnet i 2013 som en 119 dekar stor bydelspark langs Alnaelva. Groruddammen inngår i et tilgjengelig rekreasjonsområde der flomsikring, overvannsrensing, opprydding, turvei og naturmiljø er planlagt i samme landskap.',
    change: 'Stedet har gått fra å være et belastet og oppstykket elverom til et mer lesbart blågrønt byrom. Vannet er fortsatt noe som må forvaltes, men dammen og parken gjør denne forvaltningen synlig og tilgjengelig for publikum.',
    look_for: [
      'Groruddammen som avgrenset vannflate',
      'forbindelsen mellom dammen og Alnaelva',
      'vegeterte kanter og robuste ferdselslinjer',
      'terrengfall som viser vannets mulige vei',
      'spor etter regn, erosjon eller sedimenter uten å gå ned i kanten',
      'turvei D9 og koblingen til Alnastien',
      'rekreasjonsflater rundt vannet',
      'åkerkveins luftige blomsterstand ved faktisk funn',
      'stokkandens fjærdrakt og atferd ved faktisk funn',
      'konflikten mellom tilgjengelighet og vern av kantsoner'
    ],
    sources: Object.values(refs)
  }
};

const story = [{
  id: 'st_groruddammen_fra_belastet_elverom_til_blaagronn_park',
  type: 'environmental',
  title: 'Da vannet fikk plass i Grorudparken',
  year: 2013,
  place_id: placeId,
  person_id: null,
  summary: 'Groruddammen viser hvordan et belastet elverom ble del av en bydelspark der flomsikring, overvann, rekreasjon og artsobservasjon virker sammen.',
  story: `Groruddammen ligger i et landskap der Alnaelva lenge har vært presset av vei, industri og tett byutvikling. Da Grorudparken åpnet i 2013, var målet ikke bare å lage et pent parkrom. Flomsikring, rensing av overvann fra Kalbakkveien og håndtering av forurensede masser ved dammen var uttrykkelig del av arbeidet.\n\nNår du står ved vannet i dag, kan du derfor lese to historier samtidig. Den ene handler om rekreasjon: turvei, piknik, opphold og et sammenhengende grøntdrag langs Alna. Den andre handler om vannforvaltning: hvor regnvannet kommer fra, hvor det kan få plass, og hvordan forurensning og flomfare må håndteres i en tett by.\n\nArtskortene tilfører et tredje lag. Åkerkvein peker mot åpne og forstyrrede kanter, mens stokkand peker mot vannflaten og strandsonen. Ingen av dem er garanterte funn. Først når kjennetegnene faktisk observeres, blir kartkoblingen til feltdata. Slik blir Groruddammen et sted der vanlig parkbruk kan utvikles til presis forståelse av habitat, klimatilpasning og ansvarlig ferdsel.`,
  sources: commonSources,
  tags: ['groruddammen', 'grorudparken', 'alnaelva', 'overvann', 'flomsikring', 'åkerkvein', 'stokkand'],
  related_people: [],
  related_places: ['alnsjoen_alna_kilde', 'alnaparken', 'alna_smalvoll', 'svartdalen'],
  score: { narrative: 5, historical: 4, source: 5, play_value: 5, originality: 4, total: 23 },
  arc: {
    start: 'Alnaelva gikk gjennom et belastet og oppstykket bylandskap på Grorud.',
    middle: 'Grorudparken samlet flomsikring, overvannsrensing, opprydding og rekreasjon rundt dammen.',
    end: 'Åkerkvein og stokkand gjør parkens naturfunksjoner lesbare gjennom kildekritisk observasjon.'
  },
  next_scenes: [
    { place_id: 'alnaparken', reason: 'Alnaparken viser et lengre, åpent elveparkdrag videre i Alna-systemet.' },
    { place_id: 'alna_smalvoll', reason: 'Smalvoll viser hvordan elvelandskapet endrer form nedstrøms.' }
  ]
}];

const fact = (id, label, desc, sources, confidence = 'high') => ({ id, label, desc, confidence, sources });
const chronology = [
  { id: 'chrono_01', year: 1922, period: 'Nedre Alna legges i tunnel', desc: 'Den nedre delen av Alna ble lagt i tunnel fra Kværnerområdet mot fjorden.', confidence: 'high', sources: [source('Oslo Elveforum: Om Alnaelva', refs.elveforum)] },
  { id: 'chrono_02', year: 1927, period: 'Alnsjøen blir drikkevannskilde', desc: 'Oppdemmingen av Alnsjøen reduserte vannføringen i Alna.', confidence: 'high', sources: [source('Oslo Elveforum: Om Alnaelva', refs.elveforum)] },
  { id: 'chrono_03', year: 1985, period: 'Ny retning for byelvene', desc: 'Midten av 1980-årene markerer overgangen fra videre lukking mot mer vern og senere gjenåpning av Oslos elver.', confidence: 'medium', sources: [source('Oslo Elveforum: Om Alnaelva', refs.elveforum)] },
  { id: 'chrono_04', year: 2004, period: 'Hølaløkka åpner', desc: 'Hølaløkka ble åpnet som et tidlig gjenåpnet Alna-anlegg og danner parkens nordlige sammenheng.', confidence: 'high', sources: [source('Oslo kommune: Neste stopp, Grorud stasjon!', refs.grorudStation)] },
  { id: 'chrono_05', year: 2007, period: 'Arbeid med Alna miljøpark', desc: 'Arbeidet med kommunedelplan for Alna miljøpark startet.', confidence: 'high', sources: [source('Oslo Elveforum: Om Alnaelva', refs.elveforum)] },
  { id: 'chrono_06', year: 2013, period: 'Grorudparken åpner', desc: 'Den 119 dekar store Grorudparken åpnet langs Alnaelva.', confidence: 'high', sources: [source('Oslo byleksikon: Grorudparken', refs.byleksPark)] },
  { id: 'chrono_07', year: 2013, period: 'Overvann blir styrende bytema', desc: 'Oslo kommunes overvannsstrategi fra 2013 inngår i den bredere utviklingen av åpen og lokal vannhåndtering.', confidence: 'high', sources: [source('Oslo kommune: styrende dokumenter om overvann', refs.overvann)] },
  { id: 'chrono_08', year: 2026, period: 'History Go-rundingen', desc: 'Groruddammen får full natur-runding med kildekritiske artskoblinger og stedlige oppgaver.', confidence: 'high', sources: [source('History Go: aktive naturrutekoblinger', refs.routeMap)] }
];
const article = {
  place_id: placeId,
  visual: { designCode: 'article_nature_route_miniature' },
  version: 2,
  title: 'Groruddammen',
  popupDesc: 'Parkdam i Grorudparken der Alnaelva, flomsikring, overvann, rekreasjon, åkerkvein og stokkand kan leses i samme landskap.',
  wikiText: [
    'Groruddammen inngår i Grorudparken langs Alnaelva. Parken er 119 dekar og åpnet i 2013.',
    'Ved anlegget ble det lagt stor vekt på flomsikring, rensing av overvann fra Kalbakkveien og håndtering av forurensede masser ved dammen.',
    'History Gos aktive naturkart knytter åkerkvein og stokkand til stedet. Kartkoblingene er mulige observasjonsspor, ikke garanti for funn.',
    'Dammen viser hvordan parkvann kan fungere som habitat, rekreasjonsrom og del av byens blågrønne infrastruktur samtidig.'
  ],
  summary: {
    one_liner: 'Groruddammen gjør vannforvaltning og hverdagsnatur synlig midt i Grorudparken.',
    themes: ['Grorudparken', 'Alnaelva', 'flomsikring', 'overvann', 'åkerkvein', 'stokkand'],
    tone: ['nøktern', 'stedsspesifikk', 'kildebasert']
  },
  facts: [
    fact('fact_01', 'Parktilhørighet', 'Groruddammen inngår i Grorudparken.', [source('Oslo kommune: Grorudparken', refs.kommunePark), source('Oslo byleksikon: Grorudparken', refs.byleksPark)]),
    fact('fact_02', 'Størrelse', 'Grorudparken er 119 dekar.', [source('Oslo byleksikon: Grorudparken', refs.byleksPark)]),
    fact('fact_03', 'Åpningsår', 'Grorudparken åpnet i 2013.', [source('Oslo byleksikon: Grorudparken', refs.byleksPark)]),
    fact('fact_04', 'Elvekorridor', 'Parken strekker seg langs Alnaelva fra Grorud senter til Hølaløkka.', [source('Oslo byleksikon: Grorudparken', refs.byleksPark)]),
    fact('fact_05', 'Turvei', 'Turvei D9, en del av Alnastien, går gjennom parkens sammenhengende grøntdrag.', [source('Oslo byleksikon: Grorudparken', refs.byleksPark)]),
    fact('fact_06', 'Flomsikring', 'Flomsikring var et sentralt hensyn ved anlegget av parken.', [source('Oslo byleksikon: Grorudparken', refs.byleksPark)]),
    fact('fact_07', 'Overvann', 'Rensing av overvann fra Kalbakkveien var et sentralt hensyn.', [source('Oslo byleksikon: Grorudparken', refs.byleksPark)]),
    fact('fact_08', 'Forurensede masser', 'Forurensede masser ved Groruddammen måtte håndteres som del av parkprosjektet.', [source('Oslo byleksikon: Grorudparken', refs.byleksPark)]),
    fact('fact_09', 'Bydelspark', 'Grorudparken var en av fire bydelsparker bygget gjennom Groruddalssatsingen.', [source('Oslo byleksikon: Grorudparken', refs.byleksPark)]),
    fact('fact_10', 'Aktive artskoblinger', 'History Gos naturkart knytter åkerkvein og stokkand til place-id-en groruddammen.', [source('History Go: aktive naturrutekoblinger', refs.routeMap)]),
    fact('fact_11', 'Åkerkvein', `Åkerkvein har det vitenskapelige navnet ${grass.latin} og kjennetegnes i repoets artskort av luftig blomsterstand og middels høy vekst.`, [source('History Go: gressarter', refs.grassData)]),
    fact('fact_12', 'Stokkand', `Stokkand har det vitenskapelige navnet ${mallard.latin}; hannen har ofte grønt hode, mens hunnen er brunspettet.`, [source('History Go: byfugler', refs.birdData)]),
    fact('fact_13', 'Kildekritisk feltregel', 'En aktiv kartkobling er ikke garanti for at arten kan observeres ved hvert besøk.', [source('History Go: aktive naturrutekoblinger', refs.routeMap)]),
    fact('fact_14', 'Skånsom ferdsel', 'Artsobservasjon skal skje fra etablerte flater uten mating, plukking eller ferdsel i våte kanter.', [source('Oslo kommune: Grorudparken', refs.kommunePark), source('History Go: byfugler', refs.birdData)])
  ],
  chronology,
  sections: [
    { id: 'park_og_vassdrag', title: 'Parken og vassdraget', text: 'Groruddammen er en del av et sammenhengende park- og elverom langs Alna. D9 og Alnastien gjør vannsystemet tilgjengelig som ferdsels- og læringslandskap.' },
    { id: 'flom_og_overvann', title: 'Flom og overvann', text: 'Parkprosjektet kombinerte flomsikring, rensing av overvann og opprydding. Stedet viser hvorfor vann trenger areal og vegeterte overganger i en tett by.' },
    { id: 'arter', title: 'Åkerkvein og stokkand', text: 'Åkerkvein og stokkand representerer henholdsvis åpne kantflater og vannmiljø. Begge krever faktisk observasjon før de registreres som funn.' },
    { id: 'forvaltning', title: 'Bruk og vern', text: 'Rekreasjon og naturfunksjon må balanseres. Turvei og oppholdsflater gir tilgang, mens våte kanter og fugler skal få ro.' }
  ],
  related_places: ['alnsjoen_alna_kilde', 'alnaparken', 'alna_smalvoll', 'svartdalen'],
  sources: commonSources
};

const qSources = {
  park: [refs.kommunePark, refs.byleksPark],
  alna: [refs.byleksPark, refs.elveforum],
  water: [refs.byleksPark, refs.overvann],
  grass: [refs.routeMap, refs.grassData],
  duck: [refs.routeMap, refs.birdData],
  mixed: [refs.byleksPark, refs.routeMap, refs.grassData, refs.birdData]
};
const q = (question, answer, distractors, knowledge, sourceKey, layer, difficulty = 1) => ({ question, answer, distractors, knowledge, source: qSources[sourceKey], layer, difficulty });
const setSpecs = [
  { mode: 'place_intro', layer: 'intro', level: 1, questions: [
    q('Hvilken park inngår Groruddammen i?', 'Grorudparken', ['Alnaparken', 'Svartdalsparken'], 'Dammen er en fasilitet og naturdel i Grorudparken.', 'park', 'intro'),
    q('Når åpnet Grorudparken?', '2013', ['1985', '2021'], 'Oslo byleksikon daterer åpningen til 2013.', 'park', 'intro'),
    q('Hvor stor er Grorudparken?', '119 dekar', ['19 dekar', '590 dekar'], 'Parkens dokumenterte areal er 119 dekar.', 'park', 'intro'),
    q('Hvilken elv følger parken?', 'Alnaelva', ['Akerselva', 'Lysakerelva'], 'Grorudparken ligger langs Alnaelva.', 'alna', 'intro'),
    q('Hvilken turvei er del av parkens grøntdrag?', 'Turvei D9', ['Turvei B10', 'Kyststien'], 'D9 er del av Alnastien gjennom området.', 'park', 'intro'),
    q('Hva bør observeres først for å lese stedet?', 'Vannflate, kant, terreng og turvei', ['Bare parkerte biler', 'Kun byggehøyder'], 'Disse elementene viser hvordan vann, habitat og ferdsel møtes.', 'mixed', 'intro'),
    q('Hva er en trygg første feltregel?', 'Hold deg på etablerte flater', ['Vad gjennom dammen', 'Gå ut på isen'], 'Fast dekke reduserer slitasje og risiko.', 'park', 'intro')
  ]},
  { mode: 'water_habitat', layer: 'habitat', level: 2, questions: [
    q('Hva var et sentralt hensyn ved parkbyggingen?', 'Flomsikring', ['Snøproduksjon', 'Saltvannsdrift'], 'Flomsikring ble uttrykkelig vektlagt ved anlegget.', 'water', 'habitat'),
    q('Hvor kom overvannet som skulle renses fra?', 'Kalbakkveien', ['Karl Johans gate', 'Bygdøy allé'], 'Rensing av overvann fra Kalbakkveien inngikk i prosjektet.', 'water', 'habitat'),
    q('Hva måtte også håndteres ved dammen?', 'Forurensede masser', ['Korallrev', 'Saltmyr'], 'Oslo byleksikon nevner forurensede masser ved Groruddammen.', 'water', 'habitat'),
    q('Hvorfor er vegeterte kanter viktige?', 'De bremser vann og gir habitat', ['De gjør alt vann drikkbart', 'De fjerner behovet for avløp'], 'Vegetasjon kan støtte både vannhåndtering og leveområder.', 'water', 'habitat'),
    q('Hva viser et lavpunkt etter regn?', 'En mulig vannvei', ['Et sikkert artsfunn', 'Et historisk byggår'], 'Terreng kan vise hvor overvann beveger seg.', 'water', 'habitat'),
    q('Hvorfor må dammen forstås sammen med elva?', 'De inngår i samme vassdragssystem', ['Dammen er saltvann', 'Elva slutter ved parken'], 'Vann, sedimenter og organismer beveger seg gjennom systemet.', 'alna', 'habitat'),
    q('Hva er feil å love om et overvannsanlegg?', 'At ett tiltak løser alle flomproblemer', ['At terreng påvirker avrenning', 'At vegetasjon kan bremse vann'], 'Blågrønn infrastruktur virker som et system, ikke som én universalløsning.', 'water', 'habitat', 2)
  ]},
  { mode: 'species', layer: 'species', level: 3, questions: [
    q('Hvilken floraart er aktivt koblet til Groruddammen?', 'Åkerkvein', ['Kanadagullris', 'Bekkeblom'], 'Åkerkvein er den aktive florakoblingen i naturkartene.', 'grass', 'species'),
    q('Hva er åkerkveins vitenskapelige navn?', 'Agrostis gigantea', ['Anas platyrhynchos', 'Solidago canadensis'], 'Repoets gresskort oppgir Agrostis gigantea.', 'grass', 'species'),
    q('Hvilket trekk passer best på åkerkvein?', 'Luftig blomsterstand', ['Grønt hode', 'Gule kurvblomster'], 'Åkerkvein beskrives med luftig blomsterstand.', 'grass', 'species'),
    q('Hvor står åkerkvein typisk?', 'Åpne kanter og forstyrret mark', ['Dypt under vann', 'På hustak alene'], 'Artskortet knytter den til kanter og åpne flater.', 'grass', 'species'),
    q('Hva må gjøres før åkerkvein registreres?', 'Kjennetegn må faktisk observeres', ['Kartkoblingen er nok', 'Planten må graves opp'], 'Kartdata er et spor, ikke et feltfunn.', 'grass', 'species'),
    q('Hvilken art kan åkerkvein forveksles med?', 'Engkvein', ['Stokkand', 'Gran'], 'Repoets observasjonstips sammenligner den med engkvein.', 'grass', 'species', 2),
    q('Hva er riktig feltatferd ved gresset?', 'Observer uten å plukke', ['Grav opp røttene', 'Flytt planten'], 'Artsobservasjon skal ikke skade vegetasjonen.', 'grass', 'species')
  ]},
  { mode: 'species', layer: 'fauna', level: 4, questions: [
    q('Hvilken faunaart er aktivt koblet til Groruddammen?', 'Stokkand', ['Flaggspett', 'Ekorn'], 'Stokkand er den aktive faunakoblingen i naturkartene.', 'duck', 'fauna'),
    q('Hva er stokkandas vitenskapelige navn?', 'Anas platyrhynchos', ['Agrostis gigantea', 'Larus canus'], 'Repoets fuglekort oppgir Anas platyrhynchos.', 'duck', 'fauna'),
    q('Hvordan kjennes hannens fjærdrakt ofte igjen?', 'Grønt hode og gult nebb', ['Helhvit kropp', 'Rød rygg og blå hale'], 'Dette er et sentralt feltkjennetegn i artskortet.', 'duck', 'fauna'),
    q('Hvordan beskrives hunnen?', 'Brunspettet', ['Sterkt blå', 'Svart og hvit med lang hale'], 'Hunnens kamuflerte brunspetting skiller seg fra hannens drakt.', 'duck', 'fauna'),
    q('Hvilket habitat passer stokkand?', 'Dam, elv og parkvann', ['Tørr fjelltopp', 'Kjellerrom'], 'Stokkand bruker rolige vannflater og vannkanter.', 'duck', 'fauna'),
    q('Hvorfor skal fuglene ikke mates?', 'Mating endrer atferd og kan belaste miljøet', ['Fordi de er planter', 'Fordi dammen er salt'], 'God observasjon skjer uten å lokke fuglene.', 'duck', 'fauna', 2),
    q('Hva bør registreres ved et faktisk funn?', 'Fjærdrakt, antall og atferd', ['Bare kartikonet', 'En antakelse uten observasjon'], 'Synlige kjennetegn og atferd gir etterprøvbar feltdata.', 'duck', 'fauna')
  ]},
  { mode: 'stewardship', layer: 'management', level: 5, questions: [
    q('Hva gjør Groruddammen til blågrønn infrastruktur?', 'Den kobler vannhåndtering, natur og parkbruk', ['Den er bare dekorasjon', 'Den er en lukket parkeringskjeller'], 'Stedet har flere samtidige funksjoner.', 'water', 'management', 2),
    q('Hva er best ved tegn til erosjon?', 'Observer fra fast dekke og noter stedet', ['Tråkk nærmere for å teste', 'Grav en ny renne'], 'Kantsonen skal ikke belastes for å dokumenteres.', 'water', 'management'),
    q('Hva skiller dokumentasjon fra tolkning?', 'Dokumentasjon beskriver det som faktisk kan ses eller kildebelegges', ['Tolkning er alltid sikrere', 'Alt synlig er automatisk historisk'], 'Kildekritikk krever tydelig skille mellom observasjon og forklaring.', 'mixed', 'management', 2),
    q('Hvordan balanseres rekreasjon og naturhensyn?', 'Bruk robuste flater og la våte kanter få ro', ['Steng hele parken permanent', 'Gå overalt uten hensyn'], 'Tilgang og vern kan kombineres gjennom ferdselsstyring.', 'park', 'management'),
    q('Hvorfor er turvei D9 viktig i naturlesningen?', 'Den gir tilgang gjennom et sammenhengende grøntdrag', ['Den leder biler gjennom vannet', 'Den er en båtrute'], 'Turveien gjør elvekorridoren tilgjengelig uten at alle må gå i kantsonen.', 'park', 'management'),
    q('Hva betyr det at kartkoblingen ikke er en garanti?', 'Arten må bekreftes ved hvert faktisk funn', ['Arten finnes aldri der', 'Alle lignende arter kan registreres'], 'Kart og feltobservasjon er to ulike datanivåer.', 'mixed', 'management'),
    q('Hva er den beste forvaltningsobservasjonen?', 'Se både naturfunksjon, brukspress og vannvei', ['Tell bare benker', 'Se bare på ett artskort'], 'Stedet må leses som et helt system.', 'mixed', 'management', 2)
  ]},
  { mode: 'synthesis', layer: 'synthesis', level: 6, questions: [
    q('Hva er den sterkeste samlebeskrivelsen av Groruddammen?', 'Parkvann, habitat, rekreasjonsrom og klimatilpasning', ['Kun pyntedam', 'Kun fuglebur'], 'Dammen har flere dokumenterte og observerbare funksjoner samtidig.', 'mixed', 'synthesis', 2),
    q('Hva forbinder åkerkvein og stokkand pedagogisk?', 'De viser ulike soner fra tørrere kant til vannflate', ['Begge er fisk', 'Begge lever bare i skog'], 'Artene åpner for sammenligning av habitatsoner.', 'mixed', 'synthesis', 2),
    q('Hva forbinder Groruddammen med Alnaparken?', 'Begge inngår i Alnas blågrønne korridor', ['Begge ligger ved Akerselva', 'Begge er saltvannshavner'], 'Stedene er forskjellige deler av samme vassdrag.', 'alna', 'synthesis'),
    q('Hva skiller Groruddammen fra Alnsjøen?', 'Dammen er et bynært park- og overvannsrom', ['Dammen er vassdragets kilde', 'Alnsjøen ligger i Grorudparken'], 'Kontrasten viser endringen fra kildeområde til tett bylandskap.', 'alna', 'synthesis', 2),
    q('Hva bør en god History Go-observasjon ende med?', 'En etterprøvbar beskrivelse med tydelig usikkerhet', ['En sikker påstand uten funn', 'Innsamling av alt som sees'], 'Presisjon og usikkerhet gjør dataene troverdige.', 'mixed', 'synthesis', 2),
    q('Hvorfor er 2013 viktig på stedet?', 'Året Grorudparken åpnet', ['Året Alna ble dannet', 'Året stokkanda kom til Norge'], 'Åpningsåret markerer parkens moderne form.', 'park', 'synthesis'),
    q('Hva viser stedet om moderne bynatur?', 'Naturforvaltning skjer inne i hverdagsbyen', ['Natur finnes bare utenfor byen', 'Parker har ingen økologisk funksjon'], 'Groruddammen kobler byliv, vann, arter og forvaltning.', 'mixed', 'synthesis', 2)
  ]}
];
let questionCounter = 0;
const quiz = {
  targetId: placeId,
  categoryId: 'natur',
  generator_version: 'history_go_nature_place_v2',
  generated_from: [placePath, storyPath, articlePath, 'data/quiz/regler/SET_MAL_README_v3.md'],
  manual_production_notes: {
    quality_direction: 'sted → observasjon → emne → forståelse',
    species_rule: 'all active mapped species; mapped does not guarantee current find',
    hold_back: ['ingen vading eller isferdsel', 'ingen fuglemating', 'ingen plukking eller oppgraving av åkerkvein']
  },
  sets: setSpecs.map((spec, setIndex) => ({
    set_id: `natur_${placeId}_set_${setIndex + 1}`,
    level: spec.level,
    order: setIndex + 1,
    xp: 50 + setIndex * 10,
    mode: spec.mode,
    questions: spec.questions.map(item => {
      questionCounter += 1;
      const options = [item.answer, ...item.distractors];
      return {
        id: `${placeId}_s${setIndex + 1}_q${(questionCounter - 1) % 7 + 1}`,
        quiz_id: `natur_${placeId}_set_${setIndex + 1}_q${(questionCounter - 1) % 7 + 1}`,
        categoryId: 'natur',
        placeId,
        targetId: placeId,
        question_scope: 'place',
        question: item.question,
        options,
        answer: item.answer,
        answerIndex: 0,
        knowledge: item.knowledge,
        difficulty: item.difficulty,
        question_type: 'sted_observasjon',
        question_layer: item.layer,
        tags: [placeId, 'alnaelva', item.layer],
        source: item.source,
        claim_basis: 'documented',
        related_emners: ['em_natur_arter_habitat_mangfold'],
        core_concepts: ['arter', 'habitat', 'vassdrag', 'forvaltning']
      };
    })
  }))
};

writeJson(placePath, place);
writeJson(quizPath, quiz);
writeJson(storyPath, story);
writeJson(articlePath, article);

const quizManifest = readJson('data/quiz/manifest.json');
quizManifest.sets = (quizManifest.sets || []).filter(x => x.targetId !== placeId);
quizManifest.sets.push({ targetId: placeId, file: quizPath });
writeJson('data/quiz/manifest.json', quizManifest);

const storiesManifest = readJson('data/stories/stories_manifest.json');
storiesManifest.files = (storiesManifest.files || []).filter(x => x.entity_id !== placeId);
storiesManifest.files.push({ category: 'natur', entity_id: placeId, path: storyPath });
writeJson('data/stories/stories_manifest.json', storiesManifest);

const leksikonManifest = readJson('data/leksikon/manifest.json');
leksikonManifest.files = (leksikonManifest.files || []).filter(x => x !== articlePath);
leksikonManifest.files.push(articlePath);
writeJson('data/leksikon/manifest.json', leksikonManifest);

const routeManifest = readJson(routeManifestPath);
const routeRow = routeManifest.places.find(x => x.id === placeId);
if (!routeRow) throw new Error('Mangler Groruddammen i rutemanifestet');
routeRow.sha256 = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, placePath))).digest('hex');
writeJson(routeManifestPath, routeManifest);

const placesIndex = readJson('data/places/places_index.json');
const globalRow = placesIndex.find(x => x.id === placeId);
if (!globalRow) throw new Error('Mangler Groruddammen i global plassindeks');
globalRow.desc = place.desc;
writeJson('data/places/places_index.json', placesIndex);

const report = `# Groruddammen – natur-rundinger batch 1\n\n## Omfang\n\n- Fyller alle ni natur-rundinger for \`${placeId}\`.\n- Bevarer ID, koordinat, radius, kategori, routeId og koordinatstatus.\n- Registrerer fortelling, leksikon og 6 × 7 quizspørsmål i manifestene.\n\n## Aktiv artsunion\n\n- Flora: Åkerkvein (\`${grass.id}\`, ${grass.latin})\n- Fauna: Stokkand (\`${mallard.id}\`, ${mallard.latin})\n- Totalt: 2 arter\n- Regel: Alle aktive koblinger fra fem naturkart. Kartkobling er ikke garanti for feltfunn.\n\n## Stedlig retning\n\nGroruddammen behandles som del av Grorudparken og Alnaelvas blågrønne korridor. Rundingene bygger på parkåpningen i 2013, parkens 119 dekar, flomsikring, rensing av overvann fra Kalbakkveien, håndtering av forurensede masser, turvei D9, rekreasjon og skånsom artsobservasjon.\n\n## Kontroll\n\nMaterialiseringen skal bestå målrettet test, eksisterende Alna-/Oslo-naturtester, \`scripts/check-places.sh\`, JSON-parse og \`git diff --check\`.\n`;
fs.mkdirSync(path.dirname(path.join(root, reportPath)), { recursive: true });
fs.writeFileSync(path.join(root, reportPath), report);

const test = `const assert = require('assert');\nconst crypto = require('crypto');\nconst fs = require('fs');\nconst path = require('path');\nconst repo = path.resolve(__dirname, '..');\nconst readJson = p => JSON.parse(fs.readFileSync(path.join(repo, p), 'utf8'));\nconst expectedRounds = ['tasks','nature','badges','training','civication','brands','før_nå','fortellinger','leksikon'];\nconst runtime = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');\nconst profileMatch = runtime.match(/natur:\\s*\\[([^\\]]+)\\]/);\nassert(profileMatch, 'runtime mangler naturprofil');\nassert.deepStrictEqual(JSON.parse(\`[\${profileMatch[1]}]\`), expectedRounds);\nconst placePath = '${placePath}';\nconst quizPath = '${quizPath}';\nconst storyPath = '${storyPath}';\nconst articlePath = '${articlePath}';\nconst place = readJson(placePath);\nconst quiz = readJson(quizPath);\nconst story = readJson(storyPath)[0];\nconst article = readJson(articlePath);\nconst index = readJson('data/places/natur/oslo/places_oslo_natur_alnaelva_rute_index.json').find(x => x.id === place.id);\nconst routeManifest = readJson('${routeManifestPath}');\nconst manifestRow = routeManifest.places.find(x => x.id === place.id);\nconst quizManifest = readJson('data/quiz/manifest.json');\nconst storyManifest = readJson('data/stories/stories_manifest.json');\nconst leksikonManifest = readJson('data/leksikon/manifest.json');\nconst validBadges = new Set(readJson('data/badges/natur.json').sub);\nassert.strictEqual(place.id, '${placeId}');\nassert.strictEqual(place.name, 'Groruddammen');\nassert.strictEqual(place.category, 'natur');\nassert.deepStrictEqual([place.lat, place.lon, place.r, place.year ?? null], [59.95812, 10.87623, 120, null]);\nassert.strictEqual(place.routeId, 'alnaelva_grontdrag');\nassert.strictEqual(place.coordStatus, 'verified');\nassert(index && manifestRow);\nassert.deepStrictEqual([index.lat, index.lon, index.r, index.year ?? null], [place.lat, place.lon, place.r, place.year ?? null]);\nconst hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(repo, placePath))).digest('hex');\nassert.strictEqual(manifestRow.sha256, hash, 'manifest-hash må følge stedfilen');\nfor (const key of ['rounds','rundinger','routes','works','people','play_profile','flora','fauna']) assert(!Object.prototype.hasOwnProperty.call(place, key), \`forbudt felt \${key}\`);\nconst roundContent = {tasks:place.tasks_profile,nature:place.nature_profile,badges:place.underbadge_ids,training:place.training_profile,civication:place.civication_store,brands:place.brands,før_nå:place.for_na,fortellinger:[story],leksikon:[article]};\nassert.deepStrictEqual(Object.keys(roundContent), expectedRounds);\nfor (const [id,value] of Object.entries(roundContent)) { const filled=Array.isArray(value)?value.length>0:Boolean(value&&typeof value==='object'); assert(filled,\`mangler \${id}\`); }\nassert(place.externalLinks.length >= 8);\nassert(place.externalLinks.every(x => x.type === 'repository' || /^https:\\/\\//.test(x.url)));\nassert(place.underbadge_ids.length >= 15 && place.underbadge_ids.every(x => validBadges.has(x)));\nassert(place.tasks_profile.tasks.length === 4);\nassert(place.training_profile.exercises.length === 3);\nassert(/ikke gå ned|ikke.*is|ikke mat|ikke plukk/i.test(place.training_profile.safety));\nassert(place.civication_store.length === 4 && place.civication_store.every(x => x.physicalObject && x.placeSpecific));\nassert(place.brands.length >= 8);\nassert(place.for_na.look_for.length >= 8);\nassert(place.nature_profile.summary.length >= 1500);\nassert.deepStrictEqual(place.nature_profile.nearby_place_ids, ['alnsjoen_alna_kilde','alnaparken','alna_smalvoll']);\nconst mapFiles=${JSON.stringify(mapFiles)};\nconst merged={flora:[],fauna:[]};\nfor (const file of mapFiles) { const raw=readJson(file); const entry=(raw.places||raw).${placeId}; if(!entry) continue; merged.flora.push(...(entry.flora||[])); merged.fauna.push(...(entry.fauna||[])); }\nmerged.flora=[...new Set(merged.flora)].sort(); merged.fauna=[...new Set(merged.fauna)].sort();\nassert.deepStrictEqual(merged.flora,['emne_gress_aakerkvein']);\nassert.deepStrictEqual(merged.fauna,['emne_fauna_stokkand']);\nconst inventory=place.nature_profile.species_inventory;\nassert.strictEqual(inventory.total_species,2);\nassert.deepStrictEqual(inventory.flora.map(x=>x.id),['emne_gress_aakerkvein']);\nassert.deepStrictEqual(inventory.fauna.map(x=>x.id),['emne_fauna_stokkand']);\nassert.strictEqual(quiz.sets.length,6);\nassert(quiz.sets.every((s,i)=>s.order===i+1&&s.questions.length===7));\nassert(quiz.sets.flatMap(s=>s.questions).every(q=>q.categoryId==='natur'&&q.placeId===place.id&&Array.isArray(q.source)&&q.source.length&&q.claim_basis==='documented'&&q.options[q.answerIndex]===q.answer&&Array.isArray(q.related_emners)&&q.related_emners.includes('em_natur_arter_habitat_mangfold')));\nassert.deepStrictEqual(quizManifest.sets.filter(x=>x.targetId===place.id),[{targetId:place.id,file:quizPath}]);\nassert(story&&story.place_id===place.id&&story.sources.length>=8);\nassert(storyManifest.files.some(x=>x.path===storyPath&&x.entity_id===place.id&&x.category==='natur'));\nassert(article&&article.place_id===place.id&&article.version===2&&article.title===place.name);\nassert(article.sources.length>=8&&article.facts.length>=12&&article.chronology.length>=7);\nassert(leksikonManifest.files.includes(articlePath));\nconst all=JSON.stringify({place,quiz,story,article});\nfor (const token of ['Groruddammen','Grorudparken','2013','119 dekar','flomsikring','overvann','Kalbakkveien','åkerkvein','Agrostis gigantea','stokkand','Anas platyrhynchos']) assert(all.toLowerCase().includes(token.toLowerCase()),\`mangler \${token}\`);\nassert(/ikke en garanti|ikke.*garanti/i.test(all));\nconsole.log('Groruddammen nature rounds batch 1 OK');\n`;
fs.mkdirSync(path.dirname(path.join(root, testPath)), { recursive: true });
fs.writeFileSync(path.join(root, testPath), test);

console.log('Materialized Groruddammen nature rounds batch 1');
