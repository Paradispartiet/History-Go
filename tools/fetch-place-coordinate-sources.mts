#!/usr/bin/env node
/**
 * LEGACY / DISABLED
 * -----------------
 * Dette gamle verktøyet er deaktivert med vilje.
 *
 * Det gamle søket brukte bare `${name}, ${category}, Oslo, Norway`, valgte første
 * Nominatim-treff og kunne gi høy confidence hvis treffet bare var i samme bydel
 * eller innen en grov avstand. Det er ikke presist nok for History Go.
 *
 * Bruk ny pipeline i stedet:
 *   npm run places:coords:candidates:all
 *   npm run places:coords:apply:write
 *   npm run places:index:check
 *   npm run places:coords:gate
 *
 * Ny pipeline:
 * - bruker address først der det finnes
 * - bruker Wikidata/Nominatim/Overpass-kandidater
 * - skriver bare auto_approved eller eksplisitt godkjente ids
 * - skriver lat/lon, aldri lng
 * - rebuild-er places_index via apply-steget
 */

console.error(
  '[fetch-place-coordinate-sources] deaktivert: bruk generate-place-coordinate-candidates + apply-coordinate-candidates.\n' +
    'Kjør: npm run places:coords:candidates:all && npm run places:coords:apply:write'
);
process.exit(1);
