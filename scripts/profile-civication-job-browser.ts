// Diagnostic only: observe the unchanged organic player journey until five
// genuine job answers have completed. This is not 21-day acceptance.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Browser, type ConsoleMessage, type Page } from 'playwright';
import verifyOrganicPlayer from './verify-civication-organic-player-browser.js';

type Mark = { name: string; startTime: number | null };
type Answer = { debug: Record<string, unknown>; marks: Mark[]; elapsedMs: number | null };
const output = join(process.cwd(), 'reports/civication-profile');
mkdirSync(output, { recursive: true });
const report: { diagnosticOnly: true; completed: boolean; answers: Answer[]; snapshot?: unknown; error?: string } = {
  diagnosticOnly: true, completed: false, answers: []
};
const save = () => writeFileSync(join(output, 'profile.json'), JSON.stringify(report, null, 2) + '\n');
const server = spawn('python3', ['-m', 'http.server', '4175', '--bind', '127.0.0.1'], { stdio: 'ignore' });
let browser: Browser | undefined;
let page: Page | undefined;
let stopped = false;
let queue = Promise.resolve();
let latestDebug: Record<string, unknown> = {};
let serverError: Error | undefined;
server.on('error', error => { serverError = error; });
async function observe(message: ConsoleMessage) {
  const text = message.text();
  if (!text.startsWith('[CivicationNextActionUI] answer ')) return;
  const value: unknown = await message.args()[1]?.jsonValue();
  if (text.startsWith('[CivicationNextActionUI] answer complete')) {
    if (value && typeof value === 'object' && !Array.isArray(value)) latestDebug = value as Record<string, unknown>;
    return;
  }
  if (!text.startsWith('[CivicationNextActionUI] answer perf') || !Array.isArray(value)) return;
  if (!/^(publikum_formidling_|kunst_)/.test(String(latestDebug.mailId || ''))
      || !['day_phase', 'inbox'].includes(String(latestDebug.actionSource))) return;
  const marks = value.filter((row): row is Mark => !!row && typeof row.name === 'string'
    && (row.startTime === null || typeof row.startTime === 'number'));
  const click = marks.find(row => row.name === 'civi-answer-click')?.startTime;
  const valid = marks.filter(row => row.startTime !== null && typeof click === 'number' && row.startTime >= click);
  const end = valid.find(row => row.name === 'civi-answer-after-render')?.startTime;
  const answer = { debug: latestDebug, marks: valid, elapsedMs: typeof end === 'number' && typeof click === 'number' ? end - click : null };
  report.answers.push(answer);
  console.log('MEASURED_JOB_ANSWER', JSON.stringify(answer));
  save();
  if (report.answers.length < 5 || !page || stopped) return;
  report.snapshot = await page.evaluate(() => {
    const app = globalThis as any;
    return { clock: app.CivicationCalendar?.getClock?.(), activePosition: app.CivicationState?.getActivePosition?.(),
      story: app.CivicationLifestoryState?.load?.(), resources: app.performance.getEntriesByType('resource').slice(-100)
        .map((r: any) => ({ name: r.name, duration: r.duration, startTime: r.startTime })) };
  });
  await page.screenshot({ path: join(output, 'job-profile.png'), fullPage: true, timeout: 10000 });
  report.completed = true;
  save();
  stopped = true;
  await page.close();
}
const timer = setTimeout(() => {
  report.error = '15-minute diagnostic deadline; partial observations preserved';
  save();
  void browser?.close();
}, 15 * 60 * 1000);
(async () => {
  try {
    const deadline = Date.now() + 15000;
    while (true) {
      if (serverError) throw serverError;
      if (server.exitCode !== null) throw new Error(`HTTP server exited: ${server.exitCode}`);
      try { if ((await fetch('http://127.0.0.1:4175/Civication.html')).ok) break; } catch {}
      if (Date.now() > deadline) throw new Error('Diagnostic HTTP server did not start');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    browser = await chromium.launch({ headless: true });
    const actualBrowser = browser;
    const observedBrowser = {
      async newContext(options: Parameters<Browser['newContext']>[0]) {
        const context = await actualBrowser.newContext(options);
        await context.addInitScript(() => { (globalThis as any).DEBUG = true; });
        context.on('page', observed => {
          page = observed;
          observed.on('console', message => {
            queue = queue.then(() => observe(message)).catch(error => {
              report.error = String(error); save(); void actualBrowser.close();
            });
          });
        });
        return context;
      }
    };
    try {
      await verifyOrganicPlayer(observedBrowser, 'http://127.0.0.1:4175');
    } catch (error) {
      if (!stopped) throw error;
    }
    await queue;
    if (!report.completed || report.error) throw new Error(report.error || 'Expected five genuine job answer measurements');
    console.log('Diagnostic captured five job answers; full 21-day acceptance was deliberately not run.');
  } catch (error) {
    report.error = String(error); save(); console.error(error); process.exitCode = 1;
  } finally {
    clearTimeout(timer); save(); await browser?.close(); server.kill('SIGTERM');
  }
})();
