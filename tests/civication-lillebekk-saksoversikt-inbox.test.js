#!/usr/bin/env node
'use strict';
// SAKSOVERSIKT: only actual WorkWorld flags; no fabricated approvals,
// automated outcome, new story, or data writes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,
  '../js/Civication/ui/CivicationInboxTopActionUI.js'),'utf8');
const earlyId='by_radgiver_lillebekk_early_analysis_case_001';
const formalId='by_radgiver_lillebekk_plan_case_001';

function preview(options={}) {
 const host={
   innerHTML:'',querySelectorAll(){return [];}
 };
 const active=options.active===undefined?{role_scope:'by_radgiver_plan'}:options.active;
 const records=options.records||{};
 const ctx={
  document:{
    readyState:'loading',
    addEventListener(){},
    getElementById(id){return id==='civiInbox'?host:null;}
  },
  window:{
    CivicationState:{getActivePosition(){return active;}},
    CivicationMailEngine:{getInbox(){return [];}},
    CivicationWorkWorld:{getWorkObject(id){return records[id]||null;}},
    addEventListener(){},
    setTimeout(){throw new Error('no delayed effects in deterministic rendering');}
  }
 };
 vm.runInNewContext(source,ctx,{filename:'CivicationInboxTopActionUI.js'});
 const api=ctx.window.CivicationInboxTopActionUI;
 const model=api.getLillebekkReviewModel();
 assert.equal(api.renderSections(),true);
 return {model,markup:host.innerHTML};
}
const blank=preview();
assert.equal(blank.model,null);
assert.ok(!blank.markup.includes('Lillebekk · saksoversikt'));
const early={
  work_object_id:earlyId,role_scope:'by_radgiver_plan',
  flags:['map_conflict_written_for_review','green_corridor_draft_requirement_proposed',
   'participation_record_missing','developer_formal_request_pending',
   'school_route_timing_unverified','material_risks_stated_for_politics']
};
const formal={
  work_object_id:formalId,role_scope:'by_radgiver_plan',
  flags:['early_map_conflict_documented','early_green_corridor_unsecured',
   'early_material_risks_visible','early_stormwater_unsecured'],
  status:'awaiting_approval'
};
const result=preview({records:{[earlyId]:early,[formalId]:formal}});
assert.equal(result.model.phase,'Formell saksforberedelse');
assert.equal(result.model.topics.length,7);
assert.equal(result.model.approved,false);
assert.ok(result.model.documented>0);
assert.ok(result.model.open>0);
const byTitle=new Map(result.model.topics.map(row=>[row.title,row]));
assert.equal(byTitle.get('Plankart og areal').status,'Faglig spor registrert');
assert.equal(byTitle.get('Grøntdrag').status,'Motstridende spor – avklar');
assert.equal(byTitle.get('Skolevei').status,'Åpent avvik');
assert.equal(byTitle.get('Medvirkning').status,'Åpent avvik');
assert.equal(byTitle.get('Overvann').status,'Åpent avvik');
assert.equal(byTitle.get('Utbyggerkontakt').status,'Faglig spor registrert');
assert.equal(byTitle.get('Faglig risiko i saksframlegget').status,'Faglig spor registrert');
assert.ok(result.markup.includes('Lillebekk · saksoversikt'));
assert.ok(result.markup.includes('Se faglige vurderinger og åpne avvik'));
assert.equal((result.markup.match(/class="civi-inbox-card"/g)||[]).length,7,
 'seven explicit areas, not generic extra mail');
assert.ok(result.markup.includes('ikke bekreftede bilag'));
assert.ok(result.markup.includes('gir ikke planvedtak eller ledergodkjenning'));
assert.equal(new Set(result.model.topics.map(row=>row.document)).size,7,
 'each discipline needs its own named document control');
assert.ok(result.model.topics.every(row=>row.document && row.check && row.consequence));
assert.equal(byTitle.get('Skolevei').document,
 'Trafikksikkerhetsvurdering og forslag til rekkefølgekrav');
assert.ok(byTitle.get('Skolevei').check.includes('hvem som utfører tiltak'));
assert.equal(byTitle.get('Grøntdrag').consequence,
 'Avviket må føres som uavklart i revisjonsgrunnlaget.');
