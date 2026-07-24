import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const reportDir = join(root, 'reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194');
const summaryPath = join(reportDir, 'summary.json');
const summary = JSON.parse(await readFile(summaryPath, 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function commandAvailable(command) {
  return spawnSync('bash', ['-lc', `command -v ${command}`], { encoding: 'utf8' }).status === 0;
}

function exec(command, args, allowFailure = false) {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 25 * 1024 * 1024 });
  if (!allowFailure && result.status !== 0) {
    throw new Error(`${command} failed (${result.status}): ${result.stderr || result.stdout}`);
  }
  return result;
}

async function fetchImage(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    },
  });
  assert(response.ok, `Image fetch failed ${response.status}: ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  assert(buffer.length > 10_000, `Image payload too small (${buffer.length} bytes): ${url}`);
  return { buffer, finalUrl: response.url, contentType: response.headers.get('content-type') ?? '' };
}

await mkdir(reportDir, { recursive: true });
assert(summary.placeId === 'sigrid_undset_statue', 'Unexpected report placeId.');
assert(summary.coordinateMaxBatch === 194, 'Report is not post-194.');
assert(summary.exactOsmCandidate?.id === 7596280553, 'Exact OSM candidate changed.');
assert(summary.googleImage?.sha256 === 'bc1dc83cce6a039eb1012cc69058ba09076707f1e603f36ba1326d326f4f1d6f', 'Pinned OSM-linked thumbnail hash changed.');

const discovered = summary.googleImage.discoveredImageUrls.filter((url) => url.includes('/pw/'));
const bases = [...new Set(discovered.map((url) => url.replace(/=w\d+[^\s]*$/, '')))];
assert(bases.length >= 2, `Expected two album image bases, got ${bases.length}.`);

const downloads = [];
for (let index = 0; index < 2; index += 1) {
  const sourceUrl = `${bases[index]}=w1800-h1400-no`;
  const fetched = await fetchImage(sourceUrl);
  const filename = `osm-google-photo-${index + 1}-full.jpg`;
  await writeFile(join(reportDir, filename), fetched.buffer);
  downloads.push({
    index: index + 1,
    file: `reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194/${filename}`,
    sourceUrl,
    finalUrl: fetched.finalUrl,
    contentType: fetched.contentType,
    bytes: fetched.buffer.length,
  });
}

const setupLog = [];
if (!commandAvailable('tesseract') || !commandAvailable('convert') || !commandAvailable('identify')) {
  const update = exec('sudo', ['apt-get', 'update', '-qq']);
  setupLog.push(update.stdout, update.stderr);
  const install = exec('sudo', ['apt-get', 'install', '-y', '-qq', 'tesseract-ocr', 'tesseract-ocr-eng', 'imagemagick']);
  setupLog.push(install.stdout, install.stderr);
}
await writeFile(join(reportDir, 'ocr-dependency-setup.log'), `${setupLog.join('\n')}\n`, 'utf8');

const ocrRows = [];
for (const item of downloads) {
  const input = join(root, item.file);
  const dimensions = exec('identify', ['-format', '%w %h', input]);
  const [width, height] = dimensions.stdout.trim().split(/\s+/).map(Number);
  assert(Number.isFinite(width) && Number.isFinite(height), `Could not identify image ${item.index}.`);

  const enhanced = join(reportDir, `photo-${item.index}-enhanced.png`);
  const bottom = join(reportDir, `photo-${item.index}-bottom-enhanced.png`);
  exec('convert', [input, '-resize', '240%', '-colorspace', 'Gray', '-contrast-stretch', '1%x1%', '-sharpen', '0x1', enhanced]);
  exec('convert', [input, '-gravity', 'South', '-crop', '100%x65%+0+0', '+repage', '-resize', '320%', '-colorspace', 'Gray', '-contrast-stretch', '1%x1%', '-sharpen', '0x1.5', bottom]);

  const variants = [
    ['full', input],
    ['enhanced', enhanced],
    ['bottom', bottom],
  ];
  const texts = [];
  for (const [label, path] of variants) {
    for (const psm of ['6', '11', '12']) {
      const result = exec('tesseract', [path, 'stdout', '-l', 'eng', '--psm', psm], true);
      const text = String(result.stdout ?? '').trim();
      texts.push({ label, psm: Number(psm), text, exitCode: result.status });
      await writeFile(join(reportDir, `photo-${item.index}-${label}-psm${psm}.log`), `${text}\n${result.stderr ?? ''}\nexit=${result.status}\n`, 'utf8');
    }
  }

  const combinedText = texts.map((row) => row.text).join(' ').replace(/\s+/g, ' ').trim();
  const normalized = combinedText.toLocaleUpperCase('nb-NO');
  ocrRows.push({
    imageIndex: item.index,
    width,
    height,
    texts,
    combinedText,
    sigridMatch: normalized.includes('SIGRID'),
    undsetMatch: normalized.includes('UNDSET'),
    lifeDateMatch: /1882\D{0,10}1949/.test(normalized),
  });
}

const albumResponse = await fetch('https://photos.app.goo.gl/JrhcnKr6gwFmcEtu5', {
  redirect: 'follow',
  headers: { 'user-agent': 'Mozilla/5.0', accept: 'text/html,*/*;q=0.8' },
});
const albumHtml = await albumResponse.text();
const upperHtml = albumHtml.toLocaleUpperCase('nb-NO');
const contexts = [];
for (const keyword of ['SIGRID', 'UNDSET', 'STENSPARKEN', 'STATUE', 'SKULPTUR', 'STYRKE']) {
  let cursor = 0;
  while (contexts.length < 40) {
    const at = upperHtml.indexOf(keyword, cursor);
    if (at < 0) break;
    contexts.push({ keyword, context: albumHtml.slice(Math.max(0, at - 180), Math.min(albumHtml.length, at + keyword.length + 180)).replace(/\s+/g, ' ') });
    cursor = at + keyword.length;
  }
}
await writeFile(join(reportDir, 'google-album-keyword-context.json'), `${JSON.stringify({ status: albumResponse.status, finalUrl: albumResponse.url, htmlBytes: Buffer.byteLength(albumHtml), contexts }, null, 2)}\n`, 'utf8');

const inscriptionConfirmed = ocrRows.some((row) => row.sigridMatch && row.undsetMatch);
const partialInscriptionEvidence = ocrRows.some((row) => row.sigridMatch || row.undsetMatch || row.lifeDateMatch);
const decision = inscriptionConfirmed
  ? 'exact_osm_linked_album_contains_sigrid_undset_inscription'
  : partialInscriptionEvidence
    ? 'partial_inscription_evidence_requires_manual_visual_review'
    : 'ocr_did_not_resolve_identity_manual_visual_review_still_required';

const result = {
  version: '2026-07-24',
  placeId: 'sigrid_undset_statue',
  exactOsmNodeId: 7596280553,
  pinnedThumbnailSha256: summary.googleImage.sha256,
  downloads,
  ocrRows,
  albumKeywordContexts: contexts,
  inscriptionConfirmed,
  partialInscriptionEvidence,
  decision,
};
await writeFile(join(reportDir, 'inscription-crosscheck.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');

summary.inscriptionCrosscheck = {
  report: 'reports/oslo-coordinate-sigrid-undset-visual-crosscheck-post-194/inscription-crosscheck.json',
  inscriptionConfirmed,
  partialInscriptionEvidence,
  decision,
};
summary.canPromoteAutomatically = inscriptionConfirmed;
summary.decision = inscriptionConfirmed
  ? 'exact_osm_node_identified_by_directly_linked_album_inscription'
  : decision;
await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

const readmePath = join(reportDir, 'README.md');
const readme = await readFile(readmePath, 'utf8');
const appendix = `\n## Full-resolution inscription crosscheck\n\nTwo full-resolution images were downloaded from the exact Google Photos album linked by OSM node 7596280553. OCR was run against originals, enhanced copies and lower-image crops with multiple page-segmentation modes.\n\n- exact inscription confirmed: \`${inscriptionConfirmed}\`\n- partial inscription evidence: \`${partialInscriptionEvidence}\`\n- decision: \`${decision}\`\n\nDetailed OCR output and image provenance are stored in \`inscription-crosscheck.json\`.\n`;
await writeFile(readmePath, `${readme.trimEnd()}${appendix}`, 'utf8');

console.log(JSON.stringify({
  downloads,
  ocr: ocrRows.map((row) => ({
    imageIndex: row.imageIndex,
    width: row.width,
    height: row.height,
    combinedText: row.combinedText,
    sigridMatch: row.sigridMatch,
    undsetMatch: row.undsetMatch,
    lifeDateMatch: row.lifeDateMatch,
  })),
  inscriptionConfirmed,
  partialInscriptionEvidence,
  decision,
}, null, 2));
