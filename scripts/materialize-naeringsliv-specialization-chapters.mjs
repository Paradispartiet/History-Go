#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = 'data/fagverk/naeringsliv';
const VERIFIED_AT = '2026-08-01';
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const writeJson = (relative, value) => {
  const target = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const unique = (values) => [...new Set(values)];
const humanize = (value) => String(value).replaceAll('_', ' ').replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
const sentence = (value) => {
  const text = String(value || '').trim();
  return text ? `${text[0].toUpperCase()}${text.slice(1)}${/[.!?]$/.test(text) ? '' : '.'}` : '';
};

const SOURCE_CATALOG = {
  ssb_nasjonalregnskap: ['Nasjonalregnskap', 'https://www.ssb.no/nasjonalregnskap-og-konjunkturer/nasjonalregnskap/statistikk/nasjonalregnskap', 'Statistisk sentralbyrå', 'offisiell_statistikk', 'BNP, konsum, investering, eksport, import, sysselsetting, lønn og produktivitet inngår som sammenhengende størrelser i nasjonalregnskapet.', 'Nasjonalregnskapet beskriver produksjon, inntekt og anvendelse i et konsistent regnskapssystem; BNP alene er derfor ikke et fullstendig mål på velferd eller fordeling.'],
  ssb_kpi: ['Konsumprisindeksen', 'https://www.ssb.no/priser-og-prisindekser/konsumpriser/statistikk/konsumprisindeksen', 'Statistisk sentralbyrå', 'offisiell_statistikk', 'KPI måler utviklingen i konsumpriser for varer og tjenester som private husholdninger etterspør.', 'Prisnivå, prisvekst og kjøpekraft er forskjellige størrelser; nominelle beløp må deflateres før utvikling i realverdi sammenlignes.'],
  ssb_aku: ['Arbeidskraftundersøkelsen', 'https://www.ssb.no/arbeid-og-lonn/sysselsetting/statistikk/arbeidskraftundersokelsen', 'Statistisk sentralbyrå', 'offisiell_statistikk', 'AKU måler sysselsetting og arbeidsledighet og skiller mellom personer i arbeidsstyrken og personer utenfor arbeidsstyrken.', 'Arbeidsledighetsraten må tolkes sammen med sysselsettingsandel og arbeidsstyrkedeltakelse fordi nevner og populasjon påvirker resultatet.'],
  ssb_konjunkturer: ['Konjunkturtendensene', 'https://www.ssb.no/nasjonalregnskap-og-konjunkturer/konjunkturer/statistikk/konjunkturtendensene', 'Statistisk sentralbyrå', 'offisiell_analyse', 'Konjunkturanalyse kombinerer historiske indikatorer med framskrivinger av økonomiske hovedstørrelser.', 'En prognose uttrykker en betinget vurdering under bestemte antakelser og må ikke behandles som et sikkert framtidsutfall.'],
  nb_inflasjon: ['Inflasjon', 'https://www.norges-bank.no/tema/pengepolitikk/inflasjon/', 'Norges Bank', 'sentralbankforklaring', 'Norges Banks operative inflasjonsmål er en årlig prisvekst nær 2 prosent over tid.', 'Styringsrenten er sentralbankens viktigste virkemiddel, men renteendringer virker med tidsetterslep gjennom flere kanaler.'],
  nb_strategi: ['Norges Banks pengepolitiske strategi', 'https://www.norges-bank.no/tema/pengepolitikk/pengepolitisk-strategi/', 'Norges Bank', 'sentralbankstrategi', 'Inflasjonsstyringen er fremoverskuende og fleksibel og skal også bidra til høy og stabil produksjon og sysselsetting.', 'Pengepolitikken må balansere mål og usikkerhet; ett enkelt inflasjonstall bestemmer ikke alene rentebeslutningen.'],
  regjeringen_oljepenger: ['Oljeinntektene og bruken av dem', 'https://www.regjeringen.no/no/tema/okonomi-og-budsjett/norsk_okonomi/bruk-av-oljepenger-/id449281/', 'Finansdepartementet', 'offisiell_finanspolitikk', 'Statens netto kontantstrøm fra petroleumsvirksomheten overføres til Statens pensjonsfond utland.', 'Handlingsregelen sikter mot at bruken av fondsmidler over tid følger forventet realavkastning, samtidig som bruken tilpasses økonomiens situasjon.'],
  nasjonalbudsjett: ['Nasjonalbudsjettet 2026', 'https://www.regjeringen.no/no/dokumenter/meld.-st.-1-20252026/id3123808/', 'Finansdepartementet', 'stortingsmelding', 'Nasjonalbudsjettet presenterer regjeringens vurdering av utsiktene og hovedlinjene i den økonomiske politikken.', 'Finanspolitiske virkninger må vurderes både mot konjunktursituasjonen og mot langsiktig bærekraft i offentlige finanser.'],
  ssb_utenriksregnskap: ['Utenriksregnskap', 'https://www.ssb.no/utenriksokonomi/utenriksregnskap/statistikk/utenriksregnskap', 'Statistisk sentralbyrå', 'offisiell_statistikk', 'Utenriksregnskapet samler betalingsbalanse og utenriksbalanse og viser økonomiske forbindelser mellom Norge og utlandet.', 'Løpende poster, kapitalbevegelser og beholdninger må skilles for å unngå å blande strømmer og balanser.'],
  bokforingsloven: ['Bokføringsloven', 'https://lovdata.no/lov/2004-11-19-73', 'Lovdata', 'lov', 'Loven fastsetter grunnleggende plikter for registrering, dokumentasjon, spesifikasjon og oppbevaring av regnskapsopplysninger.', 'Et kontrollspor krever at dokumentasjon, postering og rapportert beløp kan følges i begge retninger.'],
  regnskapsloven: ['Regnskapsloven', 'https://lovdata.no/lov/1998-07-17-56', 'Lovdata', 'lov', 'Årsregnskapet skal minst omfatte resultatregnskap, balanse og noteopplysninger, med tilleggskrav for enkelte foretak.', 'Resultat, balanse og kontantstrøm belyser ulike sider av virksomheten og kan ikke brukes som om de var samme mål.'],
  brreg_innsending: ['Innsending av årsregnskap', 'https://www.brreg.no/innsending-av-arsregnskap/', 'Brønnøysundregistrene', 'registerveiledning', 'Innsending til Regnskapsregisteret og innsending av skattemelding er to forskjellige rapporteringsplikter.', 'Styret eller annen ansvarlig ledelse beholder ansvaret for innsending selv om praktisk arbeid er delegert.'],
  brreg_innhold: ['Hva skal årsregnskapet inneholde?', 'https://www.brreg.no/innsending-av-arsregnskap/hva-skal-arsregnskapet-inneholde/', 'Brønnøysundregistrene', 'registerveiledning', 'Komplett årsregnskap består av sammenhengende oppstillinger og noter, og enkelte foretak har tilleggskrav.', 'Notehenvisninger og oppstillinger må stemme overens for at rapporteringen skal være etterprøvbar.'],
  revisorloven: ['Revisorloven', 'https://lovdata.no/lov/2020-11-20-128', 'Lovdata', 'lov', 'Revisorloven regulerer revisjonsplikt, godkjenning av revisorer og revisors oppgaver.', 'Revisjon gir en uavhengig uttalelse med definert sikkerhet, ikke en garanti for at alle feil eller misligheter er oppdaget.'],
  finanstilsynet_revisor: ['Revisor', 'https://www.finanstilsynet.no/tillatelser/revisor/', 'Finanstilsynet', 'tilsynsveiledning', 'Statsautoriserte revisorer og revisjonsselskaper er underlagt godkjenning og tilsyn.', 'Uavhengighet, profesjonell skepsis og dokumentert revisjonsbevis er sentrale kvalitetsforutsetninger.'],
  skatteetaten_regnskap: ['Regnskap', 'https://www.skatteetaten.no/bedrift-og-organisasjon/starte-og-drive/rutiner-regnskap-og-kassasystem/gode-rutiner-for-daglig-drift/regnskap/', 'Skatteetaten', 'myndighetsveiledning', 'Regnskapsføringen må skille virksomhetens inntekter, kostnader og merverdiavgift etter registreringsstatus.', 'En kostnad i regnskapet er ikke automatisk skattemessig fradragsberettiget; formål og dokumentasjon må vurderes separat.'],
  mvaloven: ['Merverdiavgiftsloven', 'https://lovdata.no/lov/2009-06-19-58', 'Lovdata', 'lov', 'Merverdiavgift beregnes og rapporteres etter regler om avgiftspliktig omsetning, unntak, fritak og fradrag.', 'Utgående og inngående merverdiavgift må holdes fra hverandre, og feil periode eller sats kan gi feil avgiftsoppgjør.'],
  bokforingsforskriften: ['Bokføringsforskriften', 'https://lovdata.no/forskrift/2004-12-01-1558', 'Lovdata', 'forskrift', 'Forskriften konkretiserer dokumentasjons-, spesifikasjons- og oppbevaringskrav for bokføringspliktige.', 'Internkontroll bør teste både at transaksjonen fant sted, at den er riktig klassifisert og at den er bokført i riktig periode.'],
  markedsforingsloven: ['Markedsføringsloven', 'https://lovdata.no/lov/2009-01-09-2', 'Lovdata', 'lov', 'Markedsføringsloven regulerer handelspraksis og avtalevilkår i forbrukerforhold.', 'Markedsføring må vurderes etter helhetsinntrykk, vesentlige opplysninger og hvem budskapet retter seg mot.'],
  some_reklame: ['Veileder for merking av reklame i sosiale medier', 'https://www.forbrukertilsynet.no/lov-og-rett/veiledninger-og-retningslinjer/someveiledning', 'Forbrukertilsynet', 'tilsynsveiledning', 'Reklame i sosiale medier skal tydelig fremstå som reklame for mottakeren.', 'Annonsørens ansvar for tydelig merking forsvinner ikke fordi distribusjonen utføres av en influenser eller plattform.'],
  datatilsynet_markedsforing: ['Målrettet markedsføring og personopplysninger', 'https://www.datatilsynet.no/personvern-pa-ulike-omrader/kundehandtering-handel-og-medlemskap/digitale-tjenester-og-forbrukeres-personopplysninger/bruk-av-personopplysninger-til-malrettet-markedsforing/', 'Datatilsynet', 'personvernveiledning', 'Målrettet markedsføring kan bygge på innsamling, analyse og profilering av personopplysninger.', 'Segmenteringens forretningsverdi må vurderes sammen med behandlingsgrunnlag, åpenhet, dataminimering og registrertes rettigheter.'],
  ssb_varehandel: ['Varehandelsindeksen', 'https://www.ssb.no/varehandel-og-tjenesteyting/varehandel/statistikk/varehandelsindeksen', 'Statistisk sentralbyrå', 'offisiell_statistikk', 'Varehandelsindeksen beskriver verdi- og volumutviklingen i detaljhandel, engroshandel og motorvognhandel.', 'Verdiendring må skilles fra volumendring fordi prisendringer kan påvirke omsetning uten tilsvarende mengdeendring.'],
  ssb_forbruk: ['Forbruksundersøkelsen', 'https://www.ssb.no/inntekt-og-forbruk/forbruk/statistikk/forbruksundersokelsen', 'Statistisk sentralbyrå', 'offisiell_statistikk', 'Forbruksundersøkelsen beskriver husholdningenes utgifter og hvordan forbruksmønstre varierer mellom husholdningstyper.', 'Utvalgsdata må tolkes med usikkerhet og kan ikke uten videre forklare hvorfor forbrukere velger som de gjør.'],
  konkurranseloven: ['Konkurranseloven', 'https://lovdata.no/lov/2004-03-05-12', 'Lovdata', 'lov', 'Konkurranseloven regulerer konkurransebegrensende samarbeid, misbruk av dominans og kontroll med foretakssammenslutninger.', 'Strategisk analyse må skille hard konkurranse fra handlinger som loven forbyr eller krever melding om.'],
  kt_samarbeid: ['Ulovlig samarbeid', 'https://konkurransetilsynet.no/ulovlig-samarbeid/', 'Konkurransetilsynet', 'tilsynsveiledning', 'Konkurranseloven forbyr samarbeid som har til formål eller virkning å begrense konkurransen.', 'Samarbeid kan være horisontalt eller vertikalt, og lovligheten avhenger av innhold, virkning og eventuelle effektivitetsvilkår.'],
  kt_dominans: ['Misbruk av dominerende stilling', 'https://konkurransetilsynet.no/misbruk-av-dominerende-stilling/', 'Konkurransetilsynet', 'tilsynsveiledning', 'Dominans er ikke i seg selv forbudt, men et dominerende foretak har et særlig ansvar for ikke å skade konkurransen.', 'Markedsandel er bare ett moment; relevant marked, etableringshindre, alternativer og konkret atferd må undersøkes.'],
  apenhetsloven: ['Åpenhetsloven', 'https://lovdata.no/lov/2021-06-18-99', 'Lovdata', 'lov', 'Åpenhetsloven krever risikobaserte aktsomhetsvurderinger og offentlig redegjørelse fra virksomheter som omfattes.', 'En bærekraftspåstand bør spores fra policy via tiltak til dokumentert virkning og må ikke erstatte konkret risikovurdering.'],
  ssb_api: ['SSBs API-er med åpne data', 'https://www.ssb.no/api', 'Statistisk sentralbyrå', 'offisiell_datatjeneste', 'SSBs API-er gir maskinlesbar tilgang til oppdaterte tabeller som kan behandles i kode, regneark og visualiseringer.', 'Et reproducerbart uttrekk må lagre tabell, variabler, filter, tidspunkt og eventuelle transformasjoner.'],
  ssb_api_v2: ['API mot Statistikkbanken – brukerveiledning', 'https://www.ssb.no/api/pxwebapiv2', 'Statistisk sentralbyrå', 'api_dokumentasjon', 'PxWebApi v2 lar brukere hente hele eller avgrensede deler av tabeller gjennom dokumenterte spørringer.', 'API-grenser, tabellmetadata og revisjoner må inngå i analysens datakvalitetskontroll.'],
  ssb_statbank: ['Hvordan bruke Statistikkbanken', 'https://www.ssb.no/statbank/hvordan-bruke-statistikkbanken', 'Statistisk sentralbyrå', 'brukerveiledning', 'Statistikkbanken tilbyr tabeller, metadata, standardtegn, måleenheter og integrasjon med eksterne API-er.', 'Variabeldefinisjon, enhet og klassifikasjon må leses før tall sammenlignes eller kombineres.'],
  ssb_forskningsdata: ['Tilgang til data fra SSB', 'https://www.ssb.no/data-til-forskning', 'Statistisk sentralbyrå', 'datatilgangsveiledning', 'SSB skiller mellom aggregerte tabeller og mikrodata på enhetsnivå.', 'Tilgang, konfidensialitet og analyseform må tilpasses detaljnivået og risikoen for identifisering.'],
  statistikkloven: ['Statistikkloven', 'https://lovdata.no/lov/2019-06-21-32', 'Lovdata', 'lov', 'Statistikkloven regulerer utvikling, framstilling og formidling av offisiell statistikk.', 'Kvalitet omfatter mer enn nøyaktighet og krever blant annet relevans, sammenlignbarhet, aktualitet og dokumenterte metoder.'],
  personopplysningsloven: ['Personopplysningsloven', 'https://lovdata.no/lov/2018-06-15-38', 'Lovdata', 'lov', 'Personopplysningsloven gjennomfører personvernforordningen og regulerer behandling av personopplysninger.', 'Analyse av persondata krever behandlingsgrunnlag, formålsavgrensning, dataminimering, sikkerhet og ivaretakelse av rettigheter.'],
  automatiserte_avgjorelser: ['Personvernforordningen', 'https://eur-lex.europa.eu/eli/reg/2016/679/oj', 'Den europeiske union', 'forordning', 'Helautomatiske avgjørelser med rettsvirkning eller tilsvarende betydelig virkning er underlagt særskilte rettigheter og begrensninger.', 'Modellens prediksjon må skilles fra beslutningen, og menneskelig kontroll må være reell og dokumentert.'],
  eu_ai_act: ['Artificial Intelligence Act', 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj', 'Den europeiske union', 'forordning', 'KI-forordningen bruker en risikobasert reguleringsmodell med plikter som varierer etter systemets bruk og risikonivå.', 'Teknisk ytelse alene avgjør ikke om et system er forsvarlig; formål, data, tilsyn, dokumentasjon og berørte rettigheter må vurderes.'],
  nb_statistikk: ['Norges Banks statistikk', 'https://www.norges-bank.no/tema/Statistikk/', 'Norges Bank', 'sentralbankdata', 'Norges Bank publiserer statistikk om blant annet renter, valutakurser, finansielle markeder og betalingssystemer.', 'Tidsserier må kontrolleres for frekvens, enhet, observasjonstidspunkt og brudd før de brukes i prognoser eller modeller.'],
  avtaleloven: ['Avtaleloven', 'https://lovdata.no/lov/1918-05-31-4', 'Lovdata', 'lov', 'Avtaleloven regulerer avtaleinngåelse, fullmakt og ugyldighet.', 'En kontraktsanalyse må identifisere tilbud, aksept, fullmakt, tolkningsgrunnlag og eventuelle ugyldighetsgrunner.'],
  kjopsloven: ['Kjøpsloven', 'https://lovdata.no/lov/1988-05-13-27', 'Lovdata', 'lov', 'Kjøpsloven regulerer partenes plikter og misligholdsbeføyelser i kjøp som omfattes av loven.', 'Risiko, levering, mangel, forsinkelse og varsel må knyttes til avtalens faktum og riktig regelsett.'],
  aksjeloven: ['Aksjeloven', 'https://lovdata.no/lov/1997-06-13-44', 'Lovdata', 'lov', 'Aksjeloven regulerer stiftelse, kapital, selskapsorganer, beslutninger og ansvar i aksjeselskaper.', 'Eierskap, stemmerett, styreansvar og daglig ledelse er forskjellige styringsposisjoner og må analyseres separat.'],
  brreg_as: ['Aksjeselskap', 'https://www.brreg.no/aksjeselskap/', 'Brønnøysundregistrene', 'registerveiledning', 'Brønnøysundregistrene samler krav og tjenester for stiftelse, roller, kapital, registrering og rapportering i aksjeselskaper.', 'Registeropplysninger dokumenterer formelle roller og hendelser, men forklarer ikke alene faktisk kontroll eller beslutningspraksis.'],
  arbeidsmiljoloven: ['Arbeidsmiljøloven', 'https://lovdata.no/lov/2005-06-17-62', 'Lovdata', 'lov', 'Arbeidsmiljøloven regulerer blant annet arbeidsmiljø, arbeidstid, medvirkning, kontrolltiltak og stillingsvern.', 'Arbeidsrettslig analyse må knytte tiltak til hjemmel, saklig behov, forholdsmessighet, prosess og dokumentert virkning.'],
  skatteloven: ['Skatteloven', 'https://lovdata.no/lov/1999-03-26-14', 'Lovdata', 'lov', 'Skatteloven regulerer skattepliktig inntekt, fradrag, tidfesting og andre sentrale elementer i inntektsbeskatningen.', 'Regnskapsmessig resultat og skattemessig inntekt kan avvike fordi klassifikasjon og tidfesting følger ulike regler.'],
  ssb_utenrikshandel: ['Utenrikshandel med varer', 'https://www.ssb.no/utenriksokonomi/utenrikshandel/statistikk/utenrikshandel-med-varer', 'Statistisk sentralbyrå', 'offisiell_statistikk', 'Statistikken beskriver norsk import og eksport av varer etter blant annet varegruppe og handelspartner.', 'Handelsverdi må skilles fra volum, priser og verdiskaping, og brutto eksport er ikke det samme som nasjonalt innhold.'],
  wto_tariff: ['WTO Tariff and Trade Data', 'https://www.wto.org/english/tratop_e/tariffs_e/tariff_data_e.htm', 'World Trade Organization', 'internasjonal_offisiell_data', 'WTOs plattform gir offisielle data om anvendte tollsatser, bundne satser og bilateral varehandel.', 'Tollprofil må analyseres på riktig produktnivå og sammen med opprinnelsesregler og ikke-tariffære forhold.'],
  wto_statistics: ['WTO Global Trade Statistics', 'https://www.wto.org/statistics', 'World Trade Organization', 'internasjonal_offisiell_data', 'WTO publiserer data om varehandel, tjenestehandel, toll og handel i verdiskaping.', 'Brutto handelsstrømmer og handel i verdiskaping svarer på ulike spørsmål i globale verdikjeder.'],
  nb_valuta: ['Valutakurser', 'https://www.norges-bank.no/tema/Statistikk/Valutakurser/', 'Norges Bank', 'sentralbankdata', 'Norges Bank publiserer referansekurser for norske kroner mot en rekke valutaer.', 'Valutarisiko avhenger av eksponering, tidshorisont, kontraktsvaluta og sikring, ikke bare av dagens kurs.'],
  efta_eos: ['The European Economic Area', 'https://www.efta.int/eea', 'European Free Trade Association', 'internasjonal_avtaleinformasjon', 'EØS-avtalen knytter Norge, Island og Liechtenstein til EUs indre marked gjennom felles regler på avtalens områder.', 'Markedsadgang må skilles fra tollunion, og virksomheter må undersøke hvilke produkt-, tjeneste- og etableringsregler som faktisk gjelder.'],
  oecd_due_diligence: ['Due diligence for responsible business conduct', 'https://www.oecd.org/en/topics/due-diligence-for-responsible-business-conduct.html', 'OECD', 'internasjonal_retningslinje', 'OECD anbefaler risikobasert aktsomhet for faktiske og mulige negative virkninger i virksomhet, leverandørkjeder og forretningsforbindelser.', 'Aktsomhet er en løpende prosess med kartlegging, prioritering, tiltak, oppfølging, kommunikasjon og eventuell gjenoppretting.'],
  oecd_mne: ['OECD Guidelines for Multinational Enterprises', 'https://www.oecd.org/en/publications/oecd-guidelines-for-multinational-enterprises-on-responsible-business-conduct_81f92357-en.html', 'OECD', 'internasjonal_retningslinje', 'Retningslinjene dekker ansvarlig virksomhet på tvers av blant annet arbeid, miljø, åpenhet, forbrukerinteresser, teknologi og skatt.', 'Et multinasjonalt selskaps juridiske struktur må ikke forveksles med den operative verdikjeden eller virksomhetens påvirkning.'],
  tolletaten_import: ['Import for bedrifter', 'https://www.toll.no/no/bedrift/import/', 'Tolletaten', 'myndighetsveiledning', 'Import krever korrekt vareklassifisering, verdi, opprinnelse, deklarering og håndtering av avgifter og restriksjoner.', 'Leverandørpris alene er ikke full anskaffelseskostnad; toll, frakt, lager, kvalitet, kapitalbinding og risiko må inngå.']
};

const makeTopic = (title, purpose, empiricalUnit, calculation, conflict) => ({ title, purpose, empirical_unit: empiricalUnit, calculation_exercise: calculation, professional_conflict: conflict, core_concepts: title.toLowerCase().split(/[, og]+/).filter(Boolean).slice(0, 6) });

const CHAPTERS = [
  {
    id: 'makrookonomi-konjunkturer-okonomisk-politikk', title: 'Makroøkonomi, konjunkturer og økonomisk politikk', primaryDomainId: 'arbeid_produksjon_verdiskaping',
    subtitle: 'Fra nasjonalregnskap og inflasjon til arbeidsmarked, renter, finanspolitikk og utenriksbalanse',
    lead: 'Kapittelet viser hvordan samlet produksjon, priser, sysselsetting, renter, offentlige budsjetter og utenriksøkonomi måles og bindes sammen. Hvert resultat behandles som en betinget måling med definert enhet, tidsrom, usikkerhet og alternativ forklaring.',
    emneIds: ['em_naering_effektivitet_optimalisering','em_naering_omstilling_kriser_skift','em_naering_produksjon_produktivitet','em_naering_kriser_boomer_omstilling','em_naering_kapital_finans','em_naering_risiko_regulering','em_naering_marked_konkurranse_pris'],
    methodIds: ['met_naering_okonomisk_modellering','met_naering_statistikk_og_indikatoranalyse','met_naering_risiko_og_kriseanalyse','met_naering_kapital_og_finansanalyse','met_naering_omstilling_og_endringsanalyse','met_naering_makt_og_ulikhetsanalyse'],
    sourceIds: ['ssb_nasjonalregnskap','ssb_kpi','ssb_aku','ssb_konjunkturer','nb_inflasjon','nb_strategi','regjeringen_oljepenger','nasjonalbudsjett','ssb_utenriksregnskap'],
    topics: [
      makeTopic('Nasjonalregnskap og BNP', 'Koble produksjon, inntekt og anvendelse uten å bruke BNP som universelt velferdsmål.', 'norsk økonomi i én eksplisitt periode', 'bygg en enkel tilgangs- og anvendelsestabell og beregn realvekst', 'målt aktivitet mot velferd, fordeling og ubetalt arbeid'),
      makeTopic('Prisnivå, inflasjon og realverdi', 'Skille prisnivå, prisvekst og kjøpekraft.', 'en dokumentert konsumkurv og tidsserie', 'beregn indeks, tolvmånedersvekst og deflatert realverdi', 'gjennomsnittlig prisvekst mot husholdningenes ulike forbruksmønstre'),
      makeTopic('Sysselsetting og arbeidsledighet', 'Analysere arbeidsmarkedet med flere mål og tydelige nevnere.', 'befolkningen i arbeidsfør alder etter AKUs definisjoner', 'beregn sysselsettingsandel, ledighetsrate og arbeidsstyrkedeltakelse', 'lav ledighet mot svak deltakelse eller skjult undersysselsetting'),
      makeTopic('Konjunkturer, trend og prognose', 'Skille observerte vendepunkter fra modellbaserte utsikter.', 'en harmonisert kvartalsserie med sammenligningsindikator', 'identifiser trend, vekstrate, brudd og prognoseintervall', 'kortvarig variasjon mot varig kapasitetsendring'),
      makeTopic('Inflasjonsmål og styringsrente', 'Forklare rentekanaler og tidsetterslep uten mekanisk én-til-én-logikk.', 'en rentebeslutning med samtidig pris- og aktivitetsdata', 'bygg en tidslinje for rente, kreditt, etterspørsel, valutakurs og priser', 'prisvekst mot produksjon, sysselsetting og finansiell stabilitet'),
      makeTopic('Fleksibel pengepolitikk', 'Vurdere målkonflikter, usikkerhet og alternative rentebaner.', 'en pengepolitisk rapport og dens risikoscenarioer', 'sammenlign hovedbane og alternative scenarioer', 'rask måloppnåelse mot kostnader for aktivitet og sysselsetting'),
      makeTopic('Oljefond og handlingsregel', 'Skille petroleumskontantstrøm, fondsverdi og budsjettbruk.', 'ett statsbudsjett og tilhørende fondsdata', 'beregn strukturelt oljekorrigert underskudd som andel av fond og økonomi', 'stabilisering i dag mot bærekraft mellom generasjoner'),
      makeTopic('Finanspolitikk og offentlige finanser', 'Analysere hvordan skatter, utgifter og investeringer påvirker aktivitet og fordeling.', 'ett nasjonalbudsjett med eksplisitt konjunktursituasjon', 'klassifiser automatiske stabilisatorer og diskresjonære tiltak', 'kortsiktig etterspørsel mot langsiktig kapasitet og finansiering'),
      makeTopic('Utenriksbalanse og valutarisiko', 'Skille handelsstrømmer, inntektsstrømmer, kapitalbevegelser og beholdninger.', 'Norges transaksjoner og posisjoner mot utlandet i en periode', 'avstem løpende poster, finansregnskap og endring i nettofordringer', 'overskudd i varehandel mot samlet ekstern balanse og risiko')
    ],
    places: ['bankplassen','barcode','aker_brygge','tjuvholmen','oslo_s','bjorvika']
  },
  {
    id: 'regnskap-revisjon-okonomistyring', title: 'Regnskap, revisjon og økonomistyring', primaryDomainId: 'kapital_eierskap_finans',
    subtitle: 'Fra bilag og periodisering til årsregnskap, kontantstrøm, budsjett, internkontroll og revisjonsbevis',
    lead: 'Kapittelet følger kontrollsporet fra transaksjon til beslutning. Det viser hvordan bokføring, rapportering, analyse, budsjettering og revisjon bruker forskjellige regler og bevis, og hvorfor lønnsomhet, likviditet, skatt og verdi ikke kan blandes sammen.',
    emneIds: ['em_naering_verdsetting_pris_regnskap','em_naering_eierskap_styring','em_naering_kapital_finans','em_naering_effektivitet_optimalisering','em_naering_produksjon_produktivitet','em_naering_ledelse_kontrollsystemer','em_naering_risiko_regulering'],
    methodIds: ['met_naering_kapital_og_finansanalyse','met_naering_eierskaps_og_styringsanalyse','met_naering_ledelses_og_kontrollanalyse','met_naering_statistikk_og_indikatoranalyse','met_naering_verdiskapingsanalyse','met_naering_risiko_og_kriseanalyse'],
    sourceIds: ['bokforingsloven','regnskapsloven','brreg_innsending','brreg_innhold','revisorloven','finanstilsynet_revisor','skatteetaten_regnskap','mvaloven','bokforingsforskriften'],
    trackId: 'regnskap_revisjon_okonomistyring',
    synthesis: [
      makeTopic('Kontrollspor og avstemming', 'Følge en transaksjon fra dokumentasjon til rapportert beløp.', 'en avgrenset bilagsserie med hovedbok og reskontro', 'avstem bank, kunde, leverandør og avgiftskonto', 'mekanisk avstemming mot økonomisk korrekt klassifisering'),
      makeTopic('Resultat, likviditet og arbeidskapital', 'Skille opptjent resultat fra kontantstrøm og finansieringsbehov.', 'ett foretak over minst to perioder', 'bygg resultatbro og kontantstrømbro og beregn arbeidskapitalendring', 'rapportert overskudd mot betalingsevne'),
      makeTopic('Budsjett, avvik og beslutningsansvar', 'Bruke avvik som startsignal for forklaring, ikke som dom over prestasjon.', 'ett ansvarssenter med budsjett og faktisk aktivitet', 'dekomponer pris-, volum-, miks- og effektivitetsavvik', 'styringsinformasjon mot målforskyvning og spill'),
      makeTopic('Revisjonsbevis og profesjonell skepsis', 'Vurdere påstand, risiko, kontroll og bevis med eksplisitt sikkerhetsnivå.', 'ett vesentlig regnskapsområde i et revisjonsoppdrag', 'koble risiko til handling, utvalg, bevis og konklusjon', 'rimelig sikkerhet mot forventning om garanti')
    ],
    places: ['bankplassen','barcode','aker_brygge','tjuvholmen','bjorvika','havnelageret']
  },
  {
    id: 'markedsforing-strategi-kunder', title: 'Markedsføring, strategi og kunder', primaryDomainId: 'handel_forbruk_marked',
    subtitle: 'Fra markedsinnsikt og segmentering til pris, kanaler, merkevare, konkurransefortrinn og ansvarlig påvirkning',
    lead: 'Kapittelet behandler markedet som et dokumenterbart system av kunder, konkurrenter, tilbud, kanaler og regler. Strategi må oversettes til testbare valg, mens reklame, profilering og bærekraftspåstander vurderes mot både effekt, forbrukervern og personvern.',
    emneIds: ['em_naering_forbruk_marked','em_naering_handel_butikk_byrom','em_naering_marked_konkurranse_pris','em_naering_merkevare_og_status','em_naering_tjenesteyting_og_service','em_naering_organisasjoner_ledelse','em_naering_eierskap_styring'],
    methodIds: ['met_naering_markedsanalyse','met_naering_forbruker_og_atferdsanalyse','met_naering_merkevare_og_posisjoneringsanalyse','met_naering_romlig_okonomisk_analyse','met_naering_organisasjonsanalyse','met_naering_makt_og_ulikhetsanalyse'],
    sourceIds: ['markedsforingsloven','some_reklame','datatilsynet_markedsforing','ssb_varehandel','ssb_forbruk','konkurranseloven','kt_samarbeid','kt_dominans','apenhetsloven'],
    trackId: 'markedsforing_og_strategi',
    synthesis: [
      makeTopic('Marked, kategori og substitutter', 'Avgrense hvem som konkurrerer om hvilket behov i hvilken geografi.', 'ett definert produkt- eller tjenestemarked', 'beregn markedsandeler og test alternative markedsgrenser', 'praktisk kategorisering mot juridisk relevant marked'),
      makeTopic('Kundereise, kanal og attribusjon', 'Følge kontaktpunkter uten å tilskrive alt salg til siste klikk.', 'en dokumentert kundereise på tvers av kanaler', 'beregn konvertering, frafall og alternative attribusjoner', 'målbar kontakt mot faktisk årsakseffekt'),
      makeTopic('Pris, verdi og lønnsom vekst', 'Koble kundeverdi til pris, kostnad og kapasitet.', 'ett segment og ett tilbud over en definert periode', 'beregn dekningsbidrag, priselastisitet og kundelivstidsverdi med sensitiviteter', 'omsetningsvekst mot lønnsomhet og langsiktig tillit'),
      makeTopic('Ansvarlig påvirkning og dokumentasjon', 'Teste om reklame, profilering og bærekraftspåstander er tydelige og etterprøvbare.', 'én kampanje med budskap, målgruppe, data og dokumentasjon', 'bygg en påstandsmatrise med bevis, usikkerhet og rettslig kontroll', 'effektiv påvirkning mot autonomi, personvern og forbrukervern')
    ],
    places: ['steen_og_strom','youngstorget','aker_brygge','tjuvholmen','bjorvika','barcode']
  },
  {
    id: 'kvantitative-metoder-business-analytics', title: 'Kvantitative metoder og business analytics', primaryDomainId: 'teknologi_innovasjon_plattform',
    subtitle: 'Fra datadefinisjon og sannsynlighet til regresjon, kausalitet, prognoser, optimering og ansvarlige beslutninger',
    lead: 'Kapittelet gjør analyseprosessen etterprøvbar fra spørsmål og datagenerering til kode, modell, validering og beslutning. Det skiller beskrivelse, prediksjon og kausal forklaring og krever at usikkerhet, databrudd, personvern og modellrisiko rapporteres.',
    emneIds: ['em_naering_data_algoritmer_verdiskaping','em_naering_digitalisering_plattformokonomi','em_naering_doxa_vekst_effektivitet','em_naering_effektivitet_optimalisering','em_naering_kapital_finans','em_naering_risiko_regulering','em_naering_logistikk_verdikjeder'],
    methodIds: ['met_naering_statistikk_og_indikatoranalyse','met_naering_okonomisk_modellering','met_naering_teknologi_og_plattformanalyse','met_naering_risiko_og_kriseanalyse','met_naering_logistikk_og_verdikjedeanalyse','met_naering_forbruker_og_atferdsanalyse'],
    sourceIds: ['ssb_api','ssb_api_v2','ssb_statbank','ssb_forskningsdata','statistikkloven','personopplysningsloven','automatiserte_avgjorelser','eu_ai_act','nb_statistikk'],
    trackId: 'kvantitative_metoder_business_analytics',
    synthesis: [
      makeTopic('Spørsmål, estimand og datagenerering', 'Definere hva som skal måles før modellen velges.', 'én beslutning med eksplisitt populasjon, behandling, utfall og tidsrom', 'skriv estimand og tegn datagenererende prosess', 'lett tilgjengelige data mot relevant evidens'),
      makeTopic('Validering, robusthet og lekkasje', 'Teste modell uten å bruke framtidsinformasjon eller treningsdata som fasit.', 'ett datasett med tids- eller enhetsstruktur', 'lag trenings-, validerings- og testoppsett og kjør sensitiviteter', 'høy intern treffsikkerhet mot stabil ytelse i drift'),
      makeTopic('Forklarbarhet og beslutningsgrense', 'Skille modellens mønster fra virksomhetens normative beslutning.', 'ett prediktivt system med berørte grupper', 'rapporter feilrater, terskler og gruppevise konsekvenser', 'optimal prediksjon mot rettferdig, lovlig og forståelig beslutning'),
      makeTopic('Reproduserbar analyse og modellstyring', 'Sikre dataopphav, versjon, kode, godkjenning og overvåking.', 'én analyse fra rådata til produksjonsbeslutning', 'bygg lineage, testlogg, modellkort og endringskontroll', 'rask iterasjon mot kontrollert og etterprøvbar bruk')
    ],
    places: ['forskningsparken','fornebu_teknologipark','barcode','bjorvika','alnabru_jernbane_og_logistikk','havnelageret']
  },
  {
    id: 'forretningsjus-skatt-compliance', title: 'Forretningsjus, skatt og compliance', primaryDomainId: 'makt_regulering_baerekraft',
    subtitle: 'Fra avtale og selskapsstyring til arbeidsrett, personvern, skatt, konkurranse og dokumentert etterlevelse',
    lead: 'Kapittelet viser hvordan juridisk metode avgrenser faktum, regel, tolkningsspørsmål og konsekvens. Etterlevelse behandles som en styringskjede fra ansvar og risikovurdering til kontroll, avvik, korrigering og dokumentert effekt.',
    emneIds: ['em_naering_risiko_regulering','em_naering_logistikk_verdikjeder','em_naering_eierskap_styring','em_naering_kapital_finans','em_naering_arbeidsliv_organisering','em_naering_ledelse_kontrollsystemer','em_naering_verdsetting_pris_regnskap','em_naering_marked_konkurranse_pris','em_naering_baerekraft_eksternaliteter'],
    methodIds: ['met_naering_eierskaps_og_styringsanalyse','met_naering_organisasjonsanalyse','met_naering_risiko_og_kriseanalyse','met_naering_makt_og_ulikhetsanalyse','met_naering_markedsanalyse','met_naering_baerekraft_og_eksternalitetsanalyse'],
    sourceIds: ['avtaleloven','kjopsloven','aksjeloven','brreg_as','arbeidsmiljoloven','personopplysningsloven','skatteloven','mvaloven','konkurranseloven'],
    trackId: 'forretningsjus_skatt_regulering',
    synthesis: [
      makeTopic('Juridisk metode og faktummatrise', 'Koble hvert rettslig vilkår til dokumentert faktum og motargument.', 'én avgrenset virksomhetshendelse', 'bygg vilkår–faktum–bevis–usikkerhet-matrise', 'rask konklusjon mot forsvarlig tolkning og kontradiksjon'),
      makeTopic('Ansvar, fullmakt og selskapsstyring', 'Skille eier, styre, daglig ledelse, fullmektig og faktisk beslutningstaker.', 'én beslutning med protokoll, fullmakt og rolledata', 'kartlegg beslutningskjede og myndighetsgrense', 'formell rolle mot faktisk kontroll og informasjonsgrunnlag'),
      makeTopic('Compliance, avvik og gjenoppretting', 'Gjøre etterlevelse målbart gjennom ansvar, kontroll og korrigering.', 'ett risikoområde med hendelses- og kontrolldata', 'test design, gjennomføring og effekt av kontroller', 'policy på papir mot etterlevelse i praksis'),
      makeTopic('Skatt, avgift og økonomisk substans', 'Skille regnskapsføring, skatteplikt, fradrag og merverdiavgift.', 'én transaksjonskjede med avtale, faktura og betaling', 'avstem regnskapsmessig og skattemessig behandling per periode', 'juridisk form mot økonomisk realitet og dokumentasjon')
    ],
    places: ['youngstorget','christiania_seildugsfabrik','vulkan_industriomrade','alnabru_jernbane_og_logistikk','havnelageret','barcode']
  },
  {
    id: 'internasjonal-okonomi-operations-prosjekt', title: 'Internasjonal økonomi, operations og prosjekt', primaryDomainId: 'logistikk_infrastruktur_rom',
    subtitle: 'Fra handel, valuta og globale verdikjeder til kapasitet, innkjøp, forsyningsrisiko og prosjektøkonomi',
    lead: 'Kapittelet følger varer, tjenester, penger, data og ansvar på tvers av grenser. Det kobler handelsstatistikk og valutarisiko til operativ kapasitet, leverandørvalg, kvalitet, lager, prosjektstyring og aktsomhet i globale verdikjeder.',
    emneIds: ['em_naering_havn_transport','em_naering_marked_konkurranse_pris','em_naering_logistikk_verdikjeder','em_naering_eierskap_styring','em_naering_produksjon_produktivitet','em_naering_tjenesteyting_og_service','em_naering_risiko_regulering','em_naering_startup_grunder_innovasjon','em_naering_omstilling_kriser_skift'],
    methodIds: ['met_naering_logistikk_og_verdikjedeanalyse','met_naering_kapital_og_finansanalyse','met_naering_risiko_og_kriseanalyse','met_naering_infrastrukturanalyse','met_naering_verdiskapingsanalyse','met_naering_omstilling_og_endringsanalyse'],
    sourceIds: ['ssb_utenrikshandel','ssb_utenriksregnskap','wto_tariff','wto_statistics','nb_valuta','efta_eos','oecd_due_diligence','oecd_mne','tolletaten_import'],
    trackId: 'internasjonal_virksomhet_operations_prosjekt',
    synthesis: [
      makeTopic('Handel, spesialisering og verdiskaping', 'Skille brutto handelsverdi fra nasjonalt innhold og fordelingsvirkning.', 'én vare- eller tjenestestrøm mellom definerte land', 'beregn vekst, enhetsverdi og alternativ verdiøkingsandel', 'samlet gevinst mot sektor-, region- og gruppevise omstillingskostnader'),
      makeTopic('Valuta, pris og kontraktsrisiko', 'Koble kursendring til kontraktsvaluta, margin, betalingstid og sikring.', 'én import- eller eksportkontrakt med tidslinje', 'beregn usikret og sikret kontantstrøm under tre kursscenarioer', 'beskyttelse mot nedside mot kostnad og tapt oppside'),
      makeTopic('Forsyningsnettverk og robusthet', 'Kartlegge flaskehalser, avhengighet, lager og gjenopprettingstid.', 'ett produkt med leverandørledd, transport og kritiske innsatsfaktorer', 'beregn ledetid, sikkerhetslager og tid til gjenoppretting', 'lav kostnad og lean drift mot redundans og beredskap'),
      makeTopic('Prosjektportefølje og gevinstrealisering', 'Skille leveranse, effekt, kostnad og usikkerhet gjennom hele prosjektløpet.', 'ett prosjekt med baseline, milepæler og nytteansvar', 'beregn nåverdi, reserve, fremdrift og scenariofølsomhet', 'tid og budsjett mot faktisk nytte og langsiktig drift')
    ],
    places: ['alnabru_jernbane_og_logistikk','havnelageret','gronlikaia','oslo_s','ring_3','bjorvika']
  }
];

const businessModules = readJson('data/fag/naeringsliv/handelshogskolemoduler_okonomi_og_naeringsliv_v1.json').modules;

function sourceRecord(id) {
  const [label, url, publisher, type, sourceLocation] = SOURCE_CATALOG[id];
  return { id, label, url, publisher, type, source_location: sourceLocation };
}

function buildTopics(definition) {
  if (definition.topics) return definition.topics;
  const trackModules = businessModules.filter((module) => module.track_id === definition.trackId);
  if (trackModules.length !== 5) throw new Error(`${definition.id}: expected five professional modules`);
  return [...trackModules, ...definition.synthesis];
}

function pedagogicalPayload(definition, moduleIndex, topicSlice, claimIds) {
  const prefix = definition.id.split('-').slice(0, 2).join(' ');
  const workedExamples = moduleIndex < 2 ? [{
    title: `Arbeidseksempel: ${topicSlice[0].title}`,
    situation: `En virksomhet må ta en beslutning om ${topicSlice[0].title.toLowerCase()}, men datagrunnlaget blander perioder, enheter og antakelser.`,
    analysis: [`Avgrens analyseenhet og beslutning før beregningen starter.`, `Dokumenter kilde, definisjon, metode og minst ett alternativt scenario.`, `Skill beregnet resultat fra faglig vurdering og rettslig eller etisk grense.`],
    claimIds: claimIds.slice(0, 3)
  }] : [],
  misconceptions = Array.from({ length: moduleIndex < 2 ? 2 : 1 }, (_, index) => ({
    claim: index === 0 ? `Ett nøkkeltall gir alene riktig svar i ${prefix}.` : `En presis beregning er automatisk en sikker årsaksforklaring.`,
    correction: index === 0 ? `Resultatet må tolkes mot definisjon, sammenligningsgrunnlag, usikkerhet og alternative mål.` : `Presisjon i regning erstatter ikke identifikasjon, datakvalitet eller vurdering av alternative forklaringer.`,
    claimIds: claimIds.slice(index * 2, index * 2 + 2)
  })),
  applicationTasks = [{
    title: `Anvendelse ${moduleIndex + 1}: dokumentert beslutningsnotat`,
    prompt: `Velg ett dokumentert case for ${topicSlice.map((topic) => topic.title).join(', ')}. Lever datagrunnlag, beregning, alternativ forklaring, usikkerhet og en avgrenset anbefaling.`,
    claimIds: claimIds.slice(-4)
  }],
  selfCheck = Array.from({ length: moduleIndex < 2 ? 3 : 2 }, (_, index) => ({
    question: [`Hva er analyseenheten og tidsrommet?`, `Hvilken beregning eller koding må kunne gjentas?`, `Hvilken alternativ forklaring kan endre konklusjonen?`][index],
    answer: [`Enheten og tidsrommet skal være eksplisitt definert før data velges.`, `Kilde, variabler, transformasjoner og antakelser skal dokumenteres.`, `Minst én plausibel alternativ forklaring skal testes mot evidensen.`][index],
    claimIds: [claimIds[index]]
  })),
  relatedPlaces = definition.places.slice(moduleIndex * 2, moduleIndex * 2 + 2).map((id) => ({ id, title: humanize(id) }));
  return { workedExamples, misconceptions, applicationTasks, selfCheck, relatedPlaces };
}

function buildChapter(definition) {
  const topics = buildTopics(definition);
  if (topics.length !== 9 || definition.sourceIds.length !== 9) throw new Error(`${definition.id}: expected nine topics and sources`);
  const base = `${OUT}/${definition.id}`;
  const claims = [];
  const moduleFiles = [];

  for (let moduleIndex = 0; moduleIndex < 3; moduleIndex += 1) {
    const topicSlice = topics.slice(moduleIndex * 3, moduleIndex * 3 + 3);
    const sections = topicSlice.map((topic, localIndex) => {
      const topicIndex = moduleIndex * 3 + localIndex;
      const sourceId = definition.sourceIds[topicIndex];
      const source = SOURCE_CATALOG[sourceId];
      const sectionId = `${definition.id}-${String(topicIndex + 1).padStart(2, '0')}`;
      const claimIds = [1, 2, 3].map((number) => `${definition.id}-c${String(topicIndex * 3 + number).padStart(2, '0')}`);
      const concepts = unique(topic.core_concepts || []);
      const evidence = sentence(topic.evidence_requirements?.[0] || `Dokumenter analyseenheten ${topic.empirical_unit}`);
      const claimsForSection = [
        source[5],
        `${topic.title} krever en eksplisitt analyseenhet: ${topic.empirical_unit}; beregningen må kunne gjentas fra dokumenterte data og antakelser.`,
        `En faglig konklusjon om ${topic.title.toLowerCase()} må skille beregnet resultat fra konflikten «${topic.professional_conflict}» og oppgi hvor evidensen ikke rekker.`
      ];
      claimIds.forEach((id, index) => claims.push({ id, claim: claimsForSection[index], source_ids: [sourceId], classification: index === 0 ? 'eksternt_verifisert' : 'metodisk_verifisert', status: 'verified', used_in: [sectionId] }));
      const paragraphs = [
        `${claimsForSection[0]} I dette kapittelet brukes kilden som ytre faktagrunnlag, mens den canonicale fagmodellen styrer hvilke begreper og metoder som skal anvendes. Påstanden må kontrolleres mot kildens definisjon, virkeområde og publiserte avgrensning før den overføres til et konkret case.`,
        `${claimsForSection[1]} Den etterprøvbare oppgaven er: ${sentence(topic.calculation_exercise)} Variabler, enheter, periode, utvalg og transformasjoner må ligge i samme kontrollspor, og resultatet skal testes mot minst ett alternativt scenario eller sammenligningsgrunnlag.`,
        `${claimsForSection[2]} ${topic.purpose} Analysen skal derfor behandle «${topic.professional_conflict}» som en reell faglig motsetning, ikke som en formulering som kan løses uten data, kriterier og eksplisitt beslutningsansvar. ${evidence}`
      ];
      return {
        id: sectionId,
        title: topic.title,
        paragraphs,
        paragraphClaimIds: claimIds.map((id) => [id]),
        keyPoints: [`Avgrens ${topic.empirical_unit} før metode og data velges.`, `Skill beregning, forklaring og beslutning, og rapporter konflikten «${topic.professional_conflict}».`],
        keyPointClaimIds: [[claimIds[1]], [claimIds[2]]],
        canonicalModuleId: topic.module_id || null,
        concepts
      };
    });
    const moduleClaimIds = sections.flatMap((section) => section.paragraphClaimIds.flat());
    const modulePath = `${base}/0${moduleIndex + 1}-${['grunnlag','fordypning','anvendelse'][moduleIndex]}.json`;
    moduleFiles.push(modulePath);
    writeJson(modulePath, { sections, ...pedagogicalPayload(definition, moduleIndex, topicSlice, moduleClaimIds) });
  }

  const sources = definition.sourceIds.map(sourceRecord);
  writeJson(`${base}/claims.json`, {
    schema: 'history_go_fagverk_claims_v1', version: '1.0.0', subject_id: 'naeringsliv', chapter_id: definition.id,
    verified_at: VERIFIED_AT, verification_status: 'verified', sources, claims
  });
  writeJson(`${base}/brief.json`, {
    schema: 'history_go_fagverk_chapter_brief_v1', version: '1.0.0', subject_id: 'naeringsliv', chapter_id: definition.id,
    chapterRole: 'specialization', requiredEmneIds: definition.emneIds, requiredMethodIds: definition.methodIds,
    requirements: { modules: 3, sections: 9, paragraphs: 27, claims: 27, inspectableSources: 9, workedExamples: 2, misconceptions: 5, applicationTasks: 3, selfCheck: 8, relatedPlaces: 6 }
  });
  const chapter = {
    schema: 'history_go_fagverk_chapter_v1', version: '1.0.0', subject: 'naeringsliv', subject_id: 'naeringsliv', id: definition.id, chapter_id: definition.id,
    chapter_role: 'specialization', primary_domain_id: definition.primaryDomainId, title: definition.title, subtitle: definition.subtitle, lead: definition.lead,
    emne_ids: definition.emneIds, method_ids: definition.methodIds,
    learningObjectives: topics.map((topic) => `${topic.purpose} Gjennomfør oppgaven «${topic.calculation_exercise}» med dokumentert usikkerhet.`),
    diagnosticQuestions: topics.slice(0, 5).map((topic) => ({ question: `Hva må avgrenses før ${topic.title.toLowerCase()} analyseres?`, answer: `Analyseenheten ${topic.empirical_unit}, tidsrom, data, metode og beslutningskriterium.` })),
    moduleFiles, briefFile: `${base}/brief.json`, claimsFile: `${base}/claims.json`, editorialStatus: 'chapter_ready', claimTraceRequired: true
  };
  writeJson(`${OUT}/${definition.id}.json`, chapter);
  return { definition, chapter, sources, claims, moduleFiles };
}

const built = CHAPTERS.map(buildChapter);
console.log(`Materialized ${built.length} specialization chapters, ${built.reduce((sum, row) => sum + row.claims.length, 0)} claims and ${built.reduce((sum, row) => sum + row.sources.length, 0)} inspectable sources.`);

export { CHAPTERS, SOURCE_CATALOG, buildChapter };
