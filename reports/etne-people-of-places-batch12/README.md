# Etne People of Places batch 12 — direkte canonical krysslenkjer

## Resultat

Batchen utvidar tre eksisterande canonical personar med to nye, eksplisitt dokumenterte stadskoplingar. Ingen nye person-ID-ar eller place-recordar blir oppretta.

| peopleId | person | behalde primæranker | ny stadskopling | dokumentert fysisk kopling |
|---|---|---|---|---|
| `per_tommy_fjeldheim` | Per Tommy Fjeldheim | `etneelva_forskningsplattform` | `etneelva` | HI omtalar han som driftsleiar ved fjord- og elvelaboratoriet i Etneelva og dokumenterer arbeidet hans med fisk som passerer fella i sjølve elva. |
| `oystein_skaala` | Øystein Skaala | `etneelva_forskningsplattform` | `etneelva` | HI dokumenterer Skaala sitt arbeid med den heildekkande fella, fototunnelen og fisk som vandrar opp i Etneelva. |
| `paul_hovda` | Paul Hovda | `norsk_motormuseum_skanevik` | `sunnhordland_mek_verkstad_leknestangen` | Patentstyret registrerer Paul Hovda som oppfinnar og SMV som innehavar på adressa Leknestangen, medan lokal næringshistorie dokumenterer at han overtok eigarskap og leiing i 1980. |

## Fersk main-audit før skriving

- `main`: `3fd6d69ac` (`Verify fifth Etne coordinate batch (#2318)`)
- Aktive Etne-stader: `83`
- Stader med minst éin aktiv person før batch 12: `53`
- Stader utan person før batch 12: `30`
- Dei tre person-ID-ane fanst nøyaktig éin gong kvar i canonical people-data.
- Batchen legg til `0` nye person-ID-ar, `0` nye people-filer og `0` nye place-recordar.

Sidan batch 11 vart laga, har `main` fått fem nye aktive Etne-stader. Baseline er derfor `83`, ikkje dei `78` stadene som låg til grunn for batch 11.

Etter batchen får `etneelva` og `sunnhordland_mek_verkstad_leknestangen` sine første aktive personlenkjer. Dekninga blir `55/83`, og restgjelda blir `28` Etne-stader utan person.

## Kjeldegrunnlag

Havforskingsinstituttet omtalar Per Tommy Fjeldheim som driftsleiar for fjord- og elvelaboratoriet i Etneelva. Dei same artiklane dokumenterer at den 40 meter breie fella dekkjer tverrsnittet av elva, at fisk blir registrert der, og at Fjeldheim arbeider med dei konkrete fiskedataa frå elva.

For Øystein Skaala dokumenterer HI både fagarbeid med den heildekkande fella og arbeidet med fototunnelen. HI publiserer også foto teke av Skaala av fisk på veg opp gjennom fella i Etneelva. Koplinga er derfor feltarbeid i den canonical naturstaden, ikkje berre rapportforfattarskap.

Patentstyret sitt patenttidende registrerer Sunnhordland Mekaniske Verksted AS som innehavar på Leknestangen, 5593 Skånevik, og Paul Hovda som oppfinnar av verkstadens system for handtering av brukte ovnskassar. Den lokale næringslivsprofilen dokumenterer i tillegg at Paul og Gudvin Hovda overtok eigarskap og leiing i 1980.

Kjelder:

- https://www.hi.no/hi/nyheter/2024/august/etneelva-den-storste-og-eldste-laksen-er-vekke-i-ar
- https://www.hi.no/hi/nyheter/2024/juli/etneelva-lakseinnsiget-minner-om-krisearet-2014-sa-langt
- https://www.hi.no/hi/nyheter/2024/april/direkte-fra-etneelva
- https://www.hi.no/hi/nyheter/2020/april/ferre-romlingar-i-laksefella-i-etneelva
- https://search.patentstyret.no/tidende/patent/2005/patenttidende-nr04-2005.pdf
- https://www.etnevindafjord.no/naeringsnytt/mekanisk-sjef-med-sto-kurs

## Streng utvalsport

- Primærankera til alle tre personane blir behaldne; batchen legg berre til dokumenterte sekundærstader.
- `etneelva` blir ikkje brukt som eit generelt lakseforskingsanker. Berre personane som HI dokumenterer ved den heildekkande fella i sjølve elva, blir krysslenkte.
- Alison Harvey og andre rapportforfattarar blir ikkje lagde til berre på grunn av fagleg ansvar eller sitat om Etne-laksen.
- Paul Hovda blir krysslenkt til Leknestangen fordi Patentstyret kombinerer namn, oppfinnarrolle, verkstad og eksakt anleggsadresse i same offentlege dokument.
- Gudvin Hovda blir ikkje krysslenkt i denne batchen. Kjeldegrunnlaget dokumenterer leiing i verksemda, men ikkje like presist arbeid ved det canonical Leknestangen-anlegget.
- Grunnleggjar Anders Hovda blir ikkje lagd til. SMV vart opphavleg etablert som Seimsfoss Mekaniske Verkstad, og kjeldene dokumenterer ikkje eit tilstrekkeleg presist fysisk samband mellom han og dagens Leknestangen-anlegg.
- Lars Hovda og andre noverande leiarar, tilsette og kontaktpersonar blir ikkje brukte som standard institusjonsankre.

## Integrasjonskontrakt

- `per_tommy_fjeldheim` og `oystein_skaala` skal behalde `etneelva_forskningsplattform` som primæranker og få `etneelva` som andre canonical place-lenkje.
- `paul_hovda` skal behalde `norsk_motormuseum_skanevik` som primæranker og få `sunnhordland_mek_verkstad_leknestangen` som andre canonical place-lenkje.
- Alle tre person-ID-ar skal framleis finnast nøyaktig éin gong globalt.
- `tests/etne-people-of-places-batch12.test.js` skal køyre frå `scripts/check-people.sh`.
- Batch 11-testen skal framleis kontrollere museumsankeret, men tillate den nye dokumenterte sekundærlenkja for Paul Hovda.
- Batchen skal ikkje endre people-manifest, place-data, UI, bilete eller quizdata.

## Lokal validering

- `node tests/etne-people-of-places-batch12.test.js`: **PASS** — tre canonical personar, to nydekte fysiske stader og null nye people-ID-ar.
- `bash scripts/check-people.sh`: **PASS** — 1 112 people-ID-ar, 1 112 unike, 0 ugyldige place-referansar og grøne Etne batch 9/10/11/12-testar.
- `npm run typecheck`: **PASS**.
- `npm run tools:check`: place-, koordinat-, emne-, i18n-, leksikon- og aliasportane passerer. Den samla kommandoen stoppar deretter i den eksisterande story-integritetsporten på fem referansar frå `main`: `utoya`, `norges_hjemmefrontmuseum` og `operaen`.
- `git diff --name-only origin/main -- data/places data/stories data/people/manifest.json`: ingen output. Batch 12 endrar ikkje place-data, story-data eller people-manifestet.

Den fullstendige terminalutskrifta er lagra i denne rapportmappa. PR-en skal vente på GitHub CI før merge.

Verifisert: `2026-07-18`.
