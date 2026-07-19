# Hausmannsbrua – PlaceCard rounds batch 1

Dato: 2026-07-19

## Avgrensning

Batchen fortsetter den verifiserte delen av Akerselva-ruten etter de to coordinate-blocked elvestrekningene. Hausmannsbruas canonical koordinater beholdes og testes mot coordinate-evidence, slik at innholdstesten ikke hardkoder en koordinatverdi som senere kan bli legitimt oppdatert i koordinat-workstreamen.

## Canonical år

Legacy-verdien `1880` erstattes med `1892`, dokumentert ferdigstillelsesår. Byggeperioden 1890–92 beholdes i kronologien.

## Person

Fredrik Ferdinand Hausmann opprettes som dokumentert navneopphav via Hausmanns gate. Han beskrives eksplisitt som namesake, ikke brobygger. Ingen canonical person opprettes for «P. Schaaning» fordi brokildene ikke gir fullt navn.

## Rundinger

Personer, Natur, Merker, Verk, Civication, Aktører, Før/nå, Fortellinger og Leksikon.

## Kildeholdbacks

- full identitet bak ingeniør P. Schaaning
- dampveivals-anekdoten
- påstanden om opprinnelig jernbanebru

Disse punktene er bevisst holdt utenfor canonical hardfakta fremfor å fylle hull med sannsynlige, men ikke direkte dokumenterte identifikasjoner eller påstander.

## Split-sikkerhet

Bare Hausmannsbrua-filen, dens route-indexrad og manifest-hash endres blant route-place-filene.

## Sluttstatus

Den materialiserte sluttstaten har bestått:

- målrettet Hausmannsbrua-rundingtest
- canonical PlaceCard round runtime audit
- place-index build/check
- split-manifest sync
- People-of-Places audit
- JSON-parse
- `git diff --check`

People-of-Places rapporterer `0` ugyldige stedsreferanser og `0` duplikate person-ID-er. Koordinatparitet kontrolleres mot canonical coordinate-evidence for Hausmannsbrua. Midlertidig finalizer og workflow er fjernet fra slutt­differansen.
