# Christiania Torv — PlaceCard collections v2 pilot

Dato: **2026-08-24**

Place ID: `christiania_torv`

Baseline: system-PR #5295 og Objects fallback-reparasjon #5296 på faktisk `main`

Status: **KLAR FOR PILOT-PR**

## Prior work og scope

Christiania Torv ble ikke restartet. Fase 1–10, source pack, nullmåling, canonical innhold, popup, Story, Quiz, Knowledge, People, Object, relasjoner og slutt-audit var allerede merget. Piloten migrerer bare den godkjente PlaceCard-beslutningen fra legacy `round_profile` til canonical v2-profil og revaliderer hele stedsflaten.

Birkelunden og andre steder er ikke endret.

## Canonical PlaceCard-beslutning

```text
people · objects · related
```

- **People:** Wenche Gulbransen er canonical, kildebundet og direkte koblet til torget.
- **Objects:** fonteneskulpturen «Christian IVs hanske» er et dokumentert fysisk, stedsspesifikt objekt. Eget egnet previewbilde mangler, så samlingen bruker ærlig ikon/antall-fallback.
- **Relaterte steder:** fem curated canonical relasjoner med dokumentert historisk eller romlig forbindelse.
- **Brands:** åtte gamle virksomhetskoblinger manglet dokumentert ferskhet og eksakt plass-eierskap og er fortsatt holdt tilbake.
- **Fjerde samling:** ikke opprettet. Ingen Brands, Structures eller annen samling brukes som layoutfyll.
- **Bilder:** beholdes i place-medieflaten og hos sine eksisterende eiere, aldri som samling.
- **Quiz:** 5 × 7 = 35 spørsmål beholdes som tydelig primærhandling; alle spørsmål er Knowledge-linked.

## Runtime- og UI-resultat

- profilkilde: `place_card_profile_v2`;
- layout: 3 samlinger som 2 + 1 med siste samling sentrert;
- former: People er sirkel; Objects og Relaterte steder er avrundede rektangler;
- Objects-popup: 1 reelt element;
- Relaterte steder-popup: 5 reelle elementer;
- Brands er skjult;
- Quiz er synlig og har `pc-action-primary`;
- popupkoden er ikke endret av piloten.

## QA

- canonical profil/schema/ingen filler: PASS;
- People/Object/relasjons-eierskap: PASS;
- popup-/historie-/kilde-/bildebevaring: PASS;
- Christiania Torv-posten i `places_index.json` avstemt mot canonical `desc`, `image` og `cardImage`: PASS;
- Quiz 5 × 7 og Knowledge-linking: PASS;
- deterministisk Quiz-kontekst gjenbygget etter place-hashendringen: PASS;
- JSDOM PlaceCard/runtime: PASS;
- Chromium desktop + mobil, samlingsgeometri, popupåpning og Quiz: obligatorisk CI-port;
- full repository-/data-/quiz-/PlaceCard-CI: obligatorisk mergeport.

## Seksdelt kvalitetsvurdering

| Dimensjon | Score | Begrunnelse |
| --- | ---: | --- |
| Faktisitet og kildegrunnlag | 5/5 | Ingen nye claims; eksisterende source-eide People, Object og relasjoner er revalidert. |
| Innholdsdekning | 5/5 | Hele stedet er allerede fullprodusert; piloten beholder popup, Story, Quiz, Knowledge, språk, kilder, bilde og rute. |
| Redaksjonell kvalitet | 5/5 | Tre sterke samlinger velges; Brands og fjerde samling holdes tilbake som filler. |
| Brukeropplevelse og tilgjengelighet | 5/5 | 2 + 1-layout, formregler, forståelige navn, popupinnhold og tydelig Quiz er låst i test. |
| Teknisk robusthet | 5/5 | Canonical schema, runtime-kilde, deterministisk quizkontekst og legacy-fjerning er synkronisert. |
| Operasjonell trygghet | 4/5 | Lokale porter er grønne; siste poeng holdes tilbake til obligatorisk Chromium- og repository-CI er grønn. |

**Sum: 29/30. Alle dimensjoner er minst 4/5.**

## Mergegrense

Dette er ett avgrenset pilot-/integrasjonsløp fordi alt canonicalt brukerinnhold allerede var fullprodusert og merget. Ingen ny innholdsfase eller klynge skjules i PR-en.
