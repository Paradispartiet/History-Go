# Phase 45 — Civication global declarations audit (narrow, audit-only)

## Kort status
- Denne fasen er **audit-only** og gjør ingen runtime/endringsarbeid.
- Baseline preflight matcher Phase 44/#644-nivået for nøkkeltallene oppgitt i oppgaven.
- Funnene under isolerer `window.*`/`globalThis.*`-diagnostikk i `js/Civication/**` som kandidatgrunnlag for en senere, smal declarations-fase.

## Baseline brukt (preflight)
Kilde: `reports/typecheck-baseline-report.md` regenerert via `npm run typecheck:report`.

Bekreftet match mot oppgitte stabile tall:
- total diagnostics: **1962**
- files with diagnostics: **195**
- `js/Civication/**`: **578**
- `CivicationUI.js`: **107**
- `CivicationMiniSectionsUI.js`: **22**
- `civicationEventEngine.js`: **26**
- `civicationEconomyEngine.js`: **0**
- `js/ui/**`: **510**
- `js/ui/place-card.js`: **142**
- `js/profile.js`: **83**
- `js/state/**`: **16**
- TS2339: **1613**
- TS2551: **137**
- TS2322: **20**
- TS2349: **12**

## Kommandoer kjørt
```bash
git status --porcelain=v1 --untracked-files=no
git log -1 --oneline
test -f .github/workflows/typecheck-baseline.yml
test -f schemas/civication-globals.d.ts
npm run typecheck:report
npm run typecheck 2>&1 | grep "js/Civication/" | grep -E "Property '.*' does not exist on type '(Window & typeof globalThis|typeof globalThis)'" || true
grep -R "window\.CivicationMailEngine\|globalThis\.CivicationMailEngine" -n js/Civication schemas || true
grep -R "window\.CivicationCalendar\|globalThis\.CivicationCalendar" -n js/Civication schemas || true
grep -R "window\.CivicationTaskEngine\|globalThis\.CivicationTaskEngine" -n js/Civication schemas || true
grep -R "window\.CivicationState\|globalThis\.CivicationState" -n js/Civication schemas || true
grep -R "window\.CivicationBrandJobState\|globalThis\.CivicationBrandJobState" -n js/Civication schemas || true
```

## Audit-tabell: globale/window diagnostics (gruppert)
Tabellen prioriterer de mest hyppige/globalt sentrale funnene.

