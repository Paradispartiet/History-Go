#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const historyDir = path.join(root, 'data/fag/historie');
const reportDir = path.join(root, 'reports/historie-v5');
const domainId = 'his_minne_kulturarv_historiebruk';
const slug = 'minne-kulturarv-historiebruk';
const conceptPath = path.join(historyDir, 'concepts_historie_canonical_v5_5.json');
const theoryPath = path.join(historyDir, 'theory_objects_historie_canonical_v5_5.json');
const queuePath = path.join(reportDir, 'quality-review-queue.json');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
fs.mkdirSync(reportDir, { recursive: true });

const queue = readJson(queuePath);
const targetConcepts = queue.concepts.filter((item) => item.domain_ids?.includes(domainId));
const targetTheories = queue.theories.filter((item) => item.domain_ids?.includes(domainId));
if (targetConcepts.length !== 57 || targetTheories.length !== 10) {
  throw new Error(`Unexpected target counts: ${JSON.stringify({ concepts: targetConcepts.length, theories: targetTheories.length })}`);
}

const hash = (value) => [...value].reduce((sum, ch) => ((sum * 33) + ch.codePointAt(0)) >>> 0, 5381);
const classify = (label) => {
  const text = label.toLowerCase();
  if (text.includes(' vs ')) return 'analytical_distinction';
  if (/3d|digital|modell|metadata|database|nettside|virtuell/.test(text)) return 'digital_heritage';
  if (/museum|samling|kanon|kuratering|formidling|utstilling|arkivutvalg/.test(text)) return 'museum_mediation';
  if (/kollektivt minne|kommunikativt minne|kulturelt minne|erindring|motminne|taushet|fravær|minne$/.test(text)) return 'memory_process';
  if (/kulturminne|kulturarv|bevaring|restaurering|autentisitet|vern|utvelgelse|verdi/.test(text)) return 'heritage_governance';
  if (/monument|minnested|innskrift|jubile|seremoni|ritual|sorg|minnemarkering/.test(text)) return 'commemoration';
  if (/kontrovers|fjerning|omtolk|inkludering|navnepolitikk|stedsnavn|gate|bestilling|symbol|makt/.test(text)) return 'memory_politics';
  return 'history_use';
};

const profiles = {
  analytical_distinction: {
    type: 'historical_analytical_distinction',
    indicators: (label) => [`separate kilder for hvert ledd i «${label}»`, 'dokumentert avvik mellom representasjon og praksis', 'endring over tid, sted og aktørgruppe'],
    sources: ['beslutnings-, produksjons- og praksiskilder som kan holdes fra hverandre', 'publikums-, bruker- og motstemmekilder som viser konsekvenser og mottakelse'],
  },
  digital_heritage: {
    type: 'digital_heritage_method',
    indicators: (label) => [`dokumentert digital representasjon av «${label}»`, 'metadata, versjon og produksjonsprosess', 'tilgang, grensesnitt og dokumentert bruk'],
    sources: ['originalobjekt, dokumentasjon av digitaliserings- eller modelleringsprosessen og tekniske metadata', 'versjonslogg, institusjonell publiseringskontekst og bruker-/tilgangsdata'],
  },
  museum_mediation: {
    type: 'heritage_mediation_practice',
    indicators: (label) => [`institusjonell utvelgelse knyttet til «${label}»`, 'ordning, fortelling og utelatelser i formidlingen', 'dokumentert publikum, bruk eller mottakelse'],
    sources: ['samlings-, utstillings-, katalog- og institusjonsarkiv', 'publikumsundersøkelser, anmeldelser, undervisningsmateriale og kritiske motstemmer'],
  },
  memory_process: {
    type: 'memory_studies_concept',
    indicators: (label) => [`gjentatte fortellinger eller praksiser knyttet til «${label}»`, 'bærere, arenaer og overføringsformer', 'endring, konflikt eller bortfall over generasjoner'],
    sources: ['muntlige, private og offentlige minnekilder fra flere tidspunkter', 'medier, ritualer, organisasjonsarkiv og materielle spor som viser sirkulasjon'],
  },
  heritage_governance: {
    type: 'heritage_governance_concept',
    indicators: (label) => [`uttalte kriterier for «${label}»`, 'vedtak, inngrep og ressursbruk', 'dokumenterte vinnere, tapere og alternative vurderinger'],
    sources: ['lovverk, vedtak, fagrapporter, inventarer og restaureringsdokumentasjon', 'eier-, bruker-, lokalsamfunns- og konfliktkilder som viser praksis og konsekvens'],
  },
  commemoration: {
    type: 'commemorative_practice',
    indicators: (label) => [`materiell eller rituell iscenesettelse av «${label}»`, 'tid, sted, arrangør og målgruppe', 'dokumentert deltakelse, reaksjon og senere endring'],
    sources: ['program, taler, innskrifter, design- og bestillingsdokumenter', 'presse, foto, deltakerberetninger, protester og senere omtolkinger'],
  },
  memory_politics: {
    type: 'memory_politics_concept',
    indicators: (label) => [`aktører med ulike krav til «${label}»`, 'beslutningsmyndighet, begrunnelser og maktressurser', 'endring i navn, plassering, synlighet eller fortolkning'],
    sources: ['politiske vedtak, høringer, organisasjonsarkiv og offentlig debatt', 'lokale erfaringer, protestmateriale, minoritetsstemmer og dokumentasjon av gjennomføring'],
  },
  history_use: {
    type: 'public_history_use_concept',
    indicators: (label) => [`konkret bruk av fortid gjennom «${label}»`, 'avsender, målgruppe og situasjon', 'utvalg, virkemidler og dokumentert virkning eller mottakelse'],
    sources: ['produksjons-, publiserings- og beslutningskilder som viser intensjon og utforming', 'mottakelses-, bruks- og motstemmekilder som viser faktisk funksjon'],
  },
};

