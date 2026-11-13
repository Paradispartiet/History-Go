# Vitenskap – prioriterte rettelser etter skriftgjennomgang

**13. november 2026 – gjennomgang av alle 16 aktive undermerker.**

Det visuelle utgangspunktet er den tidligere godkjente, detaljerte broderistilen i `docs/badges/vitenskap-felles-brodert-stil-20261111.md`. De aktive merkene skal bevares inntil nye kandidater er både visuelt og teknisk godkjent.

## Tre originaler som ikke tilfredsstiller tekstkravet

| Undermerke | Større øvre broderitittel | Nederste bånd – obligatorisk | Bevar gjenkjennbart fagmotiv |
|---|---|---|---|
| `teknologi_og_ingeniorfag` | **TEKNOLOGI OG** / **INGENIØRFAG** | **VITENSKAP & TEKNOLOGI** | Passer, tannhjul, brokonstruksjon og måleverktøy |
| `data_programvare_og_algoritmer` | **DATA, PROGRAMVARE** / **OG ALGORITMER** | **VITENSKAP & TEKNOLOGI** | Databrikke, kode, spor på kretskort, algoritmer |
| `nettverk_og_digital_infrastruktur` | **NETTVERK OG** / **DIGITAL INFRASTRUKTUR** | **VITENSKAP & TEKNOLOGI** | Servere, fiberoptikk, telekommunikasjonsmast, satellitt og sammenkoblede nett |

De første to originale WebP-filene har bare «VITENSKAP» nederst. Nettverksmerket mangler hele hovedkategorinavnet nederst.

## Absolutte leveransekrav

- Tydelig stor opphøyd gullbroderi, to buer eller to linjer for lange navn. Ingen unaturlig smal, sammenpresset eller mikroskopisk tittel.
- Fullt hovedkategorinavn skal stå **i selve bildet nederst**, ikke bare som tekst ved siden av.
- Mørklilla tekstilbunn, tydelig sydd lilla kant `#6A5AE0`, gull laurbær og rikt, særegent fagmotiv. Ikke gjenta samme motiv på alle tre.
- 1024×1024 WebP, transparent **utenfor** merket, ingen påmalte rammer eller nettsideelementer.
- Kontroller 1024px original og 320px, 160px, 96px, 52px og 38px nedskalering. Ved 38px må fullstendig navn dessuten vises i tilgjengelig tekst utenfor bildet.
- Eksisterende `data/badges/vitenskap.json`, History Go-hovedlogo, kartets hovedkategoriikon, aktive undermerker og godkjente norske v2-originaler forblir uendret under produksjon.
- Lag først separate, versjonerte kandidater i `bilder/merker/vitenskap/kandidater/`, med kilde, SHA-256, Git-blob-hash og kontaktark. Aktiver først etter uttrykkelig designgodkjenning i separat PR.

## Videre skriftgjennomgang

`elektronikk_robotikk_og_automatisering`, `vitenskaps_og_teknologihistorie` og `klima_og_miljovitenskap` har allerede tolinjet øvre tekst og fullstendig hovedkategorinavn nederst. De kan brukes som produksjonsreferanser for plassering, men bør likevel kontrolleres visuelt ved 96px. Ikke endre disse bare for å få en ny versjon.

All identifisering av manglende tekst er basert på manuell gjennomgang av de virkelige bildefilene, ikke OCR. Se `vitenskap-aktive-merker-review.html` og `data/badges/vitenskap_active_typography_audit_20261113.json`.
