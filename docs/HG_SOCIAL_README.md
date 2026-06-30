# HG Social / Social Meet README

Dette dokumentet er den kanoniske oversikten for Social Meet-laget i History Go. Det samler begrepene som tidligere lå spredt mellom HG Social, Social Meet, meet invites, demo mode og HG Spotmeeting.

## 1. Kort konklusjon

**HG Social / Social Meet** er hovedsystemet.

**HG Spotmeeting** er én konkret møteflyt inne i Social Meet.

```text
HG Social / Social Meet
  ├─ Public learning profile
  ├─ Knowledge matches
  ├─ Meet invites
  ├─ Confirmed meets
  ├─ Learning circles
  ├─ Shared routes / quizzes / observations
  └─ HG Spotmeeting
       └─ Manuell, privat, preset-basert møteforespørsel rundt et History Go-sted,
          en rute, en quiz, en observasjon, et tema eller en sirkel.
```

Social Meet må derfor ikke forstås som en ren lokasjonsfunksjon. Det er et kunnskapsbasert sosialt lag.

Spotmeeting må ikke forstås som et separat sosialt produkt. Det er den produktifiserte møteforespørselen i Social Meet.

## 2. Produktordliste

| Begrep | Betydning | Status |
| --- | --- | --- |
| **HG Social** | Teknisk/arkitektonisk navn på det sosiale kunnskapslaget. | Finnes som backend-ready lokal/demo social layer. |
| **Social Meet** | Brukerrettet produktnavn for den sosiale møteflaten i profilen. | Finnes som profilfane. |
| **Knowledge Match** | Forslag basert på felles temaer, konsepter, ruter, quizinteresser og læringssignaler. | Lokal/demo/read-model. |
| **Meet Invite** | Generell invitasjon mellom brukere som eksplisitt velger å møtes eller samarbeide. | Del av HG Social. |
| **Confirmed Meet** | Privat avtalt møte etter eksplisitt aksept fra deltakerne. | Del av HG Social. |
| **Learning Circle** | Liten gruppe rundt tema, rute, sted, quiz eller læringsmål. | Del av HG Social/demo. |
| **HG Spotmeeting** | Konkret, manuell møteforespørsel rundt sted/rute/quiz/observasjon/tema/sirkel. | Finnes som `window.HG_Spotmeeting`; produksjonsdiscovery ikke backend-enabled. |
| **Social privacy settings** | Synlighet, matchlister, invitasjoner, sirkelinvitasjoner og sosial reputasjon. | Skal ligge under innstillinger, ikke dominere profilforsiden. |

## 3. Hovedregel

History Go Social er:

- kunnskapsbasert;
- manuelt initiert;
- forklarbart;
- privat som standard;
- bygd rundt læring, steder, temaer, ruter, quiz og observasjoner.

History Go Social er ikke:

- sosialt medium;
- datingapp;
- follower-graph;
- live presence;
- public feed;
- nearby-people discovery;
- GPS-basert møteapp.

## 4. Hva Social Meet gjør

Social Meet skal gi spilleren en sosial inngang til History Go uten å gjøre appen til overvåkning eller sosiale medier.

Social Meet kan vise:

- egen offentlig læringsprofil hvis brukeren har valgt det;
- kunnskapsmatcher;
- innkommende og utgående meet-invites;
- spotmeeting-forslag og spotmeeting-inbox;
- avtalte møter;
- læringssirkler;
- privat sosial læringshistorikk;
- demo/smoke-test-flater i testmodus.

Social Meet skal forklare hvorfor noe vises:

- felles tema;
- samme ruteinteresse;
- overlappende quizfelt;
- samme historiske periode;
- felles begreper;
- samme læringssirkel;
- kompatible læringsmål.

## 5. Hva Spotmeeting gjør

HG Spotmeeting er møteflyten for konkrete, trygge kunnskapsmøter.

En spotmeeting er:

- manuelt startet av bruker;
- knyttet til én tydelig kontekst;
- preset-message-only;
- privat som standard;
- avbrytbar;
- mulig å avslå;
- mulig å blokkere/rapportere;
- uten fritekstchat;
- uten live-posisjon.

Tillatte `contextType`-verdier:

```text
place
quiz
route
observation
topic
circle
```

Alle context-objekter skal ha:

```text
contextType
contextId
title
reason
sourceSurface
```

Eksempel:

