# NRK Marienlyst duplicate migration

- Removed legacy duplicate place id `nrk_marienlyst`.
- Canonical place remains `nrk_huset_marienlyst` at the verified Geonorge address anchor.
- Migrated the 5×6 naeringsliv quiz set to the canonical place id.
- Merged the complementary work/infrastructure story into the canonical story file.
- Rewrote every remaining exact active JSON reference under `data/`.
- Added the legacy id to the place-alias validation gate.
- Protocol after migration: 195 verified/source-controlled Oslo places; 36 unresolved controls.
