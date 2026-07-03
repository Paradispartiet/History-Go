import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const DEFAULT_OUT = 'games/writing-academy/data/goodreads_author_seed.json';
const DEFAULT_CHILDREN_OUT = 'games/children-literature/data/goodreads_children_seed.json';
const PEOPLE_PATH = 'data/people/litteratur/oslo/people_litteratur_oslo.json';
const PRIVATE_FIELDS_EXCLUDED = [
  'goodreads_rating',
  'goodreads_date_added',
  'goodreads_date_read',
  'goodreads_private_notes',
  'goodreads_review',
  'goodreads_spoiler',
  'goodreads_read_count',
  'goodreads_owned_copies',
  'isbn',
  'isbn13',
];
const RAW_PRIVATE_FIELDS = new Set([
  'My Rating', 'Date Added', 'Date Read', 'Private Notes', 'My Review', 'Spoiler',
  'Read Count', 'Owned Copies', 'ISBN', 'ISBN13',
]);
const HIGH_SHELF_SIGNALS = new Set(['children', 'picture-book', 'picture books', 'picturebooks', 'middle-grade', 'middle grade', 'young-adult', 'young adult', 'ya', 'juvenile', 'barnebok', 'ungdomsbok']);
const MEDIUM_TEXT_SIGNALS = ['harry potter', 'narnia', 'mumm', 'moomin', 'roald dahl', 'astrid lindgren', 'j k rowling', 'j. k. rowling', 'rick riordan', 'lemony snicket', 'percy jackson', 'hunger games'];

export function normalizeName(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

const authorIdFromName = (name) => normalizeName(name).replace(/\s+/g, '_') || 'unknown_author';
const numberOrNull = (value) => {
  const n = Number(String(value || '').trim());
  return Number.isFinite(n) && n > 0 ? n : null;
};

export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers = [], ...records] = rows.filter((r) => r.some((v) => String(v).trim() !== ''));
  return records.map((record) => Object.fromEntries(headers.map((h, i) => [h.trim(), record[i] ?? ''])));
}

function loadPeople(root = ROOT, peoplePath = PEOPLE_PATH) {
  const people = JSON.parse(fs.readFileSync(path.join(root, peoplePath), 'utf8'));
  return new Map(people.map((p) => [normalizeName(p.name), p.id]));
}

function shelfTokens(row) {
  return [row['Exclusive Shelf'], row['Bookshelves'], row['Bookshelves with positions']]
    .filter(Boolean)
    .flatMap((value) => String(value).split(/[,;]/).map((s) => s.trim().toLowerCase()).filter(Boolean));
}

function classifyChildrenOrYa(row) {
  const shelves = shelfTokens(row);
  if (shelves.some((s) => HIGH_SHELF_SIGNALS.has(s))) return { route: true, confidence: 'high' };
  const haystack = `${row.Title || ''} ${row.Author || ''} ${row['Additional Authors'] || ''} ${row['Bookshelves'] || ''}`.toLowerCase();
  if (MEDIUM_TEXT_SIGNALS.some((signal) => haystack.includes(signal))) return { route: true, confidence: 'medium' };
  return { route: false, confidence: 'low' };
}

function retainedBook(row, extra = {}) {
  const book = {
    title: row.Title || '',
    authorName: row.Author || '',
    yearPublished: numberOrNull(row['Year Published']),
    originalPublicationYear: numberOrNull(row['Original Publication Year']),
    ...extra,
  };
  if (row.Publisher) book.publisher = row.Publisher;
  return Object.fromEntries(Object.entries(book).filter(([, v]) => v !== null && v !== undefined && v !== ''));
}

