#!/usr/bin/env node
import { spawn } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

let playwright: any;
try { playwright = require('playwright'); } catch { console.error('Playwright not installed'); process.exit(2); }

(async () => {
  const origin = 'http://127.0.0.1:4173';
  const outputDir = join(process.cwd(), 'reports/civication-browser');
  mkdirSync(outputDir, { recursive: true });
  const server = spawn('python3', ['-m', 'http.server', '4173', '--bind', '127.0.0.1'], { stdio: 'ignore' });
  let serverError: Error | null = null;
  server.on('error', error => { serverError = error; });
  let browser: any;
  const report: any = { pageErrors: [], failedRequests: [], httpErrors: [], people: null };
  let phase = 'boot';
  try {
    const deadline = Date.now() + 15000;
    while (true) {
      if (serverError) throw serverError;
      if (server.exitCode !== null) throw new Error(`HTTP server exited: ${server.exitCode}`);
      try { if ((await fetch(`${origin}/Civication.html`)).ok) break; } catch {}
      if (Date.now() >= deadline) throw new Error('HTTP server did not become ready');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('pageerror', (error: Error) => report.pageErrors.push({ phase, message: error.message }));
    page.on('requestfailed', (request: any) => report.failedRequests.push({
      phase, url: request.url(), method: request.method(), resourceType: request.resourceType(),
      error: request.failure()?.errorText || 'unknown'
    }));
    page.on('response', (response: any) => {
      if (response.status() >= 400) report.httpErrors.push({ phase, url: response.url(), status: response.status() });
    });
    await page.goto(`${origin}/Civication.html`, { waitUntil: 'load' });
    // Preserve the old observation window so its request count can be diagnosed.
    await page.waitForTimeout(2500);
    report.failedRequestsAt2500ms = report.failedRequests.length;
    await page.waitForFunction(() => {
      const app = globalThis as any;
      return !!app.HG_CiviEngine
        && typeof app.CivicationRoleModelRuntime?.decorateMail === 'function'
        && typeof app.CivicationSceneCatalog?.getRoleMails === 'function'
        && typeof app.CivicationCalendar?.setPhase === 'function'
        && typeof app.CivicationSocialPlaceResolver?.loadPlaces === 'function';
    });
    report.sourceLoading = await page.evaluate(async () => {
      const app = globalThis as any;
      let timer: any;
      try {
        const places: any = await Promise.race([
          app.CivicationSocialPlaceResolver.loadPlaces(),
          new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Source place loading timed out')), 90000); })
        ]);
        return { placeCount: places.length,
          socialPlaceCount: app.CivicationSocialPlaceResolver.resolveAllCivicationSocialPlaces().length };
      } finally { clearTimeout(timer); }
    });
    report.boot = await page.evaluate(() => {
      const doc = (globalThis as any).document;
      return { hasDash: !!doc.querySelector('#civiDashboardSection'),
        hasCivicationText: doc.body.textContent?.includes('Civication'), readyState: doc.readyState };
    });
    report.failedRequestsBeforeClose = report.failedRequests.length;
    phase = 'shutdown';
    await context.close();
    report.failedRequestsDuringClose = report.failedRequests.length - report.failedRequestsBeforeClose;
    console.log('Civication boot request diagnostics', JSON.stringify(report));
    if (!report.boot.hasDash || !report.boot.hasCivicationText || report.pageErrors.length
      || report.failedRequestsBeforeClose || !report.sourceLoading.placeCount || !report.sourceLoading.socialPlaceCount) {
      throw new Error('Civication boot smoke failed; see request diagnostics');
    }
    const verifyPeople = require(join(process.cwd(), 'scripts/verify-civication-people-browser.cjs'));
    report.people = await verifyPeople(browser, origin, outputDir);
    console.log('Civication People browser ok', JSON.stringify(report.people));
  } finally {
    try { if (browser) await browser.close(); }
    finally {
      server.kill('SIGTERM');
      writeFileSync(join(outputDir, 'diagnostics.json'), JSON.stringify(report, null, 2) + '\n');
    }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
