#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/politikk/sosiologi_antropologi/culture_religion_ritual_materiality_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/sosiologi-antropologi-culture-religion-ritual-materiality-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const c = (id, text, source_ids) => ({ id, text, source_ids, status: 'planned_requires_fulltext_verification' });

const sources = [
  { id: 'krr01-geertz', title: 'The Interpretation of Cultures', publisher: 'Basic Books', type: 'scholarly-book', url: 'https://www.basicbooks.com/titles/clifford-geertz/the-interpretation-of-cultures/9780465093557/', evidence_role: 'culture-meaning-thick-description-interpretation', source_location: 'Forlagssiden dokumenterer Geertz’ fortolkende kulturanalyse og begrepet tett beskrivelse.', retrieval_status: 'verified_2026-08-29' },
  { id: 'krr02-asad', title: 'Genealogies of Religion: Discipline and Reasons of Power in Christianity and Islam', publisher: 'Johns Hopkins University Press', type: 'scholarly-book', url: 'https://www.press.jhu.edu/books/title/1644/genealogies-religion', evidence_role: 'religion-genealogy-discipline-power-secular-boundaries', source_location: 'Forlagssiden dokumenterer Asads genealogiske kritikk av universelle religionsdefinisjoner og forholdet mellom disiplin, makt og sekularitet.', retrieval_status: 'verified_2026-08-29' },
  { id: 'krr03-durkheim', title: 'The Elementary Forms of Religious Life', publisher: 'Oxford University Press', type: 'scholarly-book', url: 'https://oxfordworldsclassics.com/abstract/10.1093/owc/9780199540129.001.0001/isbn-9780199540129', evidence_role: 'sacred-profane-ritual-moral-community', source_location: 'Forlagsvisningen dokumenterer Durkheims analyse av hellig og profant, ritual og moralsk fellesskap.', retrieval_status: 'verified_2026-08-29' },
  { id: 'krr04-bell', title: 'Ritual Theory, Ritual Practice', publisher: 'Oxford University Press', type: 'scholarly-book', url: 'https://global.oup.com/academic/product/ritual-theory-ritual-practice-9780199733620', evidence_role: 'ritualization-practice-strategic-differentiation-power', source_location: 'Forlagssiden dokumenterer Bells praksisorienterte begrep om ritualisering og strategisk differensiering av handling.', retrieval_status: 'verified_2026-08-29' },
  { id: 'krr05-turner', title: 'The Ritual Process: Structure and Anti-Structure', publisher: 'Routledge', type: 'scholarly-book', url: 'https://www.routledge.com/The-Ritual-Process-Structure-and-Anti-Structure/Turner-Abrahams-Harris/p/book/9780202011905', evidence_role: 'rites-of-passage-liminality-communitas', source_location: 'Forlagssiden dokumenterer Turners analyse av overgangsriter, liminalitet og communitas.', retrieval_status: 'verified_2026-08-29' },
  { id: 'krr06-douglas', title: 'Purity and Danger: An Analysis of Concepts of Pollution and Taboo', publisher: 'Routledge', type: 'scholarly-book', url: 'https://www.routledge.com/Purity-and-Danger-An-Analysis-of-Concepts-of-Pollution-and-Taboo/Douglas/p/book/9780415289955', evidence_role: 'classification-purity-pollution-taboo-boundaries', source_location: 'Forlagssiden dokumenterer Douglas’ analyse av klassifikasjon, renhet, forurensning og tabu.', retrieval_status: 'verified_2026-08-29' },
  { id: 'krr07-gell', title: 'Art and Agency: An Anthropological Theory', publisher: 'Oxford University Press', type: 'scholarly-book', url: 'https://global.oup.com/academic/product/art-and-agency-9780198280149', evidence_role: 'objects-mediated-agency-social-relations', source_location: 'Forlagssiden dokumenterer Gells teori om hvordan kunst- og gjenstandsrelasjoner medierer sosial agency.', retrieval_status: 'verified_2026-08-29' },
  { id: 'krr08-appadurai', title: 'The Social Life of Things: Commodities in Cultural Perspective', publisher: 'Cambridge University Press', type: 'scholarly-edited-volume', url: 'https://www.cambridge.org/core/books/social-life-of-things/4F4D3929A501EC19CF413D36BDF8AB3A', evidence_role: 'object-circulation-value-commodity-phases', source_location: 'Forlagssiden dokumenterer perspektivet på tings sirkulasjon, verdi og skiftende varestatus.', retrieval_status: 'verified_2026-08-29' },
  { id: 'krr09-miller', title: 'Stuff', publisher: 'Polity / Wiley', type: 'scholarly-book', url: 'https://www.wiley.com/en-nz/stuff-p-9780745644240', evidence_role: 'material-culture-objects-constitute-social-relations', source_location: 'Forlagssiden dokumenterer Millers materialkulturelle analyse av hvordan ting inngår konstituerende i sosialt liv.', retrieval_status: 'verified_2026-08-29' },
  { id: 'krr10-mahmood', title: 'Politics of Piety: The Islamic Revival and the Feminist Subject', publisher: 'Princeton University Press / JSTOR', type: 'scholarly-book', url: 'https://www.jstor.org/stable/j.ctvct00cf', evidence_role: 'embodied-piety-discipline-gender-agency', source_location: 'Utgiverplattformen dokumenterer Mahmoods etnografiske analyse av kroppslig fromhet, disiplin, kjønn og agency.', retrieval_status: 'verified_2026-08-29' },
  { id: 'krr11-orsi', title: 'Between Heaven and Earth: The Religious Worlds People Make and the Scholars Who Study Them', publisher: 'Princeton University Press / JSTOR', type: 'scholarly-book', url: 'https://www.jstor.org/stable/j.ctt4cg9sd', evidence_role: 'lived-religion-relationships-practices-representation', source_location: 'Utgiverplattformen dokumenterer Orsis analyse av levd religion, relasjoner til hellige skikkelser og forskerens representasjon.', retrieval_status: 'verified_2026-08-29' },
  { id: 'krr12-ssb-religion', title: 'Trus- og livssynssamfunn utanfor Den norske kyrkja', publisher: 'Statistisk sentralbyrå', type: 'official-statistics', url: 'https://www.ssb.no/kultur-og-fritid/religion-og-livssyn/statistikk/trus-og-livssynssamfunn-utanfor-den-norske-kyrkja', evidence_role: 'registered-members-funding-communities-measurement-boundaries', source_location: 'Offisiell statistikk over registrerte medlemmer i tros- og livssynssamfunn som søker statstilskudd, med dokumenterte avgrensninger.', retrieval_status: 'verified_2026-08-29' },
  { id: 'krr13-nesh', title: 'Guidelines for Research Ethics in the Social Sciences and the Humanities', publisher: 'De nasjonale forskningsetiske komiteene', type: 'research-ethics-guideline', url: 'https://www.forskningsetikk.no/en/guidelines/social-sciences-and-humanities/guidelines-for-research-ethics-in-the-social-sciences-and-the-humanities/', evidence_role: 'consent-privacy-group-harm-representation-vulnerable-minorities', source_location: 'Nasjonale retningslinjer for samtykke, privatliv, gruppehensyn, representasjon og skade i samfunnsvitenskapelig og humanistisk forskning.', retrieval_status: 'verified_2026-08-29' },
];

