# Torggata – fase 8A1 People audit V1

- Dato: 2026-08-11
- Place ID: `torggata`
- Baseline: PR #4830 / main `6880ec6da9e51669471b9f028e50382afeb53bd1`
- Overordnet audit: `reports/place-production/torggata-phase8a-people-audit-v1.md`
- People-metode: `docs/people-of-places-method.md`
- People-profil: `docs/PEOPLE_PROFILE_CANONICAL.md`
- Status: **KLAR FOR REVIEW**

## Tidligere-arbeid- og duplikatgate

Repo-søket ved batchstart fant ingen aktiv canonical People-profil for Thøger Binneballe, Harald Olsen, Alma Fahlstrøm eller Johan Fahlstrøm. De fire eksisterende profilene Thorvald Meyer, Henrik Bull, Christian Morgenstierne og Arne Eide gjenbrukes og beholder sine primærankere.

Batchen fyller ikke til et måltall. Åtte personer inngår fordi de dekker dokumenterte, vesentlige roller i Torggatas institusjonshistorie.

## Eksisterende profiler som gjenbrukes

| Person | Endring | Kilde |
| --- | --- | --- |
| Thorvald Meyer | `torggata` legges til i `places`; primæranker beholdes | Oslo byleksikon – Torggata bad |
| Henrik Bull | `torggata` legges til i `places`; primæranker beholdes | Oslo byleksikon – Fahlstrøms Theater |
| Christian Morgenstierne | `torggata` legges til i `places`; Folketeateret beholdes som primæranker | Oslo byleksikon – Torggata bad |
| Arne Eide | `torggata` legges til i `places`; Folketeateret beholdes som primæranker | Oslo byleksikon – Torggata bad |

## Nye canonical People v1-profiler

| Person | Torggata-rolle | Årsanker |
| --- | --- | --- |
| Thøger Binneballe | oppførte Bade- og Vadskeanstalten i Torggata 16 for Thorvald Meyer | 1861 |
| Harald Olsen | tegnet varietéteateret Eldorado i Torggata 9 | 1891 |
| Alma Fahlstrøm | drev Fahlstrøms Theater i Torggata 9 og iscenesatte de fleste oppsetningene | 1903 |
| Johan Fahlstrøm | drev Fahlstrøms Theater i Torggata 9, spilte hovedroller og tegnet dekorasjoner/kostymer | 1903 |

Alle fire nye profiler har `people_profile_v1.0`, egen claims-fil, felt–claim-paritet, setning–claim-paritet, inspectable HTTPS-kilder og tomme bildeplasser fremfor udokumenterte portretter.

## Inspectable kilder

- Oslo byleksikon – Torggata bad: https://oslobyleksikon.no/index.php/Torggata_bad
- Oslo byleksikon – Eldorado: https://oslobyleksikon.no/side/Eldorado_kino
- Oslo byleksikon – Fahlstrøms Theater: https://oslobyleksikon.no/side/Fahlstr%C3%B8ms_Theater
- Store norske leksikon – Harald Olsen: https://snl.no/Harald_Olsen
- Store norske leksikon – Alma Isabella Fahlstrøm: https://snl.no/Alma_Isabella_Fahlstr%C3%B8m
- Store norske leksikon – Johan Fahlstrøm: https://snl.no/Johan_Fahlstr%C3%B8m

## Avgrensning

Ingen Jensen-profiler fra 8A2 og ingen beboer-/minnesporprofiler fra 8A3 produseres i denne batchen. Ingen eksisterende primæranker flyttes. Ingen bilder diktes eller kopieres uten lisenskjede.

## Regresjonslås og gate

`tests/torggata-phase8a1-people.test.mjs` låser:

1. nøyaktig én manifest-lastet canonical record for hver av de åtte personene;
2. `torggata` i `places` for alle åtte;
3. People v1 + claims for de fire nye;
4. bevaring av eksisterende primærankere;
5. runtime-kontrakten som samler personer via direkte place-referanser.

Batchen committes bare etter at følgende passerer på samme tree:

```text
npm run audit:people-profile-canonical
npm run audit:people-of-places
npm run civication:history-people:check
node --test tests/torggata-phase8a1-people.test.mjs
npm run tools:check
```

Neste port etter merge er **8A2 – Jensen-familiens gatehandel**.
