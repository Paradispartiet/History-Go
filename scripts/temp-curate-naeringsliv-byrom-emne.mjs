#!/usr/bin/env node
import fs from "node:fs";
const file="data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json";
const all=JSON.parse(fs.readFileSync(file,"utf8"));
const item=all.find(x=>x.emne_id==="em_naering_byens_okonomiske_rom");
if(!item)throw new Error("Mangler emnet");
Object.assign(item,{
 definition:"Emnet undersøker hvordan arbeidsplasser, butikker, kontorer, industri, lager og tjenester fordeles i byen, og hvordan arealbruk, tomteverdi, transport, regulering og nærhet mellom virksomheter former den økonomiske geografien.",
 why_it_matters:"Økonomisk aktivitet er ikke tilfeldig plassert. Beliggenhet påvirker tilgang til arbeidskraft, kunder, leverandører og infrastruktur, mens virksomhetene selv endrer husleier, trafikk, nabolag og muligheten for annen bruk.",
 keywords:["næringsgeografi","lokalisering","arbeidsplasskonsentrasjon","arealbruk","tomteverdi","tilgjengelighet","klynge","fortrengning","pendling","funksjonsblanding"],
 key_concepts:["lokalisering","næringsgeografi","tilgjengelighet","agglomerasjon","arealbruk","tomteverdi","pendling","funksjonsblanding"],
 core_concepts:["lokalisering","næringsgeografi","tilgjengelighet","arealbruk","tomteverdi","agglomerasjon"],
 sub_concepts:["arbeidsplasskonsentrasjon","næringsklynge","pendlingsfelt","soneplan","fortrengning","randsonelokalisering","monofunksjon","transformasjonsområde"],
 key_questions:["Hvilke virksomheter og arbeidsplasser er samlet eller spredt i området, og hvordan har mønsteret endret seg?","Hvilke transportlinjer, tomtepriser, reguleringsvedtak og nabofunksjoner forklarer lokaliseringen?","Hvem får bedre tilgang til arbeid, kunder og tjenester, og hvem får lengre avstand eller høyere kostnader?","Hvordan påvirker næringsaktiviteten bolig, gatebruk, pendling, miljø og framtidig omforming?"],
 conflicts:["næringskonsentrasjon vs geografisk spredning","tilgjengelighet vs høye tomtepriser","arbeidsplasser vs boligpress","effektiv arealbruk vs funksjonsblanding","transformasjon vs kontinuitet"],
 ideological_dimensions:["markedsstyrt lokalisering vs aktiv arealpolitikk","sentralisering vs regional balanse","tomteverdi vs bruksbehov","økonomisk klynge vs sosial og funksjonell blanding"],
 analysis_axes:["sentrum vs periferi","konsentrasjon vs spredning","arbeidssted vs bosted","tilgjengelighet vs arealkostnad","privat lokalisering vs offentlig infrastruktur","nåværende bruk vs framtidig transformasjon"],
 quiz_angles:["map_business_location_pattern","connect_location_to_access_land_value_and_rules","trace_commuting_customer_and_supplier_reach","compare_economic_use_before_and_after_transformation"],
 blindspots:["Kart over registrerte virksomheter viser ikke hjemmearbeid, uformell økonomi eller mobile arbeidssteder.","Høy virksomhetstetthet betyr ikke automatisk at arbeidsplassene er tilgjengelige for dem som bor nærmest.","Offentlig transport og teknisk infrastruktur kan skape privat tomteverdi uten å være synlig i virksomhetens regnskap.","Omforming kan flytte økonomisk aktivitet til andre steder i stedet for å fjerne den."],
 question_surface_mode:"location-pattern-access-land-use-first",
 generator_use_note:"Start med et dokumentert mønster av virksomheter og arbeidsplasser. Koble plasseringen til transport, regulering, arealkostnad og faktisk tilgang før næringsgeografisk teori brukes.",
 overlap_resolution_note:"Bruk emnet for den romlige fordelingen av økonomisk aktivitet. Bruk finansdistrikt og kontorby for én bestemt kontorklynge, eiendom og byutvikling for kapitalobjektet, og logistikk og verdikjeder for vareflyten mellom steder.",
 anti_patterns:["Ikke forklar lokalisering bare med at området er sentralt.","Ikke bruk bydelens omdømme som bevis på næringsstruktur uten virksomhetsdata.","Ikke anta at nye arbeidsplasser erstatter tidligere arbeidsplasser i antall, kompetanse eller tilgjengelighet."],
 curation_status:"individually_curated",curation_batch:"naeringsliv_logistikk_rom_v1",curation_date:"2026-07-25"
});
fs.writeFileSync(file,JSON.stringify(all,null,2)+"\n");