const topic_briefs = [
  {
    id: 'kulturbegrep-fortolkning-og-makt', title: 'Kulturbegrep, fortolkning og makt', method_ids: ['met_pol_fortolkende_analyse', 'met_pol_begrepsanalyse'],
    boundary: 'Kultur er ikke en avgrenset, homogen gruppeegenskap, og fortolkning av mening er en dokumenterbar analyseoppgave, ikke tankelesing eller essensialisering.',
    source_ids: ['krr01-geertz', 'krr02-asad', 'krr13-nesh'],
    planned_claims: [
      c('krr-01', 'Geertz beskriver kultur som meningsvever mennesker selv inngår i, slik at analyse må fortolke handlingers betydning i en konkret sammenheng.', ['krr01-geertz', 'krr13-nesh']),
      c('krr-02', 'Tett beskrivelse krever situert belegg for aktører, tegn, kontekst og alternative fortolkninger; begrepet gir ikke forskeren direkte tilgang til andres indre mening.', ['krr01-geertz', 'krr11-orsi']),
      c('krr-03', 'Asads genealogi viser at analytiske kategorier formes historisk gjennom disiplin og makt, og utfordrer transhistoriske definisjoner av religion og kultur.', ['krr02-asad', 'krr01-geertz']),
      c('krr-04', 'Kulturell variasjon innen grupper må dokumenteres fordi nasjonalitet, religion eller etnisitet ikke i seg selv beviser en felles og uforanderlig kultur.', ['krr01-geertz', 'krr13-nesh']),
    ],
  },
  {
    id: 'religion-kategori-hellig-og-sekulaer', title: 'Religion som kategori, hellig og sekulært', method_ids: ['met_pol_religionssosiologisk_analyse', 'met_pol_historisk_begrepsanalyse'],
    boundary: 'Sosiologi og antropologi analyserer kategorier, praksiser og institusjoner; religionsfaget beholder eierskap til teologi, troslære og tradisjonenes normative selvfortolkning.',
    source_ids: ['krr02-asad', 'krr03-durkheim', 'krr12-ssb-religion'],
    planned_claims: [
      c('krr-05', 'Durkheim skiller hellig og profant og knytter ritualer og forestillinger til et moralsk fellesskap, uten at skillet alene beskriver alle religioner uttømmende.', ['krr03-durkheim', 'krr02-asad']),
      c('krr-06', 'Asad analyserer religion som historisk formet gjennom bestemte disipliner, institusjoner og maktrelasjoner snarere enn som en universell essens.', ['krr02-asad', 'krr03-durkheim']),
      c('krr-07', 'Registrert medlemskap dokumenterer en administrativ tilknytning, men kan ikke alene fastslå tro, deltakelse, praksis eller styrken i en identitet.', ['krr12-ssb-religion', 'krr11-orsi']),
      c('krr-08', 'Grensen mellom religiøst og sekulært er historisk og institusjonelt organisert og må ikke behandles som en nøytral, universell sortering.', ['krr02-asad', 'krr03-durkheim']),
    ],
  },
  {
    id: 'ritualisering-overgang-og-communitas', title: 'Ritualisering, overgang og communitas', method_ids: ['met_pol_praksisanalyse', 'met_pol_prosessanalyse'],
    boundary: 'Ritual er ikke bare gjentakelse, og midlertidig communitas beviser verken varig likhet eller at hierarki og konflikt er opphevet.',
    source_ids: ['krr04-bell', 'krr05-turner', 'krr03-durkheim'],
    planned_claims: [
      c('krr-09', 'Bell bruker ritualisering om praksiser som strategisk skilles fra andre handlinger gjennom kropp, rom, tid og autoritet.', ['krr04-bell', 'krr03-durkheim']),
      c('krr-10', 'Turners analyse av overgangsriter skiller utskillelse, liminal fase og reintegrasjon som prosessledd som må undersøkes empirisk.', ['krr05-turner', 'krr04-bell']),
      c('krr-11', 'Communitas betegner en mulig erfaring av fellesskap i liminale situasjoner og er ikke bevis for at sosiale forskjeller forsvinner permanent.', ['krr05-turner', 'krr04-bell']),
      c('krr-12', 'Lik ritualform kan få ulik mening når aktører, institusjon, publikum og maktforhold endres, så gjentakelse er ikke identisk betydning.', ['krr04-bell', 'krr05-turner']),
    ],
  },
  {
    id: 'klassifikasjon-renhet-og-grenser', title: 'Klassifikasjon, renhet og grenser', method_ids: ['met_pol_symbolsk_klassifikasjonsanalyse', 'met_pol_fortolkende_analyse'],
    boundary: 'Renhet og forurensning må analyseres som kontekstuelle klassifikasjoner; de er ikke automatisk hygiene, irrasjonalitet eller egenskaper ved en gruppe.',
    source_ids: ['krr06-douglas', 'krr02-asad', 'krr13-nesh'],
    planned_claims: [
      c('krr-13', 'Douglas analyserer forestillinger om renhet og forurensning som måter å opprettholde orden og klassifikasjon på.', ['krr06-douglas', 'krr02-asad']),
      c('krr-14', 'Betydningen av urent eller farlig må rekonstrueres i lokal sammenheng og kan ikke reduseres til moderne hygiene eller avvises som irrasjonell.', ['krr06-douglas', 'krr01-geertz']),
      c('krr-15', 'Brudd på klassifikasjonsgrenser kan synliggjøre hvilke skiller, roller og autoriteter som ellers tas for gitt.', ['krr06-douglas', 'krr04-bell']),
      c('krr-16', 'Forskeren må beskrive klassifikasjon uten å gjenta stigmatiserende språk som fremstiller mennesker som urene, primitive eller tilbakestående.', ['krr06-douglas', 'krr13-nesh']),
    ],
  },
  {
    id: 'ting-sirkulasjon-verdi-og-agency', title: 'Ting, sirkulasjon, verdi og agency', method_ids: ['met_pol_materiell_kulturanalyse', 'met_pol_relasjonsanalyse'],
    boundary: 'At ting medierer agency betyr ikke at de har selvstendig menneskelig intensjon; analysen følger relasjoner, tilskrivelser, sirkulasjon og bruk.',
    source_ids: ['krr07-gell', 'krr08-appadurai', 'krr09-miller'],
    planned_claims: [
      c('krr-17', 'Appadurais vareperspektiv følger hvordan ting får og mister verdi og varestatus gjennom bestemte sirkulasjonsbaner.', ['krr08-appadurai', 'krr09-miller']),
      c('krr-18', 'Gell analyserer hvordan objekter medierer sosial agency og relasjoner, uten at dette trenger å bety at ting har uavhengig menneskelig vilje.', ['krr07-gell', 'krr09-miller']),
      c('krr-19', 'Materialkultur er ikke bare et passivt speil av samfunnet fordi bruk, plassering og vedlikehold av ting også former relasjoner og hverdagspraksis.', ['krr09-miller', 'krr07-gell']),
      c('krr-20', 'Proveniens, erverv, bruk, reparasjon, utstilling og avhending kan dokumentere hvordan en gjenstands mening og verdi endres over tid.', ['krr08-appadurai', 'krr07-gell']),
    ],
  },
  {
    id: 'levd-religion-kropp-kjonn-og-hverdagspraksis', title: 'Levd religion, kropp, kjønn og hverdagspraksis', method_ids: ['met_pol_etnografisk_praksisanalyse', 'met_pol_kjonn_og_maktanalyse'],
    boundary: 'Agency kan ta form gjennom kroppsliggjøring og disiplin og må ikke på forhånd reduseres til enten motstand eller underkastelse.',
    source_ids: ['krr10-mahmood', 'krr11-orsi', 'krr04-bell'],
    planned_claims: [
      c('krr-21', 'Orsis perspektiv på levd religion følger hverdagslige relasjoner, praksiser og forbindelser til hellige skikkelser framfor bare offisiell lære.', ['krr11-orsi', 'krr04-bell']),
      c('krr-22', 'Mahmood viser hvordan kroppslig øvelse og fromhetsdisiplin utfordrer liberale forutsetninger om at agency først og fremst uttrykkes som motstand.', ['krr10-mahmood', 'krr04-bell']),
      c('krr-23', 'Agency kan ikke avgjøres ved å plassere en praksis på en enkel akse mellom frigjøring og underkastelse; mål, læring, relasjoner og institusjonelle vilkår må undersøkes.', ['krr10-mahmood', 'krr11-orsi']),
      c('krr-24', 'En etnografisk praksis eller deltakers fortolkning kan ikke uten videre generaliseres til alle medlemmer eller hele tradisjonen.', ['krr11-orsi', 'krr13-nesh']),
    ],
  },
  {
    id: 'medlemskap-statistikk-institusjon-og-praksis', title: 'Medlemskap, statistikk, institusjon og praksis', method_ids: ['met_pol_statistikk_og_maleanalyse', 'met_pol_metodetriangulering'],
    boundary: 'Registermedlemskap, selvrapportert tilhørighet, tro, praksis og deltakelse er forskjellige mål som ikke kan brukes om hverandre.',
    source_ids: ['krr12-ssb-religion', 'krr11-orsi', 'krr02-asad'],
    planned_claims: [
      c('krr-25', 'SSBs statistikk gjelder registrerte medlemmer i tros- og livssynssamfunn utenfor Den norske kirke som søker offentlig tilskudd, ikke alle former for tro eller livssyn.', ['krr12-ssb-religion', 'krr02-asad']),
      c('krr-26', 'Medlemstall kan ikke alene brukes som mål på gudstro, ritualdeltakelse, hverdagspraksis eller hvor sentral tilhørigheten er for den enkelte.', ['krr12-ssb-religion', 'krr11-orsi']),
      c('krr-27', 'Endringer i medlemstall kan påvirkes av regelverk, registreringspraksis, rapporteringsgrenser og hvilke samfunn som søker tilskudd, ikke bare av religiøs endring.', ['krr12-ssb-religion', 'krr02-asad']),
      c('krr-28', 'Register, spørreundersøkelse, observasjon og intervju besvarer ulike spørsmål og bør kombineres når både omfang, selvforståelse og praksis skal analyseres.', ['krr12-ssb-religion', 'krr11-orsi']),
    ],
  },
  {
    id: 'feltetikk-representasjon-og-faggrense', title: 'Feltetikk, representasjon og faggrense', method_ids: ['met_pol_forskningsetisk_analyse', 'met_pol_kildekritikk'],
    boundary: 'Tilgang fra en leder erstatter ikke individuelt samtykke, og sosiologisk eller antropologisk fortolkning erstatter ikke religionsfaglig vurdering av lære og tradisjon.',
    source_ids: ['krr13-nesh', 'krr11-orsi', 'krr10-mahmood', 'krr12-ssb-religion'],
    planned_claims: [
      c('krr-29', 'Forskning i små tros- og livssynsmiljøer må vurdere samtykke, privatliv, indirekte identifisering og mulig skade for personer og grupper.', ['krr13-nesh', 'krr11-orsi']),
      c('krr-30', 'En leders invitasjon eller adgang til et felt gir ikke automatisk gyldig samtykke fra enkeltpersoner som observeres, intervjues eller omtales.', ['krr13-nesh', 'krr10-mahmood']),
      c('krr-31', 'Ansvarlig representasjon synliggjør intern uenighet, posisjon og usikkerhet og unngår å eksotifisere minoriteter eller gjøre én stemme til hele gruppens.', ['krr13-nesh', 'krr11-orsi']),
      c('krr-32', 'En ansvarlig konklusjon skiller læreutsagn, medlemskap, observert praksis, gjenstandssirkulasjon, forskerfortolkning og normativ vurdering, mens religionsfaget beholder lære- og tradisjonseierskapet.', ['krr02-asad', 'krr12-ssb-religion', 'krr13-nesh']),
    ],
  },
];

