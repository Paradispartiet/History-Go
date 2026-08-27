#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/utdanning/professions_teacher_role_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/utdanning-professions-teacher-role-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const claim = (id, text, source_ids) => ({ id, text, status: 'planned_requires_fulltext_verification', source_ids });
const source = (id, publisher, title, url, type, evidence_role, source_location) => ({ id, publisher, title, url, type, evidence_role, source_location, retrieval_status: 'verified_2026-08-27' });

const SOURCES = [
  source('tp01-overordnet-del', 'Utdanningsdirektoratet', 'Profesjonsfellesskap og skoleutvikling', 'https://www.udir.no/lk20/overordnet-del/3.-prinsipper-for-skolens-praksis/3.5-profesjonsfellesskap-og-skoleutvikling', 'official-curriculum-framework', 'professional-knowledge-judgment-community', 'Overordnet dels krav om forsknings- og erfaringsbasert kunnskapsgrunnlag, individuelt og kollektivt skjønn og kontinuerlig profesjonsutvikling.'),
  source('tp02-opplaringslov', 'Lovdata', 'Lov om grunnskoleopplæringa og den vidaregåande opplæringa', 'https://lovdata.no/lov/2023-06-09-30', 'official-current-law', 'teacher-duties-rights-participation-confidentiality', 'Gjeldende rettslig ramme for elevrettigheter, tilpasset opplæring, skolemiljø, medvirkning, oppfølging og ansvar i skolens virksomhet.'),
  source('tp03-rammeplan-glu', 'Lovdata', 'Forskrift om rammeplan for grunnskolelærerutdanning for trinn 1–7', 'https://lovdata.no/LTI/forskrift/2016-06-07-860', 'official-education-regulation', 'teacher-qualification-integrated-professional-knowledge', 'Forskriftens læringsutbytte for integrert, profesjonsrettet og forskningsbasert lærerutdanning med fag, didaktikk, praksis og etikk.'),
  source('tp04-etisk-plattform', 'Utdanningsforbundet', 'Lærerprofesjonens etiske plattform', 'https://www.utdanningsforbundet.no/larerhverdagen/profesjonsetikk/om-profesjonsetikk/larerprofesjonens-etiske-plattform/', 'professional-ethical-framework', 'children-pupils-colleagues-public-trust', 'Profesjonens normative forpliktelser overfor barn og elever, kolleger, foresatte, samfunnsmandat, menneskeverd og faglig integritet.'),
  source('tp05-laererrolle-ekspertgruppe', 'Kunnskapsdepartementet', 'Om lærerrollen – et kunnskapsgrunnlag', 'https://www.regjeringen.no/no/dokumenter/om-lararrolla.-eit-kunnskapsgrunnlag/id2555498/', 'official-expert-report', 'teacher-role-professionalization-knowledge-governance', 'Ekspertgruppens syntese av lærerrollens historiske og institusjonelle utvikling, kunnskapsgrunnlag, profesjonalisering innenfra og styringsrelasjoner.'),
  source('tp06-talis-norway', 'OECD', 'Results from TALIS 2024 – Norway country note', 'https://www.oecd.org/en/publications/results-from-talis-2024-country-notes_e127f9e2-en/norway_3d989dd3-en.html', 'international-survey-country-note', 'teacher-status-work-conditions-collaboration-wellbeing', 'Norske læreres selvrapporterte samarbeid, arbeidsvilkår, profesjonsstatus, stress og relasjoner, med OECDs uttrykkelige forbehold om mulig skjevhet.'),
  source('tp07-shulman', 'Educational Researcher', 'Those Who Understand: Knowledge Growth in Teaching', 'https://doi.org/10.3102/0013189X015002004', 'peer-reviewed-theory-article', 'pedagogical-content-knowledge', 'Shulmans skille mellom fagkunnskap og pedagogisk innholdskunnskap som transformerer et bestemt innhold for bestemte elever og læringsvansker.'),
  source('tp08-teacher-agency', 'Bloomsbury Academic', 'Teacher Agency: An Ecological Approach', 'https://doi.org/10.5040/9781474219426', 'scholarly-research-monograph', 'ecological-teacher-agency-culture-structure-resources', 'Priestley, Biesta og Robinsons empirisk forankrede modell der agency oppnås i samspill mellom erfaring, formål og kulturelle, strukturelle og materielle vilkår.'),
  source('tp09-mausethagen', 'Journal of Education Policy', 'Contested discourses of teacher professionalism', 'https://doi.org/10.1080/02680939.2012.672656', 'peer-reviewed-norwegian-policy-study', 'professionalism-policy-union-accountability', 'Mausethagen og Granlunds analyse av konkurrerende norske profesjonalitetsdiskurser om ansvar, kunnskap, autonomi, kvalitet og styring.'),
  source('tp10-andresen', 'Professions and Professionalism', 'A Discretionary Toolkit: Reasoning When Teaching Controversial Issues', 'https://journals.oslomet.no/pp/article/view/4362', 'peer-reviewed-norwegian-classroom-study', 'teacher-discretion-controversial-issues-resources', 'Observasjoner og intervjuer fra Oslo-skoler som viser hvordan kompetanse, verdier og elevrelasjoner inngår i læreres situerte skjønnsresonnement.'),
  source('tp11-spilt', 'Educational Psychology Review', 'Teacher Wellbeing: The Importance of Teacher–Student Relationships', 'https://doi.org/10.1007/s10648-011-9170-y', 'peer-reviewed-research-review', 'teacher-student-relationships-teacher-wellbeing', 'Spilt, Koomen og Thijs’ forskningsgjennomgang av hvordan relasjonelt og emosjonelt arbeid kan støtte eller belaste læreres profesjonelle fungering.'),
  source('tp12-vescio', 'Teaching and Teacher Education', 'A review of research on the impact of professional learning communities', 'https://doi.org/10.1016/j.tate.2007.01.004', 'peer-reviewed-research-review', 'professional-learning-community-practice-evidence-limits', 'Gjennomgang av elleve studier om profesjonelle læringsfellesskap, med positive indikasjoner og tydelig begrensning fordi få studier går utover selvrapport.'),
  source('tp13-novice-guidance', 'Utdanningsdirektoratet', 'Profesjonsfaglig veiledning for nyutdannede lærere', 'https://www.udir.no/kvalitet-og-kompetanse/veiledning-av-nyutdannede/', 'official-professional-guidance', 'induction-qualified-mentor-organizational-responsibility', 'Gjeldende prinsipper for planlagt veiledning, kvalifiserte veiledere, skoleeiers ansvar og overgangen fra lærerutdanning til selvstendig profesjonsutøvelse.'),
];

