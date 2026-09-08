import fs from 'node:fs';
import assert from 'node:assert/strict';
const ROLE='vitenskap_forskning';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const model=read('data/Civication/roleModels/vitenskap/'+ROLE+'.json');
const grammar=read('data/Civication/workGrammars/vitenskap/'+ROLE+'.json');
const plan=read('data/Civication/mailPlans/vitenskap/'+ROLE+'_plan.json');
const badge=read('data/badges/vitenskap.json');
assert.equal(model.role_scope,ROLE);assert.deepEqual(model.badge_titles,['Forsker','Seniorforsker']);assert.equal(model.related_people.length,4);assert.equal(model.related_places.length,4);
const modelText=JSON.stringify(model);assert.match(modelText,/academic_qualification_and_employment/);assert.match(modelText,/oppdragsgiver/i);assert.match(modelText,/reproduser/i);assert.match(modelText,/bounded_rework/);
const grammarText=JSON.stringify(grammar);for(const token of ['reproduser','oppdrags','vent','handoff','bounded_rework','History Go'])assert.ok(grammarText.toLowerCase().includes(token.toLowerCase()),token);
assert.equal(plan.sequence.length,16);const types=['job','people','conflict','story','event','micro','followup','knowledge','consequence'];let mails=0;const people=new Set(model.related_people.map(p=>p.id));const places=new Set(model.related_places.map(p=>p.id));for(const type of types){const f=read('data/Civication/mailFamilies/vitenskap/'+type+'/'+ROLE+'_'+type+'.json');assert.equal(f.role_scope,ROLE);assert.equal(f.mail_type,type);assert.equal(f.families.length,1);for(const m of f.families[0].mails){mails++;assert.ok(people.has(m.people_ref),m.people_ref);assert.ok(places.has(m.place_id),m.place_id);assert.equal(m.choices.length,2);}}assert.equal(mails,15);
const knowledge=read('data/Civication/mailFamilies/vitenskap/knowledge/'+ROLE+'_knowledge.json');assert.match(JSON.stringify(knowledge),/bedre spørsmål/i);assert.match(JSON.stringify(knowledge),/aldri som kvalifikasjon/i);
const byLabel=Object.fromEntries(badge.tiers.map(t=>[t.label,t]));for(const title of ['Forsker','Seniorforsker']){assert.equal(byLabel[title].career_offer.policy,'qualification_required');assert.deepEqual(byLabel[title].career_offer.qualification_ids,['academic_qualification_and_employment']);assert.equal(byLabel[title].career_offer.role_scope,ROLE);}
const all=JSON.stringify({model,grammar,plan}).toLowerCase();for(const banned of ['badge alene kvalifiserer','xp alene kvalifiserer'])assert.ok(!all.includes(banned));
console.log('Vitenskap Forskning prerequisites OK');
