# Musikk – fulltekstevidens for melodi, motiv og frasering v1

Dato: 2026-07-30

## Formål

Denne batchen utvider Musikk fase 4 fra ett til to fulltekst- og object-verifiserte analyseemner.

Nytt emne:

`em_musikk_vit_melodi_motiv_frasering`

Canonical fagstruktur er fortsatt:

- 8 domener
- 48 temaer
- 18 metodeprotokoller
- 156 canonicale forskningspublikasjoner

Ingen nytt domene, tema, metode eller canonical bibliografipost opprettes.

## Canonical metodekobling korrigert

Auditen avdekket en eksisterende intern mismatch:

- melodi/motiv/frasering tillot `notert_kilde`
- emnet tillot `score_or_representation_claim`
- dossierets direct-object-gate krevde målesteds-/notasjonslokatorer og eksplisitt segmentering
- `notasjons_kildeanalyse` eksisterte allerede som canonical metode og var kompatibel med `notert_kilde`
- men melodi-emnet og dets question blueprint manglet denne metodekoblingen

Batchen legger derfor kun `notasjons_kildeanalyse` til `method_protocol_ids` for:

1. `em_musikk_vit_melodi_motiv_frasering`
2. `qb_musikk_vit_melodi_motiv_frasering`

Metodeinventaret forblir 18. Ingen andre emner eller blueprints endres.

## Forskningskilde 1 – motivanalyse

Production extension:

`prod_src_boss_hidden_repetition_beethoven_1999`

Jack F. Boss, 1999:

*“Schenkerian-Schoenbergian Analysis” and Hidden Repetition in the Opening Movement of Beethoven’s Piano Sonata Op. 10, No. 1*

Publisert i *Music Theory Online* 5(1).

Fulltekst:

`https://www.mtosmt.org/issues/mto.99.5.1/mto.99.5.1.boss.html`

Fullteksten ble kontrollert med presise tekst- og takt-lokatorer. Produksjonen bruker særlig:

- åpningen og modellavgrensningen rundt mm. 1–9
- mm. 119–121 og 127–129
- mm. 136–141
- argumentet i artikkelens avsnitt [13]–[14] om at vanlige tonale figurer ikke får motivstatus gjennom intervallik likhet alene

Boss beskriver alpha som gradvis mer overflatenært i utviklingsdelen. I mm. 119–121 og 127–129 ligger dobbeltnabomotivet i sopranens overflate, og i mm. 136–141 inneholder hver to-taktsenhet alpha.

Samtidig behandles dette som en modellavhengig Schenkerian-Schoenbergian analyse, ikke som en modelluavhengig scorefakta eller dokumentasjon av Beethovens bevisste intensjon.

## Forskningskilde 2 – scoreproveniens

Production extension:

`prod_src_hentschel_annotated_piano_corpus_2024`

Johannes Hentschel, Yannis Rammos, Fabian C. Moss, Markus Neuwirth og Martin Rohrmeier, 2024:

*An Annotated Corpus of Tonal Piano Music from the Long 19th Century*

*Empirical Musicology Review* 18(1), 84–95.

DOI:

`10.18061/emr.v18i1.8903`

Institusjonell fulltekst:

`https://phaidra.bruckneruni.at/o:3910`

Datareporten dokumenterer blant annet:

- 264 annoterte pianosatser
- komplett dekning av Beethovens pianosonater
- MuseScore 3-format
- kontroll av tone- og rytmeinnhold mot public-domain trykkutgaver
- annotasjon av blant annet frasegrenser og kadensetyper
- ekspertbasert annotator-/reviewworkflow via GitHub
- inspeksjonsbare score-, mål-, note- og harmonidata

Kilden brukes bare for direct-object-proveniens og datasettets review-/formatgrunnlag. Den brukes ikke som støtte for Boss sin motivanalyse.

## Direkte notekilde

Object ID:

`obj_beethoven_op10_1_dcml_v2_5_05_1`

Objekttype:

`notert_kilde`

Objekt:

Ludwig van Beethoven, Piano Sonata No. 5 i c-moll, Op. 10 nr. 1, første sats, DCML Beethoven Piano Sonatas v2.5, fil `05-1`.

