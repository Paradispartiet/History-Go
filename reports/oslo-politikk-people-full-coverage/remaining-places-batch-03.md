# Tredje People-batch: resterende Oslo-politikksteder

## Omfang

Batchen utvider de åtte primære politikkstedene som ikke inngikk i forrige ti-stedersutvidelse:

- `stortinget`
- `youngstorget`
- `oslo_radhus`
- `eidsvolls_plass`
- `regjeringskvartalet`
- `folkets_hus_oslo`
- `slottet`
- `bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5`

## Ti nye personer

| Person | Fag | Sted | Direkte kobling |
|---|---|---|---|
| Emil Victor Langlet | By | Stortinget | Arkitekt for Stortingsbygningen |
| Oscar Wergeland | Kunst | Stortinget | Malte `Eidsvold 1814` i Stortingssalen |
| Jørgen Young | Næringsliv | Youngstorget | Grunneier og navneopphav |
| Rolf Stranger | Politikk | Oslo rådhus | Overrakte ordførerkjedet ved åpningen i 1950 |
| Brynjulf Bergslien | Kunst | Eidsvolls plass | Henrik Wergeland-statuen |
| Arne Vigeland | Kunst | Eidsvolls plass | Hjortegruppen ved Spikersuppa |
| Arne Durban | Kunst | Eidsvolls plass | `Lekende barn` ved Spikersuppa |
| Jørgen Knudsen | Politikk | Folkets Hus | Organiserte finansieringen av nybygget |
| Hans Ditlev Franciscus Linstow | By | Slottet | Arkitekt for Det kongelige slott |
| Dronning Maud | Historie | Slottet | Gjorde Slottet til fast kongebolig med Haakon VII |

## Åtte gjenbrukte canonical personer

- Henrik Wergeland og Arnstein Arneberg → `eidsvolls_plass`
- Sverre Jystad, Jens Stoltenberg, Kai Fjell, Tore Haaland, Inger Sitter og Odd Tandberg → `regjeringskvartalet`

## Låst minste dekning

| Sted | Personer |
|---|---:|
| Stortinget | 32 |
| Youngstorget | 22 |
| Oslo rådhus | 17 |
| Eidsvolls plass | 13 |
| Regjeringskvartalet | 10 |
| Folkets Hus | 3 |
| Slottet | 7 |
| Christopher Hornsrud-skiltet | 1 |

Hornsrud-skiltet beholdes på én person fordi skiltet er viet Christopher Hornsrud, og det finnes ikke en annen dokumentert personkobling til selve skiltstedet. Det legges ikke til svake navn bare for å heve antallet.

## Samlet produksjon i PR-en

- første batch: 7 nye personer
- andre batch: 17 nye personer
- tredje batch: 10 nye personer
- totalt: 34 nye personposter
- Civication-indeksen: 1 274 personer

## Validering

- de fem nye fagfilene er registrert i People-manifestet
- ti nye identiteter er kontrollert mot hele manifestet
- åtte canonical personer er utvidet i tredje batch uten dubletter
- `tests/oslo-politikk-remaining-people-expansion.test.js` låser personer, fagfiler, stedskoblinger, kildekrav og minimumstall
- Civication-indeksen og webbygget er regenerert
- full People-port, stedport, Data checks og TypeScript/webbygg er bestått
