from pathlib import Path
import json

root = Path('.')


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one match, got {count}')
    return text.replace(old, new, 1)


def replace_between(text, start_marker, end_marker, replacement, label):
    start = text.find(start_marker)
    if start < 0:
        raise SystemExit(f'{label}: start marker not found')
    end = text.find(end_marker, start)
    if end < 0:
        raise SystemExit(f'{label}: end marker not found')
    return text[:start] + replacement + text[end:]


# 1) Core EventEngine: runtime candidates are the only work gameplay pool.
core_path = root / 'js/Civication/core/civicationEventEngine.js'
core = core_path.read_text()

core_build = '''async buildMailPool(active, state, role_key) {
  const runtimeMails =
    await window.CivicationMailRuntime?.makeCandidateMailsForActiveRole?.(
      active,
      state
    ) || [];

  const taggedRuntimeMails = runtimeMails.map((m) => ({
    ...m,
    source_type: m?.source_type || "planned"
  }));

  return {
    role: active?.career_id || null,
    tag_rules: {
      max_tags_per_choice: 2,
      memory_window: 12
    },
    tracks: [],
    mails: taggedRuntimeMails,
    __civication_mail_runtime: true,
    __legacy_fallback: false,
    __runtime_candidate_count: taggedRuntimeMails.length,
    __no_runtime_candidates: taggedRuntimeMails.length === 0
  };
}
  
'''
core = replace_between(
    core,
    'async buildMailPool(active, state, role_key) {',
    '  // -------- event selection --------',
    core_build,
    'core buildMailPool'
)

# Remove synthetic generic career gameplay. Missing canonical content is no-op.
generic_start = '  buildGenericChoices(stage) {'
generic_end = '  decorateWorkMail(eventObj, active, reason) {'
generic_idx = core.find(generic_start)
if generic_idx < 0:
    raise SystemExit('core generic fallback start not found')
decorate_idx = core.find(generic_end, generic_idx)
if decorate_idx < 0:
    raise SystemExit('core decorateWorkMail marker not found')
core = core[:generic_idx] + core[decorate_idx:]

old_on_open_missing = '''if (!pack || !Array.isArray(pack.mails) || !pack.mails.length) {
  const generic = this.makeGenericCareerEvent(
    active,
    state,
    force ? "job_accepted" : "missing_pack"
  );

  const decorated = this.decorateWorkMail(
    generic,
    active,
    force ? "job_accepted" : "missing_pack"
  );

  this.enqueueEvent(decorated);

  if (!force) {
    this.markPulseUsed();
  }

  return {
    enqueued: true,
    type: "generic",
    reason: "missing_pack",
    event: decorated
  };
}'''
new_on_open_missing = '''if (!pack || !Array.isArray(pack.mails) || !pack.mails.length) {
  if (!force) {
    this.markPulseUsed();
  }
  return {
    enqueued: false,
    type: "none",
    reason: pack?.__scene_director_error === true
      ? "scene_director_error"
      : "no_runtime_candidates"
  };
}'''
core = replace_once(core, old_on_open_missing, new_on_open_missing, 'onAppOpen empty pool')

old_on_open_chosen = '''if (!chosen) {
  const generic = this.makeGenericCareerEvent(
    active,
    state,
    force ? "job_accepted" : "no_candidates"
  );

  const decorated = this.decorateWorkMail(
    generic,
    active,
    force ? "job_accepted" : "no_candidates"
  );

  this.enqueueEvent(decorated);

  if (!force) {
    this.markPulseUsed();
  }

  return {
    enqueued: true,
    type: "generic",
    reason: "no_candidates",
    event: decorated
  };
}'''
new_on_open_chosen = '''if (!chosen) {
  if (!force) {
    this.markPulseUsed();
  }
  return {
    enqueued: false,
    type: "none",
    reason: "no_runtime_candidate_selected"
  };
}'''
core = replace_once(core, old_on_open_chosen, new_on_open_chosen, 'onAppOpen no selected candidate')

old_followup_missing = '''    if (!pack || !Array.isArray(pack.mails) || !pack.mails.length) {
      const generic = this.makeGenericCareerEvent(
        active,
        state,
        "followup_missing_pack"
      );

      const decorated = this.decorateWorkMail(
        generic,
        active,
        "followup_missing_pack"
      );

      this.enqueueEvent(decorated);
      window.dispatchEvent(new Event("updateProfile"));

      return {
        enqueued: true,
        type: "generic",
        reason: "missing_pack",
        event: decorated
      };
    }'''
