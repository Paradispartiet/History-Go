# Fagverk IA v3 — implementasjonsnotater

Dette er et kort, løpende teknisk notat for migreringen i `FAGVERK_IA_V3_WORKCARD.md`.

## Batch A — første kodegrep

- Bevar canonical URL-state: `subject`, `domain`, `emne`, `chapter`, `place`, `concept`.
- Ikke introduser `view=`.
- Legg ny intern hovednavigasjon som hash-mål på subject-roten.
- Hovedvisninger skal bruke den allerede normaliserte `HGFagverkSubjectModel`.
- Emneoversikt skal aldri filtreres etter progresjon.
- Progresjonsflaten skal bare lese `MODEL.readProgress()` og eksisterende state.
- Eksisterende emne- og chapter-renderere beholdes som canonical detaljflater.

## Avgrensning for første PR

Første PR skal ikke:

- redirecte gamle merkesider;
- slette `emner.html`;
- migrere legacy teoritekst;
- endre canonical fagdata;
- endre emne-ID-er, domain-ID-er eller chapter-ID-er;
- opprette ny progresjonsstorage.

Første PR skal etablere den nye navigasjonsretningen i den delte Fagverk-shellen og låse den med tester/audit før legacy-avvikling begynner.
