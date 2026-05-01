#!/usr/bin/env node
const {spawn} = require('child_process');
let playwright;
try { playwright = require('playwright'); } catch { console.error('Playwright not installed'); process.exit(2); }
(async()=>{
 const server=spawn('python3',['-m','http.server','4173'],{stdio:'ignore'});
 await new Promise(r=>setTimeout(r,800));
 const browser=await playwright.webkit.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors=[]; const reqFails=[];
 page.on('pageerror',e=>pageErrors.push(String(e)));
 page.on('requestfailed',r=>reqFails.push(r.url()));
 await page.goto('http://127.0.0.1:4173/Civication.html',{waitUntil:'load'});
 await page.waitForTimeout(2500);
 const data=await page.evaluate(()=>({
  hasDash: !!document.querySelector('#civiDashboardSection'),
  hasCivicationText: document.body.textContent.includes('Civication'),
  readyState: document.readyState
 }));
 await browser.close(); server.kill('SIGTERM');
 if(!data.hasDash||!data.hasCivicationText||pageErrors.length){
   console.error('Boot smoke failed', {data,pageErrors:reqFails}); process.exit(1);
 }
 console.log('Boot smoke ok', data, {failedRequests:reqFails.length});
})();
