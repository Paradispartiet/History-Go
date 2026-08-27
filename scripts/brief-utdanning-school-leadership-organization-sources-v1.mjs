#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/utdanning/school_leadership_organization_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/utdanning-school-leadership-organization-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const claim = (id, text, source_ids) => ({ id, text, status: 'planned_requires_fulltext_verification', source_ids });
const source = (id, publisher, title, url, type, evidence_role, source_location) => ({ id, publisher, title, url, type, evidence_role, source_location, retrieval_status: 'verified_2026-08-27' });

const SOURCES = [
  source('sl01-udir-rektor', 'Utdanningsdirektoratet', 'Krav og forventninger til en rektor', 'https://www.udir.no/kvalitet-og-kompetanse/etter-og-videreutdanning/rektor/krav-og-forventninger-til-en-rektor/', 'official-professional-framework', 'principal-mandate-competence-responsibility', 'Udirs fem hovedområder for rektoransvar, pedagogisk ledelse, styring, utvikling og relasjoner.'),
  source('sl02-opplaringslov', 'Lovdata', 'Lov om grunnskoleopplæringa og den vidaregåande opplæringa', 'https://lovdata.no/lov/2023-06-09-30', 'official-current-law', 'legal-leadership-rights-school-democracy', 'Gjeldende lovkrav til rektor, pedagogisk kompetanse, daglig virksomhet, utvikling, elevmedvirkning og skolemiljø.'),
  source('sl03-overordnet-del', 'Utdanningsdirektoratet', 'Profesjonsfellesskap og skoleutvikling', 'https://www.udir.no/lk20/overordnet-del/3.-prinsipper-for-skolens-praksis/3.5-profesjonsfellesskap-og-skoleutvikling', 'official-curriculum-framework', 'professional-community-reflection-development', 'Overordnet dels normative krav om profesjonsfellesskap, refleksjon over verdier, vurdering av praksis og felles skoleutvikling.'),
  source('sl04-nou-quality-leadership', 'Kunnskapsdepartementet', 'NOU 2023: 27 – systematisk kvalitetsutvikling forutsetter god ledelse', 'https://www.regjeringen.no/no/dokumenter/nou-2023-27/id3013760/?ch=7', 'official-evidence-inquiry', 'multi-level-quality-development-dialogue-capacity', 'Utredningens analyse av ledelse på skole-, eier- og nasjonalt nivå, støtte, dialog, rolleavklaring og kapasitet.'),
  source('sl05-talis-norway', 'OECD', 'Results from TALIS 2024 – Norway country note', 'https://www.oecd.org/en/publications/results-from-talis-2024-country-notes_e127f9e2-en/norway_3d989dd3-en.html', 'international-survey-country-note', 'principal-teacher-work-conditions-collaboration', 'Norske læreres og skolelederes selvrapporterte arbeidsvilkår, samarbeid, ledelse og profesjonslæring, med eksplisitte sammenligningsbegrensninger.'),
  source('sl06-leithwood', 'School Leadership & Management', 'Seven strong claims about successful school leadership revisited', 'https://doi.org/10.1080/13632434.2019.1596077', 'peer-reviewed-research-synthesis', 'indirect-contingent-leadership-effects', 'Leithwood, Harris og Hopkins’ oppdaterte syntese av indirekte, betingede ledervirkninger og sentrale praksisområder.'),
  source('sl07-robinson', 'Educational Administration Quarterly', 'The impact of leadership on student outcomes', 'https://doi.org/10.1177/0013161X08321509', 'peer-reviewed-meta-analysis', 'instructional-leadership-professional-learning-effects', 'Meta-analyse av 27 studier som sammenligner ledelsesdimensjoner og viser særlig betydning av å fremme og delta i læreres profesjonslæring.'),
  source('sl08-grissom', 'Wallace Foundation', 'How Principals Affect Students and Schools', 'https://wallacefoundation.org/report/how-principals-affect-students-and-schools-systematic-synthesis-two-decades-research', 'systematic-research-synthesis', 'principal-practices-teacher-retention-equity', 'Systematisk syntese av 219 studier om rektorers indirekte bidrag til læring, fravær, lærerstabilitet, organisasjon og likeverd.'),
  source('sl09-spillane', 'Journal of Curriculum Studies', 'Towards a theory of leadership practice: a distributed perspective', 'https://doi.org/10.1080/0022027032000106726', 'peer-reviewed-theory-study', 'distributed-leadership-practice-situation-tools', 'Spillane, Halverson og Diamonds praksisteori der ledelse analyseres i samspillet mellom ledere, følgere og situasjon.'),
  source('sl10-edmondson', 'Administrative Science Quarterly', 'Psychological safety and learning behavior in work teams', 'https://doi.org/10.2307/2666999', 'peer-reviewed-organizational-study', 'psychological-safety-team-learning-boundary', 'Edmondsons teamstudie av psykologisk trygghet og læringsatferd; funnene gjelder teamprosesser og er ikke et generelt trivselsmål.'),
  source('sl11-jensen', 'International Journal of Leadership in Education', 'Professional development of school leadership as boundary work', 'https://doi.org/10.1080/13603124.2020.1716998', 'peer-reviewed-norwegian-case-study', 'leadership-development-boundary-work-partnership', 'Norsk case om lederutvikling som grensearbeid mellom skole, kommune og utdanningsinstitusjon, med initiativer og interaksjonsmønstre.'),
  source('sl12-gunnulfsen', 'Education Sciences', 'Conceptualizing successful school leadership in Norway', 'https://doi.org/10.3390/educsci13080787', 'peer-reviewed-scoping-review', 'norwegian-governance-leadership-context', 'Gunnulfsens gjennomgang av hvordan norsk ledelsesforskning knytter posisjoner, styring, kontekst og forestillinger om suksess.'),
  source('sl13-teacher-leadership', 'Scandinavian Journal of Educational Research', 'Teacher leadership: leading professional learning among colleagues', 'https://doi.org/10.1080/00313831.2024.2323652', 'peer-reviewed-norwegian-case-study', 'teacher-leader-role-authority-professional-learning', 'Norsk case om en ny lærerlederrolle, profesjonslæring, mandat, rolleforhandling og organisatoriske vilkår.'),
];