```js
{
  contextType: "place",
  contextId: "sofienbergparken_subkultur",
  title: "Sofienbergparken",
  reason: "Deler interesse for subkultur og byhistorie",
  sourceSurface: "placeCard"
}
```

## 6. Hvordan de fungerer sammen i UI

### Profilside

Profilen skal ha Social Meet som egen fane.

Social Meet-fanen kan inneholde:

```text
Social Meet
  - MiniProfile / public learning profile preview
  - Knowledge matches
  - Meet invite inbox
  - Spotmeeting inbox
  - Confirmed meets
  - Social progression
  - Learning circles
  - Circle activity
  - Social history
  - Smoke/debug panel only in TEST_MODE
```

Personvern skal ikke ligge først på profilsiden. Det skal være tilgjengelig via innstillinger / profilvalg:

```text
Profilforside
  - enkel status / snarvei
  - ikke stor privacy-stack

Profilinnstillinger
  - public profile
  - visible in match lists
  - allow meet invites
  - allow circle invites
  - show social reputation
```

### PlaceCard

PlaceCard kan vise en Spotmeeting-inngang når konteksten er trygg:

```text
PlaceCard
  - "Foreslå kunnskapsmøte"
  - viser relevante demo/knowledge matches i TEST_MODE
  - sender preset-melding
  - skriver til spotmeeting inbox
```

PlaceCard må ikke vise nearby people, live users, distance, last seen eller GPS-baserte signaler.

### Min dag / NextUp

Min dag kan rute til Social Meet eller Spotmeeting som safe action, men skal ikke opprette møter automatisk.

Tillatt:

```text
"Du har et kunnskapsmøte som venter på svar"
"Åpne Social Meet"
"Se læringssirkel"
```

Ikke tillatt:

```text
"Personer i nærheten vil møte deg"
"Noen var nettopp her"
"Send automatisk invitasjon"
```

## 7. Produksjon vs demo

### Produksjon nå

`window.HG_Spotmeeting` finnes.

Spotmeeting kan validere context, preset-meldinger, privacy-regler, inbox og lifecycle lokalt.

Ekte produksjonsdiscovery er ikke aktivert. Uten testmodus skal discovery varsle `backend_not_enabled`.

### TEST_MODE / demo

I `HG_TEST_MODE` / demo kan systemet bruke seedede HG Social-demo-profiler og demo-kandidater for QA.

Demo må aldri:

- skrive demo-brukere inn i `PEOPLE`;
- late som ekte backend-discovery finnes;
- lagre produksjonsbrukere;
- eksponere GPS/live-posisjon;
- skape ekte sosial graf.

## 8. Privacy defaults

Standardregler:

```text
Public Profile: ON
Visible in Match Lists: OFF
Allow Meet Invites: OFF
Allow Circle Invites: OFF
Show Social Reputation: OFF
```

Dette betyr:

- brukeren kan ha en enkel offentlig læringsprofil;
- brukeren blir ikke automatisk synlig i matchlister;
- brukeren kan ikke automatisk motta møteinvitasjoner;
- sirkelinvitasjoner krever eksplisitt opt-in;
- sosial reputasjon vises ikke offentlig uten valg.

## 9. Forbudte felt og signaler

HG Social og HG Spotmeeting må aldri bruke eller eksponere:

```text
gps
latitude
longitude
coords
location
liveLocation
distance
nearby
nearbyPeople
visitHistory
visitedPlaces
publicVisitHistory
lastSeen
onlineNow
presence
followers
following
publicActivityFeed
feed
chat
freeText
activityTimestamp
```

Merk: planlagt møtecontext kan inneholde et History Go-sted som valgt møtepunkt, men ikke brukerens nåværende posisjon.

Riktig:

```text
"Møtes rundt Sofienbergparken som History Go-sted en dag?"
```

Feil:

```text
"Du er 140 meter fra Anna nå. Send møteforespørsel?"
```

## 10. Spotmeeting lifecycle

```text
1. Bruker åpner en Spotmeeting-surface manuelt.
2. Systemet validerer context.
3. Systemet finner trygge knowledge/activity suggestions.
4. Bruker velger mottaker.
5. Bruker velger preset-melding.
6. Invite opprettes som privat pending invite.
7. Mottaker kan godta eller avslå.
8. Avsender kan avbryte.
9. Akseptert møte kan markeres gjennomført én gang.
10. Blokkering/rapportering skal stoppe videre synlighet.
```

Statusverdier:

```text
pending
accepted
completed
declined
cancelled
```

## 11. Preset-meldinger

