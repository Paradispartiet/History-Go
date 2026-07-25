import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const branch = 'agent/oslo-coordinate-historie-v5-5-miljo-curation';
const domainId = 'his_miljo_klima_landskap';
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const conceptPath = path.join(historyDir, 'concepts_historie_canonical_v5_5.json');
const theoryPath = path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json');
const emnePath = path.join(historyDir, 'emner_historie_canonical_v4_5.json');
const readinessPath = path.join(reportDir, 'historie-v5-5-readiness.json');
const commandLogPath = path.join(reportDir, 'miljo-klima-landskap-curation-command.log');
const validationPath = path.join(reportDir, 'miljo-klima-landskap-curation-validation.txt');
const resultPath = path.join(reportDir, 'miljo-klima-landskap-curation-result.json');
const A = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values.filter(Boolean))];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(commandLogPath, 'Historie V5.5 – Miljø-, klima- og landskapshistorie\n');
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, env: process.env });
  const block = `\n$ ${command} ${args.join(' ')}\n${result.stdout || ''}${result.stderr || ''}`;
  fs.appendFileSync(commandLogPath, block);
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
  return result.stdout || '';
}

const curation = {
  con_his_antropocen: {
    label: 'antropocen', type: 'periodization_concept', group: 'time',
    definition: 'Et omstridt geologisk og historisk periodiseringsbegrep for en epoke der menneskelig aktivitet virker som en planetær kraft, med ujevnt fordelt ansvar, påvirkning og sårbarhet.'
  },
  con_his_dyr: {
    label: 'dyr', type: 'more_than_human_concept', group: 'nature',
    definition: 'Ikke-menneskelige arter undersøkt som arbeidskraft, mat, eiendom, symboler, sykdomsbærere, økologiske aktører og deltakere i historiske menneske–natur-relasjoner.'
  },
  con_his_endring: {
    label: 'miljøendring', type: 'process_concept', group: 'time',
    definition: 'Dokumentert omforming av økosystemer, landskap eller miljøforhold gjennom samvirke mellom naturlige prosesser, teknologi, institusjoner og menneskelig praksis.'
  },
  con_his_energi: {
    label: 'energi', type: 'material_system_concept', group: 'energy',
    definition: 'Fysiske energikilder og omformingsformer som ved, vannkraft, kull, olje og elektrisitet, analysert gjennom arbeid, teknologi, infrastruktur og forbruk.'
  },
  con_his_energiregime: {
    label: 'energiregime', type: 'material_system_concept', group: 'energy',
    definition: 'En historisk konfigurasjon av energikilder, teknologi, infrastruktur, arbeid, eierskap, institusjoner og hverdagspraksis som gjør energibruk mulig.'
  },
  con_his_energiregimer: {
    label: 'energiomstilling', type: 'process_concept', group: 'energy',
    definition: 'En langvarig og ujevnt fordelt overgang mellom energiregimer der nye kilder og infrastrukturer bygges ut samtidig som eldre systemer ofte fortsetter.'
  },
  con_his_forurensning: {
    label: 'forurensning', type: 'environmental_process_concept', group: 'pollution',
    definition: 'Tilførsel eller opphopning av stoffer, avfall, støy eller stråling som endrer miljøforhold og skaper historisk bestemte skade-, helse- og fordelingskonflikter.'
  },
  con_his_framtidsansvar: {
    label: 'framtidsansvar', type: 'normative_historical_concept', group: 'justice',
    definition: 'Forestillinger og institusjonelle forpliktelser om at samtidige beslutninger må vurderes etter deres langsiktige konsekvenser for framtidige mennesker, arter og økosystemer.'
  },
  con_his_helse: {
    label: 'helse', type: 'social_environmental_concept', group: 'urban',
    definition: 'Historisk fordelte kroppslige og sosiale livsvilkår påvirket av bolig, arbeid, ernæring, smitte, forurensning, infrastruktur og tilgang til natur.'
  },
  con_his_klima: {
    label: 'klima', type: 'environmental_system_concept', group: 'climate',
    definition: 'Langsiktige mønstre i temperatur, nedbør, vind og andre atmosfæriske forhold som virker sammen med samfunnets sårbarhet, teknologi og institusjoner.'
  },
  con_his_klimavariasjon: {
    label: 'klimavariasjon', type: 'environmental_process_concept', group: 'climate',
    definition: 'Endringer og svingninger i klimatiske forhold over tid, rekonstruert gjennom målinger, naturarkiver og historiske kilder med synlig usikkerhet.'
  },
  con_his_landskap: {
    label: 'landskap', type: 'spatial_environmental_concept', group: 'landscape',
    definition: 'Et materielt og kulturelt formet område der geologi, vegetasjon, dyr, arbeid, eiendom, infrastruktur og fortolkning har avsatt historiske lag.'
  },
  con_his_langsom: {
    label: 'tidsforsinket miljøskade', type: 'environmental_process_concept', group: 'justice',
    definition: 'Miljøskade som bygges opp gradvis eller blir synlig lenge etter utslipp, inngrep eller eksponering, slik at årsak, ansvar og berørte grupper blir vanskelige å avgrense.'
  },
  con_his_menneske: {
    label: 'menneskelig påvirkning', type: 'agency_concept', group: 'nature',
    definition: 'Historiske endringer i miljø og økosystemer som følger av bosetting, produksjon, forbruk, politikk, teknologi og andre organiserte menneskelige handlinger.'
  },
  con_his_miljobevegelse: {
    label: 'miljøbevegelse', type: 'collective_action_concept', group: 'governance',
    definition: 'Kollektiv organisering som mobiliserer kunnskap, protest, rettslige virkemidler og politiske krav for vern, helse, ressurskontroll eller miljørettferdighet.'
  },
  con_his_miljohistorie: {
    label: 'miljøhistorie', type: 'historiographical_concept', group: 'nature',
    definition: 'Et historiefaglig felt som undersøker gjensidige forbindelser mellom samfunn, arter, klima, landskap, teknologi og naturressurser over tid.'
  },
  con_his_miljorettferdighet: {
    label: 'miljørettferdighet', type: 'justice_concept', group: 'justice',
    definition: 'Analyse av hvordan miljøgoder, skader, beslutningsmakt og anerkjennelse fordeles mellom grupper, steder og generasjoner.'
  },
  con_his_miljoulikhet: {
    label: 'miljøulikhet', type: 'distribution_concept', group: 'justice',
    definition: 'Systematiske forskjeller i eksponering for miljøskade, tilgang til naturgoder og kapasitet til å påvirke eller håndtere miljøendringer.'
  },
  con_his_natur: {
    label: 'natur', type: 'historical_category', group: 'nature',
    definition: 'En historisk og kulturelt skiftende kategori for ikke-menneskelige omgivelser og prosesser, aldri et helt stabilt motstykke til samfunn eller kultur.'
  },
  con_his_natur_relasjoner: {
    label: 'menneske–natur-relasjoner', type: 'relational_concept', group: 'nature',
    definition: 'Gjensidige historiske forbindelser mellom mennesker, andre arter, økosystemer og materialer gjennom arbeid, omsorg, konflikt, kunnskap og avhengighet.'
  },
  con_his_naturforvaltning: {
    label: 'naturforvaltning', type: 'governance_concept', group: 'governance',
    definition: 'Institusjoner, kunnskapsformer, regler og praksiser som klassifiserer, fordeler, regulerer og overvåker arter, områder og naturressurser.'
  },
  con_his_naturressurser: {
    label: 'naturressurser', type: 'material_system_concept', group: 'resource',
    definition: 'Deler av naturen som historiske aktører klassifiserer som nyttige eller verdifulle og gjør tilgjengelige gjennom kunnskap, eierskap, arbeid og teknologi.'
  },
  con_his_ressursbruk: {
    label: 'ressursbruk', type: 'material_practice_concept', group: 'resource',
    definition: 'Uttak, bearbeiding, fordeling, forbruk og avhending av naturressurser, analysert sammen med rettigheter, arbeid, teknologi og miljøkonsekvenser.'
  },
  con_his_skog: {
    label: 'skog', type: 'landscape_resource_concept', group: 'resource',
    definition: 'Et økologisk og forvaltet landskap formet av hogst, beite, vern, eiendom, artsendring, energi- og materialbehov.'
  },
  con_his_urban: {
    label: 'urbanisering', type: 'spatial_process_concept', group: 'urban',
    definition: 'Konsentrasjon av befolkning, bygging og infrastrukturer som omformer areal, vannløp, energibruk, avfall, helse og forholdet mellom by og omland.'
  },
  con_his_urban_natur: {
    label: 'urban natur', type: 'spatial_environmental_concept', group: 'urban',
    definition: 'Arter, vann, jord, grøntområder og økologiske prosesser i byen, formet av planlegging, vedlikehold, forurensning, bruk og sosial ulikhet.'
  },
  con_his_vann: {
    label: 'vann', type: 'environmental_system_concept', group: 'resource',
    definition: 'Hydrologiske kretsløp og vannforekomster analysert sammen med forsyning, energi, transport, avløp, eierskap, flom og forurensning.'
  },
  con_his_vern: {
    label: 'vern', type: 'governance_concept', group: 'governance',
    definition: 'Juridiske, administrative og sosiale praksiser som begrenser inngrep for å beskytte arter, landskap, økosystemer eller kultur- og naturverdier.'
  },
  con_his_vold: {
    label: 'langsom vold', type: 'justice_concept', group: 'justice',
    definition: 'Skade som utvikler seg gradvis, spres over store områder eller rammer etter lang tid, og derfor ofte mangler et tydelig øyeblikk, synlig gjerningsperson eller samlet offentlighet.'
  }
};

