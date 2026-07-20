# Oslo museum / visitor-source completeness closure

Date: 2026-07-20

## Status

**Research/source classification: CLOSED for the current VisitOSLO museum/visitor-list pass.**

**Production: NOT CLOSED.**

This report closes the systematic classification pass that followed the completed Atlas Obscura, Kultureiendommer and Oppdag Kvadraturen audits. It does not claim that every museum-like institution in Oslo has been discovered from every possible source. It records that the current VisitOSLO museum/visitor source set and the additional high-value municipal/institutional museum clusters surfaced during the pass have been classified against current History Go canonical places.

The main current source used for the final source pass was:

- https://www.visitoslo.com/en/activities-and-attractions/attractions/museum/
- https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/attraksjoner/museer/

Current institution status was checked against official museum/institution sources before classification where status could have changed.

## Result summary

### New canonical candidates approved for coordinate intake: 18

1. `norsk_folkemuseum`
2. `norsk_maritimt_museum`
3. `historisk_museum`
4. `frogner_hovedgard`
5. `arbeidermuseet`
6. `nobels_fredssenter`
7. `kunstnernes_hus`
8. `vigelandmuseet`
9. `ibsen_museum_teater`
10. `mollergata_skole`
11. `jodisk_museum_oslo`
12. `norges_hjemmefrontmuseum`
13. `forsvarsmuseet`
14. `roseslottet`
15. `det_internasjonale_barnekunstmuseet`
16. `tbs_gallery`
17. `viking_planet_oslo`
18. `the_salmon_vitensenter`

None of these 18 should be counted as completed canonical production merely because the research gate passed. Each still requires the correct coordinate method, evidence capture, source-record creation, manifest/index regeneration where relevant, and validation.

## Existing canonical places retained instead of duplicate markers

### Interkulturelt Museum

Physical building already represented as `gronland_politistasjon` at Tøyenbekken 5.

Decision: no new marker. The existing place was enriched in batch 2 with the current Interkulturelt Museum use and official museum source.

### Popsenteret

The former museum occupied the already canonical Schous complex and is permanently closed.

Decision: no new active marker. The former Popsenteret use was added as a historical layer on `schous_bryggeri` in batch 3.

### Sporveismuseet

Already canonical and coordinate-verified.

Decision: retain existing place.

### Naturhistorisk museum

Already canonical as `naturhistorisk_museum`, with `botanisk_hage` separately represented.

Decision: retain existing place. Coordinate-quality debt remains a separate coordinate-control issue.

### Skimuseet i Holmenkollen

Already physically represented through `holmenkollen_nasjonalanlegg`, whose canonical record explicitly includes the museum and tower as parts of the same visitor complex.

Decision: no duplicate museum marker.

### Nasjonalmuseet – Arkitektur

The Bankplassen 3 building is already canonical as `grunnlovsbygget_bankplassen`, and the record already identifies its current museum use.

Decision: no duplicate museum marker.

### Fotohuset Deich / Fotografiska Oslo

The future museum building is already canonical as `gamle_deichman`.

Decision: no new active museum marker before opening. Batch 9 corrects the Hammersborg building chronology to the 1933–2019 main-library period and records the planned 2028 photo-house reuse explicitly as a future layer.

### Akershus slott

Already represented through the existing legacy/canonical compatibility structure around `akerhus_slott` and `akershus_festning`.

Decision: no additional place from this source pass. The ID compatibility state is a separate cleanup concern.

## Important already-covered VisitOSLO entries

The final source pass also confirmed or relied on prior completed coverage for major entries including:

- HL-senteret through `villa_grande`
- Kon-Tiki Museum through `kon_tiki_museet`
- Fram Museum through `frammuseet`
- Nordisk Bibel- og bokmuseum through `nordisk_bibelmuseum`
- Norsk Teknisk Museum through `teknisk_museum`
- MUNCH through the existing MUNCH place
- Astrup Fearnley Museet through the existing Astrup Fearnley place
- Ekebergparken Museum through the existing `ekebergparken` physical parent
- Oslo rådhus through the existing City Hall place
- Nasjonalmuseet through the existing National Museum place

These were not recreated simply because they appeared on a museum visitor list.

