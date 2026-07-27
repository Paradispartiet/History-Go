#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const profilePath = path.join(root, 'data/fag/profiles/historie/oslo_akershus/profile.json');
const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
const A = (value) => Array.isArray(value) ? value : [];
const sorted = (values) => [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), 'nb'));

const additions = {
  case_his_blitz: [
    'em_his_offentlighet_mobilisering_foreninger_partier_og_organisasjonssamfunn',
    'em_his_offentlighet_mobilisering_protest_kollektiv_handling_og_repertoarer',
    'em_his_offentlighet_mobilisering_borgerrettighetskamp_antirasisme_og_solidaritetsbevegelser',
    'em_his_offentlighet_mobilisering_presse_offentlighet_og_politisk_kommunikasjon',
  ],
  case_his_norsk_folkemuseum: [
    'em_his_offentlighet_mobilisering_foreninger_partier_og_organisasjonssamfunn',
    'em_his_offentlighet_mobilisering_arbeider_kvinne_og_avholdsbevegelser',
  ],
  case_his_youngstorget: [
    'em_his_offentlighet_mobilisering_foreninger_partier_og_organisasjonssamfunn',
    'em_his_offentlighet_mobilisering_protest_kollektiv_handling_og_repertoarer',
    'em_his_offentlighet_mobilisering_arbeider_kvinne_og_avholdsbevegelser',
  ],
};

const caseById = new Map(A(profile.cases).map((item) => [item.case_id, item]));
const mappingByEmne = new Map(A(profile.emne_case_mappings).map((item) => [item.emne_id, item]));
const changes = [];

for (const [caseId, emneIds] of Object.entries(additions)) {
  const profileCase = caseById.get(caseId);
  if (!profileCase) throw new Error(`Missing profile case: ${caseId}`);
  const before = A(profileCase.emne_ids);
  profileCase.emne_ids = sorted([...before, ...emneIds]);
  changes.push({ case_id: caseId, added_case_emne_ids: emneIds.filter((id) => !before.includes(id)) });

  for (const emneId of emneIds) {
    const mapping = mappingByEmne.get(emneId);
    if (!mapping) throw new Error(`Missing emne_case_mapping: ${emneId}`);
    const mappingBefore = A(mapping.case_ids);
    mapping.case_ids = sorted([...mappingBefore, caseId]);
    mapping.case_requirement_ids = sorted([
      ...A(mapping.case_requirement_ids),
      'case_req_his_temporal_sequence',
      'case_req_his_actor_conflict',
      'case_req_his_source_comparison',
      'case_req_his_comparative_scale',
    ]);
  }
}

fs.writeFileSync(profilePath, `${JSON.stringify(profile, null, 2)}\n`);
console.log(JSON.stringify({ status: 'CORRECTED', cases: changes }, null, 2));
