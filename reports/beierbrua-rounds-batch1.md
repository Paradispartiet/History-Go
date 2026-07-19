# Beierbrua – PlaceCard rounds batch 1

Dato: 2026-07-19

## Avgrensning

Batchen fyller Beierbruas kanoniske `by`-rundinger uten å endre koordinat, radius eller coordinate-source metadata.

## Kildegrunnlag

- Store norske leksikon, **Beierbrua**.
- Oslo byleksikon, **Beierbrua**.
- Store norske leksikon, **Oskar Braaten**.
- Eksisterende History Go-steder `oscar_braaten_statuen` og `honse_lovisas_hus`.

## Databeslutninger

- `year` rettes fra `1889` til `1837`, året broen ble nybygd som kjørebro.
- Koordinater og radius beholdes urørt; eventuell koordinatkontroll tilhører den separate koordinat-workstreamen.
- Eksisterende canonical `oskar_braaten` gjenbrukes. `oscar_braaten_statuen` forblir personens primære fysiske minneanker, mens Beierbrua kobles som litterært sted og ikke som påstått bosted.
- `Skulder ved skulder (Fabrikkjentene)` av Ellen Jacobsen behandles som et stedsspesifikt verk ved broen.
- Hønse-Lovisas hus forblir et separat canonical sted og gjenbrukes som relatert sted.
- Nature-rundingen beholdes fordi selve gameplay-objektet er en bro over Akerselva og gir direkte kontakt med elverommet. Det legges ikke inn udokumenterte arter.

## Akerselva split-sikkerhet

Som i Kuba-batchen skal hele Akerselva-ruten **ikke** fullsplittes fra den eldre aggregate-filen. Bare disse route-elementene oppdateres:

- `beierbrua.json`
- Beierbrua-raden i route index
- Beierbrua-radens hash i split-manifestet

Ingen andre Akerselva-place-filer skal endres.

## Rundinger

Canonical `by`-profil:

1. Personer
2. Natur
3. Merker
4. Verk
5. Civication
6. Aktører
7. Før / nå
8. Fortellinger
9. Leksikon

## Sluttstatus

Den materialiserte sluttstaten har målrettet test, PlaceCard-rundingaudit, People-of-Places-kontroll, place-index-kontroll, split-manifest-kontroll, JSON-parse og `git diff --check` lagret i batchens valideringsmappe. Midlertidige workflow- og finalizerfiler er fjernet fra PR-diffen.
