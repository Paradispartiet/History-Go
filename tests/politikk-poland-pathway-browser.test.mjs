import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

// Exercise the REAL Fagverk UI and the actual canonical five-question package.
const root = process.cwd();
const packageData = JSON.parse(fs.readFileSync(path.join(root, 'data/quiz/politikk/politikk_subject_pathways_v1.json'), 'utf8'));
const questions = packageData.sets[0].questions;
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
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto(base + '/fagverk.html?subject=politikk', { waitUntil: 'domcontentloaded' });
    await page.locator('#politikkPolandPathwayStart').waitFor({ state: 'visible', timeout: 60000 });
    await page.locator('#politikkPolandPathwayStart').click();
    await page.locator('#quizModal').waitFor({ state: 'visible', timeout: 20000 });
    for (const [index, question] of questions.entries()) {
      await page.waitForFunction((text) =>
        document.querySelector('#quizQuestion')?.textContent?.trim() === text, question.question, { timeout: 16000 });
      await page.getByRole('button', { name: question.answer, exact: true }).click();
      if (index === questions.length - 1) {
        await page.locator('#quizSummaryModal').waitFor({ state: 'visible', timeout: 12000 });
      }
    }
    assert.match(await page.locator('#quizSummaryLead').textContent(), /5 av 5 riktige/);
    assert.equal(await page.locator('#politikkPolandPathwayReview article').count(), 5);
    const links = page.locator('#politikkPolandPathwayReview article a');
    assert.ok(await links.count() >= 5);
    for (const question of questions) {
      const present = await page.evaluate((id) => {
        const entries = JSON.parse(localStorage.getItem('hg_knowledge_entries_v2') || '[]');
        return entries.some((item) => item.knowledge_unit_id === id && item.subject_id === 'politikk');
      }, question.primary_knowledge_unit_id);
      assert.ok(present, `${viewport.width}: canonical Knowledge unit missing ${question.primary_knowledge_unit_id}`);
    }
    const storedPoliticalUnits = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('hg_knowledge_entries_v2') || '[]').filter((item) => item.subject_id === 'politikk'));
    assert.equal(storedPoliticalUnits.length, 5, 'one canonical Knowledge entry per source-bound question, no duplicate captures');
    const quizProgress = await page.evaluate(() => JSON.parse(localStorage.getItem('quiz_progress') || '{}'));
    assert.ok(!quizProgress.politikk?.completed?.length, 'subject practice must not award geographic quiz mastery');
    const reviewText = await page.locator('#politikkPolandPathwayReview').textContent();
    assert.match(reviewText, /full mestring|Faglig mestring/i);
    assert.deepEqual(pageErrors, [], `${viewport.width}: uncaught browser errors`);
    console.log(`Poland subject pathway: ${viewport.width}x${viewport.height}, 5/5 questions, Knowledge IDs, source links – PASS`);
    await context.close();
  }
} finally {
  if (browser) await browser.close();
  server.close();
}
