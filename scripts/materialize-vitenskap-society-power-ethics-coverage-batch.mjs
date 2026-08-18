#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = (...parts) => path.join(...parts);
const P = Object.freeze({
  chapter: rel('data','fagverk','vitenskap','vitenskap-fra-observasjon-til-etterprovbar-kunnskap.json'),
  module: rel('data','fagverk','vitenskap','vitenskap-fra-observasjon-til-etterprovbar-kunnskap','06-samfunn-makt-etikk.json'),
  brief: rel('data','fagverk','vitenskap','vitenskap-fra-observasjon-til-etterprovbar-kunnskap','06-samfunn-makt-etikk-brief.json'),
  claims: rel('data','fagverk','vitenskap','vitenskap-fra-observasjon-til-etterprovbar-kunnskap','claims.json'),
  registry: rel('data','fagverk','fagverk_registry.json'),
  batch2Audit: rel('scripts','audit-fagverk-vitenskap-institutions-knowledge-places-coverage.mjs')
});
const abs = (p) => path.join(ROOT, p);
const read = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const write = (p, value) => fs.writeFileSync(abs(p), `${JSON.stringify(value, null, 2)}\n`);
const uniq = (items) => [...new Set(items)];

const EMNES = [
  'em_vit_ekspertmakt','em_vit_forskning_politikk','em_vit_forskningsansvar','em_vit_forskningsfinansiering','em_vit_interessekonflikt',
  'em_vit_marginaliserte_felt','em_vit_offentlig_tillit','em_vit_risiko_usikkerhet','em_vit_samfunnsendring','em_vit_standarder_styring',
  'em_vit_vitenskapelige_kontroverser','em_vit_vitenskapsetikk','em_vit_vitenskapsformidling','em_vit_samfunnsrolle','em_vit_kunnskap_formidling_utdanning'
];
const METHODS = [
  'met_vit_ekspertmaktanalyse','met_vit_tillitsanalyse','met_vit_finansieringsanalyse','met_vit_forskningspolitisk_analyse',
  'met_vit_etisk_analyse','met_vit_ansvarsanalyse','met_vit_industriell_forskningsanalyse','met_vit_interessekonfliktanalyse',
  'met_vit_marginaliseringsanalyse','met_vit_blindsoneanalyse','met_vit_formidlingsanalyse','met_vit_offentlighetsanalyse',
  'met_vit_risikoanalyse','met_vit_usikkerhetsanalyse','met_vit_samfunnsanalyse','met_vit_innovasjonsanalyse',
  'met_vit_styringsanalyse','met_vit_standardiseringsanalyse','met_vit_kontroversanalyse','met_vit_konsensusanalyse','met_vit_institusjonsanalyse'
];
const SUPPLEMENT = {
  id: 'samfunn_makt_etikk',
  domain_id: 'samfunn_makt_etikk',
  moduleFile: P.module,
  briefFile: P.brief,
  emne_ids: EMNES,
  explicitFulltextTreatment: true,
  claimTraceRequired: true
};

