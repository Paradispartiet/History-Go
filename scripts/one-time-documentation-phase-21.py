from pathlib import Path
import hashlib
import json

active_path = Path("docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md")
completion_path = Path("docs/COMPLETION_DEFINITIONS.md")
docs_index_path = Path("docs/README.md")
registry_path = Path("docs/documentation_registry.json")
month_index_path = Path("reports/archive/2026-07/README.md")
archive_dir = Path("reports/archive/2026-07/quiz-physical-visits")
archive_path = archive_dir / "QUIZ_AND_PHYSICAL_VISIT_MODEL_PRE_CONSOLIDATION_2026-07-26.md"
archive_readme_path = archive_dir / "README.md"

original = active_path.read_bytes()
archive_dir.mkdir(parents=True, exist_ok=True)
archive_path.write_bytes(original)
assert archive_path.read_bytes() == original
Path("/tmp/phase21-original.sha256").write_text(
    hashlib.sha256(original).hexdigest() + "\n", encoding="utf-8"
)

active_document = '''# History GO — quiz og fysisk besøksstatus

Status: **operational runtimeguide**  
Canonical ferdigmodell: [`COMPLETION_DEFINITIONS.md`](./COMPLETION_DEFINITIONS.md)  
Runtime: [`../js/quiz/quizAccess.ts`](../js/quiz/quizAccess.ts), [`../js/visits/physicalVisits.ts`](../js/visits/physicalVisits.ts) og [`../js/ui/placeVisitButton.ts`](../js/ui/placeVisitButton.ts)  
Regresjonstest: [`../tests/quiz-physical-visit-separation.test.js`](../tests/quiz-physical-visit-separation.test.js)  
Sist kontrollert: **2026-07-26**

Dette dokumentet beskriver den implementerte runtimegrensen mellom digital quiztilgang og fysisk besøksregistrering. Den brede produktbetydningen av fullført, besøkt, utforsket og mestret eies fortsatt av `COMPLETION_DEFINITIONS.md`.

## Autoritetsrekkefølge

1. [`COMPLETION_DEFINITIONS.md`](./COMPLETION_DEFINITIONS.md) — canonical produktmodell for ferdigtilstander på tvers av History GO.
2. [`../js/progress/placeProgress.ts`](../js/progress/placeProgress.ts) — smal place-progress-snapshotmodell.
3. [`../js/quiz/quizAccess.ts`](../js/quiz/quizAccess.ts) — digital quiztilgang uten fysisk besøkswrite.
4. [`../js/visits/physicalVisits.ts`](../js/visits/physicalVisits.ts) — fysisk visit service, legacy-persistensadapter og posisjonsgate.
5. [`../js/ui/placeVisitButton.ts`](../js/ui/placeVisitButton.ts) — PlaceCard-knappens tilstand og handling.
6. [`../js/ui/place-card-quizcards-patch.ts`](../js/ui/place-card-quizcards-patch.ts) — installasjon og kobling av delene i browser-runtime.
7. [`../tests/quiz-physical-visit-separation.test.js`](../tests/quiz-physical-visit-separation.test.js) — regressjonsbevis for at quiz ikke skriver fysisk besøksstatus.
8. Dette dokumentet — menneskelesbar runtimeguide.

Ved konflikt gjelder canonical ferdigmodell, kildekode og tester foran denne teksten.

## Implementert nå

### Digital quiz er uavhengig av fysisk besøk

Quiz-adapteren patcher `QuizEngine.init()` og gir motoren:

- en `getVisited()`-visning som svarer `true` for enhver place-nøkkel, slik at en eldre besøksgate ikke blokkerer digital quiz;
- en `saveVisitedFromQuiz()`-funksjon som returnerer `false` og ikke skriver til fysisk besøksdata.

Hvis `QuizEngine` installeres senere, patcher runtime setter-pathen når motoren blir tilgjengelig. Ved installasjon av besøksmodellen erstattes også `window.saveVisitedFromQuiz` med en deaktivert kompatibilitetsfunksjon som returnerer `false`.

Quizåpning eller quizfullføring er derfor ikke et fysisk besøk og skal ikke skrive til `window.visited` gjennom denne adapteren.

### Fysisk besøksservice

Før quiz-skriveveien deaktiveres, fanger integrasjonen den eksisterende legacy-funksjonen for fysisk besøkslagring. `window.HGPhysicalVisits` eksponerer:

- `isVisited(placeId)`
- `record(place)`
- `toProgress(placeId, input)`

`record(place)` normaliserer place-ID-en, er idempotent for et allerede registrert sted, kaller den fangede fysiske persistensfunksjonen og kontrollerer deretter at `window.visited[placeId]` faktisk er satt. Ved et nytt vellykket besøk sendes `hg:physicalVisitRegistered` med `placeId` og tidsstempel.

Servicen returnerer eksplisitte feil for manglende place-ID, utilgjengelig persistens eller mislykket persistens. Den oppretter ikke selv et nytt lagringsformat.

### Posisjonsgate

`getPhysicalVisitGate()` godkjenner besøk på to måter:

- `TEST_MODE` gir en eksplisitt utviklingsbypass;
- ellers kreves nåværende posisjon, `distMeters()` og minst ett mål fra `getPlaceDistanceTargets(place)`.

Hvert mål bruker egen radius eller stedets fallbackradius, som er 150 meter når ingen annen radius finnes. Resultatet skiller mellom manglende posisjon, manglende anker og for stor avstand.

### PlaceCard-knappen

PlaceCard-kontrolleren bruker den fysiske besøksservicen og gaten. Den viser blant annet:

- `Henter posisjon…`
- `Gå nærmere` eller gjenværende meter
- `Registrer besøk`
- `Registrer besøk (test)` i testmodus
- `Besøkt ✅` når stedet allerede er registrert

Ved godkjent registrering pulseres kartmarkøren dersom helperen finnes, og brukeren får en lokal bekreftelse. Knappen kan ikke brukes til å registrere besøk uten godkjent gate, bortsett fra testmodus.

### Smal place-progress read-model

`window.HGPlaceProgress.createSnapshot()` bygger en beregnet snapshot med statusene:

- `unopened`
- `opened`
- `visited`
- `quiz_completed`
- `explored`
- `mastered`

`explored` betyr i denne smale modellen både quiz fullført og fysisk besøkt. `mastered` krever i tillegg at kalleren sender `extraPlaceActionCompleted: true`.

Snapshoten lagrer ikke selv progresjon. Den leser input og fysisk besøksstatus og returnerer en beregnet tilstand.

## Ikke garantert eller tildelt av dette subsystemet

Denne runtimegrensen tildeler eller vedlikeholder ikke i seg selv:

- første eller siste besøksdato;
- besøksantall eller reiselogg;
- Groundhopper-progresjon;
- fysisk eller digital ruteprogresjon;
- observations eller learning-log-events;
- badges, stedsmerker, poeng eller meritpoeng;
- people-unlocks eller samlingsobjekter;
- varig lagring av `extraPlaceActionCompleted` eller `mastered`;
- quizresultat, quizhistorikk eller øvrige quizbelønninger.

Andre subsystemer kan lese legacy `visited`-store eller lytte til `hg:physicalVisitRegistered`. Slike downstream-effekter er ikke direkte atferd i denne modulen uten egen dokumentert runtime og test.

## Forholdet til canonical ferdigmodell

`COMPLETION_DEFINITIONS.md` eier den brede betydningen av stedshandlinger og ferdigtilstander. I denne besøksruntimeen betyr `visited` et fysisk registrert besøk gjennom fysisk gate og kompatibel fysisk persistens. Det betyr ikke bare at PlaceCard er åpnet eller at en quiz er fullført.

De seks statusene i `HGPlaceProgress` er en smal adapter/read-model. De erstatter ikke canonical statusoversikt med blant annet `discovered`, `checked_in`, `quiz_attempted`, `observed` og `completed`.

## Validering

```bash
npm run build:scripts
node dist/scripts/check-documentation-governance.mjs
node --test tests/quiz-physical-visit-separation.test.js
npm run typecheck:web
```

## Historisk snapshot

Pre-consolidation-dokumentet er bevart byte-identisk i:

```txt
reports/archive/2026-07/quiz-physical-visits/QUIZ_AND_PHYSICAL_VISIT_MODEL_PRE_CONSOLIDATION_2026-07-26.md
```

Snapshotet dokumenterer den tidligere brede målmodellen, men skal ikke brukes som bevis for at downstream-belønninger er implementert av quiz-/besøksmodulen.
'''
active_path.write_text(active_document, encoding="utf-8")

