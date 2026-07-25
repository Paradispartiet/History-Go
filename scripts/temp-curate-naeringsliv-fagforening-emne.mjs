#!/usr/bin/env node
import fs from "node:fs";
const file="data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json";
const all=JSON.parse(fs.readFileSync(file,"utf8"));
const item=all.find(x=>x.emne_id==="em_naering_fagforeninger_og_interesser");
if(!item)throw new Error("Mangler emnet");
Object.assign(item,{
 definition:"Emnet undersøker hvordan arbeidstakere, arbeidsgivere og andre næringsinteresser organiserer seg kollektivt, velger representanter, forhandler avtaler, mobiliserer medlemmer og bruker streik, lockout, høringer og samarbeid for å påvirke lønn, vilkår og politikk.",
 why_it_matters:"En enkelt arbeidstaker eller virksomhet har begrenset forhandlingskraft alene. Organisasjoner gjør interesser varige og samordnede, men må samtidig representere ulike medlemsgrupper og forholde seg til avtaler, lovverk og motparter.",
 keywords:["fagforening","arbeidsgiverforening","tariffavtale","kollektiv forhandling","streik","lockout","tillitsvalgt","organisasjonsgrad","interesseorganisasjon","trepartssamarbeid"],
 key_concepts:["fagforening","arbeidsgiverorganisasjon","tariffavtale","kollektiv forhandling","streik","lockout","representasjon","trepartssamarbeid"],
 core_concepts:["fagforening","tariffavtale","kollektiv forhandling","streik","representasjon","arbeidsgiverorganisasjon"],
 sub_concepts:["tillitsvalgt","organisasjonsgrad","hovedavtale","uravstemning","mekling","sympatiaksjon","høring","frontfag"],
 key_questions:["Hvilke arbeidstakere, virksomheter eller bransjeinteresser organiseres, og hvem har rett til å representere dem?","Hva er det konkrete kravet eller konfliktpunktet, og gjennom hvilken avtale eller beslutning kan det løses?","Hvilke virkemidler bruker partene, og hvilke regler styrer forhandling, mekling, streik eller lockout?","Hvem omfattes eller faller utenfor resultatet, og hvordan håndteres ulike interesser innad i organisasjonen?"],
 conflicts:["arbeidsgiverstyring vs kollektiv medbestemmelse","medlemsmangfold vs samlet krav","streikerett vs drifts- og samfunnshensyn","lokal fleksibilitet vs sentral avtale","organiserte vs uorganiserte arbeidstakere"],
 ideological_dimensions:["individuell kontrakt vs kollektiv avtale","klasseinteresse vs partnerskap","fri organisering vs inngrep i arbeidskamp","partsautonomi vs statlig regulering"],
 analysis_axes:["medlem vs organisasjon","arbeidstakerpart vs arbeidsgiverpart","lokalt vs sentralt nivå","forhandling vs konflikt","formell representasjon vs faktisk deltakelse","organisert vs uorganisert"],
 quiz_angles:["identify_organized_group_representative_and_demand","trace_negotiation_agreement_and_conflict_steps","compare_union_employer_and_state_roles","test_who_is_covered_or_excluded"],
 blindspots:["Organisasjonens offisielle krav kan skjule uenighet mellom yrker, kjønn, ansettelsesformer og generasjoner.","Uorganiserte, innleide og selvstendige kan påvirkes av avtalen uten å ha samme representasjon.","Et formelt samarbeid utelukker ikke maktforskjeller eller arbeidskonflikt.","Høy organisasjonsgrad sier ikke alene hvor aktivt medlemmene deltar eller hvor mye gjennomslag organisasjonen har."],
 question_surface_mode:"organized-interest-demand-process-outcome-first",
 generator_use_note:"Start med en navngitt organisasjon, medlemsgruppe, motpart og dokumentert sak eller avtale. Følg krav, forhandling, virkemiddel og resultat før interesse- eller maktteori brukes.",
 overlap_resolution_note:"Bruk emnet når kollektiv organisering og representasjon er hovedsaken. Bruk arbeidsliv og organisering for oppgaver og kontraktsformer, og makt, ulikhet og arbeidsliv for den bredere fordelingen av ressurser og forhandlingsstyrke.",
 anti_patterns:["Ikke bruk fagforening som synonym for alle ansatte.","Ikke framstill streik eller lockout uten å dokumentere krav, motpart og prosess.","Ikke anta at én organisasjon representerer alle arbeidstakere eller virksomheter i bransjen."],
 curation_status:"individually_curated",curation_batch:"naeringsliv_makt_baerekraft_v1",curation_date:"2026-07-25"
});
fs.writeFileSync(file,JSON.stringify(all,null,2)+"\n");
