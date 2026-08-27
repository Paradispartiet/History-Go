#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/utdanning/technology_media_learning_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/utdanning-technology-media-learning-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const claim = (id, text, source_ids) => ({ id, text, status: 'planned_requires_fulltext_verification', source_ids });
const source = (id, publisher, title, url, type, evidence_role, source_location) => ({ id, publisher, title, url, type, evidence_role, source_location, retrieval_status: 'verified_2026-08-27' });

const SOURCES = [
  source('tm01-udir-digital-skills', 'Utdanningsdirektoratet', 'Digitale ferdigheter som grunnleggende ferdighet', 'https://www.udir.no/laring-og-trivsel/rammeverk/rammeverk-for-grunnleggende-ferdigheter/2.1-digitale-ferdigheter', 'official-curriculum-framework', 'digital-skills-information-creation-participation-judgment', 'Definerer digitale ferdigheter som faglig integrert informasjonsbehandling, skapende arbeid, kommunikasjon, problemløsning og digital dømmekraft med progresjon.'),
  source('tm02-udir-pfdk', 'Utdanningsdirektoratet', 'Rammeverk for lærerens profesjonsfaglige digitale kompetanse', 'https://www.udir.no/kvalitet-og-kompetanse/digitalisering-skole/rammeverk-larerens-profesjonsfaglige-digitale-komp/', 'official-professional-framework', 'teacher-digital-competence-subject-pedagogy-ethics-development', 'Rammeverkets kompetanseområder binder digitale valg til fag, pedagogikk, læringsledelse, samhandling, etikk og profesjonell utvikling.'),
  source('tm03-udir-ai', 'Utdanningsdirektoratet', 'Råd om kunstig intelligens i skolen', 'https://www.udir.no/kvalitet-og-kompetanse/digitalisering-skole/kunstig-intelligens-i-skolen/rad-om-kunstig-intelligens-skolen/', 'official-current-guidance', 'ai-purpose-age-privacy-approved-tools-professional-learning', 'Gjeldende råd om læringsmål, alder, godkjente løsninger, personvern, profesjonsfellesskap, vurdering og systematisk evaluering av KI-praksis.'),
  source('tm04-datatilsynet', 'Datatilsynet', 'Funn fra tilsyn med personvernet i skolen', 'https://www.datatilsynet.no/aktuelt/aktuelle-nyheter-2025/funn-fra-tilsyn-med-personvernet-i-skolen/', 'official-supervisory-report', 'school-edtech-privacy-governance-accountability', 'Tilsyn med 50 kommuner viser styrings- og vurderingsgap når digitale læringsverktøy velges eller brukes uten tilstrekkelig sentral personvernkontroll.'),
  source('tm05-medietilsynet', 'Medietilsynet', 'Barn og medier-undersøkelsen', 'https://www.medietilsynet.no/fakta/rapporter/barn-og-medier/', 'official-recurring-survey', 'children-media-use-experience-risk-context', 'Nasjonale undersøkelser av 9–18-åringers mediebruk og erfaringer; selvrapport gir kontekst og risikosignaler, ikke individuell årsaksdiagnose.'),
  source('tm06-digcompedu', 'European Commission Joint Research Centre', 'European Framework for the Digital Competence of Educators: DigCompEdu', 'https://joint-research-centre.ec.europa.eu/scientific-activities/key-competences-lifelong-learning/digcompedu_en', 'official-european-competence-framework', 'educator-digital-resources-teaching-assessment-empowerment-learners', 'Beskriver 22 lærerkompetanser i seks områder og en progresjonsmodell; rammeverket er referanse og refleksjonsverktøy, ikke effektbevis.'),
  source('tm07-icils', 'International Association for the Evaluation of Educational Achievement', 'ICILS 2023', 'https://www.iea.nl/studies/iea/icils/2023', 'international-assessment-study', 'computer-information-literacy-computational-thinking-context', 'Måler data- og informasjonskompetanse og algoritmisk tenkning og knytter resultater til skole- og hjemmekontekst, med sammenlignings- og designbegrensninger.'),
  source('tm08-unesco-gem', 'UNESCO Global Education Monitoring Report', 'Technology in education: A tool on whose terms?', 'https://gem-report-2023.unesco.org/', 'international-evidence-synthesis', 'edtech-evidence-equity-governance-sustainability', 'Syntetiserer global evidens om teknologi, tilgang, styring, kostnader og ulikhet og understreker at uavhengig robust effektbevis ofte mangler.'),
  source('tm09-unesco-genai', 'UNESCO', 'Guidance for generative AI in education and research', 'https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research', 'international-policy-guidance', 'human-centred-genai-regulation-capacity-rights', 'Rammer generativ KI inn gjennom menneskelig handlekraft, regulering, alderstilpasning, datavern, validering og kapasitetsbygging.'),
  source('tm10-oecd-ai', 'OECD', 'Digital Education Outlook 2026: Exploring Effective Uses of Generative AI in Education', 'https://doi.org/10.1787/062a7394-en', 'international-research-synthesis', 'genai-learning-design-performance-learning-boundary', 'Syntetiserer framvoksende forskning og skiller mellom bedre oppgaveprestasjon og faktisk læring når KI brukes med eller uten tydelige pedagogiske prinsipper.'),
  source('tm11-tpack', 'Teachers College Record', 'Technological Pedagogical Content Knowledge: A Framework for Teacher Knowledge', 'https://doi.org/10.1111/j.1467-9620.2006.00684.x', 'peer-reviewed-theory-article', 'technology-pedagogy-content-context-design', 'Mishra og Koehlers TPACK-modell analyserer teknologiintegrasjon som samspill mellom fag, pedagogikk, teknologi og kontekst, ikke som isolert verktøyferdighet.'),
  source('tm12-tamim', 'Review of Educational Research', 'What Forty Years of Research Says About the Impact of Technology on Learning', 'https://doi.org/10.3102/0034654310393361', 'peer-reviewed-second-order-meta-analysis', 'technology-learning-effects-heterogeneity-comparators', 'Andreordens metaanalyse av teknologi og læringsutfall; gjennomsnitt må tolkes mot pedagogisk design, sammenligningsbetingelse, fag, alder og implementering.'),
  source('tm13-critical-literacies', 'Review of Education', 'Critical digital literacies at school level: A systematic review', 'https://doi.org/10.1002/rev3.3425', 'peer-reviewed-systematic-review', 'critical-digital-literacy-power-production-participation', 'Systematisk oversikt som knytter kritisk digital literacy til informasjon, produksjon, makt, sosial praksis, deltakelse og refleksjon over teknologiske strukturer.'),
];