new_followup_missing = '''    if (!pack || !Array.isArray(pack.mails) || !pack.mails.length) {
      return {
        enqueued: false,
        type: "none",
        reason: pack?.__scene_director_error === true
          ? "scene_director_error"
          : "no_runtime_candidates"
      };
    }'''
core = replace_once(core, old_followup_missing, new_followup_missing, 'followup empty pool')

old_followup_chosen = '''    if (!chosen) {
      const generic = this.makeGenericCareerEvent(
        active,
        state,
        "followup_no_candidates"
      );

      const decorated = this.decorateWorkMail(
        generic,
        active,
        "followup_no_candidates"
      );

      this.enqueueEvent(decorated);
      window.dispatchEvent(new Event("updateProfile"));

      return {
        enqueued: true,
        type: "generic",
        reason: "no_candidates",
        event: decorated
      };
    }'''
new_followup_chosen = '''    if (!chosen) {
      return {
        enqueued: false,
        type: "none",
        reason: "no_runtime_candidate_selected"
      };
    }'''
core = replace_once(core, old_followup_chosen, new_followup_chosen, 'followup no selected candidate')
core_path.write_text(core)

# 2) SceneDirector/EventEngine adapter: no legacy packs, role storylets or old pool.
workday_path = root / 'js/Civication/systems/civicationWorkdayMailBuilder.js'
workday = workday_path.read_text()

new_event_pack = '''  async function buildEventEnginePack(director, engine, active, state, roleKey) {
    const candidates = await director.getWorkCandidates(active, state, {
      consumer: "event_engine_build_mail_pool"
    });
    const terminalClosed = candidates?.__career_outcome_terminal_closed === true;
    const interactionSuppressed = candidates?.__scene_interaction_suppress_legacy_fallback === true;
    const taggedRuntimeMails = candidates.map((mail) => ({
      ...mail,
      source_type: norm(mail?.source_type) || "planned"
    }));
    return {
      role: norm(active?.career_id) || null,
      tag_rules: makeDefaultTagRules(),
      tracks: [],
      mails: taggedRuntimeMails,
      __civication_mail_runtime: true,
      __civication_scene_director: true,
      __runtime_candidate_count: taggedRuntimeMails.length,
      __legacy_fallback: false,
      __terminal_closed: terminalClosed,
      __interaction_suppressed: interactionSuppressed,
      __no_runtime_candidates: taggedRuntimeMails.length === 0
    };
  }
'''
workday = replace_between(
    workday,
    '  async function buildEventEnginePack(director, engine, active, state, roleKey) {',
    '  function patchEventEngineCandidateOwner(director) {',
    new_event_pack,
    'SceneDirector buildEventEnginePack'
)

new_patch_owner = '''  function patchEventEngineCandidateOwner(director) {
    const proto = /** @type {any} */ (window.CivicationEventEngine?.prototype);
    if (!proto || !director) return false;
    if (proto[EVENT_ENGINE_PATCH_FLAG] === true) return true;
    if (typeof proto.buildMailPool !== "function") return false;
    proto.buildMailPool = async function sceneDirectorBuildMailPool(active, state, roleKey) {
      try {
        return await buildEventEnginePack(director, this, active, state, roleKey);
      } catch (error) {
        if (window.DEBUG) {
          console.warn("[CivicationSceneDirector] EventEngine-pack feilet; gameplay lukkes fail-closed", error);
        }
        return {
          role: norm(active?.career_id) || null,
          tag_rules: makeDefaultTagRules(),
          tracks: [],
          mails: [],
          __civication_mail_runtime: true,
          __civication_scene_director: true,
          __runtime_candidate_count: 0,
          __legacy_fallback: false,
          __terminal_closed: false,
          __interaction_suppressed: false,
          __no_runtime_candidates: true,
          __scene_director_error: true,
          __scene_director_error_message: norm(error?.message || error)
        };
      }
    };
    proto[EVENT_ENGINE_PATCH_FLAG] = true;
    proto.__civicationSceneDirectorBuildMailPoolPatchedAt = new Date().toISOString();
    return true;
  }
'''
workday = replace_between(
    workday,
    '  function patchEventEngineCandidateOwner(director) {',
    '  function ensureSceneDirector() {',
    new_patch_owner,
    'SceneDirector patchEventEngineCandidateOwner'
)
workday_path.write_text(workday)

