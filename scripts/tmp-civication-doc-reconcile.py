from pathlib import Path
import json
import re

ROOT = Path('.')


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')


# 1) js/Civication/README.md — keep all existing detail, correct current ownership.
path = 'js/Civication/README.md'
text = read(path)
text = text.replace('Oppdatert: 2026-07-07', 'Oppdatert: 2026-08-17', 1)
section = '''## Nåværende scene- og svarownership etter 4H-D\n\nDen gamle «mail = gameplay-enhet»-beskrivelsen er ikke lenger presis. Dagens canonicale kjede er:\n\n```text\nauthored work data (`mailFamilies` m.m.)\n→ deterministic build\n→ `compiledSceneRegistryV1.json`\n→ `CivicationSceneCatalog`\n→ `CivicationMailRuntime` plan/progresjonsfiltrering + `CivicationSceneDirector` kandidatownership\n→ delivery / NextAction / EventEngine\n→ `CivicationChoiceDirector`\n→ konsekvenser og domeneeid state\n```\n\n`mailFamilies` er fortsatt source-of-build for work-scenes, men normal runtime leser det kompilerte registryet. `CivicationMailRuntime` eier plan/progresjon; det er ikke lenger en rå mailFamily-loader. `CivicationSceneDirector` samler Workday/Daily/EventEngine-kandidatveien, og `CivicationChoiceDirector` er eneste aktive `EventEngine.answer`-eier.\n\nPrivate, life, narrative og social er registrerte SceneCatalog-source adapters. Legacy pack, RoleStoryletBridge, gammel `buildMailPool` og syntetisk generisk karrieremail får ikke overta når canonical scene mangler. Null canonical kandidat er fail-closed/no-op.\n\nDen høyere redaksjonelle definisjonen av en «fylt» rolle ligger i [`docs/CIVICATION_ROLE_WORLD_STANDARD.md`](../../docs/CIVICATION_ROLE_WORLD_STANDARD.md). Career Gameplay `reference_complete` er en teknisk/produksjonsmessig status og skal ikke forveksles med full Role World-dybde.\n\n'''
marker = '## Boot-arkitektur: skall-boot vs. dag-/life-story-boot\n'
if section.splitlines()[0] not in text:
    if marker not in text:
        raise SystemExit('js README marker missing')
    text = text.replace(marker, section + marker, 1)
text = re.sub(
    r'\| MailRuntime \| `CivicationMailRuntime` \| .*?\|\n',
    '| MailRuntime | `CivicationMailRuntime` | **Langsiktig rolleprogresjon.** Leser plan via SceneCatalog, bruker SceneCatalog-resolved compiled work-scenes og eier step/consumed/history/scoring/progresjon; leser ikke rå `mailFamilies` som normal gameplaykilde. |\n',
    text,
    count=1,
)
text = text.replace(
    'Arbeidsdeling i én setning: **MailRuntime velger hvilken mail som skal komme, DailyMailBuilder\nbestemmer dagens rytme, MailEngine lagrer og viser den, EventEngine beregner svaret.**',
    'Arbeidsdeling i én setning: **SceneCatalog løser kildene, MailRuntime eier plan/progresjon, SceneDirector samler kandidatvalget, DailyMailBuilder bestemmer dagens rytme, MailEngine leverer/lagrer, og ChoiceDirector eier svargrensen rundt EventEngine.**'
)
write(path, text)


# 2) docs/CIVICATION_DATA_LAYERS.md — preserve learning detail, correct source/data layers.
path = 'docs/CIVICATION_DATA_LAYERS.md'
text = read(path)
insert = '''## 1A. Oppdatert scene-, Role World- og leveveigrense\n\nEtter Scene Pipeline 4F–4H må datalagene leses med tre ekstra skiller:\n\n1. **Authored source vs runtime scene:** `mailFamilies` er authored source-of-build for work; normal work-runtime leser `compiledSceneRegistryV1.json` gjennom `CivicationSceneCatalog`.\n2. **Teknisk jobbkompletthet vs fylt rolleverden:** Career Gameplay Matrix måler `architecture_only/partial/playable/reference_complete`; `CIVICATION_ROLE_WORLD_STANDARD.md` eier den høyere redaksjonelle 14-dagers/sosiologiske standarden.\n3. **Jobb vs levevei:** formell lønn eies av jobbøkonomien, mens freelance/gigs/royalties/støtte/nullinntekt eies av `CivicationLivelihoods`. En scene kan opprette en opportunity, men produsenten skriver aldri sideinntekt direkte til wallet.\n\nDen canonicale sceneveien er:\n\n```text\nroleModel/FWG + mailPlan + authored work data\n→ compiled_scene_registry_v1\n→ SceneCatalog\n→ MailRuntime plan/progresjon + SceneDirector selection\n→ delivery\n→ ChoiceDirector\n→ consequences/state\n```\n\nPrivate/life/narrative/social bruker registrerte SceneCatalog-source adapters. Role World er en produksjonsstandard over disse lagene, ikke et nytt runtimeformat.\n\n'''
marker = '## 2. Hovedmodell\n'
if insert.splitlines()[0] not in text:
    if marker not in text:
        raise SystemExit('data layers marker missing')
    text = text.replace(marker, insert + marker, 1)
