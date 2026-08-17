# Civication Thread Standard

Status: **authoringstandard for lokale delivery-threads**  
Sist reconcilet: **2026-08-18**

## 1. To forskjellige betydninger av «thread»

Civication bruker ordet tråd på to nivåer som ikke må blandes.

### Lokal mail-/delivery-thread

En lokal thread er en kort oppfølging, ofte `Re:`, som kan trigges av et valg. Den viser at svaret ble lest og at en person eller situasjon reagerte.

### Role World primary thread

En primary thread er en større relasjonell bue som kan gå på tvers av work/private/social, flere deliveries og flere dager. For `role_world_complete` skal en primær relasjonell tråd ha 5–10 faktiske beat-referanser.

Se [`CIVICATION_ROLE_WORLD_STANDARD.md`](./CIVICATION_ROLE_WORLD_STANDARD.md).

## 2. Scene er gameplay-enheten

Den gamle formuleringen «hovedmailen er scenen» er pensjonert. En scene kan leveres som mail, conversation, meeting, task eller notification.

En lokal mail-thread er derfor et authored deliverymønster som normaliseres til Scene Contract; den er ikke en egen gameplaymodell.

## 3. Hva en lokal thread skal gjøre

En thread bør gjøre minst én av disse tingene:

1. vise en sosial reaksjon på spillerens valg;
2. forsterke personens stemme;
3. flytte tillit, avstand, respekt eller irritasjon;
4. gjøre en konsekvens konkret;
5. åpne eller lukke en liten relasjonell mulighet;
6. peke mot et senere beat uten å late som hele buen er ferdig.

Hvis hovedbeaten spør «hva gjør du?», kan threaden vise «slik ble det oppfattet».

## 4. Form og lengde

En lokal thread er normalt kortere enn beatet som utløste den. Ett `ack`-svar kan være nok. To eller flere valg skal bare brukes hvis oppfølgingen faktisk er en ny `decision`.

Ikke gi en passiv reaksjon syntetiske valg.

## 5. Sosial hukommelse

Threaden bør reagere på det konkrete valget, ikke bare gi en generisk tekst. Den kan sette eller forsterke eksisterende effects, tags, flags, `next_bias` eller thread state når det finnes en canonical kontrakt for dette.

## 6. Forholdet til 5–10-beat-standarden

Det er **ikke** krav om 5–10 klikk i hver mail-thread.

Det strengere Role World-kravet betyr at viktige relasjoner skal få en serie av omtrent 5–10 beats/scener/meldinger over tid. En lokal `Re:`-mail kan være ett av disse beatene.

## 7. Kvalitetssjekk

Før en lokal thread-source legges inn:

- reagerer den på et faktisk valg eller hendelse?
- er avsenderen tydelig?
- er den kortere og mer spesifikk enn en ny hovedsak?
- endrer eller dokumenterer den relasjonen/situasjonen?
- har den riktig interaksjonsmodus?
- kan den materialiseres til `civication_scene_v1`?
- inngår den i en større primary thread hvis relasjonen er viktig for Role World?

Threads skal gjøre Civication levende ved å gi mennesker hukommelse, ikke ved å øke klikkmengden.
