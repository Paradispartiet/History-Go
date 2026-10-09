# Aftenposten: Hegge og Stanghelle

## Avgrensning og kildekontroll

To eksisterende personer er ferdigstilt under `people_profile_v1.0`. Ingen nye personer er opprettet. Primærstedet er fortsatt `aftenposten_akersgata`, som gjelder Akersgata 51 i perioden 1876–2003. Senere roller beskrives som personhistorie og gir ikke nye stedskoblinger. Eilertsens korrigerte profil fra #6144 er uendret.

Hegges ansettelsesår er rettet fra det udokumenterte 1970 til 1962. Stanghelles anker er ansettelsen i 1991, mens nyhetsredaktørrollen er datert 1994–1995. Utenrikskorrespondentarbeid er ikke fremstilt som fysisk arbeid i Akersgata. Stanghelles roller etter 2003 og Hegges språkspalte fra 2005 er uttrykkelig skilt fra stedets periode.

Følgende kilder ble åpnet og gjennomgått 9. oktober 2026:

- https://snl.no/Per_Egil_Hegge — biografi, ansettelsesperioder, utdanning, korrespondentsteder, A-magasinet og språkspalten.
- https://snl.no/Harald_Stanghelle — biografi, karriere, utdanning, verv og bokutgivelse. Ingen nåværende stilling er utledet av historiske roller.
- https://www.aftenposten.no/meninger/i/Py5pX/harald-stanghelle — primærbiografi publisert 27. oktober 2008; ansettelsen i 1991 og redaktørperiodene.
- https://www.aftenposten.no/norge/i/BJdpw/tanta-flytter-hjem — adressen Akersgata 51 og perioden 1876–2003.
- https://commons.wikimedia.org/wiki/File:Harald_Stanghelle_KJF_2026.jpg — Birgit Fostervold, 1. juli 2026, CC BY-SA 4.0; original 1571 × 1964.
- https://commons.wikimedia.org/wiki/File:NMD_%C3%85pning_Media_City_Bergen_2018_(27040319877)_(cropped).jpg — Inge Krossøy (xoy.no) / Nordiske Mediedager, 2. mai 2018, CC BY-SA 2.0; original 2499 × 2939.

Begge fotografiene er visuelt kontrollert, identifisert i Commons-metadata og lagt inn gjennom People-bildepipeline med attribusjon. Den allerede publiserte Hegge-beskjæringen er brukt uten ny beskjæring. Begge har egne claimfiler som dekker profilfeltene, den korte beskrivelsen og alle åtte popupsetninger: Hegge 10/10 verifiserte claims, Stanghelle 12/12.

## Utførte kontroller

- `npm run build:tools` og `npm run build:scripts`: PASS.
- `node tools/audit-people-profile-canonical.mjs`: PASS, 101 claimfiler.
- `node --test tests/people-images.test.mjs tests/people-profile-canonical.test.mjs tests/people-popup-system-contract.test.mjs`: 12/12 PASS.
- `node scripts/build-place-open-payloads.mjs --check`: PASS, 1533 payloads.
- `node dist/scripts/build-civication-history-people-index.mjs --check`: PASS, 16 kategorier.
- `node dist/tools/check-people-of-places-gate.mjs`: PASS.
- Kjørbar People-dekningsaudit: 1435 unike personer, null ugyldige stedsreferanser og null duplikater. Den globale rapporten var foreldet fra før; den er ikke tatt med som en omfattende sideendring. Denne rapporten registrerer det faktisk kjørte resultatet.
- Semantisk diff mot `e67914e217c2d3aa303ab280ad201483eb7f01ef`: samtlige andre People-profiler, attribusjonsrader og Civication-personer er uendret. Genererte runtime-shards og Place-open-payload er synkronisert fra canonical People-data.
- `git diff --check`: PASS.

Automatiske kontroller beviser ikke redaksjonell kvalitet. Codex har også gjennomgått begge hele biografier, alle 22 claims og de to originale bildefilene. Dette er ikke en påstand om uavhengig menneskelig review. PlaceCard-flip og full stedsintegrasjon hører til den separate stedsleveransen.

## Kvalitetsport for denne People-endringen

| Dimensjon | Score | Evidens |
| --- | ---: | --- |
| Korrekthet og evidens | 5 | 22 direkte kildebelagte claims; år, personer og adresseperiode kontrollert. |
| Dekning og ferdigstillelse | 5 | Begge avgrensede v1-profiler har tekst, verk, utdanning, portrett, attribusjon og claims. |
| Faglig/redaksjonell kvalitet | 4 | Individuelle biografier uten malfyll; institusjonsroller skilles fra fysisk sted. |
| Teknisk integritet | 4 | 12 tester, canonical audit og deterministiske avledede checks består. Full Place-UI kontrolleres separat. |
| Sikkerhet og ansvarlighet | 5 | Verifiserte identiteter, originale lisensierte bilder og historisk daterte roller. |
| Vedlikeholdbarhet og etterprøvbarhet | 5 | Canonical eierskap, felt-/setningskart, minimale endringer og regenererte avledninger. |

**28/30.** Begge People-profiler består den avgrensede kvalitetsporten. Dette ferdigstiller ikke selve Aftenposten-stedet.
