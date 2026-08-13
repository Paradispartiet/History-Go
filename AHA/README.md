# History Go AHA-flate (eksport- og statusbro)

`History-Go/AHA` er kun History Go sin eksport-/statusflate for
`aha_import_payload_v1`. All AHA-import, signalbygging, matching og
innsiktsanalyse eies av `Paradispartiet/AHA-EchoNet`.

Eksportgrensen er nå en eksplisitt v1-kontrakt. Den kanoniske kontrakten eies
av AHA-EchoNet; en kontrollert produsentkopi ligger i
`AHA/contracts/aha_import_payload_v1.schema.json`, og CI validerer den faktiske
payloaden fra `js/aha.js` mot kopien. Payloaden erklærer privat bruk og kan ikke
aktivere offentlig deling eller modelltrening.

## Ansvarsdeling

- **AHA-EchoNet** = canonical/personal AHA (chat, feed, notes, gallery, insta og øvrige personlige AHA-moduler).
- **History Go** = samlings- og læringsunivers (quiz, steder, personer, progresjon, Civication, kart m.m.).
- **History-Go/AHA** = lokal bro/statusflate som viser og eksporterer `aha_import_payload_v1` til AHA-EchoNet, uten en AHA-analysemotor.

## Hva finnes i denne mappen nå

- `index.html`: lokal statusvisning og eksplisitt eksport av v1-payloaden.
- `aha-chat.css`: enkel stil for statusflaten.
- `contracts/aha_import_payload_v1.schema.json`: låst produsentkopi av den
  kanoniske AHA-EchoNet-kontrakten.

De tidligere lokale AHA-motor-, import-, matching- og innsiktsvisningsfilene er
fjernet. History Go beholder sine egne domenehendelser og Knowledge V2-data,
men tolker dem ikke på vegne av AHA.

## Viktig

History-Go/AHA er ikke en AHA-analyseapp. For kanonisk import og AHA-opplevelse, bruk:

- https://paradispartiet.github.io/AHA-EchoNet/
