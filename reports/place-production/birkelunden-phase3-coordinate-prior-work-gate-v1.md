# Birkelunden – fase 3 koordinater/geometri prior-work gate V1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Baseline `main`: fase-2 merge `61bcf3e1dc0156582eb1e3bd9bfcee6d9ba05c06`
- Canonical place: `data/places/by/oslo/places/birkelunden.json`
- Coordinate evidence: `data/coordinate-evidence/oslo/by/birkelunden.json`
- Coordinate protocol: `docs/coordinates/coordinate-control-protocol.md`
- Status: **ALLEREDE FERDIG – INGEN KOORDINATENDRING**

## 1. Tidligere arbeid

Birkelundens eksisterende coordinate-evidence er allerede anvendt på canonical Place og dokumenterer:

- `evidenceStatus: applied_to_place`;
- `coordStatus: verified_geometry`;
- `coordType: park_anchor`;
- source object `osm-way:3236549` / OpenStreetMap way 3236549 – Birkelunden;
- named `leisure=park`-polygon som identifiserer selve parkrommet;
- representasjonspunkt `59.92634, 10.76013` med `coordRole: area_anchor`;
- radius `190` i canonical Place;
- resolved identity: `det avgrensede parkrommet ved Thorvald Meyers gate og Paulus plass`;
- `identityStatus: resolved`;
- `requiresSplit: false`;
- Oslo kommune som uavhengig identitets-/avgrensningskontroll;
- eksplisitt skille mot Birkelunden holdeplass, Paulus' plass og Paulus kirke;
- `canBecomeVerified: true`, uten blokkering, og `nextAction` sier at kildekontrakt og representasjonsanker allerede er anvendt på canonical Place.

Canonical Birkelunden bruker samme coordinate metadata:

- lat `59.92634`;
- lon `10.76013`;
- radius `190`;
- `coordStatus: verified_geometry`;
- `coordType: park_anchor`;
- `coordSource: OpenStreetMap way 3236549 – Birkelunden`;
- `coordSourceId: osm-way:3236549`;
- `coordSourceUrl: https://www.openstreetmap.org/way/3236549`.

Det finnes dermed ikke et åpent coordinate gap som Pilot 02 skal skape nytt arbeid for.

## 2. Protokollparitet

Den canonical koordinatprotokollen fører Birkelunden som:

```text
batch 15 | birkelunden | Birkelunden | verified_geometry | osm-way:3236549
```

Protokollen sier samtidig at `verified_geometry` betyr at stedet oppfyller coordinate-source-kontrakten, og at en senere kontroll bare skal endre en godkjent koordinat/identitet når ny kontroll faktisk avdekker at koordinat eller identitet må endres.

Det er ingen slik regresjon her.

## 3. Identitetsparitet mot fase 1–2

Fase 1 låste `birkelunden` som **selve den 16,3 dekar store parken**, ikke det ca. 116 dekar store Birkelunden kulturmiljøet, Paulus' plass, Paulus kirke, Grünerløkka skole eller andre nabosteder.

Den identiteten er konsistent med coordinate-evidence:

- OSM-kildeobjektet er parkpolygonet;
- representasjonspunktet ligger som parkanker;
- evidensnotatet avgrenser mot Paulus' plass/kirke og holdeplass;
- source/claim-pakken i fase 2 gjenbruker samme OSM-proveniens bare som geometri/identitet, ikke historisk eller redaksjonell kilde.

Fase 1–2 har derfor styrket, ikke svekket, den eksisterende coordinate-beslutningen.

## 4. Regresjonssøk

Fase 0–2 av Content Factory Pilot 02 har ikke endret:

- canonical `lat` / `lon`;
- radius;
- `coordType`;
- `coordStatus`;
- `coordSource` / `coordSourceId` / `coordSourceUrl`;
- coordinate-evidence-filen;
- OSM source object;
- identity/split-status;
- coordinate protocol row.

Ingen konkret regresjonsevidens er funnet som tilsier:

- nytt nearest/first-hit-søk;
- ny adressegeokoding;
- nytt source object;
- nytt representasjonspunkt;
- ny radius;
- place-split.

## 5. Deterministic-first / prior-work-vurdering

Content Factory-kontrakten krever at eksisterende canonical research og IDs søkes før nytt arbeid. Koordinatprotokollen sier samtidig at en allerede `verified_geometry`-kontroll ikke skal erstattes uten reell korrigerende evidens.

Ny geokoding nå ville derfor være:

1. dobbeltarbeid;
2. i strid med prior-work-gaten;
3. en risiko for å degradere et semantisk korrekt parkpolygon til et svakere punkt-/adressehit;
4. uten ny bruker- eller datakvalitetsverdi.

Riktig handling er å bevare den godkjente coordinate-kjeden.

## 6. Beslutning

```text
SUBSYSTEM: coordinates/geometry
TIDLIGERE-ARBEID-SØK: UTFØRT
SISTE GODKJENTE TILSTAND: verified_geometry / osm-way:3236549 / park_anchor
COORDINATE EVIDENCE: applied_to_place
CANONICAL SOURCE ↔ EVIDENCE PARITY: PASS
PROTOKOLLPARITET: PASS
IDENTITY PARITY MOT FASE 1–2: PASS
KONKRET REGRESJONSEVIDENS: INGEN
KLASSIFISERING: ALLEREDE FERDIG
KOORDINATENDRING: NEI
NY GEOKODING: NEI
NYTT SOURCE OBJECT: NEI
NYTT REPRESENTASJONSPUNKT: NEI
PLACE SPLIT: NEI
```

Fase 3 lukkes derfor uten canonical coordinate mutation.

## 7. Bevisst ikke endret

- `data/places/by/oslo/places/birkelunden.json`;
- `data/coordinate-evidence/oslo/by/birkelunden.json`;
- coordinate protocol;
- source/claim pack;
- `desc` / `popupDesc`;
- Nature;
- People/Objects/Brands;
- Quiz/Stories/Lesespor;
- runtime.

## 8. Neste fase

Etter grønn CI/merge er neste aktive fase **4 – kategori, Badges, emner, Fagverk og Nature-eierskap**.

Fase 4 skal bruke samme prior-work-regel på:

- canonical kategori `by`;
- eksisterende `em_by_parker_som_sosial_infrastruktur`;
- eksisterende `em_by_opphold_vs_gjennomgang`;
- eventuelle relevante By-underbadges;
- faktisk Fagverk/materialization/runtime-kobling;
- eksisterende `nature_profile`, som ikke automatisk gjør Birkelunden til et Nature-round-place og heller ikke skal regnes ferdig uten kilde-/eierskapsaudit.