# 3) Turn the existing ownership test from fallback-allowed to fallback-impossible.
test_path = root / 'tests/civication-scene-director-ownership.test.js'
test = test_path.read_text()
test = replace_once(
    test,
    'const dailyPath = path.join(repoRoot, "js/Civication/systems/civicationDailyMailBuilder.js");\nconst loaderPath = path.join(repoRoot, "js/Civication/civicationShellLoader.js");',
    'const dailyPath = path.join(repoRoot, "js/Civication/systems/civicationDailyMailBuilder.js");\nconst loaderPath = path.join(repoRoot, "js/Civication/civicationShellLoader.js");\nconst eventEnginePath = path.join(repoRoot, "js/Civication/core/civicationEventEngine.js");',
    'ownership test core path'
)
test = replace_once(
    test,
    'assert(workdaySource.includes("__civicationSceneDirectorBuildMailPoolPatched"));',
    '''assert(workdaySource.includes("__civicationSceneDirectorBuildMailPoolPatched"));
assert(!workdaySource.includes('source_type: "legacy_pack"'), "SceneDirector skal aldri materialisere legacy_pack");
assert(!workdaySource.includes("previousBuildMailPool.call"), "SceneDirector-feil skal ikke gjenåpne gammel buildMailPool");
assert(!workdaySource.includes("engine.resolvePackFile(active, roleKey)"), "SceneDirector skal ikke resolve legacy pack");
assert(!workdaySource.includes("engine.loadPack(packFile)"), "SceneDirector skal ikke laste legacy pack");

const eventEngineSource = fs.readFileSync(eventEnginePath, "utf8");
const corePoolStart = eventEngineSource.indexOf("async buildMailPool(active, state, role_key) {");
const corePoolEnd = eventEngineSource.indexOf("// -------- event selection --------", corePoolStart);
assert(corePoolStart >= 0 && corePoolEnd > corePoolStart, "core buildMailPool skal finnes");
const corePoolSource = eventEngineSource.slice(corePoolStart, corePoolEnd);
assert(!corePoolSource.includes("resolvePackFile"), "core buildMailPool skal ikke resolve legacy pack");
assert(!corePoolSource.includes("loadPack"), "core buildMailPool skal ikke laste legacy pack");
assert(!corePoolSource.includes("CiviRoleStoryletBridge"), "core buildMailPool skal ikke åpne parallell RoleStorylet-fallback");
assert(!corePoolSource.includes("legacy_pack"), "core buildMailPool skal ikke materialisere legacy_pack");
assert(!eventEngineSource.includes("makeGenericCareerEvent("), "generisk karrieregameplay skal være fjernet");
assert(!eventEngineSource.includes("Denne rollen har ikke egen mailpack ennå"), "manglende canonicalt innhold skal ikke maskeres");''',
    'ownership test source guards'
)

old_fallback_assertions = '''  sourceMode = "fallback";
  const fallbackPack = await engine.buildMailPool(active, state, "fixture_role");
  assert.equal(fallbackPack.__legacy_fallback, true);
  assert.equal(fallbackPack.__runtime_candidate_count, 0);
  assert.equal(fallbackPack.role, "fixture_legacy");
  assert.deepEqual(Array.from(fallbackPack.tracks), ["legacy_track"]);
  assert.deepEqual(
    Array.from(fallbackPack.mails, (mail) => `${mail.id}:${mail.source_type}`),
    ["legacy_role_001:role", "legacy_pack_001:legacy_pack"]
  );
  assert.equal(loadPackCalls, 1, "legacy-pack skal lastes nøyaktig én gang ved reelt innholdsgap");
  assert.equal(roleBridgeCalls, 1, "legacy role bridge skal bare kjøres i fallback");
  assert.equal(previousBuildCalls, 0, "canonical og legacy normalflyt skal begge eies av Director");'''
new_fallback_assertions = '''  sourceMode = "fallback";
  const fallbackPack = await engine.buildMailPool(active, state, "fixture_role");
  assert.equal(fallbackPack.__legacy_fallback, false);
  assert.equal(fallbackPack.__runtime_candidate_count, 0);
  assert.equal(fallbackPack.__no_runtime_candidates, true);
  assert.equal(fallbackPack.role, "fixture");
  assert.deepEqual(Array.from(fallbackPack.tracks), []);
  assert.deepEqual(Array.from(fallbackPack.mails), []);
  assert.equal(loadPackCalls, 0, "innholdsgap skal aldri laste legacy-pack");
  assert.equal(roleBridgeCalls, 0, "innholdsgap skal aldri åpne parallell RoleStorylet-fallback");
  assert.equal(previousBuildCalls, 0, "tom canonical pool skal fortsatt eies av Director");'''
