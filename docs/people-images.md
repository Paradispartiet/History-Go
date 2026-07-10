# Bilder av personer

History Go skal ikke vise tilfeldige Google-bilder direkte i produksjon. Google Images kan brukes til manuell research, men er ikke en bildeleverandør og dokumenterer ikke at History Go har bruksrett.

## Godkjente kilder

Automatisk kandidatinnhenting prioriterer Wikidata og Wikimedia Commons. Produksjonsbilder må ha dokumentert kilde, opphavsperson der dette er oppgitt, lisens og lisenslenke.

Automatisk godkjente lisenstyper er avgrenset til:

- Public Domain
- CC0
- CC BY
- CC BY-SA

Andre eller uklare lisenser skal avvises. Bilder med NC-, ND-, redaksjonell eller ukjent lisens skal ikke skrives inn automatisk.

## Sikker arbeidsflyt

```bash
npm run people:images:audit
npm run people:images:candidates -- --limit=25
npm run people:images:apply
npm run people:images:apply:write
```

1. `audit` rapporterer manglende bilder, eksterne bilde-URL-er og bilder uten metadata.
2. `candidates` søker etter Wikidata-personer med Commons-bilde og skriver `data/people/people_image_candidates.json`.
3. En kandidat må manuelt få `"approved": true` etter kontroll av identitet, motiv og lisens.
4. `apply` er dry-run og viser hva som ville blitt endret.
5. `apply:write` laster ned godkjente bilder lokalt, oppdaterer persondata og bygger attribusjonsregisteret.

Kandidatfila er et arbeidsdokument og må aldri tolkes som automatisk godkjenning. Navnelikhet alene er ikke nok. Fødselsår, yrke, beskrivelse og stedstilknytning må kontrolleres når identiteten kan være tvetydig.

## Datamodell

Et godkjent bilde lagres lokalt og registreres slik:

```json
{
  "image": "bilder/kort/people/person_id.jpg",
  "cardImage": "bilder/kort/people/person_id.jpg",
  "wikidataId": "Q123",
  "imageMeta": {
    "source": "wikimedia_commons",
    "sourcePage": "https://commons.wikimedia.org/wiki/File:Example.jpg",
    "creator": "Fotografnavn",
    "credit": "Institusjon",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "retrievedAt": "2026-07-10",
    "reviewStatus": "manually_approved"
  }
}
```

Attribusjoner samles i `data/people/people_image_attributions.json`. Dette registeret kan senere brukes til en krediteringsside i appen.

## Fallback

Når et trygt bilde ikke finnes, beholdes personens initialer eller dagens nøytrale placeholder. For historiske personer kan senere malerier, tegninger eller statuer brukes når lisensen tillater det, men de skal beskrives som kunstneriske fremstillinger og ikke som autentiske samtidige portretter.

## Tekniske prinsipper

- Ingen hotlinking i produksjonsdata.
- Ingen automatisk skriving uten eksplisitt kandidatgodkjenning.
- Dry-run er standard.
- Original kilde- og lisensmetadata bevares.
- Bildet lagres lokalt for stabilitet, men lokal lagring opphever ikke attribusjonskrav.
- Eksisterende `image` og `cardImage` beholdes kompatible med dagens people-loader.
