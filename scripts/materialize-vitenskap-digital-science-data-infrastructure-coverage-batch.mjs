#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  chapter:'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap.json',
  module:'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/07-teknologi-data-infrastruktur.json',
  brief:'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/07-teknologi-data-infrastruktur-brief.json',
  claims:'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/claims.json',
  registry:'data/fagverk/fagverk_registry.json',
  batch3Audit:'scripts/audit-fagverk-vitenskap-society-power-ethics-coverage.mjs'
});
const abs = (p) => path.join(ROOT,p);
const read = (p) => JSON.parse(fs.readFileSync(abs(p),'utf8'));
const write = (p,v) => fs.writeFileSync(abs(p),`${JSON.stringify(v,null,2)}\n`);
const uniq = (items) => [...new Set(items)];

const EMNES = [
  'em_vit_automatisering','em_vit_beregning','em_vit_datasett','em_vit_datavisualisering','em_vit_digital_vitenskap',
  'em_vit_protokoller','em_vit_sensorer','em_vit_teknologiens_foringer','em_vit_teknologisk_presisjon','em_vit_hist_teknologi','em_vit_teknologi_innovasjon'
];
const METHODS = [
  'met_vit_automatiseringsanalyse','met_vit_algoritmeanalyse','met_vit_beregningsanalyse','met_vit_simuleringsanalyse','met_vit_datasettanalyse','met_vit_dataanalyse',
  'met_vit_visualiseringsanalyse','met_vit_modellanalyse','met_vit_digital_vitenskapsanalyse','met_vit_protokollanalyse','met_vit_standardiseringsanalyse',
  'met_vit_sensoranalyse','met_vit_maleinstrumentanalyse','met_vit_teknologikritisk_analyse','met_vit_blindsoneanalyse','met_vit_teknologianalyse',
  'met_vit_kalibreringsanalyse','met_vit_vitenskapshistorisk_analyse','met_vit_innovasjonsanalyse','met_vit_institusjonsanalyse'
];
const SUPPLEMENT = {
  id:'teknologi_data_infrastruktur', domain_id:'teknologi_data_infrastruktur', moduleFile:P.module, briefFile:P.brief,
  emne_ids:EMNES, explicitFulltextTreatment:true, claimTraceRequired:true,
  boundary:'Scientific evidence mediation only; nested Teknologi retains design, architecture, construction, verification, validation and engineering tradeoffs.'
};
const SOURCES = [
  {
    id:'vit1-38-w3c-prov-o', label:'W3C – PROV-O: The PROV Ontology', url:'https://www.w3.org/TR/prov-o/', publisher:'World Wide Web Consortium',
    type:'web-provenance-recommendation', source_location:'Abstract and ontology overview defining a W3C Recommendation for representing and interchanging provenance information through entities, activities, agents and typed relations'
  },
  {
    id:'vit1-39-w3c-data-web', label:'W3C – Data on the Web Best Practices', url:'https://www.w3.org/TR/dwbp/', publisher:'World Wide Web Consortium',
    type:'data-publication-recommendation', source_location:'Best Practices summary and sections on metadata, provenance, standardized machine-readable formats, dataset coverage and complementary presentations for comprehension, reuse, trust and interoperability'
  },
  {
    id:'vit1-40-fair-principles', label:'Wilkinson et al. – FAIR Guiding Principles for scientific data management and stewardship', url:'https://www.nature.com/articles/sdata201618', publisher:'Scientific Data',
    type:'open-science-data-principles', source_location:'Abstract and FAIR Guiding Principles defining Findable, Accessible, Interoperable and Reusable characteristics for data and metadata, with emphasis on machine actionability and stewardship'
  }
];
const CLAIMS = [
  {id:'vit1-62',claim:'National Academies skiller komputasjonell reproducerbarhet, der samme inputdata, beregningssteg, metoder, kode og analysebetingelser brukes på nytt, fra replikasjon der nye data brukes for å undersøke det samme vitenskapelige spørsmålet.',source_ids:['vit1-06-nasem-reproducibility'],classification:'computational-reproducibility-boundary',status:'verified',used_in:['vit1-digital-1']},
  {id:'vit1-63',claim:'NISTs Numerical Reproducibility-prosjekt dokumenterer at bibliotekversjoner, floating-point-presisjon, compiler-valg og CPU/GPU-arkitektur kan skape numeriske forskjeller, slik at utførelsesmiljøet kan være en del av den vitenskapelige reproducerbarhetsbeskrivelsen.',source_ids:['vit1-16-nist-numerical-reproducibility'],classification:'numerical-environment-sensitivity',status:'verified',used_in:['vit1-digital-1']},
  {id:'vit1-64',claim:'Automatisert utførelse kan gjøre de samme beregningsstegene konsekvente, men NIH-rigor og National Academies-reproduksjonsrammer krever fortsatt vurdering av design, metode, analyse og fortolkning; konsistent kjøring validerer derfor ikke automatisk de faglige antakelsene.',source_ids:['vit1-07-nih-rigor','vit1-06-nasem-reproducibility'],classification:'automation-validation-boundary',status:'verified',used_in:['vit1-digital-1']},
  {id:'vit1-65',claim:'NIST Research Data Framework organiserer forskningsdata gjennom en livssyklus som inkluderer generering eller innhenting, prosessering og analyse, deling og gjenbruk samt bevaring eller kassasjon, og framhever dokumentasjon av programvare, instrumenter, parametre og prosesseringskontekst.',source_ids:['vit1-15-nist-rdaf'],classification:'research-data-lifecycle',status:'verified',used_in:['vit1-digital-2']},
  {id:'vit1-66',claim:'W3C PROV-O representerer provenance gjennom entiteter, aktiviteter og agenter med relasjoner mellom dem, mens NIST RDaF beskriver provenance som en historisk, attribuert og dokumentert oversikt over hvordan data ble generert, innhentet og prosessert.',source_ids:['vit1-38-w3c-prov-o','vit1-15-nist-rdaf'],classification:'data-provenance',status:'verified',used_in:['vit1-digital-2']},
  {id:'vit1-67',claim:'FAIR-prinsippene beskriver findability, accessibility, interoperability og reusability for data og metadata, og W3C anbefaler metadata, provenance og standardiserte maskinlesbare formater; disse egenskapene forbedrer gjenbruk og gransking, men er ikke i seg selv kriterier for empirisk sannhet eller representativitet.',source_ids:['vit1-40-fair-principles','vit1-39-w3c-data-web'],classification:'fair-data-quality-boundary',status:'verified',used_in:['vit1-digital-2']},
  {id:'vit1-68',claim:'W3C anbefaler komplementære datapresentasjoner for å støtte menneskelig forståelse, mens NISTs statistiske metodehåndbok bruker grafiske teknikker og residualanalyse som analytiske verktøy; visualisering er dermed en dokumenterbar transformasjon og diagnostisk praksis, ikke et nøytralt vindu mot rådata.',source_ids:['vit1-39-w3c-data-web','vit1-11-nist-stat-handbook','vit1-13-nist-model-validation'],classification:'data-visualization-analysis',status:'verified',used_in:['vit1-digital-3']},
  {id:'vit1-69',claim:'NIH scientific rigor omfatter robust design, metodikk, analyse, fortolkning og rapportering, og NIST RDaF framhever dokumentasjon av metoder, instrumenter, programvare og parametre; protokoller styrker etterprøvbarhet når både planlagte trinn, versjoner og faktiske avvik registreres.',source_ids:['vit1-07-nih-rigor','vit1-15-nist-rdaf'],classification:'protocol-documentation',status:'verified',used_in:['vit1-digital-4']},
  {id:'vit1-70',claim:'NIST definerer metrologisk sporbarhet som en egenskap ved et måleresultat gjennom en dokumentert ubrutt kalibreringskjede der hvert ledd bidrar til måleusikkerheten, og understreker at sporbarhet ikke er en iboende egenskap ved instrumentet eller laboratoriet alene.',source_ids:['vit1-04-nist-traceability-policy','vit1-05-nist-traceability-faq'],classification:'sensor-measurement-traceability',status:'verified',used_in:['vit1-digital-5']},
  {id:'vit1-71',claim:'NIST viser at software- og hardwarevalg kan påvirke numerisk output, og Forskningsrådet regner blant annet data/e-infrastruktur, lagring, programvare og nettverk som forskningsinfrastruktur; tekniske valg er derfor relevante metodebetingelser når de påvirker hva som kan observeres, beregnes eller rekonstrueres.',source_ids:['vit1-16-nist-numerical-reproducibility','vit1-20-rcn-research-infrastructure'],classification:'technical-mediation-of-science',status:'verified',used_in:['vit1-digital-6']},
  {id:'vit1-72',claim:'OECD/Eurostat Oslo Manual definerer innovasjon gjennom nye eller forbedrede produkter eller prosesser som er gjort tilgjengelige eller tatt i bruk og skiller innovasjonsmåling fra FoU; innovasjonsstatus er derfor ikke et automatisk mål på vitenskapelig evidenskvalitet.',source_ids:['vit1-21-oecd-oslo-innovation','vit1-02-oecd-oslo-rd'],classification:'innovation-rd-boundary',status:'verified',used_in:['vit1-digital-6']}
];

