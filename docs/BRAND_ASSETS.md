# Brand assets — canonical visuell identitetskontrakt

Status: **canonical produksjonskontrakt**  
Eier: `brand_visual_identity`  
Sist kontrollert: **2026-08-14**

## Hovedregel

En Brand-post som skal være synlig i en **ferdig PlaceCard Brands-runding skal ha en verifisert logo eller et autentisk dokumentert ordmerke/brandmark**. Navnefallback eller et vanlig dokumentarfoto er ikke nok til å lukke Brand-fasen.

Det betyr:

- **logo completeness = 100 %** for alle synlige/canonical brands i den ferdige stedspakken;
- et dokumentarfoto av butikk, interiør eller person kan supplere brandet, men **erstatter ikke logoporten**;
- en historisk virksomhet uten bevart separat logofil kan bruke et **autentisk historisk ordmerke/skiltmerke hentet fra en dokumentert kilde**, så lenge merket ikke rekonstrueres, nydesignes eller tegnes på nytt;
- brandet holdes i produksjon til logo/ordmerke er funnet og kildeført; manglende logo skal ikke skjules ved å erklære fase eller sted ferdig.

## Formål og rettslig ramme

Logoer brukes informasjonsmessig for å identifisere dokumenterte brands i History GO. Bruken skal ikke antyde samarbeid, sponsing, godkjenning, partnerskap eller annen tilknytning mellom brandet og History GO.

For hvert asset skal det dokumenteres hvor merket kommer fra og hvorfor det er forsvarlig å bruke i den konkrete identifiserende konteksten.

## Kildeprioritet

1. Offisiell brand-/virksomhetskilde med korrekt logo eller ordmerke.
2. Wikimedia Commons, DigitaltMuseum, Nasjonalbiblioteket, museum/arkiv eller annen inspectable kilde med autentisk logo, ordmerke eller skiltmerke.
3. For historiske brands: dokumentert foto/scan hvor det autentiske ordmerket eller skiltmerket kan isoleres som kildebåret brandmark uten rekonstruksjon.

Tredjeparts katalogbilder, logoaggregatorer og tilfeldige søketreff er ikke identitetsbevis.

## Stoppregler

- **13 brands betyr 13 verifiserte logo-/ordmerke-assets** i en Torggata-pakke med 13 brands; dette er ikke en antallskvote, men 100 % dekning av den allerede kildebårne brandpopulasjonen.
- Ingen genererte, rekonstruerte eller hukommelsesbaserte logoer.
- Ingen feilidentitet basert på samme navn.
- Ingen moderne etterfølgerlogo skal brukes som om den var en historisk virksomhets merke uten dokumentert kontinuitet og eksplisitt tidsmerking.
- Ingen dokumentarfoto skal registreres som `logo` med mindre den publiserte asseten faktisk er et kildebåret utsnitt av det autentiske ordmerket/skiltmerket.
- Ingen fase-closeout med navnefallback for et brand som ellers skal være med i den ferdige Brands-rundingen.

## Datakrav per logo/ordmerke

Hver publisert Brand-logo skal ha:

- lokal canonical assetfil;
- `sourcePage`;
- creator/credit når kjent;
- lisens eller eksplisitt `rightsBasis`;
- `reviewStatus`;
- `assetKind: logo` eller en eksplisitt historisk ordmerkevariant;
- `usageContext: referential_identification`;
- `noEndorsement: true`;
- tidsangivelse når merket er historisk;
- beskrivelse av eventuell teknisk transformasjon, som beskjæring, skalering eller formatkonvertering.

Beskjæring og formatnormalisering er tillatt når selve brandmerket ikke endres. Rekonstruksjon og redesign er ikke tillatt.

## Ferdigport

Brand-fasen er `GODKJENT` først når:

1. canonical brandpopulasjon er kildebåret og ferdig auditert;
2. alle canonical brands som skal være med i rundingen har lokal verifisert logo/ordmerke;
3. proveniens/rettighetsgrunnlag finnes for hvert asset;
4. identitet og historisk/nåværende tidsstatus er kontrollert;
5. runtime bruker korrekt logo for korrekt brand;
6. en automatisert stedstest låser **100 % logo completeness**.

Et brand kan fortsatt eksistere canonical mens logoarbeidet pågår, men stedet/Brand-fasen kan ikke erklæres ferdig før denne porten er grønn.
