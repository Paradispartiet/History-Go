# Sunnhordland Mekaniske Verkstad – rundinger batch 1

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

- SMV sin offisielle bedriftshistorie
- Paul Hovda sin historiske framstilling i Grannar
- Bui Sunnhordland sin virksomhetsbeskrivelse
- Brønnøysundregistrene
- Patentstyrets patenttidende fra 2005
- eksisterende People-kort for Paul og Gudvin Hovda

## Redaksjonelle beslutninger

- Anders Hovda brukes som grunnleggeranker for Seimsfoss Mekaniske Verkstad i 1958.
- `year: 1958` beholdes som bedriftens historiske hovedår, men brukes ikke som påstått byggeår for dagens produksjonshaller.
- Flyttingen til Skånevik og navneskiftet i 1968 behandles som en egen fase.
- Paul og Gudvin Hovda omtales som medeiere fra 1976 og likestilte eiere fra 1980, ikke som grunnleggere i 1958.
- Paul Hovdas patentkobling brukes som dokumentasjon på oppfinner- og utviklingsarbeid. Det konstrueres ingen udokumentert patenttittel eller teknisk funksjon.
- Norsk Motormuseum i den tidligere produksjonshallen og dagens SMV-anlegg på Leknestangen holdes som to fysisk forskjellige steder.
- Ove Wiland kobles ikke til dagens SMV-anlegg uten dokumentert industrifunksjon der.
- Dagens virksomhet beskrives gjennom dokumenterte fagområder og markeder. Nåtidsopplysninger om arbeidsstokk og omsetning gjøres ikke til tidløse fakta.
- Natur-rundingen beskriver fjordnær plassering, vær, salt, korrosjon, overflatebehandling og logistikk. Det legges ikke inn udokumenterte arter.
- Koordinatene, radiusen og `year: 1958` beholdes uendret.

## Runtime

- Anders Hovda legges inn i eksisterende Etne-batch for næringslivspersoner.
- Gudvin Hovdas eksisterende museumskort utvides med den dokumenterte SMV-koblingen.
- Paul Hovdas eksisterende SMV-kobling beholdes og får en eksplisitt relasjon til stedet.
- Fortellingen legges i den allerede manifesterte fellesfilen for Etne næringsliv.
- Leksikonartikkelen legges i den allerede manifesterte fellesfilen for Etne næringsliv.
- Stedsindeksen trenger ingen endring fordi alle lette identitetsfelt er uendret.

## Kontroll

`tests/smv-leknestangen-batch1-round-content.test.js` kontrollerer:

- den dokumenterte 3 × 3-profilen for næringsliv
- alle ni fylte rundinger
- People-, story- og leksikonmanifestene
- Anders, Paul og Gudvin Hovda som tre dokumenterte relasjoner
- årstallene 1958, 1968, 1976 og 1980
- dagens tredje generasjon og Leknestangen 95
- flerfaglig produksjon med mekanikk, hydraulikk og elektro
- fysiske og stedsspesifikke Civication-objekter
- uendrede koordinater, radius og hovedår
- det fysiske skillet mellom museum og produksjonsanlegg
- at Natur-rundingen ikke dikter inn arter
