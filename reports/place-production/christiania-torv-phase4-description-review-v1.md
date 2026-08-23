# Christiania Torv – fase 4 description v4.2 review

Dato: 2026-08-23  
Place ID: `christiania_torv`  
Baseline: `main` etter fase-3-merge `ee7a98aeb7cc5766588ba2997105b3d0a3f7616e`  
Canonical place: `data/places/by/oslo/places/christiania_torv.json`  
Production packet: `data/places/production/christiania_torv.json`

## Tidligere-arbeid-gate

Eksisterende `desc`/`popupDesc` hadde mye stedsspesifikt stoff, men manglet dagens v4.2 claim-register, setningssporbarhet og teksthash. Den gamle synlige formuleringen om hanskekastet kunne dessuten leses som historisk faktapåstand. Fase 4 reviderer derfor teksten claim-first i stedet for å erklære gammel tekst ferdig på teknisk minimum.

## Resultat

- `desc`: **72 ord / 3 setninger**;
- `popupDesc`: **368 ord / 6 avsnitt / 23 setninger**;
- verified claims: **18/18**;
- sentence coverage: **3/3 + 23/23**;
- `desc` SHA-256: `b5b5d330481324f36c534f73ca116b2db6cfd6ea278af6529f637503b8d8f78b`;
- `popupDesc` SHA-256: `037f04c14b3669c654ebfb8fe9c93c4142d125985e1f9b4aa66dc7c562ec173e`;
- factual review: **PASS**;
- editorial review: **PASS**;
- normal quiz-readiness: **9 direkte spørsmål**, fordelt på hvem/når/hva/hvor/hvilket verk/hva skjedde/hva ble bygget eller endret.

Teksten følger torgets egne dokumenterte lag: byflyttingen i 1624, den tidlige plassformen, kirke/rådhus/vannpost/straff, Christianiamarkedet, forskyvningen mot Stortorvet, Johannes kirke, navnevedtaket 1958, 1964-omformingen, rehabiliteringen i 1990-årene og Wenche Gulbransens fontene fra 1997.

## Faktisitetsgrenser

Følgende er eksplisitt holdt ute eller kvalifisert:

- fortellingen om at Christian IV bokstavelig kastet en hanske på dette punktet publiseres ikke som dokumentert hendelse;
- Livorno publiseres ikke som sikkert direkte forbilde for torget;
- `year: 1648` brukes ikke som automatisk etableringsår;
- bygningene rundt torget overtas ikke som om de var selve Place-objektet;
- volatile leietakere, servering og nåtidsdrift er ikke brukt i evergreen-teksten.

## Bildegate – reparert uten kvalitetsreduksjon

De to legacy-stiene `bilder/places/christiania_torv.JPG` og `bilder/kort/places/christiania_torv.PNG` finnes ikke i repoet. De er erstattet med et faktisk bilde av Christiania Torv fra Wikimedia Commons:

- fotograf: **Leonhard Lenz**;
- motivdato: **17. august 2022**;
- lisens: **CC0 1.0**;
- inspectable filside lagres i `imageSourceUrl`;
- samme verifiserte bilde brukes til hoved- og kortflate.

Backlog-status endres konsekvent fra én ugyldig lokal sti til ett gyldig remote-bilde:

- `validRemote`: `31 → 32`;
- `invalidLocalPath`: `35 → 34`;
- `remaining`: `1369 → 1368`;
- By `valid`: `29 → 30`;
- By `invalid`: `35 → 34`.

Ingen bildeport er deaktivert eller gjort svakere.

## Anti-generic kvalitetsgate

- **name-swap:** PASS – innholdet kan ikke flyttes til et annet bytorg uten at rådhus/kirke/Vandkunsten/Christianiamarkedet/Johannes kirke/hansken/navnevedtaket faller sammen;
- **specific evidence anchor:** PASS – hvert synlige avsnitt har konkrete Christiania Torv-ankere;
- **cross-place duplicate:** PASS – teksten er ikke en variant av Youngstorget, Birkelunden, Ekebergparken eller Bankplassen-prosa;
- **source→claim→text:** PASS – alle faktiske setninger er dekket av production packet;
- **local experience:** PASS – leseren kan knytte bygrunnlegging, gategeometri, makt/straff, marked og fontenen til det fysiske torget;
- **fullness for description phase:** PASS – teksten er stoffstyrt og ikke forkortet for Content Factory-kostnad. Senere subsystemfaser er fortsatt åpne og skal ikke regnes som ferdige av denne fasen.

## Fase-4-konklusjon

**KLAR FOR REVIEW.** Description-flaten kan først klassifiseres ferdig når PR-headen består relevante place-description-, image-, data- og fagporter og er merget. Neste fase er strukturerte place-profiler og brukerrettet source summary.
