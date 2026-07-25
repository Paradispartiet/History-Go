import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const domainId = 'his_okonomi_handel_materielle_systemer';
const conceptsPath = 'data/fag/historie/concepts_historie_canonical_v5_5.json';
const theoriesPath = 'data/fag/historie/theory_objects_historie_canonical_v5_5.json';
const emnerPath = 'data/fag/historie/emner_historie_canonical_v4_5.json';
const reportDir = path.join(root, 'reports', 'historie-v5');
const commandLogPath = path.join(reportDir, 'okonomi-handel-materielle-systemer-curation-command.log');
const resultPath = path.join(reportDir, 'okonomi-handel-materielle-systemer-curation-result.json');
const validationPath = path.join(reportDir, 'okonomi-handel-materielle-systemer-curation-validation.txt');
fs.mkdirSync(reportDir, { recursive: true });

const commandLog = [];
function run(command, args, maxBuffer = 256 * 1024 * 1024) {
  const label = `$ ${command} ${args.join(' ')}`;
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer,
    env: process.env
  });
  commandLog.push(label, result.stdout || '', result.stderr || '');
  fs.writeFileSync(commandLogPath, `${commandLog.join('\n')}\n`);
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.error || result.status !== 0) {
    throw new Error(`${label} feilet med kode ${result.status}`);
  }
  return result.stdout;
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}
function writeJson(relativePath, value) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}
function belongsToDomain(object) {
  return object?.domain_id === domainId ||
    object?.domain_ids?.includes(domainId) ||
    object?.explanatory_scope?.includes(domainId);
}
function isCurated(object) {
  return String(object?.status || '').includes('curated') &&
    !String(object?.definition || '').includes('betegner «');
}
function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

