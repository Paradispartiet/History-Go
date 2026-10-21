import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = http.createServer((request, response) => {
  const requested = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + requested);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    response.writeHead(404); response.end('not found'); return;
  }
  response.setHeader('content-type', mime[path.extname(file)] || 'application/octet-stream');
  response.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/fagverk.html?subject=politikk', { waitUntil: 'domcontentloaded' });
    const start = page.locator('#politikkEvidenceWorkshopStart');
    await start.waitFor({ state: 'visible', timeout: 60000 });
    await start.click();

    const host = page.locator('#politikkEvidenceWorkshop');
    await host.locator('.politikk-evidence-step').first().waitFor({ state: 'visible', timeout: 20000 });
    assert.equal(await host.locator('.politikk-evidence-case').count(), 2, 'both case observations displayed');
    assert.equal(await host.locator('.politikk-evidence-step').count(), 3);
    assert.ok(await host.locator('.politikk-evidence-sources a').count() >= 5, 'primary source links from both countries');
    assert.match(await host.textContent(), /ODIHR/);
    assert.match(await host.locator('.politikk-evidence-progress').textContent(), /0 av 3/);

    const evidence = host.locator('[data-step="belegg"]');
    await evidence.getByRole('button', { name: 'Begge valg hadde nøyaktig samme årsaker og institusjonelle problemer.' }).click();
    assert.match(await evidence.locator('[role="status"]').textContent(), /Ikke tilstrekkelig belagt/);
    assert.match(await host.locator('.politikk-evidence-progress').textContent(), /0 av 3/);
    await evidence.getByRole('button', { name: 'Begge valg hadde politisk konkurranse samtidig som konkurransevilkårene var skjeve.' }).click();
    assert.match(await evidence.locator('[role="status"]').textContent(), /Støttet av kildene/);

    const mechanism = host.locator('[data-step="mekanisme"]');
    await mechanism.getByRole('button', { name: 'Hvordan sammenblanding av stat og parti kan gi konkurransefordeler.' }).click();
    const limits = host.locator('[data-step="avgrensning"]');
    await limits.getByRole('button', { name: 'Rapportene peker på tiltak som kan undersøkes videre mot de observerte problemene.' }).click();
    assert.match(await host.locator('.politikk-evidence-progress').textContent(), /3 av 3/);
    assert.equal(await host.locator('.politikk-evidence-assembly').isVisible(), true);

    await host.getByRole('button', { name: 'Vis min argumentrekke' }).click();
    assert.match(await host.locator('.politikk-evidence-compose-status').textContent(), /Skriv en kort/);
    await host.locator('#politikkEvidenceOwnReasoning').fill('Rapportene viser likheter i konkurransevilkårene, men vi kan ikke tallfeste årsak eller virkning.');
    await host.getByRole('button', { name: 'Vis min argumentrekke' }).click();
    assert.equal(await host.locator('#politikkEvidenceReport').isVisible(), true);
    assert.match(await host.locator('#politikkEvidenceReport').textContent(), /Din begrunnelse/);
    assert.match(await host.locator('#politikkEvidenceReport').textContent(), /nøyaktig stemmeeffekt/);

    const stored = await page.evaluate(() => ({
      knowledge: JSON.parse(localStorage.getItem('hg_knowledge_entries_v2') || '[]'),
      progress: JSON.parse(localStorage.getItem('quiz_progress') || '{}')
    }));
    assert.equal(stored.knowledge.length, 0, 'workshop must not award automatic Knowledge');
    assert.ok(!stored.progress.politikk?.completed?.length, 'no geographic quiz mastery');
    assert.deepEqual(errors, [], 'no uncaught browser errors');
    console.log('Politikk wave10 evidence workshop: ' + viewport.width + 'x' + viewport.height + ' – PASS');
    await context.close();
  }
} finally {
  if (browser) await browser.close();
  server.close();
}
