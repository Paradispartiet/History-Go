#!/usr/bin/env node
import { spawn } from 'child_process';

let playwright: any;
try { playwright = require('playwright'); } catch { console.error('Playwright not installed'); process.exit(2); }
(async()=>{
 const server=spawn('python3',['-m','http.server','4173'],{stdio:'ignore'});
 await new Promise(r=>setTimeout(r,800));
 const browser=await playwright.webkit.launch({headless:true});
 const page=await browser.newPage();
 const pageErrors: string[]=[]; const reqFails: string[]=[];
 page.on('pageerror',(e: unknown)=>pageErrors.push(String(e)));
 page.on('requestfailed',(r: any)=>reqFails.push(r.url()));
 await page.goto('http://127.0.0.1:4173/Civication.html',{waitUntil:'load'});
 await page.waitForTimeout(2500);
 const data=await page.evaluate(()=>{
  const doc = (globalThis as any).document;
  return {
   hasDash: !!doc.querySelector('#civiDashboardSection'),
   hasCivicationText: doc.body.textContent.includes('Civication'),
   readyState: doc.readyState
  };
 });
 await browser.close(); server.kill('SIGTERM');
 if(!data.hasDash||!data.hasCivicationText||pageErrors.length){
   console.error('Boot smoke failed', {data,pageErrors:reqFails}); process.exit(1);
 }
 console.log('Boot smoke ok', data, {failedRequests:reqFails.length});
})();
