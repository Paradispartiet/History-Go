# Musikkvitenskap: konsolidert kildegrunnlag for historisk musikkvitenskap v2

Dato: 2026-07-28  
Kilderevisjon: `musikkvitenskap-kildegrunnlag-to-domener-v3-2026-07-28`  
Historiebatch: `musikkvitenskap-kildegrunnlag-historie-v2-2026-07-28`

## Formål

Denne produksjonsfasen konsoliderer det parallelle historiske kildearbeidet og styrker kildegrunnlaget under de seks aktive temaene i `historisk_musikkvitenskap_historiografi`.

Ingen allerede mergede kilder er fjernet faglig. De ni eksisterende historiske kildene er bevart, fire bibliografiske dubletter er deduplisert mot samme verk, og 17 nye unike forskningspublikasjoner er lagt til. Historiedomenet har dermed 26 unike forskningskilder; hele kildepakken har 47.

Arbeidet er ikke et undervisningsopplegg, en pensumliste eller en systematisk litteraturgjennomgang.

## Aktivt omfang

Kildepakken består nå av:

- 2 kildedomener
- 8 modulære kilderegistre
- 12 temadossierer
- 47 unike forskningspublikasjoner
- 26 historiske forskningskilder
- 6 historiske temadossierer

Historiedossierene dekker:

1. kildekritikk i musikkhistorien
2. periodisering og anakronisme
3. verkbegrep, forfatterskap og kanon
4. institusjoner, patronat og musikalsk offentlighet
5. resepsjon, kritikk og opptakshistorie
6. transnasjonal sirkulasjon og kolonihistorie

## Konsoliderte historiske registre

De 26 historiske kildene er fordelt på fire registre:

1. historisk metode, arkiv og kulturelt minne
2. verkbegrep, periodisering og kanon
3. institusjoner, resepsjon, kritikk og opptakshistorie
4. transnasjonale, koloniale og postkoloniale musikkhistorier

Hvert register dokumenterer bibliografisk identitet, DOI eller ISBN, offisiell utgiveradresse, verifikasjons- og fulltekststatus, faglig rekkevidde, tillatt bruk og forbudt overtolkning.

## Historisk kildekontrakt

Hvert historiedossier må i tillegg til den generelle kildekontrakten inneholde:

- `primary_source_infrastructure_ids`
- `archive_or_object_identity_requirements`
- `catalog_metadata_limit`
- `source_chain_requirements`

Katalog-, bibliografi- og diskografidata brukes til identifikasjon og lokalisering. De kan ikke alene dokumentere innhold, tendens, implementering, samlet resepsjon, opprinnelse, appropriasjon eller historisk virkning.

### Arkiv og manuskript

`arkivinstitusjon → fonds/samling → serie → post/stykke → referansekode → objekt`

Original, kopi, avskrift, utgave, digitalisering og redaksjonelt inngrep skal skilles.

### Opptak og diskografi

`opptakshendelse → take/matrix → master → utgivelse → reutgivelse/remaster → tilgjengelig lydobjekt`

Diskografisk metadata kan ikke erstatte lytting til det identifiserte lydobjektet.

### Institusjoner

`beslutning/ressurs → ansvarlige aktører → gjennomføring → program/arbeidspraksis → observerbart utfall`

Institusjonens mål eller selvbeskrivelse er ikke bevis på faktisk virkning.

### Transnasjonal og kolonial historie

`avsendende ledd → mellomledd → mottakende ledd → lokal omforming → senere representasjon`

Rute, datoer, aktører, språk, oversettelse, eierskap, rettigheter og institusjonell asymmetri skal dokumenteres. Sonisk likhet alene kan ikke bevise lån, opprinnelse eller appropriasjon.

## Søke- og verifikasjonsnivå

Fullføringsnivået er `publisher_verified_bibliographic_basis`.

Forlags- og plattformmetadata og tilgjengelige beskrivelser eller abstracts er kontrollert. Pakken hevder ikke at fulltekst er gjennomgått. Record-level søk i RILM er ikke gjennomført fordi abonnementstilgang kreves; dette står eksplisitt i alle aktive registre og dossierer.

Detaljpåstander kan først produseres når relevant fulltekst, presis lokator og et direkte historisk objekt er kontrollert.

## Dekningsgrenser

Batchen dokumenterer blant annet:

- engelskspråklig forskning og akademiske forlag dominerer
- europeisk kunstmusikk, formelle institusjoner og publiserte arkiver er overrepresentert
- lokale språk, urfolkskunnskap, fellesskapsarkiver og ikke-skriftlige spor krever særskilt supplement
- norsk og nordisk historiografi må bygges inn ved konkret sted- og quizproduksjon
- fulltekst- og siteringssøk må utføres før kapittel- eller detaljpåstander brukes

## Validering

`tools/validate-musikk-source-dossiers-v1.mjs` leser det aktive batchmanifestet og validerer begge kildedomener samlet.

Kontrollen verifiserer blant annet:

- globalt unike kilde- og dossier-ID-er
- at alle 47 kilder brukes
- at alle objekttyper finnes i aktiv v2-modul
- at alle kildeinfrastrukturer finnes i `scholarly_source_standard_v1.json`
- at fonds-, serie-, post-, eksemplar- og utgaveidentitet kreves
- at katalogmetadata avgrenses uttrykkelig
- at kildekjedekrav er obligatoriske
- at nyere forskning og metodekilder finnes
- at ingen undervisningsnøkler forekommer

Autoritativt PASS-resultat lagres i egen valideringsrapport etter GitHub Actions.

## Neste produksjonsfase

Neste domene er `framforing_praksis_samspill`. Der skal direkte framføringsopptak, øvings- og prøvemateriale, utøverintervjuer, romdata og sammenlignbare framføringsversjoner gjøres obligatoriske før spørsmål kan frigis.
