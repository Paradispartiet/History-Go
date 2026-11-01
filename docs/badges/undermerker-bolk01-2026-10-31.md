# History Go – undermerker bolk 01 – tre bildekandidater
Dato: 01.11.2026

## Faktisk produksjon
Det er produsert **tre egne WebP-bildefiler** på 1024 × 1024, med gjennomsiktig bakgrunn, broderte kategorinavn innenfor kanten og SHA-256-verifiserbar metadata.

| Kategori | Undermerke | Kandidatfil | Status |
| --- | --- | --- | --- |
| Scenekunst | Teater | `bilder/merker/scenekunst/undermerker/teater-brodert-v1.webp` | Rendered candidate |
| By | Klassisk arkitektur | `bilder/merker/by/undermerker/klassisk_arkitektur-brodert-v1.webp` | Rendered candidate |
| Film & TV | Spillefilm | `bilder/merker/film_tv/undermerker/spillefilm-brodert-v1.webp` | Rendered candidate |

**Viktig:** Bildene er utskilt fra et tredelt tidligere illustrasjonsutkast (original 2172 × 724) og skalert til 1024 × 1024. De er dermed ikke nativt generert i 1024. Dette skal fremgå av produksjonsmanifestet og ved senere visuell vurdering.

## Design og kontroll
- Påkrevd: navn **inne i badge**, buet øverst, som brodert tråd.
- Beskytt alle eksisterende 19 hovedmerker og 15 godkjente undermerker.
- Ikke aktiver `subBadgeImages` for de tre underkategoriene før visuell godkjenning.
- Kvalitetsgjennomgangen skal særskilt kontrollere **Teater** mot Scenekunst-hovedmerket (for like masker), **Klassisk arkitektur** mot grå palett (mørk bakgrunn/lyse fasader), og **Spillefilm** mot Film & TV-fargene (kraftig rosa/oransje fremfor liljehvit).
- Teknisk verifisering: dedikert `node --test tests/badge-underbadge-batch01.test.mjs` kontrollerer WebP-header, dimensjoner, byte og SHA-256, tilhørighet, ID-er og vern av 9 hovedmerker og 15 undermerker.

## Fortsatt arbeid
26 øvrige undermerkekandidater er på planstadiet. Etter godkjent pilot brukes samme produksjonsregel, individuelt og uten gjenbruk av hovedmerkemotiv.

## Utvidelse 1. november 2026
Seks nye separate Scenekunst-WebP-filer er nå lagt på arbeidsgrenen: Dans, Performance, Musikkteater, Sceneproduksjon, Regi og Dramaturgi. Til sammen er 9 av 29 kandidater lagt inn i PR-en. Ingen er koblet inn som aktivt undermerke; `selectedImage` forblir `null`. De seks nye kandidatene er håndtegnede, stiliserte broderimotiver og **krever visuell kvalitetssikring** mot hovedmerkenes mer naturtro trådtekstur før de kan godkjennes. Kategori-navn er tegnet inne i øvre kant på hver kandidat. Teknisk verifisering skjer med `node --test tests/badge-underbadge-batch01.test.mjs`.
