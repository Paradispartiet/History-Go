#!/usr/bin/env node
import fs from "node:fs";

const file = "data/fag/naeringsliv/naeringslivpensum_canonical_v4_5.json";
const pensum = JSON.parse(fs.readFileSync(file, "utf8"));
const domainId = "teknologi_innovasjon_plattform";
const domain = pensum.domains.find(item => item.domain_id === domainId);
if (!domain) throw new Error(`Mangler domene ${domainId}`);

Object.assign(domain, {
  curation_status: "individually_curated",
  curation_batch: "naeringsliv_teknologi_innovasjon_v1",
  curation_date: "2026-07-25",
  curated_emne_count: 7,
  generic_template_fields_remaining: false
});

pensum.summary = {
  ...pensum.summary,
  individually_curated_core_emne_count: 30,
  remaining_core_emne_count: 6
};

pensum.content_curation = {
  ...(pensum.content_curation || {}),
  status: "in_progress",
  current_version: "naeringsliv_individual_curation_v1",
  curated_domain_ids: [
    "arbeid_produksjon_verdiskaping",
    "kapital_eierskap_finans",
    "handel_forbruk_marked",
    "teknologi_innovasjon_plattform"
  ],
  curated_core_emne_count: 30,
  remaining_core_emne_count: 6,
  rule: "Et emne regnes som individuelt kuratert først når definisjon, betydning, nøkkelspørsmål, konflikter, ideologiske dimensjoner, analyseakser, blindsoner, generatorveiledning og anti-patterns er skrevet for emnets egen faglige logikk."
};

fs.writeFileSync(file, `${JSON.stringify(pensum, null, 2)}\n`);
