import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runtimeSourceRank, stableStringify } from "./build-civication-scene-registry.mjs";

const SCOPES = [
  "kunst_konservering_og_samling", "kunst_kunstnerisk_ledelse", "kunst_kuratering_og_program",
  "kunst_museumsledelse", "kunst_publikum_og_formidling", "kunst_utstillingsproduksjon"
];
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const text = value => typeof value === "string" && value.trim().length > 0;
function uniqueById(rows, label) {
  assert(Array.isArray(rows), `${label}: array required`);
  const map = new Map();
  for (const row of rows) {
    assert(text(row?.id) && !map.has(row.id), `${label}: missing/duplicate id`);
    map.set(row.id, row);
  }
  return map;
}
function jsonFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? jsonFiles(file) : entry.name.endsWith(".json") ? [file] : [];
  }).sort();
}

export function auditHistoryPeopleRelevance(repoRoot, options = {}) {
  const registry = options.registry || read(path.join(repoRoot, "data/Civication/historyPeople_relevance_v1.json"));
  const index = options.peopleIndex || read(path.join(repoRoot, "data/Civication/historyPeople_index.json"));
  assert.equal(registry.schema, "civication_history_people_relevance_v1");
  assert.equal(registry.version, 1);
  assert(Array.isArray(registry.scope));
  assert.deepEqual(registry.scope.map(row => `${row.category}/${row.role_scope}`).sort(), SCOPES.map(scope => `kunst/${scope}`));
  const persons = uniqueById(Object.values(index.categories).flat(), "person index");
  const sources = uniqueById(registry.sources, "sources");
  for (const source of sources.values()) {
    assert(text(source.title) && text(source.accessed_at), `source ${source.id}: metadata required`);
    const url = new URL(source.url);
    assert.equal(url.protocol, "https:");
    assert(!url.username && !url.password);
  }
  const cases = uniqueById(registry.cases, "cases");
  for (const item of cases.values()) {
    assert.equal(persons.get(item.person_id)?.category, "kunst", `case ${item.id}: unknown/wrong-category person`);
    assert(text(item.verified_claim) && text(item.application_limit), `case ${item.id}: claim/limit required`);
    assert(Array.isArray(item.source_ids) && item.source_ids.length);
    assert.equal(new Set(item.source_ids).size, item.source_ids.length);
    for (const source of item.source_ids) assert(sources.has(source), `case ${item.id}: unknown source ${source}`);
  }
  const mails = new Map();
  for (const file of jsonFiles(path.join(repoRoot, "data/Civication/mailFamilies/kunst"))) {
    const sourcePath = path.relative(repoRoot, file).split(path.sep).join("/");
    const catalog = read(file);
    if (catalog.category !== "kunst" || !SCOPES.includes(catalog.role_scope) || runtimeSourceRank(sourcePath, catalog) === null) continue;
    for (const family of catalog.families) for (const mail of family.mails || []) {
      assert(!mails.has(mail.id), `duplicate source mail ${mail.id}`);
      mails.set(mail.id, {
        ...mail, category: mail.category || catalog.category, role_scope: mail.role_scope || catalog.role_scope,
        source_path: sourcePath,
        source_hash: createHash("sha256").update(stableStringify(mail)).digest("hex")
      });
    }
  }
  const bindings = uniqueById(registry.bindings?.map(row => ({ ...row, id: `${row.category}/${row.role_scope}/${row.mail_id}` })), "bindings");
  assert.equal(bindings.size, mails.size, "scope coverage differs from runtime sources");
  const usedMailIds = new Set(), usedCases = new Set(), usedPersons = new Set();
  let linked = 0;
  for (const binding of bindings.values()) {
    const mail = mails.get(binding.mail_id);
    assert(mail && !usedMailIds.has(binding.mail_id), `unknown/duplicate mail ${binding.mail_id}`);
    usedMailIds.add(binding.mail_id);
    for (const key of ["category", "role_scope", "task_domain", "place_id", "people_ref", "source_path", "source_hash"]) {
      assert.equal(binding[key], mail[key], `${binding.mail_id}: ${key} changed; relevance must be reviewed`);
    }
    const model = read(path.join(repoRoot, `data/Civication/roleModels/kunst/${binding.role_scope}.json`));
    assert(model.related_people.some(row => row.id === binding.people_ref), `unknown scenario actor ${binding.people_ref}`);
    assert(model.related_places.some(row => row.id === binding.place_id), `unknown workplace ${binding.place_id}`);
    assert(text(binding.review_note), `${binding.mail_id}: review note required`);
    assert(Array.isArray(binding.people));
    assert.equal(new Set(binding.people.map(row => row.person_id)).size, binding.people.length, `${binding.mail_id}: duplicate person`);
    assert.equal(binding.review_status, binding.people.length ? "linked" : "no_supported_link");
    if (binding.people.length) linked++;
    for (const person of binding.people) {
      assert.equal(persons.get(person.person_id)?.category, "kunst", `unknown/wrong-category person ${person.person_id}`);
      assert(text(person.reason) && text(person.question), `${binding.mail_id}: reason/question required`);
      assert(Array.isArray(person.case_ids) && person.case_ids.length);
      assert.equal(new Set(person.case_ids).size, person.case_ids.length);
      for (const id of person.case_ids) {
        assert.equal(cases.get(id)?.person_id, person.person_id, `${binding.mail_id}: unknown/mismatched case ${id}`);
        usedCases.add(id);
      }
      usedPersons.add(person.person_id);
    }
  }
  assert.equal(usedMailIds.size, mails.size);
  assert.equal(usedCases.size, cases.size, "unused historical case");
  return { roles: SCOPES.length, mails: mails.size, linked, empty: mails.size - linked, persons: usedPersons.size, cases: cases.size, sources: sources.size };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(JSON.stringify(auditHistoryPeopleRelevance(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."))));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