| Global | Antall diagnostics | Eksempler filer:linje | Definert i repo? | Finnes i `schemas/civication-globals.d.ts`? | Anbefaling |
| --- | ---: | --- | --- | --- | --- |
| `CivicationCalendar` | 32 | core/civicationEventEngine.js:989, systems/day/dayPatches.js:397, ui/CivicationUI.js:678 | Ja (`window.CivicationCalendar = ...` i `core/civicationCalendar.js`) | Nei | **Trygg kandidat først** |
| `CivicationMailEngine` | 31 | core/civicationEventEngine.js:160, systems/civicationDailyMailBuilder.js:1078, ui/CivicationUI.js:23 | Ja (`window.CivicationMailEngine = api` i `systems/civicationMailEngine.js`) | Nei | **Trygg kandidat først** |
| `CivicationEventEngine` | 20 | core/civicationEventEngine.js:2068, systems/civicationCareerOutcomeRuntime.js:490, systems/day/dayPatches.js:364 | Delvis/uklar i denne auditen (brukes bredt, tydelig bootstrap-avhengighet) | Nei | Kandidat, men verifiser bootstrap/last-rekkefølge først |
| `CivicationTaskEngine` | 14 | core/civicationEventEngine.js:1003, systems/day/dayPatches.js:705, ui/CivicationUI.js:681 | Ja (`window.CivicationTaskEngine = ...` i `core/civicationTaskEngine.js`) | Nei | **Trygg kandidat først** |
| `DEBUG` | 12 | systems/civicationBrandJobProgression.js:337, systems/civicationMailRuntime.js:141, ui/CivicationUI.js:1161 | Ikke tydelig Civication-eierskap (generisk global) | Nei | **Vent** (semantisk uklar/global på tvers) |
| `CiviMailPlanBridge` | 10 | mailPlanBridge.js:690, systems/day/dayConsequences.js:18, systems/day/dayRuntimeDebugPanel.js:59 | Ja (`window.CiviMailPlanBridge` settes i mailPlanBridge) | Nei | Kandidat (etter 1. bølge) |
| `CivicationEventChannels` | 10 | core/civicationEventEngine.js:1527, ui/CivicationUI.js:995, ui/CivicationDashboardUI.js:195 | Ja (`window.CivicationEventChannels = ...` i systems/civicationEventChannels.js) | Nei | Kandidat (etter 1. bølge) |
| `CivicationMailRuntime` | 10 | core/civicationEventEngine.js:384, systems/civicationCareerOutcomeRuntime.js:416, systems/day/dayActiveRoleStateSync.js:108 | Ja (`window.CivicationMailRuntime = ...` i systems/civicationMailRuntime.js) | Nei | Kandidat (etter 1. bølge) |
| `CivicationNpcCharacterThreads` | 10 | mailPlanBridge.js:252, systems/day/dayNpcReactions.js:18, systems/day/dayRuntimeDebugPanel.js:64 | Ja (`window.CivicationNpcCharacterThreads = ...` i day/dayNpcCharacterThreads.js) | Nei | Kandidat (etter 1. bølge) |
| `CivicationState` | 6 | systems/civicationBlockedJobMessages.js:15, systems/civicationBrandEmployerBridge.js:98 | Ja (`window.CivicationState = ...` i core/civicationState.js) | **Ja** | Ikke declaration-kandidat i denne fasen (krever typejustering/scope-fix) |
| `CivicationBrandJobState` | 6 | systems/civicationBrandJobProgression.js:313, systems/civicationMailRuntime.js:679, ui/CivicationBrandJobUI.js:82 | Ja (`window.CivicationBrandJobState = ...`) | Nei | Kandidat |
| `CivicationConflicts` | 5 | core/civicationEventEngine.js:1090, ui/CivicationUI.js:389 | Ja (utils/conflictLoader setter global) | Nei | Kandidat |
| `CivicationDailyMailBuilder` | 5 | systems/day/dayProgressionController.js:52, systems/day/dayRuntimeDebugPanel.js:80 | Ja (`window.CivicationDailyMailBuilder = ...`) | Nei | Kandidat |
| `CivicationPeopleEngine` | 5 | systems/day/dayNpcReactions.js:13, ui/CivicationPeopleUI.js:14 | Ja (`window.CivicationPeopleEngine = ...`) | Nei | Kandidat |
| `CiviStoryResolver` | 4 | core/civicationEventEngine.js:1029, roleThreadResolver.js:107, utils/storyResolver.js:561 | Ja (`window.CiviStoryResolver = ...`) | Nei | Kandidat |

## Kandidater for neste smale declaration-PR (anbefalt rekkefølge)
1. `CivicationCalendar`
2. `CivicationMailEngine`
3. `CivicationTaskEngine`
4. `CivicationMailRuntime`
5. `CivicationEventChannels`
6. `CivicationBrandJobState`
7. `CiviMailPlanBridge`
8. `CivicationPeopleEngine`
9. `CivicationConflicts`
10. `CivicationMiniSectionsUI` / `CivicationDashboardUI` (UI-globals, men fortsatt rene declarations)

Begrunnelse: disse har tydelig og konsistent `window.<Navn> = ...`-mønster i Civication-kilde og er høyfrekvente i diagnostics.

## Globals som bør vente (semantisk uklare / høy risiko for feil declaration)
- `DEBUG` (generisk cross-cutting global, uklart eierskap/typekontrakt)
- `HG_STATE`, `PEOPLE`, `HGOnboarding`, `HG_Identity*` (ikke rene Civication-kjerner; trenger domeneavklaring)
- patch-flagg som `__civiStorageTracePatched`, `__civiNpcCharacterThreadPatched`, `__civiDayPhaseUiPatched`, `__HG_STORY_STATE_MEM__` (interne patch-/memo-flagg, ofte bedre med intern typing fremfor bred global declaration)
- kartdata-globals (`CIVI_MAP_*`, `CIVI_OSLO_*`) bør tas samlet i egen data/declaration-fase for å unngå semantisk blanding.

## Avgrensning og endringsgaranti
- Ingen JS-kode endret.
- Ingen runtime-endringer.
- Ingen AHA/data/emne/place-filer endret.
- Ingen UI/CSS/HTML endret.
- Ingen schema/declaration-filer endret (`schemas/civication-globals.d.ts` urørt).
- Ingen workflow-filer endret.
- Denne fasen tilfører kun auditrapporten `reports/civication-global-declarations-audit-phase-45.md`.
