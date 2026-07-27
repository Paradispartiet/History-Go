# Musikkvitenskap: kildegrunnlag for historisk musikkvitenskap v1

Dato: 2026-07-27  
Kilderevisjon: `musikkvitenskap-kildegrunnlag-historie-v1-2026-07-27`

## Formål

Denne produksjonsfasen legger et eksplisitt og kontrollerbart forsknings- og kildegrunnlag under de seks aktive temaene i domenet `historisk_musikkvitenskap_historiografi`.

Arbeidet er ikke et undervisningsopplegg, en pensumliste eller en systematisk litteraturgjennomgang. Det etablerer et publisher-verifisert bibliografisk grunnlag, konkrete primærkilde- og provenienskrav og sperrer mot at historiske spørsmål produseres fra katalogmetadata, periodemerker eller teoretiske etiketter alene.

## Omfang

Følgende seks temaer har fått canonicale kildedossierer:

1. Kildekritikk i musikkhistorien
2. Periodisering og anakronisme
3. Verkbegrep, forfatterskap og kanon
4. Institusjoner, patronat og musikalsk offentlighet
5. Resepsjon, kritikk og opptakshistorie
6. Transnasjonal sirkulasjon og kolonihistorie

Fire nye modulære kilderegistre inneholder til sammen 21 verifiserte forskningspublikasjoner. Samlet kildepakke består etter denne batchen av:

- 2 kildedomener
- 8 modulære kilderegistre
- 12 temadossierer
- 42 verifiserte forskningspublikasjoner

## Historisk kildekontrakt

Historiedossierene følger den generelle kildekontrakten og har i tillegg fire obligatoriske felt:

- `primary_source_infrastructure_ids`
- `archive_or_object_identity_requirements`
- `catalog_metadata_limit`
- `source_chain_requirements`

Hvert dossier krever minst:

- to canonicale forskningskilder
- én nyere forskningskilde fra 2018 eller senere
- én metodekilde
- et identifisert direkte historisk objekt før spørsmålsfrigivelse
- seks objekt- eller arkivmetadata
- to presise lokatorer
- tre dokumenterte faglige spenninger
- tre avgrensede tillatte påstander
- tre eksplisitte overtolkningsforbud
- dokumentert søkelogg, skjevheter og kjente hull

## Katalogmetadata og objektevidens

Kataloger, bibliografier og diskografier brukes til identifikasjon og lokalisering. De kan ikke alene dokumentere:

- innholdet eller tendensen i en arkivpost
- komponist- eller utøverintensjon
- faktisk institusjonell gjennomføring
- samlet resepsjon
- opprinnelse, bevegelsesrute eller appropriasjon
- historisk virkning eller representativitet

Spørsmål kan derfor først frigis når den konkrete posten, utgaven, kritikkteksten, innspillingen, gjenstanden eller institusjonskilden er identifisert med relevant lokator.

## Kildekjeder

Kildekontrakten håndhever ulike kjeder etter objekttype:

### Arkiv og manuskript

`arkivinstitusjon → fonds/samling → serie → arkivstykke/post → referansekode → objekt`

Original, kopi, avskrift, utgave, digitalisering og redaksjonelt inngrep skal skilles.

### Opptak og diskografi

`opptakshendelse → take/matrix → master → utgivelse → reutgivelse/remaster → tilgjengelig lydobjekt`

Katalogdata kan ikke erstatte lytting til det identifiserte lydobjektet.

### Institusjoner

`beslutning/ressurs → ansvarlige aktører → gjennomføring → program/arbeidspraksis → observerbart utfall`

Institusjonens mål eller selvbeskrivelse er ikke bevis på faktisk virkning.

### Transnasjonal og kolonial historie

`avsendende ledd → mellomledd → mottakende ledd → lokal omforming → senere representasjon`

Rute, datoer, aktører, språk, oversettelse, eierskap, rettigheter og institusjonell asymmetri skal dokumenteres. Sonisk likhet alene kan ikke bevise lån, opprinnelse eller appropriasjon.

## Forskningsgrunnlag

De nye registrene dekker fire faglige klynger:

1. historisk metode, arkiv og kulturelt minne
2. verkbegrep, periodisering og kanon
3. institusjoner, resepsjon, kritikk og opptakshistorie
4. transnasjonale, koloniale og postkoloniale musikkhistorier

Kildegrunnlaget omfatter 21 publikasjoner fra akademiske forlag. For hver kilde registreres bibliografisk identitet, DOI eller ISBN, offisiell utgiveradresse, fulltekststatus, faglig rekkevidde, tillatt bruk og eksplisitt forbudt overtolkning.

## Søke- og verifikasjonsnivå

Fullføringsnivået er `publisher_verified_bibliographic_basis`.

Forlagsmetadata og tilgjengelige beskrivelser eller abstracts er kontrollert. Pakken hevder ikke at fulltekst er gjennomgått, og detaljpåstander kan ikke produseres uten fulltekst, presis side- eller kapittellokator og et identifisert primærkildeobjekt.

RILMs offentlige klassifikasjon brukes til faglig søkeavgrensning. Record-level søk i RILM er ikke gjennomført fordi abonnementstilgang kreves. Dette er eksplisitt registrert i hvert dossier og register.

## Dekningsgrenser

Batchen dokumenterer blant annet disse skjevhetene:

- engelskspråklig forskning og akademiske forlag dominerer
- europeisk kunstmusikk, formelle institusjoner og publiserte arkiver er overrepresentert
- lokale språk, urfolkskunnskap, fellesskapsarkiver og ikke-skriftlige spor krever særskilt supplement
- norsk og nordisk historiografi må bygges inn ved konkret sted- og quizproduksjon
- fulltekst- og siteringssøk må utføres før kapittel- eller detaljpåstander brukes

## Validering

Den permanente validatoren `tools/validate-musikk-source-dossiers-v1.mjs` er gjort kumulativ. Den leser batchmanifestet i `index.json` og validerer begge kildedomener samlet.

Nye historiekontroller omfatter:

- alle seks aktive historietemaer har dossier
- alle 21 nye kilder brukes
- alle objekttyper finnes i den aktive v2-modulen
- alle infrastrukturer finnes i `scholarly_source_standard_v1.json`
- fonds-, serie-, post-, eksemplar- og utgaveidentitet kreves
- katalogmetadata avgrenses uttrykkelig
- kildekjedekrav er obligatoriske
- nyere forskning og metodekilder er til stede
- ingen undervisningsnøkler
- globale kilde- og dossier-ID-er er unike

Lokal historiebatch-kontroll: **233 PASS, 0 FAIL**.

Den autoritative kumulative kontrollen kjøres i GitHub Actions sammen med den eksisterende validatoren for alle 48 temaer.

## Neste produksjonsfase

Neste batch bør bygge tilsvarende dossierer for `framforing_praksis_samspill`. Der må direkte framføringsopptak, øvings- og prøvemateriale, utøverintervjuer, romdata og sammenlignbare framføringsversjoner gjøres obligatoriske før spørsmål kan frigis.
