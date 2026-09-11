#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { validatePacket } from '../scripts/validate-place-description-production-v4_2.mjs';

const root = process.cwd();
const placeFile = 'data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_03/stortorget.json';
const packetFile = 'data/places/production/stortorget.json';
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

const place = read(placeFile);
const packet = read(packetFile);
const result = validatePacket({ packet, place, packetFile, now: new Date('2026-09-11T00:00:00Z') });
if (result.issues.length > 0) {
  for (const issue of result.issues) console.error(`- ${issue.code}: ${issue.message}`);
  console.error(`Stortorget v4.2 failed: ${result.issues.length} issue(s)`);
  process.exit(1);
}
console.log(`Stortorget v4.2 valid: ${packet.claims.length} claims, ${packet.quizReadiness.questions.length} quiz-readiness questions`);
