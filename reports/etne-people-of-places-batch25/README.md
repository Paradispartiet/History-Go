# Etne People of Places batch 25 — Leif Grindheim ved Langfoss

## Resultat

Batchen legg til éin namngjeven prosjektleiar med ei eksplisitt dokumentert fysisk prosjektkopling til `langfoss_etne`:

- `leif_grindheim`

## Kjeldegrunnlag

Legria dokumenterer at Leif Grindheim er prosjektleiar for Åkrafjorden Oppleving i opprustinga av Langfosstien. Prosjektet starta i 2023 og er planlagt over fleire år. Den fysiske opprustinga omfattar mellom anna steintrapper og utsiktspunkt, med mål om tryggare ferdsel og vern av det sårbare landskapet ved Langfoss.

Etne kommune si organisasjonsoversikt fører Langfosstien med kontakt `c/o prosjektleiar Legria, v/ Leif Grindheim`.

Kjelder:
- https://www.legria.no/2024/05/opprusting-av-langfosstien/
- https://www.legria.no/2025/08/nyhende-fra-legria-august-2025/
- https://www.etne.kommune.no/Organisasjon/OrganisasjonVis.aspx?MId1=3694&OrganisasjonId=210

## Fysisk people-port

Grindheim blir ikkje teken inn på grunnlag av eit generelt reiselivs- eller organisasjonsverv. Kjeldene dokumenterer han som prosjektleiar for det konkrete, fysiske stiarbeidet ved Langfoss.

Kortet er medvite avgrensa:

- Grindheim blir ikkje framstilt som opphavsperson for Langfoss.
- Han blir ikkje knytt til vernevedtaket frå 1980.
- Han blir ikkje kreditert for den historiske ferdselsvegen før rehabiliteringsprosjektet.
- `year: 2024` viser året den fysiske opprustinga kom i gang, ikkje prosjektidéens første år eller fossen sitt historieår.

## Duplikatport

Før skriving vart fersk repo-state søkt etter:

- `leif_grindheim`
- `Leif Grindheim`

Ingen eksisterande canonical people-identitet vart funnen.

## Kategori

`category: natur` følgjer det eksisterande canonical place-et `langfoss_etne`. People-koplinga handlar om fysisk tilrettelegging ved naturstaden, ikkje om å omklassifisere fossen som reiselivsanlegg.

## Dekning

Etter batch 24 er Etne-dekninga 65 av 81 aktive stader, med 16 udekte. `langfoss_etne` står framleis på restlista.

Batch 25 skal dekkje eitt nytt fysisk place og gi 66/81 dersom hovudlinja ikkje endrar seg før merge.

## Integrasjonskontrakt

- `people/natur/vestland/etne/people_langfoss_batch1.json` skal stå nøyaktig éin gong i people-manifestet.
- `leif_grindheim` skal vere globalt unik ved normalisert ID-, namn- og variantkontroll.
- Personen skal berre peike på `langfoss_etne`.
- `tests/etne-people-of-places-batch25.test.js` skal køyre frå `scripts/check-people.sh`.
- Batchen skal ikkje endre place-, story-, UI-, bilete- eller quizdata.
