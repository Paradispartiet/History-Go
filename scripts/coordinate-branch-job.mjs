import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const writeJson = (rel, value) => {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`);
};
const source = (title, url) => ({ title, url });
const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });

const placeId = 'alna_smalvoll';
const placePath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alna_smalvoll.json';
const routeManifestPath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute_manifest.json';
const quizPath = 'data/quiz/natur/alna_smalvoll_sets.json';
const storyPath = 'data/stories/stories_alna_smalvoll.json';
const articlePath = 'data/leksikon/places/oslo/natur/leksikon_alna_smalvoll.json';
const reportPath = 'reports/alna-smalvoll-nature-rounds-batch1.md';
const testPath = 'tests/alna-smalvoll-nature-rounds-batch1.test.js';
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
const expectedFlora = ['emne_flora_parkslirekne'];
const expectedFauna = [];
if (JSON.stringify(union.flora) !== JSON.stringify(expectedFlora) || JSON.stringify(union.fauna) !== JSON.stringify(expectedFauna)) {
  throw new Error(`Uventet artsunion for ${placeId}: ${JSON.stringify(union)}`);
}

const knotweed = readJson('data/natur/flora/fremmedarter.json').find(x => x.id === expectedFlora[0]);
if (!knotweed) throw new Error('Fant ikke artskortet for parkslirekne');

const refs = {
  alnastien: 'https://oslobyleksikon.no/side/Alnastien',
  alnaNiva: 'https://www.niva.no/nyheter/naturrestaurering-er-losningen-for-oslos-mest-forurensede-elv',
  alnaElveforum: 'https://www.osloelveforum.org/om-alnaelva/',
  alnaFriends: 'https://alnaelva.no/?page_id=719',
  smalvollenWalk: 'https://groruddalen.no/nyheter/i-sommer-fullforte-hun-sin-fornoyelsesparktrilogi-for-hun-fant-den-perfekte-boka-na-ville-helen-jakte-pa-spokelsestraer-ved-alnaelva/',
  artsdatabanken: 'https://lister.artsdatabanken.no/fremmedartslista/2023/150',
  routeMap: 'data/natur/nature_place_map.json',
  expansionMap: 'data/natur/nature_oslo_expansion_place_map.json',
  floraData: 'data/natur/flora/fremmedarter.json'
};
const commonSources = [
  source('Oslo byleksikon: Alnastien', refs.alnastien),
  source('NIVA: Naturrestaurering er løsningen for Alnaelva', refs.alnaNiva),
  source('Oslo Elveforum: Om Alnaelva', refs.alnaElveforum),
  source('Alnaelvas Venner: Om oss', refs.alnaFriends),
  source('Akers Avis Groruddalen: Smalvollen langs Alna', refs.smalvollenWalk),
  source('Artsdatabanken: Parkslirekne, Fremmedartslista 2023', refs.artsdatabanken),
  source('History Go: aktivt naturkart', refs.routeMap),
  source('History Go: Oslo-utvidelseskart for natur', refs.expansionMap),
  source('History Go: fremmedarter', refs.floraData)
];

const oldPlace = readJson(placePath);
const place = {
  ...oldPlace,
  desc: 'Smal elvekorridor langs Alna ved Smalvoll, der turvei, næringsområder, transportinfrastruktur, restaureringsbehov og parkslirekne møtes.',
  popupDesc: 'Ved Smalvoll følger Alnastien Alna gjennom et sterkt utbygd område. Elva og kantvegetasjonen ligger tett mellom Smalvollveien, næringsflater og transportårer, men fungerer fortsatt som blågrønn korridor og rekreasjonslinje. Stedet er særlig egnet til å studere fragmentering, restaurering og fremmede arter. History Gos aktive naturkart knytter parkslirekne til stedet. Kartkoblingen er et observasjonsspor, ikke garanti for at arten er synlig ved hvert besøk, og plantemateriale skal aldri brytes av eller flyttes.',
  nature_profile: {
    type: 'byelv / smal elvekorridor / restaureringssone / næringslandskap',
    title: 'Alna ved Smalvoll som presset korridor og restaureringsrom',
    summary: `Ved Smalvoll går Alna gjennom et av de tydeligste møtene mellom elv og utbygd bylandskap i hele Alna-korridoren. Vannløpet, den smale kantvegetasjonen og Alnastien ligger tett på Smalvollveien, næringsbygg, parkerings- og transportflater. Naturen er derfor ikke et stort sammenhengende parkrom, men et smalt system som må fungere mellom harde flater og mange kryssende interesser. Fra etablert turvei kan spilleren lese hvor korridoren er bred, hvor den snevres inn, hvordan broer og veier krysser vannet, og hvor vegetasjonen fortsatt binder delområdene sammen.\n\nAlnastien utgjør turvei D9 og store deler av D10. Oslo byleksikon beskriver hvordan traseen fortsetter fra Alnaparken langs Smalvollveien til Bryn og videre gjennom Svartdalen. Smalvoll er dermed ikke et isolert punkt, men en overgang mellom det åpne elvelandskapet lenger nord og de mer sammenpressede delene av vassdraget mot Bryn. Turveien gir mennesker tilgang til elva, men viser også hvor sterkt ferdsel, næring og transport har formet breddene.\n\nNIVA beskriver Alna som en elv med omfattende belastning fra industri, eldre avfallshåndtering, lukkede sidebekker og dårlig vannkvalitet. Restaurering handler derfor både om å redusere forurensning, åpne eller forbedre vannløp, restaurere elvebredder og styrke økosystemtjenester. På Smalvoll kan disse temaene undersøkes uten å påstå at hvert vegetert felt er et ferdig restaureringstiltak. Spilleren skal skille mellom det som kan observeres—kantbredde, erosjon, barrierer, søppel, skygge, vegetasjon og vannets løp—og det som krever dokumentasjon fra planer eller fagundersøkelser.\n\nHistory Gos fem aktive naturkart gir en union på én art for place-id-en: parkslirekne (Reynoutria japonica). Arten er en fremmed flerårig plante som kan danne tette bestander ved elver, veier, jernbane og forstyrret mark. Repoets artskort peker på bambuslignende stengler, store trekantede blader, tette felt og små lyse blomster sent i sesongen. Artsdatabanken vurderer parkslirekne til svært høy økologisk risiko på grunn av stort invasjonspotensial og stor negativ økologisk effekt. Arten sprer seg effektivt med jordstengler og plantedeler, og feilbestemmelse mot hybrid- og kjempeslirekne er vanlig. Derfor skal spilleren observere fra stien, fotografere uten å bryte planten og registrere usikkerhet fremfor å flytte eller forsøke å bekjempe den selv.\n\nSmalvoll viser at naturrestaurering i byen ikke bare betyr å gjøre et sted grønnere. En fungerende korridor må gi plass til vann, vegetasjon og dyreliv, samtidig som mennesker kan ferdes og infrastrukturen opprettholdes. Fremmede arter, erosjon, forurensning og fysiske barrierer kan svekke denne sammenhengen. Samtidig kan turvei, rydding, bredere kantsoner og målrettet restaurering gjøre elva mer tilgjengelig og økologisk robust.\n\nStedets viktigste læringspoeng er fragmentering og forbindelse. Ved å sammenligne Smalvoll med Alnaparken, Groruddammen, Bryn og Svartdalen kan spilleren følge hvordan Alna skifter karakter fra park og dam til smal transportkorridor, industrielt bylandskap og trangere dal. En god feltlogg beskriver bredden på grøntdraget, kryssinger, vegetasjonsstruktur, mulige parkslireknefelt og konkrete tegn på belastning uten å gå ned i elvekanten eller spre plantemateriale.`,
    themes: [
      'Alna som smal byelv ved Smalvoll',
      'Alnastien langs Smalvollveien',
      'turvei D9 og D10',
      'næring og transport tett på vassdraget',
      'fragmentering og grønne forbindelser',
      'restaurering av elvebredder',
      'forurensning og eldre industribelastning',
      'parkslirekne som aktiv florakobling',
      'svært høy økologisk risiko',
      'feilbestemmelse mot andre store slireknearter',
      'kartlagt artsmulighet mot faktisk feltfunn',
      'observasjon uten å flytte plantemateriale'
    ],
    species_inventory: {
      source_maps: mapFiles,
      flora: [{ id: knotweed.id, name: knotweed.title, latin: knotweed.latin, status: 'fremmed_art_svaert_hoy_risiko', map: 'nature_place_map.json' }],
      fauna: [],
      total_species: 1,
      rule: 'all_active_mapped_species_for_place'
    },
    nearby_place_ids: ['alnaparken', 'groruddammen', 'alna_bryn']
  },
  tags: ['elv', 'byokologi', 'restaurering', 'grontdrag', 'fragmentering', 'fremmede_arter'],
  underbadge_ids: [
    'urbannatur', 'vann_og_vassdrag', 'elv', 'bekk', 'elvebredde', 'vannkvalitet',
    'kantvegetasjon', 'planter_og_blomster', 'fremmede_arter', 'okosystem', 'habitat',
    'erosjon', 'sedimenter', 'spredningskorridor', 'gronn_korridor', 'blagronn_struktur',
    'naturrestaurering', 'skjotsel', 'miljotiltak', 'artsregistrering', 'friluftsforvaltning',
    'forurensning', 'tursti', 'rekreasjon', 'veikantnatur', 'grontdrag'
  ],
  visual: { designCode: 'waterfront_miniature' },
  emne_ids: ['em_natur_arter_habitat_mangfold'],
  quiz_profile: {
    place_type: 'smal byelv, transportkorridor og restaureringssone',
    subtype: 'alna_smalvoll',
    signature_features: [
      'Alnastien fortsetter langs Smalvollveien mot Bryn',
      'smal vegetasjonskorridor mellom næring og transport',
      'restaureringsbehov i belastet byelv',
      'én aktiv artskobling: parkslirekne',
      'observasjon uten å spre plantedeler'
    ],
    primary_angles: ['fragmentering', 'elvekorridor', 'naturrestaurering', 'fremmed_art', 'kildekritikk'],
    question_families: ['stedsspesifikk_naturfunksjon', 'korridorlesning', 'artsidentifikasjon', 'risikoforståelse', 'forvaltningsvalg', 'observasjon_fra_sti'],
    avoid_angles: ['artsfunn_som_garanti', 'selvstyrt_bekjempelse', 'plantekontakt', 'vading', 'udokumenterte_vannkvalitetstall'],
    must_include: ['Alnastien langs Smalvollveien', 'press mellom elv, næring og transport', 'parkslirekne som svært høyrisiko fremmedart', 'kartkobling er ikke garanti'],
    contrast_targets: ['alnaparken', 'groruddammen', 'alna_bryn', 'svartdalen'],
    notes: 'Start ved turveien og korridorbredden. Parkslirekne observeres og fotograferes uten berøring eller flytting.'
  },
  externalLinks: [
    { type: 'reference', label: 'Oslo byleksikon: Alnastien', url: refs.alnastien, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'NIVA: Naturrestaurering i Alnaelva', url: refs.alnaNiva, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo Elveforum: Om Alnaelva', url: refs.alnaElveforum, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Alnaelvas Venner', url: refs.alnaFriends, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Akers Avis Groruddalen: Smalvollen', url: refs.smalvollenWalk, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Artsdatabanken: Parkslirekne', url: refs.artsdatabanken, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: aktivt naturkart', url: refs.routeMap, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: Oslo-utvidelseskart', url: refs.expansionMap, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: fremmedarter', url: refs.floraData, lang: 'nb', verifiedAt: '2026-07-20' }
  ],
  tasks_profile: {
    title: 'Les en presset elvekorridor',
    summary: 'Fire oppgaver undersøker korridorbredde, barrierer, restaureringsspor og parkslirekne fra etablert turvei.',
    tasks: [
      { id: 'alna_smalvoll_oppgave_transekt', title: 'Tegn et korridortransekt', instruction: 'Stå på turveien og noter rekkefølgen elv, kantvegetasjon, sti, vei, parkering eller bygg. Gjenta på to punkter.', why: 'Sammenligningen viser hvor korridoren er bred og hvor den presses sammen.' },
      { id: 'alna_smalvoll_oppgave_barrierer', title: 'Registrer forbindelser og barrierer', instruction: 'Finn broer, kulverter, gjerder, veier eller smale passasjer. Beskriv hvordan de kan påvirke ferdsel langs elva uten å gå utenfor stien.', why: 'Korridorens funksjon avhenger av både langsgående forbindelse og kryssende infrastruktur.' },
      { id: 'alna_smalvoll_oppgave_parkslirekne', title: 'Se etter slireknekjennetegn', instruction: 'Se etter tette felt med bambuslignende stengler og store trekantede blader. Fotografer fra stien og registrer som usikkert dersom arten ikke kan skilles fra hybrid- eller kjempeslirekne.', why: 'Oppgaven trener presis fremmedartsobservasjon uten spredningsfare.' },
      { id: 'alna_smalvoll_oppgave_restaurering', title: 'Skill observasjon fra restaureringstolkning', instruction: 'Noter synlige tegn som erosjon, søppel, vegetasjonsbredde, skygge eller nylig jordarbeid. Marker hvilke forklaringer som krever en plan- eller fagkilde.', why: 'Restaurering skal dokumenteres, ikke gjettes ut fra at et felt ser grønt eller nytt ut.' }
    ]
  },
  training_profile: {
    title: 'Korridorgange langs Alnastien',
    summary: 'Tre øvelser bruker etablert turvei og holder aktivitet unna elvekant og mulig parkslirekne.',
    safety: 'Hold deg på etablert turvei og synlige, robuste flater. Ikke gå ned i elvekanten, vad eller klatre på tekniske anlegg. Ikke ta på, knekk, flytt eller forsøk å bekjempe parkslirekne eller andre slireknearter; små plantedeler kan bidra til spredning. Vis hensyn til syklister, gående og næringstrafikk.',
    exercises: [
      { id: 'alna_smalvoll_trening_korridorrunde', title: 'Rolig sammenhengende gange', instruction: 'Gå 18 minutter langs etablert turvei og bruk broer eller tydelige stikryss som vendepunkt.', duration_minutes: 18, intensity: 'rolig', why: 'Runden gjør korridorens lengde, innsnevringer og forbindelser kroppslig lesbare.' },
      { id: 'alna_smalvoll_trening_gangdrag', title: 'Fem korte gangdrag', instruction: 'Velg en bred, oversiktlig strekning. Gå raskt i 45 sekunder og rolig i 75 sekunder, fem ganger.', duration_minutes: 10, intensity: 'moderat', why: 'Økten bruker robust underlag uten å belaste kantvegetasjonen.' },
      { id: 'alna_smalvoll_trening_observasjonsstopp', title: 'Tre rolige observasjonsstopp', instruction: 'Stans på tre trygge punkter og bruk ett minutt på vannløp, vegetasjonsbredde og infrastruktur.', duration_minutes: 5, intensity: 'lett', why: 'Stoppene kobler fysisk aktivitet til systematisk stedslesning.' }
    ]
  },
  civication_store: [
    { id: 'alna_smalvoll_korridorrelieff', title: 'Relieff av Smalvoll-korridoren', type: 'relieffmodell', kind: 'physical_object', desc: 'En fysisk modell av elveløp, kantvegetasjon, Alnasti, vei og næringsflater.', placeSpecificReason: 'Modellen viser hvordan Alna presses sammen mellom harde byflater ved Smalvoll.', historicalFunction: 'Knytter dagens korridor til gradvis opparbeiding av Alnastien og nyere restaureringsarbeid.', physicalObject: true, placeSpecific: true, storePrice: 48, currency: 'PC', collection: 'alna_smalvoll', collectable: true },
    { id: 'alna_smalvoll_fragmenteringskart', title: 'Kart over barrierer og forbindelser', type: 'korridorkart', kind: 'physical_object', desc: 'Et lagkart med broer, veier, smale vegetasjonsbelter og mulige forbindelser langs elva.', placeSpecificReason: 'Fragmentering er stedets tydeligste naturfaglige problemstilling.', historicalFunction: 'Viser hvordan transport- og næringsutbygging har formet elverommet.', physicalObject: true, placeSpecific: true, storePrice: 42, currency: 'PC', collection: 'alna_smalvoll', collectable: true },
    { id: 'alna_smalvoll_parkslireknekort', title: 'Parkslirekne – sikkert feltkort', type: 'artskort', kind: 'physical_object', desc: 'Feltkort med kjennetegn, forvekslingsfare og regelen om aldri å flytte plantedeler.', placeSpecificReason: 'Parkslirekne er Smalvolls eneste aktive artskobling.', historicalFunction: 'Dokumenterer hvordan fremmede arter blir del av moderne elveforvaltning.', physicalObject: true, placeSpecific: true, storePrice: 24, currency: 'PC', collection: 'alna_smalvoll', collectable: true },
    { id: 'alna_smalvoll_restaureringstavle', title: 'Restaureringstavle for byelv', type: 'feltplate', kind: 'physical_object', desc: 'En fysisk sammenligning av observasjon, dokumentert tiltak og ønsket framtidig tilstand.', placeSpecificReason: 'Smalvoll krever tydelig skille mellom synlig grønt og dokumentert naturrestaurering.', historicalFunction: 'Knytter Alnas industribelastning til dagens restaureringsmål.', physicalObject: true, placeSpecific: true, storePrice: 38, currency: 'PC', collection: 'alna_smalvoll', collectable: true }
  ],
  brands: [
    { id: 'alna_smalvoll_actor', name: 'Alna ved Smalvoll', brand_kind: 'urban_river_section', brand_type: 'primary_place' },
    { id: 'alnaelva_actor_smalvoll', name: 'Alnaelva', brand_kind: 'urban_river', brand_type: 'natural_system' },
    { id: 'alnastien_actor_smalvoll', name: 'Alnastien', brand_kind: 'river_path', brand_type: 'access_and_connection' },
    { id: 'oslo_kommune_smalvoll', name: 'Oslo kommune', brand_kind: 'municipality', brand_type: 'planning_authority' },
    { id: 'bymiljoetaten_smalvoll', name: 'Bymiljøetaten', brand_kind: 'municipal_agency', brand_type: 'path_and_nature_manager' },
    { id: 'vav_smalvoll', name: 'Vann- og avløpsetaten', brand_kind: 'municipal_agency', brand_type: 'water_management_actor' },
    { id: 'bydel_alna_smalvoll', name: 'Bydel Alna', brand_kind: 'city_district', brand_type: 'local_public_actor' },
    { id: 'niva_smalvoll', name: 'NIVA', brand_kind: 'research_institute', brand_type: 'river_restoration_research' },
    { id: 'alnaelvas_venner_smalvoll', name: 'Alnaelvas Venner', brand_kind: 'local_association', brand_type: 'river_care_actor' },
    { id: 'oslo_elveforum_smalvoll', name: 'Oslo Elveforum', brand_kind: 'river_forum', brand_type: 'knowledge_and_advocacy_actor' }
  ],
  for_na: {
    title: 'Fra bakside mellom næring og vei til lesbar elvekorridor',
    before: 'Alna ved Smalvoll ble liggende i et sterkt utbygd landskap med industri, næringsflater, veier, forurensning og smale restarealer langs vannet. Elva fungerte ofte som byens bakside, mens sidebekker og forbindelser ble svekket eller lagt i rør.',
    now: 'Alnastien gjør elvestrekningen tilgjengelig fra Alnaparken mot Bryn. Elva og kantvegetasjonen er fortsatt presset, men korridoren kan brukes til rekreasjon, artsobservasjon og restaureringsarbeid. Parkslirekne viser samtidig at en grønn flate ikke nødvendigvis betyr høy naturkvalitet.',
    change: 'Den viktigste endringen er at elva igjen er blitt en synlig forbindelse gjennom næringslandskapet. Tilgang, rydding og restaureringsmål har styrket oppmerksomheten rundt vassdraget, men fragmentering, forurensning og fremmede arter er fortsatt reelle forvaltningsoppgaver.',
    look_for: [
      'Alnastien langs Smalvollveien',
      'smale og brede partier i kantvegetasjonen',
      'broer og veier som krysser korridoren',
      'næringsbygg og parkeringsflater tett på elva',
      'erosjon eller sedimenter synlig fra stien',
      'søppel eller andre tegn på belastning',
      'mulige parkslireknefelt uten berøring',
      'forskjellen mellom tett fremmedartsbestand og variert kantvegetasjon',
      'stier eller gjerder som styrer ferdselen',
      'forbindelsen videre mot Alnaparken og Bryn'
    ],
    sources: Object.values(refs)
  }
};

const story = [{
  id: 'st_alna_smalvoll_korridoren_som_overlevde_mellom_byflatene',
  type: 'environmental',
  title: 'Korridoren som overlevde mellom byflatene',
  year: 1992,
  place_id: placeId,
  person_id: null,
  summary: 'Ved Smalvoll blir Alna smalere og mer presset, men turveien, elvekanten og restaureringsarbeidet holder forbindelsen levende.',
  story: `Ved Smalvoll er det lett å forstå hvorfor Alna lenge ble behandlet som byens bakside. Veier, næringsbygg, parkering og tekniske anlegg ligger tett på vannet. Likevel fortsetter elva, og en smal stripe vegetasjon binder området sammen med Alnaparken i nord og Bryn i sør.\n\nDa kommunen startet Aksjon Alna i 1992, ble bedre tilgjengelighet og opparbeiding av turveien del av en langsiktig endring. Alnastien følger i dag Smalvollveien mot Bryn. Den gjør elva synlig og mulig å følge, men avslører samtidig barrierene: innsnevringer, kryssinger, harde flater og belastede bredder.\n\nParkslirekne tilfører et krevende lag. Arten kan se ut som et frodig grønt kratt, men kan danne tette bestander som fortrenger annen vegetasjon og øker erosjonsproblemer når undervegetasjonen forsvinner. Små plantedeler kan spre nye bestander. Derfor er riktig handling ikke å rive planten opp, men å dokumentere kjennetegn og usikkerhet uten kontakt.\n\nSmalvoll viser at restaurering ikke er én ferdig park eller ett teknisk tiltak. Det er arbeidet med å bevare forbindelse, redusere belastning, håndtere fremmede arter og gi vannet og kantvegetasjonen mer funksjon i et landskap som fortsatt brukes intensivt.`,
  sources: commonSources,
  tags: ['alna_smalvoll', 'alnaelva', 'alnastien', 'fragmentering', 'naturrestaurering', 'parkslirekne'],
  related_people: [],
  related_places: ['alnaparken', 'groruddammen', 'alna_bryn', 'svartdalen'],
  score: { narrative: 5, historical: 4, source: 5, play_value: 5, originality: 4, total: 23 },
  arc: {
    start: 'Alna ble presset inn mellom næring, transport og belastede restarealer.',
    middle: 'Alnastien og restaureringsarbeidet gjorde elva mer synlig og sammenhengende.',
    end: 'Parkslirekne viser hvorfor grønn vekst må vurderes med artskunnskap og forsiktig forvaltning.'
  },
  next_scenes: [
    { place_id: 'alna_bryn', reason: 'Bryn viser neste overgang der elva møter enda tettere industri- og transporthistorie.' },
    { place_id: 'alnaparken', reason: 'Alnaparken gir kontrasten til et bredere og mer parkpreget elverom.' }
  ]
}];

const fact = (id, label, desc, sources, confidence = 'high') => ({ id, label, desc, confidence, sources });
const chronology = [
  { id: 'chrono_01', year: 1900, period: 'Alnabanen åpner', desc: 'Godsbaneforbindelsen mellom Alnabru og Grefsen åpnet og inngår i områdets sterke transportpreg.', confidence: 'medium', sources: [source('Oslo byleksikon: Alnabru', 'https://oslobyleksikon.no/side/Alnabru')] },
  { id: 'chrono_02', year: 1927, period: 'Alnsjøen blir drikkevannskilde', desc: 'Oppdemmingen av Alnsjøen reduserte vannføringen i Alna.', confidence: 'high', sources: [source('Oslo Elveforum: Om Alnaelva', refs.alnaElveforum)] },
  { id: 'chrono_03', year: 1985, period: 'Ny retning for byelvene', desc: 'Fra midten av 1980-årene dreide forvaltningen gradvis fra videre lukking mot vern og gjenåpning.', confidence: 'medium', sources: [source('Oslo Elveforum: Om Alnaelva', refs.alnaElveforum)] },
  { id: 'chrono_04', year: 1992, period: 'Aksjon Alna starter', desc: 'Kommunen startet Aksjon Alna, og turveien ble gradvis opparbeidet videre.', confidence: 'high', sources: [source('Oslo byleksikon: Alnastien', refs.alnastien)] },
  { id: 'chrono_05', year: 2007, period: 'Alna miljøpark', desc: 'Arbeidet med kommunedelplan for Alna miljøpark startet.', confidence: 'high', sources: [source('Oslo Elveforum: Om Alnaelva', refs.alnaElveforum)] },
  { id: 'chrono_06', year: 2023, period: 'Parkslirekne vurderes på nytt', desc: 'Fremmedartslista 2023 vurderte parkslirekne til svært høy økologisk risiko.', confidence: 'high', sources: [source('Artsdatabanken: Parkslirekne', refs.artsdatabanken)] },
  { id: 'chrono_07', year: 2024, period: 'Restaureringsforskning på Alna', desc: 'NIVA formidlet forskning om naturrestaurering, forurensning og biologisk mangfold i Alnaelva.', confidence: 'high', sources: [source('NIVA: Naturrestaurering i Alnaelva', refs.alnaNiva)] },
  { id: 'chrono_08', year: 2026, period: 'History Go-rundingen', desc: 'Smalvoll får full natur-runding med kildekritisk artskobling og korridoroppgaver.', confidence: 'high', sources: [source('History Go: aktivt naturkart', refs.routeMap)] }
];
const article = {
  place_id: placeId,
  visual: { designCode: 'article_nature_route_miniature' },
  version: 2,
  title: 'Alna ved Smalvoll',
  popupDesc: 'Smal byelvkorridor der Alnastien, nærings- og transportflater, restaureringsbehov og parkslirekne kan leses i samme landskap.',
  wikiText: [
    'Ved Smalvoll følger Alnastien Alna langs Smalvollveien mot Bryn gjennom et sterkt utbygd nærings- og transportlandskap.',
    'Strekningen viser hvordan en smal elvekorridor kan opprettholde vannløp, kantvegetasjon, ferdsel og forbindelse selv når harde flater dominerer.',
    'History Gos aktive naturkart knytter parkslirekne til stedet. Arten er vurdert til svært høy økologisk risiko, men kartkoblingen er ikke garanti for feltfunn.',
    'Planten skal observeres uten å knekkes, flyttes eller bekjempes av spilleren, fordi plantedeler og jordstengler kan bidra til spredning.'
  ],
  summary: {
    one_liner: 'Smalvoll gjør fragmentering, restaurering og fremmedartsforvaltning synlig langs Alna.',
    themes: ['Alnaelva', 'Alnastien', 'fragmentering', 'naturrestaurering', 'parkslirekne'],
    tone: ['nøktern', 'stedsspesifikk', 'kildekritisk']
  },
  facts: [
    fact('fact_01', 'Elvestrekning', 'Stedet følger Alna ved Smalvoll i Bydel Alna.', [source('Akers Avis Groruddalen: Smalvollen', refs.smalvollenWalk)]),
    fact('fact_02', 'Alnastien', 'Alnastien fortsetter fra Alnaparken langs Smalvollveien til Bryn stasjon.', [source('Oslo byleksikon: Alnastien', refs.alnastien)]),
    fact('fact_03', 'Turveisystem', 'Alnastien utgjør turvei D9 og det meste av D10.', [source('Oslo byleksikon: Alnastien', refs.alnastien)]),
    fact('fact_04', 'Aksjon Alna', 'Kommunen startet Aksjon Alna i 1992, og turveien er siden gradvis opparbeidet.', [source('Oslo byleksikon: Alnastien', refs.alnastien)]),
    fact('fact_05', 'Belastet vassdrag', 'Alna er preget av industri, eldre avfallshåndtering, forurensning og mange lukkede sidebekker.', [source('NIVA: Naturrestaurering i Alnaelva', refs.alnaNiva)]),
    fact('fact_06', 'Restaureringsmål', 'Tiltak rundt Alna omfatter reduksjon av forurensning, restaurering av elvebredder og styrking av økosystemtjenester.', [source('NIVA: Naturrestaurering i Alnaelva', refs.alnaNiva)]),
    fact('fact_07', 'Aktiv artskobling', 'History Gos aktive naturkart knytter parkslirekne til place-id-en alna_smalvoll.', [source('History Go: aktivt naturkart', refs.routeMap), source('History Go: Oslo-utvidelseskart', refs.expansionMap)]),
    fact('fact_08', 'Vitenskapelig navn', `Parkslirekne har det vitenskapelige navnet ${knotweed.latin}.`, [source('History Go: fremmedarter', refs.floraData), source('Artsdatabanken: Parkslirekne', refs.artsdatabanken)]),
    fact('fact_09', 'Kjennetegn', 'Repoets artskort beskriver bambuslignende stengler, store trekantede blader, tette bestander og små lyse sensommerblomster.', [source('History Go: fremmedarter', refs.floraData)]),
    fact('fact_10', 'Risikovurdering', 'Artsdatabanken vurderer parkslirekne til svært høy økologisk risiko.', [source('Artsdatabanken: Parkslirekne', refs.artsdatabanken)]),
    fact('fact_11', 'Spredning', 'Parkslirekne har effektiv klonal vekst med jordstengler og kan spres med plantedeler og masser.', [source('Artsdatabanken: Parkslirekne', refs.artsdatabanken)]),
    fact('fact_12', 'Forvekslingsfare', 'Feilbestemmelse mot hybrid- og kjempeslirekne er vanlig.', [source('Artsdatabanken: Parkslirekne', refs.artsdatabanken)]),
    fact('fact_13', 'Kildekritisk feltregel', 'En aktiv kartkobling er et observasjonsspor, ikke garanti for et aktuelt funn.', [source('History Go: aktivt naturkart', refs.routeMap)]),
    fact('fact_14', 'Skånsom observasjon', 'Spilleren skal observere fra stien og ikke flytte eller forsøke å bekjempe plantemateriale.', [source('Artsdatabanken: Parkslirekne', refs.artsdatabanken), source('History Go: fremmedarter', refs.floraData)])
  ],
  chronology,
  sections: [
    { id: 'korridor', title: 'Den smale korridoren', text: 'Elva, kantvegetasjonen og Alnastien må fungere mellom veier, næring og transportflater. Bredden og kryssingene avgjør hvor sammenhengende systemet er.' },
    { id: 'restaurering', title: 'Restaurering i belastet byelv', text: 'Restaurering kan omfatte bedre vannkvalitet, elvebredder, sidebekker, vegetasjon og rekreasjon. Synlige grønne flater må ikke automatisk omtales som dokumenterte tiltak.' },
    { id: 'parkslirekne', title: 'Parkslirekne', text: 'Parkslirekne er aktivt kartkoblet til stedet og vurdert til svært høy risiko. Feltobservasjon krever kjennetegn, forvekslingsbevissthet og null flytting av plantedeler.' },
    { id: 'forvaltning', title: 'Tilgang og ansvar', text: 'Alnastien gir tilgang til vassdraget. Ansvarlig bruk innebærer å holde seg på robuste flater, dokumentere belastning og overlate bekjempelse til faglig ledede tiltak.' }
  ],
  related_places: ['alnaparken', 'groruddammen', 'alna_bryn', 'svartdalen'],
  sources: commonSources
};

const qSources = {
  path: [refs.alnastien],
  river: [refs.alnaNiva, refs.alnaElveforum],
  species: [refs.artsdatabanken, refs.floraData],
  map: [refs.routeMap, refs.expansionMap],
  mixed: [refs.alnastien, refs.alnaNiva, refs.artsdatabanken, refs.routeMap]
};
const q = (question, answer, distractors, knowledge, sourceKey, layer, difficulty = 1) => ({ question, answer, distractors, knowledge, source: qSources[sourceKey], layer, difficulty });
const setSpecs = [
  { mode: 'place_intro', layer: 'intro', questions: [
    q('Hvilken elv følger Smalvoll-rundingen?', 'Alnaelva', ['Akerselva', 'Lysakerelva'], 'Smalvoll er et delsted langs Alna.', 'path', 'intro'),
    q('Hvor fortsetter Alnastien fra Smalvoll?', 'Mot Bryn', ['Mot Bygdøy', 'Mot Maridalsvannet'], 'Alnastien går langs Smalvollveien til Bryn.', 'path', 'intro'),
    q('Hva preger landskapet sterkest?', 'Elv mellom næring og transport', ['Åpent høyfjell', 'Saltvannsstrand'], 'Smalvoll er en smal byelvkorridor i et utbygd område.', 'mixed', 'intro'),
    q('Hva bør leses først fra stien?', 'Elv, kantbredde, kryssinger og harde flater', ['Bare butikkskilt', 'Kun himmelretning'], 'Disse elementene viser korridorens sammenheng og press.', 'mixed', 'intro'),
    q('Hvilken turveibetegnelse hører til Alnastien?', 'D9 og store deler av D10', ['A1 alene', 'Kyststi K2'], 'Oslo byleksikon knytter Alnastien til D9 og D10.', 'path', 'intro'),
    q('Når startet kommunen Aksjon Alna?', '1992', ['1922', '2024'], 'Aksjon Alna startet i 1992.', 'path', 'intro'),
    q('Hva er trygg første feltregel?', 'Hold deg på etablert turvei', ['Vad gjennom elva', 'Gå inn på næringsområder'], 'Turveien gir observasjon uten unødig slitasje eller risiko.', 'path', 'intro')
  ]},
  { mode: 'corridor', layer: 'habitat', questions: [
    q('Hva betyr fragmentering her?', 'At elvenaturen deles eller snevres inn av byflater', ['At elva blir salt', 'At alle arter blir større'], 'Veier, bygg og kryssinger kan svekke sammenheng.', 'river', 'habitat'),
    q('Hva viser et bredere vegetasjonsbelte?', 'Mer plass til kantfunksjoner', ['Sikkert rent vann', 'Ingen påvirkning fra byen'], 'Bredde kan gi mer habitat og buffersone, men sier ikke alt om kvalitet.', 'river', 'habitat'),
    q('Hva er en fysisk barriere?', 'En vei eller kulvert som bryter korridoren', ['Et artsnavn', 'Et årstall'], 'Kryssende infrastruktur kan påvirke forbindelse og ferdsel.', 'mixed', 'habitat'),
    q('Hvorfor er Alnastien viktig?', 'Den gjør vassdraget tilgjengelig og sammenhengende for ferdsel', ['Den lukker elva', 'Den flytter elva til fjorden'], 'Turveien gjør det mulig å følge elvekorridoren.', 'path', 'habitat'),
    q('Hva kan erosjon langs kanten vise?', 'At jord og vegetasjon er utsatt for vann eller slitasje', ['At vannet alltid er giftig', 'At arten er sikkert parkslirekne'], 'Erosjon er et synlig spor, men årsaken må undersøkes.', 'river', 'habitat'),
    q('Hva skal skilles fra en observasjon?', 'En udokumentert forklaring på tiltak eller årsak', ['Sted og tidspunkt', 'Synlig kantbredde'], 'Feltloggen må skille det synlige fra tolkningen.', 'mixed', 'habitat', 2),
    q('Hva er den beste samlelesningen?', 'Forbindelse, belastning og mulig restaurering', ['Kun antall benker', 'Kun parkeringskapasitet'], 'Smalvoll må leses som et helt byøkologisk system.', 'mixed', 'habitat', 2)
  ]},
  { mode: 'species', layer: 'species', questions: [
    q('Hvilken art er aktivt koblet til Smalvoll?', 'Parkslirekne', ['Åkerkvein', 'Stokkand'], 'Parkslirekne er stedets eneste aktive artskobling.', 'map', 'species'),
    q('Hva er parkslireknes vitenskapelige navn?', 'Reynoutria japonica', ['Agrostis gigantea', 'Anas platyrhynchos'], 'Artskortet og Artsdatabanken bruker Reynoutria japonica.', 'species', 'species'),
    q('Hvilket kjennetegn passer?', 'Bambuslignende stengler', ['Grønt fuglehode', 'Nåler i kongler'], 'Stenglene er et sentralt feltkjennetegn.', 'species', 'species'),
    q('Hvordan er bladene ofte beskrevet?', 'Store og trekantede', ['Smale barnåler', 'Flytende runde blader'], 'Store trekantede blader inngår i artskortet.', 'species', 'species'),
    q('Hvordan vokser arten ofte?', 'I tette bestander', ['Som enkeltstående tre', 'Bare under vann'], 'Parkslirekne kan danne tett skuddskog.', 'species', 'species'),
    q('Når blomstrer den ofte?', 'Sent på sommeren eller tidlig høst', ['Midtvinters', 'Bare i april'], 'Repoets artskort oppgir august og september.', 'species', 'species'),
    q('Hva må gjøres før registrering?', 'Kjennetegn må faktisk observeres', ['Kartikonet er nok', 'Planten må knekkes'], 'Kartkoblingen alene dokumenterer ikke et feltfunn.', 'map', 'species')
  ]},
  { mode: 'risk', layer: 'risk', questions: [
    q('Hvordan vurderer Artsdatabanken parkslirekne?', 'Svært høy økologisk risiko', ['Ingen kjent risiko', 'Naturlig rødlisteart'], 'Arten er vurdert til SE—svært høy risiko.', 'species', 'risk'),
    q('Hva driver spredningen særlig?', 'Jordstengler og plantedeler', ['Fuglefjær', 'Saltvannsbølger'], 'Vegetativ spredning gjør flytting av masser risikabelt.', 'species', 'risk'),
    q('Hvorfor skal planten ikke knekkes?', 'Deler kan bidra til ny spredning', ['Den blir til et tre', 'Elva stopper'], 'Feltarbeidet skal ikke skape nye plantedeler.', 'species', 'risk'),
    q('Hvilke arter gir forvekslingsfare?', 'Hybrid- og kjempeslirekne', ['Stokkand og gråmåke', 'Gran og furu'], 'Artsdatabanken dokumenterer betydelig feilbestemmelse i slireknegruppen.', 'species', 'risk', 2),
    q('Hva kan en tett bestand gjøre?', 'Fortrenge annen vegetasjon', ['Rense all forurensning', 'Åpne alle kulverter'], 'Arten kan dominere og redusere undervegetasjon.', 'species', 'risk'),
    q('Hvorfor kan vassdragskanter bli sårbare?', 'Tett bestand kan svekke variert undervegetasjon og øke erosjonsfare', ['Fordi elva blir salt', 'Fordi alle planter blir fisk'], 'Artsdatabanken peker på erosjonsutsatt jord langs vassdrag.', 'species', 'risk', 2),
    q('Hva er riktig spillerhandling?', 'Fotografer fra stien og meld usikkerhet', ['Grav opp røttene', 'Flytt skudd til et annet sted'], 'Bekjempelse skal være faglig ledet.', 'species', 'risk')
  ]},
  { mode: 'restoration', layer: 'management', questions: [
    q('Hva kan naturrestaurering langs Alna omfatte?', 'Bedre vannkvalitet og restaurerte elvebredder', ['Flere parkeringsfelt i kanten', 'Lukking av all vegetasjon'], 'NIVA beskriver vannkvalitet, bredder og økosystemtjenester som sentrale tema.', 'river', 'management'),
    q('Hva er feil å anta?', 'At alt nytt grønt automatisk er restaurering', ['At tiltak bør dokumenteres', 'At korridorbredde kan observeres'], 'Restaurering er et målrettet og dokumenterbart arbeid.', 'mixed', 'management'),
    q('Hvem bør håndtere parkslireknebekjempelse?', 'Faglig ledede forvaltere eller tiltak', ['Tilfeldige forbipasserende', 'Barn på tur alene'], 'Feil håndtering kan spre arten.', 'species', 'management'),
    q('Hva bør meldes i en feltlogg?', 'Sted, kjennetegn, omfang og usikkerhet', ['Bare et artsnavn uten belegg', 'En løs gjetning om kjemikalier'], 'Etterprøvbare data er mer nyttige for forvaltning.', 'mixed', 'management'),
    q('Hvordan balanseres ferdsel og kantvern?', 'Bruk turveien og la elvekanten få ro', ['Gå nærmest mulig vannet', 'Steng hele bydelen'], 'Tilgang og naturhensyn kan kombineres gjennom robuste ferdselslinjer.', 'path', 'management'),
    q('Hva viser søppel i korridoren?', 'En konkret belastning som kan dokumenteres', ['Sikker vannkjemi', 'Et artsfunn'], 'Synlig avfall kan registreres uten spekulasjon.', 'river', 'management'),
    q('Hva er den beste restaureringsobservasjonen?', 'Sammenlign barrierer, vegetasjon og belastning over flere punkter', ['Se bare på én plante', 'Mål bare gangfart'], 'Flere punkter gir bedre forståelse av korridorens variasjon.', 'mixed', 'management', 2)
  ]},
  { mode: 'synthesis', layer: 'synthesis', questions: [
    q('Hva er den sterkeste samlebeskrivelsen av Smalvoll?', 'Presset elvekorridor med restaureringsbehov og fremmedartsrisiko', ['Urørt villmark', 'Saltvannshavn'], 'Stedet kombinerer byelv, infrastruktur, ferdsel og forvaltning.', 'mixed', 'synthesis', 2),
    q('Hva skiller Smalvoll fra Alnaparken?', 'Smalvoll er trangere og tettere omgitt av næring og transport', ['Smalvoll ligger ved Akerselva', 'Alnaparken er under vann'], 'Kontrasten viser hvordan Alna endrer karakter.', 'mixed', 'synthesis'),
    q('Hva forbinder Smalvoll med Bryn?', 'Alnastien og Alnas sammenhengende løp', ['En fjellrygg', 'En sjølinje'], 'Turveien og elva fortsetter sørover mot Bryn.', 'path', 'synthesis'),
    q('Hva lærer parkslireknefeltet om bynatur?', 'Frodig grønt er ikke alltid høy naturkvalitet', ['Alle fremmede arter er ufarlige', 'Tett vekst betyr rent vann'], 'Artskunnskap er nødvendig for å tolke vegetasjonen.', 'species', 'synthesis', 2),
    q('Hva bør en god observasjon ende med?', 'Etterprøvbar beskrivelse og tydelig usikkerhet', ['Sikker påstand uten funn', 'Flytting av planten'], 'Presis dokumentasjon er målet.', 'mixed', 'synthesis'),
    q('Hvorfor er 1992 viktig?', 'Aksjon Alna startet', ['Parkslirekne kom til Japan', 'Alna ble saltvann'], 'Året markerer et kommunalt løft for elva og turveien.', 'path', 'synthesis'),
    q('Hva viser Smalvoll om naturrestaurering?', 'Restaurering må virke i et landskap som fortsatt brukes intensivt', ['Restaurering krever ingen forvaltning', 'By og natur kan aldri møtes'], 'Smalvoll er et praktisk eksempel på langsiktig avveiing og forbedring.', 'river', 'synthesis', 2)
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
    hold_back: ['ingen vading', 'ingen kontakt med eller flytting av slirekne', 'ingen selvstyrt bekjempelse']
  },
  sets: setSpecs.map((spec, setIndex) => ({
    set_id: `natur_${placeId}_set_${setIndex + 1}`,
    level: setIndex + 1,
    order: setIndex + 1,
    xp: 50 + setIndex * 10,
    mode: spec.mode,
    questions: spec.questions.map((item, questionIndex) => {
      questionCounter += 1;
      const options = [item.answer, ...item.distractors];
      return {
        id: `${placeId}_s${setIndex + 1}_q${questionIndex + 1}`,
        quiz_id: `natur_${placeId}_set_${setIndex + 1}_q${questionIndex + 1}`,
        categoryId: 'natur', placeId, targetId: placeId,
        question_scope: 'place', question: item.question, options,
        answer: item.answer, answerIndex: 0, knowledge: item.knowledge,
        difficulty: item.difficulty, question_type: 'sted_observasjon',
        question_layer: item.layer, tags: [placeId, 'alnaelva', item.layer],
        source: item.source, claim_basis: 'documented',
        related_emners: ['em_natur_arter_habitat_mangfold'],
        core_concepts: ['arter', 'habitat', 'vassdrag', 'restaurering', 'forvaltning']
      };
    })
  }))
};
if (questionCounter !== 42) throw new Error(`Forventet 42 spørsmål, fikk ${questionCounter}`);

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
if (!routeRow) throw new Error('Mangler Smalvoll i rutemanifestet');
routeRow.sha256 = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, placePath))).digest('hex');
writeJson(routeManifestPath, routeManifest);

const placesIndex = readJson('data/places/places_index.json');
const globalRow = placesIndex.find(x => x.id === placeId);
if (!globalRow) throw new Error('Mangler Smalvoll i global plassindeks');
globalRow.desc = place.desc;
writeJson('data/places/places_index.json', placesIndex);

const report = `# Alna ved Smalvoll – natur-rundinger batch 1\n\n## Omfang\n\n- Fyller alle ni natur-rundinger for \`${placeId}\`.\n- Bevarer ID, koordinat, radius, kategori, routeId og koordinatstatus.\n- Registrerer fortelling, leksikon og 6 × 7 quizspørsmål i manifestene.\n\n## Aktiv artsunion\n\n- Flora: Parkslirekne (\`${knotweed.id}\`, ${knotweed.latin})\n- Fauna: ingen aktive koblinger\n- Totalt: 1 art\n- Regel: Alle aktive koblinger fra fem naturkart. Kartkobling er ikke garanti for feltfunn.\n\n## Stedlig retning\n\nSmalvoll behandles som en smal Alna-korridor mellom nærings- og transportflater. Rundingene bygger på Alnastien langs Smalvollveien, fragmentering, restaureringsbehov, forurensningshistorie og trygg observasjon av parkslirekne uten flytting av plantemateriale.\n\n## Kontroll\n\nMaterialiseringen skal bestå målrettet test, eksisterende Alna-/Oslo-naturtester, \`scripts/check-places.sh\`, indeks- og manifestsynk samt \`git diff --check\`.\n`;
fs.mkdirSync(path.dirname(path.join(root, reportPath)), { recursive: true });
fs.writeFileSync(path.join(root, reportPath), report);

const test = `const assert = require('assert');\nconst crypto = require('crypto');\nconst fs = require('fs');\nconst path = require('path');\nconst repo = path.resolve(__dirname, '..');\nconst readJson = p => JSON.parse(fs.readFileSync(path.join(repo, p), 'utf8'));\nconst expectedRounds = ['tasks','nature','badges','training','civication','brands','før_nå','fortellinger','leksikon'];\nconst runtime = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');\nconst profileMatch = runtime.match(/natur:\\s*\\[([^\\]]+)\\]/);\nassert(profileMatch, 'runtime mangler naturprofil');\nassert.deepStrictEqual(JSON.parse(\`[\${profileMatch[1]}]\`), expectedRounds);\nconst placePath='${placePath}', quizPath='${quizPath}', storyPath='${storyPath}', articlePath='${articlePath}';\nconst place=readJson(placePath), quiz=readJson(quizPath), story=readJson(storyPath)[0], article=readJson(articlePath);\nconst index=readJson('data/places/natur/oslo/places_oslo_natur_alnaelva_rute_index.json').find(x=>x.id===place.id);\nconst routeManifest=readJson('${routeManifestPath}');\nconst manifestRow=routeManifest.places.find(x=>x.id===place.id);\nconst quizManifest=readJson('data/quiz/manifest.json');\nconst storyManifest=readJson('data/stories/stories_manifest.json');\nconst leksikonManifest=readJson('data/leksikon/manifest.json');\nconst validBadges=new Set(readJson('data/badges/natur.json').sub);\nassert.strictEqual(place.id,'${placeId}');\nassert.strictEqual(place.name,'Alna ved Smalvoll');\nassert.strictEqual(place.category,'natur');\nassert.deepStrictEqual([place.lat,place.lon,place.r,place.year??null],[59.92452,10.84269,160,null]);\nassert.strictEqual(place.routeId,'alnaelva_grontdrag');\nassert.strictEqual(place.coordStatus,'nearby_reference');\nassert.strictEqual(place.coordType,'route_point');\nassert.strictEqual(place.coordPrecisionM,180);\nassert(index&&manifestRow);\nassert.deepStrictEqual([index.lat,index.lon,index.r,index.year??null],[place.lat,place.lon,place.r,place.year??null]);\nconst hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,placePath))).digest('hex');\nassert.strictEqual(manifestRow.sha256,hash);\nfor(const key of ['rounds','rundinger','routes','works','people','play_profile','flora','fauna']) assert(!Object.prototype.hasOwnProperty.call(place,key),\`forbudt felt \${key}\`);\nconst roundContent={tasks:place.tasks_profile,nature:place.nature_profile,badges:place.underbadge_ids,training:place.training_profile,civication:place.civication_store,brands:place.brands,før_nå:place.for_na,fortellinger:[story],leksikon:[article]};\nassert.deepStrictEqual(Object.keys(roundContent),expectedRounds);\nfor(const [id,value] of Object.entries(roundContent)){const filled=Array.isArray(value)?value.length>0:Boolean(value&&typeof value==='object');assert(filled,\`mangler \${id}\`);}\nassert(place.externalLinks.length>=8&&place.externalLinks.every(x=>x.type==='repository'||/^https:\\/\\//.test(x.url)));\nassert(place.underbadge_ids.length>=20&&place.underbadge_ids.every(x=>validBadges.has(x)));\nassert.strictEqual(place.tasks_profile.tasks.length,4);\nassert.strictEqual(place.training_profile.exercises.length,3);\nassert(/ikke.*ta på|ikke.*knekk|ikke.*flytt|ikke.*bekjemp/i.test(place.training_profile.safety));\nassert(place.civication_store.length===4&&place.civication_store.every(x=>x.physicalObject&&x.placeSpecific));\nassert(place.brands.length>=8);\nassert(place.for_na.look_for.length>=8);\nassert(place.nature_profile.summary.length>=1800);\nassert.deepStrictEqual(place.nature_profile.nearby_place_ids,['alnaparken','groruddammen','alna_bryn']);\nconst mapFiles=${JSON.stringify(mapFiles)}; const merged={flora:[],fauna:[]};\nfor(const file of mapFiles){const raw=readJson(file);const entry=(raw.places||raw).${placeId};if(!entry)continue;merged.flora.push(...(entry.flora||[]));merged.fauna.push(...(entry.fauna||[]));}\nmerged.flora=[...new Set(merged.flora)].sort();merged.fauna=[...new Set(merged.fauna)].sort();\nassert.deepStrictEqual(merged.flora,['emne_flora_parkslirekne']);assert.deepStrictEqual(merged.fauna,[]);\nconst inventory=place.nature_profile.species_inventory;assert.strictEqual(inventory.total_species,1);assert.deepStrictEqual(inventory.flora.map(x=>x.id),['emne_flora_parkslirekne']);assert.deepStrictEqual(inventory.fauna,[]);\nassert.strictEqual(quiz.sets.length,6);assert(quiz.sets.every((s,i)=>s.order===i+1&&s.questions.length===7));\nassert(quiz.sets.flatMap(s=>s.questions).every(q=>q.categoryId==='natur'&&q.placeId===place.id&&Array.isArray(q.source)&&q.source.length&&q.claim_basis==='documented'&&q.options[q.answerIndex]===q.answer&&q.related_emners.includes('em_natur_arter_habitat_mangfold')));\nassert.deepStrictEqual(quizManifest.sets.filter(x=>x.targetId===place.id),[{targetId:place.id,file:quizPath}]);\nassert(story&&story.place_id===place.id&&story.sources.length>=8);assert(storyManifest.files.some(x=>x.path===storyPath&&x.entity_id===place.id&&x.category==='natur'));\nassert(article&&article.place_id===place.id&&article.version===2&&article.title===place.name);assert(article.sources.length>=8&&article.facts.length>=12&&article.chronology.length>=7);assert(leksikonManifest.files.includes(articlePath));\nconst all=JSON.stringify({place,quiz,story,article});\nfor(const token of ['Alna ved Smalvoll','Alnastien','Smalvollveien','fragmentering','naturrestaurering','parkslirekne','Reynoutria japonica','svært høy','1992']) assert(all.toLowerCase().includes(token.toLowerCase()),\`mangler \${token}\`);\nassert(/ikke en garanti|ikke.*garanti/i.test(all));assert(/ikke.*flytt|ikke.*knekk|uten.*berøring/i.test(all));\nconsole.log('Alna Smalvoll nature rounds batch 1 OK');\n`;
fs.mkdirSync(path.dirname(path.join(root, testPath)), { recursive: true });
fs.writeFileSync(path.join(root, testPath), test);

run(process.execPath, [testPath]);
run(process.execPath, ['tests/oslo-nature-rounds-batch5-alna.test.js']);
run(process.execPath, ['tests/oslo-nature-rounds-batch4.test.js']);
run('bash', ['scripts/check-places.sh']);
run('git', ['diff', '--check']);
console.log('Alna Smalvoll materialized and validated');
