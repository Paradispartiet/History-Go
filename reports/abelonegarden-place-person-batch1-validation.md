# Abelonegården place + people batch 1 validation

Dato: 2026-07-18

## Opprettet

- place: `abelonegarden` → `data/places/historie/oslo/places_historie/abelonegarden.json`
- person: `abelone_kristensen` → `data/people/subkultur/oslo/abelonegarden/abelone_kristensen.json`

## Stedsgate

Abelonegården er et konkret historisk sted, ikke et hybrid- eller områdeanker. Kildene plasserer gården i Karl XIIs gate 15 på hjørnet av Sukkerhusgaten, på tomta der Oslo Spektrum står i dag.

## Personkobling

Abelone Kristensen drev virksomheten sin i gården og er eksplisitt identifisert som skikkelsen stedet fikk navn etter.

## Kilder

- Store norske leksikon: Abelonesaken
- Nasjonalbiblioteket: Abelone, dronningen av Kristianias underverden
- Lokalhistoriewiki: Abelonegården
- Lokalhistoriewiki: Abelone Constance Kristensen

## Validering etter kjøring

```bash
npm run places:index:build
bash scripts/check-places.sh
bash scripts/check-people.sh
```
