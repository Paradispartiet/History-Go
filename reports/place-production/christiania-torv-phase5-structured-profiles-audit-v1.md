# Christiania Torv – fase 5 strukturerte place-profiler v1

Dato: 2026-08-23  
Place ID: `christiania_torv`  
Baseline: `main` etter fase-4-merge `fe5cde4ef5c8e91b1ab2666ae8ccb3eb85052d4b`  
Styrende kontrakter: `docs/PLACE_PRODUCTION_CHECKLIST.md`, `docs/PLACE_STANDARD.md`, Content Factory Pilot 03 source pack.

## Tidligere-arbeid-gate

Fase 4 låste brukerteksten og v4.2-hashene. Fase 5 skal derfor ikke skrive description på nytt. Den materialiserer bare strukturer som allerede bæres av de samme reviewede kildene.

## `spatial_profile` — PASS

- eier er selve den navngitte plassflaten;
- OSM way `594329484` beholdes som `verified_named_square_geometry`;
- `r=150` brukes ikke som arealmål;
- `gamle_radhus` beholdes eksplisitt som separat canonical Place;
- Anatomigården/Rådmannsgården er relasjons-/byggkontekst, ikke synonym med torget.

## `temporal_profile` — PASS

Ni hovedmilepæler materialiseres som struktur: 1624, 1639, 1641, 1686, 1736, 1958, 1964, 1997 og 2003. Dette er ikke en parallell detaljchronology; feltet brukes som dataanker for de viktigste skiftene.

## `history_layers` — PASS

Fire place-eide historielag materialiseres:

1. **Torget i den nye Christiania-byen** – 1624–1640-årene;
2. **Marked, vann og offentlig myndighet** – 1640-årene–1736;
3. **Fra hovedtorg til Gammel-Torvet** – 1686–1958;
4. **Trafikk, rehabilitering og hansken** – 1964–2003.

Lagene sammenfatter dokumenterte skifter uten å overta bygningenes egne historier eller erstatte Story.

## `subplaces` — BEGRUNNET N/A

Source packen dokumenterer ikke stabile navngitte interne soner inne på torget som bør materialiseres som subplaces. Vannkunst, strafferedskaper og fontenen er Objects-/historielag, mens omkringliggende bygg er separate objekter/Places.

## `nature_profile` — BEGRUNNET N/A

Christiania Torv er et urbant torg, ikke et naturfaglig sted. Vegetasjon eller fontene åpner ikke en Nature-flate uten stedsspesifikk biologisk evidens.

## `source_summary` — PASS

Fem sikre kildelabels materialiseres: Oslo byleksikon, to Oppdag Kvadraturen/Byantikvaren-flater, SNL og OSM-geometrien. Klikkbare URL-er ferdigstilles i senere Kilder-/popupfase; interne rapporter blir ikke brukerkilder.

## Bevaring

Fase 5 bevarer fase-4 `desc` og `popupDesc` byte-for-byte og endrer ikke production packet, teksthash, bilde, koordinater, kategori eller emner.

## Konklusjon

**KLAR FOR REVIEW.** Etter grønn merge går stedet videre til Story/historisk opplevelse, med eksplisitt søk etter eksisterende `stories_christiania_torv` før noe nytt opprettes.