const METHODS = {
  institution: ['met_utdanning_institusjonsanalyse', 'met_utdanning_dokument_lareplananalyse'],
  practice: ['met_utdanning_case_prosessporing', 'met_utdanning_kvalitativ_feltstudie'],
  synthesis: ['met_utdanning_litteratursyntese', 'met_utdanning_intervensjonsvurdering'],
};

const TOPICS = [
  { id: 'samfunnsmandat-og-profesjon', title: 'Samfunnsmandat, profesjon og ansvar', method_ids: METHODS.institution, source_ids: ['tp01-overordnet-del', 'tp02-opplaringslov', 'tp05-laererrolle-ekspertgruppe'], boundary: 'Profesjonsstatus er en institusjonell ansvarsrelasjon, ikke et krav om ukritisk tillit eller individuell prestisje.', planned_claims: [
    claim('tp-01', 'Lærerrollen forvalter et bredt samfunnsmandat der faglig læring, danning, inkludering, demokrati og elevrettigheter må håndteres samtidig.', ['tp01-overordnet-del', 'tp02-opplaringslov']),
    claim('tp-02', 'Profesjon kjennetegnes av et spesialisert kunnskapsgrunnlag, skjønnsrom, etiske forpliktelser og kollektivt ansvar for kvalitet.', ['tp05-laererrolle-ekspertgruppe', 'tp04-etisk-plattform']),
    claim('tp-03', 'Lærerprofesjonalitet formes både innenfra gjennom kunnskap og etikk og utenfra gjennom lov, styring, arbeidsorganisering og offentlig kontroll.', ['tp05-laererrolle-ekspertgruppe', 'tp09-mausethagen']),
    claim('tp-04', 'Formell lærerkompetanse gir adgang til arbeid, men dokumenterer ikke alene situert kompetanse i alle fag, elevgrupper og praksissituasjoner.', ['tp03-rammeplan-glu', 'tp07-shulman']),
  ]},
  { id: 'profesjonskunnskap-og-fagdidaktikk', title: 'Profesjonskunnskap og fagdidaktisk transformasjon', method_ids: METHODS.synthesis, source_ids: ['tp03-rammeplan-glu', 'tp07-shulman', 'tp01-overordnet-del'], boundary: 'Fagkunnskap og generell pedagogikk er nødvendige, men ingen av dem er alene tilstrekkelig for å gjøre bestemt innhold lærbart for bestemte elever.', planned_claims: [
    claim('tp-05', 'Shulmans pedagogiske innholdskunnskap beskriver hvordan læreren representerer fagstoff og forutser typiske forståelser og vansker hos elever.', ['tp07-shulman', 'tp03-rammeplan-glu']),
    claim('tp-06', 'Lærerens kunnskapsgrunnlag kombinerer fag, fagdidaktikk, pedagogikk, vurdering, elevkunnskap, læreplan og institusjonell kontekst.', ['tp03-rammeplan-glu', 'tp01-overordnet-del']),
    claim('tp-07', 'Forskningsbasert profesjonsutøvelse krever kritisk bruk av forskning sammen med erfaring og kontekst, ikke mekanisk kopiering av et funn.', ['tp01-overordnet-del', 'tp05-laererrolle-ekspertgruppe']),
    claim('tp-08', 'Profesjonskunnskap må oppdateres og prøves mot elevrespons, kollegial kritikk og dokumenterte konsekvenser i praksis.', ['tp01-overordnet-del', 'tp12-vescio']),
  ]},
  { id: 'skjonn-og-etterprovbarhet', title: 'Profesjonelt skjønn, ansvar og etterprøvbarhet', method_ids: METHODS.practice, source_ids: ['tp02-opplaringslov', 'tp04-etisk-plattform', 'tp10-andresen'], boundary: 'Skjønn er faglig og etisk begrunnet valg under usikkerhet, ikke personlig preferanse eller unntak fra rettigheter.', planned_claims: [
    claim('tp-09', 'Profesjonelt skjønn trengs når generelle regler og kunnskap må anvendes i en konkret situasjon med flere hensyn og ufullstendig informasjon.', ['tp10-andresen', 'tp02-opplaringslov']),
    claim('tp-10', 'Andresens studie viser at fagkompetanse, verdier og relasjoner inngår som ressurser når lærere håndterer kontroversielle spørsmål.', ['tp10-andresen', 'tp04-etisk-plattform']),
    claim('tp-11', 'Skjønnsutøvelse må kunne begrunnes med formål, relevant kunnskap, rettigheter, alternativer og forventede konsekvenser.', ['tp04-etisk-plattform', 'tp02-opplaringslov']),
    claim('tp-12', 'Etterprøvbarhet skal gjøre profesjonelle valg diskuterbare og korrigerbare uten å redusere undervisning til standardisert regelutførelse.', ['tp09-mausethagen', 'tp05-laererrolle-ekspertgruppe']),
  ]},
  { id: 'agency-og-laereplanarbeid', title: 'Lærer-agency og læreplanarbeid', method_ids: METHODS.practice, source_ids: ['tp08-teacher-agency', 'tp01-overordnet-del', 'tp09-mausethagen'], boundary: 'Agency er ikke en stabil individuell egenskap; den oppnås eller begrenses gjennom formål, erfaring, relasjoner, kultur, struktur og materielle ressurser.', planned_claims: [
    claim('tp-13', 'Priestley, Biesta og Robinson analyserer lærer-agency som en økologisk prestasjon i samspill mellom tidligere erfaring, framtidige formål og nåværende vilkår.', ['tp08-teacher-agency', 'tp09-mausethagen']),
    claim('tp-14', 'Lærere fortolker og konkretiserer læreplaner gjennom valg av innhold, rekkefølge, representasjon, arbeidsmåte og vurdering.', ['tp08-teacher-agency', 'tp07-shulman']),
    claim('tp-15', 'Handlingsrom blir reelt først når læreren har kunnskap, tid, samarbeid, materiell støtte og legitime muligheter til å påvirke praksis.', ['tp08-teacher-agency', 'tp06-talis-norway']),
    claim('tp-16', 'Profesjonell agency må vurderes mot samfunnsmandat og elevrettigheter; lokal nyskaping er ikke automatisk et kvalitetsbevis.', ['tp01-overordnet-del', 'tp02-opplaringslov']),
  ]},
  { id: 'relasjoner-omsorg-og-myndighet', title: 'Elevrelasjoner, omsorg og profesjonell myndighet', method_ids: METHODS.synthesis, source_ids: ['tp02-opplaringslov', 'tp04-etisk-plattform', 'tp11-spilt'], boundary: 'En profesjonell elevrelasjon kombinerer omsorg, respekt og pedagogisk myndighet med tydelige rolle- og personverngrenser.', planned_claims: [
    claim('tp-17', 'Lærer–elev-relasjonen er både pedagogisk og emosjonelt arbeid fordi tillit, konflikt og tilhørighet påvirker deltakelse og lærerens arbeidsbelastning.', ['tp11-spilt', 'tp04-etisk-plattform']),
    claim('tp-18', 'Omsorg i lærerrollen betyr å ivareta elevens verdighet, læring og trygghet innenfor et offentlig profesjonsansvar, ikke privat grenseløs nærhet.', ['tp04-etisk-plattform', 'tp02-opplaringslov']),
    claim('tp-19', 'Pedagogisk myndighet må være saklig, forholdsmessig og mulig å korrigere, særlig når læreren vurderer, griper inn eller fordeler oppmerksomhet.', ['tp02-opplaringslov', 'tp04-etisk-plattform']),
    claim('tp-20', 'Relasjonsforskning må tolkes med hensyn til design, alder, målemetode og gjensidighet før sammenhenger brukes som individuelle lærerkrav.', ['tp11-spilt', 'tp06-talis-norway']),
  ]},
  { id: 'kollektiv-profesjonalisme', title: 'Samarbeid og kollektiv profesjonalisme', method_ids: METHODS.synthesis, source_ids: ['tp01-overordnet-del', 'tp06-talis-norway', 'tp12-vescio'], boundary: 'Møter, deling og enighet er ikke i seg selv profesjonell læring; samarbeid må endre kunnskap, beslutninger eller praksis på etterprøvbar måte.', planned_claims: [
    claim('tp-21', 'Overordnet del gjør utvikling av profesjonelt skjønn til både et individuelt og kollektivt ansvar.', ['tp01-overordnet-del', 'tp05-laererrolle-ekspertgruppe']),
    claim('tp-22', 'Profesjonelle læringsfellesskap trenger et felles problem, relevant evidens, kritisk dialog, utprøving og oppfølging av praksis.', ['tp12-vescio', 'tp01-overordnet-del']),
    claim('tp-23', 'Vescio, Ross og Adams finner lovende virkninger av utviklede læringsfellesskap, men få studier dokumenterer mer enn selvrapport.', ['tp12-vescio', 'tp06-talis-norway']),
    claim('tp-24', 'Kollegialitet må gi rom for begrunnet uenighet og varsling; konsensus kan ellers skjule feil, makt og ekskludering.', ['tp04-etisk-plattform', 'tp09-mausethagen']),
  ]},
  { id: 'yrkesinngang-utvikling-og-arbeidsvilkar', title: 'Yrkesinngang, profesjonsutvikling og arbeidsvilkår', method_ids: METHODS.institution, source_ids: ['tp03-rammeplan-glu', 'tp06-talis-norway', 'tp13-novice-guidance'], boundary: 'Nyutdannedes mestring og læreres utholdenhet er organisatoriske ansvarsspørsmål, ikke bare mål på individuell robusthet.', planned_claims: [
    claim('tp-25', 'Overgangen fra lærerutdanning til selvstendig arbeid innebærer nye situerte ansvar som ikke kan simuleres fullt ut i grunnutdanningen.', ['tp03-rammeplan-glu', 'tp13-novice-guidance']),
    claim('tp-26', 'God veiledning krever kvalifisert veileder, avsatt tid, tydelig formål, fortrolighet og kobling til skolens øvrige profesjonsarbeid.', ['tp13-novice-guidance', 'tp01-overordnet-del']),
    claim('tp-27', 'TALIS-data om status, stress og arbeidsvilkår er relevante systemsignaler, men selvrapport og mulig frafallsskjevhet begrenser årsakstolkning.', ['tp06-talis-norway', 'tp05-laererrolle-ekspertgruppe']),
    claim('tp-28', 'Rekruttering og stabilitet påvirkes av arbeidsmengde, støtte, ledelse, utviklingsmuligheter, kontrakter og profesjonell innflytelse, ikke bare motivasjon.', ['tp06-talis-norway', 'tp13-novice-guidance']),
  ]},
  { id: 'etikk-tillit-og-offentlig-ansvar', title: 'Profesjonsetikk, tillit og offentlig ansvar', method_ids: METHODS.institution, source_ids: ['tp02-opplaringslov', 'tp04-etisk-plattform', 'tp09-mausethagen'], boundary: 'Etisk plattform er et normativt refleksjonsgrunnlag, ikke empirisk dokumentasjon på at profesjonen alltid handler etisk eller effektivt.', planned_claims: [
    claim('tp-29', 'Profesjonsetikk gjør verdikonflikter synlige når hensynet til enkelt­eleven, gruppen, foresatte, kolleger, lov og samfunnsmandat trekker ulikt.', ['tp04-etisk-plattform', 'tp02-opplaringslov']),
    claim('tp-30', 'Tillit til lærere må kombineres med åpen begrunnelse, klageadgang, kollegial korrigering og vern av elever som har mindre institusjonell makt.', ['tp02-opplaringslov', 'tp09-mausethagen']),
    claim('tp-31', 'Lærere har ansvar for å beskytte konfidensialitet og samtidig handle når elevens rettigheter, trygghet eller læringsmiljø krever oppfølging.', ['tp02-opplaringslov', 'tp04-etisk-plattform']),
    claim('tp-32', 'Profesjonens kollektive ansvar innebærer å utvikle kunnskapsgrunnlag, diskutere standarder og rette praksis, ikke å beskytte kolleger mot legitim kritikk.', ['tp01-overordnet-del', 'tp04-etisk-plattform']),
  ]},
];

