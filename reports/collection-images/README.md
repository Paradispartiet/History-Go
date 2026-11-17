# Samlingsbilder – staging og publiseringskontroll

Denne mappen inneholder kilde-, bilde- og rettighetskontroller for **Brands, Structures og Objects**. Filene `*-candidate.json` gjelder **upubliserte** bilder; de er ikke automatisk godkjent for appvisning.

## Første WebP-bolk

Tre kildeavgrensede bildekandidater finnes i én samlet, SHA-låst ZIP-pakke, eller i to separate ZIP-pakker:

- `historygo_collection_images_batch1_stage_package.zip`: **samlet anbefalt pakke** med alle tre WebP-bildene.
- `historygo_toyen_trafo_objects_2_kandidater.zip`: Tøyen apparatpult 1916 og transformator-/motorkjerne 1918.
- `historygo_freiaparken_structure_v2_candidates.zip`: revidert illustrasjon av Freiaparken.

**Alle tre WebP-filene er nå lagt i kandidatmapper på PR #7348.** Manifester, SHA-256, Git-blob-SHA, import-/testkode og binære filer ligger i samme GitHub-gren. Dette er bare staging; ikke erstatt canonical bildefiler før kildetro, rettigheter og visning er kontrollert.

Importerens kontrollgrunnlag er filnavn, SHA-256, WebP-header og dimensjoner (900×520) fra `*-candidate.json`. Den er bevisst begrenset til disse tre bildene, og avviser overskriving med avvikende bytes.

### Lokal kontroll

Kjør fra rotmappen i `Paradispartiet/History-Go`, med ZIP-filene i din lokale `/path/to/`:

```bash
python3 scripts/stage-collection-image-candidates.py \
  --package /path/to/historygo_collection_images_batch1_stage_package.zip
```

Uten `--stage` blir ingenting skrevet. Etter bestått kontroll kan filene legges i **kandidatmapper**:

```bash
python3 scripts/stage-collection-image-candidates.py \
  --package /path/to/historygo_collection_images_batch1_stage_package.zip \
  --stage
```

Dette skriver bare til:

- `bilder/kort/objects/candidates/toyen_trafo/`
- `bilder/kort/structures/candidates/freiaparken/`

Det endrer **ikke** stedsdata, bildefelter, brands-logoer, runtime, eksisterende originaler eller database. Ved filkonflikt avbrytes importen.

Kjør målrettet test:

```bash
python3 -m unittest discover -s tests -p 'test_stage_collection_image_candidates.py' -v
```

Det er tre grunnleggende testtilfeller: verifiser/stage, avvis ZIP-traversering og SHA-endring, og avvis overskriving med ulike kandidatbytes.

## Kontinuerlig integritetstest

GitHub-workflowen `.github/workflows/collection-image-candidates.yml` kjører følgende:

```bash
python3 -m unittest discover -s tests -p 'test_stage_collection_image_candidates.py' -v
python3 -m unittest discover -s tests -p 'test_collection_image_integrity_gate.py' -v
python3 scripts/check-collection-image-candidates.py
```

Den kontrollerer SHA-256, Git-blob-SHA, WebP-format, dimensjoner, størrelser og trygg stiplassering. I tillegg kreves `publishable: false`, `editorialApproval: false`, `imageKind: illustration`, dokumentert kildegrunnlag, `rightsBasis` og eksplisitt opplysning om at kildens fotografi ikke er gjengitt. Ekstra tester håndhever disse publiseringsportene. Den sikrer også at kandidatstiene ikke brukes som canonical Structure-/Object-bilder.

Dette er en **binærintegritetskontroll**, ikke en redaksjonell godkjenning.

## Redaksjonell port