pattern = re.compile(r'- `data/Civication/jobbmails/`\n.*?(?=- `state\.job_learning_progress`)', re.S)
replacement = '''- `data/Civication/mailFamilies/`\n  - eier: authored work scene/mail source-data\n  - svarer på: konkrete situasjoner, personer, tasks, choices, effects, threads og narrative arcs som skal kompileres til canonical scenes\n  - skal ikke eie: normal runtime source selection; produksjonsruntime leser compiled registry via SceneCatalog\n\n- `data/Civication/compiledSceneRegistryV1.json`\n  - eier: materialisert, deterministisk work-scene-katalog for normal runtime\n  - bygges fra registrerte authored work sources av `scripts/build-civication-scene-registry.mjs`\n  - svarer på: canonical scene entries, compatibility projections, provenance/source hashes, role index og registry hash\n  - skal ikke redigeres som authored gameplay; kildefilen skal endres og registryet regenereres\n\n- `data/Civication/jobbmails/`\n  - eier: legacy-/arkiv-/migreringsdata\n  - kan beholdes for historikk og migrering\n  - skal ikke brukes som runtime gameplaykilde eller fallback etter 4H-C\n\n'''
text, n = pattern.subn(replacement, text, count=1)
if n != 1:
    raise SystemExit('jobbmails block not found exactly once')
write(path, text)


# 3) docs/README.md — add authoritative Civication reading order.
path = 'docs/README.md'
text = read(path)
section = '''### Civication\n\n1. [`CIVICATION_README.md`](./CIVICATION_README.md) — operativ dokumentasjonsinngang og riktig leserekkefølge\n2. [`../data/Civication/SCENE_PIPELINE_V1.md`](../data/Civication/SCENE_PIPELINE_V1.md) + [`../data/Civication/scenePipelinePolicyV1.json`](../data/Civication/scenePipelinePolicyV1.json) — canonical scene-, source-, candidate- og answer-ownership etter fullført 4H-D\n3. [`CIVICATION_PATCH_ORDER.md`](./CIVICATION_PATCH_ORDER.md) — faktisk kandidat-/ChoiceDirector-middleware-rekkefølge\n4. [`../data/Civication/README-mailsystem-og-rolemodels.md`](../data/Civication/README-mailsystem-og-rolemodels.md) — authored jobbdata, roleModels/FWG, mailPlans og compiled-registry-grensen\n5. [`CIVICATION_CAREER_GAMEPLAY_CONTRACT.md`](./CIVICATION_CAREER_GAMEPLAY_CONTRACT.md) + [`../data/Civication/careerGameplayPolicy.json`](../data/Civication/careerGameplayPolicy.json) — teknisk spillbarhetskontrakt og canonical pilot-/reference-intent\n6. [`CIVICATION_ROLE_WORLD_STANDARD.md`](./CIVICATION_ROLE_WORLD_STANDARD.md) — høyere redaksjonell standard for en faktisk fylt rolleverden\n7. [`civication-life-story-system.md`](./civication-life-story-system.md) — Life Story / Min dag\n\nViktig statusgrense: `reference_complete` i Career Gameplay Matrix betyr teknisk/produksjonsmessig komplett arbeidsverden etter 15-komponentskontrakten. Det betyr **ikke** automatisk «fylt rolleverden». Role World-standarden krever i tillegg sammenhengende sosial dramaturgi, faste personer/maktforhold, 14-dagers bue, gjentakende tråder og privat etterklang.\n\nWork-scenes produseres fortsatt i authored kilder, men normal runtime leser `compiledSceneRegistryV1.json` gjennom SceneCatalog. `mailFamilies` er source-of-build; MailRuntime eier plan/progresjon; SceneDirector eier samlet kandidatvei; ChoiceDirector eier svargrensen. Legacy `jobbmails` og RoleStorylet-fallback er ikke normal gameplaykilde.\n\n'''
marker = '### Uavhengige læringsspill\n'
if section.splitlines()[0] not in text:
    if marker not in text:
        raise SystemExit('docs README insertion marker missing')
    text = text.replace(marker, section + marker, 1)