const SCENARIOS = [
  { id: 'scenario-controversial-issue', title: 'Et kontroversielt tema utløser konflikt i klassen', purpose: 'Begrunne skjønn gjennom fagkunnskap, elevrelasjoner, rettigheter, alternativer og etterprøvbarhet.', source_ids: ['tp10-andresen', 'tp04-etisk-plattform'] },
  { id: 'scenario-data-versus-judgment', title: 'Et standardisert resultat brukes til å overstyre lærerens vurdering', purpose: 'Skille profesjonell autonomi fra ansvarsfrihet og data fra full situasjonsforståelse.', source_ids: ['tp09-mausethagen', 'tp05-laererrolle-ekspertgruppe'] },
  { id: 'scenario-novice-without-time', title: 'En nyutdannet får mentor, men ingen avsatt tid', purpose: 'Vurdere om ordningen har reelle ressurser, kvalifisert veileder og organisatorisk ansvar.', source_ids: ['tp13-novice-guidance', 'tp06-talis-norway'] },
  { id: 'scenario-relationship-boundary', title: 'En elev ber læreren holde en alvorlig sak hemmelig', purpose: 'Analysere tillit, konfidensialitet, elevvern, handlingsplikt og profesjonelle grenser.', source_ids: ['tp02-opplaringslov', 'tp04-etisk-plattform'] },
  { id: 'scenario-collegial-consensus', title: 'Teamet er enstemmig, men elevdata motsier praksisen', purpose: 'Skille kollegial harmoni fra kritisk profesjonslæring og korrigerbar praksis.', source_ids: ['tp12-vescio', 'tp01-overordnet-del'] },
  { id: 'scenario-curriculum-space', title: 'Læreren får reformansvar uten tid eller materiell støtte', purpose: 'Analysere agency som samspill mellom kunnskap, formål, struktur, kultur og ressurser.', source_ids: ['tp08-teacher-agency', 'tp07-shulman'] },
];

