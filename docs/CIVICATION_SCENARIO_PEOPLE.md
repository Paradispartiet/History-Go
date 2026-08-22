# Civication Scenario People

## Formål

Dette laget kobler canonicale History Go People til Civication-scenarioer uten å gjøre virkelige personer til frie NPC-er eller oppfinne person–sted-relasjoner.

Kildene er:

- `data/Civication/historyPeople_index.json` – alle canonicale People som Civication kan lese.
- `data/Civication/roleModels/manifest.json` – alle canonicale Civication-roller/scenarioer.
- `data/Civication/scenarioPeople/overrides.json` – eneste kuraterte vei til `direct` fit, samt eksplisitte sterke treff, tillegg og eksklusjoner.
- `data/fag/**/theory_integrity_bindings*.json` – canonicale personbundne teorier som også brukes til å finne People-hull.

Generator:

`node --experimental-strip-types scripts/build-civication-scenario-people-index.mts`

Synksjekk:

`node --experimental-strip-types scripts/build-civication-scenario-people-index.mts --check`

## Lagringsmodell: komplett dekning uten kartesisk duplisering

Alle People i samme canonicale fagkategori er relevante som minimum `contextual` kunnskaps-/oppgavekandidater for alle roller i faget. Å skrive hele People-listen på nytt under hver rolle ville derfor duplisere titusenvis av identiske oppføringer.

Katalogen bruker i stedet `category_pool_plus_role_deltas`:

- `people_pool.existing_place_people` – hele fagets eksisterende People med canonical `placeId`, lagret én gang.
- `people_pool.existing_other_people` – hele fagets øvrige eksisterende People, lagret én gang.
- `cross_category_existing_references` – eksisterende People fra andre kategorier som er eksplisitt relevante via canonical theory-binding.
- hver rolle arver disse poolene og lagrer bare `direct_person_ids`, `strong_person_ids`, `additional_existing_people` og `excluded_people`.

Dermed er den **resolved** listen per scenario fullstendig, men repoet slipper å lagre den samme personen på nytt for hver rolle. `resolved_counts` under rollen viser den ferdig oppløste dekningen.

## De fire listene

Når en rolle resolves, får den:

1. `existing_place_people` – eksisterende People som har en canonical `placeId`. Generatoren kopierer place-ID-en fra People og kan aldri finne på en ny stedstilknytning.
2. `existing_other_people` – eksisterende People uten place-ID, pluss eksplisitt relevante eksisterende personer fra annen People-kategori.
3. `excluded_people` – personer som ellers ville blitt fanget av fagkonteksten, men som eksplisitt ikke skal brukes i akkurat denne rollen.
4. `missing_people_candidates` – canonicale theory-/roleModel-personreferanser som ikke finnes i People ennå. Disse ligger på kategorinivå med `scenario_roles` som viser hvilke scenarioer de gjelder.

`missing_people_candidates` er en arbeidsliste, ikke automatisk autorisasjon til å opprette personen. Kandidaten må kildeverifiseres og få dokumentert stedstilknytning før eventuell materialisering.

Fiktive arbeidsaktører i `roleModel.related_people` skal merkes eksplisitt med
`"fictional": true`. Generatoren holder slike referanser utenfor canonical
People-oppløsning og mangellisten. De kan fortsatt brukes av Work Grammar,
mail/scener og Role World som løpende NPC-er, men skal aldri materialiseres som
historiske People bare fordi rollen trenger en kollega eller beslutningseier.

## Fit-nivåer

- `direct`: dokumentert, eksplisitt kuratert direkte rolleeksempel. Automatikk kan aldri lage dette nivået.
- `strong`: sterk scenariorelevans. Kan komme fra eksplisitt kuratering, canonical cross-category reference eller et tydelig tekstlig rolleterm-treff. `strong` betyr **ikke** at personen hadde nøyaktig samme stilling.
- `contextual`: samme faglige kontekst. Personen kan brukes som faktabasert kunnskaps-, quiz- eller oppgavemål, men er ikke et rolleeksempel.

Alle People i samme canonicale fagkategori tas med som minimum `contextual`. Dette gjør katalogen komplett som kandidatliste uten å overselge profesjonell likhet.

## Faktisitetsgrense

Reglene i `docs/FACTUALITY_CONTRACT.md` og `docs/CIVICATION_HISTORY_GO_TASK_SCHEMA.md` gjelder uendret:

- En virkelig historisk/offentlig person kan være førsteklasses People-, kunnskaps-, quiz- og `history_go_person`-mål.
- En slik person blir ikke en Civication-NPC av den grunn.
- Fri dialog, oppdiktede e-poster/meldinger, private tanker/motiver, fiktive relasjoner og løpende NPC-drama skal ligge hos fiktive eller klart fiksjonaliserte karakterer.
- Scenarioet kan ikke utvide en dokumentert profesjon. En psykiater blir for eksempel ikke psykolog fordi personen brukes i Psykologi-kontekst.
- Person–sted-bindinger er read-only fra People-canon og skal være kildeproven.

## Mangellisten

Generatoren går gjennom alle `theory_integrity_bindings*.json` under `data/fag/` og henter personbundne `theorist`-referanser. Hvis personen ikke finnes i `historyPeople_index.json` på ID eller normalisert navn, havner vedkommende i `missing_people_candidates` for faget. Det samme gjelder eksplisitte `related_people` og `required_knowledge.people_connections` i roleModels.

Kandidater dedupliseres, men beholder alle `sources`, `reasons` og `scenario_roles`. En ny teoretiker/forsker som gjøres canonical i Fagverket blir dermed automatisk synlig som People-gap dersom personen ennå ikke er materialisert.

## Doble roleModel-filer

Manifestet kan inneholde eldre filer som resolve til samme canonicale `role_id`. Generatoren beholder første manifestforekomst deterministisk og registrerer resten i `shadowed_role_models` i indeksen. Scenario-katalogen får derfor én canonical rad per `role_id`, ikke doble scenarioer.

## Genererte filer

- `data/Civication/scenarioPeople/generated/<category>.json` – fagets People-pool, mangelkandidater og rolle-deltaer.
- `data/Civication/scenarioPeople_index.json` – kompakt runtime-/audit-indeks med summer, shadowed roleModels og filpekere.

Genererte filer skal aldri redigeres for hånd. Endre People-canon, roleModel, theory-binding eller `overrides.json`, og regenerer.