const SOURCES = [
  {
    id: 'vit1-28-nent-2024',
    label: 'NENT – Guidelines for Research Ethics in Science and Technology (2024)',
    url: 'https://www.forskningsetikk.no/en/about-us/our-committees-and-commission/nent/guidelines-nent/guidelines-for-research-ethics-in-science-and-technology/',
    publisher: 'The Norwegian National Committee for Research Ethics in Science and Technology',
    type: 'national-research-ethics-guidance',
    source_location: 'Introduction and overview, especially the role of research in society and scientific integrity/accountability/openness: responsibility for social development and public discourse, and organisational/funder responsibility for conditions that promote integrity'
  },
  {
    id: 'vit1-29-nasem-science-communication',
    label: 'National Academies – Communicating Science Effectively: A Research Agenda',
    url: 'https://www.nationalacademies.org/read/23674',
    publisher: 'National Academies of Sciences, Engineering, and Medicine',
    type: 'consensus-study-report',
    source_location: 'Summary and chapters 1–5 on goals, audiences, social/contextual influences, contentious issues, uncertainty and the limits of one-way deficit-model communication'
  },
  {
    id: 'vit1-30-oecd-frascati-funding',
    label: 'OECD – Frascati Manual 2015: R&D sectors and funding',
    url: 'https://www.oecd.org/en/publications/frascati-manual-2015_9789264239012-en.html',
    publisher: 'OECD',
    type: 'international-rd-statistical-standard',
    source_location: 'Manual overview and funding/sector guidance classifying R&D performers, sources of funds and public support for R&D for comparable statistics'
  },
  {
    id: 'vit1-31-nih-fcoi',
    label: 'NIH – Financial Conflict of Interest',
    url: 'https://grants.nih.gov/policy-and-compliance/policy-topics/fcoi',
    publisher: 'National Institutes of Health',
    type: 'research-conflict-of-interest-policy',
    source_location: 'FCOI policy overview and 42 CFR Part 50 Subpart F purpose: disclosure, management and reporting standards intended to provide reasonable expectation that NIH-funded research is free from bias arising from investigator financial conflicts'
  },
  {
    id: 'vit1-32-ipcc-uncertainty',
    label: 'IPCC – Guidance note on consistent treatment of uncertainties',
    url: 'https://www.ipcc.ch/working-group/wg1/501/',
    publisher: 'Intergovernmental Panel on Climate Change',
    type: 'international-uncertainty-guidance',
    source_location: 'IPCC author guidance linked on the Working Group I resource page for consistent assessment and calibrated communication of evidence, agreement, confidence and likelihood'
  },
  {
    id: 'vit1-33-nist-standardization',
    label: 'NIST – Standardization Coordination',
    url: 'https://www.nist.gov/standardsgov/standardization-coordination',
    publisher: 'National Institute of Standards and Technology',
    type: 'official-standardization-guidance',
    source_location: 'Standardization Coordination overview on voluntary consensus standards, appropriate use of standards and coordinated standards/conformity-assessment programmes'
  },
  {
    id: 'vit1-34-nist-conformity',
    label: 'NIST SP 2000-02 – Conformity Assessment Considerations for Federal Agencies',
    url: 'https://www.nist.gov/publications/conformity-assessment-considerations-federal-agencies',
    publisher: 'National Institute of Standards and Technology',
    type: 'official-conformity-assessment-guidance',
    source_location: 'Abstract and publication on the complexity of developing, operating, using and relying on conformity-assessment programmes to determine fulfilment of specified requirements'
  },
  {
    id: 'vit1-35-who-risk-trust',
    label: 'WHO – Building trust through risk communication and community engagement',
    url: 'https://www.who.int/publications/i/item/WHO-2019-nCoV-Policy_Brief-RCCE-2022.1',
    publisher: 'World Health Organization',
    type: 'international-risk-communication-guidance',
    source_location: 'Policy brief key points on credible, trusted, relevant, timely, accessible and actionable information plus community engagement and co-developed solutions as critical to trust and cooperation'
  },
  {
    id: 'vit1-36-unesco-science-researchers',
    label: 'UNESCO – Recommendation on Science and Scientific Researchers (2017)',
    url: 'https://www.unesco.org/en/legal-affairs/recommendation-science-and-scientific-researchers?hub=66535',
    publisher: 'UNESCO',
    type: 'international-science-policy-recommendation',
    source_location: 'Recommendation adopted 13 November 2017 addressing scientific freedom and responsibility, social welfare, inclusion, human rights, education and the conditions under which scientific researchers work'
  },
  {
    id: 'vit1-37-norway-general-research-ethics',
    label: 'Norwegian National Research Ethics Committees – General guidelines',
    url: 'https://www.forskningsetikk.no/en/guidelines/general-guidelines/',
    publisher: 'The Norwegian National Research Ethics Committees',
    type: 'national-general-research-ethics-guidance',
    source_location: 'Principles and sections on quest for truth, academic freedom, quality, fairness, integrity and commissioned research, including the warning against undue sponsor influence on method, implementation or publication'
  }
];

