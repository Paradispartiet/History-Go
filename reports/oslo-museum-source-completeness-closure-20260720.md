# Oslo museum / visitor-source completeness closure

Date: 2026-07-20

## Status

**Research/source classification: CLOSED for the current VisitOSLO museum/visitor-list pass.**

**Coordinate intake and canonical production: CLOSED for all 18 approved candidates.**

This report closes the systematic museum/visitor-source pass that followed the completed Atlas Obscura, Kultureiendommer and Oppdag Kvadraturen audits. It does not claim that every museum-like institution in Oslo has been discovered from every possible source. It records that the current VisitOSLO museum/visitor source set and the additional high-value museum clusters surfaced during the pass have been classified against current History Go canonical places, and that every approved new candidate from this pass has now been processed through the repository's coordinate and canonical-production gates.

The main source family used for the final source pass was:

- https://www.visitoslo.com/en/activities-and-attractions/attractions/museum/
- https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/attraksjoner/museer/

Current institution status was checked against official museum/institution sources where opening status, relocation or future plans could have changed.

## Final production result

### Approved new canonical candidates: 18 / 18 produced

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

All 18 now have a canonical place representation and a repository-approved coordinate model.

### Coordinate methods used

- **14 standard address-first candidates** were run through the repository's normative Geonorge address finder. All 14 returned `verified_candidate` results and were subsequently identity-checked before production.
- **Norges Hjemmefrontmuseum** uses exact internal Akershus building geometry for building 21 / Det dobbelte batteri.
- **Forsvarsmuseet** uses exact internal Akershus building geometry for building 62 / Hovedarsenalet.
- **Roseslottet** uses a verified site geometry rather than the nearby Frognerseteren station as a proxy.
- **IBSEN Museum & Teater** uses the official public visitor entrance at Henrik Ibsens gate 26 as display/unlock anchor while preserving Arbins gate 1 as the historical Ibsen apartment layer.

The Oslo coordinate-control protocol contains these production decisions through **batch 50**. After batch 50, the protocol reports **196 verified or source-controlled canonical Oslo places**.

## Representation decisions that prevented duplicate markers

### Interkulturelt Museum

Physical building already represented as `gronland_politistasjon` at Tøyenbekken 5.

Decision: no new marker. The existing place now explicitly records the current Interkulturelt Museum use and official museum source.

### Bymuseet and Teatermuseet

Both institutions use the same physical Frogner hovedgård complex.

Decision: one canonical place, `frogner_hovedgard`, with Bymuseet and Teatermuseet as institutional/use layers rather than two overlapping museum markers.

### Oslo Skolemuseum

The museum occupies part of Møllergata school.

Decision: one canonical place, `mollergata_skole`, with Oslo Skolemuseum modeled as the current institutional layer in building D.

### Popsenteret

The former museum occupied the already canonical Schous complex and is permanently closed.

Decision: no new active marker. The former Popsenteret use is recorded as a historical cultural layer on `schous_bryggeri`.

### Sporveismuseet

Already canonical and coordinate-verified.

Decision: retain existing place.

### Naturhistorisk museum

Already canonical as `naturhistorisk_museum`, with `botanisk_hage` separately represented.

Decision: retain existing place. Any remaining coordinate-quality debt belongs to the independent coordinate-control backlog, not the museum completeness pass.

### Skimuseet i Holmenkollen

Already physically represented through `holmenkollen_nasjonalanlegg`, whose canonical record includes the museum and tower as parts of the same visitor complex.

Decision: no duplicate museum marker.

### Nasjonalmuseet – Arkitektur

The Bankplassen 3 building is already canonical as `grunnlovsbygget_bankplassen`, and the record already identifies its current museum use.

Decision: no duplicate museum marker.

### Fotohuset Deich / Fotografiska Oslo

The future museum building is already canonical as `gamle_deichman`.

Decision: no new active museum marker before opening. The Hammersborg chronology is corrected to the 1933–2019 main-library period, and the planned 2028 photo-house reuse is recorded as a future layer.

### Akershus slott