completion = completion_path.read_text(encoding="utf-8")
completion_marker = "| `mastered` | høyeste nivå på stedet er oppnådd |\n\n`completed` er spillbar ferdigtilstand. `mastered` er ekstra dybde."
completion_replacement = """| `mastered` | høyeste nivå på stedet er oppnådd |

### Avgrensning mot quiz- og besøksruntime

I den smale `HGPlaceProgress`-modellen betyr `visited` at et fysisk besøk er registrert gjennom `HGPhysicalVisits.record()` etter godkjent fysisk gate, eller at samme kompatible fysiske persistens allerede finnes i `window.visited`. Å åpne PlaceCard eller fullføre quiz setter ikke denne besøksstatusen gjennom quizadapteren.

`HGPlaceProgress` beregner bare `unopened`, `opened`, `visited`, `quiz_completed`, `explored` og `mastered`. Disse runtime-statusene er en smal read-model og erstatter ikke den bredere canonical tabellen over `discovered`, `checked_in`, `quiz_attempted`, `observed`, `completed` og andre produktstatuser.

`completed` er spillbar ferdigtilstand. `mastered` er ekstra dybde."""
if completion_marker not in completion:
    raise SystemExit("Fant ikke completion-marker")
completion_path.write_text(
    completion.replace(completion_marker, completion_replacement, 1),
    encoding="utf-8",
)

