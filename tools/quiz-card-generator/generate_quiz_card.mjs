#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const letters = ['A', 'B', 'C'];
const allowedTypes = new Set(['fact', 'story', 'curiosity', 'observation', 'comparison']);
const allowedLayers = new Set(['intro_story', 'history_place']);
const ribbonMap = new Map([
  ['by:jernbanetorget', 'BY / KNUTEPUNKT'],
  ['by:kampen_kirke', 'BY / KIRKE & NABOLAG'],
  ['by:grunerlokka_helgesens_tm', 'BY / INDUSTRI & BYLIV'],
  ['by:grunerlokka', 'BY / INDUSTRI & BYLIV'],
  ['by:gronland_basarene', 'BY / HANDEL & HISTORIE'],
  ['by:bogstadveien', 'BY / HANDEL'],
  ['by:damstredet_telthusbakken', 'BY / TREHUSMILJØ'],
  ['by:barcode', 'BY / ARKITEKTUR'],
  ['by:bjorvika', 'BY / FJORDBY'],
  ['by:deichman_bjorvika', 'BY / BIBLIOTEK & ARKITEKTUR'],
]);

function parseArgs(argv) {
  const args = { category: 'by' };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) throw new Error(`Mangler verdi for --${key}`);
      args[key] = value;
      i += 1;
    }
  }
  if (!args.place) throw new Error('Bruk: node tools/quiz-card-generator/generate_quiz_card.mjs --place <placeId> --category <category>');
  return args;
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(repoRoot, relativePath), 'utf8'));
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/–|—/g, '–')
    .trim();
}

function hasSource(question) {
  if (Array.isArray(question.source)) return question.source.some((entry) => String(entry).trim());
  return Boolean(String(question.source ?? '').trim());
}

function concreteScore(question) {
  const text = `${question.question} ${question.answer} ${question.knowledge ?? ''} ${(question.tags ?? []).join(' ')} ${(question.core_concepts ?? []).join(' ')}`.toLowerCase();
  const concreteWords = [
    'kirke', 'bygg', 'bygning', 'år', '1800', '1900', '1854', '1878', '1882', 'stasjon', 'jernbane',
    'torg', 'gate', 'basar', 'handel', 'industri', 'trehus', 'mur', 'tegl', 'sjøgrunn', 'terreng',
    'person', 'arkitekt', 'hendelse', 'brann', 'spor', 'fasade', 'landemerke', 'byvekst', 'menighet',
    'østban', 'material', 'funksjon', 'plass', 'nabolag', 'historisk'
  ];
  return concreteWords.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);
}

function startsGeneric(question) {
  return /^(hva slags sted|hva sier dette|hva er mest presist|hva viser dette|hva kan dette fortelle)/i.test(question.question.trim());
}

function evaluateQuestion(question, index) {
  const reasons = [];
  let score = 0;
  if (question.question_scope === 'place') { score += 4; reasons.push('place-scope'); }
  if (allowedTypes.has(question.question_type)) { score += 3; reasons.push(`type:${question.question_type}`); }
  if (hasSource(question)) { score += 3; reasons.push('har kilde'); }
  if (allowedLayers.has(question.question_layer)) { score += 3; reasons.push(`layer:${question.question_layer}`); }
  const concrete = concreteScore(question);
  score += Math.min(concrete, 6);
  if (concrete > 0) reasons.push(`konkret stedshistorie:${concrete}`);
  if (startsGeneric(question) && concrete < 2) { score -= 5; reasons.push('nedprioritert: generisk formulering'); }
  if (/teori|metode|begrep|tolkning/i.test(`${question.emne_id ?? ''} ${question.topic ?? ''}`) && concrete < 2) {
    score -= 4;
    reasons.push('nedprioritert: teori/emne uten tydelig stedfaktum');
  }
  return { question, index, score, safe: score >= 16, reasons };
}

function flattenQuestions(quiz) {
  return (quiz.sets ?? []).flatMap((set) => (set.questions ?? []).map((question) => ({ ...question, set_id: set.set_id })));
}

