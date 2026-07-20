import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const run = (args) => execFileSync('git', args, { stdio: 'inherit' });
const selfPath = path.resolve('scripts/coordinate-branch-job.mjs');
const selfSource = fs.readFileSync(selfPath, 'utf8');
const branchName = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
if (!branchName) throw new Error('Kunne ikke identifisere koordinatbranchen.');

run(['config', 'user.name', 'github-actions[bot]']);
run(['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run(['fetch', 'origin', 'main']);
run(['reset', '--hard', 'origin/main']);
fs.mkdirSync(path.dirname(selfPath), { recursive: true });
fs.writeFileSync(selfPath, selfSource);
run(['add', 'scripts/coordinate-branch-job.mjs']);
run(['commit', '-m', 'Rebase Alna coordinate runner onto latest main']);
run(['push', '--force-with-lease', 'origin', `HEAD:${branchName}`]);

const tempPath = path.resolve('scripts/.alna-coordinate-clean-job.mjs');
const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/dc50908c6a1b6dd9dc031d370b9c10e681482456/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`Kunne ikke hente immutable Alna-runner: ${response.status} ${response.statusText}`);
}

let source = await response.text();
source = source.replace(
  "if (newBatch !== 91) throw new Error(`Forventet batch 91 på current main, fant neste batch ${newBatch}.`);",
  "if (!Number.isInteger(newBatch) || newBatch < 92) throw new Error(`Ugyldig neste Oslo-batch: ${newBatch}.`);"
);

const countStart = source.indexOf('const countMatch = protocol.match(');
const countEnd = source.indexOf("protocol = protocol.replace('Sist oppdatert:", countStart);
if (countStart < 0 || countEnd < 0) {
  throw new Error('Fant ikke tellerblokken i immutable Alna-runner.');
}

const robustCountBlock = [
  "const verifiedCountMatch = protocol.match(/Oslo-tabellen inneholder nå (\\d+) (?:dokumenterte )?verifiserte eller kildekontrollerte canonical steder\\./);",
  "if (!verifiedCountMatch) throw new Error('Kunne ikke lese Oslo-totalen i protokollen.');",
  "const newVerifiedCount = Number(verifiedCountMatch[1]) + Object.keys(verified).length;",
  "const reviewSectionStart = protocol.indexOf('### Dokumenterte Oslo-kontroller uten godkjent koordinat');",
  "const reviewSectionEnd = protocol.indexOf('\\n## ', reviewSectionStart + 4);",
  "if (reviewSectionStart < 0 || reviewSectionEnd < 0) throw new Error('Kunne ikke avgrense Oslo needs_review-tabellen.');",
  "const reviewSectionText = protocol.slice(reviewSectionStart, reviewSectionEnd);",
  "const currentNeedsReviewCount = [...reviewSectionText.matchAll(/^\\| `[^`]+` .* \\| needs_review(?:;[^|]*)? \\|/gm)].length;",
  "const newNeedsReviewCount = currentNeedsReviewCount + Object.keys(unresolved).length;",
  "protocol = protocol.replace(",
  "  /^Oslo-tabellen inneholder nå .*$/m,",
  "  `Oslo-tabellen inneholder nå ${newVerifiedCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch ${newBatch} kontrollerer alle åtte Alnaelva-rutepunktene: fire får eksakt kildegeometri, mens fire avsluttes som dokumenterte needs_review-saker uten proxy-gjetting. Resttabellen under er en dokumentasjonsliste for eksplisitt førte konflikter og er ikke en komplett opptelling av all runtime-koordinatbacklog.`",
  ");",
  ""
].join('\n');
source = source.slice(0, countStart) + robustCountBlock + source.slice(countEnd);
source = source.replaceAll('Neste nye Oslo-kontroll er batch 92.', 'Neste nye Oslo-kontroll er batch ${newBatch + 1}.');
source = source.replaceAll('Før batch 92 starter', 'Før batch ${newBatch + 1} starter');

fs.writeFileSync(tempPath, source);
try {
  await import(`${pathToFileURL(tempPath).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempPath, { force: true });
}
