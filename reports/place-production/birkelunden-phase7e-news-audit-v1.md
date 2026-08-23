# Birkelunden – fase 7E Nyheter audit V1

- Dato: 2026-08-23
- Place ID: `birkelunden`
- Canonical nyhetseier: manifest-lastede Leksikon-oppføringer
- Nyhetsdata: `data/leksikon/places/oslo/by/leksikon_oslo_by_birkelunden_news.json`
- Runtime: `js/ui/place-popup-tabs.js`
- Status: **KLAR FOR REVIEW / CI**

## Problem og mål

Fase-7-auditen slo fast at Birkelundens Nyheter-fane ikke kan godkjennes tomt: stedet har reelt, stedseid 2026-stoff og krever fersk research før materialisering.

Målet i 7E er å publisere få, konkrete og daterte notiser som gjelder selve Birkelunden, har åpne direkte kilder og består freshness-, own-place- og proporsjonalitetsgaten. Nyheter skal ikke bli en generell Grünerløkka-kalender.

## Canonical eier og runtime

Nyheter-fanen leser manifest-lastede ekstraartikler fra `LEKSIKON_BY_PLACE[placeId]`. `classifyArticle()` klassifiserer oppføringer med `type/tags: news_note` som `news_notes`, og `renderNews()` viser dem under «Nyere notiser».

Derfor legges notisene i en egen Leksikon-fil for `place_id: birkelunden`, registrert én gang i `data/leksikon/manifest.json`. Canonical Place JSON får ikke et parallelt `news`-felt.

## Fersksøk 2026-08-23

| Kildeområde | Resultat | Beslutning |
| --- | --- | --- |
| Oslo Pix Filmfestival | Offisielt 2026-program oppgir gratis kveldsvisninger i Birkelunden 25. og 26. august kl. 19.00 | **Publisert** som datert, stedseid arrangementsnotis |
| Bondens marked | Markedsplassiden oppgir fire kommende Birkelunden-datoer etter 23. august: 13. september, 18. oktober, 14. november og 13. desember 2026 | **Publisert** som datert høst-/vinterserie |
| Oslo kommune – Birkelunden | Aktiv parkside bekrefter sted, areal og fasiliteter, men har ingen konkret ny 2026-hendelse eller forvaltningsendring | **Holdt tilbake**; basisfakta hører ikke hjemme som nyhet |
| VisitOSLO – Birkelunden marked | Viser løpende søndagsmarked og kommende datoer | **Holdt tilbake** i 7E for å unngå en generell kalenderfeed når to sterkere primærkilder allerede gir aktuell verdi |
| Tankesmien Agenda – «Blokka» | Siden har en dato-/ukedagkonflikt mellom topptekst og brødtekst | **Avvist** som selvstendig nyhetskilde; Oslo Pix sin offisielle festivalside brukes i stedet |
| Områdetreff på Grünerløkka | Mange arrangementer gjelder Sofienbergparken, Olaf Ryes plass, Vulkan eller virksomheter med egen identitet | **Avvist som place-proxy**; ikke Birkelunden-notiser |

Søket dekker parkens offisielle side, primærarrangører og bredere arrangementsoversikter. Tomt repo eller generelle Grünerløkka-treff brukes ikke som N/A-grunn.

## Publiserte notiser

### 1. Oslo Pix: gratis utekino 25.–26. august

- ID: `birkelunden_news_oslo_pix_utekino_2026`
- Hendelsesstart: 2026-08-25
- Gyldig til: 2026-08-26
- Status: planlagt
- Stedskobling: Oslo Pix oppgir Birkelunden direkte som visningssted
- Program: `The Truman Show` 25. august og `Thelma & Louise` 26. august, begge kl. 19.00
- Kilde: `https://www.oslopix.no/no/arrangement/2026/kveldsvisninger-p%C3%A5-birkelunden-gratis-utekino`
- Kontrollert: 2026-08-23

Notisen gjengir bare det publiserte 2026-programmet og blåser ikke arrangementet opp til Story eller generell festivalomtale.

### 2. Bondens marked: fire kommende datoer

- ID: `birkelunden_news_bondens_marked_host_2026`
- Første kommende dato etter dagens marked: 2026-09-13
- Gyldig til: 2026-12-13
- Status: planlagt
- Stedskobling: arrangørens markedsplasside er eksplisitt Birkelunden (Grünerløkka)
- Kommende datoer: 13. september, 18. oktober, 14. november og 13. desember 2026
- Kilde: `https://bondensmarked.no/markedsplasser/birkelunden-gr-nerloekka`
- Kontrollert: 2026-08-23

Notisen låser ikke produsentantall eller andre detaljer som kan endres før markedsdagene. Den publiserer bare datoene som arrangøren selv oppgir.

## Identitets- og proporsjonalitetskontroll

- Begge notisene gjelder fysisk aktivitet i selve Birkelunden.
- Paulus' plass, Paulus kirke, Grünerløkka skole, Olaf Ryes plass, Sofienbergparken og det større Birkelunden kulturmiljøet brukes ikke som stedfortredere.
- To notiser er nok til å gjøre fanen nyttig uten å gjøre den til en generell arrangementsfeed.
- Basisfakta fra Oslo kommunes parkside beholdes i Om/kilder og restemples ikke som «nytt».
- Notisene er ikke Stories og får ingen narrativ oppblåsing.

## Freshness-grense

- Begge oppføringer har `verifiedAt: 2026-08-23`.
- Oslo Pix-notisen har `valid_through: 2026-08-26`.
- Bondens marked-notisen har `valid_through: 2026-12-13`.
- Etter utløpsdato skal de ikke behandles som evig aktuelle uten ny kontroll.
- Eventuelle senere datoendringer hos arrangørene krever ny verifikasjon; denne fasen gjør ingen antakelse om fremtidig stabilitet.

## Permanent QA

`tests/birkelunden-phase7e-news.test.js` låser:

1. eksakt to proporsjonale 2026-notiser;
2. `place_id: birkelunden`, `type: news_note`, dato/status/freshness og direkte HTTPS-kilder;
3. de publiserte Oslo Pix- og Bondens marked-datoene;
4. manifestregistrering ved canonical Birkelunden-artikkel;
5. eksisterende runtimeklassifisering og kildevisning;
6. own-place-grensen og de eksisterende fase-5 description-hashene/parkarealet.

Automatiske tester kan kontrollere data- og runtimekontrakten, men ikke alene bevise at ferdig Nyheter-fane er visuelt eller redaksjonelt god. Full manuell popup-QA ligger fortsatt i sluttfasen.

## Beslutning

**Nyheter-blokkeren er løst av fase 7E** når nyhetsfilen, manifestet, auditen, workcardet og regresjonstesten er merget med grønn CI.

Neste canonical delsteg: **7F – Lesespor**. Auditen fra fase 7 har allerede klassifisert dette som et reelt researchhull, så tom fane kan ikke godkjennes uten et nytt strengt kildesøk.
