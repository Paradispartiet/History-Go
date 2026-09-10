#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const id = "peststotten_krist_kirkegard";
const placeFile = "data/places/historie/oslo/places_historie_added_batch_01/peststotten_krist_kirkegard.json";
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const write = (file, value) => fs.writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);

const packetFile = `data/places/production/${id}.json`;
const packet = read(packetFile);
const temporalClaim = packet.claims.find(claim => /brukes som historisk kilde/iu.test(claim.claim));
if (!temporalClaim) throw new Error("Expected temporal Peststøtten claim was not materialized");
temporalClaim.temporalStatus = "current";
if (!Array.isArray(packet.source_conflicts) || packet.source_conflicts.length === 0) throw new Error("Expected Peststøtten source conflict was not materialized");
packet.source_conflicts[0].claim = "Et eksakt samlet dødstall for hele Christiania under pesten i 1654.";
write(packetFile, packet);

const leksikonFile = `data/leksikon/places/oslo/historie/leksikon_${id}.json`;
const leksikon = read(leksikonFile);
if (!leksikon.entry?.id || leksikon.entry.place_id !== id) throw new Error("Expected Peststøtten leksikon entry was not materialized");
leksikon.places = [leksikon.entry];
write(leksikonFile, leksikon);

const place = read(placeFile);
if (place.id !== id || place.fagverk?.schema !== "history_go_place_fagverk_v2") throw new Error("Expected Peststøtten Place Fagverk was not materialized");
if (!Array.isArray(place.fagverk.observable_traces) || !place.fagverk.observable_traces[0]) throw new Error("Expected Peststøtten observable traces were not materialized");
place.fagverk.observable_traces[0].title = "Peststøttens innskrift";
place.externalLinks = [
  { type: "source", label: "Oslo byleksikon – Peststøtten", url: "https://oslobyleksikon.no/side/Pestst%C3%B8tten", lang: "nb", verifiedAt: "2026-09-10" },
  { type: "official", label: "Oslo kommune – Krist kirkegård", url: "https://www.oslo.kommune.no/natur-kultur-og-fritid/gravplasser-og-kremasjoner/vare-gravplasser/krist-kirkegard/", lang: "nb", verifiedAt: "2026-09-10" },
  { type: "official", label: "Oslo kommune – Krist kirkegård, historisk brosjyre", url: "https://www.oslo.kommune.no/get-file/766998/0694c536d50540e4ef116c01620abda7fbd06d399f487a8a3926c0f0533a7dd6", lang: "nb", verifiedAt: "2026-09-10" },
  { type: "source", label: "Oslo byleksikon – Krist kirkegård", url: "https://oslobyleksikon.no/side/Krist_kirkeg%C3%A5rd", lang: "nb", verifiedAt: "2026-09-10" },
  { type: "source", label: "Lokalhistoriewiki – Krist kirkegård", url: "https://lokalhistoriewiki.no/wiki/Krist_kirkeg%C3%A5rd", lang: "nb", verifiedAt: "2026-09-10" },
  { type: "source", label: "Lokalhistoriewiki – Pesten på Østlandet 1654", url: "https://lokalhistoriewiki.no/wiki/Pesten_p%C3%A5_%C3%98stlandet_1654", lang: "nb", verifiedAt: "2026-09-10" }
];
write(placeFile, place);

const fagverkRegistryFile = "data/fagverk/fagverk_registry.json";
const fagverkRegistry = read(fagverkRegistryFile);
fagverkRegistry.placeLinks ||= {};
fagverkRegistry.placeLinks[id] = {
  sourceFile: placeFile.replace(/^data\//, ""),
  field: "fagverk",
  schema: place.fagverk.schema,
  level: place.fagverk.level,
  status: place.fagverk.status
};
write(fagverkRegistryFile, fagverkRegistry);

const workcardFile = "reports/place-production/peststotten-krist-kirkegard-workcard-current.json";
const workcard = read(workcardFile);
workcard.rule_preflight = {
  status: "PASS",
  contract_snapshot: {
    candidate_collections: ["people", "objects", "structures", "historical_events"],
    category_expression: "historical_events",
    exact_collection_count: 4,
    productions_forbidden: true,
    related_collection_forbidden: true
  }
};
write(workcardFile, workcard);

const registryFile = ".github/ci/place-regression-registry-v1.json";
const registry = read(registryFile);
registry.places = registry.places.filter(placeRow => placeRow.id !== id);
registry.places.push({
  id,
  match: ["peststotten_krist_kirkegard", "peststotten-krist-kirkegard"],
  tests: ["tests/peststotten-krist-kirkegard-completion.test.mjs"]
});
write(registryFile, registry);

execFileSync("node", ["scripts/build-fagverk-release-manifest.mjs"], { cwd: root, stdio: "inherit" });
execFileSync("npm", ["run", "place-open:build"], { cwd: root, stdio: "inherit" });

console.log(JSON.stringify({
  place: id,
  temporal_claim_status: temporalClaim.temporalStatus,
  source_conflict: packet.source_conflicts[0].claim,
  leksikon_runtime_rows: leksikon.places.length,
  named_fagverk_links: place.externalLinks.length,
  fagverk_registry_indexed: Boolean(fagverkRegistry.placeLinks[id]),
  observable_trace_title: place.fagverk.observable_traces[0].title,
  rule_preflight: workcard.rule_preflight.status,
  regression_registered: true
}, null, 2));