- **Tøyen trafo:** kildebildene hos Oslo byarkiv må inspiseres visuelt. Genererte tekniske detaljer kan være feil.
- **Freiaparken:** kildesammenligning i `freiaparken-source-accuracy-review-2026-11-16.md` dokumenterer avvik i arkitektur/skulpturer. V2 er eksplisitt **holdt tilbake fra canonical erstatning**, selv om den består binærintegritetskontroll. Den senere v3-illustrasjonen er foreløpig kun en separat ChatGPT-kandidat, ikke lagt inn i PR.
- **Brands:** ikke generer eller rekonstruer logoer. Autentiske merker må kilde- og rettighetsverifiseres før de kan fylle en ferdig Brand-runde.

Et **PASS fra importskriptet gjelder bare bildefilens integritet**, ikke historisk korrekthet, redaksjonell kvalitet, lisens eller PlaceCard-visning. Disse kontrollene gjennomføres separat før noe kan publiseres.

## Kontinuerlig kildeaudit av Brands

Bruk `node scripts/audit-linked-brand-images.mjs --check` for å kontrollere alle Brands med `place_ids` eller `place_id` i `data/brands/brands_master.json`. Testfilen er `tests/linked-brand-image-audit.test.mjs`.

Auditen sjekker at eksisterende Brand-bilder er virkelige filer under `bilder/`, ikke stier utenfor prosjektet eller stagingfiler. Den avviser også eksplisitt genererte logoer. Manglende logoer samles i en **arbeidskø** i stedet for å automatisk generere falske merkeidentiteter; `--check` feiler bare ved usikre/ødelagte eksisterende bildefelt.

Foreløpig ved første kjøring: 94 stedstilknyttede Brands; 79 med et bildefelt, 15 uten. Alle de 79 må fremdeles vurderes for historisk riktig logo, lisens og lesbarhet før endelig visuell godkjenning. Verken `logo`-felt eller eksisterende fil er i seg selv en kvalitetserklæring.

## Freiaparken – kildeverifisert fotografi foretrekkes