const conceptContent = {
  con_his_akkumulering: {
    label: 'akkumulering',
    definition: 'Prosessen der overskudd, eiendeler eller økonomiske krav beholdes, samles og reinvesteres slik at aktører kan utvide produksjon, inntekt, kontroll eller framtidig handlekraft.',
    concept_type: 'capital_accumulation_concept',
    broader_concepts: ['con_his_kapital'],
    related_concepts: ['con_his_eiendom', 'con_his_kreditt', 'con_his_produktivitet'],
    distinguish_from: ['con_his_forbruk'],
    misuse: 'Å bruke akkumulering som synonym for enhver formueøkning uten å dokumentere overskudd, kontroll, reinvestering eller overføring mellom aktører.'
  },
  con_his_arbeidsdeling: {
    label: 'arbeidsdeling',
    definition: 'Fordeling og spesialisering av oppgaver mellom personer, hushold, yrker, virksomheter eller regioner, formet av kompetanse, makt, kjønn, teknologi og markedsforbindelser.',
    concept_type: 'division_of_labour_concept',
    broader_concepts: ['con_his_okonomi'],
    related_concepts: ['con_his_global_arbeidsdeling', 'con_his_produktivitet', 'con_his_teknologi'],
    distinguish_from: ['con_his_global_arbeidsdeling'],
    misuse: 'Å slutte fra en formell yrkestittel til den faktiske arbeidsdelingen uten å undersøke oppgaver, ubetalt arbeid, sesongvariasjon og hierarki.'
  },
  con_his_avhengighet: {
    label: 'avhengighet',
    definition: 'En asymmetrisk relasjon der en aktørs eller regions handlingsrom formes av tilgang til kapital, teknologi, markeder, sikkerhet eller beslutninger kontrollert andre steder.',
    concept_type: 'relational_economy_concept',
    broader_concepts: ['con_his_global_arbeidsdeling'],
    related_concepts: ['con_his_ravarer', 'con_his_handel', 'con_his_kapital'],
    distinguish_from: ['con_his_markedsintegrasjon'],
    misuse: 'Å behandle avhengighet som et automatisk resultat av handel uten å dokumentere alternativer, kontrakter, priser, kontroll og forhandlingsmakt.'
  },
  con_his_bank: {
    label: 'bank',
    definition: 'En historisk institusjon som organiserer betalinger og mellomledd mellom innskudd, kreditt, valuta, verdipapirer eller offentlig finans, under bestemte regler og tillitsforhold.',
    concept_type: 'financial_institution_concept',
    broader_concepts: ['con_his_finans'],
    related_concepts: ['con_his_kreditt', 'con_his_penger', 'con_his_kapital'],
    distinguish_from: ['con_his_offentlig'],
    misuse: 'Å projisere dagens innskuddsbank på eldre pengeutlånere, vekslere eller offentlige kasser uten å undersøke funksjon, eierskap og regulering.'
  },
  con_his_eiendom: {
    label: 'eiendom',
    definition: 'Historisk regulerte og praktiserte rettigheter til å eie, bruke, overføre, arve og kontrollere jord, bolig, løsøre og andre ressurser.',
    concept_type: 'property_relations_concept',
    broader_concepts: ['con_his_okonomi'],
    related_concepts: ['con_his_kapital', 'con_his_akkumulering', 'con_his_skatt'],
    distinguish_from: ['con_his_kapital'],
    misuse: 'Å likestille formell tittel med faktisk rådighet uten å undersøke bruksrett, kjønn, arv, gjeld, felleseie og håndheving.'
  },
  con_his_finans: {
    label: 'finans',
    definition: 'Institusjoner, instrumenter og praksiser som mobiliserer, priser og overfører kapital, betalingskrav og risiko mellom aktører og tidspunkter.',
    concept_type: 'financial_system_concept',
    broader_concepts: ['con_his_okonomi'],
    related_concepts: ['con_his_bank', 'con_his_kreditt', 'con_his_kapital'],
    distinguish_from: ['con_his_penger'],
    misuse: 'Å bruke finans som en løs betegnelse på all pengebruk uten å identifisere krav, løpetid, risiko, mellomledd eller marked.'
  },
  con_his_fiske: {
    label: 'fiske',
    definition: 'Høsting, fangst, bearbeiding og omsetning av akvatiske ressurser innen skiftende rettighetsregimer, bestander, sesonger, teknologier og markeder.',
    concept_type: 'aquatic_resource_economy_concept',
    broader_concepts: ['con_his_ressursokonomi'],
    related_concepts: ['con_his_handel', 'con_his_sjofart', 'con_his_ravarer'],
    distinguish_from: ['con_his_jordbruk'],
    misuse: 'Å behandle fiske som én stabil næring uten å skille mellom husholdsfangst, kommersielt fiske, foredling, eierskap og ressursforvaltning.'
  },
  con_his_forbruk: {
    label: 'forbruk',
    definition: 'Anskaffelse, bruk, deling og avhending av varer og tjenester i hushold, institusjoner og offentlige ordninger, innen bestemte inntekts-, pris- og normsystemer.',
    concept_type: 'consumption_history_concept',
    broader_concepts: ['con_his_okonomi'],
    related_concepts: ['con_his_pris', 'con_his_priser', 'con_his_levestandard'],
    distinguish_from: ['con_his_akkumulering'],
    misuse: 'Å måle forbruk bare gjennom markedsinnkjøp og dermed overse egenproduksjon, naturalytelser, deling, gjenbruk og ulik fordeling i husholdet.'
  },
  con_his_global: {
    label: 'global økonomi',
    definition: 'Langdistanse økonomiske forbindelser som kobler flere regioner og jurisdiksjoner gjennom varestrømmer, kapital, arbeid, informasjon og institusjoner, uten nødvendigvis å omfatte hele verden.',
    concept_type: 'global_economy_concept',
    broader_concepts: ['con_his_okonomi'],
    related_concepts: ['con_his_global_arbeidsdeling', 'con_his_handel', 'con_his_avhengighet'],
    distinguish_from: ['con_his_markedsintegrasjon'],
    misuse: 'Å kalle en forbindelse global bare fordi den er internasjonal, uten å dokumentere rekkevidde, mellomledd, geografisk kobling og systemvirkning.'
  },
  con_his_global_arbeidsdeling: {
    label: 'global arbeidsdeling',
    definition: 'Geografisk spesialisering av utvinning, produksjon, transport og tjenester som bindes sammen i grensekryssende produksjons- og varekjeder.',
    concept_type: 'global_division_of_labour_concept',
    broader_concepts: ['con_his_arbeidsdeling'],
    related_concepts: ['con_his_ravarer', 'con_his_handel', 'con_his_avhengighet'],
    distinguish_from: ['con_his_markedsintegrasjon'],
    misuse: 'Å utlede global arbeidsdeling av handelsvolum alene uten å vise geografisk spesialisering, kontroll, verdifordeling og sammenkoblede produksjonsledd.'
  },
  con_his_handel: {
    label: 'handel',
    definition: 'Utveksling av varer, tjenester og kreditt gjennom markeder og nettverk, formet av pris, transport, rettigheter, makt og gjensidighet.',
    concept_type: 'exchange_system_concept',
    broader_concepts: ['con_his_okonomi'],
    related_concepts: ['con_his_markeder', 'con_his_nettverk', 'con_his_sjofart'],
    distinguish_from: ['con_his_markedsintegrasjon'],
    misuse: 'Å framstille handel som et automatisk likeverdig møte uten å analysere jurisdiksjon, skatt, markedsmakt, tvang og ulik kildeproduksjon.'
  },
  con_his_infrastruktur: {
    label: 'infrastruktur',
    definition: 'Varige fysiske, tekniske og organisatoriske systemer som muliggjør transport, energi, kommunikasjon, vannforsyning, betaling eller annen samordnet økonomisk aktivitet.',
    concept_type: 'sociotechnical_system_concept',
    broader_concepts: ['con_his_teknologi'],
    related_concepts: ['con_his_offentlig', 'con_his_markedsintegrasjon', 'con_his_standarder'],
    distinguish_from: ['con_his_kapital'],
    misuse: 'Å redusere infrastruktur til enkeltbygg uten å undersøke nettverk, drift, vedlikehold, tilgang, standarder og institusjonelt eierskap.'
  },
  con_his_jordbruk: {
    label: 'jordbruk',
    definition: 'Dyrking og husdyrhold organisert gjennom bestemte bruks- og eiendomsrettigheter, arbeidsformer, økologiske vilkår, teknologi og markedsforbindelser.',
    concept_type: 'agrarian_economy_concept',
    broader_concepts: ['con_his_ressursokonomi'],
    related_concepts: ['con_his_eiendom', 'con_his_arbeidsdeling', 'con_his_handel'],
    distinguish_from: ['con_his_fiske'],
    misuse: 'Å bruke jordbruk som synonym for alt ruralt liv uten å skille mellom produksjonsformer, eiendomsregimer, husholdsarbeid og markedsorientering.'
  },
  con_his_kapital: {
    label: 'kapital',
    definition: 'Eiendeler eller økonomiske krav som kontrolleres og settes inn for å skape framtidig inntekt, avkastning eller produksjonsmakt.',
    concept_type: 'capital_relations_concept',
    broader_concepts: ['con_his_okonomi'],
    related_concepts: ['con_his_akkumulering', 'con_his_kreditt', 'con_his_eiendom'],
    distinguish_from: ['con_his_penger'],
    misuse: 'Å bruke kapital som synonym for penger eller formue uten å vise hvordan ressursen kontrolleres, investeres og forventes å gi avkastning.'
  },
  con_his_kommersielle: {
    label: 'kommersielle nettverk',
    definition: 'Varige forbindelser mellom kjøpmenn, produsenter, transportører, kreditorer, agenter og myndigheter som flytter varer, informasjon, betaling og risiko.',
    concept_type: 'commercial_network_concept',
    broader_concepts: ['con_his_nettverk'],
    related_concepts: ['con_his_handel', 'con_his_sjofart', 'con_his_kreditt'],
    distinguish_from: ['con_his_markeder'],
    misuse: 'Å kalle en enkelt handelstransaksjon et kommersielt nettverk uten å dokumentere gjentakelse, relasjoner, informasjonsflyt og institusjonell varighet.'
  },
  con_his_konjunktur: {
    label: 'konjunktur',
    definition: 'En avgrenset økonomisk situasjon preget av samtidige bevegelser i produksjon, handel, kreditt, sysselsetting eller priser over kort eller mellomlang tid.',
    concept_type: 'business_cycle_phase_concept',
    broader_concepts: ['con_his_okonomi'],
    related_concepts: ['con_his_pris', 'con_his_markeder', 'con_his_kriser'],
    distinguish_from: ['con_his_kriser'],
    misuse: 'Å forklare enhver lokal endring med konjunkturen uten å identifisere periode, indikatorer, geografisk nivå og overføringsmekanisme.'
  },
  con_his_konjunkturer: {
    label: 'konjunktursvingninger',
    definition: 'Sekvenser av oppgang, stagnasjon og nedgang som kan observeres i flere økonomiske indikatorer, men som varierer i styrke, varighet og geografisk gjennomslag.',
    concept_type: 'business_cycle_dynamics_concept',
    broader_concepts: ['con_his_konjunktur'],
    related_concepts: ['con_his_kriser', 'con_his_priser', 'con_his_global_arbeidsdeling'],
    distinguish_from: ['con_his_kriser'],
    misuse: 'Å anta regelmessige eller identiske økonomiske sykluser uten sammenlignbare tidsserier og uten å undersøke strukturelle brudd.'
  },
  con_his_kreditt: {
    label: 'kreditt',
    definition: 'En utsatt betalingsforpliktelse eller et økonomisk krav basert på tillit, sikkerhet, omdømme og håndhevingsordninger.',
    concept_type: 'credit_relation_concept',
    broader_concepts: ['con_his_finans'],
    related_concepts: ['con_his_penger', 'con_his_bank', 'con_his_kapital'],
    distinguish_from: ['con_his_skatt'],
    misuse: 'Å lese kreditt som et formelt banklån alene og overse varekreditt, personlige nettverk, pant, gjeldsbøker og uformell håndheving.'
  },
  con_his_kriser: {
    label: 'økonomiske kriser',
    definition: 'Akutte og omfattende forstyrrelser i betalinger, kreditt, produksjon, handel, matforsyning, sysselsetting eller offentlige finanser som overskrider ordinær konjunkturvariasjon.',
    concept_type: 'economic_crisis_concept',
    broader_concepts: ['con_his_okonomi'],
    related_concepts: ['con_his_konjunktur', 'con_his_kreditt', 'con_his_priser'],
    distinguish_from: ['con_his_konjunkturer'],
    misuse: 'Å kalle enhver nedgang en krise uten å dokumentere bruddmekanismer, omfang, samtidens kategorisering og sosial fordeling av virkningene.'
  },
  con_his_levestandard: {
    label: 'levestandard',
    definition: 'Tilgangen enkeltpersoner og hushold har til materielle ressurser og livsbetingelser, undersøkt gjennom blant annet realinntekt, priser, ernæring, bolig, helse og arbeidstid.',
    concept_type: 'living_standard_concept',
    broader_concepts: ['con_his_okonomi'],
    related_concepts: ['con_his_forbruk', 'con_his_priser', 'con_his_produktivitet'],
    distinguish_from: ['con_his_produktivitet'],
    misuse: 'Å slutte fra gjennomsnittsinntekt eller BNP til levestandard uten å kontrollere priser, fordeling, husholdsstørrelse, arbeidstid og ikke-markedsbaserte ressurser.'
  },
  con_his_markeder: {
    label: 'markeder',
    definition: 'Institusjonaliserte arenaer og relasjoner der varer, tjenester, arbeid eller økonomiske krav utveksles og priser dannes under bestemte regler, informasjonsvilkår og maktforhold.',
    concept_type: 'market_institution_concept',
    broader_concepts: ['con_his_okonomi'],
    related_concepts: ['con_his_handel', 'con_his_pris', 'con_his_nettverk'],
    distinguish_from: ['con_his_markedsintegrasjon'],
    misuse: 'Å anta at et marked er fritt, konkurransepreget eller fysisk samlet uten å undersøke regulering, tilgang, monopol, kreditt og tvang.'
  },
  con_his_markedsintegrasjon: {
    label: 'markedsintegrasjon',
    definition: 'Prosessen der prisbevegelser, varestrømmer og forsyningsendringer i ett marked får systematiske virkninger i andre markeder gjennom transport, informasjon, institusjoner og betalingsordninger.',
    concept_type: 'market_integration_concept',
    broader_concepts: ['con_his_markeder'],
    related_concepts: ['con_his_pris', 'con_his_handel', 'con_his_infrastruktur'],
    distinguish_from: ['con_his_global'],
    misuse: 'Å bruke samtidig handel eller like prisnivåer som tilstrekkelig bevis på integrasjon uten tidsserier, transaksjonskostnader og reaksjon på sjokk.'
  },
  con_his_materielle: {
    label: 'materielle standarder',
    definition: 'Historisk spesifikke nivåer og normer for bolig, ernæring, klær, redskaper, energi, transport og annen materiell utrustning i hverdags- og produksjonsliv.',
    concept_type: 'material_standard_concept',
    broader_concepts: ['con_his_standarder'],
    related_concepts: ['con_his_levestandard', 'con_his_teknologi', 'con_his_infrastruktur'],
    distinguish_from: ['con_his_produktivitet'],
    misuse: 'Å behandle materielle standarder som én universell framstegsskala uten å spesifisere behov, kvalitet, tilgang, vedlikehold og sosial fordeling.'
  },
  con_his_nettverk: {
    label: 'nettverk',
    definition: 'Varige relasjoner mellom aktører eller knutepunkter som formidler varer, kreditt, informasjon, tillit og tilgang på tvers av formelle organisasjoner og geografiske avstander.',
    concept_type: 'economic_network_concept',
    broader_concepts: ['con_his_handel'],
    related_concepts: ['con_his_kommersielle', 'con_his_sjofart', 'con_his_kreditt'],
    distinguish_from: ['con_his_markeder'],
    misuse: 'Å kalle enhver gruppe aktører et nettverk uten å dokumentere forbindelser, retning, varighet, ressurser og ulik posisjon.'
  },
  con_his_offentlig: {
    label: 'offentlig økonomi',
    definition: 'Myndigheters inntekter, utgifter, gjeld, eiendeler, forsyning og investeringer, samt institusjonene som innkrever, fordeler og kontrollerer ressursene.',
    concept_type: 'public_finance_concept',
    broader_concepts: ['con_his_okonomi'],
    related_concepts: ['con_his_skatt', 'con_his_infrastruktur', 'con_his_penger'],
    distinguish_from: ['con_his_bank'],
    misuse: 'Å redusere offentlig økonomi til vedtatte budsjetter uten å undersøke innkreving, regnskapspraksis, gjeld, naturalytelser og faktisk gjennomføring.'
  },
  con_his_okonomi: {
    label: 'økonomi',
    definition: 'Historisk organisering av produksjon, fordeling, utveksling, forbruk, forsørgelse og forpliktelser mellom hushold, institusjoner, markeder og myndigheter.',
    concept_type: 'economic_system_concept',
    broader_concepts: [],
    related_concepts: ['con_his_handel', 'con_his_forbruk', 'con_his_offentlig'],
    distinguish_from: ['con_his_finans'],
    misuse: 'Å projisere dagens nasjonalregnskap og skillet mellom økonomi og samfunn bakover uten å undersøke samtidens hushold, rettigheter, naturalytelser og moralske ordninger.'
  },
  con_his_penger: {
    label: 'penger',
    definition: 'Sosialt og institusjonelt anerkjente betalingsmidler, regneenheter og verdilagre som muliggjør prissetting og oppgjør, også når fysisk mynt eller sedler ikke skifter hender.',
    concept_type: 'money_system_concept',
    broader_concepts: ['con_his_okonomi'],
    related_concepts: ['con_his_kreditt', 'con_his_bank', 'con_his_pris'],
    distinguish_from: ['con_his_kapital'],
    misuse: 'Å likestille penger med mynter eller kontanter og overse regnepenger, betalingsløfter, valutaomregning og institusjonell tillit.'
  },
  con_his_pris: {
    label: 'pris',
    definition: 'Et konkret bytteforhold for en spesifisert vare, tjeneste eller rettighet på et bestemt sted og tidspunkt, angitt i en bestemt valuta, enhet og kvalitet.',
    concept_type: 'price_observation_concept',
    broader_concepts: ['con_his_markeder'],
    related_concepts: ['con_his_penger', 'con_his_forbruk', 'con_his_handel'],
    distinguish_from: ['con_his_priser'],
    misuse: 'Å sammenligne priser uten å kontrollere valuta, mengdeenhet, kvalitet, sesong, avgifter og sted.'
  },
  con_his_priser: {
    label: 'prisnivå',
    definition: 'Et sammenstilt mønster av priser og prisendringer for flere varer eller tjenester, brukt til å undersøke kjøpekraft, inflasjon og relative kostnader over tid.',
    concept_type: 'price_level_concept',
    broader_concepts: ['con_his_pris'],
    related_concepts: ['con_his_levestandard', 'con_his_forbruk', 'con_his_konjunktur'],
    distinguish_from: ['con_his_pris'],
    misuse: 'Å utlede et generelt prisnivå fra én vare eller en ukontrollert prisliste uten vekting, kvalitet og representativitet.'
  },
  con_his_produktivitet: {
    label: 'produktivitet',
    definition: 'Forholdet mellom målt produksjon og definerte innsatsfaktorer som arbeidstid, jord, energi eller kapital, innen en bestemt prosess og periode.',
    concept_type: 'productivity_measure_concept',
    broader_concepts: ['con_his_okonomi'],
    related_concepts: ['con_his_teknologi', 'con_his_arbeidsdeling', 'con_his_standarder'],
    distinguish_from: ['con_his_levestandard'],
    misuse: 'Å bruke større produksjonsvolum, høyere profitt eller hardere arbeid som direkte bevis på økt produktivitet uten sammenlignbare innsatsmål.'
  },
  con_his_ravarer: {
    label: 'råvareutvinning',
    definition: 'Uttak, fangst eller høsting av lite bearbeidede naturressurser for videre foredling, eksport eller lokal bruk, under bestemte rettighets-, arbeids- og miljøregimer.',
    concept_type: 'raw_material_extraction_concept',
    broader_concepts: ['con_his_ressursokonomi'],
    related_concepts: ['con_his_global_arbeidsdeling', 'con_his_handel', 'con_his_sjofart'],
    distinguish_from: ['con_his_produktivitet'],
    misuse: 'Å behandle råvarer som naturgitte varer uten å analysere utvinningsarbeid, eierskap, kvalitet, transport, foredling og økologiske virkninger.'
  },
  con_his_ressursokonomi: {
    label: 'ressursøkonomi',
    definition: 'Historisk organisering av tilgang til, bruk av og fordeling av fornybare og ikke-fornybare ressurser under økologiske, rettslige, teknologiske og markedsmessige begrensninger.',
    concept_type: 'resource_economy_concept',
    broader_concepts: ['con_his_okonomi'],
    related_concepts: ['con_his_jordbruk', 'con_his_fiske', 'con_his_ravarer'],
    distinguish_from: ['con_his_okonomi'],
    misuse: 'Å omtale naturressurser som økonomisk tilgjengelige uten å undersøke bruksrett, knapphet, reproduksjon, arbeid, teknologi og konflikt.'
  },
  con_his_sjofart: {
    label: 'sjøfart',
    definition: 'Organisert maritim transport og handel gjennom skip, havner, mannskap, fraktavtaler, forsikring, navigasjon og regulering.',
    concept_type: 'maritime_transport_system_concept',
    broader_concepts: ['con_his_handel'],
    related_concepts: ['con_his_nettverk', 'con_his_infrastruktur', 'con_his_kommersielle'],
    distinguish_from: ['con_his_fiske'],
    misuse: 'Å bruke sjøfart som synonym for skip eller sjøkrig uten å analysere frakt, havner, mannskap, ruter, risiko og kommersiell organisering.'
  },
  con_his_skatt: {
    label: 'skatt',
    definition: 'En pliktig overføring av penger, naturalia eller arbeid til en myndighet, fastsatt og håndhevet gjennom et historisk skatte- og forvaltningsregime.',
    concept_type: 'taxation_concept',
    broader_concepts: ['con_his_offentlig'],
    related_concepts: ['con_his_infrastruktur', 'con_his_penger', 'con_his_eiendom'],
    distinguish_from: ['con_his_kreditt'],
    misuse: 'Å likestille skatt med avgift, leie, tiende eller tilfeldig tvang uten å undersøke kravgrunnlag, mottaker, beregning og håndheving.'
  },
  con_his_standarder: {
    label: 'standarder',
    definition: 'Avtalte eller påtvungne spesifikasjoner for mål, kvalitet, kompatibilitet, sikkerhet eller arbeidsprosess som gjør varer, systemer og vurderinger sammenlignbare.',
    concept_type: 'technical_standard_concept',
    broader_concepts: ['con_his_teknologi'],
    related_concepts: ['con_his_materielle', 'con_his_pris', 'con_his_produktivitet'],
    distinguish_from: ['con_his_levestandard'],
    misuse: 'Å behandle standarder som nøytrale tekniske løsninger uten å undersøke hvem som fastsatte dem, hvem som bar kostnadene og hvilke alternativer som ble utelukket.'
  },
  con_his_teknologi: {
    label: 'teknologi',
    definition: 'Materiell og organisatorisk kunnskap som er innbygget i redskaper, prosesser, infrastrukturer og ferdigheter, og som virker sammen med arbeid, institusjoner og ressurser.',
    concept_type: 'technology_system_concept',
    broader_concepts: [],
    related_concepts: ['con_his_produktivitet', 'con_his_infrastruktur', 'con_his_standarder'],
    distinguish_from: ['con_his_kapital'],
    misuse: 'Å forklare økonomisk endring med en teknologis eksistens alene uten å undersøke innføring, ferdigheter, kostnader, vedlikehold og institusjonelle komplementer.'
  }
};

