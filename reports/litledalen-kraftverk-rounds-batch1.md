# Litledalen kraftverk – rundinger batch 1

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

- NVE vannkraftdatabase: Nye Litledalen
- Grannar: «I mål med omfattande oppgradering»
- SKL: konsesjon og modernisering i 2018
- SKL årsmelding 2025
- SKL: offisiell åpning av Løkjelsvatn kraftverk i 2026
- eksisterende People of Places-kort for Halfdan Greve

## Redaksjonelle beslutninger

- Halfdan Greve brukes som People-anker fordi han er eksplisitt dokumentert som byggeleder ved byggestarten i 1916.
- Kortet påstår ikke at Greve alene planla, finansierte eller bygde anlegget.
- `year: 1920`, koordinatene og radiusen beholdes uendret.
- NVE-dateringen `1920 / 2025` forklares som historisk driftsstart og ny teknisk fase.
- 2025 erstatter ikke 1920 som stedets hovedår.
- Oppgraderingene i 1963 og 1985 beholdes som egne mellomfaser; før/nå-historien hopper ikke direkte fra 1920 til 2025.
- Litledalen holdes fysisk og historisk adskilt fra Hardeland, selv om de inngår i samme vassdrags- og driftsmiljø.
- Natur-rundingen beskriver Hårlandsvatnet, Litledalsvatnet, fallhøyde, vannvei og regulert vann som industriråstoff. Det legges ikke inn udokumenterte arter.
- Kraftverket behandles som næringsliv, elektrifisering og industriell infrastruktur, ikke som et rent natursted.
- Løkjelsvatn kraftverk brukes som systemkontekst og får ikke overta Litledalen-kortets identitet.

## Runtime

- People lastes gjennom eksisterende `people_litledalen_kraftverk_batch1.json`, som allerede står i People-manifestet.
- Fortellingen er lagt i den allerede registrerte fellesfilen `stories_etnesjoen_naeringsliv_rounds_batch1.json`.
- Leksikonartikkelen har egen fil registrert i `data/leksikon/manifest.json`.
- Stedsindeksen trenger ingen innholdsendring fordi koordinater, radius, kategori, hovedår og øvrige lette identitetsfelt er uendret.

## Kontroll

`tests/litledalen-kraftverk-batch1-round-content.test.js` kontrollerer:

- den dokumenterte 3 × 3-profilen for næringsliv
- alle ni fylte rundinger
- People-, story- og leksikonmanifestene
- Halfdan Greves dokumenterte rolle og rolleavgrensning
- årstallene 1916, 1920, 1963, 1985, 2018 og 2025
- NVE-dataene 8,6 MW, 27 GWh og 127,4 meter
- den doble dateringen 1920 / 2025
- fysiske og stedsspesifikke Civication-objekter
- uendrede koordinater, radius og hovedår
- skillet mellom Litledalen og Hardeland
- at Natur-rundingen ikke dikter inn arter
