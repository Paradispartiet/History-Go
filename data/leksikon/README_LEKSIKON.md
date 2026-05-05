# README – Leksikonrunding i History Go

Denne filen beskriver hvordan leksikonrundingen i History Go skal fungere, hvordan data skal struktureres, og hvilke regler som gjelder når eksterne lenker legges inn på steder. Leksikonrundingen er ikke en dekorativ info-knapp. Den er stedets kilde-, oppslags- og videre-lesingsrom. Den skal gi brukeren rask tilgang til offisielle nettsider, statistikk- og datasider der det er relevant, Wikipedia dersom en relevant side finnes, og eventuelt andre seriøse kilder eller arkiver. Funksjonen skal være datadrevet: app-koden skal ikke hardkode Bislett, Wikipedia, World Athletics, museer, klubber, kommunale sider eller andre konkrete lenker. Hvert sted eier sine egne lenker gjennom place-data. Leksikonrundingen skal bare lese feltet, validere det trygt nok for visning, gruppere lenkene og åpne dem korrekt.

## Grunnidé

Leksikonrundingen skal fungere som et lite eksternt kunnskapsnav for hvert sted. Den skal støtte appens hovedidé: brukeren står ved et sted, får kort tekst, quiz, personer, Wonderkammer og relasjoner, men kan også gå videre til seriøse eksterne kilder når de vil kontrollere, fordype seg eller se oppdatert informasjon. For Bislett betyr dette for eksempel at leksikonrundingen bør kunne vise offisiell Bislett-side, en god statistikk-/resultatside for friidrett, og Wikipedia-side dersom den finnes. For et museum betyr det offisiell museumsside, samlingsside eller arkivside. For et naturområde kan det være Artskart, Naturbase, kommunal side eller verneside. For et litterært sted kan det være Nasjonalbiblioteket, Store norske leksikon, forfatterarkiv, institusjonsside eller Wikipedia der det finnes.

## Nåværende arkitektur som funksjonen skal respektere

History Go bruker place-objekter som kilde for stedets innhold. Et place-objekt kan allerede inneholde felt som `id`, `name`, `lat`, `lon`, `r`, `category`, `year`, `emne_ids`, `desc`, `image`, `cardImage`, `popupDesc` og `quiz_profile`. Dette betyr at `externalLinks` skal ligge på samme nivå som disse feltene, ikke i en separat hardkodet JS-tabell. Runding-popupene bruker felles popup-logikk, blant annet `showPlaceCardRoundPopup`, og skal derfor utvides med en ren render-funksjon for leksikoninnhold. Leksikon skal ikke gripe inn i quiz, unlock, profil, kart, Wonderkammer, Civication eller eksisterende place-loading utover at det nye feltet må være tillatt i dataene.

## Datamodell

Hvert place-objekt kan ha et valgfritt felt som heter `externalLinks`. Feltet skal være en array av lenkeobjekter. Hvis feltet mangler, er tomt eller inneholder ugyldige lenker, skal appen ikke krasje. Den skal enten vise en rolig tomtilstand eller skjule lenkeseksjonen, avhengig av valgt UI.

```json
"externalLinks": [
  {
    "type": "official",
    "label": "Bislett stadion – offisiell nettside",
    "url": "https://www.bislettstadion.no/"
  },
  {
    "type": "stats",
    "label": "World Athletics – Oslo Bislett Games",
    "url": "https://worldathletics.org/competition/calendar-results/results/7203939"
  },
  {
    "type": "wikipedia",
    "label": "Wikipedia – Bislett stadion",
    "url": "https://no.wikipedia.org/wiki/Bislett_stadion"
  }
]
```

## Tillatte lenketyper

Første versjon skal støtte disse typene:

```json
[
  "official",
  "stats",
  "wikipedia",
  "source",
  "archive",
  "database",
  "map",
  "other"
]
```

`official` brukes for offisiell nettside til stedet, institusjonen, arenaen, kommunen, museet, klubben, forbundet eller arrangøren. `stats` brukes for statistikk, resultater, tabeller, databaser eller annen strukturert datakilde. For sport er dette spesielt viktig. Bislett bør for eksempel ha friidrettsstatistikk/resultater, ikke bare en generell tekstside. `wikipedia` brukes kun når det finnes en relevant Wikipedia-side for selve stedet eller institusjonen. Hvis Wikipedia bare har en vag eller feil side, skal lenken ikke legges inn. `source` brukes for gode faglige kilder, artikler, Store norske leksikon, lokalhistoriewiki, kommunale temasider eller tilsvarende. `archive` brukes for arkivsider, historiske dokumenter, digitaliserte samlinger, Nasjonalbiblioteket eller lignende. `database` brukes for kilder som er mer database enn artikkel, for eksempel kulturminnesøk, museumssamlinger, sportsdatabaser eller artsdatabaser. `map` brukes for seriøse kart- eller posisjonskilder dersom de tilfører verdi. `other` brukes bare når ingen av de andre passer.