const theoryContent = {
  theory_his_okonomi_handel_markeder_og_markedsintegrasjon: {
    definition: 'Forklarer hvordan transport, informasjon, betalingsmidler, rettsregler og håndhevingsordninger kan koble tidligere adskilte markeder slik at priser, varestrømmer og forsyningssjokk påvirker hverandre.',
    limitations: [
      'Prislikhet eller samtidig handel beviser ikke markedsintegrasjon; analysen krever reaksjoner over tid og kontroll for kvalitet, valuta og transportkostnader.',
      'Bevarte prisserier er ofte selektive og kan dekke offentlige innkjøp, enkelte byer eller bestemte varekvaliteter framfor hele markedet.',
      'Større integrasjon kan sameksistere med monopol, tvang, regionale skiller og utestenging av bestemte produsenter eller forbrukere.'
    ],
    source_requirements: [
      'sammenlignbare tidsserier for priser, mengder, frakt, valuta og transaksjonskostnader fra minst to markeder',
      'institusjonelle kilder om regulering, kommunikasjon, transport og håndheving som kan forklare den observerte koblingen'
    ]
  },
  theory_his_okonomi_handel_handel_sjofart_og_kommersielle_nettverk: {
    definition: 'Analyserer hvordan ruter, havner, fraktkapasitet, kjøpmannsnettverk, kreditt, forsikring og jurisdiksjon organiserer vareflyt og fordeler risiko og fortjeneste mellom aktører.',
    limitations: [
      'Tollister, skipsmanifest og havneprotokoller fanger først og fremst registrert handel og kan undervurdere kystfart, smugling, egenforsyning og uformelle nettverk.',
      'En dokumentert rute eller kontakt viser ikke at forbindelsen var kontinuerlig, lønnsom eller like viktig for alle ledd.',
      'Handelsvolum kan ikke alene brukes som mål på lokal verdiskaping, makt eller sosial virkning uten kostnads- og fordelingsdata.'
    ],
    source_requirements: [
      'fraktbrev, toll- og havneprotokoller, regnskaper, korrespondanse, forsikring og skipsdata som kan rekonstruere ruter og aktørkjeder',
      'kontrollkilder om priser, kostnader, tap, kreditt og lokale virkninger i både avsender- og mottakerområder'
    ]
  },
  theory_his_okonomi_handel_penger_kreditt_bank_og_finans: {
    definition: 'Forklarer hvordan regneenheter, betalingsmidler, kreditt, sikkerhet, banker og finansielle instrumenter skaper likviditet, flytter kjøpekraft over tid og fordeler risiko mellom aktører.',
    limitations: [
      'Lovlig betalingsmiddel eller utstedt valuta dokumenterer ikke faktisk bruk, omløpshastighet, tillit eller geografisk dekning.',
      'Nominelle summer må omregnes med samtidige valuta-, pris- og enhetsforhold før de kan sammenlignes over tid.',
      'Bankarkiver og formelle kontrakter kan gjøre husholdskreditt, varekreditt, personlige lån og mislighold uten rettssak usynlig.'
    ],
    source_requirements: [
      'kontobøker, gjeldsbrev, panteprotokoller, bankbalanser, betalingsmidler og valutakurser som viser konkrete finansielle relasjoner',
      'kilder til håndheving, mislighold, renter, sikkerhet og uformell kreditt som prøver institusjonenes egne framstillinger'
    ]
  },
  theory_his_okonomi_handel_eiendom_kapital_og_akkumulering: {
    definition: 'Undersøker hvordan eiendomsrett, arv, gjeld, overskudd, reinvestering og ekspropriasjon gjør ressurser om til kapital og konsentrerer eller sprer økonomisk kontroll over tid.',
    limitations: [
      'Formell eiendomstittel er ikke det samme som faktisk bruk, inntekt, beslutningsmakt eller sikker kontroll over ressursen.',
      'Formue er ikke automatisk produktiv kapital; analysen må vise hvordan eiendelen ble satt inn for framtidig avkastning eller makt.',
      'Akkumulering kan bygge på tvang, kolonisering, ubetalt arbeid og offentlige privilegier og må ikke framstilles som sparing alene.'
    ],
    source_requirements: [
      'skjøter, skifter, pantebøker, selskapsregnskaper, investeringer og inntektsstrømmer som følger eierskap og reinvestering over tid',
      'kilder om arbeid, gjeld, ekspropriasjon, privilegier og tap som viser hvordan akkumuleringen påvirket andre aktører'
    ]
  },
  theory_his_okonomi_handel_jordbruk_fiske_og_ressursokonomi: {
    definition: 'Forklarer ressursbasert økonomi gjennom samspillet mellom økologi, sesong, bruks- og eiendomsrett, arbeidsorganisering, teknologi, foredling, marked og offentlig regulering.',
    limitations: [
      'Produksjonsanslag er ofte usikre fordi egenforbruk, uregistrert fangst, tap, kvalitet og skiftende måleenheter mangler i kildene.',
      'Endringer i avling eller fangst kan skyldes både økologi, teknologi, arbeidskraft, rettigheter og marked og må ikke gis én automatisk årsak.',
      'Husholdsproduksjon og kvinners, barns eller sesongarbeideres innsats er ofte svakere registrert enn kommersielle leveranser og eierskap.'
    ],
    source_requirements: [
      'jordebøker, fangst- og avlingsdata, bruksrettigheter, redskaper, arbeidsregnskap, vær- og bestandskilder med eksplisitte måleenheter',
      'lokale og husholdsnære kilder som kan kontrollere offentlige eller kommersielle produksjonsserier'
    ]
  },
  theory_his_okonomi_handel_skatt_offentlig_okonomi_og_infrastruktur: {
    definition: 'Analyserer hvordan myndigheter mobiliserer skatt, avgifter, gjeld og naturalytelser og omsetter dem i administrasjon, forsyning, investering, vedlikehold og infrastruktur med ulik geografisk og sosial virkning.',
    limitations: [
      'Budsjettbevilgning dokumenterer ikke at midlene ble innkrevd, utbetalt, brukt som planlagt eller omsatt i varig tjeneste.',
      'Samlede skatteinntekter skjuler hvem som bar byrden, hvilke unntak som gjaldt og hvordan naturalia og tvangsarbeid ble verdsatt.',
      'Infrastrukturens nytte og kostnader fordeles ulikt og kan ikke vurderes bare gjennom anleggssum, lengde eller trafikkvolum.'
    ],
    source_requirements: [
      'skattelister, budsjetter, regnskaper, gjeld, kontrakter, anleggs- og vedlikeholdsdata som følger ressursene fra innkreving til bruk',
      'lokale kilder om betaling, tilgang, ekspropriasjon, arbeidsplikt og faktisk tjenestekvalitet'
    ]
  },
  theory_his_okonomi_handel_forbruk_priser_og_levestandard: {
    definition: 'Rekonstruerer materielle livsvilkår ved å sammenholde lønn og inntekter med priser, husholdsbudsjett, egenproduksjon, bolig, ernæring, arbeidstid, helse og tilgang til varer og tjenester.',
    limitations: [
      'Forbrukskurver og prisindekser avhenger av hvilke varer, kvaliteter, vekter og husholdstyper som velges og kan ikke brukes som universelle mål.',
      'Gjennomsnitt skjuler forskjeller etter klasse, kjønn, alder, region og fordeling av ressurser innad i husholdet.',
      'Markedsdata undervurderer egenproduksjon, naturalytelser, offentlige tjenester, knapphet, kø og kvalitetsendringer.'
    ],
    source_requirements: [
      'sammenlignbare lønns-, pris-, budsjett-, bolig-, ernærings- og arbeidstidsdata med dokumenterte enheter og varekvaliteter',
      'husholdsnære og fordelingsfølsomme kilder som kan prøve representativiteten i aggregerte serier'
    ]
  },
  theory_his_okonomi_handel_kriser_konjunkturer_og_global_arbeidsdeling: {
    definition: 'Forklarer hvordan sjokk og konjunkturskifter forplanter seg gjennom kreditt, etterspørsel, priser, produksjon, sysselsetting og grensekryssende forsyningskjeder, med ulike lokale tidsforløp og konsekvenser.',
    limitations: [
      'Datering og årsaksretning i økonomiske kriser er ofte omstridt; samtidige fall i flere indikatorer etablerer ikke alene en felles utløsende mekanisme.',
      'Krise er også en aktørkategori som kan brukes politisk, og forskeren må skille samtidens språk fra analytiske terskler.',
      'Globale sjokk virker ulikt etter næringsstruktur, gjeld, politikk, husholdsressurser og alternative markeder og kan ikke gis ett nasjonalt forløp.'
    ],
    source_requirements: [
      'daterte serier for kreditt, priser, handel, produksjon, konkurser og sysselsetting som kan teste rekkefølge og spredning',
      'lokale og sektorvise kilder som viser overføringsmekanismer, politiske inngrep og ulik sosial virkning'
    ]
  },
  theory_his_okonomi_handel_teknologi_produktivitet_og_materielle_standarder: {
    definition: 'Undersøker hvordan redskaper, energi, organisasjon, ferdigheter og standardisering endrer forholdet mellom innsats, produksjon, kvalitet og materiell utrustning, og hvilke komplementære institusjoner teknologien krever.',
    limitations: [
      'Produktivitetsmål endres med definisjonen av produksjon, arbeidstid, kapital, kvalitet og energi og må harmoniseres før sammenligning.',
      'Økt produktivitet gir ikke automatisk høyere lønn, kortere arbeidstid, bedre miljø eller bredere materiell tilgang.',
      'En oppfinnelsesdato dokumenterer ikke spredning eller virkning; kostnader, ferdigheter, vedlikehold, standarder og organisasjon kan forsinke bruken.'
    ],
    source_requirements: [
      'produksjons- og innsatsdata, tekniske beskrivelser, energibruk, arbeidsorganisering og kvalitetsmål før og etter konkret innføring',
      'kilder om investering, ferdigheter, reparasjon, standardisering, arbeidsvilkår og fordeling av gevinstene'
    ]
  },
  theory_his_okonomi_handel_global_arbeidsdeling_ravarer_og_avhengighet: {
    definition: 'Analyserer hvordan råvareutvinning, produksjonsledd, transport, kapital, teknologi og markedsadgang bindes sammen i grensekryssende kjeder som fordeler risiko, verdi og beslutningsmakt ulikt.',
    limitations: [
      'Avhengighet er ikke en automatisk eller uforanderlig følge av råvareeksport; alternativer, lokal kontroll, diversifisering og politisk handlekraft må undersøkes.',
      'Nasjonale handels- og inntektstall kan skjule store forskjeller mellom regioner, grupper, selskaper og ledd i varekjeden.',
      'En varekjede må rekonstrueres konkret; geografisk samvariasjon eller samtidige prisendringer viser ikke alene kontroll og verdioverføring.'
    ],
    source_requirements: [
      'kontrakter, selskaps- og handelsdata, eierskap, priser, frakt, foredling og kapitalstrømmer fra flere ledd i samme varekjede',
      'lokale kilder om arbeid, miljø, skatteinntekter, forhandling, omstilling og alternative markeder'
    ]
  }
};

