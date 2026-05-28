#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const templatePath = path.join(__dirname, 'quiz_card_template.html');
const cssPath = path.join(__dirname, 'quiz_card.css');
const overridesPath = path.join(__dirname, 'top10_overrides.json');
const htmlOutputDir = path.join(__dirname, 'output');
const pngOutputDir = path.join(repoRoot, 'bilder/kort/quiz/top10');
const WIDTH = 1600;
const HEIGHT = 1000;
const LETTERS = ['A', 'B', 'C'];
const GOOD_TYPES = new Set(['fact', 'story', 'curiosity', 'observation', 'comparison']);
const GOOD_LAYERS = new Set(['intro_story', 'history_place']);
const GENERIC_STARTS = [
  'hva slags sted',
  'hva sier dette',
  'hva er mest presist',
];
const FACT_MARKERS = [
  /\b\d{3,4}\b/u,
  /kirke|bygning|gate|torg|stasjon|basar|brann|jernbane|trikk|industri|handel|arkitektur|material|tegl|trehus|fasade|spor|person|kong|menighet|byvekst|funksjon|hendelse|innviet|anlagt|oppstod|revet|bygget|flyttet|åpnet|tomt|bro|bru|marked|bibliotek/i,
];
const RIBBONS = {
  'by:jernbanetorget': 'BY / KNUTEPUNKT',
  'by:kampen_kirke': 'BY / KIRKE & NABOLAG',
  'by:grunerlokka_helgesens_tm': 'BY / INDUSTRI & BYLIV',
  'by:grunerlokka': 'BY / INDUSTRI & BYLIV',
  'by:gronland_basarene': 'BY / HANDEL & HISTORIE',
  'by:bogstadveien': 'BY / HANDEL',
  'by:damstredet_telthusbakken': 'BY / TREHUSMILJØ',
  'by:barcode': 'BY / ARKITEKTUR',
  'by:bjorvika': 'BY / FJORDBY',
  'by:deichman_bjorvika': 'BY / BIBLIOTEK & ARKITEKTUR',
};

function parseArgs(argv) {
  const args = { category: 'by' };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) args[key] = true;
    else { args[key] = next; i += 1; }
  }
  if (!args.place) throw new Error('Mangler --place <placeId>. Eksempel: --place kampen_kirke --category by');
  return args;
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.:;!?])/g, '$1')
    .trim();
}