const groupRelations = {
  time: { broader: ['prosess'], related: ['miljøendring', 'klimavariasjon', 'antropocen'], distinguish: ['hendelse'] },
  climate: { broader: ['miljøhistorie'], related: ['klima', 'klimavariasjon', 'landskap'], distinguish: ['miljøendring'] },
  landscape: { broader: ['miljøhistorie'], related: ['landskap', 'natur', 'ressursbruk'], distinguish: ['naturressurser'] },
  nature: { broader: ['miljøhistorie'], related: ['natur', 'dyr', 'menneske–natur-relasjoner'], distinguish: ['naturressurser'] },
  energy: { broader: ['energiregime'], related: ['energi', 'energiomstilling', 'ressursbruk'], distinguish: ['naturressurser'] },
  resource: { broader: ['naturressurser'], related: ['ressursbruk', 'naturforvaltning', 'landskap'], distinguish: ['vern'] },
  pollution: { broader: ['miljøendring'], related: ['forurensning', 'helse', 'miljøulikhet'], distinguish: ['klimavariasjon'] },
  justice: { broader: ['miljørettferdighet'], related: ['miljøulikhet', 'framtidsansvar', 'langsom vold'], distinguish: ['naturforvaltning'] },
  governance: { broader: ['naturforvaltning'], related: ['miljøbevegelse', 'vern', 'framtidsansvar'], distinguish: ['miljørettferdighet'] },
  urban: { broader: ['landskap'], related: ['urban natur', 'urbanisering', 'forurensning'], distinguish: ['natur'] }
};
const narrowerByLabel = {
  miljøhistorie: ['klima', 'landskap', 'menneske–natur-relasjoner', 'energiregime', 'miljørettferdighet'],
  natur: ['dyr', 'skog', 'vann', 'urban natur'],
  naturressurser: ['skog', 'vann', 'energi'],
  energiregime: ['energiomstilling', 'energi'],
  miljørettferdighet: ['miljøulikhet', 'langsom vold', 'framtidsansvar'],
  miljøendring: ['klimavariasjon', 'forurensning', 'tidsforsinket miljøskade'],
  naturforvaltning: ['vern', 'miljøbevegelse']
};
const misuseByGroup = {
  time: (label) => `Å bruke «${label}» som et naturlig og entydig tidsskille uten å dokumentere startpunkt, romlig skala og konkurrerende periodiseringer.`,
  climate: (label) => `Å forklare historiske utfall direkte med «${label}» uten å analysere sårbarhet, institusjoner, teknologi og aktørenes handlingsvalg.`,
  landscape: (label) => `Å lese «${label}» som urørt bakgrunn uten å undersøke arbeid, eiendom, infrastruktur, økologi og historiske lag.`,
  nature: (label) => `Å behandle «${label}» som en tidløs og passiv kategori uten å undersøke historisk definisjon, gjensidighet og ikke-menneskelig påvirkning.`,
  energy: (label) => `Å redusere «${label}» til én energikilde uten å analysere teknologi, infrastruktur, arbeid, eierskap og overlappende systemer.`,
  resource: (label) => `Å omtale «${label}» som gitt av naturen uten å vise hvordan verdi, tilgang, rettigheter og bruk ble historisk produsert.`,
  pollution: (label) => `Å bruke «${label}» som en stabil og likt fordelt størrelse uten å kontrollere målemetode, terskler, eksponering og berørte grupper.`,
  justice: (label) => `Å bruke «${label}» som en moralsk etikett uten å dokumentere fordeling, beslutningsprosess, anerkjennelse og årsakskjede.`,
  governance: (label) => `Å likestille formelle vedtak om «${label}» med faktisk gjennomføring uten å undersøke konflikter, kapasitet og lokal praksis.`,
  urban: (label) => `Å generalisere fra «${label}» for hele byen uten å analysere nabolag, infrastruktur, sosial fordeling og historisk arealbruk.`
};

