# Christiania Torv – final completion audit v1

Dato: 2026-08-24  
Place ID: `christiania_torv`  
Content Factory status: **PASS / COMPLETE**

## Canonical phase chain

| Fase | Resultat | Merge |
| --- | --- | --- |
| 4 – description v4.2 + image | PASS | `fe5cde4ef5c8e91b1ab2666ae8ccb3eb85052d4b` |
| 5 – structured profiles | PASS | `e13841fa2c7f9e735f4326bcb811d695ff227d2d` |
| 6 – Story | PASS | `87343213dae6eb4ab17720463f68334184395c68` |
| 7 – Quiz + Knowledge | PASS | `cf41f032bb2be8286d24f4c0ca08d0980147db4d` |
| 8 – popup / legacy / språk | PASS | `980a359c1016955baaefd9279fafa2a825978e46` |
| 9 – entities / PlaceCard / route | PASS | `44e8535a1b02760d842346dc23af0e214161e326` |

## Place og eierskap

- canonical scope er selve torget, med verifisert OSM-way `594329484`;
- `gamle_radhus` er separat canonical Place og er aldri brukt som proxy;
- koordinat-, description-, image-, spatial-, temporal- og history-layer-evidens er bevart;
- legacy Leksikon-artikkelen er kildebundet og source-tom generisk prosa er borte.

## Story, Quiz og Knowledge

- én canonical `episode_v1` Story;
- nøyaktig **5 sett × 7 = 35 spørsmål**;
- source brief: 35/35 claims med canonical familier;
- ni quiz-kilde-ID-er løser;
- progresjon, theory binding, method guidance og content balance passerer;
- alle 35 spørsmål har `knowledge_link_status: linked`, `knowledge_unit_ids` og `primary_knowledge_unit_id`;
- Phase-7 writeback-run `32698513593`, jobb `97345190242`, var grønn.

## Popup og språk

- Om, Historie, Fortellinger, Kilder og Språk har canonical eiere;
- Før/etter, Nyheter og Lesespor er eksplisitt vurdert uten filler;
- fem brukerrettede HTTPS-kilder er inspectable;
- tre dokumenterte navnespor er materialisert;
- ingen dialekt, uttale eller etymologi er diktet opp.

## People, Object, Brands, PlaceCard og route

- canonical Wenche Gulbransen gjenbrukes;
- Storyens `kong_christian_iv` gjenbrukes uten duplikat;
- `Christian IVs hanske` er materialisert som fysisk, stedsspesifikt object med tre kilder og eksplisitt kildekritisk grense;
- åtte volatile/uklart eide brand-mappinger er retirert i stedet for å publiseres blindt;
- canonical PlaceCard v2-samlinger er `people`, `objects` og `related`;
- Brands og en kunstig fjerde samling er utelatt fordi dokumentert ferskhet og eksakt plass-eierskap mangler;
- eksisterende rute `oslo_fra_middelalderby_til_fjordby` gjenbrukes; ingen rute-ID er oppfunnet.

## Permanente sluttporter

Phase-9 cleanup-head `f7a3b94d5e578d41e4bd50bdac6c29d5a1ea39af`:

- Nature data validation and candidates — success
- Repository hygiene — success
- Fagverk and place learning — success
- Place description governance — success
- Map place area LOD checks — success
- PlaceCard collections governance — success
- Knowledge checks — success
- Data checks — success

Data checks inkluderte grønne Places data, People data, Category and quiz governance og Knowledge V2. Deterministisk context-rebuild ble også validert i run `32700357680`, jobb `97350454877`.

## Sluttbeslutning

Christiania Torv dekker alle relevante Content Factory-faser uten kvalitetsportsvekkelse, duplikater eller innholdsfiller. Stedet er den første eksplisitte `place_card_profile` v2-piloten etter system-PR #5295. Completion kan merkes **DONE** når pilot-PR-en er grønn og mergecommit er verifisert på `main`.
