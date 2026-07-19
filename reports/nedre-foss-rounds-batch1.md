# Nedre Foss – history rounds batch 1

Dato: 2026-07-19

## Avgrensning

Batchen fortsetter Akerselva-ruten etter Beierbrua og fyller Nedre Foss sine ni kanoniske historierundinger. Canonical ID, koordinater og radius er urørt; eventuell koordinatkorrigering tilhører den separate Oslo-koordinatkontrollen.

## Canonical identitet og person

- `year` endres fra den generiske verdien `1800` til `1220`, første dokumenterte omtale av kvernstedet.
- Oslo kommunes etableringsvindu 1148–1200 beholdes som en separat kildebelagt opplysning og blandes ikke sammen med første skriftlige belegg.
- Canonical `friedrich_gruner` brukes for myntmesteren som kjøpte Nedre Foss med Kongens mølle i 1672. Ingen alternativ `friederich_gruner` eller unødvendig Hans Grüner-record opprettes i denne batchen.
- Kildene varierer om det eksakte året den siste mølleproduksjonen opphørte. Batchen bruker derfor ikke ett omstridt sluttår som canonical hardfakta.

## Innhold

Batchen konkretiserer:

- middelaldermøllen og Hovedøya kloster
- Kongens mølle og krongodsperioden
- Friedrich Grüners kjøp i 1672
- hovedbygningen fra 1801/1802
- kornsiloen fra 1953 og ombyggingen til studentboliger i 2001
- parkens mølleformidling
- laksetrappen og regnbedene
- transformasjonen fra produksjonssted til offentlig elve- og parkrom

Eksisterende quiz er oppgradert til stedsspesifikke, kildebelagte spørsmål. Leksikonet er oppgradert med ekstern kildebase og konkret kronologi, og stedet har fått en egen fortelling.

## Rundinger

Personer, Verk, Merker, Før/nå, Civication, Aktører, Natur, Fortellinger og Leksikon.

## Split-sikkerhet

Ingen full Akerselva-splitting. Bare Nedre Foss-filen, dens route-indexrad og manifest-hash endres blant route-place-filene. En målrettet churn-guard beskytter de nyere berikede Akerselva-splitfilene.

## Validering

Den materialiserte sluttstaten har bestått:

- målrettet Nedre Foss-rundingtest
- canonical PlaceCard round runtime audit
- People-of-Places audit med null ugyldige stedsreferanser og null duplikate person-ID-er
- place index build/check
- split-manifest sync
- JSON-parse
- `git diff --check`

Sluttdiffen inneholder ingen midlertidige workflows eller helperfiler og bare ett valideringssett. Denne rapporten er canonical valideringsoppsummering for batchen.