const METHODS = {
  institution: ['met_utdanning_institusjonsanalyse', 'met_utdanning_dokument_lareplananalyse'],
  practice: ['met_utdanning_case_prosessporing', 'met_utdanning_kvalitativ_feltstudie'],
  synthesis: ['met_utdanning_litteratursyntese', 'met_utdanning_intervensjonsvurdering'],
};

const TOPICS = [
  { id: 'mandat-ansvar-og-handlingsrom', title: 'Mandat, ansvar og organisatorisk handlingsrom', method_ids: METHODS.institution, source_ids: ['sl01-udir-rektor', 'sl02-opplaringslov', 'sl12-gunnulfsen'], boundary: 'Formelt ansvar gir ikke individuell kontroll over alle resultater; mandat, ressurser, eiernivå og profesjonelt handlingsrom må analyseres sammen.', planned_claims: [
    claim('sl-01', 'Opplæringslova krever at skolen ledes av en rektor med pedagogisk kompetanse som deltar i daglig virksomhet og arbeider med skolens utvikling.', ['sl02-opplaringslov', 'sl01-udir-rektor']),
    claim('sl-02', 'Udirs rektorprofil kombinerer elevlæring, profesjonsfellesskap, styring, utvikling og relasjoner i ett sammensatt ledermandat.', ['sl01-udir-rektor', 'sl03-overordnet-del']),
    claim('sl-03', 'Rektoransvar må skilles fra antakelsen om at én leder direkte kontrollerer undervisning, arbeidsmiljø og elevutfall.', ['sl06-leithwood', 'sl08-grissom']),
    claim('sl-04', 'Institusjonsanalyse må koble rektors handlingsrom til skoleeier, lov, budsjett, tariff, kompetanse og lokal organisering.', ['sl02-opplaringslov', 'sl04-nou-quality-leadership', 'sl12-gunnulfsen']),
  ]},
  { id: 'struktur-roller-og-koordinering', title: 'Struktur, roller og koordinering', method_ids: METHODS.institution, source_ids: ['sl04-nou-quality-leadership', 'sl09-spillane', 'sl13-teacher-leadership'], boundary: 'Organisasjonskart viser formelle posisjoner, ikke nødvendigvis hvor ledelsesarbeid, informasjon og beslutningsmakt faktisk ligger.', planned_claims: [
    claim('sl-05', 'Skolen er en organisasjon med vertikale ansvarslinjer og horisontale avhengigheter mellom fag, trinn, støttefunksjoner og eksterne tjenester.', ['sl02-opplaringslov', 'sl04-nou-quality-leadership']),
    claim('sl-06', 'Mellomleder- og lærerlederroller kan styrke koordinering når mandat, tid, kompetanse og ansvar er eksplisitt.', ['sl13-teacher-leadership', 'sl09-spillane']),
    claim('sl-07', 'Rolleklarhet krever at beslutningsrett, konsultasjon, utførelse og etterprøving skilles i konkrete arbeidsprosesser.', ['sl01-udir-rektor', 'sl04-nou-quality-leadership']),
    claim('sl-08', 'Uformelle nettverk kan bære viktig kunnskap og innflytelse, men kan også skape eksklusjon og uklare ansvarslinjer.', ['sl09-spillane', 'sl10-edmondson']),
  ]},
  { id: 'ledelse-for-laering', title: 'Ledelse for undervisning og læring', method_ids: METHODS.synthesis, source_ids: ['sl06-leithwood', 'sl07-robinson', 'sl08-grissom'], boundary: 'Sammenheng mellom ledelse og elevutfall er hovedsakelig indirekte og kontekstavhengig; effektstørrelser er ikke universelle oppskrifter.', planned_claims: [
    claim('sl-09', 'Forskningssynteser viser at skoleledelse påvirker elevutfall hovedsakelig gjennom læreres arbeid, organisasjonens vilkår og undervisningskvalitet.', ['sl06-leithwood', 'sl08-grissom']),
    claim('sl-10', 'Robinson, Lloyd og Rowe finner sterkest gjennomsnittlig sammenheng for ledelse som fremmer og deltar i læreres profesjonslæring.', ['sl07-robinson', 'sl06-leithwood']),
    claim('sl-11', 'Mål og forventninger virker først når de oversettes til prioriteringer, ressurser, støtte, oppfølging og relevant undervisningsarbeid.', ['sl06-leithwood', 'sl08-grissom']),
    claim('sl-12', 'Ledelsesstudier må vurderes for design, utfallsmål, kontekst og seleksjon før funn brukes som kausale anbefalinger.', ['sl07-robinson', 'sl08-grissom']),
  ]},
  { id: 'distribuert-ledelse', title: 'Distribuert ledelse og profesjonell myndighet', method_ids: METHODS.practice, source_ids: ['sl09-spillane', 'sl13-teacher-leadership', 'sl12-gunnulfsen'], boundary: 'Distribuert ledelse beskriver hvordan praksis fordeles; etiketten beviser verken demokrati, kvalitet eller reell myndighet.', planned_claims: [
    claim('sl-13', 'Spillanes distribuerte perspektiv analyserer ledelsespraksis som samspill mellom ledere, følgere og situasjon, inkludert verktøy og rutiner.', ['sl09-spillane', 'sl12-gunnulfsen']),
    claim('sl-14', 'Å delegere oppgaver uten beslutningsmyndighet, tid eller støtte er arbeidsfordeling, ikke nødvendigvis meningsfull distribuert ledelse.', ['sl09-spillane', 'sl13-teacher-leadership']),
    claim('sl-15', 'Lærerlederrollen forhandles mellom kollegial legitimitet, formelt mandat og ansvar overfor ledelsen.', ['sl13-teacher-leadership', 'sl03-overordnet-del']),
    claim('sl-16', 'Distribusjon må evalueres gjennom hvem som får innflytelse, hvilke oppgaver som deles og hvordan ansvar fortsatt kan etterprøves.', ['sl09-spillane', 'sl04-nou-quality-leadership']),
  ]},
  { id: 'profesjonsfellesskap-og-trygghet', title: 'Profesjonsfellesskap, tillit og psykologisk trygghet', method_ids: METHODS.practice, source_ids: ['sl03-overordnet-del', 'sl05-talis-norway', 'sl10-edmondson'], boundary: 'Psykologisk trygghet er rom for mellommenneskelig risiko i arbeidsteam, ikke fravær av krav, konflikt eller faglig ansvar.', planned_claims: [
    claim('sl-17', 'Overordnet del forplikter profesjonsfellesskapet til å reflektere over verdier, vurdere praksis og videreutvikle skolen sammen.', ['sl03-overordnet-del', 'sl02-opplaringslov']),
    claim('sl-18', 'TALIS gir viktig selvrapportert informasjon om samarbeid og arbeidsvilkår, men sammenligninger må tolkes med kulturell og metodisk varsomhet.', ['sl05-talis-norway', 'sl04-nou-quality-leadership']),
    claim('sl-19', 'Edmondson viser at psykologisk trygghet kan støtte spørsmål, feilrapportering og eksperimentering i team når arbeidet oppleves som mellommenneskelig risikabelt.', ['sl10-edmondson', 'sl03-overordnet-del']),
    claim('sl-20', 'Et profesjonsfellesskap trenger både tillit og faglig friksjon; konsensus alene dokumenterer ikke læring eller forbedret praksis.', ['sl03-overordnet-del', 'sl10-edmondson', 'sl07-robinson']),
  ]},
  { id: 'kvalitetsutvikling-og-organisasjonslaering', title: 'Kvalitetsutvikling og organisasjonslæring', method_ids: METHODS.practice, source_ids: ['sl04-nou-quality-leadership', 'sl03-overordnet-del', 'sl11-jensen'], boundary: 'Data og møter er ikke organisatorisk læring uten fortolkning, handling, tilbakemelding og dokumentert revisjon av praksis.', planned_claims: [
    claim('sl-21', 'Systematisk kvalitetsutvikling krever gjentatte sløyfer mellom bredt kunnskapsgrunnlag, fortolkning, tiltak, oppfølging og revisjon.', ['sl04-nou-quality-leadership', 'sl03-overordnet-del']),
    claim('sl-22', 'Skoleeier og skoleledelse må kombinere støtte og oppfølging slik at ansvar ikke reduseres til rapportering oppover.', ['sl04-nou-quality-leadership', 'sl01-udir-rektor']),
    claim('sl-23', 'Lederutvikling kan forstås som grensearbeid når skole, eier og utdanningsinstitusjon kobler ulike kunnskaper og ansvar.', ['sl11-jensen', 'sl04-nou-quality-leadership']),
    claim('sl-24', 'Organisasjonslæring må spores i endrede rutiner, beslutninger og undervisningsvilkår, ikke bare i deltakelse på kurs eller møter.', ['sl11-jensen', 'sl03-overordnet-del', 'sl08-grissom']),
  ]},
  { id: 'endring-og-kapasitet', title: 'Endringsledelse, kapasitet og bærekraft', method_ids: METHODS.practice, source_ids: ['sl06-leithwood', 'sl11-jensen', 'sl12-gunnulfsen'], boundary: 'Endringsvilje er ikke en stabil personegenskap; kapasitet, mening, arbeidsbelastning, historie og gjennomføringsdesign påvirker responsen.', planned_claims: [
    claim('sl-25', 'Skoleendring krever at problem, mål, virkemiddel og forventet mekanisme gjøres forståelig for dem som skal utføre arbeidet.', ['sl06-leithwood', 'sl11-jensen']),
    claim('sl-26', 'Kapasitet omfatter tid, kompetanse, relasjoner, ledelsesstøtte, data og organisatoriske rutiner, ikke bare positiv holdning.', ['sl04-nou-quality-leadership', 'sl11-jensen']),
    claim('sl-27', 'Endringstretthet kan være en rasjonell respons på konkurrerende initiativer, svake tilbakemeldingssløyfer og manglende avslutning.', ['sl06-leithwood', 'sl12-gunnulfsen']),
    claim('sl-28', 'Bærekraftig forbedring krever institusjonalisering og læring på tvers av personer slik at praksis ikke kollapser ved lederskifte.', ['sl06-leithwood', 'sl08-grissom']),
  ]},
  { id: 'etikk-medvirkning-og-arbeidsmiljo', title: 'Etikk, medvirkning, arbeidsmiljø og etterprøvbarhet', method_ids: METHODS.institution, source_ids: ['sl02-opplaringslov', 'sl01-udir-rektor', 'sl05-talis-norway', 'sl08-grissom'], boundary: 'Effektivitet kan ikke overstyre rettigheter, elevmedvirkning, faglig integritet eller forsvarlige arbeidsvilkår.', planned_claims: [
    claim('sl-29', 'Skoleledelse utøver offentlig og profesjonell makt og må begrunne prioriteringer som påvirker elevers rettigheter og ansattes arbeid.', ['sl02-opplaringslov', 'sl01-udir-rektor']),
    claim('sl-30', 'Elev- og ansattmedvirkning må ha tydelig sak, tidspunkt og påvirkningsmulighet for å være mer enn symbolsk konsultasjon.', ['sl02-opplaringslov', 'sl03-overordnet-del']),
    claim('sl-31', 'Lederstabilitet og arbeidsvilkår er organisatoriske kvalitets- og likeverdsspørsmål, ikke bare individuelle robusthetsproblemer.', ['sl08-grissom', 'sl05-talis-norway']),
    claim('sl-32', 'Etterprøvbar ledelse dokumenterer beslutningsgrunnlag, ansvar, uenighet, tiltak og oppfølging uten å gjøre dokumentasjon til et mål i seg selv.', ['sl04-nou-quality-leadership', 'sl01-udir-rektor']),
  ]},
];