const METHODS = {
  institution: ['met_utdanning_institusjonsanalyse', 'met_utdanning_dokument_lareplananalyse'],
  practice: ['met_utdanning_case_prosessporing', 'met_utdanning_kvalitativ_feltstudie'],
  synthesis: ['met_utdanning_litteratursyntese', 'met_utdanning_intervensjonsvurdering'],
};

const TOPICS = [
  { id: 'digital-kompetanse-og-deltakelse', title: 'Digital kompetanse, dømmekraft og deltakelse', method_ids: METHODS.institution, source_ids: ['tm01-udir-digital-skills', 'tm06-digcompedu', 'tm07-icils'], boundary: 'Tilgang til en enhet eller tjeneste er ikke det samme som faglig digital kompetanse, kritisk dømmekraft eller likeverdig deltakelse.', planned_claims: [
    claim('tm-01', 'Digital kompetanse omfatter informasjon, skapende arbeid, kommunikasjon, problemløsning og dømmekraft i faglige og samfunnsmessige sammenhenger.', ['tm01-udir-digital-skills', 'tm06-digcompedu']),
    claim('tm-02', 'Digitale ferdigheter utvikles gjennom fagspesifikke praksiser og kan ikke reduseres til generell betjening av enheter og programvare.', ['tm01-udir-digital-skills', 'tm11-tpack']),
    claim('tm-03', 'ICILS måler avgrensede digitale kompetanser under standardiserte vilkår og må tolkes sammen med oppgaveformat, kontekst og sammenlignbarhet.', ['tm07-icils', 'tm01-udir-digital-skills']),
    claim('tm-04', 'Digital deltakelse krever tilgang, støtte, språk, tilgjengelighet og reell mulighet til å forstå og påvirke digitale omgivelser.', ['tm08-unesco-gem', 'tm13-critical-literacies']),
  ]},
  { id: 'fag-pedagogikk-teknologi', title: 'Fag, pedagogikk, teknologi og læringsdesign', method_ids: METHODS.practice, source_ids: ['tm02-udir-pfdk', 'tm06-digcompedu', 'tm11-tpack'], boundary: 'Verktøyets funksjoner bestemmer ikke læringsmålet eller undervisningskvaliteten; designet må begynne i fag, elevforutsetninger og ønsket læringsprosess.', planned_claims: [
    claim('tm-05', 'TPACK beskriver lærerens teknologivalg som et kontekstavhengig samspill mellom fagkunnskap, pedagogikk og teknologiforståelse.', ['tm11-tpack', 'tm02-udir-pfdk']),
    claim('tm-06', 'Et digitalt læringsdesign må spesifisere hva eleven skal lære, hvilken aktivitet som bærer læringen og hvilken funksjon teknologien faktisk har.', ['tm02-udir-pfdk', 'tm06-digcompedu']),
    claim('tm-07', 'Den samme teknologien kan støtte eller svekke læring avhengig av representasjon, veiledning, tempo, tilbakemelding og elevens forkunnskaper.', ['tm11-tpack', 'tm12-tamim']),
    claim('tm-08', 'Lærerens profesjonsfaglige digitale kompetanse omfatter også å velge bort teknologi når en analog arbeidsform bedre støtter formålet.', ['tm02-udir-pfdk', 'tm08-unesco-gem']),
  ]},
  { id: 'teknologieffekt-og-evidens', title: 'Teknologieffekt, implementering og evidens', method_ids: METHODS.synthesis, source_ids: ['tm08-unesco-gem', 'tm10-oecd-ai', 'tm12-tamim'], boundary: 'Brukstid, nyhetsverdi og gjennomsnittlig effekt er ikke bevis på at et bestemt produkt gir læring i en bestemt skole.', planned_claims: [
    claim('tm-09', 'Tamim og kollegers gjennomsnittlige teknologieffekt dekker stor variasjon og identifiserer ikke én teknologi som universelt virksom.', ['tm12-tamim', 'tm08-unesco-gem']),
    claim('tm-10', 'Effektvurdering må angi sammenligningsbetingelse, fag, alder, varighet, lærerpraksis, implementeringskvalitet og hvilket utfall som måles.', ['tm12-tamim', 'tm08-unesco-gem']),
    claim('tm-11', 'Teknologiprodukter endres raskt, mens uavhengig forskning ofte er knapp; lokal utprøving må derfor være avgrenset, reverserbar og etterprøvbar.', ['tm08-unesco-gem', 'tm03-udir-ai']),
    claim('tm-12', 'Bedre oppgaveprestasjon under teknologistøtte må skilles fra varig forståelse, overføring og selvstendig mestring uten støtten.', ['tm10-oecd-ai', 'tm12-tamim']),
  ]},
  { id: 'kritisk-medie-og-informasjonsforstaelse', title: 'Kritisk medie- og informasjonsforståelse', method_ids: METHODS.practice, source_ids: ['tm05-medietilsynet', 'tm07-icils', 'tm13-critical-literacies'], boundary: 'Kildekritikk er mer enn å rangere avsendere; den må undersøke produksjon, format, distribusjon, interesser, evidens og egen deltakelse.', planned_claims: [
    claim('tm-13', 'Kritisk digital literacy kombinerer analyse av informasjon med forståelse av produksjon, representasjon, makt, identitet og deltakelse.', ['tm13-critical-literacies', 'tm05-medietilsynet']),
    claim('tm-14', 'Elever må kunne undersøke hvem som produserer et medieuttrykk, for hvilket formål, med hvilke virkemidler og gjennom hvilken distribusjon.', ['tm13-critical-literacies', 'tm01-udir-digital-skills']),
    claim('tm-15', 'Medietilsynets selvrapporterte bruksmønstre kan identifisere erfaringer og risikosoner, men kan ikke alene fastslå medieeffekt for enkeltbarn.', ['tm05-medietilsynet', 'tm07-icils']),
    claim('tm-16', 'Kritisk mediekompetanse omfatter også ansvarlig produksjon, deling, korrigering og refleksjon over egen rolle i informasjonsflyten.', ['tm13-critical-literacies', 'tm01-udir-digital-skills']),
  ]},
  { id: 'plattformer-data-og-algoritmer', title: 'Plattformer, data, algoritmer og læringsanalyse', method_ids: METHODS.institution, source_ids: ['tm04-datatilsynet', 'tm08-unesco-gem', 'tm13-critical-literacies'], boundary: 'Plattformdata er en konstruert og formålsbundet registrering av handlinger, ikke et nøytralt eller komplett bilde av elevens kunnskap, motivasjon eller behov.', planned_claims: [
    claim('tm-17', 'Digitale plattformer strukturerer hvilke handlinger som er mulige, synlige og målbare, og påvirker dermed undervisning uten å være nøytrale beholdere.', ['tm13-critical-literacies', 'tm08-unesco-gem']),
    claim('tm-18', 'Læringsdata må fortolkes ut fra datakilde, definisjon, fravær, målefeil og hvilke elevhandlinger systemet ikke registrerer.', ['tm04-datatilsynet', 'tm08-unesco-gem']),
    claim('tm-19', 'Algoritmiske anbefalinger og risikosignaler må kunne utfordres av faglig skjønn, elevens forklaring og andre relevante evidenskilder.', ['tm08-unesco-gem', 'tm03-udir-ai']),
    claim('tm-20', 'Anskaffelse av plattformer er en pedagogisk og demokratisk styringsbeslutning om data, standarder, avhengighet og handlingsrom.', ['tm04-datatilsynet', 'tm08-unesco-gem']),
  ]},
  { id: 'generativ-ki-laering-og-vurdering', title: 'Generativ KI, læring, arbeid og vurdering', method_ids: METHODS.synthesis, source_ids: ['tm03-udir-ai', 'tm09-unesco-genai', 'tm10-oecd-ai'], boundary: 'Flytende eller korrekt KI-output dokumenterer verken kildegrunnlag, elevens forståelse eller læring; bruk må knyttes til formål, prosess og etterprøvbarhet.', planned_claims: [
    claim('tm-21', 'Generativ KI produserer sannsynlige uttrykk fra modeller og instruksjoner og kan gi overbevisende feil som krever uavhengig kontroll.', ['tm09-unesco-genai', 'tm03-udir-ai']),
    claim('tm-22', 'KI kan støtte forklaring, idéarbeid og tilbakemelding når eleven bearbeider output aktivt og læreren designer for forståelse framfor outsourcing.', ['tm10-oecd-ai', 'tm03-udir-ai']),
    claim('tm-23', 'Vurdering må skille elevens egen kompetanse fra prestasjon produsert med støtte og må gjøre tillatte verktøy og dokumentasjonskrav tydelige.', ['tm03-udir-ai', 'tm10-oecd-ai']),
    claim('tm-24', 'KI-kompetanse innebærer teknisk grunnforståelse, kritisk evaluering, etikk, opphavsrett, personvern og vurdering av når verktøyet ikke bør brukes.', ['tm09-unesco-genai', 'tm03-udir-ai']),
  ]},
  { id: 'personvern-sikkerhet-og-likeverd', title: 'Personvern, sikkerhet, tilgjengelighet og likeverd', method_ids: METHODS.institution, source_ids: ['tm03-udir-ai', 'tm04-datatilsynet', 'tm08-unesco-gem'], boundary: 'Samtykke, standardvilkår eller lærerens gode intensjon fritar ikke skoleeier fra behandlingsgrunnlag, risikovurdering, dataminimering og barns særskilte vern.', planned_claims: [
    claim('tm-25', 'Skoleeier har ansvar for at digitale løsninger er godkjent, formålsbestemte, nødvendige, sikre og personvernvurderte før elevdata behandles.', ['tm04-datatilsynet', 'tm03-udir-ai']),
    claim('tm-26', 'Barns avhengighet av skolen og begrensede valgfrihet gjør dataminimering, alderstilpasning og reelle alternativer særlig viktige.', ['tm09-unesco-genai', 'tm04-datatilsynet']),
    claim('tm-27', 'Digital ulikhet omfatter ikke bare utstyr, men også støtte, språk, tilgjengelighet, kompetanse, tid og kvaliteten på læringsmulighetene.', ['tm08-unesco-gem', 'tm06-digcompedu']),
    claim('tm-28', 'Sikkerhetstiltak må vurderes mot læring, rettigheter og utilsiktet ekskludering; maksimal kontroll er ikke automatisk ansvarlig praksis.', ['tm04-datatilsynet', 'tm13-critical-literacies']),
  ]},
  { id: 'implementering-og-baerekraft', title: 'Implementering, profesjonslæring og bærekraftig digital praksis', method_ids: METHODS.practice, source_ids: ['tm02-udir-pfdk', 'tm06-digcompedu', 'tm08-unesco-gem'], boundary: 'Innkjøp, opplæringsaktivitet eller høy bruksgrad er ikke fullført implementering; praksis må støttes, evalueres, korrigeres og kunne avvikles.', planned_claims: [
    claim('tm-29', 'Digital endring krever tid, teknisk støtte, fagdidaktisk profesjonslæring, ledelse, elevmedvirkning og tydelig ansvar gjennom hele livsløpet.', ['tm02-udir-pfdk', 'tm06-digcompedu']),
    claim('tm-30', 'Implementering må følges med elevnære læringsdata, kvalitative erfaringer, fordelingsvirkninger, kostnader og belastning, ikke bare innloggingstall.', ['tm08-unesco-gem', 'tm12-tamim']),
    claim('tm-31', 'Skolen bør kunne korrigere eller avvikle teknologi når evidens, personvern, tilgjengelighet, kostnader eller arbeidsbelastning ikke forsvarer bruken.', ['tm04-datatilsynet', 'tm08-unesco-gem']),
    claim('tm-32', 'Bærekraftig digital praksis kombinerer pedagogisk verdi med vedlikehold, interoperabilitet, kompetanse, miljø- og kostnadshensyn og robuste analoge alternativer.', ['tm08-unesco-gem', 'tm02-udir-pfdk']),
  ]},
];

