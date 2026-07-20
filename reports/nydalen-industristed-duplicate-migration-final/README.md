# Nydalen industristed duplicate migration

- Removed legacy duplicate physical place `nydalen_industristed`.
- Canonical place remains `nydalen` with unchanged verified Oslo byleksikon area geometry.
- Merged the richer industrial-history content into canonical Nydalen before deleting the duplicate.
- Retargeted exact active quiz, people, story, leksikon, nature and route references.
- Explicitly merged the two pre-existing nature-map key collisions under canonical `nydalen`; canonical place metadata wins scalar conflicts while list/object content is preserved.
- Removed the duplicate Akerselva Civication mapping because a canonical Nydalen route mapping already exists.
- Updated the dedicated round-content regression test for canonical Nydalen and the by-category round order.
- Added the retired ID to the legacy alias gate.
- Protocol after migration: 198 verified/source-controlled Oslo places; 32 unresolved controls.
