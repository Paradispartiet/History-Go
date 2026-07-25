import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const branch = 'agent/oslo-coordinate-historie-v5-5-kilder-curation';
const domainId = 'his_kilder_arkiv_spor';
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const conceptPath = path.join(historyDir, 'concepts_historie_canonical_v5_5.json');
const theoryPath = path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json');
const emnePath = path.join(historyDir, 'emner_historie_canonical_v4_5.json');
const readinessPath = path.join(reportDir, 'historie-v5-5-readiness.json');
const commandLogPath = path.join(reportDir, 'kilder-arkiv-spor-curation-command.log');
const validationPath = path.join(reportDir, 'kilder-arkiv-spor-curation-validation.txt');
const resultPath = path.join(reportDir, 'kilder-arkiv-spor-curation-result.json');
const A = (value) => Array.isArray(value) ? value : [];
const unique = (values) => [...new Set(values.filter(Boolean))];
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(commandLogPath, 'Historie V5.5 – Kilder, arkiv og spor\n');

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
    env: process.env
  });
  const block = `\n$ ${command} ${args.join(' ')}\n${result.stdout || ''}${result.stderr || ''}`;
  fs.appendFileSync(commandLogPath, block);
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
  return result.stdout || '';
}

const curation = {
  con_his_arkiv: {
    label: 'arkiv', type: 'archival_concept', group: 'archive',
    definition: 'En institusjonelt eller privat ordnet samling av dokumenter og data som er skapt eller mottatt gjennom virksomhet og bevart som belegg for handlinger, rettigheter og erfaringer.'
  },
  con_his_arkiver: {
    label: 'arkivbestand', type: 'archival_concept', group: 'archive',
    definition: 'Den avgrensede helheten av arkivmateriale etter én arkivskaper, med en bestemt proveniens, ordningshistorie, dekningsgrad og bevaringssituasjon.'
  },
  con_his_arkivorden: {
    label: 'arkivorden', type: 'archival_concept', group: 'archive',
    definition: 'Prinsippene og praksisene som organiserer arkivmateriale, muliggjør gjenfinning og samtidig former hvilke forbindelser og hierarkier forskeren kan se.'
  },
  con_his_arkivtaushet: {
    label: 'arkivtaushet', type: 'absence_concept', group: 'absence',
    definition: 'Et systematisk fravær eller en skjev synlighet i arkivet som kan oppstå ved manglende registrering, seleksjon, kassasjon, tap, sperring eller utilgjengelighet.'
  },
  con_his_autentisitet: {
    label: 'autentisitet', type: 'methodological_concept', group: 'document',
    definition: 'Graden av tillit til at et dokument eller objekt er det det utgir seg for å være, vurdert gjennom opphav, form, overlevering, integritet og eventuelle endringer.'
  },
  con_his_begrensning: {
    label: 'kildebegrensning', type: 'methodological_concept', group: 'method',
    definition: 'En spesifikk egenskap ved en kilde eller kildesamling som avgrenser hvilke påstander den kan støtte, for eksempel perspektiv, formål, dekning, lesbarhet eller bevaring.'
  },
  con_his_beretning: {
    label: 'beretning', type: 'source_use_concept', group: 'source',
    definition: 'En kilde brukt for det den forteller om hendelser, forhold eller erfaringer, der utsagnet vurderes i lys av produsentens situasjon, kunnskap, avhengighet og formål.'
  },
  con_his_blindsoner: {
    label: 'blindsoner', type: 'absence_concept', group: 'absence',
    definition: 'Aktører, erfaringer eller prosesser som blir vanskelige å undersøke fordi kildeproduksjon, arkivordning, tilgang eller forskningsspørsmål systematisk gjør dem lite synlige.'
  },
  con_his_bygninger: {
    label: 'bygningsspor', type: 'material_source_concept', group: 'material',
    definition: 'Fysiske deler, merker eller konstruksjoner i en bygning som dokumenterer tidligere faser, materialvalg, bruk, ombygging, skade eller reparasjon.'
  },
  con_his_bygningsrester: {
    label: 'bygningsrester', type: 'material_source_concept', group: 'material',
    definition: 'Bevarte fragmenter av en tidligere bygning eller konstruksjon som kan undersøkes for datering, materialbruk, funksjon, ødeleggelse og senere ombruk.'
  },
  con_his_claim_basis: {
    label: 'påstandsgrunnlag', type: 'evidentiary_concept', group: 'evidence',
    definition: 'Den konkrete kombinasjonen av kilder, observasjoner, metode og slutningsrekke som gjør en avgrenset historisk påstand synlig og etterprøvbar.'
  },
  con_his_digital_proveniens: {
    label: 'digital proveniens', type: 'documentary_concept', group: 'document',
    definition: 'Dokumentert opprinnelse, versjonshistorikk, teknisk behandling, migrering og forvaltningskjede for digitalt skapte eller digitaliserte kilder.'
  },
  con_his_dokumentasjon: {
    label: 'dokumentasjon', type: 'documentary_concept', group: 'document',
    definition: 'Materiale som er skapt eller bevart for å registrere, administrere, kommunisere eller bevise handlinger, forhold, rettigheter og beslutninger.'
  },
  con_his_dokumentasjonsformer: {
    label: 'dokumentasjonsformer', type: 'source_type_concept', group: 'document',
    definition: 'Ulike sjangre og medier som registrerer virksomhet, fra protokoller, brev og kart til fotografi, lydopptak, databaser og metadata.'
  },
  con_his_dokumentform: {
    label: 'dokumentform', type: 'documentary_concept', group: 'document',
    definition: 'Et dokuments strukturelle og sjangermessige kjennetegn, som formular, oppsett, segl, underskrift, materiale og administrativ funksjon.'
  },
  con_his_finnes: {
    label: 'kildebelegg', type: 'evidentiary_concept', group: 'evidence',
    definition: 'En identifiserbar opplysning, observasjon eller kildekombinasjon som direkte eller indirekte støtter en presist formulert historisk påstand.'
  },
  con_his_formal: {
    label: 'formål', type: 'source_context_concept', group: 'source',
    definition: 'Den tilsiktede funksjonen en kilde ble produsert for, som administrasjon, overtalelse, minne, rapportering, dokumentasjon eller kontroll.'
  },
  con_his_fortsatt: {
    label: 'brukskontinuitet', type: 'material_source_concept', group: 'material',
    definition: 'At et sted, objekt eller dokumentasjonsregime fortsetter å være i bruk gjennom historiske endringer, eventuelt med justert funksjon, brukergruppe eller mening.'
  },
  con_his_fravaer: {
    label: 'fravær', type: 'absence_concept', group: 'absence',
    definition: 'Manglende forekomst av forventet materiale eller informasjon, som først blir analytisk meningsfullt når forventningen, søkeomfanget og bevaringsforholdene er begrunnet.'
  },
  con_his_funksjoner: {
    label: 'historisk funksjon', type: 'material_source_concept', group: 'material',
    definition: 'Den dokumenterte rollen et sted, objekt, rom eller dokument hadde i en bestemt periode, virksomhet og sosial sammenheng.'
  },
  con_his_gjor: {
    label: 'registreringsvirkning', type: 'archival_concept', group: 'archive',
    definition: 'Måten en dokumentasjonspraksis skaper administrative kategorier, synlighet og handlemuligheter ved å registrere noe, standardisere det og utelate annet.'
  },
  con_his_gravminner: {
    label: 'gravminner', type: 'material_source_concept', group: 'material',
    definition: 'Fysiske markeringer knyttet til gravlegging som kan belyse ritual, identitet, sosial forskjell, materiale, landskapsbruk og senere minnepraksis.'
  },
  con_his_grunnsporsmal: {
    label: 'kildekritiske spørsmål', type: 'methodological_concept', group: 'method',
    definition: 'Systematiske spørsmål om opphav, tid, formål, avhengighet, representativitet, overlevering og bevaring som avgrenser en kildes utsagnskraft.'
  },
  con_his_historiefagets: {
    label: 'historisk dokumentasjon', type: 'methodological_concept', group: 'method',
    definition: 'Den samlede praksisen med å identifisere, bevare, ordne, kontrollere og tolke spor som kan brukes til å undersøke avgrensede spørsmål om fortiden.'
  },
  con_his_hvem: {
    label: 'kildeprodusent', type: 'source_context_concept', group: 'source',
    definition: 'Personen, gruppen, virksomheten eller institusjonen som skapte eller fikk skapt en kilde innenfor en bestemt arbeidsprosess og maktrelasjon.'
  },
  con_his_ikke: {
    label: 'negativ evidens', type: 'evidentiary_concept', group: 'absence',
    definition: 'En slutning fra at forventet materiale ikke forekommer, bare gyldig når sannsynlig kildeproduksjon, bevaring, tilgang og søkeomfang er dokumentert.'
  },
  con_his_kart: {
    label: 'kart', type: 'media_source_concept', group: 'media',
    definition: 'En selektiv og målrettet framstilling av romlige forhold som både dokumenterer og produserer kategorier, grenser, målestokk og perspektiver.'
  },
  con_his_kataloger: {
    label: 'kataloger', type: 'archival_concept', group: 'archive',
    definition: 'Gjenfinningsverktøy som beskriver og klassifiserer arkiv-, biblioteks- eller museumsmateriale, men som ikke er nøytrale speil av samlingen.'
  },
  con_his_kildekritikk: {
    label: 'kildekritikk', type: 'methodological_concept', group: 'method',
    definition: 'Metodisk vurdering av hvordan en kildes opphav, formål, situasjon, avhengighet, overlevering og representativitet påvirker hva den kan brukes til.'
  },
  con_his_kildene: {
    label: 'kildeutvalg', type: 'archival_process', group: 'selection',
    definition: 'Den delen av tilgjengelig eller bevart materiale som faktisk inngår i en undersøkelse, valgt gjennom eksplisitte eller implisitte kriterier.'
  },
  con_his_kildeobjekt: {
    label: 'kildeobjekt', type: 'source_concept', group: 'source',
    definition: 'Det konkrete dokumentet, bildet, gjenstanden, datasettet, lydopptaket eller materielle sporet som undersøkes som historisk kilde.'
  },
  con_his_kilder: {
    label: 'historisk kilde', type: 'source_concept', group: 'source',
    definition: 'Et bevart eller rekonstruert spor fra fortiden som brukes til å besvare et historisk spørsmål; kildeverdien oppstår i forholdet mellom objekt, spørsmål og metode.'
  },
  con_his_kontekst: {
    label: 'kontekst', type: 'contextual_concept', group: 'context',
    definition: 'De tidslige, romlige, institusjonelle og sosiale forholdene som gir en kilde mening og påvirker dens produksjon, innhold, bevaring og bruk.'
  },
  con_his_kontrollkilde: {
    label: 'kontrollkilde', type: 'evidentiary_concept', group: 'evidence',
    definition: 'En uavhengig eller metodisk forskjellig kilde som brukes til å prøve, nyansere eller motsi en opplysning, datering eller tolkning.'
  },
  con_his_korroborering: {
    label: 'korroborering', type: 'methodological_concept', group: 'method',
    definition: 'Sammenstilling av flere uavhengige eller komplementære kilder for å vurdere om en historisk påstand styrkes, nyanseres, avgrenses eller svekkes.'
  },
  con_his_levning: {
    label: 'levning', type: 'source_use_concept', group: 'source',
    definition: 'En kilde brukt som et spor etter virksomheten, situasjonen eller praksisen som produserte den, uavhengig av hva den uttrykkelig forteller.'
  },
  con_his_manglende: {
    label: 'kildehull', type: 'absence_concept', group: 'absence',
    definition: 'Et avgrenset område der forventet dokumentasjon mangler eller er utilgjengelig, med en identifiserbar årsak, dekningsgrense eller usikkerhet.'
  },
  con_his_materialer: {
    label: 'materialspor', type: 'material_source_concept', group: 'material',
    definition: 'Fysiske materialer og deres bearbeiding, slitasje, sammensetning eller plassering brukt som belegg for tidligere handlinger, bruksmåter og miljøer.'
  },
  con_his_materialitet: {
    label: 'materialitet', type: 'material_source_concept', group: 'material',
    definition: 'Kildens fysiske eller tekniske egenskaper og hvordan de påvirker produksjon, bruk, bevaring, tilgjengelighet og historisk fortolkning.'
  },
  con_his_monumenter: {
    label: 'monumenter', type: 'material_source_concept', group: 'material',
    definition: 'Bevisst oppførte eller omformede minneobjekter som kan undersøkes både som materielle spor og som uttrykk for senere historiebruk.'
  },
  con_his_muntlig_historie: {
    label: 'muntlig historie', type: 'media_source_concept', group: 'media',
    definition: 'Metode og kildetype basert på innsamlede muntlige fortellinger, der både erindret erfaring, senere meningsdannelse og intervjusituasjonen inngår i analysen.'
  },
  con_his_noen: {
    label: 'seleksjon', type: 'archival_process', group: 'selection',
    definition: 'Prosessen der materiale velges for registrering, innsamling, bevaring, kassasjon, tilgjengeliggjøring eller forskning etter bestemte kriterier.'
  },
  con_his_ombruk: {
    label: 'ombruk', type: 'material_source_concept', group: 'material',
    definition: 'Ny bruk av et eldre sted, objekt eller materiale som både kan bevare, dekke til og endre spor etter tidligere funksjoner.'
  },
  con_his_opphav: {
    label: 'opphav', type: 'source_context_concept', group: 'source',
    definition: 'Den dokumenterte eller sannsynlige tilknytningen mellom en kilde og dens produsent, tid, sted, virksomhet og første bruksområde.'
  },
  con_his_produksjonskontekst: {
    label: 'produksjonskontekst', type: 'source_context_concept', group: 'context',
    definition: 'Den konkrete situasjonen, arbeidsprosessen og institusjonen der en kilde ble skapt, inkludert regler, målgruppe, teknologi og tilgjengelige kategorier.'
  },
  con_his_proveniens: {
    label: 'proveniens', type: 'methodological_concept', group: 'document',
    definition: 'Kildens opprinnelse og sammenhengende forvaltnings- eller overleveringshistorie fra produksjon til nåværende plassering eller digitale versjon.'
  },
  con_his_registre: {
    label: 'registre', type: 'source_type_concept', group: 'archive',
    definition: 'Systematiske fortegnelser over personer, hendelser, eiendom, rettigheter eller transaksjoner, produsert etter bestemte administrative kategorier og rutiner.'
  },
  con_his_representativitet: {
    label: 'representativitet', type: 'methodological_concept', group: 'method',
    definition: 'I hvilken grad et kildeutvalg gir grunnlag for å si noe om en større gruppe, periode eller prosess enn de observerte og bevarte tilfellene.'
  },
  con_his_rester: {
    label: 'materielle rester', type: 'material_source_concept', group: 'material',
    definition: 'Fysiske fragmenter eller avleiringer som har overlevd en tidligere aktivitet, bygning eller livsform uten nødvendigvis å være bevisst bevart.'
  },
  con_his_ruiner: {
    label: 'ruiner', type: 'material_source_concept', group: 'material',
    definition: 'Delvis bevarte bygningsstrukturer der tap, forvitring, restaurering og senere bruk må skilles fra den opprinnelige konstruksjonen.'
  },
  con_his_samler: {
    label: 'innsamling', type: 'archival_process', group: 'selection',
    definition: 'Planlagt eller tilfeldig opptak av dokumenter, objekter og fortellinger i en samling, styrt av mandat, kriterier, ressurser og tilgang.'
  },
  con_his_serielle: {
    label: 'kvantifisering', type: 'methodological_concept', group: 'method',
    definition: 'Omforming av kildeopplysninger til tellbare kategorier for å analysere omfang, fordeling og endring, med eksplisitt kontroll av kategorienes historiske stabilitet.'
  },
  con_his_serielle_kilder: {
    label: 'serielle kilder', type: 'source_type_concept', group: 'media',
    definition: 'Gjentatte og sammenlignbare registreringer produsert over tid etter relativt stabile rutiner, som protokoller, lister, regnskaper eller folketellinger.'
  },
  con_his_skrift: {
    label: 'skrift', type: 'media_source_concept', group: 'media',
    definition: 'Grafiske tegn og konvensjoner som bærer språk i et bestemt materiale, skriftsystem og historisk skrivefellesskap.'
  },
  con_his_spor: {
    label: 'spor', type: 'evidentiary_concept', group: 'material',
    definition: 'Et bevart resultat av tidligere handlinger eller prosesser som får kildeverdi gjennom datering, kontekstualisering og et formulert historisk spørsmål.'
  },
  con_his_tapte: {
    label: 'kildetap', type: 'absence_concept', group: 'absence',
    definition: 'Dokumentasjon eller materiale som er kjent eller sannsynlig å ha eksistert, men som er forsvunnet gjennom kassasjon, ødeleggelse, forvitring eller teknisk svikt.'
  },
  con_his_taushet: {
    label: 'taushet', type: 'absence_concept', group: 'absence',
    definition: 'Det som ikke uttrykkes eller registreres i en kilde, selv om temaet, hendelsen eller aktøren kan være indirekte til stede.'
  },
  con_his_tidligere: {
    label: 'funksjonsskifte', type: 'material_source_concept', group: 'material',
    definition: 'Overgangen fra en tidligere dokumentert bruk til en ny funksjon, der både materielle kontinuiteter, avbrudd og omforming må undersøkes.'
  },
  con_his_tolkning: {
    label: 'tolkning', type: 'methodological_concept', group: 'method',
    definition: 'En begrunnet slutning som knytter kildeobservasjoner til et historisk spørsmål ved hjelp av metode, begreper, sammenligning og synlig usikkerhet.'
  },
  con_his_utelatt: {
    label: 'utelatelse', type: 'absence_concept', group: 'absence',
    definition: 'Fravær som følger av at en produsent, registreringspraksis, redaktør eller arkivordning bevisst eller rutinemessig ikke tok noe med.'
  },
  con_his_viktig: {
    label: 'bevaringsskjevhet', type: 'archival_process', group: 'selection',
    definition: 'Ulik sannsynlighet for at bestemte materialer, aktører, institusjoner og praksiser blir bevart og dermed synlige i ettertidens kilder.'
  },
  con_his_visuelle: {
    label: 'visuell representasjon', type: 'media_source_concept', group: 'media',
    definition: 'En produsert framstilling i bilde, fotografi, film, diagram eller kart som organiserer synlighet gjennom utsnitt, teknikk, iscenesettelse og konvensjon.'
  },
  con_his_vaere: {
    label: 'indirekte belegg', type: 'evidentiary_concept', group: 'evidence',
    definition: 'Opplysninger som ikke viser et forhold direkte, men som gjennom mønster, kontekst, fravær eller sammenligning støtter en begrenset historisk slutning.'
  },
  con_his_odelagt: {
    label: 'dokumenttap', type: 'absence_concept', group: 'absence',
    definition: 'Tap av dokumenter gjennom brann, kassasjon, sensur, krig, teknisk foreldelse eller annen ødeleggelse, med følger for hva som kan undersøkes.'
  }
};

