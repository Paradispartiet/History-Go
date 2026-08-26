# Blå skilt – fase 2 – representasjonsbeslutning

Dato: 2026-08-26

## Omfang

Fase 2 er en kuratert utvidelse, ikke en masseimport.

- eksisterende canonical blå-skiltbaseline: 12 fysiske skilt
- eldre 2026-records som migreres til Micro Place-kontrakten: 5
- nye fysiske blå skilt i første fase-2-batch: 15
- ny snublesteinbatch: 0

## Canonical identitet

Hvert nytt Place representerer det konkrete offentlige blå skiltet ved den dokumenterte adressen. Personen, virksomheten, hendelsen eller bygningen som omtales av skiltet er historisk kontekst, ikke en erstatning for skiltets egen stedlige identitet.

Det gir hvert fysisk skilt en separat kartmarkør også når personen eller temaet allerede finnes i People, fagverk eller et ordinært Place. Det skal samtidig aldri opprettes to blå-skilt-Places for samme fysiske plakett.

## Micro Place

Alle blå skilt i dette løpet bruker:

- `placeTier: "micro"`
- `subcategory_id: "bla_skilt"`
- `micro_place_profile.schema: "history_go_micro_place_profile_v1"`
- `kind: "minneskilt"`
- `quizMode: "none"`

De fem eldre 2026-recordene beholder eksisterende historisk rikdata. Migreringen endrer presentasjonsnivået, ikke forskningens innhold.

## Koordinater

Nye skilt bruker Kartverket / Geonorge Adresser API som dokumentert `display_marker`. Adressepunktet er et besøksanker for skiltet, ikke en påstand om millimeterpresis koordinat for metallplaketten.

## Bilder

Et Micro Place kan vise foto av den fysiske plaketten bare når alle fire felter er dokumentert:

1. bilde-URL
2. fotograf/kreditering
3. lisens
4. kilde-URL for bildet

Mangler ett felt, skal bildeoverflaten ikke rendres. Første batch bruker denne modellen for Robert Levin og Anne-Cath Vestly, med dokumenterte Wikimedia Commons-foto av selve skiltene.

## Snublesteiner

De seks eksisterende snublesteinene forblir pilot. Fase 2 oppretter ingen ny stor snublesteinbatch.
