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

## De fire listene

Hver rolle får:

1. `existing_place_people` – eksisterende People som har en canonical `placeId`. Generatoren kopierer place-ID-en fra People og kan aldri finne på en ny stedstilknytning.
2. `existing_other_people` – eksisterende People uten place-ID, eller eksisterende personer i en annen People-kategori som er eksplisitt relevante gjennom canonical theory-/roleModel-reference.
3. `excluded_people` – personer som ellers ville blitt fanget av fagkonteksten, men som eksplisitt ikke skal brukes i akkurat denne rollen.

På kategorinivå finnes i tillegg:

4. `missing_people_candidates` – canonicale theory-/roleModel-personreferanser som ikke finnes i People ennå. Dette er en arbeidsliste, ikke automatisk autorisasjon til å opprette personen. Kandidaten må kildeverifiseres og få dokumentert stedstilknytning før eventuell materialisering.

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

Dette betyr at en ny teoretiker/forsker som gjøres canonical i Fagverket automatisk blir synlig som People-gap dersom personen ennå ikke er materialisert.

## Genererte filer

- `data/Civication/scenarioPeople/generated/<category>.json` – komplette personlister per rolle.
- `data/Civication/scenarioPeople_index.json` – kompakt runtime-/audit-indeks med summer og filpekere.

Genererte filer skal aldri redigeres for hånd. Endre People-canon, roleModel, theory-binding eller `overrides.json`, og regenerer.
