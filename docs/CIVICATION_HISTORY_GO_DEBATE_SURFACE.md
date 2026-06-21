# History Go debatt-flate (spec)

Dette er spesifikasjonen for den siste gjenstående produsenten i Civication↔History GO-loopen:
en faktisk **debatt-/standpunkt-flate i History GO** som lar spilleren delta i en debatt og
velge standpunkt, og som skriver `HGDebates.record(...)`. Signalet (`hg_debate_log_v1`),
completion-bridgen og deep-link-resolveren finnes allerede — denne flaten er den manglende
produsenten.

> Status: **implementert** (MVP). `data/debates/`, `js/debates/debates_loader.js`
> (`HGDebatesContent`), `#/debate/:id`-ruten, `HGMapView.openDebate`, deep-link og PlaceCard-
> inngangen er på plass med tester. Resten av dokumentet beskriver designet og gjenstående faser.

## 1. Hvorfor / kontekst

Alle andre `history_go`-completion-modes fullføres nå av faktiske spillerhandlinger (place,
quiz, person, story, leksikon). For debatt finnes **forbruker-siden ferdig**:

- `js/hgDebates.js` → `HGDebates.record({ debateId, conflictId, position })` skriver
  `hg_debate_log_v1` og dispatcher `hg:debate-participated`.
- Broen (`civicationHistoryGoTaskBridge`) fullfører `debate_participated` (deltatt) og
  `position_chosen` (posisjon satt), matchet på `debate_id` / `conflict_id` / `target_id`.

Det som mangler er **noe som faktisk kaller `HGDebates.record(...)`** — en flate spilleren går
til. `data/Civication/conflicts/*.json` er Civication-interne rolle-akser (`teori_vs_praksis`
o.l.), ikke spiller-vendt debattinnhold, så debatt trenger sin egen datakilde.

## 2. Avgrensning

Flaten GJØR:

- Laster debatt-innhold (data), viser én debatt (spørsmål + kontekst + standpunkter).
- Lar spilleren delta og velge ett standpunkt.
- Skriver signalet via `HGDebates.record(...)` (deltakelse + valgt posisjon).
- Er deep-linkbar via `#/debate/:id`.

Flaten GJØR IKKE:

- Eier ikke konsekvens/score — det gjør Civication når den leser resultatet.
- Endrer ikke eksisterende signal-/bro-kontrakter (de er ferdige).
- Er ikke en chat/flertrinns-debatt i v1 (én runde: les → velg standpunkt).

## 3. Datamodell (ny `data/debates/`)

Manifestdrevet som resten av `data/` (jf. `data/places/manifest.json`).

`data/debates/manifest.json`:

```json
{ "files": ["data/debates/debates_by.json", "data/debates/debates_naeringsliv.json"] }
```

Hver fil: en liste med debatt-objekter:

```json
{
  "id": "havnebyen_vs_vernet",
  "title": "Skal Bjørvika prioritere utbygging eller vern?",
  "question": "Byrådet skal velge retning for havnefronten.",
  "context": ["Kort bakgrunn i 1–3 linjer …"],
  "place_id": "bjorvika",          // valgfri History Go-kobling
  "person_id": null,                // valgfri
  "category": "by",                 // valgfri (domene)
  "emne_ids": ["byutvikling"],      // valgfri
  "positions": [
    { "id": "utbygging", "label": "Prioriter utbygging", "blurb": "…" },
    { "id": "vern",       "label": "Prioriter vern",      "blurb": "…" },
    { "id": "kompromiss", "label": "Søk kompromiss",      "blurb": "…" }
  ],
  "sources": []
}
```

Felt-kontrakt:

- `id` (påkrevd) = `debateId`. Skal kunne brukes som `debate_id`/`target_id` i en Civication-task.
- `positions[].id` = verdien som sendes som `position` til `HGDebates.record`.
- `place_id`/`person_id`/`category`/`emne_ids` er valgfrie koblinger til History Go-innhold (for
  fremtidig deep-link fra sted/person, og for at en task kan peke til samme debatt).

## 4. Loader (`js/debates/debates_loader.js`)

Holder **innhold** adskilt fra **signal** (`hgDebates.js` beholder kun record/log).

`window.HGDebatesContent`:

- `async init()` — laster manifest + filer, bygger `byId` og `byPlace`-indeks. Idempotent.
- `getById(id)` → debatt eller `null`.
- `getByPlace(placeId)` → liste (for fremtidig «debatter her»-inngang fra PlaceCard).