const groupRelations = {
  archive: { broader: ['dokumentasjon'], related: ['proveniens', 'seleksjon', 'arkivorden'], distinguish: ['historisk kilde'] },
  absence: { broader: ['fravær'], related: ['arkivtaushet', 'kildehull', 'bevaringsskjevhet'], distinguish: ['negativ evidens'] },
  material: { broader: ['spor'], related: ['materialitet', 'stedlig spor', 'historisk funksjon'], distinguish: ['beretning'] },
  document: { broader: ['dokumentasjon'], related: ['dokumentform', 'proveniens', 'autentisitet'], distinguish: ['beretning'] },
  evidence: { broader: ['kildegrunnlag'], related: ['kildekritikk', 'kontrollkilde', 'korroborering'], distinguish: ['tolkning'] },
  source: { broader: ['historisk kilde'], related: ['produksjonskontekst', 'opphav', 'formål'], distinguish: ['tolkning'] },
  selection: { broader: ['arkiv'], related: ['seleksjon', 'bevaringsskjevhet', 'kildeutvalg'], distinguish: ['representativitet'] },
  method: { broader: ['kildekritikk'], related: ['kildegrunnlag', 'usikkerhet', 'korroborering'], distinguish: ['historisk kilde'] },
  media: { broader: ['historisk kilde'], related: ['produksjonskontekst', 'materialitet', 'kildekritikk'], distinguish: ['tolkning'] },
  context: { broader: ['produksjonskontekst'], related: ['opphav', 'formål', 'kildeprodusent'], distinguish: ['ettertid'] }
};

