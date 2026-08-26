# Olaf Ryes plass — fullføring fase 8–24

Oppdatert: 2026-08-26

Olaf Ryes plass er gjort produksjonsklar som ett avgrenset park- og plassrom. Pakken bygger videre på den mergede fase 0–7-leveransen og endrer ikke koordinatene `[59.9231, 10.7589, 170]`.

PlaceCard bruker People, Objects, Brands og Related; Badge ligger separat og Quiz er obligatorisk. People er eksakt Olaf Rye og Eilert Sundt. Objects er Eilert Sundt-bysten og fontenen. Brands viser Parkteatrets kildebelagte venue-identitet ved Olaf Ryes plass 11 med logo hentet fra virksomhetens offisielle nettsted. Related peker til fire egne canonicale steder. Alle fire rundinger har bilde av et canonical medlem, og frontImage er en faktisk stående 900×1200-variant med dokumentert crop, kilde og lisens.

Quiz er rich 5×7 med 19 fakta-, 9 kontekst- og 7 konsept-/teorispørsmål. De første 14 er normale stedsspørsmål; metode og teori begynner i finalefasen. Place-open viser 3 Stories, 3 språkoppføringer, 3 lesespor, 2 daterte 2026-arrangementer og 3 trygge onsite-oppgaver. EN, ES og PT er synkronisert mot gjeldende kildehash.

Olaf Ryes død er satt til 1849 etter Store norske leksikon. 1903/2009-bildene brukes som kildebelagte tidslag, ikke som identisk optisk før/etter-par. Daterte arrangementer beskrives som planlagt bruk. Parkteatret forblir nabokontekst og eies ikke av parkflaten.

Produksjonspakken ble mergret i PR #5342 og Pages-deployet fra `127e4058c84feebc172e546c1ef20fb9f15d07d3`. Live-QA avdekket at quizkort-runtime bare lastet litteraturmanifestet selv om Olaf-kortet allerede lå i By-katalogen. Den generelle katalogkoblingen ble rettet, testet og mergret i PR #5346, med vellykket Pages-deploy fra `9f9acad849b23ffeda12148d1bd9c48a650a56c0`.

Den tidligere live-QA-en på 1363×936 bekreftet funksjonene, men avdekket ikke at Brands sto tom, at rundingene manglet medlemsbilder og at frontImage-kilden var liggende. Fase 21–24 er derfor gjenåpnet for denne visuelle kontraktskorrigeringen. Lokal data-, runtime- og kontrakt-QA er grønn; endelig closeout krever merge, Pages-deploy og ny manuell live-QA av alle fire rundinger og frontbildet.
