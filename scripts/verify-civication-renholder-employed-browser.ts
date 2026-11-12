// Actual quiz -> offer -> acceptance -> seven employed days -> paid week.
// No production progress is seeded or patched; the click observer only reads.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {nextDayViaUi} from './verify-civication-arbeidsledig-browser.js';

export default async function verifyRenholderEmployment(browser:any,origin:string,output:string) {
  const read=(p:string)=>JSON.parse(readFileSync(join(process.cwd(),p),'utf8'));
  const quizzes=[['grand_hotel_sets',3],['borsen_oslo_sets',4],['cafe_engebret_sets',1]].map(([file,count])=>{
    const quiz=read('data/quiz/naeringsliv/'+file+'.json');
    assert.equal(quiz.categoryId,'naeringsliv');
    const sets=quiz.sets.slice(0,Number(count));assert.equal(sets.length,count);
    return {...quiz,sets};
  });
  const jobIds=new Set<string>(read('data/Civication/mailFamilies/naeringsliv/job/renholder_job.json').families.flatMap((f:any)=>f.mails.map((m:any)=>m.id)));
  const context=await browser.newContext({viewport:{width:820,height:1180},hasTouch:true});
  await context.addInitScript(()=>{
    localStorage.setItem('hg_onboarding_shown_v1','1');
    localStorage.setItem('HG_TEST_MODE','1');
    const app=globalThis as any;
    app.__renholderAudit=[];
    app.DEBUG=true;
    app.performance.setResourceTimingBufferSize(10000);
    app.document.addEventListener('click',(event:any)=>{
      const target=event.target;
      const button=target?.closest?.('[data-civi-next-action-answer],[data-civi-next-action-advance],[data-lifestory-next-day]');
      if(!button)return;
      const action=app.CivicationNextActionSelector?.getCurrent?.();
      const answer=button.hasAttribute('data-civi-next-action-answer');
      const mailId=answer?button.getAttribute('data-mail-id'):action?.id;
      const row=app.CivicationDailyMailBuilder?.inspect?.()?.runtime?.items?.find((r:any)=>r.event?.id===mailId);
      const envelope=app.CivicationMailEngine?.getMail?.(mailId);
      const source=row?.event||envelope?.event||action?.event||{};
      const wallet=app.CivicationState?.getWallet?.();
      const economy=app.CivicationEconomyEngine?.getEconomySnapshot?.();
      app.__renholderAudit.push({
        day:Number(app.CivicationCalendar?.getClock?.().dayIndex),
        phase:app.CivicationCalendar?.getPhase?.(),
        answer,
        id:mailId,selectorId:action?.id,scope:source.role_scope,
        sourceMailId:source.source_mail_id||source.daily_mail_meta?.source_mail_id||source.id,
        choice:button.getAttribute('data-choice-id'),
        rollover:action?.canStartNewDay===true,
        balance:Number(wallet?.balance||0),
        lastSettledDay:Number(wallet?.last_tick_day_index),
        records:JSON.parse(JSON.stringify(wallet?.completed_game_days_v1||[])),
        currentNet:Math.floor(Number(economy?.weeklySalary||0))-Math.floor(Number(economy?.weeklyJobExpenses||0)),
        livelihood:Number(economy?.weeklyLivelihoodProjectedNet||0)
      });
    },true);
  });
  const page=await context.newPage();const errors:string[]=[];const browserLog:string[]=[];const trace:any[]=[];let earned=0;
  page.on('pageerror',(e:Error)=>errors.push(e.message));
  page.on('console',(m:any)=>{if(['log','warning','error'].includes(m.type()))browserLog.push(m.type()+': '+m.text());});
  page.on('requestfailed',(r:any)=>browserLog.push('requestfailed '+r.url()+' '+r.failure()?.errorText));
  page.on('request',(r:any)=>{if(/data\/quiz\//.test(r.url()))browserLog.push('quiz request '+r.url());});
  page.on('requestfinished',(r:any)=>{if(/data\/quiz\//.test(r.url()))browserLog.push('quiz finished '+r.url());});
  page.on('response',(r:any)=>{if(r.status()>=400)browserLog.push('HTTP '+r.status()+' '+r.url());});
  const state=()=>page.evaluate(()=>(globalThis as any).CivicationLifestoryState.load());
  const economy=()=>page.evaluate(()=>{
    const app=globalThis as any,w=app.CivicationState.getWallet();
    return {day:Number(app.CivicationCalendar.getClock().dayIndex),balance:Number(w.balance||0),
      lastSettledDay:Number(w.last_tick_day_index),records:w.completed_game_days_v1||[],active:app.CivicationState.getActivePosition()};
  });
  async function minDag(){
    const close=page.locator('#civiSectionPopup.is-open button[data-civi-popup-close]').first();
    if(await close.isVisible().catch(()=>false))await close.click({timeout:12000});
    await page.locator('.civi-footer button[data-category="minDag"]').click({timeout:20000});
  }
  try {
    for(const quiz of quizzes){
      await page.goto(origin+'/index.html?hgTest=1#/place/'+quiz.targetId,{waitUntil:'domcontentloaded',timeout:90000});
      await page.waitForFunction((id:string)=>{
        const app=globalThis as any;
        return app.__HG_APP_READY__&&app.__HG_ROUTER_STARTED__&&app.document.querySelector('#placeCard')?.getAttribute('data-current-place-id')===id&&app.QuizEngine?.getTargetSummary;
      },quiz.targetId,{timeout:90000});
      assert.equal(await page.evaluate(()=>Number(JSON.parse(localStorage.getItem('merits_by_category')||'{}').naeringsliv?.points||0)),earned,'no injected merits');
      await page.evaluate(()=>{const app=globalThis as any;app.TEST_MODE=false;app.QuizEngine.init({quizFeedbackMs:120});});
      await page.locator('#pcQuiz').click({timeout:20000});
      for(const [index,set] of quiz.sets.entries()){
        for(const question of set.questions){
          await page.waitForFunction((text:string)=>(globalThis as any).document.querySelector('#quizQuestion')?.textContent?.trim()===text,question.question,{timeout:25000});
          await page.locator('#quizChoices').getByRole('button',{name:question.answer,exact:true}).click({timeout:20000});
        }
        await page.waitForFunction((id:string)=>JSON.parse(localStorage.getItem('hg_quiz_sets_v1')||'{}')[id]?.completed===true,set.set_id,{timeout:25000});
        earned++;
        assert.equal(await page.evaluate(()=>Number(JSON.parse(localStorage.getItem('merits_by_category')||'{}').naeringsliv?.points||0)),earned,'one earned point per actual set');
        if(index<quiz.sets.length-1){await page.locator('#quizSummaryPrimary').waitFor({state:'visible',timeout:20000});await page.locator('#quizSummaryPrimary').click();}
      }
    }
    assert.equal(earned,8);
    await page.goto(origin+'/Civication.html',{waitUntil:'load',timeout:90000});
    await page.waitForFunction(()=>{
      const app=globalThis as any,o=app.CivicationJobs?.getLatestPendingOffer?.();
      return o?.career_id==='naeringsliv'&&o?.title==='Renholder'&&Number(o.threshold)===8&&app.CivicationLifestoryUI?.getCurrentSceneInfo?.();
    },null,{timeout:90000});
    assert.equal((await economy()).active,null,'earned access is not employment');
    assert.equal((await state()).rolle,'arbeidsledig','offer alone does not change story role');
    await page.locator('.civi-footer button[data-category="karriere"]').click();
    await page.locator('#activeJobSection .civi-mini-card [data-civi-mini-open]').click({timeout:30000});
    await page.locator('#civiSectionPopup.is-open #civiOfferAccept').click({timeout:30000});
    await page.waitForFunction(()=>{
      const app=globalThis as any;
      return app.CivicationState.getActivePosition()?.title==='Renholder'&&app.CivicationLifestoryState.load()?.rolle==='renholder';
    },null,{timeout:30000});
    const accepted=await economy();assert.equal(accepted.day,1);assert.equal(accepted.active.career_id,'naeringsliv');
    await minDag();await page.screenshot({path:join(output,'renholder-earned-accepted.png'),fullPage:true});
    const days:any[]=[];const roleMailProof:any[]=[];let payout:any=null;
    for(let day=1;day<=7;day++){
      await minDag();let actions=0;
      while(!(await state()).dagFerdig){
        const before=await state();assert.equal(before.dag,day);assert.equal(before.rolle,'renholder');
        const active=(await economy()).active;assert.equal(active?.title,'Renholder');
        const id=await page.evaluate(()=>(globalThis as any).CivicationLifestoryUI.getCurrentSceneInfo()?.sceneId);assert.ok(id);
        const choice=page.locator('[data-lifestory-scene="'+id+'"][data-lifestory-choice]:not([disabled])').first();
        const chosen=await choice.getAttribute('data-lifestory-choice');await choice.click({timeout:20000});
        await page.waitForFunction((length:number)=>(globalThis as any).CivicationLifestoryState.load().arkiv.length===length+1,before.arkiv.length,{timeout:20000});
        const after=await state();assert.equal(after.arkiv.at(-1).sceneId,id);assert.equal(after.arkiv.at(-1).valgId,chosen);
        trace.push({day,id,choice:chosen});assert.ok(++actions<150,'authored day terminates');await minDag();
      }
      const before=await economy();assert.equal(before.day,day);assert.equal(before.active?.title,'Renholder');assert.equal(before.lastSettledDay,1,'no early salary');
      assert.ok(before.records.every((r:any)=>r.careerId==='naeringsliv'&&r.dayIndex<day));
      await page.screenshot({path:join(output,'renholder-employed-day-'+day+'.png'),fullPage:true});
      await nextDayViaUi(page,'earned-renholder-week',day);
      const after=await economy();assert.equal(after.day,day+1);
      const audit=await page.evaluate(()=>{
        const app=globalThis as any;
        return (app.__renholderAudit||[]).map((r:any)=>{
          const mail=app.CivicationMailEngine?.getMail?.(r.id);
          return {...r,resolved:mail?.resolved===true||mail?.status==='resolved'||!!(mail&&app.CivicationDayProgression?.isPreviouslyAnsweredInboxItem?.(mail))};
        });
      });
      roleMailProof.splice(0,roleMailProof.length,...audit.filter((r:any)=>r.answer&&r.scope==='renholder'&&jobIds.has(r.sourceMailId)&&r.resolved));
      if(day<7){
        assert.equal(after.lastSettledDay,1);assert.equal(after.active?.title,'Renholder');
        assert.deepEqual(after.records.map((r:any)=>r.dayIndex),Array.from({length:day},(_,i)=>i+1),'one record per completed employed day');
        assert.ok(after.records.every((r:any)=>r.careerId==='naeringsliv'&&r.weeklyNet>0));
      }else{
        const click=audit.filter((r:any)=>r.day===7&&r.rollover&&r.phase==='day_end').at(-1);assert.ok(click,'real day-7 payroll control was clicked');
        assert.deepEqual(click.records.map((r:any)=>r.dayIndex),[1,2,3,4,5,6]);
        assert.ok(click.records.every((r:any)=>r.careerId==='naeringsliv'));
        assert.equal(click.livelihood,0,'no supplementary livelihood was selected');
        const expected=Math.floor((click.records.reduce((sum:number,r:any)=>sum+Number(r.weeklyNet),0)+click.currentNet)/7);
        assert.ok(expected>0);assert.equal(after.lastSettledDay,8);assert.equal(after.balance-click.balance,expected,'exact salary for seven recorded employment days');
        assert.deepEqual(after.records,[],'settled records cannot be paid twice');
        if(!after.active)assert.equal(await page.evaluate(()=>(globalThis as any).CivicationState.getState().unemployed_since_day_index),8,'a real layoff can occur after the earned week');
        else assert.equal(after.active.title,'Renholder');
        payout={before:click.balance,after:after.balance,net:expected,activeAfterWeek:after.active?.title||null};
      }
      days.push({day,completed:after.day,records:after.records.length,balance:after.balance});
    }
    assert.ok(roleMailProof.length>0,'actual renholder job mail was answered and resolved');
    for(const proof of roleMailProof){assert.ok(proof.id);assert.equal(proof.id,proof.selectorId,'resolved job proof belongs to the actual clicked mail');}
    const end=await economy();const archive=(await state()).arkiv;
    await page.reload({waitUntil:'load',timeout:90000});
    await page.waitForFunction(()=>(globalThis as any).CivicationCalendar?.getClock?.().dayIndex===8&&!!(globalThis as any).CivicationLifestoryState?.load?.(),null,{timeout:90000});
    const restored=await economy();assert.equal(restored.balance,end.balance);assert.equal(restored.lastSettledDay,8);assert.deepEqual(restored.records,end.records);assert.deepEqual(restored.active,end.active);assert.deepEqual((await state()).arkiv,archive,'reload preserves history and cannot pay again');
    assert.equal(await page.evaluate(()=>Number(JSON.parse(localStorage.getItem('merits_by_category')||'{}').naeringsliv?.points||0)),8);
    assert.deepEqual(errors,[]);
    await minDag();await page.screenshot({path:join(output,'renholder-employed-paid-reloaded.png'),fullPage:true});
    console.log('PASS: 8 actual quiz sets, earned Renholder accepted, 7 employed days, resolved role mail, exact once-only payroll and reload');
    return {passed:true,quizSets:8,earnedMerits:8,employedDays:7,calendarDay:8,roleMailProof,days,payout,trace};
  }catch(error){
    await page.screenshot({path:join(output,'renholder-employed-failure.png'),fullPage:true}).catch(()=>{});
    const diagnostic=await page.evaluate(async()=>{const app=globalThis as any;return {quizSummary:await Promise.race([app.QuizEngine?.getTargetSummary?.('grand_hotel'),new Promise(r=>setTimeout(()=>r('summary-timeout'),3000))]),placeCount:app.PLACES?.length,place:app.PLACES?.find((p:any)=>p.id==='grand_hotel'),url:app.location.href,bodyClass:app.document.body.className,question:app.document.querySelector('#quizQuestion')?.textContent,footerBound:app.__HG_FOOTER_ACTIONS_BOUND__,quizApiBound:app.__HG_QUIZ_ENGINE_APP_API_BOUND__,digitalAccess:app.QuizEngine?.__HG_DIGITAL_QUIZ_ACCESS_PATCHED__,openMode:app.OPEN_MODE,visibleText:app.document.body.innerText.slice(-12000),resources:app.performance.getEntriesByType('resource').filter((r:any)=>/quiz|manifest/.test(r.name)).map((r:any)=>({url:r.name,duration:r.duration})),clock:app.CivicationCalendar?.getClock?.(),active:app.CivicationState?.getActivePosition?.(),offer:app.CivicationJobs?.getLatestPendingOffer?.(),story:app.CivicationLifestoryState?.load?.(),next:app.CivicationNextActionSelector?.getCurrent?.(),inspection:app.CivicationDayProgression?.inspect?.(),audit:app.__renholderAudit};}).catch(()=>null);
    writeFileSync(join(output,'renholder-employed-diagnostic.json'),JSON.stringify({earned,trace,errors,browserLog,diagnostic},null,2));throw error;
  }finally{await context.close();}
}
