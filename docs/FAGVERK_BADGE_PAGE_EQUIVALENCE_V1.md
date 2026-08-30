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
- **#5455:** full legacy-teori bevares byte-for-byte i `data/fag/litteratur/archive/merke_litteratur_full_teori_legacy_20260828.html`, `data/fag/litteratur/merke_litteratur (1).html` blir ren compatibility-redirect og canonical `badgePage`/`Alle merker` flyttes til `fagverk.html?subject=litteratur#fagverkIaProgresjon`.

Litteratur-auditene skal etter redirect kun lese arkivfilen. Redirect-wrapperen er en bakoverkompatibel URL, ikke en faglig kilde eller selvstendig produktflate.

### Kunst

Kunst er fjerde `legacy_static_theory`-fag som er ført gjennom hele equivalence-løpet. Kunst-siden hadde ni faglige seksjoner og én separat produktgrense mot Scenekunst:

- **#5457:** deterministisk audit sammenlignet de faktiske ti legacy-seksjonene mot Kunsts fem manifesteide fagfiler og hele det sekskapitlers registry-eide læreverket. `Avgrensning mot Scenekunst` ble korrekt klassifisert som produktgrense eid av `data/categories/category_contract.json`, ikke som et kunstfaglig emne. Auditen isolerte `gatekunst` som eneste unike kunnskapsgap.
- **#5461:** gatekunst, veggmaleri og graffiti ble materialisert i det eksisterende canonicale emnet `em_kunst_offentlig_kunst_monumenter`. Migreringen opprettet ikke et 22. emne eller et sjuende kapittelbegrep; Kunst beholdt 21 emner, seks kapitler og den authored seksbegrepskontrakten. Etter migreringen var legacy-dekningen 9/9 og release-manifestet ble regenerert.
- **#5463:** alle ni kunnskapsseksjoner og produktgrensen fikk eksplisitt adjudisering. Bare `felt` og `offentlig-rom` er `migrated_to_canonical` med #5461 som bevis; de øvrige syv er `canonical_supersedes`. Kunst/Scenekunst-grensen eies fortsatt av category-contracten. Adjudiseringen ble `redirectReady: true` uten å flytte portalruten i samme tranche.
- **#5464:** den gamle Kunst-siden bevares byte-for-byte i `data/fag/kunst/archive/merke_kunst_legacy_20260828.html`, `data/fag/kunst/merke_kunst (2).html` blir compatibility-redirect og canonical `badgePage`/`Alle merker` flyttes til `fagverk.html?subject=kunst#fagverkIaProgresjon`.

Kunst-auditene skal etter redirect bare lese arkivfilen. Compatibility-wrapperen er ikke en faglig kilde, og Kunst/Scenekunst-grensen skal fortsatt eies av category-contracten framfor å materialiseres som et kunstemne.

### Media

Media er femte `legacy_static_theory`-fag som er ført gjennom den komplette fail-closed-prosessen. Den gamle siden har ti kunnskapsseksjoner og én avsluttende produktseksjon (`bidrag`):

- **#5479:** en deterministisk audit sammenlignet alle ti kunnskapsseksjoner mot Media sine fem manifesteide kjernefiler, det migrerte supplementet `populaerkultur_som_mediefelt` og den sekskapitlers registry-grafen. Det rekursive canonicale korpuset var 1 922 034 tegn. Resultatet var 10/10 full ankerdekning, null manuell restanse og dermed ingen bevist innholdsmigrering.
- **#5481:** alle ti kunnskapsseksjoner fikk eksplisitte canonicale eiere og `canonical_supersedes`; ingen seksjon ble markert `migrated_to_canonical`. `bidrag` ble pensjonert som legacy-produkttekst uten kunstig kunnskapseier. Adjudiseringsgaten ble `redirectReady: true` mens portalruten fortsatt pekte til legacy-siden.
- **#5482:** original fullteori bevares byte-for-byte i `data/fag/media/archive/merke_media_full_teori_legacy_20260829.html` med original Git-blob `79f7dfe5141c395e19a38bcb80f5948ac11c33b9`. `data/fag/media/merke_media.html` blir ren compatibility-redirect, mens canonical `badgePage` og `Alle merker` flyttes til `fagverk.html?subject=media#fagverkIaProgresjon`.