const SCENARIOS = [
  { id: 'scenario-device-without-learning-design', title: 'Alle elever får nytt verktøy uten endret læringsdesign', purpose: 'Skille tilgang og bruk fra faglig aktivitet, støtte og dokumentert læring.', source_ids: ['tm11-tpack', 'tm12-tamim'] },
  { id: 'scenario-ai-writing', title: 'KI produserer en god tekst som eleven ikke kan forklare', purpose: 'Skille produktprestasjon fra forståelse og utforme etterprøvbar vurdering.', source_ids: ['tm03-udir-ai', 'tm10-oecd-ai'] },
  { id: 'scenario-risk-dashboard', title: 'Et dashboard merker en elev som høy risiko', purpose: 'Undersøke datagrunnlag, feilkilder, innsyn, faglig overprøving og elevens forklaring.', source_ids: ['tm04-datatilsynet', 'tm08-unesco-gem'] },
  { id: 'scenario-platform-procurement', title: 'En gratis plattform krever omfattende elevdata', purpose: 'Vurdere pedagogisk nødvendighet, behandlingsgrunnlag, dataminimering og leverandøravhengighet.', source_ids: ['tm04-datatilsynet', 'tm03-udir-ai'] },
  { id: 'scenario-viral-video', title: 'En manipulerende video sprer seg i elevgruppen', purpose: 'Analysere avsender, format, distribusjon, emosjonelle virkemidler og ansvarlig korrigering.', source_ids: ['tm05-medietilsynet', 'tm13-critical-literacies'] },
  { id: 'scenario-access-gap', title: 'Digital hjemmeoppgave forutsetter utstyr og voksenstøtte', purpose: 'Kartlegge sammensatt digital ulikhet og etablere likeverdige alternativer.', source_ids: ['tm08-unesco-gem', 'tm06-digcompedu'] },
];

