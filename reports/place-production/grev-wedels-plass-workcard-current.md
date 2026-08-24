# Grev Wedels plass – workcard

Status: `FERDIG – AVVENTER PR/CI`

Branchgrunnlag: `agent/content-factory-pilot-03-grev-wedels-plass-v1` fra Bankplassen-merge `97e9e3c2` på `main`.

## Produksjonsresultat

| Checkpoint | Resultat |
| --- | --- |
| Eierskap | Canonical enhet er parkrommet, ikke Gamle Logen, Militærhospitalet eller Akershus festning |
| Evidens | Ni produksjonsclaims, setningsspor, OSM-geometri og fersk kontroll av kunstlaget fra 2026 |
| Fag | Tre eksisterende By-emner, quizkontekst og fungerende Fagverk-kobling |
| Kjerneinnhold | Redigert `desc`, seks popupavsnitt, fem historielag og før/nå |
| Entiteter | Herman Wedel Jarlsberg, tre fysiske Objects og fire canonical Related |
| Læring | 5×7 Quiz; 35/35 spørsmål er unike og Knowledge-koblet; konkret feltoppgave i historisk rute |
| PlaceCard | Full fast komposisjon: én People-sirkel og rektanglene Objects, Brands og Related |
| Sluttport | Canonical index, People-runtime, place-open og Fagverk release er regenerert |

## Redaksjonelle grenser

- Herman Wedel Jarlsbergs primære biografiske Place forblir Eidsvollsbygningen; Grev Wedels plass er et direkte eponymanker.
- Gamle Logen og Militærhospitalet mangler egne canonical Place-ID-er og er derfor ikke oppfunnet som relasjoner.
- Oslo Byes Vel finnes ikke i brandregisteret med kvalifisert profil og lokal logo. Brands-rektangelet bruker den globale, ærlige fallbacken i stedet for filler.
- Frontbildet er Helge Høifødts Commons-fotografi av parkrommet, frigitt til public domain.
- «Kvinnetorso», «Hanne på stranden» og fontenen er kvalifisert som fysiske Objects i selve parken.

## Sluttbeslutning

Stedet er klart for målrettet regresjon, full repository-CI og merge. Godkjenning forutsetter grønn PlaceCard-rendering, quiz/Knowledge, stedsindeks, People, route, TypeScript og webbygg på PR-headen.