const concepts = readJson(conceptPath);
const conceptById = new Map(concepts.map((item) => [item.concept_id, item]));
if (Object.keys(curation).length !== 29) throw new Error(`Expected 29 curated concepts, got ${Object.keys(curation).length}`);
for (const [conceptId, spec] of Object.entries(curation)) {
  const concept = conceptById.get(conceptId);
  if (!concept) throw new Error(`Missing concept ${conceptId}`);
  concept.label = spec.label;
  concept.definition = spec.definition;
  concept.concept_type = spec.type;
  concept.historical_scope = 'cross_period_context_dependent';
  concept.common_misuse = [misuseByGroup[spec.group](spec.label)];
  concept.status = 'canonical_v5_5';
}
const idByLabel = new Map(concepts.map((item) => [item.label, item.concept_id]));
function idsFor(labels, selfId) {
  return unique(labels.map((label) => {
    const id = idByLabel.get(label);
    if (!id) throw new Error(`Unknown relation label ${label}`);
    return id;
  })).filter((id) => id !== selfId);
}
for (const [conceptId, spec] of Object.entries(curation)) {
  const concept = conceptById.get(conceptId);
  const relations = groupRelations[spec.group];
  concept.broader_concepts = idsFor(relations.broader, conceptId);
  concept.narrower_concepts = idsFor(narrowerByLabel[spec.label] || [], conceptId);
  concept.related_concepts = idsFor(relations.related, conceptId);
  concept.distinguish_from = idsFor(relations.distinguish, conceptId);
}
writeJson(conceptPath, concepts);

