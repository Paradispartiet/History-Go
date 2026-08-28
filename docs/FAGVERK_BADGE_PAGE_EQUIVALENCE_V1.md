# Fagverk badge-page equivalence v1

Status: **aktiv Batch C-gate**  
Eier: `fagverk_ia_v3`

## Produktbeslutning

**Merket beholdes. Den separate merkesiden er legacy.**

Badge-data, poeng, nivåer, undermerker og gameplay-konsekvenser forblir canonicale systemer. Faglig innhold skal derimot eies av Fagverket gjennom fag, fagområde, emne, begrep, metode og lærekapittel.

By-modellen med separat `merkeside → teori → fagkart → emneside` skal derfor **ikke** replikeres til alle fag. Den var en forløper til dagens canonicale Fagverk og brukes nå som kilde ved innholdsaudit, ikke som målarkitektur.

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
5. gamle interne lenkemål er kartlagt;
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

By er første `legacy_static_theory`-fag som er fullført gjennom hele equivalence-løpet før redirect:

- **#5432:** deterministisk audit sammenlignet `merke_by.html` og `teori.html` mot canonicalt By-korpus og blokkerte automatisk redirect.
- **#5435:** de eneste eksplisitte kunnskapsgapene, `topografi` og `grunnforhold`, ble migrert kilde- og claimsporet til canonicalt Arkitektur-innhold.
- **#5437:** alle ti kunnskapsseksjoner fikk eksplisitt canonical eier og redaksjonell disposisjon; gammel produkttekst ble eksplisitt pensjonert.

Etter disse tre gatene peker By sitt canonicale `badgePage` til `fagverk.html?subject=by#fagverkIaProgresjon`. Den gamle statiske By-merkesiden beholdes foreløpig som audit- og arkivkilde, men skal ikke lenger være en aktiv produkt- eller navigasjonsflate.

## Ikke redirect ennå

- **Politikk:** `rich_runtime`; emneprogresjon, quizhistorikk, steder, begrepsutforsker og øvrig aktiv legacy-runtime må ha dokumentert equivalence før redirect.
- **Andre fullteorisider:** `legacy_static_theory`; hvert fag må gjennom egen innholdsaudit og eksplisitt adjudisering. By-resultatet er prosessmal, ikke automatisk godkjenning.
- **Tynne legacy-sider:** `legacy_stub`; må gjennom enkel unik-innhold/linkaudit før redirect.
