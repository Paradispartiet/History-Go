# People of Places — next place coverage audit

## Current people coverage

- **1083 active placeIds** were indexed from `data/places/places_index.json`, reconciled against the active place manifest.
- **851 manifest-listed people** from **350 people files** were used. The relation index in the JSON companion contains one row for every active placeId, including zero-coverage places.
- The current People of Places gate is clean: **0** duplicate IDs, invalid place references, people without valid primary anchor, and people with empty `places` arrays (see the audit command below).

## Method

Primary anchors use `placeId`, `source_place_id`, `place_id` or `place`; linked coverage deduplicates every explicit reference in the primary field and `places`/`placeIds`/`place_ids`. Estimates exclude loose city associations, people already correctly linked, and candidates without a plausible explicit institutional or event relation. Scores apply the requested 30/25/20/15/10 weighting.

Previous series were read before ranking: Nationaltheatret migration/validation batches 1–12; Det Norske Teatret research and batches 1–10; Bislett batches 1–8 and VIF crosslinks; Ullevaal historical, qualifier, coach, commentator, women and modern batches; Chat Noir/Edderkoppen validations; subculture batches 1–4 including venue/skate anchors; and sport/Jordal/Intility/Nordre Åsen reports. That evidence is treated as saturation evidence, not as a proxy for candidate potential.

## Top 15 opportunities

| placeId | name | category | location | primary | linked | strong remaining | relevant categories | dedicated series | saturation | confidence | score |
|---|---|---|---|---:|---:|---:|---|---|---|---|---:|
| `eidsvollsbygningen` | Eidsvollsbygningen | politikk | Eidsvoll, Akershus | 3 | 4 | 90 | historie, politikk, jus, embetsverk | false | low | high | 97 |
| `akershus_festning` | Akershus festning | historie | Oslo | 0 | 0 | 28 | historie, militærhistorie, politikk, motstand | false | low | high | 88 |
| `nidaros_erkebispegarden` | Erkebispegården i Nidaros | historie | Trondheim, Trøndelag | 1 | 13 | 24 | historie, kirke, middelalder, politikk | false | medium | high | 85 |
| `grini_fangeleir` | Grini fangeleir | historie | Bærum, Akershus | 2 | 4 | 25 | historie, motstand, politikk, litteratur | false | low | high | 84 |
| `holmenkollen_nasjonalanlegg` | Holmenkollen nasjonalanlegg | sport | Oslo | 4 | 4 | 28 | sport, ski, olympiske_leker, arkitektur | false | low | high | 83 |
| `operahuset` | Operahuset | by | Bjørvika, Oslo | 3 | 3 | 24 | musikk, opera, ballett, arkitektur | false | low | high | 81 |
| `rockefeller` | Rockefeller Music Hall | musikk | Oslo | 2 | 3 | 23 | musikk, popkultur, rock, jazz | false | low | medium | 79 |
| `nasjonalbiblioteket` | Nasjonalbiblioteket | litteratur | Oslo | 4 | 4 | 20 | litteratur, vitenskap, media, kulturforvaltning | false | medium | high | 78 |
| `munch_museet` | MUNCH | kunst | Bjørvika, Oslo | 1 | 1 | 18 | kunst, modernisme, museum, arkitektur | false | low | high | 77 |
| `nobelinstituttet` | Nobelinstituttet | vitenskap | Oslo | 6 | 6 | 16 | vitenskap, fred, politikk, diplomati | false | medium | high | 76 |
| `kristkirken_bergenhus` | Kristkirken på Bergenhus | historie | Bergen, Vestland | 3 | 10 | 15 | historie, middelalder, kirke, monarki | false | medium | medium | 74 |
| `observatoriet` | Observatoriet | vitenskap | Oslo | 3 | 4 | 15 | vitenskap, astronomi, meteorologi, universitet | false | medium | high | 73 |
| `stiklestad` | Stiklestad | historie | Verdal, Trøndelag | 3 | 4 | 14 | historie, middelalder, religion, minnekultur | false | medium | medium | 71 |
| `gamle_deichman` | Gamle Deichman | litteratur | Grünerløkka, Oslo | 8 | 13 | 14 | litteratur, bibliotek, arkitektur, kulturforvaltning | false | medium | high | 69 |
| `jordal_amfi` | Jordal Amfi | sport | Oslo | 8 | 11 | 13 | sport, ishockey, olympiske_leker | true | medium | high | 68 |

## Top 10 ranking

