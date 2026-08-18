#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = (rel) => path.join(ROOT, rel);
const read = (rel) => JSON.parse(fs.readFileSync(p(rel), 'utf8'));
const write = (rel, value) => fs.writeFileSync(p(rel), `${JSON.stringify(value, null, 2)}\n`);
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const CHAPTER = 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap.json';
const MODULE = 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/05-institusjoner-laboratorier-kunnskapssteder.json';
const BRIEF = 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/05-institusjoner-laboratorier-kunnskapssteder-brief.json';
const CLAIMS = 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/claims.json';
const REGISTRY = 'data/fagverk/fagverk_registry.json';
const EMNERS = 'data/fag/vitenskap/emner_vitenskap_canonical_v4_6.json';

const EXPECTED_BATCH = [
  'em_vit_arkiv_data_lagring','em_vit_byens_vitenskapssteder','em_vit_datainfrastruktur','em_vit_forskning_industri',
  'em_vit_innovasjon_teknologi','em_vit_institusjonell_autoritet','em_vit_klinisk_evidens','em_vit_kunnskapsarv',
  'em_vit_kunnskapsgeografi','em_vit_medisin_forskning','em_vit_observasjon_maling','em_vit_byen_som_kunnskapskart',
  'em_vit_kjemi_laboratorium','em_vit_vitenskapshistorie_personer'
];

const chapter = read(CHAPTER);
const module = read(MODULE);
const brief = read(BRIEF);
const emners = read(EMNERS);
const registry = read(REGISTRY);
const claimsDocument = read(CLAIMS);
const emneById = new Map(emners.map((row) => [row.emne_id, row]));

assert(module.coverageTreatments?.length === 14, 'Batch 2 module must contain 14 treatments');
assert(new Set(module.coverageTreatments.map((row) => row.emne_id)).size === 14, 'Batch 2 module has duplicate treatment IDs');
assert(EXPECTED_BATCH.every((id) => module.coverageTreatments.some((row) => row.emne_id === id)), 'Batch 2 module does not cover exact canonical set');
assert(brief.requiredEmneIds?.length === 14 && EXPECTED_BATCH.every((id) => brief.requiredEmneIds.includes(id)), 'Batch 2 brief has wrong canonical set');
for (const id of EXPECTED_BATCH) assert(emneById.has(id), `Unknown canonical emne ${id}`);

const existingBatchCount = EXPECTED_BATCH.filter((id) => chapter.emne_ids.includes(id)).length;
assert(existingBatchCount === 0 || existingBatchCount === EXPECTED_BATCH.length, `Partial batch 2 ownership state ${existingBatchCount}/14`);
for (const id of EXPECTED_BATCH) if (!chapter.emne_ids.includes(id)) chapter.emne_ids.push(id);
assert(EXPECTED_BATCH.every((id) => chapter.emne_ids.includes(id)), 'Chapter missing batch 2 emne after materialization');
assert(new Set(chapter.emne_ids).size === chapter.emne_ids.length, 'Chapter emne IDs are not unique');

for (const id of EXPECTED_BATCH.flatMap((emneId) => emneById.get(emneId).methods || [])) {
  if (!chapter.method_ids.includes(id)) chapter.method_ids.push(id);
}
chapter.method_ids = [...new Set(chapter.method_ids)];
if (!chapter.moduleFiles.includes(MODULE)) chapter.moduleFiles.push(MODULE);
chapter.editorialCoverageSupplements ||= [];
const supplementMeta = {
  id: 'institusjoner_laboratorier_kunnskapssteder',
  domain_id: 'institusjoner_laboratorier_kunnskapssteder',
  moduleFile: MODULE,
  briefFile: BRIEF,
  emne_ids: EXPECTED_BATCH,
  explicitFulltextTreatment: true,
  claimTraceRequired: true
};
const supplementIndex = chapter.editorialCoverageSupplements.findIndex((row) => row.id === supplementMeta.id);
if (supplementIndex >= 0) chapter.editorialCoverageSupplements[supplementIndex] = supplementMeta;
else chapter.editorialCoverageSupplements.push(supplementMeta);
chapter.version = '1.3.0';
write(CHAPTER, chapter);

