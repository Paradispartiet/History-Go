#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  registry: 'data/fag/politikk/politikk_thinker_names.json',
  emner: 'data/fag/politikk/emner_politikk_canonical_v4_5.json',
  fagkart: 'data/fag/politikk/fagkart_politikk_canonical_v4_5.json',
  mappings: 'data/fag/politikk/emnemapping_politikk_canonical_v4_5.json',
  report: 'reports/fagverk/politikk-thinker-integrity-audit.json'
});
const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const text = (value) => String(value ?? '').trim();
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const walk = (value, visit, at = []) => {
  if (Array.isArray(value)) return value.forEach((item, index) => walk(item, visit, [...at, index]));
  if (!value || typeof value !== 'object') return;
  visit(value, at);
  for (const [key, item] of Object.entries(value)) walk(item, visit, [...at, key]);
};

export function auditPolitikkThinkerIntegrity({ writeReport = false, checkReport = true } = {}) {
  const registryDoc = json(P.registry);
  const registry = registryDoc.thinkers || {};
  const emner = json(P.emner);
  const fagkart = json(P.fagkart);
  const mappings = json(P.mappings);
  const seen = new Set();
  const verifiedPairs = [];

  const verify = (id, name, at) => {
    const key = text(id);
    const display = text(name);
    assert(key, `${at}: tom tenker-ID`);
    assert(Object.hasOwn(registry, key), `${at}: ${key} mangler i canonicalt tenkernavnregister`);
    assert(display === registry[key], `${at}: ${key} skal vises som «${registry[key]}», ikke «${display}»`);
    assert(/[A-ZÆØÅ]/.test(display) && !display.includes('_'), `${at}: ugyldig visningsnavn ${display}`);
    seen.add(key);
    verifiedPairs.push({ id: key, name: display, at });
  };
  const verifyArrays = (object, idsKey, namesKey, at) => {
    const ids = object[idsKey];
    if (!Array.isArray(ids)) return;
    const names = object[namesKey];
    assert(Array.isArray(names), `${at}.${namesKey}: mangler navneliste`);
    assert(ids.length === names.length, `${at}: ${idsKey} og ${namesKey} har ulik lengde`);
    ids.forEach((id, index) => verify(id, names[index], `${at}.${namesKey}[${index}]`));
  };

  emner.forEach((emne, index) => {
    const at = `emner[${index}](${emne.emne_id})`;
    verifyArrays(emne, 'canonical_thinker_ids', 'canonical_thinkers', at);
    verifyArrays(emne, 'norwegian_thinker_ids', 'norwegian_thinkers', at);
  });
  for (const [label, document] of [['fagkart', fagkart], ['mappings', mappings]]) {
    walk(document, (object, atParts) => {
      const at = `${label}.${atParts.join('.')}`;
      if (object.id && Object.hasOwn(object, 'name')) verify(object.id, object.name, `${at}.name`);
      verifyArrays(object, 'thinker_ids', 'tenkere', at);
      verifyArrays(object, 'norwegian_thinker_ids', 'norwegian_thinkers', at);
    });
  }

  const unusedRegistryIds = Object.keys(registry).filter((id) => !seen.has(id));
  assert(unusedRegistryIds.length === 0, `Tenkernavnregisteret har ubrukte ID-er: ${unusedRegistryIds.join(', ')}`);
  assert(verifiedPairs.length > 0, 'Ingen tenkerpar ble kontrollert');
  const report = {
    schema: 'history_go_politikk_thinker_integrity_audit_v1',
    version: '1.0.0',
    status: 'passed',
    generatedFrom: P,
    summary: {
      registryCount: Object.keys(registry).length,
      usedThinkerCount: seen.size,
      verifiedPairCount: verifiedPairs.length,
      emneCount: emner.length,
      mappingRowCount: mappings.length
    },
    gates: {
      everyThinkerIdHasCanonicalName: true,
      everyDisplayNameMatchesId: true,
      arrayLengthsMatch: true,
      noRawIdAsDisplayName: true,
      noUnusedRegistryEntries: true
    }
  };
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), report), `${P.report} er utdatert`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditPolitikkThinkerIntegrity({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Politikk-tenkerintegritet OK: ${report.summary.usedThinkerCount} tenkere og ${report.summary.verifiedPairCount} ID–navn-par.`);
  } catch (error) {
    console.error(`Politikk-tenkerintegritet FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
