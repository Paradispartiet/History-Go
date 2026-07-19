# Skånevik hermetikkfabrikk – rundinger batch 1

## Omfang

Alle ni rundinger i næringslivsprofilen er fylt:

- people
- works
- badges
- før_nå
- civication
- brands
- nature
- fortellinger
- leksikon

Det er ikke lagt inn manuell `rounds`- eller `rundinger`-overstyring.

## Kildegrunnlag

- Kringom: Skånevik, handelsstaden
- Erling Jensen: Fabrikken i Skånevik
- Stortingets samtidige spørsmål om Norway Foods-fabrikken
- DigitaltMuseum: navngitt arbeidslag ved fabrikken i 1930
- Hermetikkbloggen: produksjonskapasiteten i 1994
- Bergens Tidende: omstillingen etter nedleggingen
- eksisterende People-kort for Christian Bjelland

## Redaksjonelle beslutninger

- Christian Bjelland brukes som dokumentert People-anker for fabrikketableringen i 1908.
- Den eksisterende People-filen beholdes med nøyaktig én person, samme primæranker, `year: 1908` og `verifiedAt: 2026-07-18`.
- Skoneviks Preserving Co. fra 1891 behandles som en kortvarig forgjenger og erstatter ikke 1908 som hovedår.
- Fabrikkens utvidelse i 1947, moderniseringen rundt 1960, Norway Foods fra 1981, dokumentert 1994-kapasitet og Rieber fra 1996 behandles som egne faser.
- Siste produksjonsdag 30. mars 2001 brukes som den konkrete avslutningen på fabrikkdriften.
- Rundt 70 arbeidsplasser og den store andelen kvinnearbeidsplasser brukes som dokumentert samtidskontekst fra 2000, ikke som et tidløst ansattetall.
- Fotografiet fra 1930 brukes som dokumentasjon på et navngitt arbeidslag. Det konstrueres ikke stillinger eller ansettelsesforløp for de avbildede.
- Brisling (`Sprattus sprattus`) er den dokumenterte produksjonsarten i Natur-rundingen. Den gjøres ikke til en udokumentert nåtidsobservasjon ved kartmarkøren eller en full artsinventering.
- Fabrikkmarkøren er et representativt områdeanker for den tidligere fabrikkfunksjonen og hevder ikke et eksakt historisk bygningsfotavtrykk.
- `skanevik_gjestgjevargarden` er et separat canonical place for det bevarte hovedhuset/Tippehuset. Fabrikk og Gjestgjevargard blandes ikke sammen.
- Koordinatene, radiusen og `year: 1908` beholdes uendret.

## Runtime

- People lastes gjennom den eksisterende manifesterte `people_naeringsliv_etne_batch1.json`.
- Christian Bjelland får én eksplisitt relasjon til fabrikkstedet.
- Fortellingen legges i den allerede manifesterte fellesfilen for Etne næringsliv.
- Leksikonartikkelen legges i den allerede manifesterte fellesfilen for Etne næringsliv.
- Stedsindeksen trenger ingen endring fordi alle lette identitetsfelt er uendret.

## Kontroll

`tests/skanevik-hermetikkfabrikk-batch1-round-content.test.js` kontrollerer:

- den dokumenterte 3 × 3-profilen for næringsliv
- alle ni fylte rundinger
- den låste People-batchen og Christian Bjellands eksisterende kontrakt
- People-, story- og leksikonmanifestene
- årstallene 1891, 1908, 1930, 1947, 1960, 1981, 1994, 1996 og 2001
- kapasiteten på 50 000 sardinesker per dag i 1994
- siste produksjonsdag 30. mars 2001
- arbeidsplassomfanget og kvinnearbeidet
- brisling som eneste dokumenterte produksjonsart
- kanonisk nearby-ID for `skanevik_gjestgjevargarden`
- fysiske og stedsspesifikke Civication-objekter
- uendrede koordinater, radius og hovedår
- representativt områdeanker, ikke eksakt fabrikkfotavtrykk
- fysisk og redaksjonelt skille mellom fabrikk og Gjestgjevargard