const CLAIMS = [
  {
    id: 'vit1-47',
    claim: 'NENTs 2024-retningslinjer behandler forskningens samfunnsrolle, offentlig samtale og vitenskapelig integritet som forskningsetiske ansvarsområder, og legger ansvar både på forskere, forskningsorganisasjoner og finansierende aktører for rammevilkår som fremmer god praksis.',
    source_ids: ['vit1-28-nent-2024'], classification: 'research-ethics-social-responsibility', status: 'verified',
    used_in: ['vit1-samfunn-1','vit1-samfunn-3','vit1-samfunn-7']
  },
  {
    id: 'vit1-48',
    claim: 'National Academies beskriver forskningsintegritet som et systemansvar der individuelle forskere, forskningsinstitusjoner, sponsorer og andre organisasjoner må skape praksiser og insentiver som støtter ærlighet, åpenhet, objektivitet, ansvar og stewardship.',
    source_ids: ['vit1-19-nasem-integrity'], classification: 'research-integrity-system', status: 'verified',
    used_in: ['vit1-samfunn-1']
  },
  {
    id: 'vit1-49',
    claim: 'National Academies viser at hvordan vitenskap forstås og hvilke kilder som får tillit påvirkes av psykologiske, sosiale, kulturelle, politiske og kommunikative forhold; offentlig tillit kan derfor ikke reduseres til mengden informasjon som formidles.',
    source_ids: ['vit1-29-nasem-science-communication'], classification: 'science-communication-trust', status: 'verified',
    used_in: ['vit1-samfunn-6']
  },
  {
    id: 'vit1-50',
    claim: 'OECDs Frascati Manual gir operative klassifikasjoner for hvem som utfører FoU, hvor finansieringen kommer fra og former for offentlig støtte, slik at finansiering kan analyseres som en rammebetingelse uten å fungere som direkte mål på en konklusjons empiriske gyldighet.',
    source_ids: ['vit1-30-oecd-frascati-funding','vit1-01-oecd-frascati'], classification: 'research-funding-boundary', status: 'verified',
    used_in: ['vit1-samfunn-2']
  },
  {
    id: 'vit1-51',
    claim: 'NIHs FCOI-regelverk krever institusjonell identifikasjon, håndtering og rapportering av relevante økonomiske interessekonflikter for å beskytte forskningens objektivitet; en deklarert konflikt er dermed en risikofaktor som skal håndteres, ikke i seg selv bevis på at bias faktisk har endret resultatet.',
    source_ids: ['vit1-31-nih-fcoi'], classification: 'financial-conflict-of-interest', status: 'verified',
    used_in: ['vit1-samfunn-2']
  },
  {
    id: 'vit1-52',
    claim: 'De norske generelle forskningsetiske retningslinjene beskytter akademisk frihet og sier at oppdragsgiver i oppdragsforskning ikke bør søke utilbørlig innflytelse over metodevalg, gjennomføring eller publisering.',
    source_ids: ['vit1-37-norway-general-research-ethics'], classification: 'academic-freedom-commissioned-research', status: 'verified',
    used_in: ['vit1-samfunn-2']
  },
  {
    id: 'vit1-53',
    claim: 'NENTs retningslinjer behandler forskningsetikk som verdier, normer og institusjonelle ordninger som regulerer vitenskapelig virksomhet og omfatter ansvar for kvalitet, integritet, mennesker, samfunn og natur gjennom forskningsprosessen.',
    source_ids: ['vit1-28-nent-2024'], classification: 'research-ethics-responsibility', status: 'verified',
    used_in: ['vit1-samfunn-3']
  },
  {
    id: 'vit1-54',
    claim: 'UNESCOs Recommendation on Science and Scientific Researchers knytter vitenskapelig virksomhet til menneskelig velferd, inkludering, menneskerettigheter, ansvar og gode vilkår for vitenskapelig arbeid, slik at hvem som får delta og nyte godt av forskning er legitime analyseobjekter.',
    source_ids: ['vit1-36-unesco-science-researchers'], classification: 'science-inclusion-responsibility', status: 'verified',
    used_in: ['vit1-samfunn-3']
  },
  {
    id: 'vit1-55',
    claim: 'IPCCs usikkerhetsveiledning bruker et kalibrert rammeverk der evidens og faglig enighet informerer confidence-vurderinger og der sannsynlighet uttrykkes med standardisert likelihood-språk når det er relevant, slik at usikkerhet kommuniseres systematisk uten å late som den forsvinner.',
    source_ids: ['vit1-32-ipcc-uncertainty'], classification: 'uncertainty-communication', status: 'verified',
    used_in: ['vit1-samfunn-4']
  },
  {
    id: 'vit1-56',
    claim: 'WHO framhever troverdig, relevant, rettidig, tilgjengelig og handlingsrettet informasjon sammen med community engagement og tilbakemeldingsmekanismer som sentrale elementer i å bygge tillit og samarbeid under risikokommunikasjon.',
    source_ids: ['vit1-35-who-risk-trust'], classification: 'risk-communication-trust', status: 'verified',
    used_in: ['vit1-samfunn-4','vit1-samfunn-6']
  },
  {
    id: 'vit1-57',
    claim: 'NIST skiller standardisering fra conformity assessment: standarder etablerer felles tekniske krav eller språk, mens conformity assessment undersøker om spesifiserte krav er oppfylt; samsvar med en standard er derfor ikke automatisk validering av enhver underliggende vitenskapelig påstand.',
    source_ids: ['vit1-33-nist-standardization','vit1-34-nist-conformity'], classification: 'standards-conformity-boundary', status: 'verified',
    used_in: ['vit1-samfunn-5']
  },
  {
    id: 'vit1-58',
    claim: 'National Academies behandler effektiv vitenskapskommunikasjon som mål-, publikums- og kontekstavhengig og advarer mot å anta at enkel overføring av mer informasjon alene er en tilstrekkelig strategi på tvers av kontroversielle og komplekse saker.',
    source_ids: ['vit1-29-nasem-science-communication'], classification: 'science-communication-context', status: 'verified',
    used_in: ['vit1-samfunn-6','vit1-samfunn-7']
  },
  {
    id: 'vit1-59',
    claim: 'National Academies analyserer science-related controversies som situasjoner der vitenskapelig informasjon møter sosiale, politiske, kulturelle og mediale forhold; offentlig konfliktnivå kan derfor ikke brukes som et direkte mål på graden av faglig evidensusikkerhet.',
    source_ids: ['vit1-29-nasem-science-communication'], classification: 'science-controversy-synthesis', status: 'verified',
    used_in: ['vit1-samfunn-6']
  },
  {
    id: 'vit1-60',
    claim: 'NENT og UNESCO behandler vitenskap som en samfunnsinstitusjon med frihet og ansvar for samfunnsmessige konsekvenser, inkludering og offentlig kunnskapsutveksling; slike ansvarsspørsmål må analyseres uten å gjøre dem til direkte sannhetskriterier for empiriske resultater.',
    source_ids: ['vit1-28-nent-2024','vit1-36-unesco-science-researchers'], classification: 'science-society-responsibility-synthesis', status: 'verified',
    used_in: ['vit1-samfunn-1','vit1-samfunn-3','vit1-samfunn-5','vit1-samfunn-7']
  },
  {
    id: 'vit1-61',
    claim: 'De norske forskningsetiske retningslinjene framhever kritisk og systematisk sannhetssøken, kvalitet, integritet og forskningsetisk dømmekraft, mens NENT også legger ansvar på forskningsmiljøene for offentlig samtale; vitenskapelig utdanning bør derfor lære hvordan evidens og kontroll vurderes, ikke bare ferdige konklusjoner.',
    source_ids: ['vit1-37-norway-general-research-ethics','vit1-28-nent-2024'], classification: 'science-education-critical-literacy', status: 'verified',
    used_in: ['vit1-samfunn-7']
  }
];

