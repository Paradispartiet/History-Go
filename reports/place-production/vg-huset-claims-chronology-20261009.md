# VG-huset — påstandskontroll og kronologibeslutning (fase 2)

**Sted:** `vg_huset` · Akersgata 55, Oslo  
**Dato:** 2026-10-09  
**Status:** Historisk kilde-/tidsankerreview utført; **ikke** canonical v4.2-`ready`, ingen generert epokeindex oppdatert og ingen fullført Place-produksjon.  
**Kildeeier:** `data/places/media/oslo/places_oslo_media/vg_huset.json`. Historiske, godkjente enkeltpåstander skal senere materialiseres i `data/places/production/vg_huset.json` gjennom 4.2.1-protokollen og `npm run epoker:places:build`. Ikke håndrediger epokeindeksen.

## Avgrensning som må overleve alle generatorer

- **Tomt 1944:** Arbeidskontoret/AT-sabotasjen fant sted i tidligere bygningsmasse på nr. 55. Plaketten på dagens hus viser tilbake til denne hendelsen.
- **Avis 1945:** VG ble grunnlagt i 1945, men på en annen adresse. Dette kan brukes i Fagverket som aviskontekst; **ikke** som «VG-huset ble åpnet i 1945» eller som et ordinært bygganker i epokeviseren.
- **Nybygg 1994:** Dagens bygning ble ferdigstilt i 1994, tegnet av Lund & Slaatto.
- **Hus / virksomhet:** 1995-nettavisen, 2014-samlokalisering og 2024-konsernendring gjelder dokumenterte virksomheter knyttet til adressen, uten påstand om at VG Nett ble startet i et bestemt rom, eller at VG og Aftenposten er én redaksjon.
- **Naboer:** Aftenpostens eldre nr. 51 og Dagbladets nr. 49 er selvstendige historiske adresser. Ingen relasjoner, eksisterende People, Stories, quizsett, koordinater, `desc` eller `popupDesc` endres i denne fasen.

## Kilde → avgrenset påstand → kronologi

| Foreløpig claim-ID | År/dato | Verifiserbart innhold | Kildeforankring | Kronologivalg |
| --- | --- | --- | --- | --- |
| `claim_vg_site_1944` | 1944-05-18 | Oslogjengen sprengte Arbeidskontorets lokaler/arkiver i tidligere bygning på Akersgata 55 for å hindre tvangsinnkalling til arbeidstjeneste. | SNL, «Oslogjengen», avsnitt «De første sabotasjeaksjonene»; Oslo byleksikon, «Akersgata», nr. 55 | **JA, tomteanker**, merk «før dagens VG-hus» |
| `claim_vg_foundation_1945` | 1945 | Dagens avis VG ble etablert i 1945, med tidlige lokaler i Akersgata 34; adressen 55 er senere. | Lokalhistoriewiki, «Verdens Gang», etablering/første lokaler; Aftenposten 16.08.2014, historisk adresseomtale | **NEI, ikke eget stedshendelsesanker** |
| `claim_vg_tabformat_1963` | 1963 | VG skiftet til tabloidformat i 1963. Hendelsen gjelder avisen før Akersgata 55. | Oslo byleksikon, «Verdens Gang (nåværende)», historikk | **NEI, kontekst før innflytting** |
| `claim_vg_huset_build_1994` | 1994 | Dagens VG-hus i Akersgata 55 ble ferdigstilt etter prosjekt av Lund & Slaatto. | Lund+Slaatto, «VG-huset, Oslo 1994», prosjektdata; Oslo byleksikon, «Akersgata», nr. 55 | **JA, bygganker** |
| `claim_vg_huset_passage_1994` | 1994 | Arkitektene beskriver en glassoverdekket lysgård og offentlig tilgjengelig passasje på bakkenivå, utformet med mål om et åpent avishus. | Lund+Slaatto, prosjektbeskrivelse, «Lysgården»/«Byggets disposisjon» | **NEI, del av byggankeret** |
| `claim_vg_nett_launch_1995` | 1995-10-10 | VG Nett ble lansert 10. oktober 1995, etter innflyttingen i huset; teknisk arbeidsrom er ikke dokumentert. | VG, «VG Nett fyller 10 år 10. oktober», avisens egen historikk | **JA, virksomhets-/publiseringsanker**, skill fra byggets oppføring |
| `claim_vg_houens_2000` | 2000 | VG-huset i Akersgata 55 mottok Houens fonds diplom i 2000. | Oslo byleksikon, «Akersgata», nr. 55; Lokalhistoriewiki, «Houens diplom», prislisten 2000 | **JA, bygningsanker** |
| `claim_vg_monter_2011` | 2011-07-22 | Eksplosjonen 22. juli rammet vinduer/avismonter ved VG-huset, og monteren ble senere tatt vare på/flyttet. | Oslo byleksikon, «Akersgata», nr. 55; KORO, «Avissidene fra 22. juli er tilbake» | **JA, historisk hendelse**, men ikke nåtidsplassering av gjenstand |
| `claim_vg_aftenposten_2014` | 2014-08 | Aftenposten flyttet i august 2014 inn i Akersgata 55, der VG allerede holdt til, etter å ha forlatt nr. 51 i 2003. | Aftenposten, «Tanta flytter hjem», publisert 16.08.2014, fototekst og innflyttingsavsnitt | **JA, samlokaliseringsanker**, separate redaksjoner |
| `claim_vg_media_group_2024` | 2024-06 | Ved mediedelingen i juni 2024 ble Schibsted Media en selvstendig mediegruppe eid av Tinius-stiftelsen; den dokumenterte offentliggjøringen viser resepsjonsområdet i Akersgata 55. | Schibsted/NTB, pressemelding 10.06.2024; Schibsted Media årsrapport 2024, note 1 | **JA, konsern-/adresseanker** |
| `claim_vg_address_2026` | 2026 | Schibsteds offisielle kontaktside og Brønnøysundregistrene oppgir fortsatt Akersgata 55 som besøks-/beliggenhetsadresse. | schibsted.com/contact; Brønnøysundregistrene, underenhet 915836917 | **NEI, nåtidskontroll**, ikke historisk vendepunkt |

