#!/usr/bin/env node
// Ikke-publiserende handoff fra redaksjonell seksstedsfil til validerbare quizkandidater.
// Bruk --json for maskinlesbare kandidater; uten flagg kjøres bare staging-audit.
import { readFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(resolve(ROOT, p), 'utf8');
const fail = (message) => { throw new Error('Oslo-six staging: ' + message); };
const ensure = (value, message) => { if (!value) fail(message); };

export const STEDER = Object.freeze([
  ['linderud_gard', 'Linderud gård'],
  ['ekebergrestauranten', 'Ekebergrestauranten'],
  ['frognerseteren', 'Frognerseteren'],
  ['sarabraten', 'Sarabråten'],
  ['saeterhytten_bygdoy', 'Sæterhytten'],
  ['kristiania_teglverk_bryn', 'Kristiania Teglverk']
]);

function section(text, heading, level) {
  const start = text.indexOf(heading);
  ensure(start !== -1, 'mangler seksjon: ' + heading);
  const remainder = text.slice(start + heading.length);
  const next = remainder.indexOf('\n' + level + ' ');
  return remainder.slice(0, next === -1 ? undefined : next);
}

function parseCore(text, id, name) {
  const tick = String.fromCharCode(96);
  const body = section(text, '## ' + name + ' (' + tick + id + tick + ')', '##');
  const lines = body.split('\n').filter((line) => /^\|\s*\d+\s*\|/.test(line));
  ensure(lines.length === 10, id + ': forventet 10 faktakjerner, fant ' + lines.length);
  return lines.map((line, index) => {
    const cols = line.split('|').slice(1, -1).map((s) => s.trim());
    ensure(cols.length === 4 && Number(cols[0]) === index + 1, id + ': ugyldig faktarad ' + (index + 1));
    ensure(cols.slice(1).every(Boolean), id + ': tomt spørsmål, svar eller kildespor');
    return { number: index + 1, question: cols[1], answer_core: cols[2], source_trace: cols[3], status: 'not_reviewed_for_runtime' };
  });
}

function parseAlternatives(text, id, name) {
  const body = section(text, '### ' + name, '###');
  ensure(body.includes('**Fagverk – stedets egen undersøkelsesjobb:**'), id + ': mangler stedsspesifikk Fagverk-vinkel');
  const lines = body.split('\n').filter((line) => /^\d+\.\s/.test(line));
  ensure(lines.length === 10, id + ': forventet 10 firevalgsutkast, fant ' + lines.length);
  return lines.map((line, index) => {
    const match = line.match(/^(\d+)\.\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*$/);
    ensure(match && Number(match[1]) === index + 1, id + ': ugyldig alternativrad ' + (index + 1));
    const [, , question, correct, distractorText, sourceTrace] = match;
    const distractors = distractorText.split(';').map((s) => s.trim());
    ensure(question && correct && sourceTrace && distractors.length === 3 && distractors.every(Boolean),
      id + ': tre reelle distraktorer og kildespor kreves');
    const unique = new Set([correct, ...distractors].map((s) => s.normalize('NFKC').trim().toLowerCase()));
    ensure(unique.size === 4, id + ': dobbelt svaralternativ i rad ' + (index + 1));
    return { number: index + 1, question, correct, distractors, source_trace: sourceTrace, status: 'not_reviewed_for_runtime' };
  });
}

export function buildOsloSixStaging() {
  const editorial = read('reports/place-production/oslo-six-places-editorial-20261022.md');
  const marker = '\n## Supplerende Fagverk-plan og firevalgsutkast (Stage B)';
  ensure(editorial.includes(marker), 'mangler Stage B');
  const [primary, stage] = editorial.split(marker);
  ensure(stage, 'tom Stage B');

  const linderud = JSON.parse(read('data/quiz/production_briefs/historie/linderud_gard.json'));
  ensure(linderud.targetId === 'linderud_gard' && linderud.status === 'in_review',
    'Linderuds claimbank må være et uferdig reviewgrunnlag');
  ensure(linderud.claims.length === 35 && new Set(linderud.claims.map((c) => c.claim_id)).size === 35,
    'Linderuds 35 claims er ikke komplette og unike');
  for (const claim of linderud.claims) {
    ensure(claim.source_ids.length > 0 && claim.source_ids.every((id) => Boolean(linderud.sources[id])),
      'Linderud claim mangler gyldig kilde: ' + claim.claim_id);
  }
  ensure(Object.values(linderud.publication_gate).every((value) => value === false),
    'Linderuds reviewbrief må ikke påstå publisering');

  const gate = JSON.parse(read('reports/place-production/oslo-six-places-integration-gates-20261022.json'));
  ensure(gate.schema === 'history_go_oslo_six_place_intake_gate_v1' &&
         gate.status === 'editorial_only_not_v1' &&
         gate.safeguards.active_places === 0 &&
         gate.safeguards.v1_certified === 0,
    'samlet publiseringsport må eksplisitt være editorial-only');
  ensure(gate.places.length === STEDER.length &&
         gate.places.every((entry, index) => entry.place_id === STEDER[index][0]),
    'seksstedslisten må samsvare med publiseringsporten');

  // This is a read-only historical draft projection. A canonical onboarding
  // must not make the original source drafts unreadable. Actual activation is
  // checked by audit-oslo-six-v1-release, against real source/quiz dependencies.
  const records = STEDER.map(([id, name]) => {
    const intake = gate.places.find((entry) => entry.place_id === id);
    ensure(intake && intake.release_status === 'BLOCKED' &&
           intake.geographical_anchor.status === 'HOLD' &&
           Object.values(intake.publication_gates).every((passed) => passed === false),
      id + ': status motstrider felles publiseringsport');
    const core = parseCore(primary, id, name);
    const alternatives = id === 'linderud_gard' ? [] : parseAlternatives(stage, id, name);
    ensure(core.length === intake.editorial.quizcard_fact_candidates &&
           alternatives.length === intake.editorial.four_choice_alternatives &&
           intake.editorial.source_claim_bank_count === (id === 'linderud_gard' ? linderud.claims.length : 0),
      id + ': redaksjonelle antall avviker fra felles publiseringsport');
    return {
      id, name, status: 'editorial_staging_only', fact_candidates: core,
      four_option_drafts: alternatives, canonical_place_ready: false,
      full_quiz_ready: false, quizcard_ready: false, fagverk_ready: false,
      photo_ready: false, browser_qa_ready: false,
      pin_status: id === 'kristiania_teglverk_bryn'
        ? 'HOLD_address_identity_14_vs_18' : 'requires_geographic_verification'
    };
  });
  ensure(records.reduce((total, r) => total + r.fact_candidates.length, 0) === 60,
    'forventet 60 faktakjerner');
  ensure(records.reduce((total, r) => total + r.four_option_drafts.length, 0) === 50,
    'forventet 50 supplerende alternativutkast');

  return {
    schema: 'history_go_oslo_six_editorial_handoff_v1',
    publication_status: 'NOT_PUBLISHED',
    source_of_truth: 'reports/place-production/oslo-six-places-editorial-20261022.md',
    linderud_claim_bank: 'data/quiz/production_briefs/historie/linderud_gard.json',
    source_claim_count_linderud: linderud.claims.length,
    count_fact_candidates: 60,
    count_alternative_drafts: 50,
    note: '60 faktakjerner og 50 alternative utkast er ikke 110 unike spørsmål. Ingen runtime-quiz, kort, Fagverk eller kartpunkt genereres.',
    places: records
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = buildOsloSixStaging();
    if (process.argv.includes('--json')) {
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    } else {
      console.log('Oslo-six staging OK: 6 steder, 60 faktakjerner, 50 alternative utkast, 35 Linderud-claims; ingen aktiv publisering');
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
