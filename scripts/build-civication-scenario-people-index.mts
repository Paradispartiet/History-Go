#!/usr/bin/env node
// Canonical People <-> Civication scenario catalog.
// Complete coverage is stored compactly: one People pool per category plus
// role-specific fit/exclusion deltas. This avoids duplicating the same People
// record once per role while preserving a deterministic full resolved list.

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

type PersonPoolEntry = {
  person_id: string;
  name: string;
  person_category: string;
  place_id?: string;
  year?: number;
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

type TheoryPerson = { id?: string; name: string; category: string; source: string };
type MissingAggregate = {
  id?: string;
  name: string;
  category: string;
  reasons: Set<string>;
  sources: Set<string>;
  scenarioRoles: Set<string>;
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
    if (row.fictional === true) return [];
    const candidate = String(row.person_id ?? row.id ?? row.name ?? "").trim();
    return candidate ? [candidate] : [];
  }
  return [];
}

function roleTokens(role: Record<string, unknown>): string[] {
  return [...new Set([role.role_scope, role.title]
    .flatMap((value) => norm(value).split(/\s+/))
    .filter((token) => token.length >= 4 && !ROLE_MODIFIERS.has(token)))].sort();
}

function personText(person: Person): string {
  return norm(`${person.name} ${person.desc ?? ""}`);
}

function automaticStrong(person: Person, tokens: string[]): boolean {
  const text = personText(person);
  return tokens.some((token) => text.includes(token));
}

