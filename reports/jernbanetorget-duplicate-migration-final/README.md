# Jernbanetorget duplicate migration

- Removed legacy duplicate place `jernbanetorget_trafikknutepunkt`.
- Canonical place remains `jernbanetorget` with its existing verified route geometry.
- Removed the duplicate naeringsliv Civication mapping because canonical Jernbanetorget already has its own mapping.
- Cleaned duplicate i18n keys and removed stale coordinate evidence.
- Added the legacy ID to the place-alias validation gate.
- No new physical place or coordinate was created.
- Protocol after migration: 196 verified/source-controlled Oslo places; 35 unresolved controls.