const core = {
  con_his_3d_modell: ['3D-modell', 'En 3D-modell er en digital, målebasert eller fortolkende romlig representasjon av et objekt eller sted; den må leses som en produsert modell med dokumenterte valg, ikke som selve kulturminnet.', 'digital_heritage_model', 'Å bruke modellens detaljer som direkte bevis for originalens utseende uten å skille måledata, rekonstruksjon og antakelse.'],
  con_his_bestilling: ['minnepolitisk bestilling', 'En minnepolitisk bestilling er et mandat, oppdrag eller finansiert initiativ som definerer hva et monument, museum, jubileum eller digitalt produkt skal markere, for hvem og innen hvilke rammer.', 'heritage_commission', 'Å behandle det ferdige uttrykket som nøytralt uten å undersøke bestiller, mandat, budsjett og godkjenningsprosess.'],
  con_his_digitalt_minne: ['digitalt minne', 'Digitalt minne er fortidsrepresentasjoner som lagres, sirkuleres og gjenbrukes gjennom digitale plattformer, der algoritmer, formater, eierskap og teknisk forgjengelighet former hva som blir synlig.', 'digital_memory_process', 'Å anta at digital tilgjengelighet gir varig bevaring eller representativ synlighet uten å undersøke plattform, metadata og sletting.'],
  con_his_erindring: ['erindring', 'Erindring er en persons situerte gjenkalling og fortolkning av fortid, påvirket av senere erfaringer, språk, spørsmål og sosiale forventninger.', 'individual_memory_process', 'Å bruke en sen erindring som uendret avtrykk av hendelsen uten å analysere tidspunkt, fortellersituasjon og senere kunnskap.'],
  con_his_formidling: ['historieformidling', 'Historieformidling er den konkrete oversettelsen av historisk kunnskap til fortelling, utstilling, undervisning, byrom eller digitalt medium for bestemte målgrupper.', 'public_history_mediation', 'Å vurdere formidling bare etter faktarikt innhold uten å undersøke utvalg, dramaturgi, tilgjengelighet og publikums bruk.'],
  con_his_gate: ['minnepolitisk gatenavn', 'En gate er i dette domenet et navngitt offentlig rom der navn, skilting og bruk kan feste bestemte personer eller fortellinger til hverdagslandskapet.', 'commemorative_street_space', 'Å behandle gatenavnet som passiv orientering uten å undersøke navnevedtak, historisk kontekst og hvem som ikke fikk plass.'],
  con_his_historiebruk: ['historiebruk', 'Historiebruk er aktørers selektive bruk av fortid for å forklare, legitimere, identifisere, mobilisere, sørge, underholde eller kritisere i en bestemt samtid.', 'history_use_framework', 'Å kalle enhver omtale av fortid historiebruk uten å identifisere aktør, formål, utvalg, medium og virkning.'],
  con_his_inkludering: ['inkludering i kulturarv', 'Inkludering i kulturarv er endringer i utvalg, språk, tilgang og beslutningsmakt som gjør tidligere marginaliserte erfaringer synlige og virksomme i institusjoner og minnesteder.', 'heritage_inclusion_process', 'Å telle nye navn eller objekter som inkludering uten å undersøke ressurser, kuratorisk makt, tilgang og varig institusjonell endring.'],
  con_his_innskrift: ['minneinnskrift', 'En minneinnskrift er autorisert tekst festet til et monument, bygg eller sted som kondenserer en historisk fortolkning i et varig offentlig uttrykk.', 'commemorative_inscription', 'Å lese innskriften som full historisk redegjørelse uten å undersøke forfatter, bestilling, forkortelser og utelatelser.'],
  con_his_kanon: ['historisk kanon', 'En historisk kanon er et relativt stabilt utvalg av personer, hendelser, verk og steder som institusjoner gjentar som særlig betydningsfulle.', 'historical_canon', 'Å behandle kanonen som naturlig rangering av betydning uten å undersøke hvem som valgte, gjentok og utfordret utvalget.'],
  con_his_kollektivt_minne: ['kollektivt minne', 'Kollektivt minne er sosialt organiserte fortidsforestillinger som grupper vedlikeholder gjennom fortellinger, ritualer, medier, institusjoner og steder.', 'collective_memory_concept', 'Å tilskrive en hel befolkning ett felles minne uten å dokumentere bærere, variasjon, konflikt og endring.'],
  con_his_kommunikativt_minne: ['kommunikativt minne', 'Kommunikativt minne er hverdagslig, ofte muntlig overføring av erfaringer innen levende generasjoner, uten nødvendigvis å være stabilisert av formelle institusjoner.', 'communicative_memory_concept', 'Å anta at familie- eller generasjonsfortellinger er ensartede eller uforandrede fordi de gjentas muntlig.'],
  con_his_kontekstualisering: ['kontekstualisering', 'Kontekstualisering plasserer et objekt, utsagn eller minnested i dokumenterte sammenhenger av tid, makt, aktører, språk og etterliv uten å oppheve selve kildens problematiske innhold.', 'historical_contextualization_method', 'Å bruke en kort forklaring som moralsk frikort uten å vise relevante maktforhold, konsekvenser og alternative perspektiver.'],
  con_his_kontrovers: ['minnekontrovers', 'En minnekontrovers er en offentlig konflikt om hvem eller hva som skal minnes, hvordan uttrykket skal tolkes, og hvem som har myndighet til å endre det.', 'memory_controversy', 'Å redusere kontroversen til meningsforskjell uten å analysere institusjonell makt, historiske krav og materielle konsekvenser.'],
  con_his_kulturarvskonflikt: ['kulturarvskonflikt', 'En kulturarvskonflikt oppstår når vern, bruk, eierskap, utvikling eller representasjon av fortid gir uforenlige krav mellom aktører.', 'heritage_conflict', 'Å beskrive konflikten som vern mot utvikling alene uten å undersøke ulike verneverdier, brukere, eiere og fordelingsvirkninger.'],
  con_his_kulturelt_minne: ['kulturelt minne', 'Kulturelt minne er fortidsforestillinger som stabiliseres og overføres gjennom institusjoner, tekster, bilder, ritualer, monumenter og arkiver utover levende generasjoner.', 'cultural_memory_concept', 'Å behandle institusjonalisert minne som uforanderlig eller representativt for alle grupper.'],
  con_his_kulturminne: ['kulturminne', 'Et kulturminne er et materielt eller immaterielt spor som er identifisert og tillagt historisk, sosial, vitenskapelig eller estetisk verdi gjennom konkrete vurderinger.', 'heritage_object_concept', 'Å anta at alder alene gjør noe til kulturminne eller at formell status uttømmer alle verdier og konflikter.'],
  con_his_kulturminner: ['kulturminner', 'Kulturminner er en analytisk og forvaltningsmessig gruppe av spor fra menneskelig virksomhet; flertallsformen krever eksplisitte avgrensninger og utvalgskriterier.', 'heritage_object_collection', 'Å omtale et område som rikt på kulturminner uten å spesifisere objekter, tidslag, status og dokumentasjonsgrunnlag.'],
  con_his_kuratering: ['kuratering', 'Kuratering er den faglige og institusjonelle prosessen som velger, ordner, tolker og presenterer objekter og fortellinger for et bestemt formål og publikum.', 'curatorial_process', 'Å framstille en utstilling eller samling som nøytral speiling av fortiden uten å undersøke utvalg, rekkefølge og fravær.'],
  con_his_minnested: ['minnested', 'Et minnested er et fysisk eller digitalt sted som gjennom utforming, ritual og gjentatt bruk knyttes til bestemte personer, tap eller hendelser.', 'memorial_site', 'Å utlede stedets betydning fra designet alene uten å dokumentere bruk, ritualer, konflikt og endring over tid.'],
  con_his_monument: ['monument', 'Et monument er et bestilt eller autorisert offentlig uttrykk som gjør en bestemt fortolkning av person, hendelse eller verdi synlig i rommet.', 'public_monument', 'Å behandle monumentet som ren kunstgjenstand uten å undersøke bestilling, plassering, symbolbruk og makt.'],
  con_his_motminne: ['motminne', 'Motminne er en organisert fortidsfortelling eller praksis som utfordrer dominerende minneordninger ved å synliggjøre utelatte erfaringer, ansvar eller steder.', 'counter_memory', 'Å kalle enhver alternativ fortelling motminne uten å vise hvilken dominerende orden den utfordrer og hvordan.'],
  con_his_navnepolitikk: ['navnepolitikk', 'Navnepolitikk er beslutninger og konflikter om hvilke navn som gis, beholdes, endres eller fjernes fra offentlige steder og institusjoner.', 'toponymic_memory_politics', 'Å behandle navneendring som symbolsk detalj uten å undersøke beslutningsmakt, språk, identitet og praktisk gjennomføring.'],
  con_his_stedsnavn: ['stedsnavn', 'Et stedsnavn er både orienteringsmiddel og historisk språkhandling som kan bevare, normalisere eller fortrenge bestemte personer, språk og bruksmåter.', 'historical_place_name', 'Å bruke dagens navn som tidløs betegnelse eller direkte bevis på eldre identitet og bruk.'],
  con_his_autentisitet: ['autentisitet', 'Autentisitet er en begrunnet vurdering av hvilke materialer, former, bruksspor, omgivelser og fortellinger som bærer et kulturminnes historiske troverdighet.', 'heritage_authenticity_assessment', 'Å likestille autentisitet med urørt originalmateriale eller med estetisk gammelt uttrykk.'],
  con_his_bevaring: ['bevaring', 'Bevaring er tiltak som sikrer at dokumenterte kulturhistoriske verdier kan videreføres gjennom vedlikehold, bruk, vern eller kontrollert endring.', 'heritage_conservation_process', 'Å bruke bevaring som synonym for å fryse et sted i én valgt periode uten å dokumentere bruk, endringshistorie og vedlikeholdsbehov.'],
  con_his_restaurering: ['restaurering', 'Restaurering er et dokumentert inngrep som søker å tydeliggjøre eller tilbakeføre valgte historiske trekk, samtidig som nye materialer og fortolkninger gjøres sporbare.', 'heritage_restoration_process', 'Å beskrive restaurering som tilbakeføring til originalen uten å angi valgt tidspunkt, evidens og nye inngrep.'],
  con_his_utvelgelse: ['kulturarvutvelgelse', 'Kulturarvutvelgelse er prosessen der enkelte spor gis vern, ressurser og offentlig oppmerksomhet mens andre nedprioriteres eller forsvinner.', 'heritage_selection_process', 'Å fremstille utvalget som rent faglig uten å undersøke lovverk, ressurser, representasjon og politiske prioriteringer.'],
  con_his_verdi: ['kulturhistorisk verdi', 'Kulturhistorisk verdi er en eksplisitt og etterprøvbar begrunnelse for hvorfor et spor anses viktig, for eksempel som kilde, identitetsbærer, brukssted eller representant for et miljø.', 'heritage_value_assessment', 'Å bruke verdi som generell ros uten kriterier, sammenligningsgrunnlag og berørte aktører.'],
  con_his_fjerning: ['fjerning av minneuttrykk', 'Fjerning er en materiell og politisk handling som tar et navn, monument eller annet minneuttrykk ut av sin offentlige plassering, men ikke nødvendigvis ut av historien.', 'commemorative_removal', 'Å likestille fjerning med sletting av historie uten å undersøke dokumentasjon, ny plassering, pedagogisk kontekst og maktforhold.'],
};