const concepts = readJson(conceptsPath);
const theories = readJson(theoriesPath);
const emner = readJson(emnerPath);
const domainConcepts = concepts.filter(belongsToDomain);
const domainTheories = theories.filter(belongsToDomain);
if (domainConcepts.length !== 36) throw new Error(`Forventet 36 begreper, fant ${domainConcepts.length}`);
if (domainTheories.length !== 10) throw new Error(`Forventet 10 teorier, fant ${domainTheories.length}`);

let conceptsCurated = 0;
let sharedConceptsPreserved = 0;
for (const concept of domainConcepts) {
  const authored = conceptContent[concept.concept_id];
  if (!authored) throw new Error(`Mangler kurateringsinnhold for ${concept.concept_id}`);
  if (isCurated(concept)) {
    sharedConceptsPreserved += 1;
    continue;
  }
  Object.assign(concept, {
    label: authored.label,
    definition: authored.definition,
    concept_type: authored.concept_type,
    historical_scope: concept.historical_scope || 'cross_period_context_dependent',
    broader_concepts: unique(authored.broader_concepts),
    related_concepts: unique(authored.related_concepts),
    distinguish_from: unique(authored.distinguish_from),
    common_misuse: [authored.misuse],
    indicators: [
      `daterte kilder som viser ${authored.label} i konkret praksis`,
      'identifiserbare aktører, institusjoner og geografisk rekkevidde',
      'sammenlignbare mål, enheter eller relasjoner over tid'
    ],
    source_requirements: [
      `minst én samtidig kilde som dokumenterer ${authored.label} med tid, sted og aktør`,
      'minst én uavhengig kontrollkilde som kan prøve omfang, virkning eller avgrensning'
    ],
    status: 'canonical_v5_5_curated'
  });
  conceptsCurated += 1;
}
if (conceptsCurated !== 28 || sharedConceptsPreserved !== 8) {
  throw new Error(`Forventet 28 kuraterte og 8 bevarte begreper, fikk ${conceptsCurated} og ${sharedConceptsPreserved}`);
}

