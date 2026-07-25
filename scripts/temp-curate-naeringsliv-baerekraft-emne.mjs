#!/usr/bin/env node
import fs from "node:fs";
const file="data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json";
const all=JSON.parse(fs.readFileSync(file,"utf8"));
const item=all.find(x=>x.emne_id==="em_naering_baerekraft_eksternaliteter");
if(!item)throw new Error("Mangler emnet");
Object.assign(item,{
 definition:"Emnet undersøker hvordan produksjon og forbruk bruker energi, materialer, areal og natur, og hvordan utslipp, avfall, helsevirkninger og andre kostnader kan falle på mennesker og miljø uten å inngå fullt i virksomhetens pris og regnskap.",
 why_it_matters:"En virksomhet kan være lønnsom samtidig som deler av kostnaden bæres av arbeidere, lokalsamfunn, offentlige budsjetter, natur eller framtidige generasjoner. Bærekraftsanalyse må derfor følge ressursene og virkningene gjennom hele livsløpet.",
 keywords:["bærekraft","eksternalitet","livsløp","utslipp","ressursbruk","avfall","sirkularitet","karbon","naturpåvirkning","produsentansvar"],
 key_concepts:["eksternalitet","livsløpsanalyse","ressursbruk","utslipp","sirkulær økonomi","produsentansvar","karbonfotavtrykk","naturpåvirkning"],
 core_concepts:["eksternalitet","livsløp","ressursbruk","utslipp","sirkularitet","produsentansvar"],
 sub_concepts:["karbonfotavtrykk","materialfotavtrykk","forurensning","avfallshierarki","reparasjon","ombruk","naturtap","grønnvasking"],
 key_questions:["Hvilke materialer, energikilder, arealer og naturressurser inngår i varen eller tjenesten?","Hvor i livsløpet oppstår utslipp, avfall, helsefare eller naturpåvirkning, og hvem rammes?","Hvilke kostnader betaler virksomheten selv, og hvilke flyttes til kunder, arbeidere, fellesskap eller framtid?","Hvilke tiltak reduserer samlet belastning i praksis, og flytter noen av dem bare problemet til et annet ledd?"],
 conflicts:["privat lønnsomhet vs samfunnskostnad","lav pris vs ressurs- og miljøbelastning","effektiv ressursbruk vs økt totalforbruk","resirkulering vs redusert materialbruk","grønn profil vs dokumentert virkning"],
 ideological_dimensions:["forurenser betaler vs kollektiv kostnadsdekning","grønn vekst vs redusert ressursbruk","frivillig ansvar vs bindende regulering","teknologisk løsning vs endret produksjon og forbruk"],
 analysis_axes:["privat kostnad vs ekstern kostnad","produksjon vs livsløp","lokal gevinst vs fjern belastning","effektivitet vs total mengde","lineær vs sirkulær flyt","påstand vs målt virkning"],
 quiz_angles:["trace_material_energy_and_emissions_lifecycle","identify_external_cost_and_bearer","compare_prevention_repair_reuse_and_recycling","test_sustainability_claim_against_documented_effect"],
 blindspots:["Lavere utslipp per enhet kan kombineres med høyere samlede utslipp dersom volumet vokser.","Resirkulering krever energi, transport og materialkvalitet og erstatter ikke alltid ny råvare.","Virksomhetens egne utslippstall kan utelate leverandører, bruk og avfall.","Et miljøtiltak kan redusere én belastning og øke en annen dersom hele livsløpet ikke undersøkes."],
 question_surface_mode:"resource-flow-external-cost-effect-first",
 generator_use_note:"Start med en konkret vare, tjeneste eller virksomhet og følg materialer, energi og dokumenterte virkninger gjennom livsløpet. Identifiser kostnadsbæreren før bærekrafts- eller eksternalitetsbegreper brukes.",
 overlap_resolution_note:"Bruk emnet når ressurs-, miljø- eller samfunnskostnaden står i sentrum. Bruk logistikk og verdikjeder for aktør- og vareflyten, risiko og regulering for kontrollsystemet, og doxa, vekst og effektivitet for kritikk av selve målene.",
 anti_patterns:["Ikke godta virksomhetens bærekraftspåstand som dokumentasjon på virkning.","Ikke bruke resirkulerbar som synonym for faktisk innsamlet og resirkulert.","Ikke begrens analysen til utslipp ved selve stedet når leverandør-, bruks- og avfallsleddet er vesentlig."],
 curation_status:"individually_curated",curation_batch:"naeringsliv_makt_baerekraft_v1",curation_date:"2026-07-25"
});
fs.writeFileSync(file,JSON.stringify(all,null,2)+"\n");
