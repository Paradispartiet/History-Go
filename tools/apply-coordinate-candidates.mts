#!/usr/bin/env node
/**
 * apply-coordinate-candidates.mts
 * -------------------------------
 * Apply-steg for koordinatkandidat-pipelinen.
 *
 * Leser reports/place-coordinate-candidates.json (produsert av
 * generate-place-coordinate-candidates) og skriver KUN trygge kandidater inn i
 * riktig place-fil:
 *   - approval.status === 'auto_approved' (standard), eller
 *   - placeId eksplisitt listet via --ids (manuell godkjenning av needs_review).
 *
 * SIKKERHET:
 *  - Standard er DRY-RUN. Ingenting skrives uten --write.
 *  - Endrer bare lat/lon + coord-metadata. Radius (r) røres ikke uten
 *    --apply-radius, fordi r er spillbalanse, ikke kildedata.
 *  - Gater (physType=street) auto-applies ALDRI; de krever visuell kontroll og
 *    må eventuelt godkjennes eksplisitt via --ids.
 *  - Hvis rapporten er offline/uten live-treff (network.ok === 0 og 0
 *    auto_approved), avbrytes det med en melding om å kjøre pipelinen live
 *    først – det finnes da ingenting å applye.
 *  - Verktøyet endrer ikke places_index.json. Kjør quality-gate, index-bygg og
 *    health etterpå (skrives ut som påminnelse).
 *
 * CLI:
 *   --report <path>     rapportfil (default reports/place-coordinate-candidates.json)
 *   --write             skriv faktisk til place-filer (ellers dry-run)
 *   --file <relpath>    begrens til én place-fil
 *   --ids a,b,c         godkjenn disse placeId-ene i tillegg (selv om needs_review)
 *   --apply-radius      oppdater også r fra kandidaten
 *   --limit N           maks antall steder
 *   --help
 */

import fs from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const DEFAULT_REPORT = path.join(ROOT, 'reports/place-coordinate-candidates.json');

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function parseArgs(argv: string[]) {
  const a: {
    report: string;
    write: boolean;
    file: string | null;
    ids: Set<string>;
    applyRadius: boolean;
    limit: number | null;
    help: boolean;
  } = { report: DEFAULT_REPORT, write: false, file: null, ids: new Set(), applyRadius: false, limit: null, help: false };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === '--write') a.write = true;
    else if (t === '--apply-radius') a.applyRadius = true;
    else if (t === '--help' || t === '-h') a.help = true;
    else if (t === '--report') a.report = path.resolve(ROOT, argv[++i] ?? '');
    else if (t.startsWith('--report=')) a.report = path.resolve(ROOT, t.slice('--report='.length));
    else if (t === '--file') a.file = argv[++i] ?? null;
    else if (t.startsWith('--file=')) a.file = t.slice('--file='.length);
    else if (t === '--ids') for (const id of (argv[++i] ?? '').split(',')) { if (id.trim()) a.ids.add(id.trim()); }
    else if (t.startsWith('--ids=')) for (const id of t.slice('--ids='.length).split(',')) { if (id.trim()) a.ids.add(id.trim()); }
    else if (t === '--limit') a.limit = Number(argv[++i]);
    else if (t.startsWith('--limit=')) a.limit = Number(t.slice('--limit='.length));
  }
  return a;
}

