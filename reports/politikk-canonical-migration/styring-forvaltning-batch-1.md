# Politikk – kanonisk integrasjon, styring og forvaltning

- Revisjon: `politikk-styring-2026-07-24`
- Dato: 2026-07-24
- Direkte oppdaterte topic hooks: 10
- Direkte oppdaterte emner: 16
- Oppdatert pensumdomene: `styring_institusjoner_forvaltning`
- Fjernet migreringslaget `data/fag/politikk/kvalitetslag_v1/`
- Fjernet den midlertidige kvalitetslag-validatoren
- Beholdt alle eksisterende hook- og emne-ID-er, inkludert `em_pol_stat_kommune_relaster`

## Validering

- Alle 10 hook-ID-er finnes én gang i det aktive fagkartdomenet.
- Alle 16 oppgraderte emne-ID-er finnes én gang i den aktive emnefilen.
- Alle hook-referanser peker til eksisterende emner.
- Alle påkrevde teoretiske felt er ikke-tomme.
- Hvert oppgradert emne har tre presise nøkkelspørsmål og tre målrettede teorispor.
- Fagkart, emner og pensum er skrevet som gyldig, formatert JSON.

Sluttresultatet bruker bare de aktive kanoniske filene; ingen overlay eller runtime-sidekanal er beholdt.