1. **Eidsvollsbygningen** (`eidsvollsbygningen`, 97/100) — Grunnlovsforhandlingene i 1814 samlet representanter med direkte dokumentert arbeid i bygningen og knytter stedet til statsdannelsen. Existing coverage: 4; estimated strong remaining: 90.
2. **Akershus festning** (`akershus_festning`, 88/100) — Nasjonalt makt-, forsvars- og fangestedsanlegg fra middelalderen til etterkrigstiden. Existing coverage: 0; estimated strong remaining: 28.
3. **Erkebispegården i Nidaros** (`nidaros_erkebispegarden`, 85/100) — Erkebiskopens administrative og politiske sentrum, med en uvanlig klar institusjonell personhistorie. Existing coverage: 13; estimated strong remaining: 24.
4. **Grini fangeleir** (`grini_fangeleir`, 84/100) — Sentralt nazistisk fangeanlegg; fangeprotokoller og biografier gir presis stedstilknytning. Existing coverage: 4; estimated strong remaining: 25.
5. **Holmenkollen nasjonalanlegg** (`holmenkollen_nasjonalanlegg`, 83/100) — Norges mest internasjonalt betydningsfulle ski- og hoppanlegg, med mesterskap over mer enn et århundre. Existing coverage: 4; estimated strong remaining: 28.
6. **Operahuset** (`operahuset`, 81/100) — Nasjonalt operahus og tydelig internasjonalt arkitektur- og scenekunstsymbol siden 2008. Existing coverage: 3; estimated strong remaining: 24.
7. **Rockefeller Music Hall** (`rockefeller`, 79/100) — Langvarig sentralscene for norsk og internasjonal rytmisk musikk. Existing coverage: 3; estimated strong remaining: 23.
8. **Nasjonalbiblioteket** (`nasjonalbiblioteket`, 78/100) — Nasjonal hukommelsesinstitusjon med dokumenterbare forfatter-, bibliotekar- og ledertilknytninger. Existing coverage: 4; estimated strong remaining: 20.
9. **MUNCH** (`munch_museet`, 77/100) — Forvalter Edvard Munchs kunstnerskap og et internasjonalt kunsthistorisk arkiv. Existing coverage: 1; estimated strong remaining: 18.
10. **Nobelinstituttet** (`nobelinstituttet`, 76/100) — Arbeidssted for Nobelkomiteen og fredsprisens sekretariat; avgrensbare verv gir kildebare relasjoner. Existing coverage: 6; estimated strong remaining: 16.

## Candidate pools for top 5

### Eidsvollsbygningen (`eidsvollsbygningen`)

| Candidate | Role | Period | Explicit place connection | Existing people-id | Recommendation |
|---|---|---|---|---|---|
| Christian Frederik | regent og møteleder | 1814 | innkalte og ledet riksforsamlingen i Eidsvollsbygningen | christian_frederik | cross_link |
| Georg Sverdrup | professor og president | 1814 | president for riksforsamlingen i Eidsvollsbygningen | georg_sverdrup | cross_link |
| Christian Magnus Falsen | jurist og grunnlovsutkastforfatter | 1814 | representant ved riksforsamlingen i Eidsvollsbygningen | christian_magnus_falsen | cross_link |
| Peder Anker | godseier og statsråd | 1814 | vert på Eidsvoll Verk og deltaker i riksforsamlingen | peder_anker | cross_link |
| Carsten Anker | verkseier og diplomat | 1814 | eide Eidsvoll Verk og huset riksforsamlingen | carsten_anker | cross_link |
| Wilhelm Frimann Koren Christie | stiftamtmann og stortingspresident | 1814 | Bergen-representant ved riksforsamlingen | wilhelm_f_k_christie | cross_link |
| Nicolai Wergeland | prest og politiker | 1814 | Agder-representant ved riksforsamlingen | — | new_person |
| Severin Løvenskiold | jernverkseier og statsråd | 1814 | Bratsberg-representant ved riksforsamlingen | — | new_person |
| Jacob Aall | jernverkseier og politiker | 1814 | Nedenes-representant ved riksforsamlingen | — | new_person |
| Peter Motzfeldt | offiser og politiker | 1814 | representant ved riksforsamlingen | — | new_person |
| Herman Wedel Jarlsberg | greve og politiker | 1814 | Jarlsberg-representant ved riksforsamlingen | — | new_person |
| Diderik Hegermann | general og politiker | 1814 | militær representant ved riksforsamlingen | — | new_person |
| Thomas Konow | sjøoffiser og politiker | 1814 | marin representant ved riksforsamlingen | — | new_person |
| Niels Aall | forretningsmann og statsråd | 1814 | Bratsberg-representant ved riksforsamlingen | — | new_person |
| John Collett | embetsmann og politiker | 1814 | Akershus-representant ved riksforsamlingen | — | new_person |
| Lauritz Weidemann | sorenskriver og politiker | 1814 | representant ved riksforsamlingen | — | new_person |
| Anders Lysgaard | bonde og politiker | 1814 | Kristians amt-representant ved riksforsamlingen | — | new_person |
| Ole Elias Holck | offiser og politiker | 1814 | Nordenfjeldske infanteriregiments representant | — | new_person |
| Christian Adolph Diriks | jurist og politiker | 1814 | Laurvigs-representant ved riksforsamlingen | — | new_person |
| Hans Jacob Grøgaard | prest og politiker | 1814 | Bratsberg-representant ved riksforsamlingen | — | new_person |

