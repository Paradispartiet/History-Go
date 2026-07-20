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

const placeId = 'svartdalen';
const placePath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/svartdalen.json';
const routeManifestPath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute_manifest.json';
const quizPath = 'data/quiz/natur/svartdalen_sets.json';
const storyPath = 'data/stories/stories_svartdalen.json';
const articlePath = 'data/leksikon/places/oslo/natur/leksikon_svartdalen.json';
const reportPath = 'reports/svartdalen-nature-rounds-batch1.md';
const testPath = 'tests/svartdalen-nature-rounds-batch1.test.js';
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
const expectedFlora = ['emne_flora_kjempebjornkjeks'];
const expectedFauna = [];
if (JSON.stringify(union.flora) !== JSON.stringify(expectedFlora) || JSON.stringify(union.fauna) !== JSON.stringify(expectedFauna)) {
  throw new Error(`Uventet artsunion for ${placeId}: ${JSON.stringify(union)}`);
}

const giantHogweed = readJson('data/natur/flora/fremmedarter.json').find(x => x.id === expectedFlora[0]);
if (!giantHogweed) throw new Error('Fant ikke artskortet for kjempebjørnekjeks');

const refs = {
  svartdalen: 'https://oslobyleksikon.no/side/Svartdalen',
  svartdalsparken: 'https://oslobyleksikon.no/side/Svartdalsparken',
  alnastien: 'https://oslobyleksikon.no/side/Alnastien',
  alna: 'https://oslobyleksikon.no/side/Alna_%28elv%29',
  osloRivers: 'https://www.oslo.kommune.no/english/welcome-to-oslo/daily-life-in-oslo/enjoying-the-outdoors/explore-oslo-s-lakes-rivers/',
  niva: 'https://www.niva.no/nyheter/naturrestaurering-er-losningen-for-oslos-mest-forurensede-elv',
  artsdatabanken: 'https://lister.artsdatabanken.no/fremmedartslista/2023/300',
  routeMap: 'data/natur/nature_routes_place_map.json',
  floraData: 'data/natur/flora/fremmedarter.json'
};
const commonSources = [
  source('Oslo byleksikon: Svartdalen', refs.svartdalen),
  source('Oslo byleksikon: Svartdalsparken', refs.svartdalsparken),
  source('Oslo byleksikon: Alnastien', refs.alnastien),
  source('Oslo byleksikon: Alnaelva', refs.alna),
  source('Oslo kommune: innsjøer og elver', refs.osloRivers),
  source('NIVA: Naturrestaurering er løsningen for Alnaelva', refs.niva),
  source('Artsdatabanken: Kjempebjørnekjeks', refs.artsdatabanken),
  source('History Go: aktive naturrutekoblinger', refs.routeMap),
  source('History Go: fremmedarter', refs.floraData)
];

