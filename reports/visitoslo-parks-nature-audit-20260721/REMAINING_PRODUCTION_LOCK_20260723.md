# VisitOSLO parks/nature — remaining production lock

Date: 2026-07-23

The closed 30-row VisitOSLO parks/nature scope still had six unproduced approved candidates on current `main`. Exact-object revalidation against the OSM IDs from intake PR #3146 now resolves five as production-ready and leaves one, Brekkedammen, in a separate recreation-site coordinate gate.

## Production-ready

| placeId | Category | Locked coordinate source | Coordinate |
|---|---|---|---|
| `lillomarka` | `natur` | `osm-relation:5806405` | 60.0056538, 10.8585573 |
| `grorudparken` | `by` | `osm-way:125848624` | 59.9576727, 10.8755562 |
| `aamot_bru` | `historie` | `osm-way:791117473` | 60.0185966, 10.615812 |
| `klosterenga_skulpturpark` | `kunst` | `osm-way:4874898` | 59.9082666, 10.7761761 |
| `peer_gynt_parken` | `kunst` | `osm-way:126850692` | 59.9319086, 10.7922952 |

All five exact objects retain the expected names and object types and have no current canonical identity duplicate.

### Lillomarka

Represent the broad named Marka/woodland area, not a trailhead, cabin or single lake. The exact OSM relation is an area identity and Oslo kommune treats Lillomarka as one of the named Oslomarka areas.

### Grorudparken

Represent the named public park landscape along Alna. `groruddammen` remains a separate exact water/recreation place inside the broader park landscape.

### Åmot bru

Represent the exact historic iron chain suspension bridge. Oslo byleksikon documents its 1851 construction, original location at Åmotsund, relocation to Akerselva in 1957 and its distinctive historical inscription.

### Klosterenga skulpturpark

Represent the whole sculpture-, water- and park environment. Oslo kommune defines Klosterenga as a sculpture park where public art, the reopened Hovinbekken and recreation form one integrated landscape. Individual artworks do not replace the whole-site identity.

### Peer Gynt-parken

Represent the complete sculpture park at Løren. The park's own current site presents it as an international public-art walk interpreting Henrik Ibsen's `Peer Gynt`; individual sculptures remain content layers unless separately justified under the public-art model.

## Pending — Brekkedammen

`brekkedammen` remains approved in scope but is not yet production-ready.

The locked exact OSM object `osm-way:66357555` is the named weir, at `59.9667474, 10.7767656`, and lies only 25.2 metres from the existing `frysja_33_brekke_kraftstasjon` place. Oslo kommune, however, identifies `Brekkedammen ved Frysja` as a named bathing/recreation place in the upper Akerselva.

The weir is therefore physical and historical evidence for the site but cannot automatically define the whole bathing/recreation marker. Dedicated source-first anchor audit PR #3486 must resolve an exact recreation/bathing identity or keep the candidate coordinate-blocked.

## Production rule

Re-audit current `main` immediately before writing each place. Preserve PR #3484 as a noisy revalidation audit trail; production should use this clean lock rather than merge runner-generated shared-state files from the intake branch.

Status: **FIVE PRODUCTION-READY; ONE RECREATION-SITE COORDINATE DECISION PENDING.**
