# Youngstorget – fase 3 koordinater/geometri prior-work gate V1

- Dato: 2026-08-23
- Place ID: `youngstorget`
- Baseline `main`: `694cef96d85e3ba3ea09ec6f6d83f183bff0bdd4`
- Canonical place: `data/places/politikk/oslo/places_politikk/youngstorget.json`
- Coordinate evidence: `data/coordinate-evidence/oslo/politikk/youngstorget.json`
- Coordinate protocol: `docs/coordinates/coordinate-control-protocol.md`
- Status: **ALLEREDE FERDIG – INGEN KOORDINATENDRING**

## 1. Tidligere arbeid

Den eksisterende coordinate-evidence-filen er allerede anvendt på canonical Place og sier:

- `evidenceStatus: applied_to_place`;
- `coordStatus: verified_geometry`;
- `coordType: square_center`;
- kildeobjekt: `osm-relation:12773689` / OpenStreetMap – Youngstorget;
- eksakt navngitt fysisk objekt i lokal scope;
- fysisk type `highway/pedestrian` med polygongeometri;
- representasjonspunkt beregnet fra kildegeometrien;
- resolved identity: `Youngstorget som fysisk torg og offentlig byrom`;
- `requiresSplit: false`;
- `canBecomeVerified: true` og nextAction sier at kildeobjekt/representasjonspunkt allerede er anvendt på canonical Place.

Canonical Place bruker samme punkt og source metadata:

- lat `59.9148777657128`;
- lon `10.748995479003364`;
- radius `150`;
- `coordStatus: verified_geometry`;
- `coordSource: OpenStreetMap relation 12773689 – Youngstorget`;
- `coordType: square_center`.

Det finnes dermed ikke et åpent coordinate gap som Content Factory-piloten skal «løse» på nytt.

## 2. Regresjonssøk

Fase 0–2 av Pilot 01 har ikke endret:

- canonical koordinater;
- coordinate-evidence;
- OSM source object;
- radius;
- coordinate type/status;
- place identity som fysisk torg.

Fase 1 har tvert imot eksplisitt bekreftet samme place-identitet: selve Youngstorget som offentlig torg/byrom, ikke nabobygg eller gater.

Ingen konkret regresjonsevidens er funnet som tilsier ny geokoding, nytt nearest-hit-søk, nytt source object eller nytt representasjonspunkt.

## 3. Kontraktsvurdering

Koordinatprotokollen sier at `verified_geometry` betyr at stedet oppfyller coordinate-source-kontrakten, og at senere kontroller bare skal endre eksisterende godkjent koordinat når en ny kontroll faktisk avdekker endret koordinat eller identitet.

Content Factory-regelen om deterministic-first og prior-work gjelder derfor direkte her: å hente nye koordinater ville være dobbeltarbeid og samtidig øke risikoen for å erstatte et eksakt, semantisk riktig source object med svakere geokoding.

## 4. Beslutning

```text
SUBSYSTEM: coordinates/geometry
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE TILSTAND: verified_geometry / osm-relation:12773689 / square_center
CANONICAL SOURCE ↔ EVIDENCE PARITY: PASS
IDENTITY PARITY: PASS
KONKRET REGRESJONSEVIDENS: INGEN
KLASSIFISERING: ALLEREDE FERDIG
KOORDINATENDRING: NEI
NY GEOKODING: NEI
NYTT SOURCE OBJECT: NEI
```

Fase 3 skal derfor lukkes uten canonical coordinate mutation.

Neste aktive fase etter merge er **fase 4 – kategori, Badges, emner og Fagverk**. Der skal eksisterende `politikk`, underbadges og tre `em_pol_*` behandles med samme prior-work-gate: behold det som faktisk er korrekt og runtime-koblet; produser bare reelle hull/regresjoner.