function upsert(rows,newRows){ const byId=new Map(rows.map((row,i)=>[row.id,i])); for(const row of newRows){ if(byId.has(row.id)) rows[byId.get(row.id)]=row; else {byId.set(row.id,rows.length); rows.push(row);} } }
function makeBatch3Monotone(){
  const file=abs(P.batch3Audit); let text=fs.readFileSync(file,'utf8');
  const pairs=[
    ["assert(holistic.canonicalInventory.explicitChapterOwnedEmneCount === 78, 'Holistic owned-count skal være 78 etter 15-emners batch 3');","assert(holistic.canonicalInventory.explicitChapterOwnedEmneCount >= 78, 'Holistic owned-count kan ikke regressere under 78 etter batch 3');"],
    ["assert(holistic.canonicalInventory.explicitUncoveredEmneCount === 39, 'Holistic uncovered-count skal være 39 etter 15-emners batch 3');","assert(holistic.canonicalInventory.explicitUncoveredEmneCount <= 39, 'Holistic uncovered-count kan ikke regressere over 39 etter batch 3');"],
    ["assert(coverageBlocker?.count === 39, 'Holistic coverage blocker skal reduseres til 39');","assert(coverageBlocker?.count <= 39, 'Holistic coverage blocker kan ikke regressere over 39 etter batch 3');"]
  ];
  for(const [before,after] of pairs){ if(text.includes(after)) continue; if(!text.includes(before)) throw new Error(`Batch 3 monotonic patch target not found: ${before}`); text=text.replace(before,after); }
  fs.writeFileSync(file,text);
}

