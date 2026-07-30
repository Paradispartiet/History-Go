# Musikk: institusjoner, patronat og offentlighet — subject pathway v1

Dato: 2026-07-30

## Resultat

`em_musikk_vit_institusjoner_patronat_offentlighet` er materialisert som Musikk subject-pathway sett 9 fra Rikskonsertene-evidensen merget i PR #4575.

Aktiv Musikk-pathway etter materialisering:

- 9 sett
- 45 spørsmål
- 9 released claims
- 9 verifiserte direct objects
- 39 av 48 canonicale temaer fortsatt blokkert

## Released evidens

Sett 9 bruker bare:

- claim: `claim_musikk_history_rikskonsertene_public_patronage_2007_2008`
- emne: `em_musikk_vit_institusjoner_patronat_offentlighet`
- domene: `historisk_musikkvitenskap_historiografi`
- metode: `institusjons_policyanalyse`
- direct object: `obj_rikskonsertene_stmeld21_2007_2008_institutional_financing`

Claimet følger en avgrenset ressurs → institusjon → gjennomføring → arbeid/formidling-kjede. Det frigis ikke påstander om lik faktisk tilgang, lik kvalitet, representativ programmering, frivillig etterspørsel eller at Rikskonsertene alene skapte langsiktig karrieresuksess.

## Femtrinnsforløp

1. `observe` — identifiserer det dokumenterte statlige ressursgrunnlaget og DKS-midlene.
2. `explain` — skiller budsjett/mandat fra faktisk implementering i separat resultatrapport.
3. `evaluate_evidence` — følger ressurser og honorarrammer til dokumentert skolekonsertproduksjon, musikeroppdrag og et avgrenset arbeidsmarkedsfunn; 2011 brukes bare som kontinuitetskontroll.
4. `diagnose_failure` — avviser slutningen at aktivitetsdata beviser lik tilgang/kvalitet eller at ordningen alene skapte varig karrieresuksess.
5. `decide_and_justify` — anvender den canonicale direct-object-gaten `external_link_and_metadata_only`.

De fire første spørsmålene peker til det eneste frigitte claimet. Det femte er `rights_and_reuse_metadata` og har med hensikt ingen `claim_id`.

## Rights

Det valgte St.meld.-objektet leveres som:

`external_link_and_metadata_only`

History Go rehoster ikke direct objectet eller innebygd tredjepartsinnhold. Offentlige tall og parafraserte funn kan bæres av source-evidensen med kildeidentitet og lokatorer.

## Deterministisk materialisering

Materialiseringskjøringen brukte:

1. `build-musikk-history-institutions-rikskonsertene-subject-pathway-v1.mjs --write`
2. generisk Musikk pathway-canonicalisering
3. generisk subject-pathway-registrering
4. canonical Knowledge-materialisering
5. Musikk fulltext/pathway/source-metadata-validatorene

Bootstrap-jobben tillot bare seks generated-outputfiler. `reports/knowledge-contract-audit.json` og `reports/knowledge-universe-readers.json` ble holdt utenfor produksjonsdiffen. Permanent `Fagverk Musikk` er etter materialisering tilbake på `permissions: contents: read`; bootstrap/write-jobben er fjernet.

## Validatorresultater fra materialiseringskjøringen

- Musikk source dossiers på bootstrapens ordinære regresjon: **6520 PASS / 0 FAIL**
- Musikk fulltekstevidens etter materialisering: **1519 PASS / 0 FAIL**
  - 9 emner
  - 25 fulltekster, hvorav 3 canonicale og 22 produksjonsutvidelser
  - 9 direkte objekter
  - 16 claim-klare funn
  - 31 slutningsgrenser
- Musikk subject pathway etter materialisering: **2671 PASS / 0 FAIL**
  - 9 sett / 45 spørsmål
  - 9 released claims
  - 9 direct objects
  - 39 temaer fortsatt blokkert
- Musikk pathway source metadata etter materialisering: **660 PASS / 0 FAIL**
- pathway canonicalisering: **9 sett / 45 spørsmål**
- subject-pathway-registrering: **0 avvik**

## Knowledge

Canonical Knowledge-materialisering etter sett 9:

- **2948** globale quizspørsmål
- **4101** Knowledge units
- **144** eksisterende unresolved emne-links
- **0** Knowledge-kontraktfeil
- **0** aktive legacy Knowledge-referanser

De eksisterende Knowledge-warningene er ikke nye kontraktfeil og blokkerer ikke denne produksjonen.

## Produksjonsgrense

Denne produksjonen materialiserer bare det allerede frigitte Rikskonsertene-claimet som ett femtrinnssett. Den åpner ikke periodisering, verkbegrep/kanon eller transnasjonal/kolonihistorisk sirkulasjon. Disse og alle øvrige ikke-frigitte Musikk-emner forblir blokkert til egne fulltekst-, direct-object-, inferens- og rights-porter er løst.
