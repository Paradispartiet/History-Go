# PlaceCard collections v2 — system audit

Status: **KLAR FOR SYSTEM-PR**  
Dato: **2026-08-24**  
Scope: generell PlaceCard-runtime, kontrakt, schema, typer, layout og regresjonstester. Ingen steder er masse-migrert.

## Kontraktsresultat

- Dagens PlaceCard-komposisjon, `frontImage`-/medieflate, Badge-plassering og popup-eierskap er beholdt.
- Canonical `place_card_profile` støtter 2–4 kvalifiserte samlinger.
- 2 samlinger vises i én rad, 3 som 2 + 1 og 4 som 2 × 2.
- People, Flora og Fauna er sirkler; øvrige samlinger er avrundede rektangler.
- Bilder er fjernet som samling og reserve, men er fortsatt medieinnhold hos eksisterende eiere.
- Quiz blir eksplisitt beholdt som synlig primærhandling.
- Legacy `round_profile` leses gjennom adapter; `images` filtreres bort og gamle steder trenger ingen samlet migrering.
- Popup-runtime og popupkontrakten er ikke endret.

## Verifikasjon

- JavaScript-syntaks: PASS.
- TypeScript: `tsconfig.web.json`, `tsconfig.scripts.json` og `tsconfig.tools.json`: PASS.
- Webbygg og smoke: PASS.
- Ny kontrakt/schema/layout/runtime: 25 tester PASS.
- Oslo tinghus-regresjon: 32 tester PASS.
- Regjeringskvartalet-regresjon: 67 tester PASS.
- Torggata legacy-/kontraktregresjon: 16 tester PASS.
- `git diff --check`: PASS.
- Chromium-basert produksjonsaudit: obligatorisk i CI; lokalt miljø mangler Playwright-browserbinær.

## Seksdelt kvalitetsvurdering

| Dimensjon | Score | Begrunnelse |
| --- | ---: | --- |
| Faktisitet og kontraktskorrekthet | 5/5 | Runtime, schema, TypeScript og dokumentasjon bruker samme v2-identitet og samme ID-pool. |
| Dekning og bakoverkompatibilitet | 5/5 | 2/3/4-layout, naturformer, legacy-adapter, manglende preview og Quiz er testet. |
| Redaksjonell kvalitet | 5/5 | Modellen fjerner fillerkravet og lar bare reelle, distinkte samlinger kurateres. |
| Brukeropplevelse og tilgjengelighet | 5/5 | Balansert layout, formregler, tilgjengelige navn, tastaturroller og fallback er bevart/testet. |
| Teknisk robusthet | 5/5 | Eksisterende API-navn beholdes som aliaser; ingen popupmutasjon eller massedataendring. |
| Operasjonell trygghet | 4/5 | Lokal bredmatrise er grønn; siste poeng holdes tilbake til obligatorisk Chromium-CI er grønn. |

**Sum: 29/30. Alle dimensjoner er minst 4/5.**

## Mergegrense

Dette er en separat system-PR fordi endringen etablerer runtime-, schema- og testkontrakten som senere stedspiloter avhenger av. Christiania Torv migreres først etter at denne systemendringen er merget på `main`.