function escapeHtml(value) {
  return normalizeText(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function titleFromPlace(placeId) {
  return placeId.replaceAll('_', ' ').replace(/\b\p{L}/gu, (m) => m.toLocaleUpperCase('nb-NO'));
}

function hashString(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function rand() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(items, seedText) {
  const arr = [...items];
  const rand = mulberry32(hashString(seedText));
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function flattenQuestions(quizData) {
  return (quizData.sets ?? []).flatMap((set) => (set.questions ?? []).map((q) => ({ ...q, set_id: set.set_id })));
}

function hasSource(q) {
  return Array.isArray(q.source) ? q.source.length > 0 : Boolean(normalizeText(q.source));
}

function isGenericStart(question) {
  const lower = normalizeText(question).toLocaleLowerCase('nb-NO');
  return GENERIC_STARTS.some((prefix) => lower.startsWith(prefix));
}

function hasConcreteFactMarker(q) {
  const haystack = [q.question, q.answer, q.knowledge, q.topic, ...(q.tags ?? []), ...(q.core_concepts ?? [])].join(' ');
  return FACT_MARKERS.some((pattern) => pattern.test(haystack));
}

function scoreQuestion(q) {
  const reasons = [];
  let score = 0;
  if (q.question_scope === 'place') { score += 4; reasons.push('question_scope=place'); }
  if (GOOD_TYPES.has(q.question_type)) { score += 3; reasons.push(`question_type=${q.question_type}`); }
  if (hasSource(q)) { score += 3; reasons.push('source finnes'); }
  if (GOOD_LAYERS.has(q.question_layer)) { score += 3; reasons.push(`question_layer=${q.question_layer}`); }
  if (hasConcreteFactMarker(q)) { score += 2; reasons.push('konkret stedlig/historisk markør'); }
  if (isGenericStart(q.question) && !hasConcreteFactMarker(q)) { score -= 5; reasons.push('nedprioritert generisk formulering'); }
  if (String(q.emne_id ?? '').includes('teori') && !hasConcreteFactMarker(q)) { score -= 4; reasons.push('nedprioritert teori-emne'); }
  if (!Array.isArray(q.options) || q.options.length !== 3) { score -= 20; reasons.push('må ha nøyaktig tre alternativer'); }
  if (!q.options?.includes(q.answer) && Number.isInteger(q.answerIndex)) q.answer = q.options[q.answerIndex];
  if (!q.answer || !q.options?.includes(q.answer)) { score -= 20; reasons.push('mangler entydig fasit'); }
  return { q, score, reasons };
}

function selectQuestions(allQuestions, overrideIds) {
  if (overrideIds?.length) {
    const byId = new Map(allQuestions.map((q) => [q.id, q]));
    const missing = overrideIds.filter((id) => !byId.has(id));
    if (missing.length) throw new Error(`Override viser til ukjente questionIds: ${missing.join(', ')}`);
    if (overrideIds.length !== 10) throw new Error(`Override må inneholde nøyaktig 10 questionIds, fant ${overrideIds.length}.`);
    return overrideIds.map((id) => byId.get(id));
  }
  const scored = allQuestions.map(scoreQuestion).sort((a, b) => b.score - a.score || String(a.q.id).localeCompare(String(b.q.id)));
  const safe = scored.filter((item) => item.score >= 15);
  if (safe.length < 10) {
    const selected = safe.map((item) => `- ${item.q.id}: ${item.reasons.join('; ')}`).join('\n') || '- Ingen';
    const near = scored.slice(0, 15).map((item) => `- ${item.q.id} (score ${item.score}): ${item.reasons.join('; ')}`).join('\n');
    throw new Error(`Fant bare ${safe.length} trygge spørsmål, trenger 10.\nValgt som trygge:\n${selected}\n\nNærmeste kandidater:\n${near}`);
  }
  return safe.slice(0, 10).map((item) => item.q);
}

function shuffleQuestionOptions(questions, placeId) {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const rendered = questions.map((q, index) => {
      const answer = q.options.includes(q.answer) ? q.answer : q.options[q.answerIndex];
      const options = seededShuffle(q.options.map(normalizeText), `${placeId}:${q.id}:${attempt}`);
      const answerLetter = LETTERS[options.indexOf(normalizeText(answer))];
      return { ...q, question: normalizeText(q.question), options, answer: normalizeText(answer), answerLetter, number: index + 1 };
    });
    const counts = Object.fromEntries(LETTERS.map((letter) => [letter, rendered.filter((q) => q.answerLetter === letter).length]));
    if (LETTERS.every((letter) => counts[letter] > 0) && LETTERS.every((letter) => counts[letter] <= 5)) {
      return { rendered, counts, attempt };
    }
  }
  throw new Error('Klarte ikke å få naturlig fasitfordeling etter 200 deterministiske shuffle-forsøk.');
}

function questionClass(q) {
  const len = q.question.length + q.options.join(' ').length;
  if (len > 330) return 'compact';
  if (len > 245) return 'normal';
  return 'short';
}

function renderQuestion(q) {
  const options = q.options.map((option, i) => `<li class="option"><span class="option-letter">${LETTERS[i]}</span><span>${escapeHtml(option)}</span></li>`).join('\n');
  return `<article class="question ${questionClass(q)}">
  <div class="q-number">${q.number}</div>
  <p class="q-text">${escapeHtml(q.question)}</p>
  <ol class="options">${options}</ol>
</article>`;
}

async function findQuizFile(manifest, placeId, category) {
  const candidates = (manifest.sets ?? []).filter((entry) => entry.targetId === placeId && (!category || entry.file.includes(`/quiz/${category}/`)));
  if (!candidates.length) throw new Error(`Fant ikke quizfil for place=${placeId}, category=${category} i data/quiz/manifest.json`);
  return candidates[0].file;
}

function inlineCss(html, css) {
  return html.replace('<link rel="stylesheet" href="./quiz_card.css" />', `<style>\n${css}\n</style>`);
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = Array.from({ length: 256 }, (_, n) => {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      return c >>> 0;
    });
  }
  let c = 0xffffffff;
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data = Buffer.alloc(0)) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function writeTextPng(html, outputPath) {
  // Dependency-free PNG fallback: stores all card text in a valid raster image when no browser renderer is installed.
  const w = WIDTH;
  const h = HEIGHT;
  const raw = Buffer.alloc((w * 3 + 1) * h, 0xff);
  for (let y = 0; y < h; y += 1) raw[(w * 3 + 1) * y] = 0;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const text = Buffer.from(`HTML preview contains final layout. Text: ${stripHtml(html).slice(0, 12000)}`, 'utf8');
  const compressed = zlib.deflateSync(raw, { level: 9 });
  return fs.writeFile(outputPath, Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('tEXt', Buffer.concat([Buffer.from('Description\0', 'latin1'), text])),
    pngChunk('IDAT', compressed),
    pngChunk('IEND'),
  ]));
}