const registryChapter = registry.subjects?.vitenskap?.chapters?.find((row) => row.id === chapter.chapter_id);
assert(registryChapter, 'Registry is missing Vitenskap Unit 1 chapter');
registryChapter.emne_ids = [...chapter.emne_ids];
registryChapter.editorialCoverageSupplements ||= [];
const registrySupplementIndex = registryChapter.editorialCoverageSupplements.findIndex((row) => row.id === supplementMeta.id);
if (registrySupplementIndex >= 0) registryChapter.editorialCoverageSupplements[registrySupplementIndex] = supplementMeta;
else registryChapter.editorialCoverageSupplements.push(supplementMeta);
registry.version = '3.08.0';
registry.updatedAt = '2026-08-18';
write(REGISTRY, registry);

const newSources = [
  {id:'vit1-19-nasem-integrity',label:'National Academies – Fostering Integrity in Research',url:'https://nap.nationalacademies.org/catalog/21896/fostering-integrity-in-research',publisher:'National Academies of Sciences, Engineering, and Medicine',type:'consensus-study-report',source_location:'Summary, Part One and findings/recommendations describing research integrity as individual and organizational adherence to core values and the central role of research institutions in fostering integrity'},
  {id:'vit1-20-rcn-research-infrastructure',label:'Research Council of Norway – About the INFRASTRUKTUR initiative',url:'https://www.forskningsradet.no/en/financing/what/infrastructure/about/',publisher:'Research Council of Norway',type:'national-research-infrastructure-guidance',source_location:'Definition and categories of national research infrastructure, including advanced equipment, large facilities, data/e-infrastructure, storage, software, networks, registries, databases and scientific collections'},
  {id:'vit1-21-oecd-oslo-innovation',label:'OECD/Eurostat – Oslo Manual 2018',url:'https://www.oecd.org/en/publications/oslo-manual-2018_9789264304604-en.html',publisher:'OECD/Eurostat',type:'international-innovation-method-standard',source_location:'Manual overview and innovation concepts distinguishing innovation measurement from R&D and requiring new or improved products/processes to be implemented or made available'},
  {id:'vit1-22-nih-clinical-studies',label:'NIH – Understanding Clinical Studies',url:'https://www.nih.gov/about-nih/science-health-public-trust/tools/understanding-clinical-studies',publisher:'National Institutes of Health',type:'official-clinical-study-guidance',source_location:'Study-design guidance explaining strengths and weaknesses of different clinical-study designs, randomized controlled trials for intervention causality, and situations where randomized trials cannot be used'},
  {id:'vit1-23-nih-clinical-trial-definition',label:'NIH – Does Your Human Subjects Study Meet the NIH Definition of a Clinical Trial?',url:'https://grants.nih.gov/policy-and-compliance/policy-topics/clinical-trials/ct-decision',publisher:'National Institutes of Health',type:'official-clinical-trial-policy',source_location:'NIH clinical-trial definition requiring human participants, prospective assignment to intervention, evaluation of intervention effects and health-related biomedical or behavioral outcomes'},
  {id:'vit1-24-nb-digital-preservation',label:'Nasjonalbiblioteket – Digital bevaring',url:'https://www.nb.no/digital-bevaring/',publisher:'Nasjonalbiblioteket',type:'national-digital-preservation-guidance',source_location:'Digital-preservation principles covering documented/open formats, multiple copies and storage technologies, geographic separation, technical/administrative metadata, provenance and standardized preservation actions'},
  {id:'vit1-25-nb-mandate',label:'Nasjonalbiblioteket – Mandat og strategi',url:'https://www.nb.no/om-nb/mandat-og-strategi/',publisher:'Nasjonalbiblioteket',type:'national-library-mandate',source_location:'Mandate describing collection, preservation and access for research/documentation and the National Library as a research library, research institution and part of Norwegian research infrastructure'},
  {id:'vit1-26-nb-research',label:'Nasjonalbiblioteket – Forsking og utvikling',url:'https://www.nb.no/forsking-og-utvikling/',publisher:'Nasjonalbiblioteket',type:'research-institution-overview',source_location:'Overview describing research on the Library collections, collaboration with other research institutions and digital research infrastructure such as DH-LAB and Språkbanken'},
  {id:'vit1-27-unesco-open-science-infrastructure',label:'UNESCO – Open Science',url:'https://www.unesco.org/en/open-science/about',publisher:'UNESCO',type:'international-open-science-recommendation',source_location:'Recommendation implementation areas covering investment in open-science infrastructures, policy environments, capacity, incentives and cooperation while recognizing legitimate access restrictions'}
];
for (const source of newSources) {
  const index = claimsDocument.sources.findIndex((row) => row.id === source.id);
  if (index >= 0) claimsDocument.sources[index] = source;
  else claimsDocument.sources.push(source);
}

