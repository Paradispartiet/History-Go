#!/usr/bin/env node
import fs from "node:fs";
const file="data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json";
const all=JSON.parse(fs.readFileSync(file,"utf8"));
const item=all.find(x=>x.emne_id==="em_naering_makt_ulikhet_arbeidsliv");
if(!item)throw new Error("Mangler emnet");
Object.assign(item,{
 definition:"Emnet undersøker hvordan eierskap, kontroll over jobber og ressurser, knapp kompetanse, organisering, lovverk og forskjeller i alternativer skaper ulik forhandlingsmakt, lønn, trygghet, karriere og innflytelse i arbeidslivet.",
 why_it_matters:"Arbeidsmarkedet består ikke av like sterke parter. Evnen til å avslå vilkår, bytte jobb, organisere seg eller påvirke beslutninger varierer, og ulikheten kan forsterkes av kjønn, klasse, migrasjonsstatus, funksjonsevne, geografi og ansettelsesform.",
 keywords:["makt","ulikhet","forhandlingsmakt","lønnsspredning","jobbsikkerhet","arbeidsmarkedssegmentering","diskriminering","monopsoni","prekariat","sosial mobilitet"],
 key_concepts:["forhandlingsmakt","arbeidsmarkedssegmentering","monopsoni","lønnsspredning","jobbsikkerhet","diskriminering","prekært arbeid","sosial mobilitet"],
 core_concepts:["makt","forhandlingsmakt","ulikhet","lønnsspredning","jobbsikkerhet","arbeidsmarkedssegmentering"],
 sub_concepts:["monopsoni","midlertidighet","innleie","diskriminering","lønnsgap","karrierebarriere","prekariat","reservearbeidskraft"],
 key_questions:["Hvem kan ansette, si opp, fastsette lønn, fordele arbeid og kontrollere informasjon eller teknologi?","Hvilke realistiske alternativer har arbeidstakeren og arbeidsgiveren dersom de avviser vilkårene?","Hvordan varierer lønn, trygghet, arbeidstid, status og karrieremulighet mellom grupper og ansettelsesformer?","Hvilke avtaler, organisasjoner, lover eller offentlige ordninger reduserer eller forsterker maktforskjellen?"],
 conflicts:["styringsmakt vs arbeidstakerinnflytelse","fleksibilitet vs jobbsikkerhet","lønnsforskjell vs lik verdi","mobilitet vs geografisk og sosial binding","meritokrati vs strukturelle barrierer"],
 ideological_dimensions:["fri arbeidsavtale vs ulik forhandlingsmakt","markedsbelønning vs fordelingsrettferdighet","individuell innsats vs strukturell posisjon","arbeidsgiverfleksibilitet vs sosial trygghet"],
 analysis_axes:["arbeidsgiver vs arbeidstaker","insider vs outsider","fast vs midlertidig","høy vs lav mobilitet","formell likhet vs faktisk utfall","individuell ressurs vs kollektiv styrke"],
 quiz_angles:["identify_decision_power_and_available_alternatives","compare_pay_security_and_mobility_between_groups","trace_labor_market_segmentation_and_barrier","connect_rule_union_or_welfare_to_bargaining_power"],
 blindspots:["Lik stillingstittel betyr ikke nødvendigvis lik lønn, arbeidstid, trygghet eller faktisk ansvar.","Arbeidstakere kan bli bundet til en arbeidsgiver av bolig, oppholdstillatelse, omsorgsansvar, gjeld eller få lokale alternativer.","Statistiske forskjeller dokumenterer ulikhet, men ikke alene den konkrete mekanismen bak den.","Formelt like regler kan få ulike virkninger når grupper har ulik tilgang til informasjon, nettverk og klagemuligheter."],
 question_surface_mode:"decision-power-alternatives-distribution-first",
 generator_use_note:"Start med en dokumentert beslutningsrett, lønns- eller trygghetsforskjell og partenes faktiske alternativer. Vis mekanismen og gruppene før makt-, ulikhets- eller diskrimineringsbegreper brukes.",
 overlap_resolution_note:"Bruk emnet for den bredere fordelingen av forhandlingsmakt, lønn og trygghet. Bruk fagforeninger og interesser for organisasjonene og forhandlingsprosessen, og eierskap og styring for eiernes kontrollrettigheter.",
 anti_patterns:["Ikke forklar ulikhet bare med individuelle valg eller innsats.","Ikke påstå diskriminering fra et enkelt utfall uten relevant sammenligning og kildegrunnlag.","Ikke bruke makt som et løst synonym for at en aktør er stor, rik eller kjent."],
 curation_status:"individually_curated",curation_batch:"naeringsliv_makt_baerekraft_v1",curation_date:"2026-07-25"
});
fs.writeFileSync(file,JSON.stringify(all,null,2)+"\n");
