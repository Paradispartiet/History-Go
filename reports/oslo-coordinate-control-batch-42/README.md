# Oslo coordinate control batch 42

Batch 42 resolves `oslo_kornmagasin` by correcting identity before coordinate promotion.

- Canonical identity: Kornmagasinet, inventory 0008 at Akershus festning, dated 1788.
- Geometry: exact named OSM way 669390505.
- Identity source: official Akershus heritage regulation (Lovdata).
- Overlap audit: distinct from Bakeriet, OSM way 669390521.
- Quiz cleanup: the unsupported 1785 identity is removed from question content and the opening place-file-meta questions are replaced.
- Concurrent-main safety: only the target row is patched in the current aggregate/index/manifest, preserving unrelated main changes.
- Protocol after application: 179 verified/source-controlled Oslo places and 39 unresolved controls.

All coordinate gates are run before the workflow commits the selected canonical files.