for (const theory of domainTheories) {
  const authored = theoryContent[theory.theory_id];
  if (!authored) throw new Error(`Mangler teoriinnhold for ${theory.theory_id}`);
  Object.assign(theory, {
    definition: authored.definition,
    limitations: authored.limitations,
    source_requirements: authored.source_requirements,
    status: 'canonical_v5_5_curated'
  });
}
if (new Set(domainTheories.map((item) => item.definition)).size !== 10 ||
    new Set(domainTheories.map((item) => JSON.stringify(item.limitations))).size !== 10) {
  throw new Error('Teoriobjektene har ikke unike definisjoner og begrensningsprofiler');
}

const emneIds = [
  'em_his_okonomi_handel_markeder_og_markedsintegrasjon',
  'em_his_okonomi_handel_handel_sjofart_og_kommersielle_nettverk',
  'em_his_okonomi_handel_penger_kreditt_bank_og_finans',
  'em_his_okonomi_handel_eiendom_kapital_og_akkumulering',
  'em_his_okonomi_handel_jordbruk_fiske_og_ressursokonomi',
  'em_his_okonomi_handel_skatt_offentlig_okonomi_og_infrastruktur',
  'em_his_okonomi_handel_forbruk_priser_og_levestandard',
  'em_his_okonomi_handel_kriser_konjunkturer_og_global_arbeidsdeling',
  'em_his_okonomi_handel_teknologi_produktivitet_og_materielle_standarder',
  'em_his_okonomi_handel_global_arbeidsdeling_ravarer_og_avhengighet'
];
const targetEmner = emneIds.map((id) => emner.find((item) => item.emne_id === id));
if (targetEmner.some((item) => !item)) {
  throw new Error(`Mangler emner: ${emneIds.filter((id, index) => !targetEmner[index]).join(', ')}`);
}
const labelRenames = new Map([
  ['global', 'global økonomi'],
  ['kommersielle', 'kommersielle nettverk'],
  ['konjunkturer', 'konjunktursvingninger'],
  ['kriser', 'økonomiske kriser'],
  ['materielle', 'materielle standarder'],
  ['offentlig', 'offentlig økonomi'],
  ['priser', 'prisnivå'],
  ['råvarer', 'råvareutvinning']
]);
let emneTokenCorrections = 0;
for (const emne of targetEmner) {
  for (const field of ['core_concepts', 'sub_concepts']) {
    if (!Array.isArray(emne[field])) continue;
    emne[field] = emne[field].map((label) => {
      const replacement = labelRenames.get(label);
      if (!replacement) return label;
      emneTokenCorrections += 1;
      return replacement;
    });
    emne[field] = unique(emne[field]);
  }
}