const targetMeta = targetConcepts.map((item) => ({ ...item, family: classify(item.label) }));
const familyIds = new Map();
for (const item of targetMeta) {
  const ids = familyIds.get(item.family) ?? [];
  ids.push(item.concept_id);
  familyIds.set(item.family, ids);
}
const allTargetIds = targetMeta.map((item) => item.concept_id);
const pick = (items, seed, count) => {
  if (!items.length) return [];
  const start = hash(seed) % items.length;
  const result = [];
  for (let i = 0; i < items.length && result.length < count; i += 1) {
    const value = items[(start + i) % items.length];
    if (!result.includes(value)) result.push(value);
  }
  return result;
};

const familyDefinition = (label, family, id) => {
  const variant = hash(id) % 4;
  const texts = {
    digital_heritage: [
      `«${label}» analyseres som en digitalt produsert representasjon der datagrunnlag, modellvalg, metadata, versjon og plattform bestemmer hva brukeren kan se og gjøre.`,
      `Begrepet «${label}» avgrenser en digital kulturarvspraksis som må dokumenteres fra kildeobjekt og produksjonsprosess til publisering, tilgang og senere endring.`,
      `I digital kulturarv viser «${label}» til et teknisk og kuratorisk resultat, ikke en transparent kopi; både fravalg, usikkerhet og grensesnitt inngår i analysen.`,
      `Historisk undersøkes «${label}» gjennom hvordan materiale oversettes til data, hvordan representasjonen versjoneres, og hvem som får kontroll over lagring og tilgang.`,
    ],
    museum_mediation: [
      `«${label}» er en institusjonell formidlingspraksis der utvalg, ordning, språk og visningsform produserer en bestemt lesning av fortiden for et definert publikum.`,
      `Begrepet «${label}» brukes om arbeidet som gjør samlinger og historisk kunnskap offentlige, men også om prioriteringene og utelatelsene som følger med.`,
      `I museums- og formidlingsanalyse avgrenser «${label}» forbindelsen mellom samling, kuratorisk beslutning, narrativ struktur og publikums faktiske møte med materialet.`,
      `Historisk må «${label}» rekonstrueres gjennom institusjonens mål, objektenes proveniens, presentasjonsformen og dokumentert mottakelse.`,
    ],
    memory_process: [
      `«${label}» beskriver en sosial prosess der fortidsforestillinger huskes, fortelles, glemmes eller omformes av bestemte bærere i bestemte situasjoner.`,
      `Begrepet «${label}» avgrenser hvordan erfaring blir bearbeidet og overført, og krever skille mellom individuell erindring, gruppepraksis og institusjonalisert minne.`,
      `I minnestudier brukes «${label}» for å undersøke hvem som bærer en fortelling, gjennom hvilke medier den sirkulerer, og hvordan den endres over tid.`,
      `Historisk undersøkes «${label}» som et forhold mellom erfaring, senere fortolkning, sosial overføring og konkurrerende minner.`,
    ],
    heritage_governance: [
      `«${label}» er en dokumenterbar vurderings- eller forvaltningspraksis som bestemmer hvilke spor som gis status, ressurser, inngrep og framtidig bruk.`,
      `Begrepet «${label}» avgrenser hvordan kulturhistoriske verdier defineres og omsettes i vedtak, materialbehandling, vern eller kontrollert endring.`,
      `I kulturarvforvaltning viser «${label}» til konkrete kriterier og handlinger, ikke til en selvinnlysende egenskap ved gamle objekter eller steder.`,
      `Historisk må «${label}» analyseres gjennom faglige standarder, lovverk, eierskap, økonomi, bruk og de alternative verdiene som ble nedprioritert.`,
    ],
    commemoration: [
      `«${label}» er en offentlig minnepraksis som gjennom sted, form, tekst, tid og gjentakelse gjør en valgt fortolkning av fortiden synlig.`,
      `Begrepet «${label}» avgrenser en materiell eller rituell iscenesettelse med identifiserbare bestillere, deltakere, målgrupper og senere bruksmønstre.`,
      `I analyse av offentlig minne undersøkes «${label}» som samspill mellom design, seremoni, plassering, deltakelse og konkurrerende fortolkninger.`,
      `Historisk må «${label}» knyttes til hvem som tok initiativet, hva som ble markert, hvordan publikum deltok, og hvordan uttrykket senere ble brukt eller endret.`,
    ],
    memory_politics: [
      `«${label}» betegner en politisk kamp om fortidens synlighet, språk eller plassering, der aktører har ulike krav og ulik myndighet til å få dem gjennomført.`,
      `Begrepet «${label}» avgrenser hvordan offentlig minne forhandles gjennom vedtak, protest, institusjonell kontroll og endring av materielle eller språklige uttrykk.`,
      `I minnepolitisk analyse viser «${label}» til mer enn uenighet: makt, ressurser, representasjon og praktisk gjennomføring må dokumenteres.`,
      `Historisk undersøkes «${label}» gjennom kravene som ble reist, beslutningsarenaene, motstanden og de varige endringene i offentlig rom eller institusjon.`,
    ],
    history_use: [
      `«${label}» er en konkret måte fortid velges, formes og brukes på av identifiserbare aktører for et bestemt formål i en bestemt samtid.`,
      `Begrepet «${label}» avgrenser forbindelsen mellom historisk materiale, avsender, medium, målgruppe og den funksjonen fortiden får i nåtiden.`,
      `I historiebruksanalyse undersøkes «${label}» gjennom utvalg, fortellergrep, kontekst og dokumentert mottakelse, ikke bare gjennom faktainnholdet.`,
      `Historisk må «${label}» knyttes til hvem som produserte uttrykket, hvilke alternativer som ble valgt bort, og hva bruken faktisk gjorde mulig.`,
    ],
  };
  return texts[family]?.[variant] ?? `«${label}» er et historisk analysebegrep som må avgrenses gjennom aktør, tid, sted, praksis og kildegrunnlag.`;
};