const narrowerByLabel = {
  arkiv: ['arkivbestand', 'arkivorden', 'arkivtaushet', 'kataloger', 'registre'],
  dokumentasjon: ['dokumentasjonsformer', 'dokumentform', 'registre', 'historisk dokumentasjon'],
  'historisk kilde': ['kildeobjekt', 'levning', 'beretning', 'serielle kilder', 'muntlig historie', 'visuell representasjon', 'kart', 'skrift'],
  spor: ['stedlig spor', 'materialspor', 'bygningsspor', 'bygningsrester', 'ruiner', 'gravminner'],
  fravær: ['arkivtaushet', 'kildehull', 'kildetap', 'utelatelse', 'dokumenttap'],
  kildekritikk: ['proveniens', 'autentisitet', 'representativitet', 'korroborering', 'kontrollkilde'],
  seleksjon: ['innsamling', 'kildeutvalg', 'bevaringsskjevhet'],
  materialitet: ['materialspor', 'bygningsspor', 'gravminner', 'materielle rester']
};

const misuseByGroup = {
  archive: (label) => `Å behandle «${label}» som en nøytral og fullstendig avspeiling av fortiden uten å undersøke proveniens, seleksjon og ordningshistorie.`,
  absence: (label) => `Å tolke «${label}» som bevis for at noe ikke hendte uten å dokumentere forventet kildeproduksjon, bevaring, tilgang og søkeomfang.`,
  material: (label) => `Å slutte fra «${label}» direkte til opprinnelig funksjon, datering eller aktør uten kontekst og kontrollkilde.`,
  document: (label) => `Å bruke «${label}» som sannhetsgaranti uten å prøve opphav, dokumentform, integritet, formål og representativitet.`,
  evidence: (label) => `Å presentere «${label}» som tilstrekkelig bevis uten å vise slutningsrekken, alternative forklaringer og kildens begrensning.`,
  source: (label) => `Å behandle «${label}» som en ferdig historisk forklaring uten å skille kildeobservasjon, produksjonskontekst og tolkning.`,
  selection: (label) => `Å bruke «${label}» uten å vise hvilke kriterier, institusjoner, ressurser og tap som formet materialet.`,
  method: (label) => `Å bruke «${label}» som en mekanisk sjekkliste uten å knytte vurderingen til et konkret historisk spørsmål og kildegrunnlag.`,
  media: (label) => `Å lese «${label}» som en nøytral gjengivelse uten å analysere produksjon, medium, utsnitt, mottak og senere bearbeiding.`,
  context: (label) => `Å omtale «${label}» generelt uten å avgrense tid, sted, produsent, virksomhet og målgruppe.`
};

