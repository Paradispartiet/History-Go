#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT_FILE = 'reports/fagverk/subkultur-data-audit.json';
const WRITE_REPORT = process.argv.includes('--write-report');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function flatten(value) {
  if (Array.isArray(value)) return value.flatMap(flatten);
  if (!value || typeof value !== 'object') return [];
  if (value.id) return [value];
  return Object.values(value).flatMap(flatten);
}

function manifestRecords(relative) {
  const byId = new Map();
  for (const entry of list(readJson(relative).files)) {
    const file = entry.startsWith('data/') ? entry : `data/${entry}`;
    for (const record of flatten(readJson(file))) if (record.id) byId.set(record.id, record);
  }
  return byId;
}

export function buildSubkulturDataReport() {
  const audit = readJson('data/fag/subkultur/subkultur_places_people_audit_v1.json');
  const emneIds = new Set(readJson('data/fag/subkultur/emner_subkultur_canonical_v4_5.json').map((entry) => entry.emne_id));
  const places = manifestRecords('data/places/manifest.json');
  const people = manifestRecords('data/people/manifest.json');
  const invalidEmneReferences = [];
  const recordMismatches = [];
  for (const row of audit.places) {
    const record = places.get(row.place_id);
    if (!record) recordMismatches.push(`missing_place:${row.place_id}`);
    for (const id of row.subkultur_emne_ids) if (!emneIds.has(id)) invalidEmneReferences.push(`${row.place_id}:${id}`);
    if (row.decision.startsWith('retain_') && !list(record?.emne_ids).some((id) => row.subkultur_emne_ids.includes(id))) {
      recordMismatches.push(`place_mapping:${row.place_id}`);
    }
    if (!row.decision.startsWith('retain_') && (
      record?.category === 'subkultur' || list(record?.secondaryBadgeIds).includes('subkultur')
    )) recordMismatches.push(`place_reclassification:${row.place_id}`);
  }
  for (const row of audit.people) {
    const record = people.get(row.people_id);
    if (!record) recordMismatches.push(`missing_people:${row.people_id}`);
    for (const id of row.subkultur_emne_ids) if (!emneIds.has(id)) invalidEmneReferences.push(`${row.people_id}:${id}`);
    if (row.decision.startsWith('retain_') && !list(record?.emne_ids).some((id) => String(id).startsWith('em_sub_'))) {
      recordMismatches.push(`people_mapping:${row.people_id}`);
    }
    if (!row.decision.startsWith('retain_') && (
      record?.category === 'subkultur'
      || list(record?.secondaryBadgeIds).includes('subkultur')
      || list(record?.tags).includes('subkultur')
      || list(record?.emne_ids).some((id) => String(id).startsWith('em_sub_'))
    )) recordMismatches.push(`people_reclassification:${row.people_id}`);
  }
  return {
    schema: 'history_go_subkultur_data_audit_report_v1',
    status: 'CLASSIFICATION_AND_MAPPING_COMPLETE_CASE_EVIDENCE_PENDING',
    totals: audit.totals,
    integrity: {
      duplicate_place_rows: audit.places.map((row) => row.place_id).filter((id, index, all) => all.indexOf(id) !== index),
      duplicate_people_rows: audit.people.map((row) => row.people_id).filter((id, index, all) => all.indexOf(id) !== index),
      retained_places_without_mapping: audit.places.filter((row) => row.decision.startsWith('retain_') && row.subkultur_emne_ids.length === 0).map((row) => row.place_id),
      retained_people_without_mapping: audit.people.filter((row) => row.decision.startsWith('retain_') && row.subkultur_emne_ids.length === 0).map((row) => row.people_id),
      invalid_emne_references: invalidEmneReferences,
      record_mismatches: recordMismatches
    },
    next_gate: 'case_source_validation'
  };
}

export function auditSubkulturData({ writeReport = false, checkReport = true } = {}) {
  const report = buildSubkulturDataReport();
  assert(report.totals.audited_places === 68, 'Alle 68 opprinnelig relevante steder skal være auditerte');
  assert(report.totals.audited_people === 70, 'Alle 70 relevante People-poster skal være auditerte');
  for (const [key, values] of Object.entries(report.integrity)) assert(values.length === 0, `${key}: ${values.join(', ')}`);
  if (writeReport) fs.writeFileSync(path.join(ROOT, REPORT_FILE), JSON.stringify(report, null, 2) + '\n');
  if (checkReport && fs.existsSync(path.join(ROOT, REPORT_FILE))) {
    assert(JSON.stringify(readJson(REPORT_FILE)) === JSON.stringify(report), `${REPORT_FILE} er utdatert; kjør --write-report`);
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = auditSubkulturData({ writeReport: WRITE_REPORT, checkReport: !WRITE_REPORT });
  console.log(`Subkultur dataaudit OK: ${report.totals.audited_places} steder og ${report.totals.audited_people} People.`);
}
