#!/usr/bin/env node
// Isolated, bounded screenshot QA for «Min dag» + the rich map. This process
// runs after the functional Civication browser acceptance, so a stalled WebGL
// capture cannot prevent the 21-day life-story scenario from running.
import { spawn } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import verifyVisualQa from './verify-civication-visual-qa-browser.js';
import verifyWebkitMobile from './verify-civication-webkit-mobile.js';

const playwright = require('playwright');
const origin = 'http://127.0.0.1:4174';
const outputDir = join(process.cwd(), 'reports/civication-browser');
mkdirSync(outputDir, { recursive: true });

(async () => {
  const server = spawn('python3', ['-m', 'http.server', '4174', '--bind', '127.0.0.1'], { stdio: 'ignore' });
  let serverError: Error | null = null;
  server.on('error', e => { serverError = e; });
  let browser: any = null;
  const report: any = { startedAt: new Date().toISOString(), status: 'started' };
  try {
    const deadline = Date.now() + 15000;
    while (true) {
      if (serverError) throw serverError;
      if (server.exitCode !== null) throw new Error('Visual QA server exited: ' + server.exitCode);
      try { if ((await fetch(origin + '/Civication.html')).ok) break; } catch {}
      if (Date.now() >= deadline) throw new Error('Visual QA server did not become ready');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    browser = await playwright.chromium.launch({ headless: true });
    report.views = await verifyVisualQa(browser, origin, outputDir);
    console.log('Civication Chromium visual QA:', JSON.stringify(report.views));
    await browser.close();
    browser = null;

    // WebKit has a different layout/focus engine. Validate Min dag and mobile
    // map independently; this does not certify Safari on a physical iPhone.
    browser = await playwright.webkit.launch({ headless: true });
    report.webkit = await verifyWebkitMobile(browser, origin, outputDir);
    console.log('Civication WebKit mobile QA:', JSON.stringify(report.webkit));
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed';
    report.error = String((error as Error)?.stack || error);
    throw error;
  } finally {
    report.finishedAt = new Date().toISOString();
    writeFileSync(join(outputDir, 'visual-qa-diagnostics.json'), JSON.stringify(report, null, 2) + '\n');
    try { if (browser) await browser.close(); }
    finally { server.kill('SIGTERM'); }
  }
})().catch(error => {
  console.error('Civication visual QA failed:', error);
  process.exitCode = 1;
});