## Obligatoriske felt i hvert lenkeobjekt

Hvert lenkeobjekt skal minst ha `type`, `label` og `url`. `type` må være en kjent type. `label` skal være kort, menneskelig lesbar og fortelle hva brukeren faktisk åpner. `url` skal være en full `https://`-adresse. `http://` skal som hovedregel ikke brukes. Relative lenker skal ikke brukes i `externalLinks`, fordi feltet er ment for eksterne kilder.

```json
{
  "type": "official",
  "label": "Offisiell nettside",
  "url": "https://example.com/"
}
```

## Valgfrie felt

Disse kan brukes senere, men skal ikke kreves i første versjon:

```json
{
  "type": "stats",
  "label": "World Athletics – Oslo Bislett Games",
  "url": "https://worldathletics.org/competition/calendar-results/results/7203939",
  "lang": "en",
  "verifiedAt": "2026-05-05",
  "note": "Resultatside for Bislett Games. Kan byttes til nyere år ved senere kuratering."
}
```

`lang` kan være `no`, `nb`, `nn`, `en`, `pt` eller annen språkkode. `verifiedAt` kan brukes når en lenke er kontrollert manuelt. `note` er kun for utviklere/kuratering og skal ikke nødvendigvis vises i UI.

## Prioritet og visningsrekkefølge

Leksikonrundingen skal vise lenker i denne rekkefølgen:

1. Offisielt
2. Statistikk og data
3. Wikipedia
4. Kilder, arkiv og andre oppslag

Innenfor hver gruppe kan rekkefølgen være slik lenkene står i JSON. Det skal ikke sorteres alfabetisk hvis kuratoren har lagt inn en bevisst rekkefølge.

## UI-regler

Når brukeren trykker på leksikonrundingen i PlaceCard, skal det åpnes en runding-popup med tydelig tittel, for eksempel `Leksikon` eller `Kilder og lenker`. Popupen skal vise stedets navn som undertittel. Lenkene skal vises som trykkbare rader eller små kort, ikke som rå URL-er. Hver rad bør ha label, eventuell typebetegnelse og et eksternt-lenkeikon dersom UI-et allerede har et slikt mønster. Lenkene skal åpnes i ny fane eller ekstern nettleser med `target="_blank"` og `rel="noopener noreferrer"`. Dette er viktig både for sikkerhet og for at PWA-en ikke skal miste intern navigasjonstilstand.

Hvis et sted ikke har `externalLinks`, skal popupen vise:

```text
Ingen eksterne lenker lagt inn ennå.
```

Dette skal ikke regnes som feil. Mange steder vil få lenker senere gjennom kuratering.

## Sikkerhetsregler for rendering

Koden som renderer leksikonlenker skal escape `label`, `type`, eventuell `note` og all annen tekst. URL skal valideres før rendering. Bare `https:` bør godtas i første versjon. Hvis det finnes gamle offisielle kilder som kun har `http:`, skal de heller vurderes manuelt enn å åpne for alt. `javascript:`, `data:`, tomme URL-er og relative URL-er skal alltid avvises. Ugyldige lenker skal filtreres bort, ikke forsøkes reparert i runtime. Appen skal ikke gjøre nettverkskall for å sjekke lenkene når brukeren åpner popupen.

## Kvalitetsregler for innhold

Lenker skal legges inn kuratert, ikke ukritisk. Offisiell side skal prioriteres før fan-sider, bloggposter eller generelle søketreff. Statistikksider skal være relevante for stedets faktiske funksjon. For Bislett er friidrettsresultater/statistikk relevant. For Ullevaal er NFF, arena, landslag, klubbhistorikk eller kampdata mer relevant enn en tilfeldig stadionblogg. For Holmenkollen kan Skiforeningen, Holmenkollen skimuseum, FIS/arrangementsdata eller relevante historiske resultatkilder være riktige. For natursteder bør Artskart, Artsdatabanken, Naturbase eller kommunale/vernefaglige kilder vurderes. For kulturinstitusjoner bør offisiell institusjonsside og eventuelle samlings-/arkivsider prioriteres. Wikipedia skal bare legges inn når siden faktisk handler om stedet eller en svært tydelig tilknyttet institusjon.

