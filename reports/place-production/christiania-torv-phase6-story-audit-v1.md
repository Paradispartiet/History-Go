# Christiania Torv – fase 6 Story audit v1

Dato: 2026-08-23  
Place ID: `christiania_torv`  
Baseline: `main` etter fase-5-merge `e13841fa2c7f9e735f4326bcb811d695ff227d2d`  
Styrende kontrakt: `docs/STORIES_DATA_GOVERNANCE.md`

## Tidligere-arbeid-gate

Repo og aktivt Story-manifest er kontrollert før ny materialisering. Dagens `main` hadde ingen aktiv `data/stories/stories_christiania_torv.json` og ingen manifest-entry for `christiania_torv`. Et eldre, ikke lenger aktivt forslag fra PR #786 brukte Story-ID-en `st_christiania_torv_byflyttingen_1624`; den ID-en gjenbrukes i stedet for å opprette en konkurrerende Story-identitet.

Det gamle forslaget brukes ikke ukritisk. Det manglet dagens `episode_v1`-profil, brukte en ikke-canonical People-ID (`christian_iv`) og formulerte hanskefortellingen for sikkert. Fase 6 bygger derfor Storyen på nytt under dagens kontrakt, men bevarer ID-kontinuiteten.

## Story-beslutning

Materialet kvalifiserer som Story, ikke bare chronology, fordi hovedspørsmålet er en dokumentert **forvandling etter krise**: Hvorfor ble byen flyttet etter brannen i 1624, og hvordan ble beslutningen fysisk virkeliggjort i den nye Christiania-byen?

Dramatisk motor:

- storbrannen skaper en reell krise;
- Christian IV velger flytting i stedet for gjenoppbygging på samme sted;
- byen organiseres på nytt ved festningen;
- torget får funksjon som sivilt, handelsmessig og offentlig tyngdepunkt.

Dette gir mer enn en rekke årstall. 1639, 1641 og senere torghistorie brukes som konsekvenser av den samme byflyttingen, ikke som separate Stories.

## Canonical integritet

- Story ID: `st_christiania_torv_byflyttingen_1624` – gjenbrukt fra tidligere ikke-aktivt arbeid;
- `quality_profile`: `episode_v1`;
- type: `turning_point`;
- place: `christiania_torv`;
- canonical related Person: `kong_christian_iv`;
- related Places: `middelalder_oslo`, `akershus_festning`, `gamle_radhus`;
- `next_scenes` brukes bare for `middelalder_oslo` og `akershus_festning`, fordi de forklarer henholdsvis byen som ble forlatt og festningen som styrte plasseringen av den nye byen;
- `gamle_radhus` er related place, ikke parent-place og ikke proxy for torget.

## Kilder

Storyen bruker tre inspectable institusjonelle kilder:

1. Oppdag Kvadraturen / Byantikvaren – Historien;
2. Oppdag Kvadraturen / Byantikvaren – Christiania Torv;
3. Oslo byleksikon – Christiania Torv.

Hanskeskulpturen brukes som dagens synlige fortellingsanker, men er eksplisitt **ikke** historisk bevis for et bokstavelig hanskekast.

## Score

Maskinmotoren i `js/stories/story_scoring.js` gir:

- narrative: 4;
- historical: 3;
- source: 5;
- play_value: 4;
- originality: 3;
- total: **19**.

Scoren er teknisk kontrakt, ikke redaksjonell skjønnsscore.

## Narrativ storytest

1. Narrativt spørsmål – PASS.
2. Dramatisk motor – PASS: krise + beslutning + fysisk forvandling.
3. Sammenheng – PASS: alle hendelser forklarer samme byflytting og etableringen av den nye civic-kjernen.
4. Stedsverdi – PASS: torgets rolle som faktisk funksjonsrom er en del av konsekvensen.
5. Chronology-uavhengighet – PASS: Storyen forklarer beslutning og forvandling, ikke bare datoer.
6. Avslutning – PASS: dagens plass kan leses som fysisk konsekvens av 1624-valget, samtidig som hanskemotivet holdes kildekritisk avgrenset.

## Fase-6-konklusjon

**KLAR FOR REVIEW** når Story-filen er registrert i både `stories_manifest.json` og `stories_episode_v1_manifest.json`, `npm run check:stories` er grønn på eksakt head og ingen temporary writeback-workflow ligger igjen i slutt-diffen.
