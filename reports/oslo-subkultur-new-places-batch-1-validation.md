# Oslo subkultur new places batch 1 — validation

Dato: 2026-07-07

## Scope-bekreftelse

- Nye places opprettet: `helvete_neseblod_records`, `last_train_oslo`, `rock_in_oslo`, `club_7_vika`.
- Skipped: ingen kandidater ble skippet.
- Ingen people ble opprettet.
- Ingen people-filer ble endret.
- Ingen navngitte personer ble lagt inn som people.
- Ingen quiz-filer, UI-/loader-/relation-filer eller unrelated kategori-/Lisboa-filer ble endret.

## Filer lest før endring

- `data/places/manifest.json`
- `data/places/places_index.json`
- `data/places/subkultur/oslo/places_subkultur.json`
- `data/people/manifest.json`
- `data/people/subkultur/oslo/people_subkultur_oslo.json`
- `reports/people-place-coverage.md`
- `reports/people-of-places-status.md`

## Candidate IDs sjekket repo-wide

Kommando brukt før append:

```bash
rg -n 'helvete_neseblod_records|last_train_oslo|rock_in_oslo|club_7_vika|helvete|neseblod|helvete_records|neseblod_records|black_metal_museum|last_train|rock_in|club_7|scene_7|chateau_neuf_betong' . -g '!node_modules'
```

Resultat:

- Ingen eksisterende place IDs med `helvete_neseblod_records`, `last_train_oslo`, `rock_in_oslo` eller `club_7_vika`.
- `helvete_black_metal_miljoet` fantes bare som holdt-tilbake people-kandidat i rapport, med status `held_back_missing_valid_anchor`.
- `neseblod` og `club_7` fantes som brand IDs, ikke place IDs.
- Ingen av de nye ID-ene lå i `data/places/places_index.json` før index-regenerering.

## Existing-place duplicate search

Sjekket søketermer: `helvete`, `neseblod`, `helvete_records`, `neseblod_records`, `black_metal_museum`, `last_train`, `rock_in`, `club_7`, `scene_7`, `chateau_neuf_betong`.

Konklusjon: ingen eksisterende place-entry ble funnet for samme sted under annen ID. Det ble derfor ikke rapportert `skipped_existing_place`.

## Research-gate per kandidat

### `helvete_neseblod_records`

Status: added.

Kildegrunnlag:

- Atlas Obscura oppgir at platebutikken opprinnelig het Helvete og ble åpnet i juni 1991 av Euronymous.
- Flere kilder knytter Helvete/Neseblod til Schweigaards gate 56, Oslo; TripAdvisor/Metal Archives/recordstores.love oppgir Neseblod Records på Schweigaards gate 56.
- Kilder om tidlig norsk black metal omtaler Helvete som samlingspunkt for scenen; entryen er formulert nøkternt som musikkhistorie, platekultur, undergrunn og kontroversielt kulturminne.
- Brann-/skadestatus ble vurdert via 2024-kilder om brannskade. Entryen skriver derfor ikke at butikken nødvendigvis er ordinært åpen i dag.

Kilder brukt:

- https://www.atlasobscura.com/places/helvete-neseblod-records
- https://www.tripadvisor.com/Attraction_Review-g190479-d13128521-Reviews-Neseblod_Records-Oslo_Eastern_Norway.html
- https://www.metal-archives.com/labels/Neseblod_Records/2981
- https://recordstores.love/2059
- https://www.metalsucks.net/2024/04/10/a-historic-black-metal-site-in-oslo-linked-to-euronymous-was-severely-damaged-in-a-fire/

Koordinatkilde:

- Koordinat: `59.908453, 10.769525`.
- Kilde: Yandex Maps-oppføring for Schweigaards gate 56A / Black Metal Museum.
- URL: https://yandex.com/maps/10467/oslo/house/ZUkYcQFpTEcCQFtjfXVxeXhmZw%3D%3D/

### `last_train_oslo`

Status: added.

Kildegrunnlag:

- Last Trains offisielle nettsted oppgir Karl Johans gate 45, entry via Universitetsgata, 0162 Oslo.
- Offisiell side profilerer stedet som `Rock n Roll bar` og viser program.
- Visit Oslo omtaler Last Train som Oslos eldste rockbar, åpnet i 1984, med norske og internasjonale band på regelmessig basis.

Kilder brukt:

- https://www.lasttrain.no/
- https://www.lasttrain.no/info-og-kontakt
- https://www.visitoslo.com/en/product/?tlp=2984863

Koordinatkilde:

- Koordinat: `59.91447, 10.73495`.
- Kilde: Manuell byggpunktsplassering mot offisiell adresse Karl Johans gate 45 / inngang Universitetsgata.
- URL: https://www.lasttrain.no/info-og-kontakt

### `rock_in_oslo`

Status: added.

Kildegrunnlag:

- Rock Ins offisielle nettsted profilerer stedet med `Rock, Metal, Øl, Satan` og oppgir at konserter og arrangementer legges ut fortløpende.
- Arrangement-/venuekilder oppgir Rock In på Grønland 14, 0188 Oslo.
- Kildene støtter bruk som rock-/metalpub og liten scene, ikke generisk bar.

