#!/usr/bin/env node
// Real renholder Life Story choices, not normal-job/calendar certification.
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const origin = 'http://127.0.0.1:4188';
const spill = process.env.RENHOLDER_CASE === 'soel';
const thread = spill ? 'soelet_i_fellesarealet' : 'tidsvinduet_krymper';
const output = path.resolve('reports/civication-renholder-'+(spill?'soel':'lifestory')+'-browser');
mkdirSync(output, { recursive: true });
const server = spawn('python3', ['-m', 'http.server', '4188', '--bind', '127.0.0.1'], { stdio: 'ignore' });
let serverError = null;
server.on('error', error => { serverError = error; });
async function waitForServer() {
  for (let n=0;n<200;n++) {
    if (serverError) throw serverError;
    if (server.exitCode !== null) throw new Error('HTTP server stopped');
    try { if ((await fetch(origin+'/Civication.html')).ok) return; } catch {}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  throw new Error('HTTP server did not start');
}
async function openDay(page) {
  const close = page.locator('#civiSectionPopup.is-open button[data-civi-popup-close]').first();
  if (await close.isVisible().catch(()=>false)) await close.click({timeout:12000});
  await page.locator('.civi-footer button[data-category="minDag"]').click({timeout:20000});
}
async function startDayTwo(page,label) {
  const next = page.locator('[data-lifestory-next-day]').first();
  assert.equal(await next.count(),1,label+': real day summary has day control');
  let mode = 'ui';
  if (await next.isEnabled()) await next.click({timeout:20000});
  else {
    mode = 'runner-fixture';
    assert.ok(await page.locator('[data-lifestory-next-action]').count(),label+': disclose shell inbox gate');
    await page.screenshot({path:path.join(output,label+'-shell-inbox-gate.png'),fullPage:true});
    await page.evaluate(async()=>{
      const c=await globalThis.CivicationLifestoryContent.loadContent('renholder');
      const s=globalThis.CivicationLifestoryState.load();
      if(s.dag!==1 || !s.dagFerdig) throw new Error('not at actual day-one conclusion');
      globalThis.CivicationLifestoryRunner.startNextDay(s,c);
      globalThis.CivicationLifestoryState.save(s);
    });
    await page.reload({waitUntil:'load',timeout:90000});
  }
  await page.waitForFunction(()=>globalThis.CivicationLifestoryState?.load?.()?.dag===2,null,{timeout:45000});
  return mode;
}
const baseFlags = spill ? {ren_soel_rengjort:false,ren_soel_aapnet:false,ren_soel_arbeid_venter:false,ren_soel_kontroll_venter:false,ren_soel_kari_mottatt:false,ren_soel_mottak_venter:false,ren_soel_ansvar_bekreftet:false,ren_soel_skilt_kontrollert:false,ren_soel_tralle_utbedret:false,ren_soel_vernerunde_avtalt:false,ren_soel_tiltakskontroll_venter:false} : { ren_tid_plan_bekreftet:false, ren_tid_wc3_spiller:false,
  ren_tid_korridor3_amina:false, ren_tid_kontorer_spiller:false, ren_tid_trapp_spiller:false,
  ren_tid_amina_venter:false, ren_tid_kari_mottatt:false, ren_tid_plan_venter:false,
  ren_tid_egen_oppgave_venter:false, ren_tid_mottak_venter:false };
async function play(browser, fixture) {
  const {label,viewport,choices,flags,status}=fixture;
  const context=await browser.newContext({viewport,isMobile:viewport.width<600,hasTouch:true});
  const page=await context.newPage();
  const errors=[],trace=[];
  page.on('pageerror',error=>errors.push(error.message));
  let dayTransitionMode=null,sawRequest=false,sawPlan=false;
  try {
    await page.goto(origin+'/Civication.html?lifestoryRole=renholder',{waitUntil:'load',timeout:90000});
    await page.waitForFunction(()=>globalThis.CivicationLifestoryState?.load?.()?.rolle==='renholder'
      && !!globalThis.CivicationLifestoryUI?.getCurrentSceneInfo?.()?.sceneId,null,{timeout:90000});
    assert.equal((await page.evaluate(()=>globalThis.CivicationLifestoryState.load())).arkiv.length,0);
    for(let n=0;n<140;n++) {
      const before=await page.evaluate(()=>globalThis.CivicationLifestoryState.load());
      await openDay(page);
      if(before.dagFerdig) {
        if(before.dag===2) break;
        assert.equal(before.dag,1);
        dayTransitionMode=await startDayTwo(page,label);continue;
      }
      const info=await page.evaluate(()=>globalThis.CivicationLifestoryUI.getCurrentSceneInfo());
      const id=info?.sceneId;assert.ok(id,label+': actual next scene');
      const wanted=choices[id];
      const button=page.locator('[data-lifestory-scene="'+id+'"][data-lifestory-choice'
        +(wanted?'="'+wanted+'"':'')+']:not([disabled])').first();
      assert.equal(await button.count(),1,label+': visible choice '+id+'/'+wanted);
      await button.scrollIntoViewIfNeeded();
      const rect=await button.boundingBox();
      assert.ok(rect&&rect.width>0&&rect.x>=-2&&rect.x+rect.width<=viewport.width+2,label+': button geometry '+id);
      const focus=spill ? (id.startsWith('soel_')||id==='d2_avvik_fulgt_opp'||id==='d2_glatt_gulv_etterspill') : id==='tidsvindu_01_telefon'||id.startsWith('tid_')||id==='d2_standard_ekstra_rom'||id==='d2_rolig_formiddag';
      if(focus) {
        if(id==='tid_02_kari_prioriterer'||id==='tid_05_kari_mottar') {
          assert.match(await page.locator('.civi-lifestory-scene .civi-lifestory-kicker').textContent(),/Fra Kari/);
        }
        if(id==='tid_04_amina_resultat') {
          assert.match(await page.locator('.civi-lifestory-scene .civi-lifestory-kicker').textContent(),/Fra Amina/);
        }
        await page.locator('.civi-lifestory-scene').first().screenshot({path:path.join(output,label+'-'+id+'-before.png')});
      }
      const chosen=await button.getAttribute('data-lifestory-choice');
      await button.click({timeout:20000});
      await page.waitForFunction(previous=>globalThis.CivicationLifestoryState.load().arkiv.length===previous+1,
        before.arkiv.length,{timeout:20000});
      const after=await page.evaluate(()=>globalThis.CivicationLifestoryState.load());
      assert.equal(after.arkiv.at(-1).sceneId,id);assert.equal(after.arkiv.at(-1).valgId,chosen);
      trace.push([id,chosen]);
      if(spill && id==='soel_01_krise') {
        assert.ok(!after.tidligereValg.ren_soel_rengjort&&!after.tidligereValg.ren_soel_aapnet&&!after.tidligereValg.ren_soel_kari_mottatt);
      }
      if(spill && id==='d2_avvik_fulgt_opp') assert.ok(!after.tidligereValg.ble_med_vernerunde);
      if(id==='tidsvindu_01_telefon') {
        sawRequest=true;
        assert.ok(!after.tidligereValg.tok_ekstra_rom&&!after.tidligereValg.delte_sonen,
          label+': phone reply is not performed or confirmed shared work');
        if(chosen==='sett_grense') {
          assert.ok(after.relasjoner.driftsleder>=before.relasjoner.driftsleder);
          assert.ok(after.meters.synlighet>=before.meters.synlighet);
        }
      }
      if(id==='tid_02_kari_prioriterer') {
        sawPlan=true;
        for(const k of ['ren_tid_wc3_spiller','ren_tid_korridor3_amina','ren_tid_kontorer_spiller','ren_tid_trapp_spiller']) {
          assert.ok(!after.tidligereValg[k],label+': plan is not actual work '+k);
        }
      }
      if(focus) {
        const consequence=page.locator('.civi-lifestory-konsekvens').first();
        await consequence.scrollIntoViewIfNeeded();
        await consequence.screenshot({path:path.join(output,label+'-'+id+'-after.png')});
      }
    }
    const final=await page.evaluate(()=>globalThis.CivicationLifestoryState.load());
    assert.ok(final.dag===2&&final.dagFerdig&&sawRequest&&sawPlan&&dayTransitionMode,label+': completed actual two-day route');
    for(const [k,v] of Object.entries({...baseFlags,...flags})) assert.equal(final.tidligereValg[k]===true,v,label+': evidence '+k);
    assert.equal(final.threadState[thread].status,status);
    assert.ok(!final.tidligereValg.ren_tid_korridor3_spiller,label+': Amina retains her work');
    await page.reload({waitUntil:'load',timeout:90000});
    await page.waitForFunction(()=>globalThis.CivicationLifestoryState?.load?.()?.dag===2
      && globalThis.CivicationLifestoryState.load().dagFerdig,null,{timeout:90000});
    const saved=await page.evaluate(()=>globalThis.CivicationLifestoryState.load());
    assert.deepEqual(saved.arkiv,final.arkiv,label+': exact history after reload');
    assert.deepEqual(saved.tidligereValg,final.tidligereValg,label+': exact evidence after reload');
    await openDay(page);
    for(const disclosure of ['history','full-history']) {
      const box=page.locator('[data-lifestory-disclosure="'+disclosure+'"]').first();
      if(!(await box.evaluate(el=>el.open))) await box.locator(':scope > summary').click();
    }
    const history=page.locator('[data-lifestory-symposium]').first();
    const normalize=x=>String(x).replace(/\s+/g,' ').trim();
    const shown=normalize(await history.textContent());
    const actual=saved.arkiv.filter(row=>row.threadId===thread);
    for(const row of actual) {
      assert.ok(shown.includes(normalize(row.valgTekst)),label+': Symposium actual choice '+row.sceneId);
      assert.ok(shown.includes(normalize(row.konsekvensTekst)),label+': Symposium actual result '+row.sceneId);
    }
    const result=history.locator('ol > li').filter({hasText:actual.at(-1).valgTekst}).last();
    await result.scrollIntoViewIfNeeded();
    await result.screenshot({path:path.join(output,label+'-symposium-result.png')});
    assert.deepEqual(errors,[],label+': no uncaught browser exceptions');
    return {label,viewport,dayTransitionMode,days:2,flags:{...baseFlags,...flags},status,trace,archiveLength:saved.arkiv.length};
  } catch(error) {
    await page.screenshot({path:path.join(output,label+'-failure.png'),fullPage:true}).catch(()=>{});
    throw error;
  } finally {await context.close();}
}
(async()=>{
 let browser;const results=[];
 try {
  await waitForServer();browser=await chromium.launch({headless:true});
  const sizes=[{width:390,height:844},{width:820,height:1180},{width:1180,height:820}];
  const complete={ren_soel_rengjort:true,ren_soel_aapnet:true,ren_soel_kari_mottatt:true,ren_soel_ansvar_bekreftet:true,ren_soel_skilt_kontrollert:true,ren_soel_vernerunde_avtalt:true};
  const cases=spill ? [
   {label:'soel-ferdig-mobile',extra:{},flags:complete},
   {label:'soel-arbeid-venter-ipad',extra:{soel_01_krise:'be_om_hjelp',soel_02_arbeid:'avvent_hjelp'},flags:{...complete,ren_soel_rengjort:false,ren_soel_aapnet:false,ren_soel_arbeid_venter:true,ren_soel_vernerunde_avtalt:false}},
   {label:'soel-restfukt-ipad',extra:{soel_01_krise:'toerk_og_gaa',soel_03_kontroll:'fortsatt_vaatt'},flags:{...complete,ren_soel_aapnet:false,ren_soel_kontroll_venter:true,ren_soel_vernerunde_avtalt:false}},
   {label:'soel-mottak-venter-mobile',extra:{soel_04_overlevering:'avvent_mottak'},flags:{...complete,ren_soel_kari_mottatt:false,ren_soel_mottak_venter:true}},
   {label:'soel-ansvar-venter-ipad',extra:{soel_05_tiltaksansvar:'avvent_ansvar'},flags:{...complete,ren_soel_ansvar_bekreftet:false}},
   {label:'soel-tiltak-venter-ipad',extra:{soel_06_tiltakskontroll:'avvent_kontroll'},flags:{...complete,ren_soel_skilt_kontrollert:false,ren_soel_tiltakskontroll_venter:true}},
   {label:'soel-invitasjon-nei-mobile',extra:{d2_avvik_fulgt_opp:'takk_nei'},flags:{...complete,ren_soel_vernerunde_avtalt:false}}
  ] : [
   {label:'toaletter-mobile',start:'ta_stille',plan:'prioriter_toaletter',flags:{ren_tid_plan_bekreftet:true,ren_tid_wc3_spiller:true,ren_tid_kari_mottatt:true}},
   {label:'delt-ipad-portrait',start:'ja_men_si_fra',plan:'bekreft_deling',flags:{ren_tid_plan_bekreftet:true,ren_tid_wc3_spiller:true,ren_tid_korridor3_amina:true,ren_tid_kari_mottatt:true}},
   {label:'egen-rute-ipad-landscape',start:'sett_grense',plan:'behold_egen_rute',flags:{ren_tid_plan_bekreftet:true,ren_tid_kontorer_spiller:true,ren_tid_trapp_spiller:true,ren_tid_kari_mottatt:true}},
   {label:'amina-venter-mobile',start:'foreslaa_bytte',plan:'bekreft_deling',extra:{tid_04_amina_resultat:'avvent_resultat'},status:'escalated',flags:{ren_tid_plan_bekreftet:true,ren_tid_wc3_spiller:true,ren_tid_amina_venter:true,ren_tid_kari_mottatt:true}},
   {label:'plan-venter-ipad-portrait',start:'sett_grense',plan:'avvent_plan',status:'escalated',flags:{ren_tid_plan_venter:true}},
   {label:'ugjort-ipad-landscape',start:'ta_stille',plan:'prioriter_toaletter',extra:{tid_03_toaletter:'meld_ikke_utfort',tid_05_kari_mottar:'avvent_mottak'},status:'escalated',flags:{ren_tid_plan_bekreftet:true,ren_tid_egen_oppgave_venter:true,ren_tid_mottak_venter:true}},
   {label:'mottak-dag2-mobile',start:'ta_stille',plan:'prioriter_toaletter',extra:{tid_05_kari_mottar:'avvent_mottak'},status:'escalated',flags:{ren_tid_plan_bekreftet:true,ren_tid_wc3_spiller:true,ren_tid_kari_mottatt:true}}
  ];
  for(const [i,c] of cases.entries()) results.push(await play(browser,{...c,viewport:sizes[i%3],status:c.status||(spill?'escalated':'active'),
    choices:spill ? {...c.extra} : {tidsvindu_01_telefon:c.start,tid_02_kari_prioriterer:c.plan,...c.extra}}));
  console.log('PASS: seven real renholder '+(spill?'spill':'capacity')+' routes, two days, reload and visible Symposium',JSON.stringify(results));
 } finally {
  writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2)+'\n');
  if(browser) await browser.close();server.kill('SIGTERM');
 }
})().catch(error=>{console.error(error?.stack||error);process.exitCode=1;});
