# VG-huset – Akersgata 55 | source review og produksjonsprofil v1

Dato: 2026-10-09  
Canonical place ID: `vg_huset`  
Kilde: `data/places/media/oslo/places_oslo_media/vg_huset.json`  
Status: **SOURCE REVIEW / produksjon ikke sluttført**  
Branch-baseline: `e209a13b645a590f26af91490c63b2115777bab6`

## 1. READ-FIRST og prior-work gate

Lest på `main`: `AGENTS.md`, `docs/PLACE_PRODUCTION_CHECKLIST.md`, `docs/PLACE_PRODUCTION_CHECKLIST_REFERENCE_V1.md`, `docs/PLACE_PRODUCTION_PROFILES.md`, `data/places/README_place_rounds.md`, `data/badges/index.json`, `data/badges/place_production_routing_v1.json`, `data/badges/media.json`, `docs/PLACE_OBJECTS_CANONICAL.md`, `data/brands/brand_rules_v1_1.json`, samt `docs/PLACE_PRODUCTION_PRIOR_WORK_GATE.md` og `docs/PLACE_PRODUCTION_V3.md`.

Kategoriruting: hovedbadge `media` («Medier»). Media-kategorien undersøker People, Objects, Brands og Productions («Utgivelser og sendinger»); særskilte forskningstema: publikasjoner, redaktører, redaksjonshistorie, medieteknologi, medieidentitet og offentlighet. Dette er **kandidater**, ikke fire obligatoriske utfyllingsfelt.

Tidligere arbeid:
- #4253: `desc` og `popupDesc` for VG-huset ble ferdigstilt som media-stedtekst. **Behold** teksten inntil en konkret historisk eller redaksjonell korreksjon er begrunnet.
- #2170 / #2087 / #2089: kontroll av adressekoordinater; dagens kilde har `verified`, `display_marker`, `geonorge_adresser_v1` og adressereferanse. **Behold** koordinat, radius og provenance inntil en faktisk feil er dokumentert.
- #457, #537 og #6144: eksisterende People-koblinger og rettingen av Trine Eilertsen til det fysiske Akersgata-55-ankeret. **Ikke reverser** rettelsen. Aftenpostens Akersgata-51-periode forblir separat.
- #876/#892: eksisterende Story `st_vg_huset_tabloid_digital_dognrytme_1994` finnes i `data/stories/stories_vg_huset.json`; evaluér denne før ny Story.
- `data/quiz/media/vg_huset_sets.json`: seks registrerte sett med tre spørsmål hver. **Eksisterer, men ikke ekvivalent med attestert fullført moderne quizproduksjon**. En quizfaglig audit må kontrollere ekstern source→claim-dekning, quizprofil, Knowledge-synk og faktisk runtime. Quiz produseres i eget løp, i tråd med gjeldende checklist.
- `data/brands/brands_master.json`: `vg` finnes som Brand i `borderline`-status; ingen `vg_huset`-kobling i `brands_by_place.json`. Krav om konkret identitet, logo, proveniens og rettigheter gjelder før Brands kan få PASS.
- `data/fagverk/fagverk_registry.json` har ingen stedsspesifikk `vg_huset`-innføring. Kildestedet har ingen `fagverk`-blokk, `underbadge_ids`, `image`, `frontImage` eller `place_card_profile`. Ingen eksisterende `vg_huset`-factuality- eller workflow-fil ble funnet i `data/places/production/` eller `data/places/workflow/`; ingen egen VG QuizCard-fil eller Språkleksikonfil funnet i tilsvarende Oslo-/Media-kataloger.
- #6153 fullførte Aftenpostens separate Akersgata-51-sted. Dette arbeidet skal ikke flyttes, kopieres eller regnes som dekning for `vg_huset`.

Beslutning: **REELT NYTT ARBEID** for kildebundet historie/Fagverk/PlaceCard-bilder/produksjonsstatus. **ALLEREDE FERDIG / BEHOLD** for eksisterende adresseanker og separate historiske nabosteder. Individuelle tidligere People/Story/quiz-artefakter skal kvalitetskontrolleres før eventuell endring.

Denne rapporten er ikke det genererte V3-workcardet. `scripts/place-production-rule-preflight.mjs record` skal kjøres mot oppdatert branch og registrere regelfil-hasher i korrekt workflow/projeksjon **før** endelig fullproduksjonsarbeidskort markeres klart. Ikke håndrediger V3-projeksjoner.