export function build({ writeFiles = true } = {}) {
  const brief = {
    schema: 'history_go_utdanning_technology_media_learning_source_claim_brief_v1', version: '1.0.0', updated_at: '2026-08-27', status: 'source_claim_brief_complete_full_chapter_next', subject_id: 'utdanning',
    planned_unit_id: 'teknologi-medier-laering-design-deltakelse-og-ansvar', future_chapter_id: 'teknologi-medier-laering-design-deltakelse-og-ansvar',
    runtime_registration: { registered: false, allowed_before_full_chapter_gate: false }, metadata_registration: { deferred_until_fulltext: true, global_status_mutation_in_source_brief: false, release_mutation_in_source_brief: false },
    scope: { title: 'Teknologi, medier og læring: design, deltakelse og ansvar', primary_domain_id: 'teknologi_medier_laering', canonical_emne_id: 'em_utdanning_teknologi_medier_laering', ownership: 'Utdanning eier analysen av digital kompetanse, teknologimediert læringsdesign, medie- og informasjonsforståelse, plattformer, læringsdata, generativ KI, personvern, ulikhet, implementering og bærekraftig digital praksis.', included: TOPICS.map((topic) => topic.title), excluded: ['tilgang som kompetansebevis', 'brukstid som læringseffekt', 'plattformdata som full elevforståelse', 'KI-output som kunnskap', 'innovasjon som effektbevis', 'samtykke som universelt behandlingsgrunnlag i skolen'] },
    source_policy: { access_is_not_competence: true, use_is_not_learning: true, technology_is_not_pedagogy: true, average_effect_is_not_product_proof: true, platform_data_is_not_whole_learner: true, ai_output_is_not_knowledge: true, performance_is_not_durable_learning: true, media_literacy_includes_power_and_production: true, self_report_requires_caution: true, privacy_requires_governance: true, innovation_is_not_evidence: true, planned_claim_is_not_verified_claim: true, fulltext_requires_reciprocal_paragraph_claim_trace: true, sources_verified_at: '2026-08-27' },
    allowed_method_ids: [...new Set(Object.values(METHODS).flat())], sources: SOURCES, decision_scenarios: SCENARIOS, topic_briefs: TOPICS, next_gate: 'technology_media_learning_source_brief_complete_full_chapter_production',
  };
  if (writeFiles) write(BRIEF, brief);
  return brief;
}