const concepts = readJson(conceptPath);
const conceptById = new Map(concepts.map((item) => [item.concept_id, item]));
if (Object.keys(curation).length !== 64) throw new Error(`Expected 64 curated concepts, got ${Object.keys(curation).length}`);
for (const [conceptId, spec] of Object.entries(curation)) {
  const concept = conceptById.get(conceptId);
  if (!concept) throw new Error(`Missing concept ${conceptId}`);
  concept.label = spec.label;
  concept.definition = spec.definition;
  concept.concept_type = spec.type;
  concept.historical_scope = 'cross_period_source_dependent';
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
  theory_his_kildekritikk: {
    type: 'theory_framework',
    definition: 'Et rammeverk for å avgrense hva en kilde kan brukes til ved å analysere opphav, produksjonstid, formål, avhengighet, overlevering og forholdet mellom kildeobservasjon og historisk påstand.',
    limitations: [
      'Opphav og formål kan ikke alene avgjøre om en opplysning er korrekt; innholdet må prøves mot kontekst, intern sammenheng og kontrollkilder.',
      'Skillet mellom levning og beretning avhenger av forskningsspørsmålet og er ikke en fast egenskap ved kilden.'
    ]
  },
  theory_his_spor_materialitet: {
    type: 'middle_range_model',
    definition: 'En modell for å lese bygninger, ruiner, gjenstander, gravminner og andre materielle spor som resultater av produksjon, bruk, endring, tap og senere ombruk.',
    limitations: [
      'Bevaring og senere ombruk gjør at dagens materialitet ikke uten videre representerer den opprinnelige tilstanden eller funksjonen.',
      'Et fysisk spor kan dokumentere aktivitet eller endring, men ikke alene identifisere aktør, motiv eller sosial betydning.'
    ]
  },
  theory_his_arkiv_makt_orden: {
    type: 'theory_framework',
    definition: 'Et rammeverk for å undersøke hvordan arkivskapere, klassifikasjoner, bevaringsvalg og tilgangsregimer organiserer historisk synlighet og institusjonell makt.',
    limitations: [
      'Arkivets orden viser både virksomheten som skapte materialet og senere arkivfaglige inngrep; disse lagene må skilles analytisk.',
      'Maktperspektivet kan avdekke seleksjon, men kan ikke gjøre enhver mangel til bevis for bevisst undertrykking.'
    ]
  },
  theory_his_taushet_fravaer: {
    type: 'theory_framework',
    definition: 'Et rammeverk for å analysere hvordan ikke-registrering, utelatelse, kassasjon, dokumenttap og forskerens eget utvalg skaper taushet og blindsoner i historisk kunnskap.',
    limitations: [
      'Fravær blir bare analytisk når det finnes en begrunnet forventning om at materialet burde ha blitt produsert, bevart og funnet.',
      'Taushet kan skyldes rutiner, tap, tilgang eller forskerens avgrensning og kan ikke automatisk tilskrives én aktør eller intensjon.'
    ]
  },
  theory_his_dokument_autentisitet: {
    type: 'middle_range_model',
    definition: 'En modell for å prøve dokumenters form, opphav, integritet, overleveringskjede og administrative funksjon før de brukes som belegg for hendelser, rettigheter eller praksiser.',
    limitations: [
      'Et autentisk dokument kan inneholde feil, strategiske framstillinger eller normative utsagn og er derfor ikke automatisk sannferdig eller representativt.',
      'Digital kopi og transkripsjon kan støtte lesning, men kan ikke erstatte kontroll av originalens form, metadata og overlevering når disse er relevante.'
    ]
  },
  theory_his_skrift_lesning: {
    type: 'middle_range_model',
    definition: 'En modell for å bruke skriftform, hånd, forkortelser, språk og materiale til å lese, datere og plassere dokumenter i et historisk skrive- og bruksmiljø.',
    limitations: [
      'Paleografisk datering gir ofte intervaller og sannsynlighet, ikke et sikkert årstall eller en entydig skriver.',
      'Lesbarhet og transkripsjon påvirkes av språk, forkortelser, skade og skriverpraksis; alternative lesninger må dokumenteres.'
    ]
  },
  theory_his_serielle_kilder: {
    type: 'middle_range_model',
    definition: 'En modell for å analysere gjentatte registreringer som protokoller, registre, priser og folketellinger gjennom kategoristabilitet, dekningsgrad, kvantifisering og endring over tid.',
    limitations: [
      'Stabile tabeller kan skjule endringer i kategorier, registreringspraksis, administrativt formål og dekningsgrad over tid.',
      'Mønstre i registrerte tilfeller er ikke automatisk representative for uregistrerte grupper eller hele befolkningen.'
    ]
  },
  theory_his_visuelle_kilder: {
    type: 'theory_framework',
    definition: 'Et rammeverk for å analysere fotografier, kart, illustrasjoner og film som produserte visuelle representasjoner formet av medium, utsnitt, iscenesettelse, teknikk og sirkulasjon.',
    limitations: [
      'Et bilde dokumenterer det som var foran kameraet og samtidig produsentens utsnitt, teknikk, iscenesettelse og senere redigering.',
      'Fravær fra bildet kan skyldes utsnitt eller produksjonsform og kan ikke uten videre tolkes som historisk fravær.'
    ]
  },
  theory_his_muntlige_kilder: {
    type: 'historiographical_tradition',
    definition: 'En historiografisk tradisjon som bruker intervjuer og erindringer til å undersøke både hendelsesopplysninger, levd erfaring, identitet og senere meningsdannelse.',
    limitations: [
      'Erindring omformer erfaring i lys av senere liv, intervjusituasjon og tilgjengelige offentlige fortellinger.',
      'Uoverensstemmelser med skriftlige kilder gjør ikke intervjuet verdiløst, men krever at hendelsesopplysning og meningsdannelse analyseres hver for seg.'
    ]
  },
  theory_his_digitale_kilder: {
    type: 'theory_framework',
    definition: 'Et rammeverk for å vurdere digitalt skapte og digitaliserte kilder gjennom metadata, versjoner, filintegritet, OCR, søkegrensesnitt, plattformlogikk og digital proveniens.',
    limitations: [
      'Søkbarhet er avhengig av metadata, OCR, plattformens rangering og hva som faktisk er digitalisert eller gjort tilgjengelig.',
      'En digital fil kan ha flere versjoner og migreringer; skjermbildet alene dokumenterer ikke opprinnelse, integritet eller fullstendighet.'
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
  em_his_kildekritikk_arkiv_spor: {
    core: ['kildekritikk', 'historisk kilde', 'kildeprodusent', 'opphav', 'formål', 'produksjonskontekst', 'proveniens', 'levning', 'beretning', 'påstandsgrunnlag'],
    sub: ['kildegrunnlag', 'kildeutvalg', 'kontrollkilde', 'korroborering', 'autentisitet', 'representativitet', 'arkiv', 'spor', 'tolkning', 'usikkerhet', 'ettertid', 'kildekritiske spørsmål']
  },
  em_his_spor_materialitet: {
    core: ['spor', 'materialitet', 'materialspor', 'bygningsspor', 'bygningsrester', 'gravminner', 'ruiner', 'monumenter', 'kart', 'levning'],
    sub: ['stedlig spor', 'historisk funksjon', 'funksjonsskifte', 'ombruk', 'brukskontinuitet', 'autentisitet', 'korroborering', 'proveniens', 'kildebegrensning', 'dokumentasjon', 'ettertid', 'tolkning']
  },
  em_his_ruiner_rester_ombruk: {
    core: ['ruiner', 'materielle rester', 'ombruk', 'bygningsrester', 'funksjonsskifte', 'historisk funksjon', 'brukskontinuitet', 'spor', 'levning', 'materialitet'],
    sub: ['stedlig spor', 'bygningsspor', 'dokumenttap', 'autentisitet', 'proveniens', 'korroborering', 'beretning', 'arkivtaushet', 'bevaringsskjevhet', 'ettertid', 'tolkning', 'kildebegrensning']
  },
  em_his_arkiv_og_dokumentasjon: {
    core: ['arkiv', 'arkivbestand', 'dokumentasjon', 'dokumentasjonsformer', 'arkivorden', 'kataloger', 'registre', 'innsamling', 'seleksjon', 'registreringsvirkning'],
    sub: ['proveniens', 'arkivtaushet', 'bevaringsskjevhet', 'dokumenttap', 'kildeutvalg', 'kildehull', 'representativitet', 'materialitet', 'digital proveniens', 'ettertid', 'korroborering', 'historisk dokumentasjon']
  },
  em_his_kilder_taushet_blindsoner: {
    core: ['historisk kilde', 'taushet', 'blindsoner', 'arkivtaushet', 'utelatelse', 'dokumenttap', 'kildeutvalg', 'seleksjon', 'bevaringsskjevhet', 'fravær'],
    sub: ['kildehull', 'negativ evidens', 'indirekte belegg', 'kildebelegg', 'kildegrunnlag', 'representativitet', 'materialitet', 'arkivorden', 'serielle kilder', 'muntlig historie', 'ettertid', 'tolkning']
  },
  em_his_taushet_og_manglende_kilder: {
    core: ['taushet', 'fravær', 'kildehull', 'kildetap', 'dokumenttap', 'negativ evidens', 'indirekte belegg', 'dokumentasjon', 'bevaringsskjevhet', 'korroborering'],
    sub: ['historisk kilde', 'kildebelegg', 'kildegrunnlag', 'arkivtaushet', 'utelatelse', 'seleksjon', 'muntlig historie', 'serielle kilder', 'materialitet', 'stedlig spor', 'ettertid', 'usikkerhet']
  },
  em_his_dokument_autentisitet: {
    core: ['kildeobjekt', 'påstandsgrunnlag', 'produksjonskontekst', 'proveniens', 'opphav', 'formål', 'dokumentform', 'autentisitet', 'kildebegrensning', 'kontrollkilde'],
    sub: ['digital proveniens', 'kontekst', 'representativitet', 'tolkning', 'usikkerhet', 'kildekritikk', 'levning', 'beretning', 'arkivorden', 'serielle kilder', 'dokumentasjonsformer', 'korroborering']
  },
  em_his_skrift_hand_lesning: {
    core: ['kildeobjekt', 'skrift', 'dokumentform', 'produksjonskontekst', 'proveniens', 'opphav', 'autentisitet', 'kildebegrensning', 'kontekst', 'tolkning'],
    sub: ['digital proveniens', 'kildebelegg', 'kontrollkilde', 'usikkerhet', 'kildekritikk', 'levning', 'beretning', 'materialitet', 'dokumentasjonsformer', 'arkivorden', 'visuell representasjon', 'korroborering']
  },
  em_his_serielle_kilder_kvantifisering: {
    core: ['serielle kilder', 'kvantifisering', 'registre', 'kildeobjekt', 'produksjonskontekst', 'seleksjon', 'representativitet', 'kildebegrensning', 'påstandsgrunnlag', 'kontrollkilde'],
    sub: ['digital proveniens', 'kildekritikk', 'kontekst', 'usikkerhet', 'korroborering', 'kildeutvalg', 'arkivorden', 'dokumentasjonsformer', 'historisk kilde', 'tolkning', 'kildebelegg', 'bevaringsskjevhet']
  },
  em_his_visuelle_kilder_fotografi: {
    core: ['visuell representasjon', 'kart', 'kildeobjekt', 'produksjonskontekst', 'opphav', 'formål', 'autentisitet', 'representativitet', 'kildebegrensning', 'tolkning'],
    sub: ['digital proveniens', 'kontekst', 'kontrollkilde', 'korroborering', 'kildekritikk', 'materialitet', 'arkivorden', 'arkivtaushet', 'bevaringsskjevhet', 'historisk kilde', 'dokumentasjonsformer', 'usikkerhet']
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

const invalidLabels = ['arkiver', 'begrensning', 'bygninger', 'claim_basis', 'finnes', 'fortsatt', 'funksjoner', 'gjør', 'grunnspørsmål', 'historiefagets', 'hvem', 'ikke', 'kildene', 'manglende', 'materialer', 'noen', 'rester', 'samler', 'serielle', 'tapte', 'tidligere', 'utelatt', 'viktig', 'visuelle', 'være', 'ødelagt'];
for (const emneId of Object.keys(emneConcepts)) {
  const emne = emneById.get(emneId);
  const used = [...A(emne.core_concepts), ...A(emne.sub_concepts), ...A(emne.key_concepts), ...A(emne.keywords)];
  const remaining = invalidLabels.filter((label) => used.includes(label));
  if (remaining.length) throw new Error(`${emneId} retains invalid labels: ${remaining.join(', ')}`);
}

const domainValidator = path.join(root, 'tools/validate-historie-kilder-arkiv-spor.mjs');
if (!fs.existsSync(domainValidator)) throw new Error('Missing domain validator tools/validate-historie-kilder-arkiv-spor.mjs');
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
    run(process.execPath, [
      'scripts/build-quiz-production-context.mjs',
      '--category', 'historie',
      '--target', targetId,
      '--output', path.join('data/quiz/production_context/historie', file)
    ]);
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
  version: 'historie-v5.5-kilder-arkiv-spor-curation-1',
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  status: 'CURATED_FREEZE_READY',
  concepts_curated: Object.keys(curation).length,
  theories_curated: Object.keys(theoryCuration).length,
  emner_corrected: Object.keys(emneConcepts).length,
  renamed_labels: Object.entries(curation).filter(([id, spec]) => conceptById.get(id)?.label === spec.label).map(([concept_id, spec]) => ({ concept_id, label: spec.label })),
  domain_readiness: domainReadiness,
  global_quality_issue_totals: readiness.quality_issue_totals,
  global_v6_allowed: readiness.v6_allowed
};
writeJson(resultPath, result);
const validation = [
  'Historie V5.5 – Kilder, arkiv og spor',
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

for (const temporary of [
  path.join(reportDir, 'kilder-arkiv-spor-curation-object-list.json'),
  path.join(reportDir, 'kilder-arkiv-spor-curation-audit.txt'),
  path.join(reportDir, 'kilder-arkiv-spor-curation-labels.txt')
]) fs.rmSync(temporary, { force: true });
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
run('git', ['commit', '-m', 'Curate source archive and trace domain']);
run('git', ['push', 'origin', `HEAD:${branch}`]);
console.log(validation);