## 2. Own-place-grense og kildekontrollerte påstander

**Fysisk scope:** tomten og bygningen i Akersgata 55, Oslo; historiske hendelser på tomten kan inngå når de uttrykkelig plasseres **før dagens bygning**, men VG ble grunnlagt andre steder. Arbeidsgiver-, merkevare- og konsernhistorie kobles til huset bare for dokumenterte perioder. Akersgata 51, 49 og VGs opprinnelige lokaler i Akersgata 34 er **ikke** denne bygnings identitet.

| ID | Avgrenset påstand | Kilde og konkret beliggenhet | Status |
| --- | --- | --- | --- |
| S01 | VG ble stiftet i 1945 og hadde først redaksjonslokaler i Akersgata 34. | [Lokalhistoriewiki: Verdens Gang](https://lokalhistoriewiki.no/wiki/Verdens_Gang), etablering og avsnittet om første redaksjonslokaler. | Kontrollert sekundærkilde |
| S02 | VG flyttet til Akersgata 55 i 1994. Dette er **ikke** opprettelsesåret for avisen. | [Lokalhistoriewiki: Verdens Gang](https://lokalhistoriewiki.no/wiki/Verdens_Gang), avsnittet om 1994-flyttingen; [arkitektens prosjektpresentasjon](https://www.lsa.no/prosjekter/kontor/vg-huset). | Kontrollert |
| S03 | Dagens VG-hus er tegnet av Lund & Slaatto og oppført i 1994. Arkitektfirmaet beskriver 34 500 m² og en lysgård som leder til en offentlig passasje. | [Lund+Slaatto: VG-huset](https://www.lsa.no/prosjekter/kontor/vg-huset), prosjektdata og prosjektbeskrivelse; [Oslo byleksikon: Akersgata](https://oslobyleksikon.no/side/Akersgata), nr. 55. | Kontrollert; enkelte offentlige oversikter oppgir 1995, dateringsforskjell må forklares i chronology-kilden |
| S04 | VG-huset fikk Houens fonds diplom i 2000. | [Oslo byleksikon: Houens diplom](https://oslobyleksikon.no/side/Houens_diplom), prislisten for 2000; [SNL: Houens fonds diplom](https://snl.no/Houens_fonds_diplom), prislisten for 2000. | Kontrollert |
| S05 | På tidligere bebyggelse i nr. 55 lå Arbeidskontoret som ble angrepet av Oslogjengen 18. mai 1944. Dette fant sted **før** det nåværende VG-huset ble bygd. | [Lokalhistoriewiki: Sprengningen av Akersgata 55](https://lokalhistoriewiki.no/wiki/Sprengningen_av_Akersgata_55), hendelsesbeskrivelse og plakett; [Oslo byleksikon: Akersgata](https://oslobyleksikon.no/side/Akersgata), tomtehistorikk. | Kontrollert sekundærkilde; historisk egenfaktakontroll kreves før publikasjon |
| S06 | VG Nett ble lansert 10. oktober 1995; avishusets senere digitale funksjon må beskrives uten å hevde at intern oppstart fant sted på et bestemt rom. | [VG: Trosset forbud – skapte mediehistorie med VG Nett](https://www.vg.no/forbruker/i/qzWO0/trosset-forbud-skapte-mediehistorie-med-vg-nett), startdato og tilblivelse. | Kontrollert for medieprodukt, stedsspesifikk romkobling ikke attestert |
| S07 | Aftenposten flyttet inn i Akersgata 55 i august 2014 etter fraflytting av Akersgata 51 i 2003. VG og Aftenposten hadde separate redaksjonelle identiteter under samme tak. | [Aftenposten: Tanta flytter hjem](https://www.aftenposten.no/norge/i/BJdpw/tanta-flytter-hjem), etasjer og adressehistorikk; [Aftenposten: Sistemann slukker lyset](https://www.aftenposten.no/meninger/i/QlAOQ/sistemann-slukker-lyset), datert 15.08.2014; [Dagbladet: Tilbake til Akersgaten](https://www.dagbladet.no/kultur/tilbake-til-akersgaten/61181729), publisert 22.08.2014. | Kontrollert |
| S08 | I 2024 ble medievirksomheten videreført i et skilt Schibsted Media, eid av Stiftelsen Tinius; omtales som konsernramme, ikke «VG eier A55». | [Schibsted: This is where we stand today](https://schibsted.com/2024/05/20/this-is-where-we-stand-today/), splittplan; [Schibsted/NTB, pressemelding 10.06.2024](https://kommunikasjon.ntb.no/pressemelding/18132215/schibsted-media-sjefen-en-ny-epoke?lang=no&publisherId=17848846), faktisk gjennomført deling og resepsjonen i Akersgata 55. | Kontrollert; nyere eierskapsnavn må ferskverifiseres ved publisering |
| S09 | Den skadde VG-avismonteren fra 22. juli 2011 er bevart som del av et kunstprosjekt, med historie om flytting og konservering. Ikke identifiser den automatisk som et **nåværende** objekt ved VG-husets inngang. | [KORO: Avissidene fra 22. juli er tilbake](https://koro.no/avissidene-fra-22-juli-2011-er-tilbake-i-vg-monteren/); [VG: Monteren flyttes](https://www.vg.no/nyheter/i/K0wb7/vgs-avismonter-flyttes-og-bevares). | Kontrollert historikk; gjeldende fysisk lokalisering skal verifiseres før Object |
| S10 | Oslo byleksikon beskriver en roterende skulptur av Per Ung i vestibylen og utendørs skulpturer. Dette er konkrete, potensielle egenentiteter – ikke automatisk Object-/Structure-kort. | [Oslo byleksikon: Akersgata](https://oslobyleksikon.no/side/Akersgata), nr. 55. | Kandidat; verkseier, plassering og lovlig medlemsbilde gjenstår |

### Datering og scope

`year: 1945` står i canonical Place og refererer i praksis til avisens historie, ikke nåværende byggs alder. **Endre ikke feltet uten å kontrollere kontrakt og runtime**. Fagverk og kronologi må uttrykkelig skille **1944 gammel bygning / 1945 avisetablering / 1994 nytt bygg / 1995 nettavis / 2000 arkitekturpris / 2014 samlokalisering / 2024 medieorganisering**. En offentlig planleggingsrapport bruker 1995 om oppføring mens arkitekt og Oslo byleksikon bruker 1994; redegjør for ulikheten uten kunstig datering.

## 3. Underbadges, profil og læringsjobb

Hovedbadge: `media`. Kildebegrunnede foreslåtte underbadges, alle registrert i `data/badges/media.json`: `aviser`, `nettaviser`, `tabloid`, `mediehus_og_redaksjoner`. Endelig registrering skal følge schema/underbadge-grensen og ikke gjøre bygningsarkitektur om til egen hovedbadge.

**Bekreftet produksjonsprofil: `major`**, basert på kildebredden: krigshistorisk tomt, dokumentert 1994-arkitektur/pris, redaksjons- og teknologihistorie, 2014-samlokalisering, et stort materiale av direkte knyttede personer/medier og tydelige offentlighets- og kildekritiske problemstillinger. `fagverk.level: full` er obligatorisk.

**Læringsjobb:** Fra en offentlig tilgjengelig gatepassasje skal brukeren kunne skille byggets og tomtens historie fra VGs avis- og netthistorie, og analysere hvordan en redaksjon gjør nyhetshendelser om til prioriterte publiseringer uten å utlede konkrete redaksjonsbeslutninger av fasaden.

Fagverk må bygge på de fem allerede registrerte `em_media_*`-ID-ene i Place, og først etter manifestvalidering utvide med pressehistorie, arkiv/kildekritikk, redaksjonelt ansvar og presseetikk når dokumentasjonen bærer dem. Minst tre canonical emner, 3–5 ekte linser, 4–6 undersøkelsesspørsmål, observerbare spor, begreper og minst fire inspeksjonelle kilder, i henhold til major-kontrakten.

## 4. Innholdsplan – kandidater, ikke godkjente samlinger

| Subsystem | Status ved source review | Neste test/produksjon |
| --- | --- | --- |
| People | **AUDIT GJENBRUK** | Eksisterende `torry_pedersen`, `gard_steiro`, `hanne_skartveit`, `bernt_olufsen`, `trine_eilertsen` vurderes individuelt, med perioder, ansettelsesforhold, bildeproveniens. `kare_valebrokk` har mulig for svak VG-hus-tilknytning og må ikke automatisk materialiseres. |
| Objects | **BLOCKED / kandidat-review** | Fysisk presseteknologi og ekte avisobjekter må være direkte knyttet til nr. 55. KORO-monteren / kunsten undersøkes kun med eierskap, nåværende lokasjon og faktisk billedrett. |
| Brands | **BLOCKED / eksisterende register** | `vg` og eventuelt dokumentert Schibsted-/Aftenposten-identitet skal undersøkes separat. `vg` står som `borderline`; lokal, lisensiert logo/ordmerke og korrekt place-relasjon kreves. |
| Productions | **BLOCKED / kandidater** | Konkrete utgivelser/avisforsider og publiserte verk knyttet til VG-huset (1994→); ikke bruk `VG Nett` som vilkårlig substitutt for en enkelt publisert produksjon. |
| Fagverk | **MANGLER** | Produser `history_go_place_fagverk_v2` `full` i Place-source og regenerer registry + release. |
| Språkleksikon | **MANGLER** | Dokumenter minst `VG-huset`, `A55`, `avisgaten` eller `VG-passasjen` med riktig stedlig/kildemessig betydning. |
| Chronology | **MANGLER stedsspesifikk produksjon** | Claim-eid historisk forløp med epokeintegrasjon: tomt/førkrig/1944, 1994, 1995, 2000, 2014, 2024. |
| Stories | **GJENBRUK / REVISJONSVURDERING** | Gjenbruk Story om digital døgnrytme dersom den består governance; separat 1944-fortelling bare ved sterk dokumentert narrativ motor og uten duplikat. |
| Før/etter | **KANDIDAT / ikke godkjent** | Det tidligere Dittenkomplekset opp mot dagens VG-hus kan være et sterkt par **bare** etter to lovlig brukbare bilder og ærlig sammenligning av tomt/ståsted. |
| News | **KANDIDAT / avklar** | Vurder om varig institusjonsnyhetsflate har reelt redaksjonelt poeng, ikke bare dagsaktuelle tilfeldige VG-saker. |
| Lesespor | **KANDIDAT** | Søk dokumentert stedstilknyttet lesning om pressebygg, digital nyhetshistorie og avisgata. |
| Quiz | **EKSISTERER / IKKE SLUTTATTESTERT** | Behold seks 3-spørsmålssett inntil separat quizfaglig, kildeledet revisjon har avgjort om de må suppleres/erstattes. Ingen ny quiz skrives i steds-PR-en. |
| QuizCard | **MANGLER** | Dedikert flip-bakside bygges fra kvalitetssikrede spørsmål og kontrolleres med ekte mus/touch/tastatur. |
| `image` og `frontImage` | **MANGLER** | Materialiser to separate, dokumenterte bygningsbilder; ingen `cardImage`, ingen `frontImage` fra `image`. |
| PlaceCard / runtime | **MANGLER fullproduksjon** | Først når samlingskandidater er ferdige velges kun reelle PASS-IDs (1–4); workflow/produksjonsclaims, generatorsynk, CI og mobil-/desktop-browser-QA. |

### Bildekandidater – rettigheter skal føres før publisering

- Liggende `image`-kandidat: [Wikimedia Commons – Akersgata 55, Oslo.jpg](https://commons.wikimedia.org/wiki/File:Akersgata_55%2C_Oslo.jpg), Ssu, opptak 19.12.2023, 3510×2633, **CC BY-SA 4.0**. Fysisk motiv og publiserbart utsnitt må inspiseres før valg.
- Stående separat `frontImage`-kandidat: [Wikimedia Commons – Verdens Gang Akersgata.jpg](https://commons.wikimedia.org/wiki/File:Verdens_Gang_Akersgata.jpg), Bjørn Erik Pedersen, 10.02.2007, 2592×3872, **CC BY-SA 3.0** (blant lisensvalgene). Dette er et historisk 2007-foto, ikke et 2026-bilde; kontroller motiv før valg. 
- [Wikimedia Commons – VG-huset (kategori)](https://commons.wikimedia.org/wiki/Category:VG-huset) har nyere alternativer. Et 2025/2026-foto skal ikke hevdes som rettighetsavklart bare fordi det finnes på Commons; les hver enkelt filside.

Husk lokal asset-fil, kreditering, original-URL, lisens, transformasjonsstatus og tydelig datert motiv. En nettlenke i et dokument alene er ikke et ferdig `image`-felt.

## 5. Produksjonsrekkefølge og sluttest

1. Registrer den kanoniske READ-FIRST-preflighten (rule SHA) på fersk branch og opprett V3 factuality-/workflow-kilde uten å håndredigere genererte arbeidskort.
2. Materialiser source → claim-bank, building/tomt-grense, kontrollert historisk kronologi og Fagverk `full`.
3. Ferdigstill faktiske People-/Object-/Brand-/Production-kandidater med dokumentert bildeproveniens og samlingsbeslutninger; ikke fyll fire felt som kvote.
4. Produser Språkleksikon, eventuelle kvalifiserte Stories/Før-etter/Lesespor, `image` + separat stående `frontImage`.
5. Overlever kildematerialet til separat quizproduksjon for revisjon av eksisterende VG-sett; produser og bind QuizCard etter quizkontroll.
6. Bygg avledede canonical payloads, Fagverk-registrering, epoke- og andre stedsindekser fra source; kontroller null stale `cardImage`-felt.
7. Kjør V3 build/verify, faktakontroller, samlings-/bildeprøver, språk/Fagverk-tester og faktisk PlaceCard-test mobil/desktop med flip og kilde/epoke/popup/navigasjon. Full quality gate: alle seks dimensjoner ≥4/5 og totalt ≥27/30. Ingen ferdigpåstand uten dette.

**Sluttstatus for denne rapporten: source review gjennomført, produksjonsprofil major bekreftet; stedet ikke produksjonsklart, ikke full QA, ikke publisert gjennom denne grenen.**


## 6. Etterfølgende faktisk bildeproduksjon (2026-10-09)

De opprinnelig kartlagte motivkandidatene er revidert. Et nyere og bedre dokumentert **liggende** motiv fra 2026 ble valgt framfor Ssus 2023-foto; dette er et eksplisitt kandidatbytte etter selvstendig bildekontroll, ikke et krav om at alle bilder må være samtidige.

- `image`: `bilder/places/vg_huset_akersgata_55_2026.webp`. Originalen `File:Akersgata 55 med VG og Aftenposten i 2026.jpg`, fotograf Helge Høifødt, 1. juli 2026, 5568×3712, CC BY-SA 4.0. Kildeside: https://commons.wikimedia.org/wiki/File:Akersgata_55_med_VG_og_Aftenposten_i_2026.jpg
- `frontImage`: `bilder/places/vg_huset_front_2007.webp`. En **annen selvstendig original** `File:Verdens Gang Akersgata.jpg`, fotograf Bjørn Erik Pedersen, 10. februar 2007, 2592×3872, CC BY-SA 3.0. Kildeside: https://commons.wikimedia.org/wiki/File:Verdens_Gang_Akersgata.jpg
- Fotografier, historiske opptaksdatoer, lisenslenker og reduksjon til WebP uten beskjæring er materialisert på den canonicale stedskilden med separate `imageMeta` og `frontImageMeta`.
- [Bildeimport, grønn GitHub Actions](https://github.com/Paradispartiet/History-Go/actions/runs/37978870510): nedlastede originaler inspeksjonert for JPEG-format, minimumsstørrelse, motstående orienteringer og ulike SHA-256; to egne WebP-filer ble kontrollert på nytt og committet.
- [Avledet generator, grønn GitHub Actions](https://github.com/Paradispartiet/History-Go/actions/runs/37979068005): canonical places-index, place-open, Fagverk release, epoke og Fagverk coverage kjørt med streng endringsliste. Brukerrettet PNG/WebP blir ikke erstattet av illustrasjon eller falskt preview. Midlertidige arbeidsworkflows er fjernet fra PR-branchen.

**Bildestatus:** `image` og `frontImage` er importert og koblet. Riktig filformat/orientering og lisensproveniens er kontrollert. Ekte mobil-/desktop-PlaceCard QA og de stedsavhengige medlemsbildene gjenstår; dette er fremdeles **ikke** fullført Place-produksjon.