text = text.replace('Sist kontrollert: **2026-08-15**', 'Sist kontrollert: **2026-08-17**', 1)
write(path, text)


# 4) documentation_registry.json — register the actual owners.
path = 'docs/documentation_registry.json'
data = json.loads(read(path))
data['last_verified'] = '2026-08-17'

def upsert(entry):
    docs = data.setdefault('documents', [])
    for i, row in enumerate(docs):
        if row.get('path') == entry['path']:
            merged = dict(row)
            merged.update(entry)
            docs[i] = merged
            return
    docs.append(entry)

entries = [
    {
        'path': 'docs/CIVICATION_README.md',
        'status': 'operational',
        'role': 'Felles inngang til current Civication scene-, gameplay-, Role World-, life- og datakontrakter',
        'owns': ['civication_documentation_entry'],
        'last_verified': '2026-08-17'
    },
    {
        'path': 'data/Civication/SCENE_PIPELINE_V1.md',
        'status': 'canonical',
        'role': 'Normativ scene-, source-adapter-, compiled-registry-, SceneDirector- og ChoiceDirector-kontrakt',
        'owns': ['civication_scene_pipeline_contract'],
        'last_verified': '2026-08-17'
    },
    {
        'path': 'data/Civication/scenePipelinePolicyV1.json',
        'status': 'canonical',
        'role': 'Maskinlesbar policy for Scene Pipeline ownership, format freeze, interaction rules og 4H-D-status',
        'owns': ['civication_scene_pipeline_policy'],
        'last_verified': '2026-08-17'
    },
    {
        'path': 'docs/CIVICATION_PATCH_ORDER.md',
        'status': 'canonical',
        'role': 'Normativ koordinasjonsguide for candidate ownership, ChoiceDirector middleware og runtime-sømmer',
        'owns': ['civication_runtime_coordination'],
        'last_verified': '2026-08-17'
    },
    {
        'path': 'data/Civication/README-mailsystem-og-rolemodels.md',
        'status': 'canonical',
        'role': 'Datakontrakt for roleModel/FWG, mailPlan, authored work sources og compiled scene-boundary',
        'owns': ['civication_authored_role_scene_data_contract'],
        'last_verified': '2026-08-17'
    },
    {
        'path': 'docs/CIVICATION_CAREER_GAMEPLAY_CONTRACT.md',
        'status': 'canonical',
        'role': 'Permanent 15-komponents kontrakt for teknisk spillbare arbeidsverdener og statussemantikk',
        'owns': ['civication_career_gameplay_contract'],
        'last_verified': '2026-08-17'
    },
    {
        'path': 'data/Civication/careerGameplayPolicy.json',
        'status': 'canonical',
        'role': 'Maskinlesbar intent for Career Gameplay reference roles, pilot wave og minimumsgates',
        'owns': ['civication_career_gameplay_policy'],
        'last_verified': '2026-08-17'
    },
    {
        'path': 'reports/civication-career-gameplay-matrix.md',
        'status': 'operational',
        'role': 'Generert commit-bundet Career Gameplay-status; canonical intent ligger i careerGameplayPolicy.json',
        'owns': [],
        'last_verified': '2026-08-17'
    },
    {
        'path': 'docs/CIVICATION_ROLE_WORLD_STANDARD.md',
        'status': 'canonical',
        'role': 'Redaksjonell produksjonsstandard for fylt rolleverden: sosiologisk bibel, cast, 14-dagers bue, threads og privat etterklang',
        'owns': ['civication_role_world_editorial_standard'],
        'last_verified': '2026-08-17'
    },
    {
        'path': 'docs/CIVICATION_DATA_LAYERS.md',
        'status': 'operational',
        'role': 'Datalagsguide for Civication state, learning, authored sources, compiled scenes og domeneskiller',
        'owns': ['civication_data_layer_guide'],
        'last_verified': '2026-08-17'
    },
    {
        'path': 'js/Civication/README.md',
        'status': 'operational',
        'role': 'Motoroversikt for Civication shell/day UI og current scene-/answer ownership',
        'owns': ['civication_runtime_guide'],
        'last_verified': '2026-08-17'
    }
]
for entry in entries:
    upsert(entry)
write(path, json.dumps(data, ensure_ascii=False, indent=2) + '\n')

print('Civication documentation reconciliation applied')