## Forholdet til Wikipedia

Wikipedia er nyttig, men skal ikke være eneste kilde dersom det finnes offisiell side eller bedre fagkilde. Wikipedia-lenken skal ligge som egen type `wikipedia`. Bruk norsk Wikipedia når relevant norsk side finnes. Bruk engelsk Wikipedia bare dersom norsk side mangler eller engelsk side er klart bedre og relevant. Ikke legg inn både norsk og engelsk Wikipedia som standard; velg den beste for brukeren, normalt norsk.

## Forholdet til statistikk

Statistikkfeltet er viktigst for sport, natur, bydata og andre steder der tall/databaser gir reell verdi. For sport skal `stats` ikke være pynt. Det skal lenke til den beste tilgjengelige resultatsiden, arrangementsdatabasen, forbundet, historikkdatabasen eller en annen kilde som faktisk gir tall, resultater eller oversikter. For Bislett skal dette være friidrettsresultater/statistikk, for eksempel World Athletics eller Diamond League-relatert resultatside. For fotballarenaer kan dette være NFF/fotball.no, klubbens offisielle side, kampstatistikk eller annen seriøs database. For natursteder kan det være Artskart-observasjoner eller andre kvalitetssikrede naturdata. Hvis god statistikkilde ikke finnes, skal `stats` utelates til den er funnet.

## Eksempel: Bislett

Hvis place-objektet for Bislett finnes som `id: "bislett"`, kan det utvides slik:

```json
{
  "id": "bislett",
  "name": "Bislett",
  "externalLinks": [
    {
      "type": "official",
      "label": "Bislett stadion – offisiell nettside",
      "url": "https://www.bislettstadion.no/"
    },
    {
      "type": "stats",
      "label": "World Athletics – Oslo Bislett Games",
      "url": "https://worldathletics.org/competition/calendar-results/results/7203939"
    },
    {
      "type": "wikipedia",
      "label": "Wikipedia – Bislett stadion",
      "url": "https://no.wikipedia.org/wiki/Bislett_stadion"
    }
  ]
}
```

Hvis den nøyaktige World Athletics-lenken senere endres til et bedre år, en samlet konkurranseside eller en bedre historisk statistikkdatabase, skal datafeltet oppdateres i JSON. JS-koden skal ikke endres for slike kurateringsendringer.

## Eksempel på render-funksjon

Dette er ikke nødvendigvis endelig kode, men viser ønsket prinsipp:

```js
const HG_LEXICON_LINK_TYPES = new Set([
  "official",
  "stats",
  "wikipedia",
  "source",
  "archive",
  "database",
  "map",
  "other"
]);

const HG_LEXICON_GROUPS = [
  {
    title: "Offisielt",
    types: ["official"]
  },
  {
    title: "Statistikk og data",
    types: ["stats", "database"]
  },
  {
    title: "Wikipedia",
    types: ["wikipedia"]
  },
  {
    title: "Kilder og arkiv",
    types: ["source", "archive", "map", "other"]
  }
];

function isSafeExternalUrl(url) {
  try {
    const parsed = new URL(String(url || ""));
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeLexiconLinks(place) {
  return (Array.isArray(place?.externalLinks) ? place.externalLinks : [])
    .filter(link => link && typeof link === "object")
    .map(link => ({
      type: String(link.type || "other").trim(),
      label: String(link.label || "").trim(),
      url: String(link.url || "").trim()
    }))
    .filter(link => HG_LEXICON_LINK_TYPES.has(link.type))
    .filter(link => link.label && isSafeExternalUrl(link.url));
}

function renderLexiconLinks(place) {
  const links = normalizeLexiconLinks(place);

  if (!links.length) {
    return `<p class="hg-muted">Ingen eksterne lenker lagt inn ennå.</p>`;
  }

  return HG_LEXICON_GROUPS
    .map(group => {
      const groupLinks = links.filter(link => group.types.includes(link.type));
      if (!groupLinks.length) return "";

      return `
        <section class="pc-lexicon-group">
          <h3>${hgEsc(group.title)}</h3>
          <div class="pc-lexicon-links">
            ${groupLinks.map(link => `
              <a
                class="pc-lexicon-link pc-lexicon-link-${hgEsc(link.type)}"
                href="${hgEsc(link.url)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>${hgEsc(link.label)}</span>
                <span aria-hidden="true">↗</span>
              </a>
            `).join("")}
          </div>
        </section>
      `;
    })
    .join("");
}
```

