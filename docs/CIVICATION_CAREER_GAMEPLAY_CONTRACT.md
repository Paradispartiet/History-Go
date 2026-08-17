# Civication Career Gameplay Contract

Status: **canonical career-gameplay-kontrakt**  
Sist reconcilet: **2026-08-18**

## Formål

Denne kontrakten måler om en arbeidsverden har en sammenhengende jobbgameplay-loop. Den må **ikke** brukes som synonym for den strengere Role World-kvaliteten.

- Badge Career Matrix vurderer Badge-titler og career/life-semantikk.
- Role Pack Index viser hvilke rollepakke-filer som finnes.
- Career Gameplay Matrix samler faktisk arbeidsverden per `category/role_scope` og vurderer jobbloopen.
- [`CIVICATION_ROLE_WORLD_STANDARD.md`](./CIVICATION_ROLE_WORLD_STANDARD.md) vurderer om rollen er fylt som en levende sosial serie.

## Canonical arbeidsverdener

Arbeidsverdener oppdages som unionen av deklarasjoner i:

- `data/Civication/workGrammars/`
- `data/Civication/badgeRoleMappings.json`
- `data/Civication/mailPlans/`
- `data/Civication/praksisfortellinger_registry.json`
- `data/Civication/lifestory/manifest.json`

En roleModel-fil alene oppretter ikke en ny arbeidsverden.

## De 15 career-komponentene

Hver arbeidsverden auditeres mot:

1. `entry` — jobbtilbud, gate og aktiv stilling.
2. `day_one` — testet åpning på første arbeidsdag.
3. `workday_loop` — gjentakbar arbeidslogikk.
4. `practice_stories` — konkrete situasjoner og for referansenivå minst to uker variasjon.
5. `people` — relevante personer finnes i spillinnholdet.
6. `places` — arbeidssted og arbeidsflater er konkrete.
7. `mail` — authored jobbinnhold har rolleegne situasjoner/valg og kan materialiseres til gameplayscener.
8. `knowledge` — fagkunnskap brukes i beslutninger.
9. `quality_axes` — arbeidets kvalitet kan vurderes.
10. `authority` — mandat, ansvar og grenser er eksplisitte.
11. `consequences` — valg gir samme-dag eller senere etterspill.
12. `performance` — mestring, risiko, stagnasjon eller svikt kan vurderes.
13. `economy` — faktisk jobb har eksakt lønnsregel.
14. `progression` — erfaring/prestasjon kan gi mer ansvar, spesialisering eller nytt tilbud.
15. `exit` — oppsigelse, avgang eller jobbskifte har definert vei.

Life Story er en egen integrasjonskolonne og er obligatorisk for `reference_complete`.

## Evidensnivå

- `complete`: innhold og relevant runtime-/testbevis finnes.
- `partial`: arkitektur eller innhold finnes, men hele kjeden er ikke bevist.
- `missing`: ingen tilstrekkelig repo-evidens.

Auditen skal være konservativ.

## Career-status

- `reference_complete`: alle 15 komponenter er `complete`, Life Story er koblet, minst 12 praksissituasjoner finnes og minst to praksisuker er testet.
- `playable`: runtime-kjernen `entry -> day_one -> workday_loop -> mail/scene -> consequences -> economy` er komplett, og ingen av de 15 komponentene mangler helt.
- `partial`: noe spillinnhold/runtime finnes, men gameplay-gaten er ikke bevist.
- `architecture_only`: modell/FWG/deklarasjon finnes uten tilstrekkelig faktisk arbeidsdaggameplay.

Disse er beregnede **career-gameplay-statuser**.

## Viktig: `reference_complete` er ikke «fylt rolleverden»

`reference_complete` ble laget før Role World-standarden. Statusen bevares fordi den måler verdifull teknisk og produksjonsmessig jobbevidens, men den innebærer ikke automatisk:

- 14 dager × morgen/lunsj/ettermiddag/kveld
- sosiologisk hovedproblem og temabue
- full NPC-bibel med klasse/status/makt/mål/skjult side/talemåte
- viktige relasjonelle tråder over 5–10 beats
- systematisk privat etterklang
- senere konsekvenser på tvers av jobb, relasjon, psyke, livelihood, økonomi eller bolig

Den strengere statusen heter `role_world_complete` og eies av [`data/Civication/roleWorldPolicy.json`](../data/Civication/roleWorldPolicy.json) og [`CIVICATION_ROLE_WORLD_STANDARD.md`](./CIVICATION_ROLE_WORLD_STANDARD.md).

En rolle kan derfor være:

```text
career_status: reference_complete
role_world_status: role_world_not_started
```

uten selvmotsigelse.

## Permanent career-gate

`node scripts/audit-civication-career-gameplay.mjs --check` skal fortsatt:

- regenerere matrisen deterministisk i minnet;
- kontrollere checked-in JSON/Markdown;
- avvise ukjente komponenter og dupliserte arbeidsverdener;
- avvise `playable` uten komplett runtime-kjerne;
- avvise `reference_complete` uten 15 komponenter, Life Story, praksisdybde og to uker.

Denne auditen skal **ikke** utvides til å late som den alene kan bevise Role World-completion. Den nye Role World-porten er separat og strengere.

## Produksjonsregel

Nye arbeidsverdener skal forbedre eksisterende `role_scope`. Ikke opprett ny motor, ny dagsrytme eller nesten lik scope for å få en Badge-tittel til å se komplett ut.

Dypere sosial produksjon følger Role World-standarden og materialiseres gjennom den eksisterende Scene Pipeline.
