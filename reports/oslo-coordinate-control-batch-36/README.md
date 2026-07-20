# Oslo koordinatkontroll – batch 36

Dato: 2026-07-20

Batchen gjenåpner fire konkrete needs_review-saker med objekt-type-først-metoden. Konkrete adresser som tidligere ga tvetydige Geonorge-resultater får bare objektfallback når fysisk identitet er eksplisitt dokumentert.

- `sigrid_undset_statue` → **needs_review beholdt** (no_exact_named_object); ingen koordinat er gjettet.
- `inger_hagerups_plass` → **verified/appplied**; canonical place, split child, evidence and indexes are synchronized.
- `hartvig_nissens_skole_skam` → **verified/appplied**; canonical place, split child, evidence and indexes are synchronized.
- `prinds_christian_augusts_minde` → **verified/appplied**; canonical place, split child, evidence and indexes are synchronized.

Rå Nominatim-resultater fra første pass er lagret i `nominatim-results/`. Andre pass bruker kun eksplisitte, allerede dokumenterte kildeobjekter: Lokalhistoriewikis kildekoordinat kryssjekket mot Oslo byleksikon/Oslo bykart for Inger Hagerups plass, og det eksakte navngitte OSM-skoleobjektet med Oslo kommune som operator for Hartvig Nissens skole.
