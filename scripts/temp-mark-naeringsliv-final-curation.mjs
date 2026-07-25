#!/usr/bin/env node
import fs from "node:fs";
const file="data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json";
const pensum=JSON.parse(fs.readFileSync(file,"utf8"));
const domain=pensum.domains.find(x=>x.domain_id==="makt_regulering_baerekraft");
if(!domain)throw new Error("Mangler domenet");
Object.assign(domain,{curation_status:"individually_curated",curation_batch:"naeringsliv_makt_baerekraft_v1",curation_date:"2026-07-25",curated_emne_count:3,generic_template_fields_remaining:false});
pensum.summary={...pensum.summary,individually_curated_core_emne_count:36,remaining_core_emne_count:0,all_core_emners_individually_curated:true};
pensum.content_curation={...(pensum.content_curation||{}),status:"complete",current_version:"naeringsliv_individual_curation_v1_complete",completed_at:"2026-07-25",curated_domain_ids:["arbeid_produksjon_verdiskaping","kapital_eierskap_finans","handel_forbruk_marked","teknologi_innovasjon_plattform","logistikk_infrastruktur_rom","makt_regulering_baerekraft"],curated_core_emne_count:36,remaining_core_emne_count:0,all_core_emners_individually_curated:true,field_modules_preserved:2,rule:"Et emne regnes som individuelt kuratert først når definisjon, betydning, nøkkelspørsmål, konflikter, ideologiske dimensjoner, analyseakser, blindsoner, generatorveiledning og anti-patterns er skrevet for emnets egen faglige logikk."};
fs.writeFileSync(file,JSON.stringify(pensum,null,2)+"\n");
