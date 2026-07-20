import { execFileSync } from 'node:child_process';
const run=(command,args)=>execFileSync(command,args,{stdio:'inherit'});
run('node',['tests/vaterland-historisk-elvelop-rounds-batch1.test.js']);
run('bash',['scripts/check-people.sh']);
run('bash',['scripts/check-places.sh']);
run('npm',['run','leksikon:ids:check']);
run('npm',['run','typecheck:tools']);
run('npm',['run','typecheck:web']);
run('git',['diff','--check']);
console.log('Vaterland clean validation completed on latest main.');
// explicit clean validation trigger