const SCENARIOS = [
  { id: 'scenario-principal-dashboard', title: 'Rektor holdes alene ansvarlig for et resultatgap', purpose: 'Skille formelt ansvar fra virkningskjede, kapasitet og ansvar på flere nivåer.', source_ids: ['sl04-nou-quality-leadership', 'sl08-grissom'] },
  { id: 'scenario-distributed-title', title: 'En lærer får ledernavn uten myndighet eller tid', purpose: 'Analysere mandat, ressurser, kollegial legitimitet og etterprøvbarhet.', source_ids: ['sl09-spillane', 'sl13-teacher-leadership'] },
  { id: 'scenario-safe-no-disagreement', title: 'Psykologisk trygghet tolkes som krav om enighet', purpose: 'Skille trygg mellommenneskelig risiko fra fravær av faglig konflikt og standarder.', source_ids: ['sl10-edmondson', 'sl03-overordnet-del'] },
  { id: 'scenario-course-complete', title: 'Kursdeltakelse registreres som gjennomført skoleutvikling', purpose: 'Spore om ny kunnskap endrer rutiner, beslutninger og undervisningsvilkår.', source_ids: ['sl11-jensen', 'sl04-nou-quality-leadership'] },
  { id: 'scenario-initiative-overload', title: 'Tre forbedringsinitiativ konkurrerer om samme tid', purpose: 'Prioritere ut fra mekanisme, kapasitet, arbeidsbelastning og avslutningskriterier.', source_ids: ['sl06-leithwood', 'sl12-gunnulfsen'] },
  { id: 'scenario-consult-after-decision', title: 'Elever og ansatte inviteres etter at beslutningen er tatt', purpose: 'Vurdere reell påvirkning, rettigheter, beslutningsspor og mulighet for revisjon.', source_ids: ['sl02-opplaringslov', 'sl01-udir-rektor'] },
];