const concepts = readJson(conceptPath);
const conceptById = new Map(concepts.map((item) => [item.concept_id, item]));
const curatedConcepts = [];
for (const meta of targetMeta) {
  const item = conceptById.get(meta.concept_id);
  if (!item) throw new Error(`Missing concept ${meta.concept_id}`);
  const family = meta.family;
  const profile = profiles[family];
  const sameFamily = (familyIds.get(family) ?? []).filter((id) => id !== meta.concept_id);
  const otherFamily = allTargetIds.filter((id) => id !== meta.concept_id && !sameFamily.includes(id));
  const related = pick(sameFamily.length >= 2 ? sameFamily : allTargetIds.filter((id) => id !== meta.concept_id), `${meta.concept_id}:related`, 3);
  const distinguish = pick(otherFamily.filter((id) => !related.includes(id)), `${meta.concept_id}:distinguish`, 1);
  const override = core[meta.concept_id];
  let label = override?.[0] ?? item.label;
  let definition = override?.[1] ?? familyDefinition(label, family, meta.concept_id);
  let conceptType = override?.[2] ?? profile.type;
  let misuse = override?.[3];
  if (family === 'analytical_distinction') {
    const [left, right] = label.split(/\s+vs\s+/i);
    definition = `Skillet mellom «${left}» og «${right}» hindrer at dokumentasjon av ${left.toLowerCase()} automatisk brukes som bevis for ${right.toLowerCase()}; begge ledd må undersøkes med egne kilder, mål og tidsforløp.`;
    conceptType = profile.type;
    misuse = `Å bruke ${left.toLowerCase()} som direkte dokumentasjon på ${right.toLowerCase()} uten å kontrollere forskjellen mellom uttrykk, beslutning, praksis og konsekvens.`;
  }
  misuse ??= `Å bruke «${label}» som selvforklarende kvalitetsstempel uten å dokumentere aktører, kriterier, utvalg, motstemmer og faktisk virkning.`;
  Object.assign(item, {
    label,
    definition,
    concept_type: conceptType,
    broader_concepts: [],
    narrower_concepts: [],
    related_concepts: related,
    distinguish_from: distinguish,
    common_misuse: [misuse],
    indicators: profile.indicators(label),
    source_requirements: profile.sources,
    status: 'canonical_v5_5_curated',
  });
  curatedConcepts.push({ concept_id: item.concept_id, label: item.label, family, concept_type: item.concept_type });
}

