# Olaf Ryes plass — fullføring fase 8–24

Oppdatert: 2026-08-26

Olaf Ryes plass er gjort produksjonsklar som ett avgrenset park- og plassrom. Pakken bygger videre på den mergede fase 0–7-leveransen og endrer ikke koordinatene `[59.9231, 10.7589, 170]`.

PlaceCard bruker People, Objects, Brands og Related; Badge ligger separat og Quiz er obligatorisk. People er eksakt Olaf Rye og Eilert Sundt. Objects er Eilert Sundt-bysten og fontenen. Brands viser ærlig tomtilstand fordi Parkteatret er et eget nabobygg og verifisert logo/wordmark mangler. Related peker til fire egne canonicale steder.

Quiz er rich 5×7 med 19 fakta-, 9 kontekst- og 7 konsept-/teorispørsmål. De første 14 er normale stedsspørsmål; metode og teori begynner i finalefasen. Place-open viser 3 Stories, 3 språkoppføringer, 3 lesespor, 2 daterte 2026-arrangementer og 3 trygge onsite-oppgaver. EN, ES og PT er synkronisert mot gjeldende kildehash.

Olaf Ryes død er satt til 1849 etter Store norske leksikon. 1903/2009-bildene brukes som kildebelagte tidslag, ikke som identisk optisk før/etter-par. Daterte arrangementer beskrives som planlagt bruk. Parkteatret forblir nabokontekst og eies ikke av parkflaten.

Produksjonspakken ble mergret i PR #5342 og Pages-deployet fra `127e4058c84feebc172e546c1ef20fb9f15d07d3`. Live-QA avdekket at quizkort-runtime bare lastet litteraturmanifestet selv om Olaf-kortet allerede lå i By-katalogen. Den generelle katalogkoblingen ble rettet, testet og mergret i PR #5346, med vellykket Pages-deploy fra `9f9acad849b23ffeda12148d1bd9c48a650a56c0`.

Live re-QA på 1363×936 bekreftet riktig stedskort, People 2, Objects 2, ærlig tom Brands, Related 4, Events 2 og ingen horisontal overflow. Flippen viser nå `Byquiz`, Olaf Ryes plass, 10 spørsmål og fasit. `Ta quiz` åpner rich 5×7 med sett 1/5 og spørsmål 1/7. Den permanente responsive testen for 1100×760 og 390×844 passerte i PR #5348; samme kjøring godkjente quizkort-regresjonen, totalt 9/9 tester uten skip. Fase 21–24 er dermed lukket.
