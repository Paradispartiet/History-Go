# Torggata – coordinate QA V3

- Dato: 2026-08-11
- Place ID: `torggata`
- QA-baseline: `main` etter PR #4800, merge `9241478a2a0f9b1fa1f7165ad9508a73d997dbfd`
- Status: **DATA-/KILDE-/RUNTIME-QA PASS; INTERAKTIV HISTORY-GO-BROWSER-QA GJENSTÅR**

## 1. Canonical source vs generated runtime

Canonical `data/places/by/oslo/places/torggata.json` og generated `data/places/places_index.json` har samme coordinate-identitet:

- lat/lon: `59.91478, 10.74923`;
- `locatorType: street`;
- `sourceProvider: osm`;
- `sourceObjectId: osm-way:112054930`;
- `geocodeAccuracy: semantic_anchor`;
- `coordRole: line_anchor`;
- `coordType: street_semantic_anchor`;
- `coordStatus: verified_geometry`;
- `coordVerifiedAt: 2026-08-11`.

Dette retter paritetsfeilen som ble oppdaget etter PR #4799.

## 2. Maskinelle coordinate-porter

One-shot coordinate runner run `31464230957` fullførte med success:

- rebuild runtime place index;
- split-manifest sync;
- place-index sync;
- Coordinate Source Contract;
- coordinate quality;
- strict coordinate intake;
- coordinate evidence;
- place health;
- `git diff --check`.

PR #4800 ble deretter squash-merget til `main`.

## 3. Identitet og nærliggende canonical markører

### Torggata

Hovedankeret er Youngstorget som semantisk line-anchor for hele canonical gateløpet Stortorvet–Ankertorget. Sør-/midt-/nordankrene beholder full gateidentitet uten å konstruere en falsk centerline gjennom Youngstorget.

### Youngstorget

Canonical `youngstorget` er et eget `square`-objekt med markør omtrent `59.9148778, 10.7489955`. Torggata og Youngstorget er derfor fysisk overlappende, men semantisk forskjellige objekter: gate gjennom torg vs selve torgflaten. Nærheten er tilsiktet og er ikke grunnlag for deduplisering.

### Storgata

Canonical `storgata` har eget dokumentert gateløp og eget street geometry midpoint omkring `59.9149052, 10.7543757`. Det er ikke samme place-objekt som Torggata.

## 4. Browser-/kartgate

GitHub Pages er repoets offentlige produksjonsflate, men denne agentkjøringen har ikke en HTML-browser som kan åpne og visuelt inspisere den interaktive History-Go-kartflaten. Direkte nettverksforsøk fra den lokale kjøringen feiler også på DNS, og web-verktøyet kan ikke åpne en ikke-indeksert Pages-URL direkte.

Derfor er følgende **ikke** påstått utført:

- visuelt se Torggata-markøren i History-Go-kartet;
- klikke markøren og bekrefte korrekt PlaceCard i faktisk browser;
- kontrollere markørkollisjon/zoomoppførsel visuelt mot Youngstorget.

Dette er siste åpne gate i coordinate-fase 3. Data-/runtime-sannheten er kontrollert og protokollført, men fasen skal ikke få samlet GODKJENT før denne browserkontrollen er faktisk gjennomført.