const duplicateValues = (items, selector) => {
  const seen = new Map();
  for (const item of items) {
    const value = selector(item);
    const ids = seen.get(value) ?? [];
    ids.push(item.concept_id);
    seen.set(value, ids);
  }
  return [...seen.entries()].filter(([, ids]) => ids.length > 1);
};
const curatedObjects = targetMeta.map((meta) => conceptById.get(meta.concept_id));
const duplicateDefinitions = duplicateValues(curatedObjects, (item) => item.definition);
const duplicateMisuse = duplicateValues(curatedObjects, (item) => item.common_misuse.join('|'));
if (duplicateDefinitions.length || duplicateMisuse.length) {
  throw new Error(`Duplicate curation text: ${JSON.stringify({ duplicateDefinitions, duplicateMisuse })}`);
}
for (const item of curatedObjects) {
  for (const relation of [...item.related_concepts, ...item.distinguish_from]) {
    if (!conceptById.has(relation)) throw new Error(`Missing relation ${relation} from ${item.concept_id}`);
  }
}
writeJson(conceptPath, concepts);

const theorySpecs = {
  theory_his_kulturminneutvelgelse_verdi: {
    definition: 'Analyserer kulturminneutvelgelse som en institusjonell og politisk prosess der alder, kildeverdi, representativitet, sjeldenhet, identitet, bruk og økonomi vektes ulikt, slik at noen spor får vern og ressurser mens andre forsvinner.',
    limitations: ['Formell vernestatus er et resultat av kriterier og beslutninger, ikke et nøytralt mål på historisk betydning.', 'Utvalgte objekter kan overrepresentere eliter, monumental arkitektur og godt dokumenterte miljøer dersom sosial og immateriell historie ikke kontrolleres.', 'Verdibegrunnelser må knyttes til tid, aktører og sammenligningsgrunnlag; dagens popularitet kan ikke alene forklare eldre beslutninger.'],
  },
  theory_his_bevaring_restaurering_autentisitet: {
    definition: 'Undersøker bevaring og restaurering som valg mellom materialkontinuitet, lesbar endringshistorie, tilbakeføring, bruk og teknisk sikkerhet, med autentisitet som eksplisitt vurdering snarere enn synonym for urørt original.',
    limitations: ['En restaurering kan øke estetisk helhet og samtidig redusere kildeverdien ved å fjerne senere tidslag.', 'Autentisitet må spesifiseres som materiale, form, bruk, sted, håndverk eller fortelling; kriteriene kan peke i ulike retninger.', 'Tekniske krav og videre bruk må dokumenteres, men må ikke brukes som automatisk begrunnelse for å erstatte historisk materiale.'],
  },
  theory_his_museum_samling_kanon: {
    definition: 'Analyserer museet som et system for innsamling, klassifikasjon, magasinering, forskning og visning der proveniens, katalog, kuratering og gjentakelse bidrar til å etablere historiske kanoner.',
    limitations: ['Samlingsmengde må ikke forveksles med representativitet; fravær kan skyldes innsamlingspolitikk, tap, makt og ressurser.', 'Utstillingen er et midlertidig kuratorisk utsnitt og kan ikke brukes som full beskrivelse av hele samlingen eller historien.', 'Publikumsmottakelse og bruk må dokumenteres særskilt; institusjonens intensjon sier ikke alene hvordan kanonen virker.'],
  },
  theory_his_minnested_ritual_offentlig_sorg: {
    definition: 'Forklarer minnesteder gjennom samspillet mellom tap, sted, design, ritual, gjentakelse og offentlig deltakelse, der sorg både kan samle fellesskap og synliggjøre uenighet om ansvar og tilhørighet.',
    limitations: ['Høy deltakelse ved én markering dokumenterer ikke et varig eller enhetlig kollektivt minne.', 'Et minnested må undersøkes i bruk over tid; designintensjonen kan avvike fra spontane ritualer, hverdagsbruk og senere politisering.', 'Offentlig sorg kan inkludere noen og marginalisere andre; fravær, taushet og alternative ritualer må undersøkes.'],
  },
  theory_his_monument_symbol_makt: {
    definition: 'Analyserer monumenter som bestilte, finansierte og plasserte maktuttrykk der person, hendelse, kropp, materiale, innskrift og byrom organiserer hvem som gjøres synlig og autoritativ i offentligheten.',
    limitations: ['Monumentets ikonografi kan ikke tolkes uten bestilling, plassering, avduking og samtidige debatter.', 'Senere bruk, likegyldighet, protest og omtolking kan endre monumentets funksjon uten at objektet endres fysisk.', 'Symbolsk synlighet må ikke likestilles med faktisk politisk eller sosial makt, men forbindelsen mellom dem bør dokumenteres.'],
  },
  theory_his_kontrovers_fjerning_omtolking: {
    definition: 'Undersøker minnekontroverser som konflikter om historisk ansvar, representasjon og offentlig rom, med fjerning, flytting, tillegg, kontekstualisering og omtolking som ulike inngrep med ulike konsekvenser.',
    limitations: ['Fjerning er ikke automatisk historiesletting, og bevaring er ikke automatisk historisk åpenhet; dokumentasjon og ny kontekst må undersøkes.', 'Debattens mest synlige stemmer kan avvike fra berørte lokalsamfunn og grupper med mindre institusjonell tilgang.', 'En tekstplakett løser ikke nødvendigvis maktforholdet i plassering, skala og ritualisert bruk av et monument.'],
  },
  theory_his_jubileum_seremoni_historiebruk: {
    definition: 'Analyserer jubileer som tidsbundne historiebruksprosjekter der runde år mobiliserer finansiering, forskning, seremonier, turisme og identitet gjennom et kuratert hendelsesforløp.',
    limitations: ['Jubileumsprogrammet uttrykker arrangørenes prioriteringer og må ikke behandles som representativ oversikt over hele historien.', 'Midlertidig oppmerksomhet og høyt besøkstall dokumenterer ikke varig kunnskap, identitet eller institusjonell endring.', 'Runde år kan presse komplekse prosesser inn i én dato og ett nasjonalt eller lokalt fellesskap; alternative kronologier må synliggjøres.'],
  },
  theory_his_stedsnavn_navnepolitikk: {
    definition: 'Forklarer stedsnavn som historiske språkhandlinger og administrative infrastrukturer der navngiving, standardisering, oversettelse, endring og skilting kobler orientering til identitet, eierskap og offentlig autoritet.',
    limitations: ['Dagens offisielle navn må ikke projiseres bakover på perioder med andre språk, navn eller avgrensninger.', 'Navnevedtak dokumenterer institusjonell autoritet, men ikke nødvendigvis lokal bruk, uttale eller tilhørighet.', 'Endret skilt eller registerverdi viser ikke alene at eldre navn og maktforhold er forsvunnet fra praksis.'],
  },
  theory_his_fravaer_taushet_motminne: {
    definition: 'Analyserer fravær og taushet som mulige resultater av arkivpraksis, makt, traume, sosial risiko og senere kuratering, mens motminner undersøkes som organiserte utfordringer til dominerende fortidsordninger.',
    limitations: ['Fravær i arkiv eller monumentlandskap er ikke direkte bevis på at en erfaring ikke fantes; produksjon, bevaring og tilgang må skilles.', 'Taushet kan være påtvunget, strategisk, situert eller tilfeldig og må ikke gis én universell psykologisk forklaring.', 'En alternativ fortelling er ikke automatisk motminne; den må knyttes til en identifiserbar dominerende orden og dokumentert utfordring.'],
  },
  theory_his_digital_kulturarv_formidling: {
    definition: 'Analyserer digital kulturarv fra utvalg og digitalisering via metadata, modellering, plattform og grensesnitt til tilgang, gjenbruk og langtidsbevaring, med teknologien som aktiv medprodusent av historisk synlighet.',
    limitations: ['Digital kopi eller 3D-modell må ikke erstatte dokumentasjon av originalobjekt, målegrunnlag, usikkerhet og produksjonsvalg.', 'Søkbarhet og åpen nettadgang kan skjule skjev metadata, språkbarrierer, opphavsrett og plattformavhengighet.', 'Teknisk lagring er ikke varig bevaring uten versjonsstyring, formatmigrering, ansvar og dokumentert finansiering.'],
  },
};