assert.ok(byTitle.get('Plankart og areal').consequence.includes('kontrolleres mot bilag'));
assert.ok(result.markup.includes('Kontrollgrunnlag som må etterspørres eller leses:'));
assert.ok(result.markup.includes('Kontrollpunkt:'));
assert.ok(result.markup.includes('Neste arbeidsoppgave:'));
assert.ok(result.markup.includes('Faglig følge:'));
assert.ok(result.markup.includes('Registrert faglig spor betyr ikke at et dokument er kontrollert'));
assert.ok(!result.markup.includes('Godkjent av Elin'));
assert.ok(result.markup.indexOf('Lillebekk · saksoversikt')<
 result.markup.indexOf('Jobbmail'),'dossier appears before ordinary inbox history');
const afterRestart=preview({records:JSON.parse(JSON.stringify({[earlyId]:early,[formalId]:formal}))});
assert.equal(JSON.stringify(result.model),JSON.stringify(afterRestart.model),
 'state-backed review is deterministic after reload');

const earlyOnly=preview({records:{[earlyId]:early}});
assert.equal(earlyOnly.model.phase,'Tidlig saksarbeid');
assert.equal(earlyOnly.model.approved,false);
const laterRole=preview({active:{role_id:'film_tv_produksjonsassistent'},
 records:{[earlyId]:early,[formalId]:formal}});
assert.equal(laterRole.model,null,
 'case records from another occupation are not displayed to a different active role');
assert.ok(!laterRole.markup.includes('Lillebekk · saksoversikt'));
const roleViaId=preview({active:{role_id:'by_radgiver_plan'},records:{[formalId]:formal}});
assert.ok(roleViaId.model);
// The formal case is created with two unresolved facts even when no early work exists.
// These must not disappear into the generic «Ingen registrert vurdering» label.
const initialFormal=preview({records:{[formalId]:{
 work_object_id:formalId,role_scope:'by_radgiver_plan',status:'open',
 flags:['skolevei_ikke_dokumentert','politisk_grense_ikke_eksplisitt']
}}});
const initialTopics=new Map(initialFormal.model.topics.map(row=>[row.title,row]));
assert.equal(initialTopics.get('Skolevei').status,'Åpent avvik');
assert.equal(initialTopics.get('Faglig risiko i saksframlegget').status,'Åpent avvik');
assert.equal(initialFormal.model.open,7);
// If later work documents the subject while the old unresolved marker remains,
// the player sees a conflict to check, not a falsely approved outcome.
const documentedButNotReconciled=preview({records:{[formalId]:{
 work_object_id:formalId,role_scope:'by_radgiver_plan',
 flags:['skolevei_ikke_dokumentert','early_school_route_condition_proposed']
}}});
assert.equal(documentedButNotReconciled.model.topics.find(row=>row.title==='Skolevei').status,
 'Motstridende spor – avklar');
// Real accepted job offers use CivicationState.setActivePosition({
 // career_id, title, role_key, ...}) rather than the mail plan's role_scope.
const acceptedPosition=preview({active:{
 career_id:'by',title:'Arealplanlegger',role_key:'arealplanlegger'
},records:{[formalId]:formal}});
assert.ok(acceptedPosition.model,
 'Lillebekk is visible when the player actually accepts the Arealplanlegger job');
assert.ok(acceptedPosition.markup.includes('Lillebekk · saksoversikt'));
const differentPosition=preview({active:{
 career_id:'by',title:'Arkitekt',role_key:'arkitekt'
},records:{[formalId]:formal}});
assert.equal(differentPosition.model,null);
const noData=preview({active:{role_scope:'by_radgiver_plan'},
 records:{[formalId]:{work_object_id:formalId,flags:[],status:'open'}}});
assert.equal(noData.model.documented,0);
assert.equal(noData.model.open,7);
assert.ok(noData.model.topics.every(row=>row.status==='Ingen registrert vurdering'));
assert.ok(!noData.markup.includes('Faglig spor registrert'));
assert.ok(noData.model.topics.every(row=>row.consequence.includes('Ingen registrert vurdering')),
 'missing case material cannot be passed off as checked');
console.log('Lillebekk saksoversikt: 7 real topics, conflict/unknown states, role privacy and reload verified');
