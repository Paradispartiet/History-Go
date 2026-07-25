#!/usr/bin/env node
import fs from "node:fs";
const file="data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json";
const all=JSON.parse(fs.readFileSync(file,"utf8"));
const item=all.find(x=>x.emne_id==="em_naering_havn_transport");
if(!item)throw new Error("Mangler emnet");
Object.assign(item,{
 definition:"Emnet undersøker hvordan havner, terminaler og transportnett kobler sjø, jernbane, vei og andre transportformer, og hvordan gods, passasjerer, dokumenter, arbeidslag og omlasting organiseres gjennom et konkret knutepunkt.",
 why_it_matters:"Havner og terminaler er mer enn kaier og kjøretøy. De samordner kapasitet, tid, kontroll, lager og transportmidler, og en flaskehals i ett punkt kan påvirke virksomheter og forsyning langt utenfor stedet.",
 keywords:["havn","terminal","transport","omlasting","intermodalitet","gods","kai","kontroll","rute","terminalkapasitet"],
 key_concepts:["transportknutepunkt","terminal","omlasting","intermodalitet","terminalkapasitet","rute","godsstrøm","varekontroll"],
 core_concepts:["havn","terminal","omlasting","intermodalitet","kapasitet","godsstrøm"],
 sub_concepts:["kai","kran","container","bulk","stykkgods","varekontroll","rutefrekvens","bakland"],
 key_questions:["Hvilke varer eller passasjerer går gjennom knutepunktet, og mellom hvilke transportformer og områder?","Hvordan foregår anløp, lossing, kontroll, mellomlagring, omlasting og videre transport?","Hvilke kaier, spor, veier, kraner, lagre, dokumenter og arbeidslag bestemmer kapasiteten?","Hvor oppstår venting, kø, konflikt, utslipp eller sårbarhet, og hvem påvirkes når terminalen svikter?"],
 conflicts:["høy gjennomstrømning vs trygg drift","havnedrift vs byutvikling","effektiv transport vs lokale utslipp og støy","stor terminal vs arealpress","standardisert last vs varierte varer"],
 ideological_dimensions:["transportvekst vs miljø- og byhensyn","nasjonal infrastruktur vs lokal belastning","offentlig havn vs kommersiell drift","fri vareflyt vs kontroll og dokumentasjon"],
 analysis_axes:["sjø vs land","anløp vs bakland","transport vs mellomlagring","kapasitet vs kø","global vareflyt vs lokal belastning","normaldrift vs stans"],
 quiz_angles:["trace_cargo_or_passenger_through_terminal","identify_modes_infrastructure_and_work_roles","locate_capacity_constraint_and_waiting","connect_port_operation_to_city_and_hinterland"],
 blindspots:["En kai er ikke alene en havn; funksjonen avhenger av terminal, bakland, dokumentasjon og videre transport.","Transporttid kan domineres av venting, kontroll og omlasting snarere enn selve reisen.","Havnas effektivitet kan flytte støy, utslipp og kø til nærliggende områder og transportkorridorer.","Passasjer-, container-, bulk- og stykkgodsterminaler har ulike arbeidsprosesser og skal ikke behandles likt."],
 question_surface_mode:"cargo-route-terminal-operation-first",
 generator_use_note:"Start med en bestemt vare- eller passasjerstrøm gjennom et navngitt knutepunkt. Følg rekkefølgen fra ankomst via kontroll og omlasting til videre transport før transport- eller nettverksteori introduseres.",
 overlap_resolution_note:"Bruk emnet for havnens eller terminalens konkrete operasjon. Bruk logistikk og verdikjeder for hele forsyningsforløpet, og byens økonomiske rom for lokalisering og arealvirkning.",
 anti_patterns:["Ikke beskriv havna bare som historisk byfront uten vare-, transport- eller arbeidsdata.","Ikke bruk transportvolum uten å angi varetype, periode og terminalfunksjon.","Ikke anta at raskere transport betyr kortere samlet ledetid når kontroll og venting er utelatt."],
 curation_status:"individually_curated",curation_batch:"naeringsliv_logistikk_rom_v1",curation_date:"2026-07-25"
});
fs.writeFileSync(file,JSON.stringify(all,null,2)+"\n");