const theoryCuration = {
  theory_his_miljo_klima_antropocen_langsom_vold_og_miljorettferdighet: {
    type: 'theory_framework',
    definition: 'Et rammeverk som knytter planetær miljøendring til ujevnt historisk ansvar, tidsforsinket skade og forskjeller i hvem som får miljøgoder, bærer kostnader og blir politisk hørt.',
    limitations: [
      'Antropocenets startpunkt og analytiske skala er omstridt, og et globalt epokebegrep kan skjule forskjeller mellom regioner, klasser, stater og næringer.',
      'Rammeverket kan ikke tilskrive ansvar for et lokalt utfall uten en dokumentert kjede mellom beslutninger, utslipp eller inngrep og den observerte skaden.'
    ]
  },
  theory_his_miljo_klima_dyr_og_menneske_natur_relasjoner: {
    type: 'theory_framework',
    definition: 'Et rammeverk for å undersøke hvordan mennesker, dyr og økosystemer gjensidig former arbeid, mat, sykdom, mobilitet, omsorg, konflikt og landskap over tid.',
    limitations: [
      'Dyrs handlekraft må rekonstrueres indirekte gjennom menneskeskapte kilder og materielle spor og kan ikke uten videre likestilles med menneskelig intensjon.',
      'Menneske–natur-relasjoner varierer mellom arter, steder og praksiser; én relasjon kan ikke representere et helt samfunn eller en periode.'
    ]
  },
  theory_his_miljo_klima_energi_og_energiregimer: {
    type: 'middle_range_model',
    definition: 'En modell som forklarer historisk energibruk gjennom koblingen mellom energikilder, omformingsteknologi, infrastrukturer, arbeid, eierskap, statlig regulering og hverdagslig forbruk.',
    limitations: [
      'Energiomstillinger er vanligvis overlappende og geografisk ujevne; innføring av en ny kilde betyr ikke at det eldre regimet forsvinner.',
      'Energikilden alene forklarer ikke sosial eller økonomisk endring uten analyse av institusjoner, priser, teknologi, arbeid og politiske valg.'
    ]
  },
  theory_his_miljo_klima_forurensning_og_urban_miljohistorie: {
    type: 'middle_range_model',
    definition: 'En modell for å følge hvordan produksjon, transport, bolig, avfall og infrastruktur skaper forurensning, helsevirkninger, regulering og konflikt i byen og dens omland.',
    limitations: [
      'Historiske målinger, terskelverdier og diagnoser er skiftende og kan ikke sammenlignes direkte uten metode- og enhetskontroll.',
      'Gjennomsnitt for en by kan skjule store forskjeller i eksponering mellom nabolag, yrker, inntektsgrupper og livsfaser.'
    ]
  },
  theory_his_miljo_klima_klima_og_historisk_endring: {
    type: 'middle_range_model',
    definition: 'En modell som kobler klimavariasjon til avlinger, sykdom, bosetting, transport og konflikt gjennom historisk bestemte sårbarheter, institusjoner, kunnskap og tilpasningsmuligheter.',
    limitations: [
      'Klimavariasjon må ikke brukes deterministisk; like klimatiske belastninger kan gi ulike utfall avhengig av samfunnets ressurser, politikk og organisering.',
      'Klimaproxyer og skriftlige observasjoner har tidslig og romlig usikkerhet som må synliggjøres før de kobles til konkrete hendelser.'
    ]
  },
  theory_his_miljo_klima_landskap_som_historisk_prosess: {
    type: 'middle_range_model',
    definition: 'En modell som leser landskap som et lagdelt resultat av økologiske prosesser, arbeid, eiendom, teknologi, infrastruktur, regulering og skiftende forestillinger om natur.',
    limitations: [
      'Dagens landskap er et palimpsest av tap, ombruk og nyere inngrep og kan ikke behandles som et direkte bilde av én historisk periode.',
      'Fysisk landskapsendring dokumenterer ikke alene sosial mening, eierskap eller konflikt; den må kobles til kilder om aktører og institusjoner.'
    ]
  },
  theory_his_miljo_klima_miljorettferdighet_langsom_vold_og_framtidsansvar: {
    type: 'theory_framework',
    definition: 'Et rammeverk for å analysere hvordan miljøskade og miljøgoder fordeles, hvem som deltar i beslutninger, hvilke grupper som anerkjennes og hvordan kostnader skyves framover i tid.',
    limitations: [
      'Miljørettferdighet er et analytisk og normativt rammeverk og dokumenterer ikke alene hvilke kategorier historiske aktører selv brukte.',
      'Påstander om ansvar krever en konkret årsaks- og beslutningskjede; langsiktige konsekvenser kan ikke fordeles ut fra moralsk vurdering alene.'
    ]
  },
  theory_his_miljo_klima_naturforvaltning_og_miljobevegelse: {
    type: 'historiographical_tradition',
    definition: 'En historiografisk tradisjon som undersøker hvordan ekspertise, lovverk, forvaltningsorganer, lokale brukere og miljøbevegelser konkurrerer om å definere naturverdier, risiko og legitim ressursbruk.',
    limitations: [
      'Formelle verne- og forvaltningsvedtak sier ikke alene hvordan regler ble håndhevet, forhandlet eller omgått lokalt.',
      'Miljøbevegelser er ikke enhetlige aktører; mål, kunnskapsgrunnlag og forholdet til lokale brukere kan være motstridende.'
    ]
  },
  theory_his_miljo_klima_skog_vann_og_naturressurser: {
    type: 'middle_range_model',
    definition: 'En modell for å analysere hvordan skog, vann og andre naturressurser blir gjort økonomisk og politisk tilgjengelige gjennom eiendomsrett, teknologi, arbeid, infrastruktur og forvaltning.',
    limitations: [
      'Hva som regnes som en ressurs er historisk skiftende og avhenger av teknologi, kunnskap, marked og rettigheter.',
      'Administrative og økonomiske kilder overrepresenterer ofte produksjon og eierskap og underrepresenterer økologiske tap og uformell bruk.'
    ]
  },
  theory_his_miljo_klima_urban_natur_helse_og_miljoulikhet: {
    type: 'middle_range_model',
    definition: 'En modell som kobler grøntområder, vann, sanitærforhold, bolig, trafikk og forurensning til historiske forskjeller i helse, livskvalitet og politisk innflytelse i byen.',
    limitations: [
      'Sammenfall mellom miljøforhold og helse dokumenterer ikke automatisk årsak; bolig, arbeid, inntekt og tilgang til behandling må kontrolleres.',
      'Urban natur gir ikke like fordeler til alle når tilgang, vedlikehold, trygghet og fortrengning er sosialt og geografisk ulikt fordelt.'
    ]
  }
};
const theories = readJson(theoryPath);
const theoryById = new Map(theories.map((item) => [item.theory_id, item]));
for (const [theoryId, spec] of Object.entries(theoryCuration)) {
  const theory = theoryById.get(theoryId);
  if (!theory) throw new Error(`Missing theory ${theoryId}`);
  theory.object_type = spec.type;
  theory.definition = spec.definition;
  theory.limitations = spec.limitations;
  theory.evidence_ready = false;
  theory.status = 'canonical_v5_5';
}
writeJson(theoryPath, theories);