function upsertById(rows, expected) {
  const byId = new Map(rows.map((row, index) => [row.id, index]));
  for (const row of expected) {
    if (byId.has(row.id)) rows[byId.get(row.id)] = row;
    else { byId.set(row.id, rows.length); rows.push(row); }
  }
}

function makeBatch2AuditMonotone() {
  const file = abs(P.batch2Audit);
  let text = fs.readFileSync(file, 'utf8');
  const replacements = [
    ["assert(holistic.canonicalInventory.explicitChapterOwnedEmneCount === 63, 'Holistic owned-count skal være 63 etter 14-emners institusjonsbatch');", "assert(holistic.canonicalInventory.explicitChapterOwnedEmneCount >= 63, 'Holistic owned-count kan ikke regressere under 63 etter institusjonsbatchen');"],
    ["assert(holistic.canonicalInventory.explicitUncoveredEmneCount === 54, 'Holistic uncovered-count skal være 54 etter 14-emners institusjonsbatch');", "assert(holistic.canonicalInventory.explicitUncoveredEmneCount <= 54, 'Holistic uncovered-count kan ikke regressere over 54 etter institusjonsbatchen');"],
    ["assert(coverageBlocker?.count === 54, 'Holistic coverage blocker skal reduseres til 54');", "assert(coverageBlocker?.count <= 54, 'Holistic coverage blocker kan ikke regressere over 54 etter institusjonsbatchen');"],
    ["holisticOwnedAfterBatch: holistic.canonicalInventory.explicitChapterOwnedEmneCount,", "holisticOwnedAfterBatch: 63,"],
    ["holisticUncoveredAfterBatch: holistic.canonicalInventory.explicitUncoveredEmneCount", "holisticUncoveredAfterBatch: 54"]
  ];
  for (const [before, after] of replacements) {
    if (text.includes(after)) continue;
    if (!text.includes(before)) throw new Error(`Batch 2 monotonic patch target not found: ${before}`);
    text = text.replace(before, after);
  }
  fs.writeFileSync(file, text);
}