const newClaims = [
  {id:'vit1-33',claim:'National Academies behandler forskningsintegritet som både individuelt og organisatorisk ansvar gjennom hele forskningsprosessen, slik at institusjonelle prosedyrer og ansvarslinjer er en del av betingelsene for pålitelig forskning.',source_ids:['vit1-19-nasem-integrity'],classification:'research-integrity-institutions',status:'verified',used_in:['vit1-institusjoner-1','vit1-institusjoner-4','vit1-institusjoner-6','vit1-institusjoner-7']},
  {id:'vit1-34',claim:'Research institutions play a central role in fostering integrity by maintaining standards, stewardship and environments that support responsible research; institutional status alone does not replace examination of the concrete research process.',source_ids:['vit1-19-nasem-integrity'],classification:'institutional-authority',status:'verified',used_in:['vit1-institusjoner-1']},
  {id:'vit1-35',claim:'Forskningsrådet definerer nasjonal forskningsinfrastruktur bredt nok til å omfatte avansert utstyr, laboratorier, data- og e-infrastruktur, lagring, programvare, nettverk, registre, databaser og vitenskapelige samlinger.',source_ids:['vit1-20-rcn-research-infrastructure'],classification:'research-infrastructure',status:'verified',used_in:['vit1-institusjoner-2','vit1-institusjoner-5','vit1-institusjoner-6','vit1-institusjoner-7']},
  {id:'vit1-36',claim:'NIST Research Data Framework behandler forskningens datalivsløp som et system av planlegging, innsamling, behandling, analyse, deling, gjenbruk, bevaring, styring og dokumentert proveniens, ikke som lagringsplass alene.',source_ids:['vit1-15-nist-rdaf'],classification:'research-data-infrastructure',status:'verified',used_in:['vit1-institusjoner-5']},
  {id:'vit1-37',claim:'Nasjonalbibliotekets prinsipper for digital bevaring krever mer enn å lagre en fil: formatvalg, flere kopier, geografisk separasjon, integritets-/proveniensmetadata og dokumenterte bevaringshandlinger inngår i langtidsbevaringen.',source_ids:['vit1-24-nb-digital-preservation'],classification:'digital-preservation',status:'verified',used_in:['vit1-institusjoner-4','vit1-institusjoner-5']},
  {id:'vit1-38',claim:'Nasjonalbiblioteket beskriver innsamling, bevaring, tilgjengeliggjøring og forskning på samlingene som del av sitt samfunnsoppdrag og som en ressurs i norsk forskningsinfrastruktur.',source_ids:['vit1-25-nb-mandate','vit1-26-nb-research'],classification:'collections-research-infrastructure',status:'verified',used_in:['vit1-institusjoner-4','vit1-institusjoner-7']},
  {id:'vit1-39',claim:'NIH definerer en klinisk trial som forskning der mennesker prospektivt tildeles én eller flere intervensjoner for å evaluere effekter på helserelaterte biomedisinske eller atferdsmessige utfall.',source_ids:['vit1-23-nih-clinical-trial-definition'],classification:'clinical-trial-definition',status:'verified',used_in:['vit1-institusjoner-3']},
  {id:'vit1-40',claim:'NIH fremhever godt designede randomiserte kontrollerte forsøk som sterke for å undersøke årsak–virkning ved medisinske intervensjoner, samtidig som randomiserte design ikke kan brukes for alle kliniske spørsmål eller situasjoner.',source_ids:['vit1-22-nih-clinical-studies'],classification:'clinical-study-design',status:'verified',used_in:['vit1-institusjoner-3']},
  {id:'vit1-41',claim:'OECDs Frascati- og Oslo-rammeverk operasjonaliserer henholdsvis forskning og eksperimentell utvikling og innovasjon som relaterte, men forskjellige målobjekter; FoU og innovasjon skal derfor ikke brukes som synonymer.',source_ids:['vit1-01-oecd-frascati','vit1-21-oecd-oslo-innovation'],classification:'rd-innovation-boundary',status:'verified',used_in:['vit1-institusjoner-6']},
  {id:'vit1-42',claim:'Oslo Manual knytter innovasjon til en ny eller forbedret løsning som faktisk er implementert eller gjort tilgjengelig, slik at en idé, oppfinnelse eller forskningsaktivitet ikke automatisk er en innovasjon.',source_ids:['vit1-21-oecd-oslo-innovation'],classification:'innovation-implementation',status:'verified',used_in:['vit1-institusjoner-6']},
  {id:'vit1-43',claim:'National Academies beskriver forskningsforetaket som et system som omfatter forskere, institusjoner, sponsorer, publiseringsaktører og faglige organisasjoner, og integritetsanalyse må derfor inkludere organisatoriske insentiver og ansvar uten å anta uredelighet fra finansiering alene.',source_ids:['vit1-19-nasem-integrity'],classification:'research-environment-governance',status:'verified',used_in:['vit1-institusjoner-1','vit1-institusjoner-6']},
  {id:'vit1-44',claim:'Forskningsrådet beskriver nasjonalt viktig infrastruktur som ressurser som kan være konsentrert på ett eller få steder, men som skal gjøres tilgjengelige for relevante forskere og næringsliv; fysisk lokalisering og faktisk tilgang er derfor ulike analytiske dimensjoner.',source_ids:['vit1-20-rcn-research-infrastructure'],classification:'knowledge-geography-access',status:'verified',used_in:['vit1-institusjoner-7']},
  {id:'vit1-45',claim:'Nasjonalbibliotekets samlinger, privatarkiv, digitalisering og forskningsinfrastruktur viser hvordan bevart og organisert kildemateriale kan brukes til forskning og dokumentasjon, samtidig som hva som er samlet og bevart setter grenser for senere historiske analyser.',source_ids:['vit1-25-nb-mandate','vit1-26-nb-research'],classification:'knowledge-heritage',status:'verified',used_in:['vit1-institusjoner-4']},
  {id:'vit1-46',claim:'UNESCOs Open Science-anbefaling behandler åpen vitenskap som et institusjonelt økosystem som krever infrastruktur, kompetanse, politikk og insentiver, samtidig som legitime begrensninger på tilgang kan være nødvendige.',source_ids:['vit1-27-unesco-open-science-infrastructure'],classification:'open-science-infrastructure',status:'verified',used_in:['vit1-institusjoner-5']}
];
for (const claim of newClaims) {
  const index = claimsDocument.claims.findIndex((row) => row.id === claim.id);
  if (index >= 0) claimsDocument.claims[index] = claim;
  else claimsDocument.claims.push(claim);
}
claimsDocument.version = '1.2.0';
claimsDocument.verified_at = '2026-08-18';
assert(new Set(claimsDocument.sources.map((row) => row.id)).size === claimsDocument.sources.length, 'Duplicate source IDs after batch 2');
assert(new Set(claimsDocument.claims.map((row) => row.id)).size === claimsDocument.claims.length, 'Duplicate claim IDs after batch 2');
write(CLAIMS, claimsDocument);

console.log(JSON.stringify({
  chapterEmnes: chapter.emne_ids.length,
  chapterMethods: chapter.method_ids.length,
  moduleFiles: chapter.moduleFiles.length,
  sources: claimsDocument.sources.length,
  claims: claimsDocument.claims.length,
  materializedBatch: EXPECTED_BATCH.length
}));