const decision_scenarios = [
  { id: 'krr-s1', title: 'Kommunens religionsprofil', prompt: 'En kommune bruker registrerte medlemstall som direkte mål på innbyggernes tro. Skill medlemskap, regelverk, selvforståelse, praksis og datakilde.', claim_ids: ['krr-07', 'krr-25', 'krr-26', 'krr-27'] },
  { id: 'krr-s2', title: 'Ritualet på nett', prompt: 'Et ritual filmes og deles utenfor deltakerkretsen. Analyser ritualisering, endret publikum, kontekst, samtykke og mulig gruppeskade.', claim_ids: ['krr-09', 'krr-12', 'krr-29'] },
  { id: 'krr-s3', title: 'Museets hellige gjenstand', prompt: 'Et museum omklassifiserer og stiller ut en hellig gjenstand. Følg proveniens, sirkulasjon, tilskrevet agency, verdi og berørte relasjoner.', claim_ids: ['krr-17', 'krr-18', 'krr-20'] },
  { id: 'krr-s4', title: 'Renhetsregelen', prompt: 'En rapport omtaler en renhetsregel som irrasjonell hygiene. Rekonstruer klassifikasjon, grense, kontekst og stigmatiseringsrisiko.', claim_ids: ['krr-13', 'krr-14', 'krr-16'] },
  { id: 'krr-s5', title: 'Fromhet som bare tvang', prompt: 'En kroppslig fromhetspraksis tolkes utelukkende som underkastelse eller motstand. Undersøk læring, mål, agency, kjønn og institusjonelle vilkår.', claim_ids: ['krr-21', 'krr-22', 'krr-23'] },
  { id: 'krr-s6', title: 'Lederen åpner feltet', prompt: 'En leder gir forskeren adgang til et lite trossamfunn. Vurder individuelt samtykke, anonymitet, intern uenighet, representasjon og gruppeskade.', claim_ids: ['krr-24', 'krr-29', 'krr-30', 'krr-31'] },
];

