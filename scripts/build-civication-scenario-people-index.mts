#!/usr/bin/env node
// Builds a canonical People <-> Civication scenario catalog from existing People,
// roleModels and strict theory bindings. The generator never invents person-place
// links and never upgrades a real person to a fictional NPC persona.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const HISTORY_PEOPLE = path.join(ROOT, "data", "Civication", "historyPeople_index.json");
const ROLE_MANIFEST = path.join(ROOT, "data", "Civication", "roleModels", "manifest.json");
const OVERRIDES = path.join(ROOT, "data", "Civication", "scenarioPeople", "overrides.json");
const GENERATED_DIR = path.join(ROOT, "data", "Civication", "scenarioPeople", "generated");
const INDEX_OUT = path.join(ROOT, "data", "Civication", "scenarioPeople_index.json");
const FAG_ROOT = path.join(ROOT, "data", "fag");
const CHECK_MODE = process.argv.includes("--check");

const FIT_ORDER = new Map([["direct", 0], ["strong", 1], ["contextual", 2]]);
const ROLE_MODIFIERS = new Set([
  "senior", "junior", "assistent", "medarbeider", "leder", "sjef", "direktor",
  "student", "aktiv", "etablert", "prisvinnende", "internasjonalt", "offentlig",
  "fast", "frilans", "forste", "andre", "fag", "felt", "rolle", "psykologi",
  "historie", "kunst", "litteratur", "media", "musikk", "naeringsliv", "natur",
  "politikk", "sport", "vitenskap", "filosofi", "film", "tv", "subkultur",
  "religion", "scenekunst", "sosial", "laering", "by", "teknologi"
]);

type Person = {
  id: string;
  name: string;
  category: string;
  desc?: string;
  placeId?: string;
  year?: number;
};

type Candidate = {
  id?: string;
  name: string;
  category: string;
  reason: string;
  source: string;
  scenario_roles: string[];
  verification_required: true;
};

type RoleOverride = {
  direct_person_ids?: string[];
  strong_person_ids?: string[];
  additional_person_ids?: string[];
  exclude?: Array<{ person_id: string; reason: string }>;
};

type Overrides = {
  roles?: Record<string, RoleOverride>;
  additional_missing_candidates?: Record<string, Array<Record<string, unknown>>>;
};

function readJSON<T = unknown>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function norm(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("nb-NO")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function slugNorm(value: unknown): string {
  return norm(value).replace(/\s+/g, "_");
}

function unique<T>(items: T[], key: (value: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const k = key(item);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function walkFiles(dir: string, predicate: (file: string) => boolean): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(abs, predicate));
    else if (entry.isFile() && predicate(abs)) out.push(abs);
  }
  return out.sort();
}

function flattenStrings(value: unknown): string[] {
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  if (Array.isArray(value)) return value.flatMap(flattenStrings);
  if (value && typeof value === "object") {
    const row = value as Record<string, unknown>;
    const candidate = String(row.person_id ?? row.id ?? row.name ?? "").trim();
    return candidate ? [candidate] : [];
  }
  return [];
}

function roleTokens(role: Record<string, unknown>): string[] {
  const raw = [role.role_scope, role.title]
    .flatMap((value) => norm(value).split(/\s+/))
    .filter((token) => token.length >= 4 && !ROLE_MODIFIERS.has(token));
  return [...new Set(raw)].sort();
}

function personText(person: Person): string {
  return norm(`${person.name} ${person.desc ?? ""}`);
}

function automaticFit(person: Person, tokens: string[]): { fit: "strong" | "contextual"; reason: string } {
  const text = personText(person);
  const matched = tokens.filter((token) => text.includes(token));
  if (matched.length) {
    return {
      fit: "strong",
      reason: `Automatisk teksttreff på rolleterm(er): ${matched.join(", ")}. Strong betyr scenariorelevans, ikke dokumentert identisk stilling.`
    };
  }
  return {
    fit: "contextual",
    reason: "Samme canonicale fagkategori; kontekstuell kunnskaps-/oppgavekandidat uten påstand om identisk yrkesrolle."
  };
}

function collectTheoryPeople(): Array<{ id?: string; name: string; category: string; source: string }> {
  const files = walkFiles(FAG_ROOT, (file) => /theory_integrity_bindings.*\.json$/i.test(path.basename(file)));
  const out: Array<{ id?: string; name: string; category: string; source: string }> = [];

  function visit(value: unknown, category: string, source: string): void {
    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, category, source));
      return;
    }
    if (!value || typeof value !== "object") return;
    const row = value as Record<string, unknown>;
    if (row.theorist && typeof row.theorist === "object") {
      const theorist = row.theorist as Record<string, unknown>;
      const name = String(theorist.name ?? "").trim();
      const id = String(theorist.id ?? "").trim();
      if (name) out.push({ id: id || undefined, name, category, source });
    }
    Object.values(row).forEach((item) => visit(item, category, source));
  }

  for (const file of files) {
    const rel = path.relative(ROOT, file).replaceAll(path.sep, "/");
    const relFromFag = path.relative(FAG_ROOT, file).split(path.sep);
    const category = relFromFag[0] || "";
    if (!category) continue;
    visit(readJSON(file), category, rel);
  }

  return unique(out, (row) => `${row.category}|${norm(row.name)}|${row.source}`);
}

