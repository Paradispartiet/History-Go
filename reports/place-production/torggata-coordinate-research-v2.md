# Torggata – coordinate research V2

- Dato: 2026-08-11
- Place ID: `torggata`
- Fase: 3 – koordinat, anker, radius og geometry
- Branch base: `2f96e793229d1ee818db1cb0d98f59bd1b9c4f4f`
- Status: **RESEARCH LÅST – canonical coordinate-endring ikke utført i denne del-PR-en**

## LES FØRST gjennomført

Før coordinate-beslutningen ble disse lest i rekkefølge:

1. `docs/coordinates/README.md`
2. `docs/coordinates/coordinate-source-contract-v1.md`
3. `docs/coordinates/coordinate-evidence-files-v1.md`
4. `docs/coordinate-finder.md`
5. `docs/coordinates/coordinate-control-protocol.md`
6. `docs/coordinates/address-first-coordinate-policy.md`

Kontraktene fastslår at Torggata er et lineært sted og ikke skal reduseres til et tilfeldig adressepunkt. `verified_geometry` krever et dokumentert line-/geometry-anker, sporbar kildeidentitet og ærlig representasjon av hele place-objektet.

## Identiteten som skal representeres

Canonical place-identitet beholdes:

**Torggata i Oslo fra Stortorvet til Ankertorget.**

Oslo byleksikon dokumenterer uttrykkelig:

- Torggata går fra Stortorvet til Ankertorget;
- strekningen Stortorvet–Youngstorget ble opparbeidet som Øvre Torvegade i 1846;
- gaten ble ført videre fra Youngstorget i 1857 og helt frem i 1876.

Oslo byleksikons Youngstorget-artikkel sier uttrykkelig at torget **krysses av Torggata**. Place-identiteten skal derfor ikke snevres inn til Youngstorget–Ankertorget for å passe dagens OSM-komponent.

## Feilårsaken i forrige coordinate-batch

Den lagrede Overpass-responsen fra 2026-07-25 inneholder 13 OSM ways med `name=Torggata`, men forskningsalgoritmen fant to navngitte connected components og valgte bare den største komponenten på 12 ways.

Den valgte komponenten dekker den nordlige delen fra like nord for Youngstorget til Ankertorget og har 574,5 meter ordnet navngitt geometri.

Den utelatte navngitte way-en er:

- `osm-way:267226140`
- `name=Torggata`
- `highway=pedestrian`
- sørenden: ca. `59.91288, 10.7460624` ved Stortorvet
- nordenden: ca. `59.9144506, 10.7486146` ved Youngstorget
- `wikidata=Q19392794`

Dermed er Stortorvet-delen faktisk til stede i den samme lagrede OSM-researchen. Den ble ikke tatt med fordi algoritmen valgte «largest connected named component», ikke fordi canonical Torggata stopper ved Youngstorget.

## Hvorfor de to navnekomponentene er skilt i OSM

Youngstorget modelleres i OSM som eget torg-/pedestrian-areal (`osm-way:112054930`). Ekstern kontroll 2026-08-11 viser fortsatt dette OSM-objektet som Youngstorget, omtrent ved `59.91478, 10.74923`.

Det gir et kartteknisk gap mellom:

- den sørlige navngitte Torggata-way-en `267226140`;
- den nordlige navngitte Torggata-komponenten som starter ved `osm-way:480987739`.

Oslo byleksikon dokumenterer samtidig at Torggata krysser Youngstorget. Gapet er derfor et **OSM-modelleringsgap gjennom et torgareal**, ikke et fysisk eller historisk brudd i Torggata.

## Ytterligere feil i dagens canonical coordinate-data

Dagens place har to `anchors` som er feilmerket/reversert:

- koordinatet `59.9186126, 10.7573038` er merket «Torggata sør – Youngstorget», men ligger ved den nordlige enden mot Ankertorget;
- koordinatet `59.9151042, 10.7498145` er merket «Torggata nord – Ankertorget», men ligger ved den sørlige enden av den valgte nordkomponenten, ved Youngstorget.

Dagens `coordNote`, `sourceHint`, `sourceObjectId` og tolv `routeSegments` beskriver dermed bare en del av canonical place-objektet.

## Låst coordinate-beslutning for neste delsteg

Neste delsteg i fase 3 skal **ikke** syntetisere en falsk eksakt gategeometri gjennom Youngstorget og skal **ikke** beholde den ufullstendige 12-way-kjeden som om den representerte hele Torggata.

Den robuste kontraktløsningen er:

1. behold `locatorType: street`;
2. behold `coordStatus: verified_geometry` bare dersom ny source/evidence-kjede passerer validatorene;
3. bruk `geocodeAccuracy: semantic_anchor` og `coordRole: line_anchor`;
4. bruk Youngstorget-krysset som dokumentert semantisk hovedanker fordi det både er fysisk del av gateløpet og det historiske skillet mellom 1846- og 1857-etappene;
5. lagre eksplisitte ankre for:
   - sør: Stortorvet / sørlig Torggata-way `267226140`;
   - midt: Youngstorget / OSM-areal `112054930`;
   - nord: Ankertorget / nordlig Torggata-komponent;
6. fjern eller erstatt dagens `routeSegments` slik at ingen ufullstendig delkjede presenteres som «hele gateløpet»;
7. oppdater coordinate-evidence med både sørlig navngitt way, Youngstorget-gapet og nordlig komponent;
8. korriger de reverserte anchor-navnene;
9. behold `r: 180` som gameplay-radius med mindre runtime-/kartkontroll viser et eget gameplayproblem; radius er ikke påstått gateutstrekning.

## Hva denne research-PR-en ikke gjør

Denne del-PR-en endrer ikke:

- `lat` / `lon`;
- `coordStatus`;
- `anchors`;
- `routeSegments`;
- coordinate-evidence;
- generated places-index;
- brukerrettet place-tekst;
- fagkoblinger, quiz eller Stories.

Den låser bare feilårsak og korrekt implementeringsstrategi før canonical source endres.

## Porter som kreves i neste delsteg

Når coordinate-data faktisk endres skal minst følgende kjøres og lagres:

```text
npm run test:coordinate-source-contract
npm run places:coords:evidence:audit
npm run places:coords:quality
npm run places:coords:intake
npm run audit:places-split-manifest-sync
npm run places:index:check
```

Deretter skal markøren kontrolleres visuelt i kartet og coordinate-control-protokollen oppdateres før fase 3 kan godkjennes.