writeJson(conceptsPath, concepts);
writeJson(theoriesPath, theories);
writeJson(emnerPath, emner);

run('node', ['tools/validate-historie-v5.mjs', '--write']);
run('node', ['tools/validate-historie-okonomi-handel-materielle-systemer.mjs']);
run('npm', ['run', 'knowledge:canonical:write']);
run('npm', ['run', 'knowledge:canonical:check']);
run('npm', ['run', 'knowledge:legacy:check']);

function collectJsonFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectJsonFiles(full);
    return entry.name.endsWith('.json') ? [full] : [];
  });
}
const needles = [
  ...domainConcepts.map((item) => item.concept_id),
  ...domainTheories.map((item) => item.theory_id),
  ...emneIds
];
const contextRoot = path.join(root, 'data', 'quiz', 'production_context');
const affectedContexts = new Set();
for (const file of collectJsonFiles(contextRoot)) {
  const raw = fs.readFileSync(file, 'utf8');
  if (needles.some((needle) => raw.includes(needle))) affectedContexts.add(file);
}
affectedContexts.add(path.join(contextRoot, 'by', 'deichman_bjorvika.json'));
for (const file of [...affectedContexts].sort()) {
  const relative = path.relative(contextRoot, file).split(path.sep);
  if (relative.length !== 2) throw new Error(`Uventet quizkontekststi: ${file}`);
  const category = relative[0];
  const targetId = path.basename(relative[1], '.json');
  run('node', [
    'scripts/build-quiz-production-context.mjs',
    '--category', category,
    '--target', targetId,
    '--output', path.relative(root, file)
  ]);
}
run('npm', ['run', 'audit:quiz-production-context']);
run('npm', ['run', 'audit:quiz-progression']);
run('npm', ['run', 'audit:quiz-theory-binding']);
run('git', ['diff', '--check']);