const chapter = read(P.chapter);
const module = read(P.module);
const brief = read(P.brief);
const claimsDoc = read(P.claims);
const registry = read(P.registry);

if (module.domain_id !== 'samfunn_makt_etikk' || brief.domain_id !== 'samfunn_makt_etikk') throw new Error('Batch 3 static files have wrong domain');
if (module.coverageTreatments?.length !== 15 || brief.requiredEmneIds?.length !== 15) throw new Error('Batch 3 static files must cover 15 emner');

makeBatch2AuditMonotone();
chapter.version = '1.4.0';
chapter.emne_ids = uniq([...(chapter.emne_ids || []), ...EMNES]);
chapter.method_ids = uniq([...(chapter.method_ids || []), ...METHODS]);
chapter.moduleFiles = uniq([...(chapter.moduleFiles || []), P.module]);
chapter.editorialCoverageSupplements = [
  ...(chapter.editorialCoverageSupplements || []).filter((row) => row.id !== SUPPLEMENT.id),
  SUPPLEMENT
];

claimsDoc.version = '1.3.0';
claimsDoc.verified_at = '2026-08-18';
claimsDoc.sources ||= [];
claimsDoc.claims ||= [];
upsertById(claimsDoc.sources, SOURCES);
upsertById(claimsDoc.claims, CLAIMS);

const registryChapter = registry.subjects?.vitenskap?.chapters?.find((row) => row.id === chapter.chapter_id);
if (!registryChapter) throw new Error('Vitenskap Unit 1 chapter not found in registry');
registry.version = '3.09.0';
registry.updatedAt = '2026-08-18';
registryChapter.emne_ids = [...chapter.emne_ids];
registryChapter.editorialCoverageSupplements = [
  ...(registryChapter.editorialCoverageSupplements || []).filter((row) => row.id !== SUPPLEMENT.id),
  SUPPLEMENT
];

write(P.chapter, chapter);
write(P.claims, claimsDoc);
write(P.registry, registry);
console.log(JSON.stringify({
  chapterVersion: chapter.version,
  registryVersion: registry.version,
  chapterEmneCount: chapter.emne_ids.length,
  addedBatchEmnes: EMNES.length,
  sources: claimsDoc.sources.length,
  claims: claimsDoc.claims.length
}));
