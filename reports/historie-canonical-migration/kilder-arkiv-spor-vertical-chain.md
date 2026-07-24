# Historie: Kilder, arkiv og spor

Denne fasen fullfører den vertikale fagkjeden for `his_kilder_arkiv_spor` direkte i de aktive historiefilene.

## Leveranse

- 10 kilde- og metodepresise hooks
- 10 aktive emner
- 6 nye spesialmetoder
- to produksjonsbaner per emne
- 10 spørsmålsplaner
- låst 2 × 7-normalåpning
- permanent validator

## Obligatorisk kjede

1. ekstern kilde eller konkret kildeobjekt
2. presis `claim_basis`
3. kildetype og produksjonskontekst
4. egnet metode
5. eksplisitt begrensning
6. kontrollkilde eller dokumentert kildeknapphet
7. kritisk distinksjon
8. eventuelt teoribegrep

Canonical-filene styrer analyseformen, men er aldri faktakilde.

## Reviewrettinger

- `his_muntlige_kilder` er bundet til det eksisterende canonical-emnet `em_his_kilder_taushet_blindsoner`, som allerede har muntlig historie som sekundær produksjonsbane.
- `his_digitale_kilder` er bundet til `em_his_arkiv_og_dokumentasjon`, som allerede har digitale kilder som sekundær produksjonsbane.
- Produksjonskontekstene for Grindheim runestein, Grindheim steinkross, Grindheimsveien nord gravfelt og Høyland gravhaug er regenerert mot de oppdaterte canonical-filene.
- Avledede Knowledge-data er regenerert etter fagfilendringene.
- Produksjonstestene er synkronisert med canonical-katalogen: 12 pensummoduler, 49 emner, 23 hooks og 18 metoder.

## Kontroll etter review

Følgende kontroller bestod samlet før rettingscommiten ble skrevet:

- domenespesifikk vertikal validator
- audit av quizproduksjonskontekster
- audit av quiz–teoribinding
- category governance
- quiz-template governance
- canonical Knowledge-audit
- quizinnholdstesten
- quizproduksjonens testpakke
- `git diff --check`
