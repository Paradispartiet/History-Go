#!/usr/bin/env node
import fs from "node:fs";
const file="data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json";
const all=JSON.parse(fs.readFileSync(file,"utf8"));
const item=all.find(x=>x.emne_id==="em_naering_logistikk_verdikjeder");
if(!item)throw new Error("Mangler emnet");
Object.assign(item,{
 definition:"Emnet undersøker hvordan råvarer, komponenter, ferdigvarer, informasjon og betaling beveger seg gjennom leverandører, produksjon, lager, transport, distribusjon, salg, retur og avfall i en sammenhengende verdikjede.",
 why_it_matters:"Virksomheten som selger sluttproduktet kontrollerer sjelden alle ledd. Lagerstrategi, ledetid, leverandøravhengighet, sporbarhet og kontrakter bestemmer kostnad, leveringsevne, arbeidsvilkår og motstandskraft mot avbrudd.",
 keywords:["logistikk","verdikjede","forsyningskjede","leverandør","lager","ledetid","sporbarhet","beholdning","distribusjon","resiliens"],
 key_concepts:["verdikjede","forsyningskjede","ledetid","lagerbeholdning","sporbarhet","leverandørnivå","flaskehals","forsyningsresiliens"],
 core_concepts:["verdikjede","forsyningskjede","ledetid","lager","sporbarhet","flaskehals"],
 sub_concepts:["første- og andreleverandør","sikkerhetslager","just-in-time","returlogistikk","ordrepunkt","distribusjonsnett","bullwhip-effekt","opprinnelse"],
 key_questions:["Hvilke råvarer, komponenter, tjenester og data inngår, og hvilke aktører kontrollerer hvert ledd?","Hvor lang er ledetiden, hvor holdes lager, og hvilke punkter kan stoppe hele leveransen?","Hvordan deles pris, risiko, arbeidskrav og miljøkostnader mellom hovedvirksomhet og leverandører?","Hvilke sporbarhets-, reserve- og returordninger finnes når kvalitet svikter eller forsyningen brytes?"],
 conflicts:["lav lagerbinding vs forsyningssikkerhet","lav innkjøpspris vs leverandørvilkår","global spesialisering vs lokal robusthet","hurtig levering vs miljøbelastning","effektiv kjede vs sporbarhet og kontroll"],
 ideological_dimensions:["just-in-time vs beredskapslager","fri global handel vs strategisk selvforsyning","hovedselskapets ansvar vs leverandøruavhengighet","kostnadsoptimalisering vs rettferdig verdifordeling"],
 analysis_axes:["oppstrøms vs nedstrøms","vareflyt vs informasjonsflyt","lager vs ledetid","kostnad vs robusthet","hovedvirksomhet vs leverandør","lineær kjede vs retur og sirkulasjon"],
 quiz_angles:["reconstruct_end_to_end_value_chain","identify_inventory_lead_time_and_bottleneck","trace_price_risk_and_work_across_suppliers","evaluate_traceability_reserve_and_return_flow"],
 blindspots:["Første leverandør kan skjule flere underleverandørnivåer med andre arbeids- og miljøvilkår.","Lav lagerbeholdning kan flytte bufferkostnaden til leverandører, transportører eller ansatte.","Sporbarhet på papir beviser ikke at varen eller arbeidsforholdene er kontrollert i praksis.","Verdikjeden slutter ikke ved salg; reparasjon, retur, gjenbruk og avfall er også økonomiske ledd."],
 question_surface_mode:"chain-actors-flow-inventory-risk-first",
 generator_use_note:"Start med en konkret vare eller tjeneste og kartlegg minst tre dokumenterte ledd fra innsats til kunde. Spør om ledetid, lager, flaskehals og risikofordeling før verdikjede- eller resiliensbegreper brukes.",
 overlap_resolution_note:"Bruk emnet for hele kjeden mellom leverandører og kunde. Bruk havn og transport for terminaloperasjonen, produksjon og produktivitet for prosessen i ett anlegg, og usynlig arbeid når skjulte støtteoppgaver står i sentrum.",
 anti_patterns:["Ikke kall en enkel transportstrekning en verdikjede.","Ikke tegn kjeden som lineær dersom retur, data, betaling og avfall er relevante.","Ikke tilskriv hovedvirksomheten all verdiskaping når leverandørarbeid og risiko er dokumentert."],
 curation_status:"individually_curated",curation_batch:"naeringsliv_logistikk_rom_v1",curation_date:"2026-07-25"
});
fs.writeFileSync(file,JSON.stringify(all,null,2)+"\n");
