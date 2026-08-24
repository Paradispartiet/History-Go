# Birkelunden – fase 7H Språk audit V1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Mergegrense: `canonical_content`
- Baseline: `36c26220e46a65a7db5db3f140aaf65a13dae61e`
- Canonical språk-owner: `data/leksikon/sprak/places/europe/norway/oslo/birkelunden.json`
- Manifest: `data/leksikon/sprak/manifest.json`
- Status: **GODKJENT CHECKPOINT PÅ ARBEIDSGREN**

## Prior-work og scope

Repoet hadde allerede den verifiserte navnehistorien i Birkelundens `popupDesc`, `temporal_profile` og Historie-lag, men ingen manifestregistrert Språkleksikon-record for `birkelunden`.

Birkelunden er et enkelt Place og har ikke `placeScope: "area"`. Etter `docs/SPRAKLEKSIKON.md` kan stedet derfor ha direkte stedsspesifikt Språkleksikon, men kan ikke eie dialektlag. Fase 7H produserer kun navnehistorie med `layer: "language"`; `dialect_area`, `layer: "dialect"` og `dialect_feature` brukes ikke.

## Kildekontroll

### Oslo byleksikon – Birkelunden

Direkte stedsartikkel oppgir at:

- parken het Birkelunden fra starten;
- navnet ble fornorsket til **Bjerkelunden i 1926** for å være i tråd med rettskrivningen av 1917;
- navnet ble endret tilbake til det opprinnelige **Birkelunden i 1955**.

Kilde: `https://oslobyleksikon.no/index.php/Birkelunden`

### Store norske leksikon – Birkelunden

SNLs etymologifelt forklarer **Birkelunden** av dansk `birk`, «bjørk», altså «Bjørkelunden».

Kilde: `https://snl.no/Birkelunden`

SNL brukes her bare for den eksplisitte etymologien. Den kjente konfliktende SNL-dateringen av Spaniamonumentet inngår ikke i språkdataene.

## Materialisert innhold

To oppføringer er nok til å gjøre Språk-fanen substansiell uten filler:

1. `birkelunden_name_current`
   - term: `Birkelunden`
   - type: `stedsnavn`
   - status: `current`
   - etymologi og dokumentert navneforløp.
2. `birkelunden_name_bjerkelunden_1926_1955`
   - term: `Bjerkelunden`
   - type: `historisk_navn`
   - status: `historical`
   - periode: `1926–1955`.

Begge er eksplisitt koblet til `place_id: birkelunden`, har inspectable HTTPS-kilder og er merket `layer: "language"`.

## Avviste utvidelser

- Generelt Grünerløkka-/oslomål kopieres ikke inn i parken. Slike dialektfenomener må eies av riktig område-Place.
- `Bjerkelundgata` materialiseres ikke som egen Birkelunden-term. Gaten er et separat navngitt objekt og brukes bare som kildekontekst i Oslo byleksikon.
- Vanlige ord som `bjørk` gjøres ikke kunstig lokale; bare etymologien til det konkrete stedsnavnet brukes.

## Runtime og samling

Eksisterende `js/ui/place-language-layer.js` eier presentasjonen. Når manifestet finner språkfilen, materialiseres valgfri direkte **Språk**-fane og «Språk på stedet»-teaser i Om. Samling går gjennom eksisterende Knowledge V2-lager `hg_knowledge_entries_v2`; ingen separat språk-/dialektdatabase opprettes.

## Permanent gate

`tests/birkelunden-phase7h-language.test.mjs` låser:

- eksakt to navnespor;
- current/historical-status og perioden 1926–1955;
- etymologi og direkte HTTPS-kilder;
- manifestregistrering;
- ingen dialekt-eierskap på enkeltstedet;
- eksisterende språk-runtime og Knowledge V2;
- uendrede phase-5 `desc`/`popupDesc`-hasher og `area_m2=16300`.

Testen kjøres i `Language layer checks` sammen med de generelle Språkleksikon- og dialektscope-testene.

## Checkpoint-beslutning

**7H Språk: GODKJENT PÅ ARBEIDSGREN.**

Dette er et internt review-checkpoint etter Place Production Checklist v2, ikke en egen PR-grense. Arbeidet fortsetter på samme canonical-content-gren til **fase 8 – Rundinger**.
