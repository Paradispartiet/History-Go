import fs from "node:fs";

const R = "politikk-fordeling-vertical-2026-07-24";
const base = "data/fag/politikk";
const read = p => JSON.parse(fs.readFileSync(p, "utf8"));
const fagkart = read(`${base}/fagkart_politikk_canonical_v4_5.json`);
const emner = read(`${base}/emner_politikk_canonical_v4_5.json`);
const methods = read(`${base}/methods_politikk_canonical_v4_5.json`);
const mapping = read(`${base}/emnemapping_politikk_canonical_v4_5.json`);
const pensum = read(`${base}/politikkpensum_canonical_v4_5.json`);
const generator = read(`${base}/quiz_generator_rules_politikk_v5_1_source_priority_patch.json`);
const blueprints = read("reports/politikk-canonical-migration/fordeling-velferd-question-blueprints.json");
let pass=0;
const ok=(v,m)=>{ if(!v) throw new Error(`FAIL | ${m}`); console.log(`PASS | ${m}`); pass++; };
const domain=fagkart.categories.find(x=>x.id==="fordeling_velferd_ulikhet");
ok(domain?.quality_revision===R,"Fagkartdomenet har ny revisjon");
ok(domain.topic_hooks.length===10,"Domenet har 10 hooks");
for(const h of domain.topic_hooks){
  ok(h.quality_revision===R,`Hook ${h.id} har ny revisjon`);
  ok(h.mechanisms?.length>=5,`Hook ${h.id} har mekanismer`);
  ok(h.critical_distinctions?.length>=3,`Hook ${h.id} har distinksjoner`);
  ok(h.theory_lenses?.length===3,`Hook ${h.id} har tre teorispor`);
  ok(h.generator_constraints?.ban_theorist_name_as_answer_without_concept===true,`Hook ${h.id} forbyr løsrevet teoretikernavn`);
}
const revisedEmnes=emner.filter(e=>e.quality_revision===R);
ok(revisedEmnes.length===7,"Syv generiske emner er direkte revidert");
for(const e of revisedEmnes){
  ok(e.mechanisms?.length>=5,`Emne ${e.emne_id} har mekanismer`);
  ok(e.recommended_method_ids?.length>=2,`Emne ${e.emne_id} har målrettede metoder`);
  ok(e.canonical_thinker_ids?.length===3,`Emne ${e.emne_id} har tre teorispor`);
}
const methodIds=new Set(methods.methods.map(m=>m.method_id));
const profiled=methods.methods.filter(m=>m.domain_profiles?.fordeling_velferd_ulikhet?.quality_revision===R);
ok(profiled.length===15,"Femten metoder har fordelingsprofil");
for(const m of profiled){
  const p=m.domain_profiles.fordeling_velferd_ulikhet;
  ok(p.mechanism_focus?.length>=3,`Metode ${m.method_id} har mekanismeprofil`);
  ok(p.critical_distinctions?.length>=3,`Metode ${m.method_id} har distinksjoner`);
}
const ms=[];
for(const item of mapping) for(const m of item.mappings||[]) if(m.fagkart_kategori==="fordeling_velferd_ulikhet") ms.push(m);
ok(ms.length===20,"Tjue mappinger finnes for domenet");
for(const m of ms){
  ok(m.quality_revision===R,`Mapping ${m.topic_hook} har ny revisjon`);
  ok(m.mechanism_options?.length>=5,`Mapping ${m.topic_hook} har mekanismer`);
  ok(m.critical_distinction_options?.length>=3,`Mapping ${m.topic_hook} har distinksjoner`);
  ok(m.theory_lenses?.length===3,`Mapping ${m.topic_hook} har tre teorispor`);
  ok(m.recommended_method_ids.every(id=>methodIds.has(id)),`Mapping ${m.topic_hook} peker til gyldige metoder`);
  ok(m.generator_constraints?.ban_theorist_name_as_answer_without_concept===true,`Mapping ${m.topic_hook} forbyr løsrevet teoretikernavn`);
}
const pd=pensum.domains.find(x=>x.domain_id==="fordeling_velferd_ulikhet");
ok(pd?.status==="complete_revised","Pensum markerer domenet complete_revised");
ok(pd?.generator_profile==="fordeling_velferd_ulikhet","Pensum dokumenterer aktiv generatorprofil");
const gp=generator.domain_quality_profiles?.fordeling_velferd_ulikhet;
ok(gp?.status==="complete_revised" && gp?.quality_revision===R,"Generatorprofilen er aktiv og komplett revidert");
ok(gp?.revised_method_ids?.length===15,"Generatorprofilen peker til 15 metoder");
ok(blueprints.length===10,"Det finnes 10 representative spørsmålsplaner");
for(const b of blueprints) ok(b.source_anchor && b.claim_basis && b.emne_id && b.method_id && b.mechanism && b.critical_distinction,"Alle spørsmålsplaner har kilde, emne, metode, mekanisme og distinksjon");
ok(!fs.existsSync("data/fag/politikk/kvalitetslag_v1"),"Ingen kvalitetslag-overlay finnes");
console.log(`PASS: ${pass}`);
console.log("RESULTAT: PASS");