## Deferred or intentionally excluded from this source pass

### Fineart Oslo

Deferred to a future systematic commercial-gallery / art-sales venue policy. It should not be selected arbitrarily as a canonical place merely because VisitOSLO includes one large commercial gallery in its museum list.

### Paradox Museum Oslo

Deferred outside the core museum pass. The current venue is a franchise-based interactive attraction without a strong Oslo-specific collection or site identity. It can be reconsidered under a dedicated interactive-science/perception attraction policy.

### The Mini Bottle Gallery

Already explicitly deferred in the completed Atlas Obscura audit. No new evidence in this pass justified reopening that decision.

## Status-sensitive candidates

Several approved candidates require explicit current-status metadata if they proceed to canonical production:

- `jodisk_museum_oslo` — temporarily closed for renovation from 1 May 2026; estimated completion autumn 2028.
- `det_internasjonale_barnekunstmuseet` — ordinary opening suspended since 8 December 2025; reopening remains funding-dependent and uncertain.
- `roseslottet` — current official plan says the installation is to remain through the end of 2026; it must not be modeled as automatically permanent.
- `ibsen_museum_teater` — current visitor entrance and the historic Ibsen apartment use different address descriptions and require coordinate-role review.
- `norges_hjemmefrontmuseum` — internal Akershus building 21; must use a verified internal-building anchor, not the general fortress marker.
- `forsvarsmuseet` — internal Akershus building 62; must use a verified internal-building anchor, not the general fortress marker.

## Batch PRs

All nine production-research PRs are currently open drafts at the time of this report:

- #2566 — batch 1: Norsk Folkemuseum, Norsk Maritimt Museum, Historisk museum
- #2571 — batch 2: Frogner hovedgård, Arbeidermuseet, Interkulturelt Museum parent enrichment
- #2573 — batch 3: Nobels Fredssenter, Kunstnernes Hus, Popsenteret/Schous enrichment
- #2575 — batch 4: Vigelandmuseet, IBSEN Museum & Teater, Møllergata skole/Oslo Skolemuseum
- #2576 — batch 5: Jødisk Museum, Norges Hjemmefrontmuseum, Sporveismuseet control
- #2577 — batch 6: Forsvarsmuseet, Naturhistorisk museum, Holmenkollen Skimuseum control
- #2579 — batch 7: Roseslottet, Det Internasjonale Barnekunstmuseet, Nasjonalmuseet – Arkitektur control
- #2581 — batch 8: TBS Gallery, The Viking Planet, Fineart and Paradox boundary classification
- #2583 — batch 9: The Salmon, future Fotohuset Deich/Fotografiska, Akershus slott control

## Data changes already made in draft branches

The source pass did not wait for coordinates where a safe existing-place correction could be made:

1. `gronland_politistasjon`
   - current Interkulturelt Museum use made explicit;
   - former cells identified as current exhibition spaces;
   - official museum link added.

2. `schous_bryggeri`
   - former Popsenteret use added as a historical post-industrial cultural layer;
   - permanent museum closure recorded so it is not presented as active.

3. `gamle_deichman`
   - Hammersborg chronology corrected from the misleading 1890 framing to the building's 1933–2019 main-library period;
   - planned Fotohuset Deich / Fotografiska reuse recorded as a future 2028 layer rather than an active museum.

These changes remain in draft PRs until merged.

## Required next production phase

The correct next step is **not another random museum-name search**. It is to process the 18 approved candidates through the coordinate and canonical-production gate in controlled batches.

Recommended order:

1. Standard Geonorge address-first candidates.
2. Special internal-building and entrance/site candidates.
3. Status-sensitive candidates.
4. Canonical source creation and category assignment.
5. Manifest/index regeneration and full validation.
6. Merge the draft stack in a clean, non-conflicting order or rebuild batches on updated `main` if the branches become stale.

## Closure statement

The current VisitOSLO/visitor-museum source pass is classified as complete as of 2026-07-20. There is no known unclassified item remaining from the source set reviewed in this pass.

This does **not** close independent Oslo place completeness. Future completeness work should move to a different source family rather than repeatedly re-auditing the same museum list.