const targetTheoryIds = targetTheories.map((item) => item.theory_id).sort();
const specTheoryIds = Object.keys(theorySpecs).sort();
if (JSON.stringify(targetTheoryIds) !== JSON.stringify(specTheoryIds)) {
  throw new Error(`Theory mismatch: ${JSON.stringify({ targetTheoryIds, specTheoryIds })}`);
}
const theories = readJson(theoryPath);
const theoryById = new Map(theories.map((item) => [item.theory_id, item]));
for (const [id, spec] of Object.entries(theorySpecs)) {
  const item = theoryById.get(id);
  if (!item) throw new Error(`Missing theory ${id}`);
  Object.assign(item, spec, { status: 'canonical_v5_5_curated', evidence_ready: false });
}
const limitationProfiles = new Set();
for (const id of specTheoryIds) {
  const item = theoryById.get(id);
  const profile = item.limitations.join('|');
  if (limitationProfiles.has(profile)) throw new Error(`Repeated theory limitation profile: ${id}`);
  limitationProfiles.add(profile);
}
writeJson(theoryPath, theories);

const run = (name, command, args) => {
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  const output = `$ ${command} ${args.join(' ')}\n${result.stdout || ''}${result.stderr || ''}`;
  fs.writeFileSync(path.join(reportDir, name), output);
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
};
run(`${slug}-domain-validation.log`, process.execPath, ['tools/validate-historie-domain.mjs', domainId]);
run(`${slug}-v5-validation.log`, process.execPath, ['tools/validate-historie-v5.mjs', '--write']);
run(`${slug}-quiz-context.log`, 'npm', ['run', 'quiz:context']);
run(`${slug}-knowledge-canonical.log`, 'npm', ['run', 'knowledge:canonical:write']);
run(`${slug}-quiz-production-context-audit.log`, 'npm', ['run', 'audit:quiz-production-context']);
run(`${slug}-quiz-progression-audit.log`, 'npm', ['run', 'audit:quiz-progression']);
run(`${slug}-quiz-theory-binding-audit.log`, 'npm', ['run', 'audit:quiz-theory-binding']);
run(`${slug}-quiz-production-test.log`, 'npm', ['run', 'test:quiz-production']);