Fotografiet [«Freiaparken bassenget langs Freias bygning»](https://commons.wikimedia.org/wiki/File:Freiaparken_bassenget_langs_Freias_bygning.jpg), Helge Høifødt (21. september 2024), har dokumentert original, CC BY-SA 4.0 og lisensvilkår. Se `freiaparken-photo-2024-commons-candidate.json` for eksakt metadata og arkivets SHA-1, samt `freiaparken-2024-photo-v4-comparison-2026-11-17.md` for redaksjonell kvalitetsvurdering.

**Freiaparken v4 ble ikke godkjent som stedstro rekonstruksjon.** Kildens foto har riktig bassinplassering og faktiske bygninger/skulpturer, og er derfor foretrukket kandidat. Den binære originalen er **ikke importert** i PR-en. En foto-lisens frikjenner ikke automatisk separate rettigheter til avbildede skulpturer; avklar dette før eventuell bruk.

Ny kildeport:

```bash
python3 scripts/check-collection-photo-sources.py
python3 -m unittest discover -s tests -p 'test_collection_photo_source_gate.py' -v
```

Porten bekrefter at fotokandidaten er merket kildeverifisert, **ikke binært importert og ikke publiserbar**. Et `PASS` er ikke tillatelse til å promotere den. Ved faktisk import må kildekontroll, originalhash, derivativhash, lisens-/krediteringsvisning og mobil-/desktopbilder oppdateres og de relevante testene endres i samme commit.

## Freiaparken – begrenset nettimport 17. november 2026

Automatisk kildenlasting via `upload.wikimedia.org` i GitHub Actions (#44066699257) ble avvist med **HTTP 429 (Too many requests)**. **Ingen originalfil ble hentet og ingen WebP-fil ble produsert** i den kjøringen. Ikke gjenta hyppige forespørsler mot Wikimedia. CI-workflowen `freiaparken-photo-source-review.yml` kjører derfor nå kun **offline-testene** automatisk på PR, mens nettimport er en manuell handling.

Når en menneskelig kontrollør har hentet den eksakte [Commons-originalen](https://commons.wikimedia.org/wiki/File:Freiaparken_bassenget_langs_Freias_bygning.jpg) via nettleseren og har tillatelse til nødvendig intern bilde-QA, kan originalen kontrolleres lokalt **uten nettverk**:

```bash
python3 -m pip install Pillow==11.3.0
python3 scripts/fetch-freiaparken-photo-for-review.py \
  --original /path/to/Freiaparken_bassenget_langs_Freias_bygning.jpg \
  --out artifacts/freiaparken-photo-source-review
```

Programmet sjekker opprinnelig SHA-1, filstørrelse, JPEG-format og bildeformat mot kandidatmanifestet og produserer deretter en **ubeskåret 900 × 600 WebP** og et proveniensdokument i en privat gjennomgangsmappe, ikke i appens bildebank. Avvikende innhold og overskriving av eksisterende revisjonsfiler avvises.

**Rettighetsport:** Fotografens CC BY-SA 4.0-lisens er identifisert, men enkelte avbildede skulpturer kan ha egne rettigheter. Norsk åndsverklov §§ 30–31 skiller mellom underordnet medtakelse og gjengivelse av verk i offentlig rom og har egne begrensninger når verket er hovedmotiv og brukes ervervsmessig. Parken er ikke alminnelig offentlig tilgjengelig til enhver tid. Opphavsrettslig vurdering og bildekreditering i PlaceCard er derfor **fortsatt uavklart**; fotokandidaten har `editorialApproval: false`, `publishable: false`.

Bildeintegritets-PASS eller lokal WebP-produksjon er **ikke** tillatelse til å endre `structures[].image` eller publisere fotografiet.


## Tøyen – trygg lokal originalgjennomgang (17. november 2026)

De katalogførte Tøyen-bildene fra Oslo byarkiv er **ikke** nedlastet eller visuelt godkjent i denne PR-en. Eksakte kilder:

- 1916: `A-20138/Ua/0004/054` (Tøyen apparatpult), ikke naboarkivnummer `/055` som gjelder Askim.
- 1918: `A-20138/Ua/0004/091` (transformatormotorkjerne); katalogens motivfelt sier «person viser fram motoren».

Når originalfiler er innhentet separat fra arkivet, kan de legges i **privat, ignorert gjennomgangsmappe**, uten at noe publiseres:

```bash
python3 -m pip install Pillow==11.3.0
python3 scripts/stage_toyen_archive_for_review.py --asset 1916-apparatpult \
  --original /path/to/oslo-byarkiv-054-original.jpg \
  --out artifacts/toyen-archive-review/1916
python3 scripts/stage_toyen_archive_for_review.py --asset 1918-transformatorkjerne \
  --original /path/to/oslo-byarkiv-091-original.jpg \
  --out artifacts/toyen-archive-review/1918
```

Skriptet leser kildekandidatens arkivnummer og katalogtittel, avviser falsk publiseringsstatus, kontrollerer bildefilens lesbarhet og tar SHA-256/dimensjoner. Det kopierer originale lokale bytes og produserer en **ubeskåret 900 × 600 WebP** for kontroll, sammen med `review_receipt.json`. Katalogidentiteten **kan ikke bevises av innlevert fil alene**; derfor forblir `sourceIsAuthenticated: false`, `visualCatalogComparisonDone: false`, `editorialApproval: false`, `publishable: false`.

Utdata kan bare skrives til en **ny undermappe** i den Git-ignorerte `artifacts/toyen-archive-review/`. Skriptet avviser andre mapper (også andre `artifacts/`-mapper og mapper utenfor repoet), stier som går ut gjennom symbolske lenker, og overstyring av eksisterende revisjonsfiler. `/artifacts/toyen-archive-review/` er ignorert av Git. Ny CI-workflow `.github/workflows/toyen-archive-photo-review.yml` tester både 1916 og 1918 **offline** med genererte testbilder, uten å påstå at originalene er hentet.

Før eventuell promoteringsvurdering må en uavhengig kontrollør bekrefte at *akkurat de tilførte bytene* svarer til riktig Oslobilder-arkivpost og at rettigheter, synlig kreditering og PlaceCard-utsnitt er godkjent på mobil og desktop. **Ingen canonical Object-bilder er endret.**
