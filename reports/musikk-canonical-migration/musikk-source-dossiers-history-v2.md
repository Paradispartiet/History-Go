# Musikkvitenskap: konsolidert historisk kildegrunnlag i tre-domene-pakken v4

Dato: 2026-07-28  
Kilderevisjon: `musikkvitenskap-kildegrunnlag-tre-domener-v4-2026-07-28`  
Historiebatch: `musikkvitenskap-kildegrunnlag-historie-v2-2026-07-28`

## Resultat

Historiedomenet er konsolidert uten å overskrive den parallelle etnomusikkbatchen. Alle ni tidligere historiske kilder er bevart, fire dublette verkidentiteter er deduplisert, og 17 nye unike publikasjoner er lagt til.

Aktiv samlet pakke:

- 3 kildedomener
- 9 modulære kilderegistre
- 18 temadossierer
- 56 unike forskningspublikasjoner
- 26 historiske forskningskilder
- 6 historiske v2-dossierer
- 6 etnomusikkdossierer med etiske styringsporter

## Historisk evidenskontrakt

Historiedossierene krever etter kildetypen:

- arkivinstitusjon → fonds/samling → serie → post/stykke → referansekode → objekt
- original → kopi/avskrift → utgave → digitalisering
- opptakshendelse → take/matrix → master → utgivelse → reutgivelse/remaster
- beslutning/ressurs → ansvarlig aktør → gjennomføring → observerbart utfall
- avsendende ledd → mellomledd → mottakende ledd → lokal omforming

Katalog-, bibliografi- og diskografidata kan identifisere og lokalisere et objekt, men kan ikke alene bære påstander om innhold, tendens, implementering, resepsjon, opprinnelse, appropriasjon eller historisk virkning.

## Parallelle domeneporter

Den kumulative validatoren beholder etnomusikkbatchens styringskrav. Restriktivt, hellig, sensitivt eller ikke godkjent materiale overstyrer spørsmålsproduksjon. Offentlig tilgang er ikke automatisk gjenbrukstillatelse.

## Verifikasjonsnivå

Fullføringsnivået er `publisher_verified_bibliographic_basis`. Pakken er ikke en systematisk litteraturgjennomgang. Record-level RILM-søk er ikke gjennomført fordi abonnementstilgang kreves. Detaljpåstander krever fulltekst og presis lokator.

## Validering

`tools/validate-musikk-source-dossiers-v1.mjs` er batch- og manifestdrevet og validerer alle tre domener samlet.

Lokal reproduksjon mot de tre faktiske batchene:

- 3 kildedomener
- 9 registre
- 18 dossierfiler
- 18 dossierer
- 56 kilder
- 51 dokumenterte RILM-klasser eller søkeavgrensninger
- alle kilder brukt
- globale ID-er unike
- historiske kildekjedekrav grønne
- etnomusikologiske styringsporter grønne
- ingen undervisningsnøkler
- **2166 PASS, 0 FAIL**

Autoritativ kontroll kjøres i GitHub Actions sammen med emnevalidatoren.

## Neste produksjonsfase

Neste domene er `framforing_praksis_samspill`. Direkte framføringsopptak, prøvemateriale, utøverintervjuer, romdata og sammenlignbare framføringsversjoner skal gjøres obligatoriske før spørsmål frigis.
