# Import av nye places

Bruk importverktøyet når du vil legge til nye History Go-places uten å redigere store JSON-filer manuelt.

1. Kopier `data/import/new-places.example.json` til `data/import/new-places.json`.
2. Fyll inn nye places i `new-places.json`.
3. Sett `targetFile` til en fil som finnes i `data/places/manifest.json`.
4. Kjør `npm run places:import`.
5. Kjør `npm run health:places`.
6. Kjør `npm run health:data`.
7. Sjekk diff før commit.

## Tips

- `targetFile` brukes bare av importverktøyet og skrives ikke inn i place-objektet.
- Hvis `id` mangler, genererer importverktøyet en id fra `name`.
- Hvis `r` mangler, settes den til `150`.
- Bruk dry-run for å validere uten å skrive filer:

```bash
node tools/importPlaces.mjs --dry-run
node tools/importPlaces.mjs --file data/import/new-places.example.json --dry-run
```