Spotmeeting v1 bruker bare forhåndsvalgte meldinger.

Eksempler:

```text
Vil du ta denne quizen sammen?
Vil du gå denne ruten en dag?
Vil du sammenligne hva vi har lært om dette stedet?
Vil du gjøre en felles observasjon her?
Vil du møtes rundt dette temaet?
```

Ingen fritekstchat i v1.

## 12. Backend-krav før ekte sosial discovery

Før produksjonsdiscovery aktiveres, må backend ha:

- autentisert nåværende bruker;
- eksplisitt opt-in for offentlig profil/read-model;
- context-bound invite API;
- preset message IDs only;
- accept/decline/cancel/block/report endpoints;
- moderasjonslogikk;
- blokkering med mutual invisibility;
- retention/deletion policy;
- ingen live-location-primitiver;
- ingen nearby-user-primitiver;
- ingen follower/feed/chat-primitiver.

## 13. Praktisk arkitektur nå

Relevante filer:

```text
docs/HG_SOCIAL_README.md              # denne filen
docs/HG_SOCIAL_ARCHITECTURE.md        # arkitektur og prinsipper
docs/HG_SOCIAL_PRIVACY_RULES.md       # privacy defaults og blokkering
docs/HG_SOCIAL_QA.md                  # QA og privacy guards
docs/HG_SOCIAL_DEMO_MODE.md           # demo mode og smoke tests
docs/HG_SOCIAL_BACKEND_CONTRACT.md    # fremtidig backend-kontrakt
docs/HG_SPOTMEETING.md                # spotmeeting-spesifikasjon
js/social/HGSpotmeeting.js            # spotmeeting runtime
js/social/HGSpotmeetingPlaceCardDemo.js
js/hgSocialGuards.js
js/hgSocialPrivacy.ts
js/hgModeration.ts
js/hgSocialDemoData.js
js/hgSocialSmokePanel.js
profile.html
css/profile.css
```

Viktige globale runtime-punkter:

```text
window.HG_Spotmeeting
window.HG_SocialGuards
window.HG_SocialDemo
window.HG_SocialDemoAdapter
```

## 14. UI-regel: ikke bland settings og sosial opplevelse

Social Meet-fanen skal vise sosial læring og møteflyt.

Personverninnstillinger skal ligge i innstillinger/profilvalg og kan lenkes fra Social Meet.

Riktig struktur:

```text
Profil
  Oversikt
  Samling
  Merker
  Kunnskap
  Spill
  Social Meet
  Profilvalg

Social Meet
  - matches
  - inbox
  - spotmeeting
  - circles
  - history
  - kort personvern-hint + lenke til innstillinger

Profilvalg / innstillinger
  - full Social Meet privacy stack
```

Feil struktur:

```text
Profilforside
  - stor privacy-stack først
  - demo/debug før brukerens egen profil
  - uklart skille mellom Social Meet og Spotmeeting
```

## 15. Akseptansekriterier

Social Meet er riktig koblet når:

- Social Meet har egen profilfane;
- Spotmeeting vises som en del av Social Meet, ikke som eget konkurrerende system;
- personvern ligger i innstillinger, med kort hint i Social Meet;
- PlaceCard kan åpne Spotmeeting uten GPS/live/nearby-signaler;
- produksjon returnerer `backend_not_enabled` for ekte discovery;
- TEST_MODE kan vise demo-kandidater;
- demo-brukere lekker ikke til `PEOPLE`;
- smoke tests dekker profile tab, runtime health og spotmeeting inbox;
- forbidden fields stoppes av privacy guards.

## 16. Produktbeslutning

Bruk disse ordene fremover:

```text
Social Meet = brukerrettet navn på sosial fane/opplevelse.
HG Social = teknisk/arkitektonisk navn på sosialt kunnskapslag.
Spotmeeting = konkret møteforespørsel rundt et History Go-objekt eller tema.
```

Der det er plassmangel i UI:

```text
Fane: Social Meet
Kort: Spotmeeting
Teknisk docs/kode: HG Social / HG Spotmeeting
```

## 17. Ikke bygg dette ennå

Ikke legg til:

- fri chat;
- live kart over folk;
- nearby users;
- follower/following;
- public activity feed;
- distance ranking;
- last seen;
- automatisk invitasjon;
- sosial scoring som offentlig popularitet.

Først må Social Meet være ryddig, personverntrygt og forståelig som en kunnskapsbasert møtefunksjon.