const oldPlace = readJson(placePath);
const place = {
  ...oldPlace,
  desc: 'Skogkledd ravinedal langs Alna med stryk, fall, gammel løvskog, død ved, fuktgradienter, turvei og kjempebjørnekjeks som aktiv artskobling.',
  popupDesc: 'Svartdalen er en trang ravinedal der Alna renner i stryk og fall mellom bratte, skogkledde sider. Gammel løvskog, død ved, skygge, fuktighet og vannlyd gir området et markert naturpreg tett på byen. Alnastien følger dalen på turvei, bruer og gangbaner som gjør terrenget tilgjengelig uten at spilleren skal forlate ferdselsflaten. History Gos aktive naturkart knytter kjempebjørnekjeks til stedet. Kartkoblingen er et observasjonsspor, ikke garanti for funn, og planten skal aldri berøres fordi plantesaften i kombinasjon med sollys kan gi alvorlige hudskader.',
  nature_profile: {
    type: 'ravinedal / gammel løvskog / stryk- og fallsone / elvekorridor',
    title: 'Svartdalen som ravine, gammelskog og bynær elvekorridor',
    summary: `Svartdalen er en trang skjæring ovenfor Kværner der Alna renner gjennom stryk og fall. Dalen skiller seg tydelig fra Bryns tekniske og transportpregede elverom. Her blir terrengformen mer dominerende: elva ligger i dalbunnen, sidene stiger bratt, og skogen skaper et lukket rom med skiftende lys, fuktighet og temperatur over korte avstander. Navnet er knyttet til de mørke bergveggene som gjør dalen skyggefull og visuelt avgrenset.\n\nRavineformen kan leses fra etablert turvei uten at spilleren trenger å gå ut i bratte sider. I dalbunnen er fuktigheten høyere, vannlyden sterkere og vegetasjonen tettere. Lenger opp mot kantene blir det lysere og tørrere. Dette skaper en vertikal gradient som påvirker skogstruktur, mosevekst, nedbrytning og hvilke mikrohabitater som finnes. En god observasjon skiller mellom selve terrengformen, det som kan ses av jord og berg, og geologiske forklaringer som krever egne kilder.\n\nOslo byleksikon beskriver Svartdalen som et område med rik løvskog og relativt urørt natur. Alm, ask, eik, lind, lønn, selje og svartor er nevnt som del av skogen. Dette er dokumentert vegetasjonskontekst, men History Gos aktive artsunion for place-id-en inneholder ikke disse treslagene som spillbare artskort. Rundingen skal derfor bruke dem til å forklare skogtypen og habitatstrukturen, ikke presentere dem som garanterte individuelle funn. Gamle trær, stående og liggende død ved, hulrom, bark, løvstrø og fuktige stammer gir mange små levesteder selv når ingen bestemt dyreart er aktivt kartkoblet.\n\nDød ved er særlig viktig i en gammel skog. Når trær eller greiner brytes ned, lagres fuktighet, næringsstoffer frigjøres gradvis og vedstrukturen blir habitat for sopp, lav, moser, insekter og hulromsbrukere. Spilleren skal ikke bryte bark, flytte stokker eller samle materiale. Observasjonen skjer visuelt fra stien: mengde, diameter, nedbrytningsgrad, om veden står eller ligger, og hvordan den inngår i skogens lagdeling.\n\nAlna er også en fysisk kraft i dalen. Stryk, fall, erosjon og sedimenttransport viser hvordan vannet fortsatt former dalbunnen. Historisk har vannkraften vært brukt til mølle, sagbruk og Kværner-industri. Kværnerfossene ble senere bygget ut og vannet ført i rør i 1948. Dermed forteller landskapet både om naturprosesser og om tekniske inngrep som har endret vannføring og tilgjengelig elverom. En synlig mur, kanal eller bro skal ikke gis en bestemt funksjon uten kilde, men kan dokumenteres som del av det tekniske landskapet.\n\nTilgjengeligheten er et eget læringstema. Alnastien går gjennom Svartdalen på turvei, bruer og opphøyde gangbaner. En viktig strekning åpnet i 2011 og gjorde den trange dalen mulig å følge sammenhengende. Tilretteleggingen beskytter også deler av den sårbare skogbunnen ved å samle ferdselen. Samtidig er gangbanen et inngrep som påvirker hvordan naturrommet oppleves. Rundingen skal derfor vise både gevinsten—tilgang, sammenheng og mindre tråkk—og behovet for å respektere rekkverk, glatte flater, andre brukere og eventuelle avsperringer.\n\nHistory Gos fem aktive naturkart gir en union på én art for Svartdalen: kjempebjørnekjeks (Heracleum mantegazzianum). Artsdatabanken vurderer arten til svært høy økologisk risiko. Den kan bli flere meter høy og kjennes ofte på store hvite skjermer, kraftig stengel og store flikete blader. Plantesaften kan i kombinasjon med sollys gi alvorlige hudskader. Store skjermplanter kan forveksles, og planten skal derfor aldri undersøkes med berøring. Et mulig funn registreres med avstandsfoto, sted, omtrentlige mål og tydelig usikkerhet.\n\nSvartdalen viser at bynær natur ikke trenger å være flat park. Ravine, stryk, gammel løvskog, død ved og gangbane danner et sammenhengende læringsrom. Oppstrøms ligger Bryns foss- og industrilandskap; nedstrøms fortsetter Alna mot Kværnerbyen og de mer ombygde delene av vassdraget. Den viktigste læringen er hvordan terreng, vann, skogstruktur, historisk bruk og moderne tilrettelegging virker sammen—og hvordan natur kan gjøres tilgjengelig uten at spilleren behandler den som en samling objekter som kan berøres eller flyttes.`,
    themes: [
      'Svartdalen som trang ravinedal',
      'Alna i stryk og fall',
      'mørke bergvegger og skygge',
      'vertikal lys- og fuktgradient',
      'rik gammel løvskog',
      'død ved og mikrohabitater',
      'erosjon og sedimenttransport',
      'mølle, sagbruk og Kværner-industri',
      'Kværnerfossene ført i rør i 1948',
      'Alnastien og gangbane åpnet i 2011',
      'kjempebjørnekjeks som eneste aktive artskobling',
      'tilgjengelighet uten terrengslitasje'
    ],
    species_inventory: {
      source_maps: mapFiles,
      flora: [{ id: giantHogweed.id, name: giantHogweed.title, latin: giantHogweed.latin, status: 'fremmed_art_svaert_hoy_risiko_helsefare', map: 'nature_routes_place_map.json' }],
      fauna: [],
      total_species: 1,
      rule: 'all_active_mapped_species_for_place'
    },
    documented_habitat_context: {
      tree_groups: ['alm', 'ask', 'eik', 'lind', 'lønn', 'selje', 'svartor'],
      note: 'Dokumentert skogkontekst, ikke aktive artskort eller garanterte feltfunn.'
    },
    nearby_place_ids: ['alna_bryn', 'kvaernerbyen_alna', 'alna_utlop_bjorvika']
  },
  tags: ['ravine', 'elv', 'lovskog', 'gammelskog', 'dod_ved', 'grontkorridor', 'fremmede_arter'],
  underbadge_ids: [
    'urbannatur', 'skog', 'vann_og_vassdrag', 'ravine_og_dal', 'elv', 'bekk',
    'foss_og_stryk', 'elvebredde', 'kantvegetasjon', 'planter_og_blomster',
    'traer', 'sopp_og_lav', 'fremmede_arter', 'biologisk_mangfold', 'okosystem',
    'habitat', 'nisje', 'succession', 'kretslop', 'erosjon', 'sedimenter',
    'spredningskorridor', 'gronn_korridor', 'blagronn_struktur', 'naturvern',
    'naturrestaurering', 'skjotsel', 'miljotiltak', 'artsregistrering',
    'friluftsforvaltning', 'tursti', 'rekreasjon', 'grontdrag', 'skrent', 'dalform'
  ],
  visual: { designCode: 'park_miniature' },
  emne_ids: ['em_natur_arter_habitat_mangfold'],
  quiz_profile: {
    place_type: 'ravinedal, gammel løvskog og strykpreget byelv',
    subtype: 'svartdalen',
    signature_features: [
      'Alna renner i stryk og fall gjennom en trang dal',
      'rik gammel løvskog og død ved',
      'vertikal gradient i lys og fukt',
      'Alnastien går på bruer og opphøyde gangbaner',
      'én aktiv artskobling: kjempebjørnekjeks'
    ],
    primary_angles: ['ravineterreng', 'skogstruktur_og_dod_ved', 'vannprosess', 'tilgjengelighet_og_vern', 'fremmed_art_og_helsefare'],
    question_families: ['stedsspesifikk_naturfunksjon', 'ravine_og_gradient', 'skogstruktur', 'vann_og_industrihistorie', 'sikkerhet', 'kildekritikk'],
    avoid_angles: ['udokumenterte_artsfunn', 'plantekontakt', 'klatring_i_skrenter', 'vading', 'flytting_av_dod_ved', 'dagsaktuell_brustatus_uten_kilde'],
    must_include: ['ravinedal', 'stryk og fall', 'gammel løvskog og død ved', 'Alnastien 2011', 'kjempebjørnekjeks skal ikke berøres'],
    contrast_targets: ['alna_bryn', 'kvaernerbyen_alna', 'alna_utlop_bjorvika'],
    notes: 'Hold observasjonene til turvei og gangbane. Dokumentert skogkontekst må ikke forveksles med aktive artskort.'
  },
  externalLinks: [
    { type: 'reference', label: 'Oslo byleksikon: Svartdalen', url: refs.svartdalen, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo byleksikon: Svartdalsparken', url: refs.svartdalsparken, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo byleksikon: Alnastien', url: refs.alnastien, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo byleksikon: Alnaelva', url: refs.alna, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Oslo kommune: innsjøer og elver', url: refs.osloRivers, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'NIVA: Naturrestaurering i Alnaelva', url: refs.niva, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'reference', label: 'Artsdatabanken: Kjempebjørnekjeks', url: refs.artsdatabanken, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: aktive naturrutekoblinger', url: refs.routeMap, lang: 'nb', verifiedAt: '2026-07-20' },
    { type: 'repository', label: 'History Go: fremmedarter', url: refs.floraData, lang: 'nb', verifiedAt: '2026-07-20' }
  ],
  tasks_profile: {
    title: 'Les ravinen uten å forlate stien',
    summary: 'Fire oppgaver undersøker terrenggradient, død ved, vannprosess og kjempebjørnekjeks fra trygg ferdselsflate.',
    tasks: [
      { id: 'svartdalen_oppgave_gradient', title: 'Tegn dalens gradient', instruction: 'Fra turveien: noter dalbunn, elv, nedre skråning, øvre skråning og bykant. Beskriv hvordan lys og fukt ser ut til å endre seg.', why: 'Ravinen skaper raske miljøendringer over korte avstander.' },
      { id: 'svartdalen_oppgave_dod_ved', title: 'Registrer skogstruktur og død ved', instruction: 'Tell synlige stående og liggende døde trestykker fra stien. Noter størrelse, nedbrytningsgrad og om de ligger i sol, skygge eller fukt.', why: 'Død ved skaper mikrohabitater og viser skogens alder og nedbrytningsprosesser.' },
      { id: 'svartdalen_oppgave_vann', title: 'Les stryk, fall og sedimenter', instruction: 'Finn et sikkert utsiktspunkt og noter vannhastighet, stein, skum, sedimenter, erosjon og tekniske kanter uten å gå nær vannet.', why: 'Alnas kraft og dalens form kan leses gjennom synlige vannprosesser.' },
      { id: 'svartdalen_oppgave_kjempebjornkjeks', title: 'Dokumenter mulig kjempebjørnekjeks på avstand', instruction: 'Se etter svært høy skjermplante med kraftig stengel, store flikete blader og store hvite skjermer. Ikke gå nærmere eller berør; bruk avstandsfoto og marker usikkerhet.', why: 'Arten er både en høyrisiko fremmedart og en direkte helsefare.' }
    ]
  },
  training_profile: {
    title: 'Skånsom ravineøkt på Alnastien',
    summary: 'Tre øvelser bruker turvei og gangbane uten ferdsel i skrenter, skogbunn eller elvekant.',
    safety: 'Hold deg på etablert turvei, bru og gangbane. Ikke klatre i skrenter, gå utenfor rekkverk, vad, gå ned til stryk eller flytt død ved. Underlaget kan være vått og glatt. Ikke berør, knekk eller gå nær mulig kjempebjørnekjeks; plantesaft og sollys kan gi alvorlige hudskader. Respekter skilting og eventuelle avsperringer.',
    exercises: [
      { id: 'svartdalen_trening_dalgange', title: 'Rolig dalgange', instruction: 'Gå 18 minutter på etablert rute og bruk broer eller tydelige stikryss som vendepunkt.', duration_minutes: 18, intensity: 'rolig', why: 'Runden gjør dalens lengde, fall og skiftende rom fysisk lesbare.' },
      { id: 'svartdalen_trening_stigning', title: 'Fire kontrollerte stigninger', instruction: 'Velg en trygg del av turveien med moderat helning. Gå raskt i 45 sekunder og rolig i 90 sekunder, fire ganger.', duration_minutes: 10, intensity: 'moderat', why: 'Øvelsen bruker ravineterrenget uten å belaste skrent eller skogbunn.' },
      { id: 'svartdalen_trening_sansestopp', title: 'Tre sansestopp', instruction: 'Stans på tre brede punkter og bruk ett minutt på vannlyd, lysnivå og skogstruktur.', duration_minutes: 5, intensity: 'lett', why: 'Sansestoppene gjør gradientene tydelige uten inngrep.' }
    ]
  },
  civication_store: [
    { id: 'svartdalen_ravinerelieff', title: 'Relieff av Svartdalen', type: 'relieffmodell', kind: 'physical_object', desc: 'En fysisk modell av dalbunn, elv, skrenter, skog og bykant.', placeSpecificReason: 'Ravineformen er stedets viktigste naturfaglige struktur.', historicalFunction: 'Viser hvordan elva og senere byutvikling har formet et trangt landskapsrom.', physicalObject: true, placeSpecific: true, storePrice: 50, currency: 'PC', collection: 'svartdalen', collectable: true },
    { id: 'svartdalen_dodved_plate', title: 'Død ved og skoglag', type: 'feltplate', kind: 'physical_object', desc: 'Sammenligningsplate for stående død ved, liggende stokker, løvstrø, bark og nedbrytningsgrader.', placeSpecificReason: 'Gammel løvskog og død ved preger Svartdalens habitatstruktur.', historicalFunction: 'Dokumenterer hvorfor eldre skog skiller seg fra parkmessig ryddede flater.', physicalObject: true, placeSpecific: true, storePrice: 36, currency: 'PC', collection: 'svartdalen', collectable: true },
    { id: 'svartdalen_gangbanekart', title: 'Kart over Alnastien i ravinen', type: 'turveikart', kind: 'physical_object', desc: 'Kart over turvei, bruer, gangbaner, dalrom og sikre observasjonspunkter.', placeSpecificReason: 'Tilretteleggingen gjør den bratte dalen tilgjengelig og samler ferdselen.', historicalFunction: 'Knytter den eldre Alnastien til gjennomføringen av den sammenhengende strekningen i 2011.', physicalObject: true, placeSpecific: true, storePrice: 42, currency: 'PC', collection: 'svartdalen', collectable: true },
    { id: 'svartdalen_kjempebjornkjeks_sikkerhetskort', title: 'Kjempebjørnekjeks – sikkerhetskort', type: 'artskort', kind: 'physical_object', desc: 'Feltkort med kjennetegn, forvekslingsfare, avstandsobservasjon og berøringsforbud.', placeSpecificReason: 'Kjempebjørnekjeks er Svartdalens eneste aktive artskobling.', historicalFunction: 'Viser hvordan fremmedartsforvaltning og folkehelse inngår i dagens bynaturarbeid.', physicalObject: true, placeSpecific: true, storePrice: 26, currency: 'PC', collection: 'svartdalen', collectable: true }
  ],
  brands: [
    { id: 'svartdalen_actor', name: 'Svartdalen', brand_kind: 'ravine_valley', brand_type: 'primary_place' },
    { id: 'alnaelva_actor_svartdalen', name: 'Alnaelva', brand_kind: 'urban_river', brand_type: 'natural_system' },
    { id: 'alnastien_actor_svartdalen', name: 'Alnastien', brand_kind: 'river_path', brand_type: 'access_and_connection' },
    { id: 'svartdalsparken_actor', name: 'Svartdalsparken', brand_kind: 'urban_nature_park', brand_type: 'park_context' },
    { id: 'kvaerner_brug_actor_svartdalen', name: 'Kværner Brug', brand_kind: 'historic_industry', brand_type: 'water_power_actor' },
    { id: 'oslo_kommune_svartdalen', name: 'Oslo kommune', brand_kind: 'municipality', brand_type: 'planning_authority' },
    { id: 'bymiljoetaten_svartdalen', name: 'Bymiljøetaten', brand_kind: 'municipal_agency', brand_type: 'path_and_nature_manager' },
    { id: 'vav_svartdalen', name: 'Vann- og avløpsetaten', brand_kind: 'municipal_agency', brand_type: 'water_management_actor' },
    { id: 'niva_svartdalen', name: 'NIVA', brand_kind: 'research_institute', brand_type: 'river_restoration_research' },
    { id: 'oslo_elveforum_svartdalen', name: 'Oslo Elveforum', brand_kind: 'river_forum', brand_type: 'knowledge_and_advocacy_actor' },
    { id: 'alnaelvas_venner_svartdalen', name: 'Alnaelvas Venner', brand_kind: 'local_association', brand_type: 'river_care_actor' }
  ],
  for_na: {
    title: 'Fra mølle- og industridal til tilgjengelig gammelskogkorridor',
    before: 'Stryk og fall i Svartdalen ble brukt til mølle, sagbruk og senere Kværner-industri. Deler av vannkraften ble bygget ut, og Kværnerfossene ble ført i rør i 1948. Den bratte dalen var vanskelig å ferdes gjennom.',
    now: 'Svartdalen er et tilgjengelig naturrom med Alnasti, bruer og gangbaner gjennom gammel løvskog, død ved og strykpreget elv. Samtidig er vassdraget historisk endret, og kjempebjørnekjeks representerer en moderne forvaltnings- og helseutfordring.',
    change: 'Elva har gått fra å være direkte kraftkilde og industrirom til å bli en natur-, frilufts- og læringskorridor. Tilretteleggingen gjør dalen lesbar, men krever at ferdselen holdes på robuste flater og at den gamle skogstrukturen får ligge urørt.',
    look_for: [
      'dalbunnen og de bratte sidene',
      'mørke bergvegger og skyggevirkning',
      'stryk, fall og vannlyd',
      'lys- og fuktforskjell fra bunn til kant',
      'gamle løvtrær og flersjiktet skog',
      'stående og liggende død ved',
      'murer, broer eller andre tekniske inngrep',
      'gangbane og rekkverk som styrer ferdselen',
      'mulig kjempebjørnekjeks kun fra trygg avstand',
      'overgangen videre mot Kværnerbyen'
    ],
    sources: Object.values(refs)
  }
};

const story = [{
  id: 'st_svartdalen_fra_kraftdal_til_gammelskogsti',
  type: 'environmental',
  title: 'Dalen der skogen og industrien deler elva',
  year: 2011,
  place_id: placeId,
  person_id: null,
  summary: 'Svartdalen viser Alna som stryk og fall i en gammel løvskog, formet både av ravineterrenget, vannkraftindustrien og Alnastiens gangbaner.',
  story: `Svartdalen er et sted der byen plutselig smalner. Alna renner mellom mørke bergvegger, bratte sider og gammel løvskog. Vannlyden og skyggen gjør dalen fysisk annerledes enn Bryn like oppstrøms.\n\nStrykene og fallene var også en ressurs. Mølle, sagbruk og Kværner-industri brukte vannkraften, og deler av fossesystemet ble senere bygget om og ført i rør. Elva er derfor både naturkraft og industrispor.\n\nDa en sammenhengende del av Alnastien gjennom den trange dalen åpnet i 2011, ble naturrommet lettere å oppleve. Bruer og opphøyde gangbaner samler ferdselen og gjør det mulig å lese ravinen uten å tråkke gjennom den fuktige skogbunnen.\n\nDen gamle skogen forteller sin egen historie gjennom store trær, løvstrø og død ved. Kjempebjørnekjeks tilfører et moderne forvaltningsproblem: en plante som kan skade både natur og hud. Svartdalen lærer derfor ikke bare hva som finnes, men hvordan et sårbart sted skal observeres—fra stien, med avstand og uten å flytte noe.`,
  sources: commonSources,
  tags: ['svartdalen', 'alnaelva', 'ravine', 'gammel_lovskog', 'dod_ved', 'alnastien', 'kjempebjørnekjeks'],
  related_people: [],
  related_places: ['alna_bryn', 'kvaernerbyen_alna', 'alna_utlop_bjorvika'],
  score: { narrative: 5, historical: 5, source: 5, play_value: 5, originality: 4, total: 24 },
  arc: {
    start: 'Alna skar seg gjennom en mørk og bratt dal med stryk og fall.',
    middle: 'Vannkraften ble brukt av mølle, sagbruk og industri, mens elverommet ble teknisk endret.',
    end: 'Alnastien gjør ravinen tilgjengelig, men gammel skog, død ved og risikoplanter krever varsom ferdsel.'
  },
  next_scenes: [
    { place_id: 'kvaernerbyen_alna', reason: 'Kværnerbyen viser hvordan Alna går videre inn i et enda mer omformet industri- og boliglandskap.' },
    { place_id: 'alna_bryn', reason: 'Bryn viser fossen og industrien i et mer åpent og transportdominert landskap oppstrøms.' }
  ]
}];

const fact = (id, label, desc, sources, confidence = 'high') => ({ id, label, desc, confidence, sources });
const chronology = [
  { id: 'chrono_01', year: 1800, period: 'Mølle- og sagbrukslandskap', desc: 'Stryk og fall i dalen ble historisk brukt til mølle og sagbruk.', confidence: 'medium', sources: [source('Oslo byleksikon: Svartdalen', refs.svartdalen)] },
  { id: 'chrono_02', year: 1853, period: 'Kværner Brug etableres', desc: 'Industrivirksomheten ved Kværner bygde videre på vannkraftgrunnlaget i Alna.', confidence: 'medium', sources: [source('Oslo byleksikon: Svartdalen', refs.svartdalen)] },
  { id: 'chrono_03', year: 1938, period: 'Nedre Alnasti anlegges', desc: 'Den nederste strekningen av Alnastien ble anlagt.', confidence: 'high', sources: [source('Oslo byleksikon: Alnastien', refs.alnastien)] },
  { id: 'chrono_04', year: 1948, period: 'Kværnerfossene føres i rør', desc: 'Kværnerfossene ble bygget ut og vannet ført i rør.', confidence: 'high', sources: [source('Oslo byleksikon: Svartdalen', refs.svartdalen)] },
  { id: 'chrono_05', year: 1992, period: 'Aksjon Alna starter', desc: 'Kommunen startet Aksjon Alna og arbeidet med turveien ble videreført.', confidence: 'high', sources: [source('Oslo byleksikon: Alnastien', refs.alnastien)] },
  { id: 'chrono_06', year: 1993, period: 'Svartdalsparken rehabiliteres', desc: 'Parkområdet ble rehabilitert som del av et fornyet grøntdrag.', confidence: 'high', sources: [source('Oslo byleksikon: Svartdalsparken', refs.svartdalsparken)] },
  { id: 'chrono_07', year: 2011, period: 'Sammenhengende turvei åpner', desc: 'Turveien gjennom den trange dalen med bruer og gangbaner ble åpnet.', confidence: 'high', sources: [source('Oslo byleksikon: Svartdalen', refs.svartdalen)] },
  { id: 'chrono_08', year: 2023, period: 'Kjempebjørnekjeks vurderes til SE', desc: 'Fremmedartslista vurderte kjempebjørnekjeks til svært høy økologisk risiko.', confidence: 'high', sources: [source('Artsdatabanken: Kjempebjørnekjeks', refs.artsdatabanken)] },
  { id: 'chrono_09', year: 2026, period: 'History Go-rundingen', desc: 'Svartdalen får full natur-runding med artsunion, skogstruktur og sikkerhetsregler.', confidence: 'high', sources: [source('History Go: aktive naturrutekoblinger', refs.routeMap)] }
];
const article = {
  place_id: placeId,
  visual: { designCode: 'article_nature_route_miniature' },
  version: 2,
  title: 'Svartdalen',
  popupDesc: 'Trang ravinedal langs Alna med stryk, gammel løvskog, død ved, industrihistorie, gangbaner og kjempebjørnekjeks som aktiv artskobling.',
  wikiText: [
    'Svartdalen er en trang skjæring ovenfor Kværner der Alna renner i stryk og fall mellom bratte, skogkledde sider.',
    'Dalen har rik gammel løvskog, død ved og tydelige forskjeller i lys og fukt mellom dalbunn og øvre kanter.',
    'Vannkraften ble historisk brukt av mølle, sagbruk og Kværner-industri; Kværnerfossene ble ført i rør i 1948.',
    'Alnastien gjør dalen tilgjengelig på turvei, bruer og gangbaner. History Gos aktive artskobling er kjempebjørnekjeks, som aldri skal berøres.'
  ],
  summary: {
    one_liner: 'Svartdalen gjør Alnas ravine, gammelskog, vannkraft og moderne naturforvaltning lesbar i ett trangt byrom.',
    themes: ['ravinedal', 'stryk og fall', 'gammel løvskog', 'død ved', 'vannkraft', 'Alnastien', 'kjempebjørnekjeks'],
    tone: ['nøktern', 'stedsspesifikk', 'sikkerhetsbevisst']
  },
  facts: [
    fact('fact_01', 'Ravinedal', 'Svartdalen er en trang skjæring ovenfor Kværner.', [source('Oslo byleksikon: Svartdalen', refs.svartdalen)]),
    fact('fact_02', 'Vannform', 'Alna renner i stryk og fall gjennom dalen.', [source('Oslo byleksikon: Svartdalen', refs.svartdalen)]),
    fact('fact_03', 'Navn', 'Navnet er knyttet til de mørke bergveggene i dalen.', [source('Oslo byleksikon: Svartdalen', refs.svartdalen)]),
    fact('fact_04', 'Løvskog', 'Dalen har rik løvskog med blant annet alm, ask, eik, lind, lønn, selje og svartor.', [source('Oslo byleksikon: Svartdalen', refs.svartdalen)]),
    fact('fact_05', 'Død ved', 'Gammel skog og død ved gir struktur og mikrohabitater som er viktige for biologisk mangfold.', [source('Oslo byleksikon: Svartdalen', refs.svartdalen)]),
    fact('fact_06', 'Historisk bruk', 'Vannkraften i dalen ble brukt til mølle, sagbruk og senere industri.', [source('Oslo byleksikon: Svartdalen', refs.svartdalen)]),
    fact('fact_07', 'Rørlegging', 'Kværnerfossene ble ført i rør i 1948.', [source('Oslo byleksikon: Svartdalen', refs.svartdalen)]),
    fact('fact_08', 'Alnastien', 'Turvei D10/Alnastien går gjennom Svartdalen.', [source('Oslo byleksikon: Alnastien', refs.alnastien)]),
    fact('fact_09', 'Åpningsår', 'En sammenhengende turveistrekning gjennom den trange dalen åpnet i 2011.', [source('Oslo byleksikon: Svartdalen', refs.svartdalen)]),
    fact('fact_10', 'Aktiv artskobling', 'History Gos naturkart knytter kjempebjørnekjeks til place-id-en svartdalen.', [source('History Go: aktive naturrutekoblinger', refs.routeMap)]),
    fact('fact_11', 'Vitenskapelig navn', `Kjempebjørnekjeks har det vitenskapelige navnet ${giantHogweed.latin}.`, [source('History Go: fremmedarter', refs.floraData), source('Artsdatabanken: Kjempebjørnekjeks', refs.artsdatabanken)]),
    fact('fact_12', 'Risiko', 'Kjempebjørnekjeks er vurdert til svært høy økologisk risiko.', [source('Artsdatabanken: Kjempebjørnekjeks', refs.artsdatabanken)]),
    fact('fact_13', 'Helsefare', 'Plantesaften kan i kombinasjon med sollys gi alvorlige hudskader.', [source('Artsdatabanken: Kjempebjørnekjeks', refs.artsdatabanken)]),
    fact('fact_14', 'Kildekritisk feltregel', 'Kartkoblingen er et observasjonsspor, ikke garanti for at planten er synlig ved et besøk.', [source('History Go: aktive naturrutekoblinger', refs.routeMap)]),
    fact('fact_15', 'Skogkontekst', 'Dokumenterte treslag i dalen er habitatkontekst og skal ikke behandles som aktive artskort uten kartkobling.', [source('Oslo byleksikon: Svartdalen', refs.svartdalen), source('History Go: aktive naturrutekoblinger', refs.routeMap)])
  ],
  chronology,
  sections: [
    { id: 'ravine_og_gradient', title: 'Ravinen og gradienten', text: 'Bratte sider, mørke bergvegger og elva i dalbunnen skaper tydelige forskjeller i lys, fukt og temperatur.' },
    { id: 'skogstruktur', title: 'Gammel løvskog og død ved', text: 'Gamle trær, løvstrø og nedbrytende ved danner en flersjiktet habitatstruktur som ikke skal ryddes eller flyttes av besøkende.' },
    { id: 'vannkraft_og_inngrep', title: 'Vannkraft og inngrep', text: 'Møller, sagbruk, industri og rørlegging viser hvordan elvas fall har blitt brukt og omformet.' },
    { id: 'tilgang_og_sikkerhet', title: 'Tilgang og sikkerhet', text: 'Alnastien gjør ravinen tilgjengelig, men ferdselen skal holdes på gangbane og turvei. Mulig kjempebjørnekjeks observeres kun på avstand.' }
  ],
  related_places: ['alna_bryn', 'kvaernerbyen_alna', 'alna_utlop_bjorvika'],
  sources: commonSources
};

const qSources = {
  valley: [refs.svartdalen, refs.svartdalsparken],
  path: [refs.alnastien, refs.svartdalen],
  river: [refs.svartdalen, refs.alna, refs.niva],
  plant: [refs.artsdatabanken, refs.floraData],
  map: [refs.routeMap],
  mixed: [refs.svartdalen, refs.alnastien, refs.artsdatabanken, refs.routeMap]
};
const q = (question, answer, distractors, knowledge, sourceKey, layer, difficulty = 1) => ({ question, answer, distractors, knowledge, source: qSources[sourceKey], layer, difficulty });
const setSpecs = [
  { mode: 'place_intro', layer: 'intro', questions: [
    q('Hvilken elv renner gjennom Svartdalen?', 'Alna', ['Akerselva', 'Lysakerelva'], 'Svartdalen er en del av Alna-korridoren.', 'valley', 'intro'),
    q('Hva slags landskapsform er Svartdalen?', 'En trang ravinedal', ['En flat strandeng', 'Et åpent høyfjell'], 'Bratte sider og elv i dalbunnen danner ravinepreget.', 'valley', 'intro'),
    q('Hvordan beveger vannet seg her?', 'I stryk og fall', ['Som stillestående saltvann', 'Bare i underjordiske rør'], 'Alna er synlig som energisk vannløp i dalen.', 'valley', 'intro'),
    q('Hva kjennetegner skogen?', 'Rik gammel løvskog', ['Kun ung granplantasje', 'Ingen trær'], 'Løvskogen er en hoveddel av naturpreget.', 'valley', 'intro'),
    q('Hva bør observeres først?', 'Dalbunn, skrenter, elv, skog og gangbane', ['Bare byggehøyder', 'Kun parkerte biler'], 'Disse elementene viser hvordan naturrommet er bygget opp.', 'mixed', 'intro'),
    q('Hva er riktig ferdselsregel?', 'Hold deg på turvei og gangbane', ['Klatre i skrenten', 'Gå ut i stryket'], 'Tilretteleggingen gjør observasjon mulig uten terrengslitasje.', 'path', 'intro'),
    q('Hvor mange aktive artskoblinger har stedet?', 'Én', ['Sju', 'Ingen'], 'Den aktive unionen består av kjempebjørnekjeks.', 'map', 'intro')
  ]},
  { mode: 'ravine_forest', layer: 'habitat', questions: [
    q('Hvor er det normalt fuktigst i ravinen?', 'Nær dalbunnen og elva', ['På tørre hustak', 'Alltid ved øvre bykant'], 'Terreng og skygge holder mer fukt i bunnen.', 'valley', 'habitat'),
    q('Hvorfor er dalen ofte skyggefull?', 'Bratte sider, bergvegger og trekroner skjermer lyset', ['Elva produserer mørke', 'Alle trær er svarte'], 'Ravineformen skaper et lukket lysmiljø.', 'valley', 'habitat'),
    q('Hva betyr en lys- og fuktgradient?', 'Miljøet endrer seg fra dalbunn til kant', ['Alle steder er identiske', 'Bare årstallet endrer seg'], 'Korte avstander kan gi ulike mikrohabitater.', 'valley', 'habitat'),
    q('Hvorfor er gammel løvskog viktig?', 'Den gir variert struktur, hulrom og nedbrytning', ['Den fjerner alle arter', 'Den stopper elva'], 'Alder og variasjon skaper flere habitattyper.', 'valley', 'habitat'),
    q('Hva gir død ved?', 'Mikrohabitater og langsom næringsfrigjøring', ['Bare søppel', 'Et sikkert tegn på dårlig forvaltning'], 'Nedbrytende ved er en naturlig del av gammel skog.', 'valley', 'habitat'),
    q('Hva skal spilleren gjøre med liggende stokker?', 'La dem ligge og observere fra stien', ['Flytte dem for bedre bilde', 'Ta med barkprøve'], 'Død ved skal ikke forstyrres.', 'valley', 'habitat'),
    q('Hva er en kildekritisk skogregel?', 'Dokumentert skogtype er ikke det samme som aktivt artskort', ['Alle nevnte treslag er garantert synlige', 'Kartkoblinger kan ignoreres'], 'Habitatkontekst og artsregistrering er ulike datanivåer.', 'mixed', 'habitat', 2)
  ]},
  { mode: 'river_history', layer: 'history', questions: [
    q('Hva ble stryk og fall historisk brukt til?', 'Mølle, sagbruk og industri', ['Flyplassdrift', 'Saltproduksjon'], 'Vannkraften var en lokal energikilde.', 'valley', 'history'),
    q('Hvilken industri er særlig knyttet til nedre dal?', 'Kværner-industrien', ['Hvalfangstflåten', 'Fjellgruvedrift'], 'Kværner bygde videre på Alnas vannkraftlandskap.', 'valley', 'history'),
    q('Hva skjedde med Kværnerfossene i 1948?', 'De ble ført i rør', ['De ble flyttet til Marka', 'De ble saltvann'], 'Teknisk utbygging endret det synlige vannløpet.', 'valley', 'history'),
    q('Hva kan en mur eller kanal vise?', 'At elverommet er teknisk omformet', ['En sikker datering uten kilde', 'At dalen er urørt'], 'Synlige inngrep kan registreres, men funksjon må kildebelegges.', 'river', 'history'),
    q('Hva er feil å gjøre med et teknisk spor?', 'Gi det sikker funksjon og alder uten kilde', ['Fotografere det fra stien', 'Beskrive plassering og materiale'], 'Tolkning må skilles fra observasjon.', 'river', 'history'),
    q('Hvordan former vannet fortsatt dalen?', 'Gjennom strøm, erosjon og sedimenttransport', ['Gjennom biltrafikk', 'Gjennom kunstig lys alene'], 'Elva er fortsatt en fysisk prosess.', 'river', 'history'),
    q('Hva er den beste samleforståelsen?', 'Naturprosess og industrihistorie virker i samme elverom', ['Industrien fjernet all natur', 'Elva har aldri blitt endret'], 'Svartdalen rommer både ravine og tekniske inngrep.', 'mixed', 'history', 2)
  ]},
  { mode: 'plant_safety', layer: 'flora', questions: [
    q('Hvilken art er aktivt koblet til Svartdalen?', 'Kjempebjørnekjeks', ['Parkslirekne', 'Åkerkvein'], 'Kjempebjørnekjeks er den eneste aktive artskoblingen.', 'map', 'flora'),
    q('Hva er artens vitenskapelige navn?', 'Heracleum mantegazzianum', ['Reynoutria japonica', 'Agrostis gigantea'], 'Artsnavnet er Heracleum mantegazzianum.', 'plant', 'flora'),
    q('Hvordan vurderes arten?', 'Svært høy økologisk risiko', ['Ingen kjent risiko', 'Hjemmehørende rødlisteart'], 'Artsdatabanken vurderer den til SE.', 'plant', 'flora'),
    q('Hva kan plantesaften gjøre i sollys?', 'Gi alvorlige hudskader', ['Gi bedre solbeskyttelse', 'Farge huden grønn'], 'Plantesaften er fototoksisk.', 'plant', 'flora'),
    q('Hvilket kjennetegn passer?', 'Svært høy skjermplante med store flikete blader', ['Liten brun spurv', 'Lav mosepute'], 'Størrelse, skjermer og blader er sentrale trekk.', 'plant', 'flora'),
    q('Hva er riktig feltatferd?', 'Hold avstand og fotografer uten berøring', ['Knekk stengelen', 'Grav opp roten'], 'Observasjon skal ikke gi eksponering eller spredning.', 'plant', 'flora'),
    q('Hvorfor skal funnet merkes som usikkert ved tvil?', 'Store skjermplanter kan forveksles', ['Planten har ingen kjennetegn', 'Alle skjermplanter er samme art'], 'Sikker artsbestemmelse krever flere trekk.', 'plant', 'flora', 2)
  ]},
  { mode: 'trail_stewardship', layer: 'management', questions: [
    q('Når åpnet den sammenhengende turveien gjennom den trange dalen?', '2011', ['1948', '1889'], 'Året markerer en viktig tilgjengeliggjøring.', 'path', 'management'),
    q('Hva er en fordel med gangbane?', 'Den samler ferdselen og beskytter skogbunnen', ['Den fjerner behovet for naturvern', 'Den gjør skrenten trygg å klatre i'], 'Tilrettelegging kan redusere tilfeldig tråkk.', 'path', 'management'),
    q('Hva er samtidig sant om gangbanen?', 'Den er også et inngrep i naturrommet', ['Den er en naturlig bergart', 'Den påvirker aldri opplevelsen'], 'Tilgang og inngrep må vurderes sammen.', 'path', 'management', 2),
    q('Hva bør gjøres på våte eller glatte partier?', 'Reduser fart og bruk rekkverk der det finnes', ['Gå utenfor stien', 'Løp mot elvekanten'], 'Ravinemiljøet kan gi glatte flater.', 'path', 'management'),
    q('Hva skal registreres ved død ved?', 'Plassering, størrelse og nedbrytningsgrad uten flytting', ['Bare hvor mye som kan samles', 'Hvor lett barken løsner'], 'Observasjon skal være ikke-inngripende.', 'valley', 'management'),
    q('Hva skal gjøres ved avsperring?', 'Følge skilting og velge annen rute', ['Klatre rundt', 'Flytte sperringen'], 'Dagsaktuelle sikkerhetstiltak skal respekteres.', 'path', 'management'),
    q('Hva er god samlet forvaltning?', 'Tilgang på robuste flater og ro i skrent, skogbunn og elvekant', ['Fri ferdsel overalt', 'Permanent stenging av hele dalen'], 'Ferdselsstyring balanserer bruk og vern.', 'mixed', 'management', 2)
  ]},
  { mode: 'synthesis', layer: 'synthesis', questions: [
    q('Hva er den sterkeste samlebeskrivelsen av Svartdalen?', 'Ravine, stryk, gammel løvskog og tilgjengelig bynatur', ['Flat handelspark', 'Saltvannshavn'], 'Stedets lag må forstås sammen.', 'mixed', 'synthesis', 2),
    q('Hva skiller Svartdalen fra Bryn?', 'Svartdalen har sterkere ravine- og gammelskogpreg', ['Svartdalen mangler Alna', 'Bryn er urørt skog'], 'Overgangen viser hvordan elvelandskapet skifter karakter.', 'mixed', 'synthesis'),
    q('Hva skiller Svartdalen fra Kværnerbyen?', 'Svartdalen har mer sammenhengende skog og brattere naturrom', ['Kværnerbyen ligger oppstrøms Alnsjøen', 'Svartdalen er bare boligblokker'], 'Nedstrøms blir det ombygde bylandskapet sterkere.', 'mixed', 'synthesis'),
    q('Hva viser død ved om skogen?', 'At nedbrytning og habitatdannelse er aktive prosesser', ['At skogen alltid er dårlig vedlikeholdt', 'At ingen arter kan leve der'], 'Gammel skog inneholder flere livsfaser.', 'valley', 'synthesis'),
    q('Hva viser kjempebjørnekjeks om bynatur?', 'Grønt kan kreve artskunnskap, avstand og faglig forvaltning', ['Alt grønt er trygt å berøre', 'Fremmede arter er alltid ufarlige'], 'Naturkvalitet og sikkerhet må vurderes konkret.', 'plant', 'synthesis', 2),
    q('Hva bør en god observasjon ende med?', 'Etterprøvbar beskrivelse og tydelig usikkerhet', ['Sikker påstand uten funn', 'Innsamling av prøver'], 'Presisjon og skånsomhet går foran raske konklusjoner.', 'mixed', 'synthesis'),
    q('Hvorfor er 2011 viktig?', 'Turveien gjennom den trange dalen åpnet', ['Kværnerfossene ble ført i rør', 'Kjempebjørnekjeks kom til Norge'], 'Året knytter tilgjengelighet til dagens opplevelse av ravinen.', 'path', 'synthesis')
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
    hold_back: ['ingen udokumenterte artsfunn', 'ingen ferdsel i skrent eller elvekant', 'ingen flytting av død ved', 'ingen kontakt med kjempebjørnekjeks']
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
        core_concepts: ['arter', 'habitat', 'ravine', 'vassdrag', 'skogstruktur', 'forvaltning']
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
if (!routeRow) throw new Error('Mangler Svartdalen i rutemanifestet');
routeRow.sha256 = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, placePath))).digest('hex');
writeJson(routeManifestPath, routeManifest);

const placesIndex = readJson('data/places/places_index.json');
const globalRow = placesIndex.find(x => x.id === placeId);
if (!globalRow) throw new Error('Mangler Svartdalen i global plassindeks');
globalRow.desc = place.desc;
writeJson('data/places/places_index.json', placesIndex);

const report = `# Svartdalen – natur-rundinger batch 1\n\n## Omfang\n\n- Fyller alle ni natur-rundinger for \`${placeId}\`.\n- Bevarer ID, koordinat, radius, kategori, routeId og koordinatstatus.\n- Oppgraderer eksisterende fortelling og quiz til full v2-modell med 6 × 7 spørsmål.\n\n## Aktiv artsunion\n\n- Flora: Kjempebjørnekjeks (\`${giantHogweed.id}\`, ${giantHogweed.latin})\n- Fauna: ingen aktive koblinger\n- Totalt: 1 art\n- Regel: Alle aktive koblinger fra fem naturkart. Kartkobling er ikke garanti for feltfunn.\n\n## Stedlig retning\n\nSvartdalen behandles som ravinedal med Alna i stryk og fall, gammel løvskog, død ved, lys- og fuktgradient, historisk vannkraft og Alnastiens gangbaner. Dokumenterte treslag brukes som habitatkontekst, ikke som aktive artskort.\n\n## Kontroll\n\nMaterialiseringen skal bestå målrettet test, eksisterende Alna-/Oslo-naturtester, \`scripts/check-places.sh\`, indeks- og manifestsynk samt \`git diff --check\`.\n`;
fs.mkdirSync(path.dirname(path.join(root, reportPath)), { recursive: true });
fs.writeFileSync(path.join(root, reportPath), report);

const test = `const assert = require('assert');\nconst crypto = require('crypto');\nconst fs = require('fs');\nconst path = require('path');\nconst repo = path.resolve(__dirname, '..');\nconst readJson = p => JSON.parse(fs.readFileSync(path.join(repo, p), 'utf8'));\nconst expectedRounds = ['tasks','nature','badges','training','civication','brands','før_nå','fortellinger','leksikon'];\nconst runtime = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');\nconst profileMatch = runtime.match(/natur:\\s*\\[([^\\]]+)\\]/);\nassert(profileMatch, 'runtime mangler naturprofil');\nassert.deepStrictEqual(JSON.parse(\`[\${profileMatch[1]}]\`), expectedRounds);\nconst placePath='${placePath}', quizPath='${quizPath}', storyPath='${storyPath}', articlePath='${articlePath}';\nconst place=readJson(placePath), quiz=readJson(quizPath), story=readJson(storyPath)[0], article=readJson(articlePath);\nconst index=readJson('data/places/natur/oslo/places_oslo_natur_alnaelva_rute_index.json').find(x=>x.id===place.id);\nconst routeManifest=readJson('${routeManifestPath}');\nconst manifestRow=routeManifest.places.find(x=>x.id===place.id);\nconst quizManifest=readJson('data/quiz/manifest.json');\nconst storyManifest=readJson('data/stories/stories_manifest.json');\nconst leksikonManifest=readJson('data/leksikon/manifest.json');\nconst validBadges=new Set(readJson('data/badges/natur.json').sub);\nassert.strictEqual(place.id,'${placeId}');\nassert.strictEqual(place.name,'Svartdalen');\nassert.strictEqual(place.category,'natur');\nassert.deepStrictEqual([place.lat,place.lon,place.r,place.year??null],[59.90417,10.79289,170,null]);\nassert.strictEqual(place.routeId,'alnaelva_grontdrag');\nassert.strictEqual(place.coordStatus,'verified');\nassert.strictEqual(place.coordType,'route_point');\nassert.strictEqual(place.coordPrecisionM,80);\nassert(index&&manifestRow);\nassert.deepStrictEqual([index.lat,index.lon,index.r,index.year??null],[place.lat,place.lon,place.r,place.year??null]);\nconst hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,placePath))).digest('hex');\nassert.strictEqual(manifestRow.sha256,hash);\nfor(const key of ['rounds','rundinger','routes','works','people','play_profile','flora','fauna']) assert(!Object.prototype.hasOwnProperty.call(place,key),\`forbudt felt \${key}\`);\nconst roundContent={tasks:place.tasks_profile,nature:place.nature_profile,badges:place.underbadge_ids,training:place.training_profile,civication:place.civication_store,brands:place.brands,før_nå:place.for_na,fortellinger:[story],leksikon:[article]};\nassert.deepStrictEqual(Object.keys(roundContent),expectedRounds);\nfor(const [id,value] of Object.entries(roundContent)){const filled=Array.isArray(value)?value.length>0:Boolean(value&&typeof value==='object');assert(filled,\`mangler \${id}\`);}\nassert(place.externalLinks.length>=8&&place.externalLinks.every(x=>x.type==='repository'||/^https:\\/\\//.test(x.url)));\nassert(place.underbadge_ids.length>=30&&place.underbadge_ids.every(x=>validBadges.has(x)));\nassert.strictEqual(place.tasks_profile.tasks.length,4);\nassert.strictEqual(place.training_profile.exercises.length,3);\nassert(/ikke.*klatre|ikke.*vad|ikke.*flytt/i.test(place.training_profile.safety));\nassert(/ikke.*berør|hudskader/i.test(place.training_profile.safety));\nassert(place.civication_store.length===4&&place.civication_store.every(x=>x.physicalObject&&x.placeSpecific));\nassert(place.brands.length>=10);\nassert(place.for_na.look_for.length>=8);\nassert(place.nature_profile.summary.length>=3000);\nassert.deepStrictEqual(place.nature_profile.nearby_place_ids,['alna_bryn','kvaernerbyen_alna','alna_utlop_bjorvika']);\nassert(place.nature_profile.documented_habitat_context.tree_groups.length===7);\nconst mapFiles=${JSON.stringify(mapFiles)}; const merged={flora:[],fauna:[]};\nfor(const file of mapFiles){const raw=readJson(file);const entry=(raw.places||raw).${placeId};if(!entry)continue;merged.flora.push(...(entry.flora||[]));merged.fauna.push(...(entry.fauna||[]));}\nmerged.flora=[...new Set(merged.flora)].sort();merged.fauna=[...new Set(merged.fauna)].sort();\nassert.deepStrictEqual(merged.flora,['emne_flora_kjempebjornkjeks']);assert.deepStrictEqual(merged.fauna,[]);\nconst inventory=place.nature_profile.species_inventory;assert.strictEqual(inventory.total_species,1);assert.deepStrictEqual(inventory.flora.map(x=>x.id),['emne_flora_kjempebjornkjeks']);assert.deepStrictEqual(inventory.fauna,[]);\nassert.strictEqual(quiz.sets.length,6);assert(quiz.sets.every((s,i)=>s.order===i+1&&s.questions.length===7));\nassert(quiz.sets.flatMap(s=>s.questions).every(q=>q.categoryId==='natur'&&q.placeId===place.id&&Array.isArray(q.source)&&q.source.length&&q.claim_basis==='documented'&&q.options[q.answerIndex]===q.answer&&q.related_emners.includes('em_natur_arter_habitat_mangfold')));\nassert.deepStrictEqual(quizManifest.sets.filter(x=>x.targetId===place.id),[{targetId:place.id,file:quizPath}]);\nassert(story&&story.place_id===place.id&&story.sources.length>=8);assert(storyManifest.files.some(x=>x.path===storyPath&&x.entity_id===place.id&&x.category==='natur'));\nassert(article&&article.place_id===place.id&&article.version===2&&article.title===place.name);assert(article.sources.length>=8&&article.facts.length>=15&&article.chronology.length>=9);assert(leksikonManifest.files.includes(articlePath));\nconst all=JSON.stringify({place,quiz,story,article});\nfor(const token of ['Svartdalen','ravinedal','stryk og fall','gammel løvskog','død ved','Kværnerfossene','1948','Alnastien','2011','kjempebjørnekjeks','Heracleum mantegazzianum','svært høy','hudskader']) assert(all.toLowerCase().includes(token.toLowerCase()),\`mangler \${token}\`);\nassert(/ikke en garanti|ikke.*garanti/i.test(all));assert(/ikke.*berør|hold avstand/i.test(all));\nconsole.log('Svartdalen nature rounds batch 1 OK');\n`;
fs.mkdirSync(path.dirname(path.join(root, testPath)), { recursive: true });
fs.writeFileSync(path.join(root, testPath), test);

run(process.execPath, [testPath]);
run(process.execPath, ['tests/oslo-nature-rounds-batch5-alna.test.js']);
run(process.execPath, ['tests/oslo-nature-rounds-batch4.test.js']);
run('bash', ['scripts/check-places.sh']);
run('git', ['diff', '--check']);
console.log('Svartdalen materialized and validated');