docs_index = docs_index_path.read_text(encoding="utf-8")
section = '''### Quiz og fysisk besøksstatus

1. [`COMPLETION_DEFINITIONS.md`](./COMPLETION_DEFINITIONS.md) — canonical produktbetydning av besøkt, quizfullført, utforsket, fullført og mestret
2. [`QUIZ_AND_PHYSICAL_VISIT_MODEL.md`](./QUIZ_AND_PHYSICAL_VISIT_MODEL.md) — operational runtimeguide for digital quiztilgang, fysisk besøksgate og smal place-progress read-model
3. [`../js/quiz/quizAccess.ts`](../js/quiz/quizAccess.ts) — quiztilgang uten fysisk besøkswrite
4. [`../js/visits/physicalVisits.ts`](../js/visits/physicalVisits.ts) — fysisk besøksservice og gate
5. [`../js/ui/placeVisitButton.ts`](../js/ui/placeVisitButton.ts) — PlaceCard-knappens besøksatferd
6. [`../tests/quiz-physical-visit-separation.test.js`](../tests/quiz-physical-visit-separation.test.js) — regresjonstest for separasjonen

Quiz er digitalt tilgjengelig uten å skrive fysisk besøksstatus. Fysisk `visited` krever den fysiske besøksveien; badges, poeng, Groundhopper, ruter og andre downstream-belønninger eies ikke av denne adapteren uten egne implementasjoner.

'''
marker = "### Historiske ruter\n"
if "### Quiz og fysisk besøksstatus" not in docs_index:
    if marker not in docs_index:
        raise SystemExit("Fant ikke docs-index-marker")
    docs_index = docs_index.replace(marker, section + marker, 1)
docs_index_path.write_text(docs_index, encoding="utf-8")

archive_readme = '''# Quiz og fysisk besøksmodell — pre-consolidation

Denne mappen bevarer den tidligere brede quiz-/besøksmodellen byte-identisk slik den stod før dokumentasjonsfase 21.

Snapshotet er historisk og kan ikke brukes som nåstatus for implementerte belønninger eller downstream-progresjon.

Aktive kilder:

- [`../../../../docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md`](../../../../docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md) — operational runtimeguide
- [`../../../../docs/COMPLETION_DEFINITIONS.md`](../../../../docs/COMPLETION_DEFINITIONS.md) — canonical ferdigmodell
- [`../../../../js/visits/physicalVisits.ts`](../../../../js/visits/physicalVisits.ts) — fysisk besøksruntime
- [`../../../../js/quiz/quizAccess.ts`](../../../../js/quiz/quizAccess.ts) — digital quiztilgang
'''
archive_readme_path.write_text(archive_readme, encoding="utf-8")

month_index = month_index_path.read_text(encoding="utf-8")
month_bullet = "- [`quiz-physical-visits/`](./quiz-physical-visits/) — tidligere brede quiz-/besøksmodell, bevart byte-identisk før runtimekonsolidering\n"
if month_bullet not in month_index:
    anchor = "- [`historical-routes/`](./historical-routes/) — tidligere konsept-, mekanikk- og faseplan for Historiske ruter, bevart byte-identisk\n"
    if anchor not in month_index:
        raise SystemExit("Fant ikke month-index-anchor")
    month_index = month_index.replace(anchor, anchor + month_bullet, 1)
month_index_path.write_text(month_index, encoding="utf-8")

registry = json.loads(registry_path.read_text(encoding="utf-8"))
registry["last_verified"] = "2026-07-26"
active_registry_path = "docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md"
archive_registry_path = "reports/archive/2026-07/quiz-physical-visits/QUIZ_AND_PHYSICAL_VISIT_MODEL_PRE_CONSOLIDATION_2026-07-26.md"
registry["documents"] = [
    entry for entry in registry["documents"]
    if entry.get("path") not in {active_registry_path, archive_registry_path}
]
completion_index = None
for index, entry in enumerate(registry["documents"]):
    if entry.get("path") == "docs/COMPLETION_DEFINITIONS.md":
        entry["last_verified"] = "2026-07-26"
        completion_index = index
        break
if completion_index is None:
    raise SystemExit("Fant ikke completion registry entry")
new_entries = [
    {
        "path": active_registry_path,
        "status": "operational",
        "role": "Operativ runtimeguide for skillet mellom digital quiztilgang, fysisk besøksgate, besøksregistrering og smal place-progress read-model",
        "owns": ["quiz_physical_visit_runtime_guide"],
        "last_verified": "2026-07-26",
    },
    {
        "path": archive_registry_path,
        "status": "historical",
        "role": "Pre-consolidation målmodell for quiz, fysisk besøk og foreslåtte downstream-belønninger",
        "owns": [],
        "superseded_by": [
            active_registry_path,
            "docs/COMPLETION_DEFINITIONS.md",
        ],
        "historical_reason": "Dokumentet blandet implementert quiz-/besøksseparasjon med bredere produktmål og downstream-effekter som denne modulen ikke selv garanterer.",
    },
]
registry["documents"][completion_index + 1:completion_index + 1] = new_entries
registry_path.write_text(
    json.dumps(registry, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8",
)

assert hashlib.sha256(archive_path.read_bytes()).hexdigest() == hashlib.sha256(original).hexdigest()
