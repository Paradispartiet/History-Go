# Samlingsbilder – staging og publiseringskontroll

Denne mappen inneholder kilde-, bilde- og rettighetskontroller for **Brands, Structures og Objects**. Filene `*-candidate.json` gjelder **upubliserte** bilder; de er ikke automatisk godkjent for appvisning.

## Første WebP-bolk

Tre kildeavgrensede bildekandidater finnes i én samlet, SHA-låst ZIP-pakke, eller i to separate ZIP-pakker:

- `historygo_collection_images_batch1_stage_package.zip`: **samlet anbefalt pakke** med alle tre WebP-bildene.
- `historygo_toyen_trafo_objects_2_kandidater.zip`: Tøyen apparatpult 1916 og transformator-/motorkjerne 1918.
- `historygo_freiaparken_structure_v2_candidates.zip`: revidert illustrasjon av Freiaparken.

**Binærfilene ligger ikke i GitHub ennå.** Manifester og import-/testkode ligger her. Ikke erstatt canonical bildefiler før kildetro, rettigheter og visning er kontrollert.

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

## Redaksjonell port

- **Tøyen trafo:** kildebildene hos Oslo byarkiv må inspiseres visuelt. Genererte tekniske detaljer kan være feil.
- **Freiaparken:** dokumentert langstrakt basseng, parkrom og paviljong, men nøyaktige skulpturer og utsyn må kontrolleres. V2 er **mer representativ**, ikke godkjent som eksakt stedsgjengivelse.
- **Brands:** ikke generer eller rekonstruer logoer. Autentiske merker må kilde- og rettighetsverifiseres før de kan fylle en ferdig Brand-runde.

Et **PASS fra importskriptet gjelder bare bildefilens integritet**, ikke historisk korrekthet, redaksjonell kvalitet, lisens eller PlaceCard-visning. Disse kontrollene gjennomføres separat før noe kan publiseres.