### Akershus festning (`akershus_festning`)

| Candidate | Role | Period | Explicit place connection | Existing people-id | Recommendation |
|---|---|---|---|---|---|
| Håkon V Magnusson | konge og byggherre | ca. 1299–1319 | grunnla Akershus festning som kongelig borg | — | new_person |
| Christian IV | konge | 1592–1648 | utbygde festningen og flyttet byens tyngdepunkt til Christiania | — | new_person |
| Hannibal Sehested | stattholder | 1642–1651 | stattholder med Akershus som administrativt maktsentrum | — | new_person |
| Ulrik Frederik Gyldenløve | stattholder | 1664–1699 | ledet omfattende utbygging av festningen | — | new_person |
| Peder Tordenskjold | sjøoffiser | 1716 | deltok i forsvaret av Christiania/Akershus under Karl XIIs felttog | — | new_person |
| Vidkun Quisling | politiker | 1945 | fengslet og henrettet på Akershus festning | — | new_person |
| Gunnar Sønsteby | motstandsmann | 1940–1945 | motstandsarbeid knyttet til festningens okkupasjonshistorie | — | new_person |
| Max Manus | motstandsmann | 1940–1945 | motstandsarbeid og etterkrigstidens minnekultur ved Akershus | — | new_person |
| Einar Gerhardsen | politiker | 1940–1945 | fange på Akershus under okkupasjonen | — | new_person |
| Odd Nansen | arkitekt og humanitær | 1942–1945 | fange på Akershus før deportasjon | — | new_person |
| Trygve Bratteli | politiker | 1942–1943 | fengslet på Akershus før deportasjon | — | new_person |
| Eivind Berggrav | biskop | 1942–1945 | internert på Akershus festning | — | new_person |

### Erkebispegården i Nidaros (`nidaros_erkebispegarden`)

| Candidate | Role | Period | Explicit place connection | Existing people-id | Recommendation |
|---|---|---|---|---|---|
| Øystein Erlendsson | erkebiskop | 1161–1188 | erkebiskop med sete i Erkebispegården | — | new_person |
| Eirik Ivarsson | erkebiskop | 1189–1205 | erkebiskop i Nidaros med administrativt sete ved gården | — | new_person |
| Tore Gudmundsson | erkebiskop | 1206–1214 | erkebiskop med sete i Erkebispegården | — | new_person |
| Guttorm | erkebiskop | 1215–1224 | erkebiskop i Nidaros | — | new_person |
| Sigurd Eindridesson | erkebiskop | 1231–1252 | erkebiskop med sete i Erkebispegården | — | new_person |
| Einar Gunnarsson | erkebiskop | 1255–1263 | erkebiskop i Nidaros | — | new_person |
| Jørund | erkebiskop | 1268–1282 | erkebiskop i Nidaros | — | new_person |
| Jorunn | erkebiskop | 1285–1286 | erkebiskop i Nidaros | — | new_person |
| Jørund | erkebiskop | 1286–1309 | erkebiskop i Nidaros | — | reject |
| Eiliv Arnesson Kortin | erkebiskop | 1309–1332 | erkebiskop med administrativt sete i Erkebispegården | — | new_person |
| Pål Bårdsson | erkebiskop | 1333–1346 | erkebiskop i Nidaros | — | new_person |
| Olav | erkebiskop | 1352–1370 | erkebiskop i Nidaros | — | new_person |

### Grini fangeleir (`grini_fangeleir`)