function explicitRolePeople(role: Record<string, unknown>): string[] {
  const required = role.required_knowledge && typeof role.required_knowledge === "object"
    ? role.required_knowledge as Record<string, unknown>
    : {};
  return unique([
    ...flattenStrings(role.related_people),
    ...flattenStrings(required.people_connections)
  ], (value) => norm(value));
}

function candidateFromExtra(raw: Record<string, unknown>, category: string, roleIds: string[]): Candidate | null {
  const name = String(raw.name ?? "").trim();
  if (!name) return null;
  const roles = Array.isArray(raw.scenario_roles)
    ? raw.scenario_roles.map((value) => String(value)).filter((value) => roleIds.includes(value))
    : roleIds;
  return {
    id: String(raw.id ?? "").trim() || undefined,
    name,
    category,
    reason: String(raw.reason ?? "Kurert mangelkandidat").trim(),
    source: String(raw.source ?? "data/Civication/scenarioPeople/overrides.json").trim(),
    scenario_roles: roles,
    verification_required: true
  };
}

function stableJSON(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function build(): { files: Map<string, string>; index: string } {
  const peopleIndex = readJSON<{ person_count?: number; categories?: Record<string, Person[]> }>(HISTORY_PEOPLE);
  const peopleCategories = peopleIndex.categories ?? {};
  const allPeople = Object.values(peopleCategories).flat();
  const peopleById = new Map(allPeople.map((person) => [person.id, person]));
  const peopleByName = new Map(allPeople.map((person) => [norm(person.name), person]));
  const roleManifest = readJSON<{ files?: string[] }>(ROLE_MANIFEST);
  const overrides = readJSON<Overrides>(OVERRIDES);
  const theoryPeople = collectTheoryPeople();

  const roles = (roleManifest.files ?? []).map((rel) => {
    const data = readJSON<Record<string, unknown>>(path.join(ROOT, rel));
    return { rel, data };
  }).filter(({ data }) => String(data.role_id ?? "").trim() && String(data.category ?? "").trim());

  const rolesByCategory = new Map<string, Array<{ rel: string; data: Record<string, unknown> }>>();
  for (const role of roles) {
    const category = String(role.data.category).trim();
    const list = rolesByCategory.get(category) ?? [];
    list.push(role);
    rolesByCategory.set(category, list);
  }
  for (const list of rolesByCategory.values()) {
    list.sort((a, b) => String(a.data.role_id).localeCompare(String(b.data.role_id)));
  }

  const theoryByCategory = new Map<string, typeof theoryPeople>();
  for (const row of theoryPeople) {
    const list = theoryByCategory.get(row.category) ?? [];
    list.push(row);
    theoryByCategory.set(row.category, list);
  }

  const generated = new Map<string, string>();
  const categoryIndex: Record<string, unknown> = {};
  let assignmentCount = 0;
  let placeAssignmentCount = 0;
  let otherAssignmentCount = 0;
  let directCount = 0;
  let strongCount = 0;
  let contextualCount = 0;
  let missingCount = 0;
  let excludedCount = 0;

  for (const category of [...rolesByCategory.keys()].sort()) {
    const categoryRoles = rolesByCategory.get(category) ?? [];
    const categoryPeople = [...(peopleCategories[category] ?? [])].sort((a, b) => a.id.localeCompare(b.id));
    const roleIds = categoryRoles.map(({ data }) => String(data.role_id));
    const theoryRows = theoryByCategory.get(category) ?? [];

    const missingCandidates: Candidate[] = [];
    const crossCategoryExisting = new Map<string, Person>();

    for (const theory of theoryRows) {
      const existing = (theory.id ? peopleById.get(theory.id) : undefined) ?? peopleByName.get(norm(theory.name));
      if (existing) {
        if (existing.category !== category) crossCategoryExisting.set(existing.id, existing);
      } else {
        missingCandidates.push({
          id: theory.id,
          name: theory.name,
          category,
          reason: "Canonical person-bound theory/theorist finnes i strict theory-integrity-binding, men ikke i History Go People-indeksen.",
          source: theory.source,
          scenario_roles: roleIds,
          verification_required: true
        });
      }
    }

    for (const { data, rel } of categoryRoles) {
      for (const ref of explicitRolePeople(data)) {
        const existing = peopleById.get(ref) ?? peopleByName.get(norm(ref));
        if (existing) {
          if (existing.category !== category) crossCategoryExisting.set(existing.id, existing);
        } else {
          missingCandidates.push({
            id: slugNorm(ref),
            name: ref,
            category,
            reason: "Eksplisitt people-reference i roleModel finnes ikke i History Go People-indeksen.",
            source: rel,
            scenario_roles: [String(data.role_id)],
            verification_required: true
          });
        }
      }
    }

    for (const raw of overrides.additional_missing_candidates?.[category] ?? []) {
      const candidate = candidateFromExtra(raw, category, roleIds);
      if (!candidate) continue;
      const existing = (candidate.id ? peopleById.get(candidate.id) : undefined) ?? peopleByName.get(norm(candidate.name));
      if (!existing) missingCandidates.push(candidate);
    }

    const dedupedMissing = unique(missingCandidates, (row) => `${norm(row.name)}|${row.scenario_roles.sort().join(",")}`)
      .sort((a, b) => a.name.localeCompare(b.name));
    missingCount += dedupedMissing.length;

    const roleRows = categoryRoles.map(({ data, rel }) => {
      const roleId = String(data.role_id);
      const roleScope = String(data.role_scope ?? "");
      const title = String(data.title ?? roleScope);
      const tokens = roleTokens(data);
      const override = overrides.roles?.[roleId] ?? {};
      const directIds = new Set(override.direct_person_ids ?? []);
      const strongIds = new Set(override.strong_person_ids ?? []);
      const exclusionReason = new Map((override.exclude ?? []).map((row) => [row.person_id, row.reason]));

      const extras = (override.additional_person_ids ?? [])
        .map((id) => peopleById.get(id))
        .filter((person): person is Person => Boolean(person));
      const candidates = unique([...categoryPeople, ...crossCategoryExisting.values(), ...extras], (person) => person.id);

      const placePeople: Array<Record<string, unknown>> = [];
      const otherPeople: Array<Record<string, unknown>> = [];
      const excludedPeople: Array<Record<string, unknown>> = [];

      for (const person of candidates) {
        const exclusion = exclusionReason.get(person.id);
        if (exclusion) {
          excludedPeople.push({ person_id: person.id, name: person.name, reason: exclusion });
          excludedCount += 1;
          continue;
        }

        let fit: "direct" | "strong" | "contextual";
        let reason: string;
        if (directIds.has(person.id)) {
          fit = "direct";
          reason = "Eksplisitt kuratert som direkte rolleeksempel i scenarioPeople-overrides; dette er den eneste veien til direct-fit.";
        } else if (strongIds.has(person.id)) {
          fit = "strong";
          reason = "Eksplisitt kuratert som sterk scenariorelevans uten påstand om identisk stilling.";
        } else if (person.category !== category) {
          fit = "strong";
          reason = "Eksisterende People-person i annen kategori er eksplisitt relevant via canonical theory-/roleModel-reference; kategori eller profesjon omskrives ikke.";
        } else {
          ({ fit, reason } = automaticFit(person, tokens));
        }

        const entry: Record<string, unknown> = {
          person_id: person.id,
          name: person.name,
          fit,
          reason,
          person_category: person.category
        };
        if (person.placeId) entry.place_id = person.placeId;
        if (Number.isFinite(Number(person.year))) entry.year = Number(person.year);

        if (person.placeId) {
          placePeople.push(entry);
          placeAssignmentCount += 1;
        } else {
          otherPeople.push(entry);
          otherAssignmentCount += 1;
        }
        assignmentCount += 1;
        if (fit === "direct") directCount += 1;
        else if (fit === "strong") strongCount += 1;
        else contextualCount += 1;
      }

      const sortPeople = (a: Record<string, unknown>, b: Record<string, unknown>) => {
        const fitDelta = (FIT_ORDER.get(String(a.fit)) ?? 9) - (FIT_ORDER.get(String(b.fit)) ?? 9);
        if (fitDelta) return fitDelta;
        return String(a.person_id).localeCompare(String(b.person_id));
      };
      placePeople.sort(sortPeople);
      otherPeople.sort(sortPeople);
      excludedPeople.sort((a, b) => String(a.person_id).localeCompare(String(b.person_id)));

      return {
        role_id: roleId,
        role_scope: roleScope,
        title,
        source: rel,
        match_tokens: tokens,
        existing_place_people: placePeople,
        existing_other_people: otherPeople,
        excluded_people: excludedPeople
      };
    });

    const out = {
      schema: "civication_scenario_people_category_v1",
      version: 1,
      category,
      generated_by: "scripts/build-civication-scenario-people-index.mts",
      sources: [
        "data/Civication/historyPeople_index.json",
        "data/Civication/roleModels/manifest.json",
        "data/Civication/scenarioPeople/overrides.json",
        "data/fag/**/theory_integrity_bindings*.json"
      ],
      semantics: {
        direct: "Kun eksplisitt kuratert direkte rolleeksempel.",
        strong: "Sterk scenariorelevans; innebærer ikke nødvendigvis identisk yrkesrolle.",
        contextual: "Samme faglige kontekst; kunnskaps-/oppgavekandidat, ikke rollelikhet eller NPC-persona."
      },
      people_available_in_category: categoryPeople.length,
      cross_category_existing_references: [...crossCategoryExisting.values()].map((person) => ({
        person_id: person.id,
        name: person.name,
        person_category: person.category,
        place_id: person.placeId ?? null
      })).sort((a, b) => a.person_id.localeCompare(b.person_id)),
      missing_people_candidates: dedupedMissing,
      roles: roleRows
    };

    const relOut = `data/Civication/scenarioPeople/generated/${category}.json`;
    generated.set(relOut, stableJSON(out));
    categoryIndex[category] = {
      file: relOut,
      role_count: roleRows.length,
      people_available_in_category: categoryPeople.length,
      cross_category_existing_reference_count: crossCategoryExisting.size,
      missing_people_candidate_count: dedupedMissing.length,
      roles: roleIds
    };
  }

  const index = {
    schema: "civication_scenario_people_index_v1",
    version: 1,
    generated_by: "scripts/build-civication-scenario-people-index.mts",
    people_source: "data/Civication/historyPeople_index.json",
    role_models_source: "data/Civication/roleModels/manifest.json",
    overrides_source: "data/Civication/scenarioPeople/overrides.json",
    note: "GENERERT. Reelle personer er faktabaserte kunnskaps-/oppgavemål, ikke frie NPC-personaer.",
    summary: {
      history_people_count: Number(peopleIndex.person_count ?? allPeople.length),
      role_count: roles.length,
      category_count: rolesByCategory.size,
      assignment_count: assignmentCount,
      existing_place_assignment_count: placeAssignmentCount,
      existing_other_assignment_count: otherAssignmentCount,
      direct_assignment_count: directCount,
      strong_assignment_count: strongCount,
      contextual_assignment_count: contextualCount,
      missing_people_candidate_count: missingCount,
      excluded_assignment_count: excludedCount
    },
    categories: categoryIndex
  };

  return { files: generated, index: stableJSON(index) };
}

function writeOutputs(files: Map<string, string>, index: string): void {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
  const expected = new Set([...files.keys()].map((rel) => path.resolve(ROOT, rel)));
  for (const file of walkFiles(GENERATED_DIR, (candidate) => candidate.endsWith(".json"))) {
    if (!expected.has(path.resolve(file))) fs.unlinkSync(file);
  }
  for (const [rel, content] of files) {
    const abs = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, "utf8");
  }
  fs.writeFileSync(INDEX_OUT, index, "utf8");
}

