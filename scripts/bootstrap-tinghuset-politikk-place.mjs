import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TODAY = '2026-07-31';
const TARGET = 'tinghuset';
const CATEGORY = 'politikk';

const paths = {
  place: 'data/places/politikk/oslo/places_politikk/tinghuset.json',
  stories: 'data/stories/stories_tinghuset.json',
  manifest: 'data/fag/fag_manifest.json',
  politicsSuperset: 'data/fag/politikk/supersetQUIZMAL_politikk.json',
  bySuperset: 'data/fag/by/supersetQUIZMAL_by.json',
  pensum: 'data/fag/politikk/politikkpensum_canonical_v4_5.json',
  emner: 'data/fag/politikk/emner_politikk_canonical_v4_5.json',
  fagkart: 'data/fag/politikk/fagkart_politikk_canonical_v4_5.json',
  mappings: 'data/fag/politikk/emnemapping_politikk_canonical_v4_5.json',
  methods: 'data/fag/politikk/methods_politikk_canonical_v4_5.json',
  brief: 'data/quiz/production_briefs/politikk/tinghuset.json',
  quiz: 'data/quiz/politikk/tinghuset_sets.json',
  context: 'data/quiz/production_context/politikk/tinghuset.json',
  report: 'reports/place-production/tinghuset-politikk-v1.md'
};

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
}
function writeJson(rel, value) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`);
}
function writeText(rel, value) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, value.endsWith('\n') ? value : `${value}\n`);
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function allStrings(node, out = []) {
  if (typeof node === 'string') out.push(node);
  else if (Array.isArray(node)) node.forEach((v) => allStrings(v, out));
  else if (node && typeof node === 'object') Object.values(node).forEach((v) => allStrings(v, out));
  return out;
}
function collectObjects(node, out = []) {
  if (Array.isArray(node)) node.forEach((v) => collectObjects(v, out));
  else if (node && typeof node === 'object') {
    out.push(node);
    Object.values(node).forEach((v) => collectObjects(v, out));
  }
  return out;
}
function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}
function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

const targetEmner = [
  'em_pol_domstoler_rettspraksis',
  'em_pol_rettsstat_rettssikkerhet',
  'em_pol_likeverd_rettssikkerhet',
  'em_pol_maktbegrensning'
];

const sources = {
  domstol_praktisk: {
    title: 'Oslo tingrett: Praktisk informasjon om Oslo tinghus',
    url: 'https://www.domstol.no/no/domstoler/tingrett/oslo-tingrett/om-oslo-tingrett/praktisk-informasjon-om-oslo-tinghus/',
    source_type: 'official_institution',
    publisher: 'Norges domstoler / Oslo tingrett',
    review_status: 'reviewed',
    review_note: 'Brukt for sikkerhetskontroll, rundt 60 rettssaler, ferdigstillelse i 1994, hovedinngang og arkitektur.'
  },
  grunnloven_95_98: {
    title: 'Grunnloven kapittel E §§ 94–98',
    url: 'https://lovdata.no/nav/lov/1814-05-17/kapE',
    source_type: 'official_law',
    publisher: 'Lovdata',
    review_status: 'reviewed',
    review_note: 'Brukt for uavhengig og upartisk domstol, rettferdig/offentlig rettergang innen rimelig tid, uskyldspresumsjon og likhet for loven.'
  },
  domstolloven_124: {
    title: 'Domstolloven § 124 – offentlighet i rettsmøter',
    url: 'https://lovdata.no/dokument/NL/lov/1915-08-13-5',
    source_type: 'official_law',
    publisher: 'Lovdata',
    review_status: 'reviewed',
    review_note: 'Brukt for hovedregelen om offentlige rettsmøter og rettens adgang til lovbestemte begrensninger.'
  },
  oslo_security_2025: {
    title: 'Oslo tingretts årsmelding 2025: Sikkerhet',
    url: 'https://www.domstol.no/no/domstoler/tingrett/oslo-tingrett/publikasjoner2/arsmelding-2025/fokusomrader/sikkerhet/',
    source_type: 'official_annual_report',
    publisher: 'Oslo tingrett',
    review_status: 'reviewed',
    review_note: 'Brukt for kontrollerte personer, røntgengjennomlyste kolli, beslag og saker med særskilte sikkerhetstiltak i 2025.'
  },
  oslo_enedommer_2025: {
    title: 'Oslo tingretts årsmelding 2025: Enedommersaker',
    url: 'https://www.domstol.no/no/domstoler/tingrett/oslo-tingrett/publikasjoner2/arsmelding-2025/enedommersaker/enedommersaker/',
    source_type: 'official_annual_report',
    publisher: 'Oslo tingrett',
    review_status: 'reviewed',
    review_note: 'Brukt for sakstyper, 13 742 innkomne enedommersaker og gjennomsnittlig behandlingstid på sju dager i 2025.'
  },
  oslo_forord_2025: {
    title: 'Oslo tingretts årsmelding 2025: Forord',
    url: 'https://www.domstol.no/no/domstoler/tingrett/oslo-tingrett/publikasjoner2/arsmelding-2025/forord/',
    source_type: 'official_annual_report',
    publisher: 'Oslo tingrett',
    review_status: 'reviewed',
    review_note: 'Brukt for kapasitetsutfordringer og at Stortingets 90-dagersmål for meddomsrettssaker ikke ble oppfylt i 2025.'
  },
  oslo_active_case_2025: {
    title: 'Oslo tingretts årsmelding 2025: Aktiv saksstyring',
    url: 'https://www.domstol.no/no/domstoler/tingrett/oslo-tingrett/publikasjoner2/arsmelding-2025/fokusomrader/aktiv-saksstyring/',
    source_type: 'official_project_documentation',
    publisher: 'Oslo tingrett',
    review_status: 'reviewed',
    review_note: 'Brukt for prøveprosjektet fra mars 2025, dets mål og planlagt midtveisevaluering høsten 2026; ikke brukt som dokumentasjon på oppnådd effekt.'
  }
};

const claimDefinitions = [
  ['fact', 'opening', 'Oslo tinghus har hovedinngang mot C. J. Hambros plass.', ['domstol_praktisk'], 'em_pol_domstoler_rettspraksis'],
  ['fact', 'opening', 'Oslo tinghus ble ferdigstilt i 1994.', ['domstol_praktisk'], 'em_pol_domstoler_rettspraksis'],
  ['fact', 'opening', 'Oslo tinghus har rundt 60 rettssaler i ulike størrelser.', ['domstol_praktisk'], 'em_pol_domstoler_rettspraksis'],
  ['fact', 'opening', 'Alle besøkende må gjennom sikkerhetskontroll, og bagasje blir skannet.', ['domstol_praktisk'], 'em_pol_domstoler_rettspraksis'],
  ['fact', 'opening', 'Lex Portalis ved hovedinngangen viser speilvendte tekster fra sentrale norske lover.', ['domstol_praktisk'], 'em_pol_rettsstat_rettssikkerhet'],
  ['fact', 'opening', 'Enedommersaker avgjøres av én fagdommer uten meddommere.', ['oslo_enedommer_2025'], 'em_pol_domstoler_rettspraksis'],
  ['fact', 'opening', 'Enedommersaker kan blant annet gjelde ransaking, fengsling, besøksforbud og førerkortbeslag.', ['oslo_enedommer_2025'], 'em_pol_domstoler_rettspraksis'],
  ['fact', 'bridge', 'Grunnloven § 95 gir rett til avgjørelse av en uavhengig og upartisk domstol innen rimelig tid.', ['grunnloven_95_98'], 'em_pol_rettsstat_rettssikkerhet'],
  ['fact', 'bridge', 'Grunnloven § 95 sier at rettergangen skal være rettferdig og offentlig.', ['grunnloven_95_98'], 'em_pol_rettsstat_rettssikkerhet'],
  ['context', 'bridge', 'Et rettsmøte kan lukkes når privatliv eller tungtveiende allmenne interesser gjør det nødvendig.', ['grunnloven_95_98', 'domstolloven_124'], 'em_pol_rettsstat_rettssikkerhet'],
  ['fact', 'bridge', 'Grunnloven § 96 sier at ingen kan straffes uten etter dom.', ['grunnloven_95_98'], 'em_pol_maktbegrensning'],
  ['fact', 'bridge', 'En siktet skal anses uskyldig inntil skyld er bevist etter loven.', ['grunnloven_95_98'], 'em_pol_likeverd_rettssikkerhet'],
  ['fact', 'bridge', 'Domstolloven § 124 har offentlige rettsmøter som hovedregel.', ['domstolloven_124'], 'em_pol_rettsstat_rettssikkerhet'],
  ['fact', 'bridge', 'I 2025 ble 137 953 personer kontrollert i metalldetektoren ved Oslo tinghus.', ['oslo_security_2025'], 'em_pol_domstoler_rettspraksis'],
  ['context', 'final', 'Offentlig rettergang betyr ikke ubegrenset adgang til alle rom, dokumenter og opplysninger.', ['domstol_praktisk', 'grunnloven_95_98', 'domstolloven_124'], 'em_pol_rettsstat_rettssikkerhet'],
  ['context', 'final', 'En formell rett til behandling innen rimelig tid er ikke det samme som at alle sakstyper faktisk når tidsmålene.', ['grunnloven_95_98', 'oslo_forord_2025'], 'em_pol_rettsstat_rettssikkerhet'],
  ['context', 'final', 'Saksmengde og behandlingstid beskriver gjennomføring, men beviser ikke alene at alle avgjørelser er materielt riktige eller rettferdige.', ['oslo_enedommer_2025', 'grunnloven_95_98'], 'em_pol_likeverd_rettssikkerhet'],
  ['concept_theory', 'final', 'Domstolenes uavhengighet innebærer vern mot usaklig påvirkning, ikke fravær av lovregler, prosesskrav eller begrunnelse.', ['grunnloven_95_98', 'domstolloven_124'], 'em_pol_maktbegrensning'],
  ['concept_theory', 'final', 'Et prøveprosjekt med uttalte mål er dokumentasjon på tiltak og gjennomføring, men ikke på oppnådd effekt før evaluering.', ['oslo_active_case_2025'], 'em_pol_domstoler_rettspraksis'],
  ['concept_theory', 'final', 'En enedommers avgjørelse om et etterforskingsskritt er rettslig kontroll av et inngrep, ikke en domfellelse for straffesaken.', ['oslo_enedommer_2025', 'grunnloven_95_98'], 'em_pol_maktbegrensning'],
  ['concept_theory', 'final', 'En full politisk evidenskjede må skille rettsregel, institusjonell kompetanse, ressurser, faktisk gjennomføring og dokumentert utfall.', ['grunnloven_95_98', 'oslo_security_2025', 'oslo_forord_2025'], 'em_pol_rettsstat_rettssikkerhet']
];

const questions = [
  ['fact', 'Hvor vender hovedinngangen til Oslo tinghus?', ['Mot C. J. Hambros plass', 'Mot Slottsplassen', 'Mot Youngstorget'], 0, 'Hovedinngangen vender mot C. J. Hambros plass.'],
  ['fact', 'Når ble Oslo tinghus ferdigstilt?', ['1978', '1994', '2012'], 1, 'Bygningen ble ferdigstilt i 1994.'],
  ['fact', 'Omtrent hvor mange rettssaler har Oslo tinghus?', ['Rundt 12', 'Rundt 30', 'Rundt 60'], 2, 'Oslo tinghus har rundt 60 rettssaler i ulike størrelser.'],
  ['fact', 'Hva må alle besøkende gjøre før de går inn?', ['Levere skriftlig søknad', 'Gå gjennom sikkerhetskontroll', 'Bestille advokat'], 1, 'Alle besøkende må gjennom sikkerhetskontrollen, og bagasje blir skannet.'],
  ['fact', 'Hva er Lex Portalis ved hovedinngangen?', ['Et kunstverk med lovtekster', 'En egen straffedomstol', 'Et elektronisk saksregister'], 0, 'Lex Portalis er et kunstverk med speilvendte tekster fra sentrale norske lover.'],
  ['fact', 'Hvem avgjør en enedommersak?', ['Én fagdommer', 'En jury på tolv personer', 'Politimesteren'], 0, 'Enedommersaker avgjøres av én fagdommer uten meddommere.'],
  ['fact', 'Hvilket spørsmål kan behandles som en enedommersak?', ['Ransaking', 'Grunnlovsendring', 'Kommunebudsjett'], 0, 'Ransaking er ett av etterforskingsskrittene som kan behandles i enedommersaker.'],
  ['fact', 'Hva krever Grunnloven § 95 av domstolen?', ['At den er uavhengig og upartisk', 'At den følger regjeringens instrukser', 'At alle saker avgjøres samme dag'], 0, 'Grunnloven krever en uavhengig og upartisk domstol.'],
  ['fact', 'Hvordan skal rettergangen være etter Grunnloven § 95?', ['Hemmelig og administrativ', 'Rettferdig og offentlig', 'Bare skriftlig'], 1, 'Grunnloven sier at rettergangen skal være rettferdig og offentlig.'],
  ['context', 'Når kan et rettsmøte likevel lukkes?', ['Når privatliv eller tungtveiende allmenne interesser gjør det nødvendig', 'Når bygningen er full', 'Når en part ikke liker presseomtale'], 0, 'Offentlighet kan begrenses på lovlig grunnlag når blant annet privatliv eller tungtveiende allmenne interesser krever det.'],
  ['fact', 'Hva sier Grunnloven § 96 om straff?', ['Ingen kan straffes uten etter dom', 'Politiet kan fastsette straff alene', 'Straff trenger ikke lovgrunnlag'], 0, 'Ingen kan straffes uten etter dom.'],
  ['fact', 'Hvordan skal en siktet behandles før skyld er bevist?', ['Som automatisk skyldig', 'Som uskyldig', 'Som vitne'], 1, 'Den siktede skal anses uskyldig inntil skyld er bevist etter loven.'],
  ['fact', 'Hva er hovedregelen i domstolloven § 124?', ['Rettsmøter er offentlige', 'Alle dokumenter er hemmelige', 'Bare advokater kan være til stede'], 0, 'Rettsmøtene er offentlige hvis ikke lovlige begrensninger gjelder.'],
  ['fact', 'Hvor mange personer gikk gjennom metalldetektoren ved Oslo tinghus i 2025?', ['13 742', '137 953', '298'], 1, 'Årsmeldingen oppgir 137 953 kontrollerte personer.'],
  ['context', 'Hva betyr offentlig rettergang i praksis?', ['At alle alltid får tilgang til alt', 'At offentlighet er hovedregel, men kan ha lovlige grenser', 'At sikkerhetskontroll er forbudt'], 1, 'Offentlighet er en hovedregel, men sikkerhet, personvern og lovbestemte hensyn kan begrense tilgang.'],
  ['context', 'Hva viser det at 90-dagersmålet ikke ble nådd for meddomsrettssaker i 2025?', ['At en formell tidsrett ikke automatisk sikrer at alle mål nås i praksis', 'At domstolene ikke lenger er uavhengige', 'At alle saker ble henlagt'], 0, 'Det viser forskjellen mellom rettslig norm og faktisk kapasitet/gjennomføring.'],
  ['context', 'Hva kan 13 742 enedommersaker og sju dagers gjennomsnitt fortelle?', ['Noe om saksmengde og behandling', 'At alle avgjørelser var riktige', 'At alle siktede var skyldige'], 0, 'Tallene beskriver gjennomføring, men avgjør ikke kvaliteten i hver sak.'],
  ['theory', 'Hva innebærer domstoluavhengighet best?', ['Vern mot usaklig påvirkning innenfor lov og prosess', 'At dommere står over loven', 'At avgjørelser aldri kan kritiseres'], 0, 'Uavhengighet skal beskytte avgjørelsen mot usaklig påvirkning, samtidig som domstolen følger lov og prosesskrav.'],
  ['theory', 'Hva kan vi konkludere når et prøveprosjekt starter med mål om lavere kostnader og høyere kvalitet?', ['At tiltaket er iverksatt, men effekten må evalueres', 'At målene allerede er bevist nådd', 'At alle sivile saker blir gratis'], 0, 'Tiltak og formål er dokumentert; oppnådd effekt krever senere evaluering.'],
  ['theory', 'Hva betyr det når én dommer godkjenner et etterforskingsskritt?', ['At inngrepet får rettslig kontroll', 'At den mistenkte er domfelt', 'At politiet har overtatt domstolen'], 0, 'Avgjørelsen gjelder inngrepet eller prosesspørsmålet, ikke endelig skyld.'],
  ['theory', 'Hvilken kjede er best for å undersøke rettsstaten ved Oslo tinghus?', ['Regel → kompetanse → ressurser → gjennomføring → dokumentert utfall', 'Byggehøyde → fasadefarge → turisttrafikk', 'Påstand → antakelse → konklusjon'], 0, 'Politikk-gaten krever at regel, myndighet, ressurser, gjennomføring og utfall holdes etterprøvbare og atskilte.']
];

const place = readJson(paths.place);
place.emne_ids = targetEmner;
place.desc = 'Oslo tinghus ved C. J. Hambros plass er hovedarena for Oslo tingrett og gjør domstolenes rolle i rettsstaten fysisk synlig. Her møtes offentlig rettergang, uavhengig dømmende myndighet, sikkerhetskontroll og stor saksproduksjon. Stedet skal brukes til å skille rettsregel fra faktisk gjennomføring og behandlingstall fra dokumentert rettferdig utfall.';
place.popupDesc = 'Oslo tinghus ligger ved C. J. Hambros plass 4 og ble ferdigstilt i 1994. Bygningen har rundt 60 rettssaler og er hovedarena for Oslo tingrett. Kartpunktet gjelder tinghuset som institusjonsbygg, ikke hele plassen eller andre juridiske institusjoner i sentrum.\n\nTingretten utøver dømmende myndighet i første instans. Den må skilles fra politiet, som etterforsker, og påtalemyndigheten, som fører straffesaker. Enedommersaker kan blant annet gjelde fengsling, ransaking, besøksforbud og andre inngrep som krever rettslig kontroll; en slik avgjørelse er ikke det samme som en domfellelse.\n\nGrunnloven krever en uavhengig og upartisk domstol, rettferdig og offentlig rettergang og avgjørelse innen rimelig tid. Domstolloven har offentlige rettsmøter som hovedregel. Samtidig kan privatliv, tungtveiende allmenne interesser og andre lovlige hensyn begrunne begrensninger. Offentlighet betyr derfor kontrollmulighet, ikke ubegrenset adgang til alle rom, dokumenter eller personopplysninger.\n\nAlle besøkende må gjennom sikkerhetskontroll. I 2025 registrerte tingretten 137 953 personer i metalldetektoren og sikkerhetstiltak i 298 saker. Tallene dokumenterer ressursbruk og faktisk gjennomføring, men de må ikke brukes som bevis på at hver sak ble rettferdig eller at sikkerhetstiltak alene skapte rettssikkerhet.\n\nÅrsmeldingen viser også forskjellen mellom rettighet, mål og resultat. Oslo tingrett mottok 13 742 enedommersaker i 2025, med en gjennomsnittlig behandlingstid på sju dager, mens Stortingets 90-dagersmål for meddomsrettssaker ikke ble nådd. Formelle tidskrav, institusjonell kapasitet og faktisk behandlingstid er tre forskjellige ledd.\n\nHistory Go bruker derfor tinghuset som en Politikk-pilot for en dokumentert kjede: rettsregel og kompetanse → dommere, ansatte, saler og sikkerhet → faktisk saksbehandling → målbare outputs og avgrensede utfall. Besøkende skal observere institusjonens organisering uten å fotografere personer, dokumenter eller sensitive situasjoner og uten å spekulere i skyld i aktuelle saker.';
place.quiz_profile = {
  ...place.quiz_profile,
  profile_id: 'narrow',
  required_topics: targetEmner,
  primary_angles: ['rettsstat', 'domstolskompetanse', 'offentlighet', 'maktbegrensning', 'regel_og_gjennomforing'],
  question_families: ['fact', 'context', 'concept_theory'],
  must_include: ['uavhengig domstol', 'offentlig rettergang', 'uskyldspresumsjon', 'regel og faktisk gjennomføring'],
  avoid_angles: ['skyldvurdering_i_aktuelle_saker', 'behandlingstall_som_kvalitetsbevis', 'sikkerhetskontroll_som_rettssikkerhet_alene'],
  notes: 'Narrow Politikk-pilot: 3 sett × 7. De første 14 spørsmålene er ordinære. Teoribinding åpnes først i sett 3.'
};
place.politikk_production = {
  status: 'complete',
  reviewed_at: TODAY,
  main_function: 'Domstolsbygg og førsteinstansarena for uavhengig dømmende myndighet, rettslig kontroll og offentlig rettergang.',
  evidence_chain: {
    institution_and_competence: 'Oslo tingrett; dømmende myndighet i første instans og rettslig kontroll i blant annet enedommersaker.',
    rules_and_procedures: ['Grunnloven §§ 95–98', 'domstolloven § 124'],
    resources_and_instruments: ['dommere og saksbehandlere', 'rundt 60 rettssaler', 'sikkerhetskontroll', 'aktiv saksstyring'],
    implementation: ['rettsmøter', 'enedommersaker', 'sikkerhetskontroll', 'prøveprosjekt for normert rettsmøtetid'],
    measured_outputs_and_outcomes: ['13 742 innkomne enedommersaker i 2025', 'sju dagers gjennomsnittlig behandlingstid for enedommersaker', '137 953 kontrollerte personer', '90-dagersmålet for meddomsrettssaker ikke nådd'],
    inference_limits: ['saksmengde er ikke rettferdighetsmål', 'regel er ikke automatisk etterlevelse', 'tiltak og formål er ikke dokumentert effekt', 'offentlighet er ikke ubegrenset tilgang']
  },
  source_ids: Object.keys(sources)
};
writeJson(paths.place, place);

const story = [{
  id: 'st_tinghuset_aapent_rettsrom_sikkerhetskontroll_2025',
  quality_profile: 'episode_v1',
  type: 'political',
  title: 'Et åpent rettsrom bak sikkerhetskontrollen',
  year: 2025,
  place_id: 'tinghuset',
  person_id: null,
  summary: 'Oslo tinghus skal gjøre domstolen synlig og etterprøvbar for offentligheten, men i 2025 passerte 137 953 mennesker metalldetektoren før de nådde rettssalene. Spennet mellom åpen rettergang og kontrollert adgang viser hvordan en rettighet blir organisert i praksis.',
  story: 'Oslo tinghus ble ferdigstilt i 1994 med rundt 60 rettssaler og en hovedinngang vendt mot C. J. Hambros plass. På innsiden møter publikum Lex Portalis, et monumentalt kunstverk med speilvendte lovtekster. Bygget uttrykker dermed en politisk idé: dømmende myndighet skal være mektig nok til å avgjøre konflikter, men samtidig bundet av lov og synlig for offentlig kontroll.\n\nÅpenheten begynner likevel ikke med fri ferdsel. Alle besøkende går gjennom sikkerhetskontroll, og bagasje skannes. I 2025 registrerte tingretten 137 953 personer i metalldetektoren, 213 359 røntgengjennomlyste kolli og særskilte sikkerhetstiltak i 298 saker. Kontrollene gjør adgangen regulert, men opphever ikke offentlighetsprinsippet.\n\nGrunnloven § 95 krever en rettferdig og offentlig rettergang ved en uavhengig og upartisk domstol, mens domstolloven § 124 har offentlige rettsmøter som hovedregel. Samtidig kan rettsmøter lukkes når lovlige hensyn som privatliv eller tungtveiende allmenne interesser krever det. Tinghuset viser derfor ikke en enkel motsetning mellom åpent og lukket. Det viser en institusjon som må begrunne hvor grensen går, sak for sak.\n\nTallene fra sikkerhetskontrollen kan dokumentere ressurser og faktisk gjennomføring. De kan ikke alene bevise at en rettssak var rettferdig, at alle fikk lik tilgang eller at hvert sikkerhetstiltak var nødvendig. Nettopp dette skillet gjør inngangspartiet til et Politikk-sted: rettsstat er ikke bare en lovtekst eller en bygning, men en kjede av regler, kompetanse, ressurser, praksis og kontrollerbare resultater.',
  episode: {
    actors: ['Oslo tingrett', 'besøkende, parter og presse', 'tinghusets sikkerhetsseksjon'],
    date: '2025-12-31',
    action: 'Oslo tingrett gjennomførte offentlig domstolsvirksomhet bak en sikkerhetskontroll som registrerte 137 953 personer og særskilte tiltak i 298 saker gjennom 2025.',
    consequence: 'Årsmeldingen gjorde det mulig å følge ett konkret ledd i rettsstatens gjennomføring, samtidig som lovkildene avgrenser hvilke slutninger som kan trekkes om offentlighet og rettferdighet.'
  },
  sources: [
    { title: sources.domstol_praktisk.title, url: sources.domstol_praktisk.url },
    { title: sources.oslo_security_2025.title, url: sources.oslo_security_2025.url },
    { title: sources.grunnloven_95_98.title, url: sources.grunnloven_95_98.url },
    { title: sources.domstolloven_124.title, url: sources.domstolloven_124.url }
  ],
  tags: ['politikk', 'rettsstat', 'offentlighet', 'sikkerhet', '2025'],
  related_people: ['cathrine_m_linstad'],
  related_places: [],
  score: { narrative: 4, historical: 4, source: 5, play_value: 4, originality: 4, total: 21 }
}];
writeJson(paths.stories, story);

const bySuperset = readJson(paths.bySuperset);
const politicsSuperset = readJson(paths.politicsSuperset);
for (const key of ['input_roles', 'adaptive_profiles', 'profile_selection', 'relative_progression', 'question_families', 'selection_rules', 'control_order']) {
  assert(bySuperset[key] !== undefined, `By-superset mangler ${key}`);
  politicsSuperset[key] = deepClone(bySuperset[key]);
}
politicsSuperset.governance = {
  ...(politicsSuperset.governance || {}),
  package_schema: bySuperset.governance?.package_schema || '../quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json',
  template_registry: bySuperset.governance?.template_registry || '../quiz/regler/QUIZ_TEMPLATE_REGISTRY.json',
  subject_manifest: '../fag_manifest.json',
  authority: 'category_content_and_orchestration'
};
politicsSuperset.normal_opening = {
  ...(politicsSuperset.normal_opening || {}),
  enabled: true,
  minimum_question_count: 14,
  theory_earliest_set: 3,
  hard_rule: 'De første 14 spørsmålene skal være ordinære, konkrete og kildebelagte. Synlig teori åpnes først i sett 3.'
};
writeJson(paths.politicsSuperset, politicsSuperset);

const emner = readJson(paths.emner);
const emneStrings = new Set(allStrings(emner));
for (const id of targetEmner) assert(emneStrings.has(id), `Ukjent Politikk-emne: ${id}`);

const methodsDoc = readJson(paths.methods);
const methodStrings = new Set(allStrings(methodsDoc));
const methodCandidates = [
  'met_pol_rettslig_analyse',
  'met_pol_institusjonsanalyse',
  'met_pol_rettighetsanalyse',
  'met_pol_maktbalanseanalyse',
  'met_pol_dokumentanalyse'
];
const methodIds = methodCandidates.filter((id) => methodStrings.has(id));
assert(methodIds.length >= 2, `Fant for få canonicale Politikk-metoder: ${methodIds.join(', ')}`);

const fagkart = readJson(paths.fagkart);
const fagkartObjects = collectObjects(fagkart);
const mappings = readJson(paths.mappings);
const hookMap = new Map();
for (const entry of mappings) {
  const emneId = entry.emne_id || entry.topic_id;
  if (!targetEmner.includes(emneId)) continue;
  const mapping = (entry.mappings || []).find((item) => typeof item.topic_hook === 'string');
  if (mapping) hookMap.set(emneId, mapping.topic_hook);
}
for (const emneId of targetEmner) {
  if (hookMap.has(emneId)) continue;
  const candidates = [];
  for (const obj of fagkartObjects) {
    const strings = allStrings(obj, []);
    if (!strings.includes(emneId)) continue;
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && /hook/i.test(key)) candidates.push(value);
      if (Array.isArray(value) && /hook/i.test(key)) candidates.push(...value.filter((v) => typeof v === 'string'));
    }
  }
  const valid = uniq(candidates).filter((id) => id !== emneId);
  if (valid.length) hookMap.set(emneId, valid[0]);
}
const rightDomain = fagkart.categories?.find((domain) => domain.id === 'rett_lov_rettssikkerhet');
const domainHookIds = (rightDomain?.topic_hooks || []).map((hook) => hook.id).filter(Boolean);
for (const emneId of targetEmner) {
  if (!hookMap.has(emneId) && domainHookIds.length) hookMap.set(emneId, domainHookIds[0]);
}
assert(targetEmner.every((id) => hookMap.has(id)), `Fant ikke hook for alle emner: ${targetEmner.filter((id) => !hookMap.has(id)).join(', ')}`);
const topicHookIds = uniq([...hookMap.values()]);

const pensum = readJson(paths.pensum);
const moduleIds = uniq((pensum.domains || [])
  .filter((domain) => targetEmner.some((emneId) => (domain.emne_ids || []).includes(emneId)))
  .map((domain) => domain.domain_id));
assert(moduleIds.length >= 1, 'Fant ingen pensummodul for rett/lov/rettssikkerhet');

const briefClaims = claimDefinitions.map(([family, phase, statement, sourceIds, emneId], index) => ({
  claim_id: `claim_tinghuset_quiz_${index + 1}`,
  order: index + 1,
  planned_phase: phase,
  family,
  statement,
  source_ids: sourceIds,
  source_origin: 'external',
  emne_id: emneId
}));

const brief = {
  schema_version: '1.0',
  status: 'reviewed',
  categoryId: CATEGORY,
  targetId: TARGET,
  reviewed_at: TODAY,
  review_note: 'Påstandene er kontrollert mot Lovdata og Oslo tingretts egne institusjons- og årsmeldingskilder. Regel, kapasitet, gjennomføring og utfall holdes eksplisitt atskilt.',
  scope: {
    place: 'Oslo tinghus',
    production_profile: 'narrow',
    set_count: 3,
    questions_per_set: 7,
    total_questions: 21,
    normal_opening_questions: 14
  },
  sources: Object.fromEntries(Object.entries(sources).map(([id, source]) => [id, {
    url: source.url,
    source_type: source.source_type,
    review_status: source.review_status,
    review_note: source.review_note
  }])),
  selected_curriculum: {
    module_ids: moduleIds,
    emne_ids: targetEmner,
    topic_hook_ids: topicHookIds,
    method_ids: methodIds,
    thinker_ids: [],
    works: []
  },
  claims: briefClaims
};
writeJson(paths.brief, brief);

const quizSources = Object.fromEntries(Object.entries(sources).map(([id, source]) => [id, source.url]));
const phases = ['opening', 'bridge', 'final'];
const setTitles = ['Bygget og domstolen', 'Rettighetene og offentligheten', 'Fra regel til praksis'];
const setXp = [50, 75, 100];
const quizSets = [];
for (let setIndex = 0; setIndex < 3; setIndex += 1) {
  const setQuestions = [];
  for (let localIndex = 0; localIndex < 7; localIndex += 1) {
    const index = setIndex * 7 + localIndex;
    const [rawType, prompt, options, answerIndex, knowledge] = questions[index];
    const claim = briefClaims[index];
    const questionType = rawType === 'theory' ? 'concept' : rawType;
    const question = {
      id: `tinghuset_quiz_${index + 1}`,
      quiz_id: `politikk_tinghuset_set_${setIndex + 1}_q${localIndex + 1}`,
      categoryId: CATEGORY,
      placeId: TARGET,
      targetId: TARGET,
      question_scope: 'place',
      question: prompt,
      options,
      answer: options[answerIndex],
      answerIndex,
      knowledge,
      difficulty: setIndex + 1,
      question_type: questionType,
      year: index === 1 ? 1994 : (index === 13 ? 2025 : null),
      emne_id: claim.emne_id,
      source: claim.source_ids,
      source_origin: 'external',
      claim_basis: claim.statement,
      guidance_basis: [paths.emner, paths.fagkart, paths.methods],
      claim_id: claim.claim_id
    };
    if (questionType === 'context') {
      question.core_concepts = ['rettsstat', 'offentlighet', 'gjennomføring'];
      question.concept_focus = ['regel og praksis'];
    }
    if (questionType === 'concept') {
      const emneId = claim.emne_id;
      const methodId = methodIds[(index - 17) % methodIds.length];
      const conceptSets = [
        ['domstoluavhengighet', 'maktbegrensning', 'rettslig ansvar'],
        ['implementering', 'evaluering', 'effekt'],
        ['rettslig kontroll', 'inngrep', 'domfellelse'],
        ['evidenskjede', 'kompetanse', 'gjennomføring', 'utfall']
      ];
      question.method_id = methodId;
      question.topic_hook_id = hookMap.get(emneId) || topicHookIds[0];
      question.core_concepts = conceptSets[index - 17];
      question.concept_focus = [conceptSets[index - 17][0]];
    }
    setQuestions.push(question);
  }
  quizSets.push({
    set_id: `politikk_tinghuset_set_${setIndex + 1}`,
    level: setIndex + 1,
    order: setIndex + 1,
    phase: phases[setIndex],
    xp: setXp[setIndex],
    title: setTitles[setIndex],
    questions: setQuestions
  });
}

const quiz = {
  targetId: TARGET,
  categoryId: CATEGORY,
  sources: quizSources,
  production_context: {},
  sets: quizSets
};
writeJson(paths.quiz, quiz);

const manifest = readJson(paths.manifest);
assert(manifest[CATEGORY], 'Fagmanifestet mangler politikk');
manifest[CATEGORY].quizPackageSchema = '../quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json';
manifest[CATEGORY].quizProduction = manifest[CATEGORY].quizProduction || { targets: {} };
manifest[CATEGORY].quizProduction.targets = manifest[CATEGORY].quizProduction.targets || {};
manifest[CATEGORY].quizProduction.targets[TARGET] = {
  sourceBrief: '../quiz/production_briefs/politikk/tinghuset.json',
  contextArtifact: '../quiz/production_context/politikk/tinghuset.json',
  quizFile: '../quiz/politikk/tinghuset_sets.json'
};
writeJson(paths.manifest, manifest);

const report = `# Oslo tinghus – Politikk-sted V1\n\n- Dato: ${TODAY}\n- Place ID: \`${TARGET}\`\n- Kategori: \`${CATEGORY}\`\n- Produksjonsprofil: \`narrow\` – 3 sett × 7 spørsmål\n- Normal åpning: 14 ordinære spørsmål før synlig teoribinding\n\n## Politikk-hovedfunksjon\n\nOslo tinghus er dokumentert som domstolsbygg og førsteinstansarena for uavhengig dømmende myndighet, rettslig kontroll og offentlig rettergang.\n\n## Canonicale emner\n\n${targetEmner.map((id) => `- \`${id}\``).join('\n')}\n\n## Evidenskjede\n\n| Ledd | Dokumentert innhold |\n| --- | --- |\n| Institusjon og kompetanse | Oslo tingrett; førsteinstans og rettslig kontroll i blant annet enedommersaker |\n| Regel og prosedyre | Grunnloven §§ 95–98 og domstolloven § 124 |\n| Ressurser og instrumenter | Dommere, ansatte, rundt 60 rettssaler, sikkerhetskontroll og aktiv saksstyring |\n| Faktisk gjennomføring | Rettssaker, enedommersaker, sikkerhetskontroll og prøveprosjekt fra mars 2025 |\n| Output og avgrenset utfall | 13 742 enedommersaker, sju dagers gjennomsnitt, 137 953 kontrollerte personer og dokumentert brudd på 90-dagersmålet for meddomsrettssaker |\n\n## Inferensgrenser\n\n- Saksmengde og behandlingstid er ikke bevis på materiell riktighet i hver avgjørelse.\n- Rett til behandling innen rimelig tid er ikke det samme som at alle mål nås i praksis.\n- Tiltak og uttalte formål er ikke dokumentert effekt før evaluering.\n- Offentlig rettergang er en hovedregel med lovlige grenser, ikke ubegrenset tilgang.\n- Enedommerkontroll av et inngrep er ikke domfellelse.\n\n## Innholdsflate\n\n- Place: oppdatert beskrivelse, popup, Politikk-gate og fagkoblinger\n- People: eksisterende canonical personkobling til Cathrine M. Linstad\n- Story: ny episode om offentlighet og sikkerhetskontroll\n- Quiz: 21 eksternt kildebelagte spørsmål\n- Objects/Brands: ingen konstruerte poster; appens dokumenterte fallback/N/A beholdes\n- Challenge: ivaretas gjennom quiz- og stedslæringsløpet\n\n## Kilder\n\n${Object.values(sources).map((source) => `- [${source.title}](${source.url})`).join('\n')}\n\n## Maskinell sluttgate\n\nKontekst-, quiz-, Knowledge-, place-, Story- og tverrfaglige validatorer kjøres i materialiseringsjobben og ordinær PR-CI.\n`;
writeText(paths.report, report);

console.log(JSON.stringify({
  target: TARGET,
  emne_ids: targetEmner,
  module_ids: moduleIds,
  topic_hook_ids: topicHookIds,
  method_ids: methodIds,
  questions: questions.length,
  sources: Object.keys(sources).length
}, null, 2));
