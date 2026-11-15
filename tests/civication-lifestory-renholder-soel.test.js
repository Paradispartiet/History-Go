#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Content=require('../js/Civication/lifestory/lifestoryContent.js');
const State=require('../js/Civication/lifestory/lifestoryState.js');
const Runner=require('../js/Civication/lifestory/lifestoryRunner.js');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const m=read('data/Civication/lifestory/manifest.json'), r=m.roles.renholder;
const content=Content.buildContent({role:read(r.role),phaseDefinitions:read(m.shared.phaseDefinitions),roleThreads:read(r.threads),roleScenes:read(r.scenes),lifeThreads:read(m.life.threads),lifeScenes:read(m.life.scenes)});
function reach(s,id){for(let n=0;n<120;n++){let sc=Runner.selectNextScene(s,content);assert.ok(sc,'reachable '+id);if(sc.id===id)return;Runner.applyChoice(s,content,sc.id,sc.valg[0].id);}assert.fail(id);}
function choose(s,id,c){assert.equal(Runner.selectNextScene(s,content)?.id,id);Runner.applyChoice(s,content,id,c);}
function end(s){for(let n=0;!s.dagFerdig;n++){assert.ok(n<120);let sc=Runner.selectNextScene(s,content);assert.ok(sc);Runner.applyChoice(s,content,sc.id,sc.valg[0].id);}return s;}
let invitation=State.createInitialState(content);end(invitation);invitation=Runner.startNextDay(invitation,content);reach(invitation,'d2_avvik_fulgt_opp');choose(invitation,'d2_avvik_fulgt_opp','bli_med');
assert.ok(!invitation.tidligereValg.ble_med_vernerunde,'a future invitation is not actual participation');
assert.notEqual(invitation.threadState.soelet_i_fellesarealet.status,'completed','invitation does not repair trolley or supply signs');
const flag=(s,k)=>s.tidligereValg['ren_soel_'+k]===true;
for(const start of ['meld_avvik','toerk_og_gaa','be_om_hjelp']) {
 for(const work of ['rengjor','avvent_hjelp']) for(const control of work==='rengjor'?['kontroller_og_aapne','fortsatt_vaatt']:['none']) for(const receipt of ['kari_mottar','avvent_mottak']) for(const invite of ['bli_med','takk_nei']) {
  let s=State.createInitialState(content);reach(s,'soel_01_krise');choose(s,'soel_01_krise',start);
  assert.ok(!flag(s,'rengjort')&&!flag(s,'kontrollert')&&!flag(s,'aapnet')&&!flag(s,'kari_mottatt'),'initial response is not all later work');
  assert.equal(flag(s,'sindre_hjelper'),start==='be_om_hjelp');
  choose(s,'soel_02_arbeid',work);
  assert.equal(flag(s,'rengjort'),work==='rengjor');assert.ok(flag(s,'sikret'));assert.ok(!flag(s,'aapnet'));
  if(work==='rengjor')choose(s,'soel_03_kontroll',control);
  assert.equal(flag(s,'aapnet'),control==='kontroller_og_aapne');
  choose(s,'soel_04_overlevering',receipt);
  assert.equal(flag(s,'kari_mottatt'),receipt==='kari_mottar');
  assert.ok(!flag(s,'tralle_utbedret')&&!flag(s,'skilt_kontrollert'));
  end(s);s=Runner.startNextDay(JSON.parse(JSON.stringify(s)),content);
  const follow=start==='meld_avvik'?'d2_avvik_fulgt_opp':'d2_glatt_gulv_etterspill';reach(s,follow);
  choose(s,follow,start==='meld_avvik'?invite:'fortell_aerlig');
  assert.equal(flag(s,'vernerunde_avtalt'),start==='meld_avvik'&&invite==='bli_med');
  assert.ok(!s.tidligereValg.ble_med_vernerunde);
  reach(s,'soel_05_tiltaksansvar');choose(s,'soel_05_tiltaksansvar','bekreft_ansvar');
  assert.ok(flag(s,'ansvar_bekreftet'));assert.ok(!flag(s,'skilt_kontrollert')&&!flag(s,'tralle_utbedret'));
  assert.ok(!flag(s,'tralle_ute_av_bruk'),'a request to stop the trolley is not confirmed isolation');
  choose(s,'soel_06_tiltakskontroll','kontroller_skilt');
  assert.ok(flag(s,'skilt_kontrollert'));assert.ok(!flag(s,'tralle_utbedret'));
  assert.equal(flag(s,'aapnet'),control==='kontroller_og_aapne','equipment follow-up cannot open an unchecked floor');
  assert.equal(flag(s,'arbeid_venter'),work==='avvent_hjelp');
  assert.equal(flag(s,'kontroll_venter'),work==='rengjor'&&control==='fortsatt_vaatt');
  assert.equal(flag(s,'mottak_venter'),receipt==='avvent_mottak','later action-plan receipt does not silently rewrite earlier receipt');
  assert.equal(s.threadState.soelet_i_fellesarealet.status,'escalated','unrepaired trolley keeps case open');
  const saved=JSON.parse(JSON.stringify(s));assert.deepEqual(saved.arkiv,s.arkiv);assert.deepEqual(saved.tidligereValg,s.tidligereValg);
  const history=Runner.getSymposium(saved,content).tidslinje;
  for(const row of saved.arkiv.filter(x=>x.threadId==='soelet_i_fellesarealet'))assert.ok(history.some(x=>x.sceneId===row.sceneId&&x.valgId===row.valgId&&x.konsekvensTekst===row.konsekvensTekst));
 }
}
// All deferred follow-ups remain reachable without producing completion evidence.
for(const decision of ['avvent_ansvar','bekreft_ansvar']){
 let s=State.createInitialState(content);reach(s,'soel_01_krise');choose(s,'soel_01_krise','be_om_hjelp');choose(s,'soel_02_arbeid','avvent_hjelp');choose(s,'soel_04_overlevering','avvent_mottak');end(s);s=Runner.startNextDay(s,content);reach(s,'d2_glatt_gulv_etterspill');choose(s,'d2_glatt_gulv_etterspill','tone_ned');reach(s,'soel_05_tiltaksansvar');choose(s,'soel_05_tiltaksansvar',decision);choose(s,'soel_06_tiltakskontroll','avvent_kontroll');end(s);
 assert.ok(!flag(s,'aapnet')&&!flag(s,'skilt_kontrollert')&&!flag(s,'tralle_utbedret'));
 assert.equal(flag(s,'ansvar_bekreftet'),decision==='bekreft_ansvar');assert.ok(flag(s,'tiltakskontroll_venter'));
 while(s.dag<7){s=Runner.startNextDay(JSON.parse(JSON.stringify(s)),content);end(s);}
 assert.ok(flag(s,'arbeid_venter')&&flag(s,'mottak_venter')&&flag(s,'tiltakskontroll_venter'));
 assert.equal(s.tidligereValg.wa_d_c17_status,'andre_rom_tilbudt');
}
console.log('Renholder spill: 36 actual routes, both invitations, separate floor/receipt/sign/trolley evidence, pending cases, seven-day persistence and Symposium OK');
