# Etne psykisk helse og rus – rundinger batch 1

## Omfang

To separate besøksstader er fylt med standardprofilen for kategoriar utan eigen eksplisitt profil:

- `psykisk_helse_rus_etne`
- `psykisk_helse_rus_skanevik`

Rundingane er:

- people
- nature
- badges
- works
- civication
- brands
- før_nå
- fortellinger
- leksikon

Det er ikkje lagt inn manuell `rounds`- eller `rundinger`-overstyring.

## Kildegrunnlag

- Etne kommune: Psykisk helse og rus
- Etne kommune: Individuell oppfølging
- Etne kommune: Arbeid og aktivitet
- Etne kommune: eldre artikkel om arbeid og aktivitet ved helsehusa
- Etne kommune: Informasjonsskriv BrukarPlan
- Etne kommune: Barn og unge som pårørande
- Etne kommune: Planar og strategiar
- eksisterande koordinatkontroll og psykologi-research i repoet

## Redaksjonelle beslutningar

- People-rundinga bruker eitt kollektivt fagmiljøanker for den kommunale tenesta, ikkje namngitte tilsette, brukarar eller pasienthistorier.
- Fagmiljøankeret har Etne som primæranker og eksplisitte relasjonar til begge besøksstadene.
- Holmavegen 24 og Skånevikvegen 17 er to separate fysiske places for den same kommunale tenesta.
- Direkte kontakt utan legetilvising blir skildra som dokumentert lågterskeltilgang, ikkje som medisinsk vurdering eller akuttberedskap.
- Rettleiing, støttesamtalar, kognitiv terapi, pårørandesamtalar, individuell plan og koordinator blir brukte som dokumentert tenesteinnhald utan fiktive pasientforløp.
- BrukarPlan blir skildra som kommunal kartlegging utan namn, adresse eller personnummer, med rett til reservasjon, innsyn, retting og sletting.
- Natur-rundinga viser tomat (`Solanum lycopersicum`) først fordi dette er den einaste eksplisitt dokumenterte dyrkingsarten i arbeid- og aktivitetstilbodet.
- Tomat blir ikkje gjort til ei full artsinventering av besøksstadene. Kvar stad får eksplisitt merknad om at komplett feltinventering manglar.
- Nærmiljø, drivhus, båt, fiskestenger, plantekassar, måling og mat blir skildra som tenesteomfattande aktivitetsressursar, ikkje universelle behandlingsråd.
- Ein eldre kommunal artikkel omtalar Skånevik legekontor som planlagt neste planteoppdrag. Dette blir halde som annonsert plan og ikkje presentert som fullført resultat.
- Kommunen sin plan for 2018–2022 blir berre brukt som dokumentasjon på eit eige kommunalt planfelt. Innhaldet i PDF-en blir ikkje dikta eller overtolka.
- `year: 2026`, koordinatane og radiusane blir behaldne uendra som dokumentasjonsår og kontrollerte kartanker, ikkje byggeår.

## Stadsskilje

### Etne

- Holmavegen 24
- direkte kontakt og fagleg vurdering
- individuell oppfølging og koordinering
- BrukarPlan og personvern
- dokumentert aktivitet ved Etne legekontor og Helsehuset

### Skånevik

- Skånevikvegen 17
- eigen lokal besøksadresse
- same kommunale fagmiljø og tenesteinnhald
- desentralisert tilgang utan å påstå individuell effekt av reiseavstand
- planlagt planteoppdrag blir ikkje gjort om til dokumentert resultat

## Runtime

- Ny People-fil blir registrert i `data/people/manifest.json`.
- To eksplisitte relasjonar blir lagde i `data/relations.json`.
- Ny psykologi-storyfil blir registrert i `data/stories/stories_manifest.json`.
- Ny psykologi-leksikonfil blir registrert i `data/leksikon/manifest.json`.
- Stedsindeksen treng ingen innhaldsendring fordi alle lette identitetsfelt er uendra.

## Kontroll

`tests/etne-psychology-service-batch1-round-content.test.js` kontrollerer:

- standardprofilen med alle ni rundingar
- ingen manuell profiloverstyring
- eitt kollektivt og personvernavgrensa People-anker
- to separate relasjonar og fysiske besøksstader
- People-, story- og leksikonmanifest
- minst åtte serviceverk per stad
- tre fysiske og stadsspesifikke Civication-objekt per stad
- kanoniske psykologi-underbadges
- tomat som einaste eksplisitt dokumenterte art
- eksplisitt avgrensing mot full feltinventering
- kanoniske nearby-ID-ar
- lågterskeltilgang, oppfølgingsformer, koordinering og BrukarPlan-rettar
- at planlagt plantearbeid ikkje blir presentert som fullført
- ingen direkte helseidentifikatorar eller konstruerte pasienthistorier
- uendra koordinatar, radiusar og dokumentasjonsår