const readiness = readJson('reports/historie-v5/historie-v5-5-readiness.json');
const domain = readiness.domains.find((item) => item.domain_id === domainId);
if (!domain?.coverage_complete || !domain?.freeze_ready ||
    domain.issue_counts?.emner !== 0 || domain.issue_counts?.concepts !== 0 || domain.issue_counts?.theories !== 0) {
  throw new Error(`Økonomidomenet er ikke fryseklart: ${JSON.stringify(domain, null, 2)}`);
}
const previouslyFrozen = [
  'his_tid_periodisering',
  'his_kilder_arkiv_spor',
  'his_makt_stat_institusjoner',
  'his_kjonn_familie_livslop',
  'his_religion_reformasjon_livssyn',
  'his_samisk_urfolkshistorie',
  'his_miljo_klima_landskap',
  'his_vitenskap_teknologi_kunnskap',
  'his_global_kolonial_transnasjonal'
];
for (const frozenDomainId of previouslyFrozen) {
  const frozen = readiness.domains.find((item) => item.domain_id === frozenDomainId);
  if (!frozen?.freeze_ready) throw new Error(`Tidligere frosset domene gikk tilbake: ${frozenDomainId}`);
}
const freezeReadyDomains = readiness.domains.filter((item) => item.freeze_ready).length;
if (freezeReadyDomains !== 10) throw new Error(`Forventet 10 fryseklare domener, fant ${freezeReadyDomains}`);

