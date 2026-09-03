const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(R,p))),KEY='scenekunst/scenekunst_scene_og_produksjon',ROLE='scenekunst_scene_og_produksjon',MODEL='data/Civication/roleModels/scenekunst/scenekunst_scene_og_produksjon.json',GRAMMAR='data/Civication/workGrammars/scenekunst/scenekunst_scene_og_produksjon.json',PLAN='data/Civication/mailPlans/scenekunst/scenekunst_scene_og_produksjon_plan.json',TYPES=["job","people","conflict","story","event","micro","followup","knowledge","consequence"],ACTORS=["ida_produksjonsleder","jonas_inspisient","marwa_sceneteknisk_leder","samira_publikumskoordinator"],PLACES=["produksjonskontor_og_callboard","scene_og_teknisk_sjekkpunkt","inspisientpult_og_cuebok","foaje_og_publikumsflyt"];
const g=read(GRAMMAR);
assert.equal(g.persistent_work_object_contract.id,'produksjonsbok_call_og_avvikslogg');
assert.match(g.rhythm_contract.loop,/waiting|venting/i);
assert.deepEqual(g.actor_grammar.map(x=>x.id),ACTORS);
assert.deepEqual(g.place_grammar.map(x=>x.id),PLACES);
assert.ok(g.knowledge_dependencies.some(x=>x.id==='history_go_scenekunst_edith_roger_nationaltheatret_produksjonsblikk'));
assert.deepEqual(g.mail_generation_contract.required_mail_types,TYPES);
assert.equal(g.day_one_contract.entry,'appointment_required');
assert.match(g.authority_boundary.may_not.join(' '),/hms|sikkerhet/i);
assert.match(g.authority_boundary.may_not.join(' '),/kunstnerisk/i);
assert.match(g.authority_boundary.may_not.join(' '),/rettighet|tilgjengelig/i);
assert.equal(read('data/Civication/roleModels/manifest.json').files.filter(x=>x===MODEL).length,1);
const model=read(MODEL);
assert.deepEqual(model.work_life.workplaces,PLACES);
assert.deepEqual(model.related_people.map(x=>x.id),ACTORS);
for(const[i,p]of model.related_people.entries()){assert.equal(p.fictional,true);assert.equal(p.fictional_scenario_actor,true);assert.equal(p.canonical_person_ref,null);const expectedWorkplace={ida_produksjonsleder:'produksjonskontor_og_callboard',jonas_inspisient:'inspisientpult_og_cuebok',marwa_sceneteknisk_leder:'scene_og_teknisk_sjekkpunkt',samira_publikumskoordinator:'foaje_og_publikumsflyt'}[p.id];assert.ok(expectedWorkplace);assert.deepEqual(p.workplace_ids,[expectedWorkplace]);assert.ok(p.function.length>=220);assert.ok(p.authority_relation.length>=220)}
assert.ok(model.career_path.possible_promotions.length>=2);assert.ok(model.career_path.possible_exits.length>=2);assert.ok(model.required_knowledge.history_go_badges.includes('scenekunst'));
const plan=read(PLAN);
assert.equal(plan.id,ROLE+'_foundation_v1');assert.equal(plan.sequence.length,16);
assert.deepEqual(plan.sequence.map(x=>x.type),["job","people","knowledge","job","people","conflict","job","people","event","micro","job","people","followup","story","consequence","job"]);
for(const[i,s]of plan.sequence.entries()){assert.equal(s.step,i+1);assert.deepEqual(s.fallback_types,[]);assert.equal(s.allowed_families.length,1)}
for(const x of ['promoted','fired','stagnated'])assert.ok(plan.outcome_rules[x]);
const C={job:4,people:4,conflict:1,story:1,event:1,micro:1,followup:1,knowledge:1,consequence:1},ids=new Set(),subjects=new Set();
for(const type of TYPES){const c=read('data/Civication/mailFamilies/scenekunst/'+type+'/'+ROLE+'_'+type+'.json'),ms=c.families.flatMap(f=>f.mails||[]),labels=[];assert.equal(c.schema,'civication_mail_family_catalog_v1');assert.equal(c.mail_type,type);assert.equal(ms.length,C[type]);for(const x of ms){assert.ok(!ids.has(x.id));assert.ok(!subjects.has(x.subject));ids.add(x.id);subjects.add(x.subject);assert.ok(x.summary.length>=320);assert.equal(x.situation.length,3);assert.equal(x.choices.length,2);for(const q of x.choices){labels.push(q.label);assert.ok(q.reply.length>=150);assert.ok(q.feedback.length>=220);assert.ok(Object.keys(q.effects.stats).length>=3)}}assert.equal(new Set(labels).size,labels.length)}
assert.equal(ids.size,15);
const k=read('data/Civication/mailFamilies/scenekunst/knowledge/'+ROLE+'_knowledge.json').families[0].mails[0];
assert.equal(k.place_id,'nationaltheatret');assert.equal(k.task_payload.person_id,'edith_roger');assert.equal(k.task_contract.completion_rule,'history_go_payload_completed');for(const r of k.task_contract.evidence_refs)assert.ok(fs.existsSync(path.join(R,r)),r);
const pack=read('data/Civication/rolePackIndex.json').roles.find(x=>x.category==='scenekunst'&&x.role_scope===ROLE);assert.equal(pack.status,'complete_reference_v2');
const career=read('data/Civication/careerGameplayMatrix.json').worlds.find(x=>x.key===KEY);assert.equal(career.status,'playable');assert.equal(career.audit.runtime_gate,true);assert.deepEqual(career.audit.missing_components,[]);
const rr=read('data/Civication/roleWorldRolloutReadiness.json'),ready=rr.roles.find(x=>x.key===KEY);assert.equal(ready.classification,'rollout_ready');assert.ok(['role_world_not_started','role_world_complete'].includes(ready.role_world_status));for(const d of ['people_places_integrity','persistent_work_object','rhythm_waiting_handoff_rework','history_go_affordance','situated_reputation'])assert.equal(ready.dimensions[d].status,'foundation_ready',d);assert.deepEqual(ready.authored_work_required,[]);assert.equal(ready.cross_role.need,'candidate_when_shared_work_is_real');assert.equal(rr.rollout_queue.some(x=>x.key===KEY),ready.role_world_status==='role_world_not_started');
const sp=read('data/Civication/scenarioPeople/generated/scenekunst.json'),fp=new Set(Object.values(sp.people_pool||{}).flat().map(x=>x.person_id));for(const id of ACTORS)assert.ok(!fp.has(id));
const sf=fs.readFileSync(path.join(R,'reports/CIVICATION_SCENEKUNST_SCENE_OG_PRODUKSJON_PREREQUISITES_SOURCE_FIRST.md'),'utf8');assert.match(sf,/not Role World completion/i);assert.match(sf,/produksjonsbok_call_og_avvikslogg/);assert.match(sf,/candidate_when_shared_work_is_real/);assert.match(sf,/29\/30/);
console.log('Civication Scenekunst Scene og produksjon prerequisites: OK');