function normFile(arg: string): string {
  let f = String(arg).replace(/\\/g, '/').replace(/^\.\//, '');
  if (!f.startsWith('data/')) f = f.startsWith('places/') ? `data/${f}` : f;
  return f;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('Apply koordinatkandidater. Se filhode for flagg. Eksempel:');
    console.log('  node tools/apply-coordinate-candidates.mjs            # dry-run');
    console.log('  node tools/apply-coordinate-candidates.mjs --write    # skriv');
    return;
  }
  if (args.limit !== null && (!Number.isFinite(args.limit) || args.limit <= 0)) {
    throw new Error('Ugyldig --limit: må være et positivt heltall.');
  }

  let report: any;
  try {
    report = JSON.parse(await fs.readFile(args.report, 'utf8'));
  } catch (err) {
    throw new Error(`Kunne ikke lese rapport ${path.relative(ROOT, args.report)}: ${String((err as Error).message || err)}`);
  }
  const candidates: any[] = Array.isArray(report?.candidates) ? report.candidates : [];

  // Avbryt tidlig hvis rapporten åpenbart er offline/uten live-treff.
  const liveOk = report?.network?.ok ?? 0;
  const autoCount = report?.auto_approved ?? candidates.filter((c) => c?.approval?.status === 'auto_approved').length;
  if (liveOk === 0 && autoCount === 0 && args.ids.size === 0) {
    console.log(
      'Rapporten har ingen live-kandidater (network.ok = 0, auto_approved = 0).\n' +
        'Kjør pipelinen med nettverkstilgang først:\n' +
        '  npm run places:coords:candidates:all\n' +
        'Det finnes ingenting å applye ennå.'
    );
    return;
  }

  const wantFile = args.file ? normFile(args.file) : null;

  // Velg kandidater som skal applyes.
  type Target = { c: any; manual: boolean; reason: string };
  const targets: Target[] = [];
  const skipped: { placeId: string; reason: string }[] = [];

  for (const c of candidates) {
    const id = c?.placeId;
    if (!id) continue;
    if (wantFile && c.file !== wantFile) continue;
    const manual = args.ids.has(id);
    const auto = c?.approval?.status === 'auto_approved';
    if (!auto && !manual) continue;
    if (!c.candidate || !isNum(c.candidate.lat) || !isNum(c.candidate.lon)) {
      skipped.push({ placeId: id, reason: 'mangler kandidatkoordinat' });
      continue;
    }
    // Gater applies aldri automatisk – kun via eksplisitt --ids.
    if (c.physType === 'street' && !manual) {
      skipped.push({ placeId: id, reason: 'gate (street_marker_needs_visual_review) – krever --ids' });
      continue;
    }
    targets.push({ c, manual, reason: manual && !auto ? 'manuell (--ids)' : 'auto_approved' });
  }

  const limited = isNum(args.limit) ? targets.slice(0, args.limit) : targets;

  // Grupper per fil og bruk endringene.
  const byFile = new Map<string, Target[]>();
  for (const t of limited) {
    if (!byFile.has(t.c.file)) byFile.set(t.c.file, []);
    byFile.get(t.c.file)!.push(t);
  }

  const today = new Date().toISOString().slice(0, 10);
  const changes: any[] = [];
  const errors: string[] = [];
  let filesWritten = 0;

  for (const [file, items] of byFile) {
    const abs = path.join(ROOT, file);
    let arr: any[];
    try {
      arr = JSON.parse(await fs.readFile(abs, 'utf8'));
    } catch (err) {
      errors.push(`${file}: kunne ikke lese (${String((err as Error).message || err)})`);
      continue;
    }
    if (!Array.isArray(arr)) {
      errors.push(`${file}: forventet et JSON-array av steder`);
      continue;
    }

    let fileChanged = false;
    for (const { c, reason } of items) {
      const p = arr.find((x) => x?.id === c.placeId);
      if (!p) {
        errors.push(`${file}#${c.placeId}: fant ikke stedet i fila`);
        continue;
      }
      const fromLat = p.lat;
      const fromLon = p.lon;
      const movedM =
        isNum(fromLat) && isNum(fromLon)
          ? Math.round(haversineM(fromLat, fromLon, c.candidate.lat, c.candidate.lon))
          : null;

      // Bruk lat/lon + coord-metadata. r røres bare med --apply-radius.
      p.lat = c.candidate.lat;
      p.lon = c.candidate.lon;
      if (args.applyRadius && isNum(c.candidate.r)) p.r = c.candidate.r;
      p.coordType = c.candidate.coordType ?? p.coordType ?? 'approximate';
      p.coordStatus = c.candidate.coordStatus ?? 'verified';
      p.coordSource = c.candidate.coordSource ?? c.match?.method ?? null;
      p.coordSourceId = c.candidate.coordSourceId ?? null;
      p.coordSourceUrl = c.candidate.coordSourceUrl ?? null;
      p.coordPrecisionM = isNum(c.candidate.coordPrecisionM) ? c.candidate.coordPrecisionM : 40;
      p.coordVerifiedAt = today;
      p.coordNote =
        `Koordinat satt fra ${c.candidate.coordSource ?? 'kilde'} ` +
        `(${c.match?.method ?? 'match'}-treff "${c.match?.matchedName ?? c.name}", ` +
        `confidence ${c.match?.confidence ?? '?'}). Kildebasert ${reason} av koordinatkandidat-pipeline.`;

      fileChanged = true;
      changes.push({
        placeId: c.placeId,
        name: c.name,
        file,
        from: isNum(fromLat) && isNum(fromLon) ? `${fromLat},${fromLon}` : '(mangler)',
        to: `${c.candidate.lat},${c.candidate.lon}`,
        movedM,
        status: reason,
        source: c.candidate.coordSource,
        confidence: c.match?.confidence,
      });
    }

    if (fileChanged && args.write) {
      await fs.writeFile(abs, JSON.stringify(arr, null, 2) + '\n');
      filesWritten++;
    }
  }

  // Rapporter.
  console.log(`${args.write ? 'SKREV' : 'DRY-RUN'} – ${changes.length} sted(er) i ${byFile.size} fil(er).`);
  if (skipped.length) console.log(`Hoppet over: ${skipped.length} (f.eks. ${skipped.slice(0, 3).map((s) => `${s.placeId}: ${s.reason}`).join('; ')})`);
  if (changes.length) {
    console.log('\nplaceId | flyttet_m | conf | kilde | fra -> til');
    for (const ch of changes.slice(0, 60)) {
      console.log(`  ${ch.placeId} | ${ch.movedM ?? '–'} | ${ch.confidence ?? '–'} | ${ch.source ?? '–'} | ${ch.from} -> ${ch.to}`);
    }
    if (changes.length > 60) console.log(`  … +${changes.length - 60} til`);
  }
  if (errors.length) {
    console.log(`\nFeil (${errors.length}):`);
    for (const e of errors) console.log(`  - ${e}`);
  }

  if (args.write && filesWritten > 0) {
    console.log(
      `\nSkrev ${filesWritten} fil(er). Kjør deretter:\n` +
        '  npm run places:coords:gate\n' +
        '  npm run places:index:build && npm run places:index:check\n' +
        '  npm run health:places'
    );
  } else if (!args.write) {
    console.log('\nDette var en dry-run. Kjør på nytt med --write for å skrive endringene.');
  }

  if (errors.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`Feil: ${String((err as Error).stack || err)}`);
  process.exit(1);
});
