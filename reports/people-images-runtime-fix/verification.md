# People image runtime fix verification

## Selected batch IDs

Chosen explicit people IDs (all already in manifest, no local image, historical/deceased revue/theatre figures):

1. `leif_juster`
2. `einar_schanke`
3. `lalla_carlsen`
4. `kari_diesen`
5. `ernst_diesen`
6. `per_kvist`
7. `arvid_nilssen`
8. `willie_hoel`
9. `dan_fosse`
10. `rolv_wesenlund`

## Result

* People processed: 10
* People with candidate: 0
* Total candidates: 0
* Lookup errors: 10
* Licenses present: none
* Wikidata IDs found: none (all requests failed before lookup completed)
* All candidates have `approved: false`: yes, vacuously (candidate file is empty)
* All image URLs are from Wikimedia: yes, vacuously (candidate file is empty)
* Creator or credit exists: no candidates to verify
* License and license URL exists: no candidates to verify
* People files changed: no
* Images downloaded: no

## Network finding

The candidate run still could not produce a real batch in this container because outbound HTTPS CONNECT through the configured proxy returns HTTP 403 for Wikidata/Wikimedia (and npm registry). Running without proxy cannot resolve external hosts. The pipeline now handles this as bounded per-person lookup failures with three attempts per request and a summary instead of aborting the whole batch after ten consecutive failures.