Lastes i index-appen via `app.js` `loadScriptOnce`, i bakgrunnsfasen (ikke kritisk for kart).

## 5. Rute + view

### Rute

`AppRouter`: ny rute `#/debate/:id` (samme mønster som `#/quiz/:id`). I `render()`:

```js
if (route.name === "debate") {
  const ok = window.HGMapView?.openDebate?.(route.params[0]);
  if (!ok) window.HGMapView?.showMap?.();
  return;
}
```

Legg til `debatePath(id)` + `toDebate(id)` på router-API-et (speiler `quizPath`/`toQuiz`).

### View

`HGMapView.openDebate(debateId)` (speiler `openQuiz`):

1. `await HGDebatesContent.init()`, hent debatt; returner `false` hvis ukjent (router faller til kart).
2. Render en enkel modal/flate: tittel, kontekst, og én knapp per `positions[]`.
3. **Ved åpning** (deltatt): `HGDebates.record({ debateId, conflictId: debate.conflict_id || null })`.
4. **Ved valg av standpunkt**: `HGDebates.record({ debateId, position: positionId })`, vis kort
   kvittering, og dispatch `updateProfile` (record gjør dette allerede).

Gjenbruk eksisterende popup-/modal-infrastruktur (samme som quiz/place), ny CSS-klasse
oppført i `README/SYSTEM_REGISTRY.md` §7 hvis en ny CSS-fil trengs (helst gjenbruk eksisterende).

## 6. Deep-link

Utvid `CivicationHistoryGoDeepLink.resolve(payload)` slik at debatt får en rute (returnerer i dag
`null`):

```js
if (type === "debate") {
  const id = clean(p.debate_id) || clean(p.conflict_id) || clean(p.target_id);
  if (id) return { href: `index.html#/debate/${encodeURIComponent(id)}`, label: "Gå til debatten i History Go", target_type: "debate" };
}
```

Da kan «Gå til History Go»-knappen i Civication navigere til debatten, spilleren velger
standpunkt, og broen fullfører `position_chosen`/`debate_participated` ved retur (reconcile-on-open).

## 7. Uendret (allerede ferdig)

- `js/hgDebates.js` (`HGDebates.record/load/getById`, `hg_debate_log_v1`).
- Broens `evaluate()` debatt-gren.
- `data/.../task_payload` debatt-schema (`history_go_debate`, `debate_participated`,
  `position_chosen`) i `civicationTaskEngine.js`.

## 8. Lasting / boot

- `app.js`: `loadScriptOnce("js/debates/debates_loader.js")` i bakgrunnsfasen.
- `app.js`: `loadScriptOnce("js/views/...")` allerede dekket; legg `openDebate` i `MapView.js`.
- `AppRouter`: registrer `debate`-ruten.
- Bruk `safeRun()` for init; en feilende debatt-loader skal ikke stoppe boot.

## 9. Tester (Node-assert, jf. eksisterende `tests/`)

- **Loader**: manifest → `getById`/`getByPlace` returnerer riktig; ukjent id → `null`.
- **Deep-link**: `resolve()` for debatt → `index.html#/debate/<id>` (id url-encodet); fortsatt
  `null` uten id.
- **View → signal**: `openDebate` på ukjent id → `false`; valg av standpunkt → `HGDebates.record`
  kalt med `{ debateId, position }` (stub `HGDebates`).
- **Ende-til-ende (bro)**: allerede dekket — record → `hg_debate_log_v1` → bro fullfører tasken.

## 10. Faser

1. **MVP**: datamodell + loader + `#/debate/:id` + minimal view (les + velg standpunkt) + signal
   + deep-link + tester. Liten seed (2–3 debatter).
2. **Senere**: «debatter her»-inngang fra PlaceCard (`getByPlace`), person-koblede debatter,
   flertrinns/oppfølging, redaksjonelt innhold i skala.

## 11. Åpne spørsmål (avklar før bygg)

- **Innholdseierskap**: hvem skriver debatt-tekstene? v1 trenger bare 2–3 seed-debatter for å
  bevise loopen; full redaksjon er en egen jobb.
- **Inngang for spilleren**: kommer spilleren til debatt kun via Civication deep-link i v1, eller
  også via en History Go-inngang (kart/PlaceCard)? Foreslår: **kun deep-link i v1**, PlaceCard-
  inngang i fase 2.
- **`conflict_id` vs `debate_id`**: v1 bruker `debate_id` = debattens `id`. `conflict_id` kobles
  kun hvis en debatt eksplisitt speiler en Civication-konflikt (valgfritt felt).
