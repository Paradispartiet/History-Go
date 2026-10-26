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

    // Wave 11: explicit self-review is not an automated judgment of the written response.
    const rubric = host.locator('#politikkEvidenceRubric');
    await rubric.waitFor({ state: 'visible' });
    assert.equal(await rubric.locator('.politikk-evidence-rubric-item').count(), 4);
    assert.equal(await rubric.locator('select').count(), 4);
    assert.match(await rubric.textContent(), /egenvurdering, ikke automatisk/i);
    await rubric.getByRole('button', { name: 'Lag min forbedringsplan' }).click();
    assert.match(await rubric.locator('[role="status"]').textContent(), /alle fire kriterier/);
    assert.equal(await rubric.locator('#politikkEvidenceImprovementPlan').isVisible(), false);

    await rubric.locator('#politikkEvidenceRating-belegg').selectOption('improve');
    await rubric.locator('#politikkEvidenceRating-sammenligning').selectOption('uncertain');
    await rubric.locator('#politikkEvidenceRating-mekanisme').selectOption('clear');
    await rubric.locator('#politikkEvidenceRating-forbehold').selectOption('improve');
    await rubric.getByRole('button', { name: 'Lag min forbedringsplan' }).click();
    assert.equal(await rubric.locator('#politikkEvidenceImprovementPlan').isVisible(), true);
    assert.equal(await rubric.locator('#politikkEvidenceImprovementPlan [data-criterion]').count(), 4);
    const suggestions = await rubric.locator('#politikkEvidenceImprovementPlan').textContent();
    assert.match(suggestions, /Finn én etterprøvbar observasjon i hver rapport/);
    assert.match(suggestions, /liknende observasjoner/);
    assert.match(suggestions, /plausibel mekanisme/);
    assert.match(suggestions, /reformanbefalinger ikke beviser/);
    assert.match(suggestions, /dine egne avkrysninger/);
    assert.match(await rubric.locator('.politikk-evidence-first-step').textContent(), /Start her – Kildebelegg/, 'first revision priority');
    assert.match(suggestions, /ODIHR observerte/, 'comparison writing scaffold is available');

    await rubric.locator('#politikkEvidenceRating-belegg').selectOption('clear');
    assert.equal(await rubric.locator('#politikkEvidenceImprovementPlan').isVisible(), false, 'changing the self-review invalidates old advice');
    await rubric.getByRole('button', { name: 'Lag min forbedringsplan' }).click();
    assert.match(await rubric.locator('#politikkEvidenceImprovementPlan').textContent(), /Kontroller at alle sentrale påstander/);

    await host.locator('#politikkEvidenceOwnReasoning').fill('Jeg reviderer vurderingen: kildene viser likheter, men ikke identiske årsaker eller dokumentert reformvirkning.');
    assert.equal(await rubric.isVisible(), false, 'changing the draft invalidates old self-ratings');
    assert.equal(await host.locator('#politikkEvidenceReport').isVisible(), false);
    await host.getByRole('button', { name: 'Vis min argumentrekke' }).click();
    assert.equal(await rubric.isVisible(), true);
    assert.equal(await rubric.locator('#politikkEvidenceRating-belegg').inputValue(), '', 'new draft requires renewed self-review');
    assert.equal(await rubric.locator('#politikkEvidenceImprovementPlan').isVisible(), false);
    assert.ok(await rubric.locator('.politikk-evidence-rubric-example a').count() >= 4, 'rubric examples remain linked to checked primary sources');

    // Wave 12: a single rubric adapts to both additional source-bound writing tasks.
    const taskSelect = host.locator('#politikkEvidenceCaseTask');
    assert.equal(await taskSelect.locator('option').count(), 3, 'comparison plus two single-country writing tasks');
    await taskSelect.selectOption('poland');
    assert.equal(await rubric.isVisible(), false, 'changing case invalidates prior review');
    assert.equal(await host.locator('#politikkEvidenceOwnReasoning').inputValue(), '', 'no prior text is reused');
    assert.match(await host.locator('.politikk-evidence-assignment').textContent(), /konkurransepreget og effektivt administrert valg/);
    assert.match(await host.locator('.politikk-evidence-instructions').textContent(), /valgadministrasjon og én om konkurransevilkår/, 'country-specific instructions for Poland');
    assert.match(await host.locator('.politikk-evidence-task-sources').textContent(), /nasjonale valgkommisjonen/);
    assert.equal(await host.locator('.politikk-evidence-task-source').count(), 4);
    assert.ok((await host.locator('.politikk-evidence-task-sources a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))))
      .every(url => url.includes('/poland/')), 'Poland task uses only Polish source references');

    await host.locator('#politikkEvidenceOwnReasoning').fill('Polens valg var konkurransepreget, men kildene peker også på skjeve konkurransevilkår; det beviser ikke manipulert opptelling.');
    await host.getByRole('button', { name: 'Vis min argumentrekke' }).click();
    assert.equal(await rubric.isVisible(), true);
    assert.match(await rubric.textContent(), /Analytisk sammenlignbarhet/);
    assert.match(await host.locator('#politikkEvidenceReport').textContent(), /manipulert opptelling i hele landet/);
    for (const id of ['belegg', 'sammenligning', 'mekanisme', 'forbehold']) {
      await rubric.locator('#politikkEvidenceRating-' + id).selectOption('improve');
    }
    await rubric.getByRole('button', { name: 'Lag min forbedringsplan' }).click();
    assert.match(await rubric.locator('#politikkEvidenceImprovementPlan').textContent(), /valgadministrasjon/);
    assert.match(await rubric.locator('#politikkEvidenceImprovementPlan').textContent(), /I Polen beskrev ODIHR/, 'Poland revision scaffold');
    assert.equal(await rubric.locator('#politikkEvidenceImprovementPlan [data-criterion]').count(), 4, 'all four criteria retain identities');

    await taskSelect.selectOption('hungary');
    assert.equal(await rubric.isVisible(), false, 'new case clears prior self-review');
    assert.equal(await host.locator('#politikkEvidenceImprovementPlan').isVisible(), false);
    assert.equal(await host.locator('#politikkEvidenceOwnReasoning').inputValue(), '');
    assert.equal(await host.locator('.politikk-evidence-task-source').count(), 3);
    assert.match(await host.locator('.politikk-evidence-instructions').textContent(), /observert skjevhet i Ungarns valgkamp/, 'country-specific instructions for Hungary');
    assert.ok((await host.locator('.politikk-evidence-task-sources a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))))
      .every(url => url.includes('/hungary/') || url.endsWith('/523565')), 'Hungary task links to Hungarian reports');
    await host.locator('#politikkEvidenceOwnReasoning').fill('Ungarn hadde reelle valgalternativer, men sammenblanding av stat og parti kan gi fordel uten at mandatvirkning er målt.');
    await host.getByRole('button', { name: 'Vis min argumentrekke' }).click();
    assert.match(await rubric.textContent(), /valgavvikling, valgkamp og velgeratferd/);
    assert.match(await host.locator('#politikkEvidenceReport').textContent(), /nøyaktig stemme-\/mandateffekt/);
    assert.equal(await rubric.locator('#politikkEvidenceRating-belegg').inputValue(), '');
    for (const id of ['belegg', 'sammenligning', 'forbehold']) {
      await rubric.locator('#politikkEvidenceRating-' + id).selectOption('clear');
    }
    await rubric.locator('#politikkEvidenceRating-mekanisme').selectOption('improve');
    await rubric.getByRole('button', { name: 'Lag min forbedringsplan' }).click();
    assert.match(await rubric.locator('.politikk-evidence-first-step').textContent(), /Start her – Mekanisme og årsak/, 'Hungary mechanism gets priority');
    assert.match(await rubric.locator('#politikkEvidenceImprovementPlan').textContent(), /I Ungarn observerte ODIHR/, 'Hungary revision scaffold');
    assert.equal(await rubric.locator('#politikkEvidenceImprovementPlan [data-criterion]').count(), 4);

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
