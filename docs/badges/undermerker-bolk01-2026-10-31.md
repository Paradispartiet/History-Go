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

## Visuell kvalitetskontroll 01.11.2026 – ikke godkjent

De seks nylig lagde Scenekunst-bildene er gjennomgått på faktisk GitHub-WebP. Følgende er merket `rework_required` i produksjonsmanifestet: Dans, Performance, Musikkteater, Sceneproduksjon, Regi og Dramaturgi.

**Årsaker:** Flate ikonmotiver, for lite realistisk tekstil-/trådstruktur. Dansemerket har en figur som ligner trommestikker snarere enn en danser. Regi og Dramaturgi er for like. Filene oppbevares som arbeidsutkast, men skal ikke aktiveres eller regnes som godkjente.

**Obligatorisk videre:** En illustrasjon per fil (ikke beskåret samlebilde), bueformet navn brodert *inne* i øvre kant, realistisk kant- og stoffstruktur, korrekt navn og godkjent fargepar. Scenekunst: `#C96E8B` og `#808080`. Kontroll mot hovedmerket på 64 px og full størrelse.

De tre tidligere pilotene (Teater, Klassisk arkitektur, Spillefilm) er fortsatt kandidater uten visuell sluttsignering. Ingen `subBadgeImages` aktiveres før godkjenning. Merke-PR skal forbli utkast.

Det AI-genererte arket med 15/29 motiver er ikke en produksjonspakke: en del navn samsvarer ikke med underkategoriene i registeret, og det skal ikke klippes opp til aktive filer.

## Pilotillustrasjoner – ytterligere visuell vurdering
- **Teater:** Ikke godkjent. Gjentar Scenekunst-hovedmerkets teatermasker, bryter kravet om særskilt undermerkemotiv.
- **Spillefilm:** Ikke godkjent. For likt Film & TV-hovedmerkets kamera/projektor; magenta/liljehvit skal dominere og ny ikonografi kreves.
- **Klassisk arkitektur:** Egnet kandidat (grå palett, tydelig nyklassisk fasade, realistiske tråder). Fortsatt *ikke* formelt godkjent.

Totalt: **8 må tegnes om, 1 avventer endelig visuell vurdering, 0 aktivert**. Originalfilene beholdes for sporbarhet, men skal ikke brukes som aktive merker.

## Dans v2 – separat forbedret kandidat (1. november 2026)

- En ny **selvstendig** WebP er generert, 1024 × 1024, RGBA/WebP med gjennomsiktige hjørner og rund broderikant.
- Motivet viser en klassisk danser i arabesque. **DANS** ligger brodert innenfor øvre kant.
- Kategorifargene er korrigert: roserosa `#C96E8B`, grå `#808080`, mindre lyse nøytrale detaljer.
- **SHA-256:** `ca83f80cc601841cc660b163b15c8df606b0d820660a40d946c00f8d986ef93d`. Filstørrelse: 442 262 byte.
- Filen finnes i ChatGPT-arbeidspakken `history-go-dans-v2/dans-brodert-v2.webp`, men er **ikke** lastet opp til denne GitHub-grenen. Ikke oppgi dette som en integrert merkeerstatning.
- v1 beholder status `rework_required` og skal ikke vises i appen. v2 er `local_candidate_pending_upload_and_approval`.
- Før aktivering: overfør eksakte WebP-bytes til `bilder/merker/scenekunst/undermerker/dans-brodert-v2.webp`, verifiser SHA-256, kontroller den visuelle kvaliteten og knytt `subBadgeImages.dans` til filen først ved godkjenning.

## Performance v2 – ny individuell brodert kandidat, 01.11.2026
- Eget motiv av scenekunstutøver i spotlys med «PERFORMANCE» brodert langs øvre innerkant.
- Bildefilen er **lokalt produsert**, 1024×1024 WebP med alfa; størrelse **397786 byte** og SHA-256 `c5e012997721076efa28bdc8c61ace79f71b58b957ddfaca6a598a342d66c872`.
- Fargebehandling mot Scenekunst-paletten roserosa `#C96E8B` og grå `#808080`; kontrasten i broderitråden er bevart.
- Lokalt bildebibliotek: `history-go-performance-v2/performance-brodert-v2.webp`.
- Produksjonsmanifestet registrerer `replacementCandidate` og `repositoryUploaded:false`; den gamle Performance v1 er fortsatt avvist.
- **Ikke aktivert eller visuelt sluttgodkjent**, selv om filkontrollen er bestått. Må lastes opp og knyttes til manifestet etter separat visuell vurdering.
- Det samme gjelder allerede produserte Dans v2, som heller ikke er overført som binærfil.
