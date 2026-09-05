const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const exists=p=>fs.existsSync(path.join(ROOT,p));
const R='kunst_kuratering_og_program',K='kunst/kunst_kuratering_og_program';
const M='data/Civication/roleModels/kunst/kunst_kuratering_og_program.json';
const G='data/Civication/workGrammars/kunst/kunst_kuratering_og_program.json';
const P='data/Civication/mailPlans/kunst/kunst_kuratering_og_program_plan.json';
const W='data/Civication/roleWorlds/kunst/kunst_kuratering_og_program.json';
const SF='reports/CIVICATION_KUNST_KURATERING_OG_PROGRAM_PREREQUISITES_SOURCE_FIRST.md';
const REM=['situated','reputation'].join('_');
const T=['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const LOOPS=['spørsmål -> research -> utvalg -> begrunnelse -> kunstnerdialog -> produksjon -> publikumsrespons','påstand -> kildekontroll -> tolkning -> motperspektiv -> tekst -> faglig kontroll'];
const MAY=['foreslå og begrunne utvalg','utvikle konsepter','forhandle faglige premisser innen mandat'];
const MAY_NOT=['skjule interessekonflikter','garantere innkjøp eller salg uten fullmakt','endre proveniens uten dokumentasjon','framstille tolkning som ubestridt faktum'];
const POLICY={Kuratorassistent:{policy:'qualification_required',qualification_ids:['relevant_education_or_employer_qualification']},Kurator:{policy:'appointment_required',qualification_ids:['employer_appointment']},'Senior kurator':{policy:'appointment_required',qualification_ids:['employer_appointment']}};
const PLACES=['research_og_kuratorisk_beslutningsrom','proveniens_rettighet_og_lanekontroll','kunstnerdialog_og_programbord','tekst_formidling_og_produksjonshandoff'];
const PEOPLE=['ingrid_senior_kurator_kunst_kuratering_og_program','malik_proveniens_rettighet_kunst_kuratering_og_program','sofia_kunstner_programdialog_kunst_kuratering_og_program','henrik_tekst_formidling_produksjon_kunst_kuratering_og_program'];
const PERSISTENT='utstillingsprogram_research_utvalg_proveniens_rettighet_og_beslutningslogg';
assert.ok(exists(M)&&exists(G)&&exists(P));
const m=read(M),g=read(G),p=read(P),badge=read('data/badges/kunst.json');
assert.equal(m.schema,'civication_role_model_v2');assert.equal(m.role_scope,R);
assert.equal(g.schema,'civication_work_grammar_v2');assert.equal(g.role_scope,R);
assert.deepEqual(g.work_loops,LOOPS);
assert.deepEqual(g.authority_boundary.may,MAY);assert.deepEqual(g.authority_boundary.may_not,MAY_NOT);
assert.equal(g.persistent_work_object_contract.id,PERSISTENT);
assert.ok(g.persistent_work_object_contract.states.length>=12);
assert.match(g.persistent_work_object_contract.handoff_rule,/kilde|proveniens|rettighet|beslutning/i);
assert.match(g.rhythm_contract.loop,/waiting|handoff/i);assert.ok(g.rhythm_contract.waiting_states.length>=5);
assert.match(g.rhythm_contract.rework_rule,/kilde|proveniens|rettighet|habilitet|kunstner/i);
assert.equal(g.day_one_contract.entry,'career_offer_policy_by_title');assert.deepEqual(g.day_one_contract.entry_policy_by_title,POLICY);assert.equal(g.day_one_contract.first_object,PERSISTENT);
assert.deepEqual(g.mail_generation_contract.required_mail_types,T);assert.equal(g.mail_generation_contract.no_generic_fallback,true);

const byLabel=Object.fromEntries(badge.tiers.map(x=>[x.label,x]));
assert.equal(byLabel.Kuratorassistent.career_offer.policy,'qualification_required');assert.deepEqual(byLabel.Kuratorassistent.career_offer.qualification_ids,['relevant_education_or_employer_qualification']);
assert.equal(byLabel.Kurator.life_position.id,'kuratorpraksis');assert.equal(byLabel.Kurator.life_position.employment_independent,true);assert.equal(byLabel.Kurator.career_unlock.policy,'appointment_required');assert.deepEqual(byLabel.Kurator.career_unlock.qualification_ids,['employer_appointment']);
assert.equal(byLabel['Senior kurator'].career_offer.policy,'appointment_required');assert.deepEqual(byLabel['Senior kurator'].career_offer.qualification_ids,['employer_appointment']);
assert.notEqual(byLabel.Kurator.life_position,byLabel.Kurator.career_unlock);

assert.equal(m.related_people.length,4);assert.deepEqual(m.related_people.map(x=>x.id),PEOPLE);
for(const x of m.related_people){assert.equal(x.fictional,true);assert.equal(x.fictional_scenario_actor,true);assert.equal(x.canonical_person_ref,null);assert.ok(x.function.length>=220,x.id);assert.ok(x.authority_relation.length>=220,x.id)}
assert.equal(m.related_places.length,4);assert.deepEqual(m.related_places.map(x=>x.id),PLACES);
assert.ok(m.career_path.entry_from.length);assert.ok(m.career_path.possible_promotions.length>=2);assert.ok(m.career_path.possible_exits.length>=2);assert.ok(m.required_knowledge.skills.length>=8);assert.deepEqual(m.required_knowledge.history_go_badges,['kunst']);
const gate=JSON.stringify({m,g}).toLowerCase();
for(const term of ['history go','kunst-badge','proveniens','attribusjon','rettighet','samtykke','habilitet','qualification_required','appointment_required','employer_appointment','kurator-livspraksis'])assert.ok(gate.includes(term),term);
for(const term of ['innkjøp','salg','budsjett','delegasjon'])assert.ok(gate.includes(term),term);

assert.equal(p.sequence.length,16);assert.deepEqual(p.sequence.map(x=>x.type),['job','people','knowledge','job','people','conflict','job','people','event','micro','job','people','followup','story','consequence','job']);
for(const s of p.sequence){assert.deepEqual(s.fallback_types,[]);assert.equal(s.allowed_families.length,1)}
let n=0,counts={};
for(const t of T){const c=read(`data/Civication/mailFamilies/kunst/${t}/${R}_${t}.json`),ms=c.families.flatMap(f=>f.mails||[]);counts[t]=ms.length;n+=ms.length;for(const x of ms){assert.equal(x.mail_type,t);assert.equal(x.role_scope,R);assert.ok(x.summary.length>=500,`${x.id} summary ${x.summary.length}`);assert.equal(x.situation.length,3);assert.equal(x.choices.length,2);for(const ch of x.choices){assert.ok(ch.reply.length>=220,`${x.id}/${ch.id} reply ${ch.reply.length}`);assert.ok(ch.feedback.length>=300,`${x.id}/${ch.id} feedback ${ch.feedback.length}`);assert.ok(Object.keys(ch.effects.stats).length>=4)}}}
assert.deepEqual(counts,{job:4,people:4,conflict:1,story:1,event:1,micro:1,followup:1,knowledge:1,consequence:1});assert.equal(n,15);

const man=read('data/Civication/roleModels/manifest.json');assert.ok(man.files.includes(M));
const career=read('data/Civication/careerGameplayMatrix.json'),row=career.worlds.find(x=>x.key===K);assert.ok(row,'career row missing');assert.equal(row.status,'playable');assert.equal(row.audit.runtime_gate,true);assert.deepEqual(row.audit.missing_components,[]);assert.equal(row.audit.salary.rows.length,3);assert.deepEqual(row.audit.salary.rows.map(x=>[x.title,x.offer_policy]),[['Kuratorassistent','qualification_required'],['Kurator','appointment_required'],['Senior kurator','appointment_required']]);
for(const name of ['entry','day_one','workday_loop','people','places','mail','knowledge','consequences','performance','economy','progression','exit'])assert.equal(row.audit.components[name].level,'complete',name);

const readiness=read('data/Civication/roleWorldRolloutReadiness.json'),ready=readiness.roles.find(x=>x.key===K),done=exists(W);assert.ok(ready,'readiness row missing');assert.equal(ready.classification,'rollout_ready');assert.equal(ready.dimensions[REM].status,done?'foundation_ready':'needs_role_authored_work');assert.deepEqual(ready.authored_work_required,done?[]:[REM]);assert.equal(ready.role_world_status,done?'role_world_complete':'role_world_not_started');assert.equal(readiness.rollout_queue.some(x=>x.key===K),!done);assert.equal(readiness.gate.gate_pass,true);assert.equal(ready.cross_role_need,'candidate_when_shared_work_is_real');
const sf=fs.readFileSync(path.join(ROOT,SF),'utf8');assert.match(sf,/not Role World completion/i);assert.match(sf,/qualification_required/);assert.match(sf,/appointment_required/);assert.match(sf,/employer_appointment/);assert.match(sf,/kuratorpraksis/);assert.match(sf,/15 source mails/i);assert.match(sf,/no new runtime/i);assert.match(sf,/candidate_when_shared_work_is_real/);assert.match(sf,/does not materialize a cross-role link/i);
console.log('Civication Kunst Kuratering og program prerequisites: OK');
