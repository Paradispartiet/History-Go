# Musikk – subject pathway for melodi, motiv og frasering v1

Dato: 2026-07-30

## Formål

Denne batchen materialiserer det andre evidensstyrte Musikk-fagområdesettet.

Nytt sett:

- emne: `em_musikk_vit_melodi_motiv_frasering`
- target: `subject_musikk_melodi_motiv_frasering`
- released claim: `claim_musikk_melody_boss_alpha_salience_development`
- direct object: `obj_beethoven_op10_1_dcml_v2_5_05_1`
- metode: `notasjons_kildeanalyse`

Rytme/meter/groove/timing forblir sett 1. Melodi/motiv/frasering er sett 2.

## Aktiv pathway

Pakken ligger i:

`data/quiz/musikk/musikk_subject_pathways_v1.json`

Profil:

`subject_pathway_pilot_2x5`

Aktiv status:

- 2 sett
- 10 spørsmål
- 2 released emner
- 2 question-ready claims
- 2 direct objects
- 46 canonicale temaer fortsatt blokkert

Melodi-settet følger de fem canonicale trinnene:

1. `observe` – lokalisere alpha i Boss sin analyse ved konkrete takter.
2. `explain` – forklare økt overflatesaliens i mm. 136–141 innen Boss sin modell.
3. `evaluate_evidence` – skille Boss sin analyse, DCML-scoreobjektet og Hentschel mfl. sin proveniensdokumentasjon.
4. `diagnose_failure` – blokkere komponistintensjon og modelluavhengig segmentering.
5. `decide_and_justify` – bruke DCML-objektet som `external_link_and_metadata_only` så lenge kommersiell lisenskompatibilitet ikke er avklart.

De fire første spørsmålene peker til det ene frigitte forskningsclaimet. Rights/reuse-trinnet har med vilje ikke `claim_id`.

## Evidenskjede

Forskningsclaimet bygger på:

- Jack F. Boss 1999 som fulltekstverifisert analysegrunnlag
- `obj_beethoven_op10_1_dcml_v2_5_05_1` som versjonert direkte notekilde
- Hentschel mfl. 2024 som proveniens- og reviewgrunnlag for DCML-korpuset

Direkte scorelokatorer:

- `MS3/05-1.mscx, mm. 1–9`
- `MS3/05-1.mscx, mm. 119–129`
- `MS3/05-1.mscx, mm. 136–141`

DCML v2.5 er CC BY-NC-SA 4.0. Kommersiell kompatibilitet med History Go er ikke løst i denne produksjonen. Derfor forblir bruksmodusen:

`external_link_and_metadata_only`

Ingen DCML-score kopieres, rendres, redistribueres eller endres av History Go i denne batchen.

## Canonical avgrensning

Uendret:

- 8 domener
- 48 temaer
- 18 metodeprotokoller
- 156 canonicale forskningspublikasjoner

Ingen nye Musikk-domener, canonicale emner, metoder eller scholarly-source-records opprettes.

## Deterministisk generering

Materialiseringen bruker:

- `tools/build-musikk-melody-subject-pathway-v1.mjs`
- `tools/build-musikk-subject-pathway-v1.mjs`
- `tools/build-musikk-subject-pathway-registration-v1.mjs`
- repositoryets canonical Knowledge-pipeline

Den generelle pathway-canonicalizeren er utvidet fra 1×5 til N×5 og bruker nå samme `splitClaims`-regel som canonical Knowledge for å beregne én eller flere `knowledge_unit_ids` fra en flersatset Knowledge-summary.

Registreringsbuilderen avleder released-emner, sett-/spørsmålsantall, claim-/object-antall og blokkert topic-count fra den faktiske pakken i stedet for å hardkode 1×5-status.

## Knowledge

Canonical Knowledge-sync etter 2×5-materialisering rapporterte:

- 2913 quizspørsmål behandlet globalt
- 4062 canonicale Knowledge units
- 144 eksisterende unresolved emne-links i den globale basen
- 0 Knowledge-kontraktfeil
- 0 aktive legacy Knowledge-referanser

De nye melodi-spørsmålene er registrert med canonicale:

- Knowledge-unit-ID-er
- concept-ID-er
- term-ID-er
- source metadata

Q5 består av to selvstendige Knowledge-påstander og får derfor to canonicale `knowledge_unit_ids`; dette følger samme `splitClaims`-regel som Knowledge-pipelinen.

## Musikk-validatorer

Etablert source-dossier-validator:

`6520 PASS / 0 FAIL`

Fulltekstevidens etter melodi-batchen:

`420 PASS / 0 FAIL`

Aggregert fulltekststatus:

- 2 evidenstemaer
- 6 gjennomgåtte fulltekster
- 2 direct objects
- 7 claim-klare funn
- 7 slutningsgrenser
- 2 question-ready emner
- 2 question-ready claims

Musikk subject pathway etter 2×5-materialisering:

`592 PASS / 0 FAIL`

Source-metadata-validator:

`122 PASS / 0 FAIL`

Registreringsbuilder:

`0 avvik`

Pathway-resultat:

- 2 sett
- 10 spørsmål
- 2 released claims
- 2 direct objects
- 46 temaer fortsatt blokkert

## CI-governance

Alle midlertidige bootstrap-/write-jobber er fjernet etter genereringen. Den endelige `Fagverk Musikk`-workflowen har:

`permissions: contents: read`

Permanent sluttgate omfatter:

- semantic pathway canonicalization `--check`
- registration `--check`
- Fagverk-inventory/general/Musikk-audits
- Musikk fagdybde
- source dossiers
- fulltekstevidens
- 2×5 subject-pathway-validator
- canonical source-metadata-validator
- Fagverk-kontrakttester

Global Knowledge, Data checks, TypeScript og øvrige relevante repository-guards skal være grønne på den låste slutt-headen før ready/merge.

## Neste gate

De øvrige 46 temaene forblir blokkert. Neste Musikk-produksjon kan enten:

- fulltekst- og object-verifisere et tredje analyseemne, eller
- starte første redigerte analysekapittel når evidensdekningen er bred nok til et faglig forsvarlig kapittel.