const chapter=read(P.chapter); const module=read(P.module); const brief=read(P.brief); const claims=read(P.claims); const registry=read(P.registry);
if(module.domain_id!=='teknologi_data_infrastruktur'||brief.domain_id!=='teknologi_data_infrastruktur') throw new Error('Batch 4 static files have wrong domain');
if(module.coverageTreatments?.length!==11||brief.requiredEmneIds?.length!==11) throw new Error('Batch 4 static files must cover 11 emner');
makeBatch3Monotone();
chapter.version='1.5.0';
chapter.emne_ids=uniq([...(chapter.emne_ids||[]),...EMNES]);
chapter.method_ids=uniq([...(chapter.method_ids||[]),...METHODS]);
chapter.moduleFiles=uniq([...(chapter.moduleFiles||[]),P.module]);
chapter.editorialCoverageSupplements=[...(chapter.editorialCoverageSupplements||[]).filter((row)=>row.id!==SUPPLEMENT.id),SUPPLEMENT];
claims.version='1.4.0'; claims.verified_at='2026-08-18'; claims.sources||=[]; claims.claims||=[]; upsert(claims.sources,SOURCES); upsert(claims.claims,CLAIMS);
const registryChapter=registry.subjects?.vitenskap?.chapters?.find((row)=>row.id===chapter.chapter_id); if(!registryChapter) throw new Error('Unit 1 missing in registry');
registry.version='3.10.0'; registry.updatedAt='2026-08-18'; registryChapter.emne_ids=[...chapter.emne_ids]; registryChapter.editorialCoverageSupplements=[...(registryChapter.editorialCoverageSupplements||[]).filter((row)=>row.id!==SUPPLEMENT.id),SUPPLEMENT];
write(P.chapter,chapter); write(P.claims,claims); write(P.registry,registry);
console.log(JSON.stringify({chapterVersion:chapter.version,registryVersion:registry.version,chapterEmneCount:chapter.emne_ids.length,addedBatchEmnes:EMNES.length,sources:claims.sources.length,claims:claims.claims.length}));