const result = {
  version: 'historie-v5.5-okonomi-handel-materielle-systemer-curation-1',
  generated_at: new Date().toISOString(),
  domain_id: domainId,
  status: 'CURATED_FREEZE_READY',
  concepts_in_domain: domainConcepts.length,
  concepts_curated: conceptsCurated,
  curated_shared_concepts_preserved: sharedConceptsPreserved,
  theories_curated: domainTheories.length,
  emner_reviewed: targetEmner.length,
  emne_token_corrections: emneTokenCorrections,
  quiz_contexts_regenerated: [...affectedContexts].map((file) => path.relative(root, file)),
  domain_readiness: domain,
  freeze_ready_domains: freezeReadyDomains,
  global_quality_issue_totals: readiness.quality_issue_totals,
  global_v6_allowed: readiness.v6_allowed
};
writeJson(path.relative(root, resultPath), result);
const validation = [
  'Historie V5.5 – Økonomi, handel og materielle systemer',
  'Status: CURATED_FREEZE_READY',
  `Begreper i domenet: ${domainConcepts.length}`,
  `Begreper kuratert i batchen: ${conceptsCurated}`,
  `Allerede kuraterte fellesbegreper bevart: ${sharedConceptsPreserved}`,
  `Teoriobjekter individuelt kuratert: ${domainTheories.length}`,
  `Emner gjennomgått: ${targetEmner.length}`,
  `Emnetoken korrigert: ${emneTokenCorrections}`,
  `Quizkontekster regenerert: ${affectedContexts.size}`,
  `Fryseklare domener totalt: ${freezeReadyDomains}/20`,
  `Resterende kvalitetsfeil: begreper=${readiness.quality_issue_totals.concepts}, teorier=${readiness.quality_issue_totals.theories}, emner=${readiness.quality_issue_totals.emner}`,
  `Global V6 tillatt: ${readiness.v6_allowed}`
].join('\n');
fs.writeFileSync(validationPath, `${validation}\n`);
console.log(validation);