test = replace_once(test, old_fallback_assertions, new_fallback_assertions, 'ownership test empty candidate assertions')

old_error_assertions = '''  sourceMode = "error";
  const failsafePack = await engine.buildMailPool(active, state, "fixture_role");
  assert.equal(failsafePack.role, "previous");
  assert.equal(previousBuildCalls, 1, "forrige adapter brukes bare som eksplisitt feilsikring");
  assert.equal(sourceCalls, 8);'''
new_error_assertions = '''  sourceMode = "error";
  const failsafePack = await engine.buildMailPool(active, state, "fixture_role");
  assert.equal(failsafePack.role, "fixture");
  assert.equal(failsafePack.__legacy_fallback, false);
  assert.equal(failsafePack.__scene_director_error, true);
  assert.equal(failsafePack.__no_runtime_candidates, true);
  assert.deepEqual(Array.from(failsafePack.mails), []);
  assert.equal(previousBuildCalls, 0, "SceneDirector-feil skal lukke gameplay, ikke kalle gammel adapter");
  assert.equal(loadPackCalls, 0);
  assert.equal(roleBridgeCalls, 0);
  assert.equal(sourceCalls, 8);'''
test = replace_once(test, old_error_assertions, new_error_assertions, 'ownership test error assertions')
test_path.write_text(test)

# 4) Separate source contract prevents future reintroduction outside mocked Director.
core_test_path = root / 'tests/civication-legacy-work-fallback-closed.test.js'
core_test_path.write_text(r'''const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const corePath = path.join(repoRoot, "js/Civication/core/civicationEventEngine.js");
const workdayPath = path.join(repoRoot, "js/Civication/systems/civicationWorkdayMailBuilder.js");
const policyPath = path.join(repoRoot, "data/Civication/scenePipelinePolicyV1.json");

const core = fs.readFileSync(corePath, "utf8");
const workday = fs.readFileSync(workdayPath, "utf8");
const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));

function sliceBetween(source, startMarker, endMarker, label) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert(start >= 0 && end > start, `${label} mangler`);
  return source.slice(start, end);
}

const corePool = sliceBetween(core, "async buildMailPool(active, state, role_key) {", "// -------- event selection --------", "core buildMailPool");
const onAppOpen = sliceBetween(core, "async onAppOpen(opts = {}) {", "async enqueueImmediateFollowupEvent()", "onAppOpen");
const immediateFollowup = sliceBetween(core, "async enqueueImmediateFollowupEvent()", "registerChosenMail(eventObj)", "enqueueImmediateFollowupEvent");
const directorPack = sliceBetween(workday, "async function buildEventEnginePack", "function patchEventEngineCandidateOwner", "SceneDirector buildEventEnginePack");
const directorPatch = sliceBetween(workday, "function patchEventEngineCandidateOwner", "function ensureSceneDirector", "SceneDirector EventEngine patch");

for (const [label, source] of [["core pool", corePool], ["Director pack", directorPack]]) {
  assert(!source.includes("resolvePackFile"), `${label} kan ikke resolve legacy pack`);
  assert(!source.includes("loadPack"), `${label} kan ikke laste legacy pack`);
  assert(!source.includes("CiviRoleStoryletBridge"), `${label} kan ikke åpne RoleStorylet-fallback`);
  assert(!source.includes("legacy_pack"), `${label} kan ikke materialisere legacy_pack`);
}

assert(!directorPatch.includes("previousBuildMailPool"), "Director-feil kan ikke falle tilbake til gammel buildMailPool");
assert(directorPatch.includes("__scene_director_error: true"), "Director-feil skal være eksplisitt fail-closed");
assert(directorPatch.includes("mails: []"), "Director-feil skal gi tom gameplay-pool");
assert(!core.includes("makeGenericCareerEvent("), "syntetisk generisk karrieregameplay skal være fjernet");
assert(!onAppOpen.includes('type: "generic"'), "onAppOpen kan ikke lage generisk fallback-gameplay");
assert(!immediateFollowup.includes('type: "generic"'), "followup kan ikke lage generisk fallback-gameplay");
assert(onAppOpen.includes('"no_runtime_candidates"'), "tom canonical pool skal være eksplisitt no-op");
assert(immediateFollowup.includes('"no_runtime_candidates"'), "tom followup-pool skal være eksplisitt no-op");

const fallbackPolicy = policy.compiled_scene_registry_contract?.legacy_fallback_policy || {};
assert.equal(policy.compiled_scene_registry_contract?.completed_phase, "4H-C");
assert.equal(policy.compiled_scene_registry_contract?.next_phase, "4H-D");
assert.equal(fallbackPolicy.jobbmails_runtime_gameplay_allowed, false);
assert.equal(fallbackPolicy.legacy_pack_runtime_fallback_allowed, false);
assert.equal(fallbackPolicy.generic_career_mail_runtime_fallback_allowed, false);
assert.equal(fallbackPolicy.scene_director_error_mode, "fail_closed_no_gameplay");

console.log("civication-legacy-work-fallback-closed.test.js: PASS");
''')