## Kodeplassering

Funksjonen bør ligge nær eksisterende PlaceCard-rundinglogikk eller popup-utils, avhengig av hvor leksikonrundingen allerede håndteres. Den skal bruke eksisterende `showPlaceCardRoundPopup` der det passer. Målet er minimal endring: legg til en renderer for `externalLinks`, koble den til leksikonrundingen, og ikke rør resten av PlaceCard-layouten. Hvis leksikonrundingen allerede har en click-handler, skal den handleren bare byttes/utvides til å sende `renderLexiconLinks(place)` inn i runding-popupen.

## Forholdet til place-loading

`externalLinks` er lette data og kan være med i lett place-indeks dersom PlaceCard-rundingen skal kunne åpnes før full place-data er lastet. Hvis appens todelte place-loading gjør at tunge felter lastes senere, må det vurderes om `externalLinks` regnes som lett eller full data. Anbefaling: `externalLinks` er lett nok til å være med i PlaceCard-data, men må ikke dupliseres manuelt. Hvis det finnes en automatisk indeksbygger, skal den hente feltet fra original place-filene. Source of truth skal fortsatt være full place-data.

## Validering

Det bør finnes en enkel dev-sjekk som kan kjøres lokalt senere. Den bør kontrollere at `externalLinks` er array når feltet finnes, at hvert objekt har kjent `type`, `label` og `url`, at URL starter med `https://`, at det ikke finnes åpenbare duplikater, og at ingen label er tom. Denne valideringen skal ikke gjøre automatisk retting. Feil skal rapporteres med place-id og filnavn slik at kilden kan rettes direkte.

Eksempel på ønsket feilmelding:

```text
[lexicon-links] bislett: externalLinks[1].url må være https-url
[lexicon-links] holmenkollen: ukjent type "result"
[lexicon-links] ullevaal_stadion: mangler label i externalLinks[2]
```

## Arbeidsflyt for å legge inn lenker

Når nye lenker legges inn, skal rekkefølgen være: finn riktig place-fil gjennom manifestet, åpne faktisk place-objekt, legg `externalLinks` inn på objektet, test JSON-syntaks, test leksikonrundingen i appen, og kontroller console. Ikke lag midlertidige hardkodede koblinger i JS. Ikke legg inn lenker fra hukommelse hvis de ikke er kontrollert. Ikke legg inn en Wikipedia-lenke bare fordi man antar at siden finnes. Finn siden, kontroller at den gjelder riktig sted, og legg den inn i data.

## Akseptansekriterier

Leksikonrundingen er ferdig nok når disse punktene stemmer: sted med `externalLinks` viser lenkene gruppert og pent; sted uten `externalLinks` gir tomtilstand eller skjuler seksjonen uten feil; lenker åpner eksternt med `target="_blank"` og `rel="noopener noreferrer"`; ugyldige URL-er filtreres bort; Bislett kan vise offisiell side, statistikk/resultatside og Wikipedia; ingen konkrete lenker er hardkodet i JS; ingen quiz-, unlock-, kart-, profil-, Wonderkammer- eller Civication-logikk er endret; console er ren ved åpning og lukking av popup; datafeltet kan brukes på tvers av alle kategorier.

## Ikke gjør dette

Ikke hardkod lenker i `app.js`, PlaceCard-kode eller popup-utils. Ikke opprett egne spesialfelter som `bislettStatsUrl`, `wikiUrl`, `officialUrl` hvis `externalLinks` kan dekke behovet. Ikke bland interne app-ruter og eksterne kilder i samme felt. Ikke la leksikonrundingen gjøre live-søk på Wikipedia, Google, World Athletics eller andre eksterne tjenester i runtime. Ikke legg inn dårlige lenker for å fylle tomrom. Ikke bruk lenker som ikke tydelig handler om stedet. Ikke endre andre rundinger samtidig. Ikke gjør UI-polering som ikke er nødvendig for denne funksjonen.

## Fast regel fremover

Alle nye steder som har en klar offisiell nettside, en relevant statistikk-/dataside eller en relevant Wikipedia-side, bør etter hvert få `externalLinks`. Dette skal skje kuratert og gradvis. Leksikonrundingen skal være et ryddig oppslagsrom, ikke en tilfeldig lenkesamling. Kildearbeidet skal ligge i dataene. Koden skal bare vise det som faktisk finnes.
