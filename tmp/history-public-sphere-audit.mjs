import fs from 'node:fs';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const A = (v) => Array.isArray(v) ? v : [];
const uniq = (v) => [...new Set(v)];
const sorted = (v) => uniq(v).sort((a,b)=>String(a).localeCompare(String(b),'nb'));

const claimsFile = read('data/fag/historie/claims_historie_canonical_v1.json');
const sourcesFile = read('data/fag/historie/sources_historie_canonical_v1.json');
const evidenceFile = read('data/fag/historie/place_evidence_historie_v1.json');
const registry = read('data/fag/historie/theory_evidence_historie_canonical_v1.json');
const contract = read('data/fag/historie/theory_evidence_historie_contract_v1.json');

const claims = A(claimsFile.claims);
const sourceById = new Map(A(sourcesFile.sources).map(x=>[x.source_id,x]));
const evidenceByClaim = new Map();
for (const e of A(evidenceFile.evidence_links)) {
  const arr = evidenceByClaim.get(e.claim_id) || [];
  arr.push(e);
  evidenceByClaim.set(e.claim_id, arr);
}
const existingBundles = new Set(A(registry.entries).map(e=>sorted(e.claim_ids).join('|')));
const t = contract.qualification_thresholds || {};

const targets = [
  ['theory_his_offentlighet_mobilisering_presse_offentlighet_og_politisk_kommunikasjon','em_his_offentlighet_mobilisering_presse_offentlighet_og_politisk_kommunikasjon'],
  ['theory_his_offentlighet_mobilisering_foreninger_partier_og_organisasjonssamfunn','em_his_offentlighet_mobilisering_foreninger_partier_og_organisasjonssamfunn'],
  ['theory_his_offentlighet_mobilisering_borgerrettigheter_solidaritet_og_internasjonalisme','em_his_offentlighet_mobilisering_borgerrettigheter_solidaritet_og_internasjonalisme'],
  ['theory_his_offentlighet_mobilisering_lekmanns_sprak_og_motkulturelle_bevegelser','em_his_offentlighet_mobilisering_lekmanns_sprak_og_motkulturelle_bevegelser'],
  ['theory_his_offentlighet_mobilisering_digitale_offentligheter_nettverk_og_nye_mobiliseringsformer','em_his_offentlighet_mobilisering_digitale_offentligheter_nettverk_og_nye_mobiliseringsformer'],
  ['theory_his_offentlighet_mobilisering_digital_mobilisering_overvakning_og_motmakt','em_his_offentlighet_mobilisering_digital_mobilisering_overvakning_og_motmakt'],
];

function claimOk(c) {
  const ev = A(evidenceByClaim.get(c.claim_id)).filter(e=>['validated_case','validated_pilot'].includes(e.validation_status));
  const sources = A(c.source_ids).map(id=>sourceById.get(id)).filter(Boolean);
  return ev.length > 0 && sources.length === A(c.source_ids).length && sources.every(s=>A(s.limitations).length >= (t.minimum_source_limitations ?? 1) && s.provenance?.repository_source);
}

function metrics(bundle) {
  const src = sorted(bundle.flatMap(c=>A(c.source_ids)));
  const cases = sorted(bundle.flatMap(c=>A(c.scope?.case_ids)));
  const places = sorted(bundle.flatMap(c=>A(c.scope?.place_ids)));
  const types = sorted(bundle.map(c=>c.claim_type).filter(Boolean));
  const times = sorted(bundle.flatMap(c=>[c.scope?.temporal?.from,c.scope?.temporal?.to].filter(v=>v!==null&&v!==undefined).map(String)));
  const evid = sorted(bundle.flatMap(c=>A(evidenceByClaim.get(c.claim_id)).map(e=>e.evidence_id).filter(Boolean)));
  return {claims:bundle.length,sources:src.length,cases:cases.length,places:places.length,claim_types:types.length,temporal_anchors:times.length,evidence_links:evid.length,source_ids:src,case_ids:cases,place_ids:places,evidence_link_ids:evid};
}
function qualifies(m) {
  return m.claims >= (t.minimum_claims ?? 3) && m.sources >= (t.minimum_sources ?? 2) && m.cases >= (t.minimum_cases ?? 2) && m.places >= (t.minimum_places ?? 2) && m.claim_types >= (t.minimum_claim_types ?? 2) && m.temporal_anchors >= (t.minimum_temporal_anchors ?? 2);
}
function combos(arr,k,start=0,prefix=[],out=[]) {
  if (prefix.length===k) { out.push(prefix); return out; }
  for (let i=start;i<=arr.length-(k-prefix.length);i++) combos(arr,k,i+1,[...prefix,arr[i]],out);
  return out;
}

const result = {};
for (const [theoryId, emneId] of targets) {
  const candidates = claims.filter(c=>A(c.emne_ids).includes(emneId));
  const valid = candidates.filter(claimOk);
  const bundles=[];
  const maxK=Math.min(6,valid.length);
  for (let k=Math.max(3,t.minimum_claims??3);k<=maxK;k++) {
    for (const b of combos(valid,k)) {
      const key=sorted(b.map(c=>c.claim_id)).join('|');
      const m=metrics(b);
      if (qualifies(m) && !existingBundles.has(key)) bundles.push({claim_ids:sorted(b.map(c=>c.claim_id)),...m});
    }
    if (bundles.length) break;
  }
  bundles.sort((a,b)=> b.cases-a.cases || b.sources-a.sources || b.temporal_anchors-a.temporal_anchors || a.claim_ids.join('|').localeCompare(b.claim_ids.join('|')));
  result[theoryId]={
    emne_id:emneId,
    candidate_count:candidates.length,
    valid_candidate_count:valid.length,
    candidates:candidates.map(c=>({claim_id:c.claim_id,claim_type:c.claim_type,cases:A(c.scope?.case_ids),places:A(c.scope?.place_ids),sources:A(c.source_ids),temporal:c.scope?.temporal,valid:claimOk(c),statement:c.statement})),
    qualifying_bundles:bundles.slice(0,12),
  };
}
console.log(JSON.stringify({thresholds:t,existing_entries:A(registry.entries).length,targets:result},null,2));
