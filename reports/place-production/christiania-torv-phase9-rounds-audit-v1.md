# Christiania Torv – fase 9 People / Object / Brands / rounds / route audit v1

Dato: 2026-08-24  
Place ID: `christiania_torv`  
Baseline: Phase-8 merge `980a359c1016955baaefd9279fafa2a825978e46`  
Status: **PASS – entity/round decisions and deterministic context validated**

## Reuse og eierskap

- **People:** gjenbruker canonical `wenche_gulbransen`, allerede direkte koblet til `christiania_torv` med kilder. Ingen duplikat er opprettet.
- **Christian IV:** Storyens eksisterende canonical `kong_christian_iv` beholdes. Ingen ny personpost opprettes når repoet allerede eier identiteten gjennom Story-systemet.
- **Object:** `Christian IVs hanske` var ikke materialisert som canonical fysisk object/civication-post for torget. Én stedsspesifikk post er opprettet med Wenche Gulbransen, år 1997, tre kilder og eksplisitt grense mot det udokumenterte bokstavelige hanskekastet.
- **Gamle Rådhus:** forblir separat canonical Place og vises bare som dokumentert relasjon.

## Brands

Den gamle mappingen inneholdt åtte kandidater: `brasserie_france`, `filter_musikk`, `fjord_restaurant`, `pascal`, `skuld`, `statholdergaarden`, `stress` og `tom_wood`.

Katalogpostene dokumenterte ikke samlet fersk `verifiedAt`, eksakt fasade-/plassgrense og gjeldende drift for Christiania Torv. Hele mappingen er derfor retirert. Det er bedre med ingen Brands-runding enn en volatil virksomhetsliste som feilaktig eies av torget.

## Rute og relasjoner

Eksisterende intern rute `oslo_fra_middelalderby_til_fjordby` gjenbrukes. Den har allerede `christiania_torv` som kapittel 3 og ingen ny rute-ID er opprettet.

Curated `related_place_ids` er begrenset til fem dokumenterte forbindelser: `gamle_radhus`, `middelalder_oslo`, `akershus_festning`, `oslo_domkirke` og `stortorget`.

## Rundingsprofil

Aktive, reelt innholdsbårne rundinger:

- `people`
- `objects`
- `related`

Brands er bevisst fraværende. Ingen filler-runding eller nabobygg som proxy er lagt til.

## Deterministisk Quiz/Knowledge-grense

Place-filen inngår i Phase-7 production-context-hashen. Context-artifactet skal derfor gjenbygges deterministisk på denne branch-headen før PR, ikke håndredigeres eller omstemples.

## Validation evidence

- TEMP context validation run: `32700357680`, job `97350454877` — success.
- Deterministic quiz production-context, progression, theory binding and canonical Knowledge check passed after the Phase-9 place changes.
- TEMP workflow removed before merge.
- Permanent CI is evaluated on the cleanup head.