const readiness = readJson(path.join(reportDir, 'historie-v5-5-readiness.json'));
const domain = readiness.domains.find((item) => item.domain_id === domainId);
if (!domain?.freeze_ready || domain.issue_counts.concepts !== 0 || domain.issue_counts.theories !== 0) {
  throw new Error(`Domain is not freeze ready: ${JSON.stringify(domain)}`);
}
writeJson(path.join(reportDir, `${slug}-curation-index.json`), {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  curated_concepts: curatedConcepts,
  curated_theory_ids: specTheoryIds,
  uniqueness_checks: { duplicate_definitions: 0, duplicate_misuse_guards: 0, repeated_theory_limitation_profiles: 0 },
});
writeJson(path.join(reportDir, `${slug}-curation-readiness.json`), {
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  curated_concept_ids: targetMeta.map((item) => item.concept_id),
  curated_theory_ids: specTheoryIds,
  domain_readiness: domain,
  global_status: readiness.status,
  v6_allowed: readiness.v6_allowed,
  quality_issue_totals: readiness.quality_issue_totals,
  next_gate: 'Curate the final industrial and labour history domain, then run a global quality uplift and freeze audit.',
});
const restore = spawnSync('git', ['checkout', '--', 'data/places/places_index.json', 'data/quiz/production_context/by/deichman_bjorvika.json'], { cwd: root, encoding: 'utf8' });
if (restore.status !== 0) throw new Error(restore.stderr || 'Failed to restore generated place files');