Versjonert scoresti:

`MS3/05-1.mscx`

DCML v2.5 dokumenterer:

- 284 takter
- 310 annotasjonslabels
- annotation standard 2.3.0

Versjonsidentitet:

- Zenodo DOI: `10.5281/zenodo.15292707`
- Zenodo record: `https://zenodo.org/records/15292707`
- archive: `DCMLab/beethoven_piano_sonatas-v2.5.zip`
- MD5: `a842f4e47ac9859d8cf91ebee91b02d6`

Direkte objektlokatorer:

1. `MS3/05-1.mscx, mm. 1–9`
2. `MS3/05-1.mscx, mm. 119–129`
3. `MS3/05-1.mscx, mm. 136–141`

## Rettigheter

DCML v2.5 er merket:

`CC BY-NC-SA 4.0`

History Go har ikke i denne produksjonen avgjort om den ikke-kommersielle lisensen er kompatibel med alle nåværende eller framtidige bruksmåter i appen.

Derfor er bruksmodusen låst til:

`external_link_and_metadata_only`

History Go kopierer, renderer, redistribuerer eller endrer ikke DCML-scorefilen i denne produksjonen. Kun identitet, versjon, taktlokatorer og persistente eksterne lenker lagres.

## Claims

### Frigitt til spørsmål

`claim_musikk_melody_boss_alpha_salience_development`

Påstanden avgrenser Boss sin analyse av alpha-motivets økte saliens til de konkrete taktintervallene og bevarer modellavhengigheten.

### Redaksjonelt claim-klart, men ikke frigitt

`claim_musikk_melody_boss_motive_status_requires_process`

Denne registrerer Boss sitt metodologiske argument om at motivstatus her begrunnes gjennom organisert repetisjon, variasjon og saliensprosess, ikke bare intervallik likhet.

Den holdes utenfor question-release i denne batchen.

## Slutningsgrenser

Tre eksplisitte grenser følger produksjonen:

1. segmenteringen er modellavhengig
2. scoreanalyse er ikke bevis for komponistintensjon
3. DCML-objektet forblir external-link-only så lenge lisenskompatibilitet er uløst

## Validatorutvidelse

`tools/validate-musikk-fulltext-evidence-v1.mjs` var opprinnelig hardkodet til rytmeemnet.

Den er nå generalisert slik at hver topic-fil:

- slår opp sitt eget canonicale `emne_id`
- validerer egne claim types
- validerer egne method protocol IDs
- validerer egne research object types
- skiller canonicale kilder fra production extensions
- krever fulltekst-review for alle claim-kilder
- krever minst to direkte objektlokatorer
- krever resolved direct-object-gate før question release
- krever external-link-only når kommersiell lisenskompatibilitet er eksplisitt uløst

## Resultater

Source-dossier-validator:

`6520 PASS / 0 FAIL`

Fulltekstevidens:

`420 PASS / 0 FAIL`

Ny aggregert status:

- 2 fullteksttemaer
- 6 gjennomgåtte fulltekster
  - 3 canonicale
  - 3 production extensions
- 2 direkte objekter
- 7 claim-klare funn
- 7 slutningsgrenser
- 2 question-ready emner
- 2 question-ready claims

Eksisterende rytme-pathway:

`307 PASS / 0 FAIL`

## CI

På read-only produksjonshead før denne rapportfilen ble lagt til var følgende grønne:

- Fagverk Musikk
- Musikk scientific quality
- Data checks
- Fagverk subject inventory
- TypeScript guard

`Fagverk Musikk` passerte syntax/deterministiske audits, canonical scientific package og Fagverk-kontrakter.

Workflowen er tilbakeført til `contents: read`; ingen bootstrap- eller skrivejobb skal finnes i sluttdiffen.

## Neste gate

Det nye melodi-claimet kan nå materialiseres som subject-area-spørsmål med samme femtrinnsmodell som rytme, eller fulltekstevidensen kan utvides videre til neste analyseemne.

Ingen av de øvrige analyseemnene skal åpnes før deres egne fulltekst-, locator-, direct-object- og rights-gater er dokumentert.