const emneConcepts = {
  em_his_miljo_klima_antropocen_langsom_vold_og_miljorettferdighet: {
    core: ['antropocen', 'langsom vold', 'miljørettferdighet', 'tidsforsinket miljøskade', 'framtidsansvar', 'miljøulikhet', 'forurensning', 'klima'],
    sub: ['energiregime', 'ressursbruk', 'urban natur', 'miljøbevegelse', 'naturforvaltning', 'helse', 'prosess', 'landskap']
  },
  em_his_miljo_klima_dyr_og_menneske_natur_relasjoner: {
    core: ['dyr', 'menneske–natur-relasjoner', 'menneskelig påvirkning', 'natur', 'landskap', 'ressursbruk', 'naturforvaltning', 'vern'],
    sub: ['urban natur', 'miljøhistorie', 'energiregime', 'klimavariasjon', 'skog', 'vann', 'miljøbevegelse', 'antropocen']
  },
  em_his_miljo_klima_energi_og_energiregimer: {
    core: ['energi', 'energiregime', 'energiomstilling', 'ressursbruk', 'forurensning', 'klima', 'landskap', 'miljøendring'],
    sub: ['naturressurser', 'skog', 'vann', 'urbanisering', 'urban natur', 'miljøbevegelse', 'miljørettferdighet', 'prosess']
  },
  em_his_miljo_klima_forurensning_og_urban_miljohistorie: {
    core: ['forurensning', 'urbanisering', 'urban natur', 'helse', 'miljøulikhet', 'miljørettferdighet', 'miljøhistorie', 'naturforvaltning'],
    sub: ['energiregime', 'ressursbruk', 'vern', 'miljøbevegelse', 'klima', 'landskap', 'dyr', 'antropocen']
  },
  em_his_miljo_klima_klima_og_historisk_endring: {
    core: ['klima', 'klimavariasjon', 'miljøendring', 'landskap', 'ressursbruk', 'energiregime', 'forurensning', 'menneskelig påvirkning'],
    sub: ['antropocen', 'miljøhistorie', 'skog', 'vann', 'urban natur', 'naturressurser', 'framtidsansvar', 'prosess']
  },
  em_his_miljo_klima_landskap_som_historisk_prosess: {
    core: ['landskap', 'prosess', 'miljøendring', 'ressursbruk', 'naturressurser', 'energiregime', 'skog', 'vann'],
    sub: ['urban natur', 'menneske–natur-relasjoner', 'dyr', 'naturforvaltning', 'vern', 'forurensning', 'klimavariasjon', 'miljøhistorie']
  },
  em_his_miljo_klima_miljorettferdighet_langsom_vold_og_framtidsansvar: {
    core: ['miljørettferdighet', 'langsom vold', 'tidsforsinket miljøskade', 'framtidsansvar', 'miljøulikhet', 'helse', 'forurensning', 'antropocen'],
    sub: ['klima', 'energiomstilling', 'ressursbruk', 'urban natur', 'miljøbevegelse', 'naturforvaltning', 'landskap', 'menneskelig påvirkning']
  },
  em_his_miljo_klima_naturforvaltning_og_miljobevegelse: {
    core: ['naturforvaltning', 'miljøbevegelse', 'vern', 'naturressurser', 'dyr', 'landskap', 'miljørettferdighet', 'framtidsansvar'],
    sub: ['ressursbruk', 'skog', 'vann', 'urban natur', 'forurensning', 'antropocen', 'menneske–natur-relasjoner', 'miljøhistorie']
  },
  em_his_miljo_klima_skog_vann_og_naturressurser: {
    core: ['skog', 'vann', 'naturressurser', 'ressursbruk', 'landskap', 'energiregime', 'naturforvaltning', 'vern'],
    sub: ['dyr', 'klimavariasjon', 'forurensning', 'miljøbevegelse', 'menneskelig påvirkning', 'miljøhistorie', 'prosess', 'framtidsansvar']
  },
  em_his_miljo_klima_urban_natur_helse_og_miljoulikhet: {
    core: ['urban natur', 'urbanisering', 'helse', 'miljøulikhet', 'miljørettferdighet', 'forurensning', 'naturforvaltning', 'klima'],
    sub: ['landskap', 'energiregime', 'ressursbruk', 'miljøbevegelse', 'dyr', 'vern', 'antropocen', 'framtidsansvar']
  }
};
const emners = readJson(emnePath);
const emneById = new Map(emners.map((item) => [item.emne_id, item]));
for (const [emneId, model] of Object.entries(emneConcepts)) {
  const emne = emneById.get(emneId);
  if (!emne) throw new Error(`Missing emne ${emneId}`);
  for (const label of [...model.core, ...model.sub]) if (!idByLabel.has(label)) throw new Error(`${emneId} uses unknown concept ${label}`);
  emne.core_concepts = model.core;
  emne.key_concepts = model.core.slice(0, 8);
  emne.sub_concepts = model.sub;
  emne.keywords = unique([...model.core, ...model.sub]);
}
writeJson(emnePath, emners);
const invalidLabels = ['endring', 'energiregimer', 'langsom', 'menneske', 'natur-relasjoner', 'urban', 'vold'];
for (const emneId of Object.keys(emneConcepts)) {
  const emne = emneById.get(emneId);
  const used = [...A(emne.core_concepts), ...A(emne.sub_concepts), ...A(emne.key_concepts), ...A(emne.keywords)];
  const remaining = invalidLabels.filter((label) => used.includes(label));
  if (remaining.length) throw new Error(`${emneId} retains invalid labels: ${remaining.join(', ')}`);
}

