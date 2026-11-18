'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
(async () => {
 const dom = new JSDOM('<div id="civiEconomyPanel"></div><div id="civiLifestoryPanel"></div>', {url:'https://example.test',runScripts:'outside-only'});
 await new Promise(r=>setTimeout(r,0));
 const w=dom.window;
 for (const p of ['core/civicationState.js','core/civicationCalendar.js','civicationCommercial.js','ui/CivicationEconomyUI.js']) w.eval(fs.readFileSync('js/Civication/'+p,'utf8'));
 const config=require('../data/Civication/economy/nok-budget-prototype-2026.json');
 w.CivicationState.updateWallet({balance:200,nok_v1:{active:true,version:1,config,invoices:[
 {id:'due',status:'pending',dueDateISO:'2026-01-01'},
 {id:'future',status:'pending',dueDateISO:'2026-01-02'},
 {id:'paid',status:'paid',dueDateISO:'2026-01-01'}]}});
 assert.equal(w.HG_CiviShop.saveNokMealWeek('2026-01-01',[{date:'2026-01-01',slot:'breakfast',mealId:'oats-with-milk'},{date:'2026-01-02',slot:'lunch',mealId:'oats-with-milk'}]).ok,true);
 const snapshot=JSON.stringify(w.CivicationState.getWallet());
 const view=w.CivicationEconomyUI.dailyOverview();
 assert.equal(view.dueCount,1);assert.equal(view.mealsToday,1);assert.equal(view.shoppingCostCents,5030);
 w.CivicationEconomyUI.render();
 assert.ok(w.document.querySelector('[data-nok-daily-overview]').textContent.includes('50,30'));
 const summary = w.document.getElementById('civiNokDailyLifeOverview');
 assert.ok(summary); assert.equal(summary.nextElementSibling.id,'civiLifestoryPanel');
 summary.open=true;
 w.document.getElementById('civiLifestoryPanel').innerHTML='<p>Neste scene</p>';
 w.CivicationEconomyUI.render();
 assert.equal(w.document.querySelectorAll('#civiNokDailyLifeOverview').length,1);
 assert.equal(w.document.getElementById('civiNokDailyLifeOverview').open,true);
 assert.equal(w.document.getElementById('civiLifestoryPanel').textContent,'Neste scene');
 assert.equal(JSON.stringify(w.CivicationState.getWallet()),snapshot);
 w.CivicationCalendar.setClock({dayIndex:2});
 assert.equal(w.CivicationEconomyUI.dailyOverview().dueCount,2);
 assert.equal(w.CivicationEconomyUI.dailyOverview().mealsToday,1);
 assert.equal(JSON.stringify(w.CivicationState.getWallet()),snapshot);
 await new Promise(r=>setTimeout(r,0));dom.window.close();
 console.log('PASS: daily due invoices, dated pending meals, shared package cost and read-only rendering across game days');
})().catch(e=>{console.error(e);process.exitCode=1;});
