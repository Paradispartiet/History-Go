# Torggata – gjenåpnet fase 8F rundingskoherens audit V1

- Dato: 2026-08-14
- Place ID: `torggata`
- Canonical place: `data/places/by/oslo/places/torggata.json`
- Kontrakt: `data/places/README_place_rounds.md`
- Runtime: `js/ui/place-rounds-visual-collections.js`
- Status: **KLAR FOR REVIEW**

## Problem

Torggata viste teknisk korrekt 4+1, men innholdet var redaksjonelt svakt:

- Objects bestod av ett sykkelruteskilt;
- Structures bestod av Eldorado og Torggata Bad;
- Objects og Structures ble to separate rundinger for fysiske elementer uten en tydelig brukerforskjell;
- Torggatas produksjonsidentitet ekskluderer uttrykkelig Eldorado, Torggata Bad og Youngstorget som egne places, men Structures brukte to av dem som parent-place-innhold.

Dermed var fire felter fylt, men de fire rundingene var ikke naturlige og distinkte.

## Beslutning: 4+1 beholdes

Badge forblir separat. Torggatas fire innholdsrundinger blir:

```text
People · Bilder · Brands · Relaterte steder
```

| Runding | Substans | Hvorfor distinkt |
| --- | --- | --- |
| People | canonical personkoblinger | mennesker med dokumentert Torggata-tilknytning |
| Bilder | hovedbilde, stedsbilde og det kildekontrollerte ca. 1965/2025-paret | selve gaten visuelt gjennom tid |
| Brands | 13 gjennomgåtte nåværende og historiske virksomhetsidentiteter | organiserte/kommersielle navn, ikke personer eller steder |
| Relaterte steder | Storgata, Youngstorget og Eldorado Bokhandel | eksplisitte lenker til egne canonical places, ikke Torggata-proxyer |

## Fjernet

- `place.objects` med det enslige byrute 8-skiltet er fjernet som canonical Torggata-runding.
- `place.structures` med Eldorado og Torggata Bad er fjernet fra parent-place.
- Ingen av disse er slått sammen under et nytt kunstig samlenavn.
- Legacy Civication-poster er ikke gjort til runding.

Historiske 8B/8D-audits beholdes som snapshots av tidligere beslutninger, men eier ikke dagens round selection.

## Own-place-grense

`data/places/production/torggata.json` avgrenser Torggata som gateløpet og ekskluderer Youngstorget, Eldorado og Torggata Bad som egne steder. Fase 8F følger dette:

- `related` betyr «åpne et annet History GO-place»;
- et related-kort hevder ikke at stedet er en del av Torggatas egen samling;
- Torggata Bad brukes ikke som bilde, Object, Structure eller hovedanker for Torggata;
- Eldorado Bokhandel og Youngstorget vises bare med egne canonical IDs;
- Storgata beholdes som dokumentert nabogate/relasjon.

## Kontrakt og runtime

Den gamle standarden `people · objects · brands · kategoriens fjerde` er fortsatt default, men er ikke lenger en filler-kvote.

Ny, avgrenset `round_profile.content_round_ids` tillater for vanlige steder:

1. `people` i første posisjon;
2. `objects` eller `images` i andre;
3. `brands` i tredje;
4. én canonical fjerde-runding i fjerde.

Runtime godtar bare profilen når den har fire distinkte IDs og begge overstyrte samlinger har reelt innhold. Ugyldig/tom profil faller tilbake til kategoriens standard. Legacy `place.rounds` gjeninnføres ikke.

Torggatas profil er:

```json
{
  "content_round_ids": ["people", "images", "brands", "related"]
}
```

## Bildegrunnlag

Bilder-rundingen bruker bare allerede eide, dokumenterte Torggata-bilder:

- lokal `frontImage` med Oslo Museum/Wilse-kreditering i selve bildet;
- lokal stedsfil;
- ca. 1965-bildet av Torggata 30–36;
- KartaView-bildet fra 2025 av samme gateakse.

Ingen generert eller rekonstruert asset er lagt til i denne fasen.

## QA-grense

Automatiske tester kan verifisere datafelter, fire logical IDs, runtimefallback, faktisk 2 × 2 DOM, innholdstall, Badge-plassering og fravær av Objects/Structures. De beviser ikke alene at det ferdige kortet er visuelt godt i produksjonsbrowseren.

Derfor blir **ny manuell UI- og innholds-QA neste bindende fase**, etterfulgt av ny sluttport og seksdelt re-score.

## Beslutning

**Objects/Structures-blokkeren er løst av fase 8F** når kontrakt, runtime, place-data, backlog, workcard og regresjonstester er merget med grønn CI.

Alle fem opprinnelige redaksjonelle innholdsfunn er da løst. Torggata er fortsatt ikke sluttført før manuell re-QA og final closeout består.
