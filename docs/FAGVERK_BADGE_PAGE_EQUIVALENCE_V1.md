# Fagverk badge-page equivalence v1

Status: **aktiv Batch C-gate**  
Eier: `fagverk_ia_v3`

## Produktbeslutning

**Merket beholdes. Den separate merkesiden er legacy.**

Badge-data, poeng, nivåer, undermerker og gameplay-konsekvenser forblir canonicale systemer. Faglig innhold skal derimot eies av Fagverket gjennom fag, fagområde, emne, begrep, metode og lærekapittel.

Den gamle modellen med separat `merkeside → teori → fagkart → emneside` skal derfor **ikke** replikeres til alle fag. Den var en forløper til dagens canonicale Fagverk og brukes nå som kilde ved innholdsaudit, ikke som målarkitektur.

## Equivalence-familier

`scripts/audit-fagverk-badge-equivalence.mjs` klassifiserer hvert canonicalt `badgePage`-mål:

- `progress_route` — allerede migrert til `fagverk.html?subject=<id>#fagverkIaProgresjon`.
- `rich_runtime` — aktiv legacy-funksjonalitet må flyttes før redirect. Politikk er canonicalt eksempel.
- `legacy_static_theory` — gammel faglig teori må sammenlignes med canonical fagdata før redirect.
- `legacy_stub` — tynn legacy-side; kontroller at den ikke bærer unik kunnskap eller funksjon før redirect.

Ingen `unknown` eller `missing` familie er tillatt.

## Redirect-gate

Et fag kan først flyttes fra legacy `badgePage` til Progresjon når alle relevante punkter er bevist:

1. badgeidentitet, poeng, nåværende nivå og nivåstige finnes i Fagverkets Progresjon;
2. undermerker finnes i Progresjon når badgekilden eier dem;
3. unik gyldig faglig tekst er enten allerede canonical eller migrert til riktig faglig eier;
4. aktiv emne-/begreps-/quiz-/stedfunksjonalitet er erstattet der den faktisk finnes;
5. gamle interne lenkemål er kartlagt eller compatibility-redirectet;
6. permanent audit/test er grønn.

Redirect skal peke til:

```text
fagverk.html?subject=<subject_id>#fagverkIaProgresjon
```

## Migrerte fag

### Helse og Utdanning

Helse og Utdanning brukte bare den generiske `merke.html`-fallbacken med badgeidentitet, poeng/nivå og nivåstige. Disse funksjonene er flyttet inn i Fagverkets Progresjon, og portalrutene går direkte dit.

`merke.html?badge=<id>` beholdes som compatibility-URL og redirecter fail-closed til materialisert fag + Progresjon.

### By & arkitektur

By er første `legacy_static_theory`-fag som ble fullført gjennom hele equivalence-løpet før redirect:

- **#5432:** deterministisk audit sammenlignet `merke_by.html` og `teori.html` mot canonicalt By-korpus og blokkerte automatisk redirect.
- **#5435:** de eneste eksplisitte kunnskapsgapene, `topografi` og `grunnforhold`, ble migrert kilde- og claimsporet til canonicalt Arkitektur-innhold.
- **#5437:** alle ti kunnskapsseksjoner fikk eksplisitt canonical eier og redaksjonell disposisjon; gammel produkttekst ble eksplisitt pensjonert.
- **#5440:** canonical `badgePage` ble flyttet til `fagverk.html?subject=by#fagverkIaProgresjon`, og migreringen ble låst med permanente regresjonsporter.

Den gamle statiske By-merkesiden beholdes foreløpig som audit- og arkivkilde, men er ikke lenger en aktiv produkt- eller navigasjonsflate.

### Historie

Historie er andre fullteorifag som er ført gjennom samme fail-closed prosess, uten å kopiere legacy-prosa inn i det canonicale læreverket:

- **#5441:** en deterministisk audit sammenlignet alle ti kunnskapsseksjoner på den gamle Historie-merkesiden mot det manifesteide og registry-eide Historie-korpuset. Etter redaksjonell synonymkontroll var dekningen 10/10. Legacy-termen `diskontinuitet` ble dokumentert som samme faglige innhold som det allerede canonicale og operasjonaliserte begrepet **Brudd**, ikke som et nytt duplikatbegrep.
- **#5443:** alle ti seksjoner fikk eksplisitte canonicale eiere og `canonical_supersedes`; `bidrag` ble pensjonert som gammel produkttekst. Adjudiseringen ble `redirectReady: true`, mens portalruten fortsatt var låst til legacy-siden i denne fasen.
- **#5444:** den fullstendige legacy-teorien er bevart byte-for-byte i `data/fag/historie/archive/merke_historie_full_teori_legacy_20260828.html`. Den gamle URL-en `data/fag/historie/merke_historie (1).html` er kun en compatibility-redirect, mens canonical `badgePage` og `Alle merker` går direkte til `fagverk.html?subject=historie#fagverkIaProgresjon`.

Historie-auditene leser arkivfilen, ikke redirect-wrapperen. Dermed kan gammel teori fortsatt etterprøves, samtidig som ingen aktiv navigasjonsflate bruker den som produktinnhold. Compatibility-URL-en er kun en bakoverkompatibel inngang og skal aldri igjen få eget faginnhold eller progresjonsruntime.

### Litteratur

Litteratur er tredje fullteorifag som er ført gjennom samme fail-closed prosess, men med en annen canonical eiermodell enn Historie:

- **#5451:** deterministisk audit identifiserte alle elleve legacy-seksjoner og sammenlignet ti kunnskapsseksjoner mot Litteraturs manifesteide vitenskapspakke. Litteratur har ikke registry-eide fagkapitler (`chapterCount: 0` i general-engine), så auditen skal ikke finne på registry-eierskap. Det rekursive canonicale korpuset var 2,81 millioner tegn og endte med 10/10 ankerdekning og null manuell restanse.
- Den eneste innledende restansen, legacy-formuleringen `språkendring/språkhistorie`, ble redaksjonelt bundet til eksisterende canonical dekning av historiske og institusjonelle skriftspråk, målreisning, normering og normalisering. Det ble ikke opprettet et nytt duplikatbegrep.
- **#5453:** alle ti kunnskapsseksjoner fikk eksplisitte eiere i den canonicale vitenskapspakken og `canonical_supersedes`; `bidrag` ble pensjonert som gammel produkttekst. Ingen seksjon ble feilaktig markert som migrert innhold.
- Redirect-tranchen bevarer full legacy-teori byte-for-byte i `data/fag/litteratur/archive/merke_litteratur_full_teori_legacy_20260828.html`, gjør `data/fag/litteratur/merke_litteratur (1).html` til ren compatibility-redirect og flytter canonical `badgePage`/`Alle merker` til `fagverk.html?subject=litteratur#fagverkIaProgresjon`.

Litteratur-auditene skal etter redirect kun lese arkivfilen. Redirect-wrapperen er en bakoverkompatibel URL, ikke en faglig kilde eller selvstendig produktflate.

## Ikke redirect ennå

- **Politikk:** `rich_runtime`; emneprogresjon, quizhistorikk, steder, begrepsutforsker og øvrig aktiv legacy-runtime må ha dokumentert equivalence før redirect.
- **Andre fullteorisider:** `legacy_static_theory`; hvert fag må gjennom egen innholdsaudit og eksplisitt adjudisering. By, Historie og Litteratur er prosessbevis, ikke automatisk godkjenning av resten.
- **Tynne legacy-sider:** `legacy_stub`; må gjennom enkel unik-innhold/linkaudit før redirect.