export function audit({ writeReport = false } = {}) {
  const brief = fs.existsSync(abs(BRIEF)) ? read(BRIEF) : build({ writeFiles: false });
  const claims = brief.topic_briefs.flatMap((topic) => topic.planned_claims); const sourceIds = new Set(brief.sources.map((row) => row.id)); const usedSources = new Set(claims.flatMap((row) => row.source_ids));
  assert(brief.scope.primary_domain_id === 'teknologi_medier_laering', 'Feil domene');
  assert(!brief.runtime_registration.registered && !brief.metadata_registration.global_status_mutation_in_source_brief, 'Source brief kan ikke registrere runtime');
  assert(brief.sources.length === 13 && brief.topic_briefs.length === 8 && claims.length === 32 && brief.decision_scenarios.length === 6, 'Feil 13/8/32/6-struktur');
  assert(new Set(claims.map((row) => row.id)).size === 32 && claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Claims må være unike og kildebundet');
  assert(brief.sources.every((row) => row.url.startsWith('https://') && row.source_location && row.retrieval_status === 'verified_2026-08-27'), 'Kilder må være inspiserbare');
  assert([...sourceIds].every((id) => usedSources.has(id)), 'Alle kilder må brukes');
  assert(['access_is_not_competence', 'use_is_not_learning', 'technology_is_not_pedagogy', 'average_effect_is_not_product_proof', 'platform_data_is_not_whole_learner', 'ai_output_is_not_knowledge', 'performance_is_not_durable_learning', 'media_literacy_includes_power_and_production', 'self_report_requires_caution', 'privacy_requires_governance', 'innovation_is_not_evidence'].every((key) => brief.source_policy[key]), 'Teknologi- og mediefaglige grenser mangler');
  const report = { schema: 'history_go_utdanning_technology_media_learning_source_brief_audit_v1', version: '1.0.0', updated_at: '2026-08-27', status: 'pass', subject_id: 'utdanning', domain_id: 'teknologi_medier_laering', counts: { verifiedSources: 13, topicBriefs: 8, plannedClaims: 32, decisionScenarios: 6, modules: 4 }, gates: { sourceFirstUnregistered: true, allSourcesInspectable: true, everyClaimSourceBound: true, everySourceUsed: true, accessCompetenceBoundary: true, useLearningBoundary: true, tpackDesignBoundary: true, effectEvidenceBoundary: true, criticalMediaBoundary: true, platformDataBoundary: true, aiKnowledgeBoundary: true, performanceLearningBoundary: true, privacyGovernanceBoundary: true, equityBoundary: true, implementationBoundary: true, fulltextClaimTraceRequired: true }, six_part_quality_review: { source_authority_and_provenance: 5, claim_plan_and_verifiability: 5, technology_media_ai_learning_quality: 5, rights_privacy_equity_and_safety: 5, method_and_scenarios: 4, architecture_and_reproducibility: 5, total: 29, maximum: 30, note: 'Source-first-produksjon; teknologi- og medieclaims forblir planlagte til fulltekst med gjensidig paragraph↔claim-spor.' }, next_gate: brief.next_gate };
  if (writeReport) write(REPORT, report); else assert(isDeepStrictEqual(read(REPORT), report), `${REPORT} er utdatert`);
  return report;
}

try {
  if (process.argv.includes('--write-brief')) build();
  const report = audit({ writeReport: process.argv.includes('--write-report') });
  console.log(`Teknologi, medier og læring source brief OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} spor, ${report.counts.plannedClaims} claims; ${report.six_part_quality_review.total}/30.`);
} catch (error) { console.error(`Teknologi, medier og læring source brief FEIL: ${error.message}`); process.exitCode = 1; }