function checkOutputs(files: Map<string, string>, index: string): void {
  const errors: string[] = [];
  for (const [rel, expected] of files) {
    const abs = path.join(ROOT, rel);
    const actual = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : "";
    if (actual !== expected) errors.push(`${rel} mangler eller er ute av sync`);
  }
  const actualIndex = fs.existsSync(INDEX_OUT) ? fs.readFileSync(INDEX_OUT, "utf8") : "";
  if (actualIndex !== index) errors.push("data/Civication/scenarioPeople_index.json mangler eller er ute av sync");

  const expectedGenerated = new Set([...files.keys()].map((rel) => path.resolve(ROOT, rel)));
  for (const file of walkFiles(GENERATED_DIR, (candidate) => candidate.endsWith(".json"))) {
    if (!expectedGenerated.has(path.resolve(file))) errors.push(`${path.relative(ROOT, file)} er foreldet generert fil`);
  }

  if (errors.length) {
    errors.forEach((error) => console.error(`FEIL: ${error}`));
    console.error("Kjør: node --experimental-strip-types scripts/build-civication-scenario-people-index.mts");
    process.exit(1);
  }
  console.log(`OK: scenarioPeople er i sync (${files.size} kategorier).`);
}

const built = build();
if (CHECK_MODE) checkOutputs(built.files, built.index);
else {
  writeOutputs(built.files, built.index);
  const parsed = JSON.parse(built.index) as { summary: Record<string, number> };
  console.log(`Skrev scenarioPeople for ${parsed.summary.role_count} roller / ${parsed.summary.category_count} kategorier / ${parsed.summary.history_people_count} People.`);
  console.log(`Assignments: ${parsed.summary.assignment_count}; missing candidates: ${parsed.summary.missing_people_candidate_count}.`);
}