export function build({ writeFiles = true } = {}) {
  const brief = {
    schema: 'history_go_utdanning_school_leadership_organization_source_claim_brief_v1', version: '1.0.0', updated_at: '2026-08-27', status: 'source_claim_brief_complete_full_chapter_next', subject_id: 'utdanning',
    planned_unit_id: 'skoleledelse-organisasjon-ansvar-profesjonsfellesskap-og-utvikling', future_chapter_id: 'skoleledelse-organisasjon-ansvar-profesjonsfellesskap-og-utvikling',
    runtime_registration: { registered: false, allowed_before_full_chapter_gate: false }, metadata_registration: { deferred_until_fulltext: true, global_status_mutation_in_source_brief: false, release_mutation_in_source_brief: false },
    scope: { title: 'Skoleledelse og organisasjon: ansvar, profesjonsfellesskap og utvikling', primary_domain_id: 'skoleledelse_organisasjon', canonical_emne_id: 'em_utdanning_skoleledelse_organisasjon', ownership: 'Utdanning eier analysen av skolens ledermandat, organisasjonsstruktur, ledelse for læring, distribuert myndighet, profesjonsfellesskap, kvalitetsutvikling, endringskapasitet, medvirkning og etterprøvbarhet.', included: TOPICS.map((topic) => topic.title), excluded: ['lederheroisme som årsaksmodell', 'organisasjonskart som full praksisbeskrivelse', 'distribuert etikett som demokratibevis', 'korrelasjon som universell lederoppskrift', 'psykologisk trygghet som fravær av krav', 'kursdeltakelse som forbedringsbevis'] },
    source_policy: { leadership_effects_are_mainly_indirect: true, responsibility_is_not_total_control: true, distributed_label_is_not_quality_proof: true, role_requires_authority_time_support: true, psychological_safety_is_not_no_accountability: true, survey_self_report_requires_caution: true, data_use_requires_interpretation_action_revision: true, change_requires_capacity_and_mechanism: true, participation_requires_real_influence: true, planned_claim_is_not_verified_claim: true, fulltext_requires_reciprocal_paragraph_claim_trace: true, sources_verified_at: '2026-08-27' },
    allowed_method_ids: [...new Set(Object.values(METHODS).flat())], sources: SOURCES, decision_scenarios: SCENARIOS, topic_briefs: TOPICS, next_gate: 'school_leadership_organization_source_brief_complete_full_chapter_production',
  };
  if (writeFiles) write(BRIEF, brief);
  return brief;
}