Already represented through the existing compatibility/canonical structure around `akerhus_slott` and `akershus_festning`.

Decision: no additional place from this source pass. ID compatibility remains a separate cleanup concern.

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

## Status-sensitive canonical places

Coordinate verification describes the physical place and source identity. It does not automatically mean that a venue is currently open to the public.

- `jodisk_museum_oslo` — physical place verified at Calmeyers gate 15B; museum building closed for renovation from 1 May 2026 with estimated reopening autumn 2028. Education and city walks continue outside the building.
- `det_internasjonale_barnekunstmuseet` — physical place verified at Lille Frøens vei 4; ordinary opening suspended since 8 December 2025 with no fixed reopening date as of 20 July 2026.
- `roseslottet` — verified as a time-limited installation; the current official plan runs through the end of 2026 and permanence must not be assumed.
- `ibsen_museum_teater` — current public visitor address is Henrik Ibsens gate 26; Arbins gate 1 remains the historical apartment layer and must be used in historical questions about Ibsen's home.

## Existing-place corrections completed during the pass

The source pass also produced three safe enrichments without creating duplicate markers:

1. `gronland_politistasjon`
   - current Interkulturelt Museum use made explicit;
   - former cells identified as current exhibition spaces;
   - official museum link added.

2. `schous_bryggeri`
   - former Popsenteret use added as a historical post-industrial cultural layer;
   - permanent museum closure recorded so it is not presented as active.

3. `gamle_deichman`
   - Hammersborg chronology corrected to the 1933–2019 main-library period;
   - planned Fotohuset Deich / Fotografiska reuse recorded as a future 2028 layer rather than an active museum.

These changes were rebuilt from current `main` and merged through PR #2602.

## Production audit trail

The final production work was merged through the following main PR sequence:

- **#2594** — special geometry production: Norges Hjemmefrontmuseum, Forsvarsmuseet and Roseslottet.
- **#2602** — existing-place museum-use enrichments: Grønland politistasjon / Interkulturelt Museum, Schous bryggeri / Popsenteret, Gamle Deichman / future Fotohuset Deich.
- **#2605** — normative Geonorge intake for all 14 standard address-first candidates; 14/14 returned verified candidates.
- **#2612** — coordinate batch 42: Norsk Folkemuseum, Norsk Maritimt Museum and Historisk museum.
- **#2622** — coordinate batch 43: Frogner hovedgård, Arbeidermuseet and Nobels Fredssenter.
- **#2631** — coordinate batch 45: Kunstnernes Hus, Vigelandmuseet and Møllergata skole.
- **#2640** — coordinate batch 48: TBS Gallery, The Viking Planet Oslo and The Salmon knowledge centre.
- **#2642** — coordinate batch 49: Jødisk Museum i Oslo and Det internasjonale Barnekunstmuseet.
- **#2644** — normative Geonorge intake for the remaining special Ibsen visitor-address case.
- **#2646** — coordinate batch 50: IBSEN Museum & Teater.

Several earlier research/draft PRs became stale while parallel coordinate-control work advanced `main`. Their approved content was rebuilt from current `main` rather than merged stale.

## Deferred or intentionally excluded from this source pass

### Fineart Oslo

Deferred to a future systematic commercial-gallery / art-sales venue policy. It should not be selected arbitrarily as a canonical place merely because a visitor list includes one large commercial gallery.

### Paradox Museum Oslo

Deferred outside the core museum pass. The venue is a franchise-based interactive attraction without a strong Oslo-specific collection or site identity. It can be reconsidered under a dedicated interactive-science/perception attraction policy.

### The Mini Bottle Gallery

Already explicitly deferred in the completed Atlas Obscura audit. No new evidence in this pass justified reopening that decision.

## Closure statement

The current VisitOSLO/visitor-museum source pass is **research-complete and production-complete as of 2026-07-20**. There is no known unclassified or unproduced approved candidate remaining from the source set reviewed in this pass.

This does **not** close independent Oslo place completeness. Future completeness work should move to a different source family rather than repeatedly re-auditing the same museum list.