Media-auditene leser etter route-retirement bare arkivfilen. Den rå anker-auditen forblir med vilje `redirectReady: false`; bare den eksplisitte adjudiseringsgaten kan autorisere ruten. Ingen Media-emner, metoder, kapitler, claims, kilder eller gameplaydata ble endret i equivalence-løpet.

### Musikk

Musikk er sjette `legacy_static_theory`-fag som er ført gjennom hele equivalence-løpet. Den gamle siden har åtte faglige seksjoner, men inneholder også to produktgrenser som må holdes utenfor kunnskapsmodellen:

- **#5484:** den deterministiske auditen sammenlignet alle åtte seksjoner mot Musikk sine fire manifesteide v4.5-kjernefiler, den canonicale vitenskapspakken og åtte registry-kapitler med 96 kapittel-/evidensfiler. Det normaliserte canonicale korpuset var 1 148 237 tegn. Etter å ha tatt med hele manifestkjernen var dekningen 8/8 med null manuell restanse og null bevist kunnskapsgap. Legacy-frasen om sekundærbadge ble isolert som produktmekanikk, ikke som faglig innhold.
- **#5489:** alle åtte kunnskapsseksjoner fikk eksplisitte canonicale eiere og `canonical_supersedes`, med null migreringer. `Utøvelse` beholder Musikk/Scenekunst-grensen som produktgrense, og `Musikk og samfunn` beholder `secondary_badge_routing` som produktmekanikk; begge eies av `data/categories/category_contract.json` kun som produktregler, aldri som Musikk-kunnskapskilde. Adjudiseringsgaten ble `redirectReady: true` mens portalruten fortsatt var legacy.
- **#5490:** original fullteori bevares byte-for-byte i `data/fag/musikk/archive/merke_musikk_full_teori_legacy_20260829.html` med original Git-blob `4332f0292777e82d1dddbc05d58ef4651ae88774`. `data/fag/musikk/merke_musikk (1).html` blir ren compatibility-redirect, mens canonical `badgePage` og `Alle merker` flyttes til `fagverk.html?subject=musikk#fagverkIaProgresjon`.

Musikk-auditene skal etter route-retirement bare lese arkivfilen. Den rå anker-auditen forblir `redirectReady: false`; den eksplisitte adjudiseringsgaten låser både 8/8 kunnskapseierskap og de to produktgrensene før den kan godkjenne ruten. Ingen Musikk-emner, metoder, kapitler, claims, kilder eller gameplaydata ble endret i equivalence-løpet.

### Næringsliv

Næringsliv er sjuende `legacy_static_theory`-fag som er ført gjennom hele equivalence-løpet. Den gamle siden har ti kunnskapsseksjoner og én avsluttende produktseksjon (`bidrag`):

- **#5491:** en deterministisk audit sammenlignet de ti kunnskapsseksjonene mot Næringslivs manifesteide fagfiler og det tolvs-kapitlers registry-eide læreverket. To rå ordformsavvik — `profesjonalitet` og `offshoring/globalisering` — ble eksplisitt kontrollert mot eksisterende canonical dekning av profesjoner, kompetanse og yrkesmessig skjønn, samt internasjonal økonomi, internasjonal handel og globale verdikjeder. De var ikke nye kunnskapsgap, og ingen canonical fagdata ble endret.
- **#5492:** alle ti kunnskapsseksjoner fikk eksplisitte canonicale eiere og `canonical_supersedes`, med null migreringer. `bidrag` ble pensjonert som legacy-produkttekst uten kunstig kunnskapseier. Adjudiseringsgaten ble `redirectReady: true` mens portalruten fortsatt var legacy.
- **#5493:** original fullteori bevares byte-for-byte i `data/fag/naeringsliv/archive/merke_naeringsliv_full_teori_legacy_20260829.html` med original Git-blob `2448e80e92774549f3f34ccb7082df1d0978bee7`. `data/fag/naeringsliv/merke_naeringsliv (1).html` blir ren compatibility-redirect, mens canonical `badgePage` og `Alle merker` flyttes til `fagverk.html?subject=naeringsliv#fagverkIaProgresjon`.

