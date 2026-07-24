# Oslo-politikk: full og utvidet People-dekning

## Resultat

Alle 18 aktive Oslo-steder med `politikk` som hovedkategori har dokumenterte People-koblinger. Arbeidet er gjennomført i fire batcher, med personene fordelt etter deres faktiske fagrolle.

## Samlet produksjon

- første batch: 7 nye personer
- andre batch: 17 nye personer
- tredje batch: 10 nye personer
- fjerde og siste batch: 12 nye personer
- totalt: 46 nye personposter
- siste batch behandlet 20 dokumenterte identiteter: 12 nye og 8 canonical gjenbruk
- av de åtte canonical personene fikk fire en ny stedskobling; fire var allerede korrekt koblet og ble kildebekreftet
- Civication-indeksen: 1 286 personer

## Første batch: fylte ti opprinnelige hull

- Oslo tinghus
- Høyesteretts hus
- Politihuset på Grønland
- 22. juli-senteret
- Høyblokka
- Y-blokka
- Victoria terrasse
- Statsministerboligen
- Høyres Hus
- Arbeidersamfunnets plass

## Andre batch: utvidet de ti hullstedene

### Politikk og rettsstat

- Toril Marie Øie → Høyesteretts hus
- Carsten Smith → Høyesteretts hus
- Paal Berg → Høyesteretts hus
- Alexandra Europa Perez-Seoane → 22. juli-senteret
- Thor von Ditten → Victoria terrasse
- Halvdan Koht → Victoria terrasse
- Erna Solberg → Statsministerboligen og Høyres Hus

### By og arkitektur

- Knut Aasen → Politihuset på Grønland
- Anne Bjørndal → 22. juli-senteret

### Kunst og design

- Øivind Åstein → Oslo tinghus
- Torstein Bakke → 22. juli-senteret
- Lars Halvor Magerøy → 22. juli-senteret
- Kai Fjell → Høyblokka
- Tore Haaland → Høyblokka
- Inger Sitter → Høyblokka
- Odd Tandberg → Høyblokka

### Litteratur

- Olaf Bull → Arbeidersamfunnets plass

## Tredje batch: resterende åtte politikksteder

### Nye personer

- Emil Victor Langlet → Stortinget
- Oscar Wergeland → Stortinget
- Jørgen Young → Youngstorget
- Rolf Stranger → Oslo rådhus
- Brynjulf Bergslien → Eidsvolls plass
- Arne Vigeland → Eidsvolls plass
- Arne Durban → Eidsvolls plass
- Jørgen Knudsen → Folkets Hus
- Hans Ditlev Franciscus Linstow → Slottet
- Dronning Maud → Slottet

### Gjenbrukte personer

- Henrik Wergeland og Arnstein Arneberg → Eidsvolls plass
- Sverre Jystad, Jens Stoltenberg, Kai Fjell, Tore Haaland, Inger Sitter og Odd Tandberg → Regjeringskvartalet

## Fjerde batch: siste dokumenterte utvidelse

### Nye personer

- Bengt Espen Knudsen → Folkets Hus
- Torstein Ramberg → Regjeringskvartalet
- Johan Henrik Nebelong → Slottet
- Peter Fredrik Wergmann → Slottet
- Johannes Flintoe → Slottet
- Peter Petersen → Victoria terrasse
- Henrik Thrap-Meyer → Victoria terrasse
- Paul Due → Victoria terrasse
- Bernhard Steckmest → Victoria terrasse
- Curt Bräuer → Victoria terrasse
- Christian Mohr → Victoria terrasse
- Christian P. Reusch → Victoria terrasse

### Canonical personer gjenbrukt

- Knut Knutsen → Folkets Hus, allerede korrekt koblet
- Henrik Bull → Regjeringskvartalet, allerede korrekt koblet
- Karl Johan → Slottet, allerede korrekt koblet
- Oscar I → Slottet, allerede korrekt koblet
- Heinrich Ernst Schirmer → ny kobling til Slottet
- Wilhelm von Hanno → ny kobling til Victoria terrasse
- Henrik Ibsen → ny kobling til Victoria terrasse
- Johan Nygaardsvold → ny kobling til Victoria terrasse

Henrik Bull ble koblet gjennom canonical ID `henrik_bull` i `by`, ikke den separate Nationaltheatret-spesialposten.

## Låst minste dekning

| Sted | Personer |
|---|---:|
| Oslo tinghus | 2 |
| Høyesteretts hus | 4 |
| Politihuset på Grønland | 3 |
| 22. juli-senteret | 5 |
| Høyblokka | 8 |
| Y-blokka | 4 |
| Victoria terrasse | 13 |
| Statsministerboligen | 3 |
| Høyres Hus | 2 |
| Arbeidersamfunnets plass | 3 |
| Stortinget | 32 |
| Youngstorget | 22 |
| Oslo rådhus | 17 |
| Eidsvolls plass | 13 |
| Regjeringskvartalet | 11 |
| Folkets Hus | 4 |
| Slottet | 11 |
| Christopher Hornsrud-skiltet | 1 |

Y-blokka beholdes på fire fordi den allerede har den komplette dokumenterte kjernen Erling Viksjø, Sverre Jystad, Pablo Picasso og Carl Nesjar.

Christopher Hornsrud-skiltet beholdes på én fordi skiltet er viet Christopher Hornsrud. Ingen annen person er lagt til uten en dokumentert kobling til selve skiltstedet.

## Datamodell og kontroll

- alle nye fagfiler er registrert i People-manifestet
- ingen parallelle personidentiteter er opprettet
- alle nye personer har kilde-URL og avgrenset stedsspesifikk rolle
- eksisterende personer er utvidet i sine canonical filer
- Civication People-indeksen og webbygget er regenerert
- tre regresjonstester låser 18/18-dekning, fagfiler, ID-er, kilder og minimumstall
- full People-port: bestått
- full stedport: bestått
- kategori- og quizkontroll: bestått
- Knowledge V2: bestått
- TypeScript typecheck og webbygg-synk: bestått

## Fresh-main og diffkontroll

Hele People-endringen er feltvis flettet mot fersk `main`. En sluttkontroll fjernet formateringsendringer i urørte People-filer, slik at diffen bare beholder de reelle personpostene, canonical stedskoblingene, manifestet, testene, rapportene og genererte indeksene.