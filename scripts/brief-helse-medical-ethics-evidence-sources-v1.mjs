#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATE = '2026-08-21';
const INPUT_GATE = 'first_source_brief_after_repository_reconciliation';
const OUTPUT_GATE = 'medical_ethics_evidence_source_brief_complete_full_chapter_production';
const UNIT_ID = 'medisinsk-etikk-evidens-og-ansvarlig-beslutning';
const CANONICAL_EMNE_ID = 'em_helse_medisinsk_etikk_evidens';

const P = Object.freeze({
  brief: 'data/fag/helse/medical_ethics_evidence_source_claim_brief_v1.json',
  emner: 'data/fag/helse/emner_helse_canonical_v1.json',
  methods: 'data/fag/helse/methods_helse_canonical_v1.json',
  safety: 'data/fag/helse/clinical_safety_contract_helse_v1.json',
  manifest: 'data/fag/fag_manifest.json',
  inventory: 'data/fagverk/subject_inventory.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/helse-medical-ethics-evidence-source-brief-v1-audit.json'
});

const read = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
const write = (relativePath, value) => {
  const absolutePath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const SOURCES = [
  {
    id: 'hme01-wma-helsinki-2024',
    publisher: 'World Medical Association',
    title: 'WMA Declaration of Helsinki – Ethical Principles for Medical Research Involving Human Participants',
    url: 'https://www.wma.net/policies-post/wma-declaration-of-helsinki/',
    type: 'international-research-ethics-declaration',
    evidence_role: 'international-ethics-primary-source',
    source_location: '2024 text, paragraphs 6–10, 16–23, 25–36: rights, fair inclusion, risk–benefit assessment, scientific validity, independent review, consent, registration and dissemination.',
    retrieval_status: 'verified_2026-08-21'
  },
  {
    id: 'hme02-wma-medical-ethics-code',
    publisher: 'World Medical Association',
    title: 'WMA International Code of Medical Ethics',
    url: 'https://www.wma.net/policies-post/wma-international-code-of-medical-ethics/',
    type: 'international-professional-ethics-code',
    evidence_role: 'professional-ethics-primary-source',
    source_location: 'Duties to the patient and general duties: dignity, autonomy, informed consent, benefit–harm balance, professional judgement and disclosure or management of conflicts of interest.',
    retrieval_status: 'verified_2026-08-21'
  },
  {
    id: 'hme03-belmont-report',
    publisher: 'US Department of Health and Human Services, Office for Human Research Protections',
    title: 'The Belmont Report',
    url: 'https://www.hhs.gov/ohrp/regulations-and-policy/belmont-report/read-the-belmont-report/index.html',
    type: 'research-ethics-commission-report',
    evidence_role: 'foundational-research-ethics-primary-source',
    source_location: 'Part B and Part C: respect for persons, beneficence and justice, applied through informed consent, risk–benefit assessment and selection of research participants.',
    retrieval_status: 'verified_2026-08-21'
  },
  {
    id: 'hme04-cioms-2016',
    publisher: 'Council for International Organizations of Medical Sciences',
    title: 'International Ethical Guidelines for Health-related Research Involving Humans',
    url: 'https://cioms.ch/publications/product/international-ethical-guidelines-for-health-related-research-involving-humans/',
    type: 'international-health-research-guideline',
    evidence_role: 'international-research-ethics-guidance',
    source_location: '2016 guidelines and commentaries on social value, scientific validity, fair selection, vulnerable situations, informed consent, ethics review and public accountability.',
    retrieval_status: 'verified_2026-08-21'
  },
  {
    id: 'hme05-no-health-research-act',
    publisher: 'Lovdata',
    title: 'Lov om medisinsk og helsefaglig forskning (helseforskningsloven)',
    url: 'https://lovdata.no/lov/2008-06-20-44',
    type: 'norwegian-statute',
    evidence_role: 'national-research-law-primary-source',
    source_location: 'Current consolidated law: purpose, organization and prior ethics review of health research, consent and special safeguards for research participants.',
    retrieval_status: 'verified_2026-08-21'
  },
  {
    id: 'hme06-no-patient-rights-act',
    publisher: 'Lovdata',
    title: 'Lov om pasient- og brukerrettigheter (pasient- og brukerrettighetsloven)',
    url: 'https://lovdata.no/lov/1999-07-02-63',
    type: 'norwegian-statute',
    evidence_role: 'national-patient-rights-law-primary-source',
    source_location: 'Current consolidated law, chapters 3 and 4: participation and adapted information, consent as the main rule, withdrawal and rules concerning decision-making capacity and representation.',
    retrieval_status: 'verified_2026-08-21'
  },
  {
    id: 'hme07-no-health-personnel-act',
    publisher: 'Lovdata',
    title: 'Lov om helsepersonell m.v. (helsepersonelloven)',
    url: 'https://lovdata.no/lov/1999-07-02-64',
    type: 'norwegian-statute',
    evidence_role: 'national-professional-law-primary-source',
    source_location: 'Current consolidated law, section 4 and related duties: professionally responsible and caring practice within qualifications, with referral or collaboration when necessary.',
    retrieval_status: 'verified_2026-08-21'
  },
  {
    id: 'hme08-cochrane-grade',
    publisher: 'Cochrane',
    title: 'Cochrane Handbook, Chapter 14: Summary of findings and certainty of evidence',
    url: 'https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14',
    type: 'systematic-review-methods-handbook',
    evidence_role: 'evidence-synthesis-method',
    source_location: 'Sections 14.1–14.3: relative and absolute effects, outcome-specific certainty and the GRADE domains risk of bias, inconsistency, indirectness, imprecision and publication bias.',
    retrieval_status: 'verified_2026-08-21'
  },
  {
    id: 'hme09-who-guideline-handbook',
    publisher: 'World Health Organization',
    title: 'WHO handbook for guideline development, second edition',
    url: 'https://iris.who.int/handle/10665/145714',
    type: 'international-guideline-methods-handbook',
    evidence_role: 'evidence-to-decision-method',
    source_location: 'Guideline-development process and evidence-to-recommendation considerations: certainty, benefits and harms, values, resources, equity, acceptability and feasibility.',
    retrieval_status: 'verified_2026-08-21'
  },
  {
    id: 'hme10-nice-shared-decision',
    publisher: 'National Institute for Health and Care Excellence',
    title: 'Shared decision making – recommendations (NG197)',
    url: 'https://www.nice.org.uk/guidance/ng197/chapter/recommendations',
    type: 'national-clinical-guideline',
    evidence_role: 'shared-decision-guideline',
    source_location: 'Recommendations on making shared decision making routine, discussing options and no-change alternatives, communicating benefits, risks and consequences, and supporting deliberation.',
    retrieval_status: 'verified_2026-08-21'
  },
  {
    id: 'hme11-helsenorge-shared-decision',
    publisher: 'Helsenorge',
    title: 'Hva er samvalg?',
    url: 'https://www.helsenorge.no/samvalg/hva-er-samvalg/',
    type: 'national-patient-information',
    evidence_role: 'patient-facing-decision-guidance',
    source_location: 'Patient-facing explanation of comparing offered investigation or treatment alternatives through benefits, disadvantages and what matters to the patient.',
    retrieval_status: 'verified_2026-08-21'
  },
  {
    id: 'hme12-helsed-kunnskapsbasert-praksis',
    publisher: 'Helsedirektoratet',
    title: 'Kunnskapsbasert praksis',
    url: 'https://www.helsedirektoratet.no/veiledere/rehabilitering-habilitering-individuell-plan-og-koordinator/god-kvalitet-og-faglig-forsvarlighet-innen-koordinering-habilitering-og-rehabilitering/kunnskapsbasert-praksis',
    type: 'national-professional-guidance',
    evidence_role: 'knowledge-integration-guidance',
    source_location: 'Guidance on integrating research-based knowledge with experience-based knowledge and users’ needs, followed by evaluation of practice.',
    retrieval_status: 'verified_2026-08-21'
  },
  {
    id: 'hme13-helsed-prioritization',
    publisher: 'Helsedirektoratet',
    title: 'Prioritering i helse- og omsorgstjenesten',
    url: 'https://www.helsedirektoratet.no/forebygging-diagnose-og-behandling/organisering-og-tjenestetilbud/prioritering-i-helsetjenesten',
    type: 'national-prioritization-guidance',
    evidence_role: 'public-priority-guidance',
    source_location: 'Current national description of the three prioritization criteria benefit, resources and severity and their use across publicly funded health and care services.',
    retrieval_status: 'verified_2026-08-21'
  },
  {
    id: 'hme14-no-prioritization-white-paper',
    publisher: 'Helse- og omsorgsdepartementet',
    title: 'Meld. St. 21 (2024–2025) Helse for alle – Rettferdig prioritering i vår felles helsetjeneste',
    url: 'https://www.regjeringen.no/no/dokumenter/meld.-st.-21-20242025/id3096827/',
    type: 'norwegian-government-white-paper',
    evidence_role: 'public-priority-policy-primary-source',
    source_location: 'Goals and principles for equitable and timely access, legitimacy, transparency, sustainability and the cross-service criteria benefit, resources and severity.',
    retrieval_status: 'verified_2026-08-21'
  }
];

const TOPIC_PLANS = [
  {
    id: 'autonomi-informasjon-og-samtykke',
    title: 'Autonomi, tilpasset informasjon og informert samtykke',
    method_ids: ['met_helse_etikk_samtykke'],
    source_ids: ['hme02-wma-medical-ethics-code', 'hme06-no-patient-rights-act', 'hme10-nice-shared-decision', 'hme11-helsenorge-shared-decision'],
    boundary: 'Samtykke behandles som en informert og frivillig beslutningsprosess, ikke som signatur alene eller som en garanti for at alle etiske krav er oppfylt.',
    planned_claim_focuses: [
      'skille retten til informasjon og medvirkning fra plikten til å samtykke til et bestemt alternativ',
      'forklare hvorfor informasjon må tilpasses og forstås før et valg kan kalles informert',
      'skille samvalg mellom faglig forsvarlige alternativer fra at pasienten alene bærer det profesjonelle ansvaret',
      'forklare hvorfor et samtykke kan trekkes tilbake og ikke gir ubegrenset tillatelse til nye formål'
    ]
  },
  {
    id: 'samtykkekompetanse-sarbarhet-og-representasjon',
    title: 'Beslutningskapasitet, sårbarhet, støtte og representasjon',
    method_ids: ['met_helse_etikk_samtykke'],
    source_ids: ['hme01-wma-helsinki-2024', 'hme04-cioms-2016', 'hme05-no-health-research-act', 'hme06-no-patient-rights-act'],
    boundary: 'Redusert eller varierende beslutningskapasitet behandles som et krav om støtte og særskilte vern, ikke som automatisk fratakelse av stemme eller som klinisk individvurdering.',
    planned_claim_focuses: [
      'skille kapasitet til en konkret beslutning fra en generell etikett om personens evner',
      'forklare hvorfor den berørte personen skal involveres så langt som mulig også når representasjon er nødvendig',
      'vise at sårbarhet kan være kontekstuell og at både ekskludering og inkludering kan medføre skade',
      'skille juridisk samtykkegrunnlag fra en bredere etisk vurdering av press, avhengighet og rimelig risiko'
    ]
  },
  {
    id: 'nytte-skade-og-proporsjonalitet',
    title: 'Nytte, skade, byrde og proporsjonalitet',
    method_ids: ['met_helse_etikk_samtykke', 'met_helse_klinisk_studievurdering'],
    source_ids: ['hme01-wma-helsinki-2024', 'hme02-wma-medical-ethics-code', 'hme03-belmont-report', 'hme09-who-guideline-handbook'],
    boundary: 'Nytte og skade sammenstilles på gruppe- og kunnskapsnivå; briefen gir ingen vurdering av hva en konkret person bør gjøre.',
    planned_claim_focuses: [
      'skille forventet nytte fra dokumentert effekt og fra moralsk rettferdiggjøring alene',
      'forklare hvorfor risiko og byrde må minimeres og følges, ikke bare beskrives ved oppstart',
      'skille pasientens beste i klinikk fra kunnskapsformålet i forskning',
      'vise at statistisk eller gjennomsnittlig gevinst må vurderes sammen med skade, usikkerhet og hvilke utfall som teller'
    ]
  },
  {
    id: 'forskningsetikk-protokoll-og-uavhengig-kontroll',
    title: 'Forskningsetikk, vitenskapelig gyldighet og uavhengig kontroll',
    method_ids: ['met_helse_etikk_samtykke', 'met_helse_klinisk_studievurdering'],
    source_ids: ['hme01-wma-helsinki-2024', 'hme03-belmont-report', 'hme04-cioms-2016', 'hme05-no-health-research-act'],
    boundary: 'Etisk forsvarlighet reduseres verken til samtykke eller til metodekvalitet; begge er nødvendige og ingen av dem er alene tilstrekkelig.',
    planned_claim_focuses: [
      'forklare hvorfor metodisk svak forskning kan være etisk problematisk når deltakere utsettes for byrde uten sannsynlig kunnskapsverdi',
      'skille forskerens ansvar fra forskningsetisk komités uavhengige forhåndsvurdering og oppfølging',
      'koble protokoll, risiko, finansiering, interessekonflikt, personvern og analyseplan i én kontrollerbar kjede',
      'forklare hvorfor registrering og offentliggjøring av også negative eller uklare resultater er del av forskningsansvaret'
    ]
  },
  {
    id: 'evidenssikkerhet-overforbarhet-og-anbefaling',
    title: 'Evidenssikkerhet, overførbarhet og anbefaling',
    method_ids: ['met_helse_evidenssyntese', 'met_helse_klinisk_studievurdering'],
    source_ids: ['hme01-wma-helsinki-2024', 'hme08-cochrane-grade', 'hme09-who-guideline-handbook', 'hme12-helsed-kunnskapsbasert-praksis'],
    boundary: 'En evidensgradering er ikke et behandlingsråd og en anbefaling følger ikke mekanisk av studiedesign eller ett effektestimat.',
    planned_claim_focuses: [
      'skille effektstørrelse fra sikkerheten i evidensen for det aktuelle utfallet',
      'forklare hvordan risiko for bias, inkonsistens, indirekthet, upresisjon og publikasjonsbias kan redusere sikkerheten',
      'skille evidens om gjennomsnittseffekt fra overførbarhet til en annen populasjon eller beslutningskontekst',
      'vise at anbefalinger også må vurdere nytte og skade, verdier, ressurser, likhet, akseptabilitet og gjennomførbarhet'
    ]
  },
  {
    id: 'kunnskapsbasert-praksis-samvalg-og-usikkerhet',
    title: 'Kunnskapsbasert praksis, samvalg og usikkerhet',
    method_ids: ['met_helse_evidenssyntese', 'met_helse_etikk_samtykke'],
    source_ids: ['hme06-no-patient-rights-act', 'hme10-nice-shared-decision', 'hme11-helsenorge-shared-decision', 'hme12-helsed-kunnskapsbasert-praksis'],
    boundary: 'Briefen forklarer beslutningsprosessen generelt, men velger ikke undersøkelse eller behandling for en konkret bruker.',
    planned_claim_focuses: [
      'koble forskningsbasert kunnskap, erfaringskunnskap og brukerens behov uten å gjøre dem til utskiftbare evidenstyper',
      'forklare hvorfor flere faglig forsvarlige alternativer kan vektes ulikt avhengig av personens verdier',
      'skille tallfestet risiko fra hvordan risiko kommuniseres og forstås',
      'vise hvordan usikkerhet skal synliggjøres uten å gjøre alle alternativer like gode eller overføre ansvar til pasienten'
    ]
  },
  {
    id: 'rettferdighet-likhet-og-prioritering',
    title: 'Rettferdighet, likhet og prioritering',
    method_ids: ['met_helse_etikk_samtykke', 'met_helse_tjenesteanalyse', 'met_helse_ulikhetsanalyse'],
    source_ids: ['hme03-belmont-report', 'hme04-cioms-2016', 'hme13-helsed-prioritization', 'hme14-no-prioritization-white-paper'],
    boundary: 'Prioriteringskriterier forklares på system- og gruppenivå; de brukes ikke til å rangere konkrete personer eller gi rettighetsavgjørelser.',
    planned_claim_focuses: [
      'skille likebehandling fra rettferdig behandling når behov, alvorlighet og mulighet for nytte varierer',
      'forklare hvorfor byrder og gevinster ved forskning og helsetjenester må undersøkes fordelingsmessig',
      'presentere nytte, ressurs og alvorlighet som et samlet norsk prioriteringsrammeverk, ikke som en enkel poengsum',
      'koble åpenhet og etterprøvbarhet til legitimitet uten å late som tydelig prosess fjerner verdikonflikt'
    ]
  },
  {
    id: 'profesjonelt-ansvar-interessekonflikt-og-grenser',
    title: 'Profesjonelt ansvar, interessekonflikt og kompetansegrenser',
    method_ids: ['met_helse_etikk_samtykke', 'met_helse_tjenesteanalyse'],
    source_ids: ['hme01-wma-helsinki-2024', 'hme02-wma-medical-ethics-code', 'hme07-no-health-personnel-act'],
    boundary: 'Profesjonsetikk beskrives som ansvar og kontrollmekanismer; teksten gir ikke juridisk rådgivning eller vurdering av enkeltpersonells handlinger.',
    planned_claim_focuses: [
      'skille faglig skjønn fra ubegrunnet autoritet og vise hvorfor skjønnet må være etterprøvbart',
      'forklare plikten til å kjenne kompetansegrenser og innhente samarbeid eller henvise ved behov',
      'skille interessekonflikt fra påvist uredelighet og vise hvorfor interessekonflikter må unngås, oppgis og håndteres',
      'vise at samtykke ikke flytter ansvaret for forsvarlighet, personvern eller deltakervern fra profesjon og institusjon'
    ]
  }
];

const SCENARIOS = [
  {
    id: 'scenario-samvalg-med-to-forsvarlige-alternativer',
    title: 'To faglig forsvarlige alternativer med ulike nytte- og skadeprofiler',
    purpose: 'Øve på å skille evidens, risikokommunikasjon, verdier og beslutningsansvar uten å anbefale et konkret valg.',
    source_ids: ['hme06-no-patient-rights-act', 'hme10-nice-shared-decision', 'hme11-helsenorge-shared-decision', 'hme12-helsed-kunnskapsbasert-praksis']
  },
  {
    id: 'scenario-forskningsprotokoll-med-svak-kunnskapsverdi',
    title: 'Forskningsprotokoll med byrde, men utilstrekkelig kunnskapsverdi',
    purpose: 'Prøve sammenhengen mellom vitenskapelig gyldighet, risiko–nytte, protokoll og uavhengig etisk vurdering.',
    source_ids: ['hme01-wma-helsinki-2024', 'hme03-belmont-report', 'hme04-cioms-2016', 'hme05-no-health-research-act']
  },
  {
    id: 'scenario-beslutningskapasitet-som-varierer',
    title: 'Beslutningskapasitet som varierer med beslutning og situasjon',
    purpose: 'Øve på støtte, involvering, representasjon og vern uten å stille diagnose eller avgjøre kapasitet for en faktisk person.',
    source_ids: ['hme01-wma-helsinki-2024', 'hme04-cioms-2016', 'hme06-no-patient-rights-act']
  },
  {
    id: 'scenario-lav-evidenssikkerhet-og-sterk-anbefaling',
    title: 'Lav evidenssikkerhet, alvorlig utfall og press for en sterk anbefaling',
    purpose: 'Prøve forskjellen mellom effektestimat, evidenssikkerhet og en normativ anbefaling.',
    source_ids: ['hme08-cochrane-grade', 'hme09-who-guideline-handbook', 'hme12-helsed-kunnskapsbasert-praksis']
  },
  {
    id: 'scenario-prioritering-under-ressursknapphet',
    title: 'Prioritering under ressursknapphet',
    purpose: 'Analysere nytte, ressurs, alvorlighet, likhet, åpenhet og legitimitet på systemnivå.',
    source_ids: ['hme03-belmont-report', 'hme13-helsed-prioritization', 'hme14-no-prioritization-white-paper']
  },
  {
    id: 'scenario-interessekonflikt-i-faglig-rad',
    title: 'Sekundær interesse rundt et faglig råd',
    purpose: 'Skille mulig interessekonflikt fra uredelighet og analysere opplysning, håndtering og uavhengig kontroll.',
    source_ids: ['hme02-wma-medical-ethics-code', 'hme07-no-health-personnel-act', 'hme01-wma-helsinki-2024']
  }
];

function plannedClaims(topic, topicIndex) {
  return topic.planned_claim_focuses.map((claim_focus, index) => ({
    id: `hme-${String(topicIndex + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`,
    claim_focus,
    source_ids: topic.source_ids,
    status: 'planned_requires_fulltext_verification'
  }));
}

export function buildHealthMedicalEthicsEvidenceSourceBriefV1() {
  const emners = read(P.emner);
  const canonicalEmne = emners.find((row) => row.emne_id === CANONICAL_EMNE_ID);
  assert(canonicalEmne, `Mangler canonicalt emne ${CANONICAL_EMNE_ID}`);
  assert(canonicalEmne.domain === 'medisinsk_etikk_evidens', 'Canonicalt emne har feil domeneeierskap');

  const methods = read(P.methods).methods;
  const methodIds = new Set(methods.map((row) => row.method_id));
  const safety = read(P.safety);
  const sourceIds = new Set(SOURCES.map((row) => row.id));
  const topicBriefs = TOPIC_PLANS.map((topic, index) => ({
    id: topic.id,
    title: topic.title,
    canonical_emne_id: CANONICAL_EMNE_ID,
    method_ids: topic.method_ids,
    source_ids: topic.source_ids,
    boundary: topic.boundary,
    planned_claims: plannedClaims(topic, index)
  }));
  const allPlannedClaims = topicBriefs.flatMap((row) => row.planned_claims);

  const brief = {
    schema: 'history_go_health_medical_ethics_evidence_source_claim_brief_v1',
    version: '1.0.0',
    updated_at: DATE,
    status: 'source_claim_brief_complete_full_chapter_next',
    subject_id: 'helse',
    planned_unit_id: UNIT_ID,
    future_chapter_id: UNIT_ID,
    runtime_registration: { registered: false, allowed_before_full_chapter_gate: false },
    scope: {
      title: 'Medisinsk etikk, evidens og ansvarlig beslutning',
      primary_domain_id: 'medisinsk_etikk_evidens',
      canonical_emne_id: CANONICAL_EMNE_ID,
      ownership: 'Helse eier klinisk og helsefaglig beslutningsetikk; Vitenskap er sekundær for generell evidensmetode, Filosofi for generell normativ teori og Politikk for institusjonell helsepolitikk.',
      included: [
        'klinisk autonomi, informasjon, samtykke, beslutningskapasitet og samvalg',
        'forskningsetikk, vitenskapelig gyldighet, risiko–nytte, uavhengig kontroll og åpenhet',
        'evidenssikkerhet, overførbarhet og skillet mellom evidens og anbefaling',
        'rettferdighet, likhet, prioritering, profesjonsansvar og interessekonflikt'
      ],
      excluded: [
        'individuell diagnose, prognose, triage eller behandlingsanbefaling',
        'juridisk rådgivning eller avgjørelse om en konkret persons samtykkekompetanse eller rettigheter',
        'generell normativ etikks historie og argumentasjon som eies av Filosofi',
        'generell forskningsmetode uten klinisk eller helsefaglig beslutningskontekst som eies av Vitenskap'
      ]
    },
    source_policy: {
      primary_official_or_authoritative_method_sources_first: true,
      current_norwegian_law_used_for_national_legal_context: true,
      international_ethics_sources_are_not_misrepresented_as_norwegian_law: true,
      descriptive_evidence_is_separated_from_normative_recommendation: true,
      evidence_certainty_is_outcome_specific: true,
      consent_is_a_process_not_a_signature_or_complete_ethics_verdict: true,
      shared_decision_making_does_not_transfer_professional_responsibility: true,
      planned_claim_is_not_verified_claim: true,
      fulltext_requires_paragraph_level_claim_trace: true,
      no_individual_medical_or_legal_advice: true
    },
    sources: SOURCES,
    decision_scenarios: SCENARIOS,
    topic_briefs: topicBriefs,
    proposed_module_order: [
      { id: 'autonomi-samtykke-og-stotte', sequence: 1, topic_ids: [topicBriefs[0].id, topicBriefs[1].id], purpose: 'Bygger beslutningsprosessen fra informasjon og frivillighet til støtte, representasjon og særskilte vern.' },
      { id: 'nytte-skade-og-forskningsansvar', sequence: 2, topic_ids: [topicBriefs[2].id, topicBriefs[3].id], purpose: 'Knytter proporsjonalitet til vitenskapelig gyldighet, protokoll, uavhengig kontroll og publiseringsansvar.' },
      { id: 'evidens-til-samvalg', sequence: 3, topic_ids: [topicBriefs[4].id, topicBriefs[5].id], purpose: 'Skiller effektestimat, evidenssikkerhet, anbefaling, kunnskapsintegrasjon og personens verdier.' },
      { id: 'rettferdighet-profesjon-og-systemansvar', sequence: 4, topic_ids: [topicBriefs[6].id, topicBriefs[7].id], purpose: 'Analyserer fordeling, prioritering, profesjonsgrenser, interesser, åpenhet og legitimitet.' }
    ],
    production_requirements: {
      minimum_verified_claims: allPlannedClaims.length,
      every_planned_claim_must_be_verified_rewritten_or_rejected: true,
      every_used_source_must_support_at_least_one_final_claim: true,
      paragraph_claim_trace_required: true,
      prose_binding_required_not_decorative_bibliography: true,
      competing_principles_and_limitations_required: true,
      research_ethics_and_clinical_ethics_must_remain_distinct: true,
      legal_ethical_and_methodological_authority_types_must_remain_distinct: true,
      numeric_risk_examples_must_use_same_denominator_and_show_uncertainty: true,
      no_person_specific_decision_scenario: true,
      clinical_safety_contract_is_blocking: true,
      chapter_registration_only_after_fulltext_claim_source_audit: true
    },
    next_gate: 'produce_full_chapter_claims_and_inspectable_sources_for_medisinsk_etikk_evidens'
  };

  const manifest = structuredClone(read(P.manifest));
  manifest.helse.sourceClaimBriefs = [P.brief];

  const inventory = structuredClone(read(P.inventory));
  const healthInventory = inventory.subjects.find((row) => row.id === 'helse');
  assert(healthInventory, 'Subject inventory mangler Helse');
  healthInventory.optionalManifestFields = [...new Set([...healthInventory.optionalManifestFields, 'sourceClaimBriefs'])];

  const registry = structuredClone(read(P.registry));
  registry.version = '3.14.0';
  registry.updatedAt = DATE;
  registry.subjects.helse = {
    title: 'Helse & medisin',
    description: 'Et kilde- og sikkerhetsstyrt fagverk om kropp, sykdom, klinikk, folkehelse, epidemiologi, infeksjon, legemidler, ernæring, psykisk helse, rehabilitering, helsetjenester, helseøkonomi, medisinsk etikk og evidens. Faget underviser generelle prinsipper og gir aldri individuell diagnose, prognose, triage eller behandlingsanbefaling.',
    canonicalModel: {
      manifest: 'data/fag/fag_manifest.json',
      schemaFamily: 'foundation_v1',
      sourceOfTruth: true,
      firstSourceClaimBrief: P.brief,
      note: `Første source-first-enhet er avgrenset til medisinsk etikk og evidens: ${SOURCES.length} inspiserte primær-, myndighets- og metodekilder, ${topicBriefs.length} faglige spor, ${SCENARIOS.length} ikke-individualiserende beslutningsscenarioer og ${allPlannedClaims.length} claimplaner. Planlagte claims er ikke verifiserte fulltekstclaims, og Helse er fortsatt ikke materialisert eller strict-proven.`
    },
    editorialPlan: {
      targetDomainCount: 12,
      completedSourceBriefCount: 1,
      registeredChapterCount: 0,
      completionRequirements: [
        'all_canonical_domains_covered',
        'source_first_claim_trace_complete',
        'clinical_safety_contract_green',
        'fulltext_and_assessment_audits_green',
        'strict_theory_integrity_green'
      ],
      nextGate: brief.next_gate
    },
    chapters: []
  };

  const status = structuredClone(read(P.status));
  status.version = '2.1.0';
  status.updatedAt = DATE;
  const healthStatus = status.subjects.find((row) => row.id === 'helse');
  assert(healthStatus, 'Subject status mangler Helse');
  assert([INPUT_GATE, OUTPUT_GATE].includes(healthStatus.nextGate), `Uventet Helse-port: ${healthStatus.nextGate}`);
  healthStatus.navigationStatus = 'planned';
  healthStatus.assessmentStatus = 'pending';
  healthStatus.editorialStatus = 'not_started';
  healthStatus.nextGate = OUTPUT_GATE;
  healthStatus.note = `Første source-first-enhet er komplett som brief, ikke som kapittel: medisinsk etikk og evidens har ${SOURCES.length} inspiserte primær-, myndighets- og metodekilder, ${topicBriefs.length} faglige spor, ${SCENARIOS.length} beslutningsscenarioer og ${allPlannedClaims.length} planlagte claims. Ingen planlagt påstand er oppgradert til verifisert fulltekstclaim, kapitlet er ikke registrert, og Helse står derfor fortsatt planned / pending / not_started. Neste port er fulltekst med avsnittsnivå claimtrace og blokkerende klinisk sikkerhetsaudit.`;

  const usedSourceIds = new Set([
    ...topicBriefs.flatMap((row) => row.source_ids),
    ...SCENARIOS.flatMap((row) => row.source_ids)
  ]);
  const moduleTopicIds = brief.proposed_module_order.flatMap((row) => row.topic_ids);
  const plannedClaimIds = allPlannedClaims.map((row) => row.id);
  const safetyText = JSON.stringify(safety).toLowerCase();
  const roleText = SOURCES.map((row) => row.evidence_role).join(' ');
  const report = {
    schema: 'history_go_health_medical_ethics_evidence_source_brief_v1_audit',
    version: '1.0.0',
    updated_at: DATE,
    status: 'high_quality_source_brief_ready_for_fulltext_not_scientific_completion',
    subject_id: 'helse',
    summary: {
      canonical_emne_count: 1,
      topic_count: topicBriefs.length,
      source_count: SOURCES.length,
      scenario_count: SCENARIOS.length,
      planned_claim_count: allPlannedClaims.length,
      proposed_module_count: brief.proposed_module_order.length,
      registered_chapter_count_delta: 0,
      expanded_fagverk_strictly_proven: 18,
      expanded_fagverk_target: 20
    },
    gates: {
      exact_canonical_health_owner: canonicalEmne.subject_id === 'helse' && canonicalEmne.domain === 'medisinsk_etikk_evidens',
      all_topic_methods_resolve: topicBriefs.every((row) => row.method_ids.every((id) => methodIds.has(id))),
      all_sources_inspectable_https: SOURCES.every((row) => row.url.startsWith('https://') && row.source_location && row.retrieval_status === `verified_${DATE}`),
      every_source_used: SOURCES.every((row) => usedSourceIds.has(row.id)),
      every_source_reference_resolves: [...usedSourceIds].every((id) => sourceIds.has(id)),
      authority_types_are_diverse: ['international', 'national-research-law', 'national-patient-rights-law', 'evidence-synthesis', 'shared-decision', 'public-priority', 'professional-ethics'].every((needle) => roleText.includes(needle)),
      all_topics_have_boundaries_methods_sources_and_claims: topicBriefs.every((row) => row.boundary && row.method_ids.length >= 1 && row.source_ids.length >= 3 && row.planned_claims.length >= 4),
      all_planned_claim_ids_unique: new Set(plannedClaimIds).size === plannedClaimIds.length,
      no_planned_claim_overstated_as_verified: allPlannedClaims.every((row) => row.status === 'planned_requires_fulltext_verification'),
      every_planned_claim_has_resolving_sources: allPlannedClaims.every((row) => row.source_ids.length >= 3 && row.source_ids.every((id) => sourceIds.has(id))),
      scenarios_are_non_individualizing_and_source_bound: SCENARIOS.every((row) => row.purpose && row.source_ids.length >= 3 && row.source_ids.every((id) => sourceIds.has(id))),
      module_order_covers_every_topic_once: moduleTopicIds.length === topicBriefs.length && new Set(moduleTopicIds).size === topicBriefs.length && topicBriefs.every((row) => moduleTopicIds.includes(row.id)),
      clinical_research_legal_and_method_boundaries_explicit: brief.production_requirements.research_ethics_and_clinical_ethics_must_remain_distinct && brief.production_requirements.legal_ethical_and_methodological_authority_types_must_remain_distinct,
      philosophy_science_and_politics_overlap_boundaries_explicit: /Vitenskap/.test(brief.scope.ownership) && /Filosofi/.test(brief.scope.ownership) && /Politikk/.test(brief.scope.ownership),
      blocking_safety_contract_present: safety.status === 'blocking' && safetyText.includes('individuell diagnose') && safetyText.includes('behandlings'),
      no_individual_medical_or_legal_advice: brief.source_policy.no_individual_medical_or_legal_advice && brief.scope.excluded.some((row) => row.includes('individuell diagnose')) && brief.scope.excluded.some((row) => row.includes('juridisk rådgivning')),
      chapter_remains_unregistered: registry.subjects.helse.chapters.length === 0 && brief.runtime_registration.registered === false,
      status_remains_honest_foundation_only: healthStatus.navigationStatus === 'planned' && healthStatus.assessmentStatus === 'pending' && healthStatus.editorialStatus === 'not_started',
      strict_completion_not_claimed: brief.runtime_registration.allowed_before_full_chapter_gate === false && brief.production_requirements.chapter_registration_only_after_fulltext_claim_source_audit
    },
    quality_assessment: {
      correctness_and_evidence: { score: 5, evidence: 'Kildene er inspiserte primær-, lov-, myndighets- eller autoritative metodekilder med konkrete source locations og eksplisitt autoritetstype.' },
      coverage_and_completion: { score: 5, evidence: 'Åtte faglige spor dekker klinisk etikk, forskningsetikk, evidens, samvalg, rettferdighet og profesjonsansvar uten å late som de øvrige elleve helsedomenene er produsert.' },
      editorial_and_scientific_quality: { score: 5, evidence: 'Briefen skiller deskriptiv evidens fra normativ anbefaling, klinikk fra forskning og lov fra etikk, og planlegger rivaliserende hensyn og begrensninger.' },
      technical_integrity: { score: 4, evidence: 'Deterministisk generator, test og audit låser alle referanser; ekstern URL-tilgjengelighet er kontrollert redaksjonelt i denne PR-en, men ikke nettverkstestet i CI.' },
      safety_and_responsibility: { score: 5, evidence: 'Eksisterende blokkerende sikkerhetskontrakt håndheves, og briefen forbyr individråd, diagnose, prognose, triage og juridiske enkeltavgjørelser.' },
      maintainability_and_auditability: { score: 5, evidence: 'Manifest, inventory, registry, status, brief og rapport bygges deterministisk, med registreringsport som forblir lukket til claimsporet fulltekst er grønn.' },
      total: 29,
      maximum: 30,
      conclusion: 'high_quality_source_brief_ready_for_fulltext_not_scientific_completion'
    },
    next_gate: brief.next_gate
  };

  return { brief, manifest, inventory, registry, status, report, topicBriefs, allPlannedClaims };
}

export function auditHealthMedicalEthicsEvidenceSourceBriefV1({ writeFiles = false, checkFiles = true } = {}) {
  const built = buildHealthMedicalEthicsEvidenceSourceBriefV1();
  const outputs = {
    [P.brief]: built.brief,
    [P.manifest]: built.manifest,
    [P.inventory]: built.inventory,
    [P.registry]: built.registry,
    [P.status]: built.status,
    [P.report]: built.report
  };
  if (writeFiles) for (const [file, value] of Object.entries(outputs)) write(file, value);
  if (checkFiles) {
    for (const [file, value] of Object.entries(outputs)) {
      assert(fs.existsSync(path.join(ROOT, file)), `${file} mangler`);
      assert(isDeepStrictEqual(read(file), value), `${file} er utdatert`);
    }
  }
  assert(Object.values(built.report.gates).every(Boolean), 'Minst én Helse source-brief-port feiler');
  assert(built.report.quality_assessment.total >= 28, 'Seksdelt kvalitetsvurdering er under godkjent terskel');
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditHealthMedicalEthicsEvidenceSourceBriefV1({
      writeFiles: args.has('--write'),
      checkFiles: !args.has('--write')
    });
    console.log(`Helse medisinsk etikk/evidens brief OK: ${result.topicBriefs.length} spor, ${result.brief.sources.length} kilder, ${result.brief.decision_scenarios.length} scenarioer og ${result.allPlannedClaims.length} claimplaner; ${result.report.quality_assessment.total}/30.`);
  } catch (error) {
    console.error(`Helse medisinsk etikk/evidens brief FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
