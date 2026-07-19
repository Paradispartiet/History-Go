# Blå skilt i Oslo — 2026 delta closure

Dato: 2026-07-19

## Formål

Denne rapporten lukker det avgrensede 2026-deltaet for nye Blå skilt i Oslo som ble identifisert i april–mai 2026.

Deltaet besto av fem nye minnepunkter:

1. Aud Schønemann — Vetlandsveien 69D
2. Stein Mehren — Ullevålsveien 60
3. Christopher Hornsrud — Mogens Thorsens gate 5
4. Helverschous løkke — Munkedamsveien 35
5. Enerhaugens Samfund — skilt ved dagens Smedgata 34

## Place-integrasjon

PR #2505 — `Add Oslo blue plaques 2026 delta batch 1`

Alle fem ble integrert som canonical offentlige minnepunkter for selve det blå skiltet.

Representasjonsregelen er:

- det offentlige skiltet/minnestedet er gameplay-objektet;
- private boliger presenteres ikke som offentlig tilgjengelige besøkssteder;
- dagens bygning skal ikke feilaktig fremstilles som en revet historisk bygning;
- et Geonorge-adressepunkt fungerer som dokumentert skilt-/adresseanker, ikke som påstand om millimeterpresis skiltplassering;
- dersom en senere Blå skilt-kandidat allerede har en bedre canonical parent, skal parenten berikes i stedet for å få en dublettmarkør.

### Nye place-ID-er

- `bla_skilt_aud_schonemann_vetlandsveien_69d`
- `bla_skilt_stein_mehren_ullevalsveien_60`
- `bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5`
- `bla_skilt_helverschous_lokke_munkedamsveien_35`
- `bla_skilt_enerhaugen_samfund_smedgata_34`

## Historiske guardrails

### Helverschous løkke

Det historiske løkkehuset er revet. Recorden representerer dagens blå skilt ved Munkedamsveien 35 som et fysisk minneanker og beskriver den forsvunne løkken som historisk lag.

### Enerhaugens Samfund

Dagens blå skilt står ved Smedgata 34, mens eldre kilder knytter den revne Samfund-bygningen til Smedgata 38. Dataene bevarer denne adresseforskjellen eksplisitt og bruker dagens skiltadresse som minneanker.

## People-integrasjon

### Aud Schønemann

Aud Schønemann fantes allerede som canonical person. PR #2505 beholdt `nrk_huset_marienlyst` som primær `placeId` og la det nye blå skiltet til i `places[]`.

### Stein Mehren og Christopher Hornsrud

PR #2507 — `Add Stein Mehren and Christopher Hornsrud people links`

La til to manglende canonical personer som egne per-person-filer:

- `stein_mehren` → primært `bla_skilt_stein_mehren_ullevalsveien_60`
- `christopher_hornsrud` → primært `bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5`, med `stortinget` som tilleggspunkt

Begge filene er registrert i `data/people/manifest.json`.

## Validering

Place-batch:

- strict-new coordinate intake: 0 blocking, 0 warnings
- canonical emne validation: 0 manglende ID-er, 0 duplicate place IDs
- split-manifest sync: pass
- coordinate source contract: pass
- runtime integration: 5/5 nye IDs nøyaktig én gang
- ingen health error/warning refererte noen av de fem nye ID-ene

People-batch:

- nye canonical person-ID-er unike
- alle `placeId`- og `places[]`-referanser løser
- People-of-Places gate: pass
- visuelle designkoder registrert
- ingen unødvendig endring av de store aggregate people-filene

## Sluttstatus

2026-deltaet er behandlet 5/5 på place-nivå og 3/3 på personnivå for de tre navngitte personskiltene.

Det finnes ingen kjent ubehandlet kandidat i dette avgrensede april–mai 2026-deltaet.

Senere nye Blå skilt skal behandles som en ny delta-audit mot denne baselinen, ikke ved å starte hele Oslo-skiltbestanden på nytt.
