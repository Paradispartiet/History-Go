# Akerselvas utløp mot fjorden (Bjørvika) – natur-rundinger batch 1

## Resultat

Stedet `akerselva_utlop_bjorvika` har nå alle ni rundinger i naturprofilen:

1. Oppgaver
2. Natur
3. Merker
4. Trening
5. Civication
6. Aktører
7. Før/nå
8. Fortellinger
9. Leksikon

## Artsvisning

Natur-rundingen viser hele den aktive artsunionen fra repoets fem naturkart:

- flora: tiriltunge og hestekastanje
- fauna: blåmeis, fiskemåke, gråmåke, gråspurv, grågås, kjøttmeis, kråke, ringdue, sildemåke, skjære og svarttrost
- totalt: 13 arter

Artskortene er dokumenterte observasjonsspor. De er ikke en garanti for at arten finnes ved hvert besøk, og en observasjon skal bare registreres når arten faktisk ses eller høres.

## Innholdslinje

Batchen følger retningen `sted → observasjon → emne → forståelse`:

- munningen leses som en konkret overgang mellom byelv og fjord
- hard kaifront, tunnelert elveløp, overvann og avløpsinfrastruktur gjøres synlig
- quizene trener stedlig observasjon, artskunnskap, systemforståelse og kildekritikk
- alle feltoppgaver og treningsøvelser holder spilleren på tørr offentlig promenade

## Bevarte kartdata

- ID: `akerselva_utlop_bjorvika`
- koordinat: `59.9075303, 10.7554479`
- radius: `220`
- canonical år: `2000`
- koordinatkilde: `osm-way:246047712`

## Datakilder

Oslo byleksikon, Store norske leksikon, Oslo kommune, OpenStreetMap og repoets aktive naturkart.

## Kontroll

Den målrettede testen kontrollerer:

- alle ni rundinger
- eksakt artsunion på 13 arter
- canonical kartdata og manifest-hash
- leksikon- og fortellingsmanifest
- seks quizsett med sju kildebelagte spørsmål i hvert sett
- gyldige naturmerker og fysiske, stedsspesifikke Civication-objekter