function collectTheoryPeople(): TheoryPerson[] {
  const files = walkFiles(FAG_ROOT, (file) => /theory_integrity_bindings.*\.json$/i.test(path.basename(file)));
  const out: TheoryPerson[] = [];

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
    const category = path.relative(FAG_ROOT, file).split(path.sep)[0] || "";
    if (category) visit(readJSON(file), category, rel);
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

function personPoolEntry(person: Person): PersonPoolEntry {
  const out: PersonPoolEntry = {
    person_id: person.id,
    name: person.name,
    person_category: person.category
  };
  if (person.placeId) out.place_id = person.placeId;
  if (Number.isFinite(Number(person.year))) out.year = Number(person.year);
  return out;
}

function addMissing(
  map: Map<string, MissingAggregate>,
  row: { id?: string; name: string; category: string; reason: string; source: string; roles: string[] }
): void {
  const key = `${row.category}|${row.id ? `id:${row.id}` : `name:${norm(row.name)}`}`;
  const current = map.get(key) ?? {
    id: row.id,
    name: row.name,
    category: row.category,
    reasons: new Set<string>(),
    sources: new Set<string>(),
    scenarioRoles: new Set<string>()
  };
  current.reasons.add(row.reason);
  current.sources.add(row.source);
  row.roles.forEach((role) => current.scenarioRoles.add(role));
  map.set(key, current);
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

  const rawRoles = (roleManifest.files ?? []).map((rel) => ({
    rel,
    data: readJSON<Record<string, unknown>>(path.join(ROOT, rel))
  })).filter(({ data }) => String(data.role_id ?? "").trim() && String(data.category ?? "").trim());

  // A few legacy manifest entries resolve to the same canonical role_id.
  // Keep the first manifest occurrence deterministically and expose shadows in the index.
  const roleById = new Map<string, { rel: string; data: Record<string, unknown> }>();
  const shadowedRoleModels: Array<{ role_id: string; kept: string; shadowed: string }> = [];
  for (const role of rawRoles) {
    const roleId = String(role.data.role_id);
    const kept = roleById.get(roleId);
    if (kept) {
      shadowedRoleModels.push({ role_id: roleId, kept: kept.rel, shadowed: role.rel });
      continue;
    }
    roleById.set(roleId, role);
  }
  const roles = [...roleById.values()];

  const rolesByCategory = new Map<string, typeof roles>();
  for (const role of roles) {
    const category = String(role.data.category).trim();
    const list = rolesByCategory.get(category) ?? [];
    list.push(role);
    rolesByCategory.set(category, list);
  }
  for (const list of rolesByCategory.values()) list.sort((a, b) => String(a.data.role_id).localeCompare(String(b.data.role_id)));

  const theoryByCategory = new Map<string, TheoryPerson[]>();
  for (const row of theoryPeople) {
    const list = theoryByCategory.get(row.category) ?? [];
    list.push(row);
    theoryByCategory.set(row.category, list);
  }

  const generated = new Map<string, string>();
  const categoryIndex: Record<string, unknown> = {};
  let resolvedAssignments = 0;
  let resolvedDirect = 0;
  let resolvedStrong = 0;
  let resolvedContextual = 0;
  let resolvedPlace = 0;
  let resolvedOther = 0;
  let missingCount = 0;
  let excludedCount = 0;

  for (const category of [...rolesByCategory.keys()].sort()) {
    const categoryRoles = rolesByCategory.get(category) ?? [];
    const categoryPeople = [...(peopleCategories[category] ?? [])].sort((a, b) => a.id.localeCompare(b.id));
    const categoryPeopleIds = new Set(categoryPeople.map((person) => person.id));
    const roleIds = categoryRoles.map(({ data }) => String(data.role_id));
    const missing = new Map<string, MissingAggregate>();
    const inheritedCrossCategory = new Map<string, Person>();

    for (const theory of theoryByCategory.get(category) ?? []) {
      const existing = (theory.id ? peopleById.get(theory.id) : undefined) ?? peopleByName.get(norm(theory.name));
      if (existing) {
        if (existing.category !== category) inheritedCrossCategory.set(existing.id, existing);
      } else {
        addMissing(missing, {
          id: theory.id,
          name: theory.name,
          category,
          reason: "Canonical person-bound theory/theorist finnes i strict theory-integrity-binding, men ikke i History Go People-indeksen.",
          source: theory.source,
          roles: roleIds
        });
      }
    }

    const roleRows = categoryRoles.map(({ data, rel }) => {
      const roleId = String(data.role_id);
      const roleScope = String(data.role_scope ?? "");
      const title = String(data.title ?? roleScope);
      const tokens = roleTokens(data);
      const override = overrides.roles?.[roleId] ?? {};
      const exclusionReason = new Map((override.exclude ?? []).map((row) => [row.person_id, row.reason]));
      const additional = new Map<string, Person>();

      for (const ref of explicitRolePeople(data)) {
        const existing = peopleById.get(ref) ?? peopleByName.get(norm(ref));
        if (existing) {
          if (!categoryPeopleIds.has(existing.id) && !inheritedCrossCategory.has(existing.id)) additional.set(existing.id, existing);
        } else {
          addMissing(missing, {
            id: slugNorm(ref),
            name: ref,
            category,
            reason: "Eksplisitt people-reference i roleModel finnes ikke i History Go People-indeksen.",
            source: rel,
            roles: [roleId]
          });
        }
      }

      for (const id of override.additional_person_ids ?? []) {
        const person = peopleById.get(id);
        if (person && !categoryPeopleIds.has(person.id) && !inheritedCrossCategory.has(person.id)) additional.set(person.id, person);
      }

      const direct = new Set((override.direct_person_ids ?? []).filter((id) => peopleById.has(id) && !exclusionReason.has(id)));
      const strong = new Set((override.strong_person_ids ?? []).filter((id) => peopleById.has(id) && !direct.has(id) && !exclusionReason.has(id)));
      for (const person of categoryPeople) {
        if (!direct.has(person.id) && !exclusionReason.has(person.id) && automaticStrong(person, tokens)) strong.add(person.id);
      }
      for (const person of inheritedCrossCategory.values()) {
        if (!direct.has(person.id) && !exclusionReason.has(person.id)) strong.add(person.id);
      }
      for (const person of additional.values()) {
        if (!direct.has(person.id) && !exclusionReason.has(person.id)) strong.add(person.id);
      }

      const excluded = [...exclusionReason.entries()]
        .filter(([id]) => peopleById.has(id))
        .map(([personId, reason]) => ({ person_id: personId, name: peopleById.get(personId)?.name ?? personId, reason }))
        .sort((a, b) => a.person_id.localeCompare(b.person_id));
      excludedCount += excluded.length;

      const resolved = new Map<string, Person>();
      categoryPeople.forEach((person) => resolved.set(person.id, person));
      inheritedCrossCategory.forEach((person) => resolved.set(person.id, person));
      additional.forEach((person) => resolved.set(person.id, person));
      for (const id of exclusionReason.keys()) resolved.delete(id);

      let directCount = 0;
      let strongCount = 0;
      let contextualCount = 0;
      let placeCount = 0;
      let otherCount = 0;
      for (const person of resolved.values()) {
        if (direct.has(person.id)) directCount += 1;
        else if (strong.has(person.id)) strongCount += 1;
        else contextualCount += 1;
        if (person.placeId) placeCount += 1;
        else otherCount += 1;
      }
      resolvedAssignments += resolved.size;
      resolvedDirect += directCount;
      resolvedStrong += strongCount;
      resolvedContextual += contextualCount;
      resolvedPlace += placeCount;
      resolvedOther += otherCount;

      return {
        role_id: roleId,
        role_scope: roleScope,
        title,
        source: rel,
        resolution: {
          base_pool: "people_pool",
          base_fit: "contextual",
          inherited_cross_category_pool: "cross_category_existing_references",
          inherited_cross_category_fit: "strong",
          direct_person_ids: [...direct].sort(),
          strong_person_ids: [...strong].sort(),
          additional_existing_people: [...additional.values()].map(personPoolEntry).sort((a, b) => String(a.person_id).localeCompare(String(b.person_id))),
          excluded_people: excluded
        },
        automatic_match_tokens: tokens,
        resolved_counts: {
          total: resolved.size,
          existing_place_people: placeCount,
          existing_other_people: otherCount,
          direct: directCount,
          strong: strongCount,
          contextual: contextualCount,
          excluded: excluded.length
        }
      };
    });

    for (const raw of overrides.additional_missing_candidates?.[category] ?? []) {
      const name = String(raw.name ?? "").trim();
      if (!name) continue;
      const id = String(raw.id ?? "").trim() || undefined;
      const existing = (id ? peopleById.get(id) : undefined) ?? peopleByName.get(norm(name));
      if (existing) continue;
      const requestedRoles = Array.isArray(raw.scenario_roles)
        ? raw.scenario_roles.map(String).filter((role) => roleIds.includes(role))
        : roleIds;
      addMissing(missing, {
        id,
        name,
        category,
        reason: String(raw.reason ?? "Kurert mangelkandidat").trim(),
        source: String(raw.source ?? "data/Civication/scenarioPeople/overrides.json").trim(),
        roles: requestedRoles
      });
    }

    const missingRows = [...missing.values()].map((row) => ({
      ...(row.id ? { id: row.id } : {}),
      name: row.name,
      category: row.category,
      reasons: [...row.reasons].sort(),
      sources: [...row.sources].sort(),
      scenario_roles: [...row.scenarioRoles].sort(),
      verification_required: true
    })).sort((a, b) => a.name.localeCompare(b.name));
    missingCount += missingRows.length;

    const placePool = categoryPeople.filter((person) => Boolean(person.placeId)).map(personPoolEntry);
    const otherPool = categoryPeople.filter((person) => !person.placeId).map(personPoolEntry);
    const crossPool = [...inheritedCrossCategory.values()].map((person) => ({
      ...personPoolEntry(person),
      fit: "strong",
      reason: "Eksisterende People-person i annen kategori er canonicalt relevant via theory-binding; kategori/profesjon og placeId beholdes uendret."
    })).sort((a, b) => String(a.person_id).localeCompare(String(b.person_id)));

    const out = {
      schema: "civication_scenario_people_category_v2",
      version: 2,
      category,
      generated_by: "scripts/build-civication-scenario-people-index.mts",
      storage_model: "category_pool_plus_role_deltas",
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
      people_pool: {
        existing_place_people: placePool,
        existing_other_people: otherPool
      },
      cross_category_existing_references: crossPool,
      missing_people_candidates: missingRows,
      roles: roleRows
    };

    const relOut = `data/Civication/scenarioPeople/generated/${category}.json`;
    generated.set(relOut, stableJSON(out));
    categoryIndex[category] = {
      file: relOut,
      role_count: roleRows.length,
      people_pool_count: categoryPeople.length,
      existing_place_people_count: placePool.length,
      existing_other_people_count: otherPool.length,
      cross_category_existing_reference_count: crossPool.length,
      missing_people_candidate_count: missingRows.length,
      roles: roleIds
    };
  }

  const index = {
    schema: "civication_scenario_people_index_v2",
    version: 2,
    generated_by: "scripts/build-civication-scenario-people-index.mts",
    people_source: "data/Civication/historyPeople_index.json",
    role_models_source: "data/Civication/roleModels/manifest.json",
    overrides_source: "data/Civication/scenarioPeople/overrides.json",
    storage_model: "category_pool_plus_role_deltas",
    note: "GENERERT. Reelle personer er faktabaserte kunnskaps-/oppgavemål, ikke frie NPC-personaer.",
    summary: {
      history_people_count: Number(peopleIndex.person_count ?? allPeople.length),
      role_model_file_count: rawRoles.length,
      canonical_role_count: roles.length,
      shadowed_role_model_count: shadowedRoleModels.length,
      category_count: rolesByCategory.size,
      resolved_assignment_count: resolvedAssignments,
      resolved_existing_place_assignment_count: resolvedPlace,
      resolved_existing_other_assignment_count: resolvedOther,
      resolved_direct_assignment_count: resolvedDirect,
      resolved_strong_assignment_count: resolvedStrong,
      resolved_contextual_assignment_count: resolvedContextual,
      missing_people_candidate_count: missingCount,
      excluded_assignment_count: excludedCount
    },
    shadowed_role_models: shadowedRoleModels,
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
  console.log(`Skrev scenarioPeople for ${parsed.summary.canonical_role_count} canonicale roller / ${parsed.summary.category_count} kategorier / ${parsed.summary.history_people_count} People.`);
  console.log(`Resolved assignments: ${parsed.summary.resolved_assignment_count}; missing candidates: ${parsed.summary.missing_people_candidate_count}.`);
}