# 5) Machine-readable policy.
policy_path = root / 'data/Civication/scenePipelinePolicyV1.json'
policy = json.loads(policy_path.read_text())
compiled = policy.setdefault('compiled_scene_registry_contract', {})
compiled['completed_phase'] = '4H-C'
compiled['next_phase'] = '4H-D'
compiled['legacy_fallback_policy'] = {
    'jobbmails_runtime_gameplay_allowed': False,
    'legacy_pack_runtime_fallback_allowed': False,
    'generic_career_mail_runtime_fallback_allowed': False,
    'role_storylet_runtime_fallback_allowed': False,
    'previous_build_mail_pool_runtime_fallback_allowed': False,
    'scene_director_error_mode': 'fail_closed_no_gameplay',
    'archive_data_may_remain_in_repo': True
}
policy_path.write_text(json.dumps(policy, ensure_ascii=False, indent=2) + '\n')

# 6) Normative docs.
doc_path = root / 'data/Civication/SCENE_PIPELINE_V1.md'
doc = doc_path.read_text()
doc = replace_once(
    doc,
    'EventEngine laster legacy-pack og RoleStoryletBridge bare når Director returnerer null canonicale kandidater. En terminal karrieretilstand med `__career_outcome_terminal_closed` åpner ikke legacy-fallback. Den forrige `buildMailPool`-adapteren brukes bare som eksplisitt feilsikring dersom Director selv kaster en feil.',
    '4H-C har lukket fallbacken: EventEngine laster aldri legacy-pack eller RoleStoryletBridge når Director returnerer null canonicale kandidater. En tom kandidatpool er et eksplisitt no-op. Hvis Director kaster en feil, lukkes gameplay fail-closed med tom pool; den forrige `buildMailPool`-adapteren gjenåpnes ikke.',
    'scene pipeline legacy fallback paragraph'
)
doc = replace_once(
    doc,
    '2. 4H-C skal fjerne/blokkere parallelle legacyveier, særlig `data/Civication/jobbmails`, slik at arkiv/migreringsdata aldri kan fungere som gameplaykilde eller fallback.',
    '2. **Lukket i 4H-C:** parallelle legacyveier, særlig `data/Civication/jobbmails`, er blokkert som gameplaykilde og fallback. Arkiv/migreringsdata kan bli liggende i repoet, men runtime kan ikke bruke dem som reserveinnhold.',
    'scene pipeline remaining debt'
)
doc = replace_once(
    doc,
    '8. **Fullført 4H-A–4H-B:** Materialiser `compiled_scene_registry_v1`, bevis før/etter-paritet og la SceneCatalog lese registryet for work-scenes.\n   - **Neste 4H-C:** fjern/blokker parallelle legacyveier og gamle `jobbmails` som gameplay/fallback.\n9. **Deretter 4H-D:** slå på blokkerende semantisk spilltest: plansteg → scene → valg/oppgave/info → konsekvens → progresjon → neste steg.',
    '8. **Fullført 4H-A–4H-C:** Materialiser `compiled_scene_registry_v1`, bevis før/etter-paritet, la SceneCatalog lese registryet for work-scenes og blokker alle parallelle legacy-/`jobbmails`-fallbacks.\n   - **Fullført 4H-C:** null canonical kandidat gir no-op; Director-feil gir fail-closed tom pool; legacy-pack, RoleStoryletBridge, gammel `buildMailPool` og generisk karrieremail kan ikke overta gameplay.\n9. **Neste 4H-D:** slå på blokkerende semantisk spilltest: plansteg → scene → valg/oppgave/info → konsekvens → progresjon → neste steg.',
    'scene pipeline migration status'
)
doc_path.write_text(doc)
