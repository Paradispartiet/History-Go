# Etne People of Places batch 18 — dokumentert leiararbeid ved Skakke

## Fersk dekningsaudit

Batchen starta med ein read-only audit av fersk `main` etter batch 17:

- aktive Etne-stader: 81
- dekte Etne-stader: 58
- udekte Etne-stader: 23
- people-manifestfiler: 546
- people-oppføringar: 1 119

Den fullstendige restlista er lagra i `coverage-audit.json`.

## Vald stad

`skakke_kultursenter_etne` var udekt. Staden er eit konkret kulturhus på Strondavegen 30, ikkje eit generelt Etne-kulturanker.

## Kandidatar

### Gøril Eidhammer

Grannar dokumenterer at Gøril Eidhammer vart tilsett som dagleg leiar i Skakke i 2019 og vende tilbake etter også å ha hatt leiarrolla tidlegare, fram til mai 2018. Skakke si eiga kontaktside fører henne framleis som dagleg leiar ved Strondavegen 30.

Dette gir ei langvarig og eksplisitt fysisk arbeidskopling til sjølve kulturhuset. `year: 2019` viser den dokumenterte returen til stillinga, ikkje etableringsåret for Skakke.

Kjelder:
- https://www.grannar.no/nyhende/vender-tilbake-til-skakke/287872
- https://skakke.no/kontakt-oss/

### Kurt Helgesen

Grannar dokumenterer at Kurt Helgesen skulle tiltre som dagleg leiar for Skakke 1. juli 2018, med ansvar for den daglege drifta av kulturhuset, og overta etter Gøril Eidhammer.

Dette er ei eksplisitt driftsrolle ved den konkrete institusjonen. Kortet påstår ikkje at Helgesen grunnla Skakke eller hadde eineansvar for alle aktivitetane i huset.

Kjelde:
- https://www.grannar.no/nyhende/blir-ny-skakke-leiar/233498

## Duplikatport

Før skriving vart fersk repo-state søkt etter:

- `goril_eidhammer`
- `Gøril Eidhammer`
- `kurt_helgesen`
- `Kurt Helgesen`

Det vart ikkje funne eksisterande canonical people-identitetar for nokon av dei.

Den tidlegare coverage-auditen viste dessutan 0 people-lenkjer til `skakke_kultursenter_etne` før batch 18.

## Avgrensing

Batchen bruker dokumentert leiararbeid, ikkje tilfeldige arrangementsgjester, kunstnarar, elevar eller generelle organisasjonskontaktar. Gøril Eidhammer og Kurt Helgesen er med fordi kjeldene eksplisitt dokumenterer dagleg drift av sjølve kulturhuset.

## Forventa effekt

Batchen legg til to nye canonical people-ID-ar og dekkjer eitt tidlegare udekt Etne-place. Dersom ingen parallelle Etne-place-endringar kjem inn før merge, går dekninga frå 58/81 til 59/81 og restgjelda frå 23 til 22.