async function hasLocalPlaywright() {
  const packagePath = path.join(repoRoot, 'node_modules/playwright/package.json');
  try {
    await fs.access(packagePath);
    return true;
  } catch {
    return false;
  }
}

async function exportPng(htmlPath, html, pngPath) {
  if (await hasLocalPlaywright()) {
    const { chromium } = await import('playwright');
    let browser;
    try {
      browser = await chromium.launch();
      const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
      await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: pngPath, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
      return 'playwright';
    } catch (error) {
      await writeTextPng(html, pngPath);
      return `fallback-png (${error.message})`;
    } finally {
      if (browser) await browser.close();
    }
  }
  await writeTextPng(html, pngPath);
  return 'fallback-png (Playwright ikke installert)';
}

async function main() {
  const args = parseArgs(process.argv);
  const [manifest, overrides, template, css] = await Promise.all([
    fs.readFile(path.join(repoRoot, 'data/quiz/manifest.json'), 'utf8').then(JSON.parse),
    fs.readFile(overridesPath, 'utf8').then(JSON.parse).catch(() => ({})),
    fs.readFile(templatePath, 'utf8'),
    fs.readFile(cssPath, 'utf8'),
  ]);
  const quizFile = await findQuizFile(manifest, args.place, args.category);
  const quizData = JSON.parse(await fs.readFile(path.join(repoRoot, quizFile), 'utf8'));
  const override = overrides[args.place] ?? {};
  const selected = selectQuestions(flattenQuestions(quizData), override.questionIds);
  const { rendered, counts, attempt } = shuffleQuestionOptions(selected, args.place);
  const title = normalizeText(args.title ?? override.title ?? titleFromPlace(args.place)).toLocaleUpperCase('nb-NO');
  const ribbon = normalizeText(args.ribbon ?? override.ribbon ?? RIBBONS[`${args.category}:${args.place}`] ?? 'BY / HISTORIE');
  const answerKey = rendered.map((q) => `${q.number}${q.answerLetter}`).join(' · ');
  let html = template
    .replaceAll('{{TITLE}}', escapeHtml(title))
    .replaceAll('{{RIBBON}}', escapeHtml(ribbon))
    .replace('{{LEFT_QUESTIONS}}', rendered.slice(0, 5).map(renderQuestion).join('\n'))
    .replace('{{RIGHT_QUESTIONS}}', rendered.slice(5).map(renderQuestion).join('\n'))
    .replace('{{ANSWER_KEY}}', escapeHtml(answerKey));
  html = inlineCss(html, css);
  await fs.mkdir(htmlOutputDir, { recursive: true });
  await fs.mkdir(pngOutputDir, { recursive: true });
  const htmlPath = path.join(htmlOutputDir, `${args.place}_top10.html`);
  const pngPath = path.join(pngOutputDir, `${args.place}_top10.png`);
  await fs.writeFile(htmlPath, html, 'utf8');
  const pngMode = await exportPng(htmlPath, html, pngPath);
  console.log(`Quizkort generert for ${args.place}`);
  console.log(`Input: ${quizFile}`);
  console.log(`HTML: ${path.relative(repoRoot, htmlPath)}`);
  console.log(`PNG: ${path.relative(repoRoot, pngPath)} (${pngMode})`);
  console.log(`Fasit: ${answerKey}`);
  console.log(`Fasitfordeling: ${JSON.stringify(counts)} etter shuffle-forsøk ${attempt}`);
}

main().catch((error) => {
  console.error(`FEIL: ${error.message}`);
  process.exit(1);
});
