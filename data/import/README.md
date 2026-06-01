# Import av nye places

Bruk importverktøyet når nye History Go places skal legges til uten manuell redigering i store JSON-filer.

## Arbeidsflyt

1. Kopier `data/import/new-places.example.json` til `data/import/new-places.json`.
2. Fyll inn nye places i `data/import/new-places.json`.
3. Sett `targetFile` på hver post til en fil som finnes i `data/places/manifest.json`.
4. Kjør dry-run:

   ```bash
   npm run places:import -- --dry-run
   ```

5. Hvis dry-run er OK, kjør faktisk import:

   ```bash
   npm run places:import
   ```

6. Kjør helsesjekker:

   ```bash
   npm run health:places
   npm run health:data
   ```

7. Sjekk diff før commit.

## Viktige regler

- `targetFile` må være eksplisitt for hver importpost.
- Importverktøyet velger ikke fil automatisk basert på `category` alene.
- `data/places/manifest.json` er kilden til tillatte `targetFile`-verdier.
- `targetFile` brukes bare av importverktøyet og skrives ikke inn i place-objektet.
- Bruk `--file` for å lese en annen importfil, for eksempel:

  ```bash
  npm run places:import -- --file data/import/new-places.example.json --dry-run
  ```