Næringsliv-auditene skal etter route-retirement bare lese arkivfilen. Den rå anker-auditen forblir `redirectReady: false`; bare den eksplisitte adjudiseringsgaten kan autorisere ruten. Ingen Næringsliv-emner, metoder, kapitler, claims, kilder eller gameplaydata ble endret i equivalence-løpet.

### Natur

Natur er åttende `legacy_static_theory`-fag som er ført gjennom den komplette fail-closed-prosessen. Legacy-siden har seks innholdsblokker: fem bærer faglig kunnskap, mens `status` er et statisk produktsammendrag. I tillegg inneholder siden fire produktmekanikker og én kategorigrense som eksplisitt holdes utenfor kunnskapseierskapet:

- **#5495:** den deterministiske råauditen sammenlignet de fem kunnskapsseksjonene mot fem manifesteide Natur-kjernefiler og tolv registry-kapitler. Den rekursive canonicale flaten målte 7 manifestgraf-filer, 12 registry-graffiler og 1 208 632 normaliserte tegn. Resultatet var 5/5 full ankerdekning, 0 manuelle restanser, 16 badge-nivåer og 88 undermerker. Auditen isolerte fire produktmekanikker og `nature_assignment_requires_scientific_entry` som produktgrense og forble med vilje `redirectReady: false`.
- **#5496:** den eneste reelle mangelen lå i produktkontrakten, ikke i Natur-faget. `data/categories/category_contract.json#decisions.natur` ble canonical eier for regelen om at Natur krever en konkret, dokumenterbar naturfaglig inngang og ikke tildeles bare fordi et sted er grønt, vakkert eller utendørs. Ingen Natur-emner, metoder, kapitler, claims eller kilder ble endret.
- **#5498:** alle fem kunnskapsseksjoner fikk eksplisitte canonicale eiere og `canonical_supersedes`, med **0 faglige migreringer**. `status` ble `retire_legacy_product_summary`; `badge_activity_progress` og `integrated_progression_route` beholdes hos eksisterende canonical produktflater, mens `subject_completion_snapshot` og `subject_inventory_snapshot` pensjoneres som statiske legacy-snapshots. Produktgrensen bindes eksplisitt til #5496. Adjudiseringsgaten ble `redirectReady: true` uten å omskrive category-contracten.
- **#5499:** original legacy-side bevares byte-for-byte i `data/fag/natur/archive/merke_natur_full_teori_legacy_20260829.html` med original Git-blob `719b94ae2eed2bfd11e3748a6bdcff76eb917594`. `data/fag/natur/merke_natur (1).html` blir ren compatibility-redirect, mens canonical `badgePage` og `Alle merker` flyttes til `fagverk.html?subject=natur#fagverkIaProgresjon`.

Natur-auditene skal etter route-retirement bare lese arkivfilen. Den rå anker-auditen forblir `redirectReady: false`, mens adjudiseringsgaten krever bevart arkiv, ren compatibility-wrapper og canonical progresjonsrute. Ingen Natur-emner, metoder, kapitler, claims, kilder, badge tiers, undermerker, gameplay- eller progresjonsdata ble endret i route-retirement.

### Religion

Religion er et `legacy_stub`-fag og trenger derfor ikke fullteori-prosessen:

- **#5466/#5469:** den gamle stubben ble kontrollert for unik tekst, runtime og lenker. Den har ingen egen progresjonslogikk, quiz, emnekatalog eller faglig detaljflate. Fagbeskrivelsen er allerede dekket av canonical badge-, registry- og universitetsmateriale, blant annet kildebasert/respektfull behandling, skillet mellom dokumentert observasjon og antakelser om tro og at religiøse tradisjoner er internt mangfoldige.
- Den gamle formuleringen `4 fagområder / 8 emner / 8 metoder` klassifiseres som `legacy_product_summary`, ikke som kunnskapsinnhold som skal kopieres. Fagverkets runtime eier tellingene.
- Originalstubben bevares byte-for-byte i `data/fag/religion/archive/merke_religion_legacy_20260828.html` med original Git-blob `fa4cdd97372ce1d2fd90f2a0712bf2458b1f42a4`. `data/fag/religion/merke_religion.html` er kun compatibility-redirect, mens canonical `badgePage` og `Alle merker` går til `fagverk.html?subject=religion#fagverkIaProgresjon`.

Religion viser at `legacy_stub` kan pensjoneres i én tranche når en permanent audit beviser at siden ikke bærer unik kunnskap eller funksjon.

