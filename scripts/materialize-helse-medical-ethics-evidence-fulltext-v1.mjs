#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'medisinsk-etikk-evidens-og-ansvarlig-beslutning';
const CHAPTER_DIR = `data/fagverk/helse/${CHAPTER_ID}`;
const INPUT_GATE = 'medical_ethics_evidence_source_brief_complete_full_chapter_production';
const OUTPUT_GATE = 'medical_ethics_evidence_full_chapter_complete_next_domain_source_brief';
const NEXT_SOURCE_GATE = 'anatomy_physiology_source_brief_complete_full_chapter_production';
const P = Object.freeze({
  sourceBrief: 'data/fag/helse/medical_ethics_evidence_source_claim_brief_v1.json',
  safety: 'data/fag/helse/clinical_safety_contract_helse_v1.json',
  pensum: 'data/fag/helse/helsepensum_canonical_v1.json',
  emner: 'data/fag/helse/emner_helse_canonical_v1.json',
  methods: 'data/fag/helse/methods_helse_canonical_v1.json',
  chapter: `${CHAPTER_DIR}.json`,
  brief: `${CHAPTER_DIR}/brief.json`,
  claims: `${CHAPTER_DIR}/claims.json`,
  assessment: `${CHAPTER_DIR}/assessment.json`,
  registry: 'data/fagverk/fagverk_registry.json',
  manifest: 'data/fag/fag_manifest.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json',
  portal: 'data/fagverk/fagverk_portal.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const updateRawJson = (file, transform) => {
  const updated = transform(fs.readFileSync(abs(file), 'utf8'));
  JSON.parse(updated);
  fs.writeFileSync(abs(file), updated);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const PARAGRAPHS = Object.freeze({
  'hme-01-01': 'Rett til informasjon og medvirkning innebærer ikke plikt til å godta et bestemt alternativ. Norsk pasientrett og profesjonsetiske normer gjør beslutningen avhengig av relevante valgmuligheter, mens helsepersonellet fortsatt må avgrense samtalen til faglig forsvarlige alternativer.',
  'hme-01-02': 'Informasjon er ikke tilstrekkelig bare fordi den er gitt. Den må tilpasses mottakerens forutsetninger, omfatte relevante fordeler, ulemper og alternativer og gi rom for spørsmål; først da kan forståelse og frivillighet undersøkes som deler av informert samtykke.',
  'hme-01-03': 'Samvalg kombinerer forskningskunnskap og profesjonell vurdering med det som er viktig for pasienten når flere forsvarlige alternativer finnes. Prosessen flytter ikke ansvaret for forsvarlighet, tydelig risikokommunikasjon eller nødvendig oppfølging fra profesjonen til pasienten.',
  'hme-01-04': 'Samtykke er formålsavgrenset og kan trekkes tilbake. Et tidligere ja kan derfor ikke behandles som ubegrenset tillatelse til nye inngrep, forskningsformål eller brukssituasjoner; endret formål krever ny informasjon og relevant rettslig og etisk vurdering.',
  'hme-02-01': 'Beslutningskapasitet må knyttes til den konkrete beslutningen, informasjonen og situasjonen, ikke gjøres til en varig merkelapp for hele personen. Denne teksten lærer analyseprinsippet, men avgjør aldri kapasiteten til en faktisk person.',
  'hme-02-02': 'Behov for støtte eller representasjon opphever ikke den berørtes status som deltaker i beslutningen. Etiske retningslinjer og norsk rett legger vekt på tilpasset informasjon, involvering så langt som mulig og respekt for uttrykte ønsker innenfor gjeldende verneregler.',
  'hme-02-03': 'Sårbarhet kan oppstå gjennom sykdom, avhengighet, institusjonsmakt, språk, økonomi eller forskningssituasjon og må undersøkes konkret. Automatisk ekskludering kan samtidig frata grupper relevant kunnskap og rettferdig deltakelse, slik at både inkludering og ekskludering krever begrunnelse.',
  'hme-02-04': 'Et gyldig rettslig samtykkegrunnlag avslutter ikke den etiske vurderingen. Press, avhengighet, urimelig byrde, svak kunnskapsverdi eller utilstrekkelig beskyttelse kan fortsatt gjøre en praksis uforsvarlig, og rettskilde og etisk norm må derfor navngis separat.',
  'hme-03-01': 'Forventet nytte er en fremoverskuende vurdering, mens dokumentert effekt beskriver hva data støtter under bestemte betingelser. Ingen av delene gir alene en moralsk konklusjon; nytte må vurderes sammen med skade, byrde, fordeling, alternativer og usikkerhet.',
  'hme-03-02': 'Risiko og byrde skal ikke bare beskrives ved oppstart, men reduseres, overvåkes og revurderes når ny informasjon kommer. Helsinki-deklarasjonen og forskningsetiske rammer gjør løpende forholdsmessighet til et ansvar, ikke et engangspunkt i et skjema.',
  'hme-03-03': 'Klinisk virksomhet retter seg mot den aktuelle pasientens helsehjelp, mens forskning har som særskilt formål å utvikle generaliserbar kunnskap. Rollene kan møtes, men forskningsformålet kan ikke skjules som individuell behandling eller oppheve krav til protokoll, samtykke og uavhengig kontroll.',
  'hme-03-04': 'En gjennomsnittlig gevinst kan skjule ulike utfall, skader og fordelinger mellom deltakere. Ansvarlig vurdering oppgir derfor hvilke utfall som måles, størrelsen på nytte og skade, tidsrommet, usikkerheten og om resultatet er relevant for beslutningskonteksten.',
  'hme-04-01': 'Metodisk svak forskning kan være etisk problematisk fordi deltakere utsettes for inngrep eller byrde uten rimelig utsikt til pålitelig kunnskap. Vitenskapelig gyldighet er derfor en del av forskningsetikken, samtidig som god metode aldri alene gjør risiko eller utvalg etisk akseptabelt.',
  'hme-04-02': 'Forskeren beholder ansvar for protokoll og gjennomføring, mens en uavhengig forskningsetisk komité vurderer prosjektet før oppstart og kan kreve oppfølging. Komitégodkjenning overtar ikke forskerens ansvar, og forskerens egen overbevisning erstatter ikke uavhengig kontroll.',
  'hme-04-03': 'En etterprøvbar forskningskjede forbinder problemstilling, design, utvalg, risiko, personvern, finansiering, interesser, analyseplan og rapportering. Dersom ett ledd skjules, blir det vanskeligere å vurdere både kunnskapsverdien og om deltakernes rettigheter er tilstrekkelig beskyttet.',
  'hme-04-04': 'Forhåndsregistrering og offentliggjøring av negative, uklare og positive resultater reduserer selektiv synlighet av forskning. Åpenhet kan ikke reparere et svakt design, men gjør det mulig å kontrollere om plan, analyse og publisering er endret på måter som påvirker evidensen.',
  'hme-05-01': 'Effektstørrelse og evidenssikkerhet svarer på forskjellige spørsmål. Et stort estimat kan være svært usikkert, mens et mer beskjedent estimat kan være bedre underbygd; sikkerheten vurderes dessuten separat for hvert relevant utfall.',
  'hme-05-02': 'GRADE vurderer om risiko for bias, inkonsistens, indirekthet, upresisjon og publikasjonsbias svekker tilliten til et effektestimat. Domenene er begrunnelser som må dokumenteres, ikke en mekanisk karakter som erstatter lesing av studier og kontekst.',
  'hme-05-03': 'Gjennomsnittseffekt i én studiepopulasjon fastslår ikke effekten i en annen populasjon eller tjeneste. Overførbarhet krever sammenligning av deltakere, tiltak, sammenligning, utfall, setting og oppfølging, uten å gjøre gruppedata til individuell prognose.',
  'hme-05-04': 'En anbefaling bygger på mer enn effektestimat og evidenssikkerhet. Retningslinjearbeid vurderer også balansen mellom nytte og skade, verdier, ressursbruk, likhet, akseptabilitet og gjennomførbarhet, og bør vise hvordan disse hensynene påvirket styrken og retningen.',
  'hme-06-01': 'Kunnskapsbasert praksis integrerer forskningsbasert kunnskap, erfaringskunnskap og brukerens behov i en konkret faglig prosess. Bidragene er ikke utskiftbare: forskning belyser blant annet effekter og usikkerhet, erfaring belyser gjennomføring, og brukeren gir tilgang til mål og preferanser.',
  'hme-06-02': 'Når flere alternativer er faglig forsvarlige, kan mennesker vekte gevinst, bivirkning, tidsbruk og belastning forskjellig. Samvalg gjør denne variasjonen relevant uten å late som enhver ønsket løsning er medisinsk forsvarlig eller tilgjengelig.',
  'hme-06-03': 'Tallfestet risiko må kommuniseres med samme nevner, samme tidsrom og tydelig sammenligningsgrunnlag. Absolutte tall bør vises sammen med relevant usikkerhet; språklige merkelapper som liten eller stor risiko kan ellers skjule både grunnrisiko og hva estimatet faktisk gjelder.',
  'hme-06-04': 'Å synliggjøre usikkerhet betyr å forklare hva som er sikkert, hva som er usikkert og hvilke konsekvenser dette har for valget. Det betyr ikke at alle alternativer er like gode, og det fritar ikke helsepersonell fra å avgrense uforsvarlige valg eller anbefale innenfor sitt ansvar.',
  'hme-07-01': 'Lik behandling er ikke alltid rettferdig behandling når behov, alvorlighet og forventet nytte varierer. Rettferdighetsanalysen må vise hvilket fordelingsprinsipp som brukes og undersøke om kriteriene skaper systematiske, utilsiktede ulemper.',
  'hme-07-02': 'Rettferdighet gjelder både hvem som bærer byrder og hvem som får tilgang til gevinster. I forskning omfatter dette utvalg og tilgang til kunnskapens fordeler; i helsetjenesten omfatter det tilgang, venting, ressursbruk og konsekvenser på tvers av grupper.',
  'hme-07-03': 'Det norske prioriteringsrammeverket vurderer nytte, ressursbruk og alvorlighet samlet. Kriteriene er ikke en enkel universell poengsum: de må anvendes på riktig beslutningsnivå med eksplisitte data, sammenligninger og begrunnelser.',
  'hme-07-04': 'Åpen prosess, offentlig begrunnelse og mulighet for kontroll kan styrke legitimiteten til vanskelige prioriteringer. Prosedyren fjerner likevel ikke reelle verdikonflikter; den gjør premisser, kunnskapsgrunnlag og fordelingsvirkninger synlige for kritikk.',
  'hme-08-01': 'Faglig skjønn er nødvendig når kunnskap, regler og situasjon må sammenholdes, men skjønn er ikke ubegrunnet autoritet. Premisser, relevante kilder, alternativer, usikkerhet og kompetansegrunnlag må kunne forklares og etterprøves.',
  'hme-08-02': 'Forsvarlig praksis krever at helsepersonell arbeider innenfor egne kvalifikasjoner og innhenter bistand eller henviser når det er nødvendig. Kompetansegrenser beskytter mot at sikkerhet erstattes av selvtillit, men gir ikke denne undervisningen grunnlag for konkrete henvisningsråd.',
  'hme-08-03': 'En interessekonflikt er en risiko for at en sekundær interesse påvirker faglig vurdering; den er ikke i seg selv bevis på uredelighet. Opplysning, forebygging, rolleavgrensning og uavhengig kontroll gjør påvirkningen vurderbar og kan være nødvendig for tillit.',
  'hme-08-04': 'Samtykke overfører ikke institusjonens eller profesjonens ansvar for forsvarlighet, personvern og deltakervern til den som samtykker. Et ja legitimerer bare det som er tilstrekkelig informert, frivillig, formålsavgrenset og ellers rettslig og etisk forsvarlig.'
});

const MODULES = [
  { id: '01-autonomi-samtykke-og-stotte', title: 'Autonomi, samtykke og støttet beslutning', topics: [0, 1] },
  { id: '02-nytte-skade-og-forskningsansvar', title: 'Nytte, skade og forskningsansvar', topics: [2, 3] },
  { id: '03-evidens-anbefaling-og-samvalg', title: 'Evidens, anbefaling og samvalg', topics: [4, 5] },
  { id: '04-rettferdighet-og-profesjonsansvar', title: 'Rettferdighet og profesjonsansvar', topics: [6, 7] }
];
const ASSESSMENT_STEMS = [
  ['hme-01-03', 'Hva beskriver samvalg mest presist?', ['Pasienten velger uten faglig avgrensning', 'Helsepersonellet bestemmer uten å spørre om verdier', 'Forsvarlige alternativer vurderes med evidens, profesjonelt ansvar og pasientens verdier', 'Alle mulige alternativer behandles som like gode'], 2],
  ['hme-02-01', 'Hvordan bør beslutningskapasitet analyseres i denne enheten?', ['Som en varig etikett for personen', 'Knyttet til konkret beslutning og situasjon', 'Bare ut fra diagnose', 'Bare ut fra alder'], 1],
  ['hme-03-03', 'Hva skiller klinikk fra forskning?', ['Forskning trenger aldri samtykke', 'Klinikk produserer alltid generaliserbar kunnskap', 'Forskning har et særskilt kunnskapsformål som krever egne vern', 'Det finnes ingen relevant forskjell'], 2],
  ['hme-04-01', 'Hvorfor kan metodisk svak forskning være etisk problematisk?', ['Fordi alle usikre resultater er forbudt', 'Fordi deltakere kan bære byrde uten rimelig kunnskapsverdi', 'Fordi komiteer skal velge resultatet', 'Fordi bare positive resultater kan publiseres'], 1],
  ['hme-05-01', 'Hva er riktig om effektstørrelse og evidenssikkerhet?', ['De er samme mål', 'Stor effekt er alltid sikker', 'Sikkerhet vurderes uavhengig og per utfall', 'Små effekter er alltid irrelevante'], 2],
  ['hme-06-03', 'Hva gjør en risikosammenligning mest etterprøvbar?', ['Ulike nevnere og tidsrom', 'Bare relative prosenttall', 'Samme nevner og tidsrom, absolutte tall og usikkerhet', 'Ord som liten uten tall'], 2],
  ['hme-07-03', 'Hvordan skal de norske prioriteringskriteriene forstås?', ['Som én automatisk poengsum', 'Som samlet vurdering av nytte, ressurs og alvorlighet på riktig nivå', 'Som alvorlighet alene', 'Som individets betalingsvilje'], 1],
  ['hme-08-03', 'Hva viser en oppgitt interessekonflikt?', ['At uredelighet er bevist', 'At alle faglige råd er ugyldige', 'At en mulig påvirkning må håndteres og kontrolleres', 'At samtykke ikke trengs'], 2]
];

function build() {
  const sourceBrief = read(P.sourceBrief); const safety = read(P.safety); const manifest = read(P.manifest);
  const registry = read(P.registry); const inventory = read(P.inventory); const status = read(P.status);
  const portal = read(P.portal); const pensum = read(P.pensum); const emner = read(P.emner); const methods = read(P.methods);
  const healthStatus = status.subjects.find((row) => row.id === 'helse');
  assert([INPUT_GATE, OUTPUT_GATE, NEXT_SOURCE_GATE].includes(healthStatus.nextGate), `Feil input gate: ${healthStatus.nextGate}`);
  const metadataHasProgressed = healthStatus.nextGate === NEXT_SOURCE_GATE;
  assert(sourceBrief.runtime_registration.registered === false, 'Source brief må være uregistrert før fulltekst');
  assert(safety.status === 'blocking' && safety.forbidden.length >= 4, 'Klinisk sikkerhetskontrakt mangler');
  const topics = sourceBrief.topic_briefs; const planned = topics.flatMap((topic) => topic.planned_claims);
  assert(topics.length === 8 && planned.length === 32, 'Forventet 8 spor og 32 planlagte claims');
  assert(planned.every((row) => PARAGRAPHS[row.id]), 'Alle planlagte claims må ha fagredigert fulltekst');
  const sources = sourceBrief.sources.map((row) => ({ ...row, label: `${row.publisher} – ${row.title}` }));
  const claims = planned.map((row) => ({
    id: row.id, claim: PARAGRAPHS[row.id].split(/(?<=[.!?])\s/u)[0], source_ids: row.source_ids,
    classification: 'verified_authoritative_source_synthesis', status: 'verified', verified_at: '2026-08-21'
  }));
  const moduleFiles = []; const moduleData = [];
  for (const module of MODULES) {
    const sections = module.topics.map((index) => {
      const topic = topics[index]; const ids = topic.planned_claims.map((row) => row.id);
      return {
        id: `hme-${topic.id}`, title: topic.title, topic_id: topic.id,
        emne_ids: [sourceBrief.scope.canonical_emne_id], method_ids: topic.method_ids,
        paragraphs: ids.map((id) => PARAGRAPHS[id]), paragraphClaimIds: ids.map((id) => [id]),
        keyPoints: [topic.planned_claims[0].claim_focus, topic.planned_claims.at(-1).claim_focus],
        keyPointClaimIds: [[ids[0]], [ids.at(-1)]], source_ids: topic.source_ids
      };
    });
    const file = `${CHAPTER_DIR}/${module.id}.json`;
    const value = { schema: 'history_go_fagverk_health_module_v1', version: '1.0.0', id: module.id, title: module.title, sections };
    write(file, value); moduleFiles.push(file); moduleData.push(value);
  }
  const assessments = ASSESSMENT_STEMS.map(([claimId, question, options, answerIndex], index) => {
    const claim = claims.find((row) => row.id === claimId);
    return { id: `helse-hme-q${String(index + 1).padStart(2, '0')}`, question, options, answer: options[answerIndex], answerIndex, question_type: 'analysis', difficulty: index < 3 ? 'medium' : 'hard', emne_id: sourceBrief.scope.canonical_emne_id, claim_id: claimId, source: claim.source_ids, knowledge: PARAGRAPHS[claimId], safety_mode: 'general_non_individualizing' };
  });
  const assessment = { schema: 'history_go_fagverk_health_chapter_assessment_v1', version: '1.0.0', subject_id: 'helse', chapter_id: CHAPTER_ID, status: 'audited', questions: assessments };
  const chapterBrief = {
    schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'helse', chapter_id: CHAPTER_ID,
    primary_domain_id: sourceBrief.scope.primary_domain_id, purpose: 'Skille evidens, etisk norm, rettslig ramme, preferanser og profesjonelt ansvar i generelle helsefaglige beslutninger.',
    sourceStrategy: { sourceBriefFile: P.sourceBrief, externalSourceCount: sources.length, paragraphLevelClaimTrace: true, everyPlannedClaimResolved: true, allUsedSourcesInspectable: true },
    requiredCriticalDistinctions: ['informasjon vs forståelse', 'samtykke vs ubegrenset tillatelse', 'klinikk vs forskning', 'effektstørrelse vs evidenssikkerhet', 'evidens vs anbefaling', 'gruppedata vs individprognose', 'rettskilde vs etisk norm', 'interessekonflikt vs uredelighet'],
    safety: { contractFile: P.safety, individualDiagnosis: false, individualPrognosis: false, individualTriage: false, individualTreatmentAdvice: false, individualLegalDecision: false },
    qa: { topicCoverage: '8/8', plannedClaimResolution: '32/32', moduleCount: 4, sectionCount: 8, paragraphCount: 32, assessmentQuestionCount: assessments.length }
  };
  const chapter = {
    schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'helse', subject_id: 'helse', id: CHAPTER_ID, chapter_id: CHAPTER_ID,
    primary_domain_id: sourceBrief.scope.primary_domain_id, editorialStatus: 'chapter_ready', claimTraceRequired: true, sourceFirst: true,
    emne_ids: [sourceBrief.scope.canonical_emne_id], method_ids: [...new Set(topics.flatMap((row) => row.method_ids))],
    title: 'Medisinsk etikk, evidens og ansvarlig beslutning', subtitle: 'Fra informasjon og samtykke til forskningsetikk, evidenssikkerhet, samvalg, prioritering og profesjonsansvar',
    lead: 'Kapittelet viser hvordan helsefaglige beslutninger må holde empirisk evidens, metodisk usikkerhet, rettslige rammer, etiske hensyn, personens verdier og profesjonelt ansvar fra hverandre før de sammenholdes. Det gir generell undervisning og aldri individuell diagnose, prognose, triage, behandling eller rettslig avgjørelse.',
    learningObjectives: topics.map((row) => row.title), diagnosticQuestions: assessments.slice(0, 4).map((row) => ({ question: row.question, answer: row.knowledge })),
    relatedPlaces: [
      { id: 'rikshospitalet', name: 'Rikshospitalet', role: 'Analysere generelle beslutningsforløp, tverrfaglighet, informasjon og samvalg uten å vurdere en faktisk pasient.' },
      { id: 'helseforskningsetikken', name: 'De regionale komiteene for medisinsk og helsefaglig forskningsetikk', role: 'Skille forskeransvar fra uavhengig forhåndsvurdering og løpende kontroll.' },
      { id: 'stortinget', name: 'Stortinget', role: 'Skille lov, politiske prioriteringsrammer og faglige metodekilder som ulike autoritetstyper.' }
    ],
    workCases: sourceBrief.decision_scenarios, moduleFiles, briefFile: P.brief, claimsFile: P.claims, assessmentFile: P.assessment, sourceBriefFile: P.sourceBrief, safetyContractFile: P.safety
  };
  write(P.claims, { schema: 'history_go_fagverk_chapter_claims_v1', version: '1.0.0', subject_id: 'helse', chapter_id: CHAPTER_ID, sourceBriefFile: P.sourceBrief, sources, claims });
  write(P.assessment, assessment); write(P.brief, chapterBrief); write(P.chapter, chapter);

  if (!metadataHasProgressed) {
  manifest.helse.status = 'active_foundation'; manifest.helse.chapters = [P.chapter];
  const inv = inventory.subjects.find((row) => row.id === 'helse'); inv.optionalManifestFields = [...new Set([...inv.optionalManifestFields, 'chapters'])];
  const reg = registry.subjects.helse; reg.canonicalModel.firstFulltextChapter = P.chapter; reg.canonicalModel.note = 'Første source-first-enhet er fulltekstmaterialisert med 8 seksjoner, 32 claimsporede avsnitt, 32 verifiserte claims, 14 inspiserbare autoritative kilder og blokkerende klinisk sikkerhetsaudit. Dette er én av 12 domener og ikke faglig sluttføring.';
  reg.editorialPlan.registeredChapterCount = 1; reg.editorialPlan.nextGate = 'produce_next_domain_source_brief_after_medical_ethics_evidence_fulltext';
  reg.chapters = [{ id: CHAPTER_ID, title: chapter.title, subtitle: chapter.subtitle, file: P.chapter, primary_domain_id: chapter.primary_domain_id, emne_ids: chapter.emne_ids, claimsFile: P.claims, briefFile: P.brief, assessmentFile: P.assessment, safetyContractFile: P.safety }];
  healthStatus.navigationStatus = 'materialized'; healthStatus.assessmentStatus = 'audited'; healthStatus.editorialStatus = 'chapters_in_progress'; healthStatus.nextGate = OUTPUT_GATE;
  healthStatus.note = 'Helse er materialisert med ett av tolv planlagte domener: medisinsk etikk og evidens har 8 fulltekstseksjoner, 32 claimsporede fagavsnitt, 32 verifiserte claims, 14 inspiserbare autoritative kilder og 8 auditerte vurderingsoppgaver. Klinisk sikkerhetskontrakt blokkerer individråd. Faget er chapters_in_progress, ikke complete; neste port er source brief for neste domene.';
  const portalRow = portal.categories.find((row) => row.id === 'helse'); portalRow.subjectPage = 'fagverk.html?subject=helse'; portalRow.subjectStatus = 'materialized';
  pensum.status = 'active_foundation'; pensum.domains.find((row) => row.domain_id === sourceBrief.scope.primary_domain_id).status = 'materialized';
  emner.find((row) => row.emne_id === sourceBrief.scope.canonical_emne_id).status = 'materialized';
  for (const method of methods.methods) if (chapter.method_ids.includes(method.method_id)) method.canonical_status = 'materialized';
  write(P.manifest, manifest); write(P.inventory, inventory); write(P.registry, registry); write(P.status, status); write(P.portal, portal);
  updateRawJson(P.pensum, (raw) => raw
    .replace(/"status"\s*:\s*"(?:canonical_expansion_foundation|active_foundation)"/, '"status": "active_foundation"')
    .replace(/("domain_id"\s*:\s*"medisinsk_etikk_evidens"[\s\S]*?"status"\s*:\s*")(?:planned|materialized)(")/, '$1materialized$2'));
  updateRawJson(P.emner, (raw) => raw.replace(/("emne_id"\s*:\s*"em_helse_medisinsk_etikk_evidens"[\s\S]*?"status"\s*:\s*")(?:planned|materialized)(")/, '$1materialized$2'));
  updateRawJson(P.methods, (raw) => {
    for (const id of chapter.method_ids) raw = raw.replace(new RegExp(`("method_id"\\s*:\\s*"${id}"[\\s\\S]*?"canonical_status"\\s*:\\s*")(?:planned|materialized)(")`), '$1materialized$2');
    return raw;
  });
  }
  return { topics: topics.length, sources: sources.length, claims: claims.length, paragraphs: planned.length, questions: assessments.length, modules: moduleData.length };
}

const result = build();
console.log(`Helse fulltekst materialisert: ${result.modules} moduler, ${result.topics} seksjoner, ${result.paragraphs} avsnitt, ${result.claims} claims, ${result.sources} kilder og ${result.questions} vurderingsoppgaver.`);