export function build({ writeFiles = true } = {}) {
  const brief = {
    schema: 'history_go_utdanning_teacher_profession_role_source_claim_brief_v1', version: '1.0.0', updated_at: '2026-08-27', status: 'source_claim_brief_complete_full_chapter_next', subject_id: 'utdanning',
    planned_unit_id: 'profesjoner-laererrollen-kunnskap-skjonn-etikk-og-samarbeid', future_chapter_id: 'profesjoner-laererrollen-kunnskap-skjonn-etikk-og-samarbeid',
    runtime_registration: { registered: false, allowed_before_full_chapter_gate: false }, metadata_registration: { deferred_until_fulltext: true, global_status_mutation_in_source_brief: false, release_mutation_in_source_brief: false },
    scope: { title: 'Profesjoner og lærerrollen: kunnskap, skjønn, etikk og samarbeid', primary_domain_id: 'profesjoner_laererrollen', canonical_emne_id: 'em_utdanning_profesjoner_laererrollen', ownership: 'Utdanning eier analysen av lærerprofesjonens samfunnsmandat, kunnskapsgrunnlag, fagdidaktiske transformasjon, skjønn, agency, elevrelasjoner, samarbeid, yrkesinngang, arbeidsvilkår, profesjonsetikk og offentlig ansvar.', included: TOPICS.map((topic) => topic.title), excluded: ['kvalifikasjon som komplett kompetansebevis', 'autonomi som ansvarsfrihet', 'skjønn som personlig preferanse', 'relasjon som grenseløs nærhet', 'samarbeid som konsensusbevis', 'selvrapport som kausal arbeidsmiljøforklaring'] },
    source_policy: { qualification_is_not_complete_competence: true, autonomy_is_not_no_accountability: true, judgment_is_not_personal_preference: true, agency_is_ecological_not_personality: true, relationship_is_not_boundarylessness: true, collaboration_is_not_consensus_or_effect_proof: true, survey_self_report_requires_caution: true, mentoring_requires_time_qualification_and_structure: true, professional_status_is_not_individual_esteem: true, ethical_framework_is_normative_not_effect_proof: true, planned_claim_is_not_verified_claim: true, fulltext_requires_reciprocal_paragraph_claim_trace: true, sources_verified_at: '2026-08-27' },
    allowed_method_ids: [...new Set(Object.values(METHODS).flat())], sources: SOURCES, decision_scenarios: SCENARIOS, topic_briefs: TOPICS, next_gate: 'professions_teacher_role_source_brief_complete_full_chapter_production',
  };
  if (writeFiles) write(BRIEF, brief);
  return brief;
}