### Scenekunst

Scenekunst er andre `legacy_stub`-fag og følger samme smale pensjoneringsregel:

- **#5471:** den gamle stubben ble kontrollert mot badge, category-contract, de fire manifesteide kjernefilene og registry. Alle begrepene i den korte ingressen — teater, dans, musikal/musikkteater, revy, standup, improvisasjon, scenografi, regi, dramaturgi og levende fremføring/performance — har allerede canonical eier. Det finnes ingen separat runtime eller faglig detaljflate på stubben.
- Originalstubben bevares byte-for-byte i `data/fag/scenekunst/archive/merke_scenekunst_legacy_20260829.html` med original Git-blob `cb51d4c8788df292e715dade7a8b9c44ccf6d7f4`.
- `data/fag/scenekunst/merke_scenekunst.html` er kun compatibility-redirect, mens canonical `badgePage` og `Alle merker` går til `fagverk.html?subject=scenekunst#fagverkIaProgresjon`.
- Den eksisterende Scenekunst Phase 3-porten er reconcilet slik at den kontrollerer canonical Progresjon-rute, ren compatibility-wrapper og bevart arkiv i stedet for å kreve gammel produkttekst på aktiv URL.

Ingen Scenekunst-emner, metoder, kapitler, claims eller kilder ble endret for å pensjonere stubben.

### Politikk

Politikk var det siste `rich_runtime`-faget. Den separate portalen kombinerte gameplay og canonical faginnhold, men bar ingen egen kunnskapssannhet:

- Fagverkets eksisterende generelle motor eide allerede 13 fagområder, 123 emner, 13 redigerte kapitler og det søkbare registeret med 962 forklarte begreper.
- De avgrensede funksjonsgapene er flyttet til de relevante fem flatene: detaljert quizhistorikk og merkeprofil i **Progresjon**, besøksstatus per sted i **Utforsk**, og canonicale undermerkenavn/-fagområder i den felles badgekomponenten.
- `scripts/audit-fagverk-politikk-runtime-equivalence.mjs` binder hvert legacy-funksjonsområde til en aktiv Fagverk-eier, krever at den politikkspesifikke portal-JS/CSS-en er fjernet og verifiserer hele ruten fail-closed.
- Originalportalen er bevart byte-for-byte i `data/fag/politikk/archive/merke_politikk_rich_runtime_legacy_20260830.html` med Git-blob `9529684894ff913bc350f64b2a553b0288c7abff`. Den gamle URL-en er kun compatibility-redirect, mens canonical `badgePage` og `Alle merker` går direkte til `fagverk.html?subject=politikk#fagverkIaProgresjon`.

Politikkens øvrige compatibility-modell beholdes for kart-, sted- og popupflater, men peker nå til integrert Fagverk. Den generelle fagsiden laster fortsatt ingen politikkspesifikk modell eller fallback.

### Felles merkeindeks

Den separate statiske indeksen `merker/merker.html` bar ingen unik kunnskap eller runtime. Den var dessuten ufullstendig mot de 19 canonicale fagene og løftet legacy-aliaset Populærkultur som en egen merke-kategori i strid med category-contracten.

- Originalindeksen er bevart byte-for-byte i `merker/archive/merker_index_legacy_20260830.html` med Git-blob `bb0cf746552d671d4341da198c210b41bacc55d1`.
- Den gamle URL-en er en ren compatibility-redirect til `fagverk-forside.html`.
- Profilens merkebibliotek eier det brukeren faktisk har oppnådd; Fagverkforsiden eier utforsking av alle 19 fag og integrerte merker.
- Badge-equivalence-testen låser arkivhash, redirect, aktive innlenker og fravær av den gamle kortgriden på aktiv URL.

## Ikke redirect ennå

- **Andre fullteorisider:** `legacy_static_theory`; hvert fag må gjennom egen innholdsaudit og eksplisitt adjudisering. By, Historie, Litteratur, Kunst, Media, Musikk, Næringsliv og Natur er prosessbevis, ikke automatisk godkjenning av resten.
- **Tynne legacy-sider:** `legacy_stub`; Religion og Scenekunst er eksplisitt pensjonert; øvrige stubber må fortsatt gjennom egen unik-innhold/linkaudit før redirect.