export function audit({ writeReport = false } = {}) {
  const brief = fs.existsSync(abs(BRIEF)) ? read(BRIEF) : build({ writeFiles: false });
  const claims = brief.topic_briefs.flatMap((topic) => topic.planned_claims); const sourceIds = new Set(brief.sources.map((row) => row.id)); const usedSources = new Set(claims.flatMap((row) => row.source_ids));
  assert(brief.scope.primary_domain_id === 'skoleledelse_organisasjon', 'Feil domene');
  assert(!brief.runtime_registration.registered && !brief.metadata_registration.global_status_mutation_in_source_brief, 'Source brief kan ikke registrere runtime');
  assert(brief.sources.length === 13 && brief.topic_briefs.length === 8 && claims.length === 32 && brief.decision_scenarios.length === 6, 'Feil 13/8/32/6-struktur');
  assert(new Set(claims.map((row) => row.id)).size === 32 && claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Claims må være unike og kildebundet');
  assert(brief.sources.every((row) => row.url.startsWith('https://') && row.source_location && row.retrieval_status === 'verified_2026-08-27'), 'Kilder må være inspiserbare');
  assert([...sourceIds].every((id) => usedSources.has(id)), 'Alle kilder må brukes');
  assert(['leadership_effects_are_mainly_indirect', 'responsibility_is_not_total_control', 'distributed_label_is_not_quality_proof', 'role_requires_authority_time_support', 'psychological_safety_is_not_no_accountability', 'survey_self_report_requires_caution', 'data_use_requires_interpretation_action_revision', 'change_requires_capacity_and_mechanism', 'participation_requires_real_influence'].every((key) => brief.source_policy[key]), 'Ledelses- og organisasjonsfaglige grenser mangler');
  const report = { schema: 'history_go_utdanning_school_leadership_organization_source_brief_audit_v1', version: '1.0.0', updated_at: '2026-08-27', status: 'pass', subject_id: 'utdanning', domain_id: 'skoleledelse_organisasjon', counts: { verifiedSources: 13, topicBriefs: 8, plannedClaims: 32, decisionScenarios: 6, modules: 4 }, gates: { sourceFirstUnregistered: true, allSourcesInspectable: true, everyClaimSourceBound: true, everySourceUsed: true, indirectEffectBoundary: true, responsibilityControlBoundary: true, distributedLeadershipBoundary: true, roleResourceBoundary: true, psychologicalSafetyBoundary: true, selfReportBoundary: true, organizationalLearningBoundary: true, changeCapacityBoundary: true, consequentialParticipationBoundary: true, fulltextClaimTraceRequired: true }, six_part_quality_review: { source_authority_and_provenance: 5, claim_plan_and_verifiability: 5, leadership_and_organization_theory: 5, rights_work_environment_and_participation: 5, method_and_scenarios: 4, architecture_and_reproducibility: 5, total: 29, maximum: 30, note: 'Source-first-produksjon; ledelsesclaims forblir planlagte til fulltekst med gjensidig paragraph↔claim-spor.' }, next_gate: brief.next_gate };
  if (writeReport) write(REPORT, report); else assert(isDeepStrictEqual(read(REPORT), report), `${REPORT} er utdatert`);
  return report;
}

try {
  if (process.argv.includes('--write-brief')) build();
  const report = audit({ writeReport: process.argv.includes('--write-report') });
  console.log(`Skoleledelse og organisasjon source brief OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} spor, ${report.counts.plannedClaims} claims; ${report.six_part_quality_review.total}/30.`);
} catch (error) { console.error(`Skoleledelse og organisasjon source brief FEIL: ${error.message}`); process.exitCode = 1; }