Kilder brukt:

- https://rockin.no/
- https://guestpectacular.com/artists/angie/events/2024-05-11/norway/oslo/rock-in
- https://hellonearthzine.com/the-hostile-takeover-of-oslo-metal-club-rock-in/

Koordinatkilde:

- Koordinat: `59.9127, 10.7625`.
- Kilde: Manuell plassering på Grønland 14 etter adresseverifikasjon fra arrangement-/venuekilder.
- URL: https://guestpectacular.com/artists/angie/events/2024-05-11/norway/oslo/rock-in

### `club_7_vika`

Status: added.

Kildegrunnlag:

- Oslo byleksikon verifiserer Club 7 som kulturhus 1963–1985, med lokasjon 1971–1985 i Munkedamsveien 15 / Konserthusterrassen under Johan Svendsens plass.
- Oslo byleksikon omtaler motkultur-, avantgarde- og undergrunnspreg.
- Røverstaden oppgir at Munkedamsveien 15 huset Club 7 i 1970- og tidlig 1980-tall, med variert programmering: jazz, folkemusikk, teater, poesi, utstillinger, filmvisninger og debatter.
- Lokalhistoriewiki verifiserer flere lokasjoner over tid, lengst og sist i Munkedamsveien 15.
- Entryen er derfor skrevet som Vika-/Munkedamsveien 15-anker og eksplisitt ikke som ett fast bygg for hele perioden.

Kilder brukt:

- https://oslobyleksikon.no/side/Club_7
- https://www.roverstaden.no/en/omroverstaden
- https://lokalhistoriewiki.no/wiki/Club_7

Koordinatkilde:

- Koordinat: `59.913424, 10.729279`.
- Kilde: Kartoppføring for Munkedamsveien 15 / Røverstaden-området, brukt som områdeanker.
- URL: https://oslobyleksikon.no/side/Club_7

## Post-append audits

Kommandoer kjørt:

```bash
node -e "JSON.parse(require('fs').readFileSync('data/places/subkultur/oslo/places_subkultur.json','utf8')); console.log('json ok')"
npm run places:index:build
npm run build:tools
npm run places:index:check
npm run places:emner:check
npm run places:coords:check
python3 - <<'PY'
import json, pathlib, collections
ids=[]
for path in pathlib.Path('data/places').rglob('*.json'):
 if path.name=='places_index.json': continue
 try: data=json.load(open(path))
 except: continue
 if isinstance(data,list):
  for o in data:
   if isinstance(o,dict) and 'id' in o: ids.append((o['id'],str(path)))
counts=collections.Counter(i for i,p in ids)
print('duplicates', [(i,c) for i,c in counts.items() if c>1][:20])
for nid in ['helvete_neseblod_records','last_train_oslo','rock_in_oslo','club_7_vika']:
 print(nid, [p for i,p in ids if i==nid])
PY
python3 - <<'PY'
import json
p='data/places/subkultur/oslo/places_subkultur.json'
data=json.load(open(p))
for id in ['helvete_neseblod_records','last_train_oslo','rock_in_oslo','club_7_vika']:
 o=next(x for x in data if x.get('id')==id)
 req=['id','name','lat','lon','r','category','year','desc','popupDesc','emne_ids','quiz_profile','coordStatus','coordSource','coordVerifiedAt']
 missing=[k for k in req if k not in o or o[k] in (None,'')]
 if not (o.get('coordSourceUrl') or o.get('coordSourceId')): missing.append('coordSourceUrl_or_coordSourceId')
 print(id, 'OK' if not missing and o.get('category')=='subkultur' and o.get('coordStatus')=='verified' else missing)
PY
```

Resultater:

- JSON parse: pass.
- `places:index:build`: pass; `data/places/places_index.json` regenerert med etablert script, ikke håndredigert.
- `build:tools`: pass.
- `places:index:check`: pass; index er i sync.
- `places:emner:check`: pass; 0 missing emne IDs og 0 duplicate place IDs across active files.
- `places:coords:check`: pass; quality gate ok, med eksisterende varsler/review-kandidatsignaler rapportert i genererte koordinatrapporter.
- Duplicate-ID-sjekk: de fire nye ID-ene finnes én gang hver. Repoet har eldre duplikater som `torggata`, `bispelokket`, `gronland_basarene`, `karl_johan` m.fl., men ingen duplikat ble opprettet for de nye ID-ene.
- Feltkrav: alle fire nye places har id, name, lat/lon, r, category `subkultur`, year, desc, popupDesc, emne_ids, quiz_profile, coordStatus `verified`, coordSource, coordSourceUrl/coordSourceId og coordVerifiedAt.

## Endrede filer

- `data/places/subkultur/oslo/places_subkultur.json`
- `data/places/places_index.json`
- `reports/oslo-subkultur-new-places-batch-1-validation.md`
- `reports/place-coordinate-audit.json`
- `reports/place-coordinate-audit.md`
- `reports/place-coordinate-quality-gate.md`
