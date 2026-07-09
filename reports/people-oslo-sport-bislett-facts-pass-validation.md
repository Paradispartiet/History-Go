# Bislett Stadion people facts pass validation

## Scope

Enrich existing Bislett Stadion people batch entries with more concrete factual context in `popupDesc`.

This pass updates the dedicated Bislett Stadion batch files only:

- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch1.json`
- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch2.json`
- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch3.json`
- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch4.json`
- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch5.json`
- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch6.json`
- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch7.json`
- `data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch8.json`

## Updated people count

- 8 batch files
- 40 existing people entries
- 0 new people entries
- 0 deleted people entries

## What changed

Only `popupDesc` text was enriched. The facts pass adds compact context such as:

- Olympic / World Championship context when relevant
- whether the Bislett performance was a world record, meeting record or championship result
- why the person matters for Bislett specifically, not just for general sports history
- whether the person represents skating, middle distance, long distance, sprint, hurdles, field events or organizer history

## What did not change

- No `id` changes
- No `placeId` changes
- No `places` changes
- No category changes
- No manifest changes
- No place files
- No `data/places/places_index.json`
- No UI/runtime/loader files
- No image paths or external assets

## Legacy note

The older mixed file `data/people/sport/oslo/people_sport_oslo.json` still contains several Bislett-linked legacy entries such as Grete Waitz, Hjalmar Andersen, Johann Olav Koss, Karsten Warholm, Jakob Ingebrigtsen, Ingrid Kristiansen, Vebjørn Rodal, Trine Hattestad and Andreas Thorkildsen. Those can be handled in a separate smaller legacy facts pass to avoid mixing broad root-file edits with the dedicated batch-file enrichment.

## Expected validation

To run before merge:

```bash
node -e "for (const f of [
  'data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch1.json',
  'data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch2.json',
  'data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch3.json',
  'data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch4.json',
  'data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch5.json',
  'data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch6.json',
  'data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch7.json',
  'data/people/sport/oslo/people_sport_oslo_bislett_stadion_batch8.json'
]) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
bash scripts/check-people.sh
```

Expected:

- JSON parse OK
- duplicatePeopleIds unchanged / 0
- invalidPlaceRefs unchanged / 0
- peopleWithoutValidPrimaryAnchor unchanged / 0
- peopleWithEmptyPlacesArray unchanged / 0