**Kildeplasseringene over er audit-evidens, ikke ferdige v4.2-claims.** Når den strukturerte banken publiseres, må hvert claim ha inspectable HTTPS-`sourceUrl`, eksakt `sourceLocation`, `verifiedAt`, `evidenceMode` og individuell temporal/scope-status; bare virkelig presise og godkjente år får `timelineYear`.

## Kildene som er inspisert

1. [Oslo byleksikon — Akersgata, nr. 49, 51 og 55](https://oslobyleksikon.no/side/Akersgata), sted, førbygning, 1994, Houens diplom, kunst og 2011.
2. [Lund+Slaatto — VG-huset, Oslo 1994](https://www.lsa.no/prosjekter/kontor/vg-huset), originalprosjekt, oppdragsgiver, areal og lysgård.
3. [SNL — Oslogjengen](https://snl.no/Oslogjengen), 18. mai 1944 og plankett.
4. [Lokalhistoriewiki — Sprengningen av Akersgata 55](https://lokalhistoriewiki.no/wiki/Sprengningen_av_Akersgata_55), historisk bygg og arkivsabotasjen.
5. [Lokalhistoriewiki — Verdens Gang](https://lokalhistoriewiki.no/wiki/Verdens_Gang), etablerings- og adressehistorikk.
6. [VG — Slik startet VG Nett-eventyret](https://www.vg.no/nyheter/i/wE6ryo/vg-nett-fyller-10-aar-10-oktober-slik-startet-vg-nett-eventyret), lanseringsdatoen.
7. [Aftenposten — Tanta flytter hjem](https://www.aftenposten.no/norge/i/BJdpw/tanta-flytter-hjem), 2014-innflyttingen og adressesekvensen.
8. [Schibsted/NTB — En ny epoke, 10. juni 2024](https://kommunikasjon.ntb.no/pressemelding/18132215/schibsted-media-sjefen-en-ny-epoke?lang=no&publisherId=17848846), eier-/organisasjonsendring og resepsjonsfoto.
9. [Schibsted — konsernets besøksadresse](https://schibsted.com/contact/), nåtidskontroll.
10. [Brønnøysundregistrene — Schibsted Media AS avd. Oslo](https://virksomhet.brreg.no/nb/oppslag/underenheter/915836917), beliggenhetsadresse og historisk navneendring.
11. [Lokalhistoriewiki — Houens diplom](https://lokalhistoriewiki.no/Houens_diplom), pristildeling.
12. [KORO — Avissidene fra 22. juli](https://koro.no/avissidene-fra-22-juli-2011-er-tilbake-i-vg-monteren/), historikken til monterobjektet.

## Tre kilde-/redaksjonelle sperrer

1. **Rivingsår:** Oslo byleksikons omtale og andre stedsoversikter bruker ikke entydig samme rivingsår for eldre bygningsmasse (1992/1993 i tilgjengelige beskrivelser). Ingen egen, eksakt riving-milestone uten bedre byggesaks-/arkivkilde.
2. **1994 kontra 1995:** Prosjektarkitekt og Oslo byleksikon har 1994, mens enkelte seinere planleggingsomtaler bruker 1995. Registrer 1994 som dokumentert ferdigstillelse i prosjektkilden, og merk avviket; ikke slå to forskjellige datotyper sammen.
3. **Schibsted-navn:** Kildene dokumenterer organisasjonsnavnet *Schibsted Media* ved delingen i 2024; konsernets senere navnebruk har endret seg. Bruk datert navn i 2024-hendelsen, kontroller gjeldende navn før et nåtidsclaim. Ikke utled at VG eier bygget.

## Konkrete neste produksjonsporter

1. **v4.2 packet:** Slå opp nåværende `desc`/`popupDesc` og valider kilde-/setningsdekning uten å omskrive innholdet ubegrunnet. Validatoren `scripts/validate-place-description-production-v4_2.mjs` har et faktisk redaksjonelt stoppfunn: eksisterende `popupDesc` inneholder «History Go bruker …», og `FORBIDDEN_META_PATTERNS` avviser slik intern omtale i brukerrettet tekst. Gjør kun en begrunnet, minimal tekstkorreksjon før `ready_v4_2`, og synkroniser avledede data.
2. **Chronology/epoke:** Materialiser bare kvalifiserte år fra godkjent claimsfil, kjør `npm run epoker:places:build` + `npm run epoker:places:check`; kontroller at 1944 er knyttet til tidligere bygg og at 1945 ikke blir «huset bygd».
3. **V3 workflow:** Opprett factuality-/workflowkilder med `read_first` før `npm run place:build -- vg_huset`; generer, ikke håndrediger, workcard og quality-gate.
4. **PlaceCard / QuizCard:** Få source-/bilde-/periodestatus per People, Objects, Brands og Productions. Bruk bare virkelig `PASS`-samlinger. Revider eksisterende seks quizsett i eget quizløp før dedikert QuizCard. Foreta full Chromium desktop/mobil- og Safari-review til slutt.

**Denne fasen erklærer ikke samlingene, quiz, kronologi i runtime eller kvalitetspoeng som godkjent.**