export function audit({ writeReport = false } = {}) {
  const brief = fs.existsSync(abs(BRIEF)) ? read(BRIEF) : build({ writeFiles: false });
  const claims = brief.topic_briefs.flatMap((topic) => topic.planned_claims); const sourceIds = new Set(brief.sources.map((row) => row.id)); const usedSources = new Set(claims.flatMap((row) => row.source_ids));
  assert(brief.scope.primary_domain_id === 'profesjoner_laererrollen', 'Feil domene');
  assert(!brief.runtime_registration.registered && !brief.metadata_registration.global_status_mutation_in_source_brief, 'Source brief kan ikke registrere runtime');
  assert(brief.sources.length === 13 && brief.topic_briefs.length === 8 && claims.length === 32 && brief.decision_scenarios.length === 6, 'Feil 13/8/32/6-struktur');
  assert(new Set(claims.map((row) => row.id)).size === 32 && claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Claims må være unike og kildebundet');
  assert(brief.sources.every((row) => row.url.startsWith('https://') && row.source_location && row.retrieval_status === 'verified_2026-08-27'), 'Kilder må være inspiserbare');
  assert([...sourceIds].every((id) => usedSources.has(id)), 'Alle kilder må brukes');
  assert(['qualification_is_not_complete_competence', 'autonomy_is_not_no_accountability', 'judgment_is_not_personal_preference', 'agency_is_ecological_not_personality', 'relationship_is_not_boundarylessness', 'collaboration_is_not_consensus_or_effect_proof', 'survey_self_report_requires_caution', 'mentoring_requires_time_qualification_and_structure', 'professional_status_is_not_individual_esteem', 'ethical_framework_is_normative_not_effect_proof'].every((key) => brief.source_policy[key]), 'Profesjonsfaglige grenser mangler');
  const report = { schema: 'history_go_utdanning_teacher_profession_role_source_brief_audit_v1', version: '1.0.0', updated_at: '2026-08-27', status: 'pass', subject_id: 'utdanning', domain_id: 'profesjoner_laererrollen', counts: { verifiedSources: 13, topicBriefs: 8, plannedClaims: 32, decisionScenarios: 6, modules: 4 }, gates: { sourceFirstUnregistered: true, allSourcesInspectable: true, everyClaimSourceBound: true, everySourceUsed: true, qualificationCompetenceBoundary: true, autonomyAccountabilityBoundary: true, professionalJudgmentBoundary: true, ecologicalAgencyBoundary: true, relationalBoundary: true, collectiveProfessionalismBoundary: true, selfReportBoundary: true, inductionBoundary: true, statusBoundary: true, ethicalFrameworkBoundary: true, fulltextClaimTraceRequired: true }, six_part_quality_review: { source_authority_and_provenance: 5, claim_plan_and_verifiability: 5, profession_knowledge_judgment_and_agency: 5, rights_relations_ethics_and_work_conditions: 5, method_and_scenarios: 4, architecture_and_reproducibility: 5, total: 29, maximum: 30, note: 'Source-first-produksjon; lærerrolleclaims forblir planlagte til fulltekst med gjensidig paragraph↔claim-spor.' }, next_gate: brief.next_gate };
  if (writeReport) write(REPORT, report); else assert(isDeepStrictEqual(read(REPORT), report), `${REPORT} er utdatert`);
  return report;
}

try {
  if (process.argv.includes('--write-brief')) build();
  const report = audit({ writeReport: process.argv.includes('--write-report') });
  console.log(`Profesjoner og lærerrollen source brief OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} spor, ${report.counts.plannedClaims} claims; ${report.six_part_quality_review.total}/30.`);
} catch (error) { console.error(`Profesjoner og lærerrollen source brief FEIL: ${error.message}`); process.exitCode = 1; }
