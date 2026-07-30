# Musikkvitenskap: direct-object pilot — rytme, meter, groove og timing

Dato: 2026-07-30  
Revisjon: `musikk-rhythm-direct-object-v1-2026-07-30`  
Emne: `em_musikk_vit_rytme_meter_groove_timing`

## Resultat

Direct-object-porten for det første fulltekstpiloten er løst for **ett** claim uten å endre de åtte canonicale domenene, 48 temaene eller #4526s canonicale bibliografiske basis på 156 forskningspublikasjoner.

Etter denne batchen har piloten:

- 1 canonicalt emne i fulltekstproduksjon
- 4 fulltekster faktisk gjennomgått
  - 3 fra canonicale kilderegistre
  - 1 eksplisitt produksjonsutvidelse
- 1 direkte forskningsobjekt
- 5 redaksjonelt claim-klare funn
- 4 eksplisitte slutningsgrenser
- 1 question-ready claim

## Hvorfor Sioros 2014 brukes som produksjonsutvidelse

Sioros, Miron, Davies, Gouyon & Madison (2014), *Syncopation creates the sensation of groove in synthesized music examples*, var ikke blant de 156 publisher-verifiserte bibliografipostene i #4526. Artikkelen er likevel spesielt egnet i denne konkrete produksjonen fordi:

1. fullteksten er åpent tilgjengelig hos Frontiers;
2. eksperimentdesign, stimuli, transformasjoner og resultatgrenser kan lokaliseres presist i fullteksten;
3. artikkelen oppgir at MIDI-filene for melodiene og variantene finnes som supplement;
4. et stabilt Zenodo-arkiv inneholder de musikalske stimulusfilene og anonymiserte ratings for begge eksperimentene.

Kilden registreres derfor som `production_extension`, ikke som en ny canonical scholarly-source-record. Dette gjør produksjonslaget utvidbart uten å omskrive #4526s canonicale bibliografiske baseline hver gang en konkret produksjon trenger en ekstra, fulltekstverifisert kilde.

## Fulltekstlokatorer

Produksjonskilde:

`prod_src_sioros_syncopation_synthesized_2014`

Bibliografisk identitet:

- George Sioros, Marius Miron, Matthew E. P. Davies, Fabien Gouyon & Guy Madison
- 2014
- *Syncopation creates the sensation of groove in synthesized music examples*
- *Frontiers in Psychology* 5:1036
- DOI `10.3389/fpsyg.2014.01036`

Kontrollerte lokatorer:

- s. 2–4: Experiment 1 — stimuli og implementasjon; enkle 4/4-pianomelodier ved 120 BPM, algoritmiske transformasjoner, MIDI-varianter og 16-bit wave-renderinger
- s. 5–6: Experiment 2 — original, tre synkopetransformasjoner og to tetthetskontroller; MIDI-varianter identifiseres som supplement
- s. 7–9: Discussion/Conclusion — moderate, strukturelt plasserte synkoper gir høyere groove-vurderinger enn maksimal jevnt fordelt synkopering; skalar synkopemengde er utilstrekkelig som full forklaring; notelengde-/metrisk rikdom forblir en mulig, ikke avgjort forklaring

## Direkte forskningsobjekt

Object ID:

`obj_sioros_2014_zenodo_1221315`

Type:

`datasett_og_kode`

Persistent record:

`https://zenodo.org/records/1221315`

Arkivfil:

- `Sioros_et_al.zip`
- 181.9 MB
- MD5 `df685fb58b982b7729dc0fca2576247f`

Dataset-locatorer:

1. `musical_stimuli/expA/` — Experiment 1-stimuli
2. `ratings/GrooveSynthExptA.XLS` — anonymiserte ratings, Experiment 1
3. `musical_stimuli/expB/` — Experiment 2-stimuli
4. `ratings/GrooveSynthExptB.XLS` — anonymiserte ratings, Experiment 2

Dermed er kravet om minst to direkte objektlokatorer oppfylt uten å late som en artikkelside er en stimuluslokator.

## Rettigheter og faktisk History Go-bruk

Zenodo-posten sier at stimuli og ratings tilbys gratis for ikke-kommersiell bruk, og at de ikke kan redistribueres eller endres. History Go-produksjonen følger derfor den strengeste dokumenterte regelen:

`external_link_and_metadata_only`

Det betyr:

- ingen stimulusfil kopieres inn i repoet eller appen;
- ingen ratingsfil kopieres inn i repoet eller appen;
- filene endres ikke;
- History Go kan lagre objektmetadata, locatorer og ekstern persistent lenke;
- senere kommersiell eller annen distribuerende bruk krever ny rettighetsvurdering.

## Question-ready claim

`claim_musikk_rhythm_sioros2014_moderate_syncopation_and_structure`

Avgrenset påstand:

I de to kontrollerte eksperimentene med enkle syntetiserte pianomelodier ga moderate, strukturelt plasserte synkoper høyere groove-vurderinger enn usynkoperte varianter og maksimal, jevnt fordelt synkopering, mens samlet synkopemengde alene ikke forklarte forskjellene.

Claimet er question-ready fordi kjeden nå kan følges:

`fulltekst → presise artikkellokatorer → konkret claim → persistent Zenodo-objekt → fire dataset-locatorer → eksplisitt rettighetsmodus`

## Hva som fortsatt ikke er frigitt

De fire tidligere claimene fra Câmara 2020 og Sioros 2022 er fortsatt bare `claim_ready_editorial`. De blir ikke automatisk question-ready av at ett annet forskningsobjekt er løst.

Første analysis-domene er heller ikke kapittelklart: fem av seks canonicale analyseemner mangler fortsatt tilsvarende fulltekstproduksjon.

## Neste gate

To legitime neste steg:

1. bygge første konkrete rytme/groove-spørsmål fra det ene released claimet og Zenodo-objektet, uten å redistribuere materialet; eller
2. fortsette fulltekstproduksjonen gjennom de fem øvrige temaene i `musikalsk_analyse_lyd_struktur` før første fullverdige Musikk-kapittel.
