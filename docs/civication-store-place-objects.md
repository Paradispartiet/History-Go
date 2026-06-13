# Civication Store: stedsspesifikke fysiske objekter

Civication Store er PlaceCard-funksjonen for objekter spilleren kan kjøpe,
samle og bruke videre i Civication fordi de representerer akkurat ett sted.
Store-konseptet ligger fortsatt under den canonical PlaceCard-rundingen
`civication`; runding-id-en skal ikke omdøpes selv om brukerflaten heter
“Civication Store”.

## Hva er et Civication Store-objekt?

Et Civication Store-objekt er et konkret, fysisk og stedsspesifikt objekt som
peker på stedets historie, funksjon, institusjon, symboler eller fysiske miljø.
Det skal helst være så tett knyttet til stedet at objektet mister meningen sin
hvis det flyttes til et annet sted.

Gode eksempler:

- Tigeren ved Jernbanetorget.
- Sinnataggen i Vigelandsparken.
- Monolitten i Vigelandsparken.
- En konkret minneplate på stedet.
- En konkret stadionport knyttet til arenaen.
- En konkret fabrikkrest eller maskindel som faktisk hører til stedet.
- En konkret fasadedetalj, institusjonsskilt, skulptur, installasjon eller et
  historisk spor som peker på akkurat dette stedet.

## Hva er ikke lov?

Ikke legg inn generiske samleobjekter eller løse temaobjekter. Hvis samme objekt
like gjerne kunne vært brukt på mange andre steder, hører det normalt ikke
hjemme i Civication Store.

Feil type objekter:

- gammel togbillett
- ruteplan
- vanlig perrongskilt
- generell mikrofon
- vanlig fotball
- vanlig benk
- tilfeldig gammelt skilt

Slike ting kan være relevante i andre moduler hvis de er kunnskapsstoff,
observasjonstips eller del av en fortelling, men de skal ikke brukes som
Civication Store-objekter uten en tydelig, konkret og dokumentert stedskobling.

## Krav til stedsspesifisitet

Før et objekt legges inn, skriv en kort `placeSpecificReason` som svarer på:

> Hvorfor gir dette objektet mening akkurat her?

Bruk flyttetesten som kvalitetssjekk:

> Hvis objektet flyttes til et annet sted, mister det da meningen sin?

Hvis svaret er nei, er objektet sannsynligvis for generisk.

## Krav til fysisk og konkret objekt

Objektet bør være fysisk eller kunne forstås som et konkret stedlig objekt:
skulptur, port, minneplate, fasadedetalj, institusjonsskilt, installasjon,
maskindel, fabrikkrest, bygningsdel eller annet faktisk spor i miljøet. Unngå
abstrakte temaer, generelle roller, organisasjoner, hendelser og verk som Store-
objekter.

## Bruk i Civication

Objektene kan kjøpes eller samles og brukes videre i Civication som
stedsspesifikke ressurser, symboler, identitetsmarkører, oppdragselementer,
rolle-/bylivskoblinger eller progresjonsinnhold. Feltet `civicationUse` bør
kort angi hvilke Civication-domener objektet kan brukes i.

## Anbefalt dataformat

Dette formatet anbefales for nye objekter, men eksisterende data trenger ikke
full migrering i denne PR-en:

```json
{
  "id": "jernbanetorget_tigeren",
  "placeId": "jernbanetorget",
  "title": "Tigeren",
  "type": "skulptur",
  "physicalObject": true,
  "placeSpecific": true,
  "placeSpecificReason": "Skulpturen er fysisk plassert ved Jernbanetorget og fungerer som et kjent stedssymbol.",
  "historicalFunction": "Bysymbol, møtepunkt og offentlig rom-markør.",
  "storePrice": 25,
  "currency": "PC",
  "collectable": true,
  "civicationUse": ["byidentitet", "turisme", "offentlig_rom"],
  "image": ""
}
```

## Kvalitetstest før nye objekter legges inn

1. Er objektet fysisk eller konkret nok?
2. Er det knyttet til ett bestemt sted med `placeId`?
3. Forklarer `placeSpecificReason` hvorfor objektet hører hjemme akkurat der?
4. Består objektet flyttetesten?
5. Er objektet mer enn et generisk temaobjekt?
6. Har det en tydelig Civication-bruk i `civicationUse`?
7. Er tittel, pris, valuta og bilde enten fylt ut eller bevisst utelatt?

## Forholdet til andre PlaceCard-rundinger

- `civication`: canonical PlaceCard-round-id for Civication Store. UI kan hete
  “Civication Store”, og innholdet er stedsspesifikke fysiske objekter som kan
  kjøpes/samles og brukes i Civication.
- `wonderkammer`: ting å se etter, detaljer, observasjonspunkter og fysiske spor
  på stedet. Wonderkammer kan peke på samme miljø, men er primært en se-/lete-
  og observasjonsfunksjon, ikke butikk/samling.
- `works`: verk, prestasjoner og produksjoner som bøker, låter, arkitekturverk,
  forestillinger, kamper, rekorder eller utstillinger.
- `brands`: aktører, institusjoner, organisasjoner, klubber, museer, scener,
  butikker, bedrifter og andre navngitte systemaktører.
- `leksikon`: forklaringer, begreper og kunnskapskort. Brukes til å forklare
  objektet eller konteksten, ikke til å selge/samle objektet.