| Candidate | Role | Period | Explicit place connection | Existing people-id | Recommendation |
|---|---|---|---|---|---|
| Einar Gerhardsen | politiker | 1941–1945 | registrert Grini-fange | — | new_person |
| Trygve Bratteli | politiker | 1942–1945 | registrert Grini-fange | — | new_person |
| Odd Nansen | arkitekt og humanitær | 1942–1943 | registrert Grini-fange | — | new_person |
| Gunnar Sønsteby | motstandsmann | 1943–1944 | registrert Grini-fange | — | new_person |
| Max Manus | motstandsmann | 1941 | registrert Grini-fange | — | new_person |
| Bjørn Egge | motstandsmann | 1942–1945 | registrert Grini-fange | — | new_person |
| Sigrid Helliesen Lund | motstandskvinne | 1944–1945 | registrert Grini-fange | — | new_person |
| Kirsten Hansteen | politiker og motstandskvinne | 1944–1945 | registrert Grini-fange | — | new_person |
| Lise Lindbæk | journalist og motstandskvinne | 1943–1945 | registrert Grini-fange | — | new_person |
| Ragnar Ulstein | motstandsmann og historiker | 1944–1945 | registrert Grini-fange | — | new_person |

### Holmenkollen nasjonalanlegg (`holmenkollen_nasjonalanlegg`)

| Candidate | Role | Period | Explicit place connection | Existing people-id | Recommendation |
|---|---|---|---|---|---|
| Birger Ruud | hopp- og alpinløper | 1930–1948 | verdensmesterskap og Holmenkollrenn i anlegget | — | new_person |
| Thorleif Haug | langrennsløper | 1920-tallet | Holmenkollvinner og olympisk mester med renn på Holmenkollen | — | new_person |
| Arne Ustvedt | langrennsløper | 1920-tallet | Holmenkollvinner | — | new_person |
| Kåre Berg | hoppbakkeutøver | 1930-tallet | Holmenkollvinner | — | new_person |
| Kjetil André Aamodt | alpinløper | 1990–2000-tallet | deltok ved skiarrangementer i Holmenkollen | — | reject |
| Maren Lundby | skihopper | 2010-tallet | Holmenkollrenn og verdenscup i anlegget | — | new_person |
| Anders Bardal | skihopper | 2000–2010-tallet | verdenscup og VM i Holmenkollen | — | new_person |
| Matti Nykänen | skihopper | 1980-tallet | Holmenkollrenn i anlegget | — | new_person |
| Eddie the Eagle | skihopper | 1986 | konkurrerte i Holmenkollen; krever kildesjekk | — | reject |
| Tora Berger | skiskytter | 2000–2010-tallet | VM 2016 i Holmenkollen | — | new_person |

## Recommended next place

{
  "recommendedPlaceId": "eidsvollsbygningen",
  "recommendedPlaceName": "Eidsvollsbygningen",
  "reason": "Eidsvollsbygningen combines an unusually large, bounded and source-rich cohort: the 1814 delegates and the regency were physically assembled and documented at this specific place. Only four people are currently linked, no dedicated series exists, and the remaining pool is broad enough for a sustained series without relying on generic Oslo associations.",
  "existingPeopleCoverage": 4,
  "estimatedStrongCandidatesRemaining": 90,
  "suggestedFirstBatchSize": 5,
  "suggestedSeriesDepth": 18
}

## Suggested first batch

Start with five cross-link/new-person records: Christian Frederik, Georg Sverdrup, Christian Magnus Falsen, Wilhelm Frimann Koren Christie, and Nicolai Wergeland. This tests the 1814 source pattern while keeping the first batch balanced across regency, presidency, constitution work, regional representation, and clergy. Subsequent batches should follow the official delegate roster rather than widening to people merely associated with Eidsvoll municipality.

## Places intentionally deprioritized

- **nationaltheatret** — 123 linked people and 12+ documented dedicated batches; further work needs a separately evidenced gap.
- **det_norske_teatret** — 55 linked people and 10 documented batches; not the next highest marginal coverage gain.
- **bislett_stadion** — 82 linked people and eight dedicated batches plus crosslink work; high saturation.
- **ullevaal_stadion** — 12 linked people but many focused historical sub-series already completed; remaining work is narrower than Eidsvoll.
- **chat_noir** — core batch already completed and the small institution pool is partly covered.
- **edderkoppen_scene** — full expansion validation documents a completed dedicated expansion.