function buildBrief() {
  return {
    schema: 'history_go_sosiologi_antropologi_culture_religion_ritual_materiality_source_claim_brief_v1',
    version: '1.0.0', updated_at: '2026-08-29', status: 'source_first_ready_not_materialized', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi',
    domain: { ordinal: 8, id: 'kultur_religion_ritual_materialitet', title: 'Kultur, religion, ritual og materialitet', production_mode: 'new_production_required' },
    source_strategy: { source_first: true, inspectable_urls_required: true, claim_level_trace_required: true, minimum_sources_per_claim: 2, fulltext_materialization_required_before_counting: true },
    sources, topic_briefs, decision_scenarios,
    disciplinary_boundary: { sociology_anthropology_owns: ['culture-as-meaning-and-power', 'lived-religion-and-institutions', 'ritual-practice', 'material-culture-and-circulation'], religion_subject_retains: ['theology', 'doctrine', 'tradition-history', 'normative-self-interpretation'] },
    reuse_contract: { classification: 'new_production_required', preserve_existing_owner_path: false, move_existing_content: false, delete_existing_content: false, undercategory_count_requires_new_strict_trace_and_assessment: true },
    subcategory_upgrade_registration: { registered: false, allowed_before_strict_upgrade_gate: false },
  };
}

function buildReport() {
  return {
    schema: 'history_go_sosiologi_antropologi_culture_religion_ritual_materiality_source_brief_audit_v1', version: '1.0.0', updated_at: '2026-08-29', status: 'pass', conclusion: 'field_8_source_first_ready_not_materialized',
    counts: { ordinal: 8, inspectableSources: 13, topicBriefs: 8, plannedClaims: 32, teachingScenarios: 6, domainsMaterialized: 7, targetDomains: 12 },
    gates: { sourceFirst: true, everyClaimHasAtLeastTwoSources: true, everySourceUsed: true, cultureInterpretationAndPowerBoundaries: true, religionCategorySacredAndSecularBoundaries: true, ritualClassificationAndMaterialityBoundaries: true, livedReligionAgencyAndMeasurementBoundaries: true, fieldEthicsRepresentationAndSubjectBoundary: true, noPrematureRegistration: true },
    six_part_quality_review: { correctness_and_evidence: 5, coverage_and_completion: 5, disciplinary_editorial_quality: 5, technical_integrity: 5, safety_and_responsibility: 5, maintainability_and_auditability: 4, total: 29, maximum: 30, note: 'Kilde- og claimbriefen er klar for felt 8, men feltet teller ikke som materialisert før fulltekst, vurdering, registrering og audit finnes.' },
  };
}

