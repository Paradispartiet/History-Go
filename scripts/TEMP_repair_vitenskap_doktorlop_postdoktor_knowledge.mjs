import fs from 'node:fs';
const p='data/Civication/workGrammars/vitenskap/vitenskap_doktorlop_og_postdoktor.json';
const g=JSON.parse(fs.readFileSync(p,'utf8'));
if(g.role_scope!=='vitenskap_doktorlop_og_postdoktor')throw new Error('role scope drift');
if(g.knowledge_dependencies?.length)throw new Error('knowledge_dependencies already present; refuse duplicate repair');
g.knowledge_dependencies=[{
  id:'history_go_vitenskap_doktorlop_postdoktor_kontekst',
  badge_id:'vitenskap',
  use:'History Go kan gi historisk og stedlig kontekst om hvordan forskningsspørsmål, metoder, publiseringsnormer, fagfellevurdering, forskningsetikk, personvern, dataforvaltning, forfatterskap og institusjonelle forskningspraksiser har endret seg. Slik kontekst kan skjerpe spørsmål om hvorfor en metode, kontroll eller norm finnes og hjelpe kandidaten å oppdage antakelser som bør undersøkes. Den kan aldri erstatte academic_qualification_and_employment, formelt opptak eller ansettelse, dagens etikk- eller personverngrunnlag, faktisk datatilgang, rådata, dokumentert metodeversjon, analyse, usikkerhet, forfatterskapsbidrag, veiledningsbeslutning eller institusjonell godkjenning.'
}];
fs.writeFileSync(p,JSON.stringify(g,null,2)+'\n');