const domainValidator = path.join(root, 'tools/validate-historie-miljo-klima-landskap.mjs');
if (!fs.existsSync(domainValidator)) throw new Error('Missing domain validator tools/validate-historie-miljo-klima-landskap.mjs');
run(process.execPath, [domainValidator]);
run(process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
let readiness = readJson(readinessPath);
let domainReadiness = A(readiness.domains).find((item) => item.domain_id === domainId);
if (!domainReadiness?.freeze_ready || domainReadiness.issue_counts?.emner || domainReadiness.issue_counts?.concepts || domainReadiness.issue_counts?.theories) {
  throw new Error(`Domain did not become freeze-ready: ${JSON.stringify(domainReadiness)}`);
}
const contextDir = path.join(root, 'data/quiz/production_context/historie');
if (fs.existsSync(contextDir)) {
  for (const file of fs.readdirSync(contextDir).filter((name) => name.endsWith('.json')).sort()) {
    const targetId = path.basename(file, '.json');
    run(process.execPath, ['scripts/build-quiz-production-context.mjs', '--category', 'historie', '--target', targetId, '--output', path.join('data/quiz/production_context/historie', file)]);
  }
}
run('npm', ['run', 'audit:quiz-production-context']);
run('npm', ['run', 'audit:quiz-theory-binding']);
run('npm', ['run', 'test:quiz-production']);
run('npm', ['run', 'knowledge:canonical:write']);
run('npm', ['run', 'knowledge:canonical:check']);
run('npm', ['run', 'knowledge:legacy:check']);
run(process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
run('git', ['diff', '--check']);
readiness = readJson(readinessPath);
domainReadiness = A(readiness.domains).find((item) => item.domain_id === domainId);
if (!domainReadiness?.freeze_ready) throw new Error('Domain lost freeze-ready status after generated artifacts');
const result = {
  version: 'historie-v5.5-miljo-klima-landskap-curation-1',
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  status: 'CURATED_FREEZE_READY',
  concepts_curated: Object.keys(curation).length,
  theories_curated: Object.keys(theoryCuration).length,
  emner_corrected: Object.keys(emneConcepts).length,
  domain_readiness: domainReadiness,
  global_quality_issue_totals: readiness.quality_issue_totals,
  global_v6_allowed: readiness.v6_allowed
};
writeJson(resultPath, result);
const validation = [
  'Historie V5.5 – Miljø-, klima- og landskapshistorie',
  'Status: CURATED_FREEZE_READY',
  `Begreper kuratert: ${result.concepts_curated}`,
  `Teoriobjekter kuratert: ${result.theories_curated}`,
  `Emner korrigert: ${result.emner_corrected}`,
  `Domene freeze_ready: ${domainReadiness.freeze_ready}`,
  `Domene kvalitetsfeil: emner=${domainReadiness.issue_counts.emner}, begreper=${domainReadiness.issue_counts.concepts}, teorier=${domainReadiness.issue_counts.theories}`,
  `Global V6 tillatt: ${readiness.v6_allowed}`
].join('\n') + '\n';
fs.writeFileSync(validationPath, validation);
fs.appendFileSync(commandLogPath, `\n${validation}`);
for (const temporary of [path.join(reportDir, 'miljo-klima-landskap-curation-labels.txt'), path.join(reportDir, 'miljo-klima-landskap-curation-audit.txt')]) fs.rmSync(temporary, { force: true });
fs.rmSync('scripts/coordinate-branch-job.mjs', { force: true });
const runnerReportDir = process.env.RUNNER_REPORT_DIR;
if (runnerReportDir) {
  const excludePath = path.join('.git', 'info', 'exclude');
  fs.mkdirSync(path.dirname(excludePath), { recursive: true });
  const rule = `/${runnerReportDir.replaceAll('\\', '/')}/`;
  const existing = fs.existsSync(excludePath) ? fs.readFileSync(excludePath, 'utf8') : '';
  if (!existing.split(/\r?\n/).includes(rule)) fs.appendFileSync(excludePath, `${existing.endsWith('\n') || !existing ? '' : '\n'}${rule}\n`);
}
run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['add', '-A']);
run('git', ['commit', '-m', 'Curate environment climate and landscape domain']);
run('git', ['push', 'origin', `HEAD:${branch}`]);
console.log(validation);
