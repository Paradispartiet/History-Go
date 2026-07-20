# Oslo unresolved-coordinate protocol sync

This pass compares every Oslo unresolved row against the current runtime place index and coordinate evidence. A row is removed only when both layers support the approved coordinate state. No place coordinate is modified.

- Verified rows in the Oslo protocol table: 237
- Unresolved rows before sync: 29
- Unresolved rows after sync: 27

## Removed stale unresolved rows

- `nybrua_vaterlandsparken`: verified_geometry; osm-way:315066295
- `grensen_kjopesenter`: verified_geometry; oslobyleksikon:grensen

## Still unresolved

- `elvestrekning_bla_brenneriveien`: needs_source — Current runtime index still has non-approved coordStatus needs_source
- `fossveien_elvestrekning`: needs_source — Current runtime index still has non-approved coordStatus needs_source
- `hausmannsomradet_elvelop`: needs_source — Current runtime index still has non-approved coordStatus needs_source
- `voienfossen`: needs_source — Current runtime index still has non-approved coordStatus needs_source
- `frysjadammen`: needs_source — Current runtime index still has non-approved coordStatus needs_source
- `stilla_nydalen`: needs_source — Current runtime index still has non-approved coordStatus needs_source
- `alnaelva`: needs_source — Current runtime index still has non-approved coordStatus needs_source
- `alnaelvstien`: needs_source — Current runtime index still has non-approved coordStatus needs_source
- `trosterud_friomrade`: needs_source — Current runtime index still has non-approved coordStatus needs_source
- `furuset_haugerud_skogbelte`: needs_source — Current runtime index still has non-approved coordStatus needs_source
- `hellerud_gard`: needs_source — Current runtime index still has non-approved coordStatus needs_source
- `sigrid_undset_statue`: needs_source — Current runtime index still has non-approved coordStatus needs_source
- `alf_proysen_statue_nittedal`: needs_manual_visual_qa — Current runtime index still has non-approved coordStatus needs_manual_visual_qa
- `ring_3`: semantic_anchor — Current runtime index still has non-approved coordStatus semantic_anchor
- `grini_fangeleir`: needs_source — Current runtime index still has non-approved coordStatus needs_source
- `ibsen_quotes`: needs_source — Current runtime index still has non-approved coordStatus needs_source
- `aftenposten_akersgata`: missing/empty — Current runtime index still has non-approved coordStatus (empty)
- `dagbladet_akersgata`: missing/empty — Current runtime index still has non-approved coordStatus (empty)
- `fornebu_teknologipark`: missing/empty — Current runtime index still has non-approved coordStatus (empty)
- `ulven_handelspark`: missing/empty — Current runtime index still has non-approved coordStatus (empty)
- `akershus_energi`: missing/empty — Current runtime index still has non-approved coordStatus (empty)
- `sagene_kvernhus`: missing/empty — Current runtime index still has non-approved coordStatus (empty)
- `frysja_industriomrade`: verified — Runtime says verified, but coordinate evidence does not support removing the unresolved row
- `norges_varemesse`: missing/empty — Current runtime index still has non-approved coordStatus (empty)
- `bryn_industriomrade`: missing/empty — Current runtime index still has non-approved coordStatus (empty)
- `gronlikaia`: missing/empty — Current runtime index still has non-approved coordStatus (empty)
- `akerselva_industri`: missing/empty — Current runtime index still has non-approved coordStatus (empty)