function selectQuestions(questions, overrideIds) {
  if (overrideIds?.length) {
    const byId = new Map(questions.map((q) => [q.id, q]));
    const missing = overrideIds.filter((id) => !byId.has(id));
    if (missing.length) throw new Error(`Override peker på ukjente questionIds: ${missing.join(', ')}`);
    if (overrideIds.length !== 10) throw new Error(`Override må ha akkurat 10 questionIds, fant ${overrideIds.length}.`);
    return overrideIds.map((id) => byId.get(id));
  }
  const evaluated = questions.map(evaluateQuestion).sort((a, b) => b.score - a.score || a.index - b.index);
  const selected = evaluated.filter((entry) => entry.safe).slice(0, 10);
  if (selected.length < 10) {
    const chosen = selected.map((entry) => `- ${entry.question.id}: score ${entry.score} (${entry.reasons.join(', ')})`).join('\n');
    throw new Error(`Fant bare ${selected.length} trygge spørsmål. Valgt så langt:\n${chosen || '(ingen)'}\nMangler ${10 - selected.length} gode place-spørsmål.`);
  }
  return selected.map((entry) => entry.question);
}

function rng(seed) {
  let state = Number(BigInt(`0x${createHash('sha256').update(seed).digest('hex').slice(0, 8)}`));
  return () => {
    state |= 0; state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, seed) {
  const random = rng(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function prepareCardQuestions(placeId, questions) {
  for (let attempt = 0; attempt < 250; attempt += 1) {
    const prepared = questions.map((question, index) => {
      const cleanOptions = question.options.map(normalizeText);
      const answer = normalizeText(question.answer ?? cleanOptions[question.answerIndex]);
      const shuffled = shuffle(cleanOptions, `${placeId}:${question.id}:${attempt}`);
      const correctIndex = shuffled.findIndex((option) => option === answer);
      if (correctIndex === -1) throw new Error(`Finner ikke fasit blant svaralternativene for ${question.id}.`);
      return {
        id: question.id,
        number: index + 1,
        question: normalizeText(question.question),
        options: shuffled,
        correctLetter: letters[correctIndex],
        source: question.source,
      };
    });
    const counts = Object.fromEntries(letters.map((letter) => [letter, prepared.filter((q) => q.correctLetter === letter).length]));
    if (letters.every((letter) => counts[letter] > 0) && Math.max(...Object.values(counts)) <= 5) {
      return { prepared, counts, shuffleAttempt: attempt };
    }
  }
  throw new Error('Klarte ikke å fordele fasit naturlig på A/B/C etter 250 deterministiske shuffle-forsøk.');
}

function escapeXml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function titleFromPlace(placeId) {
  return placeId.replace(/_/g, ' ').toLocaleUpperCase('nb-NO');
}

function wrapText(text, maxChars) {
  const words = normalizeText(text).split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function svgTextBlock(lines, x, y, options = {}) {
  const { size = 18, weight = 400, fill = '#172f4d', lineHeight = 1.2, className = '' } = options;
  return `<text class="${className}" x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}">${lines.map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lineHeight}">${escapeXml(line)}</tspan>`).join('')}</text>`;
}

function questionSvg(question, x, y, width) {
  const totalChars = question.question.length + question.options.join('').length;
  const qSize = totalChars > 280 ? 16 : totalChars > 220 ? 17 : 18;
  const oSize = totalChars > 280 ? 13 : totalChars > 220 ? 14 : 15;
  const qLines = wrapText(question.question, Math.floor(width / (qSize * 0.52)));
  let out = `<g class="question-block"><circle cx="${x + 21}" cy="${y - 7}" r="18" fill="#c79a3b"/><text x="${x + 21}" y="${y - 1}" text-anchor="middle" font-size="18" font-weight="700" fill="#142d4d">${question.number}</text>`;
  out += svgTextBlock(qLines, x + 52, y, { size: qSize, weight: 700, fill: '#142d4d', lineHeight: 1.1 });
  let optionY = y + qLines.length * qSize * 1.1 + 11;
  question.options.forEach((option, index) => {
    const prefix = `${letters[index]}. `;
    const lines = wrapText(`${prefix}${option}`, Math.floor(width / (oSize * 0.54)));
    out += svgTextBlock(lines, x + 54, optionY, { size: oSize, fill: '#203b5d', lineHeight: 1.05 });
    optionY += lines.length * oSize * 1.05 + 3;
  });
  out += '</g>';
  return out;
}

function buildSvg({ title, ribbon, placeId, questions, answerKey }) {
  const left = questions.slice(0, 5);
  const right = questions.slice(5);
  const rowH = 132;
  const startY = 287;
  const col1 = 110;
  const col2 = 845;
  const colW = 650;
  const leftQs = left.map((q, i) => questionSvg(q, col1, startY + i * rowH, colW)).join('\n');
  const rightQs = right.map((q, i) => questionSvg(q, col2, startY + i * rowH, colW)).join('\n');
  const keyText = answerKey.map((entry) => `${entry.number}${entry.letter}`).join(' · ');
  const badge = ribbon.split('/').at(-1).trim();
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg class="quiz-card-svg" xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000" role="img" aria-label="History Go quizkort ${escapeXml(title)}">
  <rect width="1600" height="1000" rx="34" fill="#142d4d"/>
  <rect x="42" y="42" width="1516" height="916" rx="28" fill="#f7efd9"/>
  <rect x="66" y="66" width="1468" height="868" rx="20" fill="none" stroke="#c79a3b" stroke-width="4"/>
  <path d="M96 170 C 390 126, 574 210, 798 166 S 1220 128, 1504 176" fill="none" stroke="#d9c087" stroke-width="2" opacity="0.55"/>
  <g transform="translate(104 87)">
    <circle cx="55" cy="55" r="52" fill="#142d4d"/><path d="M34 62h42M55 30v58M38 42c14 8 23 8 36 0" stroke="#f7efd9" stroke-width="7" stroke-linecap="round" fill="none"/>
    <text x="55" y="123" text-anchor="middle" font-size="16" font-weight="700" fill="#142d4d">${escapeXml(badge)}</text>
  </g>
  <g transform="translate(1365 82)">
    <circle cx="58" cy="58" r="56" fill="#142d4d" stroke="#c79a3b" stroke-width="5"/>
    <text x="58" y="50" text-anchor="middle" font-size="18" font-weight="800" fill="#f7efd9">HISTORY</text>
    <text x="58" y="75" text-anchor="middle" font-size="28" font-weight="900" fill="#c79a3b">GO</text>
  </g>
  <text x="800" y="102" text-anchor="middle" font-size="30" font-weight="800" letter-spacing="8" fill="#142d4d">HISTORY GO</text>
  <text x="800" y="160" text-anchor="middle" font-size="64" font-weight="900" fill="#142d4d">${escapeXml(title)}</text>
  <text x="800" y="198" text-anchor="middle" font-size="26" font-weight="700" fill="#38506c">Quizkort · Topp 10</text>
  <g transform="translate(610 216)"><rect width="380" height="40" rx="20" fill="#142d4d"/><text x="190" y="27" text-anchor="middle" font-size="19" font-weight="800" letter-spacing="1.4" fill="#f7efd9">${escapeXml(ribbon)}</text></g>
  <line x1="800" y1="274" x2="800" y2="878" stroke="#d9c087" stroke-width="3"/>
  ${leftQs}
  ${rightQs}
  <g transform="translate(100 910)">
    <rect width="1400" height="34" rx="17" fill="#142d4d" opacity="0.96"/>
    <text x="700" y="23" text-anchor="middle" font-size="17" font-weight="800" fill="#f7efd9">FASIT: ${escapeXml(keyText)}  ·  ${escapeXml(placeId)} · deterministisk shuffle</text>
  </g>
</svg>`;
}

async function renderHtml(title, svg, metadata) {
  const template = await readFile(path.join(__dirname, 'quiz_card_template.html'), 'utf8');
  return template
    .replaceAll('{{TITLE}}', escapeXml(title))
    .replace('{{SVG}}', svg)
    .replace('{{METADATA}}', JSON.stringify(metadata).replace(/</g, '\\u003c'));
}

function crc32(buffer) {
  let c = ~0;
  for (let i = 0; i < buffer.length; i += 1) {
    c ^= buffer[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function makeFallbackPng() {
  const width = 1600, height = 1000;
  const raw = Buffer.alloc((width * 3 + 1) * height);
  const bg = [247, 239, 217], border = [20, 45, 77], gold = [199, 154, 59];
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 3 + 1); raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const i = row + 1 + x * 3;
      const color = x < 42 || x > 1557 || y < 42 || y > 957 ? border : (x > 95 && x < 1505 && y > 908 && y < 944 ? border : bg);
      raw[i] = color[0]; raw[i + 1] = color[1]; raw[i + 2] = color[2];
      if ((x > 66 && x < 1534 && (Math.abs(y - 66) < 2 || Math.abs(y - 934) < 2)) || (y > 66 && y < 934 && (Math.abs(x - 66) < 2 || Math.abs(x - 1534) < 2))) {
        raw[i] = gold[0]; raw[i + 1] = gold[1]; raw[i + 2] = gold[2];
      }
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), pngChunk('IHDR', ihdr), pngChunk('IDAT', deflateSync(raw, { level: 9 })), pngChunk('IEND', Buffer.alloc(0))]);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifest = await readJson('data/quiz/manifest.json');
  let matches = (manifest.sets ?? []).filter((entry) => entry.targetId === args.place && entry.file.includes(`/quiz/${args.category}/`));
  if (matches.length === 0) {
    matches = (manifest.sets ?? []).filter((entry) => entry.file === `data/quiz/${args.category}/${args.place}_sets.json`);
  }
  if (matches.length !== 1) throw new Error(`Fant ${matches.length} quizfiler for place=${args.place}, category=${args.category}.`);
  const quiz = await readJson(matches[0].file);
  const overridesPath = path.join(__dirname, 'top10_overrides.json');
  const overrides = JSON.parse(await readFile(overridesPath, 'utf8'));
  const override = overrides[args.place] ?? {};
  const selected = selectQuestions(flattenQuestions(quiz), override.questionIds);
  const { prepared, counts, shuffleAttempt } = prepareCardQuestions(args.place, selected);
  const title = normalizeText(args.title ?? override.title ?? titleFromPlace(args.place));
  const ribbon = normalizeText(args.ribbon ?? override.ribbon ?? ribbonMap.get(`${args.category}:${args.place}`) ?? 'BY / HISTORIE');
  const answerKey = prepared.map((q) => ({ number: q.number, letter: q.correctLetter }));
  const svg = buildSvg({ title, ribbon, placeId: args.place, questions: prepared, answerKey });
  const metadata = { placeId: args.place, category: args.category, sourceFile: matches[0].file, title, ribbon, questionIds: prepared.map((q) => q.id), answerKey, answerDistribution: counts, shuffleAttempt };
  const html = await renderHtml(title, svg, metadata);
  const htmlDir = path.join(__dirname, 'output');
  const pngDir = path.join(repoRoot, 'bilder/kort/quiz/top10');
  await mkdir(htmlDir, { recursive: true });
  await mkdir(pngDir, { recursive: true });
  await writeFile(path.join(htmlDir, `${args.place}_top10.html`), html, 'utf8');
  await writeFile(path.join(htmlDir, `${args.place}_top10.svg`), svg, 'utf8');
  await writeFile(path.join(pngDir, `${args.place}_top10.png`), makeFallbackPng());
  console.log(`Lagde HTML-preview: ${path.relative(repoRoot, path.join(htmlDir, `${args.place}_top10.html`))}`);
  console.log(`Lagde SVG-kilde: ${path.relative(repoRoot, path.join(htmlDir, `${args.place}_top10.svg`))}`);
  console.log(`Lagde PNG: ${path.relative(repoRoot, path.join(pngDir, `${args.place}_top10.png`))}`);
  console.log(`Fasitfordeling: ${JSON.stringify(counts)} (shuffleAttempt=${shuffleAttempt})`);
}

main().catch((error) => {
  console.error(`\nQuizkort-generator stoppet: ${error.message}\n`);
  process.exit(1);
});