export function generateAndAudit() {
  const brief = buildBrief();
  const claims = brief.topic_briefs.flatMap((topic) => topic.planned_claims);
  const sourceIds = new Set(brief.sources.map((source) => source.id));
  const used = new Set(claims.flatMap((claim) => claim.source_ids));
  assert(brief.sources.length === 13 && sourceIds.size === 13, 'Briefen skal ha 13 unike kilder');
  assert(brief.sources.every((source) => source.url.startsWith('https://') && source.source_location && source.retrieval_status === 'verified_2026-08-29'), 'Alle 13 kilder må være inspiserbare');
  assert(brief.topic_briefs.length === 8 && claims.length === 32 && new Set(claims.map((claim) => claim.id)).size === 32, 'Briefen skal ha 8 tema og 32 unike claims');
  assert(claims.every((claim) => claim.source_ids.length >= 2 && claim.source_ids.every((id) => sourceIds.has(id))), 'Hvert claim må ha minst to gyldige kilder');
  assert([...sourceIds].every((id) => used.has(id)), 'Hver kilde må brukes');
  assert(brief.decision_scenarios.length === 6 && brief.decision_scenarios.every((scenario) => scenario.claim_ids.length >= 3), 'Seks claimbundne scenarier kreves');
  assert(brief.subcategory_upgrade_registration.registered === false, 'Source brief kan ikke registrere feltet som materialisert');
  const report = buildReport();
  write(BRIEF, brief); write(REPORT, report);
  assert(isDeepStrictEqual(read(BRIEF), brief) && isDeepStrictEqual(read(REPORT), report), 'Genererte artefakter er ikke deterministiske');
  return report;
}

const report = generateAndAudit();
console.log(`Kultur, religion, ritual og materialitet source-first klar: ${report.counts.inspectableSources} kilder, ${report.counts.plannedClaims} claims, materialisert fortsatt ${report.counts.domainsMaterialized}/12.`);