export function buildImport(csvText, { root = ROOT } = {}) {
  const rows = parseCsv(csvText);
  const peopleByName = loadPeople(root);
  const eligible = rows.filter((r) => String(r['Exclusive Shelf'] || '').trim().toLowerCase() === 'read')
    .filter((r) => Number(r['My Rating'] || 0) >= 4);
  const authors = new Map();
  const childrenPending = [];
  const excludedForWritingAcademy = [];
  for (const row of eligible) {
    const child = classifyChildrenOrYa(row);
    if (child.route) {
      const candidate = retainedBook(row, { reason: 'children_or_young_adult_candidate', confidence: child.confidence, routeTo: 'hgChildrenLiteratureGame' });
      candidate.retainedFields = ['title', 'authorName', 'yearPublished', 'originalPublicationYear', 'reason', 'confidence', 'routeTo'];
      childrenPending.push(candidate);
      excludedForWritingAcademy.push({ ...candidate });
      continue;
    }
    const name = row.Author || 'Unknown Author';
    const key = normalizeName(name);
    if (!authors.has(key)) {
      const personId = peopleByName.get(key);
      authors.set(key, { authorId: authorIdFromName(name), name, selectedBooks: [], workCandidates: [], themeTags: [], matchStatus: personId ? 'match_by_normalized_name_or_pending' : 'pending_person_candidate', ...(personId ? { authorMatch: { personId, matchStrategy: 'normalized_name' } } : {}) });
    }
    const author = authors.get(key);
    author.selectedBooks.push(row.Title || '');
    author.workCandidates.push(retainedBook(row, { category: 'adult_literature', matchStatus: author.authorMatch ? 'match_by_normalized_name_or_pending' : 'pending_person_candidate' }));
  }
  const importRules = { exclusiveShelfMustEqual: 'read', minimumGoodreadsStarsUsedOnlyAsFilter: 4, neverPersistGoodreadsPrivateFields: [...PRIVATE_FIELDS_EXCLUDED], excludeChildrenAndYA: true, childAndYaRouteTo: 'hgChildrenLiteratureGame', uncertainChildrenYaCandidates: 'route_to_pendingChildrenLiteratureCandidates' };
  const adult = { schemaVersion: '1.2.0', gameId: 'hgWritingAcademy', curationNote: 'Goodreads CSV-import for Skrivekunstakademiet. Bruker Goodreads stjerner bare som filter (minimum 4) og private Goodreads-felt lagres aldri.', importRules, personalGoodreadsCanon: [...authors.values()], excludedForWritingAcademy, goodreadsPrivateFieldsExcluded: PRIVATE_FIELDS_EXCLUDED, childrenLiteratureCanon: [], pendingChildrenLiteratureCandidates: childrenPending };
  const children = { schemaVersion: '1.0.0', gameId: 'hgChildrenLiteratureGame', importRules, childrenLiteratureCanon: [], pendingChildrenLiteratureCandidates: childrenPending };
  const summary = { totalRows: rows.length, readRows: rows.filter((r) => String(r['Exclusive Shelf'] || '').trim().toLowerCase() === 'read').length, rating4PlusRows: eligible.length, importedAdultBooks: adult.personalGoodreadsCanon.reduce((n, a) => n + a.selectedBooks.length, 0), adultAuthors: adult.personalGoodreadsCanon.length, matchedHistoryGoAuthors: adult.personalGoodreadsCanon.filter((a) => a.authorMatch).length, pendingPersonCandidates: adult.personalGoodreadsCanon.filter((a) => !a.authorMatch).length, childrenOrYaRouted: childrenPending.length, pendingChildrenLiteratureCandidates: childrenPending.length, privateFieldsPersisted: 0 };
  const serialized = JSON.stringify({ adult, children });
  for (const field of RAW_PRIVATE_FIELDS) if (serialized.includes(field)) throw new Error(`Private Goodreads field persisted: ${field}`);
  return { adult, children, summary };
}

function parseArgs(argv) {
  const args = { out: DEFAULT_OUT, childrenOut: DEFAULT_CHILDREN_OUT, dryRun: false, write: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--input') args.input = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
    else if (arg === '--children-out') args.childrenOut = argv[++i];
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--write') args.write = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!args.input) throw new Error('Missing required --input /path/to/goodreads_library_export.csv');
  if (args.write === args.dryRun) throw new Error('Choose exactly one of --write or --dry-run');
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = path.resolve(ROOT, args.input);
  if (!fs.existsSync(inputPath)) throw new Error(`Goodreads CSV input file not found: ${inputPath}`);
  const result = buildImport(fs.readFileSync(inputPath, 'utf8'));
  if (args.write) {
    for (const [target, data] of [[args.out, result.adult], [args.childrenOut, result.children]]) {
      const full = path.resolve(ROOT, target);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`);
    }
  }
  console.log(JSON.stringify(result.summary, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(`Goodreads literature import failed: ${error.message}`); process.exit(1); });
}
