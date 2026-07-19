# Hardeland kraftverk – rundinger batch 1

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

- NVE vannkraftdatabase: Hardeland H
- NVE vannkraftdatabase: Nye Hardeland
- SKL årsmelding 2025
- SKL «Folk i SKL»: Arild Tesdal
- SKL: åpningen av Løkjelsvatn kraftverk i 2026
- eksisterende Etne næringsliv-research i repoet

## Redaksjonelle beslutninger

- Hardeland H og Hardeland K / Nye Hardeland er to tekniske produksjonslinjer innen ett fysisk kraftverksmiljø.
- Det opprettes ikke separate overlappende kartmarkører for H og K.
- `year: 1950`, koordinatene og radiusen beholdes uendret.
- 1958 / 2025 brukes bare om K-linjen og Nye Hardeland, ikke som nytt hovedår for hele stedet.
- Arild Tesdal brukes som konkret arbeidslivsanker fordi SKL dokumenterer vannmåling, maskinarbeid og vedlikehold knyttet til både Litledalen og Hardeland.
- People-kortet påstår ikke at Tesdal var prosjektleder eller eneansvarlig for anleggene.
- Natur-rundingen beskriver magasiner, fallhøyde, vannveier, regulering og forholdet til Etnevassdraget. Det legges ikke inn udokumenterte arter.
- Hardeland behandles som industristed og energiinfrastruktur, ikke som et rent natursted.
- Løkjelsvatn kraftverk brukes som systemkontekst, men får ikke overta Hardeland-kortets identitet.

## Runtime

- People lastes gjennom eksisterende `people_naeringsliv_etne_batch2.json`, som allerede står i People-manifestet.
- Fortellingen er registrert i `stories_manifest_naeringsliv_batch_01.json`.
- Leksikonartikkelen er registrert i `data/leksikon/manifest.json`.
- Stedsindeksen trenger ingen innholdsendring fordi bare lette identitetsfelt inngår der, og disse er uendret.

## Kontroll

`tests/hardeland-kraftverk-batch1-round-content.test.js` kontrollerer:

- den dokumenterte 3 × 3-profilen for næringsliv
- alle ni fylte rundinger
- manifestkoblinger
- People-ankeret
- årstallene 1950, 1958 og 2025
- H/K som ett canonical fysisk sted
- fysiske og stedsspesifikke Civication-objekter
- uendrede koordinater, radius og hovedår
- at Natur-rundingen ikke dikter inn arter
